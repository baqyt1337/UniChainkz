/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlockchainBlock, UniversityTransaction, BatchInputRow } from '../types/blockchain';
import { calculateBlockHash, calculateMerkleRoot, calculateTransactionHash } from './crypto';

// Genesis Block creation
const GENESIS_TIMESTAMP = '2026-09-01T08:00:00.000Z';
const GENESIS_VALIDATOR = 'МНВО РК Genesis Node // Казахстанский Межбанковский Расчетный Центр';
const genesisMerkle = calculateMerkleRoot([]);
const genesisHash = calculateBlockHash(0, '0x0000000000000000000000000000000000000000000000000000000000000000', GENESIS_TIMESTAMP, genesisMerkle, 1337, GENESIS_VALIDATOR);

export const GENESIS_BLOCK: BlockchainBlock = {
  index: 0,
  timestamp: GENESIS_TIMESTAMP,
  transactions: [],
  previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  merkleRoot: genesisMerkle,
  nonce: 1337,
  validatorNode: GENESIS_VALIDATOR,
  hash: genesisHash
};

// Seed Transactions for Block #1
const seedTxData: Omit<UniversityTransaction, 'txHash'>[] = [
  {
    id: 'TX-KZ2026-KAZNU-9F41',
    studentName: 'Бақыт Ерланов',
    iin: '030814501289',
    studentId: 'ST-KAZNU-22410',
    universityId: 'kaznu',
    universityName: 'Казахский национальный университет имени аль-Фараби (КазНУ)',
    faculty: 'Факультет информационных технологий',
    purposeCategory: 'DORMITORY',
    purposeDetail: 'Дом студентов №7 (ФИТ), комната 412, весенний семестр 2026',
    academicYear: '2025-2026',
    amountKZT: 45000,
    paymentMethod: 'KASPI_PAY',
    bankReference: 'KAS892019481',
    timestamp: '2026-10-06T09:14:22.000Z',
    blockNumber: 1,
    status: 'CONFIRMED'
  },
  {
    id: 'TX-KZ2026-KBTU-82C3',
    studentName: 'Айгерим Серикова',
    iin: '040520602311',
    studentId: 'ST-KBTU-23108',
    universityId: 'kbtu',
    universityName: 'Казахстанско-Британский технический университет (КБТУ)',
    faculty: 'Школа информационных технологий и инженерии (SITE)',
    purposeCategory: 'TUITION',
    purposeDetail: 'Оплата обучения 2-го семестра, специальность Информационные системы',
    academicYear: '2025-2026',
    amountKZT: 780000,
    paymentMethod: 'HALYK_BANK',
    bankReference: 'HAL719401294',
    timestamp: '2026-10-06T10:45:10.000Z',
    blockNumber: 1,
    status: 'CONFIRMED'
  },
  {
    id: 'TX-KZ2026-NU-4D19',
    studentName: 'Данияр Ахметов',
    iin: '021105501874',
    studentId: 'ST-NU-202109',
    universityId: 'nu',
    universityName: 'Nazarbayev University (Назарбаев Университет)',
    faculty: 'School of Engineering and Digital Sciences (SEDS)',
    purposeCategory: 'DORMITORY',
    purposeDetail: 'Block 22 Student Residence, Room 304, Spring Semester 2026',
    academicYear: '2025-2026',
    amountKZT: 65000,
    paymentMethod: 'FORTE_BANK',
    bankReference: 'FOR381920412',
    timestamp: '2026-10-06T11:20:05.000Z',
    blockNumber: 1,
    status: 'CONFIRMED'
  },
  {
    id: 'TX-KZ2026-ENU-11E8',
    studentName: 'Меруерт Касымова',
    iin: '040217603912',
    studentId: 'ST-ENU-22091',
    universityId: 'enu',
    universityName: 'Евразийский национальный университет имени Л.Н. Гумилева (ЕНУ)',
    faculty: 'Факультет информационных технологий',
    purposeCategory: 'CAMPUS_CARD',
    purposeDetail: 'Выпуск смарт-карты студента с чипом электронного турникета',
    academicYear: '2025-2026',
    amountKZT: 3500,
    paymentMethod: 'JUSAN_BANK',
    bankReference: 'JUS991823100',
    timestamp: '2026-10-06T12:05:43.000Z',
    blockNumber: 1,
    status: 'CONFIRMED'
  },
  {
    id: 'TX-KZ2026-SATB-5A32',
    studentName: 'Алишер Болатов',
    iin: '030928504100',
    studentId: 'ST-SAT-21944',
    universityId: 'satbayev',
    universityName: 'Satbayev University (Казахский национальный исследовательский технический университет)',
    faculty: 'Институт цифровой техники и технологий',
    purposeCategory: 'RETAKE',
    purposeDetail: 'Retake дисциплины "Математический анализ II" (4 кредита)',
    academicYear: '2025-2026',
    amountKZT: 56000,
    paymentMethod: 'CENTER_CREDIT',
    bankReference: 'CEN481920311',
    timestamp: '2026-10-06T13:40:18.000Z',
    blockNumber: 1,
    status: 'CONFIRMED'
  }
];

const seedTransactions: UniversityTransaction[] = seedTxData.map(tx => ({
  ...tx,
  txHash: calculateTransactionHash(tx)
}));

const block1Hashes = seedTransactions.map(t => t.txHash);
const block1Merkle = calculateMerkleRoot(block1Hashes);
const BLOCK1_TIMESTAMP = '2026-10-06T14:00:00.000Z';
const BLOCK1_VALIDATOR = 'КазНУ Node #01 // Validator Consensus Proof-of-Authority';
const block1Hash = calculateBlockHash(1, genesisHash, BLOCK1_TIMESTAMP, block1Merkle, 4291, BLOCK1_VALIDATOR);

