$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $RepoRoot
try {
    $gloriaRaw = [System.IO.File]::ReadAllText((Join-Path $RepoRoot 'gloria.toml'), [System.Text.Encoding]::UTF8)
    if ($gloriaRaw -notmatch '(?m)^version\s*=\s*"([^"]+)"') {
        throw "Could not read version from gloria.toml"
    }
    $version = $Matches[1]
    Write-Host "Packaging viaComponentis v$version..." -ForegroundColor White

    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }

    cargo build --release --manifest-path (Join-Path $RepoRoot 'src-tauri\Cargo.toml')
    if ($LASTEXITCODE -ne 0) { throw "Cargo release build failed" }

    $stageDir = Join-Path $RepoRoot 'stage'
    if (Test-Path -LiteralPath $stageDir) {
        Remove-Item -LiteralPath $stageDir -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $stageDir | Out-Null

    $exeSrc = Join-Path $RepoRoot 'src-tauri\target\release\viaComponentis.exe'
    if (-not (Test-Path -LiteralPath $exeSrc)) {
        throw "Expected release binary not found at $exeSrc"
    }
    Copy-Item -LiteralPath $exeSrc -Destination (Join-Path $stageDir 'viaComponentis.exe') -Force

    $outDir = Join-Path $RepoRoot 'dist'
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null

    npx --yes gloria-setup@latest --app $stageDir --manifest (Join-Path $RepoRoot 'gloria.toml') --version $version --out $outDir
    if ($LASTEXITCODE -ne 0) { throw "gloria-setup failed" }

    Write-Host "Installer built in $outDir" -ForegroundColor White
} finally {
    Pop-Location
}
