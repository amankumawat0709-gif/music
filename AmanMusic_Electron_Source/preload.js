// Preload - safe bridge for future native features
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  // future: file system access, settings, etc.
});
