import { Message } from 'discord.js';

export async function handlePingCommand(message: Message): Promise<void> {
  await message.reply('Pong!');
}