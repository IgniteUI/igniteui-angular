"use strict";

const autoprefixer = require("autoprefixer");
const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const inlineTemplates = require("gulp-inline-ng2-template");
const exec = require("child_process").exec;
const fs = require("fs");

const INLINE_TEMPLATES = {
    SRC: "./src/**/*.ts",
    DIST: "./tmp/src-inlined",
    CONFIG: {
        base: "/src",
        target: "es6",
        removeLineBreaks: true,
        useRelativePaths: true
    }
};

const STYLES = {
    SRC: "./src/core/styles/themes/presets/*",
    DIST: "./dist/styles",
    MAPS: "./maps",
    THEMING: {
        SRC: "./src/core/styles/**/*",
        DIST: "./dist/core/styles"
    },
    CONFIG: {
        outputStyle: "compressed"
    }
}

gulp.task("make-packagejson", () => {
    fs.readFile("package.json", "utf8", (err, data) => {
        if (err) throw err;

        data = JSON.parse(data.trim());
        delete data.scripts;
        delete data.devDependencies;
        data.peerDependencies = data.dependencies;
        delete data.dependencies;

        fs.writeFile("dist/package.json", JSON.stringify(data, null, 4), "utf8", (err) => {
            if (err) throw err;
        });
    });
});

gulp.task("build-style", () => {
    const prefixer = postcss([autoprefixer({
        browsers: ["last 5 versions", "> 3%"],
        cascade: false,
        grid: true
    })]);

    gulp.src(STYLES.THEMING.SRC)
        .pipe(gulp.dest(STYLES.THEMING.DIST));

    return gulp.src(STYLES.SRC)
        .pipe(sourcemaps.init())
        .pipe(sass.sync(STYLES.CONFIG).on('error', sass.logError))
        .pipe(prefixer)
        .pipe(sourcemaps.write(STYLES.MAPS))
        .pipe(gulp.dest(STYLES.DIST));
});

gulp.task("inline-templates", () => {
    return gulp.src(INLINE_TEMPLATES.SRC)
        .pipe(inlineTemplates(INLINE_TEMPLATES.CONFIG))
        .pipe(gulp.dest(INLINE_TEMPLATES.DIST));
});

gulp.task("build:esm", ["inline-templates"], (callback) => {
    exec("npm run ngcompile && npm run build:styles", function (err, stdout, stderr) {
        console.log(stdout, stderr);
        callback(err);
    });
});

gulp.task("build:esm:watch", ["build:esm"], () => {
    gulp.watch("src/**/*", ["build:esm"]);
});
