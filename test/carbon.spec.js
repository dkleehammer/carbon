
var chai = require('chai'),
    expect = chai.expect,
    rc = require('../lib/src/carbon.js'),
    carbon = rc.carbon;

// ----------------------------------------
// Unit tests
// ----------------------------------------
describe('Test creating a carbon module', function() {

    // ----------------------------------------
    // create a  module
    carbon.module('Module1', function() {
        return {
            count: 0,
            add: function(num) {
                this.count += num;
            }
        };
    });

    it('should return carbon module Module1 and have a count property', function() {
        var Module1 = carbon.module('Module1');
        expect(Module1).to.be.a('object');
        expect(Module1).to.have.a.property('count');
    });
});


// ----------------------------------------
// test that the module is truly a singleton
// ----------------------------------------
describe('Test that module is truly a singleton', function() {
    // ----------------------------------------
    // create a singleton module
    carbon.module('SingletonModule', function() {
        return {
            count: 0,
            add: function(num) {
                this.count += num;
            }
        };
    });

    it('M1.count should always eqaul M2.count even when adding to M2', function() {
        var M1 = carbon.module('SingletonModule'),
            M2 = carbon.module('SingletonModule');

        expect(M1.count).to.equal(M2.count);

        M2.add(3);

        expect(M1.count).to.equal(M2.count);
    });
});

// ----------------------------------------
// create a factory module
// ----------------------------------------
describe('Test that module is a factory', function() {
    carbon.module('Module2', function() {
        return function() {
            this.count = 0;
            this.add = function(num) {
                this.count += num;
            };
        };
    });

    it('M1.count should not be equal to M2.count after we add to M2.count', function() {
        var M1 = carbon.module('Module2'),
            M2 = carbon.module('Module2');

        var m1 = new M1(), m2 = new M2();

        expect(m1.count).to.equal(m2.count);

        m2.add(3);

        expect(m1.count).to.not.equal(m2.count);
    });
});