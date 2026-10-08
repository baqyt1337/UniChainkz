/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PurposeCategory =
  | 'DORMITORY'           // Оплата за проживание в общежитии
  | 'TUITION'             // Оплата за семестр/год обучения
  | 'RETAKE'              // Повторный курс / Retake дисциплины
  | 'CAMPUS_CARD'         // Студенческий билет / Пропуск / ID-карта
  | 'LIBRARY_DEPOSIT'     // Библиотечный сбор / Депозит
  | 'MILITARY_DEPT'       // Военная кафедра
  | 'ACADEMIC_MOBILITY'   // Академическая мобильность / зарубежная стажировка
  | 'DIPLOMA_TRANSCRIPT'  // Справка / транскрипт / диплом
  | 'STUDENT_COUNCIL';    // Студенческий взнос / спортивный клуб

export interface UniversityInfo {
  id: string;
  code: string;
  name: string;
  city: string;
  abbreviation: string;
  dormitories: string[];
  faculties: string[];
}

export type PaymentMethod =
  | 'KASPI_PAY'
  | 'HALYK_BANK'
  | 'JUSAN_BANK'
  | 'FORTE_BANK'
  | 'BANK_RBK'
  | 'CENTER_CREDIT'
  | 'DIRECT_TREASURY';

export interface UniversityTransaction {
  id: string;                      // Уникальный идентификатор TXID (e.g. TX-KZ2026-9B41-KAZNU)
  studentName: string;             // ФИО студента (Бақыт Ерланов)
  iin: string;                     // ИИН (12 цифр)
  studentId: string;               // Студенческий билет / ID
  universityId: string;            // ID университета
  universityName: string;          // Название университета
  faculty: string;                 // Факультет
  purposeCategory: PurposeCategory;// Категория назначения
  purposeDetail: string;           // Детальное описание (например: Дом студентов №7, комната 314, 2-й семестр)
  academicYear: string;            // Учебный год (2025-2026)
  amountKZT: number;               // Сумма в тенге (₸)
  paymentMethod: PaymentMethod;    // Банк / Канал оплаты
  bankReference: string;           // RRN / Номер банковского чека
  timestamp: string;               // Время транзакции (ISO 8601)
  blockNumber: number;             // Номер блока в блокчейне
  txHash: string;                  // SHA-256 хеш транзакции
  status: 'CONFIRMED' | 'MINED' | 'PENDING';
  solanaSignature?: string;        // Сигнатура транзакции в сети Solana Devnet
  solanaMemo?: string;             // Текст Memo в блокчейне Solana
}

export interface BlockchainBlock {
  index: number;                   // Высота блока (0, 1, 2...)
  timestamp: string;               // Время формирования блока
  transactions: UniversityTransaction[]; // Транзакции, включенные в блок
  previousHash: string;            // Хеш предыдущего блока
  merkleRoot: string;              // Merkle Root транзакций
  nonce: number;                   // Число Proof / Валидации
  validatorNode: string;           // Имя узла валидатора
  hash: string;                    // SHA-256 хеш текущего блока
}

export interface BatchInputRow {
  studentName: string;
  iin: string;
  studentId: string;
  universityId: string;
  faculty: string;
  purposeCategory: PurposeCategory;
  purposeDetail: string;
  academicYear: string;
  amountKZT: number;
  paymentMethod: PaymentMethod;
}
