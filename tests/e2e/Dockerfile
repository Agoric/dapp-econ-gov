# UNTIL https://github.com/Agoric/dapp-econ-gov/issues/138
FROM ghcr.io/agoric/agoric-3-proposals:latest

RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/*

ENV PATH="/usr/src/agoric-sdk/packages/agoric-cli/bin:${PATH}"

WORKDIR /setup-committee

RUN mkdir -p /setup-committee/scripts

COPY scripts/replace-committee-A3P_INTEGRATION-permit.json /setup-committee/
COPY scripts/replace-committee-A3P_INTEGRATION.js /setup-committee/
COPY scripts/b1-2197fbaf5b94e79dd80546b3ce6aab47e52679667668ad1af614869aeb0bbadc529b34acfc01c37ae6cc5cd328d6aaf59f7818bcf15dc315405f7bda3a4d3472.json /setup-committee/
COPY scripts/b1-f9881996d17ce444c7fa34f3a8ea20ecbec403344b83a805b91f35f06bb65bd7c09519d9bc1560d5e55aed0fca547a5f3851234c45720b85c11c9143a48364e7.json /setup-committee/
COPY scripts/setup-committee.sh /setup-committee/
COPY scripts/run-chain.sh /setup-committee/

EXPOSE 26657 1317 9090

ENTRYPOINT ["/setup-committee/run-chain.sh"]