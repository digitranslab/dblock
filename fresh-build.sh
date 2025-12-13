#!/bin/bash

# Fresh Build Script for Kozmoai
# This script builds the Kozmoai application from scratch using Docker images from DockerHub

set -e  # Exit on error

echo "=========================================="
echo "🚀 Kozmoai Fresh Build Script"
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

# Step 1: Stop and remove existing containers
print_status "Step 1: Stopping and removing existing containers..."
docker-compose -f docker-compose.monolithic.yml down -v 2>/dev/null || true
print_success "Existing containers stopped and removed"
echo ""

# Step 2: Remove old images (optional - uncomment if you want to force pull new images)
print_status "Step 2: Cleaning up old images..."
docker rmi digitranslab/dblock:latest 2>/dev/null || print_warning "No old dblock image to remove"
docker rmi postgres:16 2>/dev/null || print_warning "No old postgres image to remove"
print_success "Old images cleaned up"
echo ""

# Step 3: Pull latest images from DockerHub
print_status "Step 3: Pulling latest images from DockerHub..."
print_status "Pulling digitranslab/dblock:latest..."
docker pull digitranslab/dblock:latest
print_status "Pulling postgres:16..."
docker pull postgres:16
print_success "Latest images pulled successfully"
echo ""

# Step 4: Create necessary directories
print_status "Step 4: Creating necessary directories..."
mkdir -p data logs
print_success "Directories created"
echo ""

# Step 5: Start the application
print_status "Step 5: Starting Kozmoai application..."
docker-compose -f docker-compose.monolithic.yml up -d
print_success "Application started"
echo ""

# Step 6: Wait for services to be ready
print_status "Step 6: Waiting for services to be ready..."
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Check if containers are running
if docker-compose -f docker-compose.monolithic.yml ps | grep -q "Up"; then
    print_success "Containers are running"
else
    print_error "Containers failed to start"
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

# Follow logs for 10 seconds to show startup
timeout 10 docker-compose -f docker-compose.monolithic.yml logs -f || true

echo ""
echo "=========================================="
echo "✅ Build Complete!"
echo "=========================================="
echo ""
echo "🌐 Application is running at: http://localhost:7860"
echo "🗄️  PostgreSQL is running at: localhost:5432"
echo ""
echo "📝 Useful commands:"
echo "  - View logs:        docker-compose -f docker-compose.monolithic.yml logs -f"
echo "  - Stop app:         docker-compose -f docker-compose.monolithic.yml stop"
echo "  - Restart app:      docker-compose -f docker-compose.monolithic.yml restart"
echo "  - Remove all:       docker-compose -f docker-compose.monolithic.yml down -v"
echo "  - Check status:     docker-compose -f docker-compose.monolithic.yml ps"
echo ""
echo "🎉 Kozmoai is ready to use!"
echo "=========================================="
