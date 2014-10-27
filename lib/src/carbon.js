
(function(exports) {
    "use strict";

    var factory = function(name, Factory) {
        var _this = this,
            deps = arguments.length > 2 ? Array.prototype.slice.call(arguments, 1) : null,
            Service,
            f;

        if (_this.factories[name]) {
            Service = _this.factories[name];
            f = new Service();
            return f;
        }

        if (deps) {
            Factory = Factory.bind.apply(Factory, deps.map(_this.mapContainer, _this));
        }        

        _this.factories[name] = Factory;

        Service = _this.factories[name];
        f = new Service();
        return f;
    };

    var service = function(name, Service) {
        var _this = this, extend, deps;

        // ----------------------------------------
        // if the service exists and no additional paramters, return it
        // ----------------------------------------
        if (_this.services[name] && arguments.length === 1) {
            return _this.services[name];
        }

        // ----------------------------------------
        // creating/replace an existing service
        // ----------------------------------------
        if (typeof Service === 'object') {
            extend = Service;
            Service = arguments[2];
        }

        // ----------------------------------------
        // if the service exists and no additional paramters, return it
        // ----------------------------------------
        if (extend) {
            deps = arguments.length > 2 ? Array.prototype.slice.call(arguments, 3) : null
        } else {
            deps = arguments.length > 2 ? Array.prototype.slice.call(arguments, 1) : null;
        }

        if (deps) {
            Service = Service.bind.apply(Service, deps.map(_this.mapContainer, _this));
        }

        if (extend) {
            var s = new Service();
            for (var attrname in s) {
                extend[attrname] = s[attrname];
            }

            _this.services[name] = extend;
        } else {
            _this.services[name] = new Service();
        }

        return _this.services[name];
    };

    var carbon = {
        instances: {},
        _importFromModule: function(dep) {
            if (undefined === dep.indexOf || dep.indexOf('.') === -1) {
                return;
            }

            var mod = dep.split('.')[0], provider = dep.split('.')[1];

            if (!carbon.instances[mod]) {
                return;
            }

            if (carbon.instances[mod].factories[provider]) {
                return [carbon.instances[mod].factories[provider], 'factory'];
            }

            if (carbon.instances[mod].services[provider]) {
                return [carbon.instances[mod].services[provider], 'service'];
            }
        },
        module: function(name) {
            var _this = this,
                deps = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null;

            if (_this.instances[name]) {
                return _this.instances[name];
            }

            var instance = Object.create(null);
            instance.factories = {};
            instance.services = {};
            instance.factory = factory;
            instance.service = service;
            instance.mapContainer = function mapContainer(key) {
                if (this.factories[key]) {
                    return new this.factories[key]();
                } else {
                    return this.services[key];
                }
            };

            // if we have dependencies, load the other modules dependencies into our 
            if (deps) {
                for (var i in deps) {
                    var d = carbon._importFromModule(deps[i]);

                    if (!d) {
                        return;
                    }

                    if (d[1] === 'service') {
                        instance.services[deps[i]] = d[0];
                    } else {
                        instance.factories[deps[i]] = d[0];
                    }
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
            if (deps) {
                for (var i in deps) {
                    var d = carbon._importFromModule(deps[i]);
                    container.push(d[0]);
                }
            }

            // wrap a function to enable di of module dependencies.
            return fn.bind.apply(fn, container);
        }
    };

    exports.carbon = carbon;
})(this);
