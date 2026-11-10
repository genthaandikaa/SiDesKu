@echo off
echo ===================================================
echo Menjalankan Backend Laravel dan Frontend Vite Nexora
echo ===================================================

start "Backend Laravel (Port 8000)" cmd /k "cd backend && php artisan serve --port=8000"
start "Frontend Vite (Port 5173)" cmd /k "cd frontend && npm run dev -- --host --port 5173"

echo.
echo Server backend berjalan di:  http://127.0.0.1:8000
echo Server frontend berjalan di: http://localhost:5173
echo.
pause

