/**
 * @author: sunnylost | sunnylost@gmail.com
 * @date: 2014-07-19
 * @name: sidebar
 * @description:
 *      采用插件机制
 */
!function(global) {
    var doc = global.document;

    var DATA_PLUGIN = '[data-plugin]';

    function Sidebar() {
        this.init();
    }

    Sidebar.prototype = {
        constructor: Sidebar,

        init: function() {
            var els = this.els = {};
            var root = els.root = $('#sidebar');
            els.toolbar = root.find('.js-toolbar');

            this.initEvent();
            this.plugins = {
                ids: {},
                length: 0
            };
        },

        initEvent: function() {
            var that = this,
                els  = that.els,
                root = els.root,
                toolbar = els.toolbar;

            /* 注册与 hint 有关的事件 */
            toolbar.on('mouseenter', DATA_PLUGIN, function() {
                var plugin = that.plugins.ids[$(this).data('plugin')];
                plugin && plugin.hint && plugin.hint.show();
            }).on('mouseleave', DATA_PLUGIN, function(e) {
                var plugin = that.plugins.ids[$(this).data('plugin')];
                plugin && plugin.hint && plugin.hint.hide();
            }).on('click', DATA_PLUGIN, function() {
                console.log('click')
            })
        },

        loadPlugin: function(plugin) {
            var plugins = this.plugins,
                ids = plugins.ids,
                id  = plugin.id;

            if(id && !ids[id]) {
                ids[id] = plugin;
                plugins.length++;
                plugin.id = id;
                plugin.init();

                plugin.el = this.els.root.find('[data-plugin=' + id + ']');
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
        offset: 100,

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

            el.animate({
                left: this.end,
                opacity: 1
            }, 500);
        },

        hide: function() {
            var el = this.el;

            el.animate({
                left: this.start,
                opacity: 0
            }, 500, function() {
                el.hide();
            });
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