/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import HistoryPanel from './HistoryPanel';
import PsmPanel from './PsmPanel';
import VaultsPanel from './VaultsPanel';
import VotePanel from './VotePanel';

export default function GovernanceTools() {
  const tabClassname = ({ selected }) =>
    clsx(
      'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-primary',
      'ring-white ring-opacity-60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2',
      selected
        ? 'bg-white shadow'
        : 'hover:bg-white/[0.5] hover:text-purple-300',
    );

  return (
    <div className="w-full max-w-5xl px-2 pb-16 sm:px-0">
      <Tab.Group defaultIndex={0}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1 shadow-md">
          <Tab key="history" className={tabClassname}>
            History
          </Tab>
          <Tab key="vote" className={tabClassname}>
            Vote
          </Tab>
          <Tab key="psm" className={tabClassname}>
            PSM
          </Tab>
          <Tab key="vaults" className={tabClassname}>
            Vaults
          </Tab>
        </Tab.List>
        <Tab.Panels className="relative mt-4 max-w-4xl mx-auto">
          <Tab.Panel key="history">
            <HistoryPanel />
          </Tab.Panel>
          <Tab.Panel key="vote">
            <VotePanel />
          </Tab.Panel>
          <Tab.Panel key="psm">
            <PsmPanel />
          </Tab.Panel>
          <Tab.Panel key="vaults">
            <VaultsPanel />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
