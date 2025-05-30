## Phase 1: Core Infrastructure

This phase focuses on setting up the project, basic bot connectivity, and database initialization.

### Chunk 1.1: Project Setup & Basic Discord Bot

*   **Step 1.1.1: Initialize Bun Project**
    *   **Goal:** Create a new Bun project with TypeScript.
    *   **Implementation:**
        *   Run `bun init` (or equivalent for TypeScript project).
        *   Install necessary base dependencies: `typescript`, `@types/bun`.
        *   Configure `tsconfig.json`.
    *   **Testing:** Project compiles, basic "hello world" script runs with `bun run`.

*   **Step 1.1.2: Basic Discord Bot Connection**
    *   **Goal:** Create a Discord bot application and have the Bun script connect to Discord.
    *   **Implementation:**
        *   Create a bot application on the Discord Developer Portal. Get bot token.
        *   Install a Discord library compatible with Bun (e.g., `discord.js` v14+ or a more Bun-native library if available and stable. For now, assume `discord.js`).
        *   Write a minimal script that logs in the bot using `DISCORD_BOT_TOKEN` from an environment variable (`.env` file, loaded by Bun automatically or with a package like `dotenv`).
        *   Bot should log "Bot is online!" to console.
    *   **Testing:** Bot appears as "online" in your Discord server. Console logs successful connection.

*   **Step 1.1.3: Environment Variable Setup**
    *   **Goal:** Establish a pattern for managing environment variables.
    *   **Implementation:**
        *   Create a `.env.example` file listing all required variables from the spec (`DISCORD_BOT_TOKEN`, `GOOGLE_AI_API_KEY`, `DATABASE_PATH`, `TIMEZONE`, `DAILY_SUMMARY_CHANNEL_ID`, `DAILY_SUMMARY_TIME`).
        *   Ensure `.env` is in `.gitignore`.
        *   Load `DISCORD_BOT_TOKEN` in the bot script.
    *   **Testing:** Bot connects using the token from `.env`.

### Chunk 1.2: Database Setup

*   **Step 1.2.1: SQLite Integration & Schema Definition**
    *   **Goal:** Integrate SQLite and create the initial database schema.
    *   **Implementation:**
        *   Install SQLite driver for Bun/Node.js (e.g., `bun:sqlite` or `better-sqlite3`).
        *   Define the SQL for `events`, `facts`, `recurring_patterns`, `event_history`, `fact_history` tables as per the spec.
        *   Write a script (e.g., `src/db/migrate.ts`) that connects to the database (path from `DATABASE_PATH` env var) and executes the `CREATE TABLE` statements. This script should be idempotent (e.g., use `CREATE TABLE IF NOT EXISTS`).
    *   **Testing:**
        *   Run the migration script.
        *   Verify `assistant.db` file is created.
        *   Inspect the database schema using a SQLite browser to confirm tables and columns.

*   **Step 1.2.2: Basic Database Helper Functions**
    *   **Goal:** Create simple helper functions for database interactions (to be expanded later).
    *   **Implementation:**
        *   Create a module (e.g., `src/db/index.ts`) that exports a database connection instance.
        *   Write a placeholder function like `pingDb()` that executes a simple query (e.g., `SELECT 1`) to test connectivity.
    *   **Testing:** Call `pingDb()` from main bot script; ensure no errors.

### Chunk 1.3: LLM Integration Setup

*   **Step 1.3.1: Vercel AI SDK and Gemini API Key Setup**
    *   **Goal:** Integrate the Vercel AI SDK and configure it for Gemini.
    *   **Implementation:**
        *   Install `@ai-sdk/google`.
        *   Add `GOOGLE_AI_API_KEY` to `.env`.
        *   Create a module (e.g., `src/llm/index.ts`) that initializes the `google` client and exports the `model` instance (Gemini Flash 2.5) as shown in the spec.
    *   **Testing:** Write a small test function in `src/llm/index.ts` that sends a simple prompt ("say hello") to Gemini and logs the response. Run this manually.

---

## Phase 2: Basic Operations (Storing Information)

This phase focuses on the bot's ability to understand and store new facts and events.

### Chunk 2.1: Basic Message Handling & Input Classification

*   **Step 2.1.1: Respond to All Messages in Designated Channel**
    *   **Goal:** Bot listens to messages in a specific channel and acknowledges them.
    *   **Implementation:**
        *   Modify Discord bot code to listen for `messageCreate` events.
        *   Initially, respond only if the message is from a specific channel ID (configurable, perhaps `DAILY_SUMMARY_CHANNEL_ID` for now, or a new `BOT_COMMAND_CHANNEL_ID`).
        *   For any message in this channel, bot replies with "I received your message: [user's message]".
    *   **Testing:** Send messages in the designated channel; bot replies as expected. Messages in other channels are ignored.

