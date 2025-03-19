// Типы для модулей и уроков
export interface Lesson {
  id: number;
  title: string;
  description: string;
  videoUrl?: string;
  videoId?: string;
  content?: string;
  duration: number; // в минутах
  isCompleted?: boolean;
  materials?: {
    title: string;
    description: string;
    url: string;
    type: string;
  }[];
}

export interface Module {
  id: number;
  title: string;
  description: string;
  lessonsCount: number;
  progress: number;
  icon: string;
  color: string;
  isFree: boolean;
  lessons: Lesson[];
}

// Данные о модулях и уроках
export const modulesData: Module[] = [
  {
    id: 1,
    title: 'Регистрация на Wildberries',
    description: 'Как правильно зарегистрироваться на маркетплейсе и настроить личный кабинет',
    lessonsCount: 5,
    progress: 20,
    icon: '📝',
    color: 'bg-blue-500',
    isFree: true,
    lessons: [
      {
        id: 1,
        title: 'Введение в работу с Wildberries',
        description: 'Обзор маркетплейса, его преимущества и особенности работы для продавцов',
        videoUrl: 'https://example.com/video1',
        duration: 12,
        content: `
# Введение в работу с Wildberries

Wildberries — крупнейший онлайн-ритейлер в России и СНГ, который предоставляет возможность продавцам размещать свои товары на платформе и получать доступ к многомиллионной аудитории покупателей.

## Преимущества работы с Wildberries:

1. **Широкая аудитория** — более 15 миллионов активных пользователей ежемесячно
2. **Логистическая инфраструктура** — доставка товаров по всей России и в страны СНГ
3. **Пункты выдачи заказов** — более 18 000 ПВЗ в разных городах
4. **Маркетинговые инструменты** — возможность продвижения товаров внутри платформы
5. **Аналитика продаж** — подробная статистика по продажам и поведению покупателей

## Особенности работы на маркетплейсе:

- Комиссия платформы составляет от 15% до 25% в зависимости от категории товара
- Оплата происходит после продажи товара и истечения периода возврата
- Необходимо соблюдать требования к качеству товаров и описаниям
- Важно правильно настроить карточки товаров для лучшей видимости в поиске

## Что нужно для начала работы:

- ИП или ООО (юридическое лицо)
- Товар, соответствующий требованиям маркетплейса
- Фотографии товаров хорошего качества
- Подробные описания товаров

В следующих уроках мы подробно рассмотрим процесс регистрации на платформе и настройку личного кабинета продавца.
        `
      },
      {
        id: 2,
        title: 'Регистрация личного кабинета продавца',
        description: 'Пошаговая инструкция по регистрации на Wildberries и создание аккаунта продавца',
        videoUrl: 'https://example.com/video2',
        duration: 15,
        content: `
# Регистрация личного кабинета продавца

В этом уроке мы рассмотрим пошаговый процесс регистрации на Wildberries и создания аккаунта продавца.

## Шаг 1: Подготовка необходимых документов

Перед регистрацией убедитесь, что у вас есть:
- Свидетельство о регистрации ИП или ООО
- ИНН
- ОГРН/ОГРНИП
- Банковские реквизиты
- Скан паспорта (для ИП)

## Шаг 2: Переход на страницу регистрации

1. Откройте сайт [partners.wildberries.ru](https://partners.wildberries.ru)
2. Нажмите кнопку "Стать продавцом"
3. Выберите тип регистрации: "Юридическое лицо" или "Индивидуальный предприниматель"

## Шаг 3: Заполнение формы регистрации

1. Укажите ваш email и придумайте пароль
2. Заполните основные данные о компании:
   - Название организации
   - ИНН
   - ОГРН/ОГРНИП
   - Юридический адрес
   - ФИО руководителя
3. Загрузите необходимые документы:
   - Скан свидетельства о регистрации
   - Скан паспорта (для ИП)

## Шаг 4: Подтверждение регистрации

1. Проверьте правильность введенных данных
2. Подтвердите согласие с условиями сотрудничества
3. Нажмите кнопку "Зарегистрироваться"
4. Подтвердите email, перейдя по ссылке в письме

## Шаг 5: Ожидание проверки

После регистрации ваша заявка будет проверяться модераторами Wildberries. Обычно этот процесс занимает от 1 до 3 рабочих дней. Вы получите уведомление на email о результатах проверки.

## Важные моменты:

- Указывайте только достоверные данные
- Загружайте четкие сканы документов
- Используйте корпоративную почту для регистрации (если есть)
- Сохраните данные для входа в надежном месте

В следующем уроке мы рассмотрим настройку личного кабинета продавца после успешной регистрации.
        `
      },
      {
        id: 3,
        title: 'Настройка личного кабинета',
        description: 'Основные разделы личного кабинета и их настройка для эффективной работы',
        videoUrl: 'https://example.com/video3',
        duration: 18,
        content: `
# Настройка личного кабинета

После успешной регистрации и одобрения вашей заявки вы получите доступ к личному кабинету продавца. В этом уроке мы рассмотрим основные разделы кабинета и их настройку.

## Основные разделы личного кабинета:

### 1. Главная страница (Дашборд)

На главной странице отображается общая статистика:
- Продажи за период
- Количество заказов
- Средний чек
- Графики продаж
- Уведомления и новости

### 2. Раздел "Товары"

Здесь вы можете:
- Добавлять новые товары
- Редактировать существующие карточки
- Управлять остатками
- Настраивать цены и скидки
- Просматривать статистику по товарам

### 3. Раздел "Заказы"

В этом разделе доступна информация о:
- Новых заказах
- Статусах доставки
- Возвратах
- Отмененных заказах

### 4. Раздел "Аналитика"

Здесь вы найдете:
- Подробную статистику продаж
- Данные о конверсии
- Информацию о популярности товаров
- Отчеты по возвратам

### 5. Раздел "Финансы"

В этом разделе:
- История выплат
- Реестры продаж
- Настройки комиссий
- Банковские реквизиты

### 6. Раздел "Настройки"

Здесь можно настроить:
- Профиль компании
- Пользователей и доступы
- Уведомления
- Интеграции с внешними системами

## Первоначальная настройка кабинета:

1. **Заполните профиль компании**:
   - Добавьте логотип
   - Укажите контактные данные
   - Заполните информацию о компании

2. **Настройте финансовые параметры**:
   - Проверьте банковские реквизиты
   - Настройте автоматические выплаты

3. **Настройте уведомления**:
   - Выберите важные события для получения уведомлений
   - Укажите email для уведомлений

4. **Добавьте пользователей** (если необходимо):
   - Создайте аккаунты для сотрудников
   - Настройте права доступа

## Рекомендации по работе с кабинетом:

- Регулярно проверяйте дашборд для отслеживания ключевых показателей
- Настройте выгрузку отчетов для более глубокого анализа
- Следите за уведомлениями о важных событиях
- Своевременно обновляйте информацию о товарах

В следующем уроке мы рассмотрим процесс добавления первого товара в личный кабинет.
        `
      },
      {
        id: 4,
        title: 'Заполнение реквизитов и документов',
        description: 'Правильное заполнение юридической информации и загрузка необходимых документов',
        videoUrl: 'https://example.com/video4',
        duration: 14,
        content: `
# Заполнение реквизитов и документов

Правильное заполнение юридической информации и загрузка необходимых документов — важный этап в настройке личного кабинета продавца на Wildberries. В этом уроке мы подробно рассмотрим этот процесс.

## Необходимые документы для работы с Wildberries:

1. **Обязательные документы**:
   - Договор с Wildberries (подписывается электронно в личном кабинете)
   - Свидетельство о регистрации ИП/ООО
   - ИНН
   - ОГРН/ОГРНИП
   - Выписка из ЕГРЮЛ/ЕГРИП (не старше 30 дней)
   - Банковские реквизиты

2. **Дополнительные документы** (могут потребоваться в зависимости от типа товаров):
   - Сертификаты соответствия
   - Декларации о соответствии
   - Свидетельства о государственной регистрации (СГР)
   - Лицензии (для определенных видов товаров)

## Процесс заполнения реквизитов:

### 1. Навигация в разделе "Настройки"

В личном кабинете перейдите в раздел "Настройки" → "Реквизиты". Здесь вы увидите форму для заполнения юридической информации.

### 2. Заполнение основных реквизитов

Внесите следующую информацию:
- Полное наименование организации (как в учредительных документах)
- ИНН
- КПП (для ООО)
- ОГРН/ОГРНИП
- Юридический адрес
- Фактический адрес
- ФИО руководителя
- Должность руководителя
- Документ, на основании которого действует руководитель (Устав, доверенность и т.д.)

### 3. Настройка банковских реквизитов

Укажите следующие данные:
- Наименование банка
- БИК
- Корреспондентский счет
- Расчетный счет
- Валюта счета

### 4. Загрузка документов

В разделе "Документы" загрузите отсканированные копии:
- Свидетельство о регистрации
- Свидетельство о постановке на налоговый учет
- Выписку из ЕГРЮЛ/ЕГРИП
- Документы, подтверждающие полномочия руководителя
- Сертификаты на товары (при необходимости)

### 5. Настройка электронного документооборота (ЭДО)

Настройте ЭДО для обмена юридически значимыми документами:
- Выберите оператора ЭДО (Контур.Диадок, СБИС, и т.д.)
- Укажите ID в системе ЭДО
- Настройте автоматический обмен документами

## Важные рекомендации:

- Проверяйте корректность всех введенных данных
- Следите за сроком действия документов
- Своевременно обновляйте информацию при изменениях
- Загружайте четкие сканы документов в формате PDF
- Обратите внимание на требования к сертификатам для ваших товаров

## Возможные проблемы:

| Проблема | Решение |
|----------|---------|
| Отклонение документов модератором | Проверьте качество сканов и соответствие требованиям |
| Ошибка в реквизитах | Внимательно сверьте все данные с оригинальными документами |
| Проблемы с ЭДО | Свяжитесь с технической поддержкой вашего оператора ЭДО |
| Истекший срок сертификата | Обновите сертификат и загрузите актуальную версию |

В следующем уроке мы рассмотрим, как подписать договор с Wildberries и начать работу на платформе.
        `,
        materials: [
          {
            title: 'Шаблон для проверки документов',
            description: 'Чек-лист для проверки необходимых документов перед загрузкой в личный кабинет Wildberries',
            url: 'https://example.com/documents/checklist.pdf',
            type: 'pdf'
          },
          {
            title: 'Образец заполнения реквизитов',
            description: 'Правильно заполненный пример реквизитов для разных форм собственности',
            url: 'https://example.com/documents/requisites_example.pdf',
            type: 'pdf'
          }
        ]
      },
      {
        id: 5,
        title: 'Подписание договора и начало работы',
        description: 'Процесс подписания договора с Wildberries и первые шаги после активации аккаунта',
        videoUrl: 'https://example.com/video5',
        duration: 16,
        content: `
# Подписание договора и начало работы

После успешной регистрации и заполнения всех необходимых реквизитов следующим важным шагом является подписание договора с Wildberries. В этом уроке мы рассмотрим процесс заключения договора и первые действия после активации аккаунта.

## Процесс подписания договора

### 1. Ознакомление с условиями договора

Прежде чем подписать договор, внимательно изучите его содержание. Обратите особое внимание на следующие разделы:
- Комиссии маркетплейса
- Условия поставки товаров
- Правила хранения на складах
- Порядок расчетов
- Процедура возвратов
- Штрафные санкции
- Порядок разрешения споров

### 2. Электронное подписание

Wildberries использует систему электронного документооборота для подписания договоров:

1. В личном кабинете перейдите в раздел "Документы" → "Договоры"
2. Выберите договор для подписания
3. Нажмите кнопку "Подписать электронной подписью"
4. Используйте вашу усиленную квалифицированную электронную подпись (УКЭП)
5. Подтвердите подписание

> **Важно**: Если у вас еще нет УКЭП, необходимо получить ее в удостоверяющем центре. Это можно сделать в таких организациях как Контур, СКБ Конур, Тензор и других аккредитованных удостоверяющих центрах.

### 3. Подтверждение заключения договора

После успешного подписания договора:
- Вы получите уведомление в личном кабинете
- На ваш email придет письмо с подтверждением
- Статус вашего аккаунта изменится на "Активен"

## Первые шаги после активации аккаунта

### 1. Настройка профиля продавца

Заполните информацию о вашем бренде или компании:
- Загрузите логотип
- Добавьте описание бренда
- Укажите контактные данные для покупателей
- Настройте страницу продавца, которую будут видеть покупатели

### 2. Знакомство с интерфейсом и инструментами

Потратьте время на изучение различных разделов личного кабинета:
- Познакомьтесь с аналитическими инструментами
- Изучите систему загрузки товаров
- Разберитесь с механизмом обработки заказов
- Рассмотрите возможности маркетинговых инструментов

### 3. Настройка логистических процессов

Определите способ работы с маркетплейсом:
- **FBO** (Fulfillment by Operator) — хранение товаров на складах Wildberries
- **FBS** (Fulfillment by Seller) — хранение товаров на ваших складах

В зависимости от выбранной модели настройте:
- Адреса складов
- График поставок
- Правила упаковки товаров
- Процедуру обработки возвратов

### 4. Изучение правил и требований

Ознакомьтесь с актуальными правилами маркетплейса:
- Требования к товарам и упаковке
- Правила фотосъемки
- Стандарты создания карточек товаров
- Политика обработки персональных данных
- Правила работы с отзывами покупателей

## Советы для успешного старта:

1. **Будьте внимательны к деталям**. Тщательно изучайте все условия и правила маркетплейса.

2. **Не спешите**. Уделите достаточно времени настройке всех процессов перед загрузкой первых товаров.

3. **Обучайтесь**. Изучайте обучающие материалы, предоставленные Wildberries, и следите за обновлениями.

4. **Общайтесь с сообществом**. Присоединяйтесь к форумам и группам продавцов Wildberries для обмена опытом.

5. **Планируйте наперед**. Подготовьте стратегию работы, включая план поставок и маркетинговые активности.

## Заключение

Правильное оформление договора и грамотное начало работы на маркетплейсе закладывают фундамент для успешного бизнеса на Wildberries. В следующих модулях мы подробно рассмотрим, как выбрать нишу, найти поставщиков и создать эффективные карточки товаров.
        `,
        materials: [
          {
            title: 'Чек-лист для старта на Wildberries',
            description: 'Полный список действий от регистрации до первых продаж',
            url: 'https://example.com/materials/wb_start_checklist.pdf',
            type: 'pdf'
          },
          {
            title: 'Образец договора с Wildberries',
            description: 'Типовой договор с пояснениями ключевых пунктов',
            url: 'https://example.com/materials/contract_sample.pdf',
            type: 'pdf'
          },
          {
            title: 'Инструкция по получению ЭЦП',
            description: 'Пошаговое руководство по получению электронной подписи для работы с маркетплейсом',
            url: 'https://example.com/materials/digital_signature_guide.pdf',
            type: 'pdf'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Выбор ниши и товара',
    description: 'Анализ рынка и выбор прибыльной ниши для старта',
    lessonsCount: 7,
    progress: 10,
    icon: '🔍',
    color: 'bg-green-500',
    isFree: false,
    lessons: []
  },
  {
    id: 3,
    title: 'Поиск поставщиков',
    description: 'Где и как найти надежных поставщиков для вашего бизнеса',
    lessonsCount: 6,
    progress: 0,
    icon: '🤝',
    color: 'bg-yellow-500',
    isFree: false,
    lessons: []
  },
  {
    id: 4,
    title: 'Создание карточек товаров',
    description: 'Как создать продающие карточки товаров на Wildberries',
    lessonsCount: 8,
    progress: 0,
    icon: '📊',
    color: 'bg-purple-500',
    isFree: false,
    lessons: []
  },
  {
    id: 5,
    title: 'Логистика и поставки',
    description: 'Организация поставок товаров на склады Wildberries',
    lessonsCount: 5,
    progress: 0,
    icon: '🚚',
    color: 'bg-red-500',
    isFree: false,
    lessons: []
  },
  {
    id: 6,
    title: 'Аналитика и оптимизация',
    description: 'Анализ продаж и оптимизация карточек товаров',
    lessonsCount: 7,
    progress: 0,
    icon: '📈',
    color: 'bg-indigo-500',
    isFree: false,
    lessons: []
  },
  {
    id: 7,
    title: 'Реклама и продвижение',
    description: 'Стратегии продвижения товаров на Wildberries',
    lessonsCount: 6,
    progress: 0,
    icon: '📣',
    color: 'bg-pink-500',
    isFree: false,
    lessons: []
  },
  {
    id: 8,
    title: 'Масштабирование бизнеса',
    description: 'Как расширить ассортимент и увеличить продажи',
    lessonsCount: 5,
    progress: 0,
    icon: '🚀',
    color: 'bg-teal-500',
    isFree: false,
    lessons: []
  }
]; 