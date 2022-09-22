import { Listbox } from '@headlessui/react';
import { useState } from 'react';
import AcceptInvitation from './AcceptInvitation';
import PsmGovernance from './PsmGovernance';

const instances = ['psm-IST-AUSD', 'psm-IST-ELLIE'];

interface Props {}

export default function PsmPanel(props: Props) {
  const [selectedInstance, setSelectedInstance] = useState(instances[0]);

  return (
    <div>
      You must first have received and accepted an invitation to the PSM
      Charter.
      <AcceptInvitation sourceContract="psmCharter" />
      <Listbox value={selectedInstance} onChange={setSelectedInstance}>
        <Listbox.Button>{selectedInstance}</Listbox.Button>
        <Listbox.Options>
          {instances.map(name => (
            <Listbox.Option key={name} value={name}>
              {name}
            </Listbox.Option>
          ))}
        </Listbox.Options>

        <PsmGovernance instanceName={selectedInstance} />
      </Listbox>
    </div>
  );
}
