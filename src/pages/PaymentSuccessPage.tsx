// src/pages/PaymentSuccessPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPaymentStatus } from '@/api/payment';
import { sendMetricGoal } from '@/utils/metrics';
import { Button, Alert } from '@/components/ui';
import { Loader2 } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Не передан идентификатор заказа');
      setLoading(false);
      return;
    }
    const checkPayment = async () => {
      try {
        const data = await getPaymentStatus(orderId);
        setStatus(data.status);
        if (data.status === 'succeeded') {
          if (!localStorage.getItem('payment_success_sent')) {
            sendMetricGoal('payment_success');
            localStorage.setItem('payment_success_sent', 'true');
          }
        }
      } catch (err) {
        setError('Не удалось проверить статус платежа');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkPayment();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="error">{error}</Alert>
        <Link to="/dashboard">
          <Button className="mt-4">Вернуться в личный кабинет</Button>
        </Link>
      </div>
    );
  }

  if (status === 'succeeded') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold">Оплата прошла успешно!</h1>
        <p className="mt-2 text-gray-600">Спасибо за покупку. Ваш тариф активирован.</p>
        <Link to="/dashboard">
          <Button className="mt-6">Перейти в личный кабинет</Button>
        </Link>
      </div>
    );
  }

  if (status === 'pending' || status === 'canceled') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold">Статус платежа: {status}</h1>
        <p className="mt-2 text-gray-600">Платёж ещё не завершён или отменён.</p>
        <Link to="/dashboard">
          <Button className="mt-6">Вернуться в личный кабинет</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold">Неизвестный статус</h1>
      <Link to="/dashboard">
        <Button className="mt-6">Вернуться в личный кабинет</Button>
      </Link>
    </div>
  );
};

export default PaymentSuccessPage;