@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"
set "CREATOR_NODE=%~dp0runtime\node\node.exe"
if exist "%CREATOR_NODE%" goto check_node
set "CREATOR_NODE=node"
where node >nul 2>nul
if errorlevel 1 goto missing_node
:check_node
"%CREATOR_NODE%" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"
if errorlevel 1 goto missing_node
"%CREATOR_NODE%" launcher.mjs --no-open
if errorlevel 1 goto failed
start "" "http://127.0.0.1:4317/"
if errorlevel 1 goto browser_failed
exit /b 0
:browser_failed
echo The local server is running. Open http://127.0.0.1:4317/ in your browser.
goto failed
:missing_node
echo Creator Studio needs Node.js 22 or newer.
echo Please extract the complete package, including the runtime folder.
:failed
pause
exit /b 1
