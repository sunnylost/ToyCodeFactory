(function() {
	var ObjectProto = Object.prototype,
		toString = ObjectProto.toString,

		guid = 0,
		doc = document,
		W3C = doc.dispatchEvent,
		rstate = /loaded|complete/i;

	var isArray = function(a) {
		return toString.call(a) == '[object Array]';
	};

	var isFunction = function(f) {
		return toString.call(f) == '[object Function]';
	};

	var modules = {},
		dependencies = [],
		anonymous = false,
		temp = null,  //用于临时存放module
		callbackFn = function() {};

	/*
		加载JS
	*/
	var loadJS = function(name, index, byDepend) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;

		script[W3C ? 'onload' : 'onreadystatechange'] = function() {
			if(W3C || rstate.test(script.readyState)) {
				console.log(name + '.js loaded success!');
				resolveDependent(name, index, byDepend);
			}
		};

		script.onerror = function() {
			console.log(name + '.js loaded failure!');
		};

		script.src = name + '.js';
		document.head.appendChild(script);
	};

	var generateModule = function(name, depend, module, byDepend) {
		var m = null;
		!isArray(depend) && (depend = [depend]);
		temp = {
			depend : depend,
			ok : false,  //模块不可使用
			param : [],
			module : module,
			byDepend : byDepend
		};
		if(typeof name != 'undefined') {
			modules[name] = temp;
		} else {
			anonymous = true;
		}
	};

	var resolveDependent = function(name, index, byDepend) {
		var m, d, dm, isOk = true;
		if(anonymous) {
			anonymous = false;
			m = modules[name] = temp;
			temp = null;
		} else {
			m = modules[name];
		}
		d = m.depend;
		m.byDepend = byDepend;
		m.index = index;
		if(d.length > 0) {
			for(var i = 0, len = d.length; i < len; i++) {
				dm = d[i];
				if(!modules[dm] || !modules[dm].ok) {
					loadJS(d[i], i, name);
					isOk = false;
				}
			}
			if(!isOk) return;
		}
		m.byDepend = byDepend;
		m.ok = true;

		var byModule,
			depend;
		while(typeof (byModule = modules[byDepend]) != 'undefined') {
			depend = byModule.depend;

			depend[m.index] = true;
			byModule.param[m.index] = m.module.apply(null, m.param);
			for(var i = 0, len = depend.length; i < len; i++) {
				if(typeof depend[i] != 'boolean') return;
			}
			byModule.ok = true;
			(byDepend === '' ? callbackFn : byModule.module).apply(null, byModule.param);

			byDepend = byModule.byDepend;
			m = byModule;
		}
	};

	var define = function(name, depend, module) {
		if(!module) {
			module = depend;
			depend = name;
			name = undefined;
		}
		generateModule(name, depend, module);
	};

	var require = function(depend, callback) {
		if(typeof callback == 'undefined') {
			isFunction(depend) && depend.call(null);
		} else {
			isFunction(callback) && (callbackFn = callback);
			generateModule('', depend, callback);
			if(isArray(depend)) {
				var i = 0,
					len = depend.length;
				if(len === 0) {
					callbackFn.call(null);
					return;
				}
				for(; i < len; i++) {
					loadJS(depend[i], i, '');
				}
			} else {
				loadJS(depend, '');
			}
		}
	};

	this.define = define;
	this.require = require;
	this.modules = modules;
}).call(this);