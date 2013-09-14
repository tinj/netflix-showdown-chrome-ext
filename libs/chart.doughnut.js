/*!
 * Chart.js
 * http://chartjs.org/
 *
 * Copyright 2013 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md

 * Modified to be work as a doughnut timer by Tinj
 */

//Define the global Chart Variable as a class.
window.Chart = function(context){

  var chart = this;

  //Easing functions adapted from Robert Penner's easing equations
  //http://www.robertpenner.com/easing/

  var animationOptions = {
    linear : function (t){
      return t;
    },
    easeInQuad: function (t) {
      return t*t;
    },
    easeOutQuad: function (t) {
      return -1 *t*(t-2);
    },
    easeInOutQuad: function (t) {
      if ((t/=1/2) < 1) return 1/2*t*t;
      return -1/2 * ((--t)*(t-2) - 1);
    },
    easeInCubic: function (t) {
      return t*t*t;
    },
    easeOutCubic: function (t) {
      return 1*((t=t/1-1)*t*t + 1);
    },
    easeInOutCubic: function (t) {
      if ((t/=1/2) < 1) return 1/2*t*t*t;
      return 1/2*((t-=2)*t*t + 2);
    },
    easeInQuart: function (t) {
      return t*t*t*t;
    },
    easeOutQuart: function (t) {
      return -1 * ((t=t/1-1)*t*t*t - 1);
    },
    easeInOutQuart: function (t) {
      if ((t/=1/2) < 1) return 1/2*t*t*t*t;
      return -1/2 * ((t-=2)*t*t*t - 2);
    },
    easeInQuint: function (t) {
      return 1*(t/=1)*t*t*t*t;
    },
    easeOutQuint: function (t) {
      return 1*((t=t/1-1)*t*t*t*t + 1);
    },
    easeInOutQuint: function (t) {
      if ((t/=1/2) < 1) return 1/2*t*t*t*t*t;
      return 1/2*((t-=2)*t*t*t*t + 2);
    },
    easeInSine: function (t) {
      return -1 * Math.cos(t/1 * (Math.PI/2)) + 1;
    },
    easeOutSine: function (t) {
      return 1 * Math.sin(t/1 * (Math.PI/2));
    },
    easeInOutSine: function (t) {
      return -1/2 * (Math.cos(Math.PI*t/1) - 1);
    },
    easeInExpo: function (t) {
      return (t==0) ? 1 : 1 * Math.pow(2, 10 * (t/1 - 1));
    },
    easeOutExpo: function (t) {
      return (t==1) ? 1 : 1 * (-Math.pow(2, -10 * t/1) + 1);
    },
    easeInOutExpo: function (t) {
      if (t==0) return 0;
      if (t==1) return 1;
      if ((t/=1/2) < 1) return 1/2 * Math.pow(2, 10 * (t - 1));
      return 1/2 * (-Math.pow(2, -10 * --t) + 2);
      },
    easeInCirc: function (t) {
      if (t>=1) return t;
      return -1 * (Math.sqrt(1 - (t/=1)*t) - 1);
    },
    easeOutCirc: function (t) {
      return 1 * Math.sqrt(1 - (t=t/1-1)*t);
    },
    easeInOutCirc: function (t) {
      if ((t/=1/2) < 1) return -1/2 * (Math.sqrt(1 - t*t) - 1);
      return 1/2 * (Math.sqrt(1 - (t-=2)*t) + 1);
    },
    easeInElastic: function (t) {
      var s=1.70158;var p=0;var a=1;
      if (t==0) return 0;  if ((t/=1)==1) return 1;  if (!p) p=1*.3;
      if (a < Math.abs(1)) { a=1; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (1/a);
      return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
    },
    easeOutElastic: function (t) {
      var s=1.70158;var p=0;var a=1;
      if (t==0) return 0;  if ((t/=1)==1) return 1;  if (!p) p=1*.3;
      if (a < Math.abs(1)) { a=1; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (1/a);
      return a*Math.pow(2,-10*t) * Math.sin( (t*1-s)*(2*Math.PI)/p ) + 1;
    },
    easeInOutElastic: function (t) {
      var s=1.70158;var p=0;var a=1;
      if (t==0) return 0;  if ((t/=1/2)==2) return 1;  if (!p) p=1*(.3*1.5);
      if (a < Math.abs(1)) { a=1; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (1/a);
      if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
      return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p )*.5 + 1;
    },
    easeInBack: function (t) {
      var s = 1.70158;
      return 1*(t/=1)*t*((s+1)*t - s);
    },
    easeOutBack: function (t) {
      var s = 1.70158;
      return 1*((t=t/1-1)*t*((s+1)*t + s) + 1);
    },
    easeInOutBack: function (t) {
      var s = 1.70158;
      if ((t/=1/2) < 1) return 1/2*(t*t*(((s*=(1.525))+1)*t - s));
      return 1/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
    },
    easeInBounce: function (t) {
      return 1 - animationOptions.easeOutBounce (1-t);
    },
    easeOutBounce: function (t) {
      if ((t/=1) < (1/2.75)) {
        return 1*(7.5625*t*t);
      } else if (t < (2/2.75)) {
        return 1*(7.5625*(t-=(1.5/2.75))*t + .75);
      } else if (t < (2.5/2.75)) {
        return 1*(7.5625*(t-=(2.25/2.75))*t + .9375);
      } else {
        return 1*(7.5625*(t-=(2.625/2.75))*t + .984375);
      }
    },
    easeInOutBounce: function (t) {
      if (t < 1/2) return animationOptions.easeInBounce (t*2) * .5;
      return animationOptions.easeOutBounce (t*2-1) * .5 + 1*.5;
    }
  };

  //Variables global to the chart
  var width = context.canvas.width;
  var height = context.canvas.height;


  //High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
  if (window.devicePixelRatio) {
    context.canvas.style.width = width + "px";
    context.canvas.style.height = height + "px";
    context.canvas.height = height * window.devicePixelRatio;
    context.canvas.width = width * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  this.Doughnut = function(data,options){

    chart.Doughnut.defaults = {
      segmentShowStroke : true,
      segmentStrokeColor : "#fff",
      segmentStrokeWidth : 2,
      percentageInnerCutout : 50,
      animation : true,
      animationSteps : 100,
      animationEasing : "easeOutBounce",
      animateRotate : true,
      animateScale : false,
      onAnimationComplete : null,
      count : false,
      countModifier : 1
    };

    var config = (options)? mergeChartConfig(chart.Doughnut.defaults,options) : chart.Doughnut.defaults;

    return new Doughnut(data,config,context);
  };

  var Doughnut = function(data,config,ctx){
    this.config = config;
    this.ctx = ctx;
    this.data = data;
    var that = this;
    function init () {
      var segmentTotal = 0;

      //In case we have a canvas that is not a square. Minus 5 pixels as padding round the edge.
      var doughnutRadius = Min([height/2,width/2]) - 5;
      // var doughnutRadius = Min([height/2,width/2]);

      var cutoutRadius = doughnutRadius * (config.percentageInnerCutout/100);

      if (config.mod) {
        segmentTotal = config.mod;
      } else {
        for (var i=0; i<that.data.length; i++){
          segmentTotal += that.data[i].value;
        }
      }

      animationLoop(config,drawPieSegments,ctx,drawCount);

      function drawPieSegments (animationDecimal){
        var cumulativeAngle = -Math.PI/2,
        scaleAnimation = 1,
        rotateAnimation = 1;
        if (config.animation) {
          if (config.animateScale) {
            scaleAnimation = animationDecimal;
          }
          if (config.animateRotate){
            rotateAnimation = animationDecimal;
          }
        }
        for (var i=0; i<data.length; i++){
          if (that.data[i].color !== 'none') {
            var segmentAngle = rotateAnimation * (((config.mod ? that.data[i].value % config.mod : that.data[i].value)/segmentTotal) * (Math.PI*2));
            ctx.beginPath();
            ctx.arc(width/2,width/2,scaleAnimation * doughnutRadius,cumulativeAngle,cumulativeAngle + segmentAngle,false);
            ctx.arc(width/2,width/2,scaleAnimation * cutoutRadius,cumulativeAngle + segmentAngle,cumulativeAngle,true);
            ctx.closePath();
            ctx.fillStyle = that.data[i].color;
            ctx.fill();

            if(config.segmentShowStroke){
              ctx.lineWidth = config.segmentStrokeWidth;
              ctx.strokeStyle = config.segmentStrokeColor;
              ctx.stroke();
            }
            cumulativeAngle += segmentAngle;
          }
        }

        if (that.config.count) {
          drawCount();
        }
        if (that.config.placeNumber) {
          drawPlaceNumber();
        }
      }

      function drawCount () {
        // console.log('drawCount %d', data[0].value);
        // ctx.font = 18+"px Arial";
        ctx.font = 16+"px Arial";
        ctx.fillStyle = isNumber(config.countColor) ? that.data[config.countColor] : 'white';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(that.data[0].value/config.countModifier), width/2, width/2+6);
        // ctx.fillText(Math.ceil(that.data[0].value), width/2, height-6);
      }
      function drawPlaceNumber () {
        // ctx.font = 16+"px Arial";
        ctx.font = 18+"px Arial";
        ctx.fillStyle = isNumber(config.countColor) ? that.data[config.countColor] : 'white';
        ctx.textAlign = 'center';
        // ctx.fillText(config.placeNumber, width/2, width/2+6);
        ctx.fillText(config.placeNumber, width/2-1, height-6);
      }
    }

    this.update = function (data2, animate) {
      that.data = data2;
      if (that.config.animation && !animate) return;
      if (animate) that.config.animation = true;
      init();
    }

    init();
  };


  var clear = function(c){
    c.clearRect(0, 0, width, height);
  };

  function animationLoop(config,drawData,ctx,drawCount){
    var animFrameAmount = (config.animation)? 1/CapValue(config.animationSteps,Number.MAX_VALUE,1) : 1,
      easingFunction = animationOptions[config.animationEasing],
      percentAnimComplete =(config.animation)? 0 : 1;

    requestAnimFrame(animLoop);

    function animateFrame(){
      var easeAdjustedAnimationPercent =(config.animation)? CapValue(easingFunction(percentAnimComplete),null,0) : 1;
      clear(ctx);
      drawData(easeAdjustedAnimationPercent);
    }
    function animLoop(){
      //We need to check if the animation is incomplete (less than 1), or complete (1).
      percentAnimComplete += animFrameAmount;
      animateFrame();
      //Stop the loop continuing forever
      if (percentAnimComplete <= 1){
        requestAnimFrame(animLoop);
      }
      else if (typeof config.onAnimationComplete == "function") config.onAnimationComplete();
    }
  }

  //Declare global functions to be called within this namespace here.


  // shim layer with setTimeout fallback
  var requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  })();

  //Min value from array
  function Min( array ){
    return Math.min.apply( Math, array );
  };

  //Is a number function
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  //Apply cap a value at a high or low number
  function CapValue(valueToCap, maxValue, minValue){
    if(isNumber(maxValue)) {
      if( valueToCap > maxValue ) {
        return maxValue;
      }
    }
    if(isNumber(minValue)){
      if ( valueToCap < minValue ){
        return minValue;
      }
    }
    return valueToCap;
  }

  function mergeChartConfig(defaults,userDefined){
    var returnObj = {};
      for (var attrname in defaults) { returnObj[attrname] = defaults[attrname]; }
      for (var attrname in userDefined) { returnObj[attrname] = userDefined[attrname]; }
      return returnObj;
  }

  //Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
  var cache = {};

  function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
}