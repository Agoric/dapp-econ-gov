import { useAtomValue } from 'jotai';
import { walletUtilsAtom } from 'store/app';

interface Props {
  sourceContract: string;
  description: string;
}

export default function AcceptInvitation(props: Props) {
  const walletUtils = useAtomValue(walletUtilsAtom);

  return (
    <button
      className="btn-primary rounded text-sm py-1 px-2 m-2"
      title={props.sourceContract}
      onClick={() => {
        assert(
          walletUtils,
          'Accept Invitation button should not be visible before wallet connection.',
        );
        const offer = walletUtils.makeOfferToAcceptInvitation(
          props.sourceContract,
          props.description,
        );
        void walletUtils.sendOffer(offer);
      }}
    >
      Accept Invitation
    </button>
  );
}
