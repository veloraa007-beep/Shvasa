# Shvasa Core Rules

1. **Prioritize the Mission**: Shvasa is an AI-powered focus, discipline, and task execution system. It is NOT a generic to-do list app.
2. **AI Layer**: Strict isolation and typing for AI I/O; Zod handles schema.
3. **Database Rules**: Never delete raw transcription data. All task saves run through conflict checks first.
4. **Design Rules**: Adhere exclusively to the "Organic Luxury" palette:
   - Primary (Forest): `#2D5A27`
   - Background (Cream): `#FDFBF7`
   - Surface (Earth): `#F5EDD8`
   - Accent (Leaf): `#7DBF6E`
   - Text (Bark): `#3A2E1E`
   Keep it calm, minimal, bento-grid based, and premium.
5. **No Any Types**: Absolute strict TypeScript compliance.
6. **Data Fetching via Query**: Purely React Query; no raw local `useEffect` fetching blocks.
7. **Security First**: 0 secrets in client-side code. All integration tokens MUST be encrypted with `CREDENTIALS_KEY`. All API routes must be protected by Supabase Auth sessions.
8. **Consistent Experience**: Maintain ONE consistent product system across all 15 pages (Dashboard, Focus, Progress, etc). Do not introduce random themes per page.

---

# Multi-Agent Workflow Boundaries

Shvasa codebase generation is strictly split down the middle to avoid collisions.

### 🔴 Gemini Constraints (Frontend Ownership)
- **Do not** generate API routes, database logic, or AI prompt code — those live in the backend.
- **You own**: Visual components, animations (Bloom SVG), page layouts (15 core routes), Tailwind tokens, Framer Motion.
- Always build against the exported `openapi.yaml` contract and shared Zod types `shared/schemas/index.ts`.

### 🔵 Claude Constraints (Backend Ownership)
- **Do not** generate UI components or Tailwind styles — those are handled separately.
- **You own**: API routes, Zod schemas, Prisma/Supabase models, AI prompts, urgency logic, cron jobs, integrations, and TaskEvent-based analytics.
- Integration credentials MUST be AES-256 encrypted using a `CREDENTIALS_KEY`. No raw tokens in DB.
- Task assignments MUST pass the Workload Balancer check.
- **Build Order**: schema migrations → integration layer → analytics API → collaboration endpoints.
- The backend always leads.

### 🚨 For ALL Agents
- Both tools must read `AGENTS.md` and `DATABASE_SCHEMA.md` first upon starting a session. Always check the API contract.
- Always use the append-only `TaskEvent` table for any state change audit trails.

