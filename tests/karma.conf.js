module.exports = function(config){
	config.set({

		basePath : '../',

		files : [
            // 1. Load libraries
            // IE required polyfills, in this exact order
            "node_modules/es6-shim/es6-shim.min.js",
            "node_modules/systemjs/dist/system-polyfills.js",

            "node_modules/angular2/bundles/angular2-polyfills.js",
            "node_modules/systemjs/dist/system.src.js",
            "node_modules/rxjs/bundles/Rx.js",
            "node_modules/angular2/bundles/angular2.dev.js",
            'tests/karma-test-shim.js',
            
            { pattern: 'node_modules/angular2/**/*.js', included: false, watched: false },
            { pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false },
            { pattern: 'src/**/*', included: false, watched: false },
			//'src/navigation-drawer.js',
			//'tests/unit/utils.js',
            
            // spec files need to be loaded in the shim file IN CONTEXT of the main module, don't include:            
            { pattern: 'tests/unit/**/*.js', included: false, watched: true },
            
		],
            
        // list of files to exclude
        exclude: [
            'node_modules/angular2/**/*spec.js'
        ],

		autoWatch : true,

		frameworks: ['jasmine'],

		browsers : ['Chrome'],

		plugins : [
                    'karma-chrome-launcher',
                    'karma-jasmine'
                    // ,
                    // 'karma-junit-reporter'
                    ],

		/*junitReporter : {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}*/

	});
};
