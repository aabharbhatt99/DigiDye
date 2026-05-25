@echo off
echo Starting DyeMix Frontend...
cd /d "%~dp0frontend"
call npm install
echo.
echo Frontend starting at http://localhost:4200
echo.
call npx ng serve --open
