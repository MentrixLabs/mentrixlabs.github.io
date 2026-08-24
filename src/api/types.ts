
// Данные пользователя
export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  created_at: string;
}

// Типы для ответа /user/status
export interface PlanDetails {
  max_goods: number;
  max_seo_per_day: number;
  max_infographics_per_day: number;
  max_infographics_per_request: number;
  support_level: 'email' | 'phone' | 'full';
  api_access: boolean;
  priority_support: boolean;
  reports_format: 'basic' | 'pdf' | 'pdf_excel';
  features_labels: Record<string, boolean>;
}

export interface UserStatusResponse {
  total_goods: number;
  seo_today: number;
  infographics_today: number;
  plan: string; // 'free' | 'starter' | 'business'
  plan_details: PlanDetails;
}

// Данные товара (карточка) – соответствует новой схеме
export interface GoodsItem {
  id: string;
  name: string;
  description?: string;
  url: string;
  created_at: string;
  updated_at?: string;

  // Новые поля из парсера (сохраняются в ozon_items)
  product_id?: string;
  provider?: string;
  brand?: string;
  original_price?: number;
  currency?: string;
  rating?: number;
  reviews_count?: number;
  main_imgs?: string[];
  desc_imgs?: string[];

  // Поля из связанных таблиц
  category?: string;
  price?: number;
}

// Остальные типы остаются без изменений
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Данные для генерации SEO
export interface SeoGenerationRequest {
  goods_id: string;
  // дополнительные параметры (ключевые слова, стиль и т.п.)
}

export interface SeoGenerationResponse {
  title: string;
  description: string;
  keywords: string[];
  // возможно, другие текстовые блоки
}

export interface SeoDataResponse {
  title: string;
  description: string;
  keywords: string[];
}

export interface SeoCompetitorResponse {
  title: string;
  description: string;
  keywords: string[];
  url?: string;
}

export interface SeoHistoryResponse {
  generated: SeoDataResponse | null;
  summary: string | null;
  competitors: SeoCompetitorResponse[];
}

// Данные для поиска инфографики
export interface InfographicsSearchRequest {
  goods_id: string;
  count?: number; // от 1 до 20
}

export interface InfographicsSearchResponse {
  images: string[]; // URL-адреса изображений
}

// Данные отчёта
// src/api/types.ts

export interface Report {
  id: number;
  goods_id: number;
  created_at: string;
  seo_text?: string;
  infographics?: string[];
  forecast_data?: {
    days_to_out_of_stock?: string;
    price_dynamic?: string;
    forecast?: Array<{ date: string; price: number; demand: number; stock: number; }>;
    recommended_price?: number;
    revenue_forecast?: Array<{ date: string; revenue: number; }>;
    key_metrics?: {
      avg_price: number;
      max_price: number;
      min_price: number;
      volatility: number;
    };
    advertising_spend_ratio_forecast?: Array<{ date: string; value: number[]; }>;
    leads_forecast?: Array<{ date: string; value: number[]; }>;
    ctr_forecast?: Array<{ date: string; value: number[]; }>;
    advertising_spend_ratio_description?: string;
    leads_description?: string;
    ctr_description?: string;
    keywords?: string[];
    recommendations?: string;
  };
}

/**
 * Данные инфографики для товара (хранятся в БД)
 */
export interface InfographicsData {
  generated_images: string[];   // сгенерированные Kandinsky
  enhanced_images: string[];    // улучшенные (коллаж + текст)
}

/**
 * Запрос на генерацию инфографики
 */
export interface InfographicsGenerateRequest {
  goods_id: number;
  count?: number;               // количество изображений (по умолчанию 4)
}

/**
 * Ответ от генерации инфографики
 */
export interface InfographicsGenerateResponse {
  images: string[];             // массив data-url или ссылок
}

/**
 * Ответ от улучшения инфографики
 */
export interface InfographicsEnhanceResponse {
  enhanced: string[];           // массив улучшенных изображений
}

// ==================== ТИПЫ ДЛЯ СТАТИСТИКИ ====================

/**
 * Распределение контента (используется на дашборде)
 */
export interface ContentDistribution {
  seo: number;                  // количество товаров с SEO
  infographics: number;         // количество товаров с инфографикой
  reports: number;              // количество отчётов (пока заглушка)
}

/**
 * Недельная активность (для графика)
 */
export interface WeeklyActivity {
  day: string;                  // "Mon", "Tue"...
  seo: number;
  infographics: number;
}

/**
 * Рекомендации на неделю
 */
export interface Recommendation {
  target_seo: number;
  target_infographics: number;
}