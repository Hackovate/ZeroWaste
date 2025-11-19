$files = @(
    'src\components\Inventory.tsx',
    'src\components\Onboarding.tsx',
    'src\components\Profile.tsx',
    'src\components\Login.tsx',
    'src\components\AppSidebar.tsx',
    'src\components\TopBar.tsx',
    'src\components\ui\checkbox.tsx'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..."
        $content = Get-Content $file -Raw
        $content = $content -replace 'text-\[var\(--color-700\)\]', 'text-(--color-700)'
        $content = $content -replace 'text-\[var\(--color-300\)\]', 'text-(--color-300)'
        $content = $content -replace 'bg-\[var\(--color-700\)\]', 'bg-(--color-700)'
        $content = $content -replace 'bg-\[var\(--color-300\)\]', 'bg-(--color-300)'
        $content = $content -replace 'bg-\[var\(--color-primary\)\]', 'bg-(--color-primary)'
        $content = $content -replace 'text-\[var\(--color-primary\)\]', 'text-(--color-primary)'
        $content = $content -replace 'border-\[var\(--color-300\)\]', 'border-(--color-300)'
        $content = $content -replace 'border-\[var\(--color-primary\)\]', 'border-(--color-primary)'
        $content = $content -replace 'hover:bg-\[var\(--color-300\)\]', 'hover:bg-(--color-300)'
        $content = $content -replace 'hover:text-\[var\(--color-primary\)\]', 'hover:text-(--color-primary)'
        $content = $content -replace 'hover:border-\[var\(--color-primary\)\]', 'hover:border-(--color-primary)'
        $content = $content -replace 'bg-gradient-to-br', 'bg-linear-to-br'
        $content = $content -replace 'flex-shrink-0', 'shrink-0'
        Set-Content $file $content -NoNewline
        Write-Host "Done with $file"
    }
}

Write-Host "All files processed successfully!"
