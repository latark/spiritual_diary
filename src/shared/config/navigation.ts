import { Home, CalendarDays, Sparkles, Compass, User, type LucideIcon } from 'lucide-react';

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

/** Порядок как в таб-баре: Синтез · Память · Действие · Путь · Я */
export const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.home, label: 'Синтез', icon: Home },
  { href: ROUTES.calendar, label: 'Память', icon: CalendarDays },
  { href: ROUTES.record, label: 'Действие', icon: Sparkles, primary: true },
  { href: ROUTES.progress, label: 'Путь', icon: Compass },
  { href: ROUTES.profile, label: 'Я', icon: User },
];
