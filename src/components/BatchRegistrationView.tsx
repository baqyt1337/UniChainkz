/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BatchInputRow, PurposeCategory, PaymentMethod, BlockchainBlock, UniversityTransaction } from '../types/blockchain';
import { UNIVERSITIES, PURPOSE_CATEGORIES_CONFIG, PAYMENT_METHODS_CONFIG } from '../data/universities';
import { PRESET_BATCH_10_TRANSACTIONS } from '../utils/initialData';
import { calculateBlockHash, calculateMerkleRoot, calculateTransactionHash, generateBankRef, generateTXID } from '../utils/crypto';
import { Layers, Sparkles, Trash2, Plus, CheckCircle, FileText, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

interface BatchRegistrationViewProps {
  onBatchCompleted: (newBlock: BlockchainBlock) => void;
  latestBlock: BlockchainBlock;
  onViewReceipt: (tx: UniversityTransaction) => void;
}

export const BatchRegistrationView: React.FC<BatchRegistrationViewProps> = ({
  onBatchCompleted,
  latestBlock,
  onViewReceipt
}) => {
  // Initialize with 1 clean empty row - examples are loaded only via the "Добавить примеры" button
  const createEmptyRow = (customId?: string): BatchInputRow => ({
    studentName: '',
    iin: '',
    studentId: customId || `ST-KZ-${Math.floor(10000 + Math.random() * 90000)}`,
    universityId: 'kaznu',
    faculty: 'Факультет информационных технологий',
    purposeCategory: 'TUITION',
    purposeDetail: '1 курс 1 семестр (450 000 ₸)',
    academicYear: '2025-2026',
    amountKZT: 450000,
    paymentMethod: 'KASPI_PAY'
  });

  const [rows, setRows] = useState<BatchInputRow[]>([createEmptyRow()]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepProgress, setStepProgress] = useState<string>('');
  const [lastCreatedBlock, setLastCreatedBlock] = useState<BlockchainBlock | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRowChange = (index: number, field: keyof BatchInputRow, value: any) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === 'universityId') {
        const uni = UNIVERSITIES.find(u => u.id === value);
        if (uni && updated[index].purposeCategory === 'DORMITORY') {
          updated[index].purposeDetail = `${uni.dormitories[0] || 'Общежитие №1'}, комната 301`;
        }
      }

      if (field === 'purposeCategory') {
        const catConfig = PURPOSE_CATEGORIES_CONFIG[value as PurposeCategory];
        if (catConfig) {
          updated[index].amountKZT = catConfig.defaultAmount;
          const uni = UNIVERSITIES.find(u => u.id === updated[index].universityId);
          if (value === 'DORMITORY' && uni && uni.dormitories.length > 0) {
            updated[index].purposeDetail = `${uni.dormitories[0]}, комната 214`;
          } else {
            updated[index].purposeDetail = catConfig.sampleDetails[0] || '';
          }
        }
      }

      return updated;
    });
  };

  const handleAddRow = () => {
    setRows(prev => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) {
      setErrorMsg('В пакете должна оставаться минимум 1 запись.');
      return;
    }
    setErrorMsg(null);
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleLoad10Presets = () => {
    setRows(PRESET_BATCH_10_TRANSACTIONS);
    setLastCreatedBlock(null);
    setErrorMsg(null);
  };

  const handleClearAll = () => {
    setRows([createEmptyRow()]);
    setLastCreatedBlock(null);
    setErrorMsg(null);
  };

  const totalAmount = rows.reduce((sum, r) => sum + (Number(r.amountKZT) || 0), 0);

  const handleCommitBatchToBlockchain = async () => {
    setErrorMsg(null);

    // Basic validation
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.studentName.trim()) {
        setErrorMsg(`Строка #${i + 1}: Укажите ФИО студента.`);
        return;
      }
      if (!row.iin || row.iin.trim().length !== 12) {
        setErrorMsg(`Строка #${i + 1}: ИИН должен содержать ровно 12 цифр (введено: "${row.iin}").`);
        return;
      }
      if (!row.amountKZT || row.amountKZT <= 0) {
        setErrorMsg(`Строка #${i + 1}: Сумма должна быть больше 0 ₸.`);
        return;
      }
    }

    setIsProcessing(true);
    setStepProgress('1/4: Генерация криптографических TXID и хешей...');

    await new Promise(r => setTimeout(r, 400));
    setStepProgress('2/4: Построение дерева Меркла (Merkle Tree Root)...');

    await new Promise(r => setTimeout(r, 450));
    setStepProgress('3/4: Консенсус валидаторов МНВО РК (Proof-of-Authority)...');

    await new Promise(r => setTimeout(r, 400));
    setStepProgress('4/4: Запись транзакций в неизменяемый блок...');

    const newBlockIndex = latestBlock.index + 1;
    const nowIso = new Date().toISOString();

    const newTransactions: UniversityTransaction[] = rows.map((r) => {
      const uni = UNIVERSITIES.find(u => u.id === r.universityId) || UNIVERSITIES[0];
      const txId = generateTXID(uni.abbreviation);
      const bankRef = generateBankRef(r.paymentMethod);

      const baseTx: Omit<UniversityTransaction, 'txHash'> = {
        id: txId,
        studentName: r.studentName.trim(),
        iin: r.iin.trim(),
        studentId: r.studentId || `ST-${Math.floor(10000 + Math.random() * 90000)}`,
        universityId: uni.id,
        universityName: uni.name,
        faculty: r.faculty || uni.faculties[0] || 'Общий факультет',
        purposeCategory: r.purposeCategory,
        purposeDetail: r.purposeDetail.trim() || PURPOSE_CATEGORIES_CONFIG[r.purposeCategory].description,
        academicYear: r.academicYear || '2025-2026',
        amountKZT: Number(r.amountKZT),
        paymentMethod: r.paymentMethod,
        bankReference: bankRef,
        timestamp: nowIso,
        blockNumber: newBlockIndex,
        status: 'CONFIRMED'
      };

      const txHash = calculateTransactionHash(baseTx);
      return {
        ...baseTx,
        txHash
      };
    });

    const txHashes = newTransactions.map(t => t.txHash);
    const merkleRoot = calculateMerkleRoot(txHashes);
    const validatorNode = 'МНВО РК Consensus Node #02 // Межбанковский шлюз РК';
    const nonce = Math.floor(1000 + Math.random() * 9000);
    const blockHash = calculateBlockHash(
      newBlockIndex,
      latestBlock.hash,
      nowIso,
      merkleRoot,
      nonce,
      validatorNode
    );

    const newBlock: BlockchainBlock = {
      index: newBlockIndex,
      timestamp: nowIso,
      transactions: newTransactions,
      previousHash: latestBlock.hash,
      merkleRoot,
      nonce,
      validatorNode,
      hash: blockHash
    };

    setIsProcessing(false);
    setStepProgress('');
    setLastCreatedBlock(newBlock);
    onBatchCompleted(newBlock);
  };

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Header Info Banner in pastel theme */}
      <div className="p-8 sm:p-10 bg-white dark:bg-[#0f141c] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 dark:bg-teal-950/70 border border-teal-100 dark:border-teal-800/60 rounded-full text-teal-800 dark:text-teal-300 text-xs font-semibold tracking-wide">
              <Layers className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
              <span>Шлюз пакетного клиринга вузов РК</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
              Пакетная регистрация транзакций (10+)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-normal">
              Ввод и одновременная фиксация оплат разных студентов. Все записи упаковываются в один блок через дерево Меркла (Merkle Root) с присвоением TXID каждому студенту.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleLoad10Presets}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800/80 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-full transition-all whitespace-nowrap cursor-pointer shadow-xs active:scale-95"
              title="Заполнить форму 10 готовыми примерами студентов вузов Казахстана"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Добавить примеры (10 студентов)</span>
            </button>

            <button
              onClick={handleClearAll}
              className="px-4 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 rounded-full hover:bg-slate-50 dark:hover:bg-[#151e28] transition-colors whitespace-nowrap cursor-pointer"
            >
              Очистить
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Block Creation Result Banner */}
      {lastCreatedBlock && (
        <div className="p-6 sm:p-8 bg-[#edf7f5] dark:bg-[#0c1f23] border border-[#d2ebe4] dark:border-[#173d44] rounded-3xl space-y-5 shadow-xs transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-lg">
              <CheckCircle className="h-6 w-6 text-teal-700 dark:text-teal-400" />
              <span>Блок #{lastCreatedBlock.index} успешно сформирован и записан в Блокчейн!</span>
            </div>
            <span className="text-xs font-mono font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full">
              {lastCreatedBlock.transactions.length} транзакций
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white dark:bg-[#0f151d] p-4 rounded-2xl border border-[#d6ede7] dark:border-slate-800 font-mono">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Хеш блока:</span>
              <span className="text-teal-800 dark:text-teal-300 font-semibold truncate block">{lastCreatedBlock.hash}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Корень Меркла:</span>
              <span className="text-slate-800 dark:text-slate-200 truncate block">{lastCreatedBlock.merkleRoot}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Предыдущий блок:</span>
              <span className="text-slate-400 dark:text-slate-500 truncate block">#{lastCreatedBlock.index - 1}</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mb-3">
              Присвоенные криптографические идентификаторы (TXID):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {lastCreatedBlock.transactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-[#0f151d] border border-[#d6ede7] dark:border-slate-800 rounded-xl text-xs"
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {idx + 1}. {tx.studentName}
                    </div>
                    <div className="text-teal-800 dark:text-teal-300 font-mono text-[11px] truncate font-medium">
                      {tx.id}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] truncate">
                      {tx.amountKZT.toLocaleString('ru-RU')} ₸
                    </div>
                  </div>
                  <button
                    onClick={() => onViewReceipt(tx)}
                    className="shrink-0 p-2 text-white bg-[#0b2b2a] hover:bg-[#123e3c] dark:bg-teal-700 dark:hover:bg-teal-600 rounded-full transition-colors cursor-pointer"
                    title="Открыть чек"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editable Table Container */}
      <div className="bg-white dark:bg-[#0f141c] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs transition-colors">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-[#fbfcfc] dark:bg-[#121922]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Строки ввода ({rows.length} транзакций)
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Сумма пакета: <strong className="text-teal-800 dark:text-teal-400 font-mono font-semibold text-sm tabular-nums">{totalAmount.toLocaleString('ru-RU')} ₸</strong>
            </span>
          </div>

          <button
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#151f2b] hover:bg-slate-50 dark:hover:bg-[#1a2635] border border-slate-200 dark:border-slate-700 rounded-full transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
            <span>Добавить строку</span>
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f141c] text-slate-500 dark:text-slate-400 font-medium">
                <th className="py-3 px-4 w-10 text-center">#</th>
                <th className="py-3 px-3 min-w-[170px]">Студент (ФИО)</th>
                <th className="py-3 px-3 min-w-[130px]">ИИН (12 цифр)</th>
                <th className="py-3 px-3 min-w-[160px]">Университет РК</th>
                <th className="py-3 px-3 min-w-[150px]">Категория сбора</th>
                <th className="py-3 px-3 min-w-[240px]">Детализация</th>
                <th className="py-3 px-3 min-w-[110px] text-right">Сумма (₸)</th>
                <th className="py-3 px-3 min-w-[130px]">Банк</th>
                <th className="py-3 px-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-[#141d27] transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-400 dark:text-slate-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={row.studentName}
                      onChange={e => handleRowChange(idx, 'studentName', e.target.value)}
                      placeholder="Алихан Байтурсынов"
                      className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs font-normal"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      maxLength={12}
                      value={row.iin}
                      onChange={e => handleRowChange(idx, 'iin', e.target.value.replace(/\D/g, ''))}
                      placeholder="040312501982"
                      className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs tabular-nums"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={row.universityId}
                      onChange={e => handleRowChange(idx, 'universityId', e.target.value)}
                      className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs font-normal"
                    >
                      {UNIVERSITIES.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.abbreviation}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={row.purposeCategory}
                      onChange={e => handleRowChange(idx, 'purposeCategory', e.target.value)}
                      className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs font-normal"
                    >
                      {Object.entries(PURPOSE_CATEGORIES_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={row.purposeDetail}
                      onChange={e => handleRowChange(idx, 'purposeDetail', e.target.value)}
                      placeholder="Например: Дом студентов №7, комната 412"
                      className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs font-normal"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={row.amountKZT}
                      onChange={e => handleRowChange(idx, 'amountKZT', Number(e.target.value))}
                      className="w-full bg-teal-50/80 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800/80 rounded-lg px-2 py-1.5 text-right font-mono text-teal-900 dark:text-teal-200 font-semibold focus:outline-none focus:border-teal-600 text-xs tabular-nums"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={row.paymentMethod}
                      onChange={e => handleRowChange(idx, 'paymentMethod', e.target.value)}
                      className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs font-normal"
                    >
                      {Object.entries(PAYMENT_METHODS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.short}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Удалить строку"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#fbfcfc] dark:bg-[#121922] border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Все строки формируют единое дерево Меркла и упаковываются в Блок #{latestBlock.index + 1}.
          </div>

          <button
            onClick={handleCommitBatchToBlockchain}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-7 py-3 text-xs font-semibold text-white bg-[#0b2b2a] hover:bg-[#123e3c] dark:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-50 rounded-full transition-all shadow-sm cursor-pointer active:scale-95"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>{stepProgress || 'Формирование блока...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Зафиксировать {rows.length} транзакций в Блокчейн</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
