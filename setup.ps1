# Timeline Goal Follower - Complete Setup Script
# Run this script from the project root directory

Write-Host "🚀 Timeline Goal Follower - Complete Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion -match "v(\d+)") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -lt 18) {
        Write-Host "❌ Node.js 18+ required. Current: $nodeVersion" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
}

# Install root dependencies
Write-Host ""
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed" -ForegroundColor Green

# Backend setup
Write-Host ""
Write-Host "🔧 Setting up backend..." -ForegroundColor Yellow
Set-Location backend

# Install backend dependencies
Write-Host "  📦 Installing backend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Create .env if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "  📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "  ✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "  ✅ .env file already exists" -ForegroundColor Green
}

# Generate Prisma client
Write-Host "  🔨 Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  ✅ Prisma client generated" -ForegroundColor Green

# Run migrations
Write-Host "  🗄️  Running database migrations..." -ForegroundColor Yellow
npm run prisma:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  ✅ Database migrations completed" -ForegroundColor Green

# Seed database
Write-Host "  🌱 Seeding database with sample data..." -ForegroundColor Yellow
npm run prisma:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  ✅ Database seeded successfully" -ForegroundColor Green

Set-Location ..

# Frontend setup
Write-Host ""
Write-Host "🎨 Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

# Install frontend dependencies
Write-Host "  📦 Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Create .env if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "  📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "  ✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "  ✅ .env file already exists" -ForegroundColor Green
}

Set-Location ..

# Success message
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application, run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open your browser to:" -ForegroundColor Yellow
Write-Host "  http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo login credentials:" -ForegroundColor Yellow
Write-Host "  Email: prasham@example.com" -ForegroundColor Cyan
Write-Host "  Password: changeme" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy goal tracking! 🎯" -ForegroundColor Green
