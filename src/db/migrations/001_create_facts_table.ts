import { Database } from 'bun:sqlite';
import { factsTableSchema } from '../schema';

export function up(db: Database): void {
  db.exec(factsTableSchema);
}

export function down(db: Database): void {
  db.exec('DROP TABLE IF EXISTS facts');
}