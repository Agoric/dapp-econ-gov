import { WalletContext } from 'lib/wallet';
import { useContext } from 'react';
import AcceptInvitation from './AcceptInvitation';
import OpenQuestions from './OpenQuestions';

interface Props {}

export default function VotePanel(props: Props) {
  const walletUtils = useContext(WalletContext);
  const invitationRecord = walletUtils.invitationLike('Voter');
  console.log({ invitationRecord });
  if (!invitationRecord) {
    return (
      <p>
        You must first have received an invitation to the Economic Committee.
      </p>
    );
  }
  if (!invitationRecord.acceptedIn) {
    return (
      <div>
        To vote you will need to accept your invitation to the Economic
        Committee.
        <AcceptInvitation
          description={invitationRecord.description}
          sourceContract="economicCommittee"
        />
      </div>
    );
  }
  const previousOfferId = invitationRecord.acceptedIn;
  return (
    <div>
      <p>
        You may vote using the invitation makers from offer{' '}
        <tt>{previousOfferId}</tt>
      </p>
      <OpenQuestions />
    </div>
  );
}