*   **Step 2.1.2: LLM-based Input Classification (Intent Detection)**
    *   **Goal:** Use LLM to classify user input into high-level intents (new_event, new_fact, query, update, delete, unknown).
    *   **Implementation:**
        *   **Prompt Engineering:** Design a prompt for the LLM.
            *   Role: "You are an intent classifier for a personal assistant bot."
            *   Input: User's message.
            *   Output: A JSON object like `{ "intent": "new_event" | "new_fact" | "query" | "update" | "delete" | "greeting" | "unknown", "confidence_score": 0.0-1.0 }`.
            *   Examples:
                *   "David's recital is June 1" -> `new_event`
                *   "The wifi password is abc123" -> `new_fact`
                *   "What's happening this weekend?" -> `query`
                *   "Hello bot" -> `greeting`
        *   Create a function `classifyInput(userInput: string): Promise<{intent: string}>` in `src/llm/classification.ts`.
        *   Modify bot's message handler:
            1.  Receive message.
            2.  Call `classifyInput()`.
            3.  Reply with "I think this is a [intent_type] message."
    *   **Testing:**
        *   Send various types of messages.
        *   Verify bot's classification response.
        *   Unit test `classifyInput` with mock LLM responses for different inputs.

### Chunk 2.2: Storing General Facts

*   **Step 2.2.1: LLM-based Fact Extraction**
    *   **Goal:** If intent is `new_fact`, use LLM to extract subject, person, category, key, and value.
    *   **Implementation:**
        *   **Prompt Engineering:** Design a prompt for fact extraction.
            *   Role: "You are an information extractor for a personal assistant. Extract structured data from the following fact."
            *   Input: User's message.
            *   Context: Current date (for any implicit context, though less relevant for facts).
            *   Output: A JSON object like `{ "subject": "wifi", "person": null, "category": "password", "fact_key": "wifi password", "fact_value": "abc123" }`.
            *   Provide examples for various fact types (passwords, allergies, preferences, etc.).
            *   Instruct LLM to infer categories like 'health', 'preference', 'contact', 'password', 'general'.
        *   Create `extractFactDetails(userInput: string): Promise<FactData>` in `src/llm/fact_extraction.ts`.
    *   **Testing:**
        *   Unit test `extractFactDetails` with various fact sentences. Check if output JSON is correct.
        *   Manually send fact sentences to the bot and log the extracted JSON.

*   **Step 2.2.2: Storing Extracted Facts in Database**
    *   **Goal:** Save the extracted fact details into the `facts` table.
    *   **Implementation:**
        *   Create `addFact(factData: FactData): Promise<number>` function in `src/db/facts.ts`. This function will:
            *   Insert a new record into the `facts` table (`original_text`, `subject`, `person`, `category`, `fact_key`, `fact_value`). `is_active` defaults to `TRUE`.
            *   Return the ID of the newly inserted fact.
        *   In the main bot logic, if intent is `new_fact`:
            1.  Call `extractFactDetails()`.
            2.  Call `addFact()` with the result.
            3.  Respond to user: "OK, I've noted that: [original_text]." (or a more natural confirmation).
    *   **Testing:**
        *   Send a fact sentence (e.g., "The wifi password is abc123").
        *   Verify bot's confirmation message.
        *   Check the `facts` table in SQLite browser to ensure data is stored correctly.
        *   Test with facts that include a person ("Sarah is allergic to peanuts").

*   **Step 2.2.3: Storing Fact History (Creation)**
    *   **Goal:** Record the creation of a new fact in the `fact_history` table.
    *   **Implementation:**
        *   Create `addFactHistory(factId: number, changeType: string, oldValues: any, newValues: any)` in `src/db/fact_history.ts`.
        *   Modify `addFact()`: after successfully inserting into `facts`, call `addFactHistory()` with `changeType: 'created'`, `oldValues: null`, and `newValues: { ...factData }` (JSON stringified).
    *   **Testing:**
        *   Add a new fact.
        *   Verify an entry is created in `fact_history` table with correct `fact_id`, `change_type`, and `new_values`.

### Chunk 2.3: Storing Basic Events (No Recurring, Simple Dates)

*   **Step 2.3.1: LLM-based Event Extraction**
    *   **Goal:** If intent is `new_event`, use LLM to extract person, event type, description, and date/time string.
    *   **Implementation:**
        *   **Prompt Engineering:** Design a prompt for event extraction.
            *   Role: "You are an information extractor for a personal assistant. Extract structured data from the following event description."
            *   Input: User's message.
            *   Context: Current date/time, default timezone (Hawaii).
            *   Output: A JSON object like `{ "person": "David", "event_type": "recital", "description": "David's recital", "date_time_str": "June 1" }`.
            *   Instruct LLM to identify event types like 'appointment', 'recital', 'practice', 'meeting', 'birthday'.
        *   Create `extractEventDetails(userInput: string, currentDate: Date): Promise<EventDataFromLLM>` in `src/llm/event_extraction.ts`.
    *   **Testing:**
        *   Unit test `extractEventDetails` with various event sentences.
        *   Manually send event sentences to the bot and log the extracted JSON.

