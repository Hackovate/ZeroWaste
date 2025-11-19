Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $originalContent = $content
    
    # Replace double quotes
    $content = $content -replace 'from "([^"]+)@\d+\.\d+\.\d+"', 'from "$1"'
    # Replace single quotes
    $content = $content -replace "from '([^']+)@\d+\.\d+\.\d+'", "from '$1'"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8
        Write-Host "Fixed $($_.FullName)"
    }
}
