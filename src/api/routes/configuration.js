module.exports = function(app) {
  var controller = app.controllers.configuration;

  app.route('/v1/configurations')
    .get(controller.getAll);

  app.route('/v1/configurations/:key')
    .get(controller.getByKey)
    .put(controller.update);
};
