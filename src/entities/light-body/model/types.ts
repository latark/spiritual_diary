/** Состояние тела света пользователя (строка light_body_state, дефолты если строки нет). */
export interface LightBodyState {
  points: number;
  activeDays: number;
  lastActiveDate: string | null; // 'YYYY-MM-DD' (локальная дата последней записи)
  acknowledgedStage: number; // 1..13 — подтверждённая кнопкой фаза
}
