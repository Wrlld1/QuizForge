import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const achievements = [
  { key: 'first_blood', name: 'Первая кровь', description: 'Завершите первую игру', icon: 'Sword', xpReward: 50 },
  { key: 'perfect_round', name: 'Идеальный раунд', description: '100% правильных ответов в сессии', icon: 'CheckCircle', xpReward: 100 },
  { key: 'speed_demon', name: 'Скоростной демон', description: 'Ответьте на каждый вопрос менее чем за 5 секунд', icon: 'Zap', xpReward: 150 },
  { key: 'marathon_runner', name: 'Марафонец', description: 'Наберите 500+ очков в режиме Марафон', icon: 'Flame', xpReward: 100 },
  { key: 'battle_winner', name: 'Победитель батла', description: 'Выиграйте первый батл', icon: 'Swords', xpReward: 100 },
  { key: 'on_fire', name: 'В ударе', description: '10 правильных ответов подряд', icon: 'Flame', xpReward: 120 },
  { key: 'scholar', name: 'Эрудит', description: 'Сыграйте во всех 6 категориях', icon: 'BookOpen', xpReward: 80 },
  { key: 'veteran', name: 'Ветеран', description: 'Сыграйте 50 игр', icon: 'Shield', xpReward: 200 },
  { key: 'elite', name: 'Элита', description: 'Достигните рейтинга 1500', icon: 'Star', xpReward: 250 },
  { key: 'grandmaster', name: 'Грандмастер', description: 'Достигните рейтинга 2000', icon: 'Crown', xpReward: 500 },
]

