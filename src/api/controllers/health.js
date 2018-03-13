module.exports = function() {
  return {
    getHealthInfo: function(req, res) {
      res.status(200).json({
        version: '0.0.1',
        status: 'OK'
      });
    }
  };
};
