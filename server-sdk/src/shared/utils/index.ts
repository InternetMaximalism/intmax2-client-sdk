import { HDKey } from '@scure/bip32';
import { entropyToMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { encodePacked, Hex, hexToBytes, keccak256, sha256, toHex } from 'viem';

import { ContractWithdrawal } from '../types';

export * from './api.utils';
export * from './mappers';

/**
 * Generates a random hex string of specified byte length
 * @param {number} length - Number of random bytes to generate
 * @returns {string} Random hex string of length * 2 characters
 * @throws {Error} If length is invalid or crypto API is unavailable
 */
export function randomBytesHex(length: number = 32): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error('Length must be a positive integer');
  }

  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error('Crypto API is not available');
  }

  const bytes = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hexToUint8Array(input: string): Uint8Array {
  // Remove '0x' prefix if present
  const hexString = input.replace('0x', '');

  // Ensure string length is correct (32 bytes = 64 hex characters)
  if (hexString.length !== 64) {
    throw new Error('Input string must be 64 characters (32 bytes) long');
  }

  const bytes = new Uint8Array(32);

  for (let i = 0; i < 64; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }

  return bytes;
}

export const getHdPrivateKeyFromMnemonic = (mnemonic: string, derivePath: string = "m/44'/60'/0'/0/0"): Hex => {
  const seed = mnemonicToSeedSync(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed).derive(derivePath);
  return toHex(hdKey.privateKey!);
}

export function getPkFromEntropy(
  entropy: string,
  derivativePath?: {
    derive_path: number;
    redeposit_derive_path: number;
  },
): Hex | null {
  const mnemonic = entropyToMnemonic(hexToUint8Array(entropy), wordlist);

  const derive_path = derivativePath?.derive_path ?? 0;
  const redeposit_derive_path = derivativePath?.redeposit_derive_path ?? 0;

  return getHdPrivateKeyFromMnemonic(
    mnemonic,
    `m/44'/60'/${redeposit_derive_path}'/0/${derive_path}`,
  );
}

export function getWithdrawHash(w: ContractWithdrawal): string {
  return keccak256(
    encodePacked(
      ['address', 'uint32', 'uint256', 'bytes32'],
      [w.recipient, w.tokenIndex, w.amount as bigint, w.nullifier],
    ),
  );
}

export function uint8ToBase64(u8: Uint8Array): string {
  return btoa(String.fromCharCode(...u8));
}

export const generateEntropy = (networkSign: Hex, hashedSignature: string) => {
  const binaryString = atob(hashedSignature);
  const hashedSignatureBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    hashedSignatureBytes[i] = binaryString.charCodeAt(i);
  }

  const networkSignBytes = hexToBytes(networkSign);
  const combined = new Uint8Array(networkSignBytes.length + hashedSignatureBytes.length);
  combined.set(networkSignBytes);
  combined.set(hashedSignatureBytes, networkSignBytes.length);

  return sha256(combined);
};
