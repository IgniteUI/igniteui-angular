'use strict';

const gulp = require('gulp');
const process = require('process');
const fs = require('fs');
const path = require('path');

module.exports.copyMigrations = (cb) => {
    gulp.src([
        './projects/igniteui-angular/migrations/**/*.json',
        '!**/tsconfig.json'
    ]).pipe(gulp.dest('./dist/igniteui-angular/migrations'));

    cb();
};

module.exports.copyExtrasMigrations = (cb) => {
    gulp.src([
        './projects/igniteui-angular-extras/migrations/**/*.json',
        '!**/tsconfig.json'
    ]).pipe(gulp.dest('./dist/igniteui-angular-extras/migrations'));

    cb();
};

module.exports.copySchematics = (cb) => {
    gulp.src([
        './projects/igniteui-angular/schematics/**/*.json',
        '!**/tsconfig.json'
    ]).pipe(gulp.dest('./dist/igniteui-angular/schematics'));

    cb();
};


module.exports.copyPackageForElements = (cb) => {
    return gulp.src([
        path.join(__dirname, 'projects/igniteui-angular-elements/package.json')
    ]).pipe(gulp.dest(path.join(__dirname, 'dist/igniteui-angular-elements/browser')));
};
