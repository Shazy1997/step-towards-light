# Production Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Node.js v20 or later
- Access to production environment
- SSL certificates

## 1. Security Setup

### 1.1 SSL/TLS Configuration
```bash
# Generate self-signed certificates (development only)
npm run ssl:generate

# For production:
# 1. Obtain SSL certificates from Let's Encrypt or your provider
# 2. Place certificates in config/nginx/certs/
#    - fullchain.pem
#    - privkey.pem
```

### 1.2 Nginx Configuration
```bash
# Validate Nginx configuration
npm run nginx:validate

# Start Nginx proxy
docker-compose -f docker-compose.proxy.yml up -d

# Reload Nginx after changes
npm run nginx:reload
```

### 1.3 Security Middleware
- CSRF protection enabled
- Rate limiting configured
- Protected routes secured
- Security headers implemented

## 2. Environment Setup

### 2.1 Environment Variables
```bash
# Create production environment file
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://your-domain.com
# Add other environment variables
EOF
```

### 2.2 Docker Configuration
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production containers
docker-compose -f docker-compose.prod.yml up -d
```

## 3. Monitoring Setup

### 3.1 Health Checks
- Endpoint: /health
- Container health monitoring
- Resource usage tracking
- Performance metrics

### 3.2 Logging
```bash
# View application logs
npm run docker:logs web

# Monitor container status
npm run docker:monitor
```

## 4. Backup Configuration

### 4.1 Automated Backups
```bash
# Configure backup schedule
# Edit crontab to add:
0 1 * * * cd /path/to/app && node config/reliability/backup.js

# Test backup system
node config/reliability/backup.js
```

### 4.2 Backup Verification
```bash
# List available backups
ls -l backups/

# Test restore procedure
# (in development environment first)
node scripts/test-restore.js
```

## 5. Production Checklist

### Security
- [ ] SSL certificates installed
- [ ] Nginx configuration validated
- [ ] Security headers configured
- [ ] Rate limiting tested
- [ ] CSRF protection verified
- [ ] Protected routes secured

### Monitoring
- [ ] Health checks responding
- [ ] Logs properly rotating
- [ ] Metrics being collected
- [ ] Alerts configured
- [ ] Dashboard accessible

### Backup
- [ ] Backup system tested
- [ ] Restore procedure verified
- [ ] Backup schedule configured
- [ ] Storage capacity confirmed

### Performance
- [ ] Load testing completed
- [ ] Response times acceptable
- [ ] Resource usage optimized
- [ ] Caching configured

## 6. Post-Deployment Verification

### 6.1 Security Checks
```bash
# Verify SSL configuration
curl -vI https://your-domain.com

# Check security headers
curl -I https://your-domain.com | grep -i "security"
```

### 6.2 Performance Testing
```bash
# Run load tests
npm run monitor:load

# Check application status
npm run docker:status web
```

### 6.3 Monitoring Verification
```bash
# Verify all monitoring systems
npm run update-all

# Check latest status
cat PROGRESS.md
```

## 7. Emergency Procedures

### 7.1 Rollback Process
```bash
# Revert to previous version
docker-compose -f docker-compose.prod.yml down
git checkout <previous-tag>
docker-compose -f docker-compose.prod.yml up -d
```

### 7.2 Backup Restoration
```bash
# Restore from backup
node config/reliability/backup.js restore <backup-id>
```

## 8. Maintenance

### 8.1 Regular Tasks
- Daily backup verification
- Weekly security updates
- Monthly performance review
- Quarterly disaster recovery test

### 8.2 Update Procedure
```bash
# Update production environment
git pull
npm install
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## 9. Documentation

### 9.1 Update Documentation
```bash
# Generate latest documentation
npm run update-all

# Review changes
git diff PROGRESS.md
```

### 9.2 Monitoring Dashboard
- Status: https://your-domain.com/status
- Metrics: https://your-domain.com/metrics
- Logs: https://your-domain.com/logs

## 10. Contact Information

### Emergency Contacts
- DevOps Team: devops@example.com
- Security Team: security@example.com
- On-Call Support: +1-XXX-XXX-XXXX

### Resources
- Documentation: /docs
- Runbooks: /runbooks
- Dashboards: /dashboards
