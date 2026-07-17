import { useEffect, useRef, useCallback } from 'react'
import * as monaco from 'monaco-editor'
import { useFileStore, getFileById } from '@/store/useFileStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { X } from 'lucide-react'

export default function Editor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const { files, activeFileId, openFileIds, setActiveFile, closeFile, updateFileContent } = useFileStore()
  const { fontSize, tabSize } = useSettingsStore()

  useEffect(() => {
    if (!containerRef.current) return

    const editor = monaco.editor.create(containerRef.current, {
      value: '',
      language: 'html',
      theme: 'vs-dark',
      fontSize: fontSize,
      tabSize: tabSize,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      roundedSelection: false,
      padding: { top: 16 },
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      folding: true,
      bracketPairColorization: { enabled: true }
    })

    editorRef.current = editor

    const disposable = editor.onDidChangeModelContent(() => {
      const model = editor.getModel()
      if (model && activeFileId) {
        updateFileContent(activeFileId, model.getValue())
      }
    })

    return () => {
      disposable.dispose()
      editor.dispose()
      editorRef.current = null
    }
  }, [])

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize, tabSize })
    }
  }, [fontSize, tabSize])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !activeFileId) return

    const file = getFileById(files, activeFileId)
    if (!file || file.type !== 'file') return

    const lang = file.language || 'plaintext'
    const model = monaco.editor.createModel(file.content || '', lang)
    editor.setModel(model)

    return () => {
      model.dispose()
    }
  }, [activeFileId, files])

  const activeFile = activeFileId ? getFileById(files, activeFileId) : null

  return (
    <div className="flex flex-col h-full bg-[#0b0f19]">
      <div className="flex items-center bg-[#111827] border-b border-[#1e293b] overflow-x-auto">
        {openFileIds.map((id) => {
          const file = getFileById(files, id)
          if (!file) return null
          const isActive = id === activeFileId
          return (
            <div
              key={id}
              onClick={() => setActiveFile(id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer select-none border-r border-[#1e293b] min-w-[100px] max-w-[180px] ${
                isActive ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#111827] text-slate-400 hover:bg-[#1e293b]'
              }`}
            >
              <span className="truncate flex-1">{file.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); closeFile(id) }}
                className="p-0.5 rounded hover:bg-[#334155] opacity-60 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
      <div className="flex-1 relative">
        {activeFile ? (
          <div ref={containerRef} className="absolute inset-0" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
            请选择或创建一个文件开始编辑
          </div>
        )}
      </div>
    </div>
  )
}
