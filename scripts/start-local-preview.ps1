$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$nodeExe = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$vinextCli = Join-Path $workspace "node_modules\vinext\dist\cli.js"
$stdoutLog = Join-Path $workspace "local-preview.out.log"
$stderrLog = Join-Path $workspace "local-preview.err.log"

if (-not (Test-Path -LiteralPath $nodeExe)) {
  throw "Node.js runtime not found."
}

if (-not (Test-Path -LiteralPath $vinextCli)) {
  throw "vinext is not installed."
}

$quotedNode = '"' + $nodeExe + '"'
$quotedCli = '"' + $vinextCli + '"'
$quotedStdout = '"' + $stdoutLog + '"'
$quotedStderr = '"' + $stderrLog + '"'

$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = Join-Path $env:WINDIR "System32\cmd.exe"
$processInfo.Arguments = "/d /s /c `"$quotedNode $quotedCli dev --host 127.0.0.1 --port 3000 1>$quotedStdout 2>$quotedStderr`""
$processInfo.WorkingDirectory = $workspace
$processInfo.UseShellExecute = $false
$processInfo.CreateNoWindow = $true

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $processInfo
[void]$process.Start()

$deadline = (Get-Date).AddSeconds(30)
do {
  Start-Sleep -Milliseconds 500

  try {
    $response = Invoke-WebRequest `
      -Uri "http://localhost:3000/" `
      -UseBasicParsing `
      -TimeoutSec 2

    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      Write-Output "http://localhost:3000/"
      exit 0
    }
  } catch {
    if ($process.HasExited) {
      break
    }
  }
} while ((Get-Date) -lt $deadline)

if (Test-Path -LiteralPath $stderrLog) {
  Get-Content -LiteralPath $stderrLog -Tail 30
}

if (Test-Path -LiteralPath $stdoutLog) {
  Get-Content -LiteralPath $stdoutLog -Tail 30
}

throw "Local preview did not start."
