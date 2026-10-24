# Quick-start script for FlowSphere Serverless Workflow Automation Platform
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting FlowSphere Serverless Platform (Phase 1 Frontend)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\frontend"

if (!(Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Launching Vite dev server..." -ForegroundColor Green
Start-Process "http://127.0.0.1:5174"
npm run dev -- --host 127.0.0.1 --port 5174
