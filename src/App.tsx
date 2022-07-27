import React, { FC, useMemo } from 'react';
import logo from './logo.svg';
import './App.css';
import {HomeDC} from "./pages/index"
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    CoinbaseWalletAdapter,
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { createDefaultAuthorizationResultCache, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');
function App() {
  const network = WalletAdapterNetwork.Testnet;
  const networks = clusterApiUrl('devnet');
  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
        new SolanaMobileWalletAdapter({
            appIdentity: { name: 'Solana Wallet Adapter App' },
            authorizationResultCache: createDefaultAuthorizationResultCache(),
        }),
        new CoinbaseWalletAdapter(),
        new PhantomWalletAdapter(),
        new GlowWalletAdapter(),
        new SlopeWalletAdapter(),
        new SolflareWalletAdapter({ network }),
        new TorusWalletAdapter(),
    ],
    [network]
);
  return (
    
    <div className="App">
      

      <ConnectionProvider endpoint={networks}>
            <WalletProvider wallets={wallets} autoConnect>
                      <HomeDC/>
            </WalletProvider>
        </ConnectionProvider>
    
    </div>
  );
}

export default App;
