#!/usr/bin/env node

/**
 * PostgreSQL Database Restore Script
 * 
 * Restores the KOINNU database from a backup file using psql
 * Requires psql to be available in PATH or specified via PSQL_PATH env var
 * 
 * Usage: node restore-db.mjs <backup-file.sql>
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

// Parse DATABASE_URL to extract connection params
function parseDatabaseUrl(url) {
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5]
  };
}

// Run psql to restore backup
function restoreBackup(dbConfig, backupFile) {
  return new Promise((resolve, reject) => {
    const psqlPath = process.env.PSQL_PATH || 'psql';
    
    const args = [
      '-h', dbConfig.host,
      '-p', dbConfig.port,
      '-U', dbConfig.user,
      '-d', dbConfig.database,
      '-f', backupFile,
      '--no-password'
    ];
    
    const env = {
      ...process.env,
      PGPASSWORD: dbConfig.password
    };
    
    console.log(`Restoring database from: ${backupFile}`);
    
    const psql = spawn(psqlPath, args, { env });
    
    let stderr = '';
    
    psql.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    psql.on('close', (code) => {
      if (code === 0) {
        console.log('✓ Restore completed successfully');
        resolve();
      } else {
        reject(new Error(`psql failed with code ${code}:\n${stderr}`));
      }
    });
    
    psql.on('error', (err) => {
      reject(new Error(`Failed to start psql: ${err.message}`));
    });
  });
}

// Main restore function
async function main() {
  try {
    const backupFile = process.argv[2];
    
    if (!backupFile) {
      console.error('Usage: node restore-db.mjs <backup-file.sql>');
      process.exit(1);
    }
    
    const backupPath = resolve(backupFile);
    
    if (!existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    console.log('=== KOINNU Database Restore ===');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Backup file: ${backupPath}`);
    
    const dbConfig = parseDatabaseUrl(DATABASE_URL);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`Host: ${dbConfig.host}`);
    
    console.log('\n⚠️  WARNING: This will overwrite the current database!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await restoreBackup(dbConfig, backupPath);
    
    console.log('\n✓ Database restored successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Restore failed:', error.message);
    process.exit(1);
  }
}

main();
