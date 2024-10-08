import { Fragment } from 'react';
import clsx from 'clsx';
import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { usePublishedDatum } from 'lib/rpc';
import { inferInvitationStatus, charterInvitationSpec } from 'lib/wallet';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import VaultParamChange from './VaultParamChange';
import CharterGuidance from './CharterGuidance';
import DirectorParamChange from './DirectorParamChange';
import PauseVaultDirectorOffers from './PauseVaultDirectorOffers';
import ChangeOracles, { ChangeOraclesMode } from './ChangeOracles';
import PauseLiquidations from './PauseLiquidations';
import AuctioneerParamChange from './AuctioneerParamChange';
import { useAtomValue } from 'jotai';
import { walletUtilsAtom, rpcUtilsAtom } from 'store/app';

const ProposalTypes = {
  addOracles: 'Add Oracle Operators',
  removeOracles: 'Remove Oracle Operators',
  managerParamChange: 'Change Manager Params',
  directorParamChange: 'Change Director Params',
  pauseOffers: 'Pause Vault Offers',
  pauseLiquidations: 'Pause Liquidations',
  auctioneerParamChange: 'Change Auctioneer Params',
};

const networkProposalFilter = _walletUtils => {
  // no filter
  return Boolean;
};

export default function VaultsPanel() {
  const [proposalType, setProposalType] = useState(
    ProposalTypes.managerParamChange,
  );
  const walletUtils = useAtomValue(walletUtilsAtom);
  const rpcUtils = useAtomValue(rpcUtilsAtom);
  const filterProposals = networkProposalFilter(walletUtils);

  const { data: walletCurrent, status } = usePublishedDatum(
    walletUtils
      ? `wallet.${walletUtils.getWalletAddress()}.current`
      : undefined,
  );

  const charterInvitationStatus = inferInvitationStatus(
    status,
    walletCurrent,
    charterInvitationSpec.description,
    rpcUtils?.agoricNames.instance.econCommitteeCharter,
  );
  const charterOfferId = charterInvitationStatus.acceptedIn;

  const body = (() => {
    switch (proposalType) {
      case ProposalTypes.managerParamChange:
        return <VaultParamChange charterOfferId={charterOfferId} />;
      case ProposalTypes.directorParamChange:
        return <DirectorParamChange charterOfferId={charterOfferId} />;
      case ProposalTypes.pauseOffers:
        return <PauseVaultDirectorOffers charterOfferId={charterOfferId} />;
      case ProposalTypes.addOracles:
        return (
          <ChangeOracles
            mode={ChangeOraclesMode.Add}
            charterOfferId={charterOfferId}
          />
        );
      case ProposalTypes.removeOracles:
        return (
          <ChangeOracles
            mode={ChangeOraclesMode.Remove}
            charterOfferId={charterOfferId}
          />
        );
      case ProposalTypes.pauseLiquidations:
        return <PauseLiquidations charterOfferId={charterOfferId} />;
      case ProposalTypes.auctioneerParamChange:
        return <AuctioneerParamChange charterOfferId={charterOfferId} />;
      default:
        return <div>TODO</div>;
    }
  })();

  // Don't allow certain proposal types on mainnet.
  const proposalTypesForSelectedNetwork =
    Object.values(ProposalTypes).filter(filterProposals);

  return (
    <div>
      <motion.div layout>
        <CharterGuidance {...charterInvitationStatus} />
      </motion.div>
      <motion.div layout="position" className="w-full mt-2">
        <div className="p-4 rounded-lg border border-gray-200 shadow-md">
          <Menu as="div" className="relative text-left">
            <h2 className="mb-2 block text-lg leading-5 font-medium text-gray-700">
              Proposal Type
            </h2>
            <Menu.Button className="my-2 inline-flex rounded-md px-3 py-1 text-md font-regular text-slate-900 bg-gray-400 bg-opacity-5 hover:bg-opacity-10 border-2">
              {proposalType}
              <FiChevronDown
                className="ml-2 -mr-1 h-6 w-5"
                aria-hidden="true"
              />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute w-56 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                {proposalTypesForSelectedNetwork.map(v => (
                  <Menu.Item key={v}>
                    {({ active }) => (
                      <button
                        onClick={() => setProposalType(v)}
                        className={clsx(
                          active && 'bg-purple-50',
                          'text-gray-900 group flex items-center px-2 py-2 text-md w-full',
                        )}
                      >
                        {v}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
          {body}
        </div>
      </motion.div>
    </div>
  );
}
