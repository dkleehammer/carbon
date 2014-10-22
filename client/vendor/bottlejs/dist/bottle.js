;(function(undefined) {
    'use strict';
    /**
     * BottleJS v0.5.0 - 2014-10-12
     * A powerful, extensible dependency injection micro container
     *
     * Copyright (c) 2014 Stephen Young
     * Licensed MIT
     */
    
    /**
     * Unique id counter;
     *
     * @type Number
     */
    var id = 0;
    
    /**
     * Local slice alias
     *
     * @type Functions
     */
    var slice = Array.prototype.slice;
    
    /**
     * Get a group (middleware, decorator, etc.) for this bottle instance and service name.
     *
     * @param Array collection
     * @param Number id
     * @param String name
     * @return Array
     */
    var get = function get(collection, id, name) {
        var group = collection[id];
        if (!group) {
            group = collection[id] = {};
        }
        if (!group[name]) {
            group[name] = [];
        }
        return group[name];
    };
    
    /**
     * A helper function for pushing middleware and decorators onto their stacks.
     *
     * @param Array collection
     * @param String name
     * @param Function func
     */
    var set = function set(collection, id, name, func) {
        if (typeof name === 'function') {
            func = name;
            name = '__global__';
        }
        get(collection, id, name).push(func);
    };
    
    /**
     * Register a constant
     *
     * @param String name
     * @param mixed value
     * @return Bottle
     */
    var constant = function constant(name, value) {
        Object.defineProperty(this.container, name, {
            configurable : false,
            enumerable : true,
            value : value,
            writable : false
        });
    
        return this;
    };
    
    /**
     * Map of decorator by index => name
     *
     * @type Object
     */
    var decorators = [];
    
    /**
     * Register decorator.
     *
     * @param String name
     * @param Function func
     * @return Bottle
     */
    var decorator = function decorator(name, func) {
        set(decorators, this.id, name, func);
        return this;
    };
    
    /**
     * Map of deferred functions by id => name
     *
     * @type Object
     */
    var deferred = [];
    
    /**
     * Register a function that will be executed when Bottle#resolve is called.
     *
     * @param Function func
     * @return Bottle
     */
    var defer = function defer(func) {
        set(deferred, this.id, func);
        return this;
    };
    
    var getService = function(service) {
        return this.container[service];
    };
    
    /**
     * Immediately instantiates the provided list of services and returns them.
     *
     * @param array services
     * @return array Array of instances (in the order they were provided)
     */
    var digest = function digest(services) {
        return (services || []).map(getService, this);
    };
    
    /**
     * Register a factory inside a generic provider.
     *
     * @param String name
     * @param Function Factory
     * @return Bottle
     */
    var factory = function factory(name, Factory) {
        return provider.call(this, name, function GenericProvider() {
            this.$get = Factory;
        });
    };
    
    /**
     * Map of middleware by index => name
     *
     * @type Object
     */
    var middles = [];
    
    /**
     * Function used by provider to set up middleware for each request.
     *
     * @param Number id
     * @param String name
     * @param Object instance
     * @param Object container
     * @return void
     */
    var applyMiddleware = function(id, name, instance, container) {
        var middleware = get(middles, id, '__global__').concat(get(middles, id, name));
        var descriptor = {
            configurable : true,
            enumerable : true
        };
        if (middleware.length) {
            descriptor.get = function getWithMiddlewear() {
                var index = 0;
                var next = function() {
                    if (middleware[index]) {
                        middleware[index++](instance, next);
                    }
                };
                next();
                return instance;
            };
        } else {
            descriptor.value = instance;
            descriptor.writable = true;
        }
    
        Object.defineProperty(container, name, descriptor);
    
        return container[name];
    };
    
    /**
     * Register middleware.
     *
     * @param String name
     * @param Function func
     * @return Bottle
     */
    var middleware = function middleware(name, func) {
        set(middles, this.id, name, func);
        return this;
    };
    
    /**
     * Named bottle instances
     *
     * @type Object
     */
    var bottles = {};
    
    /**
     * Get an instance of bottle.
     *
     * If a name is provided the instance will be stored in a local hash.  Calling Bottle.pop multiple
     * times with the same name will return the same instance.
     *
     * @param String name
     * @return Bottle
     */
    var pop = function pop(name) {
        var instance;
        if (name) {
            instance = bottles[name];
            if (!instance) {
                bottles[name] = instance = new Bottle();
            }
            return instance;
        }
        return new Bottle();
    };
    
    /**
     * Map of provider constructors by index => name
     *
     * @type Object
     */
    var providers = [];
    
    var getProviders = function(id) {
        if (!providers[id]) {
            providers[id] = {};
        }
        return providers[id];
    };
    
    /**
     * Used to process decorators in the provider
     *
     * @param Object instance
     * @param Function func
     * @return Mixed
     */
    var reducer = function reducer(instance, func) {
        return func(instance);
    };
    
    /**
     * Register a provider.
     *
     * @param String name
     * @param Function Provider
     * @return Bottle
     */
    var provider = function provider(name, Provider) {
        var providerName, providers, properties, container, id;
    
        id = this.id;
        providers = getProviders(id);
        if (providers[name]) {
            return console.error(name + ' provider already registered.');
        }
    
        container = this.container;
        providers[name] = Provider;
        providerName = name + 'Provider';
    
        properties = Object.create(null);
        properties[providerName] = {
            configurable : true,
            enumerable : true,
            get : function getProvider() {
                var Constructor = providers[name], instance;
                if (Constructor) {
                    instance = new Constructor();
                    delete container[providerName];
                    container[providerName] = instance;
                }
                return instance;
            }
        };
    
        properties[name] = {
            configurable : true,
            enumerable : true,
            get : function getService() {
                var provider = container[providerName];
                var instance;
    
                if (provider) {
                    delete container[providerName];
                    delete container[name];
    
                    // filter through decorators
                    instance = get(decorators, id, '__global__')
                        .concat(get(decorators, id, name))
                        .reduce(reducer, provider.$get(container));
                }
                return instance ? applyMiddleware(id, name, instance, container) : instance;
            }
        };
    
        Object.defineProperties(container, properties);
        return this;
    };
    
    /**
     * Register a service, factory, provider, or value based on properties on the object.
     *
     * properties:
     *  * Obj.$name   String required ex: `'Thing'`
     *  * Obj.$type   String optional 'service', 'factory', 'provider', 'value'.  Default: 'service'
     *  * Obj.$inject Mixed  optional only useful with $type 'service' name or array of names
     *
     * @param Function Obj
     * @return Bottle
     */
    var register = function register(Obj) {
        return this[Obj.$type || 'service'].apply(this, [Obj.$name, Obj].concat(Obj.$inject || []));
    };
    
    
    /**
     * Execute any deferred functions
     *
     * @param Mixed data
     * @return Bottle
     */
    var resolve = function resolve(data) {
        get(deferred, this.id, '__global__').forEach(function deferredIterator(func) {
            func(data);
        });
    
        return this;
    };
    
    /**
     * Map used to inject dependencies in the generic factory;
     *
     * @param String key
     * @return mixed
     */
    var mapContainer = function mapContainer(key) {
        return this.container[key];
    };
    
    /**
     * Register a service inside a generic factory.
     *
     * @param String name
     * @param Function Service
     * @return Bottle
     */
    var service = function service(name, Service) {
        var deps = arguments.length > 2 ? slice.call(arguments, 1) : null;
        var bottle = this;
        return factory.call(bottle, name, function GenericFactory() {
            if (deps) {
                Service = Service.bind.apply(Service, deps.map(mapContainer, bottle));
            }
            return new Service();
        });
    };
    
    /**
     * Register a value
     *
     * @param String name
     * @param mixed val
     * @return
     */
    var value = function value(name, val) {
        Object.defineProperty(this.container, name, {
            configurable : true,
            enumerable : true,
            value : val,
            writable : true
        });
    
        return this;
    };
    
    
    /**
     * Bottle constructor
     *
     * @param String name Optional name for functional construction
     */
    var Bottle = function Bottle(name) {
        if (!(this instanceof Bottle)) {
            return Bottle.pop(name);
        }
    
        this.id = id++;
        this.container = {};
    };
    
    /**
     * Bottle prototype
     */
    Bottle.prototype = {
        constant : constant,
        decorator : decorator,
        defer : defer,
        digest : digest,
        factory : factory,
        middleware : middleware,
        provider : provider,
        register : register,
        resolve : resolve,
        service : service,
        value : value
    };
    
    /**
     * Bottle static
     */
    Bottle.pop = pop;
    
    /**
     * Exports script adapted from lodash v2.4.1 Modern Build
     *
     * @see http://lodash.com/
     */
    
    /**
     * Valid object type map
     *
     * @type Object
     */
    var objectTypes = {
        'function' : true,
        'object' : true
    };
    
    (function exportBottle(root) {
    
        /**
         * Free variable exports
         *
         * @type Function
         */
        var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
    
        /**
         * Free variable module
         *
         * @type Object
         */
        var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
    
        /**
         * CommonJS module.exports
         *
         * @type Function
         */
        var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
    
        /**
         * Free variable `global`
         *
         * @type Object
         */
        var freeGlobal = objectTypes[typeof global] && global;
        if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
            root = freeGlobal;
        }
    
        /**
         * Export
         */
        if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
            root.Bottle = Bottle;
            define(function() { return Bottle; });
        } else if (freeExports && freeModule) {
            if (moduleExports) {
                (freeModule.exports = Bottle).Bottle = Bottle;
            } else {
                freeExports.Bottle = Bottle;
            }
        } else {
            root.Bottle = Bottle;
        }
    }((objectTypes[typeof window] && window) || this));
    
}.call(this));