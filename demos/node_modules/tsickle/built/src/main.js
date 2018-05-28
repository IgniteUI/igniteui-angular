#!/usr/bin/env node
"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var minimist = require("minimist");
var mkdirp = require("mkdirp");
var path = require("path");
var ts = require("typescript");
var cliSupport = require("./cli_support");
var tsickle = require("./tsickle");
var tsickle_1 = require("./tsickle");
function usage() {
    console.error("usage: tsickle [tsickle options] -- [tsc options]\n\nexample:\n  tsickle --externs=foo/externs.js -- -p src --noImplicitAny\n\ntsickle flags are:\n  --externs=PATH     save generated Closure externs.js to PATH\n  --typed            [experimental] attempt to provide Closure types instead of {?}\n");
}
/**
 * Parses the command-line arguments, extracting the tsickle settings and
 * the arguments to pass on to tsc.
 */
function loadSettingsFromArgs(args) {
    var settings = {};
    var parsedArgs = minimist(args);
    try {
        for (var _a = __values(Object.keys(parsedArgs)), _b = _a.next(); !_b.done; _b = _a.next()) {
            var flag = _b.value;
            switch (flag) {
                case 'h':
                case 'help':
                    usage();
                    process.exit(0);
                    break;
                case 'externs':
                    settings.externsPath = parsedArgs[flag];
                    break;
                case 'typed':
                    settings.isTyped = true;
                    break;
                case 'verbose':
                    settings.verbose = true;
                    break;
                case '_':
                    // This is part of the minimist API, and holds args after the '--'.
                    break;
                default:
                    console.error("unknown flag '--" + flag + "'");
                    usage();
                    process.exit(1);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    // Arguments after the '--' arg are arguments to tsc.
    var tscArgs = parsedArgs['_'];
    return { settings: settings, tscArgs: tscArgs };
    var e_1, _c;
}
/**
 * Loads the tsconfig.json from a directory.
 *
 * TODO(martinprobst): use ts.findConfigFile to match tsc behaviour.
 *
 * @param args tsc command-line arguments.
 */
function loadTscConfig(args) {
    // Gather tsc options/input files from command line.
    var _a = ts.parseCommandLine(args), options = _a.options, fileNames = _a.fileNames, errors = _a.errors;
    if (errors.length > 0) {
        return { options: {}, fileNames: [], errors: errors };
    }
    // Store file arguments
    var tsFileArguments = fileNames;
    // Read further settings from tsconfig.json.
    var projectDir = options.project || '.';
    var configFileName = path.join(projectDir, 'tsconfig.json');
    var _b = ts.readConfigFile(configFileName, function (path) { return fs.readFileSync(path, 'utf-8'); }), json = _b.config, error = _b.error;
    if (error) {
        return { options: {}, fileNames: [], errors: [error] };
    }
    (_c = ts.parseJsonConfigFileContent(json, ts.sys, projectDir, options, configFileName), options = _c.options, fileNames = _c.fileNames, errors = _c.errors);
    if (errors.length > 0) {
        return { options: {}, fileNames: [], errors: errors };
    }
    // if file arguments were given to the typescript transpiler then transpile only those files
    fileNames = tsFileArguments.length > 0 ? tsFileArguments : fileNames;
    return { options: options, fileNames: fileNames, errors: [] };
    var _c;
}
/**
 * Compiles TypeScript code into Closure-compiler-ready JS.
 */
function toClosureJS(options, fileNames, settings, writeFile) {
    var compilerHost = ts.createCompilerHost(options);
    var program = ts.createProgram(fileNames, options, compilerHost);
    var transformerHost = {
        shouldSkipTsickleProcessing: function (fileName) {
            return fileNames.indexOf(fileName) === -1;
        },
        shouldIgnoreWarningsForPath: function (fileName) { return false; },
        pathToModuleName: cliSupport.pathToModuleName,
        fileNameToModuleId: function (fileName) { return fileName; },
        es5Mode: true,
        googmodule: true,
        prelude: '',
        transformDecorators: true,
        transformTypesToClosure: true,
        typeBlackListPaths: new Set(),
        untyped: false,
        logWarning: function (warning) { return console.error(tsickle.formatDiagnostics([warning])); },
    };
    var diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length > 0) {
        return {
            diagnostics: diagnostics,
            modulesManifest: new tsickle_1.ModulesManifest(),
            externs: {},
            emitSkipped: true,
            emittedFiles: [],
        };
    }
    return tsickle.emitWithTsickle(program, transformerHost, compilerHost, options, undefined, writeFile);
}
exports.toClosureJS = toClosureJS;
function main(args) {
    var _a = loadSettingsFromArgs(args), settings = _a.settings, tscArgs = _a.tscArgs;
    var config = loadTscConfig(tscArgs);
    if (config.errors.length) {
        console.error(tsickle.formatDiagnostics(config.errors));
        return 1;
    }
    if (config.options.module !== ts.ModuleKind.CommonJS) {
        // This is not an upstream TypeScript diagnostic, therefore it does not go
        // through the diagnostics array mechanism.
        console.error('tsickle converts TypeScript modules to Closure modules via CommonJS internally. ' +
            'Set tsconfig.js "module": "commonjs"');
        return 1;
    }
    // Run tsickle+TSC to convert inputs to Closure JS files.
    var result = toClosureJS(config.options, config.fileNames, settings, function (filePath, contents) {
        mkdirp.sync(path.dirname(filePath));
        fs.writeFileSync(filePath, contents, { encoding: 'utf-8' });
    });
    if (result.diagnostics.length) {
        console.error(tsickle.formatDiagnostics(result.diagnostics));
        return 1;
    }
    if (settings.externsPath) {
        mkdirp.sync(path.dirname(settings.externsPath));
        fs.writeFileSync(settings.externsPath, tsickle.getGeneratedExterns(result.externs));
    }
    return 0;
}
// CLI entry point
if (require.main === module) {
    process.exit(main(process.argv.splice(2)));
}

//# sourceMappingURL=main.js.map
