import '@agoric/synpress/support/index';

Cypress.Commands.add('skipWhen', function (expression) {
  if (expression) {
    this.skip();
  }
});
