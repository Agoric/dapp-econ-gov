#!/bin/bash
# UNTIL https://github.com/Agoric/dapp-econ-gov/issues/138

. /usr/src/upgrade-test-scripts/env_setup.sh

# Start the chain in the background
/usr/src/upgrade-test-scripts/start_agd.sh &

wait