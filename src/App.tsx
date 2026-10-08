/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BlockchainBlock, UniversityTransaction } from './types/blockchain';
import { INITIAL_BLOCKCHAIN } from './utils/initialData';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { WelcomeHomeView } from './components/WelcomeHomeView';
import { TransactionLedgerTable } from './components/TransactionLedgerTable';
import { BatchRegistrationView } from './components/BatchRegistrationView';
import { ReceiptModal } from './components/ReceiptModal';
import { SinglePaymentModal } from './components/SinglePaymentModal';
import { PhantomWalletModal } from './components/PhantomWalletModal';
import { fetchDevnetSolBalance, getPhantomSolanaProvider, connectPhantomWallet } from './utils/solana';
import { Globe2, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'unichain_kz_blocks_v1';
const WALLET_KEY = 'unichain_kz_phantom_wallet';
const THEME_KEY = 'unichain_kz_theme';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [blocks, setBlocks] = useState<BlockchainBlock[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_BLOCKCHAIN;
  });

  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    try {
      return localStorage.getItem(WALLET_KEY) || null;
    } catch {
      return null;
    }
  });

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);
  const [phantomError, setPhantomError] = useState<string | null>(null);

  // Default view is 'home' (Synflow pastel landing and intuitive welcome menu)
  const [activeTab, setActiveTab] = useState<'home' | 'ledger' | 'batch'>('home');
  const [ledgerInitialQuery, setLedgerInitialQuery] = useState<string>('');
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<UniversityTransaction | null>(null);

  // Sync dark class on documentElement
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Persist blocks to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    } catch {
      // ignore
    }
  }, [blocks]);

  // Load devnet SOL balance
  const loadDevnetBalance = async (address: string) => {
    setIsBalanceLoading(true);
    try {
      const bal = await fetchDevnetSolBalance(address);
      setWalletBalance(bal);
    } catch {
      setWalletBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  // Sync balance when walletAddress changes or on initial load
  useEffect(() => {
    if (walletAddress) {
      loadDevnetBalance(walletAddress);
    } else {
      setWalletBalance(null);
    }
  }, [walletAddress]);

  // Listen to Phantom account changes
  useEffect(() => {
    const provider = getPhantomSolanaProvider();
    if (!provider) return;

    const handleAccountChange = (publicKey: any) => {
      if (publicKey) {
        const addr = publicKey.toString();
        setWalletAddress(addr);
        try {
          localStorage.setItem(WALLET_KEY, addr);
        } catch {
          // ignore
        }
        loadDevnetBalance(addr);
      } else {
        handleDisconnectWallet();
      }
    };

    const handleDisconnect = () => {
      handleDisconnectWallet();
    };

    if (provider.on) {
      provider.on('accountChanged', handleAccountChange);
      provider.on('disconnect', handleDisconnect);
    }

    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountChanged', handleAccountChange);
        provider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Connect handler called when user clicks "Подключить кошелёк"
  const handleConnectWalletClick = async () => {
    if (walletAddress) {
      setPhantomError(null);
      setIsWalletModalOpen(true);
      return;
    }

    const provider = getPhantomSolanaProvider();
    if (!provider) {
      setPhantomError('Откройте приложение в отдельной вкладке с установленным Phantom');
      setIsWalletModalOpen(true);
      return;
    }

    try {
      const res = await connectPhantomWallet();
      if (res.success) {
        setWalletAddress(res.address);
        try {
          localStorage.setItem(WALLET_KEY, res.address);
        } catch {
          // ignore
        }
        setPhantomError(null);
        await loadDevnetBalance(res.address);
      } else {
        setPhantomError(res.message);
        setIsWalletModalOpen(true);
      }
    } catch (err: any) {
      setPhantomError(err?.message || 'Ошибка подключения');
      setIsWalletModalOpen(true);
    }
  };

  // Modal connect success callback
  const handleConnectSuccess = (address: string) => {
    setWalletAddress(address);
    try {
      localStorage.setItem(WALLET_KEY, address);
    } catch {
      // ignore
    }
    setPhantomError(null);
    loadDevnetBalance(address);
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
    try {
      localStorage.removeItem(WALLET_KEY);
    } catch {
      // ignore
    }
  };

  // Aggregate all transactions across all blocks
  const allTransactions = blocks.flatMap(b => b.transactions);
  const latestBlock = blocks[blocks.length - 1];
  const totalAmountKZT = allTransactions.reduce((sum, t) => sum + t.amountKZT, 0);

  const handleBatchCompleted = (newBlock: BlockchainBlock) => {
    setBlocks(prev => [...prev, newBlock]);
  };

  const handleSinglePaymentRegistered = (newBlock: BlockchainBlock, createdTx: UniversityTransaction) => {
    setBlocks(prev => [...prev, newBlock]);
    setSelectedReceiptTx(createdTx);
    if (walletAddress) {
      setTimeout(() => {
        loadDevnetBalance(walletAddress);
      }, 1000);
    }
  };

  const handleResetData = () => {
    if (confirm('Сбросить блокчейн-реестр UniChain.kz до исходного состояния (Genesis Block + Блок #1)?')) {
      setBlocks(INITIAL_BLOCKCHAIN);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfcfc] dark:bg-[#090b0e] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-100 dark:selection:bg-teal-950/80 selection:text-teal-900 dark:selection:text-teal-200 transition-colors duration-200">
      {/* Top Header with clean Synflow pastel styling and dark mode */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSingleModal={() => setIsSingleModalOpen(true)}
        onOpenBatchModal={() => setActiveTab('batch')}
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        isBalanceLoading={isBalanceLoading}
        onConnectWallet={handleConnectWalletClick}
        onOpenWalletModal={() => {
          setPhantomError(null);
          setIsWalletModalOpen(true);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Context Strip in soft pastel card */}
        <div className="p-4 bg-white dark:bg-[#0f141c] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-2xs transition-colors">
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <Globe2 className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" />
            <span>
              <strong className="text-slate-900 dark:text-white">UniChain.kz:</strong> Единая национальная клиринговая база данных университетских оплат и общежитий РК.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-mono">
            <span>Solana & SHA-256 Ledger</span>
            <span>·</span>
            <span className="text-teal-800 dark:text-teal-400 font-semibold">Казахстан UTC+5</span>
          </div>
        </div>

        {/* Global Statistics Overview */}
        <StatsOverview
          transactions={allTransactions}
          blocks={blocks}
        />

        {/* View 1: Welcome Home Introduction matching the Synflow reference */}
        {activeTab === 'home' && (
          <WelcomeHomeView
            onGoToLedger={(iin) => {
              if (iin) setLedgerInitialQuery(iin);
              setActiveTab('ledger');
            }}
            onGoToBatch={() => setActiveTab('batch')}
            onOpenPaymentModal={() => setIsSingleModalOpen(true)}
            totalTransactionsCount={allTransactions.length}
            totalAmountKZT={totalAmountKZT}
          />
        )}

        {/* View 2: Registry by IIN & TXID with Privacy and Student Summary */}
        {activeTab === 'ledger' && (
          <TransactionLedgerTable
            transactions={allTransactions}
            initialSearchQuery={ledgerInitialQuery}
            onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
            onVerifyTx={(txId) => {
              const tx = allTransactions.find(t => t.id === txId);
              if (tx) setSelectedReceiptTx(tx);
            }}
          />
        )}

        {/* View 3: Batch Registration for 10+ Transactions */}
        {activeTab === 'batch' && (
          <BatchRegistrationView
            onBatchCompleted={handleBatchCompleted}
            latestBlock={latestBlock}
            onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
          />
        )}

      </main>

      {/* Footer in clean, calm, elegant aesthetic */}
      <footer className="border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0c1015] py-8 mt-16 text-xs text-slate-400 dark:text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">UniChain.kz</span>
            <span>·</span>
            <span>Единый децентрализованный реестр университетских сборов Республики Казахстан</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={handleResetData}
              className="text-slate-400 dark:text-slate-500 hover:text-teal-800 dark:hover:text-teal-400 transition-colors cursor-pointer flex items-center gap-1 font-medium"
              title="Сбросить локальные транзакции к начальным"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Сбросить демо-базу</span>
            </button>
            <span>·</span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              Phantom & Solana Ready
            </span>
          </div>
        </div>
      </footer>

      {/* Official Receipt Modal */}
      <ReceiptModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />

      {/* Single Payment Modal with fixed auto-sum */}
      <SinglePaymentModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        latestBlock={latestBlock}
        onPaymentRegistered={handleSinglePaymentRegistered}
        walletAddress={walletAddress}
      />

      {/* Phantom Wallet Modal */}
      <PhantomWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false);
          setPhantomError(null);
        }}
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        isBalanceLoading={isBalanceLoading}
        initialError={phantomError}
        onConnectSuccess={handleConnectSuccess}
        onDisconnect={handleDisconnectWallet}
        onRefreshBalance={() => walletAddress ? loadDevnetBalance(walletAddress) : Promise.resolve()}
      />
    </div>
  );
}
