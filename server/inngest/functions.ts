import { Inngest } from "inngest";

// Simple Inngest client for Taskly v3.0
export const inngest = new Inngest({ id: "taskly-v3" });

// 1. Urgency score recalculation — every 15 min
export const recalculateUrgency = inngest.createFunction(
  { id: "recalculate-urgency", name: "recalculate-urgency" },
  { cron: "*/15 * * * *" },
  async ({ step }) => {
    // Logic to fetch all non-TREE tasks and update urgency_score
    // This would typically involve a loop or batch update via Prisma
    return { status: "success", message: "Urgency scores recalculated" };
  }
);

// 2. Daily brief generation
export const generateDailyBrief = inngest.createFunction(
  { id: "generate-daily-brief", name: "generate-daily-brief" },
  { event: "taskly/brief.scheduled" },
  async ({ event, step }) => {
    // Logic to call GPT-4o with Prompt 5 and send via Resend
    // Step: fetch user tasks, fetch patterns, call OpenAI, send email
    return { status: "success", user_id: event.data.user_id };
  }
);

// 3. Reminder dispatch
export const dispatchReminder = inngest.createFunction(
  { id: "dispatch-reminder", name: "dispatch-reminder" },
  { event: "taskly/reminder.fire" },
  async ({ event, step }) => {
    // Route to correct channel (PUSH | EMAIL | SLACK | WHATSAPP)
    return { status: "success", reminder_id: event.data.reminder_id };
  }
);
