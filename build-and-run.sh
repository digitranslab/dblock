#!/bin/bash
set -e

echo "🚀 DBLock Docker Build & Run Script"
echo "===================================="
echo ""

# Stop any running containers
echo "🛑 Stopping any running containers..."
docker-compose -f docker-compose.monolithic.yml down 2>/dev/null || true

echo ""
echo "🏗️  Building Docker images..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Build main image (this takes the longest - 15-20 minutes)
echo "📦 Building digitranslab/dblock:latest (this will take several minutes)..."
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
echo "📋 Built images:"
docker images | grep dblock

echo ""
echo "🚀 Starting monolithic setup..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.monolithic.yml up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 15

echo ""
echo "📊 Container status:"
docker-compose -f docker-compose.monolithic.yml ps

echo ""
echo "🏥 Health check:"
curl -s http://localhost:7860/health || echo "⚠️  Health check failed - service may still be starting"

echo ""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
echo ""
echo "🌐 Application: http://localhost:7860"
echo "🗄️  PostgreSQL: localhost:5432"
echo ""
echo "📝 Useful commands:"
echo "   View logs:  docker-compose -f docker-compose.monolithic.yml logs -f"
echo "   Stop:       docker-compose -f docker-compose.monolithic.yml down"
echo "   Restart:    docker-compose -f docker-compose.monolithic.yml restart"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
