window.onload = function() {

  var div1 = document.getElementById('div1'),
      div2 = document.getElementById('div2'),
      testp = document.getElementById('testp'),
      testa = document.getElementById('testlink');

  var arr = [div1, div2, testp];

  var captureListener = function(e) {
    alert('capturing phase: #' + this.id);
  };

  var bubbleListener = function(e) {
    alert('bubbling phase: #' + this.id);
  };

  for (var i = 0, len = arr.length; i < len; i++) {
    var thisElement = arr[i];

    addEvent(thisElement, 'click', captureListener, true);
    addEvent(thisElement, 'click', bubbleListener, false);
  }

  addEvent(div2, 'click', function(e) {
    //debugger;
    var evt = fixEvent(e);
    //window.event.cancelBubble = true;
    evt.stopPropagation();
    alert('stopPropagation on #div2');
  }, false);

  addEvent(testa, 'click', function(e) {
    e = fixEvent(e);
    alert('testa clicked');
    e.preventDefault();
  });

  function addEvent(target, type, listener, useCapture) {
    if (document.addEventListener) {
      target.addEventListener(type, listener, useCapture);
    } else if (document.attachEvent) {
      if (useCapture) return ;
      // Creates a bind function
      var bound = function() {
        return listener.apply(target, arguments);
      };
      target.attachEvent('on' + type, bound);
      return bound;
    }
  }

  function fixEvent(event) {
    if (!event || !event.stopPropagation) {
      var old = event || window.event;

      event = {};
      for (var prop in old) {
        event[prop] = old[prop];
      }

      if (!event.target) {
        event.target = event.srcElement || document;
      }

      event.preventDefault = function() {
        event.returnValue = window.event.returnValue = false;
      };

      event.stopPropagation = function() {
        event.cancelBubble = window.event.cancelBubble = true;
      };
    }
    return event;
  }

};