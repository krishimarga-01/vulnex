```bat
@echo off
setlocal

echo ==============================================================================
echo Launching Java 21 + Spring Boot 3.3.5 Backend
echo ==============================================================================

set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
set "MAVEN_HOME=%USERPROFILE%\Downloads\apache-maven-3.9.11"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

echo Java version:
java -version

echo.
echo Starting Spring Boot...

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%backend"

call mvn spring-boot:run

pause
