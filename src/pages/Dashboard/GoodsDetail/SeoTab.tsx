// src/pages/Dashboard/GoodsDetail/SeoTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { generateSeo, getSeoHistory } from '@/api/seo';
import type { GoodsItem, SeoGenerationResponse, SeoHistoryResponse } from '@/api/types';
import { Alert, Badge, Button } from '@/components/ui';
import { Loader2, Save, Sparkles, CheckCircle } from 'lucide-react';
import { canGenerateInfographics, canAddGoods, canGenerateSeo, getPlanLimitMessage } from '@/utils/planHelpers';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useUserStatus } from '@/hooks/useUserStatus';

interface SeoTabProps {
  goodsItem: GoodsItem;
}

const SeoTab: React.FC<SeoTabProps> = ({ goodsItem }) => {
  const { status, loading: statusLoading, error: statusError } = useUserStatus();
  const [error, setError] = useState<string | null>(null)
  const goodsId = goodsItem.id;

  const [seoHistory, setSeoHistory] = useState<SeoHistoryResponse | null>(null);
  const [generatedSeo, setGeneratedSeo] = useState<SeoGenerationResponse | null>(null);
  const [seoLoading, setSeoLoading] = useState<boolean>(false);
  const [seoError, setSeoError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Загрузка истории при монтировании вкладки
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setInitialLoading(true);
      setLoadError(null);
      try {
        const history = await getSeoHistory(goodsId);
        if (cancelled) return;
        setSeoHistory(history);
        if (history.generated) {
          setGeneratedSeo(history.generated);
        } else {
          setGeneratedSeo(null);
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(getErrorMessage(err, 'Не удалось загрузить историю SEO'));
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [goodsId]);

  // Генерация SEO
  const handleGenerateSeo = useCallback(async () => {
    if (!status) {
      setError('Не удалось проверить лимиты. Попробуйте позже.');
      return;
    }
    // Проверка лимита с помощью утилиты
    if (!canGenerateSeo(status)) {
      setError(getPlanLimitMessage(status, 'generate_seo'));
      setError(getErrorMessage(status, 'Ваш план не позволяет сделать больше SEO'));
      return;
    }
    setSeoLoading(true);
    setSeoError(null);
    setSuccess(null);
    try {
      const result = await generateSeo({ goods_id: goodsId });
      setGeneratedSeo(result);
      // Обновляем историю
      const history = await getSeoHistory(goodsId);
      setSeoHistory(history);
      setSuccess('SEO успешно сгенерировано');
    } catch (err) {
      setSeoError(getErrorMessage(err, 'Ошибка генерации SEO'));
    } finally {
      setSeoLoading(false);
    }
  }, [goodsId]);

  // Сохранение SEO (имитация – только обновляем историю)
  const handleSaveSeo = useCallback(async () => {
    if (!generatedSeo) return;
    setSeoLoading(true);
    setSeoError(null);
    setSuccess(null);
    try {
      const history = await getSeoHistory(goodsId);
      setSeoHistory(history);
      setSuccess('SEO сохранено (имитация)');
    } catch (err) {
      setSeoError(getErrorMessage(err, 'Ошибка при обновлении истории'));
    } finally {
      setSeoLoading(false);
    }
  }, [goodsId, generatedSeo]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SEO-оптимизация</h2>
        <Button onClick={handleGenerateSeo} isLoading={seoLoading}>
          {!seoLoading && <Sparkles size={18} className="mr-2" aria-hidden="true" />}
          {seoLoading ? 'Генерация...' : 'Сгенерировать SEO'}
        </Button>
      </div>

      {loadError && <Alert variant="error">{loadError}</Alert>}
      {seoError && <Alert variant="error">{seoError}</Alert>}
      {success && (
        <Alert variant="success">
          <CheckCircle size={18} className="mr-2" aria-hidden="true" />
          {success}
        </Alert>
      )}

      {initialLoading && (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Загрузка истории SEO...
        </div>
      )}

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
                  <Badge key={`${kw}-${idx}`}>{kw}</Badge>
                ))}
              </dd>
            </div>
          </dl>
          <div className="flex gap-3">
            <Button onClick={handleSaveSeo} isLoading={seoLoading}>
              {!seoLoading && <Save size={18} className="mr-2" aria-hidden="true" />}
              Сохранить
            </Button>
          </div>
        </div>
      ) : (
        !initialLoading &&
        !loadError && <p className="text-gray-500 dark:text-gray-400">SEO ещё не сгенерировано.</p>
      )}

      {/* Сводка и конкуренты */}
      {seoHistory?.summary && (
        <section className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Сводка</h3>
          <p className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded text-sm text-gray-600 dark:text-gray-400">
            {seoHistory.summary}
          </p>
        </section>
      )}

      {seoHistory?.competitors && seoHistory.competitors.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Конкуренты</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {seoHistory.competitors.map((comp, idx) => (
              <li key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded text-sm">
                <p className="font-medium text-gray-900 dark:text-white">{comp.title}</p>
                <p className="text-gray-500 dark:text-gray-400">{comp.description}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {comp.keywords.slice(0, 3).map((kw, i) => (
                    <Badge key={i} variant="neutral">{kw}</Badge>
                  ))}
                  {comp.keywords.length > 3 && <span className="text-xs text-gray-500">+{comp.keywords.length - 3}</span>}
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
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default SeoTab;