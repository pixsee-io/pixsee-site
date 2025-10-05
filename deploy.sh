#!/bin/bash

# Pixsee Landing Page Deployment Script

echo "🚀 Setting up Pixsee Landing Page..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "📝 Please update .env.local with your MongoDB URI before running the application"
fi

# Build the application
echo "🔨 Building the application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your MongoDB connection string"
echo "2. Run 'npm run dev' for development or 'npm start' for production"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📖 See README.md for detailed instructions"
