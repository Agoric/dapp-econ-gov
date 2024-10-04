# UNTIL https://github.com/Agoric/dapp-econ-gov/issues/138

# Create a vault for gov1 to get enough ISTs to install bundles
wantMinted=450
giveCollateral=90
walletName=gov1
PERMIT=replace-committee-A3P_INTEGRATION-permit.json
SCRIPT=replace-committee-A3P_INTEGRATION.js
CHAINID=agoriclocal
GAS_ADJUSTMENT=1.2

agops vaults open --wantMinted ${wantMinted} --giveCollateral ${giveCollateral} > /tmp/want-ist.json
sleep 5
agops perf satisfaction --executeOffer /tmp/want-ist.json --from $walletName --keyring-backend=test

install_bundle() {
  ls -sh "$1"
  agd tx swingset install-bundle --compress "@$1" \
    --from gov1 --keyring-backend=test --gas=auto --gas-adjustment=1.2 \
    --chain-id=agoriclocal -bblock --yes -o json
}

PLAN1=b1-2197fbaf5b94e79dd80546b3ce6aab47e52679667668ad1af614869aeb0bbadc529b34acfc01c37ae6cc5cd328d6aaf59f7818bcf15dc315405f7bda3a4d3472.json
PLAN2=b1-f9881996d17ce444c7fa34f3a8ea20ecbec403344b83a805b91f35f06bb65bd7c09519d9bc1560d5e55aed0fca547a5f3851234c45720b85c11c9143a48364e7.json
bundles=("$PLAN1" "$PLAN2")

for b in "${bundles[@]}"; do
  echo "Installing $b"
  install_bundle "$b"
  sleep 5
done

agd tx swingset install-bundle --compress $PLAN2 \
  --from $walletName --keyring-backend=test --gas=auto \
  --gas-adjustment $GAS_ADJUSTMENT \
  --chain-id $CHAINID -block --yes -o json
sleep 5

# Submit Proposal
agd tx gov submit-proposal swingset-core-eval $PERMIT $SCRIPT \
  --title="Replace EC Committee and Charter" --description="Evaluate $SCRIPT" \
  --deposit=10000000ubld --gas=auto --gas-adjustment $GAS_ADJUSTMENT \
  --from $walletName --chain-id $CHAINID --keyring-backend=test \
  --yes -b block

sleep 5

# Accept Proposal
LATEST_PROPOSAL=$(agd query gov proposals --output json | jq -c '[.proposals[] | if .proposal_id == null then .id else .proposal_id end | tonumber] | max')
PROPOSAL=$LATEST_PROPOSAL
VOTE_OPTION=yes

# Construct the SIGN_BROADCAST_OPTS correctly
SIGN_BROADCAST_OPTS="--keyring-backend=test --chain-id=$CHAINID --gas=auto --gas-adjustment=$GAS_ADJUSTMENT --yes -b block"

agd tx gov vote $PROPOSAL $VOTE_OPTION --from=validator \
$SIGN_BROADCAST_OPTS -o json > tx.json

# View Proposal
agd query gov proposals --output json \
  | jq -c '.proposals[] | [if .proposal_id == null then .id else .proposal_id end,.voting_end_time,.status]'

