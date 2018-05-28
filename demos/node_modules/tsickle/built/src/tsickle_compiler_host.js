"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var source_map_1 = require("source-map");
var ts = require("typescript");
var decorator_annotator_1 = require("./decorator-annotator");
var es5processor_1 = require("./es5processor");
var modules_manifest_1 = require("./modules_manifest");
var sourceMapUtils = require("./source_map_utils");
var tsickle = require("./tsickle");
var tsickle_1 = require("./tsickle");
/**
 * Tsickle can perform 2 different precompilation transforms - decorator downleveling
 * and closurization.  Both require tsc to have already type checked their
 * input, so they can't both be run in one call to tsc. If you only want one of
 * the transforms, you can specify it in the constructor, if you want both, you'll
 * have to specify it by calling reconfigureForRun() with the appropriate Pass.
 */
var Pass;
(function (Pass) {
    Pass[Pass["NONE"] = 0] = "NONE";
    /**
     * Note that we can do decorator downlevel and closurize in one pass,
     * so this should not be used anymore.
     */
    Pass[Pass["DECORATOR_DOWNLEVEL"] = 1] = "DECORATOR_DOWNLEVEL";
    /**
     * Note that we can do decorator downlevel and closurize in one pass,
     * so this should not be used anymore.
     */
    Pass[Pass["CLOSURIZE"] = 2] = "CLOSURIZE";
    Pass[Pass["DECORATOR_DOWNLEVEL_AND_CLOSURIZE"] = 3] = "DECORATOR_DOWNLEVEL_AND_CLOSURIZE";
})(Pass = exports.Pass || (exports.Pass = {}));
/**
 * TsickleCompilerHost does tsickle processing of input files, including
 * closure type annotation processing, decorator downleveling and
 * require -> googmodule rewriting.
 */