export const INITIAL_BLOCK_1: BlockchainBlock = {
  index: 1,
  timestamp: BLOCK1_TIMESTAMP,
  transactions: seedTransactions,
  previousHash: genesisHash,
  merkleRoot: block1Merkle,
  nonce: 4291,
  validatorNode: BLOCK1_VALIDATOR,
  hash: block1Hash
};

export const INITIAL_BLOCKCHAIN: BlockchainBlock[] = [GENESIS_BLOCK, INITIAL_BLOCK_1];

// 10 Preset Transactions for Instant 1-Click Batch Loading
export const PRESET_BATCH_10_TRANSACTIONS: BatchInputRow[] = [
  {
    studentName: 'Нурсултан Смагулов',
    iin: '040312501982',
    studentId: 'ST-KAZNU-22014',
    universityId: 'kaznu',
    faculty: 'Факультет информационных технологий',
    purposeCategory: 'DORMITORY',
    purposeDetail: 'Дом студентов №7 (ФИТ), блок А, комната 308 (весенний семестр)',
    academicYear: '2025-2026',
    amountKZT: 45000,
    paymentMethod: 'KASPI_PAY'
  },
  {
    studentName: 'Динара Жумабаева',
    iin: '050119602441',
    studentId: 'ST-KBTU-23488',
    universityId: 'kbtu',
    faculty: 'Школа информационных технологий и инженерии (SITE)',
    purposeCategory: 'TUITION',
    purposeDetail: 'Оплата обучения 2-го семестра, специальность Программная инженерия',
    academicYear: '2025-2026',
    amountKZT: 780000,
    paymentMethod: 'HALYK_BANK'
  },
  {
    studentName: 'Арман Кенжебеков',
    iin: '031004503211',
    studentId: 'ST-NU-21903',
    universityId: 'nu',
    faculty: 'School of Engineering and Digital Sciences (SEDS)',
    purposeCategory: 'DORMITORY',
    purposeDetail: 'Block 24 Undergraduate Hall, Room 410, Academic Year 2025-2026',
    academicYear: '2025-2026',
    amountKZT: 65000,
    paymentMethod: 'KASPI_PAY'
  },
  {
    studentName: 'Амина Омарова',
    iin: '040625601198',
    studentId: 'ST-ENU-22819',
    universityId: 'enu',
    faculty: 'Экономический факультет',
    purposeCategory: 'DORMITORY',
    purposeDetail: 'Студенческий дом №5 (ул. Янушкевича), 3-й этаж, комната 312',
    academicYear: '2025-2026',
    amountKZT: 42000,
    paymentMethod: 'JUSAN_BANK'
  },
  {
    studentName: 'Темирлан Ибраев',
    iin: '030409502741',
    studentId: 'ST-SAT-21405',
    universityId: 'satbayev',
    faculty: 'Институт цифровой техники и технологий',
    purposeCategory: 'RETAKE',
    purposeDetail: 'Повторный курс (Retake): "Алгоритмы и структуры данных", 3 кредита',
    academicYear: '2025-2026',
    amountKZT: 54000,
    paymentMethod: 'CENTER_CREDIT'
  },
  {
    studentName: 'Аружан Сабитова',
    iin: '050812603410',
    studentId: 'ST-IITU-23114',
    universityId: 'iitu',
    faculty: 'Кафедра программной инженерии',
    purposeCategory: 'CAMPUS_CARD',
    purposeDetail: 'Выпуск смарт-карты студента с чипом биометрии турникета',
    academicYear: '2025-2026',
    amountKZT: 3500,
    paymentMethod: 'KASPI_PAY'
  },
  {
    studentName: 'Санжар Маликов',
    iin: '030221501102',
    studentId: 'ST-SDU-21940',
    universityId: 'sdu',
    faculty: 'Факультет инженерии и естественных наук',
    purposeCategory: 'DORMITORY',
    purposeDetail: 'Кампусное общежитие A (Юноши), комната 218, 2-й семестр',
    academicYear: '2025-2026',
    amountKZT: 55000,
    paymentMethod: 'FORTE_BANK'
  },
  {
    studentName: 'Камила Турсынбек',
    iin: '040915604122',
    studentId: 'ST-ALMA-22890',
    universityId: 'almau',
    faculty: 'Школа менеджмента',
    purposeCategory: 'LIBRARY_DEPOSIT',
    purposeDetail: 'Возвратный гарантийный депозит книжного фонда и Scopus',
    academicYear: '2025-2026',
    amountKZT: 15000,
    paymentMethod: 'HALYK_BANK'
  },
  {
    studentName: 'Ербол Мукашев',
    iin: '021208502390',
    studentId: 'ST-KAZNU-21340',
    universityId: 'kaznu',
    faculty: 'Юридический факультет',
    purposeCategory: 'MILITARY_DEPT',
    purposeDetail: 'Оплата 1-го семестра обучения на военной кафедре (Офицер запаса)',
    academicYear: '2025-2026',
    amountKZT: 220000,
    paymentMethod: 'DIRECT_TREASURY'
  },
  {
    studentName: 'Мадина Усенова',
    iin: '041130602901',
    studentId: 'ST-ENU-23055',
    universityId: 'enu',
    faculty: 'Факультет информационных технологий',
    purposeCategory: 'DIPLOMA_TRANSCRIPT',
    purposeDetail: 'Официальный транскрипт с апостилем МНВО РК (3 экземпляра)',
    academicYear: '2025-2026',
    amountKZT: 5000,
    paymentMethod: 'KASPI_PAY'
  }
];
