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
 * @param networkConfig URL
 * @param rpcAddr URL or origin
 */
export const makeChainInfo = (
  networkConfig: string,
  rpcAddr: string,
  chainId: string,
  caption?: string
): ChainInfo => {
  const coinType = Number(
    new URL(networkConfig).searchParams.get('coinType') || AGORIC_COIN_TYPE
  );
  const hostname = new URL(networkConfig).hostname;
  const network = hostname.split('.')[0];
  let rpc;
  let api;

  if (network !== hostname) {
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
    // gasPriceStep is no more?
  };
};
