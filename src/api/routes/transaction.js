module.exports = function(app) {
  var controller = app.controllers.transaction;

  app.route('/v1/transactions')
    .get(controller.getAll);

  app.route('/v1/transactions/:id')
    .get(controller.getAll);

  app.route('/v1/:ownerId/transactions')
    .get(controller.getAll)
    .post(controller.save);
  app.route('/v1/:ownerId/transactions/:id')
    .get(controller.getAll);
  app.route('/v1/:ownerId/transactions/:id/blockchain-transaction')
    .get(controller.getBlockchainTransactionByTransaction);

  app.route('/v1/addresses/:address/transactions')
    .get(controller.getAll);
  app.route('/v1/addresses/:address/transactions/:id')
    .get(controller.getAll);
  app.route('/v1/addresses/:address/transactions/:id/blockchain-transaction')
    .get(controller.getBlockchainTransactionByTransaction);

  app.route('/v1/:ownerId/addresses/:address/transactions')
    .get(controller.getAll)
    .post(controller.save);

  app.route('/v1/:ownerId/addresses/:address/transactions/:id')
    .get(controller.getAll);

  app.route('/v1/:ownerId/addresses/:address/transactions/:id/blockchain-transaction')
    .get(controller.getBlockchainTransactionByTransaction);

  app.route('/v1/transactions/:id/blockchain-transaction')
    .get(controller.getBlockchainTransactionByTransaction);
};
