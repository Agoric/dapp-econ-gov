import { SigningStargateClient as AmbientClient } from '@cosmjs/stargate';
import { makeChainInfo } from './chainInfo.js';
import { makeInteractiveSigner } from './keyManagement.js';
import { makeRpcUtils } from './rpc.js';

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
  };
};
