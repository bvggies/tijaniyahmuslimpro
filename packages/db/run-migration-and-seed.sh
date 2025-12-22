#!/bin/bash
# Bash script to run Prisma migration and seed
# Run this from the packages/db directory

echo "🔄 Running Prisma Migration and Seed..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Please set it first:"
    echo 'export DATABASE_URL="your-database-url"'
    exit 1
fi

# Step 1: Generate Prisma Client
echo ""
echo "📦 Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

# Step 2: Create and apply migration
echo ""
echo "🚀 Creating and applying migration..."
npx prisma migrate dev --name add_journal_enhancements
if [ $? -ne 0 ]; then
    echo "❌ Migration failed"
    exit 1
fi

# Step 3: Seed the database
echo ""
echo "🌱 Seeding database..."
npx tsx prisma/seed.ts
if [ $? -ne 0 ]; then
    echo "❌ Seeding failed"
    exit 1
fi

echo ""
echo "✅ Migration and seeding completed successfully!"

