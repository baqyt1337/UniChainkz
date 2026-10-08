# UniChain.kz

> Decentralized student tuition, dorm fee, and university payment ledger for higher education institutions in Kazakhstan.

**Target Audience:** Students, university accounting departments, and educational auditors across universities in Kazakhstan (KazNU, Satbayev University, KBTU, ENU, etc.).

---

## Problem

University payments in Kazakhstan (tuition, dormitory fees, retake fees) often suffer from fragmented banking records, slow reconciliation between university accounting and student portals, lost receipts, and a lack of tamper-proof verification when students need to prove payment status.

## Solution

UniChain.kz provides a unified ledger where each payment generates an instant cryptographic receipt backed by dual verification: an internal Merkle tree block registry and an immutable on-chain record stored directly on the Solana blockchain.

## How it uses Solana

- **Wallet Connection:** Connects directly to the user's Phantom Wallet via `window.phantom.solana` with live devnet SOL balance tracking and automated airdrop request fallback.
- **On-Chain Recording:** Sends devnet transactions utilizing the official **Solana Memo Program** (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`).
- **Data Payload:** Encodes payment metadata using native `TextEncoder`:
  `UniChain.kz | {Purpose} | Student: {Name} | IIN: {National ID} | University: {Abbr} | Amount: {Amount} KZT | TXID: {ID}`
- **Verification:** Provides an instant link to [Solana Explorer](https://explorer.solana.com/?cluster=devnet) (`https://explorer.solana.com/tx/{signature}?cluster=devnet`) and maintains a persistent history of all on-chain entries.

## How to run

### Prerequisites
- Node.js 20+ / npm
- Phantom Wallet browser extension (switched to Solana Devnet)

### Steps
```bash
# 1. Clone repository & install dependencies
git clone <repo-url>
cd unichain-kz
npm install

# 2. Start local development server
npm run dev
