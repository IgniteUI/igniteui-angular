// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'jasmine-spec-tags', '@angular-devkit/build-angular'],
    files: [
      { pattern: '../../node_modules/hammerjs/hammer.min.js', watched: false },
      { pattern: '../../node_modules/hammer-simulator/index.js', watched: false },
      { pattern: './test.css', watched: false },
      { pattern: '../../dist/igniteui-angular/styles/igniteui-angular.css', watched: false }
    ],
    plugins: [
      require('karma-jasmine'),
      require('karma-coverage'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-spec-tags'),
      require('karma-jasmine-html-reporter'),
      require('karma-spec-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    /*parallelOptions: {
      executors: 2,
      shardStrategy: 'round-robin'
    },*/
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false
      },
      tagPrefix: '#',
      tags: 'pivotGrid'
    },
    preprocessors: {
      'projects/igniteui-angular/**/*.js': ['coverage']
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../../coverage/grid'),
      reporters: [
        // reporters not supporting the `file` property
        { type: 'html' },
        { type: 'json' },
        { type: 'lcovonly' },
      ]
    },
    reporters: ['progress', 'coverage'],
    specReporter: {
        suppressSkipped: true,
        suppressErrorSummary: false,
        suppressFailed: false,
        suppressPassed: false,
        showSpecTiming: false,
        failFast: false
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    captureTimeout: 180000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 5,
    browserNoActivityTimeout: 100000,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
        debug: false
      }
    },
    singleRun: false
  });
};
