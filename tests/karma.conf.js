module.exports = function(config){
    var options = {
        
		basePath : '../',

		files : [
            // System.js for module loading
            'node_modules/systemjs/dist/system-polyfills.js',
            'node_modules/systemjs/dist/system.src.js',

            // Polyfills
            'node_modules/core-js/client/shim.min.js',

            // Reflect and Zone.js
            'node_modules/reflect-metadata/Reflect.js',
            'node_modules/zone.js/dist/zone.js',
            'node_modules/zone.js/dist/jasmine-patch.js',
            'node_modules/zone.js/dist/async-test.js',
            'node_modules/zone.js/dist/fake-async-test.js',
            
            // RxJS bundle
            "node_modules/rxjs/bundles/Rx.js",
            
            // Hammer
            "node_modules/hammerjs/hammer.js",
            "node_modules/hammer-simulator/index.js",
            
            {pattern: 'tests/systemjs.config.js', included: false, watched: false},
            'tests/karma-test-shim.js',
            
            { pattern: 'node_modules/@angular/**/*.js', included: false, watched: false },
            { pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false },
            { pattern: 'src/**/*', included: false, watched: false },
            { pattern: 'dist/zero-blocks.css'},
			//'src/navigation-drawer.js',
			//'tests/unit/utils.js',
            
            // spec files need to be loaded in the shim file IN CONTEXT of the main module, don't include:            
            { pattern: 'tests/unit/**/*.js', included: false, watched: true },
            
		],
            
        // list of files to exclude
        exclude: [
            'node_modules/@angular/**/*spec.js'
        ],

        // swap with singleRun to keep the runner active to debug errors
		// autoWatch : true,
        
		singleRun : true,

		frameworks: ['jasmine'],

		browsers : ['Chrome'],
        
        customLaunchers: {
            Chrome_travis_ci: {
                    base: "Chrome",
                    flags: ["--no-sandbox"]
            }
        },
        
        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'src/**/*.js': ['coverage']
        },
    
        reporters: ['mocha', 'coverage'],

		plugins : [
                    'karma-chrome-launcher',
                    'karma-jasmine',
                    'karma-mocha-reporter',
                    'karma-coverage'
                    // ,
                    // 'karma-junit-reporter'
                    ],

		/*junitReporter : {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}*/
        
        coverageReporter: {
            // specify a common output directory
            dir: 'coverage',
            reporters: [
                // reporters not supporting the `file` property
                { type: 'html', subdir: 'report-html' },
                { type: 'lcov', subdir: 'report-lcov' }
            ]
        }
	};
    
    if (process.env.TRAVIS) {
        options.browsers = ["Chrome_travis_ci"];
    }
    
	config.set(options);
};
