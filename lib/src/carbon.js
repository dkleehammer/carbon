
(function(exports) {
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

        var Service = _this.providers[name];
        return new Service();
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
        _importFromModule: function(dep) {
            if (undefined === dep.indexOf || dep.indexOf('.') === -1) {
                return;
            }

            var mod = dep.split('.')[0], provider = dep.split('.')[1];

            if (!carbon.instances[mod] || !carbon.instances[mod].providers[provider]) {
                return;
            }

            return carbon.instances[mod].providers[provider];
        },
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
                   instance.providers[deps[i]] = carbon._importFromModule(deps[i]);
                }
            }

            _this.instances[name] = instance;

            return _this.instances[name];

        },
        wrap: function(fn) {
            var deps = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null,
                container = [undefined]; // first item has to be undefined for some reason

            // if no depenendencies, we don't need to be here.
            if (!deps) {
                return fn;
            }

            // loop through dependencies, map to their modules, and retrieve them from it's providers
            for (var i in deps) {
                var d = carbon._importFromModule(deps[i]);

                if (d) {
                    container.push(d);
                }
            }

            // wrap a function to enable di of module dependencies.
            return fn.bind.apply(fn, container);
        }
    };

    exports.carbon = carbon;
})(this);
