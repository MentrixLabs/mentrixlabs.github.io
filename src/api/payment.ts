// src/api/payment.ts
import client from './client';

export interface ReceiptItem {
  description: string;
  quantity: number;
  amount: number;
  vat_code?: number; // по умолчанию 1
}

export interface CreatePaymentRequest {
  amount: number;
  description: string;
  items?: ReceiptItem[];   // список товаров для чека
  email?: string;          // email покупателя
}

export interface CreatePaymentResponse {
  order_id: string;
  payment_id: string;
  confirmation_url: string;
  status: string;
}

export const createPayment = async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
  const response = await client.post<CreatePaymentResponse>('/payment/create', data);
  return response.data;
};