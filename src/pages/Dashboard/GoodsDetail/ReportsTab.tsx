// src/pages/Dashboard/GoodsDetail/ReportsTab.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSeoHistory } from '@/api/seo';
import { getInfographicsByGoodsId } from '@/api/infographics'; // изменён импорт
import type { GoodsItem } from '@/api/types';
import { Alert, Badge, Button } from '@/components/ui';
import { BarChart3, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { sendMetricGoal } from '@/utils/metrics'

interface ReportsTabProps {
  goodsItem: GoodsItem;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ goodsItem }) => {
  const navigate = useNavigate();
  const goodsId = goodsItem.id;

  const [seoCount, setSeoCount] = useState<number | null>(null);
  const [infographicsCount, setInfographicsCount] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setInitialLoading(true);
      setLoadError(null);
      try {
        const [history, infographicsData] = await Promise.all([
          getSeoHistory(goodsId),           // преобразование к числу
          getInfographicsByGoodsId(goodsId), // изменённая функция
        ]);
        if (cancelled) return;
        // Для SEO-истории ожидаем массив (SeoHistoryResponse), но у нас её тип может быть массив или объект.
        // Поскольку в реальности getSeoHistory возвращает объект с полем generated, надо проверять.
        // Предположим, что getSeoHistory возвращает массив (как в старом коде), но на самом деле она возвращает объект SeoHistoryResponse.
        // В текущем коде ReportsTab ожидает history.length, т.е. массив. Но в новом API getSeoHistory возвращает объект.
        // Нужно адаптировать: возможно, нам нужно получать количество записей через history.generated ? 1 : 0 или history.competitors.length.
        // Для простоты, если getSeoHistory возвращает объект с полем generated, то считаем, что если есть generated, то SEO есть.
        // Мы можем определить количество генераций как 1, если generated не null, иначе 0.
        // Однако в бэкенде /seo/history/{goods_id} возвращает { generated: {...} | null, summary: ..., competitors: [] }.
        // Так что мы должны проверить history.generated.
        // Для совместимости с предыдущим кодом, который ждал массив, мы можем адаптировать.
        // Предлагаю считать количество генераций: если history.generated !== null, то 1, иначе 0.
        // Но в будущем можно хранить историю с датами, но пока оставим так.
        const seoCountValue = history.generated ? 1 : 0;
        setSeoCount(seoCountValue);
        // Инфографика: у нас есть массив generated_images и enhanced_images. Считаем общее количество.
        const infographicsImages = infographicsData.generated_images?.length || 0;
        const enhancedImages = infographicsData.enhanced_images?.length || 0;
        setInfographicsCount(infographicsImages + enhancedImages);
      } catch (err) {
        if (cancelled) return;
        setLoadError(getErrorMessage(err, 'Не удалось загрузить сводку по товару'));
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [goodsId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Отчёты по товару</h2>
        <Button onClick={() => navigate(`/reports?goods_id=${goodsId}`)}>
          <BarChart3 size={18} className="mr-2" aria-hidden="true" />
          Перейти к отчётам
        </Button>
      </div>

      {loadError && <Alert variant="error">{loadError}</Alert>}

      <p className="text-gray-500 dark:text-gray-400">
        Здесь будут отображаться сгенерированные отчёты для данного товара. Перейдите в раздел
        «Отчёты» для просмотра и создания новых.
      </p>

      {initialLoading ? (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Загрузка сводки...
        </div>
      ) : (
        !loadError && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">SEO-генераций: {seoCount ?? 0}</Badge>
            <Badge variant="neutral">Инфографики: {infographicsCount ?? 0}</Badge>
          </div>
        )
      )}
    </div>
  );
};

export default ReportsTab;