// src/api/payment.ts
import client from './client';

export interface ReceiptItem {
  description: string;
  quantity: number;
  amount: number;
  vat_code?: number;
}

export interface CreatePaymentRequest {
  amount: number;
  description: string;
  items?: ReceiptItem[];
  email?: string;
}

export interface CreatePaymentResponse {
  order_id: string;
  payment_id: string;
  confirmation_url: string;
  status: string;
}

export interface PaymentStatusResponse {
  order_id: string;
  status: string;
  amount: number;
  created_at: string;
  description: string;
}

export const createPayment = async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
  const response = await client.post<CreatePaymentResponse>('/payment/create', data);
  return response.data;
};

export const getPaymentStatus = async (orderId: string): Promise<PaymentStatusResponse> => {
  const response = await client.get<PaymentStatusResponse>(`/payment/status/${orderId}`);
  return response.data;
};