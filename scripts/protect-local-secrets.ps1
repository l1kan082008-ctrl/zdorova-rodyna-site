$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$currentIdentity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$interactiveUser = if ($env:USERDOMAIN -and $env:USERNAME) {
  "$env:USERDOMAIN\$env:USERNAME"
} else {
  $currentIdentity
}
$targets = @(
  (Join-Path $projectRoot ".dev.vars"),
  (Join-Path $projectRoot ".admin-credentials.local")
)

foreach ($target in $targets) {
  if (-not (Test-Path -LiteralPath $target -PathType Leaf)) { continue }
  $resolved = (Resolve-Path -LiteralPath $target).Path
  if (-not $resolved.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to change permissions outside the project."
  }

  $interactiveSid = ([System.Security.Principal.NTAccount]::new($interactiveUser)).Translate(
    [System.Security.Principal.SecurityIdentifier]
  )
  $fullControlSids = @(
    $interactiveSid.Value,
    "S-1-5-18",
    "S-1-5-32-544"
  ) | Select-Object -Unique
  $codexSids = [System.Collections.Generic.List[string]]::new()

  foreach ($optionalAccount in @(
    "$env:COMPUTERNAME\CodexSandboxOffline",
    "$env:COMPUTERNAME\CodexSandboxOnline"
  )) {
    try {
      $sid = ([System.Security.Principal.NTAccount]::new($optionalAccount)).Translate(
        [System.Security.Principal.SecurityIdentifier]
      )
      if (-not $codexSids.Contains($sid.Value)) { $codexSids.Add($sid.Value) }
    } catch {
      # The project may be used outside Codex, where these local accounts do not exist.
    }
  }

  $desiredSids = @($fullControlSids) + @($codexSids)
  $existingRules = (Get-Acl -LiteralPath $resolved).Access

  & icacls.exe $resolved /inheritance:r | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Failed to disable inherited ACLs." }

  foreach ($rule in $existingRules) {
    try {
      $sidValue = $rule.IdentityReference.Translate(
        [System.Security.Principal.SecurityIdentifier]
      ).Value
      if ($desiredSids -notcontains $sidValue) {
        & icacls.exe $resolved /remove:g "*$sidValue" | Out-Null
      }
    } catch {
      # Ignore an unresolvable stale account and continue with explicit grants.
    }
  }

  foreach ($sidValue in $fullControlSids) {
    & icacls.exe $resolved /grant:r "*$sidValue`:(F)" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Failed to grant the protected file owner." }
  }
  foreach ($sidValue in $codexSids) {
    & icacls.exe $resolved /grant:r "*$sidValue`:(R,W)" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Failed to grant the local Codex sandbox." }
  }
  Write-Output "Restricted ACL: $([System.IO.Path]::GetFileName($resolved))"
}
