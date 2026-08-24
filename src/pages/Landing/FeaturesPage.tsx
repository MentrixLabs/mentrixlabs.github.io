// src/pages/Landing/FeaturesPage.tsx
import React, {useEffect, useState, useRef} from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Sparkles, Image, FileText, BarChart3 } from 'lucide-react';
import { Button, Card, CardContent, InteractiveButton } from '@/components/ui';
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
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Секция "Всё, что нужно…" начинается примерно на 50% высоты экрана
      const HighTriggerPoint = window.innerHeight * 0.8;
      const LowTriggerPoint = window.innerHeight * 1.65;
      setIsHeaderVisible(window.scrollY < HighTriggerPoint && window.scrollY < LowTriggerPoint);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/30">
      <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
        {/* ===== Плавающий хедер ===== */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isHeaderVisible ? 1 : 0, y: isHeaderVisible ? 0 : -20 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all"
        >
          <LandingHeader />
        </motion.header>

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
        <section
          className="
            relative
            z-30
            min-h-screen
            flex
            items-center
            justify-center
            border-t
            border-gray-100
            dark:border-gray-800
            bg-white
            dark:bg-gray-900
          "
        >
          {/* SVG BACKGROUND */}
          <img
            src="backline.svg"
            alt=""
            aria-hidden="true"
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              pointer-events-none
              select-none
              z-[-1]
            "
          />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto"
            >
              <h2
                className="
                  text-5xl
                  md:text-5xl
                  lg:text-[5rem]
                  leading-none
                  font-bold
                  tracking-tight
                  bg-gradient-to-r
                  from-blue-600
                  to-purple-600
                  bg-clip-text
                  text-transparent
                "
              >
                Готовы попробовать?
              </h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                Присоединяйтесь к сообществу продавцов, которые уже используют AI для роста продаж.
              </p>
              <div className="mt-10">
                <InteractiveButton
                  asChild
                  className="w-4/5 h-14 shadow-none hover:shadow-none focus:shadow-none"
                  scaleAmount={0.2}
                  glowRadius="100%"
                >
                  <Link
                    to="/register"
                    className="text-white flex items-center justify-center gap-2 hover:text-white shadow-none hover:shadow-none"
                  >
                    Создать аккаунт
                    <ArrowRight
                      size={20}
                      className="transition-transform duration-100 group-hover:translate-x-1"
                    />
                  </Link>
                </InteractiveButton>
              </div>
            </motion.div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </div>
  );
};

export default FeaturesPage;