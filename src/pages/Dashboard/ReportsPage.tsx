// src/pages/Dashboard/ReportsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGoods } from '@/hooks/useGoods';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { sendMetricGoal } from '@/utils/metrics'
import {
  getReports,
  generateReport,
  downloadReportPdf,
  deleteReport,
} from '@/api/reports';
import { updateStockHistory } from '@/api/goods';
import type { Report } from '@/api/types';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  FormField,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  BarChart3,
  Plus,
  Download,
  Trash2,
  Loader2,
  CheckCircle,
  Package,
  X,
  Eye,
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const goodsIdFromUrl = searchParams.get('goods_id');

  const { goods, loading: goodsLoading, error: goodsLoadError, fetchGoods } = useGoods(1, 100);

  const [selectedGoodsId, setSelectedGoodsId] = useState<string>(goodsIdFromUrl || '');

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [generating, setGenerating] = useState<boolean>(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const isDeleting = deletingId !== null;

  const navigate = useNavigate();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // --- Состояние для ввода остатков ---
  const [stockInput, setStockInput] = useState<string>('');
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoods(1, 100);
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReports(1, 100);
      let items = result.items;
      if (selectedGoodsId) {
        items = items.filter((r) => String(r.goods_id) === selectedGoodsId);
      }
      setReports(items);
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка загрузки отчетов'));
    } finally {
      setLoading(false);
    }
  }, [selectedGoodsId]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  // --- Парсинг введённых остатков ---
  const parseStockInput = (input: string): number[] => {
    if (!input.trim()) return [];
    // Разделители: запятая, пробел, точка с запятой
    const parts = input.split(/[,;\s]+/).filter(s => s.length > 0);
    const numbers = parts.map(Number).filter(n => !isNaN(n) && n >= 0);
    return numbers;
  };

  // --- Генерация отчёта с предварительным обновлением остатков ---
  const handleGenerateReport = useCallback(async () => {
    if (!selectedGoodsId) {
      setError('Выберите товар для генерации отчета');
      return;
    }
        
    // Валидация и парсинг остатков (если поле не пусто)
    let stockEntries: { record_date: string; fbs_count: number }[] = [];
    if (stockInput.trim()) {
      const numbers = parseStockInput(stockInput);
      if (numbers.length === 0) {
        setStockError('Введите корректные числа (разделяйте запятыми или пробелами)');
        return;
      }
      setStockError(null);

      const today = new Date();
      // Сопоставляем числа с датами: последнее число -> сегодня, предпоследнее -> вчера и т.д.
      const numLen = numbers.length;
      for (let i = 0; i < numLen; i++) {
        const daysAgo = numLen - 1 - i;
        const d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        const dateStr = d.toISOString().split('T')[0];
        stockEntries.push({ record_date: dateStr, fbs_count: numbers[i] });
      }
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Если есть записи остатков – обновляем их
      if (stockEntries.length > 0) {
        await updateStockHistory(Number(selectedGoodsId), stockEntries);
      }

      // 2. Генерируем отчёт
      const newReport = await generateReport(selectedGoodsId);
      sendMetricGoal('report_created')
      setReports((prev) => [newReport, ...prev]);
      setSuccess('Отчет успешно сгенерирован');
      // Очищаем поле после успешной генерации (опционально)
      setStockInput('');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка генерации отчета'));
    } finally {
      setGenerating(false);
    }
  }, [selectedGoodsId, stockInput]);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => String(r.id) !== id));
      setSuccess('Отчет удален');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка удаления отчета'));
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  }, []);

  const handleDownload = useCallback(async (id: string) => {
    setDownloadingId(id);
    setError(null);
    try {
      const blob = await downloadReportPdf(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess('Отчет скачан');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка скачивания отчета'));
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGoodsName = (id: string) => {
    const item = goods.find((g) => g.id === id);
    return item ? item.name : id;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Отчеты</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Управляйте отчетами по оптимизации карточек товаров
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <FormField id="filterGoods" label="Фильтр по товару">
                {(fieldProps) => (
                  <Select
                    {...fieldProps}
                    value={selectedGoodsId}
                    onChange={(e) => setSelectedGoodsId(e.target.value)}
                    disabled={goodsLoading}
                  >
                    <option value="">Все товары</option>
                    {goods.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} {item.product_id ? `(${item.product_id})` : ''}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>
            <Button
              onClick={() => void handleGenerateReport()}
              disabled={!selectedGoodsId}
              isLoading={generating}
              className="whitespace-nowrap"
            >
              {!generating && <Plus size={18} className="mr-2" aria-hidden="true" />}
              {generating ? 'Генерация...' : 'Создать отчет'}
            </Button>
          </div>

          {/* Поле ввода остатков (показывается только когда выбран товар) */}
          {selectedGoodsId && (
            <div className="mt-2">
              <FormField
                id="stockInput"
                label="Введите точные или приблизительные последние остатки товара на складе (FBS + FBO)"
                error={stockError}
                hint="Формат: числа, разделённые запятыми или пробелами. Например: 500, 550, 400 (позавчера, вчера, сегодня). Можно ввести одно число – оно будет отнесено к сегодняшнему дню."
                required={true}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="text"
                    value={stockInput}
                    onChange={(e) => {
                      setStockInput(e.target.value);
                      if (stockError) setStockError(null);
                    }}
                    placeholder="500, 550, 400"
                    className="max-w-md"
                  />
                )}
              </FormField>
            </div>
          )}

          {goodsLoading && (
            <div
              className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400"
              role="status"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Загрузка списка товаров...
            </div>
          )}
          {!goodsLoading && !selectedGoodsId && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Выберите товар, чтобы создать отчет
            </p>
          )}
        </CardContent>
      </Card>

      {goodsLoadError && <Alert variant="error">{goodsLoadError}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-4" role="status">
            <Loader2 size={32} className="animate-spin text-blue-600" aria-hidden="true" />
            <p className="text-gray-500 dark:text-gray-400">Загрузка отчетов...</p>
          </div>
        </div>
      ) : (
        <Card>
          {reports.length === 0 ? (
            <div className="py-16 text-center">
              <BarChart3
                size={48}
                className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
                aria-hidden="true"
              />
              <p className="text-gray-600 dark:text-gray-400">
                {selectedGoodsId ? 'Нет отчетов для этого товара' : 'Нет отчетов'}
              </p>
              {selectedGoodsId && (
                <Button
                  className="mt-3"
                  onClick={() => void handleGenerateReport()}
                  isLoading={generating}
                >
                  {!generating && <Plus size={18} className="mr-2" aria-hidden="true" />}
                  {generating ? 'Генерация...' : 'Создать первый отчет'}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead>SEO</TableHead>
                  <TableHead>Инфографика</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" aria-hidden="true" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getGoodsName(String(report.goods_id))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">
                      {formatDate(report.created_at)}
                    </TableCell>
                    <TableCell>
                      {report.seo_text ? (
                        <Badge variant="success">
                          <CheckCircle size={12} aria-hidden="true" />
                          есть
                        </Badge>
                      ) : (
                        <Badge variant="neutral">
                          <X size={12} aria-hidden="true" />
                          нет
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.infographics && report.infographics.length > 0 ? (
                        <Badge variant="success">
                          <CheckCircle size={12} aria-hidden="true" />
                          {report.infographics.length} шт.
                        </Badge>
                      ) : (
                        <Badge variant="neutral">
                          <X size={12} aria-hidden="true" />
                          нет
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/reports/view/${report.id}`)}
                        >
                          <Eye size={18} aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => void handleDownload(String(report.id))}
                          disabled={downloadingId === String(report.id)}
                          title="Скачать PDF"
                          aria-label="Скачать PDF"
                        >
                          {downloadingId === String(report.id) ? (
                            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Download size={18} aria-hidden="true" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => setConfirmDelete(String(report.id))}
                          disabled={isDeleting}
                          title="Удалить"
                          aria-label="Удалить"
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setConfirmDelete(null);
        }}
        title="Удалить отчет?"
        description="Это действие невозможно отменить. Отчет будет удален безвозвратно."
        confirmLabel={isDeleting ? 'Удаление...' : 'Удалить'}
        isDestructive
        isLoading={isDeleting}
        onConfirm={() => {
          if (confirmDelete) void handleDelete(confirmDelete);
        }}
      />
    </div>
  );
};

export default ReportsPage;