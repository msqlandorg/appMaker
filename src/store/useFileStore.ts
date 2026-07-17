import { create } from 'zustand'
import { FileNode } from '@/types'

interface FileState {
  files: FileNode[]
  activeFileId: string | null
  openFileIds: string[]
  setFiles: (files: FileNode[]) => void
  createFile: (parentId: string | null, name: string) => void
  renameFile: (id: string, newName: string) => void
  deleteFile: (id: string) => void
  updateFileContent: (id: string, content: string) => void
  setActiveFile: (id: string) => void
  closeFile: (id: string) => void
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function getLanguage(name: string): 'html' | 'css' | 'javascript' | undefined {
  if (name.endsWith('.html')) return 'html'
  if (name.endsWith('.css')) return 'css'
  if (name.endsWith('.js')) return 'javascript'
  return undefined
}

const defaultFiles: FileNode[] = [
  {
    id: 'root',
    name: 'project',
    type: 'folder',
    parentId: null,
    children: [
      {
        id: 'html-1',
        name: 'index.html',
        type: 'file',
        language: 'html',
        parentId: 'root',
        content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的应用</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>欢迎使用 App Editor</p>
    <button id="btn">点击我</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        id: 'css-1',
        name: 'style.css',
        type: 'file',
        language: 'css',
        parentId: 'root',
        content: `body {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  padding: 2rem;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 2.5rem;
  background: linear-gradient(90deg, #38bdf8, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  margin: 0 0 1.5rem;
  color: #94a3b8;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, #38bdf8, #34d399);
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(56, 189, 248, 0.4);
}`
      },
      {
        id: 'js-1',
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        parentId: 'root',
        content: `document.getElementById('btn').addEventListener('click', () => {
  alert('Hello from App Editor!')
})`
      }
    ]
  }
]

function findFileById(files: FileNode[], id: string): FileNode | undefined {
  for (const f of files) {
    if (f.id === id) return f
    if (f.children) {
      const found = findFileById(f.children, id)
      if (found) return found
    }
  }
  return undefined
}

function updateFileInTree(files: FileNode[], id: string, updater: (f: FileNode) => FileNode): FileNode[] {
  return files.map((f) => {
    if (f.id === id) return updater(f)
    if (f.children) {
      return { ...f, children: updateFileInTree(f.children, id, updater) }
    }
    return f
  })
}

function removeFileFromTree(files: FileNode[], id: string): FileNode[] {
  return files
    .filter((f) => f.id !== id)
    .map((f) => {
      if (f.children) {
        return { ...f, children: removeFileFromTree(f.children, id) }
      }
      return f
    })
}

export const useFileStore = create<FileState>((set, get) => ({
  files: defaultFiles,
  activeFileId: 'html-1',
  openFileIds: ['html-1', 'css-1', 'js-1'],

  setFiles: (files) => set({ files }),

  createFile: (parentId, name) => {
    const newFile: FileNode = {
      id: generateId(),
      name,
      type: 'file',
      language: getLanguage(name),
      parentId: parentId || 'root',
      content: ''
    }
    set((state) => {
      const addToParent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((n) => {
          if (n.id === (parentId || 'root')) {
            return { ...n, children: [...(n.children || []), newFile] }
          }
          if (n.children) {
            return { ...n, children: addToParent(n.children) }
          }
          return n
        })
      }
      return { files: addToParent(state.files), activeFileId: newFile.id, openFileIds: [...state.openFileIds, newFile.id] }
    })
  },

  renameFile: (id, newName) => {
    set((state) => ({
      files: updateFileInTree(state.files, id, (f) => ({ ...f, name: newName, language: getLanguage(newName) || f.language }))
    }))
  },

  deleteFile: (id) => {
    set((state) => {
      const newOpen = state.openFileIds.filter((oid) => oid !== id)
      let newActive = state.activeFileId
      if (newActive === id) {
        newActive = newOpen.length > 0 ? newOpen[newOpen.length - 1] : null
      }
      return {
        files: removeFileFromTree(state.files, id),
        openFileIds: newOpen,
        activeFileId: newActive
      }
    })
  },

  updateFileContent: (id, content) => {
    set((state) => ({
      files: updateFileInTree(state.files, id, (f) => ({ ...f, content }))
    }))
  },

  setActiveFile: (id) => {
    set((state) => {
      const open = state.openFileIds.includes(id) ? state.openFileIds : [...state.openFileIds, id]
      return { activeFileId: id, openFileIds: open }
    })
  },

  closeFile: (id) => {
    set((state) => {
      const newOpen = state.openFileIds.filter((oid) => oid !== id)
      let newActive = state.activeFileId
      if (newActive === id) {
        newActive = newOpen.length > 0 ? newOpen[newOpen.length - 1] : null
      }
      return { openFileIds: newOpen, activeFileId: newActive }
    })
  }
}))

export function getAllFiles(files: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  for (const f of files) {
    if (f.type === 'file') result.push(f)
    if (f.children) result.push(...getAllFiles(f.children))
  }
  return result
}

export function getFileById(files: FileNode[], id: string): FileNode | undefined {
  return findFileById(files, id)
}
