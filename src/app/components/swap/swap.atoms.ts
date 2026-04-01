import type { NetworkData, SwapQuoteResponse, SwapStatusResponse, WalletAccount } from '@dynamic-labs-sdk/client';
import {
  executeSwapTransaction,
  getSwapQuote,
  getSwapStatus,
} from '@dynamic-labs-sdk/client';
import { atom } from 'jotai';

import type { DestinationInfo, SourceTokenInfo } from './swap.types';
import { toRawAmount } from './utils/toRawAmount';

export type SwapStep = 'quote' | 'review' | 'status';

const STATUS_POLL_INTERVAL = 3000;

// ─── Session Context Atoms ────────────────────────────────────────────────────
// Hydrated from props in SwapTokenDialogInner before any child renders.

/** The wallet account initiating the swap. */
export const walletAccountAtom = atom<WalletAccount | null>(null);

/** The active network at the time the dialog was opened. Updated by network switches. */
export const activeNetworkDataAtom = atom<NetworkData | null>(null);

// ─── Primitive Atoms ──────────────────────────────────────────────────────────

/** Current UI step in the swap flow. */
export const stepAtom = atom<SwapStep>('quote');

/** Source token address and decimals selected by the user. */
export const sourceTokenAtom = atom<SourceTokenInfo>({ decimals: 18, tokenAddress: '' });

/** Destination token address and network ID selected by the user. */
export const destinationAtom = atom<DestinationInfo>({ networkId: '', tokenAddress: '' });

/** Human-readable amount the user wants to swap. */
export const amountAtom = atom<string>('');

/** Slippage tolerance as a string percentage, e.g. "1". */
export const slippageAtom = atom<string>('1');

/** Transaction hash returned after a successful swap execution. */
export const txHashAtom = atom<string>('');

/** Current sub-step during swap execution (approval or transaction signing). */
export const executeStepAtom = atom<'approval' | 'transaction' | null>(null);

/** Quote response from the SDK. Cleared whenever inputs change. */
export const quoteAtom = atom<SwapQuoteResponse | null>(null);

/** Status response from the SDK. Updated by the polling loop in StatusStep. */
export const swapStatusAtom = atom<SwapStatusResponse | null>(null);

// ─── Error Atoms ──────────────────────────────────────────────────────────────

/** Error from the most recent getSwapQuote call. */
export const quoteErrorAtom = atom<Error | null>(null);

/** Error from the most recent executeSwapTransaction call. */
export const executeErrorAtom = atom<Error | null>(null);

/** Error from the most recent getSwapStatus call. */
export const statusErrorAtom = atom<Error | null>(null);

// ─── Loading Atoms ────────────────────────────────────────────────────────────

/** True while getSwapQuote is in flight. */
export const isQuotingAtom = atom<boolean>(false);

/** True while executeSwapTransaction is in flight. */
export const isExecutingAtom = atom<boolean>(false);

// ─── Derived Read-Only Atoms ──────────────────────────────────────────────────

/**
 * The raw (integer) amount to send to the swap API, derived from the
 * human-readable amount and source token decimals.
 */
export const rawAmountAtom = atom((get) =>
  toRawAmount(get(amountAtom), get(sourceTokenAtom).decimals)
);

/**
 * True when the form has enough data for a quote request to be made.
 * Used to enable/disable the Get Quote button.
 */
export const isFormValidAtom = atom(
  (get) =>
    Boolean(
      get(sourceTokenAtom).tokenAddress &&
      get(destinationAtom).tokenAddress &&
      Number(get(amountAtom)) > 0
    )
);

/**
 * True when the swap has reached a terminal state (DONE or FAILED).
 * Used by StatusStep to stop the polling interval.
 */
export const isSwapTerminalAtom = atom((get) => {
  const status = get(swapStatusAtom)?.status;
  return status === 'DONE' || status === 'FAILED';
});

// ─── Write Atoms (Actions) ────────────────────────────────────────────────────

/**
 * Resets all swap state back to defaults derived from the current network.
 * Called automatically when the dialog Provider unmounts (dialog closes).
 */
export const resetSwapAtom = atom(null, (get, set) => {
  const network = get(activeNetworkDataAtom);
  set(stepAtom, 'quote');
  set(sourceTokenAtom, {
    decimals: network?.nativeCurrency.decimals ?? 18,
    tokenAddress: '',
  });
  set(destinationAtom, { networkId: network?.networkId ?? '', tokenAddress: '' });
  set(amountAtom, '');
  set(slippageAtom, '1');
  set(txHashAtom, '');
  set(executeStepAtom, null);
  set(quoteAtom, null);
  set(swapStatusAtom, null);
  set(quoteErrorAtom, null);
  set(executeErrorAtom, null);
  set(statusErrorAtom, null);
});

