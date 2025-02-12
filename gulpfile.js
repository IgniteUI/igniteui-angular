'use strict';

const del = require('del');
const gulp = require('gulp');
const process = require('process');
const fs = require('fs');
const argv = require('yargs').argv;
const sassdoc = require('sassdoc');
const path = require('path');
const { series } = require('gulp');
const slash = require('slash');

const DOCS_OUTPUT_PATH = slash(path.join(__dirname, 'dist', 'igniteui-angular', 'docs'));

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


function createDocsOutputDirFn(cb) {
    !fs.existsSync(DOCS_OUTPUT_PATH) && fs.mkdirSync(DOCS_OUTPUT_PATH);
    cb();
}

const SASSDOC = {
    PROJECT_PATHS: [
        `${path.join(__dirname, 'projects', 'igniteui-angular', 'src', 'lib', 'core', 'styles')}/**/*.scss`,
        `${path.join(__dirname, 'node_modules', 'igniteui-theming', 'sass')}/**/*.scss`
    ],
    DEST: path.join(DOCS_OUTPUT_PATH, 'sass'),
    OPTIONS: path.join(__dirname, '.sassdocrc'),
};

const sassdocCleanOutputDir = (cb) => {
    del.sync(SASSDOC.DEST);
    cb();
}

function sassdocBuildJson(cb) {
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    const { convert, exportDir } = argv;

    options.convert = convert;
    options.exportDir = exportDir;

    gulp.src(SASSDOC.PROJECT_PATHS)
        .pipe(sassdoc(options));

    cb();

}

function sassdocImportJson(cb) {
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    const { render, importDir } = argv;

    options.render = render;
    options.json_dir = importDir;
    options.shellStringsPath = path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json');

    gulp.src(SASSDOC.PROJECT_PATHS)
        .pipe(sassdoc(options));

    cb();
}

function sassdocBuildJA(cb) {
    const pathTranslations = path.join(__dirname, 'i18nRepo', 'sassdoc', 'ja');
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    options.lang = 'jp';
    options.render = argv.render;
    options.json_dir = pathTranslations;
    options.shellStringsPath = path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json');

    gulp.src(SASSDOC.PROJECT_PATHS)
        .pipe(sassdoc(options));

    cb();
}

function sassdocBuildEN(cb) {
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    options.lang = 'en';
    options.shellStringsPath = path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json');

    gulp.src(SASSDOC.PROJECT_PATHS)
        .pipe(sassdoc(options));

    cb();
}

module.exports.createDocsOutputDir = createDocsOutputDirFn;

/**
 * Sassdoc build tasks
 */
module.exports.sassdocCleanOutputDir = sassdocCleanOutputDir;
module.exports.sassdocImportJson = sassdocImportJson;
module.exports.sassdocBuildJson = sassdocBuildJson;
module.exports.sassdocBuildJA = series(sassdocCleanOutputDir, sassdocBuildJA);
module.exports.sassdocBuildEN = series(sassdocCleanOutputDir, sassdocBuildEN);

module.exports.copyPackageForElements = (cb) => {
    return gulp.src([
        path.join(__dirname, 'projects/igniteui-angular-elements/package.json')
    ]).pipe(gulp.dest(path.join(__dirname, 'dist/igniteui-angular-elements/browser')));
};
