import { useState } from 'react'
import { Folder, FileText, ChevronRight, ChevronDown, Plus, Trash2, Edit3 } from 'lucide-react'
import { useFileStore, getFileById } from '@/store/useFileStore'
import { FileNode } from '@/types'

function FileTreeNode({
  node,
  depth = 0
}: {
  node: FileNode
  depth?: number
}) {
  const { activeFileId, setActiveFile, deleteFile, renameFile, createFile } = useFileStore()
  const [expanded, setExpanded] = useState(true)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)

  const isActive = node.id === activeFileId
  const isFolder = node.type === 'folder'

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      renameFile(node.id, renameValue.trim())
    }
    setRenaming(false)
  }

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer transition select-none ${
          isActive && !isFolder ? 'bg-[#1e293b] border-l-[3px] border-[#38bdf8] text-slate-100' : 'text-slate-400 hover:bg-[#1e293b] hover:text-slate-200 border-l-[3px] border-transparent'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => {
          if (isFolder) {
            setExpanded(!expanded)
          } else {
            setActiveFile(node.id)
          }
        }}
        onDoubleClick={() => {
          if (!isFolder) setRenaming(true)
        }}
      >
        {isFolder && (
          <span className="text-slate-500" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}>
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        )}
        {!isFolder && <span className="w-3.5" />}

        {isFolder ? (
          <Folder className="w-4 h-4 text-[#38bdf8]" />
        ) : (
          <FileText className="w-4 h-4 text-slate-500" />
        )}

        {renaming ? (
          <input
            className="bg-transparent border border-[#38bdf8] rounded px-1 py-0.5 text-xs outline-none w-24 text-slate-100"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') { setRenaming(false); setRenameValue(node.name) }
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1">{node.name}</span>
        )}

        {!isFolder && !renaming && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); setRenaming(true) }}
              className="p-1 rounded hover:bg-[#334155] text-slate-400 hover:text-slate-200"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteFile(node.id) }}
              className="p-1 rounded hover:bg-[#334155] text-slate-400 hover:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {isFolder && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
          <button
            onClick={() => {
              const name = prompt('新建文件名（如 page.html）')
              if (name) createFile(node.id, name)
            }}
            className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-500 hover:text-[#38bdf8] transition"
            style={{ paddingLeft: `${12 + (depth + 1) * 16}px` }}
          >
            <Plus className="w-3 h-3" />
            新建文件
          </button>
        </div>
      )}
    </div>
  )
}

export default function FileExplorer() {
  const { files } = useFileStore()

  return (
    <div className="w-60 bg-[#0f172a] border-r border-[#1e293b] flex flex-col h-full">
      <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
        文件资源
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map((node) => (
          <FileTreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  )
}
