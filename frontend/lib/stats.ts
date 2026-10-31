export const STATS_KEY = 'agrimatch_stats';

export type Stats = {
  ordersCount: number;
  membersCount: number;
}

const defaultStats: Stats = {
  ordersCount: 3,
  membersCount: 7,
};

export function getStats(): Stats {
  if (typeof window === 'undefined') return defaultStats;
  const stored = localStorage.getItem(STATS_KEY);
  if (!stored) {
    localStorage.setItem(STATS_KEY, JSON.stringify(defaultStats));
    return defaultStats;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return defaultStats;
  }
}

export function incrementOrdersCount() {
  if (typeof window === 'undefined') return;
  const stats = getStats();
  stats.ordersCount += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function incrementMembersCount() {
  if (typeof window === 'undefined') return;
  const stats = getStats();
  stats.membersCount += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
