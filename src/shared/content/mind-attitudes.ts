/**
 * Установки ума — 50 пар «негативная установка → позитивная переустановка» из методички
 * школы (финальный авторский контент, тексты не выдумываем). Это контент практики
 * «Установки ума» (Фаза 5.5): маркировка «это про меня» и 21-дневные циклы аффирмаций.
 * Тот же набор питает карту дня. Будущая таблица — mind_attitudes.
 *
 * Шаг «фоновая мысль» в записи эмоции на это НЕ опирается, там отдельный КПТ-контент
 * (см. background-thoughts.ts).
 *
 * Разметка:
 *  - sphere — основная сфера жизни (= одна из 7 «Ревизии»/чакр);
 *  - negativeEmotions — семьи негативных эмоций, за которыми стоит НЕГАТИВНАЯ установка;
 *  - positiveEmotions — семьи позитивных эмоций, которым созвучна ПОЗИТИВНАЯ переустановка.
 *
 * ⚠️ Тексты методички (1..50) — финальные. Разметка — рабочая, спорные пункты сверить с куратором (§10).
 * Записи 51–52 («Удивление») добавлены вне методички, тексты от Артёма.
 */

import type { LifeSphereId } from './life-spheres';

export interface MindAttitude {
  /** Номер из методички (1..50); записи 51+ добавлены вне методички. */
  id: number;
  /** Негативная установка. null — у записи нет негативной пары (только светлая переустановка). */
  negative: string | null;
  positive: string;
  sphere: LifeSphereId;
  /** Семьи негативных эмоций, за которыми обычно стоит негативная установка. */
  negativeEmotions: string[];
  /** Семьи позитивных эмоций, которым созвучна позитивная переустановка. */
  positiveEmotions: string[];
}

