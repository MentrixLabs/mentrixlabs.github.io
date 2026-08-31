// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Макеты
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';

// Страницы Landing (публичные)
import HomePage from '@/pages/Landing/HomePage';
import FeaturesPage from '@/pages/Landing/FeaturesPage';
import PricingPage from '@/pages/Landing/PricingPage';

// Страницы аутентификации (используют AuthLayout)
import LoginPage from '@/pages/Auth/LoginPage';        // предположим, что они существуют
import RegisterPage from '@/pages/Auth/RegisterPage';  // предположим, что они существуют

import PersonalDataConsentPage from '@/pages/Documents/PersonalDataConsentPage';
import TermsOfUsePage from '@/pages/Documents/TermsOfUsePage';

// Страницы Dashboard (приватные, используют MainLayout)
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import GoodsListPage from '@/pages/Dashboard/GoodsListPage';
import GoodsDetailPage from '@/pages/Dashboard/GoodsDetailPage';
import SeoGenerationPage from '@/pages/Dashboard/SeoGenerationPage';
import InfographicsPage from '@/pages/Dashboard/InfographicsPage';
import ReportsPage from '@/pages/Dashboard/ReportsPage';
import ProfilePage from '@/pages/Dashboard/ProfilePage';
import SettingsPage from '@/pages/Dashboard/SettingsPage';
import GoodsCreatePage from '@/pages/Dashboard/GoodsCreatePage';
import ReportViewPage from '@/pages/Dashboard/ReportViewPage';

import PaymentSuccessPage from '@/pages/PaymentSuccessPage';


const RootRedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect-path');
    if (redirectPath) {
      sessionStorage.removeItem('redirect-path');
      // Если текущий путь отличается от сохранённого, перенаправляем
      if (redirectPath !== location.pathname + location.search) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [navigate, location]);

  return null;
};

// Компонент для защищённых маршрутов
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RootRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Загрузка приложения...</p>
        </div>
      </div>
  );
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />;
};

const App: React.FC = () => {
  const { loadUser, isLoading } = useAuthStore();
  // Загружаем пользователя при старте приложения
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ✅ Звук нажатия на кнопки (перенесён в useEffect)
  useEffect(() => {
    const audio = new Audio('/sounds/buttonsound.mp3');
    audio.volume = 0.1
    audio.load();

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button') || 
                     (target.getAttribute('role') === 'button' && target) || 
                     target.closest('[role="button"]')
      if (button) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []); // Пустой массив зависимостей – эффект выполняется один раз

  // Если ещё загружается пользователь, показываем спиннер (глобально)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter basename="">
      <RootRedirectHandler />
      <Routes>
        <Route path="/" element={<RootRoute />} />

        {/* Публичные страницы (лендинг) – без макета (они сами содержат header/footer) */}
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/personal-data-consent" element={<PersonalDataConsentPage />} />
        <Route path="/terms-of-use" element={<TermsOfUsePage />} />

        {/* Страницы аутентификации – с макетом AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Можно добавить восстановление пароля */}
          {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
        </Route>

        {/* Защищённые маршруты – с макетом MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/goods" element={<GoodsListPage />} />
          <Route path="/goods/new" element={<GoodsCreatePage />} />          
          <Route path="/goods/:id" element={<GoodsDetailPage />} />
          <Route path="/goods/:id/edit" element={<GoodsDetailPage />} />
          <Route path="/seo" element={<SeoGenerationPage />} />
          <Route path="/infographics" element={<InfographicsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/reports/view/:id" element={<ReportViewPage />} />
          <Route path="/dashboard/pricing" element={<PricingPage dashboardMode />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />

          {/* Перенаправление с корня после входа на дашборд */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Страница 404 */}
        <Route
          path=""
          element={
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
              <h1 className="text-6xl font-bold text-gray-800 dark:text-white">404</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Страница не найдена</p>
              <a
                href="/"
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Вернуться на главную
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;