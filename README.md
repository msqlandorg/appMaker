# App Editor

基于 Electron + React + Monaco Editor 的桌面应用编辑器，支持实时预览和本地 AI 错误诊断。

## ✨ 功能特性

- **实时预览** - 左侧编写 HTML/CSS/JS 代码，右侧即时渲染应用效果
- **代码编辑** - 集成 Monaco Editor（VS Code 同款编辑器），支持语法高亮和智能提示
- **文件管理** - 内置文件资源管理器，支持多文件 Tab 切换
- **AI 诊断** - 连接本地 Qwen/Ollama 模型，自动分析代码错误并提供修复建议
- **项目导出** - 支持将项目导出为 ZIP 压缩包
- **设备切换** - 支持多种设备尺寸预览（桌面、平板、手机）
- **自定义设置** - 主题切换、字体大小、Tab 大小等个性化配置

## 🛠️ 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 桌面框架 | Electron | 32.3.3 |
| 前端框架 | React | 18.3.1 |
| 构建工具 | electron-vite | 3.0.0 |
| 代码编辑器 | Monaco Editor | 0.52.2 |
| 状态管理 | Zustand | 5.0.3 |
| 样式框架 | TailwindCSS | 3.4.17 |
| 图标库 | lucide-react | 0.468.0 |
| 类型系统 | TypeScript | 5.7.3 |
| 打包工具 | electron-builder | 26.15.3 |

## 📦 安装

```bash
# 安装依赖
npm install

# 如果网络较慢，可以使用国内镜像
npm config set registry https://registry.npmmirror.com/
npm install
```

## 🚀 运行

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
# 构建项目
npm run build

# 打包 Windows 安装包
npm run build:win

# 打包便携版
npm run build:portable
```

## 📁 项目结构

```
.
├── electron/                 # Electron 主进程
│   ├── main.ts              # 主进程入口，IPC 通信处理
│   └── preload.ts           # 预加载脚本
├── src/                     # React 渲染进程
│   ├── components/          # UI 组件
│   │   ├── AIPanel.tsx      # AI 诊断面板
│   │   ├── Editor.tsx       # Monaco Editor 包装
│   │   ├── FileExplorer.tsx # 文件资源管理器
│   │   ├── Preview.tsx      # 实时预览区
│   │   ├── SettingsModal.tsx # 设置弹窗
│   │   └── Toolbar.tsx      # 顶部工具栏
│   ├── store/               # Zustand 状态管理
│   │   ├── useFileStore.ts  # 文件树状态
│   │   └── useSettingsStore.ts # 设置状态
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   ├── types.ts             # TypeScript 类型定义
│   └── index.css            # 全局样式
├── electron.vite.config.ts  # Vite + Electron 配置
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
└── tailwind.config.js       # TailwindCSS 配置
```

## 🔌 AI 配置

应用支持连接本地 AI 模型进行错误诊断：

### 使用 Ollama（推荐）

1. 安装 Ollama：https://ollama.com/download
2. 拉取 Qwen 模型：`ollama pull qwen`
3. 在应用设置中配置：
   - AI Provider: Ollama
   - Base URL: http://localhost:11434
   - Model: qwen

### 使用本地 Qwen CPU 模型

确保本地运行了 Qwen 兼容的 API 服务，在设置中配置相应的 Base URL 和模型名称。

## 📝 使用说明

1. 打开应用后，默认创建三个文件：`index.html`、`style.css`、`script.js`
2. 在编辑器中编写代码，右侧预览区会实时更新
3. 如果代码出现错误，AI 诊断面板会自动分析并提供修复建议
4. 使用工具栏可以创建新文件、保存项目、导出 ZIP

## 📄 许可证

[AGPL-3.0](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
