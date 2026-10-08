/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BlockchainBlock, UniversityTransaction } from '../types/blockchain';
import { verifyBlockchainIntegrity } from '../utils/crypto';
import { ShieldCheck, Layers, Link2, CheckCircle2, AlertTriangle, FileText, ChevronRight, Hash, Clock, Server } from 'lucide-react';
import { PURPOSE_CATEGORIES_CONFIG } from '../data/universities';

interface BlockchainExplorerProps {
  blocks: BlockchainBlock[];
  onViewReceipt: (tx: UniversityTransaction) => void;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({ blocks, onViewReceipt }) => {
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(blocks.length > 1 ? 1 : 0);
  const [verificationResult, setVerificationResult] = useState<{
    tested: boolean;
    isValid: boolean;
    message?: string;
  }>({ tested: false, isValid: true });

  const handleAuditChain = () => {
    const res = verifyBlockchainIntegrity(blocks);
    setVerificationResult({
      tested: true,
      isValid: res.isValid,
      message: res.isValid
        ? `Все ${blocks.length} блоков и все деревья Меркла полностью валидны. Разрывов цепи нет.`
        : `Нарушение целостности в блоке #${res.failedBlockIndex}: ${res.reason}`
    });
  };

  const selectedBlock = blocks.find(b => b.index === selectedBlockIndex) || blocks[blocks.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Banner with Audit Trigger */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Децентрализованный реестр Казахстана · Консенсус Proof-of-Authority</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Обозреватель Блоков (EduChain Explorer)
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Каждый блок фиксирует неизменяемый хеш предыдущего блока, Merkle Root транзакций студентов 
              и валидаторскую цифровую подпись клирингового узла.
            </p>
          </div>

          <button
            onClick={handleAuditChain}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
            <span>Аудит целостности реестра</span>
          </button>
        </div>

        {verificationResult.tested && (
          <div className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
            verificationResult.isValid
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            {verificationResult.isValid ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{verificationResult.message}</span>
          </div>
        )}
      </div>

      {/* Visual Chain of Blocks Cards */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Цепочка блоков в реальном времени (от старых к новым)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blocks.map((block, idx) => {
            const isSelected = selectedBlockIndex === block.index;
            return (
              <div
                key={block.index}
                onClick={() => setSelectedBlockIndex(block.index)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      {block.index === 0 ? 'Genesis Block #0' : `Блок #${block.index}`}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                    {block.transactions.length} транзакций
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                  <div className="truncate">
                    <span className="text-slate-500">Hash: </span>
                    <span className="text-slate-300">{block.hash.slice(0, 16)}...{block.hash.slice(-8)}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Prev: </span>
                    <span className="text-slate-400">{block.previousHash.slice(0, 12)}...</span>
                  </div>
                  <div className="text-slate-500 font-sans text-[10px] mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(block.timestamp).toLocaleString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Block Detailed Inspection */}
      {selectedBlock && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-emerald-400">Детальный паспорт блока</span>
              <h3 className="text-lg font-bold text-white">
                {selectedBlock.index === 0 ? 'Genesis Block (#0)' : `Блок #${selectedBlock.index}`}
              </h3>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              Timestamp: {selectedBlock.timestamp}
            </div>
          </div>

          {/* Cryptographic Hashes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
              <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-sans">
                <Hash className="h-3.5 w-3.5 text-emerald-400" />
                <span>Хеш текущего блока (SHA-256):</span>
              </div>
              <div className="text-emerald-300 break-all select-all">{selectedBlock.hash}</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
              <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-sans">
                <Link2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Хеш предыдущего блока (Previous Hash):</span>
              </div>
              <div className="text-cyan-300 break-all select-all">{selectedBlock.previousHash}</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
              <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-sans">
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                <span>Корень дерева Меркла (Merkle Root):</span>
              </div>
              <div className="text-amber-300 break-all select-all">{selectedBlock.merkleRoot}</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
              <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-sans">
                <Server className="h-3.5 w-3.5 text-slate-400" />
                <span>Узел валидатора и Nonce:</span>
              </div>
              <div className="text-slate-300 break-all font-sans">
                {selectedBlock.validatorNode} · Nonce: {selectedBlock.nonce}
              </div>
            </div>
          </div>

          {/* Transactions Inside This Block */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">
                Транзакции внутри блока ({selectedBlock.transactions.length})
              </h4>
              <span className="text-xs text-slate-400">
                Сумма по блоку: <strong className="text-emerald-400 font-mono tabular-nums">{selectedBlock.transactions.reduce((s, t) => s + t.amountKZT, 0).toLocaleString('ru-RU')} ₸</strong>
              </span>
            </div>

            {selectedBlock.transactions.length === 0 ? (
              <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-lg text-center text-xs text-slate-500">
                В Genesis-блоке отсутствуют пользовательские транзакции (инициализация протокола).
              </div>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/50">
                {selectedBlock.transactions.map((tx, idx) => (
                  <div key={tx.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-800/30 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-semibold">{tx.id}</span>
                        <span className="text-slate-500">·</span>
                        <span className="font-medium text-white">{tx.studentName}</span>
                        <span className="text-slate-400 font-mono">({tx.iin})</span>
                      </div>
                      <div className="text-slate-300 text-[11px]">
                        <strong>{tx.universityName}</strong> — {PURPOSE_CATEGORIES_CONFIG[tx.purposeCategory]?.label}: {tx.purposeDetail}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="font-bold text-white font-mono tabular-nums">
                        {tx.amountKZT.toLocaleString('ru-RU')} ₸
                      </span>
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Чек</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
