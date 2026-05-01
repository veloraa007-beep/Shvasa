import { AppSnapshot, DailyTask, FocusSession, Streak, UserProfile } from './types';
import { todayKey } from './date';

const storageKey = (userId: string) => `shvasa:${userId}`;

function defaultStreak(userId: string): Streak {
  return {
    user_id: userId,
    current_streak: 0,
    last_completed_date: null,
  };
}

export function createDefaultTasks(userId: string): DailyTask[] {
  const now = new Date().toISOString();

  return [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      title: 'Choose the first task that moves today forward',
      deadline: null,
      priority: 'high',
      status: 'todo',
      created_at: now,
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      title: 'Clear one small blocker',
      deadline: null,
      priority: 'med',
      status: 'todo',
      created_at: now,
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      title: 'Close the day with one clean finish',
      deadline: null,
      priority: 'low',
      status: 'todo',
      created_at: now,
    },
  ];
}

export function readSnapshot(userId: string): AppSnapshot {
  if (typeof window === 'undefined') {
    return { profile: null, tasks: [], sessions: [], streak: defaultStreak(userId) };
  }

  const raw = window.localStorage.getItem(storageKey(userId));
  if (!raw) {
    const snapshot = {
      profile: null,
      tasks: createDefaultTasks(userId),
      sessions: [],
      streak: defaultStreak(userId),
    };
    writeSnapshot(userId, snapshot);
    return snapshot;
  }

  const parsed = JSON.parse(raw) as AppSnapshot;
  const todaysTasks = parsed.tasks.filter((task) => task.created_at.slice(0, 10) === todayKey());

  if (todaysTasks.length === 3) {
    return { ...parsed, tasks: todaysTasks };
  }

  const snapshot = {
    ...parsed,
    tasks: createDefaultTasks(userId),
    streak: parsed.streak ?? defaultStreak(userId),
  };
  writeSnapshot(userId, snapshot);
  return snapshot;
}

export function writeSnapshot(userId: string, snapshot: AppSnapshot) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify(snapshot));
}

export function upsertProfile(userId: string, profile: UserProfile) {
  const snapshot = readSnapshot(userId);
  writeSnapshot(userId, { ...snapshot, profile });
}

export function upsertTasks(userId: string, tasks: DailyTask[]) {
  const snapshot = readSnapshot(userId);
  writeSnapshot(userId, { ...snapshot, tasks: tasks.slice(0, 3) });
}

export function addFocusSession(userId: string, session: FocusSession) {
  const snapshot = readSnapshot(userId);
  writeSnapshot(userId, { ...snapshot, sessions: [session, ...snapshot.sessions] });
}

export function updateStreak(userId: string, streak: Streak) {
  const snapshot = readSnapshot(userId);
  writeSnapshot(userId, { ...snapshot, streak });
}

