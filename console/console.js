(function(win, doc) {
    var globalStyle;

    var stack = {
    };

    /* Console API */
    var apis = {
        assert: function() {  },
        info: function() {  },
        log: function() {},
        debug: function() {  },
        warn: function() {  },
        error: function() {  },

        clear: function() {  },
        count: function() {  },

        dir: function() {  },
        dirxml: function() {  },

        markTimeline: function() {  },
        profile: function() {  },
        profileEnd: function() {  },
        table: function() {  },

        group: function() {  },
        groupCollapsed: function() {  },
        groupEnd: function() {  },


        time: function() {  },
        timeEnd: function() {  },
        timeStamp: function() {  },
        timeline: function() {  },
        timelineEnd: function() {  },
        trace: function() {  }
    };

    var Console = {
        ATTRS: {
            input: '.console-input'
        },

        EVENTS: {
            '.console-inputwrap': {
                click: function() {
                    this.get('input')[0].focus();
                }
            },

            '.console-input': {
                keypress: {
                    13: function(e) {
                        var el      = this.get('input')[0],
                            content = el.innerHTML;
                        var m = this.model;
                        el.innerHTML = '';
                        this.trigger('render', {
                            type   : 'log',
                            content: content
                        })
                    }
                }
            }
        },

        el: '.console-wrap',  //root element

        init: function() {
            this.originConsole = win.console;
            //win.console = Console;
            var _ = this._;
            _('head')[0].appendChild(globalStyle = _.el('style'));
        }
    };

    Console.model = {
        filter: function(type) {
            globalStyle.innerHTML = '.console-' + type + ' {display: none;}';
        }
    };

    Console.route = {
        '*': function(e) {
            this.model.filter(e.newHash);
        },

        'clear': function() {
            this.view.clear();
        }
    };

    Console.view = {
        init: function() {
            console.log(this)
            this.on('render', this.render, this);
        },

        templates: {
            item: '<li class="console-{{type}}"><i class="console-gutter"></i><div class="console-content">{{content}}</div></li>'
        },

        el: '.console-result',

        render: function(data) {
            var result = this.compile('item', data);
            this.get(this.el)[0].innerHTML += result;
        }
    };

    Monster.bootstrap(Console);
}(window, document))
