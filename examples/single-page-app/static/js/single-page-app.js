

// ----------------------------------------
// Access modules created in other files
// ----------------------------------------
var Util = carbon.module('Util');

// ----------------------------------------
// can use variable at creation time
// ----------------------------------------
var controller = Util.factory('controller', function(Router) {
    this.register = function(route, fn) {
        Router.add(route, fn;
    };
}, 'Router');

// ----------------------------------------
// home controller
// ----------------------------------------
controller.register('', function(v) {
    var viewModel = new v({
        el: '#test',
        data: {
            title: 'Home page'
        }
    });
}, Vue);

// ----------------------------------------
// test controller
// ----------------------------------------
controller.register('test', function(v) {
    var viewModel = new v({
        el: '#test',
        data: {
            title: 'Test page'
        }
    });
}, Vue);

// ----------------------------------------
// user controller
// ----------------------------------------
controller.register('user', function(v) {
    var viewModel = new v({
        el: '#test',
        data: {
            title: 'User page'
        }
    });
}, Vue);

// ----------------------------------------
// about controller
// ----------------------------------------
controller.register('about', function(v) {
    var viewModel = new v({
        el: '#test',
        data: {
            title: 'About page'
        }
    });
}, Vue);

// ----------------------------------------
// create a wrapped function to be able to connect user defined methods and di lib
// ----------------------------------------
var app = carbon.wrap(function(router) {
    router.start();
}, 'Util.Router')();

