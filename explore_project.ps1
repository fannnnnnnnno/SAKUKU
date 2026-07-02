# =========================================================
# Script: SAKUKU Project Explorer (ASCII-safe version)
# =========================================================

$projectRoot = Get-Location
$output = @()

$output += "============================================================"
$output += "SAKUKU PROJECT STRUCTURE"
$output += "Path: $projectRoot"
$output += "Date: $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
$output += "============================================================"

# --- 1. Struktur Folder ---
$output += ""
$output += "### FOLDER STRUCTURE ###"
$output += ""

Get-ChildItem -Recurse -Force |
    Where-Object {
        $_.FullName -notmatch "node_modules|\.next|\.git|\.vscode|__pycache__|\.cache|fonts" -and
        $_.Name -notmatch "^package-lock\.json$|^yarn\.lock$"
    } |
    ForEach-Object {
        $depth = ($_.FullName.Replace($projectRoot.Path, "").Split([IO.Path]::DirectorySeparatorChar).Count - 2)
        $indent = "  " * $depth
        $prefix = if ($_.PSIsContainer) { "[DIR]" } else { "[FILE]" }
        $output += "$indent$prefix $($_.Name)"
    }

# --- 2. File Penting ---
$importantFiles = @(
    "package.json",
    "tsconfig.json",
    "next.config.ts",
    "prisma\schema.prisma",
    "src\app\layout.tsx",
    "src\app\page.tsx",
    "src\lib\auth.ts",
    "src\lib\db.ts",
    "src\lib\prisma.ts",
    "src\types\index.ts",
    "src\store\transactionStore.ts",
    "src\store\categoryStore.ts",
    "src\middleware.ts",
    "middleware.ts",
    ".env.example",
    ".env.local"
)

$autoPaths = @(
    "src\app\api",
    "src\app\(auth)",
    "src\app\login",
    "src\app\register",
    "src\app\dashboard",
    "src\components",
    "src\lib",
    "src\store",
    "src\types",
    "prisma"
)

$filesToShow = [System.Collections.Generic.HashSet[string]]::new()

foreach ($f in $importantFiles) {
    $full = Join-Path $projectRoot $f
    if (Test-Path $full) {
        [void]$filesToShow.Add($full)
    }
}

foreach ($p in $autoPaths) {
    $full = Join-Path $projectRoot $p
    if (Test-Path $full) {
        Get-ChildItem -Path $full -Recurse -File |
            Where-Object { $_.Extension -match "\.(ts|tsx|js|jsx|prisma|json|env|md)$" } |
            Where-Object { $_.FullName -notmatch "node_modules|\.next" } |
            ForEach-Object { [void]$filesToShow.Add($_.FullName) }
    }
}

# --- 3. Tampilkan Isi File ---
$output += ""
$output += "============================================================"
$output += "### FILE CONTENTS ###"
$output += "============================================================"

foreach ($filePath in ($filesToShow | Sort-Object)) {
    $relativePath = $filePath.Replace($projectRoot.Path + "\", "")

    if ($relativePath -match "\.env\.local$") {
        $output += ""
        $output += "--- $relativePath ---"
        $output += "[SKIPPED - contains secrets, showing keys only]"
        Get-Content $filePath | ForEach-Object {
            if ($_ -match "^([A-Z_]+)=") {
                $output += "$($Matches[1])=***"
            }
        }
        continue
    }

    $output += ""
    $output += "--- $relativePath ---"

    try {
        $content = Get-Content $filePath -Raw -ErrorAction Stop
        if ($content.Length -gt 8000) {
            $output += $content.Substring(0, 8000)
            $output += "... [TRUNCATED]"
        } else {
            $output += $content
        }
    } catch {
        $output += "[ERROR reading file: $_]"
    }
}

$output += ""
$output += "============================================================"
$output += "END OF REPORT"
$output += "============================================================"

$result = $output -join "`n"
Write-Host $result

try {
    $result | Set-Clipboard
    Write-Host ""
    Write-Host "[OK] Berhasil disalin ke clipboard! Tinggal Ctrl+V di chat Claude." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "[!] Clipboard gagal, copy manual dari output di atas." -ForegroundColor Yellow
}