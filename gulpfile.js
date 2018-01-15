"use strict";

const autoprefixer = require("autoprefixer");
const gulp = require("gulp");
const sass = require("node-sass");
const postcss = require("postcss");
const inlineTemplates = require("gulp-inline-ng2-template");
const exec = require("child_process").exec;
const fs = require("fs");

const prefixer = postcss([autoprefixer({
    browsers: ["last 2 versions"]
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
        useRelativePaths: true,
        styleProcessor: compileSass
    }
};

const FONTS = {
    SRC: [
        "node_modules/material-design-icons/iconfont/*.{woff,woff2,ttf}",
        "src/fonts/titillium/*.ttf",
        "src/fonts/titillium/*.txt"
    ],
    DIST: "dist/fonts"
};


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
        file: "src/themes/igniteui-angular.scss",
        outputStyle: "compressed",
        includePaths: ["./src/themes"],
        outFile: "dist/igniteui-angular.css"
    });

    fs.writeFile("dist/igniteui-angular.css", prefixer.process(result.css).css, (err) => {
        if (err) throw err;
    });

    return gulp.src(FONTS.SRC)
        .pipe(gulp.dest(FONTS.DIST));
});


gulp.task("inline-templates", () => {
    return gulp.src(INLINE_TEMPLATES.SRC)
        .pipe(inlineTemplates(INLINE_TEMPLATES.CONFIG))
        .pipe(gulp.dest(INLINE_TEMPLATES.DIST));
});


gulp.task("build:esm", ["inline-templates"], (callback) => {
    exec("npm run ngcompile", function (err, stdout, stderr) {
        console.log(stdout, stderr);
        callback(err);
    });
});


gulp.task("build:esm:watch", ["build:esm"], () => {
    gulp.watch("src/**/*", ["build:esm", "build-style"]);
});
