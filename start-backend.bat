@echo off
echo Starting DyeMix Backend...
cd /d "%~dp0backend"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt -q
echo.
echo Backend starting at http://localhost:5000
echo Demo credentials: demo@dyemix.com / demo123
echo.
python run.py
