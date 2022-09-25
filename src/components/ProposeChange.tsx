/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import clsx from 'clsx';
import { WalletContext } from 'lib/wallet';
import { useContext } from 'react';
import { ParameterValue } from './PsmGovernance';

interface Props {
  name: string;
  currentValue: ParameterValue;
}

export default function ProposeChange(props: Props) {
  return (
    <fieldset>
      <legend>PROPOSE CHANGE: {props.name}</legend>
      Current value: ??? Proposed new value: <input type="number" />
      <button>Submit proposal</button>
    </fieldset>
  );
}
