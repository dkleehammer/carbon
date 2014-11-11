/*
// moving to use modules without services and factories.

// example usage
var carbon = {};

// instantiate a new module
carbon.module('Singleton', function() {

    // store an instance (used for singleton objects)
    return new function() {
        this.count = 0;
        this.add = function(num) {
            this.count += num;
        };
    };

});

carbon.module('Factory', function() {
    // store the factory used to create new instances
    return function() {
        this.count = 0;
        this.add = function(num) {
            this.count += num;
        }
    };
});
*/

var slice = Array.prototype.slice;

var mapDependencies = function(key) {
    return carbon.instances[key];
}

var carbon = {
    instances: {},
    module: function(name, Constructor) {
        var deps = arguments.length > 2 ? slice.call(arguments, 2) : null, module;

        // see if we are trying to load the module and if it exists
        module = this.instances[name];
        if (!Constructor) {
            if (!module) {
                // throw new Error('Module does not exist.');
                console.error('Module does not exist');
                return;
            }
            return (typeof module === 'function') ? new module() : module;
        } else {
            Constructor = deps ? Constructor.bind.apply(Constructor, [undefined].concat(deps.map(mapDependencies, this))) : Constructor;
            this.instances[name] = Constructor();
        }
    }
};

// build the singleton module
carbon.module('A', function() {
    console.log('in singleton module constructor');

    return new function() {
        this.count = 0;
        this.add = function(num) {
            this.count += num;
        };
    };
});

// test the module to be a singelton
var A  = carbon.module('A'),
    A2 = carbon.module('A');

A2.add(1);
console.log('A count: ', A.count);
A2.add(1);
console.log('A2 count: ', A2.count);


// build the factory module
carbon.module('B', function() {
    console.log('in factory module constructor');

    return function() {
        this.count = 0;
        this.add = function(num) {
            this.count += num;
        }
    };
});

// test the module to be a factory
var B  = carbon.module('B'),
    B2 = carbon.module('B');

B2.add(1);
console.log('B count: ', B.count);
B2.add(1);
console.log('B2 count: ', B2.count);


// test dependencies
carbon.module('C', function(A) {
    console.log('in singleton module constructor including dependency');

    console.log('A in C: ', A);

    // scope changes to C and disconnects from B
    return new function() {
        this.count = A.count;
        this.add = A.add;
        console.warn('this should have been A.add and A.count, but it is not');
    };
}, 'A');

var C = carbon.module('C');

console.log('C object: ', C);

console.log('C A count: ', C.count);
C.add(5);
console.log('A count: ', A.count, 'C count: ', C.count);