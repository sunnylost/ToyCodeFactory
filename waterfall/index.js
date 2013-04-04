/**
 * User: sunnylost
 * Date: 13-4-4
 * Time: 下午8:47
 */
(function() {
   var api = ' http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4f04ad387b8fc014f91037b2ddf117d8&tags=cat&per_page=30&format=json&auth_token=72157633162086731-3b2c3258e90d51e4&api_sig=4b296cdda70fc5bc55ac0d86a671a5d2';  //~~meow~~
    Array.prototype.shuffle = function() {
        var rand;
        var index = 0;
        var shuffled = [];
        this.forEach(function(value) {
            rand = Math.floor(Math.random() * (index++ + 1));
            shuffled[index - 1] = shuffled[rand];
            shuffled[rand] = value;
        });
        return shuffled;
    }

   var curListImgs = [],
       doc = document,
       container = doc.getElementById('container'),
       urls = [],
       line = 0,   //current line nums
       index = 0,
       curList = 0,
       globalId = 0;

   function jsonFlickrApi(data) {
       var photos = data.photos.photo;
       if(data.stat != 'ok') return alert('AOOO~~~~~~');
       var src = 'http://farm{farm}.static.flickr.com/{server}/{id}_{secret}.jpg';
       var i = 0,
           photo,
           len = photos.length;
       for(;i < len; i++) {
           photo = photos[i];
           urls.push(src.replace(/{([^}]+)}/g, function(m, c) {
               return photo[c];
           }));
       }
       waterFall();
       window.onscroll = function() {
           var body = doc.body;
           clearInterval(globalId);
           globalId = setTimeout(function() {
               if(body.scrollHeight - doc.documentElement.clientHeight - body.scrollTop <= 20) {
                   waterFall();
               }
           }, 100);
       }
   }

    var waterFall = function() {
        var i = 0,
            len = urls.length,
            photo,
            photos = [],
            div = doc.createElement('div'),
            c;
        for(; i < len; i ++) {
            photo = urls[i];
            c = div.cloneNode(false);
            c.innerHTML = '<img src="' + photo + '" width="190">';
            photos.push(c);
        }
        urls = urls.shuffle();
        calculate(photos)
    }

    var calculate = function(photos) {
        var curWidth = doc.body.offsetWidth,
            maxLists = curWidth / 200 >> 0,
            len = photos.length,
            photo,
            prePosImg,
            i = 0,
            c = container,
            img;
        for(; i < len; index++, i++) {
            photo = photos[i];
            curListImgs.push(photo);
            line = index / maxLists >> 0;
            prePosImg = line == 0 ? null : curListImgs.shift();
            curList >= maxLists && (curList = 0);
            photo.style.left = curList * 200 + 'px';
            photo.style.top = (prePosImg ? (parseInt(prePosImg.style.top, 10) + prePosImg.offsetHeight + 10) : 0) + 'px';
            curList++;
            photo.className = 'c' + curList;
            fadeIn(photo, c);
            img = photo.getElementsByTagName('img')[0];
            if(img.height == 0) {
                img.onload = function() {
                    fix(this.parentNode);
                    this.onload = null;
                }
            }
        }
    }

    var fix = function() {
        var remain = [],
            isRun = false;

        return function fixFn(el) {
            if(isRun) {
                remain.push(el);
            } else {
                isRun = true;
                var className = el.className,
                    tmp = container.querySelectorAll('.' + className),
                    pics = Array.prototype.slice.call(tmp, 0),
                    pic,
                    i = 0,
                    pre = el,
                    begin = false,
                    len = pics.length;
                for(; i< len; i++) {
                    pic = pics[i];
                    if(pic == el) {
                        begin = true;
                    } else if(begin) {
                        pic.style.top = 10 + pre.offsetHeight + parseInt(pre.style.top, 10) + 'px';
                    }
                    pre = pic;
                }
                // fix
                isRun = false;
                if(remain.length > 0) {
                    return fixFn(remain.shift());
                }
            }
        }
    }();

    function fadeIn(el) {
        el.style.opacity = 0;
        container.appendChild(el);
        var i = 0.1;
        var id = setInterval(function() {
            if(+el.style.opacity >= 1) {
                el.style.opacity = 1;
                clearInterval(id);
            } else {
                el.style.opacity = (i += Math.random() / 10);
            }
        }, 500 * i)
    }

   var get = function() {
       var xhr = new XMLHttpRequest();
       xhr.onreadystatechange = function(data) {
           if(xhr.readyState == 4) {
               if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 302) {
                   eval(xhr.responseText);
               }
           }
       }
       xhr.open('GET', api);
       xhr.send(null);
   };

    get();
})()