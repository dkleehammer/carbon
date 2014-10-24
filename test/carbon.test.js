
var chai = require('chai'),
    expect = chai.expect,
    rc = require('../dist/carbon.min.js'),
    carbon = rc.carbon;

// ----------------------------------------
// Unit tests
// ----------------------------------------
describe('carbon', function() {
    it('should exist', function() {
        expect(carbon).to.be.a('object');
    });

    var Test = carbon.module('Test');

    describe('carbon.module', function() {
        it('should return a carbon module', function() {
            expect(Test).to.be.a('object');
            expect(Test).to.have.property('providers');
        });

        describe('carbon.module factory', function() {
            it('should create a factory, and be a different instance each time', function() {
                var TestFactory = Test.factory('TestFactory', function() {
                    this.x = function() {
                        return true;
                    };
                });

                expect(TestFactory).to.be.a('object');
                expect(Test.factory('TestFactory')).to.not.equal(Test.factory('TestFactory'));
            });
        });

        describe('carbon.module service', function() {
            it('should create a service, and be the SAME instance each time', function() {
                var TestService = Test.service('TestService', function() {
                    this.x = function() {
                        return true;
                    };
                });

                expect(TestService).to.be.a('object');
                expect(Test.service('TestService')).to.equal(Test.service('TestService'));
            });
        });        
    });
});

//   di - factory to factory
//   di - service to factory
//   di - service to service
//   di - factory to service
//   di - multiple injections
//   di - module (modules can import providers from other modules, e.g ModuleName.ProviderName)
//   di - wrap (same as module, di is ModuleName.ProviderName)
