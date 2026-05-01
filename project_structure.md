/taskly
  /frontend           # Next.js 14 App Router, Tailwind, Framer Motion
    /src
      /app            # Pages (/dashboard, /onboarding, /focus, /capture)
      /components     # Specific UI blocks (GardenView, VoiceCapture)
      /themes         # JSON definitions for all 9 nature themes
  /backend            # Node.js + Express API on Railway
    /src
      /routes         # API endpoints following v3.0 routing spec
      /services       # AI prompt implementations (1-6)
      /middleware     # Supabase JWT & Rate limiting
    /prisma           # Relational schema (SEED|PLANT|TREE lifecycle)
  /shared             # Shared Zod types for strict multi-agent handshake
  /ai                 # Prompt engineering templates and logic
  /jobs               # Inngest event handlers and scheduled functions
