import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// Базовый URL бэкенда (берётся из переменных окружения)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mlstartupbackend-mentrixlabs.amvera.io';

// Ключ для хранения токена в localStorage
const TOKEN_KEY = 'access_token';

// Создаём экземпляр Axios
const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5*60000, // 5 минут
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запроса – добавляем токен авторизации
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Перехватчик ответа – глобальная обработка ошибок
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    // Если получена 401 (неавторизован), можно попытаться обновить токен,
    // но для простоты просто сбрасываем и редиректим на логин.
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Здесь можно вызвать событие или редирект, но не в api-слое.
      // Например, window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;