*   **Step 2.3.2: Basic Date/Time Parsing**
    *   **Goal:** Convert the `date_time_str` from LLM into actual `DATE` and `TIME` objects/strings.
    *   **Implementation:**
        *   Use a robust date parsing library (e.g., `date-fns`, `dayjs`, or `chrono-node` for natural language parsing if LLM output is too vague). `chrono-node` is good for "next Tuesday at 3pm".
        *   Create a utility function `parseDateTime(dateTimeStr: string, referenceDate: Date, timezone: string): { date: string, time: string | null, assumption?: string }`.
            *   This function should handle simple dates like "June 1", "tomorrow", "next Tuesday at 3pm".
            *   Default to Hawaii timezone (`Pacific/Honolulu` from env var).
            *   If an assumption is made (e.g., "Saturday" -> "next Saturday"), include it in the return.
    *   **Testing:**
        *   Unit test `parseDateTime` with various inputs:
            *   "June 1" (assume current year)
            *   "tomorrow at 5pm"
            *   "next Monday"
            *   "August 10, 2025 2:00 PM"
            *   Test timezone handling (ensure output reflects Hawaii time).
            *   Test assumption reporting.

*   **Step 2.3.3: Storing Extracted Events in Database**
    *   **Goal:** Save the parsed event details into the `events` table.
    *   **Implementation:**
        *   Create `addEvent(eventData: ParsedEventData): Promise<number>` function in `src/db/events.ts`.
            *   `ParsedEventData` includes `original_text`, `person`, `event_type`, `description`, `event_date` (YYYY-MM-DD), `event_time` (HH:MM:SS or null).
            *   `is_recurring` defaults to `FALSE`. `is_active` defaults to `TRUE`.
        *   In the main bot logic, if intent is `new_event`:
            1.  Call `extractEventDetails()`.
            2.  Call `parseDateTime()` on `date_time_str`.
            3.  Call `addEvent()` with combined data.
            4.  Respond to user: "OK, I've scheduled: [description] on [date] at [time]. (Assumption: [assumption if any])".
    *   **Testing:**
        *   Send event sentences (e.g., "David's recital is June 1", "Meeting tomorrow at 2pm").
        *   Verify bot's confirmation, including any date assumptions.
        *   Check the `events` table.

*   **Step 2.3.4: Storing Event History (Creation)**
    *   **Goal:** Record the creation of a new event in the `event_history` table.
    *   **Implementation:**
        *   Create `addEventHistory(eventId: number, changeType: string, oldValues: any, newValues: any)` in `src/db/event_history.ts`.
        *   Modify `addEvent()`: after successfully inserting into `events`, call `addEventHistory()` with `changeType: 'created'`, `oldValues: null`, and `newValues: { ...eventData }`.
    *   **Testing:**
        *   Add a new event.
        *   Verify an entry is created in `event_history` table.

---

## Phase 3: Query System

This phase enables users to retrieve stored information.

### Chunk 3.1: Basic Fact Querying

*   **Step 3.1.1: LLM-based Fact Query Analysis**
    *   **Goal:** If intent is `query`, and it seems like a fact query, use LLM to understand what's being asked.
    *   **Implementation:**
        *   **Prompt Engineering:** Design a prompt for fact query analysis.
            *   Role: "You are a query analyzer for a personal assistant. Determine the parameters for a database search based on the user's question about facts."
            *   Input: User's query.
            *   Output: A JSON object like `{ "query_type": "fact", "person": "David" | null, "category": "allergy" | null, "fact_key": "wifi password" | null, "keywords": ["teacher"] | null }`.
        *   Create `analyzeFactQuery(userInput: string): Promise<FactQueryParameters>` in `src/llm/query_analysis.ts`.
    *   **Testing:**
        *   Unit test `analyzeFactQuery` with various questions: "What do I know about David?", "What are the passwords?", "What's the wifi password?".
        *   Manually send queries and log the parsed parameters.

*   **Step 3.1.2: Retrieving Facts from Database**
    *   **Goal:** Fetch facts from the `facts` table based on LLM-parsed query parameters.
    *   **Implementation:**
        *   Create `findFacts(params: FactQueryParameters): Promise<Fact[]>` in `src/db/facts.ts`.
        *   This function will build a SQL query dynamically based on `params` (e.g., `WHERE person = ? AND category = ?`). Use `LIKE` for keyword searches on `subject`, `fact_key`, `fact_value`. Only query `is_active = TRUE` facts.
    *   **Testing:**
        *   Unit test `findFacts` by populating DB with test data and querying with different params.
        *   Ensure SQL injection is prevented (use parameterized queries).

