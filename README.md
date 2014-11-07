### carbon
======
An extendible lightweight, non-opinionated, dependenciy injection library and nothing more.


###### TODO/REVIEW
- [x] services
- [x] factories
- [x] modules
- [x] wrap
- [x] test cases (list in carbon.test.js file)
- [ ] plugins (sample plugins or something)

1. How can we make the library easily extendible?  Write initial test website containing injected router or views or something.


### What I think we should get

service || name, parameters

    service('name', []);

create || name, constructor, injectables)

    service('name', function(injected) {
        this.x = function() {
            // this is x
        }; 
    }, 'injected');

