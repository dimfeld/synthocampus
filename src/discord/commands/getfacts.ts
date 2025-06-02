import { Message } from 'discord.js';
import { getFacts } from '../../db/fact_repository.js';

export async function handleGetFactsCommand(message: Message): Promise<void> {
  const args = message.content.split(' ').slice(1);
  
  if (args.length === 0) {
    await message.reply('Invalid format. Use: !getfacts <person> [category]');
    return;
  }
  
  const person = args[0];
  const category = args[1];
  
  try {
    const facts = getFacts(person, category);
    
    if (facts.length === 0) {
      const searchInfo = category ? `person: ${person}, category: ${category}` : `person: ${person}`;
      await message.reply(`No facts found for ${searchInfo}`);
      return;
    }
    
    const factsList = facts.map(fact => 
      `• **${fact.category}**: ${fact.content}`
    ).join('\n');
    
    const header = category 
      ? `Facts for **${person}** in category **${category}**:`
      : `Facts for **${person}**:`;
    
    await message.reply(`${header}\n${factsList}`);
  } catch (error) {
    console.error('Error retrieving facts:', error);
    await message.reply('An error occurred while retrieving facts.');
  }
}