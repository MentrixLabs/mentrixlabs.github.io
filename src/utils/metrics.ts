const METRIKA_ID = 111940922;

export const sendMetricGoal = (goalName: string): void => {
  console.log('[YM] Отправляем цель:', goalName);

  if (typeof window === 'undefined') {
    console.error('[YM] Метрика не доступна');
    return;
  }

  if (typeof window.ym !== 'function') {
    console.error('[YM] Метрика не загружена');
    return;
  }

  window.ym(
    METRIKA_ID,
    'reachGoal',
    goalName
  );

  console.log('[YM] reachGoal вызван:', goalName);
};