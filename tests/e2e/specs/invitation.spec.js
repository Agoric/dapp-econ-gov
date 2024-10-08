/* eslint-disable ui-testing/no-disabled-tests */
import { phrasesList, getTimeUntilVoteClose, DEFAULT_TIMEOUT } from '../utils';

describe('Accept Invitation Tests', () => {
  let startTime;
  const networkPhrases = phrasesList['local'];

  context('Setup Wallets', () => {
    it('should setup two keplr wallets', () => {
      cy.setupWallet({
        secretWords: networkPhrases.gov2Phrase,
        walletName: 'gov2',
      });
      cy.setupWallet({
        secretWords: networkPhrases.gov1Phrase,
        walletName: 'gov1',
      });
    });

    it('should connect to wallet', () => {
      cy.visit(`/?agoricNet=${networkPhrases.network}`);
      cy.acceptAccess();
    });
  });

  context('Accept Invitations for Committee and Charter', () => {
    it('should accept invitation for EC committee', () => {
      cy.contains('button', 'Vote').click();
      cy.contains('button', 'Accept Invitation').click();

      cy.acceptAccess().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
      });

      cy.contains('button', 'Accept Invitation', {
        timeout: DEFAULT_TIMEOUT,
      }).should('not.exist');
    });

    it('should accept invitation for EC charter', () => {
      cy.contains('button', 'PSM').click();
      cy.contains('button', 'Accept Invitation').click();

      cy.acceptAccess().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
      });

      cy.contains('button', 'Accept Invitation', {
        timeout: DEFAULT_TIMEOUT,
      }).should('not.exist');
    });
  });

  context('Propose and Vote a question with gov1', () => {
    it('should allow gov1 to create a proposal', () => {
      cy.visit(`/?agoricNet=${networkPhrases.network}`);
      cy.get('button').contains('PSM').click();
      cy.get('button').contains('AUSD').click();
      cy.get('button').contains(networkPhrases.token).click();

      // Change mint limit and proposal time to 1 min
      cy.get('label')
        .contains('Set Mint Limit')
        .parent()
        .within(() => {
          cy.get('input').spread(_ => {
            cy.get('input').clear().type(1000);
          });
        });
      cy.get('label')
        .contains('Minutes until close of vote')
        .parent()
        .within(() => {
          cy.get('input').clear().type(networkPhrases.minutes);
        });

      cy.get('[value="Propose Parameter Change"]').click();

      cy.acceptAccess().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
      });

      cy.contains('p', 'Transaction sent', {
        timeout: DEFAULT_TIMEOUT,
      }).should('be.visible');
    });

    it('should allow gov1 to vote on the proposal', () => {
      cy.visit(`/?agoricNet=${networkPhrases.network}`);
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();

      cy.get('input:enabled[value="Submit Vote"]').click();
      cy.acceptAccess().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
      });
      cy.contains('p', 'Transaction sent', {
        timeout: DEFAULT_TIMEOUT,
      })
        .should('be.visible')
        .then(() => {
          startTime = Date.now();
        });
    });

    it('should wait for proposal to pass', () => {
      // Wait for 1 minute to pass
      cy.wait(getTimeUntilVoteClose(startTime, networkPhrases.minutes));
      cy.visit(`/?agoricNet=${networkPhrases.network}`);

      cy.get('button').contains('History').click();

      cy.contains(`psm-IST-${networkPhrases.token}`);
      cy.contains('No quorum').should('not.exist');
      cy.contains('Change Accepted').should('be.visible');
    });

    it('should not allow gov2 to create a proposal', () => {
      cy.switchWallet('gov2');
      cy.visit(`/?agoricNet=${networkPhrases.network}`);
      cy.contains('button', 'PSM').click();
      cy.get('button').contains('AUSD').click();
      cy.get('button').contains(networkPhrases.token).click();

      // Change mint limit and proposal time to 1 min
      cy.get('label')
        .contains('Set Mint Limit')
        .parent()
        .within(() => {
          cy.get('input').spread(_ => {
            cy.get('input').clear().type(900);
          });
        });
      cy.get('label')
        .contains('Minutes until close of vote')
        .parent()
        .within(() => {
          cy.get('input').clear().type(networkPhrases.minutes);
        });

      cy.get('[value="Propose Parameter Change"]').should('be.disabled');
    });
  });
});