export const MIND_ATTITUDES: MindAttitude[] = [
  {
    id: 1,
    negative: 'Люди должны вести себя так, как я ожидаю.',
    positive: 'Каждый человек имеет право вести себя так, как считает нужным.',
    sphere: 'heart',
    negativeEmotions: ['anger'],
    positiveEmotions: ['love', 'peace'],
  },
  {
    id: 2,
    negative: 'Я должен быть хорошим и удобным для всех.',
    positive: 'Я уникальная личность и свободно проявляю себя перед людьми.',
    sphere: 'throat',
    negativeEmotions: ['shame', 'fear'],
    positiveEmotions: ['joy', 'interest'],
  },
  {
    id: 3,
    negative: 'Любовь — это желание сделать приятно.',
    positive: 'Любовь — это помощь на пути к Свету.',
    sphere: 'heart',
    negativeEmotions: [],
    positiveEmotions: ['love'],
  },
  {
    id: 4,
    negative: 'Страдания и боль — это зло.',
    positive: 'Страдания и боль — это сигналы о необходимости восстановления гармонии и здоровья.',
    sphere: 'root',
    negativeEmotions: ['fear', 'sadness'],
    positiveEmotions: ['peace'],
  },
  {
    id: 5,
    negative: 'Физическая смерть — это зло.',
    positive: 'Физическая смерть — это переход в духовный мир и возможность родиться снова.',
    sphere: 'crown',
    negativeEmotions: ['fear'],
    positiveEmotions: ['peace'],
  },
  {
    id: 6,
    negative: 'Я виноват(а). Мне нет прощения.',
    positive: 'Любую ошибку можно исправить и извлечь из неё урок на будущее.',
    sphere: 'heart',
    negativeEmotions: ['shame', 'sadness'],
    positiveEmotions: ['love', 'peace'],
  },
  {
    id: 7,
    negative: 'Я жду от окружающих внимания и любви.',
    positive: 'Я Источник Любви и Света для всех людей.',
    sphere: 'heart',
    negativeEmotions: ['sadness'],
    positiveEmotions: ['love'],
  },
  {
    id: 8,
    negative: 'Я избегаю ответственности за свои слова и поступки.',
    positive: 'Я люблю свободу и беру на себя ответственность за свою жизнь.',
    sphere: 'solar',
    negativeEmotions: ['fear'],
    positiveEmotions: ['joy'],
  },
  {
    id: 9,
    negative: 'Деньги — это зло и грязь.',
    positive: 'Деньги — это материальная энергия Бога, данная людям для радости и развития.',
    sphere: 'solar',
    negativeEmotions: ['shame', 'disgust'],
    positiveEmotions: ['joy'],
  },
  {
    id: 10,
    negative: 'Я страдаю за грехи родителей (рода, своих прошлых жизней).',
    positive: 'Я хозяин(ка) своей жизни и сам(а) строю нужную мне реальность.',
    sphere: 'solar',
    negativeEmotions: ['sadness', 'fear'],
    positiveEmotions: ['joy', 'interest'],
  },
  {
    id: 11,
    negative: 'Я не верю в Бога (духовный мир) без доказательств.',
    positive:
      'Доказательства реальности Бога (духовного мира) существуют во мне самом(ой), и каждый день я учусь их видеть.',
    sphere: 'crown',
    negativeEmotions: ['fear'],
    positiveEmotions: ['peace', 'interest'],
  },
  {
    id: 12,
    negative: 'Я жду счастливого случая, ничего не делая для исполнения своей мечты.',
    positive: 'Я сам(а) творец своего счастья.',
    sphere: 'solar',
    negativeEmotions: ['sadness'],
    positiveEmotions: ['joy'],
  },
  {
    id: 13,
    negative: 'Я жду подтверждения правильности выбора от других людей.',
    positive: 'Я имею право на любой выбор и принимаю на себя ответственность за его последствия.',
    sphere: 'solar',
    negativeEmotions: ['fear'],
    positiveEmotions: ['joy'],
  },
  {
    id: 14,
    negative: 'Моё тело некрасиво (уродливо, безобразно).',
    positive: 'Моё тело — прекрасный Храм Духа.',
    sphere: 'root',
    negativeEmotions: ['shame'],
    positiveEmotions: ['love', 'joy'],
  },
  {
    id: 15,
    negative: 'Получение удовольствий через тело уводит меня от Бога и духовного развития.',
    positive:
      'Моё тело дано мне Богом для радости, я благодарю Бога за наслаждения, которые оно мне даёт.',
    sphere: 'sacral',
    negativeEmotions: ['shame'],
    positiveEmotions: ['joy', 'love'],
  },
  {
    id: 16,
    negative: 'Мясо понижает духовные вибрации.',
    positive:
      'Я благодарю души животных за плоть, отданную на питание людям, и посылаю им и их создателям свет своей Любви.',
    sphere: 'root',
    negativeEmotions: ['disgust'],
    positiveEmotions: ['love'],
  },
  {
    id: 17,
    negative: 'Секс — это низко и грязно, он приравнивает людей к животным.',
    positive: 'Сексуальная энергия — это проявление Божественной Любви через тело.',
    sphere: 'sacral',
    negativeEmotions: ['shame', 'disgust'],
    positiveEmotions: ['love', 'joy'],
  },
  {
    id: 18,
    negative: 'Власть и богатство опасны для духовного развития.',
    positive: 'Власть и богатство — это возможности, данные Богом для духовного развития.',
    sphere: 'solar',
    negativeEmotions: ['fear'],
    positiveEmotions: ['interest', 'joy'],
  },
  {
    id: 19,
    negative: 'Работа должна быть приятной.',
    positive: 'Меня радует любой труд для своего развития и блага других людей.',
    sphere: 'solar',
    negativeEmotions: ['anger'],
    positiveEmotions: ['joy', 'interest'],
  },
  {
    id: 20,
    negative: 'Отдых — это пустая трата времени.',
    positive: 'Отдых — это потребность тела, необходимая для более эффективной работы.',
    sphere: 'solar',
    negativeEmotions: ['shame'],
    positiveEmotions: ['peace'],
  },
  {
    id: 21,
    negative: 'Я не могу слышать своё высшее Я.',
    positive: 'Я всегда в контакте с высшим Я через духовный канал.',
    sphere: 'crown',
    negativeEmotions: ['sadness', 'fear'],
    positiveEmotions: ['peace'],
  },
  {
    id: 22,
    negative: 'Я не доверяю ответам от высшего Я.',
    positive:
      'Доверять высшему Я безопасно, ведь это высшая часть меня, имеющая ответы на все мои вопросы.',
    sphere: 'crown',
    negativeEmotions: ['fear'],
    positiveEmotions: ['peace'],
  },
  {
    id: 23,
    negative: 'Я недостоин(на) любви.',
    positive: 'Я любимое дитя Бога.',
    sphere: 'heart',
    negativeEmotions: ['shame', 'sadness'],
    positiveEmotions: ['love'],
  },
  {
    id: 24,
    negative: 'Я должен(на) создать семью и родить детей.',
    positive: 'Я сам(а) решаю, что в жизни для меня важнее всего.',
    sphere: 'sacral',
    negativeEmotions: ['shame', 'fear'],
    positiveEmotions: ['joy'],
  },
  {
    id: 25,
    negative: 'Нужно молчать, когда мне больно, грустно или страшно.',
    positive: 'Я свободно проявляю любые чувства и эмоции и преобразую их в чистый Свет Любви.',
    sphere: 'throat',
    negativeEmotions: ['sadness', 'fear', 'shame'],
    positiveEmotions: ['love', 'joy'],
  },
  {
    id: 26,
    negative: 'Нужно подавлять гнев и раздражение.',
    positive: 'Когда я ощущаю гнев, я направляю его энергию на изменение себя и своей жизни.',
    sphere: 'throat',
    negativeEmotions: ['anger'],
    positiveEmotions: ['interest'],
  },
  {
    id: 27,
    negative: 'Я ни на что не способен(на).',
    positive: 'Я могу научиться чему угодно благодаря данным мне Богом разуму и телу.',
    sphere: 'solar',
    negativeEmotions: ['shame', 'sadness'],
    positiveEmotions: ['interest', 'joy'],
  },
  {
    id: 28,
    negative: 'Люди меня не понимают, осуждают, желают мне зла.',
    positive:
      'Я прощаю всех людей, которые негативно настроены против меня, и посылаю им Свет своей Любви.',
    sphere: 'heart',
    negativeEmotions: ['sadness', 'anger'],
    positiveEmotions: ['love'],
  },
  {
    id: 29,
    negative: 'Доверять людям опасно.',
    positive: 'Я доверяю Богу и людям, которых Он посылает мне навстречу.',
    sphere: 'heart',
    negativeEmotions: ['fear'],
    positiveEmotions: ['peace', 'love'],
  },
  {
    id: 30,
    negative: 'Я живу в опасном мире.',
    positive: 'Я полностью доверяю свою жизнь Богу, любое место в Его мире безопасно для меня.',
    sphere: 'root',
    negativeEmotions: ['fear'],
    positiveEmotions: ['peace'],
  },
  {
    id: 31,
    negative: 'Сомнения — это признак сильного ума.',
    positive:
      'Я благодарю свои сомнения за защиту от ошибок и верю только себе, когда совершаю выбор.',
    sphere: 'third_eye',
    negativeEmotions: ['fear'],
    positiveEmotions: ['interest'],
  },
  {
    id: 32,
    negative: 'Я лучше (выше, духовнее), чем все люди или чем какой-то человек.',
    positive: 'Все люди равны перед Богом в Свете Его Любви.',
    sphere: 'heart',
    negativeEmotions: ['disgust'],
    positiveEmotions: ['love', 'peace'],
  },
  {
    id: 33,
    negative: 'Открывать своё сердце людям опасно, потому что могут сделать больно.',
    positive:
      'Осуждение и критика безопасны для меня, потому что помогают мне расти и развиваться.',
    sphere: 'heart',
    negativeEmotions: ['fear'],
    positiveEmotions: ['interest', 'peace'],
  },
  {
    id: 34,
    negative: 'Опасно делиться своей энергией.',
    positive: 'Чем больше я излучаю в мир Света, тем больше я его получаю от Бога.',
    sphere: 'heart',
    negativeEmotions: ['fear'],
    positiveEmotions: ['love', 'joy'],
  },
  {
    id: 35,
    negative: 'Меня легко разозлить, обидеть, вывести из равновесия.',
    positive: 'Я сам(а) управляю своими чувствами и эмоциями.',
    sphere: 'solar',
    negativeEmotions: ['anger'],
    positiveEmotions: ['peace'],
  },
  {
    id: 36,
    negative: 'Я должен(на) доказывать людям свою любовь.',
    positive: 'Каждый человек принимает Свет Любви по мере своей готовности.',
    sphere: 'heart',
    negativeEmotions: ['shame'],
    positiveEmotions: ['love', 'peace'],
  },
  {
    id: 37,
    negative: 'Я должен(на) жить, как живут другие люди, и иметь всё, что есть у них.',
    positive: 'Я свободная и уникальная личность и сам(а) выбираю, как мне жить и что мне иметь.',
    sphere: 'throat',
    negativeEmotions: ['anger', 'shame'],
    positiveEmotions: ['joy'],
  },
  {
    id: 38,
    negative: 'Материальное благополучие приносит счастье.',
    positive:
      'Любая материя — это инструмент развития духа, а Источник счастья находится в моём сердце.',
    sphere: 'solar',
    negativeEmotions: ['sadness'],
    positiveEmotions: ['peace', 'joy'],
  },
  {
    id: 39,
    negative: 'Любые изменения пугают меня, моё будущее тревожно и неопределённо.',
    positive:
      'Любые изменения — это возможность для роста и развития, моё будущее наполнено Светом и Любовью.',
    sphere: 'third_eye',
    negativeEmotions: ['fear'],
    positiveEmotions: ['interest', 'peace'],
  },
  {
    id: 40,
    negative: 'Любимые люди всегда должны быть рядом со мной.',
    positive: 'Любовь позволяет быть рядом независимо от времени и расстояния.',
    sphere: 'sacral',
    negativeEmotions: ['sadness', 'fear'],
    positiveEmotions: ['love', 'peace'],
  },
  {
    id: 41,
    negative: 'Одиночество пугает меня.',
    positive: 'Одиночество — это время, данное мне Богом для познания себя и беседы с Ним.',
    sphere: 'crown',
    negativeEmotions: ['fear', 'sadness'],
    positiveEmotions: ['peace'],
  },
  {
    id: 42,
    negative: 'Я не могу управлять своими привычками, они сильнее меня.',
    positive:
      'Любые мои привычки созданы мной и могут быть изменены в любой момент, когда я захочу.',
    sphere: 'solar',
    negativeEmotions: ['shame'],
    positiveEmotions: ['joy'],
  },
  {
    id: 43,
    negative: 'Вместо Высшего Я мне может ответить кто-то другой.',
    positive:
      'Высшее Я — это моя духовная часть, оно всегда в контакте со мной и отвечает первым на любые вопросы к нему.',
    sphere: 'crown',
    negativeEmotions: ['fear'],
    positiveEmotions: ['peace'],
  },
  {
    id: 44,
    negative: 'Я не доверяю себе.',
    positive: 'Я даю себе право на ошибки, мои ошибки позволят мне приобрести бесценный опыт.',
    sphere: 'solar',
    negativeEmotions: ['fear', 'shame'],
    positiveEmotions: ['love', 'interest'],
  },
  {
    id: 45,
    negative: 'У меня мало сил и энергии.',
    positive:
      'У меня достаточно сил и энергии на любые цели и желания, согласованные с Волей Любящего меня Бога.',
    sphere: 'root',
    negativeEmotions: ['sadness', 'fear'],
    positiveEmotions: ['joy'],
  },
  {
    id: 46,
    negative: 'На меня можно воздействовать магией, колдовством, гипнозом без моего ведома.',
    positive:
      'Я доверяю Божественной защите вокруг меня; пока я нахожусь в состоянии любви, я в полной безопасности.',
    sphere: 'root',
    negativeEmotions: ['fear'],
    positiveEmotions: ['peace'],
  },
  {
    id: 47,
    negative: 'Я осуждаю правительство, законы, чиновников.',
    positive:
      'Я благодарю людей, которые находятся у власти, за их тяжёлый труд, посылаю их душам Свет своей Любви и желаю им удачи.',
    sphere: 'heart',
    negativeEmotions: ['anger'],
    positiveEmotions: ['love'],
  },
  {
    id: 48,
    negative: 'Я осуждаю преступников (убийц, воров, насильников, тиранов и т.д.).',
    positive:
      'Я прощаю всех преступников за их злые дела, посылаю их душам Свет своей Любви и желаю им вернуться на путь Божественного Света.',
    sphere: 'heart',
    negativeEmotions: ['anger', 'disgust'],
    positiveEmotions: ['love'],
  },
  {
    id: 49,
    negative: 'Я осуждаю людей другой национальности или другой религии.',
    positive:
      'Я смотрю на всех людей глазами Божественной Любви и принимаю их такими, какие они есть.',
    sphere: 'heart',
    negativeEmotions: ['anger', 'disgust'],
    positiveEmotions: ['love'],
  },
  {
    id: 50,
    negative: 'Я осуждаю себя за прошлые ошибки.',
    positive: 'Я прощаю себя за все свои ошибки и люблю себя так, как любит меня Бог.',
    sphere: 'heart',
    negativeEmotions: ['shame', 'sadness'],
    positiveEmotions: ['love'],
  },

  // --- Удивление (surprise): добавлено вне методички, тексты от Артёма. Разметка рабочая (§10). ---
  {
    id: 51,
    negative: 'Я уже всё знаю о том, как что-то или кто-то устроены.',
    positive: 'Некоторые вещи выходят за пределы моей картины мира.',
    sphere: 'third_eye',
    negativeEmotions: ['disgust'],
    positiveEmotions: ['surprise', 'interest'],
  },
  {
    id: 52,
    negative: null,
    positive: 'Даже неожиданный поворот ведёт меня туда, где я нужнее всего.',
    sphere: 'crown',
    negativeEmotions: [],
    positiveEmotions: ['surprise', 'peace'],
  },
];
