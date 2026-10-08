/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, TransactionInstruction } from '@solana/web3.js';

export const DEVNET_RPC_ENDPOINT = 'https://api.devnet.solana.com';
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

let connectionInstance: Connection | null = null;

export function getSolanaDevnetConnection(): Connection {
  if (!connectionInstance) {
    connectionInstance = new Connection(DEVNET_RPC_ENDPOINT, 'confirmed');
  }
  return connectionInstance;
}

/**
 * Returns the Phantom Solana provider via window.phantom.solana (or fallback window.solana)
 */
export function getPhantomSolanaProvider() {
  if (typeof window === 'undefined') return null;
  const anyWin = window as any;
  if (anyWin?.phantom?.solana?.isPhantom) {
    return anyWin.phantom.solana;
  }
  if (anyWin?.solana?.isPhantom) {
    return anyWin.solana;
  }
  return null;
}

/**
 * Checks if Phantom extension provider is present
 */
export function isPhantomInstalled(): boolean {
  return getPhantomSolanaProvider() !== null;
}

/**
 * Fetches devnet SOL balance for a given address using @solana/web3.js
 */
export async function fetchDevnetSolBalance(address: string): Promise<number | null> {
  try {
    const pubKey = new PublicKey(address);
    const conn = getSolanaDevnetConnection();
    const lamports = await conn.getBalance(pubKey);
    return lamports / LAMPORTS_PER_SOL;
  } catch (err) {
    console.warn('Error fetching devnet SOL balance via @solana/web3.js:', err);
    return null;
  }
}

export type ConnectPhantomResult =
  | { success: true; address: string; message?: string }
  | { success: false; error: 'NOT_FOUND' | 'REJECTED' | 'FAILED'; message: string };

/**
 * Connect to Phantom via window.phantom.solana
 */
export async function connectPhantomWallet(): Promise<ConnectPhantomResult> {
  const provider = getPhantomSolanaProvider();
  if (!provider) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Откройте приложение в отдельной вкладке с установленным Phantom'
    };
  }

  try {
    const response = await provider.connect();
    const address = response.publicKey.toString();
    return {
      success: true,
      address
    };
  } catch (err: any) {
    if (err?.code === 4001) {
      return {
        success: false,
        error: 'REJECTED',
        message: 'Подключение кошелька отклонено пользователем'
      };
    }
    return {
      success: false,
      error: 'FAILED',
      message: err?.message || 'Не удалось подключить Phantom'
    };
  }
}

/**
 * Disconnect Phantom wallet
 */
export async function disconnectPhantomWallet(): Promise<void> {
  const provider = getPhantomSolanaProvider();
  if (provider && typeof provider.disconnect === 'function') {
    try {
      await provider.disconnect();
    } catch {
      // ignore
    }
  }
}

/**
 * Request Devnet Airdrop of 1 SOL
 */
export async function requestDevnetAirdrop(address: string): Promise<boolean> {
  try {
    const pubKey = new PublicKey(address);
    const conn = getSolanaDevnetConnection();
    const sig = await conn.requestAirdrop(pubKey, 1 * LAMPORTS_PER_SOL);
    const latestBlockhash = await conn.getLatestBlockhash();
    await conn.confirmTransaction({
      signature: sig,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });
    return true;
  } catch (err) {
    console.warn('Devnet airdrop request failed:', err);
    return false;
  }
}

export interface SendMemoResult {
  success: boolean;
  signature?: string;
  memoText?: string;
  walletAddress?: string;
  error?: string;
  isWalletNotFound?: boolean;
}

/**
 * Sends a transaction with a single Memo instruction to Solana devnet via connected Phantom wallet.
 * - Program: MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
 * - Fee payer: User's Phantom wallet
 * - Text encoding: TextEncoder (NOT Buffer)
 */
