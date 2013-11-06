(function() {
    var doc    = $(document),
        isDown = false,
        rdatas = /([^:]+)(?::(\S+))?/,
        imgWidth,
        imgHeight;

    var Frame = function(container) {
        this.init(container);
    };

    Frame.prototype = {
        init: function(container) {
            var that = this, el, img;
            that.container = container;

            el  = that.el  = $(that.tmpl);
            img = container.find('img');
            imgWidth  = img.width();
            imgHeight = img.height();
            container.append(el);

            el.on('mousedown', $.proxy(that.events.mousedown, that));
        },

        limit: {
            min: 60,
            max: 300
        },

        resizeConfig: {
            tl: {
                top: 1,
                left: 1,
                width: -1,
                height: -1
            },

            tr: {
                top: -1,
                left: 0,
                width: 1,
                height: 1
            },

            br: {
                top: 0,
                left: 0,
                width: 1,
                height: 1
            },

            bl: {
                top: 0,
                left: 1,
                width: -1,
                height: -1
            }
        },

        clearSelection : window.getSelection ? function() {
            window.getSelection().removeAllRanges();
        } : function() {
            document.selection.empty();
        },

        tmpl: '<div class="s-frame" data-type="change">\
                  <i class="s-frame-tl" data-type="change:tl"></i>\
                  <i class="s-frame-tr" data-type="change:tr"></i>\
                  <i class="s-frame-br" data-type="change:br"></i>\
                  <i class="s-frame-bl" data-type="change:bl"></i>\
               </div>',

        events: {
            mousedown: function(e) {
                var type = $(e.target).data('type'),
                    el   = this.el;

                isDown = true;
                this.origin = {
                    x: e.clientX,
                    y: e.clientY
                };
                this.pos  = el.position();
                this.size = {
                    width : el.width(),
                    height: el.height()
                };
                doc.on('mousemove', { type: type }, $.proxy(this.events.mousemove, this))
                   .on('mouseup', $.proxy(this.events.mouseup, this));
            },

            mousemove: function(e) {
                if(!isDown) return;
                this.clearSelection();
                var m    = e.data.type.match(rdatas),
                    type = m[1];

                this[type](e.clientX, e.clientY, m[2]);
            },

            mouseup: function() {
                isDown = false;
                doc.off('mousemove')
                   .off('mouseup');
            }
        },

        change: function(x, y, dir) {
            var that    = this,
                el      = that.el,
                origin  = that.origin,
                pos     = that.pos,
                size    = that.size,
                limit   = that.limit,
                min     = limit.min,
                max     = limit.max,
                w       = size.width,
                h       = size.height,
                t, l,
                config  = this.resizeConfig[dir],
                offsetX  = x - origin.x,
                offsetY  = y - origin.y;

            if(dir) {
                w += config.width * offsetX;
                h += config.height * offsetX;
            }

            if(w < min || h < min) {
                w = h = min;
            } else if(w > max || h > max) {
                w = h = max;
            } else {
                l = pos.left + (dir ? (config.left * offsetX) : offsetX);
                t = pos.top  + (dir ? (config.top  * offsetX) : offsetY);
                l < 0 && (l = 0);
                t < 0 && (t = 0);
            }

            imgWidth  < (l + w) && (l = imgWidth  - w);
            imgHeight < (t + h) && (t = imgHeight - h);
            el.css({
                width : w,
                height: h,
                top   : t,
                left  : l
            });
            that.container.trigger('change', [{
                h : (l /  imgWidth).toFixed(2),
                v : (t / imgHeight).toFixed(2),
                hr: (w /  imgWidth).toFixed(2),
                vr: (h / imgHeight).toFixed(2)
            }]);
        }
    };

    var Clip = function(el) {
        this.init(el);
    };

    Clip.prototype = {
        init: function(container) {
            var that = this, el;
            $.each(that.events, function(k, v) {
                container.on(k, $.proxy(v, that));
            });
            el = that.el = $(that.tmpl.replace('$', container.find('img').attr('src')));
            container.parent().append(el);

            that.img = el.find('img');
            that.size = {
                width: el.width(),
                height: el.height()
            };
        },

        tmpl: '<div class="s-clip">\
                    <img src="$">\
               </div>',

        events: {
            change: function(e, ratio) {
                var size = this.size,
                    img  = this.img;

                img.css({
                    top    : -1 * ratio.v * img.height(),
                    left   : -1 * ratio.h * img.width(),
                    width  : (size.width / ratio.hr).toFixed(2),
                    height : (size.height / ratio.vr).toFixed(2)
                });
            }
        }
    };

    $.fn.clip = function() {
        var that = $(this),
            f = new Frame(that),
            c = new Clip(that);
        return that;
    };
}());


$(function() {
    $('.img').clip();
})