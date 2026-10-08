/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PurposeCategory, UniversityInfo } from '../types/blockchain';

export const UNIVERSITIES: UniversityInfo[] = [
  {
    id: 'kaznu',
    code: '001',
    name: 'Казахский национальный университет имени аль-Фараби (КазНУ)',
    abbreviation: 'КазНУ',
    city: 'Алматы',
    dormitories: [
      'Дом студентов №5 (Мехмат)',
      'Дом студентов №7 (ФИТ)',
      'Дом студентов №9 (Эконом/Юрфак)',
      'Дом студентов №14 (Магистранты)',
      'Дом студентов №17 (Новый кампус)'
    ],
    faculties: [
      'Факультет информационных технологий',
      'Механико-математический факультет',
      'Высшая школа экономики и бизнеса',
      'Юридический факультет',
      'Факультет международных отношений'
    ]
  },
  {
    id: 'kbtu',
    code: '015',
    name: 'Казахстанско-Британский технический университет (КБТУ)',
    abbreviation: 'КБТУ',
    city: 'Алматы',
    dormitories: [
      'Общежитие КБТУ №1 (пр. Абылай хана)',
      'Общежитие КБТУ №2 (ул. Толе би)',
      'Студенческая резиденция "Орбита"'
    ],
    faculties: [
      'Школа информационных технологий и инженерии (SITE)',
      'Бизнес-школа (KBS)',
      'Школа энергетики и нефтегазовой индустрии',
      'Международная школа экономики (ISE)'
    ]
  },
  {
    id: 'nu',
    code: '050',
    name: 'Nazarbayev University (Назарбаев Университет)',
    abbreviation: 'NU',
    city: 'Астана',
    dormitories: [
      'Block 22 Student Residence',
      'Block 24 Undergraduate Hall',
      'Block 26 Graduate Student Residence',
      'Block 31 Modern Dormitory'
    ],
    faculties: [
      'School of Engineering and Digital Sciences (SEDS)',
      'School of Sciences and Humanities (SSH)',
      'Graduate School of Business (GSB)',
      'School of Medicine (NUSOM)'
    ]
  },
  {
    id: 'satbayev',
    code: '002',
    name: 'Satbayev University (Казахский национальный исследовательский технический университет)',
    abbreviation: 'Satbayev Uni',
    city: 'Алматы',
    dormitories: [
      'Общежитие №1 (ул. Сатпаева 22)',
      'Общежитие №3 (ул. Масанчи)',
      'Общежитие №5 (Горно-металлургический корпус)'
    ],
    faculties: [
      'Институт цифровой техники и технологий',
      'Институт геологии и нефтегазового дела',
      'Институт горного дела и металлургии',
      'Институт архитектуры и строительства'
    ]
  },
  {
    id: 'enu',
    code: '003',
    name: 'Евразийский национальный университет имени Л.Н. Гумилева (ЕНУ)',
    abbreviation: 'ЕНУ',
    city: 'Астана',
    dormitories: [
      'Студенческий дом №4 "Студенттер үйі"',
      'Студенческий дом №5 (ул. Янушкевича)',
      'Студенческий дом №7 (ул. Жумабаева)'
    ],
    faculties: [
      'Факультет информационных технологий',
      'Экономический факультет',
      'Физико-технический факультет',
      'Транспортно-энергетический факультет'
    ]
  },
  {
    id: 'iitu',
    code: '042',
    name: 'Международный университет информационных технологий (МУИТ / IITU)',
    abbreviation: 'МУИТ',
    city: 'Алматы',
    dormitories: [
      'Общежитие МУИТ №1 (ул. Манаса 34/1)',
      'Партнерское общежитие "Smart Dorm"'
    ],
    faculties: [
      'Кафедра компьютерной инженерии',
      'Кафедра программной инженерии',
      'Кафедра кибербезопасности',
      'Кафедра цифровых медиа'
    ]
  },
  {
    id: 'sdu',
    code: '038',
    name: 'SDU University (Университет имени Сулеймана Демиреля)',
    abbreviation: 'SDU',
    city: 'Каскелен / Алматы',
    dormitories: [
      'Кампусное общежитие A (Юноши)',
      'Кампусное общежитие B (Девушки)'
    ],
    faculties: [
      'Факультет инженерии и естественных наук',
      'Бизнес-школа SDU',
      'Факультет образования и гуманитарных наук'
    ]
  },
  {
    id: 'almau',
    code: '028',
    name: 'Almaty Management University (AlmaU)',
    abbreviation: 'AlmaU',
    city: 'Алматы',
    dormitories: [
      'Студенческий дом AlmaU (ул. Розыбакиева)'
    ],
    faculties: [
      'Школа менеджмента',
      'Школа цифровых технологий',
      'Школа политики и права'
    ]
  }
];

export const PURPOSE_CATEGORIES_CONFIG: Record<
  PurposeCategory,
  {
    label: string;
    description: string;
    badgeColor: string;
    defaultAmount: number;
    sampleDetails: string[];
  }
