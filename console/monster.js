(function(win, doc) {
    /* Util */
    var _ = function(selector, context) {
        return (context || doc).querySelectorAll(selector);
    };

    //create element
    _.el = function(tag) {
        return doc.createElement(tag);
    };

    _.get = function(name, context) {
        var cache = this.cache,
            attrs = this._obj.ATTRS;
        return cache[name] || (cache[name] = _(attrs && attrs[name] || name, context));
    };

    var Event = {
        _handlers: {},

        on: function(name, handler, context) {
            var handlers = this._handlers;
            (handlers[name] || (handlers[name] = [])).push(handler.bind(context));
        },

        off: function(name, handler) {
            var handlers = this._handlers[name];
            if(handler) {
                for(var i = 0, len = handlers.length; i < len; i++) {
                    if(handlers[i] === handler) {
                        handlers.splice(i, 1);
                        len--;
                    }
                }
            } else {
                this[name] = [];
            }
        },

        trigger: function(name, data) {
            var handlers = this._handlers[name] || [];
            for(var i = 0, len = handlers.length; i < len; i++) {
                handlers[i].call(this, data);
            }
        }
    };

    var rhash      = /#(.+)$/,
        rkeyevents = /keypress|keydown|keyup/,
        rattrs     = /{{([^}]+)}}/g;

    /* fakeMVC */
    function Monster(obj) {
        return new Monster.prototype.initialize(obj);
    }

    Monster.prototype = {
        constructor: Monster,

        initialize: function(obj) {
            var that    = this;
            this._obj   = obj;
            this.routes = {};
            this.cache  = {};
            this.el     = typeof obj.el == 'string' ? _(obj.el)[0] : doc;
            this._      = _;
            win.addEventListener('hashchange', this.route.bind(this));

            var events = obj.EVENTS;
            if(events) {
                for(var name in events) {
                    var el = events[name],
                        handler;
                    for(var e in el) {
                        handler = el[e];
                        if(e.match(rkeyevents)) {
                            var oldHandler = handler;
                            handler = function(e) {
                                var handler = oldHandler[e.keyCode];
                                handler && handler.call(that, e);
                            }
                        }
                        var els = this.get(name);
                        for(var i = 0, len = els.length; i < len; i++) {
                            els[i].addEventListener(e, handler.bind(this));
                        }
                    }
                }
            }
            typeof obj.init == 'function' && obj.init.call(this);
        },

        get: _.get,

        route: function(e) {
            this.route.redirect(e, this);
        }
    };

    Monster.bootstrap = function(obj) {
        var m    = Monster(obj),
            h    = {},
            that = this;

        m.view  = new View(obj.view);
        m.model = new Model(obj.model);
        m.route = new Route(obj.route);
        [ m, m.view, m.model, m.route ].forEach(function(v) {
            v.cache     = m.cache;
            v.on        = Event.on;
            v.off       = Event.off;
            v.trigger   = Event.trigger;
            v._handlers = h;
            v.init && v.init.call(v);
        })

        return m;
    };

    Monster.prototype.initialize.prototype = Monster.prototype;

    var Model = function(obj) {
        for(var key in obj) {
            this[key] = obj[key];
        }
        this._obj = obj;
    };

    Model.prototype = {
        constructor: Model,

        get: _.get
    };

    var View = function(obj) {
        for(var key in obj) {
            this[key] = obj[key];
        }
        this._obj = obj;
    };

    View.prototype = {
        constructor: View,

        get: _.get,

        clear: function() {
            var el = this.get(this.el)[0];
            el.innerHTML = '';
        },

        render: function(obj) {
        },

        compile: function(key, datas) {
            var tmpl = this.templates[key];
            return tmpl ? tmpl.replace(rattrs, function(_, attr) {
                var r = datas[attr]
                return typeof r == 'undefined' ? '' : r;
            }) : '';
        }
    };

    var Route = function(routes) {
        this.routes = routes || {};
    };

    Route.prototype = {
        constructor: Route,

        redirect: function(e, context) {
            var routes  = this.routes,
                all  = routes['*'],
                oldHash = e.oldHash = e.oldURL.match(rhash)[1],
                newHash = e.newHash = e.newURL.match(rhash)[1]
            routes[newHash] ?
                 routes[newHash].call(context, e) :
                 all && all.call(context, e);
        }
    };

    Monster.Event = Event;
    win.Monster = Monster;
}(window, document))
