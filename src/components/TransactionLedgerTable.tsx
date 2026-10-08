/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { UniversityTransaction } from '../types/blockchain';
import { UNIVERSITIES, PURPOSE_CATEGORIES_CONFIG, PAYMENT_METHODS_CONFIG } from '../data/universities';
import { Search, FileText, Copy, Check, Shield, User, Lock, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';

interface TransactionLedgerTableProps {
  transactions: UniversityTransaction[];
  initialSearchQuery?: string;
  onViewReceipt: (tx: UniversityTransaction) => void;
  onVerifyTx: (txId: string) => void;
}

export const TransactionLedgerTable: React.FC<TransactionLedgerTableProps> = ({
  transactions,
  initialSearchQuery = '',
  onViewReceipt,
  onVerifyTx
}) => {
  const [searchInput, setSearchInput] = useState(initialSearchQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialSearchQuery);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchInput(initialSearchQuery);
      setSubmittedQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Check if input is a complete 12-digit IIN or exact TXID
  const cleanDigits = submittedQuery.replace(/\D/g, '');
  const isFullIin = cleanDigits.length === 12;
  const isFullTxId = submittedQuery.trim().toUpperCase().startsWith('TX-') && submittedQuery.trim().length >= 15;
  const isExactQueryValid = isFullIin || isFullTxId;

  // Strict Privacy: ONLY match if full 12-digit IIN or exact TXID was submitted
  const filteredTransactions = useMemo(() => {
    if (!isExactQueryValid) {
      return []; // Confidential: Never show partial search or all transactions
    }

    const queryTrimmed = submittedQuery.trim().toLowerCase();

    return transactions.filter(tx => {
      if (isFullIin) {
        return tx.iin === cleanDigits; // Exact match on all 12 digits
      }
      if (isFullTxId) {
        return tx.id.toLowerCase() === queryTrimmed; // Exact match on full TXID
      }
      return false;
    });
  }, [transactions, submittedQuery, isExactQueryValid, isFullIin, isFullTxId, cleanDigits]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmittedQuery(searchInput.trim());
  };

  const handleCopy = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 1500);
  };

  // Student summary card data
  const studentSummary = useMemo(() => {
    if (filteredTransactions.length === 0) return null;

    const firstTx = filteredTransactions[0];
    const totalPaidKZT = filteredTransactions.reduce((sum, tx) => sum + tx.amountKZT, 0);
    const dormPaidKZT = filteredTransactions
      .filter(tx => tx.purposeCategory === 'DORMITORY')
      .reduce((sum, tx) => sum + tx.amountKZT, 0);
    const tuitionPaidKZT = filteredTransactions
      .filter(tx => tx.purposeCategory === 'TUITION')
      .reduce((sum, tx) => sum + tx.amountKZT, 0);

    const uni = UNIVERSITIES.find(u => u.id === firstTx.universityId);

    return {
      studentName: firstTx.studentName,
      iin: firstTx.iin,
      universityName: uni?.abbreviation || firstTx.universityName,
      faculty: firstTx.faculty,
      count: filteredTransactions.length,
      totalPaidKZT,
      dormPaidKZT,
      tuitionPaidKZT
    };
  }, [filteredTransactions]);

  const rawInputDigits = searchInput.replace(/\D/g, '');

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Search & Privacy Shield Header styled in clean pastel theme */}
      <div className="p-8 sm:p-10 bg-white dark:bg-[#0f141c] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl space-y-6 shadow-xs transition-colors">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 dark:bg-teal-950/70 border border-teal-100 dark:border-teal-800/60 rounded-full text-teal-800 dark:text-teal-300 text-xs font-semibold tracking-wide">
            <Shield className="h-3.5 w-3.5" />
            <span>Конфиденциальный студенческий реестр</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
            Поиск истории университетских платежей
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-normal">
            В соответствии с политикой конфиденциальности данные транзакций скрыты. 
            Введите ваш <strong>12-значный ИИН полностью</strong> или <strong>точный номер TXID</strong> для просмотра записей.
          </p>
        </div>

        {/* Search Bar as clean pastel pill input */}
        <form onSubmit={handleSearchSubmit} className="space-y-3 max-w-2xl">
          <div className="bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200/90 dark:border-slate-700/80 p-1.5 pl-4 rounded-full flex items-center gap-2 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100 dark:focus-within:ring-teal-900/40 transition-all shadow-xs">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value);
                if (!e.target.value.trim()) {
                  setSubmittedQuery('');
                }
              }}
              placeholder="Введите 12-значный ИИН или точный номер TXID..."
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0b2b2a] hover:bg-[#123e3c] dark:bg-teal-700 dark:hover:bg-teal-600 rounded-full transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
            >
              Показать историю
            </button>
          </div>

          {/* Validation Feedback indicator */}
          {searchInput.trim().length > 0 && !isExactQueryValid && submittedQuery.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 pt-1 pl-3 font-medium">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {rawInputDigits.length > 0 && rawInputDigits.length < 12 ? (
                <span>ИИН введен не полностью: указано {rawInputDigits.length} из 12 цифр. Для защиты данных требуется полный ввод 12 цифр.</span>
              ) : (
                <span>Для отображения данных требуется полный 12-значный ИИН или точный TXID.</span>
              )}
            </div>
          )}

          {/* Anonymous Test Sample Hints */}
          <div className="flex items-center gap-2 pt-1 pl-3 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            <span>Тестовый ИИН:</span>
            <button
              type="button"
              onClick={() => {
                setSearchInput('030814501289');
                setSubmittedQuery('030814501289');
              }}
              className="text-teal-700 dark:text-teal-400 underline cursor-pointer hover:text-teal-900 dark:hover:text-teal-300"
            >
              030814501289
            </button>
            <span>·</span>
            <span>Тестовый TXID:</span>
            <button
              type="button"
              onClick={() => {
                setSearchInput('TX-KZ2026-KAZNU-9F41');
                setSubmittedQuery('TX-KZ2026-KAZNU-9F41');
              }}
              className="text-teal-700 dark:text-teal-400 underline cursor-pointer hover:text-teal-900 dark:hover:text-teal-300"
            >
              TX-KZ2026-KAZNU-9F41
            </button>
          </div>
        </form>
      </div>

      {/* STATE 1: Not submitted or incomplete query */}
      {!isExactQueryValid && (
        <div className="p-14 bg-white dark:bg-[#0f141c] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl text-center space-y-4 shadow-xs transition-colors">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-100 dark:border-teal-800/60 text-teal-700 dark:text-teal-400">
            <Lock className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Данные транзакций защищены
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Для просмотра истории платежей введите ваш 12-значный ИИН или номер TXID полностью.
            </p>
          </div>
        </div>
      )}

      {/* STATE 2: Full query submitted and matching student found */}
      {isExactQueryValid && studentSummary && (
        <div className="space-y-6">
          
          {/* Скромная карточка-сводка студента над таблицей в пастельном мятном стиле */}
          <div className="p-6 sm:p-8 bg-[#edf7f5] dark:bg-[#0c1f23] border border-[#d2ebe4] dark:border-[#173d44] rounded-3xl space-y-5 shadow-xs transition-colors">
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#d8eee8] dark:border-[#1a444c]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b2b2a] dark:bg-teal-800 text-white font-semibold text-base shrink-0 shadow-xs">
                {studentSummary.studentName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wider block">
                  Подтвержденный студент · UniChain.kz
                </span>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {studentSummary.studentName}
                </h3>
              </div>
            </div>

            {/* Metrics in soft white cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-white dark:bg-[#0f151d] rounded-2xl border border-[#d4ece5] dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">ИИН студента:</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold text-sm tracking-wide">
                  {studentSummary.iin}
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-[#0f151d] rounded-2xl border border-[#d4ece5] dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">ВУЗ и Факультет:</span>
                <span className="font-semibold text-slate-900 dark:text-white block truncate text-sm">
                  {studentSummary.universityName}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5 font-normal">
                  {studentSummary.faculty}
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-[#0f151d] rounded-2xl border border-[#d4ece5] dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Всего оплачено:</span>
                <span className="font-mono text-teal-800 dark:text-teal-300 font-semibold text-base tabular-nums">
                  {studentSummary.totalPaidKZT.toLocaleString('ru-RU')} ₸
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  {studentSummary.count} подтвержденных платежей
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-[#0f151d] rounded-2xl border border-[#d4ece5] dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Семестры / Общежитие:</span>
                <div className="text-[11px] text-slate-800 dark:text-slate-200 font-mono font-medium tabular-nums">
                  Обучение: {studentSummary.tuitionPaidKZT.toLocaleString('ru-RU')} ₸
                </div>
                <div className="text-[11px] text-teal-800 dark:text-teal-300 font-mono font-medium tabular-nums mt-0.5">
                  Общежитие: {studentSummary.dormPaidKZT.toLocaleString('ru-RU')} ₸
                </div>
              </div>
            </div>
          </div>

          {/* Таблица найденных транзакций */}
          <div className="bg-white dark:bg-[#0f141c] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs transition-colors">
            <div className="p-4 bg-[#fbfcfc] dark:bg-[#121922] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs px-6">
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                Найдено платежей: <strong className="text-teal-800 dark:text-teal-400 font-mono font-semibold">{filteredTransactions.length}</strong>
              </span>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-mono flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                Неизменность в блоках подтверждена
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f141c] text-slate-500 dark:text-slate-400 font-medium">
                    <th className="py-3.5 px-6">Номер TXID</th>
                    <th className="py-3.5 px-4">Назначение & Детализация</th>
                    <th className="py-3.5 px-4 text-right">Сумма (₸)</th>
                    <th className="py-3.5 px-4">Банк / Шлюз</th>
                    <th className="py-3.5 px-4 text-center">Блок #</th>
                    <th className="py-3.5 px-6 text-right">Квитанция</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {filteredTransactions.map(tx => {
                    const purposeCfg = PURPOSE_CATEGORIES_CONFIG[tx.purposeCategory];
                    const bankCfg = PAYMENT_METHODS_CONFIG[tx.paymentMethod];

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-[#141d27] transition-colors">
                        {/* TXID */}
                        <td className="py-4 px-6 align-top font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="text-teal-800 dark:text-teal-400 font-semibold">{tx.id}</span>
                            <button
                              onClick={() => handleCopy(tx.id)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title="Скопировать TXID"
                            >
                              {copiedTxId === tx.id ? (
                                <Check className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[130px] mt-0.5">
                            {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
                          </div>
                          {tx.solanaSignature && (
                            <a
                              href={`https://explorer.solana.com/tx/${tx.solanaSignature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-teal-700 dark:text-teal-400 font-semibold hover:underline mt-0.5"
                              title="Посмотреть запись в Solana Devnet"
                            >
                              <span>Solana Memo</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </td>

                        {/* Purpose & Detail */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">
                            {purposeCfg?.label || tx.purposeCategory}
                          </div>
                          <div className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 font-normal">
                            {tx.purposeDetail}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                            {new Date(tx.timestamp).toLocaleString('ru-RU')}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4 align-top text-right font-mono tabular-nums">
                          <span className="font-semibold text-slate-900 dark:text-white text-base">
                            {tx.amountKZT.toLocaleString('ru-RU')} ₸
                          </span>
                        </td>

                        {/* Bank */}
                        <td className="py-4 px-4 align-top">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">
                            {bankCfg?.short || tx.paymentMethod}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            RRN: {tx.bankReference}
                          </div>
                        </td>

                        {/* Block */}
                        <td className="py-4 px-4 align-top text-center font-mono">
                          <span className="text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 border border-teal-200/70 dark:border-teal-800/60 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                            #{tx.blockNumber}
                          </span>
                        </td>

                        {/* Action: Кнопка «Скачать чек / Квитанцию» */}
                        <td className="py-4 px-6 align-top text-right">
                          <button
                            onClick={() => onViewReceipt(tx)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0b2b2a] hover:bg-[#123e3c] dark:bg-teal-700 dark:hover:bg-teal-600 rounded-full transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
                            title="Открыть официальный чек с QR-кодом и печатью"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Скачать чек / Квитанцию</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: Query submitted completely, but no student records found */}
      {isExactQueryValid && filteredTransactions.length === 0 && (
        <div className="p-12 bg-white dark:bg-[#0f141c] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl text-center space-y-3 shadow-xs transition-colors">
          <AlertCircle className="h-10 w-10 mx-auto text-amber-500" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            По запросу «{submittedQuery}» платежей не найдено
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-normal">
            В блокчейне пока нет зафиксированных платежей с указанным ИИН или TXID. 
            Проверьте правильность введенных данных или совершите платеж через кнопку «Новый платеж».
          </p>
        </div>
      )}

    </div>
  );
};
