(function() {
  'use strict';

  window.app.init(function(controller) {
    var transitionTime = 3000;

    controller.setTransitionActionFactory({
      transitionTime: transitionTime,
      create: function() { return new SlidingInterpolateAction(transitionTime) }
    });

    controller.pushAction(
      new NullAction(),
      5000
    );
    controller.pushAction(
      new DigitalClockAction(),
      15000
    );
    controller.pushAction(
      new FieldLinesAction(10),
      10000
    );
    controller.pushAction(
      new RandomizeAction(),
      5000
    ),
    controller.pushAction(
      new FieldLinesAction(10),
      15000
    );
    /*controller.pushAction(
      new AnalogClockAction(),
      3000
    );*/
  });

  function SlidingInterpolateAction(transitionTime) {
    var fromAction, toAction, startTime, endTime;

    function interpolate(from, to, fraction) {
      if(from === null) return null;
      var diff = to - from;
      return to - (diff - (diff * fraction));
    }

    this.initTransition = function(_fromAction, _toAction, _startTime) {
      fromAction = _fromAction;
      toAction = _toAction;
      startTime = _startTime;
      endTime = startTime + transitionTime;
    }

    this.getPos = function(timestamp, x, y) {
      var fromPos = fromAction.getPos(startTime, x, y);
      var toPos = toAction.getPos(endTime, x, y);
      var fraction = (timestamp-startTime)/transitionTime;

      var pos = {
        hour: interpolate(fromPos.hour, toPos.hour, fraction),
        minute: interpolate(fromPos.minute, toPos.minute, fraction),
        second: interpolate(fromPos.second, toPos.second, fraction)
      };

      return pos;
    }
  }

  function DigitalClockAction() {
    var timestamp;

    // The clock positions are encoded as bits:
    //
    // Hour positions are:   0 (12'), 1 (15'), 2 (18'),  3 (21')
    // Minute positions are: 0 (0"),  4 (15"), 8 (30"), 12 (45")
    //
    // Example:
    // 14 == Hour hand at 6' position, minute hand at 45" position
    //  2 == Hour hand at 6' position, minute hand at  0" position
    var digits = [
      [  6,  0,  0,  0, 14,
         2,  6,  0, 14,  2,
         2,  2,  0,  2,  2,
         2,  2,  0,  2,  2,
         2,  1,  0,  3,  2,
         1,  0,  0,  0,  3 ],
      [  0,  0,  6, 14,  0,
         0,  0,  2,  2,  0,
         0,  0,  2,  2,  0,
         0,  0,  2,  2,  0,
         0,  0,  2,  2,  0,
         0,  0,  1,  3,  0 ],
      [  6,  0,  0,  0, 14,
         1,  0,  0, 14,  2,
         6,  0,  0,  3,  2,
         2,  6,  0,  0,  3,
         2,  1,  0,  0, 14,
         1,  0,  0,  0,  3 ],
      [  6,  0,  0,  0, 14,
         1,  0,  0, 14,  2,
         6,  0,  0,  3,  2,
         1,  0,  0, 14,  2,
         6,  0,  0,  3,  2,
         1,  0,  0,  0,  3 ],
      [  6, 14,  0,  6, 14,
         2,  2,  0,  2,  2,
         2,  1,  0,  3,  2,
         1,  0,  0, 14,  2,
         0,  0,  0,  2,  2,
         0,  0,  0,  1,  3 ],
      [  6,  0,  0,  0, 14,
         2,  6,  0,  0,  3,
         2,  1,  0,  0, 14,
         1,  0,  0, 14,  2,
         6,  0,  0,  3,  2,
         1,  0,  0,  0,  3 ],
      [  6,  0,  0,  0, 14,
         2,  6,  0,  0,  3,
         2,  1,  0,  0, 14,
         2,  6,  0, 14,  2,
         2,  1,  0,  3,  2,
         1,  0,  0,  0,  3 ],
      [  6,  0,  0,  0, 14,
         1,  0,  0, 14,  2,
         0,  0,  0,  2,  2,
         0,  0,  0,  2,  2,
         0,  0,  0,  2,  2,
         0,  0,  0,  1,  3 ],
      [  6,  0,  0,  0, 14,
         2,  6,  0, 14,  2,
         2,  1,  0,  3,  2,
         2,  6,  0, 14,  2,
         2,  1,  0,  3,  2,
         1,  0,  0,  0,  3 ],
      [  6,  0,  0,  0, 14,
         2,  6,  0, 14,  2,
         2,  1,  0,  3,  2,
         1,  0,  0, 14,  2,
         6,  0,  0,  3,  2,
         1,  0,  0,  0,  3 ],
      [  0,  0,
         6, 14,
         1,  3,
         6, 14,
         1,  3,
         0,  0 ]
    ];

    function getCoords(timestamp, x, y) {
      if(x < 1 || x > 22 || y < 3 || y > 8) {
        return null;
      }

      var now = new Date(timestamp);

      if(x <= 5) {
        return getPos(+('0' + now.getHours()).slice(-2)[0], x-1, y-3);
      } else if(x <= 10) {
        return getPos(+('0' + now.getHours()).slice(-2)[1], x-6, y-3);
      } else if(x <= 12) {
        return getPos(10, x-11, y-3, 2);
      } else if(x <= 17) {
        return getPos(+('0' + now.getMinutes()).slice(-2)[0], x-13, y-3);
      } else {
        return getPos(+('0' + now.getMinutes()).slice(-2)[1], x-18, y-3);
      }
    }

    function getPos(digit, x, y, width) {
      width = width || 5;
      return translatePos(digits[digit][width*y+x]);
    }

    function translatePos(enc) {
      if(enc === 0) return null;

      var pos = {
        hour: (enc & 7) * 90,
        minute: (enc >> 2 & 7) * 90,
        second: null
      }
      //console.log(pos);
      return pos;
    }

    this.getPos = function(t, x, y) {
      var coords = getCoords(timestamp || t, x, y);

      return coords || {
        hour: x==23?270:90,
        minute: x==0?90:270,
        second: null
      }
    }

    this.init = function(t) {
      timestamp = t;
    }
  }

  function AnalogClockAction() {
    this.getPos = function(timestamp, x, y) {
      var now = new Date(timestamp);

      return {
        hour: Math.abs(
            now.getHours() - 12 + (1 / 60 * now.getMinutes())
          ) / 12 * 360,
        minute: Math.abs(
            now.getMinutes() + (1 / 60 * now.getSeconds())
          ) / 60 * 360,
        second: null /*(now.getSeconds() + (0.001
          * now.getMilliseconds())) / 60 * 360*/
      };
    }
  }

  function FieldLinesAction(offset) {
    offset = offset || 0;

    this.getPos = function(timestamp, x, y) {
      var steps = 10000;
      var pos = ((timestamp%steps)/steps*360);

      // Rotate bottom half counter clockwise
      if(y>5) {
        pos = 360-pos;
        this.ccw = true;
      }

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

    this.getPos = function(timestamp, x, y) {
      if(!p[x]) p[x] = {};
      if(!p[x][y]) {
        p[x][y] = {
          hour: Math.random()*360,
          minute: Math.random()*360,
          second: null //Math.random()*360
        }
      }
      return p[x][y];
    }
  }

  function NullAction() {
    this.getPos = function(timestamp, x, y) {
      return {
        hour: x==23?270:90,
        minute: x==0?90:270,
        second: null
      }
    }
  }

})();