*   **Step 3.1.3: Formatting and Responding with Fact Query Results**
    *   **Goal:** Present the retrieved facts to the user in a clear format.
    *   **Implementation:**
        *   In main bot logic, if `classifyInput` returns `query` and `analyzeFactQuery` returns fact parameters:
            1.  Call `findFacts()`.
            2.  Format results (e.g., "Here's what I know about [subject/person]:\n - [Fact Key]: [Fact Value]").
            3.  If no results, "I couldn't find anything matching that."
            4.  Use Discord formatting (bold, lists).
    *   **Testing:**
        *   Add some facts, then query them in various ways.
        *   Verify formatting and accuracy of results.
        *   Test "no results" scenario.

### Chunk 3.2: Basic Event Querying (Time-based)

*   **Step 3.2.1: LLM-based Event Query Analysis (Time Focus)**
    *   **Goal:** If intent is `query`, and it seems like an event query, use LLM to extract timeframes.
    *   **Implementation:**
        *   **Prompt Engineering:** Design/extend prompt for event query analysis.
            *   Role: "...determine parameters for a database search based on the user's question about events."
            *   Input: User's query.
            *   Context: Current date/time, timezone.
            *   Output: JSON `{ "query_type": "event", "time_range": { "start": "YYYY-MM-DD HH:MM:SS", "end": "YYYY-MM-DD HH:MM:SS" }, "person": null, "event_type": null, "keywords": null }`.
            *   LLM should interpret "this weekend", "June", "today", "next week".
        *   Create/extend `analyzeEventQuery(userInput: string, currentDate: Date): Promise<EventQueryParameters>` in `src/llm/query_analysis.ts`. This will involve LLM interpreting the time phrase and then your code converting it to start/end dates using date library.
    *   **Testing:**
        *   Unit test `analyzeEventQuery` with questions: "What's happening this weekend?", "Anything in June?", "What's on today?".
        *   Manually send queries and log parsed parameters, especially `time_range`.

*   **Step 3.2.2: Retrieving Non-Recurring Events from Database by Time**
    *   **Goal:** Fetch non-recurring events from `events` table based on time range.
    *   **Implementation:**
        *   Create `findEvents(params: EventQueryParameters): Promise<Event[]>` in `src/db/events.ts`.
        *   Initially, query `events` where `is_recurring = FALSE`, `is_active = TRUE`, and `event_date` is within `params.time_range.start` and `params.time_range.end`.
        *   Sort chronologically.
    *   **Testing:**
        *   Add test events.
        *   Unit test `findEvents` with different time ranges.

*   **Step 3.2.3: Formatting and Responding with Event Query Results**
    *   **Goal:** Present retrieved events clearly.
    *   **Implementation:**
        *   In main bot logic, for event queries:
            1.  Call `findEvents()`.
            2.  Format results: "Here's what's happening [timeframe]:\n - [Date] at [Time]: [Description] (for [Person])".
            3.  If no results, "I don't have anything scheduled for [timeframe]."
    *   **Testing:**
        *   Add events, query them using time-based questions.
        *   Verify formatting, accuracy, and chronological order.

### Chunk 3.3: Advanced Date/Time Handling & Assumptions

*   **Step 3.3.1: Enhance `parseDateTime` for Ambiguity and Assumptions**
    *   **Goal:** Improve `parseDateTime` to robustly handle ambiguous dates and clearly state assumptions.
    *   **Implementation:**
        *   Refine `parseDateTime` (from Step 2.3.2).
        *   Example: "Saturday" -> assumes *next* Saturday. The function should return this assumption string.
        *   Handle cases like "June" without a day (e.g., interpret as the whole month for queries, or ask for clarification for new events). For now, for new events, it might be too ambiguous, LLM should be prompted to ask for clarification or make a guess like "June 1st".
        *   Ensure all date operations consistently use the configured `TIMEZONE`.
    *   **Testing:**
        *   Extensive unit tests for `parseDateTime` covering various ambiguous inputs and relative dates ("next month", "in 3 days", "last Friday").
        *   Verify assumption messages are generated correctly.

*   **Step 3.3.2: Integrate Enhanced Parsing into Event Creation and Querying**
    *   **Goal:** Use the improved `parseDateTime` in event creation and ensure assumptions are communicated.
    *   **Implementation:**
        *   When creating events, if `parseDateTime` returns an assumption, include it in the confirmation message to the user.
        *   For event queries, `analyzeEventQuery` should use `parseDateTime` (or similar logic) to resolve time phrases like "next weekend" into concrete date ranges, communicating any assumptions if the LLM itself doesn't resolve it fully.
    *   **Testing:**
        *   Manually test creating events with ambiguous dates ("Party on Saturday") and check bot's confirmation.
        *   Manually test querying events with relative date phrases ("What's happening next week?").

