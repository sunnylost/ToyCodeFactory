var delay = 30;
var max = 10;
var index = 0;
var xhr = null;


function init() {
  xhr = new XMLHttpRequest();
  chrome.alarms.create('order', {periodInMinutes: delay});
  chrome.alarms.onAlarm.addListener(function(alarm) {
    if(new Date().getHours() < 13 && index++ < max) {
      isOrder();
    } else {
      chrome.alarms.clear('order');
    }
  });
  window.onload = function() {
    var div = document.createElement('div');
    div.id = 'container';
    document.body.appendChild(div);
  };
}

function isOrder() {
  xhr.open("GET", "http://bjdc.taobao.ali.com/", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      document.getElementById('container').innerHTML = xhr.responseText;
      if(document.querySelectorAll('.content').length < 2) { //未订餐
        window.open('http://bjdc.taobao.ali.com/');
      }
    }
  };
  xhr.send();
}
init();