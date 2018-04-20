"use strict";

const autoprefixer = require("autoprefixer");
const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const inlineTemplates = require("gulp-inline-ng2-template");
const exec = require("child_process").exec;
const fs = require("fs");
const process = require("process");

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
        let hammerjs = data.dependencies.hammerjs;
        delete data.scripts;
        data.dependencies["@types/hammerjs"] = data.devDependencies["@types/hammerjs"];
        delete data.devDependencies;
        data.peerDependencies = {
            "@angular/animations": "" + data.dependencies["@angular/animations"] + "",
            "@angular/common": "" + data.dependencies["@angular/common"] + "",
            "@angular/compiler":"" + data.dependencies["@angular/compiler"] + "",
            "@angular/core": "" + data.dependencies["@angular/core"] + "",
            "@angular/forms":"" + data.dependencies["@angular/forms"] + "",
            "@angular/platform-browser": "" + data.dependencies["@angular/platform-browser"] + "",
            "@angular/platform-browser-dynamic": "" + data.dependencies["@angular/platform-browser-dynamic"] + "",
            "rxjs": "" + data.dependencies["rxjs"] + "",
            "web-animations-js": "^2.3.1",
            "jszip": "" + data.dependencies["jszip"] + ""
        }
        delete data.dependencies["@angular/animations"];
        delete data.dependencies["@angular/common"];
        delete data.dependencies["@angular/compiler"];
        delete data.dependencies["@angular/core"];
        delete data.dependencies["@angular/forms"];
        delete data.dependencies["@angular/platform-browser"];
        delete data.dependencies["@angular/platform-browser-dynamic"];
        delete data.dependencies["rxjs"];
        delete data.dependencies["jszip"];

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

gulp.task("copy-git-hooks", () => {

    if (process.env.TRAVIS || process.env.CI) {
        return;
    }

    const gitHooksDir = "./.git/hooks/";
    const defaultCopyHookDir = gitHooksDir + "scripts/";
    const dirs = [
        gitHooksDir,
        defaultCopyHookDir,
        defaultCopyHookDir + "templates",
        defaultCopyHookDir + "templateValidators",
        defaultCopyHookDir + "utils"
    ];

    dirs.forEach((dir) => {
        if(!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if(err) { throw err; }
            });
        }
    });

    const defaultHookDir = "./.hooks/scripts/";

    fs.copyFileSync(defaultHookDir + "templates/default.js",
        defaultCopyHookDir + "templates/default.js");
        
    fs.copyFileSync(defaultHookDir +"templateValidators/default-style-validator.js",
        defaultCopyHookDir + "templateValidators/default-style-validator.js");
    
    fs.copyFileSync(defaultHookDir + "utils/issue-validator.js",
        defaultCopyHookDir + "utils/issue-validator.js");

    fs.copyFileSync(defaultHookDir + "utils/line-limits.js",
        defaultCopyHookDir + "utils/line-limits.js");
    
    fs.copyFileSync(defaultHookDir + "common.js",
        defaultCopyHookDir + "common.js");
    
    fs.copyFileSync(defaultHookDir + "validate.js",
        defaultCopyHookDir + "validate.js");

    fs.copyFileSync("./.hooks/prepare-commit-msg",
        "./.git/hooks/prepare-commit-msg");
});