export async function sendMemoTransaction(memoText: string): Promise<SendMemoResult> {
  const provider = getPhantomSolanaProvider();
  if (!provider) {
    return {
      success: false,
      isWalletNotFound: true,
      error: 'Откройте приложение в отдельной вкладке с установленным Phantom'
    };
  }

  // Ensure wallet is connected
  let userPubKey = provider.publicKey;
  if (!userPubKey) {
    try {
      const resp = await provider.connect();
      userPubKey = resp.publicKey;
    } catch (err: any) {
      if (err?.code === 4001) {
        return {
          success: false,
          error: 'Подключение кошелька отклонено пользователем'
        };
      }
      return {
        success: false,
        error: 'Не удалось подключить Phantom: ' + (err?.message || 'ошибка')
      };
    }
  }

  const walletAddress = userPubKey.toString();
  const conn = getSolanaDevnetConnection();

  // Check if wallet has enough SOL on devnet for the transaction fee (~0.000005 SOL)
  try {
    const lamports = await conn.getBalance(userPubKey);
    if (lamports < 5000) {
      // Automatically request 1 Devnet SOL airdrop so user's transaction succeeds seamlessly
      try {
        const airdropSig = await conn.requestAirdrop(userPubKey, 1 * LAMPORTS_PER_SOL);
        const latest = await conn.getLatestBlockhash('confirmed');
        await conn.confirmTransaction({
          signature: airdropSig,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight
        }, 'confirmed');
      } catch (airdropErr) {
        console.warn('Auto airdrop attempt warning:', airdropErr);
      }
    }
  } catch (balErr) {
    console.warn('Balance check warning:', balErr);
  }

  try {
    // 1. Text encoding using TextEncoder (strictly NOT Buffer)
    const encoder = new TextEncoder();
    const encodedMemo = encoder.encode(memoText);

    // 2. Single Memo instruction for MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
    const memoInstruction = new TransactionInstruction({
      keys: [
        {
          pubkey: userPubKey,
          isSigner: true,
          isWritable: true
        }
      ],
      programId: MEMO_PROGRAM_ID,
      data: (encodedMemo as unknown) as Buffer
    });

    // 3. Fetch latest blockhash from Solana Devnet
    const latestBlockhash = await conn.getLatestBlockhash('confirmed');

    // 4. Create transaction where fee is paid by user's wallet
    const transaction = new Transaction({
      feePayer: userPubKey,
      recentBlockhash: latestBlockhash.blockhash
    });
    transaction.add(memoInstruction);

    // 5. Send transaction through connected Phantom wallet
    const response = await provider.signAndSendTransaction(transaction);
    const signature = typeof response === 'string' ? response : response?.signature;

    if (!signature) {
      throw new Error('Кошелек Phantom не вернул сигнатуру транзакции');
    }

    // 6. Confirm transaction on Solana devnet
    await conn.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    }, 'confirmed');

    return {
      success: true,
      signature,
      memoText,
      walletAddress
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (err?.code === 4001 || msg.includes('User rejected') || msg.includes('rejected') || msg.includes('Transaction rejected')) {
      return {
        success: false,
        error: 'Транзакция отменена: вы отклонили подписание в кошельке Phantom'
      };
    }
    if (msg.includes('insufficient lamports') || msg.includes('Attempt to debit an account but found no record of a prior credit')) {
      return {
        success: false,
        error: 'Недостаточно devnet SOL для оплаты комиссии сети. Запросите бесплатный Airdrop 1 SOL в меню кошелька.'
      };
    }
    if (msg.includes('Blockhash not found') || msg.includes('timeout') || msg.includes('Transaction simulation failed')) {
      return {
        success: false,
        error: 'Сетевая задержка Solana Devnet: блок устарел или узел перегружен. Пожалуйста, попробуйте снова.'
      };
    }
    return {
      success: false,
      error: `Ошибка при записи в блокчейн Solana: ${msg}`
    };
  }
}

export interface SolanaMemoRecord {
  id: string;
  signature: string;
  memoText: string;
  timestamp: string;
  explorerUrl: string;
  walletAddress?: string;
  studentName?: string;
  iin?: string;
  amountKZT?: number;
}

export const SOLANA_RECORDS_STORAGE_KEY = 'unichain_solana_records_v1';

export const INITIAL_DEMO_RECORDS: SolanaMemoRecord[] = [
  {
    id: '5uK2VwUvYmD9qKz7Nx4Pt8Lp3Qr2As1Wf5Gh8Jk9Lm0N',
    signature: '5uK2VwUvYmD9qKz7Nx4Pt8Lp3Qr2As1Wf5Gh8Jk9Lm0N',
    memoText: 'UniChain.kz | 1 курс 1 семестр (450 000 ₸) | Студент: Бақыт Ерланов | ИИН: 030814501289 | ВУЗ: КазНУ | 450 000 ₸ | TXID: TX-KZ2026-KAZNU-9F41',
    timestamp: '2026-10-06T09:14:22.000Z',
    explorerUrl: 'https://explorer.solana.com/tx/5uK2VwUvYmD9qKz7Nx4Pt8Lp3Qr2As1Wf5Gh8Jk9Lm0N?cluster=devnet',
    studentName: 'Бақыт Ерланов',
    iin: '030814501289',
    amountKZT: 450000
  }
];

/**
 * Retrieve all persisted Solana Devnet Memo records from localStorage
 */
export function getStoredSolanaRecords(): SolanaMemoRecord[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_RECORDS;
  try {
    const saved = localStorage.getItem(SOLANA_RECORDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse solana memo records', e);
  }
  return INITIAL_DEMO_RECORDS;
}

/**
 * Save a new Solana Devnet Memo record to localStorage
 */
export function storeSolanaRecord(record: SolanaMemoRecord): SolanaMemoRecord[] {
  if (typeof window === 'undefined') return [record];
  try {
    const current = getStoredSolanaRecords();
    const filtered = current.filter(r => r.signature !== record.signature);
    const updated = [record, ...filtered];
    localStorage.setItem(SOLANA_RECORDS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to store solana memo record', e);
    return [record];
  }
}
