'use strict';

const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const shell = require('gulp-shell');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const process = require('process');
const fs = require('fs');
const argv = require('yargs').argv;
const sassdoc = require('sassdoc');
const ts = require('gulp-typescript');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const typedocGulp = require('igniteui-typedoc-theme/gulpfile');
const sassdocGulp = require('igniteui-sassdoc-theme/gulpfile');
const { series, parallel } = require('gulp');
const {execSync, spawnSync} = require('child_process');
const slash = require('slash');

sass.compiler = require('sass');

const STYLES = {
    SRC: './projects/igniteui-angular/src/lib/core/styles/themes/presets/*',
    DIST: './dist/igniteui-angular/styles',
    MAPS: './maps',
    THEMING: {
        SRC: './projects/igniteui-angular/src/lib/core/styles/**/*',
        DIST: './dist/igniteui-angular/lib/core/styles'
    },
    CONFIG: {
        outputStyle: 'compressed'
    }
};

const TYPEDOC_THEME = {
    // SRC: `${path.join(__dirname, "node_modules", "igniteui_typedoc_theme", "typedoc", "src")}`,
    // SRC: `${path.join(__dirname, 'extras', 'docs', 'themes', 'typedoc', 'src')}`,
    SRC: slash(path.join(__dirname, 'node_modules', 'igniteui-typedoc-theme', 'typedoc', 'src'))

    // DIST: './extras/docs/themes/typedoc/bin/',
    // STYLES: {
    //     ENTRY: './assets/css/main.sass',
    //     OUT: './assets/css',
    //     MAPS: './',
    //     CONFIG: {
    //         outputStyle: 'compressed'
    //     }
    // }
}

module.exports.buildStyle =  (cb) => {
    const prefixer = postcss([autoprefixer({
        browsers: ['last 5 versions', '> 3%'],
        cascade: false,
        grid: true
    })]);

    gulp.src(STYLES.THEMING.SRC)
        .pipe(gulp.dest(STYLES.THEMING.DIST));

    const myEventEmitter = new EventEmitter();

    gulp.src(STYLES.SRC)
        .pipe(sourcemaps.init())
        .pipe(sass.sync(STYLES.CONFIG).on('error', err => {
            sass.logError.bind(myEventEmitter)(err);
            myEventEmitter.emit('end');
            process.exit(1);
        }))
        .pipe(prefixer)
        .pipe(sourcemaps.write(STYLES.MAPS))
        .pipe(gulp.dest(STYLES.DIST));

    cb();
};

module.exports.copyGitHooks = (cb) => {

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

    cb();
};

module.exports.copyMigrations = (cb) => {
    gulp.src([
        './projects/igniteui-angular/migrations/**/*.json',
        '!**/tsconfig.json'
    ]).pipe(gulp.dest('./dist/igniteui-angular/migrations'));

    cb();
};

module.exports.copySchematics = (cb) => {
    gulp.src([
        './projects/igniteui-angular/schematics/**/*.json',
        '!**/tsconfig.json'
    ]).pipe(gulp.dest('./dist/igniteui-angular/schematics'));

    cb();
};

const typedocBuildTheme = (cb) => {
    spawnSync(`typedoc`, [TYPEDOC.PROJECT_PATH], { stdio: 'inherit', shell: true });
    cb();
}
typedocBuildTheme.displayName = 'typedoc-build:theme';

const browserReload = (cb) => {
    browserSync.reload();

    cb();
}

const typedocServe = (cb) => {
    const config = {
        server: {
            baseDir: './dist/igniteui-angular/docs/typescript'
        },
        port: 3000
    }

    browserSync.init(config);

    cb();
}

function typedocWatchFunc(cb) {
    gulp.watch([
        slash(path.join(TYPEDOC_THEME.SRC, 'assets', 'js', 'src', '/**/*.{ts,js}')),
        slash(path.join(TYPEDOC_THEME.SRC, 'assets', 'css', '/**/*.{scss,sass}')),
        slash(path.join(TYPEDOC_THEME.SRC, '/**/*.hbs')),
        slash(path.join(TYPEDOC_THEME.SRC, 'assets', 'images', '/**/*.{png,jpg,gif}')),
      ], series(typedocGulp.typedocBuild, typedocBuildTheme, browserReload));

      cb();
}
// typedocWatch.displayName = 'typedoc-watch';

module.exports.typedocServe = series(
    typedocGulp.typedocBuild,
    typedocBuildTheme,
    typedocWatchFunc,
    typedocServe);

gulp.task('sassdoc-build', sassdocGulp.sassdocBuild);

