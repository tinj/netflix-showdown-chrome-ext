var Stopwatch = function ($el, color, cb) {
  this.init = function (color) {
    this.color = color || 'white';
    this.$el = $el;

    this.moment = moment();
    this.chart = this.getChart();
    this.start(cb);
  };

  this.start = function (callback) {
    var that = this;
    console.log('start');
    if (callback) {
      that.$el.one('click', function (evt) {
        evt.preventDefault();
        that.stop();
        callback();
      });
    }
    that.interval = setInterval(function () {
      that.updateChart();
    }, 20);
  };

  this.stop = function () {
    if (this.interval) {
      console.log('stopwatch stopped');
      clearInterval(this.interval);
      this.interval = undefined;
      this.updateChart();
    }
  };

  this.getChart = function () {
    var ctx = this.$el[0].getContext('2d');
    return new Chart(ctx).Doughnut(this.formatTime(), {
      animation: true,
      percentageInnerCutout: 80,
      count: true,
      countColor: 0,
      mod: 60000,
      countModifier: 1000, // milliseconds
      segmentShowStroke: false,
      // segmentStrokeWidth: 1,
      // segmentStrokeColor: "#fff",
      onAnimationComplete: function () {
        this.animation = false;
      }
    });
  };

  this.updateChart = function () {
    this.chart.update(this.formatTime());
  };

  this.formatTime = function () {
    return [
      {
        value : -this.moment.diff(),
        color : this.color || 'white'
      }
    ];
  };

  this.init(color);
};