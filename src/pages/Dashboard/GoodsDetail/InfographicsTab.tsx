import React, { useState, useEffect } from 'react';
import {
  generateInfographics,
  enhanceInfographics,
  getInfographicsByGoodsId,
} from '@/api/infographics';
import { Alert, Button, Card, CardContent, SelectableImageGrid } from '@/components/ui';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import type { GoodsItem } from '@/api/types';
import { canGenerateInfographics, canAddGoods, canGenerateSeo, getPlanLimitMessage } from '@/utils/planHelpers';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useUserStatus } from '@/hooks/useUserStatus';

interface InfographicsTabProps {
  goodsItem: GoodsItem;
}

const InfographicsTab: React.FC<InfographicsTabProps> = ({ goodsItem }) => {
  const { status, loading: statusLoading, error: statusError } = useUserStatus();  
  const goodsId = goodsItem.id; // string

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [enhancedImages, setEnhancedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  // Загрузка сохранённой инфографики
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInfographicsByGoodsId(goodsId); // ← приводим к number
        setGeneratedImages(data.generated_images || []);
        setEnhancedImages(data.enhanced_images || []);
      } catch (err) {
        console.error('Ошибка загрузки инфографики:', err);
      }
    };
    load();
  }, [goodsId]);

  // Генерация новых изображений
  const handleGenerate = async (count = 4) => {
    if (!status) {
      setError('Не удалось проверить лимиты. Попробуйте позже.');
      return;
    }
    // Проверка лимита с помощью утилиты
    if (!canGenerateInfographics(status)) {
      setError(getPlanLimitMessage(status, 'generate_infographics'));
      setError(getErrorMessage(status, 'Ваш план не позволяет сделать больше инфографики'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await generateInfographics({ goods_id: Number(goodsId), count });
      setGeneratedImages(result.images);
      setSuccess(`Сгенерировано ${result.images.length} изображений`);
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка генерации инфографики'));
    } finally {
      setLoading(false);
    }
  };

  // Улучшение (коллаж + текст)
  const handleEnhance = async (count = 4) => {
    if (!status) {
      setError('Не удалось проверить лимиты. Попробуйте позже.');
      return;
    }
    // Проверка лимита с помощью утилиты
    if (!canGenerateInfographics(status)) {
      setError(getPlanLimitMessage(status, 'generate_infographics'));
      setError(getErrorMessage(status, 'Ваш план не позволяет улучшить больше инфографики'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await enhanceInfographics({ goods_id: Number(goodsId), count });
      setEnhancedImages(result.enhanced);
      setSuccess('Изображения улучшены');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка улучшения инфографики'));
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (url: string) => {
    setSelected(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  };

  const allImages = [...generatedImages, ...enhancedImages];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => handleGenerate(1)} isLoading={loading}>
          {!loading && <Sparkles size={18} className="mr-2" aria-hidden="true" />}
          Сгенерировать
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
              selected={selected}
              onToggle={toggleSelect}
              getAlt={(url) => `Инфографика ${url.slice(0, 10)}`}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InfographicsTab;