@echo off
echo ============================================
echo   SnapBooth - Starting Local Server
echo ============================================
echo.

REM Try Python first
where python >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Starting Python server on http://localhost:8080
    echo Open your browser to: http://localhost:8080
    echo Press Ctrl+C to stop.
    echo.
    start http://localhost:8080
    python -m http.server 8080
    goto :end
)

REM Try Python3
where python3 >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Starting Python3 server on http://localhost:8080
    start http://localhost:8080
    python3 -m http.server 8080
    goto :end
)

REM Try Node.js npx serve
where npx >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Starting Node server on http://localhost:3000
    start http://localhost:3000
    npx serve -l 3000
    goto :end
)

REM Fallback: just open the file directly
echo No server found. Opening file directly in browser...
echo (Note: Camera won't work without a server)
echo.
start index.html
goto :end

:end
pause
