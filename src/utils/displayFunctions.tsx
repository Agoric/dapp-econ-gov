import { AssetKind } from '@agoric/ertp';
import type { Brand } from '@agoric/ertp/src/types';
import {
  stringifyRatio,
  stringifyRatioAsPercent,
  stringifyValue,
} from '@agoric/ui-components';
import { DeliverTxResponse } from '@cosmjs/stargate';
import { IST_ICON } from 'assets/assets';
import { transactionInfoUrl } from 'config';
import { Id as ToastId, toast } from 'react-toastify';
import type { BrandInfo } from 'store/app';

// We pretend the contract already uses the desired param names.
export const displayParamName = (name: string) => {
  if (name === 'EndorsedUI') {
    return 'ReferencedUI';
  }

  // UNTIL https://github.com/Agoric/agoric-sdk/issues/7588
  if (name === 'InterestRate') {
    return 'StabilityFee';
  }

  return name;
};

export const notifySigning = () =>
  toast.loading(<p>Awaiting sign and broadcast...</p>);

export const notifySuccess = (
  toastId: ToastId,
  agoricNet: string,
  tx: DeliverTxResponse,
) => {
  const txHash = tx.transactionHash;
  toast.update(toastId, {
    render: (
      <p>
        <a
          className="no-underline hover:underline"
          href={transactionInfoUrl(agoricNet, txHash)}
          target={txHash}
          title={txHash}
        >
          Transaction
        </a>{' '}
        sent.
      </p>
    ),
    type: toast.TYPE.SUCCESS,
    isLoading: false,
    closeButton: true,
  });
};

export const displayBrandLabel = (brand?: Brand) =>
  brand?.toString()?.split(' ')?.slice(-2, -1)[0];

export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

export const notifyError = (err: Error, toastId?: ToastId) => {
  console.log(err);
  if (toastId) {
    return toast.update(toastId, {
      render: err.message,
      type: toast.TYPE.ERROR,
      isLoading: false,
      closeButton: true,
    });
  } else {
    return toast.error(err.message, { isLoading: false, closeButton: true });
  }
};

export const dismissToast = (toastId: ToastId) => toast.dismiss(toastId);

const getLogoForBrandPetname = (brandPetname: string) => {
  switch (brandPetname) {
    case 'IST':
      return IST_ICON;
    default:
      return IST_ICON;
  }
};

export const displayPetname = (pn: Array<string> | string) =>
  Array.isArray(pn) ? pn.join('.') : pn;

const DEFAULT_DECIMAL_PLACES = 6;

export const makeDisplayFunctions = (brandToInfo: Map<Brand, BrandInfo>) => {
  const getDecimalPlaces = (brand?: Brand) => {
    if (!brand) return DEFAULT_DECIMAL_PLACES;

    return brandToInfo.get(brand)?.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
  };

  const getPetname = (brand?: Brand | null) =>
    (brand && brandToInfo.get(brand)?.petname) ?? '';

  const displayPercent = (ratio: any, placesToShow: number) => {
    return stringifyRatioAsPercent(ratio, getDecimalPlaces, placesToShow);
  };

  const displayBrandPetname = (brand?: Brand | null) => {
    return displayPetname(getPetname(brand));
  };

  const displayRatio = (ratio: any, placesToShow: number) => {
    return stringifyRatio(ratio, getDecimalPlaces, placesToShow);
  };

  const displayAmount = (amount: any, placesToShow: number) => {
    const decimalPlaces = getDecimalPlaces(amount.brand);
    return stringifyValue(
      amount.value,
      AssetKind.NAT,
      decimalPlaces,
      placesToShow,
    );
  };

  const displayBrandIcon = (brand?: Brand | null) =>
    getLogoForBrandPetname(getPetname(brand));

  return {
    displayPercent,
    displayBrandPetname,
    displayRatio,
    displayAmount,
    getDecimalPlaces,
    displayBrandIcon,
  };
};
