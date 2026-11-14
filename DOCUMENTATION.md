# QuizForge — Полная документация проекта

## Обзор

**QuizForge** — десктопное приложение-квиз по веб-разработке, построенное на стеке Electron + React + Node.js. Приложение предлагает соревновательный формат с несколькими режимами игры, системой рейтинга, достижениями, ежедневными заданиями, адаптивной сложностью и таблицей лидеров. Распространяется как Windows-установщик (NSIS).

---

## Технологический стек

### Клиент (Frontend)
| Технология | Версия | Назначение |
|---|---|---|
| Electron | 31.x | Десктопная оболочка |
| React | 18.3 | UI-фреймворк |
| TypeScript | 5.x | Типизация |
| Vite | 5.x | Сборка и dev-сервер |
| Tailwind CSS | 3.x | Стилизация |
| Zustand | 4.5 | Управление состоянием |
| React Router | 6.26 | Маршрутизация |
| Axios | 1.13 | HTTP-клиент |
| Socket.io-client | 4.7 | WebSocket (батлы) |
| Lucide React | 0.577 | Иконки |

### Сервер (Backend)
| Технология | Версия | Назначение |
|---|---|---|
| Node.js | 22.x | Серверная среда |
| Express | 4.19 | HTTP-фреймворк |
| Prisma | 5.18 | ORM |
| SQLite | — | База данных |
| Socket.io | 4.7 | WebSocket-сервер |
| bcryptjs | 2.4 | Хеширование паролей |
| jsonwebtoken | 9.0 | JWT-аутентификация |
| multer | 2.1 | Загрузка файлов |

---

## Архитектура

```
QuizForge/
├── server/                     # Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Схема базы данных
│   │   └── seed.ts             # Начальные данные (240 вопросов, достижения, задания)
│   ├── src/
│   │   ├── index.ts            # Точка входа сервера (порт 5000)
│   │   ├── prismaClient.ts     # Singleton Prisma-клиента
│   │   ├── controllers/        # Обработчики запросов (8 файлов)
│   │   ├── routes/             # API-маршруты (8 файлов)
│   │   ├── services/           # Бизнес-логика (5 файлов)
│   │   ├── middleware/         # Auth, AdminAuth, Upload (3 файла)
│   │   └── socket/             # WebSocket: socketHandler + battleManager
│   └── uploads/avatars/        # Загруженные аватарки
│
├── client/                     # Frontend + Electron
│   ├── electron/
│   │   ├── main.ts             # Главный процесс Electron
│   │   └── preload.ts          # Preload-скрипт (IPC bridge)
│   ├── src/
│   │   ├── App.tsx             # Маршрутизация приложения
│   │   ├── index.css           # Глобальные стили и анимации
│   │   ├── pages/              # 12 страниц
│   │   ├── components/         # 14 переиспользуемых компонентов
│   │   ├── stores/             # 4 Zustand-хранилища
│   │   ├── hooks/              # 4 кастомных хука
│   │   └── services/           # API-клиент (Axios) + Socket.io
│   └── release/                # Собранный EXE-установщик
```

---

## База данных

