param(
  [Parameter(Mandatory = $true)][string]$ObjPath,
  [string]$OutGeoJson = "./output/obj-faces-triangles.geojson",
  [int]$MaxFeatures = 120000,
  [double]$AnchorLon = 106.69999,
  [double]$AnchorLat = 10.77996,
  [double]$AnchorZ = 0.2,
  [double]$UnitScale = 1,
  [double]$RotateRightDeg = 35
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $scriptDir

# Guard common mistake: leaving template placeholder unchanged.
if ($ObjPath -match "<.*>") {
  throw "ObjPath dang la placeholder. Hay thay bang duong dan file OBJ that."
}

# Resolve ObjPath from current shell location or absolute path.
$resolvedObjPath = $null
try {
  $resolvedObjPath = (Resolve-Path -LiteralPath $ObjPath -ErrorAction Stop).Path
} catch {
  throw "Khong tim thay OBJ: $ObjPath"
}

$py = "python"
if (Test-Path -LiteralPath "..\.venv\Scripts\python.exe") {
  $py = "..\.venv\Scripts\python.exe"
}

& $py "./obj_to_geojson_compare.py" --obj $resolvedObjPath --out $OutGeoJson --max-features $MaxFeatures --anchor-lon $AnchorLon --anchor-lat $AnchorLat --anchor-z $AnchorZ --unit-scale $UnitScale --rotate-right-deg $RotateRightDeg
if ($LASTEXITCODE -ne 0) {
  throw "obj_to_geojson_compare.py that bai voi exit code $LASTEXITCODE"
}

Write-Host "done=1"
Write-Host "obj=$resolvedObjPath"
Write-Host "out=$OutGeoJson"
Write-Host "anchor=$AnchorLon,$AnchorLat,$AnchorZ"
Write-Host "unitScale=$UnitScale"
Write-Host "rotateRightDeg=$RotateRightDeg"
