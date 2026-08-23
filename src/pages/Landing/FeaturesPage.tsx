// src/pages/Landing/FeaturesPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Sparkles, Image, FileText, BarChart3 } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: 'SEO-оптимизация',
      description: 'Создаём заголовки, описания и ключевые слова, которые поднимают карточку в выдаче.',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Image,
      title: 'Инфографика',
      description: 'Находим и генерируем релевантные изображения, которые привлекают внимание покупателей.',
      color: 'from-purple-500 to-pink-400',
    },
    {
      icon: BarChart3,
      title: 'Аналитика и отчёты',
      description: 'Отслеживайте эффективность оптимизации и получайте прогнозы по остаткам и динамике цены.',
      color: 'from-green-500 to-teal-400',
    },
    {
      icon: Zap,
      title: 'Мгновенная генерация',
      description: 'Нейросети работают в реальном времени – результат получайте за секунды.',
      color: 'from-yellow-400 to-orange-400',
    },
    {
      icon: Sparkles,
      title: 'Интеллектуальные рекомендации',
      description: 'Система подсказывает, как улучшить карточку на основе данных конкурентов и истории продаж.',
      color: 'from-pink-500 to-rose-400',
    },
    {
      icon: CheckCircle,
      title: 'Простая интеграция',
      description: 'Подключайте бота к вашему магазину в один клик – без сложных настроек.',
      color: 'from-indigo-500 to-blue-400',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent -mx-4 md:-mx-12"
          >
            Все возможности<br />
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text">для продвижения</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Узнайте, как Proskladai помогает тысячам продавцов выводить товары в топ.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10"
          >
            <Button asChild size="lg" className="shadow-lg shadow-blue-500/30">
              <Link to="/register" className="flex items-center gap-2">
                Начать бесплатно <ArrowRight size={20} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
              >
                <Card className="h-full glass-card hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                      <feature.icon size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mt-6">{feature.title}</h3>
                    <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Готовы попробовать?
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Присоединяйтесь к сообществу продавцов, которые уже используют AI для роста продаж.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="shadow-lg shadow-blue-500/30">
                <Link to="/register" className="flex items-center gap-2">
                  Создать аккаунт <ArrowRight size={20} />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default FeaturesPage;