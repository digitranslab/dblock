#!/bin/bash

# Local Build Script for Kozmoai
# This script builds the application from local source code WITHOUT pushing to DockerHub/PyPI
# Use this for testing local code changes

set -e  # Exit on error

echo "=========================================="
echo "🔨 Kozmoai Local Build Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse arguments
CLEAN_DB=false
NO_CACHE=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --clean-db) CLEAN_DB=true ;;
        --no-cache) NO_CACHE=true ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --clean-db    Remove PostgreSQL volume (fresh database)"
            echo "  --no-cache    Build Docker image without cache"
            echo "  -h, --help    Show this help message"
            exit 0
            ;;
        *) print_error "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Step 1: Stop existing containers
print_status "Step 1: Stopping existing containers..."
docker-compose -f docker-compose.build-local.yml down 2>/dev/null || true
print_success "Existing containers stopped"
echo ""

# Step 2: Optionally clean database
if [ "$CLEAN_DB" = true ]; then
    print_status "Step 2: Removing PostgreSQL volume (fresh database)..."
    docker volume rm kozmoai_dblock-postgres 2>/dev/null || print_warning "No postgres volume to remove"
    print_success "Database volume removed"
else
    print_status "Step 2: Keeping existing database (use --clean-db to reset)"
fi
echo ""

# Step 3: Remove old local image
print_status "Step 3: Removing old local image..."
docker rmi kozmoai-local:latest 2>/dev/null || print_warning "No old local image to remove"
print_success "Old image removed"
echo ""

# Step 4: Build from local source
print_status "Step 4: Building from local source code..."
print_status "This may take several minutes on first build..."
echo ""

BUILD_ARGS=""
if [ "$NO_CACHE" = true ]; then
    BUILD_ARGS="--no-cache"
fi

docker-compose -f docker-compose.build-local.yml build $BUILD_ARGS
print_success "Build completed successfully"
echo ""

# Step 5: Start the application
print_status "Step 5: Starting Kozmoai application..."
docker-compose -f docker-compose.build-local.yml up -d
print_success "Application started"
echo ""

# Step 6: Wait for services to be ready
print_status "Step 6: Waiting for services to be ready..."
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Check if containers are running
if docker-compose -f docker-compose.build-local.yml ps | grep -q "Up"; then
    print_success "Containers are running"
else
    print_error "Containers failed to start"
    docker-compose -f docker-compose.build-local.yml logs
    exit 1
fi
echo ""

# Step 7: Show logs
print_status "Step 7: Showing application logs (Ctrl+C to exit)..."
echo ""
echo "=========================================="
echo "📊 Application Logs"
echo "=========================================="
echo ""

# Follow logs for 15 seconds to show startup
timeout 15 docker-compose -f docker-compose.build-local.yml logs -f dblock || true

echo ""
echo "=========================================="
echo "✅ Local Build Complete!"
echo "=========================================="
echo ""
echo "🌐 Application is running at: http://localhost:7860"
echo "🗄️  PostgreSQL is running at: localhost:5432"
echo ""
echo "📝 Useful commands:"
echo "  - View logs:        docker-compose -f docker-compose.build-local.yml logs -f"
echo "  - Stop app:         docker-compose -f docker-compose.build-local.yml stop"
echo "  - Restart app:      docker-compose -f docker-compose.build-local.yml restart"
echo "  - Remove all:       docker-compose -f docker-compose.build-local.yml down -v"
echo "  - Check status:     docker-compose -f docker-compose.build-local.yml ps"
echo "  - Rebuild:          $0 --no-cache"
echo "  - Fresh start:      $0 --clean-db --no-cache"
echo ""
echo "🎉 Kozmoai is ready to use!"
echo "=========================================="
