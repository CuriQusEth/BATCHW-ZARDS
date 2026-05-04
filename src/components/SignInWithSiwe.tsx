import React, { useState } from 'react';
import { createSiweMessage, generateSiweNonce } from 'viem/siwe';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';
import { motion } from 'motion/react';
import { useERC8021Transaction } from '../lib/erc8021';
import { parseEther, stringToHex } from 'viem';

export function SignInWithSiwe() {
  const { address, chainId, isConnected } = useAccount();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();
  const { sendAttributedTransaction, isPending } = useERC8021Transaction();

  async function handleSignIn() {
    if (!isConnected || !address || !chainId || !publicClient) {
      throw new Error('Connect your wallet before signing in');
    }

    setIsSigningIn(true);
    const nonce = generateSiweNonce();

    try {
      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: '1',
      });

      const signature = await signMessageAsync({ account: address, message });
      const valid = await publicClient.verifySiweMessage({ message, signature });
      
      if (!valid) throw new Error('SIWE verification failed');
      setIsSignedIn(true);
    } catch(err) {
       console.error("SIWE error:", err);
    } finally {
      setIsSigningIn(false);
    }
  }

  const handleSayGM = async () => {
     try {
       await sendAttributedTransaction({
         to: '0x0000000000000000000000000000000000000000',
         value: parseEther('0'),
         data: stringToHex('GM')
       });
     } catch(e) {
       console.error("Say GM failed", e);
     }
  };

  if (!isConnected) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      {!isSignedIn ? (
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="w-full py-2 text-xs font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition border border-purple-500 shadow-lg shadow-purple-500/20"
        >
          {isSigningIn ? 'SIGNING IN...' : 'SIGN IN WITH ETHEREUM (SIWE)'}
        </button>
      ) : (
        <div className="flex flex-col gap-2 p-3 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-400"></div>
          <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold ml-2">SIWE Verified</p>
          
          <button 
             onClick={handleSayGM}
             disabled={isPending}
             className="mt-2 w-full py-2 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg shadow-blue-500/20"
          >
             {isPending ? 'TRANSACTING...' : 'SAY GM (ONCHAIN)'}
          </button>
        </div>
      )}
    </div>
  );
}
