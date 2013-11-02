
var Timer = function (id, duration, color) {
  this.init = function (id, duration, color) {
    this.id = id;
    this.color = color || 'white';
    this.movie = '';
    this.url = '';
    this.duration = duration;
    this.durationMS = duration * 1000;
    // this.timeRemaining = timeRemaining || 30;
    // this.timeStart = timeRemaining || 30;
    this.$el = $('#timer-'+id);

    this.chart = this.getChart(id, this.formatTime());
  };

  this.start = function (callback) {
    var that = this;
    that.moment = moment();
    if (callback) {
      that.$el.one('click', function (evt) {
        evt.preventDefault();
        that.stop();
        callback();
      });
    }
    that.interval = setInterval(function () {
      that.updateChart();

      if (0 >= that.timeRemaining()) {
        that.stop();
        if (callback) callback();
      }
    }, 20);
  };

  this.stop = function () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
      this.updateChart();
    }
  };

  this.updateChart = function () {
    this.chart.update(this.formatTime());
  };

  this.timeRemaining = function () {
    if (this.moment) {
      return this.durationMS + this.moment.diff();
    } else {
      return this.durationMS;
    }
  };

  this.formatTime = function () {
    return [
      {
        value : this.timeRemaining(),
        color : this.color || 'white'
      },
      {
        value: this.durationMS - this.timeRemaining(),
        color : 'none'
      }
    ];
  };

  this.getChart = function (id, data) {
    var ctx = this.$el[0].getContext('2d');
    return new Chart(ctx).Doughnut(data, {
      animation: true,
      percentageInnerCutout: 80,
      count: true,
      countColor: 0,
      countModifier: 1000, // milliseconds
      placeNumber: ['1st','2nd','3rd'][id],
      segmentShowStroke: false,
      // segmentStrokeWidth: 1,
      // segmentStrokeColor: "#000",
      onAnimationComplete: function () {
        this.animation = false;
      }
    });
  }
  // this.removeChart = function () {
  //   this.$el.remove();
  // };

  this.init(id, duration, color);
};