param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath
)

$ErrorActionPreference = 'Stop'

$weights = [ordered]@{
  visualCoherence      = 15
  componentConsistency = 15
  responsive           = 15
  typography           = 10
  layoutSpacing        = 10
  accessibility        = 10
  performance          = 10
  motion               = 5
  contentFlow          = 5
  stateCoverage        = 5
}

if (-not (Test-Path -LiteralPath $InputPath)) {
  throw "Score input not found: $InputPath"
}

$scores = Get-Content -Raw -LiteralPath $InputPath | ConvertFrom-Json
$total = 0.0
$details = [ordered]@{}

foreach ($entry in $weights.GetEnumerator()) {
  $property = $scores.PSObject.Properties[$entry.Key]
  if ($null -eq $property) {
    throw "Missing score: $($entry.Key)"
  }

  $value = [double]$property.Value
  if ($value -lt 0 -or $value -gt 10) {
    throw "Score $($entry.Key) must be between 0 and 10."
  }

  $weighted = ($value / 10) * $entry.Value
  $details[$entry.Key] = [math]::Round($weighted, 2)
  $total += $weighted
}

$rounded = [math]::Round($total, 1)
[pscustomobject]@{
  score = $rounded
  passes = $rounded -ge 90
  threshold = 90
  breakdown = $details
} | ConvertTo-Json -Depth 4
