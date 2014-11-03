
var m1 = carbon.module('M1');

var f1 = m1.service('First', function() {
    this.count = 0;
    this.message = function(msg) {
        console.log(msg);
    };
    this.add = function(num) {
        this.count += num;
    };
    this.get = function() {
        return this.count;
    };
});

var second = m1.service('Second', function(first, jq) {
    this.message = function(msg) {
        first.message(msg);
        jq('#test').append('here by using jquery as dependency into second service');
    };  
}, 'First', $);

second.message('chained message testing dependency injection');

var f2 = m1.service('First');

console.log('f1 & f2 counts, testing if count is same: f1: ', f1.get(), ' | f2: ', f2.get());
f1.add(10);
console.log('f1 & f2 counts, testing if count is still the same instance: f1: ', f1.get(), ' | f2: ', f2.get());

var third = m1.factory('Third', function(jq, first, second) {
    this.count = 0;
    this.add = function(num) {
        this.count += num;
    };
    this.get = function() {
        return this.count;
    };
}, $, 'First', 'Second');

var fourth = m1.factory('Fourth', function(jq, first, second, third) {
    this.count = 0;
    this.add = function(num) {
        this.count += num;
    };
    this.get = function() {
        return this.count;
    };
}, $, 'First', 'Second', 'Third');

console.log('Third & Fourth counts, testing if count is same: Third: ', third.get(), ' | Fourth: ', fourth.get());
fourth.add(10);
console.log('Third & Fourth counts, testing if count is different: Third: ', third.get(), ' | Fourth: ', fourth.get());

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