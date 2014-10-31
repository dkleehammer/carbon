
var chai = require('chai'),
    expect = chai.expect,
    rc = require('../lib/src/carbon.js'),
    carbon = rc.carbon;

// ----------------------------------------
// Unit tests (factory)
// ----------------------------------------
describe('carbon.module factory', function() {
    var Test = carbon.module('Test');

    var TestFactory = Test.factory('TestFactory', function() {
        this.count = 0;
        
        this.add = function(num) {
            this.count += num;
        };

        this.x = function() {
            return true;
        };
    });

    var TestService = Test.service('TestService', function() {
        this.x = function() {
            return true;
        };
    });    

    it('should create a factory, and be a different instance each time', function() {
        var TS1 = Test.factory('TestFactory'),
            TS2 = Test.factory('TestFactory');

        // they should both be 0
        expect(TS1.count).to.be.equal(TS2.count);

        // add 4 to TS2
        TS2.add(4);

        // TS1 should stay at 0 and TS2 count should now be 4
        expect(TS1.count).to.equal(0);
        expect(TS2.count).to.equal(4);

        // they should be different
        expect(TS1.count).to.not.be.equal(TS2.count);
    });

    // factory and service injected into factory
    describe('carbon.module factory inject factory and service', function() {
        it('should create a factory that has TestFactory and TestService injected into it.', function() {
            var TestFactory2 = Test.factory('TestFactory2', function(TestFactory, TestService) {
                expect(TestFactory.x()).to.equal(true);
                expect(TestService.x()).to.equal(true);
            }, 'TestFactory', 'TestService');
        });
    });
});