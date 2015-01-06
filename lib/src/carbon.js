
(function(exports) {
    "use strict";

    // ----------------------------------------
    // Map dependencies if a string by checking the modules, otherwise, return the key
    // ----------------------------------------
    var mapDependencies = function(key) {
        return (typeof key === 'string') ? carbon.module(key) : key;
    };

    // ----------------------------------------
    // Using exports we can work with the browser, actually any global object that has context
    // ----------------------------------------
    var carbon = {
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
                // determine if we need to build the Module or not
                // ----------------------------------------
                if (Module.hasOwnProperty('constructor')) {
                    Module = Module.deps ? Module.constructor.bind.apply(Module.constructor, [undefined].concat(Module.deps.map(mapDependencies))) : Module.constructor;
                    Module = this.instances[name] = new Module();
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
                // store the information (constructor and dependencies in the instances)
                // ----------------------------------------                
                this.instances[name] = {constructor: Constructor, deps: deps};
            }
        },
        wrap: function(fn) {
            var deps = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null;
            return fn = deps ? fn.bind.apply(fn, [undefined].concat(deps.map(mapDependencies))) : fn;
        }
    };
    exports.carbon = carbon;
})(this);
