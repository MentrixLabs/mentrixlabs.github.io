// src/pages/Landing/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import LandingFooter from '@/components/landing/LandingFooter';
const monitorImg = '/images/monitor.png';
const brushImg = '/images/brush.png';
const keyboardImg = '/images/keyboard.png';

const HomePage: React.FC = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Секция "Всё, что нужно…" начинается примерно на 50% высоты экрана
      const triggerPoint = window.innerHeight * 0.8;
      setIsHeaderVisible(window.scrollY > triggerPoint);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    //<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/30">
      <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
        {/* ===== Плавающий хедер ===== */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isHeaderVisible ? 1 : 0, y: isHeaderVisible ? 0 : -20 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-semibold text-lg shadow-md">
                P
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Proskladai
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Link to="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Возможности
              </Link>
              <Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Цены
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Войти
              </Link>
              <Button asChild size="sm" className="text-white shadow-md shadow-blue-500/20 hover:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 transition-shadow">
                <Link to="/register">Начать бесплатно</Link>
              </Button>
            </div>
          </div>
        </motion.header>

        {/* ===== HERO ===== */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <img
            src={monitorImg}
            alt=""
            className="absolute -top-20 -left-20 w-96 opacity-20 blur-sm select-none pointer-events-none hidden md:block"
            style={{ transform: 'rotate(-8deg)' }}
          />
          {/* Декорация 2: кисть (справа снизу) */}
          <img
            src={brushImg}
            alt=""
            className="absolute -bottom-16 -right-16 w-72 opacity-25 blur-sm select-none pointer-events-none hidden md:block"
            style={{ transform: 'rotate(12deg)' }}
          />
          {/* Декорация 3: клавиатура (центр, но под контентом) */}
          <img
            src={keyboardImg}
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] opacity-10 blur-md select-none pointer-events-none hidden md:block"
          />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
          <div className="container relative z-10 mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent -mx-4 md:-mx-12 drop-shadow-lg"
            >
              Оптимизируй<br />
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text">карточки</span> товаров
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Генерация SEO-текстов и поиск инфографики с помощью нейросетей. Увеличь продажи без лишних затрат.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow">
                <Link to="/register" className="text-white flex items-center gap-2">
                  Начать бесплатно <ArrowRight size={20} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-2">
                <a href="https://t.me/ProSklad_SmartSeller_AI_Bot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  Попробовать бота <Zap size={18} />
                </a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/20 to-transparent dark:via-blue-900/10" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mb-20 -mx-4 md:-mx-12"
            >
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                Всё, что нужно для<br />идеальной карточки
              </h2>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Нейросети и умные алгоритмы автоматизируют рутинные задачи, чтобы вы сосредоточились на развитии бизнеса.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-x-12 gap-y-16">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group border-t border-gray-200 dark:border-gray-700 pt-6 hover:scale-[1.02] transition-transform duration-300 hover:-translate-y-1 cursor-default"
                >
                  <span className="text-sm font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-2xl mt-3 font-bold transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-24 md:py-32 border-t border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mb-16 -mx-4 md:-mx-12"
            >
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg">
                Как это работает
              </h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                Три шага до готовой оптимизированной карточки
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="hover:scale-[1.03] transition-transform duration-300"
                >
                  <Card className="glass-card hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-default">
                    <CardContent className="p-8 text-center">
                      <span className="inline-block text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-4 py-1 rounded-full mb-4">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-2xl font-bold mt-4">{step.title}</h3>
                      <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-16 border-t border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="hover:scale-105 transition-transform duration-300 cursor-default"
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-md">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-24 md:py-32 border-t border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg -mx-4 md:-mx-12">
                Готовы оптимизировать товары?
              </h2>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
                Начните прямо сейчас – первые 3 товара бесплатно!
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow">
                  <Link to="/register" className="text-white flex items-center gap-2">
                    Создать аккаунт <ArrowRight size={20} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2">
                  <a href="https://t.me/ProSklad_SmartSeller_AI_Bot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    Открыть бота <Sparkles size={18} />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <LandingFooter />
      </div>
    //</div>
  );
};

// Данные
const features = [
  {
    title: 'Генерация SEO-текстов',
    description:
      'Нейросеть создаёт заголовки, описания и ключевые слова, релевантные вашему товару и поисковым запросам.',
  },
  {
    title: 'Поиск инфографики',
    description:
      'Автоматический поиск релевантных изображений по артикулу или названию товара в открытых источниках.',
  },
  {
    title: 'Комплексные отчёты',
    description:
      'Собирайте всю информацию по оптимизации в одном отчёте и отслеживайте эффективность ваших карточек.',
  },
];

const steps = [
  {
    title: 'Загрузите карточку',
    description: 'Добавьте товар по артикулу или вручную – бот автоматически подтянет данные.',
  },
  {
    title: 'Сгенерируйте контент',
    description: 'Запустите генерацию SEO-текстов и поиск инфографики одним кликом.',
  },
  {
    title: 'Примените и продавайте',
    description: 'Используйте контент для улучшения карточки и повышения конверсии.',
  },
];

const stats = [
  { value: '10K+', label: 'Товаров оптимизировано' },
  { value: '95%', label: 'Точность рекомендаций' },
  { value: '24/7', label: 'Доступность' },
  { value: '4.9★', label: 'Средняя оценка' },
];

export default HomePage;