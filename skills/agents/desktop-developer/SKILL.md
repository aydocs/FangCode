---
name: desktop-developer
description: Cross-platform desktop application development with Electron, Tauri, and Qt.
---

# Desktop Developer Agent Skill

## Overview

You are a senior desktop developer specializing in building cross-platform desktop applications. You understand native platform APIs, system integration, and desktop-specific UX patterns. Your applications are performant, secure, and follow platform guidelines.

---

## Core Competencies

### Cross-Platform Frameworks
- Electron (Chromium + Node.js)
- Tauri (Rust + System Webview)
- Qt (C++/Python)

### Native APIs
- File system access
- System tray and notifications
- Auto-updater
- Native menus
- Window management
- Inter-process communication (IPC)

### Desktop UX
- Native look and feel
- Keyboard shortcuts
- Drag and drop
- File associations
- Deep linking

---

## Electron Development

### Main Process

```javascript
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
  });
  return result.filePaths[0];
});

ipcMain.handle('save-file', async (event, data) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (!result.canceled) {
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
    return true;
  }
  return false;
});
```

### Preload Script

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  onMenuClick: (callback) => ipcRenderer.on('menu-click', callback),
  platform: process.platform,
});
```

### Renderer Process

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Desktop App</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    async function openFile() {
      const filePath = await window.electronAPI.openFile();
      if (filePath) {
        console.log('Opened:', filePath);
      }
    }
  </script>
</body>
</html>
```

---

## Tauri Development

### Rust Backend

```rust
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            read_file,
            write_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Frontend Integration

```typescript
import { invoke } from '@tauri-apps/api/tauri';

async function greet() {
  const response = await invoke<string>('greet', { name: 'World' });
  console.log(response);
}

async function readFile() {
  const content = await invoke<string>('read_file', { path: '/path/to/file' });
  return content;
}
```

---

## System Integration

### Auto-Updater

```javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
});

autoUpdater.on('download-progress', (progress) => {
  console.log(`Download: ${progress.percent}%`);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded, restarting...');
  autoUpdater.quitAndInstall();
});

// Check for updates
autoUpdater.checkForUpdatesAndNotify();
```

### System Tray

```javascript
const { Tray, Menu, nativeImage } = require('electron');

let tray = null;

function createTray() {
  const icon = nativeImage.createFromPath('icon.png');
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() },
  ]);
  
  tray.setToolTip('My App');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow.show();
  });
}
```

### Native Notifications

```javascript
const { Notification } = require('electron');

function showNotification(title, body) {
  new Notification({
    title,
    body,
    silent: false,
  }).show();
}
```

---

## Security

### Best Practices

```javascript
// Disable nodeIntegration
new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    preload: path.join(__dirname, 'preload.js'),
  },
});

// Content Security Policy
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'; script-src 'self'"],
    },
  });
});

// Validate IPC messages
ipcMain.handle('read-file', async (event, filePath) => {
  // Validate path
  const allowedPath = path.join(app.getPath('userData'), 'data');
  if (!filePath.startsWith(allowedPath)) {
    throw new Error('Access denied');
  }
  return fs.readFileSync(filePath, 'utf-8');
});
```

---

## Auto-Update

### Electron Builder Config

```json
{
  "build": {
    "appId": "com.example.myapp",
    "productName": "My App",
    "mac": {
      "category": "public.app-category.developer-tools",
      "hardenedRuntime": true
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": ["AppImage", "deb"]
    },
    "publish": {
      "provider": "github",
      "owner": "username",
      "repo": "myapp"
    }
  }
}
```

---

## Performance

### Window Management

```javascript
// Lazy load windows
const windows = new Map();

function getWindow(name) {
  if (windows.has(name)) {
    return windows.get(name);
  }
  
  const win = new BrowserWindow({
    show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  
  win.once('ready-to-show', () => win.show());
  windows.set(name, win);
  return win;
}

// Use BrowserView for embedded content
const { BrowserView } = require('electron');

const view = new BrowserView();
mainWindow.setBrowserView(view);
view.setBounds({ x: 0, y: 50, width: 800, height: 600 });
view.webContents.loadURL('https://example.com');
```

---

## Testing

### Spectron (Electron)

```javascript
const { Application } = require('spectron');
const assert = require('assert');

describe('App', function () {
  let app;

  beforeEach(function () {
    app = new Application({
      path: './release/my-app',
    });
    return app.start();
  });

  afterEach(function () {
    return app.stop();
  });

  it('shows window', async function () {
    const visible = await app.browserWindow.isVisible();
    assert.strictEqual(visible, true);
  });
});
```

---

## Quality Checklist

- [ ] Cross-platform tested (Windows, macOS, Linux)
- [ ] Auto-updater configured
- [ ] System tray integration
- [ ] Native notifications
- [ ] File associations set up
- [ ] Keyboard shortcuts implemented
- [ ] Security best practices followed
- [ ] App size optimized
- [ ] Memory usage monitored
- [ ] Crash reporting configured
- [ ] Code signing completed
- [ ] Store listings prepared
