// Валентность переехала в shared/content (доменная логика семей, нужна нескольким слоям).
// Ре-экспорт сохраняет существующий путь импорта внутри слайса.
export { familyValence, type Valence } from '@/shared/content/valence';
