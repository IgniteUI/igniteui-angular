"use strict";

const autoprefixer = require("autoprefixer");
const gulp = require("gulp");
const sass = require("node-sass");
const postcss = require("postcss");
const inlineTemplates = require("gulp-inline-ng2-template");
const exec = require("child_process").exec;
const fs = require("fs");

const prefixer = postcss([autoprefixer({
    browsers: ["last 5 versions", "> 3%"],
    cascade: false,
    grid: true
})]);

function compileSass(path, ext, file, callback) {
    let compiledCss = sass.renderSync({
        file: path,
        outputStyle: "compressed"
    });
    callback(null, prefixer.process(compiledCss.css).css);
}


const INLINE_TEMPLATES = {
    SRC: "./src/**/*.ts",
    DIST: "./tmp/src-inlined",
    CONFIG: {
        base: "/src",
        target: "es6",
        removeLineBreaks: true,
        useRelativePaths: true,
        styleProcessor: compileSass
    }
};

const THEMING = {
    SRC: "./src/core/styles/**/*",
    DIST: "dist/core/styles"
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
    let result = sass.renderSync({
        file: "src/core/styles/themes/presets/igniteui-angular.scss",
        outputStyle: "compressed",
        includePaths: ["./src/core/styles/"],
        outFile: "dist/styles/igniteui-angular.css"
    });

    fs.writeFile("dist/igniteui-angular.css", prefixer.process(result.css).css, (err) => {
        if (err) throw err;
    });

    return gulp.src(THEMING.SRC)
        .pipe(gulp.dest(THEMING.DIST));
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
    gulp.watch("src/**/*", ["build:esm", "build-style"]);
});
