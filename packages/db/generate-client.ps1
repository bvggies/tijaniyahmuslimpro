# PowerShell script to generate Prisma client
# This script ensures we use Prisma 6.2.1

$env:DATABASE_URL = "postgresql://neondb_owner:npg_4kDyS5HlfdtI@ep-icy-wildflower-adir0b5e-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Write-Host "Generating Prisma client..." -ForegroundColor Cyan

# Try to use local prisma if it exists
if (Test-Path "node_modules\.bin\prisma.cmd") {
    Write-Host "Using local Prisma installation..." -ForegroundColor Green
    & node_modules\.bin\prisma.cmd generate
} elseif (Test-Path "node_modules\prisma") {
    Write-Host "Using Prisma from node_modules..." -ForegroundColor Green
    node node_modules\prisma\bin\prisma.js generate
} else {
    Write-Host "Using npx to run Prisma 6.2.1..." -ForegroundColor Yellow
    npx --yes prisma@6.2.1 generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to generate. Please run manually:" -ForegroundColor Red
        Write-Host "  npx --yes prisma@6.2.1 generate" -ForegroundColor Yellow
    }
}

