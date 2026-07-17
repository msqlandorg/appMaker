import { X } from 'lucide-react'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useEffect, useState } from 'react'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const settings = useSettingsStore()
  const [local, setLocal] = useState({ ...settings })

  useEffect(() => {
    if (open) {
      setLocal({ ...settings })
    }
  }, [open])

  const handleSave = async () => {
    settings.setSettings({
      theme: local.theme,
      fontSize: local.fontSize,
      tabSize: local.tabSize,
      livePreview: local.livePreview,
      layout: local.layout,
      aiProvider: local.aiProvider,
      aiBaseURL: local.aiBaseURL,
      aiModel: local.aiModel,
      aiApiKey: local.aiApiKey
    })
    await settings.saveSettings()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[480px] max-h-[80vh] bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <h2 className="text-base font-semibold text-slate-100 font-display">偏好设置</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#1e293b] text-slate-400 hover:text-slate-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">编辑器</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">字体大小</label>
                <input
                  type="number"
                  value={local.fontSize}
                  onChange={(e) => setLocal({ ...local, fontSize: Number(e.target.value) })}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#38bdf8]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">缩进宽度</label>
                <input
                  type="number"
                  value={local.tabSize}
                  onChange={(e) => setLocal({ ...local, tabSize: Number(e.target.value) })}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">实时预览</span>
              <button
                onClick={() => setLocal({ ...local, livePreview: !local.livePreview })}
                className={`w-10 h-5 rounded-full transition relative ${local.livePreview ? 'bg-[#34d399]' : 'bg-[#334155]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${local.livePreview ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">默认布局</span>
              <select
                value={local.layout}
                onChange={(e) => setLocal({ ...local, layout: e.target.value as 'horizontal' | 'vertical' })}
                className="bg-[#0b0f19] border border-[#1e293b] rounded-md px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-[#38bdf8]"
              >
                <option value="horizontal">左右分屏</option>
                <option value="vertical">上下分屏</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI 模型配置</h3>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">AI 提供商</label>
              <select
                value={local.aiProvider}
                onChange={(e) => setLocal({ ...local, aiProvider: e.target.value as 'ollama' | 'openai' | '' })}
                className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#38bdf8]"
              >
                <option value="">未配置</option>
                <option value="ollama">本地 Ollama（推荐）</option>
                <option value="openai">OpenAI 兼容 API</option>
              </select>
              <p className="text-[11px] text-slate-500">推荐使用 Ollama 本地运行 Qwen 模型，无需联网，完全免费</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">服务地址</label>
              <input
                type="text"
                value={local.aiBaseURL}
                onChange={(e) => setLocal({ ...local, aiBaseURL: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">模型名称</label>
              <input
                type="text"
                value={local.aiModel}
                onChange={(e) => setLocal({ ...local, aiModel: e.target.value })}
                placeholder="qwen:7b"
                className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#38bdf8]"
              />
            </div>
            {local.aiProvider === 'openai' && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">API Key</label>
                <input
                  type="password"
                  value={local.aiApiKey}
                  onChange={(e) => setLocal({ ...local, aiApiKey: e.target.value })}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#38bdf8]"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#1e293b]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm text-slate-300 hover:bg-[#1e293b] transition"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-sm bg-[#38bdf8] text-[#0f172a] font-semibold hover:brightness-110 transition"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
