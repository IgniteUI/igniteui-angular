module.exports = function(config){
	config.set({

		basePath : '../',

		files : [
            // 1. Load libraries
            // IE required polyfills, in this exact order
            'node_modules/zone.js/dist/zone.js',
            'node_modules/zone.js/dist/long-stack-trace-zone.js',
            'node_modules/zone.js/dist/jasmine-patch.js',
      
            "node_modules/es6-shim/es6-shim.min.js",
            "node_modules/systemjs/dist/system-polyfills.js",

            "node_modules/angular2/bundles/angular2-polyfills.js",
            "node_modules/systemjs/dist/system.src.js",
            "node_modules/rxjs/bundles/Rx.js",
            "node_modules/angular2/bundles/angular2.dev.js",
            "node_modules/hammerjs/hammer.js",
            "node_modules/hammer-simulator/index.js",
            'tests/karma-test-shim.js',
            
            { pattern: 'node_modules/angular2/**/*.js', included: false, watched: false },
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
            'node_modules/angular2/**/*spec.js'
        ],

        // swap with singleRun to keep the runner active to debug errors
		// autoWatch : true,
        
		singleRun : true,

		frameworks: ['jasmine'],

		browsers : ['Chrome'],
        
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
	});
};
