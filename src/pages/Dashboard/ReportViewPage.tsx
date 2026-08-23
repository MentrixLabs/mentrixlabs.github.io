// src/pages/Dashboard/ReportViewPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport } from '@/api/reports';
import type { Report } from '@/api/types';
import { Alert, Button, Card, CardContent, Badge } from '@/components/ui';
import { Loader2, Download, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getReport(Number(id));
        setReport(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Не удалось загрузить отчёт'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownload = () => {
    if (!id) return;
    window.open(`/reports/${id}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !report) {
    return <Alert variant="error">{error || 'Отчёт не найден'}</Alert>;
  }

  const forecast = report.forecast_data || {};
  const forecastData = forecast.forecast || [];
  const revenueData = forecast.revenue_forecast || [];
  const advRatioData = forecast.advertising_spend_ratio_forecast || [];
  const leadsData = forecast.leads_forecast || [];
  const ctrData = forecast.ctr_forecast || [];

  // Преобразование данных для графиков с тремя линиями
  const prepareThreeLineData = (data: Array<{ date: string; value: number[] }>) => {
    return data.map((item) => ({
      date: item.date,
      follow: item.value[0] || 0,
      idle: item.value[1] || 0,
      cross: item.value[2] || 0,
    }));
  };

  const advRatioChartData = prepareThreeLineData(advRatioData);
  const leadsChartData = prepareThreeLineData(leadsData);
  const ctrChartData = prepareThreeLineData(ctrData);

  return (
    <div className="space-y-8">
      {/* Верхняя панель */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/reports')}>
            <ArrowLeft size={18} className="mr-2" />
            Назад к списку
          </Button>
          <Button onClick={handleDownload}>
            <Download size={18} className="mr-2" />
            Скачать PDF
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Отчёт #{report.id}</h1>
          <p className="text-sm text-gray-500">Создан: {new Date(report.created_at).toLocaleString('ru-RU')}</p>
        </div>
      </div>

      {/* Блок с ключевыми метриками */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp size={16} /> Прогноз остатков
            </h3>
            <p className="text-lg font-medium mt-1">{forecast.days_to_out_of_stock || 'Нет данных'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm text-gray-500">
              <TrendingDown size={16} /> Динамика цены
            </h3>
            <p className="text-lg font-medium mt-1">{forecast.price_dynamic || 'Нет данных'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-gray-500">Рекомендуемая цена</h3>
            <p className="text-2xl font-bold text-blue-600">
              {forecast.recommended_price?.toFixed(2) ?? '—'} RUB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-gray-500">Волатильность цены</h3>
            <p className="text-lg font-medium">{forecast.key_metrics?.volatility?.toFixed(2) ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* График прогноза (цена, спрос, остаток) */}
      {forecastData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Прогноз по дням (цена, спрос, остаток)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" name="Цена" />
                  <Line type="monotone" dataKey="demand" stroke="#10b981" name="Спрос" />
                  <Line type="monotone" dataKey="stock" stroke="#f59e0b" name="Остаток" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* График выручки */}
      {revenueData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Прогноз выручки</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" name="Выручка" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* График ДРР */}
      {advRatioChartData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Прогноз доли рекламных расходов (ДРР)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={advRatioChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="follow" stroke="#3b82f6" name="Следование" />
                  <Line type="monotone" dataKey="idle" stroke="#ef4444" name="Бездействие" />
                  <Line type="monotone" dataKey="cross" stroke="#8b5cf6" name="Пересечение" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {forecast.advertising_spend_ratio_description && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {forecast.advertising_spend_ratio_description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* График лидов */}
      {leadsChartData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Прогноз лидов</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="follow" stroke="#3b82f6" name="Следование" />
                  <Line type="monotone" dataKey="idle" stroke="#ef4444" name="Бездействие" />
                  <Line type="monotone" dataKey="cross" stroke="#8b5cf6" name="Пересечение" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {forecast.leads_description && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {forecast.leads_description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* График CTR */}
      {ctrChartData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Прогноз CTR</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ctrChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="follow" stroke="#3b82f6" name="Следование" />
                  <Line type="monotone" dataKey="idle" stroke="#ef4444" name="Бездействие" />
                  <Line type="monotone" dataKey="cross" stroke="#8b5cf6" name="Пересечение" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {forecast.ctr_description && (
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {forecast.ctr_description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ключевые слова и рекомендации */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Ключевые слова</h3>
            <div className="flex flex-wrap gap-2">
              {forecast.keywords?.map((kw, idx) => (
                <Badge key={idx} variant="default">
                  {kw}
                </Badge>
              ))}
              {(!forecast.keywords || forecast.keywords.length === 0) && (
                <span className="text-gray-400 text-sm">Нет данных</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Рекомендации</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {forecast.recommendations || 'Нет рекомендаций'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportViewPage;