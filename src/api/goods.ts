import client from './client';
import { GoodsItem, PaginatedResponse } from './types';

interface CreateGoodsData {
  name: string;
  description?: string;
  url: string;
}

interface UpdateGoodsData {
  name?: string;
  description?: string;
  url?: string;
}

export const getGoodsList = async (
  page: number = 1,
  size: number = 20,
): Promise<PaginatedResponse<GoodsItem>> => {
  try {
    const response = await client.get('/goods', { params: { page, size } });
    const data = response.data;

    // Если бэкенд вернул массив – это список товаров без пагинации
    if (Array.isArray(data)) {
      return {
        items: data,
        total: data.length,
        page: page,
        size: size,
        pages: Math.ceil(data.length / size) || 1,
      };
    }

    // Если бэкенд вернул объект с пагинацией (ожидаемая структура)
    if (data && typeof data === 'object' && Array.isArray(data.items)) {
      const totalItems = data.total ?? data.items.length;
      return {
        items: data.items,
        total: data.total ?? data.items.length,
        page: data.page ?? page,
        size: data.size ?? size,
        pages: data.pages ?? (totalItems > 0 ? Math.ceil(totalItems / size) : 0),
      };
    }

    // Если ничего не подошло – возвращаем пустой массив
    return {
      items: [],
      total: 0,
      page,
      size,
      pages: 0,
    };
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    return {
      items: [],
      total: 0,
      page,
      size,
      pages: 0,
    };
  }
};

export const getGoodsById = async (id: string): Promise<GoodsItem> => {
  const response = await client.get<GoodsItem>(`/goods/${id}`);
  return response.data;
};

export const createGoods = async (data: CreateGoodsData): Promise<GoodsItem> => {
  const response = await client.post<GoodsItem>('/goods', data);
  return response.data;
};

export const updateGoods = async (
  id: string,
  data: UpdateGoodsData,
): Promise<GoodsItem> => {
  const response = await client.put<GoodsItem>(`/goods/${id}`, data);
  return response.data;
};

export const deleteGoods = async (id: string): Promise<void> => {
  await client.delete(`/goods/${id}`);
};

export const updateStockHistory = async (
  goodsId: number,
  entries: { record_date: string; fbs_count: number }[]
): Promise<void> => {
  await client.post(`/goods/${goodsId}/stock-history`, { entries });
};

export const reparseGoods = async (id: string): Promise<void> => {
  await client.post(`/goods/${id}/reparse`);
};