
(function(exports) {
    "use strict";

    var slice = Array.prototype.slice;

    function ModuleTemplate() {
        return {
            _providers: {},
            _get: function(providerName) { return this._providers[providerName] || undefined; },
            _set: function(providerName, provider) { return (this._providers[providerName] = provider); },
            _find: function(name, storageName, constructed) {
                for (var i in this._providers) {
                    if (i.indexOf(name) === 0) {
                        if (!storageName) {
                            return (i.split(name)[1] == 'Service' ? this._providers[i] : (constructed !== false ? new this._providers[i]() : this._providers[i]));
                        } else {
                            return [i.split(name)[1] == 'Service' ? this._providers[i] : (constructed !== false ? new this._providers[i](): this._providers[i]), i];
                        }
                    }
                }
            },
            _mapDependencies: function(key) { return this._find(key); },
            _getDependencies: function(dependencies) {
                var injectables = [], objs = [];
                for (var i in dependencies) {
                    (typeof dependencies[i] === 'string') ? injectables.push(dependencies[i]) : objs.push(dependencies[i]);
                }
                return injectables = (injectables.map(this._mapDependencies, this).concat(objs));
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
                // return the new factory instance as service
                // ----------------------------------------
                Service = this._get(providerName);
                return new Service();

            },
            service: function(name, Service) {
                var providerName = name + 'Service', deps = arguments.length > 2 ? slice.call(arguments, 2, arguments.length) : null, provider;

                // ----------------------------------------
                // check if the service exists
                // ----------------------------------------
                if ((provider = this._get(providerName)) !== undefined && arguments.length === 1) {
                    return provider;
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
                // store the singleton
                // ----------------------------------------
                return this._set(providerName, Service);
            }
        };
    }

    var carbon = {
        _modules: {},
        map_dependencies: function(module, dependencies) {
            var mod, provider;
            for (var i in dependencies) {
                // if i is an object/function, add it directly.
                if (typeof dependencies[i] !== 'string') {
                    (module._set ? module._set(i, dependencies[i]) : module.push(dependencies[i]));
                    continue;
                }

                if (undefined === dependencies.indexOf || dependencies[i].indexOf('.') === -1) {
                    continue;
                }

                mod = dependencies[i].split('.')[0], provider = dependencies[i].split('.')[1];

                // check if the other module exists and the provider exists in it.
                if (!carbon._get(mod) || !carbon._get(mod)._find(provider)) {
                    continue;
                }

                // if all exists, set the provider into this module
                var moduleProvider = carbon._get(mod)._find(provider, true, false);

                if (module._set !== undefined) {
                    module._set(mod+'.'+moduleProvider[1], moduleProvider[0]);
                } else {
                    module.push(moduleProvider[0]);
                }
            }
        },
        _get: function(name) { return this._modules[name] || undefined; },
        _set: function(name, module) { return this._modules[name] = module; },
        module: function(name) {
            var deps = arguments.length > 1 ? slice.call(arguments, 1) : null, mt;
                
            if (this._get(name)) {
                return this._get(name);
            }

            // create new instance
            mt = new ModuleTemplate();
            var instance = Object.create(mt);

            instance._name = name;

            // import other module dependencies
            if (deps) {
                this.map_dependencies(instance, deps);
            }

            return instance = this._set(name, instance);
        },
        wrap: function(fn) {
            var deps = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null, container = [undefined];

            if (deps) {
                // map to the modules, and retrieve them from it's providers
                this.map_dependencies(container, deps);

                // wrap a function to enable di of module dependencies.
                fn = fn.bind.apply(fn, container);
            }

            return fn;
        }
    };
    exports.carbon = carbon;
})(this);
