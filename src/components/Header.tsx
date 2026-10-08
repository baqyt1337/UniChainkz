/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Wallet, Shield, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'ledger' | 'batch';
  setActiveTab: (tab: 'home' | 'ledger' | 'batch') => void;
  onOpenSingleModal: () => void;
  onOpenBatchModal: () => void;
  walletAddress: string | null;
  walletBalance: number | null;
  isBalanceLoading: boolean;
  onConnectWallet: () => void;
  onOpenWalletModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSingleModal,
  onOpenBatchModal,
  walletAddress,
  walletBalance,
  isBalanceLoading,
  onConnectWallet,
  onOpenWalletModal,
  isDarkMode,
  onToggleDarkMode
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1015]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Mark (matching Synflow aesthetic with soft teal icon) */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          title="На главную UniChain.kz"
        >
          <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-100 dark:border-teal-800/60 flex items-center justify-center text-teal-700 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/60 transition-colors">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
              UniChain
            </span>
            <span className="ml-1 text-[11px] font-medium text-teal-700 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/80 px-1.5 py-0.5 rounded-md border border-teal-100/80 dark:border-teal-800/80">
              kz
            </span>
          </div>
        </button>

        {/* Clean Slender Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab('home')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'text-teal-800 dark:text-teal-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Главная
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'ledger'
                ? 'text-teal-800 dark:text-teal-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Реестр по ИИН
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'batch'
                ? 'text-teal-800 dark:text-teal-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Пакетная регистрация (10+)
          </button>
        </nav>

        {/* Right Actions: Dark Mode Toggle, Phantom Wallet & Deep Teal Pill CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Wallet connect button / Connected state */}
          {walletAddress ? (
            <button
              onClick={onOpenWalletModal}
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 border-teal-200 dark:border-teal-800/80 hover:bg-teal-100/80 dark:hover:bg-teal-900/60 shadow-2xs active:scale-95"
              title="Управление кошельком Phantom (Solana Devnet)"
            >
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="font-mono font-semibold">
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-1 pl-1.5 border-l border-teal-200 dark:border-teal-800 text-[11px] font-mono text-teal-800 dark:text-teal-300 font-semibold">
                {isBalanceLoading ? (
                  <span className="animate-pulse text-slate-400">... SOL</span>
                ) : walletBalance !== null ? (
                  <span>{walletBalance.toFixed(2)} SOL</span>
                ) : (
                  <span>0.00 SOL</span>
                )}
                <span className="text-[9px] uppercase font-sans tracking-tight px-1 py-0.2 bg-teal-200/60 dark:bg-teal-900/80 rounded text-teal-800 dark:text-teal-300">
                  devnet
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={onConnectWallet}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer bg-white dark:bg-[#121820] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 hover:border-teal-600 dark:hover:border-teal-500 hover:text-teal-900 dark:hover:text-teal-200 hover:bg-teal-50/50 dark:hover:bg-teal-950/40 shadow-2xs active:scale-95 whitespace-nowrap"
              title="Подключить Phantom кошелек"
            >
              <Wallet className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
              <span className="hidden sm:inline">Подключить кошелёк</span>
              <span className="sm:hidden">Кошелёк</span>
            </button>
          )}

          {/* Deep Forest Teal Pill Button */}
          <button
            onClick={onOpenSingleModal}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs font-semibold text-white bg-[#0b2b2a] hover:bg-[#123e3c] dark:bg-teal-700 dark:hover:bg-teal-600 rounded-full transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Новый платеж</span>
            <span className="sm:hidden">Оплата</span>
          </button>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
            title={isDarkMode ? 'Включить светлую тему' : 'Включить темный режим'}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#121820] text-slate-600 dark:text-amber-300 hover:text-slate-900 dark:hover:text-amber-200 hover:bg-slate-50 dark:hover:bg-[#182330] transition-all cursor-pointer shadow-2xs group focus:outline-none focus:ring-2 focus:ring-teal-500/20 active:scale-95"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 transition-transform group-hover:rotate-45 text-amber-300" />
            ) : (
              <Moon className="h-4 w-4 transition-transform group-hover:-rotate-12 text-slate-700" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0c1015] px-2 py-2 text-xs">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-3 py-1 font-medium ${
            activeTab === 'home'
              ? 'text-teal-800 dark:text-teal-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Главная
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-1 font-medium ${
            activeTab === 'ledger'
              ? 'text-teal-800 dark:text-teal-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Реестр ИИН
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-3 py-1 font-medium ${
            activeTab === 'batch'
              ? 'text-teal-800 dark:text-teal-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Пакет 10+
        </button>
      </div>
    </header>
  );
};
