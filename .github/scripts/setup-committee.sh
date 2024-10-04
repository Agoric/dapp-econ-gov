# Create a vault for gov1 to get enough ISTs to install bundles
wantMinted=450
giveCollateral=90
walletName=gov1
PLAN=replace-committee-plan.json
PERMIT=replace-committee-permit.json
SCRIPT=replace-committee.js
CHAINID=agoriclocal
GAS_ADJUSTMENT=1.2

agops vaults open --wantMinted ${wantMinted} --giveCollateral ${giveCollateral} > /tmp/want-ist.json
sleep 5
agops perf satisfaction --executeOffer /tmp/want-ist.json --from $walletName --keyring-backend=test

# Install Bundle
agd tx swingset install-bundle --compress $PLAN \
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
CONTAINER_ID=$(docker ps -q)

# Construct the SIGN_BROADCAST_OPTS correctly
SIGN_BROADCAST_OPTS="--keyring-backend=test --chain-id=$CHAINID --gas=auto --gas-adjustment=$GAS_ADJUSTMENT --yes -b block"

# Execute the command in the Docker container
docker exec -it $CONTAINER_ID bash -c \
  "agd tx gov vote $PROPOSAL $VOTE_OPTION --from=validator $SIGN_BROADCAST_OPTS -o json > tx.json"

# View Proposal
agd query gov proposals --output json \
  | jq -c '.proposals[] | [if .proposal_id == null then .id else .proposal_id end,.voting_end_time,.status]'