---

## Phase 4: Updates, Deletes, and Recurring Events

### Chunk 4.1: Update Operations for Facts

*   **Step 4.1.1: LLM-based Update Intent and Fact Identification**
    *   **Goal:** Identify that user wants to update a fact and which fact they mean.
    *   **Implementation:**
        *   **Prompt Engineering (Extend Classification/New Prompt):**
            *   If `classifyInput` is `update`.
            *   New prompt: "User wants to update a fact. Identify the fact to be updated and the new information. The user's message is: [message]. Existing facts about [potential subject/person from message] are: [list of relevant facts from DB, if identifiable, or rely on LLM to match based on message content]."
            *   Output: JSON `{ "type": "fact_update", "fact_identifier": { "subject": "wifi", "fact_key": "wifi password" /* or existing fact_id if LLM can be made to find it */ }, "new_values": { "fact_value": "xyz789" } }`.
            *   For "Sarah is actually allergic to tree nuts, not peanuts", LLM should identify the old value "peanuts" and new value "tree nuts" for the "allergy" key for "Sarah".
        *   Create `analyzeFactUpdate(userInput: string, relevantFacts: Fact[]): Promise<FactUpdateData>` in `src/llm/update_analysis.ts`.
    *   **Testing:**
        *   Unit test `analyzeFactUpdate` with various update statements.
        *   Test scenarios: direct update ("The wifi password is now xyz789"), correction ("Sarah is allergic to tree nuts, not peanuts").

