const { app, BrowserWindow, Menu, Notification, dialog, ipcMain } = require("electron");
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

let backendProcess;

Menu.setApplicationMenu(null);

function startBackend(win) {
  const isDev = !app.isPackaged;

  const jarPath = isDev
    ? path.join(__dirname, "backend", "easyfinance.jar")
    : path.join(process.resourcesPath, "backend", "easyfinance.jar");

  const javaExecutable = process.platform === "win32" ? "java.exe" : "java";
  const javaPath = isDev
    ? javaExecutable
    : path.join(process.resourcesPath, "jre", "bin", javaExecutable);

  if (!fs.existsSync(jarPath)) {
    failBackend(win, "O backend nao foi encontrado. Gere o pacote novamente.");
    return;
  }

  let ready = false;
  let failed = false;
  let interval;
  const timeout = setTimeout(() => {
    failBackend(win, "O backend nao iniciou em 30 segundos.");
  }, 30000);

  const stopWaiting = () => {
    clearInterval(interval);
    clearTimeout(timeout);
  };

  const fail = message => {
    if (failed || ready) return;
    failed = true;
    stopWaiting();
    failBackend(win, message);
  };

  backendProcess = spawn(javaPath, ["-jar", jarPath], { shell: false });

  backendProcess.stdout.on("data", d =>
    process.stdout.write(`[BACKEND] ${d}`)
  );

  backendProcess.stderr.on("data", d =>
    process.stderr.write(`[BACKEND-ERR] ${d}`)
  );

  backendProcess.on("error", error => fail(`Nao foi possivel iniciar o backend: ${error.message}`));
  backendProcess.on("exit", code => {
    console.log(`[BACKEND EXIT] Code: ${code}`);
    if (!ready) fail(`O backend foi encerrado antes de iniciar (codigo ${code}).`);
  });

  interval = setInterval(() => {
    const request = http.get("http://127.0.0.1:8080/health", response => {
      response.resume();
      if (response.statusCode === 200) {
        ready = true;
        stopWaiting();
        console.log("[BACKEND] API pronta, mostrando janela...");
        if (win) win.show();
      }
    });
    request.on("error", () => {});
    request.setTimeout(1000, () => request.destroy());
  }, 500);
}

function failBackend(win, message) {
  if (backendProcess) backendProcess.kill();
  if (win) win.destroy();
  dialog.showErrorBox("EasyFinance", message);
  app.quit();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs")
    }
  });

  win.maximize();

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }

  return win;
}

app.whenReady().then(() => {
  ipcMain.handle("show-reminder-notification", (event, { title, body, reminder }) => {
    if (!Notification.isSupported()) return;
    const notification = new Notification({ title, body });
    notification.on("click", () => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win || win.isDestroyed()) return;
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
      win.webContents.send("open-reminder", reminder);
    });
    notification.show();
  });
  ipcMain.handle("save-pdf-report", async (event, { html, defaultName }) => {
    if (typeof html !== "string" || !html.trim()) {
      throw new Error("Relatório inválido.");
    }
    const owner = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(owner, {
      title: "Salvar relatório em PDF",
      defaultPath: defaultName || "relatorio-de-contas.pdf",
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });
    if (canceled || !filePath) return { canceled: true };

    const reportWindow = new BrowserWindow({
      show: false,
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    try {
      await reportWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      const pdf = await reportWindow.webContents.printToPDF({
        pageSize: "A4",
        printBackground: true,
        marginsType: 1,
      });
      await fs.promises.writeFile(filePath, pdf);
      return { canceled: false, filePath };
    } finally {
      if (!reportWindow.isDestroyed()) reportWindow.destroy();
    }
  });
  const win = createWindow();
  startBackend(win);
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
