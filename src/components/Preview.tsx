import { useRef, useEffect, useState } from 'react'
import { useFileStore, getAllFiles } from '@/store/useFileStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Monitor, Tablet, Smartphone, RefreshCw } from 'lucide-react'

interface PreviewProps {
  onRuntimeError: (error: { message: string; fileName: string; line?: number }) => void
}

export default function Preview({ onRuntimeError }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { files } = useFileStore()
  const { livePreview } = useSettingsStore()
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [key, setKey] = useState(0)

  const buildHtml = () => {
    const allFiles = getAllFiles(files)
    const htmlFile = allFiles.find((f) => f.name === 'index.html')
    let html = htmlFile?.content || '<html><body><h1>No index.html</h1></body></html>'

    const cssFiles = allFiles.filter((f) => f.name.endsWith('.css'))
    const jsFiles = allFiles.filter((f) => f.name.endsWith('.js'))

    const styleTag = cssFiles.map((f) => `<style>\n/* ${f.name} */\n${f.content || ''}\n</style>`).join('\n')
    const scriptTag = jsFiles.map((f) => `<script>\n/* ${f.name} */\n${f.content || ''}\n</script>`).join('\n')

    if (html.includes('</head>')) {
      html = html.replace('</head>', `${styleTag}\n</head>`)
    } else {
      html = html.replace('<html>', `<html><head>${styleTag}</head>`)
    }

    const errorCaptureScript = `
      <script>
        window.onerror = function(msg, url, line) {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'runtime-error', message: msg, line: line || 0 }, '*');
          }
          return false;
        };
        window.addEventListener('unhandledrejection', function(e) {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'runtime-error', message: e.reason?.message || String(e.reason), line: 0 }, '*');
          }
        });
      </script>
    `

    if (html.includes('</body>')) {
      html = html.replace('</body>', `${scriptTag}\n${errorCaptureScript}\n</body>`)
    } else {
      html = html.replace('</html>', `${scriptTag}\n${errorCaptureScript}\n</html>`)
    }

    return html
  }

  useEffect(() => {
    if (!livePreview) return
    const timer = setTimeout(() => {
      setKey((k) => k + 1)
    }, 300)
    return () => clearTimeout(timer)
  }, [files, livePreview])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'runtime-error') {
        onRuntimeError({
          message: e.data.message,
          fileName: 'script.js',
          line: e.data.line
        })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onRuntimeError])

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  }

  return (
    <div className="flex flex-col h-full bg-[#0b0f19]">
      <div className="h-10 bg-[#111827] border-b border-[#1e293b] flex items-center justify-between px-3">
        <div className="flex items-center gap-1">
          {([
            { key: 'desktop', icon: Monitor, label: '桌面' },
            { key: 'tablet', icon: Tablet, label: '平板' },
            { key: 'mobile', icon: Smartphone, label: '手机' }
          ] as const).map(({ key: k, icon: Icon, label }) => (
            <button
              key={k}
              onClick={() => setDevice(k)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
                device === k ? 'bg-[#1e293b] text-[#38bdf8]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1e293b] transition"
          title="刷新预览"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-[#0b0f19]">
        <div
          className="h-full bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
          style={{ width: deviceWidths[device], maxWidth: '100%' }}
        >
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={buildHtml()}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="preview"
          />
        </div>
      </div>
    </div>
  )
}
