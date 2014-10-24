
var carbon = (function() {
    "use strict";

    var mapContainer = function mapContainer(key) {
        return context.providers[key];
    };

    var factory = function(name, Factory) {
        var _this = this,
            deps = arguments.length > 2 ? Array.prototype.slice.call(arguments, 1) : null;

        if (_this.providers[name]) {
            var Service = _this.providers[name];
            return new Service();
        }

        if (deps) {
            Factory = Factory.bind.apply(Factory, deps.map(_this.mapContainer, _this));
        }        

        _this.providers[name] = Factory;

        return _this.providers[name]();
    };

    var service = function(name, Service) {
        var _this = this,
            deps = arguments.length > 2 ? Array.prototype.slice.call(arguments, 1) : null;

        if (_this.providers[name]) {
            return _this.providers[name];
        }

        if (deps) {
            Service = Service.bind.apply(Service, deps.map(_this.mapContainer, _this));
        }

        _this.providers[name] = new Service();

        return _this.providers[name];
    };

    var carbon = {
        instances: {},
        module: function(name) {
            var _this = this,
                deps = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null;

            var instance = Object.create(null);
            instance.providers = {};
            instance.factory = factory;
            instance.service = service;
            instance.mapContainer = function mapContainer(key) {
                return this.providers[key];
            };

            // if we have dependencies, load the other modules dependencies into our 
            if (deps) {
                for (var i in deps) {
                    if (deps[i].indexOf('.') === -1) {
                        continue;
                    }

                    var mod = deps[i].split('.')[0], provider = deps[i].split('.')[1];

                    if (!carbon.instances[mod] || !carbon.instances[mod].providers[provider]) {
                        continue;
                    }

                    instance.providers[deps[i]] = carbon.instances[mod].providers[provider];
                }
            }

            _this.instances[name] = instance;

            return _this.instances[name];

        },
        wrap: function(fn) {
            var deps = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null;

            // if no depenendencies, we don't need to be here.
            if (!deps) {
                return fn;
            }

            // wrap a function to enable di.
            return fn.bind.apply(fn, deps.map(mapContainer, deps));
        }
    };
    return carbon;
})();
