#!/bin/bash
set -e

echo "🚀 DBLock Docker Build & Run Script"
echo "===================================="
echo ""

# Stop any running containers
echo "🛑 Stopping any running containers..."
docker-compose -f docker-compose.monolithic.yml down 2>/dev/null || true

# Build main image (uses cache for speed)
echo "📦 Building digitranslab/dblock:latest..."
docker build -f docker/build_and_push.Dockerfile -t digitranslab/dblock:latest . --platform linux/amd64

echo ""
echo "📦 Building digitranslab/dblock-backend:latest..."
docker build -f docker/build_and_push_backend.Dockerfile --build-arg DBLOCK_IMAGE=digitranslab/dblock:latest -t digitranslab/dblock-backend:latest . --platform linux/amd64

echo ""
echo "📦 Building digitranslab/dblock-frontend:latest..."
docker build -f docker/frontend/build_and_push_frontend.Dockerfile -t digitranslab/dblock-frontend:latest . --platform linux/amd64

echo ""
echo "✅ All images built successfully!"
echo ""
docker images | grep dblock

echo ""
echo "🚀 Starting services..."
docker-compose -f docker-compose.monolithic.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 15

echo ""
echo "🔍 Checking health..."
curl -s http://localhost:7860/health

echo ""
echo ""
echo "✅ DBLock is running!"
echo "   Backend: http://localhost:7860"
echo "   Health: http://localhost:7860/health"
echo ""
echo "📊 Container status:"
docker-compose -f docker-compose.monolithic.yml ps

echo ""
echo "To view logs: docker-compose -f docker-compose.monolithic.yml logs -f"
echo "To stop: docker-compose -f docker-compose.monolithic.yml down"
