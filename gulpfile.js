'use strict';

const gulp = require('gulp');
const process = require('process');
const fs = require('fs');
const path = require('path');

module.exports.copyGitHooks = async (cb) => {
    if (process.env.AZURE_PIPELINES || process.env.TRAVIS || process.env.CI || !fs.existsSync('.git')) {
        return;
    }

    const gitHooksDir = './.git/hooks/';
    const defaultCopyHookDir = gitHooksDir + 'scripts/';
    const dirs = [
        gitHooksDir,
        defaultCopyHookDir,
        defaultCopyHookDir + 'templates',
        defaultCopyHookDir + 'templateValidators',
        defaultCopyHookDir + 'utils'
    ];

    dirs.forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if (err) {
                    throw err;
                }
            });
        }
    });

    const defaultHookDir = './.hooks/scripts/';

    fs.copyFileSync(defaultHookDir + 'templates/default.js',
        defaultCopyHookDir + 'templates/default.js');

    fs.copyFileSync(defaultHookDir + 'templateValidators/default-style-validator.js',
        defaultCopyHookDir + 'templateValidators/default-style-validator.js');

    fs.copyFileSync(defaultHookDir + 'utils/issue-validator.js',
        defaultCopyHookDir + 'utils/issue-validator.js');

    fs.copyFileSync(defaultHookDir + 'utils/line-limits.js',
        defaultCopyHookDir + 'utils/line-limits.js');

    fs.copyFileSync(defaultHookDir + 'common.js',
        defaultCopyHookDir + 'common.js');

    fs.copyFileSync(defaultHookDir + 'validate.js',
        defaultCopyHookDir + 'validate.js');

    fs.copyFileSync('./.hooks/prepare-commit-msg',
        './.git/hooks/prepare-commit-msg');

    return await cb();
};

module.exports.copyMigrations = (cb) => {
    gulp.src([
        './projects/igniteui-angular/migrations/**/*.json',
        '!**/tsconfig.json'
    ]).pipe(gulp.dest('./dist/igniteui-angular/migrations'));


    gulp.src([
        './projects/igniteui-angular/migrations/common/import-helper.js'
    ]).pipe(gulp.dest('./dist/igniteui-angular/migrations/common'));

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
