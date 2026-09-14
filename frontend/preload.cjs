const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("easyfinance", {
  showReminderNotification: payload => ipcRenderer.invoke("show-reminder-notification", payload),
});
