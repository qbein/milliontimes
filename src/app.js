(function(document, window) {
  'use strict';
  
  function ClockController() {
    var actions = [],
        clocks = [],
        actionIdx = 0,
        startTime;
    
    function currentAction() {
      var now = new Date();
      
      if(actions.length > 0) {
        if(!startTime) {
          startTime = now.getTime();
        } else {
          if(now.getTime() > startTime+actions[actionIdx].duration) {
            actionIdx++;
            if(actionIdx >= actions.length) {
              actionIdx = 0;
            }
            startTime = now.getTime();
          }
        }
        
        return actions[actionIdx].action;
      }
    }
    
    /**
     * Push an action to the controller.
     *
     * @param {object} action The action to push
     * @param {int} duration The action duration in milliseconds.
     */
    this.pushAction = function(action, duration) {
      actions.push({ duration: duration, action: action });
    }
    
    this.clearActions = function() {
      actions = [];
    }
    
    this.addClock = function(clock, x, y) {
      clocks.push({ x: x, y: y, clock: clock });
    }
    
    this.tick = function() {
      var timestamp = new Date().getTime(),
          action = currentAction();
      
      clocks.forEach(function(c) {
        c.currentPos = action 
          ? action.getPos(timestamp, c.x, c.y, c.currentPos)
          : { hour: 0, minute: 0, second: 0 },
        c.clock.tick(c.currentPos);
      });
    }
  }
  
  function App(canvas) {
    var self = this,
        controls = {},
        devicePixelRatio,
        backingStoreRatio,
        ratio,
        initFunc,
        controller = new ClockController(),
        scaleFactor = getBackingScale(canvas.getContext('2d'));
    
    function getBackingScale(context) {
      return window.devicePixelRatio > 1
        ? window.devicePixelRatio
        : 1;
    }
    
    function resize() {
      var width = window.innerWidth,
          height = window.innerHeight;
      
      canvas.width = width * scaleFactor;
      canvas.height = height * scaleFactor;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }
    
    function init() {
      var clocksX = 24,
          clocksY = 12,
          clockDia = 55;
      
      for(var i=0; i<clocksX; i++) {
        for(var j=0; j<clocksY; j++) {
          controller.addClock(
            initControl('clock', 
                        i*clockDia, 
                        j*clockDia,
                        clockDia,
                        clockDia)
            , i, j);
        }
      }
      
      if(initFunc) {
        initFunc(controller);
      }
    }
    
    function initControl(name, x, y, width, height) {
      if(!controls.hasOwnProperty(name)) {
        throw "No control '" + name + "' exists.";
      }
      
      return new controls[name](canvas, x, y, width, height);
    }
    
    function loop() {
      resize();
      controller.tick();
      delay(function() {
        loop();
      });
    }
       
    function delay(callback) {
      setTimeout(function() {
        callback();
      }, 100);
      /*
      window.requestAnimationFrame(function() {
        callback();
      });
      */
    }
    
    this.registerControl = function(name, control) {
      if(controls.hasOwnProperty(name)) {
        throw "Control '" + name + "' already exists.";
      }
      controls[name] = control;
    }
    
    this.init = function(func) {
      initFunc = func;
    }
    
    document.addEventListener('DOMContentLoaded', function(event) {
      init.call(self);
      loop();
    });
  }
  
  window.app = new App(document.getElementById('clock'));
  
})(document, window);