import type { Amount, Brand, DisplayInfo } from '@agoric/ertp/src/types';
import type { Ratio } from '@agoric/zoe/src/contractSupport';
import type { WalletUtils } from 'lib/wallet';
import type { RpcUtils } from 'lib/rpc';
import type { Id as ToastId } from 'react-toastify';
import { atom, PrimitiveAtom } from 'jotai';
import { makeDisplayFunctions } from 'utils/displayFunctions';
import { mapAtom } from 'utils/helpers';

export type BrandInfo = DisplayInfo<'nat'> & {
  petname: string;
};

// XXX never filled so all the display functions are generic
const brandToInfoAtom = mapAtom<Brand, BrandInfo>();

export type Metrics = {
  anchorPoolBalance: Amount;
  feePoolBalance: Amount;
  totalAnchorProvided: Amount;
  totalStableProvided: Amount;
};

export type GovernedParams = {
  GiveMintedFee: { type: 'ratio'; value: Ratio };
  MintLimit: { type: 'amount'; value: Amount };
  WantMintedFee: { type: 'ratio'; value: Ratio };
};

export const displayFunctionsAtom = atom(get => {
  const brandToInfo = get(brandToInfoAtom);
  return makeDisplayFunctions(brandToInfo);
});

export const walletUtilsAtom = atom<WalletUtils | null>(
  null,
) as PrimitiveAtom<WalletUtils | null>;

export const rpcUtilsAtom = atom<RpcUtils | null>(
  null,
) as PrimitiveAtom<RpcUtils | null>;

export const connectWalletIndicatorAtom = atom(false);

export const walletToastIdAtom = atom<ToastId | undefined>(
  undefined,
) as PrimitiveAtom<ToastId | undefined>;

/**  Experimental feature flag. */
export const previewEnabledAtom = atom(_get => false);
