// ----------------------------------------
// Access modules created in other files
// ----------------------------------------
var Util = carbon.module('Util');

// ----------------------------------------
// controller service example showing injections and object inclusions
// ----------------------------------------
var controller = Util.service('controller', function(Router, V) {
    this.viewModel = new V({
        el: '#test',
        data: {
            title: ''
        }
    });

    this.register = function(route, fn) {
        Router.add(route, fn);
    };
}, 'Router', Vue);


// ----------------------------------------
// home controller
// ----------------------------------------
controller.register('', function() {
    controller.viewModel.$set('title', 'Home Page');
});


// ----------------------------------------
// test controller
// ----------------------------------------
controller.register('test', function() {
    controller.viewModel.$set('title', 'Test Page');
});

// ----------------------------------------
// user controller
// ----------------------------------------
controller.register('user', function() {
    controller.viewModel.$set('title', 'User Page');
});

// ----------------------------------------
// about controller
// ----------------------------------------
controller.register('about', function() {
    controller.viewModel.$set('title', 'About Page');
});


// ----------------------------------------
// create a wrapped function to be able to connect user defined methods and di lib
// ----------------------------------------
var app = carbon.wrap(function(router) {
    router.start();
}, 'Util.Router')();
