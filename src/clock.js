(function(app) {
  'use strict';

  app.registerControl('clock', Clock);

  function Clock(canvas) {
    var pos;

    function drawShape(func, r, x, y) {
      var ctx = canvas.getContext('2d');
      ctx.save();
      func(ctx, r, x, y);
      ctx.restore();
    }

    function getPoint(degree, distanceFromCenter, r, x, y) {
      // 1 degree is equal to -0,0174532925 (-1 * Math.PI / 180).
      var theta = -0.0174532925 * degree;

      var endX = Math.sin(theta) * distanceFromCenter;
      var endY = Math.cos(theta) * distanceFromCenter;

      return { x: x - endX + r, y: y - endY + r };
    }

    function drawCenterLine(ctx, r, x, y, endPoint, width, color) {
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

    function drawHour(ctx, r, x, y, pos, color) {
      drawCenterLine(
        ctx, r, x, y,
        getPoint(pos, r*0.95, r, x, y),
        r*0.15,
        color);
    }

    function drawMinute(ctx, r, x, y, pos, color) {
      drawCenterLine(
        ctx, r, x, y,
        getPoint(pos, r*0.95, r, x, y),
        r*0.15,
        color);
    }

    function drawSecond(ctx, r, x, y, pos, color) {
      drawLine(
        ctx, r, x, y,
        getPoint(pos+180, r*0.25, r, x, y),
        getPoint(pos, r*0.95, r, x, y),
        r*0.04,
        color);
    }

    this.tick = function(p, dia, x, y) {
      pos = p;
      draw(dia, x, y);
    }

    function draw(dia, x, y) {
      var r = dia / 2,
          handColor = '#444',
          secHandColor = '#f00',
          faceColor = '#fff',
          x = x*dia,
          y = y*dia;

      drawShape(function(ctx, r, x, y) {
        ctx.clearRect(x, y, r*2, r*2);
      }, r, x, y);

      // Draw clock face
      drawShape(function(ctx, r, x, y) {
        ctx.fillStyle = faceColor;
        ctx.beginPath();
        ctx.arc(x+r, y+r, r, 0, 2 * Math.PI, false);
        ctx.fill();
      }, r, x, y);

      // Draw hour hand
      drawShape(function(ctx, r, x, y) {
        drawHour(ctx, r, x, y, pos.hour, handColor);
      }, r, x, y);

      // Draw minute hand
      drawShape(function(ctx, r, x, y) {
        drawMinute(ctx, r, x, y, pos.minute, handColor);
      }, r, x, y);

      // Draw hub
      drawShape(function(ctx, r, x, y) {
        ctx.fillStyle = handColor;
        ctx.beginPath();
        ctx.arc(x+r, y+r, r*0.1, 0, 2 * Math.PI, false);
        ctx.fill();
      }, r, x, y);

      // Draw second hand
      if(typeof pos.second !== 'undefined' && pos.second !== null) {
        drawShape(function(ctx, r, x, y) {
          drawSecond(ctx, r, x, y, pos.second, secHandColor);
        }, r, x, y);
      }
    }
  }
})(window.app);
