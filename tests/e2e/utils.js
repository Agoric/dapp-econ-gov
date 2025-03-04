export const DEFAULT_TIMEOUT = 2 * 60_000;

export const phrasesList = {
  emerynet: {
    isLocal: false,
    minutes: 3,
    token: 'USDT_axl',
    network: 'emerynet',
    networkConfigURL: 'https://emerynet.agoric.net/network-config',
    gov1Phrase:
      'such field health riot cost kitten silly tube flash wrap festival portion imitate this make question host bitter puppy wait area glide soldier knee',
    gov2Phrase:
      'physical immune cargo feel crawl style fox require inhale law local glory cheese bring swear royal spy buyer diesel field when task spin alley',
    // UNTIL https://github.com/Agoric/dapp-econ-gov/issues/144
    gov3Phrase:
      'spike siege world rather ordinary upper napkin voice brush oppose junior route trim crush expire angry seminar anchor panther piano image pepper chest alone',
    gov4Phrase:
      'smile unveil sketch gaze length bulb goddess street case exact table fetch robust chronic power choice endorse toward pledge dish access sad illegal dance',
  },
  devnet: {
    isLocal: false,
    minutes: 3,
    token: 'USDT_axl',
    network: 'devnet',
    networkConfigURL: 'https://devnet.agoric.net/network-config',
    gov1Phrase: Cypress.env('GOV1_PHRASE'),
    gov2Phrase: Cypress.env('GOV2_PHRASE'),
    // UNTIL https://github.com/Agoric/dapp-econ-gov/issues/144
    gov3Phrase: Cypress.env('GOV4_PHRASE'),
    gov4Phrase: Cypress.env('GOV3_PHRASE'),
  },
  xnet: {
    isLocal: false,
    minutes: 3,
    token: 'ToyUSD',
    network: 'xnet',
    networkConfigURL: 'https://xnet.agoric.net/network-config',
    gov1Phrase: Cypress.env('GOV1_PHRASE'),
    gov2Phrase: Cypress.env('GOV2_PHRASE'),
    // UNTIL https://github.com/Agoric/dapp-econ-gov/issues/144
    gov3Phrase: Cypress.env('GOV4_PHRASE'),
    gov4Phrase: Cypress.env('GOV3_PHRASE'),
  },
  local: {
    isLocal: true,
    minutes: 1,
    token: 'USDT_axl',
    network: 'local',
    gov1Phrase:
      'such field health riot cost kitten silly tube flash wrap festival portion imitate this make question host bitter puppy wait area glide soldier knee',
    gov2Phrase:
      'physical immune cargo feel crawl style fox require inhale law local glory cheese bring swear royal spy buyer diesel field when task spin alley',
    // UNTIL https://github.com/Agoric/dapp-econ-gov/issues/144
    gov3Phrase:
      'spike siege world rather ordinary upper napkin voice brush oppose junior route trim crush expire angry seminar anchor panther piano image pepper chest alone',
    gov4Phrase:
      'tackle hen gap lady bike explain erode midnight marriage wide upset culture model select dial trial swim wood step scan intact what card symptom',
  },
};

export const getTimeUntilVoteClose = (startTime, minutesForVote) => {
  const totalVoteTime = 60_000 * minutesForVote;
  const voteCloseTime = totalVoteTime + startTime;
  const currentTime = Date.now();
  return voteCloseTime - currentTime;
};
