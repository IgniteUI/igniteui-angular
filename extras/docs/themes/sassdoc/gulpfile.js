'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var uglify = require('gulp-uglify');
var cache = require('gulp-cached');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var path = require('path');
var fs = require('fs-extra');
var Promise = require('bluebird');
var copy = Promise.promisify(fs.copy);

var sassdoc = require('sassdoc');


// Set your Sass project (the one you're generating docs for) path.
// Relative to this Gulpfile.
var projectPath = '../../../../projects/igniteui-angular/src/lib/core/styles/';

// Project path helper.
var project = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(projectPath);
    return path.resolve.apply(path, args);
};

// Theme and project specific paths.
var dirs = {
    scss: 'scss',
    css: 'assets/css',
    img: 'assets/img',
    svg: 'assets/svg',
    js: 'assets/js',
    tpl: 'views',
    src: projectPath,
    docs: './sassdoc'
};


gulp.task('styles', function () {
    var browsers = ['last 2 version', '> 1%', 'ie 9'];
    var processors = [
        require('autoprefixer')({
            browsers: browsers
        })
    ];

    return gulp.src('./scss/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest('assets/css'));
});


gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: dirs.docs
        },
        files: [
            path.join(dirs.docs, '/*.html'),
            path.join(dirs.docs, '/assets/css/**/*.css'),
            path.join(dirs.docs, '/assets/js/**/*.js')
        ]
    });
});


// SassDoc compilation.
// See: http://sassdoc.com/customising-the-view/
gulp.task('compile', function () {
    var config = {
        verbose: true,
        dest: dirs.docs,
        autofill: [],
        theme: './',
        package: {
            name: 'SassDoc Dev Theme',
            version: 'x.x.x'
        },
        // Disable cache to enable live-reloading.
        // Usefull for some template engines (e.g. Swig).
        cache: false,
    };

    var sdStream = sassdoc(config);

    gulp.src(path.join(dirs.src, '**/*.scss'))
        .pipe(sdStream);

    // Await for the full documentation process.
    return sdStream.promise;
});


// Dump JS files from theme into `docs/assets` whenever they get modified.
// Prevent requiring a full `compile`.
gulp.task('dumpJS', function () {
    var src = dirs.js;
    var dest = path.join(dirs.docs, 'assets/js');

    return copy(src, dest).then(function () {
        gutil.log(src + ' copied to ' + path.relative(__dirname, dest));
    });
});


// Dump CSS files from theme into `docs/assets` whenever they get modified.
// Prevent requiring a full `compile`.
gulp.task('dumpCSS', ['styles'], function () {
    var src = dirs.css;
    var dest = path.join(dirs.docs, 'assets/css');

    return copy(src, dest).then(function () {
        gutil.log(src + ' copied to ' + path.relative(__dirname, dest));
    });
});


// Development task.
// While working on a theme.
gulp.task('develop', ['compile', 'styles', 'browser-sync'], function () {
    gulp.watch('scss/**/*.scss', ['styles', 'dumpCSS']);
    gulp.watch('assets/js/**/*.js', ['dumpJS']);
    gulp.watch('views/**/*.{handlebars,hbs}', ['compile']);
});


gulp.task('svgmin', function () {
    return gulp.src('assets/svg/*.svg')
        .pipe(cache(
            imagemin({
                svgoPlugins: [{
                    removeViewBox: false
                }]
            })
        ))
        .pipe(gulp.dest('assets/svg'));
});


gulp.task('imagemin', function () {
    return gulp.src('assets/img/{,*/}*.{gif,jpeg,jpg,png}')
        .pipe(cache(
            imagemin({
                progressive: true,
                use: [pngcrush()]
            })
        ))
        .pipe(gulp.dest('assets/img'));
});


// Pre release/deploy optimisation tasks.
gulp.task('dist', [
    'jsmin',
    'svgmin',
    'imagemin',
]);
