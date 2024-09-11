import type { Amount } from '@agoric/ertp/src/types';
import { motion } from 'framer-motion';
import { LoadStatus, usePublishedDatum } from 'lib/rpc';
import { useState } from 'react';
import { AmountInput, PercentageInput } from './inputs';
import { SubmitInput } from './SubmitButton';
import { useAtomValue } from 'jotai';
import { walletUtilsAtom } from 'store/app';

interface Props {
  anchorName: string;
  psmCharterOfferId: string;
}

export type ParameterValue =
  | {
      type: 'invitation';
      value: Amount<'set'>;
    }
  | {
      type: 'ratio';
      value: { numerator: Amount<'nat'>; denominator: Amount<'nat'> };
    }
  | {
      type: 'amount';
      value: Amount;
    };

export default function ProposeParamChange(props: Props) {
  const walletUtils = useAtomValue(walletUtilsAtom);
  const { data, status } = usePublishedDatum(
    `psm.IST.${props.anchorName}.governance`,
  );
  const [minutesUntilClose, setMinutesUntilClose] = useState(10);

  const [paramPatch, setParamPatch] = useState({});

  console.log('ProposeParamChange', { data, paramPatch });

  const canGovern = !!props.psmCharterOfferId;

  function displayParam(name: string, { type, value }: ParameterValue) {
    const arg = paramPatch[name] || value;

    switch (type) {
      case 'amount':
        return (
          <AmountInput
            suffix={name === 'MintLimit' ? 'IST' : null}
            value={arg.value}
            brand={value.brand}
            onChange={newVal =>
              setParamPatch({
                ...paramPatch,
                [name]: { brand: value.brand, value: newVal },
              })
            }
          />
        );
      case 'ratio':
        return (
          <PercentageInput
            ratio={arg}
            onChange={newRatio =>
              setParamPatch({
                ...paramPatch,
                [name]: newRatio,
              })
            }
            max="100"
          />
        );
      default:
        return <i className="text-gray-500">{type} not supported</i>;
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.debug({ event });
    assert(
      walletUtils,
      'Missing walletUtils. Button should not be enabled before wallet connection.',
    );
    const offer = walletUtils.makeVoteOnPSMParams(
      props.psmCharterOfferId,
      props.anchorName,
      paramPatch,
      minutesUntilClose,
    );
    void walletUtils.sendOffer(offer);
  }

  let content = (
    <div className="text-gray-500 mt-2">
      <i>Waiting for existing parameter values...</i>
    </div>
  );

  const paramLabel = name => {
    switch (name) {
      case 'GiveMintedFee':
        return 'Set GiveMinted Fee (Fee charged when user swaps IST for supported stable token)';
      case 'WantMintedFee':
        return 'Set WantMinted Fee (Fee charged when user swaps supported stable token for IST)';
      case 'MintLimit':
        return 'Set Mint Limit';
      default:
        return name;
    }
  };

  // styling examples https://tailwindcss-forms.vercel.app/
  // XXX tell user when the storage node doesn't exist, i.e. invalid anchor
  if (status === LoadStatus.Received) {
    content = (
      <motion.div
        className="px-1 overflow-hidden"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        transition={{ type: 'tween' }}
      >
        <form onSubmit={handleSubmit}>
          {Object.entries(data.current).map(([name, value]) => (
            <div className="mb-2" key={name}>
              <label className="block">
                <span className="text-gray-700">{paramLabel(name)}</span>
                <div className="w-full">
                  {displayParam(name, value as ParameterValue)}
                </div>
              </label>
            </div>
          ))}
          <label className="block">
            <span className="text-gray-700">Minutes until close of vote</span>
            <input
              type="number"
              className="rounded mt-1 block w-full border-gray-300 focus:border-purple-300 focus:ring-purple-300"
              value={minutesUntilClose}
              onChange={e => setMinutesUntilClose(e.target.valueAsNumber)}
            />
          </label>
          <div className="w-full flex flex-row justify-end mt-2">
            <SubmitInput
              canSubmit={canGovern}
              value="Propose Parameter Change"
            />
          </div>
        </form>
      </motion.div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 block text-lg leading-5 font-medium text-gray-700">
        Parameters
      </h2>
      {content}
    </div>
  );
}
