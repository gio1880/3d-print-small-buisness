# Slices .3mf projects one at a time with Bambu Studio's command line (whatever is on the plate) and appends one row per
# file to a CSV as it goes: name, total time, grams per slot. A file that takes longer than -TimeoutSec is stopped and
# marked "timed out" (one hung slice stopped the whole clicker run on 17 Nov 2026). Files already in the CSV are skipped.
#   powershell -File slice-3mf.ps1 -Csv <report.csv> -Files <a.3mf>,<b.3mf>,...
param([Parameter(Mandatory)][string]$Csv, [Parameter(Mandatory)][string[]]$Files, [int]$TimeoutSec = 600)
$bs = 'C:\Program Files\Bambu Studio\bambu-studio.exe'
$tmp = Join-Path $PSScriptRoot '_slice-tmp'
$done = @{}
if (Test-Path -LiteralPath $Csv) { Import-Csv -LiteralPath $Csv | ForEach-Object { if ($_.time -notmatch 'failed|timed out') { $done[$_.name] = 1 } } }
foreach ($path in $Files) {
  $f = Get-Item -LiteralPath $path
  if ($done.ContainsKey($f.BaseName)) { Write-Host "$($f.BaseName) already sliced"; continue }
  if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
  New-Item -ItemType Directory -Path $tmp | Out-Null
  $p = Start-Process -FilePath $bs -ArgumentList '--slice', '0', '--debug', '0', '--outputdir', "`"$tmp`"", "`"$($f.FullName)`"" -PassThru -NoNewWindow
  $t = ''; $w = ''
  if (-not $p.WaitForExit($TimeoutSec * 1000)) { Stop-Process -Id $p.Id -Force; $t = "timed out after $TimeoutSec s" }
  else {
    $g = Join-Path $tmp 'plate_1.gcode'
    if (-not (Test-Path -LiteralPath $g)) { $t = "slice failed (exit $($p.ExitCode))" }
    else {
      $t = (Select-String -LiteralPath $g -Pattern 'total estimated time: (.*)$' | Select-Object -First 1).Matches[0].Groups[1].Value
      $w = (Select-String -LiteralPath $g -Pattern 'total filament weight \[g\] : (.*)$' | Select-Object -First 1).Matches[0].Groups[1].Value
    }
  }
  [pscustomobject]@{ name = $f.BaseName; time = $t; grams = $w } | Export-Csv -NoTypeInformation -Append -LiteralPath $Csv
  Write-Host $f.BaseName $t $w
}
if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
