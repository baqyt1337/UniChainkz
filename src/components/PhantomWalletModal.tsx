/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Check,
  Copy,
  Wallet,
  LogOut,
  AlertCircle,
  RefreshCw,
  Coins,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import {
  getPhantomSolanaProvider,
  connectPhantomWallet,
  disconnectPhantomWallet,
  requestDevnetAirdrop,
  getStoredSolanaRecords,
  SolanaMemoRecord
} from '../utils/solana';
import { SolanaRecordsList } from './SolanaRecordsList';

interface PhantomWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  walletBalance: number | null;
  isBalanceLoading: boolean;
  initialError?: string | null;
  onConnectSuccess: (address: string) => void;
  onDisconnect: () => void;
  onRefreshBalance: () => Promise<void>;
}

export const PhantomWalletModal: React.FC<PhantomWalletModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  walletBalance,
  isBalanceLoading,
  initialError,
  onConnectSuccess,
  onDisconnect,
  onRefreshBalance
}) => {
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);
  const [memoRecords, setMemoRecords] = useState<SolanaMemoRecord[]>([]);

  // Sync initial error if provided
  React.useEffect(() => {
    if (initialError) {
      setErrorMessage(initialError);
    }
  }, [initialError]);

  React.useEffect(() => {
    if (isOpen) {
      setMemoRecords(getStoredSolanaRecords());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setConnecting(true);
    setErrorMessage(null);

    const result = await connectPhantomWallet();

    if (result.success) {
      onConnectSuccess(result.address);
      setConnecting(false);
      setErrorMessage(null);
    } else {
      setConnecting(false);
      setErrorMessage(result.message);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleAirdrop = async () => {
    if (!walletAddress || isAirdropping) return;
    setIsAirdropping(true);
    setAirdropSuccess(false);
    const ok = await requestDevnetAirdrop(walletAddress);
    setIsAirdropping(false);
    if (ok) {
      setAirdropSuccess(true);
      setTimeout(() => setAirdropSuccess(false), 3000);
      await onRefreshBalance();
    } else {
      setErrorMessage('Лимит крана devnet исчерпан. Попробуйте позже.');
    }
  };

  const isPhantomNotFound = errorMessage === 'Откройте приложение в отдельной вкладке с установленным Phantom';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm font-sans animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#fbfcfc] dark:bg-[#121922] border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 flex items-center justify-center text-teal-800 dark:text-teal-300">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Phantom Wallet · Solana Devnet
            </span>
          </div>
          <button
            onClick={() => {
              setErrorMessage(null);
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1a2430] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-800 dark:text-slate-100">
          
          {/* Error / Not Found Banner */}
          {errorMessage && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs font-medium leading-relaxed">
                  {errorMessage}
                </div>
              </div>

              {isPhantomNotFound && (
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleOpenInNewTab}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>Открыть в отдельной вкладке</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href="https://phantom.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#172230] border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-medium hover:underline"
                  >
                    <span>Установить Phantom</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {walletAddress ? (
            /* Connected State */
            <div className="space-y-4">
              
              {/* Balance & Network Box */}
              <div className="p-4 bg-[#edf7f5] dark:bg-[#0c1f23] border border-[#d2ebe4] dark:border-[#173d44] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-teal-800 dark:text-teal-300 font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                    Подключено к Phantom
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-teal-100 dark:bg-teal-900/60 rounded text-teal-800 dark:text-teal-300 font-semibold uppercase">
                    Solana Devnet
                  </span>
                </div>

                {/* Devnet SOL Balance fetched via @solana/web3.js */}
                <div className="pt-1 flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                      Баланс кошелька (Devnet SOL)
                    </div>
                    <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {isBalanceLoading ? (
                        <span className="animate-pulse text-slate-400 text-lg">Загрузка...</span>
                      ) : walletBalance !== null ? (
                        `${walletBalance.toFixed(3)} SOL`
                      ) : (
                        '0.00 SOL'
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onRefreshBalance()}
                    disabled={isBalanceLoading}
                    className="p-2 text-teal-700 dark:text-teal-400 hover:bg-teal-100/60 dark:hover:bg-teal-900/60 rounded-lg transition-colors cursor-pointer"
                    title="Обновить баланс через @solana/web3.js"
                  >
                    <RefreshCw className={`h-4 w-4 ${isBalanceLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Address Box */}
                <div className="pt-2 flex items-center justify-between bg-white dark:bg-[#0f151d] p-3 rounded-xl border border-[#d4ece5] dark:border-slate-800">
                  <div className="truncate mr-2 font-mono text-xs">
                    <span className="text-slate-500 mr-1">Адрес:</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
                      ({walletAddress.slice(0, 8)}...{walletAddress.slice(-6)})
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(walletAddress)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer shrink-0"
                    title="Скопировать полный адрес"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Devnet Utilities: Airdrop test SOL */}
              <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-[#121922] rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    Нужны тестовые SOL?
                  </span>
                </div>
                <button
                  onClick={handleAirdrop}
                  disabled={isAirdropping}
                  className="px-3 py-1 bg-white dark:bg-[#172230] border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-teal-800 dark:text-teal-300 rounded-lg text-[11px] font-semibold cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
                >
                  {isAirdropping ? 'Запрос Airdrop...' : airdropSuccess ? '✓ +1 SOL получен' : 'Кран +1 SOL'}
                </button>
              </div>

              {/* Solana Explorer link */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Обозреватель сети:</span>
                <a
                  href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-800 dark:text-teal-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>Solana Explorer (Devnet)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={async () => {
                  await disconnectPhantomWallet();
                  onDisconnect();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 rounded-full transition-colors cursor-pointer font-medium text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Отключить кошелек</span>
              </button>

              {/* Solana Memo Records History */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <SolanaRecordsList
                  records={memoRecords}
                  title="Ваши записи в блокчейне (Solana Memo)"
                  compact
                />
              </div>
            </div>
          ) : (
            /* Not Connected State */
            <div className="space-y-5">
              <div className="text-center py-2 space-y-2">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 flex items-center justify-center text-teal-800 dark:text-teal-300 shadow-2xs">
                  <Wallet className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Подключение кошелька Phantom
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs mx-auto font-normal">
                  Подключение к Solana Devnet через <code className="font-mono text-teal-800 dark:text-teal-300">window.phantom.solana</code> с отображением баланса SOL через @solana/web3.js.
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#0b2b2a] hover:bg-[#123e3c] dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold text-xs rounded-full transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-95"
              >
                <Wallet className="h-4 w-4" />
                <span>{connecting ? 'Подключение к Phantom...' : 'Подключить кошелёк'}</span>
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>Нет кошелька Phantom?</span>
                <a
                  href="https://phantom.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-800 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>phantom.app</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
