const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,  // Não mostra imediatamente
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs")
    }
  });

  // Maximiza a janela assim que estiver pronta
  win.maximize();

  // Depois de maximizar, mostra a janela
  win.once('ready-to-show', () => {
    win.show();
  });

  // DEV
  win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);
