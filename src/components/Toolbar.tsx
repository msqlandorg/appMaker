import { Play, RotateCcw, LayoutTemplate, Download, Settings, FileCode } from 'lucide-react'
import { useSettingsStore } from '@/store/useSettingsStore'

interface ToolbarProps {
  onRun: () => void
  onExport: () => void
  onOpenSettings: () => void
}

export default function Toolbar({ onRun, onExport, onOpenSettings }: ToolbarProps) {
  const { layout, setSettings } = useSettingsStore()

  return (
    <div className="h-12 bg-[#111827] border-b border-[#1e293b] flex items-center px-4 justify-between select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#38bdf8] to-[#34d399] flex items-center justify-center">
            <FileCode className="w-4 h-4 text-[#0f172a]" />
          </div>
          <span className="font-display font-semibold text-sm text-slate-100">App Editor</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#34d399] text-[#0f172a] text-xs font-semibold hover:brightness-110 transition"
        >
          <Play className="w-3.5 h-3.5" />
          运行
        </button>
        <button
          onClick={onRun}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1e293b] text-slate-300 text-xs font-medium hover:bg-[#334155] transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          刷新
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setSettings({ layout: layout === 'horizontal' ? 'vertical' : 'horizontal' })}
          className="p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-[#1e293b] transition"
          title="切换布局"
        >
          <LayoutTemplate className="w-4 h-4" />
        </button>
        <button
          onClick={onExport}
          className="p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-[#1e293b] transition"
          title="导出 ZIP"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-[#1e293b] transition"
          title="设置"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
