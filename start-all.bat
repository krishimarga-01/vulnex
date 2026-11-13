@echo off
echo ==============================================================================
echo Extreme Weather Vulnerability Identification and Emergency Response System
echo Launching Complete Integrated Stack: Backend + Authority Dashboard + Mobile
echo ==============================================================================

start "Java Backend (Spring Boot 3.3.5 / Java 21)" cmd /c "%~dp0run-backend.cmd"
timeout /t 5 /nobreak >nul
start "Authority Dashboard (React 18 / Vite)" cmd /c "%~dp0run-dashboard.cmd"
timeout /t 2 /nobreak >nul
start "Mobile Application (Expo SDK 51)" cmd /c "%~dp0run-mobile.cmd"

echo.
echo All modules launched in separate console windows:
echo - Backend API & Swagger: http://localhost:8080/swagger-ui.html
echo - Authority Dashboard:   http://localhost:5173
echo - Mobile Metro Bundler:  http://localhost:8081
echo ==============================================================================
