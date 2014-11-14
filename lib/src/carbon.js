(function(exports) {
    "use strict";

    // ----------------------------------------
    // Map dependencies if a string by checking the modules, otherwise, return the key
    // ----------------------------------------
    var mapDependencies = function(key) {
        return (typeof key === 'string') ? carbon.instances[key] : key;
    };

    // ----------------------------------------
    // Using exports we can work with both NodeJS and the browser, actually any global object that has context
    // ----------------------------------------
    exports.carbon = {
        instances: {},
        module: function(name, Constructor) {
            var deps = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null, Module;

            // ----------------------------------------
            // see if the module already exists
            // ----------------------------------------
            Module = this.instances[name];

            // ----------------------------------------
            // Make sure we are not trying to build a new instance
            // ----------------------------------------
            if (!Constructor) {

                // ----------------------------------------
                // If no module found, throw error.
                // ----------------------------------------
                if (!Module) {
                    throw new Error('Module ' + name + ' does not exist.');
                }

                // ----------------------------------------
                // determine if we have an singleton or factory module
                // ----------------------------------------
                return (typeof Module === 'function') ? new Module() : Module;
            } else {
                // ----------------------------------------
                // if the module exists, throw error.  We do not want to set or return original since it's not what the dev is expecting
                // ----------------------------------------
                if (Module) {
                    throw new Error('Module ' + name + ' already exists');
                }

                // ----------------------------------------
                // if there are dependencies, map them, otherwise, return the Constructor function
                // ----------------------------------------
                Constructor = deps ? Constructor.bind.apply(Constructor, [undefined].concat(deps.map(mapDependencies))) : Constructor;

                // ----------------------------------------
                // store the instance of the module
                // ----------------------------------------
                this.instances[name] = new Constructor();
            }
        }
    };
})(this);
