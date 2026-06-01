import { Home, CalendarDays, Sparkles, TrendingUp, User, type LucideIcon } from 'lucide-react';

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

/** Порядок как в таб-баре: Главная · Календарь · Записать · Прогресс · Я */
export const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.home, label: 'Главная', icon: Home },
  { href: ROUTES.calendar, label: 'Календарь', icon: CalendarDays },
  { href: ROUTES.record, label: 'Записать', icon: Sparkles, primary: true },
  { href: ROUTES.progress, label: 'Прогресс', icon: TrendingUp },
  { href: ROUTES.profile, label: 'Я', icon: User },
];
