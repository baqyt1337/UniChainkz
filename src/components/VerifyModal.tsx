/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BlockchainBlock, UniversityTransaction } from '../types/blockchain';
import { Search, ShieldCheck, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';
import { PURPOSE_CATEGORIES_CONFIG, PAYMENT_METHODS_CONFIG } from '../data/universities';

interface VerifyModalProps {
  blocks: BlockchainBlock[];
  initialSearchTxId?: string;
  onViewReceipt: (tx: UniversityTransaction) => void;
}

export const VerifyModal: React.FC<VerifyModalProps> = ({
  blocks,
  initialSearchTxId = '',
  onViewReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTxId);
  const [searchExecuted, setSearchExecuted] = useState(Boolean(initialSearchTxId));

  const allTransactions = blocks.flatMap(b => b.transactions);

  const matchedTx = searchExecuted && searchTerm.trim()
    ? allTransactions.find(
        t =>
          t.id.toLowerCase() === searchTerm.trim().toLowerCase() ||
          t.txHash.toLowerCase() === searchTerm.trim().toLowerCase() ||
          t.iin === searchTerm.trim()
      )
    : null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchExecuted(true);
  };

  const containingBlock = matchedTx
    ? blocks.find(b => b.index === matchedTx.blockNumber)
    : null;

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Государственный валидатор подлинности платежей РК</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Криптографическая верификация транзакции
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Введите уникальный номер TXID (например, <code className="text-emerald-300 font-mono">TX-KZ2026-KAZNU-9F41</code>),
            хеш SHA-256 или 12-значный ИИН студента для проверки неизменности записи в распределенном реестре.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setSearchExecuted(false);
              }}
              placeholder="Введите TXID, SHA-256 хеш или ИИН..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <span>Проверить запись</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>Примеры для проверки:</span>
          {allTransactions.slice(0, 3).map(tx => (
            <button
              key={tx.id}
              onClick={() => {
                setSearchTerm(tx.id);
                setSearchExecuted(true);
              }}
              className="text-emerald-400 hover:underline font-mono cursor-pointer"
            >
              {tx.id}
            </button>
          ))}
        </div>
      </div>

      {/* Result Section */}
      {searchExecuted && (
        <div>
          {matchedTx ? (
            <div className="p-6 bg-slate-900 border border-emerald-500/50 rounded-xl space-y-6 shadow-xl">
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Запись 100% подлинна и неизменна
                    </div>
                    <h3 className="text-lg font-bold text-white font-mono">
                      {matchedTx.id}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onViewReceipt(matchedTx)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Открыть официальный чек</span>
                </button>
              </div>

              {/* Data Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Студент (плательщик):</span>
                  <span className="font-semibold text-white block text-sm">{matchedTx.studentName}</span>
                  <span className="text-slate-400 font-mono text-[11px] block mt-0.5">ИИН: {matchedTx.iin}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Университет РК:</span>
                  <span className="font-semibold text-white block text-sm">{matchedTx.universityName}</span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">{matchedTx.faculty}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Назначение платежа:</span>
                  <span className="font-semibold text-emerald-300 block text-sm">
                    {PURPOSE_CATEGORIES_CONFIG[matchedTx.purposeCategory]?.label}
                  </span>
                  <span className="text-slate-300 text-[11px] block mt-0.5">{matchedTx.purposeDetail}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Сумма и банк:</span>
                  <span className="font-bold text-white font-mono text-base block tabular-nums">
                    {matchedTx.amountKZT.toLocaleString('ru-RU')} ₸
                  </span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    {PAYMENT_METHODS_CONFIG[matchedTx.paymentMethod]?.name}
                  </span>
                </div>
              </div>

              {/* Block & Hash Inspection */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Блок в цепочке: <strong>#{matchedTx.blockNumber}</strong></span>
                  <span>Время фиксации: {new Date(matchedTx.timestamp).toLocaleString('ru-RU')}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-500 font-sans block">SHA-256 Хеш транзакции:</span>
                  <span className="text-emerald-400 break-all select-all">{matchedTx.txHash}</span>
                </div>
                {containingBlock && (
                  <div className="text-[11px]">
                    <span className="text-slate-500 font-sans block">Корень дерева Меркла (Merkle Root блока):</span>
                    <span className="text-slate-300 break-all select-all">{containingBlock.merkleRoot}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs space-y-2">
              <XCircle className="h-8 w-8 text-rose-400 mx-auto" />
              <div className="text-white font-bold text-sm">Транзакция не найдена в реестре</div>
              <p className="text-slate-400 max-w-md mx-auto">
                По запросу <code className="text-rose-300 font-mono">"{searchTerm}"</code> записей в текущих блоках не обнаружено. 
                Проверьте правильность введенного номера TXID или зарегистрируйте платеж через форму.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
