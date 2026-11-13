@echo off
setlocal
echo ==============================================================================
echo Extreme Weather Vulnerability Identification and Emergency Response System
echo ==============================================================================

set "PROJECT_DIR=%~dp0"
set "JAVA_HOME=%PROJECT_DIR%..\tools\jdk-21"
if not exist "%JAVA_HOME%\bin\java.exe" (
    set "JAVA_HOME=%JAVA_HOME%"
)
set "PATH=%JAVA_HOME%\bin;%PROJECT_DIR%..\tools\apache-maven-3.9.6\bin;%PATH%"

echo Using Java:
java -version

echo.
echo Launching Spring Boot Application...
mvn spring-boot:run
pause
