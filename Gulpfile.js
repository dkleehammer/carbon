
var gulp = require('gulp'),
    bower = require('./bower.json'),
    pkg = require('./package.json'),
    tasks = require('gulp-load-plugins')();


// ----------------------------------------
// header
// ----------------------------------------
var header = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' */',
    ''].join('\n');


// ----------------------------------------
// jshint (js lint the file)
// ----------------------------------------
gulp.task('lint', function() {
    return gulp.src(['./lib/src/**/*.js'])
        .pipe(tasks.jshint())
        .pipe(tasks.jshint.reporter(require('jshint-stylish')));
});


// ----------------------------------------
// test
// ----------------------------------------
gulp.task('test', ['lint'], function() {
    return gulp.src(['./test/*.spec.js'])
        .pipe(tasks.mocha());
});


// ----------------------------------------
// js
// ----------------------------------------
gulp.task('js', ['test'], function() {
    gulp.src('./lib/src/**/*.js')
        .pipe(tasks.sourcemaps.init())
        .pipe(tasks.concat(pkg.name + '.min.js'))
        .pipe(tasks.uglify())
        .pipe(tasks.header(header, {pkg: pkg}))
        .pipe(tasks.sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/'));
});

// ----------------------------------------
// user task dist, lints, tests, and packages js and source map files into dist dir
// ----------------------------------------
gulp.task('dist', ['js']);

// ----------------------------------------
// user task default, runs watch to keep running and watching for changes
// ----------------------------------------
gulp.task('default', ['js'], function() {
    tasks.watch('./lib/src/**/*.js', function(files, cb) {
        gulp.start('dist', cb);
    });
});
