$docs = Invoke-RestMethod -Uri "http://localhost:8080/v3/api-docs" -Method Get
$list = @()

foreach ($prop in $docs.paths.PSObject.Properties) {
    $p = $prop.Name
    $methods = $prop.Value.PSObject.Properties
    foreach ($m in $methods) {
        $methodName = $m.Name.ToUpper()
        $details = $m.Value
        $list += [PSCustomObject]@{
            Method = $methodName
            Path = $p
            Summary = $details.summary
            Tags = ($details.tags -join ', ')
        }
    }
}

$list | Sort-Object Path, Method | Format-Table -AutoSize | Out-String -Width 200 | Out-File -FilePath "C:\Users\Prathach Raj P\.gemini\antigravity\scratch\extreme-weather-response-system\endpoints.txt"
Write-Host "Total endpoints found: $($list.Count)"
