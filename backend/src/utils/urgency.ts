export function calculateUrgency(deadline: Date | null, priority: 'LOW' | 'MEDIUM' | 'HIGH', subtaskCount: number): number {
  let score = 0.2; // Base baseline
  
  if (priority === 'HIGH') score += 0.3;
  if (priority === 'MEDIUM') score += 0.15;
  
  score += Math.min(subtaskCount * 0.05, 0.2);
  
  if (deadline) {
    const hoursUntil = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil < 0) {
      score += 0.5; // Overdue overrides
    } else if (hoursUntil < 24) {
      // Exponential decay: e^(-0.1 * x)
      const timeUrgency = Math.exp(-0.1 * hoursUntil) * 0.5;
      score += timeUrgency;
    }
  }
  
  return Math.min(Math.max(score, 0), 1);
}