### Модель User (Пользователь)
| Поле | Тип | Описание |
|---|---|---|
| id | Int (PK) | Уникальный ID |
| email | String (unique) | Электронная почта |
| username | String (unique) | Имя пользователя |
| password | String | Хеш пароля (bcrypt) |
| role | String | "USER" или "ADMIN" |
| avatarIcon | String | Lucide-иконка аватара (по умолчанию "User") |
| avatarColor | String | Цвет фона аватара (#a855f7) |
| avatarImage | String? | Путь к загруженному фото |
| bannerColor | String | Цвет баннера профиля |
| bio | String? | Описание профиля (макс. 200 символов) |
| title | String | Звание ("Новичок", "Мастер" и т.д.) |
| rating | Int | Рейтинг Elo (по умолчанию 1000) |
| level | Int | Уровень (с 1) |
| xp | Int | Текущий опыт в уровне |
| xpToNext | Int | Опыт до следующего уровня |
| skillLevel | Float | Адаптивная сложность (0.0–1.0) |
| score | Int | Общий счёт |

### Модель Question (Вопрос)
| Поле | Тип | Описание |
|---|---|---|
| id | Int (PK) | Уникальный ID |
| text | String | Текст вопроса |
| options | String | JSON-массив вариантов ответа |
| answer | Int | Индекс правильного ответа (0–3) |
| category | String | html / css / javascript / react / nodejs / databases |
| difficulty | String | easy / medium / hard |
| codeSnippet | String? | Блок кода для отображения |
| codeLanguage | String? | Язык подсветки синтаксиса |

### Модель GameSession (Игровая сессия)
| Поле | Тип | Описание |
|---|---|---|
| id | Int (PK) | Уникальный ID |
| userId | Int (FK) | Ссылка на пользователя |
| mode | String | CLASSIC / TIMED / MARATHON / DUEL / BATTLE_AI |
| category | String | Категория (или несколько через запятую) |
| difficulty | String | Сложность |
| score | Int | Набранный счёт |
| totalQuestions | Int | Всего вопросов |
| correctCount | Int | Правильных ответов |
| timeTaken | Int | Время (мс) |
| streak | Int | Серия правильных ответов |
| xpEarned | Int | Заработанный опыт |
| isBattle | Boolean | Батл-режим |
| isWin | Boolean | Победа (для батлов) |

### Модель Achievement (Достижение)
| Поле | Тип | Описание |
|---|---|---|
| id | Int (PK) | Уникальный ID |
| key | String (unique) | Внутренний ключ |
| name | String | Название (на русском) |
| description | String | Описание |
| icon | String | Имя Lucide-иконки |
| xpReward | Int | Награда в XP |

### Модель DailyChallenge (Ежедневное задание)
| Поле | Тип | Описание |
|---|---|---|
| id | Int (PK) | Уникальный ID |
| title | String | Название задания |
| type | String | PLAY_GAMES / SCORE_POINTS / CORRECT_ANSWERS / WIN_BATTLE / PLAY_CATEGORY / STREAK |
| target | Int | Целевое значение |
| xpReward | Int | Награда в XP |
| isActive | Boolean | Активно ли задание |

### Связующие таблицы
- **UserAchievement** — привязка достижений к пользователям (userId, achievementId, unlockedAt)
- **UserDailyProgress** — прогресс пользователя по ежедневным заданиям (userId, challengeId, date, progress, completed, claimed)

---

## Режимы игры

### 1. Классика (CLASSIC)
- 10 вопросов из одной категории
- Без ограничения по времени
- Выбор сложности влияет на распределение вопросов:
  - Лёгкий: 6 easy, 3 medium, 1 hard
  - Средний: 4 easy, 4 medium, 2 hard
  - Сложный: 2 easy, 4 medium, 4 hard

### 2. На время (TIMED)
- 10 вопросов, 10 секунд на каждый
- Адаптивная сложность (подстраивается под уровень игрока)
- Автоматическая отправка при истечении таймера

### 3. Марафон (MARATHON)
- 3 жизни, бесконечные вопросы
- Вопросы загружаются по одному с сервера
- Игра заканчивается при потере всех жизней
- Адаптивная сложность

### 4. Дуэль знаний (DUEL)
- Выбор 2 категорий
- 5 вопросов из каждой категории (10 всего)
- Вопросы перемешиваются
- Распределение по сложности на категорию:
  - Лёгкий: 3 easy, 1 medium, 1 hard
  - Средний: 1 easy, 3 medium, 1 hard
  - Сложный: 1 easy, 1 medium, 3 hard

### 5. Батл AI (BATTLE_AI)
- Демо-режим PvP с AI-противником
- 10 раундов, 20 секунд на вопрос
- Обратный отсчёт 3-2-1-GO перед началом
- AI-противник отвечает с вероятностью 60% правильно
- Система рейтинга Elo: Победа +15, Ничья +5, Поражение −10

---

## API-эндпоинты

Базовый URL: `http://localhost:5000/api`

### Аутентификация (`/auth`)
| Метод | Путь | Описание |
|---|---|---|
| POST | /login | Вход (email + пароль) → { user, token } |
| POST | /register | Регистрация (username, email, пароль) → { user, token } |
| GET | /me | Текущий пользователь (по JWT) |

### Квиз (`/quiz`)
| Метод | Путь | Описание |
|---|---|---|
| POST | /start-round | Получить пакет из 10 вопросов |
| POST | /next-question | Получить следующий вопрос (марафон) |
| POST | /answer | Отправить ответ → { correct, correctAnswer, skillLevel } |
| POST | /finish | Завершить игру → { session, xpEarned, newAchievements } |
| POST | /battle-result | Сохранить результат батла → { ratingChange, newRating } |
| GET | /skill-stats | Уровень навыка и рекомендуемая сложность |

### Профиль (`/profile`)
| Метод | Путь | Описание |
|---|---|---|
| GET | /titles | Доступные звания (10 шт.) |
| PUT | /title | Сменить звание |
| POST | /avatar | Загрузить фото-аватар (JPG/PNG/WebP, макс. 2МБ) |
| DELETE | /avatar | Удалить фото-аватар |
| GET | /:id | Данные профиля со статистикой |
| PUT | / | Обновить профиль (имя, аватарка, био) |
| GET | /:id/history | История игр (пагинация) |

### Достижения (`/achievements`)
| Метод | Путь | Описание |
|---|---|---|
| GET | / | Все достижения с отметкой разблокировки |
| POST | /check | Проверить и разблокировать достижения |

### Лидерборд (`/leaderboard`)
| Метод | Путь | Описание |
|---|---|---|
| GET | / | Топ-50 (?period=all/week/month) |
| GET | /position | Позиция текущего пользователя |

### Ежедневные задания (`/daily`)
| Метод | Путь | Описание |
|---|---|---|
| GET | / | Задания сегодня с прогрессом |
| POST | /claim/:id | Забрать награду за задание |

### Администрирование (`/admin` — только ADMIN)
| Метод | Путь | Описание |
|---|---|---|
| GET | /stats | Общая статистика (пользователи, игры, вопросы) |
| GET | /analytics | Аналитика (активность, распределение) |
| GET | /questions | Список вопросов (фильтры, поиск, пагинация) |
| POST | /questions | Создать вопрос (с поддержкой кода) |
| PUT | /questions/:id | Редактировать вопрос |
| DELETE | /questions/:id | Удалить вопрос |
| GET | /users | Список пользователей |
| PUT | /users/:id/role | Сменить роль (USER ↔ ADMIN) |

---

## Сервисы (бизнес-логика)

### adaptiveService.ts — Адаптивная сложность
- **skillLevel** (0.0–1.0): <0.35 = easy, 0.35–0.65 = medium, >0.65 = hard
- 80% вопросов — по уровню навыка, 20% — ±1 уровень для разнообразия
- После каждого ответа skillLevel корректируется на ±5%

### quizService.ts — Подсчёт очков
- **Формула**: `basePoints × diffMultiplier + timeBonus`
  - diffMultiplier: hard=1.5, medium=1.0, easy=0.7
  - timeBonus: `max(0, (totalQuestions×30 − timeTaken) / 10)`
- **Прогресс уровней**: XP для следующего уровня растёт на 20% с каждым уровнем

### achievementService.ts — Система достижений
| Ключ | Название | Условие | XP |
|---|---|---|---|
| first_blood | Первая кровь | Сыграть 1 игру | 50 |
| perfect_round | Безупречный раунд | 100% правильных ответов | 100 |
| speed_demon | Скоростной демон | <5с на вопрос | 150 |
| marathon_runner | Марафонец | 500+ очков в марафоне | 100 |
| battle_winner | Победитель | Выиграть батл | 100 |
| on_fire | В огне | 10 правильных подряд | 120 |
| scholar | Учёный | Сыграть во всех 6 категориях | 80 |
| veteran | Ветеран | 50 игр | 200 |
| elite | Элита | Рейтинг 1500+ | 250 |
| grandmaster | Гроссмейстер | Рейтинг 2000+ | 500 |

### ratingService.ts — Система Elo
- K-фактор: 32
- Формула: `1 / (1 + 10^((ratingB − ratingA) / 400))`
- Батл результаты: Победа +15, Ничья +5, Поражение −10

### dailyService.ts — Ежедневные задания
- 6 типов заданий: сыграть игры, набрать очки, правильные ответы, выиграть батл, сыграть категорию, серия
- Прогресс обновляется автоматически после каждой игры
- Награды забираются вручную

---

## Клиентские компоненты

### Страницы (12)
| Файл | Описание |
|---|---|
| Home.tsx | Главная — выбор режима, статистика, ежедневные задания |
| Login.tsx | Вход по email/паролю |
| Register.tsx | Регистрация |
| QuizSetup.tsx | Настройка игры — режим, категория(и), сложность |
| Quiz.tsx | Игровой процесс квиза |
| QuizResult.tsx | Результаты квиза — анимированный счёт, конфетти |
| BattleLobby.tsx | Лобби батла — поиск противника |
| Battle.tsx | Игровой процесс батла |
| BattleResult.tsx | Результаты батла — рейтинг, раунды |
| Leaderboard.tsx | Таблица лидеров (все время / неделя / месяц) |
| Profile.tsx | Профиль — аватар, уровень, достижения, история |
| Admin.tsx | Админ-панель — вопросы, пользователи, аналитика |

### Компоненты (14)
| Файл | Описание |
|---|---|
| Layout.tsx | Обёртка с навбаром, XP-баром, level-up уведомлением |
| TitleBar.tsx | Кастомный title bar Electron (свернуть/развернуть/закрыть) |
| SplashScreen.tsx | Сплеш-скрин с анимацией букв "QuizForge" |
| Toast.tsx | Система уведомлений (success/error/info/achievement) |
| Modal.tsx | Универсальный модальный диалог |
| UserAvatar.tsx | Аватар пользователя (иконка + цвет или фото) |
| ProfileEditor.tsx | Редактор аватара (иконки + загрузка фото) |
| CodeBlock.tsx | Подсветка синтаксиса (JS, HTML, CSS, SQL) без библиотек |
| DailyChallenges.tsx | Карточки ежедневных заданий с прогрессом |
| CountdownOverlay.tsx | Обратный отсчёт 3-2-1-GO для батла |
| Confetti.tsx | Анимация конфетти при победе (45 частиц) |
| Skeleton.tsx | Скелетон-лоадеры для загрузки |
| PageTransition.tsx | Анимация перехода между страницами |
| BattleCard.tsx | Карточка игрока в батле |

### Хранилища (4 Zustand store)
| Файл | Состояние |
|---|---|
| authStore.ts | user, token, login/register/logout/checkAuth/refreshUser |
| quizStore.ts | questions, score, lives, mode, answersHistory, startQuiz/submitAnswer/finishQuiz |
| battleStore.ts | phase, player, opponent, roundResults, submitAnswer/nextRound |
| toastStore.ts | toasts[], addToast/removeToast |

### Хуки (4)
| Файл | Описание |
|---|---|
| useQuiz.ts | Обёртка quizStore + управление таймером TIMED |
| useBattle.ts | Обёртка battleStore + Socket.io интеграция |
| useTimer.ts | Обратный отсчёт с start/pause/reset |
| useRipple.ts | Ripple-эффект при клике на кнопки |

---

## UI/UX особенности

### Анимации
- **fadeInUp** — переход между страницами
- **slideInRight / slideOutLeft** — переход между вопросами
- **countdown** — обратный отсчёт 3-2-1-GO
- **confettiFall** — 45 частиц с рандомными траекториями при победе
- **shake** — тряска кнопки при неправильном ответе
- **ripple** — Material Design волна при клике
- **levelGlow** — пульсирующее свечение при повышении уровня
- **levelUp** — масштабирование + появление уведомления
- **xpFill** — плавное заполнение XP-бара
- **achievementBounce** — прыжок иконки достижения
- **letterReveal** — побуквенное появление на сплеш-скрине
- **parallax** — 3D-наклон карточек на главной при движении мыши

### Кастомный Title Bar
- Чёрный фон, сливается с приложением
- Перетаскивание окна за полосу (`-webkit-app-region: drag`)
- Кнопки: свернуть, развернуть, закрыть (красный hover)
- IPC-коммуникация с Electron main process

### Подсветка синтаксиса
- Регулярные выражения для токенизации (без внешних библиотек)
- Поддержка: JavaScript (ключевые слова, строки, числа, стрелки, методы), HTML (теги, атрибуты), CSS (свойства, значения), SQL (ключевые слова)
- Нумерация строк, бейдж языка, максимум 14 строк

### Адаптивный дизайн
- Тёмная тема (bg-black, neutral-900)
- Скрытый скроллбар
- Skeleton-лоадеры при загрузке данных
- Градиентные карточки режимов
- Tooltip на достижениях

---

## Начальные данные (Seed)

### Вопросы: 240 штук
- **HTML**: 30 (10 easy + 10 medium + 10 hard) + 10 с кодом
- **CSS**: 30 + 10 с кодом
- **JavaScript**: 30 + 10 с кодом
- **React**: 30 + 10 с кодом
- **Node.js**: 30 + 10 с кодом
- **Базы данных (SQL)**: 30 + 10 с кодом

Все вопросы на русском языке. Вопросы с кодом содержат `codeSnippet` и `codeLanguage` для подсветки.

### Достижения: 10 штук
От "Первая кровь" (50 XP) до "Гроссмейстер" (500 XP).

### Ежедневные задания: 6 типов
Сыграть игры, набрать очки, правильные ответы, выиграть батл, сыграть в категории, серия ответов.

### Администратор по умолчанию
- Email: admin@quizforge.com
- Пароль: admin123
- Роль: ADMIN

---

## Сборка и запуск

### Разработка
```bash
# Сервер
cd server
npm install
npx prisma db push
npx prisma db seed
npm run dev                    #

# Клиент
cd client
npm install
npm run dev                 
```

### Продакшен (EXE)
```bash
cd server
npm run build                  # Компиляция TypeScript

cd client
npm run build                  # Vite build
npx electron-builder --win     # Сборка NSIS-установщика
# → release/QuizForge Setup 1.0.0.exe
```

### Структура EXE
- Установщик: `release/QuizForge Setup 1.0.0.exe`
- Unpacked: `release/win-unpacked/QuizForge.exe`
- Включает: Electron runtime, React-приложение (dist), preload-скрипт
- Сервер запускается отдельно (или встраивается)

---

## Конфигурация Electron

```typescript
// electron/main.ts
{
  width: 1200,
  height: 800,
  minWidth: 1024,
  minHeight: 700,
  frame: false,              // Без стандартного title bar
  titleBarStyle: 'hidden',
  // IPC: window-minimize, window-maximize, window-close
}
```

---

## Безопасность

- Пароли хешируются через bcrypt (salt rounds = 10)
- JWT-токен в заголовке Authorization: Bearer
- Автоматический редирект на /login при 401
- Middleware adminAuth для защиты админских эндпоинтов
- Валидация загружаемых файлов (тип, размер)
- CORS настроен для localhost

---

## WebSocket (Socket.io)

### События Client → Server
| Событие | Данные | Описание |
|---|---|---|
| battle:search | { userId, username, rating } | Поиск противника |
| battle:cancel | — | Отмена поиска |
| battle:answer | { roomId, answerIndex } | Отправка ответа |

### События Server → Client
| Событие | Данные | Описание |
|---|---|---|
| battle:searching | — | Ожидание в очереди |
| battle:found | { roomId, players[] } | Противник найден |
| battle:question | { round, totalRounds, question } | Новый вопрос |
| battle:answer-result | { correct, correctAnswer } | Результат ответа |
| battle:round-result | { players[] } | Итог раунда |
| battle:finished | { players[], winnerId, isDraw } | Конец батла |
| battle:opponent-disconnected | — | Противник отключился |

---

