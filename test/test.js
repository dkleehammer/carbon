
var carbon = {
    instances: {},
    get: function(name) {
        if (this.instances[name]) {
            return this.instances[name];
        }
    },
    application: function(name, configuration, start) {
        try {
            if (this.instances[name]) {
                throw new Error('Application instance ' + name + ' already exists.');
            }

            this.instances[name] = {configuration: configuration, start: start};  // ? need to create an instance so we can store services and factories in it
        } catch (e) {
            console.error(e);
        }
    }
};


var app = carbon.application('Test', {}, function() {
    console.log('name');
});

var app2 = carbon.get('Test');

console.log(app2);

// Service Example

