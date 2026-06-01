// Структура «цветка эмоций»: 10 семей → 53 оттенка.
// ⚠️ КОНТЕНТ-ЧЕРНОВИК описаний — финал от куратора школы. Структура/цвета — финальные.
// Дизайн колеса (форма лепестков, анимация и пр.) — см. «Эмоции — структура цветка.docx».

export interface EmotionShade {
  id: string;
  name: string;
  /** Порядок силы внутри семьи: 1 = мягкая (светлая) … N = сильная (тёмная). */
  strength: number;
  /** Цвет оттенка (тон семьи, осветлённый/затемнённый по силе). */
  color: string;
  description: string;
}

export interface EmotionFamily {
  id: string;
  name: string;
  /** Базовый цвет семьи. */
  color: string;
  shades: EmotionShade[];
}

export const EMOTION_FAMILIES: EmotionFamily[] = [
  {
    id: 'joy',
    name: 'Радость',
    color: '#E3B341',
    shades: [
      { id: 'joy_1', name: 'Удовольствие', strength: 1, color: '#f1d9a0', description: 'приятное здесь и сейчас' },
      { id: 'joy_2', name: 'Удовлетворённость', strength: 2, color: '#dbc28c', description: '«всё хорошо, достаточно»' },
      { id: 'joy_3', name: 'Воодушевление', strength: 3, color: '#c5aa77', description: 'подъём, видение возможности' },
      { id: 'joy_4', name: 'Гордость', strength: 4, color: '#b09363', description: 'за себя и своё' },
      { id: 'joy_5', name: 'Восторг', strength: 5, color: '#9a7b4e', description: 'яркая встреча с прекрасным' },
      { id: 'joy_6', name: 'Эйфория', strength: 6, color: '#84643a', description: 'пиковый подъём' },
    ],
  },
  {
    id: 'love',
    name: 'Любовь и доверие',
    color: '#D86B8A',
    shades: [
      { id: 'love_1', name: 'Симпатия', strength: 1, color: '#ecb5c5', description: 'принятие другого' },
      { id: 'love_2', name: 'Доверие', strength: 2, color: '#daa2b4', description: 'опора на надёжность другого' },
      { id: 'love_3', name: 'Нежность', strength: 3, color: '#c78ea3', description: 'тёплая забота' },
      { id: 'love_4', name: 'Привязанность', strength: 4, color: '#b57b92', description: 'устойчивая связь' },
      { id: 'love_5', name: 'Сострадание', strength: 5, color: '#a36781', description: 'отклик на чужую боль' },
      { id: 'love_6', name: 'Благодарность', strength: 6, color: '#905470', description: 'признательность за добро' },
      { id: 'love_7', name: 'Любовь', strength: 7, color: '#7e405f', description: 'глубокая связь и забота' },
    ],
  },
  {
    id: 'peace',
    name: 'Покой и высокие состояния',
    color: '#CBB9E6',
    shades: [
      { id: 'peace_1', name: 'Принятие', strength: 1, color: '#e5dcf3', description: 'согласие с тем, что есть' },
      { id: 'peace_2', name: 'Спокойствие', strength: 2, color: '#cabfda', description: 'угроз нет, ясность' },
      { id: 'peace_3', name: 'Умиротворение', strength: 3, color: '#afa2c0', description: 'тихая наполненность' },
      { id: 'peace_4', name: 'Безмятежность', strength: 4, color: '#9384a7', description: 'глубокий внутренний штиль' },
      { id: 'peace_5', name: 'Единство', strength: 5, color: '#78678d', description: 'связь со всем, целостность' },
    ],
  },
  {
    id: 'interest',
    name: 'Интерес',
    color: '#E0863C',
    shades: [
      { id: 'interest_1', name: 'Любопытство', strength: 1, color: '#f0c39e', description: 'тянет к новому' },
      { id: 'interest_2', name: 'Интерес', strength: 2, color: '#cb9c7c', description: 'внимание к важному' },
      { id: 'interest_3', name: 'Предвкушение', strength: 3, color: '#a7745a', description: 'ожидание желаемого' },
      { id: 'interest_4', name: 'Азарт', strength: 4, color: '#824d38', description: 'полная вовлечённость, поток' },
    ],
  },
  {
    id: 'surprise',
    name: 'Удивление',
    color: '#3FB6C9',
    shades: [
      { id: 'surprise_1', name: 'Недоумение', strength: 1, color: '#9fdbe4', description: 'непонятно, нужен ответ' },
      { id: 'surprise_2', name: 'Удивление', strength: 2, color: '#7bb4c2', description: 'неожиданное переключает внимание' },
      { id: 'surprise_3', name: 'Изумление', strength: 3, color: '#568ca0', description: 'сильное удивление чем-то большим' },
      { id: 'surprise_4', name: 'Шок', strength: 4, color: '#32657e', description: 'резкое тяжёлое несоответствие' },
    ],
  },
  {
    id: 'fear',
    name: 'Страх',
    color: '#4F9D6B',
    shades: [
      { id: 'fear_1', name: 'Беспокойство', strength: 1, color: '#a7ceb5', description: 'смутное «что-то не так»' },
      { id: 'fear_2', name: 'Тревога', strength: 2, color: '#91b7a1', description: 'предчувствие неясной угрозы впереди' },
      { id: 'fear_3', name: 'Испуг', strength: 3, color: '#7b9f8c', description: 'резкая реакция на внезапное' },
      { id: 'fear_4', name: 'Страх', strength: 4, color: '#668878', description: 'ответ на конкретную опасность' },
      { id: 'fear_5', name: 'Паника', strength: 5, color: '#507063', description: 'угроза кажется неуправляемой' },
      { id: 'fear_6', name: 'Ужас', strength: 6, color: '#3a594f', description: 'реакция на невыносимую угрозу' },
    ],
  },
  {
    id: 'sadness',
    name: 'Печаль',
    color: '#5A78C4',
    shades: [
      { id: 'sadness_1', name: 'Грусть', strength: 1, color: '#adbce2', description: 'от небольшой потери' },
      { id: 'sadness_2', name: 'Разочарование', strength: 2, color: '#97a4ce', description: 'ожидание не оправдалось' },
      { id: 'sadness_3', name: 'Сожаление', strength: 3, color: '#818db9', description: 'о прошлом выборе' },
      { id: 'sadness_4', name: 'Тоска', strength: 4, color: '#6b75a5', description: 'томление по утраченному' },
      { id: 'sadness_5', name: 'Уныние', strength: 5, color: '#555e90', description: 'упадок сил и смысла' },
      { id: 'sadness_6', name: 'Горе', strength: 6, color: '#3f467c', description: 'глубокая значимая утрата' },
    ],
  },
  {
    id: 'shame',
    name: 'Стыд и вина',
    color: '#6B6191',
    shades: [
      { id: 'shame_1', name: 'Смущение', strength: 1, color: '#b5b0c8', description: 'лёгкая неловкость на людях' },
      { id: 'shame_2', name: 'Вина', strength: 2, color: '#9189a6', description: '«я поступила плохо по отношению к другому»' },
      { id: 'shame_3', name: 'Стыд', strength: 3, color: '#6c6284', description: '«я сама плохая»' },
      { id: 'shame_4', name: 'Унижение', strength: 4, color: '#483b62', description: 'публичное обесценивание' },
    ],
  },
  {
    id: 'disgust',
    name: 'Отвращение',
    color: '#7E7A3C',
    shades: [
      { id: 'disgust_1', name: 'Брезгливость', strength: 1, color: '#bfbd9e', description: 'защита от «грязного»' },
      { id: 'disgust_2', name: 'Неприязнь', strength: 2, color: '#9a967c', description: 'отталкивает человек или объект' },
      { id: 'disgust_3', name: 'Презрение', strength: 3, color: '#766e5a', description: 'ощущение превосходства, отвержение' },
      { id: 'disgust_4', name: 'Моральное отвращение', strength: 4, color: '#514738', description: 'нарушены глубинные ценности' },
    ],
  },
  {
    id: 'anger',
    name: 'Гнев',
    color: '#C0453B',
    shades: [
      { id: 'anger_1', name: 'Досада', strength: 1, color: '#e0a29d', description: 'мелкая помеха задевает' },
      { id: 'anger_2', name: 'Раздражение', strength: 2, color: '#ce8f8c', description: 'накопившееся недовольство' },
      { id: 'anger_3', name: 'Обида', strength: 3, color: '#bb7b7b', description: 'несправедливость от близкого' },
      { id: 'anger_4', name: 'Зависть', strength: 4, color: '#a9686a', description: 'у другого есть желаемое мной' },
      { id: 'anger_5', name: 'Ревность', strength: 5, color: '#975459', description: 'страх потерять важную связь' },
      { id: 'anger_6', name: 'Злость', strength: 6, color: '#844148', description: 'энергия убрать препятствие' },
      { id: 'anger_7', name: 'Ярость', strength: 7, color: '#722d37', description: 'предельный гнев, контроль теряется' },
    ],
  },
];
