import * as gulp from 'gulp';
import * as sass from 'gulp-sass';
import * as sourcemaps from 'gulp-sourcemaps';
import * as autoprefixer from 'gulp-autoprefixer';
import * as tsc from 'typescript';
import * as ts from 'gulp-typescript';

var concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css');

var tsProject = ts.createProject('tsconfig.json', {
        typescript: tsc
    }),
    tsSources: Array<string> = ["./src/**/*.ts",
        "./samples/**/*.ts",
        "./tests/**/*.ts",
        "./tools/**/*.ts"];
  
gulp.task("build", ["build.css", "build.js"]);  

gulp.task("build.js", function () {
     return gulp.src(tsSources.concat("./typings/main.d.ts"), { base: "." })
    .pipe(sourcemaps.init())
    .pipe(ts(tsProject))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("."));
});

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
			browsers: ["last 2 versions"],
			cascade: false
		}))
        
        // save dev version
        .pipe(concat("zero-blocks.dev.css"))
        
        // save source map separately 
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./dist"))
        
        .pipe(concat("zero-blocks.css"))
        .pipe(cleanCSS())
        .pipe(gulp.dest("./dist")); 
});

/**
 * Watchers
 */

gulp.task("watch", ["build.css:watch", "build.js:watch"]);

gulp.task("build.css:watch", function () {
    gulp.watch("src/**/*.scss", ["build.css"]);
});

gulp.task("build.js:watch", function () {
    gulp.watch(tsSources, ["build.js"]);
});