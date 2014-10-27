
var chai = require('chai'),
    expect = chai.expect,
    rc = require('../dist/carbon.min.js'),
    carbon = rc.carbon;

// ----------------------------------------
// Unit tests
// ----------------------------------------
// 1. carbon
// 2. carbon.module
// 3. carbon.module factory
// 4. carbon.module factory, test factory injection, service injection and multiple injection
// 5. carbon.module service
// 6. carbon.module service, test service injection, factory injection and multiple injection
// 7. carbon.module creation and module injection
// 8. carbon.wrap function wrapper to enable di

describe('1. carbon export existence', function() {
    it('should exist', function() {
        expect(carbon).to.be.a('object');
    });

    var Test = carbon.module('Test');

    describe('2. carbon.module', function() {
        it('should return a carbon module', function() {
            expect(Test).to.be.a('object');
            expect(Test).to.have.property('factories');
            expect(Test).to.have.property('services');
        });

        // factory
        describe('3. carbon.module factory', function() {
            var TestFactory = Test.factory('TestFactory', function() {
                this.x = function() {
                    console.log('x inside TestFactory');
                    return true;
                };
            });

            var TestService = Test.service('TestService', function() {
                this.x = function() {
                    console.log('x inside TestService');
                    return true;
                };
            });            

            it('should create a factory, and be a different instance each time', function() {
                expect(TestFactory).to.be.a('object');
                expect(Test.factory('TestFactory')).to.not.equal(Test.factory('TestFactory'));
            });

            // factory injected into factory
            describe('4. carbon.module factory inject factory and service', function() {
                it('should create a factory that has TestFactory and TestService injected into it.', function() {
                    var TestFactory2 = Test.factory('TestFactory2', function(TestFactory, TestService) {
                        expect(TestFactory.x).to.be.a('Function');
                        expect(TestService.x).to.be.a('Function');
                    }, 'TestFactory', 'TestService');
                });
            });
        });

        // service
        describe('5. carbon.module service', function() {
            var TestService = Test.service('TestService', function() {
                this.x = function() {
                    console.log('x inside TestService');
                    return true;
                };
            });

            var TestFactory = Test.factory('TestFactory', function() {
                this.x = function() {
                    console.log('x inside TestFactory');
                    return true;
                };
            });            

            it('should create a service, and be a the same instance each time', function() {
                expect(TestService).to.be.a('object');
                expect(Test.service('TestService')).to.equal(Test.service('TestService'));
            });

            // factory injected into factory
            describe('6. carbon.module service inject factory and service', function() {
                it('should create a factory that has TestService and TestFactory injected into it.', function() {
                    var TestService2 = Test.service('TestService2', function(TestService, TestFactory) {
                        expect(TestService.x).to.be.a('Function');
                        expect(TestFactory.x).to.be.a('Function');
                    }, 'TestService', 'TestFactory');
                });
            });
        });

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

        var m2 = carbon.module('Module2', 'Module1.TestService', 'Module1.TestFactory');

        describe('7. carbon.module import different module service and factory', function() {
            it('should contain Module1 TestFactory and TestService', function() {
                expect(m2.factory('Module1.TestFactory')).to.be.a('object');
                expect(m2.service('Module1.TestService')).to.be.a('object');
            });
        });

        // wrap test, wrap a function so it can handle di
        describe('8. carbon.wrap a function to handle di and inject Module1.TestFactory and Module1.TestService', function() {
            it('should wrap the function and include the two injections', function() {
                var wrappedFn = carbon.wrap(function(m1TestFactory, m1TestService) {
                    expect(m1TestFactory).to.be.a('object');
                    expect(m1TestService).to.be.a('object');
                }, 'Module1.TestFactory', 'Module1.TestService');
            });
        });
    });
});
