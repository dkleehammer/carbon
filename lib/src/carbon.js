(function(exports) {
    "use strict";

    var slice = Array.prototype.slice;

    var mapDependencies = function(key) {
        return (typeof key === 'string') ? carbon.instances[key] : key;
    };

    exports.carbon = {
        instances: {},
        module: function(name, Constructor) {
            var deps = arguments.length > 2 ? slice.call(arguments, 2) : null, Module;

            // see if we are trying to load the module and if it exists
            Module = this.instances[name];
            if (!Constructor) {
                if (!Module) {
                    throw new Error('Module does not exist.');
                }
                return (typeof Module === 'function') ? new Module() : Module;
            } else {
                Constructor = deps ? Constructor.bind.apply(Constructor, [undefined].concat(deps.map(mapDependencies, this))) : Constructor;
                this.instances[name] = new Constructor();
            }
        }
    };
})(this);
