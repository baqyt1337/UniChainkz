/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlockchainBlock, UniversityTransaction } from '../types/blockchain';

// Pure JavaScript SHA-256 implementation to guarantee instant, synchronous hashing
// without async microtask bottlenecks during batch registration of 10+ transactions.
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < ascii.length; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << ((3 - (i % 4)) * 8);
  }
  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

export function hashString(input: string): string {
  return sha256Sync(input);
}

export function calculateTransactionHash(tx: Omit<UniversityTransaction, 'txHash'>): string {
  const payload = [
    tx.id,
    tx.studentName,
    tx.iin,
    tx.studentId,
    tx.universityId,
    tx.faculty,
    tx.purposeCategory,
    tx.purposeDetail,
    tx.academicYear,
    tx.amountKZT.toString(),
    tx.paymentMethod,
    tx.bankReference,
    tx.timestamp,
    tx.blockNumber.toString()
  ].join('||');

  return '0x' + sha256Sync(payload);
}

export function calculateMerkleRoot(txHashes: string[]): string {
  if (txHashes.length === 0) {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  let currentLevel = txHashes.map(h => (h.startsWith('0x') ? h.slice(2) : h));

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
      const combined = sha256Sync(left + right);
      nextLevel.push(combined);
    }
    currentLevel = nextLevel;
  }

  return '0x' + currentLevel[0];
}

export function calculateBlockHash(
  index: number,
  previousHash: string,
  timestamp: string,
  merkleRoot: string,
  nonce: number,
  validatorNode: string
): string {
  const payload = `${index}|${previousHash}|${timestamp}|${merkleRoot}|${nonce}|${validatorNode}`;
  return '0x' + sha256Sync(payload);
}

export function generateTXID(universityAbbr: string = 'KZ'): string {
  const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
  const year = 2026;
  const cleanAbbr = universityAbbr.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6) || 'EDU';
  return `TX-KZ${year}-${cleanAbbr}-${randomHex}`;
}

export function generateBankRef(paymentMethod: string): string {
  const prefix = paymentMethod.split('_')[0].slice(0, 3).toUpperCase();
  const num = Math.floor(100000000 + Math.random() * 900000000);
  return `${prefix}${num}`;
}

export function verifyBlockchainIntegrity(chain: BlockchainBlock[]): {
  isValid: boolean;
  failedBlockIndex?: number;
  reason?: string;
} {
  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];

    // Check Merkle Root
    const txHashes = block.transactions.map(t => t.txHash);
    const computedMerkle = calculateMerkleRoot(txHashes);
    if (computedMerkle !== block.merkleRoot) {
      return {
        isValid: false,
        failedBlockIndex: block.index,
        reason: `Несоответствие Merkle Root в блоке #${block.index}`
      };
    }

    // Check Block Hash
    const computedBlockHash = calculateBlockHash(
      block.index,
      block.previousHash,
      block.timestamp,
      block.merkleRoot,
      block.nonce,
      block.validatorNode
    );

    if (computedBlockHash !== block.hash) {
      return {
        isValid: false,
        failedBlockIndex: block.index,
        reason: `Хеш блока #${block.index} скомпрометирован`
      };
    }

    // Check Previous Hash continuity (except Genesis)
    if (i > 0) {
      const previousBlock = chain[i - 1];
      if (block.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          failedBlockIndex: block.index,
          reason: `Разрыв цепочки: previousHash блока #${block.index} не совпадает с хешем #${previousBlock.index}`
        };
      }
    }
  }

  return { isValid: true };
}
