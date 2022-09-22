import { SigningStargateClient as AmbientClient } from '@cosmjs/stargate';
import React from 'react';
import { makeChainInfo } from './chainInfo.js';
import { makeInteractiveSigner } from './keyManagement.js';
import { boardSlottingMarshaller } from './rpc';
import { makeRpcUtils } from './rpc.js';

const marshaller = boardSlottingMarshaller();

export const makeWalletUtils = async (agoricNet: string) => {
  // @ts-expect-error window type
  const { keplr } = window;
  assert(keplr, 'Missing keplr');

  const { agoricNames, fromBoard, vstorage } = await makeRpcUtils({
    agoricNet,
  });
  const makeChainKit = async (agoricNet: string) => {
    const netConfUrl = `https://${agoricNet}.agoric.net/network-config`;
    const networkConfig = await fetch(netConfUrl).then(r => r.json());

    const chainInfo = makeChainInfo(
      netConfUrl,
      networkConfig.rpcAddrs[0],
      networkConfig.chainName,
      'caption???'
    );
    console.log({ networkConfig: netConfUrl });

    const signer = await makeInteractiveSigner(
      chainInfo,
      keplr,
      AmbientClient.connectWithSigner
    );

    return {
      chainInfo,
      faucet: `https://${agoricNet}.faucet.agoric.net/`,
      agoricNames,
      fromBoard,
      clock: () => Date.now(),
      signer,
    };
  };

  const chainKit = await makeChainKit(agoricNet);
  console.log({ chainKit });

  const walletKey = await keplr.getKey(chainKit.chainInfo.chainId);

  return {
    chainKit,
    async isWalletProvisioned() {
      const { bech32Address } = walletKey;

      console.log({ bech32Address });

      try {
        vstorage.readAll(`published.wallet.${bech32Address}`);
        return true;
      } catch (_e) {
        return false;
      }
    },
    getWalletAddress() {
      return walletKey.bech32Address;
    },
    makeOfferToAcceptInvitation(sourceContractName) {
      const sourceContract = agoricNames.instance[sourceContractName];
      assert(sourceContract, `missing contract ${sourceContractName}`);

      const id = Math.round(Date.now() / 1000);

      /** @type {import('../lib/psm.js').OfferSpec} */
      return {
        id,
        invitationSpec: {
          source: 'purse',
          instance: sourceContract,
          // description: 'Voter0', // XXX it may not always be
        },
        proposal: {},
      };
    },
    prepareToSign() {
      console.log('will sign with', chainKit.signer);

      async () => {
        try {
          const stuff = await chainKit.signer.getSequence();
          console.log({ sequence: stuff });
        } catch (notOnChain) {
          console.error('getSequence', notOnChain);
          alert(notOnChain.message);
        }
      };
    },
    sendOffer(offer) {
      const payload = {
        method: 'executeOffer',
        offer,
      };

      const capData = marshaller.serialize(payload);
      const message = JSON.stringify(capData);

      return chainKit.signer.submitSpendAction(message);
    },
  };
};

// XXX hard-coded
export const devnetWalleUtils = await makeWalletUtils('devnet');

export const WalletContext = React.createContext(devnetWalleUtils);
