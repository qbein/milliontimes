(function(document, window) {
  'use strict';

  function ClockController() {
    var actions = [],
        clocks = [],
        transitionActionFactory,
        actionIdx = 0,
        currentAction,
        transitioning,
        startTime;

    function initAction(action) {
      if(typeof action.init === 'function') {
        action.init(new Date().getTime());
      }
    }

    function getCurrentAction() {
      var now = new Date(),
          transitionTime = transitionActionFactory.transitionTime;

      if(actions.length > 0) {
        if(!startTime) {
          startTime = now.getTime();
          currentAction = actions[actionIdx].action;
          initAction(currentAction);
        } else {
          if(now.getTime() > startTime+actions[actionIdx].duration) {
            actionIdx = (actionIdx + 1) % actions.length;
            currentAction = actions[actionIdx].action;
            startTime = now.getTime();
            transitioning = false;
          }
          // Start transition to next action
          else if(!transitioning
            && now.getTime() > startTime+actions[actionIdx].duration-transitionTime) {
            var fromAction = actions[actionIdx].action;
            var toAction = actions[(actionIdx + 1) % actions.length].action;
            initAction(toAction);
            currentAction = transitionActionFactory.create();
            currentAction.initTransition(fromAction, toAction, now.getTime());
            transitioning = true;
          }
        }
      }
      return currentAction;
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

    this.setTransitionActionFactory = function(actionFactory) {
      transitionActionFactory = actionFactory;
    }

    this.clearActions = function() {
      actions = [];
    }

    this.addClock = function(clock, x, y) {
      clocks.push({ x: x, y: y, clock: clock });
    }

    this.tick = function(clockDia) {
      var timestamp = new Date().getTime(),
          action = getCurrentAction();

      clocks.forEach(function(c) {
        c.currentPos = action
          ? action.getPos(timestamp, c.x, c.y)
          : { hour: 0, minute: 0, second: 0 };

        c.clock.tick(c.currentPos, clockDia, c.x, c.y);
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
        width,
        height,
        stopped,
        clockDia,
        // TODO: Need to get clocksX and Y into actions for more control
        clocksX = 24,
        clocksY = 12,
        controller = new ClockController(),
        scaleFactor = getBackingScale(canvas.getContext('2d'));

    function getBackingScale(context) {
      return window.devicePixelRatio > 1
        ? window.devicePixelRatio
        : 1;
    }

    function resize() {
      if(canvas.offsetWidth != width || canvas.offsetHeight != height) {
        width = canvas.offsetWidth,
        height = canvas.offsetHeight;
        clockDia = width / clocksX * scaleFactor;

        canvas.width = width * scaleFactor;
        canvas.height = height * scaleFactor;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
      }
    }

    function init() {
      for(var i=0; i<clocksX; i++) {
        for(var j=0; j<clocksY; j++) {
          controller.addClock(initControl('clock'), i, j);
        }
      }

      if(initFunc) {
        initFunc(controller);
      }
    }

    function initControl(name) {
      if(!controls.hasOwnProperty(name)) {
        throw "No control '" + name + "' exists.";
      }

      return new controls[name](canvas);
    }

    function loop() {
      resize();
      controller.tick(clockDia);
      delay(function() {
        loop();
      });
    }

    function delay(callback) {
      /*setTimeout(function() {
        callback();
      }, 100);*/
      window.requestAnimationFrame(function(t) {
        if(!stopped) callback();
      });
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

    this.toggle = function() {
      stopped = !stopped;
      if(!stopped) loop();
    }

    document.addEventListener('DOMContentLoaded', function(event) {
      init.call(self);
      loop();
    });
  }

  window.app = new App(document.getElementById('clock'));

  document.getElementById('clock').onclick = function() {
    window.app.toggle();
  };

})(document, window);
