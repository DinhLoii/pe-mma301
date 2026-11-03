param([string]$StudentCode = 'QE190167')
$ErrorActionPreference = 'Stop'
if ($StudentCode -notmatch '^[A-Za-z0-9_-]+$') { throw 'Invalid student code' }
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskOut = Join-Path $taskRoot $StudentCode
New-Item -ItemType Directory -Force -Path $taskOut | Out-Null
$taskZip = Join-Path $taskOut "$StudentCode.zip"
$taskTemp = Join-Path $taskOut "$StudentCode.zip.tmp"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskFiles = @('package.json','package-lock.json','app.json','eas.json','tsconfig.json','expo-env.d.ts','eslint.config.js','.gitignore','.easignore','.env.example','.firebaserc','firebase.json','firestore.rules','firestore.indexes.json','README.md','LICENSE','EXAM_RUNBOOK.md','submission.example.json')
$taskFolders = @('src','scripts','tests','.github','assets','docs')
if (Test-Path -LiteralPath $taskTemp) { Remove-Item -LiteralPath $taskTemp }
$taskArchive = [System.IO.Compression.ZipFile]::Open($taskTemp, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($taskRel in $taskFiles) {
    $taskFull = Join-Path $taskRoot $taskRel
    if (!(Test-Path -LiteralPath $taskFull)) { if ($taskRel -eq 'expo-env.d.ts') { continue }; throw "Missing required source file: $taskRel" }
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskArchive, $taskFull, $taskRel) | Out-Null
  }
  foreach ($taskFolder in $taskFolders) {
    $taskFolderPath = Join-Path $taskRoot $taskFolder
    if (!(Test-Path -LiteralPath $taskFolderPath)) { continue }
    Get-ChildItem -LiteralPath $taskFolderPath -File -Recurse | Where-Object {
      $_.FullName -notmatch '[\\/]__pycache__[\\/]|\.pyc$'
    } | ForEach-Object {
      $taskRel = $_.FullName.Substring($taskRoot.Length + 1).Replace('\','/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskArchive, $_.FullName, $taskRel) | Out-Null
    }
  }
} finally { $taskArchive.Dispose() }
$taskRead = [System.IO.Compression.ZipFile]::OpenRead($taskTemp)
try {
  $taskNames = @($taskRead.Entries.FullName)
  if ('package.json' -notin $taskNames) { throw 'package.json must be at ZIP root' }
  if ($taskNames | Where-Object { $_ -match '(^|/)(node_modules|\.expo|\.git|__pycache__)(/|$)|(^|/)\.env($|\.(?!example$))|submission.local.json|\.(jks|keystore|apk|aab|docx|zip)$' }) { throw 'Forbidden file found in source ZIP' }
  $taskEnv = New-Object System.IO.StreamReader($taskRead.GetEntry('.env.example').Open())
  try { $taskEnvText = $taskEnv.ReadToEnd() } finally { $taskEnv.Dispose() }
  if ($taskEnvText -split "\r?\n" | Where-Object { $_ -match '^\s*[^#=]+=\s*\S' }) { throw '.env.example must not contain real values' }
} finally { $taskRead.Dispose() }
Move-Item -LiteralPath $taskTemp -Destination $taskZip -Force
Write-Host "Verified current source ZIP: $taskZip"
if (!(Test-Path -LiteralPath (Join-Path $taskOut "$StudentCode.docx"))) { Write-Warning 'Word report still needed in the same folder.' }
