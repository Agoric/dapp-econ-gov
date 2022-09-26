import { Amount } from '@agoric/ertp';
import { useAtomValue } from 'jotai';
import { governedParamsIndexAtom } from 'store/app';
import ProposeChange from './ProposeChange';

interface Props {
  anchorName: string;
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

export default function PsmGovernance(props: Props) {
  const governedParamsIndex = useAtomValue(governedParamsIndexAtom);

  const params = governedParamsIndex.get(props.anchorName);

  return (
    <div>
      <h2>{props.anchorName}</h2>
      {params
        ? Object.entries(params).map(([name, value]) => (
            <ProposeChange key={name} name={name} currentValue={value} />
          ))
        : 'signal wallet!'}
    </div>
  );
}
