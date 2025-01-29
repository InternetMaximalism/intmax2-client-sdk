"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBytesHex = randomBytesHex;
exports.sleep = sleep;
exports.hexToUint8Array = hexToUint8Array;
exports.getHdKeyFromEntropy = getHdKeyFromEntropy;
exports.getPkFromMnemonic = getPkFromMnemonic;
exports.getWithdrawHash = getWithdrawHash;
const bip39_1 = require("@scure/bip39");
const english_1 = require("@scure/bip39/wordlists/english");
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
__exportStar(require("./api.utils"), exports);
__exportStar(require("./localstorage.manager"), exports);
__exportStar(require("./mappers"), exports);
/**
 * Generates a random hex string of specified byte length
 * @param {number} length - Number of random bytes to generate
 * @returns {string} Random hex string of length * 2 characters
 * @throws {Error} If length is invalid or crypto API is unavailable
 */
function randomBytesHex(length = 32) {
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
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function hexToUint8Array(input) {
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
function getHdKeyFromEntropy(entropy) {
    const mnemonic = (0, bip39_1.entropyToMnemonic)(hexToUint8Array(entropy), english_1.wordlist);
    const account = (0, accounts_1.mnemonicToAccount)(mnemonic);
    if (!account) {
        throw new Error('No account found');
    }
    const hdKey = account.getHdKey().derive("m/44'/60'/0'/0/0");
    if (!hdKey || !hdKey?.privateKey) {
        throw new Error('Derivation failed');
    }
    return hdKey;
}
function getPkFromMnemonic(mnemonic) {
    return getHdKeyFromEntropy(mnemonic).privateKey;
}
function getWithdrawHash(w) {
    return (0, viem_1.keccak256)((0, viem_1.encodePacked)(['address', 'uint32', 'uint256', 'bytes32'], [w.recipient, w.tokenIndex, w.amount, w.nullifier]));
}
//# sourceMappingURL=index.js.map