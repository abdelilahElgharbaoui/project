# Hospital Management System - Deployment Guide

This guide provides comprehensive instructions for deploying the Hospital Management System in various environments.

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker and Docker Compose installed
- Git

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd project
```

### 2. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your production values
nano .env
```

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NEXT_PUBLIC_API_URL`: Frontend API URL
- `CORS_ORIGIN`: Allowed CORS origins

### 3. Deploy with Docker
```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows PowerShell
.\deploy.ps1
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🌐 Production Deployment

### Option 1: Cloud Platforms

#### Heroku
1. Create Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy using Heroku CLI

#### Railway
1. Connect GitHub repository
2. Add PostgreSQL service
3. Configure environment variables
4. Deploy automatically

#### Render
1. Create new Web Service
2. Connect repository
3. Add PostgreSQL database
4. Set build command: `npm run build`
5. Set start command: `npm start`

### Option 2: VPS/Server

#### Using Docker (Recommended)
```bash
# On your server
git clone <your-repo>
cd project
cp env.example .env
# Edit .env with production values
docker-compose up -d
```

#### Manual Deployment
```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
npm install
npm run build
npm start
```

## 🔧 Environment Configuration

### Production Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Security
JWT_SECRET=your-very-secure-jwt-secret-key
CORS_ORIGIN=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=combined
```

### Security Checklist
- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up database with strong password
- [ ] Enable rate limiting
- [ ] Configure logging
- [ ] Set up monitoring

## 📊 Monitoring and Health Checks

### Health Endpoints
- `GET /health` - Basic health check
- `GET /api/dashboard/stats` - System statistics

### Logging
The application uses Morgan for HTTP logging and console logging for errors.

### Monitoring Tools
- Application Insights (Azure)
- New Relic
- DataDog
- Custom monitoring with health checks

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          # Your deployment commands
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check database connectivity
docker-compose exec backend node scripts/test-db.js
```

#### Port Conflicts
```bash
# Check what's using the port
lsof -i :5000
lsof -i :3000
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a
docker volume prune
```

#### Environment Variables
```bash
# Verify environment variables
docker-compose exec backend env | grep -E "(DATABASE|JWT|CORS)"
```

### Logs
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📝 Maintenance

### Database Backups
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres hospital_management > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres hospital_management < backup.sql
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

### Scaling
```bash
# Scale backend services
docker-compose up -d --scale backend=3
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use strong passwords and SSL connections
3. **JWT**: Use long, random secrets
4. **CORS**: Restrict to specific domains
5. **Rate Limiting**: Enable and configure appropriately
6. **HTTPS**: Always use in production
7. **Updates**: Keep dependencies updated
8. **Monitoring**: Set up alerts for errors

## 📞 Support

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Test database connectivity
4. Check network connectivity
5. Review security configuration

## 🎯 Performance Optimization

### Frontend
- Enable Next.js optimizations
- Use CDN for static assets
- Implement caching strategies

### Backend
- Database connection pooling
- Query optimization
- Caching with Redis (optional)
- Load balancing for multiple instances

### Database
- Index optimization
- Query performance monitoring
- Regular maintenance 