FROM ghcr.io/agoric/agoric-3-proposals:latest

RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /setup-committee

RUN mkdir -p /setup-committee/scripts

COPY scripts/replace-committee-permit.json /setup-committee/
COPY scripts/replace-committee-plan.json /setup-committee/
COPY scripts/replace-committee.js /setup-committee/
COPY scripts/setup-committee.sh /setup-committee/

EXPOSE 26657 1317 9090