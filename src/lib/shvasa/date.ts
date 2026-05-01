export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function isToday(isoDate: string) {
  return isoDate.slice(0, 10) === todayKey();
}

export function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

