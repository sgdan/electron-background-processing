const { ipcMain, BrowserWindow, app } = require('electron')
app.allowRendererProcessReuse = true
const cpus = require('os').cpus().length;
console.log('cpus: ' + cpus);

// stack of available background threads
var available = []

// queue of tasks to be done
var tasks = []

// hand the tasks out to waiting threads
function doIt() {
  while (available.length > 0 && tasks.length > 0) {
    var task = tasks.shift()
    available.shift().send(task[0], task[1])
  }
  renderer.webContents.send('status', available.length, tasks.length)
}

// Create a hidden background window
function createBgWindow() {
  result = new BrowserWindow({
    "show": false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  result.loadURL('file://' + __dirname + '/background.html')
  result.on('closed', () => {
    console.log('background window closed')
  });
  return result
}

app.whenReady().then(function () {
  // Create the "renderer" window which contains the visible UI
  renderer = new BrowserWindow({
    "width": 500,
    "height": 400,
    webPreferences: {
      nodeIntegration: true
    }
  })
  renderer.loadURL('file://' + __dirname + '/renderer.html')
  renderer.show()
  renderer.on('closed', () => {
    // call quit to exit, otherwise the background windows will keep the app running
    app.quit()
  })

  // create background thread for each cpu
  for (var i = 0; i < cpus; i++) createBgWindow()

  // Main thread can receive directly from windows
  ipcMain.on('to-main', (event, arg) => {
    console.log(arg)
  });

  // Windows can talk to each other via main
  ipcMain.on('for-renderer', (event, arg) => {
    renderer.webContents.send('to-renderer', arg);
  });
  ipcMain.on('for-background', (event, arg) => {
    tasks.push(['message', arg])
    doIt()
  });

  // heavy processing done in the background thread
  // so UI and main threads remain responsive
  ipcMain.on('assign-task', (event, arg) => {
    tasks.push(['task', arg])
    doIt()
  });

  ipcMain.on('ready', (event, arg) => {
    available.push(event.sender)
    doIt()
  })
})