var TsickleCompilerHost = (function () {
    function TsickleCompilerHost(delegate, tscOptions, options, environment) {
        this.delegate = delegate;
        this.tscOptions = tscOptions;
        this.options = options;
        this.environment = environment;
        // The manifest of JS modules output by the compiler.
        this.modulesManifest = new modules_manifest_1.ModulesManifest();
        /** Error messages produced by tsickle, if any. */
        this.diagnostics = [];
        /** externs.js files produced by tsickle, if any. */
        this.externs = {};
        this.sourceFileToPreexistingSourceMap = new Map();
        this.preexistingSourceMaps = new Map();
        this.decoratorDownlevelSourceMaps = new Map();
        this.tsickleSourceMaps = new Map();
        if (options.logWarning && !environment.logWarning) {
            environment.logWarning = options.logWarning;
        }
        // ts.CompilerHost includes a bunch of optional methods.  If they're
        // present on the delegate host, we want to delegate them.
        if (this.delegate.getCancellationToken) {
            this.getCancellationToken = this.delegate.getCancellationToken.bind(this.delegate);
        }
        if (this.delegate.getDefaultLibLocation) {
            this.getDefaultLibLocation = this.delegate.getDefaultLibLocation.bind(this.delegate);
        }
        if (this.delegate.resolveModuleNames) {
            this.resolveModuleNames = this.delegate.resolveModuleNames.bind(this.delegate);
        }
        if (this.delegate.resolveTypeReferenceDirectives) {
            this.resolveTypeReferenceDirectives =
                this.delegate.resolveTypeReferenceDirectives.bind(this.delegate);
        }
        if (this.delegate.getEnvironmentVariable) {
            this.getEnvironmentVariable = this.delegate.getEnvironmentVariable.bind(this.delegate);
        }
        if (this.delegate.trace) {
            this.trace = this.delegate.trace.bind(this.delegate);
        }
        if (this.delegate.directoryExists) {
            this.directoryExists = this.delegate.directoryExists.bind(this.delegate);
        }
        if (this.delegate.realpath) {
            this.delegate.realpath = this.delegate.realpath.bind(this.delegate);
        }
    }
    /**
     * Tsickle can perform 2 kinds of precompilation source transforms - decorator
     * downleveling and closurization.  They can't be run in the same run of the
     * typescript compiler, because they both depend on type information that comes
     * from running the compiler.  We need to use the same compiler host to run both
     * so we have all the source map data when finally write out.  Thus if we want
     * to run both transforms, we call reconfigureForRun() between the calls to
     * ts.createProgram().
     */
    TsickleCompilerHost.prototype.reconfigureForRun = function (oldProgram, pass) {
        this.runConfiguration = { oldProgram: oldProgram, pass: pass };
        this.diagnostics = [];
    };
    TsickleCompilerHost.prototype.getSourceFile = function (fileName, languageVersion, onError) {
        if (this.runConfiguration === undefined || this.runConfiguration.pass === Pass.NONE) {
            var sourceFile_1 = this.delegate.getSourceFile(fileName, languageVersion, onError);
            return this.stripAndStoreExistingSourceMap(sourceFile_1);
        }
        var sourceFile = this.runConfiguration.oldProgram.getSourceFile(fileName);
        switch (this.runConfiguration.pass) {
            case Pass.DECORATOR_DOWNLEVEL:
                return this.downlevelDecorators(sourceFile, this.runConfiguration.oldProgram, fileName, languageVersion);
            case Pass.CLOSURIZE:
                return this.closurize(sourceFile, this.runConfiguration.oldProgram, fileName, languageVersion, 
                /* downlevelDecorators */ false);
            case Pass.DECORATOR_DOWNLEVEL_AND_CLOSURIZE:
                return this.closurize(sourceFile, this.runConfiguration.oldProgram, fileName, languageVersion, 
                /* downlevelDecorators */ true);
            default:
                throw new Error('tried to use TsickleCompilerHost with unknown pass enum');
        }
    };
    TsickleCompilerHost.prototype.writeFile = function (fileName, content, writeByteOrderMark, onError, sourceFiles) {
        if (path.extname(fileName) !== '.map') {
            if (!tsickle_1.isDtsFileName(fileName) && this.tscOptions.inlineSourceMap) {
                content = this.combineInlineSourceMaps(fileName, content);
            }
            content = this.convertCommonJsToGoogModule(fileName, content);
        }
        else {
            content = this.combineSourceMaps(fileName, content);
        }
        this.delegate.writeFile(fileName, content, writeByteOrderMark, onError, sourceFiles);
    };
    TsickleCompilerHost.prototype.getSourceMapKeyForPathAndName = function (outputFilePath, sourceFileName) {
        var fileDir = path.dirname(outputFilePath);
        return this.getCanonicalFileName(path.resolve(fileDir, sourceFileName));
    };
    TsickleCompilerHost.prototype.getSourceMapKeyForSourceFile = function (sourceFile) {
        return this.getCanonicalFileName(path.resolve(sourceFile.fileName));
    };
    TsickleCompilerHost.prototype.stripAndStoreExistingSourceMap = function (sourceFile) {
        // Because tsc doesn't have strict null checks, it can pass us an
        // undefined sourceFile, but we can't acknowledge that it does, because
        // we have to comply with their interface, which doesn't allow
        // undefined as far as we're concerned
        if (sourceFile && sourceMapUtils.containsInlineSourceMap(sourceFile.text)) {
            var sourceMapJson = sourceMapUtils.extractInlineSourceMap(sourceFile.text);
            var sourceMap_1 = sourceMapUtils.sourceMapTextToGenerator(sourceMapJson);
            var stripedSourceText = sourceMapUtils.removeInlineSourceMap(sourceFile.text);
            var stripedSourceFile = ts.createSourceFile(sourceFile.fileName, stripedSourceText, sourceFile.languageVersion);
            this.sourceFileToPreexistingSourceMap.set(stripedSourceFile, sourceMap_1);
            return stripedSourceFile;
        }
        return sourceFile;
    };
    TsickleCompilerHost.prototype.combineSourceMaps = function (filePath, tscSourceMapText) {
        var _this = this;
        var printDebugInfo = false;
        // const printDebugInfo = true;
        // We stripe inline source maps off source files before they've been parsed
        // which is before they have path properties, so we need to construct the
        // map of sourceMapKey to preexistingSourceMap after the whole program has been
        // loaded.
        if (this.sourceFileToPreexistingSourceMap.size > 0 && this.preexistingSourceMaps.size === 0) {
            this.sourceFileToPreexistingSourceMap.forEach(function (sourceMap, sourceFile) {
                var sourceMapKey = _this.getSourceMapKeyForSourceFile(sourceFile);
                _this.preexistingSourceMaps.set(sourceMapKey, sourceMap);
            });
        }
        var tscSourceMapConsumer = sourceMapUtils.sourceMapTextToConsumer(tscSourceMapText);
        var tscSourceMapGenerator = sourceMapUtils.sourceMapConsumerToGenerator(tscSourceMapConsumer);
        if (printDebugInfo) {
            console.error("tsc source map for " + filePath);
            console.error(tscSourceMapGenerator.toString());
        }
        if (this.tsickleSourceMaps.size > 0) {
            for (var _i = 0, _a = tscSourceMapConsumer.sources; _i < _a.length; _i++) {
                var sourceFileName = _a[_i];
                var sourceMapKey = this.getSourceMapKeyForPathAndName(filePath, sourceFileName);
                var tsickleSourceMapGenerator = this.tsickleSourceMaps.get(sourceMapKey);
                var tsickleSourceMapConsumer = sourceMapUtils.sourceMapGeneratorToConsumer(tsickleSourceMapGenerator, sourceFileName, sourceFileName);
                tscSourceMapGenerator.applySourceMap(tsickleSourceMapConsumer);
                if (printDebugInfo) {
                    console.error("tsickle source map for " + filePath);
                    console.error(tsickleSourceMapGenerator.toString());
                }
            }
        }
        if (this.decoratorDownlevelSourceMaps.size > 0) {
            for (var _b = 0, _c = tscSourceMapConsumer.sources; _b < _c.length; _b++) {
                var sourceFileName = _c[_b];
                var sourceMapKey = this.getSourceMapKeyForPathAndName(filePath, sourceFileName);
                var decoratorDownlevelSourceMapGenerator = this.decoratorDownlevelSourceMaps.get(sourceMapKey);
                var decoratorDownlevelSourceMapConsumer = sourceMapUtils.sourceMapGeneratorToConsumer(decoratorDownlevelSourceMapGenerator, sourceFileName, sourceFileName);
                tscSourceMapGenerator.applySourceMap(decoratorDownlevelSourceMapConsumer);
                if (printDebugInfo) {
                    console.error("decorator downlevel sourcemap for " + filePath);
                    console.error(decoratorDownlevelSourceMapGenerator.toString());
                }
            }
        }
        if (this.preexistingSourceMaps.size > 0) {
            for (var _d = 0, _e = tscSourceMapConsumer.sources; _d < _e.length; _d++) {
                var sourceFileName = _e[_d];
                var sourceMapKey = this.getSourceMapKeyForPathAndName(filePath, sourceFileName);
                var preexistingSourceMapGenerator = this.preexistingSourceMaps.get(sourceMapKey);
                if (preexistingSourceMapGenerator) {
                    var preexistingSourceMapConsumer = sourceMapUtils.sourceMapGeneratorToConsumer(preexistingSourceMapGenerator, sourceFileName);
                    tscSourceMapGenerator.applySourceMap(preexistingSourceMapConsumer);
                    if (printDebugInfo) {
                        console.error("preexisting source map for " + filePath);
                        console.error(preexistingSourceMapGenerator.toString());
                    }
                }
            }
        }
        return tscSourceMapGenerator.toString();
    };
    TsickleCompilerHost.prototype.combineInlineSourceMaps = function (filePath, compiledJsWithInlineSourceMap) {
        var sourceMapJson = sourceMapUtils.extractInlineSourceMap(compiledJsWithInlineSourceMap);
        var composedSourceMap = this.combineSourceMaps(filePath, sourceMapJson);
        return sourceMapUtils.setInlineSourceMap(compiledJsWithInlineSourceMap, composedSourceMap);
    };
    TsickleCompilerHost.prototype.convertCommonJsToGoogModule = function (fileName, content) {
        return es5processor_1.convertCommonJsToGoogModuleIfNeeded(this.environment, this.options, this.modulesManifest, fileName, content);
    };
    TsickleCompilerHost.prototype.downlevelDecorators = function (sourceFile, program, fileName, languageVersion) {
        this.decoratorDownlevelSourceMaps.set(this.getSourceMapKeyForSourceFile(sourceFile), new source_map_1.SourceMapGenerator());
        if (this.environment.shouldSkipTsickleProcessing(fileName))
            return sourceFile;
        var fileContent = sourceFile.text;
        var sourceMapper = new sourceMapUtils.DefaultSourceMapper(sourceFile.fileName);
        var converted = decorator_annotator_1.convertDecorators(program.getTypeChecker(), sourceFile, sourceMapper);
        if (converted.diagnostics) {
            (_a = this.diagnostics).push.apply(_a, converted.diagnostics);
        }
        if (converted.output === fileContent) {
            // No changes; reuse the existing parse.
            return sourceFile;
        }
        fileContent = converted.output;
        this.decoratorDownlevelSourceMaps.set(this.getSourceMapKeyForSourceFile(sourceFile), sourceMapper.sourceMap);
        return ts.createSourceFile(fileName, fileContent, languageVersion, true);
        var _a;
    };
    TsickleCompilerHost.prototype.closurize = function (sourceFile, program, fileName, languageVersion, downlevelDecorators) {
        this.tsickleSourceMaps.set(this.getSourceMapKeyForSourceFile(sourceFile), new source_map_1.SourceMapGenerator());
        var isDefinitions = tsickle_1.isDtsFileName(fileName);
        // Don't tsickle-process any d.ts that isn't a compilation target;
        // this means we don't process e.g. lib.d.ts.
        if (isDefinitions && this.environment.shouldSkipTsickleProcessing(fileName))
            return sourceFile;
        var sourceMapper = new sourceMapUtils.DefaultSourceMapper(sourceFile.fileName);
        var annotated = tsickle.annotate(program.getTypeChecker(), sourceFile, this.environment, this.options, this.delegate, this.tscOptions, sourceMapper, downlevelDecorators ? tsickle.AnnotatorFeatures.LowerDecorators :
            tsickle.AnnotatorFeatures.Default);
        var externs = tsickle.writeExterns(program.getTypeChecker(), sourceFile, this.environment, this.options);
        var diagnostics = externs.diagnostics.concat(annotated.diagnostics);
        if (externs) {
            this.externs[fileName] = externs.output;
        }
        if (this.environment.shouldIgnoreWarningsForPath(sourceFile.fileName)) {
            // All diagnostics (including warnings) are treated as errors.
            // If we've decided to ignore them, just discard them.
            // Warnings include stuff like "don't use @type in your jsdoc"; tsickle
            // warns and then fixes up the code to be Closure-compatible anyway.
            diagnostics = diagnostics.filter(function (d) { return d.category === ts.DiagnosticCategory.Error; });
        }
        (_a = this.diagnostics).push.apply(_a, diagnostics);
        this.tsickleSourceMaps.set(this.getSourceMapKeyForSourceFile(sourceFile), sourceMapper.sourceMap);
        return ts.createSourceFile(fileName, annotated.output, languageVersion, true);
        var _a;
    };
    /** Concatenate all generated externs definitions together into a string. */
    TsickleCompilerHost.prototype.getGeneratedExterns = function () {
        return tsickle.getGeneratedExterns(this.externs);
    };
    // Delegate everything else to the original compiler host.
    TsickleCompilerHost.prototype.fileExists = function (fileName) {
        return this.delegate.fileExists(fileName);
    };
    TsickleCompilerHost.prototype.getCurrentDirectory = function () {
        return this.delegate.getCurrentDirectory();
    };
    TsickleCompilerHost.prototype.useCaseSensitiveFileNames = function () {
        return this.delegate.useCaseSensitiveFileNames();
    };
    TsickleCompilerHost.prototype.getNewLine = function () {
        return this.delegate.getNewLine();
    };
    TsickleCompilerHost.prototype.getDirectories = function (path) {
        return this.delegate.getDirectories(path);
    };
    TsickleCompilerHost.prototype.readFile = function (fileName) {
        return this.delegate.readFile(fileName);
    };
    TsickleCompilerHost.prototype.getDefaultLibFileName = function (options) {
        return this.delegate.getDefaultLibFileName(options);
    };
    TsickleCompilerHost.prototype.getCanonicalFileName = function (fileName) {
        return this.delegate.getCanonicalFileName(fileName);
    };
    return TsickleCompilerHost;
}());
exports.TsickleCompilerHost = TsickleCompilerHost;

//# sourceMappingURL=tsickle_compiler_host.js.map
