# electron-background-processing
Demo of background processing using Electron
- Pool of background threads to match processors using hidden BrowserWindow instances
- Using IPC to communicate between main, renderer and background threads, see [electron ipcMain](https://github.com/electron/electron/blob/master/docs/api/ipc-main.md)
- Asynchronous message passing (synchronous is possible too but not used here)

# Install

- Install NodeJS from https://nodejs.org/en/
```
# Clone the repo
git clone https://github.com/sgdan/electron-background-processing.git
cd electron-background-processing

# Install latest precompiled binary of Electron
npm install electron --save-dev --verbose

# Run Electron (main.js is specified in package.json)
electron .
```

# Instructions

- After starting up on the command line you should see the number of cpus:
```
$ electron .

cpus: 4
```
- Use the "Send to main thread" button and you should see a message from the UI printed on the command line.
- The "Send to bg thread" button triggers a message from the UI to the main thread which passese it to one of the background threads. That background thread should respond back to the main thread which passes it to the UI. You should see the response next to the button.
- You can also "Do background work". If you click it multiple times you should see your computer CPU rise to 100% usage. However, the UI should remain responsive. Further actions will be queued until they can be handled.