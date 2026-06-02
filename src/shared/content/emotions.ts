// Структура «цветка эмоций»: 10 семей → 52 оттенка.
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
    color: '#F0C04A',
    shades: [
      {
        id: 'joy_1',
        name: 'Удовольствие',
        strength: 1,
        color: '#EAD8AE',
        description: 'приятное здесь и сейчас',
      },
      {
        id: 'joy_2',
        name: 'Удовлетворённость',
        strength: 2,
        color: '#E0C890',
        description: '«всё хорошо, достаточно»',
      },
      {
        id: 'joy_3',
        name: 'Воодушевление',
        strength: 3,
        color: '#D5B872',
        description: 'подъём, видение возможности',
      },
      {
        id: 'joy_4',
        name: 'Гордость',
        strength: 4,
        color: '#C9A754',
        description: 'за себя и своё',
      },
      {
        id: 'joy_5',
        name: 'Восторг',
        strength: 5,
        color: '#B8943D',
        description: 'яркая встреча с прекрасным',
      },
      {
        id: 'joy_6',
        name: 'Эйфория',
        strength: 6,
        color: '#977B35',
        description: 'пиковый подъём',
      },
    ],
  },
  {
    id: 'love',
    name: 'Любовь и доверие',
    color: '#E86A9A',
    shades: [
      {
        id: 'love_1',
        name: 'Симпатия',
        strength: 1,
        color: '#EAAEC5',
        description: 'принятие другого',
      },
      {
        id: 'love_2',
        name: 'Доверие',
        strength: 2,
        color: '#E195B2',
        description: 'опора на надёжность другого',
      },
      {
        id: 'love_3',
        name: 'Нежность',
        strength: 3,
        color: '#D87C9F',
        description: 'тёплая забота',
      },
      {
        id: 'love_4',
        name: 'Привязанность',
        strength: 4,
        color: '#CF638C',
        description: 'устойчивая связь',
      },
      {
        id: 'love_5',
        name: 'Сострадание',
        strength: 5,
        color: '#C54B79',
        description: 'отклик на чужую боль',
      },
      {
        id: 'love_6',
        name: 'Благодарность',
        strength: 6,
        color: '#B23C69',
        description: 'признательность за добро',
      },
      {
        id: 'love_7',
        name: 'Любовь',
        strength: 7,
        color: '#97355A',
        description: 'глубокая связь и забота',
      },
    ],
  },
  {
    id: 'peace',
    name: 'Покой и высокие состояния',
    color: '#AE8BE0',
    shades: [
      {
        id: 'peace_1',
        name: 'Принятие',
        strength: 1,
        color: '#C7AEEA',
        description: 'согласие с тем, что есть',
      },
      {
        id: 'peace_2',
        name: 'Спокойствие',
        strength: 2,
        color: '#AB88DD',
        description: 'угроз нет, ясность',
      },
      {
        id: 'peace_3',
        name: 'Умиротворение',
        strength: 3,
        color: '#8F63CF',
        description: 'тихая наполненность',
      },
      {
        id: 'peace_4',
        name: 'Безмятежность',
        strength: 4,
        color: '#743FC0',
        description: 'глубокий внутренний штиль',
      },
      {
        id: 'peace_5',
        name: 'Единство',
        strength: 5,
        color: '#5D3597',
        description: 'связь со всем, целостность',
      },
    ],
  },
  {
    id: 'interest',
    name: 'Интерес',
    color: '#EE8C3C',
    shades: [
      {
        id: 'interest_1',
        name: 'Любопытство',
        strength: 1,
        color: '#EAC9AE',
        description: 'тянет к новому',
      },
      {
        id: 'interest_2',
        name: 'Интерес',
        strength: 2,
        color: '#D8A57C',
        description: 'внимание к важному',
      },
      {
        id: 'interest_3',
        name: 'Предвкушение',
        strength: 3,
        color: '#C5824B',
        description: 'ожидание желаемого',
      },
      {
        id: 'interest_4',
        name: 'Азарт',
        strength: 4,
        color: '#976135',
        description: 'полная вовлечённость, поток',
      },
    ],
  },
  {
    id: 'surprise',
    name: 'Удивление',
    color: '#3FB6C9',
    shades: [
      {
        id: 'surprise_1',
        name: 'Недоумение',
        strength: 1,
        color: '#AEE1EA',
        description: 'непонятно, нужен ответ',
      },
      {
        id: 'surprise_2',
        name: 'Удивление',
        strength: 2,
        color: '#7CCCD8',
        description: 'неожиданное переключает внимание',
      },
      {
        id: 'surprise_3',
        name: 'Изумление',
        strength: 3,
        color: '#4BB4C5',
        description: 'сильное удивление чем-то большим',
      },
      {
        id: 'surprise_4',
        name: 'Шок',
        strength: 4,
        color: '#358997',
        description: 'резкое тяжёлое несоответствие',
      },
    ],
  },
  {
    id: 'fear',
    name: 'Страх',
    color: '#4FA6E6',
    shades: [
      {
        id: 'fear_1',
        name: 'Беспокойство',
        strength: 1,
        color: '#AED1EA',
        description: 'смутное «что-то не так»',
      },
      {
        id: 'fear_2',
        name: 'Тревога',
        strength: 2,
        color: '#90BEE0',
        description: 'предчувствие неясной угрозы впереди',
      },
      {
        id: 'fear_3',
        name: 'Испуг',
        strength: 3,
        color: '#72ABD5',
        description: 'резкая реакция на внезапное',
      },
      {
        id: 'fear_4',
        name: 'Страх',
        strength: 4,
        color: '#5498C9',
        description: 'ответ на конкретную опасность',
      },
      {
        id: 'fear_5',
        name: 'Паника',
        strength: 5,
        color: '#3D84B8',
        description: 'угроза кажется неуправляемой',
      },
      {
        id: 'fear_6',
        name: 'Ужас',
        strength: 6,
        color: '#356D97',
        description: 'реакция на невыносимую угрозу',
      },
    ],
  },
  {
    id: 'sadness',
    name: 'Печаль',
    color: '#5E84D8',
    shades: [
      {
        id: 'sadness_1',
        name: 'Грусть',
        strength: 1,
        color: '#AEC1EA',
        description: 'от небольшой потери',
      },
      {
        id: 'sadness_2',
        name: 'Разочарование',
        strength: 2,
        color: '#90A9E0',
        description: 'ожидание не оправдалось',
      },
      {
        id: 'sadness_3',
        name: 'Сожаление',
        strength: 3,
        color: '#7291D5',
        description: 'о прошлом выборе',
      },
      {
        id: 'sadness_4',
        name: 'Тоска',
        strength: 4,
        color: '#5479C9',
        description: 'томление по утраченному',
      },
      {
        id: 'sadness_5',
        name: 'Уныние',
        strength: 5,
        color: '#3D63B8',
        description: 'упадок сил и смысла',
      },
      {
        id: 'sadness_6',
        name: 'Горе',
        strength: 6,
        color: '#355497',
        description: 'глубокая значимая утрата',
      },
    ],
  },
  {
    id: 'shame',
    name: 'Стыд и вина',
    color: '#B07AD8',
    shades: [
      {
        id: 'shame_1',
        name: 'Смущение',
        strength: 1,
        color: '#D0AEEA',
        description: 'лёгкая неловкость на людях',
      },
      {
        id: 'shame_2',
        name: 'Вина',
        strength: 2,
        color: '#B17CD8',
        description: '«я поступила плохо по отношению к другому»',
      },
      {
        id: 'shame_3',
        name: 'Стыд',
        strength: 3,
        color: '#914BC5',
        description: '«я сама плохая»',
      },
      {
        id: 'shame_4',
        name: 'Унижение',
        strength: 4,
        color: '#6D3597',
        description: 'публичное обесценивание',
      },
    ],
  },
  {
    id: 'disgust',
    name: 'Отвращение',
    color: '#74C24A',
    shades: [
      {
        id: 'disgust_1',
        name: 'Брезгливость',
        strength: 1,
        color: '#C3EAAE',
        description: 'защита от «грязного»',
      },
      {
        id: 'disgust_2',
        name: 'Неприязнь',
        strength: 2,
        color: '#89CF63',
        description: 'отталкивает человек или объект',
      },
      {
        id: 'disgust_3',
        name: 'Презрение',
        strength: 3,
        color: '#579735',
        description: 'ощущение превосходства, отвержение',
      },
    ],
  },
  {
    id: 'anger',
    name: 'Гнев',
    color: '#D24A3E',
    shades: [
      {
        id: 'anger_1',
        name: 'Досада',
        strength: 1,
        color: '#EAB3AE',
        description: 'мелкая помеха задевает',
      },
      {
        id: 'anger_2',
        name: 'Раздражение',
        strength: 2,
        color: '#E19B95',
        description: 'накопившееся недовольство',
      },
      {
        id: 'anger_3',
        name: 'Обида',
        strength: 3,
        color: '#D8837C',
        description: 'несправедливость от близкого',
      },
      {
        id: 'anger_4',
        name: 'Зависть',
        strength: 4,
        color: '#CF6C63',
        description: 'у другого есть желаемое мной',
      },
      {
        id: 'anger_5',
        name: 'Ревность',
        strength: 5,
        color: '#C5554B',
        description: 'страх потерять важную связь',
      },
      {
        id: 'anger_6',
        name: 'Злость',
        strength: 6,
        color: '#B2453C',
        description: 'энергия убрать препятствие',
      },
      {
        id: 'anger_7',
        name: 'Ярость',
        strength: 7,
        color: '#973D35',
        description: 'предельный гнев, контроль теряется',
      },
    ],
  },
];
