import { contextBridge, ipcRenderer } from 'electron'

const api = {
  loadProject: () => ipcRenderer.invoke('fs:loadProject'),
  saveProject: (files: unknown) => ipcRenderer.invoke('fs:saveProject', files),
  loadSettings: () => ipcRenderer.invoke('fs:loadSettings'),
  saveSettings: (settings: unknown) => ipcRenderer.invoke('fs:saveSettings', settings),
  exportZip: (files: unknown) => ipcRenderer.invoke('fs:exportZip', files),
  analyzeErrors: (errors: unknown[], codeContext: string) =>
    ipcRenderer.invoke('ai:analyze', errors, codeContext)
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
