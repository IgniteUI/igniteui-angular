import * as gulp from 'gulp';
import * as sass from 'gulp-sass';
import * as sourcemaps from 'gulp-sourcemaps';
import * as autoprefixer from 'gulp-autoprefixer';
import * as tsc from 'typescript';
var concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css');

gulp.task("build.css", (done: any) => {
    return gulp.src(["src/**/*.scss"])
        .pipe(sourcemaps.init())
        .pipe(sass())
        
        // per https://github.com/sindresorhus/gulp-autoprefixer/issues/8#issuecomment-59741781
        // Write sourcemap inline.
        .pipe(sourcemaps.write())
        
        // Reinitialise sourcemaps, loading inline sourcemap.
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
        
        // save dev version
        .pipe(concat("zero-blocks.dev.css"))
        
        // save source map separately 
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest('./dist'))
        
        .pipe(concat("zero-blocks.css"))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./dist')); 
});

/**
 * Watchers
 */

gulp.task("watch", function () {

});

gulp.task('build.css:watch', function () {
    gulp.watch("src/**/*.scss", ['build.css']);
});