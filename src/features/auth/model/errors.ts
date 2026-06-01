/** Человекочитаемые сообщения вместо технических ошибок Supabase Auth. */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Неверный email или пароль';
  if (m.includes('email not confirmed')) return 'Подтверди email — мы отправили письмо со ссылкой';
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Этот email уже зарегистрирован';
  if (m.includes('password') && (m.includes('weak') || m.includes('pwned') || m.includes('leaked')))
    return 'Пароль слишком простой или встречался в утечках — выбери другой';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Слишком много попыток. Попробуй чуть позже';
  return 'Что-то пошло не так. Попробуем ещё раз?';
}
