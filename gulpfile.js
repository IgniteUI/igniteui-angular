'use strict';

const autoprefixer = require('autoprefixer');
const gulp = require('gulp');
const sass = require('node-sass');
const inlineTemplates = require('gulp-inline-ng2-template');
const exec = require('child_process').exec;
const fs = require('fs');


const PACKAGE_JSON = {
    name: "igniteui-js-blocks",
    version: "0.1.0",
    description: "Infragistics mobile-first Angular native components and supporting directives built with TypeScript",
    author: "Infragistics",
    main: "index.umd.js",
    module: "main.js",
    "jsnext:main": "main.js",
    types: "main.d.ts",
    license: "Apache-2.0",
    repository: {
        "type": "git",
        "url": "https://github.com/IgniteUI/igniteui-js-blocks"
    },
    bugs: {
        "url": "https://github.com/IgniteUI/igniteui-js-blocks/issues"
    },
    keywords: [
        "igniteui-js-blocks",
        "angular",
        "angular4"
    ],
    peerDependencies: {
        "@angular/animations": "^4.4.4",
        "@angular/common": "^4.4.4",
        "@angular/compiler": "^4.4.4",
        "@angular/core": "^4.4.4",
        "@angular/forms": "^4.4.4",
        "@angular/platform-browser": "^4.4.6",
        "hammerjs": "^2.0.8",
        "rxjs": "^5.5.2"
    },
};

const INLINE_TEMPLATES = {
    SRC: './src/**/*.ts',
    DIST: './tmp/src-inlined',
    CONFIG: {
        base: '/src',
        target: 'es6',
        useRelativePaths: true,
        styleProcessor: compileSass
    }
};

const FONTS = {
    SRC: [
        'node_modules/material-design-icons/iconfont/*.{woff,woff2,ttf}',
        'src/fonts/titillium/*.ttf',
        'src/fonts/titillium/*.txt'
    ],
    DIST: 'dist/fonts'
};


gulp.task('make-packagejson', () => {
    fs.writeFile('dist/package.json', JSON.stringify(PACKAGE_JSON, null, 4), 'utf8', (err) => {
        if (err) throw err;
    });
});


gulp.task('build-style', () => {
    let result = sass.renderSync({
        file: 'src/themes/zero-blocks.scss',
        outputStyle: 'compressed',
        includePaths: ['./src/themes'],
        outFile: 'dist/zero-blocks.css'
    });

    fs.writeFile('dist/zero-blocks.css', autoprefixer.process(result.css, { browsers: ['last 2 versions'] }).css, (err) => {
        if (err) throw err;
    });

    return gulp.src(FONTS.SRC)
        .pipe(gulp.dest(FONTS.DIST));
});


gulp.task('inline-templates', () => {
    return gulp.src(INLINE_TEMPLATES.SRC)
        .pipe(inlineTemplates(INLINE_TEMPLATES.CONFIG))
        .pipe(gulp.dest(INLINE_TEMPLATES.DIST));
});


gulp.task('build:esm', ['inline-templates'], (callback) => {
    exec('npm run ngcompile', function(err, stdout, stderr) {
        console.log(stdout, stderr);
        callback(err);
    });
});


gulp.task('build:esm:watch', ['build:esm'], () => {
    gulp.watch('src/**/*', ['build:esm', 'build-style']);
});


function compileSass(path, ext, file, callback) {
    let compiledCss = sass.renderSync({
        file: path,
        outputStyle: 'compressed'
    });
    callback(null, autoprefixer.process(compiledCss.css, { browsers: ['last 2 versions'] }).css);
}