/**
 * Updates the source token and clears the amount and quote, since
 * a new source token makes the existing quote invalid.
 */
export const handleSourceChangeAtom = atom(
  null,
  (_get, set, info: SourceTokenInfo) => {
    set(sourceTokenAtom, info);
    set(amountAtom, '');
    set(quoteAtom, null);
    set(quoteErrorAtom, null);
  }
);

/**
 * Updates the swap amount and clears the quote, since a new amount
 * makes the existing quote invalid.
 */
export const handleAmountChangeAtom = atom(
  null,
  (_get, set, value: string) => {
    set(amountAtom, value);
    set(quoteAtom, null);
    set(quoteErrorAtom, null);
  }
);

/**
 * Updates the destination token/network and clears the quote.
 */
export const handleDestinationChangeAtom = atom(
  null,
  (_get, set, info: DestinationInfo) => {
    set(destinationAtom, info);
    set(quoteAtom, null);
    set(quoteErrorAtom, null);
  }
);

/**
 * Handles a network switch from within the source section.
 * Resets source token (new network = different tokens) and clears the quote.
 * Also updates activeNetworkDataAtom so all atoms that read network data stay consistent.
 */
export const handleNetworkUpdatedAtom = atom(
  null,
  (_get, set, network: NetworkData) => {
    set(activeNetworkDataAtom, network);
    set(sourceTokenAtom, {
      decimals: network.nativeCurrency.decimals,
      tokenAddress: '',
    });
    set(amountAtom, '');
    set(quoteAtom, null);
    set(quoteErrorAtom, null);
  }
);

/**
 * Fetches a swap quote using the current form inputs.
 * On success, advances the flow to the review step.
 * Reads walletAccount and activeNetworkData from context atoms.
 */
export const getQuoteAtom = atom(null, async (get, set) => {
  const walletAccount = get(walletAccountAtom);
  const activeNetworkData = get(activeNetworkDataAtom);
  if (!walletAccount || !activeNetworkData) return;

  set(isQuotingAtom, true);
  set(quoteErrorAtom, null);
  try {
    const result = await getSwapQuote({
      from: {
        address: walletAccount.address,
        amount: get(rawAmountAtom),
        chain: walletAccount.chain,
        networkId: activeNetworkData.networkId,
        tokenAddress: get(sourceTokenAtom).tokenAddress,
      },
      slippage: Number(get(slippageAtom)),
      to: {
        address: walletAccount.address,
        chain: walletAccount.chain,
        networkId: get(destinationAtom).networkId,
        tokenAddress: get(destinationAtom).tokenAddress,
      },
    });
    set(quoteAtom, result);
    set(stepAtom, 'review');
  } catch (err) {
    set(quoteErrorAtom, err instanceof Error ? err : new Error(String(err)));
  } finally {
    set(isQuotingAtom, false);
  }
});

/**
 * Executes the swap transaction using the signing payload from the quote.
 * Tracks approval and transaction sub-steps via executeStepAtom.
 * On success, records the txHash and advances to the status step.
 */
export const executeSwapAtom = atom(null, async (get, set) => {
  const walletAccount = get(walletAccountAtom);
  const quote = get(quoteAtom);
  if (!walletAccount || !quote?.signingPayload) throw new Error('No signing payload');

  set(isExecutingAtom, true);
  set(executeErrorAtom, null);
  set(executeStepAtom, null);
  try {
    const { transactionHash } = await executeSwapTransaction({
      onStepChange: (s) => set(executeStepAtom, s),
      signingPayload: quote.signingPayload,
      walletAccount,
    });
    set(txHashAtom, transactionHash);
    set(stepAtom, 'status');
  } catch (err) {
    set(executeErrorAtom, err instanceof Error ? err : new Error(String(err)));
  } finally {
    set(isExecutingAtom, false);
  }
});

/**
 * Polls the swap status for a given transaction hash.
 * Called on an interval by StatusStep; stops when isSwapTerminalAtom becomes true.
 */
export const checkStatusAtom = atom(null, async (get, set, hash: string) => {
  const walletAccount = get(walletAccountAtom);
  const activeNetworkData = get(activeNetworkDataAtom);
  if (!walletAccount || !activeNetworkData) return;

  try {
    const result = await getSwapStatus({
      from: {
        chain: walletAccount.chain,
        networkId: activeNetworkData.networkId,
      },
      txHash: hash,
    });
    set(swapStatusAtom, result);
  } catch (err) {
    set(statusErrorAtom, err instanceof Error ? err : new Error(String(err)));
  }
});

export { STATUS_POLL_INTERVAL };
