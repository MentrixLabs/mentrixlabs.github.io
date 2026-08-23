// src/pages/Auth/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';
import { Alert, Button, FormField, Input } from '@/components/ui';
import { createPayment } from '@/api/payment';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Пароли не совпадают');
      return;
    }

    if (!isConsentGiven) {
      setLocalError('Для регистрации необходимо дать согласие на обработку персональных данных');
      return;
    }

    if (!isTermsAccepted) {
      setLocalError('Для регистрации необходимо принять условия пользовательского соглашения');
      return;
    }

    try {
      // Регистрация
      await register(username, email, password);

      // Проверка плана для оплаты
      const plan = searchParams.get('plan');
      if (plan && plan !== 'free') {
        const amounts: Record<string, number> = {
          starter: 12990,
          business: 52990,
        };
        const amount = amounts[plan];
        if (amount) {
          try {
            const payment = await createPayment({
              amount,
              description: `Оплата тарифа ${plan}`,
            });
            // Перенаправляем на страницу оплаты ЮKassa
            window.location.href = payment.confirmation_url;
            return; // прерываем выполнение, чтобы не было редиректа на dashboard
          } catch (payError) {
            setLocalError('Не удалось создать платёж. Попробуйте позже.');
            return; // остаёмся на странице регистрации с ошибкой
          }
        }
      }

      // Если план бесплатный или оплата не требуется
      navigate('/dashboard');
    } catch (err) {
      // ошибка уже в сторе, ничего не делаем
    }
  };

  const displayError = localError ?? error;

  const handleConsentChange = (checked: boolean) => {
    setIsConsentGiven(checked);
    if (localError?.includes('согласие')) setLocalError(null);
  };

  const handleTermsChange = (checked: boolean) => {
    setIsTermsAccepted(checked);
    if (localError?.includes('пользовательского соглашения')) setLocalError(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Регистрация
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="fullName" label="Имя">
          {(field) => (
            <Input
              {...field}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Введите имя пользователя"
              required
            />
          )}
        </FormField>
        <FormField id="email" label="Email">
          {(field) => (
            <Input
              {...field}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          )}
        </FormField>
        <FormField id="password" label="Пароль">
          {(field) => (
            <Input
              {...field}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          )}
        </FormField>
        <FormField id="confirmPassword" label="Подтверждение пароля">
          {(field) => (
            <Input
              {...field}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          )}
        </FormField>

        {/* ЧЕКБОКС: СОГЛАСИЕ НА ОБРАБОТКУ ПД */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="consent"
            checked={isConsentGiven}
            onChange={(e) => handleConsentChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="consent" className="text-sm text-gray-700 dark:text-gray-300">
            Я даю согласие на обработку моих персональных данных (имя, email) в целях
            регистрации и предоставления доступа к сервису. С{' '}
            <a
              href="/personal-data-consent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              условиями обработки ПД
            </a>{' '}
            ознакомлен(а) и согласен(а).
          </label>
        </div>

        {/* ЧЕКБОКС: ПРИНЯТИЕ ПОЛЬЗОВАТЕЛЬСКОГО СОГЛАШЕНИЯ */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={isTermsAccepted}
            onChange={(e) => handleTermsChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
            Я принимаю условия{' '}
            <a
              href="/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              пользовательского соглашения
            </a>{' '}
            и обязуюсь их соблюдать.
          </label>
        </div>

        {displayError && <Alert variant="error">{displayError}</Alert>}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Зарегистрироваться
        </Button>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;