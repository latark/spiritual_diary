import { Home, CalendarDays, Sparkles, Compass, type LucideIcon } from 'lucide-react';

export const ROUTES = {
  home: '/',
  record: '/record',
  calendar: '/calendar',
  progress: '/progress',
  profile: '/profile',
  help: '/help',
  login: '/login',
  register: '/register',
  onboarding: '/onboarding',
} as const;

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Центральная приподнятая кнопка в мобильном таб-баре */
  primary?: boolean;
}

/**
 * Порядок как в таб-баре: Дом · Память · Путь · Записать.
 * «Записать» — золотая кнопка действия, стоит последней (правый край таб-бара / низ сайдбара).
 * «Дом» теперь совмещает прежние «Дом» и «Я» (тело света + намерение живут там).
 * Аккаунт/поддержка/выход — низкочастотное, вынесены за иконку (см. Topbar/Sidebar → /profile),
 * а не отдельной вкладкой.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.home, label: 'Дом', icon: Home },
  { href: ROUTES.calendar, label: 'Память', icon: CalendarDays },
  { href: ROUTES.progress, label: 'Путь', icon: Compass },
  { href: ROUTES.record, label: 'Записать', icon: Sparkles, primary: true },
];