> = {
  DORMITORY: {
    label: 'Общежитие / Студ. дом',
    description: 'Оплата проживания в студенческом общежитии, коммунальные сборы и бронирование комнаты',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    defaultAmount: 45000,
    sampleDetails: [
      'Дом студентов №7, комната 412, весенний семестр 2026',
      'Общежитие №2, корпус Б, блок 3, комната 204 (5 месяцев)',
      'Block 22 Hall, Room 318, Spring Semester reservation fee',
      'Общежитие №5, комната 109, оплата за 2-й семестр'
    ]
  },
  TUITION: {
    label: 'Обучение (Семестр/Год)',
    description: 'Основная академическая плата за образовательные услуги бакалавриата, магистратуры или докторантуры',
    badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    defaultAmount: 650000,
    sampleDetails: [
      'Оплата 2-го семестра 2025-2026 уч. года, спец. 6B06102 Информационные системы',
      'Оплата обучения за 3-й курс, бакалавриат "Кибербезопасность"',
      'Tuition Fee Payment for Spring 2026, Computer Science Dept',
      'Академическая оплата за весенний семестр (часть 2)'
    ]
  },
  RETAKE: {
    label: 'Retake / Повторный курс',
    description: 'Оплата академических кредитов за повторное изучение дисциплины (Summer school / FX / Retake)',
    badgeColor: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    defaultAmount: 54000,
    sampleDetails: [
      'Retake дисциплины "Алгоритмы и структуры данных" (3 кредита)',
      'Повторный курс "Математический анализ II" (4 кредита)',
      'Summer term retake fee "Операционные системы" (3 кредита)',
      'Ликвидация академической разницы: "Базы данных" (3 кредита)'
    ]
  },
  CAMPUS_CARD: {
    label: 'Кампусная карта / ID',
    description: 'Выпуск, восстановление или продление студенческого билета и кампусного электронного пропуска',
    badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    defaultAmount: 3500,
    sampleDetails: [
      'Перевыпуск утерянной кампусной смарт-карты доступа (RFID)',
      'Первичный выпуск смарт-карты студента с чипом турникета',
      'Student ID NFC-card renewal for Academic Year 2025-2026'
    ]
  },
  LIBRARY_DEPOSIT: {
    label: 'Библиотечный депозит',
    description: 'Возвратный гарантийный депозит за пользование книжным фондом и научными архивами',
    badgeColor: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    defaultAmount: 15000,
    sampleDetails: [
      'Возвратный депозит за академический книжный фонд (2025-2026)',
      'Библиотечный сбор за пользование зарубежными научными базами Scopus/IEEE'
    ]
  },
  MILITARY_DEPT: {
    label: 'Военная кафедра',
    description: 'Оплата специальной программы военной подготовки офицеров и сержантов запаса',
    badgeColor: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
    defaultAmount: 220000,
    sampleDetails: [
      'Оплата 1-го года обучения на военной кафедре (Офицер запаса)',
      'Военная кафедра: курс полевых сборов и тактической подготовки'
    ]
  },
  ACADEMIC_MOBILITY: {
    label: 'Академическая мобильность',
    description: 'Организационный и визовый сбор для программы обмена или зарубежного семестра',
    badgeColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    defaultAmount: 85000,
    sampleDetails: [
      'Организационный сбор академической мобильности (Семестр в Сеульском университете)',
      'Визово-документационное сопровождение международной программы Erasmus+'
    ]
  },
  DIPLOMA_TRANSCRIPT: {
    label: 'Транскрипт / Документы',
    description: 'Заказ официального академического транскрипта с апостилем или дубликата приложений',
    badgeColor: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    defaultAmount: 5000,
    sampleDetails: [
      'Официальный транскрипт с печатью на английском языке (3 экз.)',
      'Справка-подтверждение статуса обучающегося с апостилем МНВО РК'
    ]
  },
  STUDENT_COUNCIL: {
    label: 'Студенческий сбор / Клуб',
    description: 'Взнос в студенческое самоуправление, научное общество Enactus или спортивные секции',
    badgeColor: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
    defaultAmount: 8000,
    sampleDetails: [
      'Ежегодный членский взнос студенческого спортивного комплекса',
      'Сбор студенческого самоуправления на культурно-научные мероприятия'
    ]
  }
};

export const PAYMENT_METHODS_CONFIG = {
  KASPI_PAY: {
    name: 'Kaspi Pay (Kaspi.kz)',
    short: 'Kaspi',
    color: '#F14635'
  },
  HALYK_BANK: {
    name: 'Halyk Bank (Homebank)',
    short: 'Halyk',
    color: '#008542'
  },
  JUSAN_BANK: {
    name: 'Jusan Bank',
    short: 'Jusan',
    color: '#FA6400'
  },
  FORTE_BANK: {
    name: 'ForteBank',
    short: 'Forte',
    color: '#93278F'
  },
  BANK_RBK: {
    name: 'Bank RBK',
    short: 'RBK',
    color: '#0A4A9C'
  },
  CENTER_CREDIT: {
    name: 'Банк ЦентрКредит (BCC)',
    short: 'BCC',
    color: '#00A651'
  },
  DIRECT_TREASURY: {
    name: 'Казначейство МНВО РК',
    short: 'Казначейство',
    color: '#0284C7'
  }
};
