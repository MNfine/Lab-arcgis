# Chay trong workflow-sheet hoac truyen URL PARAM Google Sheets
param(
  [string]$ParamSheetUrl = ""
)

$work = $PSScriptRoot
$buuDienRoot = Split-Path -Parent $work
$projectRoot = Split-Path -Parent (Split-Path -Parent $work)
$python = Join-Path $projectRoot ".venv/Scripts/python.exe"
$builder = Join-Path $work "generate_multitier_lod3_geojson.py"

if (-not (Test-Path $python)) {
  $python = "python"
}

Set-Location $work

if ($ParamSheetUrl) {
  & $python ./sync_from_gsheet.py --param-url $ParamSheetUrl --param-out "./DATA - PARAM_SHEET_TEMPLATE.csv"
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Google Sheets sync failed"
    exit 1
  }
}

& $python ./validate_param_sheet.py --param "./DATA - PARAM_SHEET_TEMPLATE.csv"
if ($LASTEXITCODE -ne 0) {
  Write-Error "Param sheet validation failed"
  exit 1
}

& $python $builder
if ($LASTEXITCODE -ne 0) {
  Write-Error "GeoJSON build failed"
  exit 1
}

Write-Output "Sheet pipeline OK"
