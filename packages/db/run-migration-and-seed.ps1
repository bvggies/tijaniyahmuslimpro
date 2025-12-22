# PowerShell script to run Prisma migration and seed
# Run this from the packages/db directory

Write-Host "🔄 Running Prisma Migration and Seed..." -ForegroundColor Cyan

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "⚠️  DATABASE_URL not set. Please set it first:" -ForegroundColor Yellow
    Write-Host '$env:DATABASE_URL="your-database-url"' -ForegroundColor Yellow
    exit 1
}

# Step 1: Generate Prisma Client
Write-Host "`n📦 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

# Step 2: Create and apply migration
Write-Host "`n🚀 Creating and applying migration..." -ForegroundColor Cyan
npx prisma migrate dev --name add_journal_enhancements
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    exit 1
}

# Step 3: Seed the database
Write-Host "`n🌱 Seeding database..." -ForegroundColor Cyan
npx tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Seeding failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Migration and seeding completed successfully!" -ForegroundColor Green

