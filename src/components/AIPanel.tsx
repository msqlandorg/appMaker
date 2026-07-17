import { useState } from 'react'
import { Bot, ChevronDown, ChevronUp, Wand2, AlertCircle, Loader2 } from 'lucide-react'
import { AIAdvice, BundlerError } from '@/types'
import { useFileStore, getAllFiles } from '@/store/useFileStore'

interface AIPanelProps {
  errors: BundlerError[]
  advices: AIAdvice[]
  loading: boolean
  onApplyFix: (fileName: string, suggestion: string) => void
  onAnalyze: () => void
}

export default function AIPanel({ errors, advices, loading, onApplyFix, onAnalyze }: AIPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleAdvice = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const hasErrors = errors.length > 0

  return (
    <div className={`bg-[#0f172a] border-t border-[#1e293b] transition-all duration-300 ${expanded ? 'h-56' : 'h-10'}`}>
      <div
        className="h-10 flex items-center justify-between px-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#a855f7]" />
          <span className="text-sm font-medium text-slate-200">AI 诊断助手</span>
          {hasErrors && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
              {errors.length}
            </span>
          )}
          {loading && <Loader2 className="w-3.5 h-3.5 text-[#38bdf8] animate-spin" />}
        </div>
        <div className="flex items-center gap-2">
          {hasErrors && expanded && (
            <button
              onClick={(e) => { e.stopPropagation(); onAnalyze() }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e293b] text-xs text-[#38bdf8] hover:bg-[#334155] transition"
            >
              <Wand2 className="w-3 h-3" />
              诊断
            </button>
          )}
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="h-[calc(100%-2.5rem)] overflow-y-auto px-4 pb-4">
          {!hasErrors && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>暂无错误，AI 助手就绪</span>
            </div>
          )}

          {loading && advices.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#38bdf8]" />
              <span>AI 正在分析错误...</span>
            </div>
          )}

          <div className="space-y-3 mt-2">
            {advices.map((advice) => (
              <div key={advice.id} className="rounded-lg bg-[#111827] border border-[#1e293b] overflow-hidden">
                <button
                  onClick={() => toggleAdvice(advice.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#1e293b] transition"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-xs text-slate-300 truncate flex-1">{advice.errorMessage}</span>
                  <span className="text-[10px] text-slate-500">{advice.fileName}</span>
                  {expandedIds.has(advice.id) ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronUp className="w-3 h-3 text-slate-500" />}
                </button>

                {expandedIds.has(advice.id) && (
                  <div className="px-3 pb-3 space-y-2">
                    <div className="text-xs text-slate-400 leading-relaxed">
                      <span className="text-[#a855f7] font-medium">解释：</span>
                      {advice.explanation}
                    </div>
                    {advice.suggestion && (
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400">
                          <span className="text-[#34d399] font-medium">修复建议：</span>
                        </div>
                        <div className="relative group">
                          <pre className="bg-[#0b0f19] rounded p-2 text-[11px] font-mono text-slate-300 overflow-x-auto border border-[#1e293b]">
                            <code>{advice.suggestion}</code>
                          </pre>
                          <button
                            onClick={() => onApplyFix(advice.fileName, advice.suggestion)}
                            className="absolute top-2 right-2 px-2 py-1 rounded bg-[#38bdf8] text-[#0f172a] text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition hover:brightness-110"
                          >
                            应用修复
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