// const DOCS_OUTPUT_PATH = path.join(__dirname, 'dist', 'igniteui-angular', 'docs');

const TYPEDOC = {
    EXPORT_JSON_PATH: path.join('dist', 'igniteui-angular', 'docs', 'typescript-exported'),
    PROJECT_PATH: path.join(__dirname, 'projects', 'igniteui-angular', 'src'),
    TEMPLATE_STRINGS_PATH: path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json')
}

// gulp.task('typedoc-build:theme', ['typedoc-build'],
//     shell.task(`typedoc ${TYPEDOC.PROJECT_PATH}`)
// );

// gulp.task('typedoc-build:export',
//     shell.task(`typedoc ${TYPEDOC.PROJECT_PATH} --generate-json ${TYPEDOC.EXPORT_JSON_PATH} --tags --params`)
// );

// gulp.task('typedoc-build:import', ['typedoc-build'],
//     shell.task(`typedoc ${TYPEDOC.PROJECT_PATH} --generate-from-json ${TYPEDOC.EXPORT_JSON_PATH}`)
// );

// gulp.task('create:docs-output-path', () => {
//     !fs.existsSync(DOCS_OUTPUT_PATH) && fs.mkdirSync(DOCS_OUTPUT_PATH);
// });

// gulp.task('typedoc:clean-docs-dir', () => {
//     del.sync(`${DOCS_OUTPUT_PATH}typescript`)
// });

// gulp.task('typedoc-build:doc:ja:localization', ['typedoc-build', 'create:docs-output-path', 'typedoc:clean-docs-dir'],
//     shell.task(`typedoc ${TYPEDOC.PROJECT_PATH} --generate-from-json ${path.join(__dirname, 'i18nRepo', 'typedoc', 'ja')} --templateStrings ${TYPEDOC.TEMPLATE_STRINGS_PATH} --localize jp`)
// );

// gulp.task('typedoc-build:doc:en:localization', ['typedoc-build', 'create:docs-output-path', 'typedoc:clean-docs-dir'],
//     shell.task(`typedoc ${TYPEDOC.PROJECT_PATH} --localize en`)
// );

const SASSDOC = {
    PROJECT_PATH: path.join(__dirname, 'projects', 'igniteui-angular', 'src', 'lib', 'core', 'styles'),
    DEST: path.join(__dirname, 'dist', 'igniteui-angular', 'docs', 'sass'),
    OPTIONS: path.join(__dirname, '.sassdocrc'),
}

const sassdocCleanOutputDir = (cb) => {
    del.sync(SASSDOC.DEST);
    cb();
};

module.exports.sassdocDevMode = sassdocGulp.develop;

module.exports.sassdocBuildJson = (cb) => {
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    const { convert, exportDir } = argv;

    options.convert = convert;
    options.exportDir = exportDir;

    gulp.src(`${SASSDOC.PROJECT_PATH}/**/*.scss`)
        .pipe(sassdoc(options));

    cb();

}

module.exports.sassdocImportJson = (cb) => {
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    const {render, importDir} = argv;

    options.render = render;
    options.json_dir = importDir;
    options.shellStringsPath = path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json');

    gulp.src(`${SASSDOC.PROJECT_PATH}/**/*.scss`)
        .pipe(sassdoc(options));

    cb();
}

module.exports.sassdocBuildJA = series(sassdocCleanOutputDir, sassdocGulp.sassdocBuild, (cb) => {
    const pathTranslations = path.join(__dirname, 'i18nRepo', 'sassdoc', 'ja');
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    options.lang = 'jp';
    options.render = argv.render;
    options.json_dir = pathTranslations;
    options.shellStringsPath = path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json');

    gulp.src(`${SASSDOC.PROJECT_PATH}/**/*.scss`)
        .pipe(sassdoc(options));

    cb();
});

module.exports.sassdocBuildEN = series(sassdocCleanOutputDir, sassdocGulp.sassdocBuild, (cb) => {
    const options = JSON.parse(fs.readFileSync(SASSDOC.OPTIONS, 'utf8'));

    options.lang = 'en';
    options.shellStringsPath = path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json');

    gulp.src(`${SASSDOC.PROJECT_PATH}/**/*.scss`)
        .pipe(sassdoc(options));

    cb();
});

// gulp.task('typedoc-serve', ['typedoc-watch'], () => {
//     browserSync.init({
//         server: './dist/igniteui-angular/docs/typescript'
//     });

//     gulp.watch('./dist/igniteui-angular/docs/typescript/**/*')
//         .on('change', browserSync.reload);
// });
