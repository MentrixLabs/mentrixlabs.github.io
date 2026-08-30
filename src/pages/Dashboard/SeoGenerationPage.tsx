// src/pages/Dashboard/SeoGenerationPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import { generateSeo, getSeoHistory } from '@/api/seo';
import type { SeoGenerationResponse, SeoHistoryResponse } from '@/api/types';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  FormField,
  Select,
} from '@/components/ui';
import { Sparkles, Loader2, Package } from 'lucide-react';

import { sendMetricGoal } from '@/utils/metrics'

const SeoGenerationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goodsIdFromUrl = searchParams.get('goods_id');

  const { goods, loading: goodsLoading, error: goodsLoadError } = useGoods(1, 100);

  const [selectedGoodsId, setSelectedGoodsId] = useState<string>(goodsIdFromUrl || '');

  const [generatedSeo, setGeneratedSeo] = useState<SeoGenerationResponse | null>(null);
  const [seoHistory, setSeoHistory] = useState<SeoHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Загрузка истории SEO при выборе товара
  useEffect(() => {
    if (!selectedGoodsId) {
      setSeoHistory(null);
      setGeneratedSeo(null);
      setHistoryLoadError(null);
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setHistoryLoading(true);
      setHistoryLoadError(null);
      try {
        const history = await getSeoHistory(selectedGoodsId);
        if (cancelled) return;
        setSeoHistory(history);
        setGeneratedSeo(history.generated || null);
      } catch (err) {
        if (cancelled) return;
        setSeoHistory(null);
        setGeneratedSeo(null);
        setHistoryLoadError(getErrorMessage(err, 'Не удалось загрузить историю SEO'));
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedGoodsId]);

  // Генерация SEO
  const handleGenerate = useCallback(async () => {
    if (!selectedGoodsId) {
      setError('Выберите товар');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await generateSeo({ goods_id: selectedGoodsId });
      setGeneratedSeo(result);
      sendMetricGoal('seo_generation')
      // Обновляем историю
      const history = await getSeoHistory(selectedGoodsId);
      setSeoHistory(history);
      setSuccess('SEO успешно сгенерировано');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка генерации SEO'));
    } finally {
      setLoading(false);
    }
  }, [selectedGoodsId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Генерация SEO</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Создание заголовков, описаний и ключевых слов для карточек товаров с помощью AI
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <FormField id="goodsSelect" label="Выберите товар">
                {(fieldProps) => (
                  <Select
                    {...fieldProps}
                    value={selectedGoodsId}
                    onChange={(e) => setSelectedGoodsId(e.target.value)}
                    disabled={goodsLoading}
                  >
                    <option value="">-- Выберите товар --</option>
                    {goods.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} {item.id ? `(${item.id})` : ''}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!selectedGoodsId}
              isLoading={loading}
              className="whitespace-nowrap"
            >
              {!loading && <Sparkles size={18} className="mr-2" aria-hidden="true" />}
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </Button>
          </div>
          {goodsLoading && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Загрузка списка товаров...
            </div>
          )}
        </CardContent>
      </Card>

      {goodsLoadError && <Alert variant="error">{goodsLoadError}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {selectedGoodsId && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Сгенерированный SEO
            </h2>

            {historyLoadError && <Alert variant="error">{historyLoadError}</Alert>}

            {generatedSeo ? (
              <dl className="space-y-4 mt-4">
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
                      <Badge key={`${kw}-${idx}`}>{kw}</Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            ) : loading ? (
              <p className="text-gray-500 dark:text-gray-400">Генерация...</p>
            ) : historyLoading ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400" role="status">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Загрузка истории SEO...
              </div>
            ) : (
              !historyLoadError && (
                <p className="text-gray-500 dark:text-gray-400">
                  SEO не сгенерировано. Нажмите «Сгенерировать».
                </p>
              )
            )}

            {seoHistory?.summary && (
              <div className="mt-6">
                <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Сводка</dt>
                <dd className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-900 dark:text-white">
                  {seoHistory.summary}
                </dd>
              </div>
            )}

            {seoHistory?.competitors && seoHistory.competitors.length > 0 && (
              <div className="mt-6">
                <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Конкуренты</dt>
                <div className="mt-2 space-y-2">
                  {seoHistory.competitors.map((comp, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded">
                      <p className="font-medium text-gray-900 dark:text-white">{comp.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{comp.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {comp.keywords.slice(0, 3).map((kw, i) => (
                          <Badge key={i} variant="neutral">{kw}</Badge>
                        ))}
                        {comp.keywords.length > 3 && (
                          <span className="text-xs text-gray-500">+{comp.keywords.length - 3}</span>
                        )}
                      </div>
                      {comp.url && (
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-xs hover:underline"
                        >
                          Ссылка
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {goods.length === 0 && !goodsLoading && !goodsLoadError && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" aria-hidden="true" />
            <p className="text-gray-600 dark:text-gray-400">У вас нет товаров.</p>
            <Button className="mt-3" onClick={() => navigate('/goods/new')}>
              Добавить товар
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeoGenerationPage;