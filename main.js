const {ipcMain, BrowserWindow, app} = require('electron')
const cpus = require('os').cpus().length;
console.log('cpus: ' + cpus);
var index = 0; // next bg thread to use

// round robin bg threads
var bg = [];
var nextIndex = 0;
function nextBg() {
  nextIndex++;
  if (nextIndex >= cpus) nextIndex = 0;
  return bg[nextIndex];
}

// Create a hidden background window
function createBgWindow() {
  result = new BrowserWindow({"show": false});
  result.loadURL('file://' + __dirname + '/background.html');
  result.on('closed', () => {
    console.log('background window closed ' + process.pid);
  });
  return result
}

app.on('ready', function() {
  // Create the "renderer" window which contains the visible UI
  renderer = new BrowserWindow({"width": 500, "height": 300});
  renderer.loadURL('file://' + __dirname + '/renderer.html');
  renderer.show();
  renderer.on('closed', () => {
    // call quit to exit, otherwise the background windows will keep the app running
    app.quit();
  })

  for (var i = 0; i < cpus; i++) {
    bg.push(createBgWindow())
  }

  // Main thread can receive directly from windows
  ipcMain.on('to-main', (event, arg) => {
    console.log('to-main: ' + arg);
  });

  // Windows can't talk to each other, only through main, so pass messages between them
  ipcMain.on('for-renderer', (event, arg) => {
    console.log('passing to renderer: ' + arg);
    renderer.webContents.send('to-renderer', arg);
  });
  ipcMain.on('for-background', (event, arg) => {
    console.log('passing to background: ' + arg);
    nextBg().webContents.send('to-background', arg);
  });

  // heavy processing  should be done in the background thread
  // so UI and main threads remain responsive
  ipcMain.on('bg-processing', (event, arg) => {
    console.log('requesting background processing');
    nextBg().webContents.send('bg-processing', '');
  });

});