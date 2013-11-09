/*
    @date: 2013-11-9
    @author: sunnylost | sunnylost@gmail.com
*/
(function (win, doc) {
    var rattr   = /@(.+)/,
        rglobal = /^(win|doc)$/,

        global = {
            win: win,
            doc: doc
        },

        MAX_SIZE           = 640,
        ICON_RIGHT_OFFSET  = 30,
        ICON_ACTUAL_OFFSET = MAX_SIZE / 2 - ICON_RIGHT_OFFSET;

    var _ = function(selector) {
        return doc.querySelectorAll(selector);
    };

    var app = {
        cache: {},

        init: function() {
            this.fixSettingPosition();
            this.initEvents();
        },

        initEvents: function() {
            var events    = this.EVENTS,
                e, m, el, evs;
            for(var name in events) {
                evs = events[name];
                m = name.match(rattr);
                if(m) {
                    el = this.get(m[1])[0]; //TODO
                } else {
                    m = name.match(rglobal);
                    el = m ? global[m[1]] : _(name);
                }
                for(var n in evs) {
                    el.addEventListener(n, evs[n].bind(this));
                }
            }

        },

        get: function(name) {
            var cache = this.cache;
            console.log(name)
            return cache[name] || (cache[name] = _(this.ATTRS[name]));
        },

        fixSettingPosition: function() {
            var w = win.innerWidth;
            this.get('setting')[0].style.right = (w < MAX_SIZE ? ICON_RIGHT_OFFSET : (w / 2 - ICON_ACTUAL_OFFSET)) + 'px';
        }
    };

    app.ATTRS = {
        setting: '.setting'
    };

    app.EVENTS = {
        '@setting': {
            'click': function() {
                //show setting panel
            }
        },

        'win': {
            'resize': function() {
                clearTimeout(this.globalID);
                this.globalID = setTimeout(this.fixSettingPosition.bind(this), 50);
            }
        }
    };

    app.init();
}(window, document))