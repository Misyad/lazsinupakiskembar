# Deployment Guide - KOINNU Ranting System

## Production Environment

### System Requirements

- **Node.js:** v18.x or higher
- **PostgreSQL:** v14.x or higher
- **Memory:** Minimum 2GB RAM
- **Storage:** Minimum 10GB (for database + logs + backups)
- **OS:** Linux (Ubuntu 20.04+), Windows Server 2019+

### Required Environment Variables

Create `.env.production` file:

```bash
# Application
NODE_ENV=production
APP_URL=https://api.lazisnupakem.projecthasan.com
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Security
SESSION_SECRET=your-32-character-or-longer-secret-key-here

# Logging (optional)
LOG_DIR=/var/log/koinnu
LOG_LEVEL=info

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn-if-using

# Backup (optional)
BACKUP_DIR=/var/backups/koinnu
BACKUP_RETENTION_DAYS=30
```

## Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database created and accessible
- [ ] SESSION_SECRET is cryptographically random (32+ chars)
- [ ] DATABASE_URL uses strong password
- [ ] Backup directory configured
- [ ] Log directory writable
- [ ] HTTPS certificate configured
- [ ] Firewall rules configured

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE koinnu_production;
CREATE USER koinnu_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE koinnu_production TO koinnu_user;
```

### 2. Run Migrations

```bash
npm run prisma:generate
npm run db:migrate
```

### 3. Seed Initial Data

```bash
npm run db:seed
```

This creates:
- Default roles (SUPER_ADMIN, ADMIN_RANTING, PETUGAS, BENDAHARA)
- Permissions
- Initial admin user

## Application Deployment

### Using Docker (Recommended)

```bash
# Build image
docker build -t koinnu-ranting-system .

# Run container
docker-compose up -d
```

### Manual Deployment

```bash
# Install dependencies
npm ci --production

# Build application
npm run build

# Start application
npm start
```

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name koinnu -- start

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://api.lazisnupakem.projecthasan.com/api/health
```

Expected: `{"status":"healthy"}`

### 2. Test Authentication

```bash
curl -X POST https://api.lazisnupakem.projecthasan.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

### 3. Check Logs

```bash
tail -f logs/combined.log
tail -f logs/error.log
```

## Backup Configuration

### Automated Daily Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * cd /path/to/app && node scripts/backup/backup-db.mjs >> logs/backup.log 2>&1
```

### Manual Backup

```bash
node scripts/backup/backup-db.mjs
```

Backups saved to: `scripts/backup/backups/`

## Monitoring Setup

### Application Logs

- Location: `logs/` directory
- Rotation: Automatic (10MB per file)
- Retention: Configure via LOG_RETENTION_DAYS

### Health Monitoring

Configure monitoring service (Uptime Robot, Pingdom, etc.):
- URL: `/api/health`
- Interval: 5 minutes
- Expected: 200 OK

### Error Monitoring (Optional)

If using Sentry:
1. Set `SENTRY_DSN` in environment
2. Errors automatically sent to Sentry
3. Configure alerts in Sentry dashboard

## Security Hardening

### 1. Environment Variables

- Never commit `.env` files
- Use strong, random SESSION_SECRET
- Rotate secrets regularly

### 2. Database Security

- Use strong passwords
- Restrict database access by IP
- Enable SSL connections

### 3. Network Security

- Enable HTTPS only
- Configure firewall (allow 443, deny others)
- Use reverse proxy (Nginx, Cloudflare)

### 4. Application Security

- Rate limiting: Enabled (100 req/15min)
- Security headers: Enabled
- CSRF protection: Enabled for state-changing operations

## Rollback Procedure

### 1. Stop Application

```bash
pm2 stop koinnu
# or
docker-compose down
```

### 2. Restore Database

```bash
node scripts/backup/restore-db.mjs /path/to/backup.sql
```

### 3. Revert Code

```bash
git checkout previous-version-tag
npm ci
npm run build
```

### 4. Restart Application

```bash
pm2 start koinnu
# or
docker-compose up -d
```

## Troubleshooting

### Application won't start
- Check environment variables
- Verify database connection
- Review error logs: `logs/error.log`

### Database connection failed
- Verify DATABASE_URL format
- Check database is running
- Test connection: `psql $DATABASE_URL`

### High memory usage
- Check for memory leaks in logs
- Restart application: `pm2 restart koinnu`
- Consider increasing RAM

### Backup failed
- Check disk space
- Verify backup directory permissions
- Review backup logs

## Maintenance

### Regular Tasks
- Daily: Check error logs
- Weekly: Review backup success
- Monthly: Test restore procedure
- Quarterly: Update dependencies
- Yearly: Rotate SESSION_SECRET

### Updating Application

```bash
# Backup first
node scripts/backup/backup-db.mjs

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Run migrations
npm run db:migrate

# Rebuild
npm run build

# Restart
pm2 restart koinnu
```
