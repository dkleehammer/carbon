
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
        .pipe(tasks.jshint.reporter('default'));
});


// ----------------------------------------
// test
// ----------------------------------------
gulp.task('test', function() {
    return gulp.src(['./test/*.js'])
        .pipe(tasks.mocha());
});


// ----------------------------------------
// js
// ----------------------------------------
gulp.task('js', function() {
    gulp.src('./lib/src/**/*.js')
        .pipe(tasks.sourcemaps.init())
        .pipe(tasks.concat(pkg.name + '.min.js'))
        .pipe(tasks.uglify())
        .pipe(tasks.header(header, {pkg: pkg}))
        .pipe(tasks.sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/'));
});


gulp.task('dist', ['lint', 'test', 'js']);


// ----------------------------------------
// user tasks
// ----------------------------------------
gulp.task('default', ['lint', 'test', 'js'], function() {
    tasks.watch('./lib/src/**/*.js', function(files, cb) {
        gulp.start('dist', cb);
    });
});