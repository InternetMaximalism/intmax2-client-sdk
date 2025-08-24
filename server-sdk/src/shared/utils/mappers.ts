import * as wasmMainnet from '../../wasm/node/mainnet';
import * as wasmTestnet from '../../wasm/node/testnet';
import { Token, Transaction, TransactionStatus, TransactionType, Transfer } from '../types';

type Config = wasmMainnet.Config | wasmTestnet.Config;
type JsPublicKeyPair = wasmMainnet.JsPublicKeyPair | wasmTestnet.JsPublicKeyPair;
type JsTxEntry = wasmMainnet.JsTxEntry | wasmTestnet.JsTxEntry;
type JsTransferEntry = wasmMainnet.JsTransferEntry | wasmTestnet.JsTransferEntry;
type JsDepositEntry = wasmMainnet.JsDepositEntry | wasmTestnet.JsDepositEntry;
type JsTransferData = wasmMainnet.JsTransferData | wasmTestnet.JsTransferData;
type JsDepositData = wasmMainnet.JsDepositData | wasmTestnet.JsDepositData;
type JsTxData = wasmMainnet.JsTxData | wasmTestnet.JsTxData;
type JsMetaData = wasmMainnet.JsMetaData | wasmTestnet.JsMetaData;

const wasmStatuses = {
  settled: TransactionStatus.Processing,
  processed: TransactionStatus.Completed,
  pending: TransactionStatus.Processing,
  timeout: TransactionStatus.Rejected,
};

const filterWithdrawals = (transfers: Transfer[]) => {
  return transfers.some((transfer) => transfer.isWithdrawal) ? TransactionType.Withdraw : TransactionType.Send;
};

const getPublicIntMaxAddress = (config: Config, pubKeyPair: JsPublicKeyPair) => {
  if (config.network === 'mainnet') {
    return wasmMainnet.get_intmax_address_from_public_pair(config.network, pubKeyPair);
  } else {
    return wasmTestnet.get_intmax_address_from_public_pair(config.network, pubKeyPair);
  }
};

const getValidPublicIntMaxAddress = (
  config: Config,
  recipient_view_pub: string,
  transfer_recipient_data: string,
): JsPublicKeyPair => {
  if (config.network === 'mainnet') {
    return new wasmMainnet.JsPublicKeyPair(recipient_view_pub, transfer_recipient_data);
  }
  return new wasmTestnet.JsPublicKeyPair(recipient_view_pub, transfer_recipient_data);
};

export const wasmTxToTx = (
  config: Config,
  rawTx: (JsTxEntry | JsTransferEntry | JsDepositEntry) & { txType: TransactionType },
  tokens: Token[],
  userAddress: string,
): Transaction | null => {
  if (rawTx.txType === TransactionType.Receive) {
    const tx = rawTx.data as JsTransferData;
    const { timestamp, digest } = rawTx.meta as JsMetaData;
    const token = tokens.find((t) => t.tokenIndex === tx.transfer.token_index);
    const sender = getPublicIntMaxAddress(config, tx.sender);

    return {
      amount: tx.transfer.amount,
      from: sender,
      status: wasmStatuses[rawTx.status.status as keyof typeof wasmStatuses],
      timestamp: Number(timestamp),
      to: userAddress,
      tokenType: token?.tokenType,
      tokenIndex: tx.transfer.token_index,
      transfers: [],
      txType: rawTx.txType,
      digest: digest,
    };
  } else if (rawTx.txType === TransactionType.Deposit) {
    const tx = rawTx.data as JsDepositData;
    const { timestamp, digest } = rawTx.meta as JsMetaData;
    const token = tokens.find((t) => t.contractAddress.toLowerCase() === tx.token_address.toLowerCase());

    return {
      amount: tx.amount,
      from: tx.depositor,
      status: wasmStatuses[rawTx.status.status as keyof typeof wasmStatuses],
      timestamp: Number(timestamp),
      to: userAddress,
      tokenType: tx.token_type,
      tokenIndex: token?.tokenIndex ?? 0,
      transfers: [],
      txType: rawTx.txType,
      digest: digest,
      tokenAddress: tx.token_address,
    };
  } else if (rawTx.txType === TransactionType.Send || rawTx.txType === TransactionType.Withdraw) {
    const tx = rawTx.data as JsTxData;
    const { timestamp, digest } = rawTx.meta as JsMetaData;

    let transaction: Transaction = {
      amount: '',
      from: '',
      status: wasmStatuses[rawTx.status.status as keyof typeof wasmStatuses],
      timestamp: Number(timestamp),
      to: '',
      tokenIndex: 0,
      transfers: [],
      txType: rawTx.txType,
      digest: digest,
    };
    const recipient_view_pubs = tx.recipient_view_pubs;

    const transfers = tx.transfers
      .filter((transfer) => transfer.amount !== '0')
      .map((transfer, idx) => {
        const isWithdrawal = !transfer.recipient.is_pubkey;
        const recipient_view_pub = recipient_view_pubs[idx];
        let recipient: string;
        if (transfer.recipient.is_pubkey) {
          const recipient_public_pair = getValidPublicIntMaxAddress(
            config,
            recipient_view_pub,
            transfer.recipient.data,
          );
          recipient = `${getPublicIntMaxAddress(config, recipient_public_pair)}`;
        } else {
          // recipient is an ethereum address
          recipient = transfer.recipient.data;
        }

        let returnObject: Transfer = {
          recipient,
          salt: transfer.salt,
          amount: transfer.amount,
          tokenIndex: transfer.token_index,
          to: recipient,
          isWithdrawal: isWithdrawal,
        };

        if (isWithdrawal) {
          returnObject = {
            ...returnObject,
            nullifier: transfer.to_withdrawal().nullifier,
          };
        }

        return returnObject;
      });

    transaction.txType = filterWithdrawals(transfers);

    transaction = {
      ...transaction,
      transfers,
      timestamp: Number(timestamp),
    };

    return transaction;
  }

  return null;
};

export const formatError = (error: unknown): Error | unknown => {
  if (error instanceof Error) {
    if (error.message.includes('prev_digest mismatch with stored digest')) {
      return new Error('The balance synchronization encountered a conflict. Please wait a moment and try again');
    }
    if (error.message.includes('Pending tx error: pending tx')) {
      return new Error(
        'The previous transfer is still being processed, so you cannot initiate a new one yet. Please use `waitForTransactionConfirmation` to wait for the previous transaction to complete.',
      );
    }
    if (error.message.includes(`Bad Gateway`) && error.message.includes(`validity-prover/`)) {
      return new Error(
        'Unable to connect to the Validity Prover server (502 Bad Gateway). The server may be temporarily unresponsive.',
      );
    }
    if (error.message.includes(`Bad Gateway`) && error.message.includes(`store-vault-server/`)) {
      return new Error(
        'Unable to connect to the Store Vault server (502 Bad Gateway). The server may be temporarily unresponsive.',
      );
    }
  }

  return error;
};
