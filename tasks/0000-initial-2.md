# Personal Assistant Discord Bot - Features & Technical Architecture

## System Overview

A natural language Discord bot that serves as a personal information manager, storing and retrieving both time-based events and general facts about family members, preferences, and important information. The bot uses LLM-powered natural language understanding to provide an intuitive, conversational interface.

## Feature Set

### Information Storage

The bot manages two primary types of information:

**Events** - Time-based information including:
- One-time events (appointments, recitals, meetings)
- Recurring events (weekly practices, monthly meetings, annual birthdays)
- All-day events (holidays, vacation days)
- Events with specific times and durations

**Facts** - Persistent information including:
- Personal attributes (allergies, preferences, medical conditions)
- Relationships (teachers, doctors, friends)
- Credentials (passwords, account numbers, codes)
- Preferences (favorite restaurants, colors, activities)
- Contact information (addresses, phone numbers, emails)

No need to support multiple users for now, we assume it's always the same person using the application.

### Natural Language Interface

The bot understands conversational input without requiring specific syntax or commands. Users can:
- State information naturally: "Sarah's piano lesson is every Wednesday at 4pm"
- Ask questions conversationally: "What do I need to remember about David?"
- Make corrections intuitively: "Actually, the recital is at 3pm, not 2pm"
- Request deletions simply: "Forget about the old wifi password"

### Intelligent Processing

**Automatic Information Extraction**
- Person identification from context
- Event type classification
- Date and time parsing with timezone awareness
- Relationship inference
- Category auto-assignment for facts

**Smart Assumptions**
- Interprets "next Tuesday" based on current date
- Assumes "this Saturday" means the upcoming Saturday
- Infers recurring patterns from phrases like "every Monday"
- Clearly communicates all assumptions made

**Context Understanding**
- Maintains conversation context for updates
- Recognizes when information relates to previously stored data
- Handles partial updates without losing other information
- Understands implicit references ("his teacher" after mentioning David)

### Query Capabilities

**Temporal Queries**
- "What's happening this weekend?"
- "Show me everything in June"
- "What do we have tomorrow?"
- "When is Sarah's next appointment?"

**Person-Centric Queries**
- "Tell me everything about David"
- "What's coming up for Mom?"
- "What allergies does Sarah have?"

**Category-Based Queries**
- "List all the passwords"
- "What medical information do we have?"
- "Show me all recurring events"

**Keyword Searches**
- "Anything about the dentist?"
- "Find everything with 'school'"
- "Search for piano"

### Update & Management

**Flexible Updates**
- Natural language corrections
- Partial information updates
- Bulk updates through conversation
- Historical tracking of all changes

**Intelligent Conflict Resolution**
- Automatic updates for future events
- Smart merging of partial information
- Confirmation of significant changes
- Rollback capabilities through history

### Automated Features

**Daily Summary**
- Delivered at 7:00 AM Hawaii time
- Lists all events for the current day
- Chronologically organized
- Posted directly to Discord channel

**Recurring Event Management**
- Automatic generation of recurring instances
- Support for complex patterns (first Monday, every other week)
- Holiday awareness for business day calculations
- End date support for limited series

## Technical Architecture

### Technology Stack

**Runtime Environment**
- **Bun** - Fast all-in-one JavaScript runtime
- Chosen for superior performance and built-in TypeScript support
- Native SQLite driver included
- Simplified dependency management

**Database**
- **SQLite** - Embedded relational database
- Zero-configuration setup
- ACID compliance for data integrity
- Efficient for single-user application
- Easy backup and portability

**AI Integration**
- **Vercel AI SDK** - Unified interface for LLM providers
- **Gemini Flash 2.5** - Initial LLM choice
- Provider-agnostic implementation
- Easy switching between models
- Streaming support for responsive interactions

**Platform**
- **Discord.js** - Official Discord API wrapper
- WebSocket-based real-time communication
- Rich message formatting support
- Reliable event handling

### Data Architecture

**Relational Design**
- Normalized schema with separate tables for events and facts
- Optimized indexes for common query patterns
- JSON fields for flexible metadata storage
- Soft deletes for data recovery

**History Tracking**
- Complete audit trail of all changes
- Before/after snapshots in JSON format
- User-initiated rollback support
- Compliance-ready data retention

**Performance Optimization**
- Indexed searches on person, date, and category
- Prepared statements for SQL injection prevention
- Connection pooling for concurrent operations
- Query result caching for repeated searches

### LLM Integration Design

**Prompt Engineering**
- System prompts define bot personality and capabilities
- Few-shot examples for consistent behavior
- Structured output formats for reliable parsing
- Dynamic context injection for current state

**Function Calling**
- Structured tools for database operations
- Type-safe parameter validation
- Error handling and retry logic
- Fallback strategies for LLM failures

**Context Management**
- Conversation history tracking
- Relevant fact injection for queries
- Token optimization strategies
- Semantic search for related information


