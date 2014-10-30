

// ----------------------------------------
// Access modules created in other files
// ----------------------------------------
var Util = carbon.module('Util');

// ----------------------------------------
// can use variable at creation time
// ----------------------------------------
var controller = Util.factory('controller', function(Router) {
    this.register = function(route, fn) {
        Router.add(route, fn);
    };
}, 'Router');

var viewModel = new Vue({
    el: '#test',
    data: {
        title: ''
    }
});

// ----------------------------------------
// home controller
// ----------------------------------------
controller.register('', function() {
    viewModel.set('title', 'Home page');
});

// ----------------------------------------
// test controller
// ----------------------------------------
controller.register('test', function() {
    viewModel.set('title', 'Test page');
});

// ----------------------------------------
// user controller
// ----------------------------------------
controller.register('user', function() {
    viewModel.set('title', 'User page');
});

// ----------------------------------------
// about controller
// ----------------------------------------
controller.register('about', function() {
    viewModel.set('title', 'About page');
});

// ----------------------------------------
// create a wrapped function to be able to connect user defined methods and di lib
// ----------------------------------------
var app = carbon.wrap(function(router) {
    router.start();
}, 'Util.Router')();

