// src/api/infographics.ts
import client from './client';
import type { InfographicsData } from './types';

export interface InfographicsRequest {
  goods_id: number;
  count?: number;
}

export interface InfographicsResponse {
  images: string[]; // массив data-url или ссылок
}

export interface InfographicsDataResponse {
  generated_images: string[];
  enhanced_images: string[];
}

// Генерация инфографики (Kandinsky)
export const generateInfographics = async (data: InfographicsRequest): Promise<InfographicsResponse> => {
  const response = await client.post<InfographicsResponse>('/infographics/generate', data);
  return response.data;
};

// Улучшение инфографики (коллаж + текст) – исправлен URL и тип данных
export const enhanceInfographics = async (data: InfographicsRequest): Promise<{ enhanced: string[] }> => {
  // Исправлена опечатка в URL (убрана лишняя кавычка)
  const response = await client.post<{ enhanced: string[] }>('/infographics/enhance', data);
  return response.data;
};

// Получение сохранённой инфографики для товара
export const getInfographicsByGoodsId = async (goods_id: string): Promise<InfographicsDataResponse> => {
  const response = await client.get<InfographicsDataResponse>(`/infographics/${goods_id}`);
  return response.data;
};

/**
 * @deprecated Используйте generateInfographics вместо searchInfographics.
 * Перенаправляет на /infographics/generate.
 */
export const searchInfographics = async (
  data: InfographicsRequest
): Promise<InfographicsResponse> => {
  console.warn('searchInfographics is deprecated, use generateInfographics instead.');
  const goodsId = typeof data.goods_id === 'string' ? parseInt(data.goods_id, 10) : data.goods_id;
  const result = await generateInfographics({ goods_id: goodsId, count: data.count || 4 });
  return { images: result.images };
};

/**
 * @deprecated Сохранение изображений теперь происходит автоматически при генерации/улучшении.
 * Эта функция оставлена для совместимости и ничего не делает, кроме логирования.
 */
export const saveInfographicsToGoods = async (
  goodsId: string,
  images: string[]
): Promise<{ success: boolean }> => {
  console.warn(
    'saveInfographicsToGoods is deprecated. Images are saved automatically during generation/enhancement.'
  );
  return { success: true };
};

/**
 * @deprecated Используйте getInfographicsByGoodsId вместо getGoodsInfographics.
 * Получение сохранённых изображений для товара (старый интерфейс – массив URL).
 */
export const getGoodsInfographics = async (goods_id: string): Promise<string[]> => {
  console.warn('getGoodsInfographics is deprecated, use getInfographicsByGoodsId instead.');
  const data = await getInfographicsByGoodsId(goods_id);
  // Объединяем все изображения в один массив
  return [...(data.generated_images || []), ...(data.enhanced_images || [])];
};