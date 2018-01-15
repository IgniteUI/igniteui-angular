import { ConfigOptions } from "karma";
import webpackTestConfig from "./webpack-test.config";

export default (config) => {
    config.set({
        basePath: "",

        frameworks: ["jasmine"],

        files: [
            "./dist/igniteui-angular.css",
            {
                pattern: "./dist/fonts/*",
                watched: false,
                included: false,
                served: true,
                nocache: false
            },
            "./node_modules/hammerjs/hammer.js",
            "./node_modules/hammer-simulator/index.js",
            "karma-test-entry.ts"
        ],

        preprocessors: {
            "karma-test-entry.ts": ["webpack", "sourcemap"]
        },

        webpack: webpackTestConfig,

        webpackMiddleware: {
            noInfo: true,
            stats: {
                chunks: false
            }
        },

        mime: {
            "text/x-typescript": ["ts"]
        },

        coverageIstanbulReporter: {
            reports: ["text-summary", "html", "lcovonly"],
            fixWebpackSourcePaths: true
        },

        reporters: ["mocha", "coverage-istanbul"],

        logLevel: config.LOG_WARN,

        browsers: ["Chrome"],

        browserConsoleLogOptions: {
            terminal: true,
            level: "log"
        },

        singleRun: true,
        colors: true
    } as ConfigOptions);
};
