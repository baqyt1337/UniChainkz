/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SolanaMemoRecord } from '../utils/solana';
import { ExternalLink, Copy, Check, Clock, FileText, Globe } from 'lucide-react';

interface SolanaRecordsListProps {
  records: SolanaMemoRecord[];
  title?: string;
  compact?: boolean;
}

export const SolanaRecordsList: React.FC<SolanaRecordsListProps> = ({
  records,
  title = 'История записей в блокчейне (Solana Devnet Memo)',
  compact = false
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatRecordTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-[#121922] border border-slate-200/80 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400 font-sans">
        <Globe className="h-6 w-6 mx-auto mb-2 text-slate-400 opacity-60" />
        <p className="font-medium text-slate-700 dark:text-slate-300">Записей в блокчейне пока нет</p>
        <p className="mt-1 text-[11px] text-slate-400">
          После подтверждения любой оплаты транзакция автоматически записывается в сеть Solana devnet через инструкцию Memo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            {title}
          </h4>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-mono font-medium">
          {records.length} {records.length === 1 ? 'запись' : records.length < 5 ? 'записи' : 'записей'}
        </span>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {records.map((rec) => (
          <div
            key={rec.signature}
            className={`p-3.5 bg-white dark:bg-[#111722] border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2 text-xs transition-colors hover:border-teal-300 dark:hover:border-teal-800 ${
              compact ? 'text-[11px]' : ''
            }`}
          >
            {/* Memo Text */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <FileText className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Текст:</span>
                  <div className="font-mono text-slate-800 dark:text-slate-200 text-xs font-medium break-all select-all">
                    {rec.memoText}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCopy(rec.memoText, `text-${rec.signature}`)}
                className="text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 p-1 shrink-0 cursor-pointer"
                title="Скопировать текст"
              >
                {copiedId === `text-${rec.signature}` ? (
                  <Check className="h-3.5 w-3.5 text-teal-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Time & Explorer Link */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Clock className="h-3 w-3 shrink-0" />
                <span>Время:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {formatRecordTime(rec.timestamp)}
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px] hidden sm:inline" title={rec.signature}>
                  {rec.signature.slice(0, 6)}...{rec.signature.slice(-6)}
                </span>
                <a
                  href={rec.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-200 hover:underline cursor-pointer"
                >
                  <span>Посмотреть запись</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
