
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
        _set: function(providerName, provider) { return (this._providers[providerName] = provider); },
        _find: function(name) {
            for (var i in this._providers) {
                if (i.indexOf(name) === 0) {
                    return this._providers[i];
                }
            }
        },
        _mapDependencies: function mapDependencies(key) { return this._find(key); },
        _getDependencies: function buildDependencies(dependencies) {
            var injectables = [], objs = [];
            for (var i in dependencies) {
                (typeof dependencies[i] === 'string') ? injectables.push(dependencies[i]) : objs.push(dependencies[i]);
            }
            return injectables = injectables.map(this._mapDependencies, this).concat(objs);
        },
        factory: function(name, Factory) {
            var providerName = name + 'Factory',
                deps = arguments.length > 2 ? slice.call(arguments, 2, arguments.length) : null,
                extendObj, provider;

            // ----------------------------------------
            // check if the factory exists
            // ----------------------------------------
            if (provider = (this._get(providerName))) {
                // ----------------------------------------
                // check if accessing or creating, if creating and already exists, then throw error
                // ----------------------------------------
                if (arguments.length === 1) {
                    return provider
                } else {
                    throw new Error('ProviderError: Factory provider ' + name + ' already exists in module');
                }
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
            // return the new instance
            // ----------------------------------------
            var Service = this._get(providerName);
            return new Service();

        },
        service: function(name, Service) {
            var providerName = name + 'Service',
                deps = arguments.length > 2 ? slice.call(arguments, 2, arguments.length) : null,
                extendObj, provider;

            // ----------------------------------------
            // check if the service exists
            // ----------------------------------------
            if (provider = (this._get(providerName))) {
                // ----------------------------------------
                // check if accessing or creating, if creating and already exists, then throw error
                // ----------------------------------------
                if (arguments.length === 1) {
                    return provider;
                } else {
                    throw new Error('ProviderError: Service provider ' + name + ' already exists in module');
                }
            }

            // ----------------------------------------
            // add any dependencies if they exist
            // ----------------------------------------
            // REVIEW:: why does this setup always need the first item to be undefined ? 
            Service = deps ? Service.bind.apply(Service, ([undefined]).concat(this._getDependencies(deps))) : Service;

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
