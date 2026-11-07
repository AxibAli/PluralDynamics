# Runs the Plural Dynamics Node.js app as a Windows service (via NSSM) on 127.0.0.1:<Port>.
# Re-run after copying a new build: it updates the settings and restarts the service.
#
#   powershell -ExecutionPolicy Bypass -File install-service.ps1
#   powershell -ExecutionPolicy Bypass -File install-service.ps1 -AppDir D:\sites\pd\app -Port 3002 -ServiceName pd-live
param(
  [string]$AppDir = "C:\inetpub\wwwroot\pluraldynamics\app",
  [int]$Port = 3001,
  [string]$ServiceName = "pluraldynamics",
  [string]$Nssm = "C:\tools\nssm\nssm.exe"
)
$ErrorActionPreference = "Stop"

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw "Run PowerShell as Administrator." }

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { throw "Node.js not found. Install Node.js 22 LTS from https://nodejs.org and open a new PowerShell." }
$major = [int]((& $node -v).TrimStart("v").Split(".")[0])
if ($major -lt 20) { throw "Node.js $major is too old; install Node.js 22 LTS." }
if (-not (Test-Path $Nssm)) { throw "NSSM not found at $Nssm. Download it from https://nssm.cc/download and put nssm.exe (win64) there, or pass -Nssm <path>." }

$entry = Join-Path $AppDir ".output\server\index.mjs"
if (-not (Test-Path $entry)) { throw "Build not found: $entry. Copy the .output folder into $AppDir." }
$envFile = Join-Path $AppDir ".env"
if (-not (Test-Path $envFile)) { Write-Warning "$envFile is missing: the site will show original content only, and the dashboard/contact form won't work." }

$logs = Join-Path $AppDir "logs"
New-Item -ItemType Directory -Force $logs | Out-Null

$exists = [bool](Get-Service -Name $ServiceName -ErrorAction SilentlyContinue)
if (-not $exists) {
  Write-Host "Creating service $ServiceName"
  & $Nssm install $ServiceName $node ".output\server\index.mjs" | Out-Null
} else {
  Write-Host "Updating service $ServiceName"
  & $Nssm stop $ServiceName | Out-Null
  & $Nssm set $ServiceName Application $node | Out-Null
  & $Nssm set $ServiceName AppParameters ".output\server\index.mjs" | Out-Null
}
# The app reads .env from its working directory.
& $Nssm set $ServiceName AppDirectory $AppDir | Out-Null
& $Nssm set $ServiceName AppEnvironmentExtra "NODE_ENV=production" "PORT=$Port" "HOST=127.0.0.1" | Out-Null
& $Nssm set $ServiceName DisplayName "Plural Dynamics ($ServiceName)" | Out-Null
& $Nssm set $ServiceName Start SERVICE_AUTO_START | Out-Null
& $Nssm set $ServiceName AppStdout (Join-Path $logs "out.log") | Out-Null
& $Nssm set $ServiceName AppStderr (Join-Path $logs "error.log") | Out-Null
& $Nssm set $ServiceName AppRotateFiles 1 | Out-Null
& $Nssm set $ServiceName AppRotateBytes 5242880 | Out-Null
& $Nssm start $ServiceName | Out-Null

Start-Sleep -Seconds 4
try {
  $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 30 "http://127.0.0.1:$Port/"
  Write-Host "OK: the app answers on http://127.0.0.1:$Port (HTTP $($r.StatusCode))" -ForegroundColor Green
} catch {
  Write-Warning "The app did not answer on port $Port yet. Check $logs\error.log"
}
