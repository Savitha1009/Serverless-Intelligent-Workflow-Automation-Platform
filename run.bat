@echo off
title FlowSphere Serverless Intelligent Workflow Platform
echo ==========================================================
echo Starting FlowSphere Serverless Platform (Phase 1 Frontend)
echo ==========================================================

cd /d "%~dp0frontend"

if not exist node_modules (
    echo Installing node dependencies...
    call npm install
)

echo Opening application in default browser...
start http://127.0.0.1:5174

echo Starting Vite development server...
call npm run dev -- --host 127.0.0.1 --port 5174
pause
