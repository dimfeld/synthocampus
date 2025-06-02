import config from './config.js';
import { startDiscordBot } from './discord/index.js';
import { getDb } from './db/index.js';

console.log(`Bot starting with database at: ${config.DATABASE_PATH}`);

// Initialize database
getDb();

startDiscordBot().catch((error) => {
  console.error('Failed to start Discord bot:', error);
  process.exit(1);
});