
var provider = function(name, Constructor) {
    var _this = this, providerName = name + 'Provider';

    // if no Constructor then return the singleton
    if (!Constructor) {
        return _this.providers[providerName] || undefined;
    }

    // check if the provider we are creating already exists
    if (_this.providers[providerName]) {
        throw new Error('Provider ' + name + ' already exists');
    }

    // create the instance (set the instance into the providers object so it is cache as constructed)
    return _this.providers[providerName] = new Constructor();
}

var factory = function factory(name, Factory) {
    var _this = this;

    return provider.call(_this, name, function GenericProvider() {
        this.$get = Factory;
    });
};

// var mapContainer = function mapContainer(key) {
//     return this.container[key];
// };

// var service = function service(name, Service) {
//     var deps = arguments.length > 2 ? slice.call(arguments, 1) : null,
//         _this = this;

//     return factory.call(carbon.container, name, function GenericFactory() {
//         if (deps) {
//             Service = Service.bind.apply(Service, deps.map(mapContainer, carbon.container));
//         }
//         return new Service();
//     });
// };

var carbon = {
    instances: {},
    create: function() {
        // create a new instance
        var instance = Object.create(null);  // make sure it works for >=IE9
        instance.providers = {};
        instance.provider = provider;

        instance.factory = factory;
        // instance.service = service;
        return this.instances[name] = instance;
    },
    get: function() {
        return this.instances[name];
    }
};

// create app
var app = carbon.create('MyApp');

// create 
var p = app.provider('Test', function() {
    this.$get = function() {

    }
});


var f = app.factory('Test', function() {
    var x = function()  {
        console.log('in x');
    }

    return new x();
});

console.log(f.$get());