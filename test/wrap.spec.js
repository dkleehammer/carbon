
var chai = require('chai'),
    expect = chai.expect,
    rc = require('../lib/src/carbon.js'),
    carbon = rc.carbon;

// ----------------------------------------
// Unit tests
// ----------------------------------------
describe('carbon wrap', function() {
    // module with import from other providers
    var m1 = carbon.module('Module1');
    m1.service('TestService', function() {
        this.x = function() {
            console.log('Module1.TestService x');
        };
    });
    m1.factory('TestFactory', function() {
        this.x = function() {
            console.log('Module1.TestFactory x');
        };
    });

    // wrap test, wrap a function so it can handle di
    describe('carbon.wrap a function to handle di and inject Module1.TestFactory and Module1.TestService', function() {
        it('should wrap the function and include the two injections', function() {
            var wrappedFn = carbon.wrap(function(m1TestFactory, m1TestService) {
                expect(m1TestFactory).to.be.a('object');
                expect(m1TestService).to.be.a('object');
            }, 'Module1.TestFactory', 'Module1.TestService');
        });
    });
});