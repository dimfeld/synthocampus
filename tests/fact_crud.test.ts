import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { Message } from 'discord.js';
import { handleAddFactCommand } from '../src/discord/commands/addfact';
import { handleGetFactsCommand } from '../src/discord/commands/getfacts';
import { insertFact } from '../src/db/fact_repository';
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
    
    // Verify fact_history entry was created
    const historyEntry = db.query('SELECT * FROM fact_history WHERE fact_id = ? AND change_type = ?')
      .get(fact.id, 'CREATE');
    
    expect(historyEntry).toBeDefined();
    expect(historyEntry.fact_id).toBe(fact.id);
    expect(historyEntry.change_type).toBe('CREATE');
    
    const oldData = JSON.parse(historyEntry.old_data);
    const newData = JSON.parse(historyEntry.new_data);
    
    expect(oldData).toEqual({});
    expect(newData.person).toBe('John');
    expect(newData.category).toBe('Developer');
    expect(newData.content).toBe('likes TypeScript');
    expect(newData.id).toBe(fact.id);
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

  test('!getfacts command should retrieve facts from database', async () => {
    // Insert test facts
    const db = getDb();
    insertFact('Alice', 'skills', 'knows Python');
    insertFact('Alice', 'hobbies', 'plays guitar');
    insertFact('Bob', 'skills', 'expert in JavaScript');

    // Test retrieving all facts for a person
    const mockMessage = {
      content: '!getfacts Alice',
      author: { bot: false },
      reply: async (content: string) => {
        expect(content).toContain('Facts for **Alice**:');
        expect(content).toContain('**skills**: knows Python');
        expect(content).toContain('**hobbies**: plays guitar');
      }
    } as Message;

    await handleGetFactsCommand(mockMessage);
  });

  test('!getfacts command with category should filter results', async () => {
    // Insert test facts
    const db = getDb();
    insertFact('Carol', 'skills', 'database design');
    insertFact('Carol', 'skills', 'API development');
    insertFact('Carol', 'hobbies', 'hiking');

    // Test retrieving facts with category filter
    const mockMessage = {
      content: '!getfacts Carol skills',
      author: { bot: false },
      reply: async (content: string) => {
        expect(content).toContain('Facts for **Carol** in category **skills**:');
        expect(content).toContain('**skills**: database design');
        expect(content).toContain('**skills**: API development');
        expect(content).not.toContain('hiking');
      }
    } as Message;

    await handleGetFactsCommand(mockMessage);
  });

  test('!getfacts command should handle no facts found', async () => {
    const mockMessage = {
      content: '!getfacts NonexistentPerson',
      author: { bot: false },
      reply: async (content: string) => {
        expect(content).toBe('No facts found for person: NonexistentPerson');
      }
    } as Message;

    await handleGetFactsCommand(mockMessage);
  });

  test('!getfacts command with invalid format should return error', async () => {
    const mockMessage = {
      content: '!getfacts',
      author: { bot: false },
      reply: async (content: string) => {
        expect(content).toBe('Invalid format. Use: !getfacts <person> [category]');
      }
    } as Message;

    await handleGetFactsCommand(mockMessage);
  });
});