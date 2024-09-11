import type { QuestionDetails } from '@agoric/governance/src/types';
import type { RpcRemote } from '../govTypes';
import { motion } from 'framer-motion';
import { usePublishedDatum, usePublishedHistory } from 'lib/rpc';
import { inferInvitationStatus } from 'lib/wallet';
import { capitalize } from 'utils/displayFunctions';
import { timestampPassed } from 'utils/helpers';
import AcceptInvitation from './AcceptInvitation';
import { OfferId, VoteOnQuestion } from './questions';
import { useAtomValue } from 'jotai';
import { walletUtilsAtom } from 'store/app';

interface Props {}

function Eligibility({
  status,
  invitation,
  acceptedIn,
}: ReturnType<typeof inferInvitationStatus>) {
  switch (status) {
    case 'idle':
      return (
        <p>Waiting for wallet connection. Try &quot;Connect Wallet&quot;.</p>
      );
    case 'nodata':
      return <p>Loading…</p>;
    case 'missing':
      return (
        <p className="rounded-lg py-5 px-6 text-base mb-3 bg-red-100 text-red-700">
          You must first have received an invitation to the Economic Committee.
        </p>
      );
    case 'available':
      return (
        <div className="rounded-lg py-5 px-6 text-base mb-3 bg-yellow-100 text-yellow-700">
          To vote you will need to accept your invitation to the Economic
          Committee.
          <AcceptInvitation
            // @ts-expect-error invitation type
            description={invitation.description}
            // TODO validate earlier that this invitation is from this contract
            sourceContract="economicCommittee"
          />
          and then <b>reload the page</b>.
        </div>
      );
    case 'accepted':
      return (
        <p className="rounded-lg py-5 px-6 text-base mb-3 bg-green-100 text-green-700">
          You may vote using the invitation makers from offer{' '}
          <OfferId id={acceptedIn} />
        </p>
      );
    default:
      return <strong>unknown status {status}</strong>;
  }
}

function VoteOnQuestions(props: {
  ecOfferId: string;
  instance?: [property: string, value: RpcRemote][];
}) {
  const history = usePublishedHistory(
    'committees.Economic_Committee.latestQuestion',
  );
  console.debug('question history', history.data);

  if (history.status !== 'received') {
    return <p>{capitalize(history.status)} for a question...</p>;
  }

  const openQuestions = history.data.filter(
    (q: QuestionDetails) => !timestampPassed(Number(q.closingRule.deadline)),
  );

  return (
    <>
      {openQuestions.map((details: QuestionDetails) => (
        <VoteOnQuestion
          {...props}
          details={details}
          key={details.closingRule.deadline}
        />
      ))}
    </>
  );
}

export default function VotePanel(_props: Props) {
  const walletUtils = useAtomValue(walletUtilsAtom);
  const { data, status } = usePublishedDatum(
    walletUtils
      ? `wallet.${walletUtils.getWalletAddress()}.current`
      : undefined,
  );
  const { status: instanceStatus, data: instance } = usePublishedDatum(
    'agoricNames.instance',
  );

  const invitationStatus = inferInvitationStatus(status, data, 'Voter');
  const previousOfferId = invitationStatus.acceptedIn;

  return (
    <div>
      <motion.div layout>
        <Eligibility {...invitationStatus} />
      </motion.div>
      <motion.div layout="position">
        {instanceStatus === 'received' &&
          invitationStatus.status === 'accepted' &&
          previousOfferId && (
            <VoteOnQuestions ecOfferId={previousOfferId} instance={instance} />
          )}
      </motion.div>
    </div>
  );
}
