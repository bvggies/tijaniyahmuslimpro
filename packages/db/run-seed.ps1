# PowerShell script to run database seed
# Make sure Prisma client is generated first!

$env:DATABASE_URL = "postgresql://neondb_owner:npg_4kDyS5HlfdtI@ep-icy-wildflower-adir0b5e-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Write-Host "Running database seed..." -ForegroundColor Cyan

# Check if Prisma client exists
if (-not (Test-Path "node_modules\@prisma\client")) {
    Write-Host "ERROR: Prisma client not found!" -ForegroundColor Red
    Write-Host "Please run generate-client.ps1 first, or:" -ForegroundColor Yellow
    Write-Host "  npx prisma@6.2.1 generate" -ForegroundColor Yellow
    exit 1
}

# Check if bcryptjs is installed
if (-not (Test-Path "node_modules\bcryptjs")) {
    Write-Host "Installing bcryptjs..." -ForegroundColor Yellow
    npm install bcryptjs --no-save --legacy-peer-deps
}

Write-Host "Executing seed script..." -ForegroundColor Green
node prisma/seed.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Seed completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Seed failed!" -ForegroundColor Red
    exit 1
}

