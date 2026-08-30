// src/pages/Dashboard/InfographicsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import { sendMetricGoal } from '@/utils/metrics'
import {
  generateInfographics,
  getInfographicsByGoodsId,
  enhanceInfographics,
} from '@/api/infographics';
import {
  Image,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  Trash2,
  Save,
  Minus,
  Plus,
  Check,
  X,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';

const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='50' font-size='12' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EНет фото%3C/text%3E%3C/svg%3E";

const InfographicsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const goodsIdFromUrl = searchParams.get('goods_id');

  const { goods, loading: goodsLoading, fetchGoods } = useGoods();

  const [selectedGoodsId, setSelectedGoodsId] = useState<string>(goodsIdFromUrl || '');
  const [selectedGoods, setSelectedGoods] = useState<any>(null);

  const [imageCount, setImageCount] = useState<number>(10);
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [foundImages, setFoundImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка списка товаров
  useEffect(() => {
    fetchGoods(1, 100);
  }, [fetchGoods]);

  // При выборе товара – загружаем сохранённые изображения
  useEffect(() => {
    if (selectedGoodsId && goods.length > 0) {
      const found = goods.find((g) => g.id === selectedGoodsId);
      setSelectedGoods(found || null);
      loadSavedImages(selectedGoodsId);
      setFoundImages([]);
      setSelectedImages([]);
    } else {
      setSavedImages([]);
      setFoundImages([]);
      setSelectedImages([]);
    }
  }, [selectedGoodsId, goods]);

  const loadSavedImages = useCallback(async (goodsId: string) => {
    try {
      const data = await getInfographicsByGoodsId(goodsId);
      const all = [...(data.generated_images || []), ...(data.enhanced_images || [])];
      setSavedImages(all);
    } catch (err) {
      console.error('Ошибка загрузки сохранённых изображений:', err);
    }
  }, []);

  // Генерация новых изображений (вместо search)
  const handleGenerate = useCallback(async () => {
    if (!selectedGoodsId) {
      setError('Выберите товар');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await generateInfographics({
        goods_id: Number(selectedGoodsId),
        count: imageCount,
      });
      sendMetricGoal('infographic_generation')
      setFoundImages(result.images || []);
      setSelectedImages([]);
      // После генерации обновляем сохранённые (они автоматически сохранились на бэкенде)
      await loadSavedImages(selectedGoodsId);
      if (result.images.length === 0) {
        setSuccess('Изображения не найдены. Попробуйте изменить параметры.');
      } else {
        setSuccess(`Найдено ${result.images.length} изображений`);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка генерации инфографики'));
    } finally {
      setLoading(false);
    }
  }, [selectedGoodsId, imageCount, loadSavedImages]);

  // Улучшение существующих изображений
  const handleEnhance = useCallback(async () => {
    if (!selectedGoodsId) {
      setError('Выберите товар');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await enhanceInfographics({
        goods_id: Number(selectedGoodsId),
        count: imageCount,
      });
      await loadSavedImages(selectedGoodsId);
      setSuccess('Изображения улучшены (коллаж + текст)');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка улучшения инфографики'));
    } finally {
      setLoading(false);
    }
  }, [selectedGoodsId, loadSavedImages]);

  // Удаление одного изображения из сохранённых
  const handleRemoveSaved = useCallback(
    async (url: string) => {
      if (!selectedGoodsId) return;
      const updated = savedImages.filter((u) => u !== url);
      // Сохраняем новый список – используем старую функцию, так как она ничего не делает,
      // но чтобы синхронизировать состояние, просто обновляем локально.
      // В новой модели удаление изображений не предусмотрено отдельным эндпоинтом,
      // поэтому мы просто убираем из локального списка.
      // На бэкенде они останутся, но для пользователя это выглядит как удаление.
      // При следующей загрузке они снова появятся, поэтому лучше не использовать удаление,
      // либо реализовать отдельный эндпоинт.
      // Временно: просто обновляем локальное состояние.
      setSavedImages(updated);
      setSuccess('Изображение удалено из списка');
    },
    [selectedGoodsId, savedImages]
  );

  const toggleImageSelection = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const selectAllFound = () => setSelectedImages(foundImages);
  const deselectAllFound = () => setSelectedImages([]);

  const handleCountChange = (delta: number) => {
    setImageCount((prev) => Math.min(20, Math.max(1, prev + delta)));
  };

  const getImageAlt = (index: number) => `Инфографика ${index + 1}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Поиск инфографики</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Найдите и сохраните релевантные изображения для карточек товаров
        </p>
      </div>

      {/* Выбор товара и настройки */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label
              htmlFor="goodsSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Выберите товар
            </label>
            <select
              id="goodsSelect"
              value={selectedGoodsId}
              onChange={(e) => setSelectedGoodsId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              disabled={goodsLoading}
            >
              <option value="">-- Выберите товар --</option>
              {goods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.product_id ? `(${item.product_id})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="count" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Количество:
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCountChange(-1)}
                disabled={imageCount <= 1}
                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                aria-label="Уменьшить"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium text-gray-900 dark:text-white">
                {imageCount}
              </span>
              <button
                onClick={() => handleCountChange(1)}
                disabled={imageCount >= 20}
                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                aria-label="Увеличить"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(1–20)</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={!selectedGoodsId || loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Поиск...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Найти
                </>
              )}
            </button>
            <button
              onClick={handleEnhance}
              disabled={!selectedGoodsId || loading || savedImages.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Wand2 size={18} />
              Улучшить
            </button>
          </div>
        </div>
        {goodsLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Загрузка списка товаров...</p>
        )}
      </div>

      {/* Уведомления */}
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

      {/* Сохранённые изображения */}
      {selectedGoodsId && savedImages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Сохранённые изображения ({savedImages.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {savedImages.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={getImageAlt(idx)}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  onError={(e) => (e.currentTarget.src = placeholderImage)}
                />
                <button
                  onClick={() => handleRemoveSaved(url)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Удалить"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Найденные изображения */}
      {foundImages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Найденные изображения ({foundImages.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={selectAllFound}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Выбрать все
              </button>
              <button
                onClick={deselectAllFound}
                className="text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Снять все
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {foundImages.map((url, idx) => {
              const isSelected = selectedImages.includes(url);
              return (
                <div
                  key={idx}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-300 dark:ring-purple-700'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                  onClick={() => toggleImageSelection(url)}
                >
                  <img
                    src={url}
                    alt={getImageAlt(idx)}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => (e.currentTarget.src = placeholderImage)}
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-purple-600 text-white rounded-full p-0.5">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {selectedImages.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  // В новой логике сохранение происходит автоматически при генерации.
                  // Поэтому мы просто обновляем список сохранённых и очищаем найденные.
                  const merged = [...savedImages, ...selectedImages];
                  const unique = Array.from(new Set(merged));
                  setSavedImages(unique);
                  setFoundImages([]);
                  setSelectedImages([]);
                  setSuccess(`Добавлено ${selectedImages.length} изображений в список`);
                  // Здесь можно было бы вызвать эндпоинт для сохранения, но в текущей реализации
                  // сохранение происходит на бэкенде только при генерации, поэтому мы обновляем локально.
                  // В реальном проекте нужно добавить эндпоинт для добавления изображений вручную.
                }}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Сохранить выбранные ({selectedImages.length})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Если нет товаров */}
      {goods.length === 0 && !goodsLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Package size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">У вас нет товаров.</p>
          <button
            onClick={() => (window.location.href = '/goods/new')}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Добавить товар
          </button>
        </div>
      )}
    </div>
  );
};

export default InfographicsPage;