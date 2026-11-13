$baseUrl = "http://localhost:8080"
$authBody = @{ username = "officer_raj"; password = "Password@123" } | ConvertTo-Json
$authResp = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $authBody -ContentType "application/json"
$token = $authResp.data.token

Write-Host "--- WEATHER OBSERVATION ---"
$weather = Invoke-RestMethod -Uri "$baseUrl/api/v1/weather/observations/region/1" -Method Get -Headers @{ Authorization = "Bearer $token" }
$weather | ConvertTo-Json -Depth 5

Write-Host "--- DASHBOARD SUMMARY ---"
$dash = Invoke-RestMethod -Uri "$baseUrl/api/v1/authority/dashboard/summary" -Method Get -Headers @{ Authorization = "Bearer $token" }
$dash | ConvertTo-Json -Depth 5

Write-Host "--- RISK SUMMARY ---"
$riskSum = Invoke-RestMethod -Uri "$baseUrl/api/v1/geography/risk-summary" -Method Get -Headers @{ Authorization = "Bearer $token" }
$riskSum | ConvertTo-Json -Depth 5

Write-Host "--- RISK ASSESS 4 ---"
$riskAssess = Invoke-RestMethod -Uri "$baseUrl/api/v1/risk/assess/4" -Method Post -Headers @{ Authorization = "Bearer $token" }
$riskAssess | ConvertTo-Json -Depth 5
