import * as del from "del";
import * as gulp from "gulp";
import * as autoprefixer from "gulp-autoprefixer";
import * as cleanCSS from "gulp-clean-css";
import * as concat from "gulp-concat";
import * as inlineNg2Template from "gulp-inline-ng2-template";
import * as plumber from "gulp-plumber";
import * as sass from "gulp-sass";
import * as sourcemaps from "gulp-sourcemaps";
import * as ts from "gulp-typescript";
import * as Builder from "systemjs-builder";
import * as tsc from "typescript";
import merge = require("merge-stream");
import * as vinylPaths from "vinyl-paths";

const tsProject = ts.createProject("tsconfig.json", {
    typescript: tsc
});
const tsProdProject = ts.createProject("tsconfig.json", {
    declaration: true,
    typescript: tsc
});
const source = "./src/**/*.ts";
const tsSources: string[] = [
    "./demos/**/*.ts"
].concat(source);
const specFilesNegate = "!./src/**/*.spec.ts";

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
    return gulp.src(tsSources.concat("./typings/index.d.ts"), { base: "." })
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});

gulp.task("build.src", () => {

    const tsResult = gulp.src(["./typings/index.d.ts"].concat(source, specFilesNegate), { base: "./src" })
        .pipe(inlineNg2Template({ useRelativePaths: true, base: "/src/*" }))
        .pipe(sourcemaps.init())
        .pipe(tsProdProject());

    return merge(
        tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest("./igniteui-js-blocks")),
        tsResult.dts.pipe(gulp.dest("./igniteui-js-blocks"))
    );
});

gulp.task("bundle.src", ["build.src"], () => {
    const builder = new Builder({
        meta: {
            "@angular/*": {
                build: false
            }
        },
        paths: {
            "*": "*.js"
        }
    });

    return builder.trace("igniteui-js-blocks/main").then((trees) => {
        // console.log("tree resolved");
        return Promise.all([
            builder.bundle(trees, "./dist/bundles/igniteui-js-blocks.dev.js"),
            builder.bundle(trees, "./dist/bundles/igniteui-js-blocks.min.js", { minify: true })
        ]);
    });
});

/**
 * CSS
 */

gulp.task("build.css", ["build.component.css"], () => {
    return gulp.src(["src/themes/*.scss"])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ["src/**/*.scss"]
        }))
        .pipe(autoprefixer({
            browsers: ["last 2 versions"],
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(gulp.dest("./dist"))
        .pipe(gulp.dest("./dist/dev"));
});

gulp.task("build.component.css", () => {
    gulp.src(["src/**/*.component.scss"], { base: "./" })
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: "compressed"
        }))
        .pipe(autoprefixer({
            browsers: ["last 2 versions"],
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write("./"))
        .pipe(plumber.stop())
        .pipe(gulp.dest("."));
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
    "build.fonts:watch",
    "build.component.css:watch"
]);

gulp.task("build.css:watch", () => {
    gulp.watch("src/**/*.scss", ["build.css"]);
});

gulp.task("build.component.css:watch", () => {
    gulp.watch("src/**/*.component.scs", ["build.component.css"]);
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
