
var mapContainer = function mapContainer(key) {
    return carbon.providers[key];
};

var carbon = {
    instances: {},
    providers: {},
    _mapDependencies: function(mapContainer, deps) {
        return deps.map(mapContainer(deps));
    },
    factory: function(name, Factory) {
        if (carbon.providers[name]) {
            var Service = carbon.providers[name];
            return new Service();
        }

        carbon.providers[name] = Factory;

        return carbon.providers[name]();
    },
    service: function(name, Service) {
        var deps = arguments.length > 2 ? Array.prototype.slice.call(arguments, 1) : null,
            _this = this;

        if (carbon.providers[name]) {
            return name;
        }

        if (deps) {
            Service = Service.bind.apply(Service, deps.map(mapContainer, deps));
        }

        carbon.providers[name] = new Service();

        return carbon.providers[name];
    },
    app: function(name, config, start) {
        var deps = arguments.length > 3 ? Array.prototype.slice.call(arguments, 3) : null,
            instance, _this = this;

        if (carbon.instances[name]) {
            return carbon.instances[name];
        }

        instance = Object.create(null);
        instance.config = config;

        if (deps) {
            deps = deps.map(mapContainer, deps);
        }

        contentLoaded(window, function initInstance() {
            if (start) {
                start.apply(start, deps);
            }
        });

        carbon.instances[name] = instance;

        return carbon.instances[name];
    }
};
