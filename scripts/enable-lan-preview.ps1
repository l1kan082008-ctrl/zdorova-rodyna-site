$ErrorActionPreference = "Stop"

$ruleName = "Codex Local Site Preview 4190"
$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if ($existingRule) {
  Set-NetFirewallRule `
    -DisplayName $ruleName `
    -Enabled True `
    -Action Allow `
    -Profile Public

  Set-NetFirewallAddressFilter `
    -AssociatedNetFirewallRule $existingRule `
    -RemoteAddress LocalSubnet
} else {
  New-NetFirewallRule `
    -DisplayName $ruleName `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort 4190 `
    -RemoteAddress LocalSubnet `
    -Profile Public
}

