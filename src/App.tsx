import type { Id as ToastId } from 'react-toastify';
import NoticeBanner from 'components/NoticeBanner';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, MouseEventHandler, useEffect } from 'react';
import { FiChevronDown, FiExternalLink } from 'react-icons/fi';
import { ToastContainer } from 'react-toastify';
import { INTER_LOGO } from 'assets/assets';
import GovernanceTools from 'components/GovernanceTools';
import { supportedNetworks } from 'config';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  connectWalletIndicatorAtom,
  rpcUtilsAtom,
  walletToastIdAtom,
  walletUtilsAtom,
} from 'store/app';
import { agoricNet, makeRpcUtils, RpcUtils } from 'lib/rpc';
import { makeWalletUtils } from 'lib/wallet';
import { Oval } from 'react-loader-spinner';
import { dismissToast, notifyError } from 'utils/displayFunctions';

import 'react-toastify/dist/ReactToastify.css';
import 'styles/globals.css';

const Item = ({
  label,
  onClick,
}: {
  label: string;
  onClick: MouseEventHandler;
}) => {
  return (
    <div className="px-1 py-1 ">
      <Menu.Item>
        {({ active }) => (
          <button
            onClick={onClick}
            className={`${
              active ? 'bg-violet-300 text-white' : 'text-gray-900'
            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
          >
            {label}
          </button>
        )}
      </Menu.Item>
    </div>
  );
};

const NetPicker = () => {
  const items = supportedNetworks.map(config => (
    <Item
      key={config}
      onClick={() => {
        window.location.assign(
          window.location.origin + `/?agoricNet=${config}`,
        );
      }}
      label={config}
    />
  ));

  return (
    <Menu as="div" className="mb-2 mr-2 relative inline-block text-left">
      <Menu.Button className="btn-header">
        {agoricNet}
        <FiChevronDown className="ml-2 -mr-1 h-6 w-5" aria-hidden="true" />
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
        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          {items}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const WalletButton = () => {
  const [walletUtils, setWalletUtils] = useAtom(walletUtilsAtom);
  const rpcUtils = useAtomValue(rpcUtilsAtom);
  const [connectWalletIndicator, setConnectWalletIndicator] = useAtom(
    connectWalletIndicatorAtom,
  );
  const [walletToastId, setWalletToastId] = useAtom(walletToastIdAtom);

  const explorerHref = walletUtils?.getAddressExplorerHref();
  const address = walletUtils?.getWalletAddress();

  const connectWallet = async () => {
    if (connectWalletIndicator) return;

    if (walletToastId) {
      dismissToast(walletToastId);
      setWalletToastId(undefined);
    }

    if (!rpcUtils) {
      setWalletToastId(
        notifyError(
          new Error('Error connecting to wallet, cannot connect to RPC.'),
        ) as ToastId,
      );
      return;
    }

    setConnectWalletIndicator(true);

    try {
      const walletUtils = await makeWalletUtils(rpcUtils);
      setWalletUtils(walletUtils);
    } catch (e) {
      console.error('Error connecting to wallet:', e);
      setWalletToastId(
        notifyError(
          new Error('Error connecting to wallet: ' + e.message),
        ) as ToastId,
      );
    }
    setConnectWalletIndicator(false);
  };

  return address ? (
    <a
      target="block-explorer"
      href={explorerHref}
      title="Block Explorer"
      className="btn-header no-underline"
    >
      {address}
      <FiExternalLink className="my-1 ml-2 -mr-1 h-4 w-5" />
    </a>
  ) : (
    <button className="btn-header flex flex-row gap-2" onClick={connectWallet}>
      <div>Connect Wallet</div>
      {connectWalletIndicator && (
        <Oval height={20} width={20} color="var(--color-primary)" />
      )}
    </button>
  );
};

const App = () => {
  const setWalletUtils = useSetAtom(walletUtilsAtom);
  const setRpcUtils = useSetAtom(rpcUtilsAtom);
  const setConnectWalletIndicatorAtom = useSetAtom(connectWalletIndicatorAtom);
  const setWalletToastId = useSetAtom(walletToastIdAtom);

  useEffect(() => {
    let isCancelled = false;
    const loadWalletUtils = async () => {
      setConnectWalletIndicatorAtom(true);

      let rpcUtils: RpcUtils;
      try {
        rpcUtils = await makeRpcUtils();
        if (isCancelled) return;
        setRpcUtils(rpcUtils);
      } catch (e) {
        console.error('Error connecting to RPC:', e);
        notifyError(
          new Error('Error connecting to RPC, see console for details.'),
        );
        setConnectWalletIndicatorAtom(false);
        return;
      }

      try {
        const walletUtils = await makeWalletUtils(rpcUtils);
        if (isCancelled) return;
        setWalletUtils(walletUtils);
      } catch (e) {
        console.error('Error connecting to wallet:', e);
        setWalletToastId(
          notifyError(
            new Error('Error connecting to wallet: ' + e.message),
          ) as ToastId,
        );
      }
      setConnectWalletIndicatorAtom(false);
    };

    void loadWalletUtils();

    return () => {
      isCancelled = true;
    };
  }, [
    setConnectWalletIndicatorAtom,
    setRpcUtils,
    setWalletToastId,
    setWalletUtils,
  ]);

  return (
    <>
      <NoticeBanner />
      <ToastContainer
        position={'bottom-right'}
        closeOnClick={false}
        newestOnTop={true}
        autoClose={false}
      />
      <div>
        <div className="min-w-screen container p-4 mx-auto flex flex-wrap justify-between items-center">
          <img
            src={INTER_LOGO}
            className="item mb-2"
            alt="Inter Logo"
            width="200"
          />
          <div>
            <NetPicker />
            <WalletButton />
          </div>
        </div>
        <div className="min-w-screen container mx-auto flex justify-center sm:mt-8">
          <GovernanceTools />
        </div>
      </div>
    </>
  );
};

export default App;
