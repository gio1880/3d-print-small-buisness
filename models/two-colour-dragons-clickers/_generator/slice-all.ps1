# Slices every project with Bambu Studio's command line (one copy on the plate) and writes slice-report.csv:
# name, total time, grams per slot. Run from this folder:  powershell -File slice-all.ps1
$ErrorActionPreference = 'Stop'
$bs = 'C:\Program Files\Bambu Studio\bambu-studio.exe'
$tmp = Join-Path $PSScriptRoot '_slice-tmp'
$rows = @()
foreach ($f in Get-ChildItem ..\dragons\*.3mf, ..\clickers\*.3mf) {
  if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
  New-Item -ItemType Directory -Path $tmp | Out-Null
  $p = Start-Process -FilePath $bs -ArgumentList '--slice', '0', '--debug', '0', '--outputdir', "`"$tmp`"", "`"$($f.FullName)`"" -Wait -PassThru -NoNewWindow
  $g = Join-Path $tmp 'plate_1.gcode'
  if (-not (Test-Path $g)) { $rows += [pscustomobject]@{ name = $f.BaseName; time = "slice failed (exit $($p.ExitCode))"; grams = '' }; continue }
  $t = (Select-String -Path $g -Pattern 'total estimated time: (.*)$' | Select-Object -First 1).Matches[0].Groups[1].Value
  $w = (Select-String -Path $g -Pattern 'total filament weight \[g\] : (.*)$' | Select-Object -First 1).Matches[0].Groups[1].Value
  $rows += [pscustomobject]@{ name = $f.BaseName; time = $t; grams = $w }
  Write-Host $f.BaseName $t $w
}
$rows | Export-Csv -NoTypeInformation -Path (Join-Path $PSScriptRoot 'slice-report.csv')
if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
