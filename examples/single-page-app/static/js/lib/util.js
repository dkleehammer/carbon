

// ----------------------------------------
// Create a new carbon module to store services and factories in
// ----------------------------------------
var Util = carbon.module('Util');

// ----------------------------------------
// Services can extend objects
// ----------------------------------------
var r = new Rlite();

Util.service('Router', function(r) {
    this.add = r.add;
    this.rules = r.rules;
    this.run = r.run;

    // ----------------------------------------
    // user defined method that will be merged with rlite and cached as a service in the module
    // ----------------------------------------
    this.processHash = function(hash) {
        var hash = location.hash || '#';
        r.run(hash.substr(1));
    };

    // ----------------------------------------
    // user defined method that will be merged with rlite and cached as a service in the module
    // ----------------------------------------
    this.start = function() {
        window.addEventListener('hashchange', this.processHash);
        this.processHash();
    }
}, r);
