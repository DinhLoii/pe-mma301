param([string]$StudentCode = 'QE190167', [switch]$Template)
$ErrorActionPreference = 'Stop'
if ($StudentCode -notmatch '^[A-Za-z0-9_-]+$') { throw 'Invalid student code' }
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskOut = Join-Path $taskRoot $StudentCode
Add-Type -AssemblyName System.IO.Compression.FileSystem
foreach ($taskExtension in @('zip','docx')) {
  if (!(Test-Path -LiteralPath (Join-Path $taskOut "$StudentCode.$taskExtension"))) { throw "Missing $StudentCode.$taskExtension" }
}
$taskZip = [System.IO.Compression.ZipFile]::OpenRead((Join-Path $taskOut "$StudentCode.zip"))
try {
  foreach ($taskRequired in @('package.json','package-lock.json','firestore.rules','.env.example')) {
    if (!$taskZip.GetEntry($taskRequired)) { throw "Missing ZIP root file: $taskRequired" }
  }
  foreach ($taskEntry in $taskZip.Entries) {
    $taskName = $taskEntry.FullName
    if ($taskName -match '(^|/)(node_modules|\.expo|\.git|__pycache__)(/|$)|(^|/)\.env($|\.(?!example$))|submission.local.json|\.(jks|keystore|apk|aab|docx|zip)$') { throw "Forbidden source ZIP entry: $taskName" }
    $taskSource = [System.IO.Path]::GetFullPath((Join-Path $taskRoot $taskName))
    if (!$taskSource.StartsWith($taskRoot + '\')) { throw 'Unexpected ZIP path' }
    if (!(Test-Path -LiteralPath $taskSource -PathType Leaf)) { throw "ZIP contains a removed source file: $taskName" }
    $taskHasher = [System.Security.Cryptography.SHA256]::Create()
    $taskStream = $taskEntry.Open()
    try { $taskArchiveHash = [BitConverter]::ToString($taskHasher.ComputeHash($taskStream)).Replace('-','') } finally { $taskStream.Dispose(); $taskHasher.Dispose() }
    $taskSourceHasher = [System.Security.Cryptography.SHA256]::Create()
    try { $taskSourceHash = [BitConverter]::ToString($taskSourceHasher.ComputeHash([System.IO.File]::ReadAllBytes($taskSource))).Replace('-','') } finally { $taskSourceHasher.Dispose() }
    if ($taskArchiveHash -ne $taskSourceHash) { throw "ZIP is stale. Repackage source: $taskName" }
  }
} finally { $taskZip.Dispose() }
$taskWord = [System.IO.Compression.ZipFile]::OpenRead((Join-Path $taskOut "$StudentCode.docx"))
try {
  $taskDocument = $taskWord.GetEntry('word/document.xml')
  if (!$taskDocument) { throw 'Report is not a real Word document' }
  $taskReader = New-Object System.IO.StreamReader($taskDocument.Open())
  try { [xml]$taskXml = $taskReader.ReadToEnd() } finally { $taskReader.Dispose() }
  $taskNs = New-Object System.Xml.XmlNamespaceManager($taskXml.NameTable)
  $taskNs.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
  $taskText = ($taskXml.SelectNodes('//w:t', $taskNs) | ForEach-Object { $_.InnerText }) -join ' '
  foreach ($taskLabel in @('Student Code:','Full Name:','GitHub Repository URL:','Expo Project Link:','Firebase Project ID:','Test account email:','Test account password:')) {
    if (!$taskText.Contains($taskLabel)) { throw "Missing report field: $taskLabel" }
  }
  if (!$Template) {
    if ($taskText -match '\[Add |\[.*(email|password|URL).*\]') { throw 'Report still contains placeholders' }
    if ($taskText -notmatch 'https://expo\.dev/[^\s]*(/builds/|/artifacts/)[^\s]+') { throw 'Report needs the completed APK/build URL, not just the project homepage' }
    if (!($taskWord.Entries | Where-Object FullName -Like 'word/media/*')) { throw 'Report has no screenshot evidence' }
  }
} finally { $taskWord.Dispose() }
Write-Host 'PASS: source ZIP matches current files and Word structure is valid.'
if ($Template) { Write-Warning 'Template mode: final screenshots, account, build-to-source match and app behavior still need manual verification.' }
