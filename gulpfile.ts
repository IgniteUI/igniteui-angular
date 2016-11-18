import * as gulp from 'gulp';
import * as sass from 'gulp-sass';
import * as sourcemaps from 'gulp-sourcemaps';
import * as autoprefixer from 'gulp-autoprefixer';
import * as plumber from 'gulp-plumber';
import * as tsc from 'typescript';
import * as ts from 'gulp-typescript';
import merge = require("merge-stream");

var concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    inlineNg2Template = require('gulp-inline-ng2-template'),
    del = require('del'),
    vinylPaths = require('vinyl-paths');

var Builder = require('systemjs-builder');

var tsProject = ts.createProject('tsconfig.json', {
        typescript: tsc
    }),
    tsProdProject = ts.createProject('tsconfig.json', {
        typescript: tsc,
        declaration: true
    }),
    source = './src/**/*.ts',
    tsSources: Array<string> = [
        "./demos/**/*.ts"
    ].concat(source),
    specFilesNegate = '!./src/**/*.spec.ts';


gulp.task("build", ["build.css", "build.js", "build.fonts"]);


gulp.task("bundle", ["bundle.src", "build.css", "build.fonts", "bundle.README"], () => {
    return gulp.src("./igniteui-js-blocks/**/*")
        .pipe(gulp.dest("./dist"));
});


gulp.task("cleanup", () => {
    return gulp.src("./igniteui-js-blocks")
        .pipe(vinylPaths(del));
});

/**
 * Scripts
 */

gulp.task("build.js", () => {
    return gulp.src(tsSources.concat("./typings/index.d.ts"), { base: "."})
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});


gulp.task("build.src", () => {

    var tsResult = gulp.src(["./typings/index.d.ts"].concat(source, specFilesNegate), { base: "./src"})
        .pipe(inlineNg2Template({ useRelativePaths: true, base: "/src/*"}))
        .pipe(sourcemaps.init())
        .pipe(ts(tsProdProject));

    return merge(
        tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest("./igniteui-js-blocks")),
        tsResult.dts.pipe(gulp.dest("./igniteui-js-blocks"))
    );
});


gulp.task("bundle.src", ["build.src"], () => {
    var builder = new Builder({
        paths: {
            '*': "*.js"
        },
        meta: {
            '@angular/*': {
                build: false
            }
        }
    });

    return builder.trace('igniteui-js-blocks/main').then(trees => {
        console.log('tree resolved');
        return Promise.all([
            builder.bundle(trees, './dist/bundles/igniteui-js-blocks.dev.js'),
            builder.bundle(trees, './dist/bundles/igniteui-js-blocks.min.js', { minify: true })
        ]);
    });
});


/**
 * CSS
 */

gulp.task("build.css", ["build.css.dev"], () => {
    return gulp.src(["src/themes/*.scss"])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ["src/**/*.scss"],
        }))
        .pipe(autoprefixer({
            browsers: ["last 2 versions"],
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(gulp.dest("./dist"));
});


gulp.task("build.css.dev", () => {
    gulp.src(["src/themes/*.scss"])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ["src/**/*.scss"],
        }))
        .pipe(autoprefixer({
            browsers: ["last 2 versions"],
            cascade: false
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(plumber.stop())
        .pipe(gulp.dest("./dist/dev"))
});


/**
 * Fonts
 */

gulp.task("build.fonts", () => {
    return gulp.src(["src/fonts/**/*.*", "node_modules/material-design-icons/iconfont/*.*"])
        .pipe(gulp.dest("./dist/fonts"));
});

/**
 * README.md
 */

gulp.task("bundle.README", () => {
    return gulp.src("./README.md")
        .pipe(gulp.dest("./dist"));
});

/**
 * Watchers
 */

gulp.task("watch", [
    "build.css:watch",
    "build.js:watch",
    "build.fonts:watch"
]);

gulp.task("build.css:watch", () => {
    gulp.watch("src/**/*.scss", ["build.css"]);
});

gulp.task("build.js:watch", () => {
    gulp.watch(tsSources, ["build.js"]);
});

gulp.task("build.fonts:watch", () => {
    gulp.watch([
        "src/fonts/**/*.*",
        "node_modules/material-design-icons/iconfont/*.*"
    ], ["build.fonts"]);
});