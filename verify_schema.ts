import { getDb, closeDb } from './src/db';

const db = getDb();

// Check tables
const tables = db.query(`
  SELECT name FROM sqlite_master 
  WHERE type='table'
  ORDER BY name
`).all();

console.log('Tables:', tables);

// Check fact_history schema
const factHistorySchema = db.query(`
  SELECT sql FROM sqlite_master 
  WHERE type='table' AND name='fact_history'
`).get();

console.log('\nfact_history table schema:');
console.log(factHistorySchema?.sql);

closeDb();