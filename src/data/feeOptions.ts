/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PurposeCategory } from '../types/blockchain';

export interface FeeOption {
  id: string;
  label: string;
  amount: number;
  category: PurposeCategory;
}

export const STUDENT_FEE_OPTIONS: FeeOption[] = [
  {
    id: 'course_1_sem_1',
    label: '1 курс 1 семестр (450 000 ₸)',
    amount: 450000,
    category: 'TUITION'
  },
  {
    id: 'course_1_sem_2',
    label: '1 курс 2 семестр (450 000 ₸)',
    amount: 450000,
    category: 'TUITION'
  },
  {
    id: 'course_2_sem_1',
    label: '2 курс 1 семестр (500 000 ₸)',
    amount: 500000,
    category: 'TUITION'
  },
  {
    id: 'course_2_sem_2',
    label: '2 курс 2 семестр (500 000 ₸)',
    amount: 500000,
    category: 'TUITION'
  },
  {
    id: 'course_3_sem_1',
    label: '3 курс 1 семестр (550 000 ₸)',
    amount: 550000,
    category: 'TUITION'
  },
  {
    id: 'course_3_sem_2',
    label: '3 курс 2 семестр (550 000 ₸)',
    amount: 550000,
    category: 'TUITION'
  },
  {
    id: 'course_4_sem_1',
    label: '4 курс 1 семестр (600 000 ₸)',
    amount: 600000,
    category: 'TUITION'
  },
  {
    id: 'course_4_sem_2',
    label: '4 курс 2 семестр (600 000 ₸)',
    amount: 600000,
    category: 'TUITION'
  },
  {
    id: 'dorm_semester',
    label: 'Общежитие (Семестр) (110 000 ₸)',
    amount: 110000,
    category: 'DORMITORY'
  }
];
