#!/usr/bin/env node

/**
 * PostgreSQL Database Backup Script
 * 
 * Creates a backup of the KOINNU database using pg_dump
 * Requires pg_dump to be available in PATH or specified via PG_DUMP_PATH env var
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || join(__dirname, 'backups');
const DATABASE_URL = process.env.DATABASE_URL;
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);

// Parse DATABASE_URL to extract connection params
function parseDatabaseUrl(url) {
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format. Expected: postgresql://user:password@host:port/database');
  }
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5]
  };
}

// Create backup directory if it doesn't exist
function ensureBackupDir() {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }
}

// Generate backup filename with timestamp
function generateBackupFilename() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `koinnu-backup-${timestamp}.sql`;
}

// Run pg_dump to create backup
function createBackup(dbConfig, outputFile) {
  return new Promise((resolve, reject) => {
    const pgDumpPath = process.env.PG_DUMP_PATH || 'pg_dump';
    
    const args = [
      '-h', dbConfig.host,
      '-p', dbConfig.port,
      '-U', dbConfig.user,
      '-F', 'p', // plain text format
      '-f', outputFile,
      '--no-password',
      dbConfig.database
    ];
    
    const env = {
      ...process.env,
      PGPASSWORD: dbConfig.password
    };
    
    console.log(`Running pg_dump for database: ${dbConfig.database}`);
    console.log(`Output file: ${outputFile}`);
    
    const pgDump = spawn(pgDumpPath, args, { env });
    
    let stderr = '';
    
    pgDump.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pgDump.on('close', (code) => {
      if (code === 0) {
        console.log('✓ Backup completed successfully');
        resolve();
      } else {
        reject(new Error(`pg_dump failed with code ${code}:\n${stderr}`));
      }
    });
    
    pgDump.on('error', (err) => {
      reject(new Error(`Failed to start pg_dump: ${err.message}`));
    });
  });
}

// Main backup function
async function main() {
  try {
    console.log('=== KOINNU Database Backup ===');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // Parse database configuration
    const dbConfig = parseDatabaseUrl(DATABASE_URL);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`Host: ${dbConfig.host}`);
    
    // Ensure backup directory exists
    ensureBackupDir();
    
    // Generate backup filename
    const backupFilename = generateBackupFilename();
    const backupPath = join(BACKUP_DIR, backupFilename);
    
    // Create backup
    await createBackup(dbConfig, backupPath);
    
    console.log(`\n✓ Backup saved to: ${backupPath}`);
    console.log(`✓ Retention: ${RETENTION_DAYS} days`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Backup failed:', error.message);
    process.exit(1);
  }
}

main();
