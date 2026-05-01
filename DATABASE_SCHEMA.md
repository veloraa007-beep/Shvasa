# Taskly Database Schema Summary

This document serves as the single source of truth for the database schema so AI agents do not drift or create mismatching queries.

## Entities

### 1. User
- `id` (UUID, primary key)
- `email` (String, unique)
- `name` (String, optional)
- `voice_profile_json` (JSON, optional)
- `plan` (String, default: "free")
- `created_at` (DateTime)

### 2. Workspace
- `id` (UUID)
- `name` (String)
- `created_at` (DateTime)

### 3. WorkspaceMember
- `workspace_id` (UUID)
- `user_id` (UUID)
- `role` (String, default: "member")

### 4. Task
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to User)
- `workspace_id` (UUID, optional)
- `title` (String)
- `deadline` (DateTime, optional)
- `priority` (Enum: `LOW`, `MEDIUM`, `HIGH`)
- `status` (Enum: `TODO`, `IN_PROGRESS`, `DONE`, `ARCHIVED`)
- `urgency_score` (Float, range 0–1, recalculates frequently)
- `raw_transcript` (String, **immutable**)
- `ai_confidence` (Float, range 0–1)
- `created_at` (DateTime)

### 5. TaskEvent (**Append-Only**)
- `id` (UUID)
- `task_id` (UUID)
- `event_type` (Enum: `CREATED`, `STATUS_CHANGED`, `PRIORITY_CHANGED`, `SNOOZED`, `ASSIGNED`, `COMPLETED`, `DELETED`)
- `payload` (JSON, metadata/diffs)
- `created_at` (DateTime)

### 6. TaskAssignment
- `task_id` (UUID)
- `assignee_id` (UUID)
- `assigned_at` (DateTime)

### 7. Subtask

- `id` (UUID, primary key)
- `task_id` (UUID, foreign key to Task)
- `text` (String)
- `done` (Boolean, default: false)
- `order` (Integer, sequencing logic)

### 8. Reminder
- `id` (UUID, primary key)
- `task_id` (UUID, foreign key to Task)
- `fire_at` (DateTime)
- `type` (Enum: `PUSH`, `EMAIL`, `SMS`)
- `sent` (Boolean, default: false)

### 9. Integration
- `id` (UUID)
- `user_id` (UUID)
- `provider` (String)
- `encrypted_token` (String, AES-256)
- `encrypted_refresh` (String, AES-256, optional)

### 10. AIParseLog
- `id` (UUID, primary key)
- `task_id` (UUID, foreign key to Task, nullable)
- `raw_input` (String)
- `parsed_output` (JSON)
- `model` (String, default: "gpt-4o")
- `confidence` (Float)
- `ms_latency` (Integer)
- `created_at` (DateTime)

### 11. Notification
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to User)
- `task_id` (UUID, foreign key to Task, nullable)
- `type` (String)
- `read` (Boolean, default: false)
- `created_at` (DateTime)

