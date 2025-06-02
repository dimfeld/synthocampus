import { Events } from 'discord.js';
import { client, loginBot } from './client.js';
import { handlePingCommand } from './commands/ping.js';
import { handleAddFactCommand } from './commands/addfact.js';
import { handleGetFactsCommand } from './commands/getfacts.js';

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  
  if (message.content === '!ping') {
    await handlePingCommand(message);
  } else if (message.content.startsWith('!addfact')) {
    await handleAddFactCommand(message);
  } else if (message.content.startsWith('!getfacts')) {
    await handleGetFactsCommand(message);
  }
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

export async function startDiscordBot(): Promise<void> {
  await loginBot();
}