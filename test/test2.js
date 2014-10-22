
// provider
var provider = function provider(name, Provider) {
    var providerName, providers, properties, container, id, _this = this;

    id = this.id;
    providers = _this.providers;
    if (providers[name]) {
        return console.error(name + ' provider already registered.');
    }

    // container = _this.providers;
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
                // delete container[providerName];
                // container[providerName] = instance;
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


// factories
var factory = function factory(name, Factory) {
    var factoryName = name + 'Factory', _this = this, inst;

    if (arguments === 1) {
        return _this.providers[factoryName] || undefined;
    }

    return _this.provider.call(_this, name, function GenericFactory() {
        this.$get = Factory;
    });
}

// services
var service = function service(name, Service) {
    var serviceName = name + 'Service',_this = this,
        deps = arguments.length > 2 ? Array.prototype.slice.call(arguments, 1) : null;

    try {
        if (arguments === 1) {
            return _this.providers[serviceName] || undefined;
        }

        return _this.factory.call(_this, name, function GenericFactory() {
            if (deps) {
                Service = Service.bind.apply(Service, deps.map(_this.mapContainer, _this.providers));
            }

            return new Service();
        });
    } catch (e) {
        console.error(e);
    }
}


var carbon = {
    instances: {},
    app: function(name, configuration) {
        var _this = this;

        // if no configuration, we are just wanting the instance (if exists)
        if (!configuration) {
            return _this.instances[name] || undefined;
        }

        // see if the instance we are trying to create already exists
        if (_this.instances[name]) {
            throw new Error('Instance ' + name + ' already exists, did you mean to retreive?');
        }

        // we are a go to create the instance.
        var instance = Object.create(null);  // make sure this works for IE9 and up.
        instance.providers = {};
        instance.provider = provider;
        instance.factory = factory;
        instance.service = service;

        instance.mapContainer = function(key) {
            return this.providers[key];
        }

        return _this.instances[name] = instance;
    }
};

var app = carbon.app('MyApp', {});

var s = app.service('Test', function() {
    this.message = function() {
        console.info('this is a service message test');
    }
});

console.log('s: ', s);
/*
s.message();
*/

// // test dependency injection
// var s2 = app.service('Test2', function(TestService) {
//     console.log(TestService);
//     // TestService.message();
// }, 'Test');
