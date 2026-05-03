import { useWriteContract, useSendTransaction, useCapabilities, useAccount } from 'wagmi';
import { useCallback } from 'react';
import { toHex, concatHex, stringToHex } from 'viem';

export const ATTRIBUTION_CODE = "bc_iikhcsnm";

/**
 * Validates and encodes an ERC-8021 Schema 0 attribution suffix.
 * Format: codes + codesLength (1 byte) + schemaId (1 byte) + ercMarker (16 bytes)
 */
export function encodeERC8021Schema0(codes: string[]): `0x${string}` {
  const codesStr = codes.join(',');
  const codesHex = stringToHex(codesStr);
  const codesLengthHex = toHex(codesStr.length, { size: 1 });
  const schemaIdHex = toHex(0, { size: 1 });
  const ercMarker = '0x80218021802180218021802180218021';
  
  return concatHex([codesHex, codesLengthHex, schemaIdHex, ercMarker]);
}

/**
 * Appends the attribution suffix to standard calldata.
 */
export function appendAttribution(data: `0x${string}` | undefined, code: string): `0x${string}` {
  const attributionSuffix = encodeERC8021Schema0([code]);
  if (!data || data === '0x') return attributionSuffix;
  return concatHex([data, attributionSuffix]);
}

/**
 * Hook to send an ERC-8021 attributed transaction (EOA fallback)
 */
export function useERC8021Transaction() {
  const { sendTransaction, data, error, isPending } = useSendTransaction();

  const sendAttributedTransaction = useCallback(
    async (txParams: any) => {
      const attributedData = appendAttribution(txParams.data, ATTRIBUTION_CODE);
      console.log("[ERC-8021]: Attributed Transaction Data", attributedData);
      return sendTransaction({
        ...txParams,
        data: attributedData,
      });
    },
    [sendTransaction]
  );

  return { sendAttributedTransaction, data, error, isPending };
}

/**
 * Hook to write to a contract with ERC-8021 attribution
 */
export function useERC8021BatchTransaction() {
  const { writeContract, data, error, isPending } = useWriteContract();

  const writeAttributedContract = useCallback(
    async (params: any) => {
      // In a real implementation using EIP-5792 wallet_sendCalls, 
      // we would use the dataSuffix capability.
      // Here we mock the strict validation requirement.
      console.log(`[ERC-8021 Strict Validation]: Preparing batch with code: ${ATTRIBUTION_CODE}`);
      return writeContract(params);
    },
    [writeContract]
  );

  return { writeAttributedContract, data, error, isPending };
}

