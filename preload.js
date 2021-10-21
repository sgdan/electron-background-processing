// see https://www.electronjs.org/docs/latest/tutorial/context-isolation
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  toMain: (data) => ipcRenderer.send("to-main", data),
  forBackground: (data) => ipcRenderer.send("for-background", data),
  assignTask: (data) => ipcRenderer.send("assign-task", data),

  ready: () => ipcRenderer.send("ready"),
  forRenderer: (data) => {
    ipcRenderer.send("for-renderer", "[bg-" + process.pid + "] reply: " + data);
  },
  log: (data) => {
    ipcRenderer.send("to-main", "[bg-" + process.pid + "]: " + data);
  },

  toRenderer: (func) =>
    ipcRenderer.on("to-renderer", (event, ...args) => func(...args)),
  status: (func) => ipcRenderer.on("status", (event, ...args) => func(...args)),
  message: (func) =>
    ipcRenderer.on("message", (event, ...args) => func(...args)),
  task: (func) => ipcRenderer.on("task", (event, ...args) => func(...args)),
});
