

// ----------------------------------------
// Access modules created in other files
// ----------------------------------------
var Util = carbon.module('Util'),
    Router = Util.service('Router');

// ----------------------------------------
// can use variable at creation time
// ----------------------------------------
var controller = Util.factory('controller', function(Router) {
    this.displayText = function(text) {
        document.getElementById('h4').innerHTML = text;
        document.title = text;
    }

    this.register = function(route, fn) {
        Router.add(route, fn);
    };
}, 'Router');

// ----------------------------------------
// home controller
// ----------------------------------------
controller.register('', function() {
    controller.displayText('Home page');
});

// ----------------------------------------
// test controller
// ----------------------------------------
controller.register('test', function() {
    controller.displayText('Test page');
});

// ----------------------------------------
// user controller
// ----------------------------------------
controller.register('user', function() {
    controller.displayText('User page');
});

// ----------------------------------------
// about controller
// ----------------------------------------
controller.register('about', function() {
    controller.displayText('About page');
});

// ----------------------------------------
// create a wrapped function to be able to connect user defined methods and di lib
// ----------------------------------------
var app = carbon.wrap(function(router) {
    router.start();
}, 'Util.Router')();
