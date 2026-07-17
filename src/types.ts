export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: 'html' | 'css' | 'javascript'
  children?: FileNode[]
  parentId?: string | null
}

export interface BundlerError {
  type: 'syntax' | 'runtime'
  message: string
  fileName: string
  line?: number
  column?: number
}

export interface AIAdvice {
  id: string
  errorMessage: string
  explanation: string
  suggestion: string
  fileName: string
  line?: number
}

export interface AppSettings {
  theme: 'dark' | 'light'
  fontSize: number
  tabSize: number
  livePreview: boolean
  layout: 'horizontal' | 'vertical'
  aiProvider: 'ollama' | 'openai' | ''
  aiBaseURL: string
  aiModel: string
  aiApiKey: string
}
