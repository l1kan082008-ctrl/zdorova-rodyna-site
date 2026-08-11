$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$stdoutLog = Join-Path $workspace "localhostrun.out.log"
$stderrLog = Join-Path $workspace "localhostrun.err.log"
$sshExe = Join-Path $env:WINDIR "System32\OpenSSH\ssh.exe"

Get-Process ssh -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

Remove-Item -LiteralPath $stdoutLog -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $stderrLog -Force -ErrorAction SilentlyContinue

$sshArguments = @(
  "-o", "StrictHostKeyChecking=no",
  "-o", "ServerAliveInterval=30",
  "-R", "80:localhost:4180",
  "nokey@localhost.run"
)

$quotedSshExe = '"' + $sshExe + '"'
$quotedStdoutLog = '"' + $stdoutLog + '"'
$quotedStderrLog = '"' + $stderrLog + '"'
$argumentLine = ($sshArguments | ForEach-Object {
  if ($_ -match "\s") { '"' + $_ + '"' } else { $_ }
}) -join " "

# Start-Process can fail when Windows exposes both Path and PATH variables.
# A hidden cmd process keeps the tunnel alive and writes its output to the same logs.
$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = Join-Path $env:WINDIR "System32\cmd.exe"
$processInfo.Arguments = "/d /s /c `"$quotedSshExe $argumentLine 1>$quotedStdoutLog 2>$quotedStderrLog`""
$processInfo.WorkingDirectory = $workspace
$processInfo.UseShellExecute = $false
$processInfo.CreateNoWindow = $true

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $processInfo
[void]$process.Start()

$deadline = (Get-Date).AddSeconds(25)
do {
  Start-Sleep -Seconds 1
  if (Test-Path -LiteralPath $stdoutLog) {
    $match = Select-String `
      -LiteralPath $stdoutLog `
      -Pattern "https://[a-zA-Z0-9-]+\.lhr\.life" `
      -AllMatches `
      -ErrorAction SilentlyContinue |
      ForEach-Object { $_.Matches.Value } |
      Select-Object -Last 1

    if ($match) {
      Write-Output $match
      exit 0
    }
  }
} while ((Get-Date) -lt $deadline)

if (Test-Path -LiteralPath $stderrLog) {
  Get-Content -LiteralPath $stderrLog -Tail 20
}

throw "localhost.run did not return a public URL."
