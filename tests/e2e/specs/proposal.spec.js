/* eslint-disable ui-testing/no-disabled-tests */
import { phrasesList, getTimeUntilVoteClose, DEFAULT_TIMEOUT } from '../utils';

describe('Make Proposal Tests', () => {
  let startTime;
  const AGORIC_NET = Cypress.env('AGORIC_NET') || 'local';
  const networkPhrases = phrasesList[AGORIC_NET];
  const txRetryCount = 2;

  context('PSM tests', () => {
    it('should setup 4 econ committee member wallets', () => {
      cy.task('info', `${AGORIC_NET}`);

      cy.setupWallet({
        secretWords: networkPhrases.gov1Phrase,
        walletName: 'gov1',
      });
      cy.setupWallet({
        secretWords: networkPhrases.gov2Phrase,
        walletName: 'gov2',
      });
      cy.setupWallet({
        secretWords: networkPhrases.gov4Phrase,
        walletName: 'gov4',
      });
    });

    it('should connect to wallet', () => {
      if (!networkPhrases.isLocal) {
        cy.origin('https://wallet.agoric.app/', () => {
          cy.visit('/');
        });
        cy.acceptAccess();
        cy.origin(
          'https://wallet.agoric.app/',
          { args: { networkPhrases } },
          ({ networkPhrases }) => {
            cy.visit('/wallet/');

            cy.get('input.PrivateSwitchBase-input').click();
            cy.contains('Proceed').click();

            cy.get('button[aria-label="Settings"]').click();

            cy.contains('Mainnet').click();
            cy.contains('Custom URL').should('be.visible').click();
            cy.get('input[value="https://main.agoric.net/network-config"]')
              .should('be.visible')
              .click()
              .then($input => {
                cy.wrap($input).clear().type(networkPhrases.networkConfigURL);
              });

            cy.contains('button', 'Connect').click();
          },
        );

        cy.acceptAccess();
      }
      cy.visit(`/?agoricNet=${networkPhrases.network}`);
      cy.acceptAccess();
    });

    it('should allow gov2 to create a proposal', () => {
      if (AGORIC_NET !== 'local') {
        cy.switchWallet('gov2');
        cy.reload();
      }

      // open PSM and select token
      cy.get('button').contains('PSM').click();
      cy.get('button').contains('AUSD').click();
      cy.get('button').contains(networkPhrases.token).click();

      // Change mint limit and proposal time to 1 min
      cy.get('label')
        .contains('Set Mint Limit')
        .parent()
        .within(() => {
          cy.get('input').spread(element => {
            cy.get('input').clear().type(element.value);
          });
        });
      cy.get('label')
        .contains('Minutes until close of vote')
        .parent()
        .within(() => {
          cy.get('input').clear().type(networkPhrases.minutes);
        });
    });

    it(
      'should confirm transaction for gov2 to create a proposal',
      {
        retries: {
          runMode: txRetryCount,
        },
      },
      () => {
        cy.get('[value="Propose Parameter Change"]').click();

        // Submit proposal and wait for confirmation
        cy.confirmTransaction();
        cy.get('p')
          .contains('sent', { timeout: DEFAULT_TIMEOUT })
          .should('be.visible')
          .then(() => {
            startTime = Date.now();
          });
      },
    );

    it('should allow gov2 to vote on the proposal', () => {
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      // Open vote, click on yes and submit
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();
    });

    it(
      'should confirm transaction for gov2 to vote on the proposal',
      {
        retries: {
          runMode: txRetryCount,
        },
      },
      () => {
        cy.get('input:enabled[value="Submit Vote"]').click();

        // Wait for vote to confirm
        cy.confirmTransaction();
        cy.get('p')
          .contains('sent', { timeout: DEFAULT_TIMEOUT })
          .should('be.visible');
      },
    );

    it('should allow gov1 to vote on the proposal', () => {
      cy.switchWallet('gov1');
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      // Open vote, click on yes and submit
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();
    });

    it(
      'should confirm transaction for gov1 to vote on the proposal',
      {
        retries: {
          runMode: txRetryCount,
        },
      },
      () => {
        cy.get('input:enabled[value="Submit Vote"]').click();

        // Wait for vote to confirm
        cy.confirmTransaction();
        cy.get('p')
          .contains('sent', { timeout: DEFAULT_TIMEOUT })
          .should('be.visible');
      },
    );

    it('should wait for proposal to pass', () => {
      // Wait for 1 minute to pass
      cy.wait(getTimeUntilVoteClose(startTime, networkPhrases.minutes));
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      cy.get('button').contains('History').click();

      // Select the first element proposal containing token and check
      // its status should be accepted
      cy.get('code')
        .contains(`psm-IST-${networkPhrases.token}`)
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get('span').contains('Change Accepted').should('be.visible');
        });
    });
  });

  context('Vaults tests', () => {
    it('should allow gov1 to create a proposal', () => {
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      // open Values and select manager 0
      cy.get('button').contains('Vaults').click();
      cy.get('button').contains('Select Manager').click();
      cy.get('button').contains('manager0').click();

      // Change debt limit and proposal time to 1 min
      cy.get('label')
        .contains('DebtLimit')
        .parent()
        .within(() => {
          cy.get('input').spread(element => {
            cy.get('input').clear().type(element.value);
          });
        });
      cy.get('label')
        .contains('Minutes until close of vote')
        .parent()
        .within(() => {
          cy.get('input').clear().type(networkPhrases.minutes);
        });
    });

    it(
      'should confirm transaction for gov1 to create a proposal',
      {
        retries: {
          runMode: txRetryCount,
        },
      },
      () => {
        cy.get('[value="Propose Parameter Change"]').click();

        // Submit proposal and wait for confirmation
        cy.confirmTransaction();
        cy.get('p')
          .contains('sent', { timeout: DEFAULT_TIMEOUT })
          .should('be.visible')
          .then(() => {
            startTime = Date.now();
          });
      },
    );

    it('should allow gov1 to vote on the proposal', () => {
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      // Open vote, click on yes and submit
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();
    });

    it(
      'should confirm transaction for gov1 to vote on the proposal',
      {
        retries: {
          runMode: txRetryCount,
        },
      },
      () => {
        cy.get('input:enabled[value="Submit Vote"]').click();

        // Wait for vote to confirm
        cy.confirmTransaction();
        cy.get('p')
          .contains('sent', { timeout: DEFAULT_TIMEOUT })
          .should('be.visible');
      },
    );

    it('should allow gov2 to vote on the proposal', () => {
      cy.switchWallet('gov2');
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      // Open vote, click on yes and submit
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();
    });

    it(
      'should confirm transaction for gov2 to vote on the proposal',
      {
        retries: {
          runMode: txRetryCount,
        },
      },
      () => {
        cy.get('input:enabled[value="Submit Vote"]').click();

        // Wait for vote to confirm
        cy.confirmTransaction();
        cy.get('p')
          .contains('sent', { timeout: DEFAULT_TIMEOUT })
          .should('be.visible');
      },
    );

    it('should wait for proposal to pass', () => {
      // Wait for 1 minute to pass
      cy.wait(getTimeUntilVoteClose(startTime, networkPhrases.minutes));
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      cy.get('button').contains('History').click();

      // Select the first element proposal containing ATOM and check
      // its status should be accepted
      cy.get('code')
        .contains('VaultFactory - ATOM')
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get('span').contains('Change Accepted').should('be.visible');
        });
    });
  });

  context('Gov4 tests', () => {
    it('should allow gov4 to create a proposal', () => {
      cy.switchWallet('gov4');
      cy.reload();

      // open Values and select manager 0
      cy.get('button').contains('Vaults').click();
      cy.get('button').contains('Select Manager').click();
      cy.get('button').contains('manager0').click();

      // Change debt limit and proposal time to 1 min
      cy.get('label')
        .contains('DebtLimit')
        .parent()
        .within(() => {
          cy.get('input').spread(element => {
            cy.get('input').clear().type(element.value);
          });
        });
      cy.get('label')
        .contains('Minutes until close of vote')
        .parent()
        .within(() => {
          cy.get('input').clear().type(networkPhrases.minutes);
        });
    });

    it(
      'should confirm transaction for gov4 to create a proposal',
      {
        retries: {
          runMode: txRetryCount,
        },
      },
      () => {
        cy.get('[value="Propose Parameter Change"]').click();

        // Submit proposal and wait for confirmation
        cy.confirmTransaction();
        cy.get('p')
          .contains('sent', { timeout: DEFAULT_TIMEOUT })
          .should('be.visible')
          .then(() => {
            startTime = Date.now();
          });
      },
    );

    it('should allow gov4 to vote on the proposal', () => {
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      // Open vote, click on yes and submit
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();
    });

    it(
      'should confirm transaction for gov4 to vote on the proposal',
      {
        retries: {
          runMode: txRetryCount,
        },
      },
      () => {
        cy.get('input:enabled[value="Submit Vote"]').click();

        // Wait for vote to confirm
        cy.confirmTransaction();
        cy.get('p')
          .contains('sent', { timeout: DEFAULT_TIMEOUT })
          .should('be.visible');
      },
    );

    it('should allow gov2 to vote on the proposal', () => {
      cy.switchWallet('gov2');
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      // Open vote, click on yes and submit
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();
    });

    it(
      'should confirm transaction for gov2 to vote on the proposal',
      {
        retries: {
          runMode: txRetryCount,
        },
      },
      () => {
        cy.get('input:enabled[value="Submit Vote"]').click();

        // Wait for vote to confirm
        cy.confirmTransaction();
        cy.get('p')
          .contains('sent', { timeout: DEFAULT_TIMEOUT })
          .should('be.visible');
      },
    );

    it('should wait for proposal to pass', () => {
      // Wait for 1 minute to pass
      cy.wait(getTimeUntilVoteClose(startTime, networkPhrases.minutes));
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      cy.get('button').contains('History').click();

      // Select the first element proposal containing ATOM and check
      // its status should be accepted
      cy.get('code')
        .contains('VaultFactory - ATOM')
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get('span').contains('Change Accepted').should('be.visible');
        });
    });
  });
});
