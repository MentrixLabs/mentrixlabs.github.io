// src/utils/getErrorMessage.ts

/**
 * Извлекает человекочитаемое сообщение из пойманной ошибки.
 *
 * Заменяет повторявшийся по всему проекту приём `catch (err: any) { ... err.message || 'Запасной текст' }`,
 * который вынуждал типизировать ошибку как `any`. Поведение сохранено один-в-один:
 * берётся свойство `message`, если это непустая строка, иначе — запасной текст.
 */
// src/utils/getErrorMessage.ts
export const getErrorMessage = (error: unknown, fallback = 'Произошла ошибка'): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};