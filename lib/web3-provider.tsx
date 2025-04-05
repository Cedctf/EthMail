"use client"

import { Web3 } from 'web3';
import { useEffect, useState } from 'react';
import { useMagic } from '@/components/magic-provider';

const useWeb3 = () => {
  const { magic, isInitializing } = useMagic();
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (!isInitializing && magic) {
        try {
          const web3Instance = new Web3((magic as any).rpcProvider);
          setWeb3(web3Instance);
        } catch (error) {
          console.error('Failed to initialize Web3:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (!isInitializing) {
      initializeWeb3();
    }
  }, [magic, isInitializing]);

  return { web3, isLoading };
};

export default useWeb3; 