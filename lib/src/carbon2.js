
(function(exports) {
    "use strict";

    var slice = Array.prototype.slice;

    function extend(destination, source) {
        for (var k in source) {
            if (source.hasOwnProperty(k)) {
                destination[k] = source[k];
            }
        }
        return destination; 
    }

    var moduleTemplate = {
        _providers: {},
        _get: function(providerName) { return this._providers[providerName] || undefined; },
        _set: function(providerName, provider) { return this._providers[providerName] = provider},
        _find: function(name) {
            for (var i in this._providers) {
                if (i.indexOf(name) === 0) {
                    return this._providers[i];
                }
            }
        },
        _mapDependencies: function mapDependencies(key) { return this._find(key); },
        factory: function(name, Factory) {
            // name, opts, Factory || shift name, Factory based on typeof param of arguments[1].
            // user supplies this.$service which we pass to the service build... need to pick
            // apart service method to not store, etc if called from factory, etc.

            /* usage example
            mod.factory('Log', {env: 'PROD'}, function() {
                this.$service = function() {
                    this.log = function(msg) {
                        if (env !== 'development') {
                            console.log(msg);
                        }
                    };
                    this.error = function(msg) {
                        if (env === 'development' || env === 'qa') {
                            console.log(msg);
                        }
                    };
                };

                return this;  <-- I think
            });
            */
        },
        service: function(name, Service) {
            var providerName = name + 'Service',
                deps = arguments.length > 2 ? slice.call(arguments, 1, arguments.length) : null,
                extendObj, provider;

            // ----------------------------------------
            // check if the service exists
            // ----------------------------------------
            if (provider = (this._get(providerName))) {
                // ----------------------------------------
                // check if accessing or creating, if creating and already exists, then throw error
                // ----------------------------------------
                if (arguments.length === 1) {
                    return provider
                } else {
                    throw new Error('ProviderError: Service provider ' + name + ' already exists in module');
                }
            }

            // ----------------------------------------
            // check if we are extending an object
            // ----------------------------------------
            if (typeof Service === 'object') {
                extendObj = Service;
                Service = arguments[2];
            }

            // ----------------------------------------
            // add any dependencies if they exist
            // ----------------------------------------
            Service = deps ? Service.bind.apply(Service, deps.map(this._mapDependencies, this)) : Service;

            // ----------------------------------------
            // instantiate the service
            // ----------------------------------------
            Service = new Service();

            // ----------------------------------------
            // if we are extending the object, use extend
            // ----------------------------------------
            Service = extendObj ? extend(Service, extendObj) : Service;

            // ----------------------------------------
            // store the singleton
            // ----------------------------------------
            return this._set(providerName, Service);
        }
    };

    var carbon = {
        _modules: {},
        map_dependencies: function(module, dependencies) {
            var container = [], mod, provider, other_module;
            for (var i in dependencies) {
                if (undefined === dependencies.indexOf || dependencies.indexOf('.') === -1) {
                    continue
                }

                mod = dependencies.split('.')[0], provider = dependencies.split('.')[1];

                // check if the other module exists and the provider exists in it.
                if (!carbon._get(mod) || !carbon._get(mod)._get(provider)) {
                    continue;
                }

                // if all exists, set the provider into this module
                module._set(i, carbon._get(mod)._get(provider));
            }
        },
        _get: function(name) { return this._modules[name] || undefined; },
        _set: function(name, module) { return this._modules[name] = module},
        module: function(name) {
            var deps = arguments.length > 1 ? slice.call(arguments, 1) : null;
            if (this._get(name)) {
                return this._get(name);
            }

            // create new instance
            var instance = Object.create(moduleTemplate);

            instance._name = name;

            // import other module dependencies
            if (deps) {
                this.map_dependencies(instance, deps);
            }

            return instance = this._set(name, instance);
        }
    };

    exports.carbon = carbon;
})(this);
