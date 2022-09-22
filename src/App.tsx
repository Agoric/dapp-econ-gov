import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './installSesLockdown';

import { INTER_LOGO } from 'assets/assets';
import WalletConnection from 'components/WalletConnection';
import {
  brandToInfoAtom,
  governedParamsIndexAtom,
  instanceIdsAtom,
  metricsIndexAtom,
  offersAtom,
  pursesAtom,
  walletAtom,
} from 'store/app';
import { watchContract, watchOffers, watchPurses } from 'utils/updates';

import GovernanceTools from 'components/GovernanceTools';
import 'styles/globals.css';
import { WalletContext } from 'lib/wallet';

interface Props {
  smartWalletProvisioned: boolean;
  walletUtils: any;
}

const App = (props: Props) => {
  const [wallet] = useAtom(walletAtom);
  const [_brandToInfo, mergeBrandToInfo] = useAtom(brandToInfoAtom);
  const [_purses, setPurses] = useAtom(pursesAtom);
  const [_offers, setOffers] = useAtom(offersAtom);
  const [_metrics, setMetricsIndex] = useAtom(metricsIndexAtom);
  const [_governedParams, setGovernedParamsIndex] = useAtom(
    governedParamsIndexAtom
  );
  const [_instanceIds, setInstanceIds] = useAtom(instanceIdsAtom);

  useEffect(() => {
    if (wallet === null) return;

    // TODO: More user-friendly error handling, like a toast.
    watchPurses(wallet, setPurses, mergeBrandToInfo).catch((err: Error) =>
      console.error('got watchPurses err', err)
    );
    watchOffers(wallet, setOffers).catch((err: Error) =>
      console.error('got watchOffers err', err)
    );

    watchContract(wallet, {
      setMetricsIndex,
      setGovernedParamsIndex,
      setInstanceIds,
    });
  }, [
    wallet,
    mergeBrandToInfo,
    setPurses,
    setOffers,
    setMetricsIndex,
    setGovernedParamsIndex,
    setInstanceIds,
  ]);

  if (!props.smartWalletProvisioned) {
    return <p>No smart wallet for your address</p>;
  }

  // FIXME detect and do something different if not
  const smartWalletConnected = true;

  return (
    <>
      <ToastContainer
        enableMultiContainer
        containerId={'Info'}
        position={'bottom-center'}
        closeOnClick={false}
        newestOnTop={true}
        hideProgressBar={true}
        autoClose={false}
      ></ToastContainer>
      <motion.div>
        <motion.div className="min-w-screen container p-4 mx-auto flex justify-between items-center">
          <img src={INTER_LOGO} className="item" alt="Inter Logo" width="200" />
          <WalletConnection />
          <WalletContext.Consumer>
            {walletUtils => walletUtils.getWalletAddress()}
          </WalletContext.Consumer>
        </motion.div>
        <motion.div className="min-w-screen container mx-auto flex justify-center mt-16">
          {smartWalletConnected ? <GovernanceTools /> : 'Connect wallet'}
        </motion.div>
      </motion.div>
    </>
  );
};

export default App;
