@echo off
setlocal

set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "VINEXT_CLI=%~dp0..\node_modules\vinext\dist\cli.js"

if not exist "%NODE_EXE%" (
  echo Node.js runtime not found: %NODE_EXE%
  exit /b 1
)

if not exist "%VINEXT_CLI%" (
  echo vinext is not installed. Run npm install first.
  exit /b 1
)

"%NODE_EXE%" "%VINEXT_CLI%" build
