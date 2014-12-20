(function(app) {
  'use strict';

  app.registerControl('clock', Clock);

  function Clock(canvas, x, y, width, height) {
    var r = Math.min(width/2, height/2),
        pos;

    function drawShape(func) {
      var ctx = canvas.getContext('2d');
      ctx.save();
      func(ctx);
      ctx.restore();
    }

    function getPoint(degree, distanceFromCenter) {
      // 1 degree is equal to -0,0174532925 (-1 * Math.PI / 180).
      var theta = -0.0174532925 * degree;

      var endX = Math.sin(theta) * distanceFromCenter;
      var endY = Math.cos(theta) * distanceFromCenter;

      return { x: x - endX + r, y: y - endY + r };
    }

    function drawCenterLine(ctx, endPoint, width, color) {
      drawLine(ctx, { x: x+r, y: y+r }, endPoint, width, color);
    }

    function drawLine(ctx, startPoint, endPoint, width, color) {
      ctx.beginPath();
      ctx.strokeStyle = color || '#0f0';
      ctx.lineWidth = width;
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }

    function drawHour(ctx, pos, color) {
      drawCenterLine(
        ctx,
        getPoint(pos, r*0.95),
        r*0.15,
        color);
    }

    function drawMinute(ctx, pos, color) {
      drawCenterLine(
        ctx,
        getPoint(pos, r*0.95),
        r*0.15,
        color);
    }

    function drawSecond(ctx, pos, color) {
      drawLine(
        ctx,
        getPoint(pos+180, r*0.25),
        getPoint(pos, r*0.95),
        r*0.04,
        color);
    }

    this.tick = function(p) {
      if(!pos || p.hour != pos.hour || p.minute != pos.minute || p.second != pos.second) {
        pos = p;
        draw();
      }
    }

    function draw() {
      var handColor = '#444',
          secHandColor = '#f00',
          faceColor = '#fff';

      drawShape(function(ctx) {
        ctx.clearRect(x, y, width, height);
      });

      // Draw clock face
      drawShape(function(ctx) {
        ctx.fillStyle = faceColor;
        ctx.beginPath();
        ctx.arc(x+r, y+r, r, 0, 2 * Math.PI, false);
        ctx.fill();
      });

      // Draw hour hand
      drawShape(function(ctx) {
        drawHour(ctx, pos.hour, handColor);
      });

      // Draw minute hand
      drawShape(function(ctx) {
        drawMinute(ctx, pos.minute, handColor);
      });

      // Draw hub
      drawShape(function(ctx) {
        ctx.fillStyle = handColor;
        ctx.beginPath();
        ctx.arc(x+r, y+r, r*0.1, 0, 2 * Math.PI, false);
        ctx.fill();
      });

      // Draw second hand
      if(typeof pos.second !== 'undefined' && pos.second !== null) {
        drawShape(function(ctx) {
          drawSecond(ctx, pos.second, secHandColor);
        });
      }
    }
  }
})(window.app);
