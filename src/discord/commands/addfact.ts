import { Message } from 'discord.js';
import { insertFact } from '../../db/fact_repository.js';

export async function handleAddFactCommand(message: Message): Promise<void> {
  const content = message.content.slice('!addfact'.length).trim();
  
  const parts = content.split(' ');
  if (parts.length < 3) {
    await message.reply('Invalid format. Use: !addfact <person> <category> <content>');
    return;
  }
  
  const person = parts[0];
  const category = parts[1];
  const factContent = parts.slice(2).join(' ');
  
  try {
    insertFact(person, category, factContent);
    await message.reply(`Fact added successfully: ${person} - ${category}: ${factContent}`);
  } catch (error) {
    console.error('Error adding fact:', error);
    await message.reply('Failed to add fact. Please try again.');
  }
}