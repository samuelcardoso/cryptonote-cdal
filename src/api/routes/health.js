module.exports = function(app) {
  var controller = app.controllers.health;

  app.route('/v1/health')
    .get(controller.getHealthInfo);
};
