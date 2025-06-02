import { describe, test, expect, beforeAll, afterAll, mock } from 'bun:test';
import { Client, Events, Message } from 'discord.js';
import { client, loginBot } from '../src/discord/client';
import { handlePingCommand } from '../src/discord/commands/ping';
import '../src/discord/index';

describe('Discord Bot Connectivity', () => {
  afterAll(() => {
    if (client.readyAt) {
      client.destroy();
    }
  });

  test('client should be created with correct intents', () => {
    expect(client).toBeInstanceOf(Client);
    expect(client.options.intents).toBeDefined();
  });

  test('loginBot should throw error if no token provided', async () => {
    const originalToken = process.env.DISCORD_BOT_TOKEN;
    process.env.DISCORD_BOT_TOKEN = '';
    
    await expect(loginBot()).rejects.toThrow();
    
    process.env.DISCORD_BOT_TOKEN = originalToken;
  });

  test('ping command handler should reply with Pong!', async () => {
    const mockReply = mock(() => Promise.resolve());
    const mockMessage = {
      reply: mockReply,
      author: { bot: false },
      content: '!ping'
    } as unknown as Message;

    await handlePingCommand(mockMessage);
    
    expect(mockReply).toHaveBeenCalledWith('Pong!');
    expect(mockReply).toHaveBeenCalledTimes(1);
  });

  test('bot should handle !ping message', async () => {
    const mockReply = mock(() => Promise.resolve());
    const mockMessage = {
      reply: mockReply,
      author: { bot: false },
      content: '!ping'
    } as unknown as Message;

    const messageHandler = client.listeners(Events.MessageCreate)[0] as Function;
    await messageHandler(mockMessage);
    
    expect(mockReply).toHaveBeenCalledWith('Pong!');
  });

  test('bot should ignore messages from other bots', async () => {
    const mockReply = mock(() => Promise.resolve());
    const mockMessage = {
      reply: mockReply,
      author: { bot: true },
      content: '!ping'
    } as unknown as Message;

    const messageHandler = client.listeners(Events.MessageCreate)[0] as Function;
    await messageHandler(mockMessage);
    
    expect(mockReply).not.toHaveBeenCalled();
  });

  test('bot should ignore non-ping messages', async () => {
    const mockReply = mock(() => Promise.resolve());
    const mockMessage = {
      reply: mockReply,
      author: { bot: false },
      content: 'hello world'
    } as unknown as Message;

    const messageHandler = client.listeners(Events.MessageCreate)[0] as Function;
    await messageHandler(mockMessage);
    
    expect(mockReply).not.toHaveBeenCalled();
  });
});