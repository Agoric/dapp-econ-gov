/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import { WalletContext } from 'lib/wallet';
import { useContext, useEffect, useState } from 'react';

const usePublishedDatum = path => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState([]);
  const walletUtils = useContext(WalletContext);

  useEffect(() => {
    const { follow } = walletUtils;
    const fetchData = async () => {
      // FIXME match instanceName, pass as tuple instead
      const follower = await follow(`:published.${path}`);

      setStatus('following');
      const iterable: AsyncIterable<Record<string, unknown>> =
        await follower.getLatestIterable();
      setStatus('got iterable');
      const iterator = iterable[Symbol.asyncIterator]();
      setStatus('got iterator');
      const { value: publishedValue } = await iterator.next();
      setData(publishedValue);
      setStatus('received');
    };
    fetchData().catch(e => console.error('useEffect error', e));
  }, [path, walletUtils]);

  return { status, data };
};

export default function LatestQuestion(props: Props) {
  const { status, data } = usePublishedDatum(
    'committees.Initial_Economic_Committee.latestQuestion'
  );

  console.log('render LatestQuestion', status, data);
  return (
    <>
      <b>{status}</b>
    </>
  );
}
