/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import AcceptInvitation from './AcceptInvitation';
import OpenQuestions from './OpenQuestions';
import PsmPanel from './PsmPanel';

export default function GovernanceTools() {
  const tabClassname = ({ selected }) =>
    clsx(
      'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
      selected
        ? 'bg-white shadow'
        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
    );

  return (
    <div className="w-full max-w-md px-2 py-16 sm:px-0">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab key="history" className={tabClassname}>
            History
          </Tab>
          <Tab key="vote" className={tabClassname}>
            Vote
          </Tab>
          <Tab key="propose" className={tabClassname}>
            Propose Change
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel
            key="history"
            className={clsx(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            This will show proposed changes and their outcomes.
          </Tab.Panel>
          <Tab.Panel key="vote">
            You must first have received and accepted an invitation to the
            Economic Committee.
            <AcceptInvitation
              sourceContract="economicCommittee"
              // FIXME multiple voters
              // Need to look up the invitation from wallet 'balance' updates like,
              // wallet update {
              //   currentAmount: {
              //     brand: { boardId: 'board02810', iface: 'Alleged: Zoe Invitation brand' },
              //     value: [ [Object] ]
              //   },
              //   updated: 'balance'
              // } [
              //   {
              //     description: 'Voter0',
              //     handle: { boardId: null, iface: 'Alleged: InvitationHandle' },
              //     installation: { boardId: 'board04312', iface: 'Alleged: BundleInstallation' },
              //     instance: { boardId: 'board0074', iface: 'Alleged: InstanceHandle' }
              //   }
              // ]
              //
              // would be easier if the contracted match a substring instead of exact. but also more room for surprises.
              // Since I have to query the update history anyway, I can just have the app load figure out the state of readiness:
              // if you have no key, you have no account. connect Keplr.
              // if you have no history, you have no smart wallet. go provision one
              // for each contract privilege:
              //   if you have no balance updates granting those, inform you're not on the committee
              //   if you have unused invitation, prompt to accept it
              //   record offerId of the offer in history in which the invitation was accepted
              // now you have the wallet state to do privileged actions

              description="Voter0"
            />
            <OpenQuestions />
          </Tab.Panel>
          <Tab.Panel
            key="propose"
            className={clsx(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            <PsmPanel />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
