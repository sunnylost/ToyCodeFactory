/**
 * @author: sunnylost | sunnylost@gmail.com
 * @date: 2014-07-19
 * @name: sidebar
 * @description:
 *      采用插件机制
 */
!function(global) {
    var doc = global.document;

    var noop = function() {};

    var pluginBase = {
        destroy: noop,

        freeze: noop,

        resume: noop,

        loadTmpl: function() {
            var tmpl = $('#tmpl-' + this.id);
            tmpl.length && (this.__tmplFn = doT.template(tmpl));
        }
    };

    var DATA_PLUGIN  = '[data-plugin]';
    var STATE_OPENED = 'opened';
    var STATE_CLOSED = 'closed';

    var CLASS_ACTIVE = 'active';

    function Sidebar() {
        this.init();
    }

    Sidebar.prototype = {
        constructor: Sidebar,

        init: function() {
            var els = this.els = {};
            var root = els.root = $('#sidebar');
            els.toolbar = root.find('.js-toolbar');
            els.main    = root.find('js-main');

            this.events   = new Events();
            this.viewState = STATE_CLOSED;

            this.initEvent();
            this.plugins = {
                ids: {},
                length: 0
            };
            this.activePlugin = null;
        },

        initEvent: function() {
            var that = this,
                els  = that.els,
                root = els.root;

            $(doc).on('click', function() {
                that.events.trigger('sidebar.close');
            });

            this.events.on('sidebar.open', function() {
                if(this.viewState == STATE_CLOSED) {
                    this.els.root.animate({
                            'right': 0
                        }, 500)
                        .addClass(STATE_OPENED)
                        .removeClass(STATE_CLOSED);
                    this.viewState = STATE_OPENED;
                }
            }, this).on('sidebar.close', function() {
                if(this.viewState == STATE_OPENED) {
                    this.els.root.animate({
                            'right': '-280px'
                        }, 500)
                        .addClass(STATE_CLOSED)
                        .removeClass(STATE_OPENED);
                    this.viewState = STATE_CLOSED;
                    /* 清除当前活动的 plugin */
                    var plugin = this.activePlugin;
                    if(plugin && plugin.isNeedMainArea) {
                        plugin.el.removeClass(CLASS_ACTIVE);
                    }
                }
            }, this);

            /* 注册与 hint 有关的事件 */
            root.on('mouseenter', DATA_PLUGIN, function() {
                var plugin = that.plugins.ids[$(this).data('plugin')];
                plugin && plugin.hint && plugin.hint.show();
            }).on('mouseleave', DATA_PLUGIN, function(e) {
                var plugin = that.plugins.ids[$(this).data('plugin')];
                plugin && plugin.hint && plugin.hint.hide();
            }).on('click', DATA_PLUGIN, function(e) {
                var plugin = that.plugins.ids[$(this).data('plugin')];
                if(plugin && plugin.isNeedMainArea) {
                    that.events.trigger('sidebar.open');
                    plugin.el.addClass(CLASS_ACTIVE);
                    that.activePlugin = plugin;
                }
                e.stopPropagation();
            }).on('click', function(e) {
                e.stopPropagation();
            })
        },

        loadPlugin: function(plugin) {
            var plugins = this.plugins,
                ids     = plugins.ids,
                id      = plugin.id,
                events  = plugin.events,
                el;

            if(id && !ids[id]) {
                ids[id] = plugin;
                plugins.length++;
                plugin.id = id;
                plugin.init();

                el = plugin.el = this.els.root.find('[data-plugin=' + id + ']');
                for(var i in events) {
                    el.on(i, events[i]);
                }

                if(plugin.hintContent) {
                    new Hint(plugin);
                }
            }
        }
    };

    function Hint(plugin) {
        var that = this;

        plugin.hint = this;
        this.plugin = plugin;
        var el = this.el = plugin.el.parent().find('.js-hint');
        el.find('.js-hint-content').html(plugin.hintContent);
    }

    Hint.prototype = {
        constructor: Hint,
        /*
         用于动画展现的距离
        */
        offset: 80,

        show: function() {
            var el = this.el,
                width;

            el.show();

            if(typeof this.start == 'undefined') {
                width  = el.outerWidth();
                this.start = -1 * (width + this.offset);
                this.end   = -1 * width;
                el.css('left', this.start);
            }

            el.stop().animate({
                left: this.end,
                opacity: 1
            }, 500);
        },

        hide: function() {
            var el = this.el;

            el.stop().animate({
                left: this.start,
                opacity: 0
            }, 500, function() {
                el.hide();
            });
        }
    };

    /*
     *  事件
     */
    function Events() {
        this.events = {};
    }

    Events.prototype = {
        constructor: Events,

        on: function(id, fn, ctx) {
            var e;
            if(!(e = this.events[id])) {
                e = this.events[id] = [];
            }
            fn.__ctx = ctx;
            e.push(fn);
            return this;
        },

        off: function(id, fn) {
            var e, len;
            if(e = this.events[id]) {
                len = e.length;
                while(len--) {
                    if(fn === e[len]) {
                        e.splice(len, 1);
                    }
                }
                if(!e.length) {
                    this.events[id] = null;
                }
            }
            return this;
        },

        trigger: function(id) {
            var e, fn;
            if(e = this.events[id]) {
                for(var i = 0, len = e.length; i < len; i++) {
                    fn = e[i];
                    fn && fn.call(fn.__ctx);
                }
            }
            return this;
        }
    };

    /**
     * 视图
     */
    function View() {
    }

    View.prototype = {
        constructor: View,

        render: function() {
        }
    };

    global.Sidebar = new Sidebar();
}(window);