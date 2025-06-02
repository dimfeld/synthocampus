import { Client, GatewayIntentBits } from 'discord.js';
import config from '../config.js';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

export async function loginBot(): Promise<void> {
  if (!config.DISCORD_BOT_TOKEN) {
    throw new Error('DISCORD_BOT_TOKEN is required but not provided');
  }
  
  await client.login(config.DISCORD_BOT_TOKEN);
}