#Requires -Version 7.0
# Run after privately reviewing the exact exported PDF. This does not stage or publish.
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $Pdf,
    [Parameter(Mandatory)] [ValidatePattern('\A[0-9a-fA-F]{64}\z')] [string] $ApprovedSha256
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).ProviderPath
$branch = git -C $repo branch --show-current
if ($LASTEXITCODE -ne 0 -or $branch -cnotlike 'resume-update/*') {
    throw 'Use a fresh resume-update/<name> branch from origin/main.'
}
$changes = git -C $repo status --porcelain --untracked-files=all
if ($LASTEXITCODE -ne 0 -or $changes) {
    throw 'Start with a clean worktree and index. Keep the exported PDF outside the checkout.'
}

$source = Get-Item -LiteralPath $Pdf
$destination = Join-Path $repo 'resume.pdf'
$existing = Get-Item -LiteralPath $destination -Force -ErrorAction SilentlyContinue
$reparse = [IO.FileAttributes]::ReparsePoint
if ($source -isnot [IO.FileInfo] -or ($source.Attributes -band $reparse)) {
    throw 'Supply a regular local PDF file, not a symlink.'
}
if ($existing -and ($existing -isnot [IO.FileInfo] -or ($existing.Attributes -band $reparse))) {
    throw 'Refusing to replace a non-regular resume.pdf.'
}
# Read a bounded snapshot and write those exact bytes only after the hash matches.
$stream = [IO.File]::OpenRead($source.FullName)
try {
    $length = $stream.Length
    if ($length -lt 6 -or $length -gt 5MB) { throw 'Expected a PDF no larger than 5 MiB.' }
    $bytes = [byte[]]::new([int] $length)
    $offset = 0
    while ($offset -lt $length) {
        $count = $stream.Read($bytes, $offset, $bytes.Length - $offset)
        if ($count -eq 0) { throw 'The source changed while it was being read.' }
        $offset += $count
    }
    if ($stream.ReadByte() -ne -1) { throw 'The source changed while it was being read.' }
} finally {
    $stream.Dispose()
}
if ([Text.Encoding]::ASCII.GetString($bytes, 0, 5) -cne '%PDF-') { throw 'Missing PDF header.' }
$sha = [Security.Cryptography.SHA256]::Create()
try {
    $digest = [BitConverter]::ToString($sha.ComputeHash($bytes)).Replace('-', '').ToLowerInvariant()
} finally {
    $sha.Dispose()
}
if ($digest -ine $ApprovedSha256) { throw 'Hash mismatch. Review the actual PDF before trying again.' }
if ($existing -and (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash -ieq $digest) {
    Write-Output 'resume.pdf already matches the approved PDF; nothing changed.'
    return
}

$temp = Join-Path $repo ('.resume-' + [guid]::NewGuid().ToString('N') + '.tmp')
try {
    [IO.File]::WriteAllBytes($temp, $bytes)
    [IO.File]::Move($temp, $destination, $true)
} finally {
    if ([IO.File]::Exists($temp)) { [IO.File]::Delete($temp) }
}
Write-Output "Prepared root resume.pdf (SHA-256: $digest). Nothing staged or published."
