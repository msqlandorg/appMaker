import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import path from 'path'
import JSZip from 'jszip'

const userDataPath = app.getPath('userData')
const projectPath = path.join(userDataPath, 'project.json')
const settingsPath = path.join(userDataPath, 'settings.json')
const modelsDir = path.join(userDataPath, 'models')

function ensureModelsDir() {
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true })
  }
}

function readJson<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data) as T
    }
  } catch {
    // ignore
  }
  return defaultValue
}

function writeJson(filePath: string, data: unknown) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch {
    // ignore
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  ensureModelsDir()
  electronApp.setAppUserModelId('com.appeditor.desktop')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('fs:loadProject', () => {
    return readJson(projectPath, null)
  })

  ipcMain.handle('fs:saveProject', (_, files) => {
    writeJson(projectPath, files)
  })

  ipcMain.handle('fs:loadSettings', () => {
    return readJson(settingsPath, {})
  })

  ipcMain.handle('fs:saveSettings', (_, settings) => {
    writeJson(settingsPath, settings)
  })

  ipcMain.handle('fs:exportZip', async (_, files) => {
    const zip = new JSZip()
    function addFiles(nodes: typeof files) {
      for (const node of nodes) {
        if (node.type === 'file' && node.content !== undefined) {
          zip.file(node.name, node.content)
        }
        if (node.children) {
          addFiles(node.children)
        }
      }
    }
    addFiles(files)
    const blob = await zip.generateAsync({ type: 'nodebuffer' })
    const result = await dialog.showSaveDialog({
      defaultPath: 'project.zip',
      filters: [{ name: 'ZIP', extensions: ['zip'] }]
    })
    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, blob)
      return result.filePath
    }
    return null
  })

  ipcMain.handle('ai:analyze', async (_, errors: unknown[], codeContext: string) => {
    const settings = readJson<{
      aiProvider?: string
      aiBaseURL?: string
      aiModel?: string
      aiApiKey?: string
    }>(settingsPath, {})

    if (!settings.aiProvider) {
      return errors.map((err: unknown, idx: number) => {
        const e = err as { message: string; fileName: string; line?: number }
        return {
          id: String(idx),
          errorMessage: e.message,
          explanation: '请在设置中配置 AI 服务（推荐使用本地 ollama）',
          suggestion: '',
          fileName: e.fileName,
          line: e.line
        }
      })
    }

    try {
      const baseURL = settings.aiBaseURL || 'http://localhost:11434'
      const model = settings.aiModel || 'qwen:7b'
      const messages = [
        {
          role: 'system',
          content:
            '你是一个专业的前端开发助手。请分析以下代码错误，用中文给出简明的原因解释和修复建议。输出必须是纯 JSON 数组格式，每个元素包含 explanation（中文解释）和 suggestion（可直接使用的修复代码）。不要包含 markdown 代码块标记。'
        },
        {
          role: 'user',
          content: `代码上下文:\n${codeContext}\n\n错误列表:\n${JSON.stringify(errors, null, 2)}`
        }
      ]

      let response: Response
      if (settings.aiProvider === 'ollama') {
        response = await fetch(`${baseURL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, stream: false })
        })
      } else {
        response = await fetch(`${baseURL}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.aiApiKey || ''}`
          },
          body: JSON.stringify({ model, messages, stream: false })
        })
      }

      if (!response.ok) {
        throw new Error(`AI 服务响应错误: ${response.status}`)
      }

      const data = await response.json()
      const content =
        settings.aiProvider === 'ollama'
          ? data.message?.content || ''
          : data.choices?.[0]?.message?.content || ''

      let advices: Array<{
        explanation: string
        suggestion: string
      }> = []
      try {
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim()
        advices = JSON.parse(cleaned)
        if (!Array.isArray(advices)) advices = [advices]
      } catch {
        // 解析失败时回退
        advices = errors.map(() => ({
          explanation: content.slice(0, 200) || 'AI 返回格式异常',
          suggestion: ''
        }))
      }

      return (errors as Array<{ message: string; fileName: string; line?: number }>).map(
        (err, idx) => ({
          id: String(idx),
          errorMessage: err.message,
          explanation: advices[idx]?.explanation || '未能获取解释',
          suggestion: advices[idx]?.suggestion || '',
          fileName: err.fileName,
          line: err.line
        })
      )
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return (errors as Array<{ message: string; fileName: string; line?: number }>).map(
        (err, idx) => ({
          id: String(idx),
          errorMessage: err.message,
          explanation: `AI 诊断失败: ${msg}。请检查本地 ollama 是否已启动，或模型是否已下载。`,
          suggestion: '',
          fileName: err.fileName,
          line: err.line
        })
      )
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
