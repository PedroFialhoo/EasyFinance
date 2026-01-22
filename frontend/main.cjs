const { app, BrowserWindow, Menu } = require("electron"); // 👈 Menu aqui
const { spawn } = require("child_process");
const path = require("path");
const net = require("net");

let backendProcess;

// ❌ Remove a barra de menu do app inteiro
Menu.setApplicationMenu(null);

function startBackend(win) {
  const isDev = !app.isPackaged;

  const jarPath = isDev
    ? path.join(__dirname, "backend", "easyfinance.jar")
    : path.join(process.resourcesPath, "backend", "easyfinance.jar");

  const javaPath = isDev
    ? "java"
    : path.join(process.resourcesPath, "jre", "bin", "java.exe");

  backendProcess = spawn(javaPath, ["-jar", jarPath], { shell: false });

  backendProcess.stdout.on("data", d =>
    process.stdout.write(`[BACKEND] ${d}`)
  );

  backendProcess.stderr.on("data", d =>
    process.stderr.write(`[BACKEND-ERR] ${d}`)
  );

  backendProcess.on("exit", code =>
    console.log(`[BACKEND EXIT] Code: ${code}`)
  );

  const port = 8080;
  const interval = setInterval(() => {
    const client = net.createConnection({ port }, () => {
      clearInterval(interval);
      console.log("[BACKEND] Porta 8080 aberta, mostrando janela...");
      if (win) win.show();
      client.end();
    });
    client.on("error", () => client.destroy());
  }, 500);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true, // 👈 garante que não aparece nem com ALT
    icon: path.join(__dirname, "assets", "icon.png"), // 👈 AQUI
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
  const win = createWindow();
  startBackend(win);
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