const questions = [
  // =====================================================================
  // HTML — 30 questions (10 easy, 10 medium, 10 hard)
  // =====================================================================

  // HTML EASY (10)
  { text: 'Что означает аббревиатура HTML?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], answer: 0, category: 'html', difficulty: 'easy' },
  { text: 'Какой HTML-элемент определяет заголовок документа?', options: ['<meta>', '<head>', '<title>', '<header>'], answer: 2, category: 'html', difficulty: 'easy' },
  { text: 'Какой HTML-тег создаёт гиперссылку?', options: ['<link>', '<a>', '<href>', '<nav>'], answer: 1, category: 'html', difficulty: 'easy' },
  { text: 'Какой HTML-элемент вставляет перенос строки?', options: ['<break>', '<lb>', '<br>', '<newline>'], answer: 2, category: 'html', difficulty: 'easy' },
  { text: 'Какой тег создаёт нумерованный список?', options: ['<ul>', '<ol>', '<li>', '<list>'], answer: 1, category: 'html', difficulty: 'easy' },
  { text: 'Какой тег используется для вставки изображения?', options: ['<picture>', '<img>', '<image>', '<src>'], answer: 1, category: 'html', difficulty: 'easy' },
  { text: 'Какой тег создаёт абзац текста?', options: ['<text>', '<paragraph>', '<p>', '<br>'], answer: 2, category: 'html', difficulty: 'easy' },
  { text: 'Какой атрибут указывает URL ссылки в теге <a>?', options: ['src', 'link', 'href', 'url'], answer: 2, category: 'html', difficulty: 'easy' },
  { text: 'Какой тег используется для жирного текста?', options: ['<bold>', '<b>', '<strong>', 'Оба <b> и <strong>'], answer: 3, category: 'html', difficulty: 'easy' },
  { text: 'Какой HTML-тег создаёт горизонтальную линию?', options: ['<line>', '<hr>', '<border>', '<separator>'], answer: 1, category: 'html', difficulty: 'easy' },

  // HTML MEDIUM (10)
  { text: 'Какой HTML-атрибут задаёт альтернативный текст для изображения?', options: ['title', 'src', 'alt', 'longdesc'], answer: 2, category: 'html', difficulty: 'medium' },
  { text: 'Какой HTML-элемент определяет подвал документа?', options: ['<bottom>', '<section>', '<footer>', '<end>'], answer: 2, category: 'html', difficulty: 'medium' },
  { text: 'Что делает тег <em>?', options: ['Выделяет текст курсивом (смысловое ударение)', 'Делает текст жирным', 'Создаёт перенос строки', 'Вставляет медиа-контент'], answer: 0, category: 'html', difficulty: 'medium' },
  { text: 'Какой атрибут делает поле ввода обязательным перед отправкой формы?', options: ['validate', 'required', 'mandatory', 'needed'], answer: 1, category: 'html', difficulty: 'medium' },
  { text: 'Какой семантический тег обозначает основной контент страницы?', options: ['<content>', '<section>', '<main>', '<body>'], answer: 2, category: 'html', difficulty: 'medium' },
  { text: 'Какой тег используется для навигационных ссылок?', options: ['<navigation>', '<links>', '<nav>', '<menu>'], answer: 2, category: 'html', difficulty: 'medium' },
  { text: 'Какой атрибут тега <input> задаёт подсказку внутри поля?', options: ['hint', 'placeholder', 'label', 'title'], answer: 1, category: 'html', difficulty: 'medium' },
  { text: 'Какой тег используется для группировки элементов формы?', options: ['<group>', '<formgroup>', '<fieldset>', '<div>'], answer: 2, category: 'html', difficulty: 'medium' },
  { text: 'Какой атрибут тега <meta> задаёт кодировку страницы?', options: ['encoding', 'charset', 'lang', 'type'], answer: 1, category: 'html', difficulty: 'medium' },
  { text: 'Что делает атрибут defer в теге <script>?', options: ['Загружает скрипт синхронно', 'Откладывает выполнение до полной загрузки DOM', 'Отключает скрипт', 'Делает скрипт асинхронным'], answer: 1, category: 'html', difficulty: 'medium' },

  // HTML HARD (10)
  { text: 'Какой тип input создаёт ползунок (slider)?', options: ['slider', 'range', 'scroll', 'control'], answer: 1, category: 'html', difficulty: 'hard' },
  { text: 'Для чего предназначен элемент <datalist>?', options: ['Для отображения данных в таблице', 'Для автодополнения вариантов в поле ввода', 'Для создания выпадающего меню', 'Для определения источника данных'], answer: 1, category: 'html', difficulty: 'hard' },
  { text: 'Какой атрибут ARIA делает элемент невидимым для скринридеров?', options: ['aria-disabled', 'aria-hidden', 'aria-invisible', 'aria-ignore'], answer: 1, category: 'html', difficulty: 'hard' },
  { text: 'Какой тег HTML5 используется для отображения прогресса выполнения задачи?', options: ['<meter>', '<progress>', '<bar>', '<loading>'], answer: 1, category: 'html', difficulty: 'hard' },
  { text: 'Что делает атрибут contenteditable?', options: ['Разрешает копирование содержимого', 'Делает элемент редактируемым прямо на странице', 'Добавляет валидацию контента', 'Защищает контент от изменений'], answer: 1, category: 'html', difficulty: 'hard' },
  { text: 'Какой элемент HTML5 используется для рисования графики через JavaScript?', options: ['<draw>', '<svg>', '<canvas>', 'Оба <svg> и <canvas>'], answer: 3, category: 'html', difficulty: 'hard' },
  { text: 'Для чего используется атрибут data-* в HTML?', options: ['Для хранения пользовательских данных в элементе', 'Для подключения базы данных', 'Для кэширования данных', 'Для валидации данных формы'], answer: 0, category: 'html', difficulty: 'hard' },
  { text: 'Какой атрибут тега <iframe> запрещает навигацию внутри фрейма?', options: ['sandbox', 'restrict', 'readonly', 'noscroll'], answer: 0, category: 'html', difficulty: 'hard' },
  { text: 'Какой тег используется для разметки аббревиатуры с расшифровкой?', options: ['<short>', '<abbr>', '<acronym>', '<def>'], answer: 1, category: 'html', difficulty: 'hard' },
  { text: 'Какой элемент HTML5 представляет самостоятельный контент (статью, пост)?', options: ['<section>', '<article>', '<aside>', '<div>'], answer: 1, category: 'html', difficulty: 'hard' },

  // =====================================================================
  // CSS — 30 questions (10 easy, 10 medium, 10 hard)
  // =====================================================================

  // CSS EASY (10)
  { text: 'Какое CSS-свойство управляет размером текста?', options: ['text-style', 'font-size', 'text-size', 'font-style'], answer: 1, category: 'css', difficulty: 'easy' },
  { text: 'Как выбрать элемент с id "demo" в CSS?', options: ['.demo', '#demo', 'demo', '*demo'], answer: 1, category: 'css', difficulty: 'easy' },
  { text: 'Какое свойство меняет цвет фона?', options: ['color', 'bgcolor', 'background-color', 'background'], answer: 2, category: 'css', difficulty: 'easy' },
  { text: 'Как сделать текст жирным в CSS?', options: ['font-weight: bold', 'text-style: bold', 'font-style: bold', 'text-weight: bold'], answer: 0, category: 'css', difficulty: 'easy' },
  { text: 'Какое свойство меняет цвет текста?', options: ['text-color', 'font-color', 'color', 'foreground'], answer: 2, category: 'css', difficulty: 'easy' },
  { text: 'Как выбрать все элементы с классом "item" в CSS?', options: ['#item', '.item', 'item', '*item'], answer: 1, category: 'css', difficulty: 'easy' },
  { text: 'Какое свойство задаёт ширину элемента?', options: ['size', 'width', 'length', 'dimension'], answer: 1, category: 'css', difficulty: 'easy' },
  { text: 'Какое свойство скрывает элемент, сохраняя его место в потоке?', options: ['display: none', 'visibility: hidden', 'opacity: 0', 'Оба visibility: hidden и opacity: 0'], answer: 3, category: 'css', difficulty: 'easy' },
  { text: 'Какое значение display полностью убирает элемент из потока?', options: ['visibility: hidden', 'display: none', 'opacity: 0', 'position: absolute'], answer: 1, category: 'css', difficulty: 'easy' },
  { text: 'Какое свойство добавляет скругление углов?', options: ['corner-radius', 'border-radius', 'border-round', 'round-corner'], answer: 1, category: 'css', difficulty: 'easy' },

  // CSS MEDIUM (10)
  { text: 'Какое CSS-свойство управляет отступами между элементами?', options: ['spacing', 'margin', 'padding', 'Оба margin и padding'], answer: 3, category: 'css', difficulty: 'medium' },
  { text: 'Что контролирует свойство z-index?', options: ['Масштаб элемента', 'Порядок наложения элементов', 'Размер шрифта', 'Скорость анимации'], answer: 1, category: 'css', difficulty: 'medium' },
  { text: 'Какое значение display делает элемент flex-контейнером?', options: ['display: block', 'display: inline', 'display: flex', 'display: grid'], answer: 2, category: 'css', difficulty: 'medium' },
  { text: 'Какое свойство flexbox выравнивает элементы по главной оси?', options: ['align-items', 'justify-content', 'flex-direction', 'align-content'], answer: 1, category: 'css', difficulty: 'medium' },
  { text: 'Что делает media query @media (max-width: 768px)?', options: ['Применяет стили для экранов шире 768px', 'Применяет стили для экранов до 768px включительно', 'Скрывает контент на мобильных', 'Меняет разрешение экрана'], answer: 1, category: 'css', difficulty: 'medium' },
  { text: 'Какой псевдокласс стилизует элемент при наведении мыши?', options: [':active', ':focus', ':hover', ':visited'], answer: 2, category: 'css', difficulty: 'medium' },
  { text: 'Какое свойство CSS задаёт внешний отступ элемента?', options: ['padding', 'margin', 'border', 'gap'], answer: 1, category: 'css', difficulty: 'medium' },
  { text: 'Какое свойство grid задаёт количество колонок?', options: ['grid-columns', 'grid-template-columns', 'grid-count', 'columns'], answer: 1, category: 'css', difficulty: 'medium' },
  { text: 'Что делает свойство overflow: hidden?', options: ['Скрывает весь элемент', 'Обрезает содержимое, выходящее за границы', 'Делает элемент невидимым', 'Запрещает прокрутку страницы'], answer: 1, category: 'css', difficulty: 'medium' },
  { text: 'Какой псевдоэлемент добавляет контент перед элементом?', options: ['::after', '::before', '::first-line', '::first-letter'], answer: 1, category: 'css', difficulty: 'medium' },

  // CSS HARD (10)
  { text: 'Каков порядок CSS Box Model от внутреннего к внешнему?', options: ['Content, Padding, Border, Margin', 'Content, Margin, Padding, Border', 'Margin, Border, Padding, Content', 'Border, Padding, Content, Margin'], answer: 0, category: 'css', difficulty: 'hard' },
  { text: 'Какое CSS-свойство создаёт плавный эффект перехода?', options: ['animation', 'transform', 'transition', 'keyframes'], answer: 2, category: 'css', difficulty: 'hard' },
  { text: 'Что делает position: sticky?', options: ['Элемент фиксируется относительно viewport', 'Элемент переключается между relative и fixed при скролле', 'Элемент абсолютно позиционирован внутри родителя', 'Элемент убирается из потока'], answer: 1, category: 'css', difficulty: 'hard' },
  { text: 'Какая специфичность у селектора #header .nav a?', options: ['0-1-1-1', '1-1-1-0', '0-1-2-0', '0-1-1-1'], answer: 3, category: 'css', difficulty: 'hard' },
  { text: 'Что делает функция CSS calc()?', options: ['Вызывает JavaScript-функцию', 'Выполняет математические вычисления в значениях свойств', 'Калибрует цвета', 'Рассчитывает время анимации'], answer: 1, category: 'css', difficulty: 'hard' },
  { text: 'Как объявить CSS-переменную (custom property)?', options: ['$color: red', '@color: red', '--color: red', 'var-color: red'], answer: 2, category: 'css', difficulty: 'hard' },
  { text: 'Какое свойство CSS создаёт анимацию на основе @keyframes?', options: ['transition', 'animation', 'transform', 'motion'], answer: 1, category: 'css', difficulty: 'hard' },
  { text: 'Что делает свойство will-change в CSS?', options: ['Предупреждает браузер о будущих изменениях для оптимизации', 'Отменяет изменения стилей', 'Создаёт анимацию при изменении', 'Блокирует изменение свойств'], answer: 0, category: 'css', difficulty: 'hard' },
  { text: 'Какой результат у выражения: 1em + 10px при font-size 16px?', options: ['26px', 'Ошибка — нельзя складывать разные единицы без calc()', '11px', '1.625em'], answer: 1, category: 'css', difficulty: 'hard' },
  { text: 'Какое свойство flexbox позволяет элементам переноситься на новую строку?', options: ['flex-direction', 'flex-wrap', 'flex-flow', 'align-content'], answer: 1, category: 'css', difficulty: 'hard' },

  // =====================================================================
  // JavaScript — 30 questions (10 easy, 10 medium, 10 hard)
  // =====================================================================

  // JavaScript EASY (10)
  { text: 'Какое ключевое слово объявляет константу в JavaScript?', options: ['var', 'let', 'const', 'static'], answer: 2, category: 'javascript', difficulty: 'easy' },
  { text: 'Какой метод добавляет элемент в конец массива?', options: ['push()', 'pop()', 'shift()', 'unshift()'], answer: 0, category: 'javascript', difficulty: 'easy' },
  { text: 'Что проверяет оператор "==="?', options: ['Только значение', 'Только тип', 'Значение и тип', 'Ссылку'], answer: 2, category: 'javascript', difficulty: 'easy' },
  { text: 'Какой метод удаляет последний элемент массива?', options: ['push()', 'pop()', 'shift()', 'delete()'], answer: 1, category: 'javascript', difficulty: 'easy' },
  { text: 'Какой тип данных возвращает typeof "hello"?', options: ['"text"', '"string"', '"char"', '"word"'], answer: 1, category: 'javascript', difficulty: 'easy' },
  { text: 'Как написать однострочный комментарий в JavaScript?', options: ['<!-- комментарий -->', '// комментарий', '/* комментарий */', '# комментарий'], answer: 1, category: 'javascript', difficulty: 'easy' },
  { text: 'Какой метод выводит сообщение в консоль?', options: ['print()', 'console.log()', 'log()', 'output()'], answer: 1, category: 'javascript', difficulty: 'easy' },
  { text: 'Какое значение имеет необъявленная переменная?', options: ['null', '0', 'undefined', '""'], answer: 2, category: 'javascript', difficulty: 'easy' },
  { text: 'Какой оператор используется для конкатенации строк?', options: ['&', '+', '.', ','], answer: 1, category: 'javascript', difficulty: 'easy' },
  { text: 'Какой метод массива проверяет, содержит ли он элемент?', options: ['contains()', 'includes()', 'has()', 'exists()'], answer: 1, category: 'javascript', difficulty: 'easy' },

  // JavaScript MEDIUM (10)
  { text: 'Что возвращает typeof null?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], answer: 2, category: 'javascript', difficulty: 'medium' },
  { text: 'Какая функция парсит строку в целое число?', options: ['Integer.parse()', 'parseInt()', 'Number.parseInt()', 'Оба parseInt() и Number.parseInt()'], answer: 3, category: 'javascript', difficulty: 'medium' },
  { text: 'Что делает оператор spread (...)?', options: ['Умножает значения', 'Разворачивает итерируемый объект в отдельные элементы', 'Создаёт новую функцию', 'Определяет только rest-параметры'], answer: 1, category: 'javascript', difficulty: 'medium' },
  { text: 'Какой метод создаёт новый массив, вызывая функцию для каждого элемента?', options: ['forEach()', 'filter()', 'map()', 'reduce()'], answer: 2, category: 'javascript', difficulty: 'medium' },
  { text: 'Что такое деструктуризация в JavaScript?', options: ['Удаление объекта из памяти', 'Извлечение значений из массивов/объектов в переменные', 'Разрушение прототипной цепочки', 'Удаление свойств объекта'], answer: 1, category: 'javascript', difficulty: 'medium' },
  { text: 'Какой метод массива возвращает первый элемент, удовлетворяющий условию?', options: ['filter()', 'find()', 'search()', 'locate()'], answer: 1, category: 'javascript', difficulty: 'medium' },
  { text: 'Что возвращает метод Object.keys()?', options: ['Массив значений объекта', 'Массив ключей объекта', 'Количество ключей', 'Объект-итератор'], answer: 1, category: 'javascript', difficulty: 'medium' },
  { text: 'Чем отличается let от var?', options: ['Ничем не отличается', 'let имеет блочную область видимости, var — функциональную', 'var имеет блочную область видимости', 'let нельзя переприсваивать'], answer: 1, category: 'javascript', difficulty: 'medium' },
  { text: 'Какой метод преобразует объект в JSON-строку?', options: ['JSON.parse()', 'JSON.stringify()', 'JSON.toString()', 'JSON.convert()'], answer: 1, category: 'javascript', difficulty: 'medium' },
  { text: 'Что такое template literal в JavaScript?', options: ['Шаблон HTML', 'Строка в обратных кавычках с интерполяцией ${...}', 'Статический шаблон функции', 'Литерал объекта'], answer: 1, category: 'javascript', difficulty: 'medium' },

  // JavaScript HARD (10)
  { text: 'Что такое замыкание (closure) в JavaScript?', options: ['Способ закрыть браузер', 'Функция, имеющая доступ к переменным внешней области видимости', 'Метод завершения цикла', 'Тип обработки ошибок'], answer: 1, category: 'javascript', difficulty: 'hard' },
  { text: 'За что отвечает event loop?', options: ['За CSS-анимации', 'За управление асинхронными callback-функциями', 'За парсинг HTML', 'За сборку мусора'], answer: 1, category: 'javascript', difficulty: 'hard' },
  { text: 'Что делает Promise.all()?', options: ['Выполняет промисы последовательно', 'Разрешается когда все промисы выполнены, отклоняется если хоть один отклонён', 'Возвращает первый разрешённый промис', 'Ловит все отклонённые промисы'], answer: 1, category: 'javascript', difficulty: 'hard' },
  { text: 'Что такое прототипное наследование?', options: ['Наследование через CSS-классы', 'Объекты наследуют свойства и методы от прототипа', 'Копирование объектов в памяти', 'Создание классов через new'], answer: 1, category: 'javascript', difficulty: 'hard' },
  { text: 'Какой результат: console.log(0.1 + 0.2 === 0.3)?', options: ['true', 'false', 'undefined', 'TypeError'], answer: 1, category: 'javascript', difficulty: 'hard' },
  { text: 'Чем отличается Map от обычного объекта?', options: ['Ничем', 'Map может иметь ключи любого типа и сохраняет порядок вставки', 'Map быстрее', 'Map можно только читать'], answer: 1, category: 'javascript', difficulty: 'hard' },
  { text: 'Что выведет: typeof NaN?', options: ['"NaN"', '"undefined"', '"number"', '"object"'], answer: 2, category: 'javascript', difficulty: 'hard' },
  { text: 'Что делает async/await?', options: ['Создаёт новый поток', 'Синтаксический сахар для работы с Promise', 'Останавливает выполнение всего приложения', 'Делает функцию синхронной'], answer: 1, category: 'javascript', difficulty: 'hard' },
  { text: 'Что такое WeakMap и чем отличается от Map?', options: ['WeakMap быстрее', 'Ключи WeakMap — только объекты, и они не препятствуют сборке мусора', 'WeakMap хранит только примитивы', 'Отличий нет'], answer: 1, category: 'javascript', difficulty: 'hard' },
  { text: 'В каком порядке выполнятся: console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3));', options: ['1, 2, 3', '1, 3, 2', '3, 1, 2', '1, 2, 3 одновременно'], answer: 1, category: 'javascript', difficulty: 'hard' },

  // =====================================================================
  // React — 30 questions (10 easy, 10 medium, 10 hard)
  // =====================================================================

  // React EASY (10)
  { text: 'Какой хук управляет состоянием в функциональных компонентах React?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], answer: 1, category: 'react', difficulty: 'easy' },
  { text: 'Что такое JSX?', options: ['Библиотека JavaScript', 'Синтаксическое расширение JavaScript', 'CSS-фреймворк', 'Инструмент тестирования'], answer: 1, category: 'react', difficulty: 'easy' },
  { text: 'Какой хук используется для побочных эффектов в React?', options: ['useState', 'useEffect', 'useMemo', 'useCallback'], answer: 1, category: 'react', difficulty: 'easy' },
  { text: 'Как передать данные от родительского к дочернему компоненту?', options: ['Через State', 'Через Props', 'Через Context', 'Через Refs'], answer: 1, category: 'react', difficulty: 'easy' },
  { text: 'Как создать React-компонент в функциональном стиле?', options: ['class App extends React.Component', 'function App() { return <div/> }', 'React.create(App)', 'new Component(App)'], answer: 1, category: 'react', difficulty: 'easy' },
  { text: 'Что возвращает функциональный React-компонент?', options: ['Объект состояния', 'JSX (React-элементы)', 'HTML-строку', 'DOM-узел'], answer: 1, category: 'react', difficulty: 'easy' },
  { text: 'Какой метод рендерит React-приложение в DOM?', options: ['React.render()', 'ReactDOM.createRoot().render()', 'document.render()', 'App.mount()'], answer: 1, category: 'react', difficulty: 'easy' },
  { text: 'Как обработать клик на кнопке в React?', options: ['onclick="handler()"', 'onClick={handler}', 'on-click={handler}', 'click={handler}'], answer: 1, category: 'react', difficulty: 'easy' },
  { text: 'Для чего используется фрагмент (<> </>)?', options: ['Для стилизации', 'Для группировки элементов без добавления лишнего DOM-узла', 'Для создания ссылок', 'Для условного рендеринга'], answer: 1, category: 'react', difficulty: 'easy' },
  { text: 'Какой хук даёт доступ к DOM-элементу в React?', options: ['useState', 'useEffect', 'useRef', 'useContext'], answer: 2, category: 'react', difficulty: 'easy' },

  // React MEDIUM (10)
  { text: 'Что такое виртуальный DOM?', options: ['Настоящий DOM браузера', 'Легковесная копия реального DOM', 'CSS-движок рендеринга', 'База данных компонентов'], answer: 1, category: 'react', difficulty: 'medium' },
  { text: 'Что делает useCallback?', options: ['Немедленно вызывает функцию', 'Мемоизирует callback-функцию', 'Создаёт новый callback', 'Обрабатывает ошибки в callback'], answer: 1, category: 'react', difficulty: 'medium' },
  { text: 'Для чего используется React.memo()?', options: ['Для создания заметок в приложении', 'Для предотвращения лишних перерисовок', 'Для хранения данных в памяти', 'Для создания мемоизированных селекторов'], answer: 1, category: 'react', difficulty: 'medium' },
  { text: 'Зачем нужен атрибут key при рендеринге списков?', options: ['Для стилизации элементов', 'Для уникальной идентификации элементов при reconciliation', 'Для сортировки списка', 'Для привязки событий'], answer: 1, category: 'react', difficulty: 'medium' },
  { text: 'Что делает хук useMemo?', options: ['Создаёт мемо-компонент', 'Мемоизирует результат вычисления', 'Запоминает предыдущее состояние', 'Кэширует API-запросы'], answer: 1, category: 'react', difficulty: 'medium' },
  { text: 'Что такое useContext?', options: ['Хук для работы с cookie', 'Хук для доступа к значению контекста без prop drilling', 'Хук для навигации', 'Хук для работы с формами'], answer: 1, category: 'react', difficulty: 'medium' },
  { text: 'Что такое условный рендеринг в React?', options: ['Рендеринг с задержкой', 'Отображение компонентов в зависимости от условия', 'Рендеринг по расписанию', 'Рендеринг только на сервере'], answer: 1, category: 'react', difficulty: 'medium' },
  { text: 'Чем контролируемый компонент отличается от неконтролируемого?', options: ['Ничем', 'Контролируемый — значение управляется через state/props', 'Неконтролируемый быстрее', 'Контролируемый не использует state'], answer: 1, category: 'react', difficulty: 'medium' },
  { text: 'Когда вызывается useEffect с пустым массивом зависимостей []?', options: ['При каждом рендере', 'Только при монтировании компонента', 'Только при размонтировании', 'Никогда'], answer: 1, category: 'react', difficulty: 'medium' },
  { text: 'Что такое prop drilling?', options: ['Техника оптимизации', 'Передача props через много уровней вложенности', 'Инструмент для тестирования', 'Метод валидации props'], answer: 1, category: 'react', difficulty: 'medium' },

  // React HARD (10)
  { text: 'Как правильно обновить состояние на основе предыдущего?', options: ['setState(newValue)', 'setState(prev => newValue)', 'setState(prev => ({ ...prev, key: value }))', 'Оба B и C в зависимости от случая'], answer: 3, category: 'react', difficulty: 'hard' },
  { text: 'Что такое React Portal?', options: ['Механизм маршрутизации', 'Способ рендерить дочерние элементы в другое место DOM', 'Инструмент управления состоянием', 'Инструмент отладки'], answer: 1, category: 'react', difficulty: 'hard' },
  { text: 'Когда запускается cleanup-функция useEffect?', options: ['Только при монтировании', 'Перед каждым повторным вызовом эффекта и при размонтировании', 'Только при размонтировании', 'После каждого рендера'], answer: 1, category: 'react', difficulty: 'hard' },
  { text: 'Что такое Error Boundary в React?', options: ['try/catch для промисов', 'Компонент, перехватывающий ошибки рендеринга дочерних компонентов', 'Middleware для обработки ошибок', 'Утилита для логирования'], answer: 1, category: 'react', difficulty: 'hard' },
  { text: 'Что делает React.lazy()?', options: ['Делает компонент ленивым (не реактивным)', 'Загружает компонент асинхронно (code splitting)', 'Задерживает рендеринг', 'Кэширует компонент'], answer: 1, category: 'react', difficulty: 'hard' },
  { text: 'Что такое Suspense в React?', options: ['Механизм паузы анимации', 'Компонент для отображения fallback во время загрузки', 'Хук для задержки состояния', 'Метод обработки ошибок'], answer: 1, category: 'react', difficulty: 'hard' },
  { text: 'Что такое reconciliation в React?', options: ['Процесс сборки мусора', 'Алгоритм сравнения виртуального DOM с реальным для минимальных обновлений', 'Синхронизация state между компонентами', 'Процесс компиляции JSX'], answer: 1, category: 'react', difficulty: 'hard' },
  { text: 'Как создать custom hook в React?', options: ['Наследовать от React.Hook', 'Создать функцию, начинающуюся с use, использующую другие хуки', 'Использовать React.createHook()', 'Обернуть компонент в HOC'], answer: 1, category: 'react', difficulty: 'hard' },
  { text: 'Зачем нужен useReducer вместо useState?', options: ['useReducer быстрее', 'Для сложной логики состояния с множеством связанных значений', 'useReducer проще в использовании', 'useState устарел'], answer: 1, category: 'react', difficulty: 'hard' },
  { text: 'Что такое StrictMode в React?', options: ['Режим блокировки ошибок', 'Обёртка для выявления потенциальных проблем при разработке', 'Режим продакшн-сборки', 'Ограничение доступа к state'], answer: 1, category: 'react', difficulty: 'hard' },

  // =====================================================================
  // Node.js — 30 questions (10 easy, 10 medium, 10 hard)
  // =====================================================================

  // Node.js EASY (10)
  { text: 'Какой метод запускает HTTP-сервер в Node.js?', options: ['server.start()', 'server.listen()', 'server.run()', 'server.open()'], answer: 1, category: 'nodejs', difficulty: 'easy' },
  { text: 'Что такое npm?', options: ['Node Package Manager', 'New Programming Method', 'Node Process Manager', 'Network Protocol Module'], answer: 0, category: 'nodejs', difficulty: 'easy' },
  { text: 'Какой модуль используется для работы с файловой системой в Node.js?', options: ['http', 'fs', 'path', 'os'], answer: 1, category: 'nodejs', difficulty: 'easy' },
  { text: 'Что такое Express.js?', options: ['База данных', 'Веб-фреймворк для Node.js', 'Библиотека тестирования', 'CSS-препроцессор'], answer: 1, category: 'nodejs', difficulty: 'easy' },
  { text: 'На каком языке написаны программы для Node.js?', options: ['Python', 'Java', 'JavaScript', 'C++'], answer: 2, category: 'nodejs', difficulty: 'easy' },
  { text: 'Какой файл содержит метаданные и зависимости Node.js-проекта?', options: ['index.js', 'package.json', 'node_modules', '.env'], answer: 1, category: 'nodejs', difficulty: 'easy' },
  { text: 'Какая команда устанавливает пакет через npm?', options: ['npm get', 'npm install', 'npm download', 'npm add'], answer: 1, category: 'nodejs', difficulty: 'easy' },
  { text: 'Где хранятся установленные npm-пакеты?', options: ['В папке src', 'В папке node_modules', 'В папке packages', 'В папке lib'], answer: 1, category: 'nodejs', difficulty: 'easy' },
  { text: 'Какой объект используется для доступа к аргументам командной строки?', options: ['process.args', 'process.argv', 'process.cli', 'process.params'], answer: 1, category: 'nodejs', difficulty: 'easy' },
  { text: 'Что делает команда node app.js?', options: ['Компилирует app.js', 'Запускает файл app.js в среде Node.js', 'Устанавливает app.js', 'Тестирует app.js'], answer: 1, category: 'nodejs', difficulty: 'easy' },

  // Node.js MEDIUM (10)
  { text: 'Что делает middleware в Express?', options: ['Управляет подключениями к БД', 'Функции, выполняющиеся в цикле запрос-ответ', 'Компилирует TypeScript', 'Обрабатывает CSS'], answer: 1, category: 'nodejs', difficulty: 'medium' },
  { text: 'Для чего нужен файл package.json?', options: ['Для хранения переменных окружения', 'Для описания метаданных проекта и зависимостей', 'Для настройки базы данных', 'Для определения маршрутов'], answer: 1, category: 'nodejs', difficulty: 'medium' },
  { text: 'Что содержит process.env?', options: ['Информацию о CPU', 'Переменные окружения', 'ID процесса', 'Использование памяти'], answer: 1, category: 'nodejs', difficulty: 'medium' },
  { text: 'Какой модуль Node.js позволяет создать REST API?', options: ['http или express', 'fs', 'crypto', 'stream'], answer: 0, category: 'nodejs', difficulty: 'medium' },
  { text: 'Какой метод Express отправляет JSON-ответ клиенту?', options: ['res.write()', 'res.json()', 'res.send()', 'Оба res.json() и res.send()'], answer: 3, category: 'nodejs', difficulty: 'medium' },
  { text: 'Что делает модуль path в Node.js?', options: ['Управляет маршрутами Express', 'Предоставляет утилиты для работы с путями файлов', 'Создаёт HTTP-запросы', 'Управляет базой данных'], answer: 1, category: 'nodejs', difficulty: 'medium' },
  { text: 'Что такое callback hell?', options: ['Ошибка в коде', 'Глубокая вложенность callback-функций, усложняющая чтение кода', 'Функция обратного вызова', 'Проблема с памятью'], answer: 1, category: 'nodejs', difficulty: 'medium' },
  { text: 'Какой HTTP-метод используется для обновления ресурса?', options: ['GET', 'POST', 'PUT', 'DELETE'], answer: 2, category: 'nodejs', difficulty: 'medium' },
  { text: 'Что делает app.use() в Express?', options: ['Использует шаблон', 'Подключает middleware ко всем или определённым маршрутам', 'Создаёт новый маршрут', 'Запускает сервер'], answer: 1, category: 'nodejs', difficulty: 'medium' },
  { text: 'Для чего нужен файл .env?', options: ['Для хранения стилей', 'Для хранения переменных окружения (пароли, ключи API)', 'Для настройки ESLint', 'Для описания маршрутов'], answer: 1, category: 'nodejs', difficulty: 'medium' },

  // Node.js HARD (10)
  { text: 'Для чего нужен модуль cluster?', options: ['Для управления базами данных', 'Для создания дочерних процессов, разделяющих порт сервера', 'Для сжатия файлов', 'Для управления CSS-бандлами'], answer: 1, category: 'nodejs', difficulty: 'hard' },
  { text: 'Чем отличается require() от import?', options: ['Ничем не отличается', 'require — синхронный CommonJS, import — асинхронный ESM', 'import устарел', 'require работает только в браузере'], answer: 1, category: 'nodejs', difficulty: 'hard' },
  { text: 'Что такое event loop в Node.js?', options: ['Цикл обработки событий DOM', 'Механизм обработки асинхронных операций в однопоточной среде', 'Цикл рендеринга UI', 'Механизм обработки ошибок'], answer: 1, category: 'nodejs', difficulty: 'hard' },
  { text: 'Что такое streams (потоки) в Node.js?', options: ['CSS-анимации', 'Объекты для чтения/записи данных порциями, не загружая всё в память', 'Потоки выполнения (threads)', 'HTTP-заголовки'], answer: 1, category: 'nodejs', difficulty: 'hard' },
  { text: 'Какие типы streams существуют в Node.js?', options: ['Input и Output', 'Readable, Writable, Duplex, Transform', 'Get и Set', 'Sync и Async'], answer: 1, category: 'nodejs', difficulty: 'hard' },
  { text: 'Что такое Buffer в Node.js?', options: ['Кэш браузера', 'Область памяти для работы с бинарными данными', 'Буфер экрана', 'Очередь HTTP-запросов'], answer: 1, category: 'nodejs', difficulty: 'hard' },
  { text: 'Чем process.nextTick() отличается от setImmediate()?', options: ['Ничем', 'nextTick выполняется перед I/O callbacks, setImmediate — после', 'setImmediate быстрее', 'nextTick устарел'], answer: 1, category: 'nodejs', difficulty: 'hard' },
  { text: 'Что делает middleware express.json()?', options: ['Создаёт JSON-файл', 'Парсит тело запроса из JSON в JavaScript-объект', 'Отправляет JSON-ответ', 'Валидирует JSON-схему'], answer: 1, category: 'nodejs', difficulty: 'hard' },
  { text: 'Что такое libuv в контексте Node.js?', options: ['Библиотека UI', 'Кроссплатформенная библиотека для асинхронного I/O', 'Компилятор JavaScript', 'Менеджер пакетов'], answer: 1, category: 'nodejs', difficulty: 'hard' },
  { text: 'Как обработать необработанные rejected Promise в Node.js глобально?', options: ['try/catch', 'process.on("unhandledRejection", handler)', 'Promise.catch()', 'window.onerror'], answer: 1, category: 'nodejs', difficulty: 'hard' },

  // =====================================================================
  // Databases — 30 questions (10 easy, 10 medium, 10 hard)
  // =====================================================================

  // Databases EASY (10)
  { text: 'Что означает аббревиатура SQL?', options: ['Structured Query Language', 'Simple Question Language', 'Sequential Query Logic', 'Standard Query Language'], answer: 0, category: 'databases', difficulty: 'easy' },
  { text: 'Какая SQL-команда извлекает данные из таблицы?', options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'], answer: 2, category: 'databases', difficulty: 'easy' },
  { text: 'Что такое первичный ключ (primary key)?', options: ['Первая колонка таблицы', 'Уникальный идентификатор каждой записи', 'Ссылка на внешний ключ', 'Индекс колонки'], answer: 1, category: 'databases', difficulty: 'easy' },
  { text: 'Какой SQL-оператор фильтрует результаты?', options: ['FILTER', 'WHERE', 'HAVING', 'WHEN'], answer: 1, category: 'databases', difficulty: 'easy' },
  { text: 'Какая SQL-команда добавляет новую запись в таблицу?', options: ['ADD', 'INSERT INTO', 'CREATE', 'APPEND'], answer: 1, category: 'databases', difficulty: 'easy' },
  { text: 'Какая SQL-команда удаляет записи из таблицы?', options: ['REMOVE', 'DROP', 'DELETE', 'ERASE'], answer: 2, category: 'databases', difficulty: 'easy' },
  { text: 'Какая SQL-команда обновляет существующие записи?', options: ['MODIFY', 'CHANGE', 'ALTER', 'UPDATE'], answer: 3, category: 'databases', difficulty: 'easy' },
  { text: 'Какой оператор сортирует результаты в SQL?', options: ['SORT BY', 'ORDER BY', 'GROUP BY', 'ARRANGE BY'], answer: 1, category: 'databases', difficulty: 'easy' },
  { text: 'Что делает оператор DISTINCT в SQL?', options: ['Удаляет таблицу', 'Возвращает только уникальные значения', 'Создаёт индекс', 'Объединяет таблицы'], answer: 1, category: 'databases', difficulty: 'easy' },
  { text: 'Какой оператор ограничивает количество возвращаемых строк?', options: ['TOP / LIMIT', 'MAX', 'COUNT', 'RANGE'], answer: 0, category: 'databases', difficulty: 'easy' },

  // Databases MEDIUM (10)
  { text: 'Что означает ORM?', options: ['Object Relational Mapping', 'Online Resource Manager', 'Ordered Record Model', 'Object Reference Method'], answer: 0, category: 'databases', difficulty: 'medium' },
  { text: 'Что такое JOIN в SQL?', options: ['Объединение двух баз данных', 'Объединение строк из двух и более таблиц', 'Создание новой таблицы', 'Удаление дубликатов'], answer: 1, category: 'databases', difficulty: 'medium' },
  { text: 'В чём разница между SQL и NoSQL базами данных?', options: ['SQL быстрее', 'SQL использует структурированные схемы, NoSQL — гибкие', 'NoSQL всегда лучше', 'Реальной разницы нет'], answer: 1, category: 'databases', difficulty: 'medium' },
  { text: 'Чем отличается INNER JOIN от LEFT JOIN?', options: ['Ничем', 'INNER возвращает только совпадения, LEFT — все строки левой таблицы', 'LEFT JOIN быстрее', 'INNER JOIN устарел'], answer: 1, category: 'databases', difficulty: 'medium' },
  { text: 'Что делает GROUP BY в SQL?', options: ['Сортирует результаты', 'Группирует строки с одинаковыми значениями для агрегатных функций', 'Фильтрует результаты', 'Объединяет таблицы'], answer: 1, category: 'databases', difficulty: 'medium' },
  { text: 'Какая агрегатная функция считает количество строк?', options: ['SUM()', 'AVG()', 'COUNT()', 'TOTAL()'], answer: 2, category: 'databases', difficulty: 'medium' },
  { text: 'Что такое внешний ключ (foreign key)?', options: ['Ключ шифрования', 'Столбец, ссылающийся на первичный ключ другой таблицы', 'Запасной первичный ключ', 'Индекс для поиска'], answer: 1, category: 'databases', difficulty: 'medium' },
  { text: 'Чем WHERE отличается от HAVING в SQL?', options: ['Ничем', 'WHERE фильтрует строки до группировки, HAVING — после', 'HAVING быстрее', 'WHERE работает только с числами'], answer: 1, category: 'databases', difficulty: 'medium' },
  { text: 'Что такое Prisma?', options: ['Браузер', 'ORM для Node.js/TypeScript', 'NoSQL база данных', 'CSS-фреймворк'], answer: 1, category: 'databases', difficulty: 'medium' },
  { text: 'Что делает оператор LIKE в SQL?', options: ['Сравнивает числа', 'Ищет строки по шаблону с подстановочными символами', 'Создаёт связи между таблицами', 'Копирует данные'], answer: 1, category: 'databases', difficulty: 'medium' },

  // Databases HARD (10)
  { text: 'Что такое нормализация базы данных?', options: ['Ускорение базы данных', 'Организация данных для уменьшения избыточности', 'Шифрование базы данных', 'Резервное копирование'], answer: 1, category: 'databases', difficulty: 'hard' },
  { text: 'Что такое индекс в базе данных?', options: ['Первая строка таблицы', 'Структура данных, ускоряющая выполнение запросов', 'Тип ограничения', 'Механизм резервного копирования'], answer: 1, category: 'databases', difficulty: 'hard' },
  { text: 'Что означает ACID в контексте транзакций?', options: ['Add, Create, Insert, Delete', 'Atomicity, Consistency, Isolation, Durability', 'Access, Control, Identity, Data', 'Async, Cache, Index, Deploy'], answer: 1, category: 'databases', difficulty: 'hard' },
  { text: 'Что такое подзапрос (subquery) в SQL?', options: ['Запрос к другой базе данных', 'SELECT-запрос внутри другого запроса', 'Запрос без WHERE', 'Запрос, возвращающий пустой результат'], answer: 1, category: 'databases', difficulty: 'hard' },
  { text: 'Что такое представление (VIEW) в SQL?', options: ['Интерфейс пользователя', 'Виртуальная таблица на основе результата SQL-запроса', 'Физическая копия таблицы', 'Тип индекса'], answer: 1, category: 'databases', difficulty: 'hard' },
  { text: 'Что такое транзакция в базе данных?', options: ['Перевод денег', 'Логическая единица работы: все операции выполняются или откатываются', 'Запрос на чтение', 'Создание резервной копии'], answer: 1, category: 'databases', difficulty: 'hard' },
  { text: 'Какая нормальная форма устраняет транзитивные зависимости?', options: ['Первая (1NF)', 'Вторая (2NF)', 'Третья (3NF)', 'BCNF'], answer: 2, category: 'databases', difficulty: 'hard' },
  { text: 'Что такое deadlock в базе данных?', options: ['Удаление данных', 'Взаимная блокировка: две транзакции ждут друг друга', 'Ошибка подключения', 'Переполнение индекса'], answer: 1, category: 'databases', difficulty: 'hard' },
  { text: 'Чем отличается кластерный индекс от некластерного?', options: ['Ничем', 'Кластерный определяет физический порядок данных, некластерный — нет', 'Некластерный быстрее', 'Кластерный используется только в NoSQL'], answer: 1, category: 'databases', difficulty: 'hard' },
  { text: 'Что такое SQL injection и как от него защититься?', options: ['Вставка данных в таблицу — защита не нужна', 'Внедрение вредоносного SQL — защита через параметризованные запросы', 'Ошибка синтаксиса SQL — защита через валидацию', 'Проблема производительности — защита через индексы'], answer: 1, category: 'databases', difficulty: 'hard' },
]

// =====================================================================
// CODE QUESTIONS — 60 new questions with codeSnippet (10 per category)
// =====================================================================
const codeQuestions = [
  // HTML CODE (4 medium + 6 hard)
  { text: 'Что отобразит этот HTML-код?', codeSnippet: '<ul>\n  <li>Один</li>\n  <li>Два\n    <ol>\n      <li>Два-А</li>\n    </ol>\n  </li>\n</ul>', codeLanguage: 'html', options: ['Маркированный список с вложенным нумерованным', 'Два отдельных списка', 'Ошибка рендеринга', 'Нумерованный список'], answer: 0, category: 'html', difficulty: 'medium' },
  { text: 'Какое значение отправится при submit?', codeSnippet: '<form>\n  <input type="hidden"\n    name="token"\n    value="abc123" />\n  <input type="text"\n    name="user"\n    value="" />\n  <button type="submit">\n    Send\n  </button>\n</form>', codeLanguage: 'html', options: ['Только user', 'Только token=abc123', 'token=abc123 и user=', 'Ничего не отправится'], answer: 2, category: 'html', difficulty: 'medium' },
  { text: 'Сколько ячеек будет в таблице?', codeSnippet: '<table>\n  <tr>\n    <td>1</td>\n    <td>2</td>\n  </tr>\n  <tr>\n    <td colspan="2">3</td>\n  </tr>\n</table>', codeLanguage: 'html', options: ['2 ячейки', '3 ячейки', '4 ячейки', '1 ячейка'], answer: 1, category: 'html', difficulty: 'medium' },
  { text: 'Что неправильно в этом коде?', codeSnippet: '<p>\n  Текст\n  <div>Блок</div>\n</p>', codeLanguage: 'html', options: ['Всё правильно', '<div> внутри <p> недопустим', 'Не хватает закрывающего тега', 'Нужен <br> перед <div>'], answer: 1, category: 'html', difficulty: 'medium' },
  { text: 'Какой элемент будет скрыт?', codeSnippet: '<div>\n  <p hidden>Секрет</p>\n  <p>Видимый</p>\n  <p style="display:none">\n    Тоже скрыт\n  </p>\n</div>', codeLanguage: 'html', options: ['Только первый <p>', 'Только третий <p>', 'Первый и третий <p>', 'Ни один'], answer: 2, category: 'html', difficulty: 'hard' },
  { text: 'Что произойдёт при клике на кнопку?', codeSnippet: '<form action="/send">\n  <button type="button">\n    Клик\n  </button>\n  <button type="submit">\n    Отправить\n  </button>\n</form>', codeLanguage: 'html', options: ['Обе кнопки отправят форму', 'Только submit отправит форму', 'Ни одна не отправит', 'Будет ошибка'], answer: 1, category: 'html', difficulty: 'hard' },
  { text: 'Какой результат рендеринга?', codeSnippet: '<details>\n  <summary>Подробнее</summary>\n  <p>Скрытый контент</p>\n</details>', codeLanguage: 'html', options: ['Текст "Подробнее" с раскрывающимся блоком', 'Весь текст виден сразу', 'Ошибка: тег не существует', 'Пустая страница'], answer: 0, category: 'html', difficulty: 'hard' },
  { text: 'Что вернёт input type="number" с этими атрибутами?', codeSnippet: '<input\n  type="number"\n  min="0"\n  max="10"\n  step="2"\n  value="3" />', codeLanguage: 'html', options: ['Поле с значением 3, шаг 2', 'Ошибка валидации: 3 не кратно 2', 'Поле автоматически станет 2', 'Поле со значением 0'], answer: 0, category: 'html', difficulty: 'hard' },
  { text: 'Какой из тегов НЕ является пустым (void)?', codeSnippet: '<br />\n<hr />\n<img src="a.png" />\n<link rel="stylesheet" />\n<div></div>', codeLanguage: 'html', options: ['<br>', '<img>', '<div>', '<link>'], answer: 2, category: 'html', difficulty: 'hard' },
  { text: 'Что отобразит этот код?', codeSnippet: '<select multiple>\n  <optgroup label="Фрукты">\n    <option>Яблоко</option>\n    <option selected>\n      Банан\n    </option>\n  </optgroup>\n</select>', codeLanguage: 'html', options: ['Выпадающий список с группой, Банан выбран', 'Обычный список без групп', 'Ошибка: multiple не работает с optgroup', 'Два отдельных списка'], answer: 0, category: 'html', difficulty: 'hard' },

  // CSS CODE (4 medium + 6 hard)
  { text: 'Какой цвет будет у текста?', codeSnippet: '.box { color: blue; }\n#main .box { color: red; }\n.box.active { color: green; }', codeLanguage: 'css', options: ['blue', 'red', 'green', 'Зависит от HTML'], answer: 3, category: 'css', difficulty: 'medium' },
  { text: 'Как расположатся элементы?', codeSnippet: '.container {\n  display: flex;\n  justify-content: space-between;\n}\n.item { width: 100px; }', codeLanguage: 'css', options: ['В строку с равными промежутками по краям', 'В столбец', 'Все по центру', 'С отступами вокруг'], answer: 0, category: 'css', difficulty: 'medium' },
  { text: 'Какая ширина будет у .box?', codeSnippet: '.box {\n  width: 200px;\n  padding: 20px;\n  border: 5px solid;\n  box-sizing: border-box;\n}', codeLanguage: 'css', options: ['200px общая', '250px общая', '200px только контент', '240px общая'], answer: 0, category: 'css', difficulty: 'medium' },
  { text: 'Где окажется элемент?', codeSnippet: '.parent {\n  position: relative;\n  height: 200px;\n}\n.child {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n}', codeLanguage: 'css', options: ['Внизу справа родителя', 'Внизу справа страницы', 'Вверху слева родителя', 'По центру'], answer: 0, category: 'css', difficulty: 'medium' },
  { text: 'Какой стиль победит?', codeSnippet: 'p { color: blue; }\n.text { color: green; }\n#intro { color: red; }\np.text { color: orange; }', codeLanguage: 'css', options: ['blue', 'green', 'red (id самый специфичный)', 'orange'], answer: 2, category: 'css', difficulty: 'hard' },
  { text: 'Что произойдёт с grid-элементами?', codeSnippet: '.grid {\n  display: grid;\n  grid-template-columns:\n    repeat(3, 1fr);\n  gap: 10px;\n}\n.wide {\n  grid-column: span 2;\n}', codeLanguage: 'css', options: ['3 колонки, .wide займёт 2 из 3', '2 колонки', '.wide будет на всю ширину', 'Ошибка: span не работает'], answer: 0, category: 'css', difficulty: 'hard' },
  { text: 'Какой будет результат анимации?', codeSnippet: '.box {\n  transition: all 0.3s;\n}\n.box:hover {\n  transform: scale(1.1)\n    rotate(5deg);\n  opacity: 0.8;\n}', codeLanguage: 'css', options: ['При наведении: увеличится, повернётся, станет прозрачнее', 'Только увеличится', 'Только повернётся', 'Мгновенное изменение без анимации'], answer: 0, category: 'css', difficulty: 'hard' },
  { text: 'Что будет с текстом при переполнении?', codeSnippet: '.text {\n  width: 200px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}', codeLanguage: 'css', options: ['Текст обрежется с многоточием ...', 'Текст перенесётся на новую строку', 'Появится горизонтальный скролл', 'Текст просто обрежется без ...'], answer: 0, category: 'css', difficulty: 'hard' },
  { text: 'Какой цвет у ссылки?', codeSnippet: 'a:link { color: blue; }\na:visited { color: purple; }\na:hover { color: red; }\na:active { color: green; }', codeLanguage: 'css', options: ['Синий (непосещённая), фиолетовый (посещённая), красный при наведении', 'Всегда зелёный', 'Всегда синий', 'Порядок псевдоклассов не важен'], answer: 0, category: 'css', difficulty: 'hard' },
  { text: 'Как будут расположены элементы?', codeSnippet: '.container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 100vh;\n  justify-content:\n    space-evenly;\n}', codeLanguage: 'css', options: ['Вертикально по центру с равными отступами', 'Горизонтально', 'Все прижаты к верху', 'Все прижаты к низу'], answer: 0, category: 'css', difficulty: 'hard' },

  // JAVASCRIPT CODE (4 medium + 6 hard)
  { text: 'Что выведет console.log?', codeSnippet: 'let a = [1, 2, 3];\nlet b = a;\nb.push(4);\nconsole.log(a.length);', codeLanguage: 'javascript', options: ['3', '4', 'undefined', 'Error'], answer: 1, category: 'javascript', difficulty: 'medium' },
  { text: 'Что будет в результате?', codeSnippet: 'const x = "5";\nconst y = 2;\nconsole.log(x + y);\nconsole.log(x - y);', codeLanguage: 'javascript', options: ['"52" и 3', '7 и 3', '"52" и "52"', '7 и NaN'], answer: 0, category: 'javascript', difficulty: 'medium' },
  { text: 'Что выведет этот код?', codeSnippet: 'const obj = { a: 1, b: 2 };\nconst { a, ...rest } = obj;\nconsole.log(rest);', codeLanguage: 'javascript', options: ['{ b: 2 }', '{ a: 1, b: 2 }', '{ a: 1 }', 'undefined'], answer: 0, category: 'javascript', difficulty: 'medium' },
  { text: 'Какой результат?', codeSnippet: 'const arr = [1, 2, 3, 4, 5];\nconst result = arr\n  .filter(n => n > 2)\n  .map(n => n * 2);\nconsole.log(result);', codeLanguage: 'javascript', options: ['[6, 8, 10]', '[2, 4, 6, 8, 10]', '[3, 4, 5]', '[1, 2, 3, 4, 5]'], answer: 0, category: 'javascript', difficulty: 'medium' },
  { text: 'Что выведет console.log?', codeSnippet: 'function make() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\nconst fn = make();\nconsole.log(fn(), fn());', codeLanguage: 'javascript', options: ['1 2', '1 1', '0 1', 'undefined undefined'], answer: 0, category: 'javascript', difficulty: 'hard' },
  { text: 'Каков порядок вывода?', codeSnippet: 'console.log("1");\nsetTimeout(() =>\n  console.log("2"), 0);\nPromise.resolve()\n  .then(() =>\n    console.log("3"));\nconsole.log("4");', codeLanguage: 'javascript', options: ['1, 4, 3, 2', '1, 2, 3, 4', '1, 4, 2, 3', '1, 3, 4, 2'], answer: 0, category: 'javascript', difficulty: 'hard' },
  { text: 'Что выведет код?', codeSnippet: 'const obj = {\n  name: "Alice",\n  greet: function() {\n    return () => this.name;\n  }\n};\nconst fn = obj.greet();\nconsole.log(fn());', codeLanguage: 'javascript', options: ['"Alice"', 'undefined', 'TypeError', '"greet"'], answer: 0, category: 'javascript', difficulty: 'hard' },
  { text: 'Что будет результатом?', codeSnippet: 'async function foo() {\n  return 1;\n}\nasync function bar() {\n  const x = await foo();\n  return x + 1;\n}\nbar().then(console.log);', codeLanguage: 'javascript', options: ['2', '1', 'Promise', 'undefined'], answer: 0, category: 'javascript', difficulty: 'hard' },
  { text: 'Что выведется?', codeSnippet: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() =>\n    console.log(i), 0);\n}', codeLanguage: 'javascript', options: ['3, 3, 3', '0, 1, 2', '0, 0, 0', 'undefined x3'], answer: 0, category: 'javascript', difficulty: 'hard' },
  { text: 'Какой результат?', codeSnippet: 'const a = [1, 2];\nconst b = [1, 2];\nconsole.log(a === b);\nconsole.log(\n  JSON.stringify(a) ===\n  JSON.stringify(b)\n);', codeLanguage: 'javascript', options: ['false, true', 'true, true', 'false, false', 'true, false'], answer: 0, category: 'javascript', difficulty: 'hard' },

  // REACT CODE (4 medium + 6 hard)
  { text: 'Что покажет компонент?', codeSnippet: 'function App() {\n  const [n, setN] = useState(0);\n  return (\n    <button\n      onClick={() => setN(n+1)}>\n      {n}\n    </button>\n  );\n}', codeLanguage: 'javascript', options: ['Кнопку с 0, при клике увеличивается', 'Ошибку: useState не определён', 'Статический текст 0', 'Бесконечный рендеринг'], answer: 0, category: 'react', difficulty: 'medium' },
  { text: 'Когда выполнится эффект?', codeSnippet: 'useEffect(() => {\n  console.log("effect");\n  return () =>\n    console.log("cleanup");\n}, [count]);', codeLanguage: 'javascript', options: ['При изменении count и при размонтировании', 'Только при монтировании', 'Каждый рендер', 'Никогда'], answer: 0, category: 'react', difficulty: 'medium' },
  { text: 'Что отрендерится?', codeSnippet: 'function List({ items }) {\n  return (\n    <ul>\n      {items.map(item =>\n        <li key={item.id}>\n          {item.name}\n        </li>\n      )}\n    </ul>\n  );\n}', codeLanguage: 'javascript', options: ['Список элементов с уникальными ключами', 'Ошибка: map не функция', 'Пустой список', 'Один элемент'], answer: 0, category: 'react', difficulty: 'medium' },
  { text: 'Что вернёт хук?', codeSnippet: 'function useToggle(init) {\n  const [val, setVal] =\n    useState(init);\n  const toggle = () =>\n    setVal(v => !v);\n  return [val, toggle];\n}', codeLanguage: 'javascript', options: ['[boolean, функция переключения]', 'Объект с value и toggle', 'Только boolean', 'Ошибку'], answer: 0, category: 'react', difficulty: 'medium' },
  { text: 'Сколько раз перерендерится компонент?', codeSnippet: 'function App() {\n  const [a, setA] = useState(0);\n  const [b, setB] = useState(0);\n  const handleClick = () => {\n    setA(1);\n    setB(1);\n  };\n  console.log("render");\n  return (\n    <button onClick=\n      {handleClick}>Go</button>\n  );\n}', codeLanguage: 'javascript', options: ['1 раз (батчинг)', '2 раза', '3 раза', '0 раз'], answer: 0, category: 'react', difficulty: 'hard' },
  { text: 'Что будет при клике?', codeSnippet: 'function Counter() {\n  const [n, setN] = useState(0);\n  const handleClick = () => {\n    setN(n + 1);\n    setN(n + 1);\n    setN(n + 1);\n  };\n  return <p>{n}</p>;\n}', codeLanguage: 'javascript', options: ['n станет 1 (stale state)', 'n станет 3', 'n станет 2', 'Ошибка'], answer: 0, category: 'react', difficulty: 'hard' },
  { text: 'Что будет если убрать key?', codeSnippet: 'items.map((item, i) =>\n  <input\n    defaultValue=\n      {item.name}\n  />\n)', codeLanguage: 'javascript', options: ['Значения инпутов могут перемешаться при изменении списка', 'Ничего не изменится', 'Ошибка компиляции', 'Инпуты будут пустые'], answer: 0, category: 'react', difficulty: 'hard' },
  { text: 'Что произойдёт?', codeSnippet: 'useEffect(() => {\n  setInterval(() => {\n    setCount(c => c + 1);\n  }, 1000);\n}, []);', codeLanguage: 'javascript', options: ['Счётчик растёт, но интервал не очищается (утечка памяти)', 'Счётчик увеличивается на 1 каждую секунду корректно', 'Ошибка: setCount не определён', 'Бесконечный цикл'], answer: 0, category: 'react', difficulty: 'hard' },
  { text: 'Как правильно обновить state?', codeSnippet: 'const [items, setItems] =\n  useState([1, 2, 3]);\n\n// Вариант A:\nsetItems(\n  [...items, 4]\n);\n// Вариант B:\nitems.push(4);\nsetItems(items);', codeLanguage: 'javascript', options: ['Только вариант A правильный', 'Только вариант B правильный', 'Оба правильные', 'Оба неправильные'], answer: 0, category: 'react', difficulty: 'hard' },
  { text: 'Что выведет console.log?', codeSnippet: 'function App() {\n  const ref = useRef(0);\n  const [, forceRender] =\n    useState(0);\n  ref.current++;\n  console.log(ref.current);\n  return (\n    <button onClick=\n      {() => forceRender(n=>n+1)}>\n      Re-render\n    </button>\n  );\n}', codeLanguage: 'javascript', options: ['Число увеличивается при каждом клике (ref сохраняется между рендерами)', 'Всегда 1', 'Всегда 0', 'Ошибка: ref не работает с числами'], answer: 0, category: 'react', difficulty: 'hard' },

  // NODE.JS CODE (4 medium + 6 hard)
  { text: 'Что вернёт path.join?', codeSnippet: 'const path = require("path");\nconst result = path.join(\n  "/home",\n  "user",\n  "..",\n  "docs",\n  "file.txt"\n);\nconsole.log(result);', codeLanguage: 'javascript', options: ['"/home/docs/file.txt"', '"/home/user/../docs/file.txt"', '"/home/user/docs/file.txt"', 'Ошибка'], answer: 0, category: 'nodejs', difficulty: 'medium' },
  { text: 'Что выведет код?', codeSnippet: 'const fs = require("fs");\ntry {\n  const data =\n    fs.readFileSync(\n      "missing.txt",\n      "utf8"\n    );\n  console.log(data);\n} catch (e) {\n  console.log("NOT FOUND");\n}', codeLanguage: 'javascript', options: ['"NOT FOUND"', 'undefined', 'Процесс упадёт', 'Пустую строку'], answer: 0, category: 'nodejs', difficulty: 'medium' },
  { text: 'Какой middleware сработает?', codeSnippet: 'app.use((req, res, next) => {\n  console.log("A");\n  next();\n});\napp.get("/", (req, res) => {\n  console.log("B");\n  res.send("OK");\n});', codeLanguage: 'javascript', options: ['Сначала A, потом B', 'Только B', 'Только A', 'Ошибка: next не определён'], answer: 0, category: 'nodejs', difficulty: 'medium' },
  { text: 'Что вернёт этот код?', codeSnippet: 'const url = new URL(\n  "https://example.com"\n    + "/path?key=value"\n);\nconsole.log(\n  url.searchParams\n    .get("key")\n);', codeLanguage: 'javascript', options: ['"value"', '"key=value"', 'null', 'undefined'], answer: 0, category: 'nodejs', difficulty: 'medium' },
  { text: 'Каков порядок вывода?', codeSnippet: 'console.log("1");\nprocess.nextTick(() =>\n  console.log("2")\n);\nsetImmediate(() =>\n  console.log("3")\n);\nconsole.log("4");', codeLanguage: 'javascript', options: ['1, 4, 2, 3', '1, 2, 3, 4', '1, 4, 3, 2', '1, 2, 4, 3'], answer: 0, category: 'nodejs', difficulty: 'hard' },
  { text: 'Что произойдёт?', codeSnippet: 'const http = require("http");\nconst server =\n  http.createServer(\n    (req, res) => {\n      res.writeHead(200);\n      res.end("Hello");\n    }\n  );\nserver.listen(3000);', codeLanguage: 'javascript', options: ['Сервер на порту 3000, отвечает "Hello"', 'Ошибка: метод end не существует', 'Сервер запустится но не ответит', 'Бесконечный цикл'], answer: 0, category: 'nodejs', difficulty: 'hard' },
  { text: 'Что выведет этот код?', codeSnippet: 'const EventEmitter =\n  require("events");\nconst emitter =\n  new EventEmitter();\nemitter.on("data", (msg) =>\n  console.log(msg)\n);\nemitter.emit("data", "hi");\nemitter.emit("data", "bye");', codeLanguage: 'javascript', options: ['"hi" потом "bye"', 'Только "hi"', 'Только "bye"', 'Ничего'], answer: 0, category: 'nodejs', difficulty: 'hard' },
  { text: 'Что произойдёт при запросе /api?', codeSnippet: 'app.get("/api",\n  (req, res, next) => {\n    res.locals.user = "Admin";\n    next();\n  },\n  (req, res) => {\n    res.json({\n      user: res.locals.user\n    });\n  }\n);', codeLanguage: 'javascript', options: ['Ответ: {"user":"Admin"}', 'Ошибка: locals не существует', 'Пустой ответ', 'Ответ: {"user":null}'], answer: 0, category: 'nodejs', difficulty: 'hard' },
  { text: 'Что вернёт Buffer?', codeSnippet: 'const buf = Buffer.from(\n  "Hello"\n);\nconsole.log(\n  buf.toString("base64")\n);', codeLanguage: 'javascript', options: ['"SGVsbG8="', '"Hello"', '"48656c6c6f"', 'Ошибка'], answer: 0, category: 'nodejs', difficulty: 'hard' },
  { text: 'Что произойдёт?', codeSnippet: 'const { promisify } =\n  require("util");\nconst fs = require("fs");\nconst readFile =\n  promisify(fs.readFile);\n\nreadFile("test.txt", "utf8")\n  .then(d => console.log(d))\n  .catch(() =>\n    console.log("err"));', codeLanguage: 'javascript', options: ['Прочитает файл или выведет "err"', 'Всегда выведет "err"', 'Синхронно прочитает файл', 'TypeError: promisify не функция'], answer: 0, category: 'nodejs', difficulty: 'hard' },

  // DATABASES CODE (4 medium + 6 hard)
  { text: 'Что вернёт этот запрос?', codeSnippet: 'SELECT name, age\nFROM users\nWHERE age > 18\nORDER BY age DESC\nLIMIT 5;', codeLanguage: 'sql', options: ['5 самых старших пользователей старше 18', 'Всех пользователей старше 18', 'Первых 5 пользователей', '5 самых молодых'], answer: 0, category: 'databases', difficulty: 'medium' },
  { text: 'Что сделает этот запрос?', codeSnippet: 'UPDATE products\nSET price = price * 0.9\nWHERE category =\n  \'electronics\';', codeLanguage: 'sql', options: ['Снизит цену на 10% для электроники', 'Установит цену 0.9 для всех', 'Удалит товары с ценой 0.9', 'Ошибка синтаксиса'], answer: 0, category: 'databases', difficulty: 'medium' },
  { text: 'Какой результат запроса?', codeSnippet: 'SELECT COUNT(*) as total,\n  AVG(score) as avg_score\nFROM game_sessions\nWHERE user_id = 1;', codeLanguage: 'sql', options: ['Количество и средний балл игр пользователя 1', 'Все игровые сессии', 'Ошибка: нельзя использовать два агрегата', 'Только количество'], answer: 0, category: 'databases', difficulty: 'medium' },
  { text: 'Что вернёт JOIN?', codeSnippet: 'SELECT u.name, o.total\nFROM users u\nLEFT JOIN orders o\n  ON u.id = o.user_id;', codeLanguage: 'sql', options: ['Всех пользователей, даже без заказов (total=NULL)', 'Только пользователей с заказами', 'Только заказы без пользователей', 'Ошибка: алиасы не работают'], answer: 0, category: 'databases', difficulty: 'medium' },
  { text: 'Что покажет запрос?', codeSnippet: 'SELECT category,\n  COUNT(*) as cnt\nFROM products\nGROUP BY category\nHAVING COUNT(*) > 5\nORDER BY cnt DESC;', codeLanguage: 'sql', options: ['Категории с более чем 5 товарами, по убыванию', 'Все категории', 'Первые 5 категорий', 'Ошибка: нельзя использовать алиас в HAVING'], answer: 0, category: 'databases', difficulty: 'hard' },
  { text: 'Что вернёт подзапрос?', codeSnippet: 'SELECT name FROM users\nWHERE id IN (\n  SELECT user_id\n  FROM orders\n  WHERE total > 1000\n);', codeLanguage: 'sql', options: ['Имена пользователей с заказами > 1000', 'Все имена пользователей', 'Ошибка: подзапрос не допустим в IN', 'Пустой результат'], answer: 0, category: 'databases', difficulty: 'hard' },
  { text: 'Что произойдёт?', codeSnippet: 'INSERT INTO users\n  (name, email)\nVALUES\n  (\'Alice\',\n   \'alice@test.com\'),\n  (\'Bob\',\n   \'bob@test.com\');', codeLanguage: 'sql', options: ['Вставит 2 строки за один запрос', 'Вставит только Alice', 'Ошибка: нельзя вставить несколько строк', 'Вставит только Bob'], answer: 0, category: 'databases', difficulty: 'hard' },
  { text: 'Какой индекс поможет этому запросу?', codeSnippet: 'SELECT * FROM orders\nWHERE user_id = 5\n  AND status = \'active\'\nORDER BY created_at DESC;', codeLanguage: 'sql', options: ['Составной индекс (user_id, status, created_at)', 'Индекс только на created_at', 'Индекс только на status', 'Индексы не нужны'], answer: 0, category: 'databases', difficulty: 'hard' },
  { text: 'Что вернёт запрос?', codeSnippet: 'SELECT\n  COALESCE(nickname,\n    username,\n    \'Anonymous\')\n  AS display_name\nFROM users;', codeLanguage: 'sql', options: ['Первое не-NULL значение из nickname, username, или "Anonymous"', 'Всегда "Anonymous"', 'Всегда nickname', 'Ошибка: COALESCE не существует'], answer: 0, category: 'databases', difficulty: 'hard' },
  { text: 'Что произойдёт при выполнении?', codeSnippet: 'DELETE FROM orders\nWHERE created_at <\n  DATE_SUB(\n    NOW(),\n    INTERVAL 1 YEAR\n  );', codeLanguage: 'sql', options: ['Удалит заказы старше 1 года', 'Удалит все заказы', 'Ошибка синтаксиса', 'Удалит заказы за последний год'], answer: 0, category: 'databases', difficulty: 'hard' },
]

const dailyChallenges = [
  { title: 'Сыграй 3 игры', description: 'Завершите 3 игровые сессии', type: 'PLAY_GAMES', target: 3, xpReward: 50 },
  { title: 'Набери 500 очков', description: 'Наберите суммарно 500 очков за день', type: 'SCORE_POINTS', target: 500, xpReward: 75 },
  { title: 'Ответь правильно 20 раз', description: '20 правильных ответов за день', type: 'CORRECT_ANSWERS', target: 20, xpReward: 60 },
  { title: 'Выиграй AI батл', description: 'Одержите победу в батле против AI', type: 'WIN_BATTLE', target: 1, xpReward: 100 },
  { title: 'Сыграй в 3 категориях', description: 'Сыграйте в 3 разных категориях', type: 'PLAY_CATEGORY', target: 3, xpReward: 80 },
  { title: 'Серия из 5 правильных', description: '5 правильных ответов подряд', type: 'STREAK', target: 5, xpReward: 70 },
]

async function main() {
  console.log('Seeding achievements...')
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: { name: a.name, description: a.description, icon: a.icon, xpReward: a.xpReward },
      create: a,
    })
  }
  console.log(`Seeded ${achievements.length} achievements`)

  console.log('Seeding questions...')
  let added = 0
  for (const q of questions) {
    const existing = await prisma.question.findFirst({ where: { text: q.text } })
    if (!existing) {
      await prisma.question.create({
        data: {
          text: q.text,
          options: JSON.stringify(q.options),
          answer: q.answer,
          category: q.category,
          difficulty: q.difficulty,
        },
      })
      added++
    }
  }
  console.log(`Seeded ${added} new questions (${questions.length} total defined)`)

  // Seed code questions
  console.log('Seeding code questions...')
  let codeAdded = 0
  for (const q of codeQuestions) {
    const existing = await prisma.question.findFirst({
      where: { text: q.text, codeSnippet: q.codeSnippet },
    })
    if (!existing) {
      await prisma.question.create({
        data: {
          text: q.text,
          options: JSON.stringify(q.options),
          answer: q.answer,
          category: q.category,
          difficulty: q.difficulty,
          codeSnippet: q.codeSnippet,
          codeLanguage: q.codeLanguage,
        },
      })
      codeAdded++
    }
  }
  console.log(`Seeded ${codeAdded} new code questions (${codeQuestions.length} total defined)`)

  // Seed daily challenges
  console.log('Seeding daily challenges...')
  for (const dc of dailyChallenges) {
    const existing = await prisma.dailyChallenge.findFirst({ where: { type: dc.type } })
    if (!existing) {
      await prisma.dailyChallenge.create({ data: dc })
    }
  }
  console.log(`Seeded ${dailyChallenges.length} daily challenges`)

  // Seed admin user
  const adminEmail = 'admin@quizforge.com'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        rating: 1500,
        level: 10,
        xp: 50,
        xpToNext: 200,
      },
    })
    console.log('Seeded admin user: admin@quizforge.com / admin123')
  } else {
    console.log('Admin user already exists')
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
