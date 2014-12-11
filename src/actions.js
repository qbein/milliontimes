(function() {
  'use strict';
  
  window.app.init(function(controller) {
    controller.pushAction(
      new DigitalClockAction(),
      3000
    );
    controller.pushAction(
      new AnalogClockAction(),
      3000
    );
    controller.pushAction(
      new FieldLinesAction(10),
      3000
    );
    controller.pushAction(
      new RandomizeAction(),
      3000
    ),
    controller.pushAction(
      new FieldLinesAction(10),
      3000
    );
  });
  
  function DigitalClockAction() {
    this.getPos = function(timestamp, currentPos) {
      return {
        hour: 180,
        minute: 0,
        second: null
      }
    }
  }
  
  function AnalogClockAction() {
    this.getPos = function(timestamp, currentPos) {
      var now = new Date(timestamp);
      
      return {
        hour: Math.abs(
            now.getHours() - 12 + (1 / 60 * now.getMinutes())
          ) / 12 * 360,
        minute: Math.abs(
            now.getMinutes() + (1 / 60 * now.getSeconds())
          ) / 60 * 360,
        second: (now.getSeconds() + (0.001
          * now.getMilliseconds())) / 60 * 360
      };
    }
  }
  
  function FieldLinesAction(offset) {
    offset = offset || 0;
    
    this.getPos = function(timestamp, x, y, currentPos) {
      var steps = 10000;
      var pos = ((timestamp%steps)/steps*360);
      
      // Rotate bottom half counter clockwise
      if(y>5) pos = 360-pos;
      
      var o = y>5?-1*x*offset:x*offset;
      
      return {
        hour: pos+180+o,
        minute: pos+o,
        second: null
      }
    }
  }
  
  function RandomizeAction() {
    var p = {};
    
    this.getPos = function(timestamp, x, y, currentPos) {
      if(!p[x]) p[x] = {};
      if(!p[x][y]) {
        p[x][y] = {
          hour: Math.random()*360,
          minute: Math.random()*360,
          second: Math.random()*360
        }
      }
      return p[x][y];
    }
  }
  
})();