// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    files: [
      { pattern: '../../node_modules/hammerjs/hammer.min.js', watched: false },
      { pattern: '../../node_modules/hammer-simulator/index.js', watched: false }
    ],
    plugins: [
        'karma-jasmine',
        'karma-chrome-launcher',
        'karma-spec-reporter',
        '@angular-devkit/build-angular/plugins/karma'
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false
      },
      tagPrefix: '#',
      skipTags: 'perf'
    },
    reporters: ['spec'],
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
    browsers: ['ChromeWithGC'],
    customLaunchers: {
        ChromeWithGC: {
            base: 'Chrome',
            flags: [
                '--js-flags="--expose-gc"',
                '--disable-backgrounding-occluded-windows', // don't throttle when window is fully hidden behind others
            ],
            debug: false
        }
    },
    singleRun: false
  });
};
