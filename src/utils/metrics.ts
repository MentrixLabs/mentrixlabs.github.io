// src/utils/metrics.ts
export const sendMetricGoal = (goalName: string): void => {
  if (typeof window !== 'undefined' && (window as any).ym) {
    (window as any).ym(111940922, 'reachGoal', goalName);
  } else {
    console.warn('YM not loaded, goal not sent:', goalName);
  }
};