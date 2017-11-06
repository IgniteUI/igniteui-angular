const gulp = require('gulp');
const copyfiles = require('copyfiles');

const LIBRARY_SRC = '../dist/**/*';
const LIBRARY_DIST = 'lib';

gulp.task('copy-lib', (cb) => {
    copyfiles([LIBRARY_SRC, LIBRARY_DIST], 2 ,cb);
});

gulp.task('copy-lib:watch', () => {
    gulp.watch(LIBRARY_SRC, ['copy-lib']);
});
