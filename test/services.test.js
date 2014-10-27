
var chai = require('chai'),
    expect = chai.expect,
    rc = require('../dist/carbon.min.js'),
    carbon = rc.carbon;

// ----------------------------------------
// Unit tests (service)
// ----------------------------------------
describe('carbon.module service', function() {
    var Test = carbon.module('Test');

    var TestService = Test.service('TestService', function() {
        this.count = 0;

        this.add = function(num) {
            this.count += num;
        };
        
        this.x = function() {
            return true;
        };        
    });

    var TestFactory = Test.factory('TestFactory', function() {
        this.x = function() {
            return true;
        };
    });            

    it('should create a service, and be a the same instance each time', function() {
        var TS1 = Test.service('TestService'),
            TS2 = Test.service('TestService');

        // they should both be 0
        expect(TS1.count).to.be.equal(TS2.count);

        // add 4 using TS2
        TS2.add(4);

        // TS1/TS2 count should now be 4
        expect(TS1.count).to.equal(4);

        // they should both be equal
        expect(TS1.count).to.be.equal(TS2.count);
    });

    // factory and service injected into service
    describe('carbon.module service inject factory and service', function() {
        it('should create a factory that has TestService and TestFactory injected into it.', function() {
            var TestService2 = Test.service('TestService2', function(TestService, TestFactory) {
                expect(TestService.x()).to.equal(true);
                expect(TestFactory.x()).to.equal(true);
            }, 'TestService', 'TestFactory');
        });
    });
});