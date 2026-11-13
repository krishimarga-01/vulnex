@echo off
setlocal
echo ==============================================================================
echo Running Test Suite
echo ==============================================================================

set "PROJECT_DIR=%~dp0"
set "JAVA_HOME=%PROJECT_DIR%..\tools\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PROJECT_DIR%..\tools\apache-maven-3.9.6\bin;%PATH%"

mvn clean test
pause