*   **Step 4.1.2: Implementing Fact Update in Database**
    *   **Goal:** Update the specified fact in the `facts` table.
    *   **Implementation:**
        *   Create `updateFact(identifier: FactIdentifier, newValues: Partial<FactData>): Promise<boolean>` in `src/db/facts.ts`.
            *   First, find the fact to update using `identifier` (e.g., by `subject` and `fact_key`, or by `id` if known). This might involve a preliminary search.
            *   If found, store its current state (for history).
            *   Update the record in `facts` table. Update `updated_at`.
            *   Return `true` if successful, `false` otherwise.
        *   In main bot logic:
            1.  If intent is `update` (and it's a fact update):
            2.  (Optional pre-fetch) Fetch potentially relevant facts based on keywords in user message to provide context to LLM.
            3.  Call `analyzeFactUpdate()`.
            4.  Call `updateFact()`.
            5.  Respond with confirmation: "OK, I've updated [fact_key] to [new_value]."
    *   **Testing:**
        *   Add a fact. Update it. Verify change in DB and bot's confirmation.
        *   Test partial updates and corrections.
        *   Test updating a non-existent fact (should fail gracefully).

*   **Step 4.1.3: Storing Fact History (Updates)**
    *   **Goal:** Record the update in `fact_history`.
    *   **Implementation:**
        *   Modify `updateFact()`: Before updating, fetch the current fact. After successful update, call `addFactHistory()` with `changeType: 'updated'`, `oldValues: { ...oldFactData }`, and `newValues: { ...updatedFactData }`.
    *   **Testing:**
        *   Update a fact. Verify `fact_history` table shows old and new values.

### Chunk 4.2: Update Operations for Events

*   **Step 4.2.1: LLM-based Event Update Intent and Identification**
    *   **Goal:** Identify user's intent to update an event and which event they mean.
    *   **Implementation:**
        *   **Prompt Engineering (Similar to Fact Update):**
            *   Input: User message, e.g., "Actually, David's recital is June 2nd not June 1st", "David's recital is at 3pm".
            *   Context: List of potentially relevant upcoming events for "David" or matching "recital".
            *   Output: JSON `{ "type": "event_update", "event_identifier": { /* criteria to find event, e.g., description, old date */ "description_keywords": ["David", "recital"], "original_date_approx": "June 1st" /* or existing event_id */ }, "new_values": { "event_date": "YYYY-MM-DD", "event_time": "HH:MM:SS" /* only fields to change */ } }`.
        *   Create `analyzeEventUpdate(userInput: string, relevantEvents: Event[]): Promise<EventUpdateData>` in `src/llm/update_analysis.ts`.
    *   **Testing:**
        *   Unit test `analyzeEventUpdate` with various event update statements.
        *   Test partial updates (only time, only date).

*   **Step 4.2.2: Implementing Event Update in Database**
    *   **Goal:** Update the specified event in the `events` table.
    *   **Implementation:**
        *   Create `updateEvent(identifier: EventIdentifier, newValues: Partial<ParsedEventData>): Promise<boolean>` in `src/db/events.ts`.
            *   Find the event. This is tricky. May need to search by description keywords and old date/time if `id` is not provided by LLM. For future events, assume new info overwrites.
            *   If `newValues` contains date/time strings, parse them using `parseDateTime()`.
            *   Store old values for history.
            *   Update record in `events`. Update `updated_at`.
        *   In main bot logic for event updates:
            1.  Call `analyzeEventUpdate()`.
            2.  Call `updateEvent()`.
            3.  Respond: "OK, David's recital is now on June 2nd at 3pm. (Old: June 1st)".
    *   **Testing:**
        *   Add an event. Update its date, then its time. Verify changes and confirmation.
        *   Test conflict handling (spec says "For future events, automatically update with new information").

*   **Step 4.2.3: Storing Event History (Updates)**
    *   **Goal:** Record the update in `event_history`.
    *   **Implementation:**
        *   Modify `updateEvent()`: Before updating, fetch current event. After update, call `addEventHistory()` with `changeType: 'updated'`, `oldValues`, and `newValues`.
    *   **Testing:** Update an event. Verify `event_history`.

### Chunk 4.3: Delete Operations (Soft Deletes)

*   **Step 4.3.1: LLM-based Deletion Intent and Identification**
    *   **Goal:** Identify user's intent to delete a fact/event and what to delete.
    *   **Implementation:**
        *   **Prompt Engineering (Extend Classification/New Prompt):**
            *   If `classifyInput` is `delete`.
            *   Prompt: "User wants to delete information. Identify if it's a fact or event, and what specific item to delete. User message: [message]. Relevant items: [context if possible]."
            *   Output: JSON `{ "type": "delete", "item_type": "fact" | "event", "identifier": { /* criteria */ } }`.
        *   Create `analyzeDeletion(userInput: string, contextItems: any[]): Promise<DeletionData>` in `src/llm/delete_analysis.ts`.
    *   **Testing:** Test with "Forget about the old wifi password", "Sarah is no longer allergic to peanuts", "Cancel David's recital on June 2nd".

*   **Step 4.3.2: Implementing Soft Deletes for Facts and Events**
    *   **Goal:** Mark facts/events as inactive instead of physically deleting them.
    *   **Implementation:**
        *   Create `deleteFact(identifier: FactIdentifier): Promise<boolean>` in `src/db/facts.ts`. Sets `is_active = FALSE`, updates `updated_at`.
        *   Create `deleteEvent(identifier: EventIdentifier): Promise<boolean>` in `src/db/events.ts`. Sets `is_active = FALSE`, updates `updated_at`.
        *   In main bot logic:
            1.  Call `analyzeDeletion()`.
            2.  Call appropriate delete function.
            3.  Respond: "OK, I've removed the information about [deleted item]."
    *   **Testing:**
        *   Add a fact/event. Delete it. Verify `is_active` is false.
        *   Verify deleted items don't show in queries.
        *   Verify bot confirmation.

*   **Step 4.3.3: Storing History for Deletes**
    *   **Goal:** Record deletions in history tables.
    *   **Implementation:**
        *   Modify `deleteFact()` and `deleteEvent()`: Before setting `is_active = FALSE`, fetch the item. After update, call respective history function with `changeType: 'deleted'`, `oldValues: { ...itemData }`, `newValues: { is_active: false }`.
    *   **Testing:** Delete an item. Verify history table entry.

### Chunk 4.4: Recurring Events

*   **Step 4.4.1: LLM-based Recurrence Pattern Extraction**
    *   **Goal:** Extract recurrence rule details from user input.
    *   **Implementation:**
        *   **Prompt Engineering (Extend Event Extraction):**
            *   When LLM identifies an event, prompt it to also look for recurrence.
            *   Output for event: `{ ..., "is_recurring": true, "recurrence_rule_text": "every Tuesday at 4pm", "recurrence_end_date_text": "end of year" | null }`.
            *   LLM should identify patterns: weekly, monthly, yearly, custom intervals.
        *   Update `extractEventDetails` in `src/llm/event_extraction.ts`.
    *   **Testing:** Test with "Soccer practice is every Tuesday at 4pm", "Meeting on the first Monday of each month", "Birthday on July 10th every year".

*   **Step 4.4.2: Parsing Recurrence Rules and Storing**
    *   **Goal:** Convert LLM's `recurrence_rule_text` into a structured format (e.g., RRule string or JSON) and store it. Calculate first `next_occurrence`.
    *   **Implementation:**
        *   Create a function `parseRecurrenceRule(ruleText: string, eventStartDate: Date, timezone: string): { rule: string, endDate?: Date }`.
            *   This is complex. May need a dedicated NLP library for recurrence or more detailed LLM prompting to output a structured rule directly (e.g., iCalendar RRule).
            *   For "every Tuesday at 4pm", rule could be `FREQ=WEEKLY;BYDAY=TU`.
            *   For "first Monday of each month", rule `FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1`.
            *   Support: weekly, monthly (day of month, day of week), yearly, custom (every X days).
        *   When adding/updating an event in `src/db/events.ts`:
            *   If `is_recurring` is true:
                *   Parse `recurrence_rule_text` into `events.recurrence_pattern` (structured string/JSON).
                *   Parse `recurrence_end_date_text` into `events.recurrence_end_date`.
                *   Calculate the first occurrence date/time. This becomes `events.event_date` and `events.event_time`.
                *   Calculate the *next* occurrence after this first one (or the first one itself if `event_date` is in the future) and store it in `recurring_patterns` table.
        *   `recurring_patterns` table: `id, event_id, pattern_type (e.g. 'rrule'), pattern_value (the RRule string), next_occurrence DATE`.
        *   Create `addRecurringPattern(eventId: number, patternType: string, patternValue: string, nextOccurrence: Date)` in `src/db/recurring.ts`.
    *   **Testing:**
        *   Unit test `parseRecurrenceRule` extensively.
        *   Add various recurring events. Check `events` and `recurring_patterns` tables.
        *   Verify `next_occurrence` is calculated correctly.

*   **Step 4.4.3: Querying Recurring Events**
    *   **Goal:** Include recurring events in time-based queries.
    *   **Implementation:**
        *   Modify `findEvents(params: EventQueryParameters)`:
            *   Also query `recurring_patterns` table where `next_occurrence` falls within `params.time_range.start` and `params.time_range.end`.
            *   Join with `events` table to get full event details for these occurrences.
            *   Combine with non-recurring events and sort chronologically.
            *   (Important: This only gets the *next* occurrence. For a range like "all events in June", you'd need to expand recurrence rules. This is advanced. For now, focus on `next_occurrence` matching.)
            *   **Refinement for range queries:** For a query like "What's in June?", iterate from `time_range.start` to `time_range.end`. For each day, check `recurring_patterns.next_occurrence`. If it matches, include it. Then, for that specific recurring event, calculate its *new* `next_occurrence` and *temporarily* hold it for the duration of the query, so it can appear multiple times in June if it's weekly. This is complex.
            *   **Simpler initial approach for range queries:** The `recurring_patterns.next_occurrence` is the single next time. If a query asks "what's in June?", and a weekly event's `next_occurrence` is in June, it will be listed once. To list all instances in June, you'd need a function `getOccurrencesInDateRange(eventId, startDate, endDate)` that uses the RRule.
    *   **Testing:**
        *   Add recurring events. Query for "today", "this week". Verify they appear if their `next_occurrence` matches.
        *   Test range queries (e.g., "next 7 days") and see how recurring events are handled.

*   **Step 4.4.4: Updating `next_occurrence` (Basic)**
    *   **Goal:** After a recurring event's `next_occurrence` has passed (e.g., during daily summary or when queried), update it.
    *   **Implementation:**
        *   Create `updateNextOccurrence(recurringPatternId: number, newNextOccurrence: Date)` in `src/db/recurring.ts`.
        *   Create a utility `calculateNextOccurrence(rruleString: string, lastOccurrence: Date, recurrenceEndDate?: Date): Date | null`. This will use an RRule library (e.g., `rrule.js`).
        *   This will be primarily used by the Daily Summary task.
    *   **Testing:**
        *   Manually call function to update `next_occurrence` for a test event. Verify DB.
        *   Unit test `calculateNextOccurrence`.

---

## Phase 5: Daily Summaries and Polish

### Chunk 5.1: Daily Summary

*   **Step 5.1.1: Implement Daily Summary Job Scheduler**
    *   **Goal:** Schedule a job to run daily at 7:00 AM Hawaii time.
    *   **Implementation:**
        *   Use a scheduling library (e.g., `node-cron` or a Bun-native equivalent).
        *   Configure it to run based on `DAILY_SUMMARY_TIME` and `TIMEZONE` from env vars.
    *   **Testing:**
        *   Set schedule to run every minute for testing. Verify it triggers.
        *   Test timezone handling for the schedule.

*   **Step 5.1.2: Logic for Generating Daily Summary Content**
    *   **Goal:** Fetch all events (non-recurring and next occurrences of recurring) for the current day.
    *   **Implementation:**
        *   Function `getEventsForDay(date: Date, timezone: string): Promise<Event[]>`.
            *   Query `events` where `event_date` is `date` AND `is_recurring = FALSE` AND `is_active = TRUE`.
            *   Query `recurring_patterns` joined with `events` where `recurring_patterns.next_occurrence` is `date` AND `events.is_active = TRUE`.
            *   Combine and sort chronologically by time.
    *   **Testing:**
        *   Populate DB with events for "today". Call `getEventsForDay(new Date(), 'Pacific/Honolulu')`. Verify results.

*   **Step 5.1.3: Posting Daily Summary to Discord**
    *   **Goal:** Format and send the summary to `DAILY_SUMMARY_CHANNEL_ID`.
    *   **Implementation:**
        *   In the scheduled job:
            1.  Call `getEventsForDay()`.
            2.  Format the list (chronological, clear).
            3.  Send to `DAILY_SUMMARY_CHANNEL_ID`. If no events, send "No events scheduled for today."
    *   **Testing:**
        *   Trigger summary manually (or wait for test schedule). Verify message in Discord.
        *   Test with events and with no events.

*   **Step 5.1.4: Update `next_occurrence` for Processed Recurring Events**
    *   **Goal:** After including a recurring event in the summary, update its `next_occurrence` in `recurring_patterns`.
    *   **Implementation:**
        *   In the daily summary job, after fetching events:
            *   For each recurring event included in the summary:
                1.  Get its `event_id` and current `next_occurrence` (which is today).
                2.  Use `calculateNextOccurrence()` (from 4.4.4) with its `events.recurrence_pattern`, today's date as `lastOccurrence`, and `events.recurrence_end_date`.
                3.  If a new `next_occurrence` exists, call `updateNextOccurrence()` for its entry in `recurring_patterns`.
                4.  If no new `next_occurrence` (e.g., recurrence ended), mark the `recurring_patterns` entry as inactive or delete it, or mark the parent `event` as inactive if the recurrence was its only purpose. For now, just stop updating if `calculateNextOccurrence` returns null.
    *   **Testing:**
        *   Run daily summary. Check that `next_occurrence` for relevant recurring events in `recurring_patterns` table is advanced to their next actual date.
        *   Test with recurring events that should end.

### Chunk 5.2: Advanced Querying and Polish

*   **Step 5.2.1: Person-based and Category-based Queries**
    *   **Goal:** Enhance query capabilities for "What's coming up for Sarah?", "What allergies do we have?".
    *   **Implementation:**
        *   Extend `analyzeFactQuery` and `analyzeEventQuery` (or a combined query analyzer) to reliably extract `person` and `category` filters.
        *   Update `findFacts` and `findEvents` to use these parameters.
        *   For "What do I know about David?", query both facts (`person='David'`) and events (`person='David'`).
    *   **Testing:**
        *   Add data. Test queries like "What's up with Sarah next week?", "Any health facts for Mom?".

*   **Step 5.2.2: Combined Queries and Keyword Search**
    *   **Goal:** Support "Anything about dentist?", "Everything about Sarah".
    *   **Implementation:**
        *   LLM query analysis should identify if a keyword search is needed across descriptions, subjects, values, etc.
        *   `findFacts` and `findEvents` should support `LIKE %keyword%` searches on relevant text fields.
        *   For "Everything about Sarah", query facts and events for Sarah, sort events chronologically, facts by relevance (or just list them).
    *   **Testing:** Test broad keyword searches and combined queries.

*   **Step 5.2.3: Comprehensive Error Handling**
    *   **Goal:** Implement robust error handling across the application.
    *   **Implementation:**
        *   **Input Validation:** Gracefully handle malformed dates (ask for clarification), missing info (prompt user).
        *   **Database Errors:** Use transactions for multi-step DB operations. Log errors. User-friendly messages.
        *   **LLM Errors:** Retry logic (exponential backoff) for API calls. Log errors. Fallback if LLM is down (e.g., "Sorry, I'm having trouble understanding right now.").
        *   **Discord Connection:** Ensure reconnection logic is sound. Log API errors.
    *   **Testing:**
        *   Simulate LLM API errors, DB errors.
        *   Send invalid inputs.
        *   Test bot's behavior during Discord disconnects/reconnects.

*   **Step 5.2.4: Logging and Monitoring**
    *   **Goal:** Implement basic logging for diagnostics.
    *   **Implementation:**
        *   Use a simple logger (e.g., `console.log` structured, or a library like `pino`).
        *   Log key events: bot startup, DB connection, LLM requests/responses (summary), errors, daily summary execution.
    *   **Testing:** Review logs during normal operation and error conditions.

## Testing Plan (Reiteration from Spec, integrated into steps)

*   **Unit Tests:** Each module/function (date parsing, DB operations, LLM interaction wrappers, recurrence calculation) should have unit tests. Mock external dependencies.
*   **Integration Tests:** Test interactions between components (e.g., message -> LLM -> DB -> response).
*   **Manual Testing Scenarios:** Cover all user stories and edge cases described in the spec. This is ongoing throughout development.

## Environment Variables (Reiteration)
Ensure all specified environment variables are used and documented.

## Security Considerations (Reiteration)
*   API keys via env vars.
*   Parameterized SQL queries.
*   Input sanitization (though LLM interaction might reduce direct risks, still good practice if LLM output is used in sensitive ways beyond DB).
*   Rate limiting for LLM (if Vercel AI SDK doesn't handle it, or if you hit limits).

This detailed blueprint provides a structured path. Each step is designed to be a concrete unit of work, leading to a functional and testable increment of the personal assistant bot. Remember to commit frequently and write tests as you go!
