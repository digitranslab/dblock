# 🚀 Kozmoai Fresh Build Guide

This guide will help you build and run Kozmoai from scratch using the Docker images pushed to DockerHub.

## Prerequisites

- Docker installed and running
- Docker Compose installed
- At least 4GB of free RAM
- Ports 7860 and 5432 available

## Quick Start

### Option 1: Automated Build (Recommended)

Run the automated build script:

```bash
./fresh-build.sh
```

This script will:
1. ✅ Stop and remove any existing containers
2. ✅ Clean up old images
3. ✅ Pull latest images from DockerHub
4. ✅ Create necessary directories
5. ✅ Start the application
6. ✅ Show startup logs

### Option 2: Manual Build

If you prefer to run commands manually:

```bash
# 1. Stop and remove existing containers
docker-compose -f docker-compose.monolithic.yml down -v

# 2. Pull latest images
docker pull digitranslab/dblock:latest
docker pull postgres:16

# 3. Start the application
docker-compose -f docker-compose.monolithic.yml up -d

# 4. View logs
docker-compose -f docker-compose.monolithic.yml logs -f
```

## Accessing the Application

Once the build is complete, access Kozmoai at:

**🌐 http://localhost:7860**

## Verifying the Build

### Check Container Status

```bash
docker-compose -f docker-compose.monolithic.yml ps
```

You should see:
- `kozmoai-dblock-1` - Running on port 7860
- `kozmoai-postgres-1` - Running on port 5432

### Check Logs

```bash
# View all logs
docker-compose -f docker-compose.monolithic.yml logs

# Follow logs in real-time
docker-compose -f docker-compose.monolithic.yml logs -f

# View specific service logs
docker-compose -f docker-compose.monolithic.yml logs dblock
docker-compose -f docker-compose.monolithic.yml logs postgres
```

### Test the Application

1. Open http://localhost:7860 in your browser
2. You should see the Kozmoai interface
3. Try creating a new flow
4. Test the documentation panel by clicking the Docs button on any component

## Managing the Application

### Stop the Application

```bash
docker-compose -f docker-compose.monolithic.yml stop
```

### Start the Application

```bash
docker-compose -f docker-compose.monolithic.yml start
```

### Restart the Application

```bash
docker-compose -f docker-compose.monolithic.yml restart
```

### View Container Status

```bash
docker-compose -f docker-compose.monolithic.yml ps
```

### Remove Everything (Clean Slate)

```bash
# Remove containers and volumes
docker-compose -f docker-compose.monolithic.yml down -v

# Remove images (optional)
docker rmi digitranslab/dblock:latest
docker rmi postgres:16
```

## Architecture

The application consists of two services:

### 1. dblock (Main Application)
- **Image**: `digitranslab/dblock:latest`
- **Port**: 7860
- **Contains**: Frontend + Backend + All components
- **Data**: Stored in `dblock-data` volume

### 2. postgres (Database)
- **Image**: `postgres:16`
- **Port**: 5432
- **Database**: kozmoai
- **User**: kozmoai
- **Password**: kozmoai
- **Data**: Stored in `dblock-postgres` volume

## Environment Variables

The application uses the following environment variables (configured in docker-compose.monolithic.yml):

```yaml
KOZMOAI_DATABASE_URL: postgresql://kozmoai:kozmoai@postgres:5432/kozmoai
KOZMOAI_CONFIG_DIR: /app/data
KOZMOAI_HOST: 0.0.0.0
KOZMOAI_PORT: 7860
```

### Customizing Environment Variables

To customize, create a `.env` file:

```bash
# .env
KOZMOAI_DATABASE_URL=postgresql://kozmoai:kozmoai@postgres:5432/kozmoai
KOZMOAI_CONFIG_DIR=/app/data
KOZMOAI_HOST=0.0.0.0
KOZMOAI_PORT=7860

# Optional: Add your API keys
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
```

## Data Persistence

Data is persisted in Docker volumes:

- **dblock-data**: Application data, flows, and configurations
- **dblock-postgres**: PostgreSQL database

### Backup Data

```bash
# Backup application data
docker run --rm -v kozmoai_dblock-data:/data -v $(pwd):/backup alpine tar czf /backup/dblock-data-backup.tar.gz -C /data .

# Backup database
docker exec kozmoai-postgres-1 pg_dump -U kozmoai kozmoai > kozmoai-db-backup.sql
```

### Restore Data

```bash
# Restore application data
docker run --rm -v kozmoai_dblock-data:/data -v $(pwd):/backup alpine tar xzf /backup/dblock-data-backup.tar.gz -C /data

# Restore database
cat kozmoai-db-backup.sql | docker exec -i kozmoai-postgres-1 psql -U kozmoai kozmoai
```

## Troubleshooting

### Port Already in Use

If port 7860 or 5432 is already in use:

1. Check what's using the port:
   ```bash
   lsof -i :7860
   lsof -i :5432
   ```

2. Stop the conflicting service or change the port in `docker-compose.monolithic.yml`

### Container Won't Start

1. Check logs:
   ```bash
   docker-compose -f docker-compose.monolithic.yml logs
   ```

2. Verify Docker is running:
   ```bash
   docker ps
   ```

3. Check disk space:
   ```bash
   df -h
   ```

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   docker-compose -f docker-compose.monolithic.yml ps postgres
   ```

2. Check database logs:
   ```bash
   docker-compose -f docker-compose.monolithic.yml logs postgres
   ```

3. Test database connection:
   ```bash
   docker exec -it kozmoai-postgres-1 psql -U kozmoai -d kozmoai
   ```

### Application Not Responding

1. Restart the application:
   ```bash
   docker-compose -f docker-compose.monolithic.yml restart
   ```

2. Check resource usage:
   ```bash
   docker stats
   ```

3. If needed, rebuild from scratch:
   ```bash
   ./fresh-build.sh
   ```

## Performance Optimization

### Increase Memory Limit

Edit `docker-compose.monolithic.yml` and add:

```yaml
services:
  dblock:
    # ... existing config ...
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

### Use SSD for Volumes

Ensure Docker is configured to use SSD storage for better performance.

## Security Considerations

### Production Deployment

For production, update the following:

1. **Change default passwords**:
   ```yaml
   environment:
     POSTGRES_PASSWORD: your-secure-password
     KOZMOAI_DATABASE_URL: postgresql://kozmoai:your-secure-password@postgres:5432/kozmoai
   ```

2. **Use environment variables for secrets**:
   ```yaml
   environment:
     POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
   ```

3. **Enable SSL/TLS** for database connections

4. **Use a reverse proxy** (nginx, traefik) for HTTPS

5. **Implement authentication** and access controls

## Updating to Latest Version

To update to the latest version:

```bash
# Pull latest images
docker pull digitranslab/dblock:latest

# Restart with new image
docker-compose -f docker-compose.monolithic.yml up -d
```

Or simply run:

```bash
./fresh-build.sh
```

## Additional Resources

- **Documentation**: Check the enriched component documentation in the app
- **GitHub**: https://github.com/digitranslab/kozmoai
- **Docker Hub**: https://hub.docker.com/r/digitranslab/dblock

## Support

If you encounter issues:

1. Check the logs: `docker-compose -f docker-compose.monolithic.yml logs`
2. Verify all prerequisites are met
3. Try a fresh build: `./fresh-build.sh`
4. Check GitHub issues for similar problems

---

**Status**: ✅ Ready for Production  
**Last Updated**: December 11, 2025  
**Version**: Latest from DockerHub

🎉 **Enjoy using Kozmoai!**
