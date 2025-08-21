#!/bin/bash

echo "🚀 Setting up Sybka Sync Service..."

# Check if we're in the right directory
if [ ! -f "composer.json" ]; then
    echo "❌ Error: Run this script from the sybka-sync directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Docker
if command_exists docker && command_exists docker-compose; then
    echo "🐳 Docker found - using Docker setup..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "📝 Creating .env file..."
        cat > .env << 'EOF'
APP_NAME="Sybka Sync Service"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=sybka_sync
DB_USERNAME=sybka
DB_PASSWORD=secret

# Sybka API Configuration
SYNKA_ACCESS_TOKEN=VlLeysd3nZNCMiqSxF0qWv6SHYMn7YXVl85kSMaEb0EkvbBNJVrKnP01odSD
SYNKA_API_URL=https://api.sybka.com/v1/
SYNKA_TEAM_ID=

# Optional: Fortnox webhook authentication
FORTNOX_WEBHOOK_SECRET=
EOF
    fi
    
    # Start Docker containers
    echo "🔄 Starting Docker containers..."
    docker-compose up -d
    
    # Wait for containers to be ready
    echo "⏳ Waiting for containers to start..."
    sleep 10
    
    # Install dependencies
    echo "📦 Installing Laravel dependencies..."
    docker-compose exec app composer install
    
    # Generate app key
    echo "🔑 Generating application key..."
    docker-compose exec app php artisan key:generate
    
    echo "✅ Docker setup complete!"
    echo "🌐 Service running at: http://localhost:8000"
    echo "🔍 Test connection: curl http://localhost:8000/api/sybka/test"
    
elif command_exists php && command_exists composer; then
    echo "🐘 PHP found - using local setup..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "📝 Creating .env file..."
        cat > .env << 'EOF'
APP_NAME="Sybka Sync Service"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# Sybka API Configuration
SYNKA_ACCESS_TOKEN=VlLeysd3nZNCMiqSxF0qWv6SHYMn7YXVl85kSMaEb0EkvbBNJVrKnP01odSD
SYNKA_API_URL=https://api.sybka.com/v1/
SYNKA_TEAM_ID=

# Optional: Fortnox webhook authentication
FORTNOX_WEBHOOK_SECRET=
EOF
    fi
    
    # Install dependencies
    echo "📦 Installing Laravel dependencies..."
    composer install
    
    # Generate app key
    echo "🔑 Generating application key..."
    php artisan key:generate
    
    # Create SQLite database
    mkdir -p database
    touch database/database.sqlite
    
    echo "✅ Local setup complete!"
    echo "🚀 Start server with: php artisan serve"
    echo "🔍 Test connection: curl http://localhost:8000/api/sybka/test"
    
else
    echo "❌ Error: Neither Docker nor PHP/Composer found"
    echo ""
    echo "Please install one of the following:"
    echo "1. Docker & Docker Compose: https://docs.docker.com/get-docker/"
    echo "2. PHP & Composer:"
    echo "   - macOS: brew install php composer"
    echo "   - Ubuntu: sudo apt install php composer"
    exit 1
fi

echo ""
echo "🎯 Quick test commands:"
echo "  curl http://localhost:8000/health"
echo "  curl http://localhost:8000/api/sybka/test"
echo "  curl http://localhost:8000/api/sybka/products"
echo ""
echo "📚 Check README.md for more information!" 