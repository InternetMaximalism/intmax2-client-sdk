import { ContractWithdrawal } from '../types';
export * from './api.utils';
export * from './localstorage.manager';
export * from './mappers';
/**
 * Generates a random hex string of specified byte length
 * @param {number} length - Number of random bytes to generate
 * @returns {string} Random hex string of length * 2 characters
 * @throws {Error} If length is invalid or crypto API is unavailable
 */
export declare function randomBytesHex(length?: number): string;
export declare function sleep(ms: number): Promise<unknown>;
export declare function hexToUint8Array(input: string): Uint8Array;
export declare function getHdKeyFromEntropy(entropy: string): import("viem").HDKey;
export declare function getPkFromMnemonic(mnemonic: string): Uint8Array | null;
export declare function getWithdrawHash(w: ContractWithdrawal): string;
