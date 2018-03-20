module.exports = function() {
  return {
    getNow: function() {
      return this.now || this.getDate();
    },

    setNow: function(now) {
      this.now = now;
    },

    getDate: function() {
      return new Date();
    }
  };
};
