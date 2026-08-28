// src/pages/Landing/PricingPage.tsx
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { createPayment, ReceiptItem } from '@/api/payment';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
} from '@/components/ui';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

import { useAuthStore } from '@/store/authStore';

interface PricingPageProps {
  dashboardMode?: boolean;
}

const PricingPage: React.FC<PricingPageProps> = ({ dashboardMode = false }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  

  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  // Определяем, какие планы показывать: все, кроме free, если dashboardMode
  const displayPlans = dashboardMode ? plans.filter(p => p.id !== 'free') : plans;

  // --- Состояния для модалки ---
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // При открытии модалки подставляем email из профиля, если есть
  useEffect(() => {
    if (modalOpen && user?.email) {
      setEmail(user.email);
    }
  }, [modalOpen, user]);

  // --- Вспомогательная функция для генерации позиций чека ---
  const generateReceiptItems = (planId: string, total: number): ReceiptItem[] => {
    // Сопоставление planId -> список включённых опций (из конфига)
    const featureLabelsMap: Record<string, string[]> = {
      starter: [
        'До 50 товаров',
        'Генерация SEO (расширенная, до 50 товаров в день)',
        'Создание инфографики (до 20 изображений в день)',
        'Полные отчёты в PDF',
        'Поддержка 24/7 по телефону',
      ],
      business: [
        'Неограниченно товаров',
        'Генерация SEO (премиум, больше 50 товаров в день)',
        'Создание инфографики (до 50 изображений в день)',
        'Полные отчёты в PDF и Excel',
        'Поддержка 24/7',
        'API-доступ',
        'Приоритетная поддержка',
      ],
    };

    const features = featureLabelsMap[planId] || [];
    if (features.length === 0) return [];

    const pricePerFeature = total / features.length;
    // Округляем до 2 знаков для копеек
    const roundedPrice = Math.round(pricePerFeature * 100) / 100;

    return features.map((label) => ({
      description: label,
      quantity: 1,
      amount: roundedPrice,
      vat_code: 1,
    }));
  };

  // --- Обработчик клика по кнопке плана ---
  const handlePlanClick = (plan: typeof plans[0]) => {
    if (dashboardMode && plan.id === 'free') {
      navigate('/dashboard');
      return;
    }
    if (plan.id === 'free') {
      // Бесплатный – сразу переходим
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/register?plan=free');
      }
      return;
    }

    // Для платных – открываем модалку
    const amount = amounts[plan.id];
    if (!amount) {
      setError('Неизвестный тариф');
      return;
    }
    const items = generateReceiptItems(plan.id, amount);
    setSelectedPlanId(plan.id);
    setTotalAmount(amount);
    setReceiptItems(items);
    setEmail(user?.email || '');
    setModalError(null);
    setModalOpen(true);
  };

  // --- Подтверждение в модалке ---
  const handleConfirmPayment = async () => {
    if (!selectedPlanId) return;
    if (!email) {
      setModalError('Введите email для отправки чека');
      return;
    }
    setModalLoading(true);
    setModalError(null);
    try {
      const payment = await createPayment({
        amount: totalAmount,
        description: `Оплата тарифа ${selectedPlanId}`,
        items: receiptItems,
        email: email,
      });
      // Перенаправляем на страницу оплаты
      window.location.href = payment.confirmation_url;
    } catch (err) {
      setModalError(getErrorMessage(err, 'Не удалось создать платёж'));
    } finally {
      setModalLoading(false);
    }
  };

  // --- Автозапуск для dashboardMode (адаптирован под модалку) ---
  useEffect(() => {
    const plan = searchParams.get('plan');
    if (dashboardMode && plan && isAuthenticated && !paymentInitiated) {
      const validPlans = ['starter', 'business'];
      if (validPlans.includes(plan) && plan !== 'free') {
        setPaymentInitiated(true);
        // Открываем модалку вместо прямого вызова
        const amount = amounts[plan];
        if (amount) {
          const items = generateReceiptItems(plan, amount);
          setSelectedPlanId(plan);
          setTotalAmount(amount);
          setReceiptItems(items);
          setEmail(user?.email || '');
          setModalError(null);
          setModalOpen(true);
        }
      } else if (plan === 'free') {
        navigate('/dashboard');
      }
    }
  }, [searchParams, dashboardMode, isAuthenticated, paymentInitiated, user]);

  const handleSelectPlan = async (plan: string) => {
    if (plan === 'free') {
      navigate('/dashboard');
      return;
    }
    setLoadingPlan(plan);
    setError(null);
    try {
      const amounts: Record<string, number> = {
        starter: 12990,
        business: 52990,
      };
      const amount = amounts[plan];
      if (!amount) {
        setError('Неизвестный тариф');
        return;
      }
      const payment = await createPayment({ amount, description: `Оплата тарифа ${plan}` });
      window.location.href = payment.confirmation_url;
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось создать платёж'));
    } finally {
      setLoadingPlan(null);
    }
  };
  
  const PaymentModal = () => {
    if (!modalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">
            Оплата тарифа {selectedPlanId === 'starter' ? 'Старт' : 'Бизнес'}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email для чека
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.ru"
                required
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Позиции чека:</p>
              <ul className="space-y-1 text-sm">
                {receiptItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between border-b border-gray-100 py-1">
                    <span>{item.description}</span>
                    <span>{item.amount.toFixed(2)} ₽</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between font-semibold text-base">
                <span>Итого:</span>
                <span>{totalAmount.toFixed(2)} ₽</span>
              </div>
            </div>
            {modalError && <Alert variant="error">{modalError}</Alert>}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleConfirmPayment} disabled={modalLoading}>
              {modalLoading ? 'Обработка...' : 'Оплатить'}
            </Button>
          </div>
        </div>
      </div>
    );
  };


  // Внутри компонента PricingPage, перед return:
  const renderFullPage = () => (
    <>
      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4">
              <Zap size={16} aria-hidden="true" />
              Прозрачные тарифы
            </Badge>
            <h1>
              Выберите свой <span className="text-blue-600 dark:text-blue-400">план</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Начните бесплатно, а затем масштабируйтесь по мере роста вашего бизнеса.
              Все планы включают базовый набор функций.
            </p>
          </div>
        </div>
      </section>

      {/* Карточки */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Тарифные планы</h2>
          <div className={`grid gap-8 max-w-6xl mx-auto ${
            displayPlans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
          }`}>
            {displayPlans.map((plan, index) => (
              <Card
                key={index}
                className={`flex flex-col ${
                  plan.popular ? 'border-blue-500 dark:border-blue-400' : ''
                }`}
              >
                <CardHeader>
                  <div className="min-h-6 mb-3">
                    {plan.popular && <Badge variant="default">Популярный</Badge>}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-semibold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="ml-2 text-lg font-medium text-gray-500 dark:text-gray-400">
                      {plan.price === 'Бесплатно' ? 'навсегда' : '/ мес'}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                        {feature.included ? (
                          <Check
                            size={18}
                            className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                            role="img"
                            aria-label="Включено"
                          />
                        ) : (
                          <X
                            size={18}
                            className="text-gray-400 flex-shrink-0 mt-0.5"
                            role="img"
                            aria-label="Не включено"
                          />
                        )}
                        <span className={feature.included ? '' : 'text-gray-500 dark:text-gray-500'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    variant={plan.popular ? 'default' : 'secondary'}
                    className="w-full"
                    onClick={() => handlePlanClick(plan)}
                  >
                    {plan.ctaText}
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Сравнение функций */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2>Сравнение всех функций</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Подробная таблица для принятия решения
            </p>
          </div>
          <Card className="max-w-5xl mx-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Функция</TableHead>
                  {displayPlans.map((plan, idx) => (
                    <TableHead
                      key={idx}
                      className={`text-center ${
                        plan.popular ? 'text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      {plan.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonFeatures.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.feature}</TableCell>
                    {displayPlans.map((plan, i) => {
                      // Найти исходный индекс плана в полном списке plans
                      const originalIndex = plans.findIndex(p => p.id === plan.id);
                      const value = row.values[originalIndex];
                      return (
                        <TableCell key={i} className="text-center">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <Check
                                size={20}
                                className="text-green-600 dark:text-green-400 mx-auto"
                                role="img"
                                aria-label="Да"
                              />
                            ) : (
                              <X
                                size={20}
                                className="text-gray-400 mx-auto"
                                role="img"
                                aria-label="Нет"
                              />
                            )
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12">
            <h2>Часто задаваемые вопросы</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Ответы на самые популярные вопросы
            </p>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <h3 className="text-base">
                  <button
                    type="button"
                    id={`faq-trigger-${index}`}
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-panel-${index}`}
                    className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>
                    {openFaq === index ? (
                      <ChevronUp size={20} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
                    )}
                  </button>
                </h3>
                {openFaq === index && (
                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${index}`}
                    className="px-6 pb-4 pt-4 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700"
                  >
                    {item.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA – скрываем в dashboardMode */}
      {!dashboardMode && (
        <section className="py-16 md:py-24 border-t border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h2>Начните с бесплатного тарифа</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Оцените все возможности без риска – первые 3 товара бесплатно.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                  <Link to="/register">
                    Зарегистрироваться
                    <ArrowRight size={20} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="https://t.me/ProSklad_SmartSeller_AI_Bot" target="_blank" rel="noopener noreferrer">
                    Открыть бота
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );

  // Рендеринг: если dashboardMode – без хедера/футера, иначе с хедером/футером
  if (dashboardMode) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Тарифные планы</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Назад к панели
          </Button>
        </div>
        {error && <Alert variant="error">{error}</Alert>}
        {renderFullPage()}
        {isAuthenticated && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Ваш текущий план: <strong>Бесплатный</strong> (заглушка)
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingHeader />
      {renderFullPage()}
      <LandingFooter />
      {PaymentModal()}  {/* модалка */}
    </div>
  );
};
const amounts: Record<string, number> = {
  starter: 12990,
  business: 52990,
};

// ===== DATA =====

const plans = [
  {
    id: 'free',
    name: 'Бесплатный',
    description: 'Для знакомства с сервисом',
    price: 'Бесплатно',
    popular: false,
    ctaText: 'Начать',
    features: [
      { text: 'До 3 товаров', included: true },
      { text: 'Генерация SEO (базовая, до 2 товаров в день)', included: true },
      { text: 'Создание инфографики (до 1 изображения)', included: true },
      { text: 'Базовые отчёты', included: true },
      { text: 'Поддержка в письмах', included: false },
      { text: 'API-доступ', included: false },
      { text: 'Приоритетная поддержка', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Старт',
    description: 'Для небольших магазинов',
    price: '12 990 ₽',
    popular: true,
    ctaText: 'Выбрать',
    features: [
      { text: 'До 50 товаров', included: true },
      { text: 'Генерация SEO (расширенная, до 50 товаров в день)', included: true },
      { text: 'Создание инфографики (до 20 изображений в день)', included: true },
      { text: 'Полные отчёты в PDF', included: true },
      { text: 'Поддержка 24/7 по телефону', included: true },
      { text: 'API-доступ', included: false },
      { text: 'Приоритетная поддержка', included: false },
    ],
  },
  {
    id: 'business',
    name: 'Бизнес',
    description: 'Для профессиональных продавцов',
    price: '52 990 ₽',
    popular: false,
    ctaText: 'Выбрать',
    features: [
      { text: 'Неограниченно товаров', included: true },
      { text: 'Генерация SEO (премиум, больше 50 товаров в день)', included: true },
      { text: 'Создание инфографики (до 50 изображений в день)', included: true },
      { text: 'Полные отчёты в PDF и Excel', included: true },
      { text: 'Поддержка 24/7', included: true },
      { text: 'API-доступ', included: true },
      { text: 'Приоритетная поддержка', included: true },
    ],
  },
];

const comparisonFeatures = [
  { feature: 'Количество товаров', values: ['3', '100', '∞'] },
  { feature: 'SEO-генерация', values: ['Базовая', 'Расширенная', 'Премиум'] },
  { feature: 'Инфографика (изображений)', values: ['5', '20', '50'] },
  { feature: 'Отчёты', values: ['Базовые', 'PDF', 'PDF + Excel'] },
  { feature: 'Поддержка', values: ['Только FAQ', 'Чат', '24/7'] },
  { feature: 'API-доступ', values: [false, false, true] },
  { feature: 'Приоритетная поддержка', values: [false, false, true] },
];

const faqItems = [
  {
    question: 'Можно ли попробовать бесплатно?',
    answer:
      'Да, тариф "Бесплатный" включает 3 товара для полного тестирования всех функций без ограничений по времени.',
  },
  {
    question: 'Как происходит оплата?',
    answer:
      'Оплата производится ежемесячно через банковскую карту. Вы можете отменить подписку в любой момент в личном кабинете.',
  },
  {
    question: 'Есть ли скидки для крупных продавцов?',
    answer:
      'Да, при оплате за год вы получаете скидку 20%. Также предусмотрены индивидуальные условия для оптовых продавцов – свяжитесь с нами.',
  },
  {
    question: 'Можно ли перейти с бесплатного плана на платный?',
    answer:
      'Да, вы можете перейти на любой платный тариф в один клик из личного кабинета. Все ваши данные и товары сохранятся.',
  },
  {
    question: 'Что входит в поддержку?',
    answer:
      'Поддержка включает помощь по вопросам работы с сервисом, генерации контента и интеграции. На планах "Старт" и "Бизнес" – поддержка в чате.',
  },
];

export default PricingPage;