import { Database } from 'bun:sqlite';
import { factHistoryTableSchema } from '../schema';

export function up(db: Database): void {
  db.exec(factHistoryTableSchema);
}