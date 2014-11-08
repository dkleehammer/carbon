
(function(exports) {
    "use strict";

    var slice = Array.prototype.slice;

    function ModuleTemplate() {
        return {
            _providers: {},
            _get: function(providerName) { return this._providers[providerName] || undefined; },
            _set: function(providerName, provider) { return (this._providers[providerName] = provider); },
            _find: function(name, constructed) {
                for (var i in this._providers) {
                    if (i.indexOf(name) === 0) {
                        if (i.split(name)[1] == 'Factory') {
                            return (constructed !== false ? new this._providers[i]() : this._providers[i]);
                        } else {
                            return (typeof this._providers[i] === 'function') ? new this._providers[i]() : this._providers[i];
                        }
                    }
                }
            },
            _mapDependencies: function(key) {
                if (typeof key === 'string') {
                    if (key.indexOf('.') !== -1) {
                        var mod = key.split('.')[0], provider = key.split('.')[1];
                        return carbon._modules[mod]._find(provider);
                    } else {
                        return this._find(key);
                    }
                } else {
                    return key;
                }
            },
            _getDependencies: function(dependencies) {
                return [undefined].concat(dependencies.map(this._mapDependencies, this));
            },
            factory: function(name, Factory) {
                var providerName = name + 'Factory',
                    deps = arguments.length > 2 ? slice.call(arguments, 2, arguments.length) : null,
                    provider, Service;

                // ----------------------------------------
                // check if the factory exists
                // ----------------------------------------
                provider = this._get(providerName);
                if (provider !== undefined && arguments.length === 1) {
                    Service = provider;
                    return new Service();
                } else if (provider !== undefined && arguments.length > 1) {
                    throw new Error('Factory ' + name + ' already exists.');
                }

                // ----------------------------------------
                // add any dependencies if they exist
                // ----------------------------------------
                // REVIEW:: why does this setup always need the first item to be undefined ? 
                Factory = deps ? Factory.bind.apply(Factory, this._getDependencies(deps)) : Factory;

                // ----------------------------------------
                // store the factory
                // ----------------------------------------
                this._set(providerName, Factory);

                // ----------------------------------------
                // return the module for chaining
                // ----------------------------------------
                return this;
            },
            service: function(name, Service) {
                var providerName = name + 'Service', deps = arguments.length > 2 ? slice.call(arguments, 2, arguments.length) : null, Provider;

                // ----------------------------------------
                // check if the service exists
                // ----------------------------------------
                Provider = this._get(providerName);
                if (Provider !== undefined && arguments.length === 1) {
                    return (typeof Provider === 'function' ? this._set(providerName, new Provider()) : Provider);
                } else if (Provider !== undefined && arguments.length > 1) {
                    throw new Error('Service ' + name + ' already exists.');
                }

                // ----------------------------------------
                // add any dependencies if they exist
                // ----------------------------------------
                Service = deps ? Service.bind.apply(Service, this._getDependencies(deps)) : Service;

                // ----------------------------------------
                // save the service
                // ----------------------------------------
                this._set(providerName, Service);

                // ----------------------------------------
                // return the module for chaining
                // ----------------------------------------
                return this;
            }
        };
    }

    var carbon = {
        _modules: {},
        _map_dependencies: function(container, dependencies) {
            var injectables, objs;

            for (var i in dependencies) {
                // ----------------------------------------
                // if i is an object/function, add it directly.
                // ----------------------------------------
                if (typeof dependencies[i] !== 'string') {
                    container.push(dependencies[i]);
                    continue;
                }

                // ----------------------------------------
                // Get the injectable from the module we are importing from
                // ----------------------------------------
                var mod = dependencies[i].split('.')[0],
                    provider = dependencies[i].split('.')[1],
                    module;

                // ----------------------------------------
                // get the module
                // ----------------------------------------
                module = carbon._modules[mod];

                // ----------------------------------------
                // use the module to try and load the provider
                // ----------------------------------------
                container.push(module._find(provider, false, true));
            }
        },
        module: function(name) {
            var mt, instance;

            if (this._modules[name]) {
                return this._modules[name];
            }

            // ----------------------------------------
            // create new instance
            // ----------------------------------------
            mt = new ModuleTemplate();
            instance = Object.create(mt);

            instance._name = name;

            // ----------------------------------------
            // save the instances and return it
            // ----------------------------------------
            return instance = this._modules[name] = instance;
        },
        wrap: function(fn) {
            var deps = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null, container = [undefined];

            if (deps) {
                // ----------------------------------------
                // map to the modules, and retrieve them from it's providers
                // ----------------------------------------
                this._map_dependencies(container, deps);

                // ----------------------------------------
                // wrap a function to enable di of module dependencies.
                // ----------------------------------------
                fn = fn.bind.apply(fn, container);
            }
            return fn;            
        }
    };
    exports.carbon = carbon;
})(this);
