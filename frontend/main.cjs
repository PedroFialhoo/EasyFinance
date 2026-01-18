const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const net = require("net");

let backendProcess;

function startBackend(win) {
  // Caminho do JAR
  const isDev = !app.isPackaged;
  const jarPath = isDev
    ? path.join(__dirname, "backend", "easyfinance.jar")       // Dev
    : path.join(process.resourcesPath, "backend", "easyfinance.jar"); // Build (.exe)

  backendProcess = spawn("java", ["-jar", jarPath], { shell: true });

  // Logs no terminal
  backendProcess.stdout.on("data", d => process.stdout.write(`[BACKEND] ${d}`));
  backendProcess.stderr.on("data", d => process.stderr.write(`[BACKEND-ERR] ${d}`));
  backendProcess.on("exit", code => console.log(`[BACKEND EXIT] Code: ${code}`));

  // Espera a porta 8080 abrir antes de mostrar a janela
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
    show: false, // só mostra depois que backend estiver pronto
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
