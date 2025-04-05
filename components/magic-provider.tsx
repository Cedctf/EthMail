"use client"

import { Magic } from 'magic-sdk';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

type MagicContextType = {
  magic: Magic | null;
  isInitializing: boolean;
};

const MagicContext = createContext<MagicContextType>({
  magic: null,
  isInitializing: true
});

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: { children: ReactNode }) => {
  const [magic, setMagic] = useState<Magic | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeMagic = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Initialize Magic with the Flow EVM Testnet
          const magicInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY as string, {
            network: {
              rpcUrl: "https://testnet.evm.nodes.onflow.org",
              chainId: 545, // Flow EVM Testnet Chain ID
            },
          });
          
          setMagic(magicInstance);
        } catch (error) {
          console.error('Failed to initialize Magic:', error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeMagic();
  }, []);

  const value = useMemo(() => {
    return {
      magic,
      isInitializing
    };
  }, [magic, isInitializing]);

  return <MagicContext.Provider value={value}>{children}</MagicContext.Provider>;
};

export default MagicProvider; 