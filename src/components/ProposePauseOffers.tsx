import { motion } from 'framer-motion';
import { useState } from 'react';
import { SubmitInput } from './SubmitButton';
import { walletUtilsAtom } from 'store/app';
import { useAtomValue } from 'jotai';

interface Props {
  anchorName: string;
  psmCharterOfferId: string;
}

export default function ProposePauseOffers(props: Props) {
  const walletUtils = useAtomValue(walletUtilsAtom);
  // read the initial state from rpc?
  const [checked, setChecked] = useState({
    wantMinted: false,
    giveMinted: false,
  });

  const [minutesUntilClose, setMinutesUntilClose] = useState(10);

  const canGovern = !!props.psmCharterOfferId;

  function handleCheckChange(event) {
    const { target } = event;
    assert(target.type === 'checkbox');
    const { name } = target;
    setChecked({ ...checked, [name]: target.checked });
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.debug({ event, checked, minutesUntilClose });
    assert(
      walletUtils,
      'Missing walletUtils. Button should not be enabled before wallet connection.',
    );
    const toPause = Object.entries(checked)
      .filter(([_, check]) => check)
      .map(([name]) => name);
    const offer = walletUtils.makeVoteOnPausePSMOffers(
      props.psmCharterOfferId,
      props.anchorName,
      toPause,
      minutesUntilClose,
    );
    void walletUtils.sendOffer(offer);
  }

  const optionMessage = option => {
    switch (option) {
      case 'wantMinted':
        return 'Pause wantMinted (IST minting) — Users will not be able to swap supported stable tokens for IST in PSM';
      case 'giveMinted':
        return 'Pause giveMinted (IST burning) - Users will not be able to swap IST for supported stable tokens in PSM';
      default:
        return option;
    }
  };

  // styling examples https://tailwindcss-forms.vercel.app/
  return (
    <motion.div
      className="overflow-hidden px-1"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      transition={{ type: 'tween' }}
    >
      <form onSubmit={handleSubmit}>
        <h2 className="mb-2 block text-lg leading-5 font-medium text-gray-700">
          Pause Offers
        </h2>
        <p className="text-warning">Current filter not displayed</p>
        <div className="block my-4">
          {Object.keys(checked).map(str => (
            <div key={str} className="my-2 leading-5">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="cursor-pointer text-primary focus:border-primary focus:ring-primary"
                  name={str}
                  checked={checked[str]}
                  onChange={handleCheckChange}
                />
                <span className="ml-2">{optionMessage(str)}</span>
              </label>
            </div>
          ))}
        </div>
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
          <SubmitInput canSubmit={canGovern} value="Propose Parameter Change" />
        </div>
      </form>
    </motion.div>
  );
}
