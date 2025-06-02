import config from './config.js';
import { startDiscordBot } from './discord/index.js';

console.log(`Bot starting with database at: ${config.DATABASE_PATH}`);

startDiscordBot().catch((error) => {
  console.error('Failed to start Discord bot:', error);
  process.exit(1);
});