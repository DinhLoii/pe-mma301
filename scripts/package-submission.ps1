param([string]$StudentCode = 'QE190167')
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskOut = Join-Path $taskRoot 'submission'
New-Item -ItemType Directory -Force -Path $taskOut | Out-Null
$taskZip = Join-Path $taskOut "$StudentCode.zip"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
# Explicit allowlist avoids uploading .env, caches, auth tokens, reports or unrelated files.
$taskFiles = @('package.json','package-lock.json','app.json','eas.json','tsconfig.json','expo-env.d.ts','eslint.config.js','.gitignore','.easignore','.env.example','.firebaserc','firebase.json','firestore.rules','firestore.indexes.json','README.md','EXAM_RUNBOOK.md','submission.example.json')
$taskFolders = @('src','scripts','tests','.github')
if (Test-Path -LiteralPath $taskZip) { Remove-Item -LiteralPath $taskZip }
$taskArchive = [System.IO.Compression.ZipFile]::Open($taskZip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($taskRel in $taskFiles) {
    $taskFull = Join-Path $taskRoot $taskRel
    if (Test-Path -LiteralPath $taskFull) { [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskArchive, $taskFull, $taskRel) | Out-Null }
  }
  foreach ($taskFolder in $taskFolders) {
    Get-ChildItem -LiteralPath (Join-Path $taskRoot $taskFolder) -File -Recurse | ForEach-Object {
      $taskRel = $_.FullName.Substring($taskRoot.Length + 1).Replace('\','/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskArchive, $_.FullName, $taskRel) | Out-Null
    }
  }
} finally { $taskArchive.Dispose() }
$taskRead = [System.IO.Compression.ZipFile]::OpenRead($taskZip)
try {
  $taskNames = @($taskRead.Entries.FullName)
  if ('package.json' -notin $taskNames) { throw 'package.json is not at ZIP root' }
  if ($taskNames | Where-Object { $_ -match '(^|/)(node_modules|\.expo|\.git)(/|$)|(^|/)\.env$|submission.local.json' }) { throw 'Forbidden file found in ZIP' }
} finally { $taskRead.Dispose() }
Write-Host "Verified source ZIP: $taskZip"
if (!(Test-Path -LiteralPath (Join-Path $taskOut "$StudentCode.docx"))) { Write-Warning 'Word report still needed. Follow EXAM_RUNBOOK.md; include only genuine screenshots.' }
