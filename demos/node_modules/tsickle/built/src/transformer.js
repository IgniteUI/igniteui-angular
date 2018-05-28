"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var source_map_1 = require("source-map");
var ts = require("typescript");
var decorator = require("./decorator-annotator");
var es5processor = require("./es5processor");
var modules_manifest_1 = require("./modules_manifest");
var source_map_utils_1 = require("./source_map_utils");
var transformer_sourcemap_1 = require("./transformer_sourcemap");
var transformer_util_1 = require("./transformer_util");
var tsickle = require("./tsickle");
function mergeEmitResults(emitResults) {
    var diagnostics = [];
    var emitSkipped = true;
    var emittedFiles = [];
    var externs = {};
    var modulesManifest = new modules_manifest_1.ModulesManifest();
    for (var _i = 0, emitResults_1 = emitResults; _i < emitResults_1.length; _i++) {
        var er = emitResults_1[_i];
        diagnostics.push.apply(diagnostics, er.diagnostics);
        emitSkipped = emitSkipped || er.emitSkipped;
        emittedFiles.push.apply(emittedFiles, er.emittedFiles);
        Object.assign(externs, er.externs);
        modulesManifest.addManifest(er.modulesManifest);
    }
    return { diagnostics: diagnostics, emitSkipped: emitSkipped, emittedFiles: emittedFiles, externs: externs, modulesManifest: modulesManifest };
}
exports.mergeEmitResults = mergeEmitResults;
function emitWithTsickle(program, host, options, tsHost, tsOptions, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers) {
    var tsickleDiagnostics = [];
    var typeChecker = program.getTypeChecker();
    var beforeTsTransformers = [];
    // add tsickle transformers
    if (options.transformTypesToClosure) {
        // Note: tsickle.annotate can also lower decorators in the same run.
        beforeTsTransformers.push(transformer_sourcemap_1.createTransformerFromSourceMap(function (sourceFile, sourceMapper) {
            var tisckleOptions = __assign({}, options, { filterTypesForExport: true });
            var _a = tsickle.annotate(typeChecker, sourceFile, host, tisckleOptions, tsHost, tsOptions, sourceMapper, tsickle.AnnotatorFeatures.Transformer), output = _a.output, diagnostics = _a.diagnostics;
            tsickleDiagnostics.push.apply(tsickleDiagnostics, diagnostics);
            return output;
        }));
    }
    else if (options.transformDecorators) {
        beforeTsTransformers.push(transformer_sourcemap_1.createTransformerFromSourceMap(function (sourceFile, sourceMapper) {
            var _a = decorator.convertDecorators(typeChecker, sourceFile, sourceMapper), output = _a.output, diagnostics = _a.diagnostics;
            tsickleDiagnostics.push.apply(tsickleDiagnostics, diagnostics);
            return output;
        }));
    }
    // // For debugging: transformer that just emits the same text.
    // beforeTsTransformers.push(createTransformer(host, typeChecker, (sourceFile, sourceMapper) => {
    //   sourceMapper.addMapping(sourceFile, {position: 0, line: 0, column: 0}, {position: 0, line: 0,
    //   column: 0}, sourceFile.text.length); return sourceFile.text;
    // }));
    // add user supplied transformers
    var afterTsTransformers = [];
    if (customTransformers) {
        if (customTransformers.beforeTsickle) {
            beforeTsTransformers.unshift.apply(beforeTsTransformers, customTransformers.beforeTsickle);
        }
        if (customTransformers.beforeTs) {
            beforeTsTransformers.push.apply(beforeTsTransformers, customTransformers.beforeTs);
        }
        if (customTransformers.afterTs) {
            afterTsTransformers.push.apply(afterTsTransformers, customTransformers.afterTs);
        }
    }
    customTransformers = transformer_util_1.createCustomTransformers({
        before: beforeTsTransformers.map(function (tf) { return skipTransformForSourceFileIfNeeded(host, tf); }),
        after: afterTsTransformers.map(function (tf) { return skipTransformForSourceFileIfNeeded(host, tf); })
    });
    var writeFileDelegate = writeFile || tsHost.writeFile.bind(tsHost);
    var modulesManifest = new modules_manifest_1.ModulesManifest();
    var writeFileImpl = function (fileName, content, writeByteOrderMark, onError, sourceFiles) {
        if (path.extname(fileName) !== '.map') {
            if (tsOptions.inlineSourceMap) {
                content = combineInlineSourceMaps(program, fileName, content);
            }
            else {
                content = source_map_utils_1.removeInlineSourceMap(content);
            }
            content = es5processor.convertCommonJsToGoogModuleIfNeeded(host, options, modulesManifest, fileName, content);
        }
        else {
            content = combineSourceMaps(program, fileName, content);
        }
        writeFileDelegate(fileName, content, writeByteOrderMark, onError, sourceFiles);
    };
    var _a = program.emit(targetSourceFile, writeFileImpl, cancellationToken, emitOnlyDtsFiles, customTransformers), tsDiagnostics = _a.diagnostics, emitSkipped = _a.emitSkipped, emittedFiles = _a.emittedFiles;
    var externs = {};
    if (options.transformTypesToClosure) {
        var sourceFiles = targetSourceFile ? [targetSourceFile] : program.getSourceFiles();
        sourceFiles.forEach(function (sf) {
            if (tsickle.isDtsFileName(sf.fileName) && host.shouldSkipTsickleProcessing(sf.fileName)) {
                return;
            }
            var _a = tsickle.writeExterns(typeChecker, sf, host, options), output = _a.output, diagnostics = _a.diagnostics;
            if (output) {
                externs[sf.fileName] = output;
            }
            if (diagnostics) {
                tsickleDiagnostics.push.apply(tsickleDiagnostics, diagnostics);
            }
        });
    }
    // All diagnostics (including warnings) are treated as errors.
    // If the host decides to ignore warnings, just discard them.
    // Warnings include stuff like "don't use @type in your jsdoc"; tsickle
    // warns and then fixes up the code to be Closure-compatible anyway.
    tsickleDiagnostics = tsickleDiagnostics.filter(function (d) { return d.category === ts.DiagnosticCategory.Error ||
        !host.shouldIgnoreWarningsForPath(d.file.fileName); });
    return {
        modulesManifest: modulesManifest,
        emitSkipped: emitSkipped,
        emittedFiles: emittedFiles || [],
        diagnostics: tsDiagnostics.concat(tsickleDiagnostics),
        externs: externs
    };
}
exports.emitWithTsickle = emitWithTsickle;
function skipTransformForSourceFileIfNeeded(host, delegateFactory) {
    return function (context) {
        var delegate = delegateFactory(context);
        return function (sourceFile) {
            if (host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
                return sourceFile;
            }
            return delegate(sourceFile);
        };
    };
}
function combineInlineSourceMaps(program, filePath, compiledJsWithInlineSourceMap) {
    if (tsickle.isDtsFileName(filePath)) {
        return compiledJsWithInlineSourceMap;
    }
    var sourceMapJson = source_map_utils_1.extractInlineSourceMap(compiledJsWithInlineSourceMap);
    compiledJsWithInlineSourceMap = source_map_utils_1.removeInlineSourceMap(compiledJsWithInlineSourceMap);
    var composedSourceMap = combineSourceMaps(program, filePath, sourceMapJson);
    return source_map_utils_1.setInlineSourceMap(compiledJsWithInlineSourceMap, composedSourceMap);
}
function combineSourceMaps(program, filePath, tscSourceMapText) {
    var tscSourceMap = source_map_utils_1.parseSourceMap(tscSourceMapText);
    if (tscSourceMap.sourcesContent) {
        // strip incoming sourcemaps from the sources in the sourcemap
        // to reduce the size of the sourcemap.
        tscSourceMap.sourcesContent = tscSourceMap.sourcesContent.map(function (content) {
            if (source_map_utils_1.containsInlineSourceMap(content)) {
                content = source_map_utils_1.removeInlineSourceMap(content);
            }
            return content;
        });
    }
    var fileDir = path.dirname(filePath);
    var tscSourceMapGenerator;
    for (var _i = 0, _a = tscSourceMap.sources; _i < _a.length; _i++) {
        var sourceFileName = _a[_i];
        var sourceFile = program.getSourceFile(path.resolve(fileDir, sourceFileName));
        if (!sourceFile || !source_map_utils_1.containsInlineSourceMap(sourceFile.text)) {
            continue;
        }
        var preexistingSourceMapText = source_map_utils_1.extractInlineSourceMap(sourceFile.text);
        if (!tscSourceMapGenerator) {
            tscSourceMapGenerator = source_map_1.SourceMapGenerator.fromSourceMap(new source_map_1.SourceMapConsumer(tscSourceMap));
        }
        tscSourceMapGenerator.applySourceMap(new source_map_1.SourceMapConsumer(source_map_utils_1.parseSourceMap(preexistingSourceMapText, sourceFileName)));
    }
    return tscSourceMapGenerator ? tscSourceMapGenerator.toString() : tscSourceMapText;
}

//# sourceMappingURL=transformer.js.map
