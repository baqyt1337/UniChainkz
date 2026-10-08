/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UniversityTransaction, BlockchainBlock } from '../types/blockchain';
import { Home, GraduationCap, Building2, ShieldCheck } from 'lucide-react';

interface StatsOverviewProps {
  transactions: UniversityTransaction[];
  blocks: BlockchainBlock[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ transactions, blocks }) => {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amountKZT, 0);

  const dormTxs = transactions.filter(t => t.purposeCategory === 'DORMITORY');
  const dormAmount = dormTxs.reduce((sum, t) => sum + t.amountKZT, 0);

  const tuitionTxs = transactions.filter(t => t.purposeCategory === 'TUITION');
  const tuitionAmount = tuitionTxs.reduce((sum, t) => sum + t.amountKZT, 0);

  const uniqueUnis = new Set(transactions.map(t => t.universityId)).size;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 bg-white dark:bg-[#0f141c] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xs font-sans transition-colors">
      {/* Stat 1 */}
      <div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">
          Всего сборов в реестре
        </div>
        <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
          {totalAmount.toLocaleString('ru-RU')} ₸
        </div>
        <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-1 flex items-center gap-1">
          <span>●</span>
          <span>{transactions.length} подтвержденных транзакций</span>
        </div>
      </div>

      {/* Stat 2 */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">
          <span>Общежития (комнаты)</span>
        </div>
        <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
          {dormAmount.toLocaleString('ru-RU')} ₸
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
          {dormTxs.length} броней комнат
        </div>
      </div>

      {/* Stat 3 */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">
          <span>Оплата семестров</span>
        </div>
        <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
          {tuitionAmount.toLocaleString('ru-RU')} ₸
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
          {tuitionTxs.length} академических оплат
        </div>
      </div>

      {/* Stat 4 */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">
          <span>Сеть блокчейна</span>
        </div>
        <div className="text-2xl sm:text-3xl font-semibold text-teal-700 dark:text-teal-400 tracking-tight font-mono tabular-nums">
          {blocks.length} блоков
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
          {uniqueUnis} вузов РК · SHA-256
        </div>
      </div>
    </div>
  );
};
