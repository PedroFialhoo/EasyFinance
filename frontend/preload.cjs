const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("easyfinance", {
  showReminderNotification: payload => ipcRenderer.invoke("show-reminder-notification", payload),
  savePdfReport: payload => ipcRenderer.invoke("save-pdf-report", payload),
  onOpenReminder: callback => {
    const listener = (_event, reminder) => callback(reminder);
    ipcRenderer.on("open-reminder", listener);
    return () => ipcRenderer.removeListener("open-reminder", listener);
  },
});
