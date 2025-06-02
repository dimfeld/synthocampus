import { Database } from 'bun:sqlite';
import config from '../config';
import { up as createFactsTable } from './migrations/001_create_facts_table';
import { up as createFactHistoryTable } from './migrations/002_create_fact_history_table';
import path from 'path';
import { mkdirSync } from 'fs';

let db: Database | null = null;

export function getDb(): Database {
  if (db) return db;

  // Ensure data directory exists
  const dbDir = path.dirname(config.DATABASE_PATH);
  mkdirSync(dbDir, { recursive: true });

  // Create database connection
  db = new Database(config.DATABASE_PATH);
  
  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON');
  
  // Run migrations
  runMigrations(db);
  
  return db;
}

function runMigrations(database: Database): void {
  // Check if facts table exists
  const factsTableExists = database.query(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='facts'
  `).get();
  
  if (!factsTableExists) {
    console.log('Running migration: 001_create_facts_table');
    createFactsTable(database);
    console.log('Migration completed successfully');
  }

  // Check if fact_history table exists
  const factHistoryTableExists = database.query(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='fact_history'
  `).get();
  
  if (!factHistoryTableExists) {
    console.log('Running migration: 002_create_fact_history_table');
    createFactHistoryTable(database);
    console.log('Migration completed successfully');
  }
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}