import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { Message } from 'discord.js';
import { handleAddFactCommand } from '../src/discord/commands/addfact';
import { getDb, closeDb } from '../src/db';
import { unlinkSync, existsSync } from 'fs';
import config from '../src/config';

beforeEach(() => {
  // Ensure clean test database
  if (existsSync(config.DATABASE_PATH)) {
    unlinkSync(config.DATABASE_PATH);
  }
});

afterEach(() => {
  closeDb();
  if (existsSync(config.DATABASE_PATH)) {
    unlinkSync(config.DATABASE_PATH);
  }
});

describe('Fact CRUD Operations', () => {
  test('!addfact command should insert fact into database', async () => {
    // Create a mock message
    const mockMessage = {
      content: '!addfact John Developer likes TypeScript',
      author: { bot: false },
      reply: async (content: string) => {
        expect(content).toContain('Fact added successfully');
      }
    } as Message;

    // Handle the command
    await handleAddFactCommand(mockMessage);

    // Verify the fact was inserted
    const db = getDb();
    const fact = db.query('SELECT * FROM facts WHERE person = ? AND category = ?')
      .get('John', 'Developer');

    expect(fact).toBeDefined();
    expect(fact.person).toBe('John');
    expect(fact.category).toBe('Developer');
    expect(fact.content).toBe('likes TypeScript');
  });

  test('!addfact command with invalid format should return error', async () => {
    const mockMessage = {
      content: '!addfact John',
      author: { bot: false },
      reply: async (content: string) => {
        expect(content).toBe('Invalid format. Use: !addfact <person> <category> <content>');
      }
    } as Message;

    await handleAddFactCommand(mockMessage);
  });
});