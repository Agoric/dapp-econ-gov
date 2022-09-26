import type { Bech32Config, ChainInfo, Currency } from '@keplr-wallet/types';

export const AGORIC_COIN_TYPE = 564;
export const COSMOS_COIN_TYPE = 118;

export const stakeCurrency: Currency = {
  coinDenom: 'BLD',
  coinMinimalDenom: 'ubld',
  coinDecimals: 6,
  coinGeckoId: undefined,
};
export const stableCurrency: Currency = {
  coinDenom: 'IST',
  coinMinimalDenom: 'uist',
  coinDecimals: 6,
  coinGeckoId: undefined,
};

export const bech32Config: Bech32Config = {
  bech32PrefixAccAddr: 'agoric',
  bech32PrefixAccPub: 'agoricpub',
  bech32PrefixValAddr: 'agoricvaloper',
  bech32PrefixValPub: 'agoricvaloperpub',
  bech32PrefixConsAddr: 'agoricvalcons',
  bech32PrefixConsPub: 'agoricvalconspub',
};

/**
 * @param {string} networkConfig URL
 * @param {string} rpcAddr URL or origin
 * @param {string} chainId
 * @param {string} [caption]
 * @returns {import('@keplr-wallet/types').ChainInfo}
 */
const makeChainInfo = (networkConfig, rpcAddr, chainId, caption) => {
  const coinType = Number(
    new URL(networkConfig).searchParams.get('coinType') || AGORIC_COIN_TYPE
  );
  const hostname = new URL(networkConfig).hostname;
  const network = hostname.split('.')[0];
  let rpc;
  let api;

  // XXX I don't know why this doesn't work here like it does in agoric-sdk
  if (false && network !== hostname) {
    rpc = `https://${network}.rpc.agoric.net`;
    api = `https://${network}.api.agoric.net`;
  } else {
    rpc = rpcAddr.match(/:\/\//) ? rpcAddr : `http://${rpcAddr}`;
    api = rpc.replace(/(:\d+)?$/, ':1317');
  }

  return {
    rpc,
    rest: api,
    chainId,
    chainName: caption || `Agoric ${network}`,
    stakeCurrency,
    walletUrlForStaking: `https://${network}.staking.agoric.app`,
    bip44: {
      coinType,
    },
    bech32Config,
    currencies: [stakeCurrency, stableCurrency],
    feeCurrencies: [stableCurrency],
    features: ['stargate', 'ibc-transfer'],
  };
};

/**
 * @param {string} networkConfig URL
 * @param {object} io
 * @param {typeof fetch} io.fetch
 * @param {import('@keplr-wallet/types').Keplr} io.keplr
 * @param {typeof Math.random} io.random
 * @param {string} [caption]
 */
export async function suggestChain(
  networkConfig,
  { fetch, keplr, random },
  caption = undefined
) {
  console.log('suggestChain: fetch', networkConfig); // log net IO
  const res = await fetch(networkConfig);
  if (!res.ok) {
    throw Error(`Cannot fetch network: ${res.status}`);
  }
  const { chainName: chainId, rpcAddrs } = await res.json();
  const rpcAddr = rpcAddrs[Math.floor(random() * rpcAddrs.length)];

  const chainInfo = makeChainInfo(networkConfig, rpcAddr, chainId, caption);
  console.log('chainInfo', chainInfo);
  await keplr.experimentalSuggestChain(chainInfo);
  await keplr.enable(chainId);
  console.log('keplr.enable chainId =', chainId, 'done');

  return chainInfo;
}
