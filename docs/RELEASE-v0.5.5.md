# Creator Studio v0.5.5 — Portable preview

Creator Studio is a local fiction writing desk. Write your own passages, ask an API model to continue, revise the result, and keep story memory, world notes, and chapters together.

## Download and start

| System | Download | Start | What is included |
| --- | --- | --- | --- |
| Windows x64 | `Creator-Studio-v0.5.5-Windows-x64.zip` | Extract the entire ZIP, then double-click `start-windows.bat` | Node.js runtime included; no installation or administrator rights needed |
| macOS (Apple Silicon or Intel) | `Creator-Studio-v0.5.5-macOS.zip` | Extract the entire ZIP, then double-click `start-mac.command` | First launch uses existing Node.js 22+ or downloads and verifies a pinned runtime; internet is needed if downloading |

Keep the extracted folder intact. The app opens in your browser at `http://127.0.0.1:4317/`. Enter your own model API key under **Model connection**. The default offline demo does not call a model. Your stories stay in this browser's local storage; use **Back up all stories** before changing browser, computer, or local address.

**Source code:** use the repository's **Code → Download ZIP**. It does not contain the bundled Windows runtime; install Node.js 22+ and run `npm start` from the project directory.

**Checksums (SHA-256 of the original portable archives):**

- Windows: `ee75ff1fcc3deaef633ecdb31ab4c6694fe3e36c7658a1422b65296b5c436369`
- macOS: `4b3236bc831d731431f6e50fd4f329b37292688f3d4fa0f75bb7b200b8a25773`

These are preview builds. Automated tests pass (60/60) using a simulated upstream API; real provider accounts and native Windows/macOS double-click launches have not been independently retested here. Read [README.md](../README.md) for configuration and [LICENSE.txt](../LICENSE.txt) for permitted use.

## 中文速览

- **Windows x64：**下载 Windows 压缩包，完整解压，双击 `start-windows.bat`。已经内置 Node.js，不用安装。
- **Mac：**下载 macOS 压缩包，完整解压，双击 `start-mac.command`。首次运行如果电脑没有 Node.js，需要联网下载并校验运行环境；终端窗口需保持打开。
- 浏览器打开 `http://127.0.0.1:4317/`，在“模型连接”填自己的 API Key。作品保存在当前浏览器，请定期“备份全部故事”。
- 本版为试用预览；自动化测试使用模拟接口，真实模型和两种系统的双击启动仍建议按设备验证。详见 [中文说明](../README.zh-CN.md)。
