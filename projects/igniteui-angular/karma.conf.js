// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: [/*'parallel', */'jasmine', '@angular-devkit/build-angular'],
    files: [
      { pattern: '../../node_modules/hammerjs/hammer.min.js', watched: false },
      { pattern: '../../node_modules/hammer-simulator/index.js', watched: false },
      { pattern: './test.css', watched: false },
      { pattern: '../../dist/igniteui-angular/styles/igniteui-angular.css', watched: false }
    ],
    plugins: [
      //'karma-parallel',
      'karma-jasmine',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-spec-reporter',
      '@angular-devkit/build-angular/plugins/karma'
    ],
    // parallelOptions: {
    //   executors: 2,
    //   shardStrategy: 'round-robin'
    // },
    client: {
      //clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false
      },
      tagPrefix: '#',
      skipTags: 'perf'
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../../coverage'),
      subdir: '.',
      reporters: [
        // reporters not supporting the `file` property
        { type: 'lcov' },
      ]
    },
    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    browserDisconnectTimeout: 4000,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
        debug: false
      }
    },
    singleRun: false
  });
};
