// TODO source from sdk
// @ts-check
/// <reference types="ses"/>

import type { MinimalNetworkConfig } from 'utils/networkConfig';
import {
  ValueFollower,
  iterateLatest,
  makeFollower,
  makeLeader,
} from '@agoric/casting';
import { makeImportContext } from './makeImportContext';
import { archivingAlternative, networkConfigUrl, rpcUrl } from 'config';
import {
  AgoricChainStoragePathKind,
  makeAgoricChainStorageWatcher,
} from '@agoric/rpc';
import { makeVstorageKit } from '@agoric/client-utils';
import { sample } from 'lodash-es';
import { notifyError } from 'utils/displayFunctions';
import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { rpcUtilsAtom } from 'store/app';

/**
 * @typedef {{boardId: string, iface: string}} RpcRemote
 */

export const marshal = makeImportContext().fromBoard;

const fromAgoricNet = (str: string): Promise<MinimalNetworkConfig> => {
  const [netName, chainName] = str.split(',');
  if (chainName) {
    return Promise.resolve({ chainName, rpcAddrs: [rpcUrl(netName)] });
  }
  return fetch(networkConfigUrl(netName)).then(res => res.json());
};

const timeoutDurationMS = 10_000;

const makeAgoricNames = async (
  follow: (path: string) => Promise<ValueFollower<unknown>>,
) => {
  const timeout = setTimeout(
    () =>
      notifyError(
        new Error(
          'Connecting to RPC taking longer than expected. Check console for details.',
        ),
      ),
    timeoutDurationMS,
  );
  const entries = await Promise.all(
    ['brand', 'instance'].map(async kind => {
      const f = follow(`:published.agoricNames.${kind}`);
      for await (const { value } of iterateLatest<any>(f)) {
        return [kind, Object.fromEntries(value)];
      }
    }),
  );
  clearTimeout(timeout);
  return Object.fromEntries(entries);
};

const usp = new URLSearchParams(window.location.search);
export const agoricNet = usp.get('agoricNet') || 'main';
console.log('RPC server:', agoricNet);

export const makeRpcUtils = async () => {
  const netConfigURL = networkConfigUrl(agoricNet);
  const networkConfig = await fromAgoricNet(agoricNet);

  const { rpcAddrs, chainName } = networkConfig;
  const leader = makeLeader(archivingAlternative(chainName, rpcAddrs[0]), {});

  const { vstorage: vst } = makeVstorageKit({ fetch }, { chainName, rpcAddrs });

  // XXX memoize on path
  const follow = (path: string) =>
    makeFollower(path, leader, { unserializer: marshal, proof: 'none' });

  const agoricNames = await makeAgoricNames(follow);
  const vstorage = {
    keys: async (path: string, blockHeight = 0) => {
      const response = await vst.readStorage(path, {
        kind: 'children',
        height: String(blockHeight),
      });
      return response.children;
    },
  };

  const storageWatcher = makeAgoricChainStorageWatcher(
    sample(rpcAddrs),
    chainName,
    marshal.unserialize,
  );

  return {
    agoricNames,
    follow,
    leader,
    vstorage,
    storageWatcher,
    agoricNet,
    netConfigURL,
    networkConfig,
  };
};
export type RpcUtils = Awaited<ReturnType<typeof makeRpcUtils>>;

export enum LoadStatus {
  Idle = 'idle',
  Waiting = 'waiting',
  Received = 'received',
}

/**
 * Fetches the list of children keys under a given vstorage node.
 *
 * @param {string} path The path of the vstorage node to query
 */
export const useVstorageChildKeys = (path: string) => {
  const [status, setStatus] = useState(LoadStatus.Idle);
  const [data, setData] = useState([]);
  const rpcUtils = useAtomValue(rpcUtilsAtom);

  useEffect(() => {
    if (!rpcUtils) {
      setStatus(LoadStatus.Idle);
      return;
    }

    const fetchKeys = async () => {
      console.debug('useVstorageChildKeys reading', path);
      setStatus(LoadStatus.Waiting);
      const keys = await rpcUtils.vstorage.keys(path);
      setData(keys);
      setStatus(LoadStatus.Received);
    };
    fetchKeys().catch(e => notifyError(e));
  }, [path, rpcUtils]);

  return { status, data };
};

export const usePublishedDatum = (path?: string) => {
  const [status, setStatus] = useState(LoadStatus.Idle);
  const [data, setData] = useState({} as any);
  const rpcUtils = useAtomValue(rpcUtilsAtom);

  useEffect(() => {
    setData({});
    if (path === undefined || !rpcUtils) {
      setStatus(LoadStatus.Idle);
      return;
    }

    const { storageWatcher } = rpcUtils;
    setStatus(LoadStatus.Waiting);

    let didError = false;
    return storageWatcher.watchLatest(
      [AgoricChainStoragePathKind.Data, `published.${path}`],
      value => {
        setData(value);
        setStatus(LoadStatus.Received);
      },
      e => {
        if (didError) {
          console.error(e);
          return;
        }
        didError = true;
        notifyError(
          new Error(
            'Error reading vstorage data for path "' + path + '": ' + e,
          ),
        );
      },
    );
  }, [path, rpcUtils]);

  return { status, data };
};

export const usePublishedHistory = (path: string, paginationSize?: number) => {
  const [status, setStatus] = useState(LoadStatus.Idle);
  const [data, setData] = useState([]);
  const [fetchNextPage, setFetchNextPage] = useState(() => () => {
    /* noop */
  });
  const rpcUtils = useAtomValue(rpcUtilsAtom);

  useEffect(() => {
    if (!rpcUtils) {
      setStatus(LoadStatus.Idle);
      return;
    }
    const { follow } = rpcUtils;

    const fetchData = async () => {
      console.debug('usePublishedHistory following', `:published.${path}`);
      const follower = await follow(`:published.${path}`);
      const iterable: AsyncIterable<Record<string, unknown>> =
        await follower.getReverseIterable();
      setStatus(LoadStatus.Waiting);

      // Creates a promise that resolves when `fetchNextPage` is invoked.
      let fetchNextP = new Promise<void>(res =>
        // Ref: https://stackoverflow.com/a/55621325
        setFetchNextPage(() => () => res()),
      );

      const items = [];
      let curPageSize = 0;
      for await (const { value } of iterable) {
        if (paginationSize && curPageSize >= paginationSize) {
          setData(items);
          // Wait until `fetchNextPage` is invoked to continue async iteration.
          await fetchNextP;
          fetchNextP = new Promise<void>(res =>
            setFetchNextPage(() => () => res()),
          );
          curPageSize = 0;
        }
        items.push(value);
        curPageSize += 1;
      }
      setData(items);
      setStatus(LoadStatus.Received);
    };
    fetchData().catch(e => notifyError(e));
  }, [paginationSize, path, rpcUtils]);

  return { status, data, fetchNextPage };
};
