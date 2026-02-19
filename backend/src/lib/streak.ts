/**
 * Streak calculation: compare last scan date to current date.
 * - No previous scans -> streak = 1
 * - Last scan yesterday -> increment streak
 * - Last scan today -> streak unchanged
 * - Last scan > 1 day ago -> reset to 1
 */

export function calculateNewStreak(lastScanDate: Date | null, today: Date = new Date()): number {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!lastScanDate) return 1;

  const lastScanStart = new Date(
    lastScanDate.getFullYear(),
    lastScanDate.getMonth(),
    lastScanDate.getDate()
  );
  const diffMs = todayStart.getTime() - lastScanStart.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 0; // unchanged (caller will keep current streak)
  if (diffDays === 1) return 1; // increment by 1
  return -1; // reset to 1
}

export function applyStreakChange(currentStreak: number, change: number): number {
  if (change === 0) return currentStreak;
  if (change === -1) return 1;
  return currentStreak + change;
}
