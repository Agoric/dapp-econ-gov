import './installSesLockdown';
import 'ses';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { makeWalletUtils } from 'lib/wallet';

const walletUtils = await makeWalletUtils('devnet');

const smartWalletProvisioned = await walletUtils.isWalletProvisioned();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App
      smartWalletProvisioned={smartWalletProvisioned}
      walletUtils={walletUtils}
    />
  </React.StrictMode>
);

walletUtils.prepareToSign();
