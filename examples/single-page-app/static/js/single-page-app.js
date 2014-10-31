
var m1 = carbon.module('M1');

m1.service('First', function() {
    this.count = 0;
    this.message = function(msg) {
        console.log(msg);
    };
});

var second = m1.service('Second', function(first) {
    this.message = function(msg) {
        first.message(msg);
    };
}, 'First');

second.message('chained message testing dependency injection');



/*
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

*/