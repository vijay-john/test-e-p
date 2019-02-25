const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, protocol, Notification, ipcMain} = electron;
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

autoUpdater.logger = log;

log.info('App starting...');
log.info(autoUpdater.logger.transports.file.level);
autoUpdater.logger.transports.file.level = 'info';


// SET ENV
//process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  sendStatusToWindow('Update downloaded');
});



// Listen for app to be ready
app.on('ready', function(){
  // Create new window
  mainWindow = new BrowserWindow({});
  // Load html into window
  // Load index.html
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  mainWindow.openDevTools();

  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });

// Build menu from the template
const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
// Insert menu
Menu.setApplicationMenu(mainMenu);
});

// Load html into window

// Add New window
function createAddWindow(){
  // Create new window
  addWindow = new BrowserWindow({
    width:300,
    height:200,
    title:'Add Shopping List Item'
  });

  // Load index.html
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Garbage collecton handle
  addWindow.on('close', function(){
    addWindow = null;
  });
}

// Catch Item:add
ipcMain.on('item:add', function(e, item) {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
  {
    label:'File',
    submenu:[
      {
        label:'Add Item',
        click(){
          createAddWindow();
        }
      },
      {
        label:'Clear Item',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label:'Quit',
        accelerator: process.platform == 'darwin'? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If mac, add empty object to fix menu issue
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add Developer tools if not in prod
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label:'Developer Tools',
    submenu:[
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin'? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role:'reload'
      }
    ]
  });
}

app.on('ready', function()  {
  //autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.checkForUpdates();
  //console.log("check for update");

});