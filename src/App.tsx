import { useEffect, useState, useCallback } from 'react'
import Toolbar from '@/components/Toolbar'
import FileExplorer from '@/components/FileExplorer'
import Editor from '@/components/Editor'
import Preview from '@/components/Preview'
import AIPanel from '@/components/AIPanel'
import SettingsModal from '@/components/SettingsModal'
import { useFileStore, getAllFiles, getFileById } from '@/store/useFileStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { AIAdvice, BundlerError } from '@/types'

export default function App() {
  const { files, updateFileContent, setFiles } = useFileStore()
  const { layout, initialized, loadSettings } = useSettingsStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [errors, setErrors] = useState<BundlerError[]>([])
  const [advices, setAdvices] = useState<AIAdvice[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    loadSettings()
    const loadProject = async () => {
      try {
        const api = (window as unknown as { electronAPI?: { loadProject: () => Promise<typeof files> } }).electronAPI
        if (api) {
          const saved = await api.loadProject()
          if (saved && Array.isArray(saved) && saved.length > 0) {
            setFiles(saved)
          }
        }
      } catch {
        // ignore
      }
    }
    loadProject()
  }, [])

  useEffect(() => {
    const saveProject = async () => {
      try {
        const api = (window as unknown as { electronAPI?: { saveProject: (f: typeof files) => Promise<void> } }).electronAPI
        if (api) {
          await api.saveProject(files)
        }
      } catch {
        // ignore
      }
    }
    const timer = setTimeout(saveProject, 500)
    return () => clearTimeout(timer)
  }, [files])

  const handleRuntimeError = useCallback((error: { message: string; fileName: string; line?: number }) => {
    setErrors((prev) => {
      const exists = prev.some((e) => e.message === error.message)
      if (exists) return prev
      return [...prev, { type: 'runtime' as const, ...error }]
    })
  }, [])

  const handleRun = useCallback(() => {
    setErrors([])
    setAdvices([])
  }, [])

  const handleExport = useCallback(async () => {
    try {
      const api = (window as unknown as { electronAPI?: { exportZip: (f: typeof files) => Promise<string | null> } }).electronAPI
      if (api) {
        const path = await api.exportZip(files)
        if (path) {
          alert(`项目已导出到: ${path}`)
        }
      }
    } catch {
      alert('导出失败')
    }
  }, [files])

  const handleAnalyze = useCallback(async () => {
    if (errors.length === 0) return
    setAiLoading(true)
    try {
      const api = (window as unknown as { electronAPI?: { analyzeErrors: (errs: BundlerError[], ctx: string) => Promise<AIAdvice[]> } }).electronAPI
      if (api) {
        const allFiles = getAllFiles(files)
        const context = allFiles.map((f) => `// ${f.name}\n${f.content || ''}`).join('\n\n')
        const result = await api.analyzeErrors(errors, context)
        setAdvices(result)
      }
    } catch {
      // ignore
    } finally {
      setAiLoading(false)
    }
  }, [errors, files])

  const handleApplyFix = useCallback((fileName: string, suggestion: string) => {
    const allFiles = getAllFiles(files)
    const target = allFiles.find((f) => f.name === fileName)
    if (target) {
      updateFileContent(target.id, suggestion)
      setErrors((prev) => prev.filter((e) => e.fileName !== fileName))
      setAdvices((prev) => prev.filter((a) => a.fileName !== fileName))
    }
  }, [files, updateFileContent])

  const isHorizontal = layout === 'horizontal'

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0f19] overflow-hidden">
      <Toolbar onRun={handleRun} onExport={handleExport} onOpenSettings={() => setSettingsOpen(true)} />
      <div className="flex-1 flex overflow-hidden">
        <FileExplorer />
        <div className={`flex-1 flex ${isHorizontal ? 'flex-row' : 'flex-col'} overflow-hidden`}>
          <div className={`${isHorizontal ? 'w-1/2' : 'h-1/2'} flex flex-col border-${isHorizontal ? 'r' : 'b'} border-[#1e293b]`}>
            <Editor />
          </div>
          <div className={`${isHorizontal ? 'w-1/2' : 'h-1/2'} flex flex-col`}>
            <Preview onRuntimeError={handleRuntimeError} />
          </div>
        </div>
      </div>
      <AIPanel
        errors={errors}
        advices={advices}
        loading={aiLoading}
        onApplyFix={handleApplyFix}
        onAnalyze={handleAnalyze}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
