/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PaymentMethod, BlockchainBlock, UniversityTransaction } from '../types/blockchain';
import { UNIVERSITIES, PAYMENT_METHODS_CONFIG } from '../data/universities';
import { STUDENT_FEE_OPTIONS } from '../data/feeOptions';
import { calculateBlockHash, calculateMerkleRoot, calculateTransactionHash, generateBankRef, generateTXID } from '../utils/crypto';
import {
  sendMemoTransaction,
  getPhantomSolanaProvider,
  isPhantomInstalled,
  SolanaMemoRecord,
  getStoredSolanaRecords,
  storeSolanaRecord
} from '../utils/solana';
import { SolanaRecordsList } from './SolanaRecordsList';
import {
  X,
  ShieldCheck,
  AlertCircle,
  Home,
  Lock,
  Loader2,
  Wallet,
  ExternalLink,
  CheckCircle2,
  FileText,
  RotateCcw
} from 'lucide-react';

interface SinglePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestBlock: BlockchainBlock;
  onPaymentRegistered: (newBlock: BlockchainBlock, createdTx: UniversityTransaction) => void;
  walletAddress?: string | null;
}

export const SinglePaymentModal: React.FC<SinglePaymentModalProps> = ({
  isOpen,
  onClose,
  latestBlock,
  onPaymentRegistered,
  walletAddress
}) => {
  const [studentName, setStudentName] = useState('');
  const [iin, setIin] = useState('');
  const [studentId, setStudentId] = useState(`ST-KZ-${Math.floor(10000 + Math.random() * 90000)}`);
  const [universityId, setUniversityId] = useState(UNIVERSITIES[0].id);
  
  // Predefined select dropdown with auto-calculated readonly amount
  const [selectedFeeOptionId, setSelectedFeeOptionId] = useState<string>(STUDENT_FEE_OPTIONS[0].id);

  // Dormitory specific fields if dormitory is chosen
  const [selectedDorm, setSelectedDorm] = useState(UNIVERSITIES[0].dormitories[0] || '');
  const [roomNumber, setRoomNumber] = useState('314');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('KASPI_PAY');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowOfflineFallback, setAllowOfflineFallback] = useState(false);

  // Success state after on-chain recording
  const [successRecord, setSuccessRecord] = useState<SolanaMemoRecord | null>(null);
  const [createdTxData, setCreatedTxData] = useState<{ block: BlockchainBlock; tx: UniversityTransaction } | null>(null);
  const [allRecords, setAllRecords] = useState<SolanaMemoRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAllRecords(getStoredSolanaRecords());
      setSuccessRecord(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUni = UNIVERSITIES.find(u => u.id === universityId) || UNIVERSITIES[0];
  const currentFeeOption = STUDENT_FEE_OPTIONS.find(f => f.id === selectedFeeOptionId) || STUDENT_FEE_OPTIONS[0];

  const handleUniversityChange = (newUniId: string) => {
    setUniversityId(newUniId);
    const uni = UNIVERSITIES.find(u => u.id === newUniId);
    if (uni && uni.dormitories.length > 0) {
      setSelectedDorm(uni.dormitories[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentName.trim()) {
      setErrorMsg('Пожалуйста, введите имя и фамилию студента.');
      return;
    }
    if (!iin.trim() || iin.trim().length !== 12) {
      setErrorMsg('ИИН должен состоять ровно из 12 цифр.');
      return;
    }

    let detailedPurpose = currentFeeOption.label;
    if (currentFeeOption.id === 'dorm_semester') {
      detailedPurpose = `Общежитие (Семестр) — ${selectedDorm || 'Студенческий дом'}, комната ${roomNumber || '101'}`;
    }

    const txId = generateTXID(currentUni.abbreviation);
    const bankRef = generateBankRef(paymentMethod);
    const newBlockIndex = latestBlock.index + 1;
    const nowIso = new Date().toISOString();

    // Prepare memo string: «[что записываем]»
    const memoText = `UniChain.kz | ${detailedPurpose} | Студент: ${studentName.trim()} | ИИН: ${iin.trim()} | ВУЗ: ${currentUni.abbreviation} | Сумма: ${currentFeeOption.amount.toLocaleString('ru-RU')} ₸ | TXID: ${txId}`;

    setIsSubmitting(true);

    let solanaSignature: string | undefined;
    let recordedMemo: string | undefined;

    // Check Phantom availability
    const provider = getPhantomSolanaProvider();
    if (!provider && !allowOfflineFallback) {
      setIsSubmitting(false);
      setErrorMsg('Откройте приложение в отдельной вкладке с установленным Phantom');
      return;
    }

    if (provider) {
      try {
        const solRes = await sendMemoTransaction(memoText);
        if (!solRes.success) {
          setIsSubmitting(false);
          setErrorMsg(solRes.error || 'Ошибка при отправке Memo транзакции в Solana Devnet');
          return;
        }
        solanaSignature = solRes.signature;
        recordedMemo = solRes.memoText;
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMsg(err?.message || 'Не удалось выполнить транзакцию в Solana Devnet');
        return;
      }
    }

    const baseTx: Omit<UniversityTransaction, 'txHash'> = {
      id: txId,
      studentName: studentName.trim(),
      iin: iin.trim(),
      studentId: studentId.trim(),
      universityId: currentUni.id,
      universityName: currentUni.name,
      faculty: currentUni.faculties[0] || 'Основной факультет',
      purposeCategory: currentFeeOption.category,
      purposeDetail: detailedPurpose,
      academicYear: '2025-2026',
      amountKZT: currentFeeOption.amount,
      paymentMethod,
      bankReference: bankRef,
      timestamp: nowIso,
      blockNumber: newBlockIndex,
      status: 'CONFIRMED',
      solanaSignature,
      solanaMemo: recordedMemo
    };

    const txHash = calculateTransactionHash(baseTx);
    const createdTx: UniversityTransaction = {
      ...baseTx,
      txHash
    };

    const merkleRoot = calculateMerkleRoot([txHash]);
    const nonce = Math.floor(1000 + Math.random() * 9000);
    const validatorNode = solanaSignature
      ? `Solana Devnet Memo Node // TX: ${solanaSignature.slice(0, 10)}...`
      : `${currentUni.abbreviation} Node Validator // Консенсус РК`;

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
      transactions: [createdTx],
      previousHash: latestBlock.hash,
      merkleRoot,
      nonce,
      validatorNode,
      hash: blockHash
    };

    const finalRecord: SolanaMemoRecord = {
      id: solanaSignature || txId,
      signature: solanaSignature || txId,
      memoText: recordedMemo || memoText,
      timestamp: nowIso,
      explorerUrl: `https://explorer.solana.com/tx/${solanaSignature || txId}?cluster=devnet`,
      walletAddress: provider?.publicKey?.toString() || walletAddress || undefined,
      studentName: studentName.trim(),
      iin: iin.trim(),
      amountKZT: currentFeeOption.amount
    };

    const updatedRecords = storeSolanaRecord(finalRecord);
    setAllRecords(updatedRecords);
    setSuccessRecord(finalRecord);
    setCreatedTxData({ block: newBlock, tx: createdTx });
    setIsSubmitting(false);

    // Register block and transaction in app state
    onPaymentRegistered(newBlock, createdTx);
  };

  // Render Success Screen when transaction is recorded to blockchain
  if (successRecord) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm overflow-y-auto font-sans">
        <div className="relative w-full max-w-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden my-8 transition-colors">
          
          {/* Success Header */}
          <div className="flex items-center justify-between p-6 bg-emerald-50/70 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60">
            <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-semibold text-base">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Записано в блокчейн</span>
            </div>
            <button
              onClick={() => {
                setSuccessRecord(null);
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1a2430] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Confirmation Banner */}
            <div className="p-5 bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    Транзакция подтверждена в сети Solana Devnet
                  </span>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Инструкция Memo успешно добавлена в блокчейн.
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold shrink-0">
                  CONFIRMED
                </span>
              </div>

              {/* Recorded Memo Text */}
              <div className="p-3 bg-white dark:bg-[#111722] rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Записанный текст (Memo):</span>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 font-medium break-all select-all">
                  {successRecord.memoText}
                </p>
              </div>

              {/* Required "Посмотреть запись" link */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]" title={successRecord.signature}>
                  TX: {successRecord.signature}
                </div>
                <a
                  href={`https://explorer.solana.com/tx/${successRecord.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Посмотреть запись</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Ниже веди список всех записей: текст, время, ссылка */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <SolanaRecordsList
                records={allRecords}
                title="Список всех записей в блокчейне"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSuccessRecord(null);
                  setStudentName('');
                  setIin('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#151f2b] rounded-full transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Новый платеж</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessRecord(null);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#0b2b2a] hover:bg-[#123e3c] dark:bg-teal-700 dark:hover:bg-teal-600 rounded-full transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Открыть чек / Квитанцию</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-xl overflow-hidden my-8 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-[#fbfcfc] dark:bg-[#121922] border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300">
            <ShieldCheck className="h-4 w-4 text-teal-700 dark:text-teal-400" />
            <span>Оплата университетского сбора студента</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1a2430] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-700 dark:text-rose-300 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
              {errorMsg.includes('Phantom') && (
                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                  <a
                    href={typeof window !== 'undefined' ? window.location.href : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#151c27] border border-rose-300 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-200 hover:bg-rose-100 font-semibold"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Открыть в отдельной вкладке</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setAllowOfflineFallback(true);
                      setErrorMsg(null);
                    }}
                    className="px-2.5 py-1 bg-rose-100/70 dark:bg-rose-900/40 rounded-lg text-rose-900 dark:text-rose-200 hover:bg-rose-200/80 font-medium cursor-pointer"
                  >
                    Записать в локальный реестр SHA-256
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
              ФИО студента *
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="Например: Бақыт Ерланов"
              className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs font-normal"
            />
          </div>

          {/* IIN and Student ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                ИИН (12 цифр) *
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={iin}
                onChange={e => setIin(e.target.value.replace(/\D/g, ''))}
                placeholder="040812501234"
                className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                Студенческий ID / Билет
              </label>
              <input
                type="text"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs"
              />
            </div>
          </div>

          {/* University */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
              Университет РК *
            </label>
            <select
              value={universityId}
              onChange={e => handleUniversityChange(e.target.value)}
              className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs font-medium"
            >
              {UNIVERSITIES.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.city})
                </option>
              ))}
            </select>
          </div>

          {/* Predefined Dropdown for Purpose */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
              Назначение платежа (Курс, семестр или общежитие) *
            </label>
            <select
              value={selectedFeeOptionId}
              onChange={e => setSelectedFeeOptionId(e.target.value)}
              className="w-full bg-[#edf7f5] dark:bg-[#0c1f23] border border-teal-200 dark:border-[#173d44] rounded-xl px-4 py-2.5 text-teal-900 dark:text-teal-200 font-semibold focus:outline-none focus:border-teal-600 text-xs"
            >
              {STUDENT_FEE_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id} className="text-slate-900 font-normal">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* If Dormitory is chosen, show room and dorm building */}
          {currentFeeOption.id === 'dorm_semester' && (
            <div className="p-4 bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-semibold">
                <Home className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                <span>Данные общежития:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">Корпус / Общежитие</label>
                  <select
                    value={selectedDorm}
                    onChange={e => setSelectedDorm(e.target.value)}
                    className="w-full bg-white dark:bg-[#0f151d] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs"
                  >
                    {currentUni.dormitories.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">Комната</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    placeholder="412"
                    className="w-full bg-white dark:bg-[#0f151d] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Readonly Amount & Bank Gateway */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-700 dark:text-slate-300 font-medium">
                  Сумма к оплате
                </label>
                <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Автосумма
                </span>
              </div>
              <input
                type="text"
                readOnly
                value={`${currentFeeOption.amount.toLocaleString('ru-RU')} ₸`}
                className="w-full bg-teal-50/80 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 rounded-xl px-4 py-2.5 text-teal-900 dark:text-teal-200 font-semibold font-mono text-base cursor-not-allowed select-none tabular-nums"
                title="Сумма фиксируется автоматически на основе выбранного курса или общежития"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                Банк / Шлюз
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#f8faf9] dark:bg-[#131b24] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-[#172230] text-xs font-medium"
              >
                {Object.entries(PAYMENT_METHODS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Solana Devnet Memo Info Strip */}
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Сеть: <strong className="text-slate-700 dark:text-slate-200">Solana Devnet</strong></span>
            </span>
            <span className="font-mono text-[10px] text-teal-700 dark:text-teal-400">
              Memo: MemoSq4g...
            </span>
          </div>

          {/* Submitting Progress Indicator */}
          {isSubmitting && (
            <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-2xl flex items-center justify-center gap-2.5 text-xs text-teal-800 dark:text-teal-300 animate-pulse font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-teal-600 dark:text-teal-400" />
              <span>Записываем в блокчейн…</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 text-xs font-semibold text-white bg-[#0b2b2a] hover:bg-[#123e3c] dark:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-75 rounded-full transition-all shadow-sm cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-teal-300" />
                  <span>Записываем в блокчейн…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Оплатить и зафиксировать в Блокчейн</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
