import { create } from 'zustand'
import { AppSettings } from '@/types'

interface SettingsState extends AppSettings {
  initialized: boolean
  setSettings: (settings: Partial<AppSettings>) => void
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  fontSize: 14,
  tabSize: 2,
  livePreview: true,
  layout: 'horizontal',
  aiProvider: '',
  aiBaseURL: 'http://localhost:11434',
  aiModel: 'qwen:7b',
  aiApiKey: ''
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  initialized: false,

  setSettings: (settings) => set((state) => ({ ...state, ...settings })),

  loadSettings: async () => {
    try {
      const api = (window as unknown as { electronAPI?: { loadSettings: () => Promise<Partial<AppSettings>> } }).electronAPI
      if (api) {
        const saved = await api.loadSettings()
        set({ ...defaultSettings, ...saved, initialized: true })
        return
      }
    } catch {
      // ignore
    }
    set({ ...defaultSettings, initialized: true })
  },

  saveSettings: async () => {
    try {
      const api = (window as unknown as { electronAPI?: { saveSettings: (s: AppSettings) => Promise<void> } }).electronAPI
      if (api) {
        const { theme, fontSize, tabSize, livePreview, layout, aiProvider, aiBaseURL, aiModel, aiApiKey } = get()
        await api.saveSettings({ theme, fontSize, tabSize, livePreview, layout, aiProvider, aiBaseURL, aiModel, aiApiKey })
      }
    } catch {
      // ignore
    }
  }
}))
