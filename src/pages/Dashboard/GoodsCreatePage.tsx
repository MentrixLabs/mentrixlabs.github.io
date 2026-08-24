// src/pages/Dashboard/GoodsCreatePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { canGenerateInfographics, canAddGoods, canGenerateSeo, getPlanLimitMessage } from '@/utils/planHelpers';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useUserStatus } from '@/hooks/useUserStatus';

const GoodsCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addGoods, loading: goodsLoading } = useGoods();

  const { status, loading: statusLoading, error: statusError } = useUserStatus();
  
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    const { status, loading: statusLoading, error: statusError } = useUserStatus();
          
    const [error, setError] = useState<string | null>(null);
    if (!status) {
      setError('Не удалось проверить лимиты. Попробуйте позже.');
      return;
    }
    // Проверка лимита с помощью утилиты
    if (!canAddGoods(status)) {
      setError(getPlanLimitMessage(status, 'add_goods'));
      setError(getErrorMessage(status, 'Ваш план не позволяет добавить больше товаров, чем есть сейчас'));
      return;
    }
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!url.trim()) {
      setError('URL товара обязателен');
      return;
    }
    try {
      new URL(url);
    } catch {
      setError('Введите корректный URL (например, https://www.ozon.ru/product/...)');
      return;
    }

    setIsSubmitting(true);
    try {
      // Передаём заглушку для name – бэкенд перезапишет её из данных парсинга
      await addGoods({
        name: url.trim(),
        description: '',
        url: url.trim(),
      });
      setSuccess('Товар успешно создан!');
      setTimeout(() => {
        navigate('/goods');
      }, 100000);
    } catch (err: any) {
      setError(err.message || 'Ошибка создания товара');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || goodsLoading;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/goods')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft size={18} />
        Назад к списку товаров
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Создание товара</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Добавьте новую карточку товара для оптимизации
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-start gap-3">
          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            URL товара <span className="text-red-500">*</span>
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.ozon.ru/product/..."
            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Укажите ссылку на карточку товара на маркетплейсе
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Создание...
              </>
            ) : (
              'Создать товар'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/goods')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            disabled={isLoading}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoodsCreatePage;