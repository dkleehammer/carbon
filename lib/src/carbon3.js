
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
                        // return [i.split(name)[1] == 'Service' ? this._providers[i] : (constructed !== false ? new this._providers[i](): this._providers[i]), i];
                    }
                }
            },
            _mapDependencies: function(key) { return (typeof key === 'string' ? this._find(key) : key); },
            _getDependencies: function(dependencies) {
                return dependencies.map(this._mapDependencies, this);
            },
             factory: function(name, Factory) {
                var providerName = name + 'Factory',
                    deps = arguments.length > 2 ? slice.call(arguments, 2, arguments.length) : null,
                    provider, Service;

                // ----------------------------------------
                // check if the factory exists
                // ----------------------------------------
                if ((provider = this._get(providerName)) !== undefined && arguments.length === 1) {
                    Service = provider;
                    return new Service();
                }

                // ----------------------------------------
                // add any dependencies if they exist
                // ----------------------------------------
                // REVIEW:: why does this setup always need the first item to be undefined ? 
                Factory = deps ? Factory.bind.apply(Factory, ([undefined]).concat(this._getDependencies(deps))) : Factory;

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
                var providerName = name + 'Service', deps = arguments.length > 2 ? slice.call(arguments, 2, arguments.length) : null, provider;

                // ----------------------------------------
                // check if the service exists
                // ----------------------------------------
                if ((provider = this._get(providerName)) !== undefined && arguments.length === 1) {
                    return (typeof provider === 'function' ? this._set(providerName, new provider()) : provider);
                } else if (provider !== undefined && arguments.length > 1) {
                    throw new Error('Provider ' + name + ' already exists.');
                }

                // ----------------------------------------
                // add any dependencies if they exist
                // ----------------------------------------
                // REVIEW:: why does this setup always need the first item to be undefined ?
                Service = deps ? Service.bind.apply(Service, ([undefined]).concat(this._getDependencies(deps))) : Service;

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
            var injectables, objs
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
                var mod = dependencies.split('.')[0],
                    provider = dependencies[i].split('.')[1],
                    injectables, objs, module;

                // ----------------------------------------
                // get the module
                // ----------------------------------------
                module = carbon._modules[module];

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

            // create new instance
            mt = new ModuleTemplate();
            instance = Object.create(mt);

            instance._name = name;

            return instance = this._modules[name] = instance;
        },
        wrap: function(fn) {
            var deps = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null, container = [undefined];

            if (deps) {
                // ----------------------------------------
                // map to the modules, and retrieve them from it's providers
                // ----------------------------------------
                this.map_dependencies(container, deps);

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
