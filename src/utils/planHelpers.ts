// src/utils/planHelpers.ts
import type { UserStatusResponse } from '@/api/types';

export const canAddGoods = (status: UserStatusResponse): boolean => {
  if (!status) return false;
  return status.total_goods < status.plan_details.max_goods;
};

export const canGenerateSeo = (status: UserStatusResponse): boolean => {
  if (!status) return false;
  return status.seo_today < status.plan_details.max_seo_per_day;
};

export const canGenerateInfographics = (status: UserStatusResponse, requestedCount?: number): boolean => {
  if (!status) return false;
  if (requestedCount && requestedCount > status.plan_details.max_infographics_per_request) {
    return false;
  }
  return status.infographics_today < status.plan_details.max_infographics_per_day;
};

export const getPlanLimitMessage = (status: UserStatusResponse, action: 'add_goods' | 'generate_seo' | 'generate_infographics'): string => {
  const planName = status.plan;
  const details = status.plan_details;
  switch (action) {
    case 'add_goods':
      return `Превышен лимит товаров для тарифа "${planName}". Максимум: ${details.max_goods}.`;
    case 'generate_seo':
      return `Превышен дневной лимит SEO-генераций (${details.max_seo_per_day}) для тарифа "${planName}".`;
    case 'generate_infographics':
      return `Превышен дневной лимит инфографики (${details.max_infographics_per_day}) для тарифа "${planName}".`;
    default:
      return 'Превышен лимит.';
  }
};