
var chai = require('chai'),
    expect = chai.expect,
    rc = require('../dist/carbon.min.js'),
    carbon = rc.carbon;

// ----------------------------------------
// Unit tests
// ----------------------------------------
describe('carbon.module', function() {
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

    it('should return a carbon module', function() {
        expect(m1).to.be.a('object');
        expect(m1).to.have.property('_providers');
    });    

    // create our second module injecting a service and factory from our first module
    var m2 = carbon.module('Module2', 'Module1.TestService', 'Module1.TestFactory');

    describe('carbon.module import different module service and factory', function() {
        it('should contain Module1 TestFactory and TestService', function() {
            expect(m2.factory('Module1.TestFactory')).to.be.a('object');
            expect(m2.service('Module1.TestService')).to.be.a('object');
        });
    });
});
