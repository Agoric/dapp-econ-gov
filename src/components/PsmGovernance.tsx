import { Amount } from '@agoric/ertp';
import { WalletContext } from 'lib/wallet';
import { useContext, useEffect, useReducer, useState } from 'react';
import ProposeChange from './ProposeChange';

interface Props {
  instanceName: string;
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

const useRpcDatum = path => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState([]);
  const walletUtils = useContext(WalletContext);

  useEffect(() => {
    const { follow } = walletUtils;
    // FIXME match instanceName, pass as tuple instead
    follow(`:published.psm.IST.AUSD.governance`).then(async follower => {
      setStatus('following');
      const iterable: AsyncIterable<Record<string, unknown>> =
        await follower.getLatestIterable();
      setStatus('got iterable');
      const iterator = iterable[Symbol.asyncIterator]();
      setStatus('got iterator');
      const { value: publishedValue } = await iterator.next();
      setStatus('got value');
      setData(publishedValue);
      console.log('called setData', publishedValue);
      setStatus('received');
    });
  }, [path, walletUtils]);

  return { status, data };
};

export default function PsmGovernance(props: Props) {
  const { status, data } = useRpcDatum(':published.psm.IST.AUSD.governance');

  console.log('render PsmGovernance', status, data);
  const params = null;

  return (
    <div>
      <h2>{props.instanceName}</h2>
      {params
        ? Object.entries(params).map(([name, value]) => (
            <ProposeChange key={name} name={name} currentValue={value} />
          ))
        : 'loading…'}
    </div>
  );
}
