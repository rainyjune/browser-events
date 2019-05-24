网页中元素嵌套是非常常见的，当用户在浏览器触发一个事件时它们的触发顺序是怎么样的？

```
-----------------------------------
| element1                        |
|   -------------------------     |
|   |element2               |     |
|   -------------------------     |
|                                 |
-----------------------------------
```

假设页面中有两个元素，其中 element2 是 element1 的子元素，当用户点击 element2 时，哪个事件会首先触发？

## 两种模型

要回答这个问题，首先要了解事件模型以及为什么有这些事件模型。
浏览器大战时
 * Netscape 认为 element1 上的事件应该首先触发。这就是事件捕获。
 * 微软认为 element2 上的事件优先级更高。这就是事件冒泡。
这两种事件顺序是相反的，IE 8和更低的版本只支持事件冒泡，Chrome, Safari, Mozilla, Opera 7+对两者都支持。

### 事件捕获
```
               | |
---------------| |-----------------
| element1     | |                |
|   -----------| |-----------     |
|   |element2  \ /          |     |
|   -------------------------     |
|        Event CAPTURING          |
-----------------------------------
```

### 事件冒泡
```
               / \
---------------| |-----------------
| element1     | |                |
|   -----------| |-----------     |
|   |element2  | |          |     |
|   -------------------------     |
|        Event BUBBLING           |
-----------------------------------
```

## W3C 模型

![图片alt](https://w3c.github.io/uievents/images/eventflow.svg)

```
                 | |  / \
-----------------| |--| |-----------------
| element1       | |  | |                |
|   -------------| |--| |-----------     |
|   |element2    \ /  | |          |     |
|   --------------------------------     |
|        W3C event model                 |
------------------------------------------
```

我们可以使用 addEventListener() 方法的第三个参数来控制事件监听器作用于捕获阶段还是冒泡阶段。如果设置 useCapture 为 true 会在捕获阶段起效，false 表示作用于冒泡阶段。默认为 false。
```
target.addEventListener(type, listener[, useCapture]);
```
对于支持 W3C标准的浏览器来说，用传统方式绑定事件监听器时会被认为是发生在冒泡阶段。
```
element1.onclick = doSomething2;
```

## 事件冒泡的用途

借助于浏览器默认的冒泡机制，我们可以实现事件的集中管理和事件委托。具体做法是把事件监听器设置到 document， body 或者目标元素的上级元素上，当触发某一事件时事件冒泡最终会触发我们的事件监听器函数。神策分析 JavaScript SDK 中也有应用：

```
// 利用冒泡原理在 document 上监听 click 事件
_.addEvent(document, 'click', function(e) {
  var ev = e || window.event;
  if(!ev){
    return false;
  }        
  // 得到用户点击的元素
  var target = ev.target || ev.srcElement;
  if(typeof target !== 'object'){
    return false;
  }
  if(typeof target.tagName !== 'string'){
    return false;
  }
  // 用户点击的元素的标签，转成小写便于对比
  var tagName = target.tagName.toLowerCase();
  // 如果触发事件的元素是 body 或者 html，停止处理
  if(tagName.toLowerCase() === 'body' || tagName.toLowerCase() === 'html'){
    return false;
  }
  // 如果不是有效的元素，停止处理
  if(!target || !target.parentNode || !target.parentNode.children){
    return false;
  }
  // 触发点击事件的父元素标签名，转成小写便于对比
  var parent_ele = target.parentNode.tagName.toLowerCase();
  if(parent_ele === 'a' || parent_ele === 'button'){
    that.start(ev, target.parentNode, target.parentNode.tagName.toLowerCase());
  }else{
    that.start(ev, target, tagName);
  } 
});
```

## 截断事件流的传播

默认情况下，事件的捕获或者冒泡总是会触发的。有时候我们需要阻止事件的传播。对于不同的浏览器有不同的方式。旧版 IE 浏览器必须设置 event 对象的 cancelBubble 属性为 true：
```
window.event.cancelBubble = true
```
在支持 W3C 模型的浏览器中必须调用 event 的 stopPropagation() 方法：
```
e.stopPropagation()
```
跨浏览器兼容的方式的代码：
```
function doSomething(e)
{
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
}
```
