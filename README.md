# dapp-governance

UI for Governance of Inter Protocol

![image](https://user-images.githubusercontent.com/150986/202804842-e7def6b9-9136-4541-b93e-6ccd2ab1a039.png)

# Development

# Test net

Start HMR server:

```
yarn dev
```

Open app against a network config, e.g. ollinet

```
open http://127.0.0.1:5173/?agoricNet=ollinet
```

## Local

Start a wallet client server for network-config:

```
cd wallet-app
yarn start
```

Start a dev server with fast refresh:

```
yarn dev
```

Launch pointing to your localhost:

```
open http://127.0.0.1:5173/?agoricNet=local
```

# E2E Testing

E2E tests have been written in order to test the dapp as well as to perform automated testing on emerynet/devnet when upgrading the chain

There are two ways to run the tests:

## On Local Machine

To run tests on your local machine, first you need to start the frontend server:

```
yarn dev
```

If you plan to run tests with `CYPRESS_AGORIC_NET=local`, you must start the `a3p` chain beforehand. To do this, use the following command:

```bash
docker run -d -p 26657:26657 -p 1317:1317 -p 9090:9090 ghcr.io/agoric/agoric-3-proposals:latest
```

Alternatively, you can create an `a3p` chain from a specific branch in your `agoric-sdk` repository. To do this, navigate to the `a3p-integration` directory in your `agoric-sdk` repository. Install all necessary dependencies and build the project with:

```bash
yarn && yarn build
```

Once the build is complete, locate the Docker image you just created by running:

```bash
docker images
```

Find the hash of your new image and start the container using the hash:

```bash
docker run -p 26657:26657 -p 1317:1317 -p 9090:9090 {hash}
```

**Note:** The tests use chrome browser by default so they require it to be installed

Next, run the tests using the following command:

```bash
CYPRESS_AGORIC_NET=<network> yarn test:e2e
```

where `<network>` can be: `local`,`emerynet`,`devnet`, `xnet` or `ollinet`.

## On Github

To run the tests on github, you can use the workflow trigger to run the tests.

Go to: Actions > E2E Tests (On the left sidebar) > Run Workflow

It provides a handful of parameters that can be used to modify the run according to your needs

- `branch` you can change the branch on which the tests run
- `network` you can change the network on which to run the tests
- `gov1 mnemonic` you can set a custom mnemonic of the wallet you want to use for the first economic committee member (this param does not work for `local` network)
- `gov2 mnemonic` you can set a custom mnemonic of the wallet you want to use for the second economic committee member (this param does not work for `local` network)
