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

    var rhash      = /#(.+)$/,
        rkeyevents = /keypress|keydown|keyup/;

    /* fakeMVC */
    function Monster(obj) {
        return new Monster.prototype.init(obj);
    }

    Monster.prototype = {
        constructor: Monster,

        init: function(obj) {
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
            console.log(events);

            typeof obj.init == 'function' && obj.init.call(this);
        },

        get: _.get,

        route: function(e) {
            this.route.redirect(e, this);
        }
    };

    Monster.bootstrap = function(obj) {
        var m   = Monster(obj);
        m.view  = new View(obj.view);
        m.model = new Model(obj.model);
        m.route = new Route(obj.route);
        m.route.cache = m.model.cache = m.view.cache = m.cache;
        return m;
    };

    Monster.prototype.init.prototype = Monster.prototype;

    var Model = function(obj) {
        return this._obj = obj;
    };

    Model.prototype = {
        constructor: Model,

        get: _.get
    };

    var View = function(obj) {
        this._obj = obj;
        this.el   = obj.el;
    };

    View.prototype = {
        constructor: View,

        get: _.get,

        clear: function() {
            var el = this.get(this.el);
            el.innerHTML = '';
        },

        render: function(obj) {
            var model = this.model;
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

    win.Monster = Monster;
}(window, document))
