// src/pages/Dashboard/GoodsDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { SelectableImageGrid } from '@/components/ui';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import type { GoodsItem, SeoDataResponse, SeoHistoryResponse } from '@/api/types';
import { generateSeo, getSeoHistory } from '@/api/seo';
import { generateInfographics, getInfographicsByGoodsId, enhanceInfographics } from '@/api/infographics';
import { Alert, Button, Card, CardContent } from '@/components/ui';
import { reparseGoods } from '@/api/goods';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { sendMetricGoal } from '@/utils/metrics'
import {
  ArrowLeft,
  Package,
  FileText,
  Image,
  BarChart3,
  Loader2,
  Sparkles,
  Wand2,
  Save,
  Search,
  CheckCircle,
  XCircle,
  Star,
  ExternalLink,
  Hash,
  Tag,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

type TabType = 'info' | 'seo' | 'infographics' | 'reports';

const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='50' font-size='12' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EНет фото%3C/text%3E%3C/svg%3E";

// ---- Вкладка "Информация" ----
const InfoTab: React.FC<{ goodsItem: GoodsItem }> = ({ goodsItem }) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const allImages = [...(goodsItem.main_imgs || []), ...(goodsItem.desc_imgs || [])];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Основная информация</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Название</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Артикул (ID)</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.id || '—'}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Бренд</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.brand || '—'}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Продавец</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.provider || '—'}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Категория</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.category || '—'}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Цена</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">
            {goodsItem.price ? `${goodsItem.price} ₽` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Оригинальная цена</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">
            {goodsItem.original_price ? `${goodsItem.original_price} ${goodsItem.currency || '₽'}` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Рейтинг</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">
            {goodsItem.rating ? (
              <span className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                {goodsItem.rating}
              </span>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Количество отзывов</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{goodsItem.reviews_count || '—'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</dt>
          <dd className="mt-1">
            <a
              href={goodsItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {goodsItem.url}
              <ExternalLink size={14} />
            </a>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Описание</dt>
          <dd className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">
            {goodsItem.description || 'Нет описания'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Создан</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{formatDate(goodsItem.created_at)}</dd>
        </div>
        {goodsItem.updated_at && (
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Обновлён</dt>
            <dd className="mt-1 text-gray-900 dark:text-white">{formatDate(goodsItem.updated_at)}</dd>
          </div>
        )}
      </dl>

      {allImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Изображения товара</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allImages.map((url, idx) => (
              <div key={idx} className="relative">
                <img
                  src={url}
                  alt={`Изображение ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  onError={(e) => (e.currentTarget.src = placeholderImage)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Вкладка "SEO" ----
const SeoTab: React.FC<{ goodsItem: GoodsItem }> = ({ goodsItem }) => {
  const goodsId = goodsItem.id;
  const [seoHistory, setSeoHistory] = useState<SeoHistoryResponse | null>(null);
  const [generatedSeo, setGeneratedSeo] = useState<SeoDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка истории при монтировании
  useEffect(() => {
    const load = async () => {
      try {
        const history = await getSeoHistory(goodsId);
        setSeoHistory(history);
        if (history.generated) {
          setGeneratedSeo(history.generated);
        }
      } catch (err) {
        console.error('Ошибка загрузки SEO истории:', err);
      }
    };
    load();
  }, [goodsId]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateSeo({ goods_id: goodsId });
      setGeneratedSeo(result);
      sendMetricGoal('seo_generation')
      const history = await getSeoHistory(goodsId);
      setSeoHistory(history);
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка генерации SEO'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO-оптимизация</h3>
        <Button onClick={handleGenerate} isLoading={loading}>
          {!loading && <Sparkles size={18} className="mr-2" aria-hidden="true" />}
          {loading ? 'Генерация...' : 'Сгенерировать SEO'}
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {generatedSeo ? (
        <div className="space-y-4">
          <dl className="space-y-4">
            <div>
              <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Заголовок</dt>
              <dd className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-900 dark:text-white">
                {generatedSeo.title}
              </dd>
            </div>
            <div>
              <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Описание</dt>
              <dd className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-900 dark:text-white whitespace-pre-wrap">
                {generatedSeo.description}
              </dd>
            </div>
            <div>
              <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ключевые слова</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {generatedSeo.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {kw}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">SEO ещё не сгенерировано.</p>
      )}

      {seoHistory?.summary && (
        <div>
          <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Сводка</dt>
          <dd className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-900 dark:text-white">
            {seoHistory.summary}
          </dd>
        </div>
      )}

      {seoHistory?.competitors && seoHistory.competitors.length > 0 && (
        <div>
          <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">SEO конкурентов</dt>
          <div className="mt-1 space-y-2">
            {seoHistory.competitors.map((comp, idx) => (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded">
                <p className="text-sm font-medium">{comp.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{comp.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ключевые слова: {comp.keywords.join(', ')}
                </p>
                {comp.url && (
                  <a
                    href={comp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-xs hover:underline"
                  >
                    Ссылка на товар
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Вкладка "Инфографика" ----
const InfographicsTab: React.FC<{ goodsItem: GoodsItem; onUpdate?: () => void }> = ({
  goodsItem,
  onUpdate,
}) => {  
  const goodsId = goodsItem.id; // string

  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка сохранённых изображений при монтировании
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInfographicsByGoodsId(goodsId);
        const all = [...(data.generated_images || []), ...(data.enhanced_images || [])];
        setSavedImages(all);
        setSelectedImages([]);
      } catch (err) {
        console.error('Ошибка загрузки инфографики:', err);
      }
    };
    load();
  }, [goodsId]);

  // Генерация новых изображений (Kandinsky)
  const handleGenerate = async (count = 1) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await generateInfographics({ goods_id: Number(goodsId), count });
      setGeneratedImages(result.images);
      sendMetricGoal('infographic_generation')
      // После генерации обновляем сохранённые (они уже сохранились на бэкенде)
      const updated = await getInfographicsByGoodsId(goodsId);
      const all = [...(updated.generated_images || []), ...(updated.enhanced_images || [])];
      setSavedImages(all);
      setSuccess(`Сгенерировано ${result.images.length} изображений`);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка генерации инфографики'));
    } finally {
      setLoading(false);
    }
  };

  // Улучшение (коллаж + текст)
  const handleEnhance = async (count = 1) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await enhanceInfographics({ goods_id: Number(goodsId), count });
      // Обновляем сохранённые
      const updated = await getInfographicsByGoodsId(goodsId);
      const all = [...(updated.generated_images || []), ...(updated.enhanced_images || [])];
      setSavedImages(all);
      setSuccess('Изображения улучшены');
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка улучшения инфографики'));
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const allImages = savedImages;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => handleGenerate(1)} isLoading={loading}>
          {!loading && <Sparkles size={18} className="mr-2" aria-hidden="true" />}
          {loading ? 'Генерация...' : 'Сгенерировать'}
        </Button>
        <Button variant="outline" onClick={() => handleEnhance(1)} isLoading={loading}>
          {!loading && <Wand2 size={18} className="mr-2" aria-hidden="true" />}
          Улучшить
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {allImages.length === 0 && !loading && (
        <p className="text-gray-500 dark:text-gray-400">Нет сохранённой инфографики. Нажмите «Сгенерировать».</p>
      )}

      {allImages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <SelectableImageGrid
              images={allImages}
              selected={selectedImages}
              onToggle={toggleSelect}
              getAlt={(url) => `Инфографика ${url.slice(0, 10)}`}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ---- Вкладка "Отчёты" ----
const ReportsTab: React.FC<{ goodsItem: GoodsItem }> = ({ goodsItem }) => {
  const navigate = useNavigate();
  const allImages = [...(goodsItem.main_imgs || []), ...(goodsItem.desc_imgs || [])];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Отчёты по товару</h3>
        <Button onClick={() => navigate(`/reports?goods_id=${goodsItem.id}`)}>
          <BarChart3 size={18} className="mr-2" aria-hidden="true" />
          Перейти к отчётам
        </Button>
      </div>
      <p className="text-gray-500 dark:text-gray-400">
        Здесь будут отображаться сгенерированные отчёты для данного товара. Перейдите в раздел
        «Отчёты» для просмотра и создания новых.
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
          SEO-генераций: {1} {/* заглушка */}
        </span>
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
          Изображений: {allImages.length}
        </span>
      </div>
    </div>
  );
};

// ---- Основной компонент страницы ----
const GoodsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGoods, loading: goodsLoading, error: goodsError } = useGoods();

  const [goodsItem, setGoodsItem] = useState<GoodsItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const loadGoods = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const item = await getGoods(id);
      setGoodsItem(item);
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось загрузить товар'));
    } finally {
      setLoading(false);
    }
  }, [id, getGoods]);

  useEffect(() => {
    loadGoods();
  }, [loadGoods]);

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: 'Информация', icon: <Package size={18} aria-hidden="true" /> },
    { key: 'seo', label: 'SEO', icon: <FileText size={18} aria-hidden="true" /> },
    { key: 'infographics', label: 'Инфографика', icon: <Image size={18} aria-hidden="true" /> },
    { key: 'reports', label: 'Отчёты', icon: <BarChart3 size={18} aria-hidden="true" /> },
  ];

  if (loading || goodsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
          <p className="text-gray-500 dark:text-gray-400">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || goodsError || !goodsItem) {
    return (
      <div className="max-w-2xl">
        <Alert variant="error">
          <p className="font-medium">Товар не найден</p>
          {(error || goodsError) && <p className="mt-1">{error || goodsError}</p>}
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/goods')}>
            <ArrowLeft size={18} className="mr-2" aria-hidden="true" />
            Назад к списку
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Навигация назад */}
      <button
        onClick={() => navigate('/goods')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Назад к списку товаров
      </button>

      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{goodsItem.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Артикул: {goodsItem.id || '—'} • Категория: {goodsItem.category || '—'} • Цена:{' '}
            {goodsItem.price ? `${goodsItem.price} ₽` : '—'}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            if (!goodsItem) return;
            try {
              await reparseGoods(goodsItem.id);
              await loadGoods();
              // Можно добавить уведомление об успехе
            } catch (err) {
              setError(getErrorMessage(err, 'Ошибка перепарсинга товара'));
            }
          }}
        >
          <RefreshCw size={18} className="mr-2" aria-hidden="true" />
          Обновить данные
        </Button>
      </div>

      {/* Вкладки */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 overflow-x-auto" aria-label="Разделы товара">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? 'true' : undefined}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Содержимое вкладок */}
      <Card>
        <CardContent className="p-6">
          {activeTab === 'info' && <InfoTab goodsItem={goodsItem} />}
          {activeTab === 'seo' && <SeoTab goodsItem={goodsItem} />}
          {activeTab === 'infographics' && <InfographicsTab goodsItem={goodsItem} onUpdate={loadGoods} />}
          {activeTab === 'reports' && <ReportsTab goodsItem={goodsItem} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoodsDetailPage;