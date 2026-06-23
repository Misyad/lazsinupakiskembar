# Database Backup & Restore - KOINNU Ranting System

## Overview

Backup dan restore system untuk PostgreSQL database menggunakan `pg_dump` dan `psql`.

## Prerequisites

### Required Tools

1. **PostgreSQL Client Tools** (pg_dump & psql)
   - Windows: Install dari [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
   - Linux: `sudo apt-get install postgresql-client`
   - macOS: `brew install postgresql`

2. **Node.js** (sudah terinstall di project)

3. **Environment Variables**
   - `DATABASE_URL` - Connection string ke database
   - `BACKUP_DIR` (optional) - Custom backup directory
   - `BACKUP_RETENTION_DAYS` (optional) - Retention policy (default: 30 days)
   - `PG_DUMP_PATH` (optional) - Custom path ke pg_dump
   - `PSQL_PATH` (optional) - Custom path ke psql

## Configuration

### Database URL Format

```
postgresql://username:password@host:port/database
```

Example:
```
postgresql://postgres:mypassword@db.project.supabase.co:5432/postgres
```

### Environment Setup

Create `.env` file or set environment variables:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
```

## Usage

### Manual Backup

Run backup script:

```bash
node scripts/backup/backup-db.mjs
```

Output:
```
=== KOINNU Database Backup ===
Timestamp: 2026-06-23T10:00:00.000Z
Database: koinnu_db
Host: db.example.supabase.co
Created backup directory: ./scripts/backup/backups
Running pg_dump for database: koinnu_db
✓ Backup completed successfully
✓ Backup saved to: ./scripts/backup/backups/koinnu-backup-2026-06-23T10-00-00.sql
✓ Retention: 30 days
```

### Restore from Backup

Run restore script with backup file:

```bash
node scripts/backup/restore-db.mjs ./backups/koinnu-backup-2026-06-23T10-00-00.sql
```

**⚠️ WARNING:** Restore akan **overwrite** database yang ada!

Output:
```
=== KOINNU Database Restore ===
Timestamp: 2026-06-23T11:00:00.000Z
Backup file: /path/to/backup.sql
Database: koinnu_db
Host: db.example.supabase.co

⚠️  WARNING: This will overwrite the current database!
Press Ctrl+C to cancel, or wait 5 seconds to continue...

Restoring database from: /path/to/backup.sql
✓ Restore completed successfully
✓ Database restored successfully
```

## Automated Backups

### Using Cron (Linux/macOS)

Edit crontab:
```bash
crontab -e
```

Add daily backup at 2 AM:
```cron
0 2 * * * cd /path/to/project && node scripts/backup/backup-db.mjs >> logs/backup.log 2>&1
```

### Using Task Scheduler (Windows)

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 2:00 AM
4. Action: Start a program
   - Program: `node`
   - Arguments: `scripts/backup/backup-db.mjs`
   - Start in: Project directory path

### Using npm script

Add to `package.json`:
```json
{
  "scripts": {
    "backup": "node scripts/backup/backup-db.mjs",
    "restore": "node scripts/backup/restore-db.mjs"
  }
}
```

Run:
```bash
npm run backup
npm run restore -- ./backups/backup-file.sql
```

## Backup Storage

### Local Storage
- Default: `scripts/backup/backups/`
- Customize via `BACKUP_DIR` environment variable

### Remote Storage (Recommended for Production)
- Upload backups to cloud storage (S3, Google Cloud Storage, Azure Blob)
- Use separate script or service for upload
- Keep local backups for quick restore

### Retention Policy
- Default: 30 days
- Customize via `BACKUP_RETENTION_DAYS`
- Implement cleanup script to delete old backups

## Security Considerations

1. **Credentials**
   - Never commit backup files with sensitive data
   - Store `DATABASE_URL` in secure environment variables
   - Use `.gitignore` to exclude backup files

2. **Access Control**
   - Restrict backup directory permissions (chmod 700)
   - Limit database user permissions to necessary operations

3. **Encryption**
   - Consider encrypting backup files at rest
   - Use encrypted storage for remote backups

## Troubleshooting

### pg_dump not found
```
Error: Failed to start pg_dump
```
**Solution:** Install PostgreSQL client tools or set `PG_DUMP_PATH` environment variable

### Connection refused
```
Error: pg_dump failed with code 1
```
**Solution:** 
- Check `DATABASE_URL` is correct
- Verify database server is accessible
- Check firewall/network settings

### Permission denied
```
Error: EACCES: permission denied
```
**Solution:**
- Check backup directory permissions
- Ensure write access to backup directory
- Run with appropriate user permissions

### Authentication failed
```
Error: password authentication failed
```
**Solution:**
- Verify username and password in `DATABASE_URL`
- Check database user has backup/restore permissions

## Backup File Format

Backup files are plain-text SQL format containing:
- Schema definitions (CREATE TABLE, etc.)
- Data (INSERT statements)
- Indexes and constraints
- No binary data or BLOB content

## Testing Restore

**Important:** Always test restore procedure in non-production environment first!

1. Create test database
2. Restore backup to test database
3. Verify data integrity
4. Test application functionality

## Maintenance

### Regular Tasks
- ✅ Run backups daily
- ✅ Test restore monthly
- ✅ Clean up old backups (>30 days)
- ✅ Monitor backup success/failure
- ✅ Verify backup file size and completeness

### Monitoring
- Check backup logs regularly
- Set up alerts for backup failures
- Monitor backup file sizes
- Track backup duration
