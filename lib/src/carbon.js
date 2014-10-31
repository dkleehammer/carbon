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

    /**
     * module object
     **/
    var module = {
        _providers: {},
        _getProvider: function(name, storageName) {
            for (var i in this._providers) {
                if (i.indexOf(name) === 0) {
                    if (storageName) {
                        return [this._providers[i], i];
                    }
                    return this._providers[i];
                }
            }
        },
        _setProvider: function(providerName, fn) {
            this._providers[providerName] = fn;
        },
        _mapDependencies: function mapDependencies(key) {
            return this._getProvider(key);
        },
        factory: function(name, Factory) {
            var providerName = name + 'Factory',
                deps = arguments.length > 2 ? slice.call(arguments, 1, arguments.length) : null,
                Service;

            // ----------------------------------------
            // if the factory exists, return it and exit
            // ----------------------------------------
            if (this._getProvider(name)) {
                Service = this._getProvider(name);
                return new Service();
            }

            // ----------------------------------------
            // add our dependencies if they exist
            // ----------------------------------------
            if (deps) {
                // ----------------------------------------
                // separate the paramters from the injectables
                // ----------------------------------------
                var injectables = [], objs = [];
                for (var i in deps) {
                    if (typeof deps[i] === 'string') {
                        injectables.push(deps[i]);
                    } else {
                        objs.push(deps[i]);
                    }
                }
                injectables = objs.concat(injectables.map(this._mapDependencies, this));
                Factory = Factory.bind.apply(Factory, injectables);
            }
 
            // ----------------------------------------
            // store the factory
            // ----------------------------------------
            this._setProvider(providerName, Factory);

            // ----------------------------------------
            // return the new instance
            // ----------------------------------------
            Service = this._getProvider(name);
            return new Service();
        },
        service: function(name, Service) {
            var providerName = name + 'Service',
                deps = arguments.length > 2 ? slice.call(arguments, 1, arguments.length) : null,
                injectables = [], objs = [], extendObj;

            // ----------------------------------------
            // if the service exists, return it and exit
            // ----------------------------------------
            if (this._getProvider(name) && !Service) {
                // console.log('existing: ', this._getProvider(name));
                return this._getProvider(name);
            } else if (this._getProvider(name) && Service) {
                console.error('ProviderExists: this provider already exists: ' + name);
                return;
            }

            // ----------------------------------------
            // creating/replace an existing service
            // ----------------------------------------
            if (typeof Service === 'object') {
                extendObj = Service;
                Service = arguments[2];
            }

            // console.log(Service.toString());

            // ----------------------------------------
            // add our dependencies if they exist
            // ----------------------------------------
            if (deps) {
                // separate the paramters from the injectables
                for (var i in deps) {
                    if (typeof deps[i] === 'string') {
                        injectables.push(deps[i]);
                    } else {
                        objs.push(deps[i]);
                    }
                }

                // console.log('injectables: ', injectables);
                // console.log('objs: ', objs);

                injectables = objs.concat(injectables.map(this._mapDependencies, this));
                Service = Service.bind.apply(Service, injectables);
            }

            // ----------------------------------------
            // instantiate the service
            // ----------------------------------------
            Service = new Service();

            // ----------------------------------------
            // if extendObj exists, then extendObj the two objects
            // ----------------------------------------
            if (extendObj) {
                Service = extend(Service, extendObj);
            }
            
            // ----------------------------------------
            // store the singleton
            // ----------------------------------------
            this._setProvider(providerName, Service);

            // ----------------------------------------
            // return the singleton instance
            // ----------------------------------------
            return this._getProvider(name);
        }
    };

    var carbon = {
        _modules: {},
        _getModule: function(name) {
            return this._modules[name] || undefined;
        },
        _setModule: function(name, module) {
            this._modules[name] = module;
        },
        _importFromModule: function(dep) {
            if (undefined === dep.indexOf || dep.indexOf('.') === -1) {
                return;
            }

            var mod = dep.split('.')[0], provider = dep.split('.')[1];

            if (!carbon._modules[mod]) {
                return;
            }

            return carbon._getModule(mod)._getProvider(provider) || null;
        },
        _createModule: function() {
            return (Object.create(module));
        },
        module: function(name) {
            console.log('arguments: ', arguments, '\r\n');
            var deps = arguments.length > 1 ? slice.call(arguments, 1) : null,
                instance; 

            // if the module already exists, return it
            if (this._getModule(name) && arguments.length === 1) {
                console.log('module exists: ', name);
                return this._getModule(name);
            }

            // build our module instance
            instance = this._createModule();

            // console.log('name: ', name, 'deps: ', deps);

            if (deps) {
                for (var i in deps) {
                    var d = carbon._importFromModule(deps[i]);

                    if (!d) {
                        continue;
                    }

                    console.log('in module deps: ', deps[i], d);

                    instance._setProvider(deps[i], d);
                }
            }

            this._setModule(name, instance);

            return instance;
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
                    if (d) {
                        container.push(d);
                    }
                }
            }

            // wrap a function to enable di of module dependencies.
            return fn.bind.apply(fn, container);
        }
    };

    exports.carbon = carbon;
})(this);
