## carbon

An extendible lightweight, non-opinionated, module dependenciy injection library and nothing more.

### Why

Carbon was created to provide a means to create modules, use them in separated files, be completely testable, and solely get out of the way of
the developer.  Frameworks that are currently available (and some libraries) come with their own template engine or ways to manipulate HTML, but 
they are not always correct.  Carbon paves the way to having dependency injections, staying testable, but allowing the developer to choose what 
tools are best for this particular project.  Carbon is the right tool for the job IF the job is only DI and allowing DI across files.

### Samples

Create a module
```javascript
carbon.module('Module1', function() {
    return {
        count: 0,
        add: function(num) {
            this.count += num;
        }
    }; 
});
```

To use a module, use carbon.module passing only the name
```javascript
var M1 = carbon.module('Module1');

console.info(M1.count);
M1.add(3);
console.info(M1.count);
```

Want to use the singleton module even in a different file?  Get the instance just like the previous example, and use it, both will be updated
```javascript
var M2 = carbon.module('Module1');

// display our current values
console.info('M1 count: ', M1.count, ' | M2 count: ', M2.count);

// add to M2, notice M1 count;
M2.add(5);

// display new values, notice they are the same.
console.info('M1 count: ', M1.count, ' | M2 count: ', M2.count);
```

You can also create factory modules that will create a new instance each time you inject it.  Simply return the constructor function instead
of an object.
```javascript
carbon.module('Factory1', function() {
    return function() {
        this.message = 'this is my original message';
    }; 
});

// use the factory modules is the same as singletons
var F1 = carbon.module('Factory1'),
    F2 = carbon.module('Factory1');

// display our current values
console.info('F1 message: ', F1.message, ' | F2 message: ', F2.message);

// update F2 like the singleton example
F2.message = 'This is my updated message';

// notice F1 was untouched
console.info('F1 message: ', F1.message, ' | F2 message: ', F2.message);
```

Dependency injections - You can pass in dependencies into new modules during creation
```javascript
// create a logger service
carbon.module('Logger', function() {
    return {
        info: function() {
            console.info(message);
        },
        log: function() {
            console.log(message);
        },
        warn: function() {
            console.warn(message);
        },
        error: function() {
            console.error(message);
        }
    };    
});
```

Inject Logger into Factory1
```javascript
carbon.module('Factory1', function(log) {
    return function() {
        this.message = function(message, level) {
            switch(level) {
                case "info":
                    log.info(message);
                    break;
                case "warn":
                    log.warn(message);
                    break;
                case "error":
                    log.error(message);
                    break;

                case "log":
                default:
                    log.log(message);
                    break;
            }
        };
    }; 
}, 'Logger');
```
Use the Factory module and use message at 'info' level.
```javascript
var F1 = carbon.module('Factory1');
F1.message('this is my message', 'info');
```
