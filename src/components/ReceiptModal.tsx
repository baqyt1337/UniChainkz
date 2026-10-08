/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UniversityTransaction } from '../types/blockchain';
import { PURPOSE_CATEGORIES_CONFIG, PAYMENT_METHODS_CONFIG, UNIVERSITIES } from '../data/universities';
import { X, Printer, Copy, Check, ShieldCheck, ExternalLink, Globe } from 'lucide-react';

interface ReceiptModalProps {
  transaction: UniversityTransaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!transaction) return null;

  const uni = UNIVERSITIES.find(u => u.id === transaction.universityId);
  const purposeCfg = PURPOSE_CATEGORIES_CONFIG[transaction.purposeCategory];
  const bankCfg = PAYMENT_METHODS_CONFIG[transaction.paymentMethod];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  // QR Code generator URL using public standard API or stylized SVG
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `https://unichain.kz/verify?tx=${transaction.id}&hash=${transaction.txHash}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-xl overflow-hidden my-8 transition-colors">
        
        {/* Modal Top Actions (Hidden in print) */}
        <div className="flex items-center justify-between p-6 bg-[#fbfcfc] dark:bg-[#121922] border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300">
            <ShieldCheck className="h-4 w-4 text-teal-700 dark:text-teal-400" />
            <span>Электронный сертификат транзакции · UniChain.kz</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#0b2b2a] hover:bg-[#123e3c] dark:bg-teal-700 dark:hover:bg-teal-600 rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
              title="Распечатать или сохранить в PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Печать (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1a2430] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Body */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 font-sans space-y-6">
          
          {/* Header of the Official Receipt */}
          <div className="text-center pb-6 border-b border-slate-100 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
              <span>ЕДИНЫЙ РЕЕСТР ПЛАТЕЖЕЙ ВУЗОВ РК · БЛОК #{transaction.blockNumber}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Официальное подтверждение платежа
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Министерство науки и высшего образования Республики Казахстан
            </p>
          </div>

          {/* Amount Highlight */}
          <div className="bg-[#edf7f5] p-5 rounded-2xl border border-[#d2ebe4] flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Сумма подтвержденного сбора</div>
              <div className="text-3xl font-semibold text-teal-900 font-mono tracking-tight tabular-nums">
                {transaction.amountKZT.toLocaleString('ru-RU')} ₸
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Статус в блокчейне</div>
              <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider flex items-center gap-1 justify-end">
                <span>●</span>
                <span>ПОДТВЕРЖДЕНО</span>
              </div>
            </div>
          </div>

          {/* Structured Details */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Идентификатор TXID:</span>
              <span className="col-span-2 font-mono text-teal-800 font-semibold flex items-center justify-between">
                <span>{transaction.id}</span>
                <button
                  onClick={() => handleCopy(transaction.id, 'txid')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer print:hidden"
                >
                  {copiedField === 'txid' ? <Check className="h-3 w-3 text-teal-700" /> : <Copy className="h-3 w-3" />}
                </button>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Плательщик (Студент):</span>
              <span className="col-span-2 font-semibold text-slate-900">
                {transaction.studentName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">ИИН плательщика:</span>
              <span className="col-span-2 font-mono text-slate-800">
                {transaction.iin} (Студенческий ID: {transaction.studentId})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Университет (Получатель):</span>
              <span className="col-span-2 text-slate-800">
                <strong>{transaction.universityName}</strong>
                <div className="text-slate-500 text-[11px] mt-0.5">{transaction.faculty}</div>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Назначение платежа:</span>
              <span className="col-span-2 text-slate-800">
                <span className="font-semibold text-slate-900 block">
                  {purposeCfg?.label || transaction.purposeCategory}
                </span>
                <span className="text-slate-600 block mt-0.5">
                  {transaction.purposeDetail}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Канал оплаты:</span>
              <span className="col-span-2 text-slate-800">
                {bankCfg?.name || transaction.paymentMethod} (Референс RRN: <span className="font-mono">{transaction.bankReference}</span>)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Дата и время:</span>
              <span className="col-span-2 text-slate-700 font-mono">
                {new Date(transaction.timestamp).toLocaleString('ru-RU')} (UTC+5 Казахстан)
              </span>
            </div>
          </div>

          {/* Solana Devnet Memo Verification Block if present */}
          {transaction.solanaSignature && (
            <div className="p-4 bg-teal-50/70 border border-teal-200/90 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-teal-900">
                  <Globe className="h-4 w-4 text-teal-700" />
                  <span>Зафиксировано в Solana Devnet (Memo Program)</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-semibold">
                  Devnet On-Chain
                </span>
              </div>

              {transaction.solanaMemo && (
                <div className="text-[11px] text-teal-800 font-mono bg-white/80 p-2 rounded-lg border border-teal-100 break-words">
                  <span className="text-slate-400 font-sans block text-[10px] mb-0.5">Текст Memo:</span>
                  {transaction.solanaMemo}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="font-mono text-[10px] text-slate-500 truncate max-w-[280px]">
                  TX: {transaction.solanaSignature}
                </div>
                <a
                  href={`https://explorer.solana.com/tx/${transaction.solanaSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 underline print:hidden"
                >
                  <span>Solana Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* Cryptographic Seal & QR Verification */}
          <div className="p-4 bg-[#f8faf9] rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 shrink-0 shadow-2xs">
              <img
                src={qrDataUrl}
                alt="QR-код проверки транзакции"
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="text-[9px] text-slate-600 font-mono text-center font-bold mt-1">
                VERIFY TX
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono text-slate-600 overflow-hidden w-full">
              <div className="text-xs font-semibold text-slate-900 font-sans flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-700" />
                <span>Цифровой криптографический отпечаток</span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                Хеш транзакции (SHA-256):
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 break-all select-all text-teal-900 text-[10px]">
                {transaction.txHash}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                Запись не может быть изменена или удалена задним числом.
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#fbfcfc] dark:bg-[#121922] border-t border-slate-100 dark:border-slate-800 flex items-center justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#151f2b] hover:bg-slate-50 dark:hover:bg-[#1c293a] border border-slate-200 dark:border-slate-700 rounded-full transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
