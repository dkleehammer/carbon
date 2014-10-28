(function(exports) {
    "use strict";

    var slice = Array.prototype.slice;

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
        _extend: function(obj, Service) {
            if (obj instanceof Function) {
                obj = new obj();
            }

            for (var attrname in obj) {
                Service[attrname] = obj[attrname];
            }
            return Service;
        },
        _mapDependencies: function mapDependencies(key) {
            return this._getProvider(key);
        },
        factory: function(name, Factory) {
            var providerName = name + 'Factory',
                deps = arguments.length > 2 ? slice.call(arguments, 1, arguments.length) : null,
                // extend = deps && (typeof deps[deps.length-1] !== 'string') ? deps.pop() : null,
                Service;

            // if the factory exists, return it and exit
            if (this._getProvider(name)) {
                Service = this._getProvider(name);
                return new Service();
            }

            // add our dependencies if they exist
            if (deps) {
                Factory = Factory.bind.apply(Factory, deps.map(this._mapDependencies, this));
            }
            
            // REVIEW:: cannot extend factory service not instantiated yet
            //     it may be possible to bind an apply the factory service to the 

            // // extend the extend exists
            // if (extend) {
            //     Factory = this._extend(extend, Factory);
            // }

            // store the factory
            this._setProvider(providerName, Factory);

            // return the new instance
            Service = this._getProvider(name);
            return new Service();
        },
        service: function(name, Service) {
            var providerName = name + 'Service',
                deps = arguments.length > 2 ? slice.call(arguments, 1, arguments.length) : null,
                extend = deps && (typeof deps[deps.length-1] !== 'string') ? deps.pop() : null;

            // if the service exists, return it and exit
            if (this._getProvider(name)) {
                return this._getProvider(name);
            }

            // add our dependencies if they exist
            if (deps) {
                Service = Service.bind.apply(Service, deps.map(this._mapDependencies, this));
            }

            // instantiate the service
            Service = new Service();
            
            // extend the extend exists
            if (extend) {
                Service = this._extend(extend, Service);
            }

            // store the singleton
            this._setProvider(providerName, Service);

            // return the singleton instance
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

            if (!carbon.instances[mod]) {
                return;
            }

            var provider = carbon._modules[mod].getProvider(dep);
        },
        _createModule: function() {
            return (Object.create(module));
        },
        module: function(name) {
            var deps = arguments.length > 1 ? slice.call(arguments, 1) : null,
                instance; 

            // if the module already exists, return it
            if (instance = (this._getModule(name))) {
                return instance;
            }

            // build our module instance
            instance = this._createModule();

            if (deps) {
                for (var i in deps) {
                    var d = carbon._importFromModule(deps[i]);

                    if (!d) {
                        continue;
                    }

                    instance._setProvider(d[1], d[0]);
                }
            }

            this._setModule(name, instance);

            return instance;
        }
    };

    exports.carbon = carbon;
})(this);

var m = carbon.module('m1');

m.service('Test', function() {
    this.test = function() {
        console.log('test service test ran');
    }
});

// console.log(m);

// var TS = m.service('Test');
// TS.test();

m.factory('FTest', function() {
    this.print = function() {
        console.log('FTest print ran');
    };
});

// var f = m.factory('FTest');
// f.print();


var o = function() {
    this.testing = function() {
        console.log('this is in testing');
    }
};

m.service('ExtendTest', o, function() {
    this.test = function() {
        console.log('test service test ran');
    }
});

var et = m.service('ExtendTest');
console.log(et);
