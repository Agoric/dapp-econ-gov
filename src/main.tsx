import './installSesLockdown';
import 'ses';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { devnetWalleUtils, WalletContext } from 'lib/wallet';

const smartWalletProvisioned = await devnetWalleUtils.isWalletProvisioned();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletContext.Provider value={devnetWalleUtils}>
      <App smartWalletProvisioned={smartWalletProvisioned} />
    </WalletContext.Provider>
  </React.StrictMode>
);
