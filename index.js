window.onload = function() {

  var div1 = id('div1'),
      div2 = id('div2'),
      testp = id('testp'),
      testa = id('testlink');

  var captureToggleBtn = id('captureToggleBtn'),
      bubbleToggleBtn = id('bubbleToggleBtn'),
      captureToggleStatus = id('captureToggleStatus'),
      bubbleToggleStatus = id('bubbleToggleStatus'),
      logarea = id('logarea'),
      clearlog = id('clearlog'),
      div2cancelbubble = id('div2cancelbubble'),
      div2cancelCapture = id('div2cancelCapture'),
      div2allowCapture = id('div2allowCapture');

  var arr = [div1, div2, testp];

  var eventHandlersForIE = [];

  var captureListener = function(e) {
    writelog('capturing phase: #' + this.id);
  };

  var bubbleListener = function(e) {
    writelog('bubbling phase: #' + this.id);
  };

  var stopCaptureHandler = function(e) {
    e.stopPropagation();
  };

  for (var i = 0, len = arr.length; i < len; i++) {
    var thisElement = arr[i];

    addEvent(thisElement, 'click', captureListener, true);
    var thisHandler = addEvent(thisElement, 'click', bubbleListener, false);
    if (thisHandler) {
      eventHandlersForIE[i] = thisHandler;
    }
  }

  id('isCaptureSupported').innerText = document.addEventListener ? '是' : '否';
  if (document.addEventListener) {
    captureToggleBtn.disabled = false;
    captureToggleBtn.innerText = '为捕获阶段删除监听器';

    div2cancelCapture.disabled = false;
    div2allowCapture.disabled = false;
  } else {
    captureToggleStatus.innerText = '不支持事件捕获';
  }

  function id(str) {
    return document.getElementById(str);
  }

  addEvent(captureToggleBtn, 'click', function(e) {
    writelog('--------');

    var status = this.getAttribute('data-status');
    e = fixEvent(e);
    if (status === 'on') {
      this.setAttribute('data-status', 'off');
      captureToggleBtn.innerText = '为捕获阶段增加监听器';
      log(captureToggleStatus, '捕获阶段的监听器已经注销');
    } else {
      this.setAttribute('data-status', 'on');
      captureToggleBtn.innerText = '为捕获阶段删除监听器';
      log(captureToggleStatus, '捕获阶段的监听器已经注册');
    }
    for (var i = 0, len = arr.length; i < len; i++) {
      var thisElement = arr[i];
      if (status === 'on') {
        removeEvent(thisElement, 'click', captureListener, true);
      } else {
        addEvent(thisElement, 'click', captureListener, true);
      }
    }
  });

  addEvent(bubbleToggleBtn, 'click', function(e) {
    writelog('--------');
    var status = this.getAttribute('data-status');
    e = fixEvent(e);
    if (status === 'on') {
      this.setAttribute('data-status', 'off');
      bubbleToggleBtn.innerText = '为冒泡阶段增加监听器';
      log(bubbleToggleStatus, '冒泡阶段的监听器已经注销');
    } else {
      this.setAttribute('data-status', 'on');
      bubbleToggleBtn.innerText = '为冒泡阶段删除监听器';
      log(bubbleToggleStatus, '冒泡阶段的监听器已经注册');
    }
    for (var i = 0, len = arr.length; i < len; i++) {
      var thisElement = arr[i];
      if (status === 'on') {
        removeEvent(thisElement, 'click', eventHandlersForIE[i] || bubbleListener, false);
      } else {
        var thisHandler = addEvent(thisElement, 'click', bubbleListener, false);
        if (thisHandler) {
          eventHandlersForIE[i] = thisHandler;
        }
      }
    }
  });

  var cancelHandler = function(e) {
    e = fixEvent(e);
    e.stopPropagation();
  }
  var cancelBubbleHandler = null;
  addEvent(div2cancelbubble, 'click', function(e) {
    writelog('阻止 #div2 事件流');

    cancelBubbleHandler = addEvent(div2, 'click', cancelHandler, false);
  }, false);

  addEvent(id('div2allowbubble'), 'click', function() {
    writelog('允许 #div2 事件流');

    removeEvent(div2, 'click', cancelBubbleHandler || cancelHandler, false);
  }, false);

  clearlog.onclick = function() {
    logarea.value = '';
  };

  div2cancelCapture.onclick = function() {
    div2.addEventListener('click', stopCaptureHandler, true);
  };

  div2allowCapture.onclick = function() {
    div2.removeEventListener('click', stopCaptureHandler, true);
  }

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
      target['my' + type] = bound;
      return bound;
    }
  }

  function removeEvent(target, type, listener, useCapture) {
    if (document.removeEventListener) {
      target.removeEventListener(type, listener, useCapture);
    } else if (document.detachEvent) {
      if (useCapture) return ;
      target.detachEvent('on' + type, listener);
      target['my' + type] = null;
    }
  }

  function log(dom, text) {
    dom.innerText = text;
  }

  function writelog(text) {
    logarea.value += "\n" + text;
    if (logarea.scrollTo) {
      logarea.scrollTo({
        top: logarea.scrollHeight
      });
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