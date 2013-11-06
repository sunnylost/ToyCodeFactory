(function() {
    var Frame = function(container) {
        this.init(container);
    };

    Frame.prototype = {
        init: function(container) {
            var that = this, el, img;

            that.container = container;
            el = that.el = $(that.tmpl);
            img = container.find('img');
            that.rdatas = /([^:]+)(?::(\S+))?/,
            that.isDown = false;
            that.imgSize = {
                width: img.width(),
                height: img.height()
            }
            container.append(el);

            el.on('mousedown', $.proxy(that.events.mousedown, that));
        },

        limit: {
            min: 10,
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
                    el = this.el;
                this.isDown = true;
                this.origin = {
                    x: e.clientX,
                    y: e.clientY
                };
                this.pos = el.position();
                this.size = {
                    width: el.width(),
                    height: el.height()
                };
                $(document).on('mousemove', { type: type }, $.proxy(this.events.mousemove, this))
                           .on('mouseup', $.proxy(this.events.mouseup, this));
            },

            mousemove: function(e) {
                this.clearSelection();
                var that = this;
                if(!that.isDown) return;
                var m = e.data.type.match(that.rdatas),
                    type = m[1];

                that[type](e.clientX, e.clientY, m[2]);
            },

            mouseup: function() {
                this.isDown = false;
                $(document).off('mousemove')
                           .off('mouseup');
            }
        },

        change: function(x, y, dir) {
            var that    = this,
                el      = that.el,
                origin  = that.origin,
                imgSize = that.imgSize,
                pos     = that.pos,
                size    = that.size,
                limit   = that.limit,
                min     = limit.min,
                max     = limit.max,
                w       = size.width,
                h       = size.height,
                result  = {},
                w, h, t, l,
                ratio,
                config  = this.resizeConfig[dir],
                offsetX  = x - origin.x,
                offsetY  = y - origin.y;

                if(dir) {
                    w = size.width + config.width * offsetX;
                    h = size.height + config.height * offsetX;
                }

                if(w < min || h < min) {
                    w = h = min;
                } else if(w > max || h > max) {
                    w = h = max;
                } else {
                    l = pos.left + (dir ? (config.left * offsetX) : offsetX);
                    t = pos.top +  (dir ? (config.top * offsetX) : offsetY);
                    l < 0 && (l = 0);
                    t < 0 && (t = 0);
                }

                imgSize.width < (l + w) && (l = imgSize.width - w);
                imgSize.height < (t + h) && (t = imgSize.height - h);

                result = {
                    width: w,
                    height: h,
                    top: t,
                    left: l
                };

            ratio = this.ratio(l, t, w, h, imgSize.width, imgSize.height);
            el.css(result);
            that.container.trigger('change', [ ratio ]);
        },

        ratio: function(x1, y1, x2, y2, x3, y3) {
            return {
                h: (x1 / (x3 || x2)).toFixed(2),
                v: (y1 / (y3 || y2)).toFixed(2),
                hr: x3 ? (x2 / x3).toFixed(2) : 0,
                vr: y3 ? (y2 / y3).toFixed(2) : 0,
            }
        }
    };

    var Clip = function(el) {
        this.init(el);
    };

    Clip.prototype = {
        init: function(container) {
            var that = this, el, img;
            $.each(that.events, function(k, v) {
                container.on(k, $.proxy(v, that));
            });
            el = that.el = $(that.tmpl.replace('$', container.find('img').attr('src')));
            container.parent().append(el);

            img = that.img = el.find('img');
            that.imgSize = {
                width: img.width(),
                height: img.height()
            };
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
                    imgSize = this.imgSize,
                    result = {
                        top: -1 * ratio.v * imgSize.height,
                        left: -1 * ratio.h * imgSize.width
                    };

                if(ratio.hr || ratio.vr) {
                    imgSize.width = result.width = (size.width / ratio.hr);
                    imgSize.height = result.height = (size.height / ratio.vr);
                }
                this.img.css(result);
            }
        }
    };

    $.fn.clip = function(opts) {
        var that = $(this),
            f = new Frame(that),
            c = new Clip(that);
        return that;
    };
}());


$(function() {
    $('.img').clip();
})
