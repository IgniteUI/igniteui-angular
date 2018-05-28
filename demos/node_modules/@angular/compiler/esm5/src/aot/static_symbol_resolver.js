/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { ValueTransformer, visitValue } from '../util';
import { StaticSymbol } from './static_symbol';
import { isGeneratedFile, stripSummaryForJitFileSuffix, stripSummaryForJitNameSuffix, summaryForJitFileName, summaryForJitName } from './util';
var DTS = /\.d\.ts$/;
var TS = /^(?!.*\.d\.ts$).*\.ts$/;
var ResolvedStaticSymbol = /** @class */ (function () {
    function ResolvedStaticSymbol(symbol, metadata) {
        this.symbol = symbol;
        this.metadata = metadata;
    }
    return ResolvedStaticSymbol;
}());
export { ResolvedStaticSymbol };
var SUPPORTED_SCHEMA_VERSION = 4;
/**
 * This class is responsible for loading metadata per symbol,
 * and normalizing references between symbols.
 *
 * Internally, it only uses symbols without members,
 * and deduces the values for symbols with members based
 * on these symbols.
 */
var StaticSymbolResolver = /** @class */ (function () {
    function StaticSymbolResolver(host, staticSymbolCache, summaryResolver, errorRecorder) {
        this.host = host;
        this.staticSymbolCache = staticSymbolCache;
        this.summaryResolver = summaryResolver;
        this.errorRecorder = errorRecorder;
        this.metadataCache = new Map();
        // Note: this will only contain StaticSymbols without members!
        this.resolvedSymbols = new Map();
        this.resolvedFilePaths = new Set();
        // Note: this will only contain StaticSymbols without members!
        this.importAs = new Map();
        this.symbolResourcePaths = new Map();
        this.symbolFromFile = new Map();
        this.knownFileNameToModuleNames = new Map();
    }
    StaticSymbolResolver.prototype.resolveSymbol = function (staticSymbol) {
        if (staticSymbol.members.length > 0) {
            return this._resolveSymbolMembers(staticSymbol);
        }
        // Note: always ask for a summary first,
        // as we might have read shallow metadata via a .d.ts file
        // for the symbol.
        var resultFromSummary = this._resolveSymbolFromSummary(staticSymbol);
        if (resultFromSummary) {
            return resultFromSummary;
        }
        var resultFromCache = this.resolvedSymbols.get(staticSymbol);
        if (resultFromCache) {
            return resultFromCache;
        }
        // Note: Some users use libraries that were not compiled with ngc, i.e. they don't
        // have summaries, only .d.ts files. So we always need to check both, the summary
        // and metadata.
        this._createSymbolsOf(staticSymbol.filePath);
        return this.resolvedSymbols.get(staticSymbol);
    };
    /**
     * getImportAs produces a symbol that can be used to import the given symbol.
     * The import might be different than the symbol if the symbol is exported from
     * a library with a summary; in which case we want to import the symbol from the
     * ngfactory re-export instead of directly to avoid introducing a direct dependency
     * on an otherwise indirect dependency.
     *
     * @param staticSymbol the symbol for which to generate a import symbol
     */
    StaticSymbolResolver.prototype.getImportAs = function (staticSymbol, useSummaries) {
        if (useSummaries === void 0) { useSummaries = true; }
        if (staticSymbol.members.length) {
            var baseSymbol = this.getStaticSymbol(staticSymbol.filePath, staticSymbol.name);
            var baseImportAs = this.getImportAs(baseSymbol, useSummaries);
            return baseImportAs ?
                this.getStaticSymbol(baseImportAs.filePath, baseImportAs.name, staticSymbol.members) :
                null;
        }
        var summarizedFileName = stripSummaryForJitFileSuffix(staticSymbol.filePath);
        if (summarizedFileName !== staticSymbol.filePath) {
            var summarizedName = stripSummaryForJitNameSuffix(staticSymbol.name);
            var baseSymbol = this.getStaticSymbol(summarizedFileName, summarizedName, staticSymbol.members);
            var baseImportAs = this.getImportAs(baseSymbol, useSummaries);
            return baseImportAs ?
                this.getStaticSymbol(summaryForJitFileName(baseImportAs.filePath), summaryForJitName(baseImportAs.name), baseSymbol.members) :
                null;
        }
        var result = (useSummaries && this.summaryResolver.getImportAs(staticSymbol)) || null;
        if (!result) {
            result = this.importAs.get(staticSymbol);
        }
        return result;
    };
    /**
     * getResourcePath produces the path to the original location of the symbol and should
     * be used to determine the relative location of resource references recorded in
     * symbol metadata.
     */
    StaticSymbolResolver.prototype.getResourcePath = function (staticSymbol) {
        return this.symbolResourcePaths.get(staticSymbol) || staticSymbol.filePath;
    };
    /**
     * getTypeArity returns the number of generic type parameters the given symbol
     * has. If the symbol is not a type the result is null.
     */
    StaticSymbolResolver.prototype.getTypeArity = function (staticSymbol) {
        // If the file is a factory/ngsummary file, don't resolve the symbol as doing so would
        // cause the metadata for an factory/ngsummary file to be loaded which doesn't exist.
        // All references to generated classes must include the correct arity whenever
        // generating code.
        if (isGeneratedFile(staticSymbol.filePath)) {
            return null;
        }
        var resolvedSymbol = unwrapResolvedMetadata(this.resolveSymbol(staticSymbol));
        while (resolvedSymbol && resolvedSymbol.metadata instanceof StaticSymbol) {
            resolvedSymbol = unwrapResolvedMetadata(this.resolveSymbol(resolvedSymbol.metadata));
        }
        return (resolvedSymbol && resolvedSymbol.metadata && resolvedSymbol.metadata.arity) || null;
    };
    StaticSymbolResolver.prototype.getKnownModuleName = function (filePath) {
        return this.knownFileNameToModuleNames.get(filePath) || null;
    };
    StaticSymbolResolver.prototype.recordImportAs = function (sourceSymbol, targetSymbol) {
        sourceSymbol.assertNoMembers();
        targetSymbol.assertNoMembers();
        this.importAs.set(sourceSymbol, targetSymbol);
    };
    StaticSymbolResolver.prototype.recordModuleNameForFileName = function (fileName, moduleName) {
        this.knownFileNameToModuleNames.set(fileName, moduleName);
    };
    /**
     * Invalidate all information derived from the given file.
     *
     * @param fileName the file to invalidate
     */
    StaticSymbolResolver.prototype.invalidateFile = function (fileName) {
        this.metadataCache.delete(fileName);
        this.resolvedFilePaths.delete(fileName);
        var symbols = this.symbolFromFile.get(fileName);
        if (symbols) {
            this.symbolFromFile.delete(fileName);
            try {
                for (var symbols_1 = tslib_1.__values(symbols), symbols_1_1 = symbols_1.next(); !symbols_1_1.done; symbols_1_1 = symbols_1.next()) {
                    var symbol = symbols_1_1.value;
                    this.resolvedSymbols.delete(symbol);
                    this.importAs.delete(symbol);
                    this.symbolResourcePaths.delete(symbol);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (symbols_1_1 && !symbols_1_1.done && (_a = symbols_1.return)) _a.call(symbols_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        var e_1, _a;
    };
    /* @internal */
    StaticSymbolResolver.prototype.ignoreErrorsFor = function (cb) {
        var recorder = this.errorRecorder;
        this.errorRecorder = function () { };
        try {
            return cb();
        }
        finally {
            this.errorRecorder = recorder;
        }
    };
    StaticSymbolResolver.prototype._resolveSymbolMembers = function (staticSymbol) {
        var members = staticSymbol.members;
        var baseResolvedSymbol = this.resolveSymbol(this.getStaticSymbol(staticSymbol.filePath, staticSymbol.name));
        if (!baseResolvedSymbol) {
            return null;
        }
        var baseMetadata = unwrapResolvedMetadata(baseResolvedSymbol.metadata);
        if (baseMetadata instanceof StaticSymbol) {
            return new ResolvedStaticSymbol(staticSymbol, this.getStaticSymbol(baseMetadata.filePath, baseMetadata.name, members));
        }
        else if (baseMetadata && baseMetadata.__symbolic === 'class') {
            if (baseMetadata.statics && members.length === 1) {
                return new ResolvedStaticSymbol(staticSymbol, baseMetadata.statics[members[0]]);
            }
        }
        else {
            var value = baseMetadata;
            for (var i = 0; i < members.length && value; i++) {
                value = value[members[i]];
            }
            return new ResolvedStaticSymbol(staticSymbol, value);
        }
        return null;
    };
    StaticSymbolResolver.prototype._resolveSymbolFromSummary = function (staticSymbol) {
        var summary = this.summaryResolver.resolveSummary(staticSymbol);
        return summary ? new ResolvedStaticSymbol(staticSymbol, summary.metadata) : null;
    };
    /**
     * getStaticSymbol produces a Type whose metadata is known but whose implementation is not loaded.
     * All types passed to the StaticResolver should be pseudo-types returned by this method.
     *
     * @param declarationFile the absolute path of the file where the symbol is declared
     * @param name the name of the type.
     * @param members a symbol for a static member of the named type
     */
    StaticSymbolResolver.prototype.getStaticSymbol = function (declarationFile, name, members) {
        return this.staticSymbolCache.get(declarationFile, name, members);
    };
    /**
     * hasDecorators checks a file's metadata for the presence of decorators without evaluating the
     * metadata.
     *
     * @param filePath the absolute path to examine for decorators.
     * @returns true if any class in the file has a decorator.
     */
    StaticSymbolResolver.prototype.hasDecorators = function (filePath) {
        var metadata = this.getModuleMetadata(filePath);
        if (metadata['metadata']) {
            return Object.keys(metadata['metadata']).some(function (metadataKey) {
                var entry = metadata['metadata'][metadataKey];
                return entry && entry.__symbolic === 'class' && entry.decorators;
            });
        }
        return false;
    };
    StaticSymbolResolver.prototype.getSymbolsOf = function (filePath) {
        var summarySymbols = this.summaryResolver.getSymbolsOf(filePath);
        if (summarySymbols) {
            return summarySymbols;
        }
        // Note: Some users use libraries that were not compiled with ngc, i.e. they don't
        // have summaries, only .d.ts files, but `summaryResolver.isLibraryFile` returns true.
        this._createSymbolsOf(filePath);
        var metadataSymbols = [];
        this.resolvedSymbols.forEach(function (resolvedSymbol) {
            if (resolvedSymbol.symbol.filePath === filePath) {
                metadataSymbols.push(resolvedSymbol.symbol);
            }
        });
        return metadataSymbols;
    };
    StaticSymbolResolver.prototype._createSymbolsOf = function (filePath) {
        var _this = this;
        if (this.resolvedFilePaths.has(filePath)) {
            return;
        }
        this.resolvedFilePaths.add(filePath);
        var resolvedSymbols = [];
        var metadata = this.getModuleMetadata(filePath);
        if (metadata['importAs']) {
            // Index bundle indices should use the importAs module name defined
            // in the bundle.
            this.knownFileNameToModuleNames.set(filePath, metadata['importAs']);
        }
        // handle the symbols in one of the re-export location
        if (metadata['exports']) {
            var _loop_1 = function (moduleExport) {
                // handle the symbols in the list of explicitly re-exported symbols.
                if (moduleExport.export) {
                    moduleExport.export.forEach(function (exportSymbol) {
                        var symbolName;
                        if (typeof exportSymbol === 'string') {
                            symbolName = exportSymbol;
                        }
                        else {
                            symbolName = exportSymbol.as;
                        }
                        symbolName = unescapeIdentifier(symbolName);
                        var symName = symbolName;
                        if (typeof exportSymbol !== 'string') {
                            symName = unescapeIdentifier(exportSymbol.name);
                        }
                        var resolvedModule = _this.resolveModule(moduleExport.from, filePath);
                        if (resolvedModule) {
                            var targetSymbol = _this.getStaticSymbol(resolvedModule, symName);
                            var sourceSymbol = _this.getStaticSymbol(filePath, symbolName);
                            resolvedSymbols.push(_this.createExport(sourceSymbol, targetSymbol));
                        }
                    });
                }
                else {
                    // handle the symbols via export * directives.
                    var resolvedModule = this_1.resolveModule(moduleExport.from, filePath);
                    if (resolvedModule) {
                        var nestedExports = this_1.getSymbolsOf(resolvedModule);
                        nestedExports.forEach(function (targetSymbol) {
                            var sourceSymbol = _this.getStaticSymbol(filePath, targetSymbol.name);
                            resolvedSymbols.push(_this.createExport(sourceSymbol, targetSymbol));
                        });
                    }
                }
            };
            var this_1 = this;
            try {
                for (var _a = tslib_1.__values(metadata['exports']), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var moduleExport = _b.value;
                    _loop_1(moduleExport);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        // handle the actual metadata. Has to be after the exports
        // as there migth be collisions in the names, and we want the symbols
        // of the current module to win ofter reexports.
        if (metadata['metadata']) {
            // handle direct declarations of the symbol
            var topLevelSymbolNames_1 = new Set(Object.keys(metadata['metadata']).map(unescapeIdentifier));
            var origins_1 = metadata['origins'] || {};
            Object.keys(metadata['metadata']).forEach(function (metadataKey) {
                var symbolMeta = metadata['metadata'][metadataKey];
                var name = unescapeIdentifier(metadataKey);
                var symbol = _this.getStaticSymbol(filePath, name);
                var origin = origins_1.hasOwnProperty(metadataKey) && origins_1[metadataKey];
                if (origin) {
                    // If the symbol is from a bundled index, use the declaration location of the
                    // symbol so relative references (such as './my.html') will be calculated
                    // correctly.
                    var originFilePath = _this.resolveModule(origin, filePath);
                    if (!originFilePath) {
                        _this.reportError(new Error("Couldn't resolve original symbol for " + origin + " from " + filePath));
                    }
                    else {
                        _this.symbolResourcePaths.set(symbol, originFilePath);
                    }
                }
                resolvedSymbols.push(_this.createResolvedSymbol(symbol, filePath, topLevelSymbolNames_1, symbolMeta));
            });
        }
        resolvedSymbols.forEach(function (resolvedSymbol) { return _this.resolvedSymbols.set(resolvedSymbol.symbol, resolvedSymbol); });
        this.symbolFromFile.set(filePath, resolvedSymbols.map(function (resolvedSymbol) { return resolvedSymbol.symbol; }));
        var e_2, _c;
    };
    StaticSymbolResolver.prototype.createResolvedSymbol = function (sourceSymbol, topLevelPath, topLevelSymbolNames, metadata) {
        var _this = this;
        // For classes that don't have Angular summaries / metadata,
        // we only keep their arity, but nothing else
        // (e.g. their constructor parameters).
        // We do this to prevent introducing deep imports
        // as we didn't generate .ngfactory.ts files with proper reexports.
        var isTsFile = TS.test(sourceSymbol.filePath);
        if (this.summaryResolver.isLibraryFile(sourceSymbol.filePath) && !isTsFile && metadata &&
            metadata['__symbolic'] === 'class') {
            var transformedMeta_1 = { __symbolic: 'class', arity: metadata.arity };
            return new ResolvedStaticSymbol(sourceSymbol, transformedMeta_1);
        }
        var _originalFileMemo;
        var getOriginalName = function () {
            if (!_originalFileMemo) {
                // Guess what hte original file name is from the reference. If it has a `.d.ts` extension
                // replace it with `.ts`. If it already has `.ts` just leave it in place. If it doesn't have
                // .ts or .d.ts, append `.ts'. Also, if it is in `node_modules`, trim the `node_module`
                // location as it is not important to finding the file.
                _originalFileMemo =
                    _this.host.getOutputName(topLevelPath.replace(/((\.ts)|(\.d\.ts)|)$/, '.ts')
                        .replace(/^.*node_modules[/\\]/, ''));
            }
            return _originalFileMemo;
        };
        var self = this;
        var ReferenceTransformer = /** @class */ (function (_super) {
            tslib_1.__extends(ReferenceTransformer, _super);
            function ReferenceTransformer() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ReferenceTransformer.prototype.visitStringMap = function (map, functionParams) {
                var symbolic = map['__symbolic'];
                if (symbolic === 'function') {
                    var oldLen = functionParams.length;
                    functionParams.push.apply(functionParams, tslib_1.__spread((map['parameters'] || [])));
                    var result = _super.prototype.visitStringMap.call(this, map, functionParams);
                    functionParams.length = oldLen;
                    return result;
                }
                else if (symbolic === 'reference') {
                    var module = map['module'];
                    var name_1 = map['name'] ? unescapeIdentifier(map['name']) : map['name'];
                    if (!name_1) {
                        return null;
                    }
                    var filePath = void 0;
                    if (module) {
                        filePath = self.resolveModule(module, sourceSymbol.filePath);
                        if (!filePath) {
                            return {
                                __symbolic: 'error',
                                message: "Could not resolve " + module + " relative to " + sourceSymbol.filePath + ".",
                                line: map.line,
                                character: map.character,
                                fileName: getOriginalName()
                            };
                        }
                        return {
                            __symbolic: 'resolved',
                            symbol: self.getStaticSymbol(filePath, name_1),
                            line: map.line,
                            character: map.character,
                            fileName: getOriginalName()
                        };
                    }
                    else if (functionParams.indexOf(name_1) >= 0) {
                        // reference to a function parameter
                        return { __symbolic: 'reference', name: name_1 };
                    }
                    else {
                        if (topLevelSymbolNames.has(name_1)) {
                            return self.getStaticSymbol(topLevelPath, name_1);
                        }
                        // ambient value
                        null;
                    }
                }
                else if (symbolic === 'error') {
                    return tslib_1.__assign({}, map, { fileName: getOriginalName() });
                }
                else {
                    return _super.prototype.visitStringMap.call(this, map, functionParams);
                }
            };
            return ReferenceTransformer;
        }(ValueTransformer));
        var transformedMeta = visitValue(metadata, new ReferenceTransformer(), []);
        var unwrappedTransformedMeta = unwrapResolvedMetadata(transformedMeta);
        if (unwrappedTransformedMeta instanceof StaticSymbol) {
            return this.createExport(sourceSymbol, unwrappedTransformedMeta);
        }
        return new ResolvedStaticSymbol(sourceSymbol, transformedMeta);
    };
    StaticSymbolResolver.prototype.createExport = function (sourceSymbol, targetSymbol) {
        sourceSymbol.assertNoMembers();
        targetSymbol.assertNoMembers();
        if (this.summaryResolver.isLibraryFile(sourceSymbol.filePath) &&
            this.summaryResolver.isLibraryFile(targetSymbol.filePath)) {
            // This case is for an ng library importing symbols from a plain ts library
            // transitively.
            // Note: We rely on the fact that we discover symbols in the direction
            // from source files to library files
            this.importAs.set(targetSymbol, this.getImportAs(sourceSymbol) || sourceSymbol);
        }
        return new ResolvedStaticSymbol(sourceSymbol, targetSymbol);
    };
    StaticSymbolResolver.prototype.reportError = function (error, context, path) {
        if (this.errorRecorder) {
            this.errorRecorder(error, (context && context.filePath) || path);
        }
        else {
            throw error;
        }
    };
    /**
     * @param module an absolute path to a module file.
     */
    StaticSymbolResolver.prototype.getModuleMetadata = function (module) {
        var moduleMetadata = this.metadataCache.get(module);
        if (!moduleMetadata) {
            var moduleMetadatas = this.host.getMetadataFor(module);
            if (moduleMetadatas) {
                var maxVersion_1 = -1;
                moduleMetadatas.forEach(function (md) {
                    if (md && md['version'] > maxVersion_1) {
                        maxVersion_1 = md['version'];
                        moduleMetadata = md;
                    }
                });
            }
            if (!moduleMetadata) {
                moduleMetadata =
                    { __symbolic: 'module', version: SUPPORTED_SCHEMA_VERSION, module: module, metadata: {} };
            }
            if (moduleMetadata['version'] != SUPPORTED_SCHEMA_VERSION) {
                var errorMessage = moduleMetadata['version'] == 2 ?
                    "Unsupported metadata version " + moduleMetadata['version'] + " for module " + module + ". This module should be compiled with a newer version of ngc" :
                    "Metadata version mismatch for module " + module + ", found version " + moduleMetadata['version'] + ", expected " + SUPPORTED_SCHEMA_VERSION;
                this.reportError(new Error(errorMessage));
            }
            this.metadataCache.set(module, moduleMetadata);
        }
        return moduleMetadata;
    };
    StaticSymbolResolver.prototype.getSymbolByModule = function (module, symbolName, containingFile) {
        var filePath = this.resolveModule(module, containingFile);
        if (!filePath) {
            this.reportError(new Error("Could not resolve module " + module + (containingFile ? ' relative to ' +
                containingFile : '')));
            return this.getStaticSymbol("ERROR:" + module, symbolName);
        }
        return this.getStaticSymbol(filePath, symbolName);
    };
    StaticSymbolResolver.prototype.resolveModule = function (module, containingFile) {
        try {
            return this.host.moduleNameToFileName(module, containingFile);
        }
        catch (e) {
            console.error("Could not resolve module '" + module + "' relative to file " + containingFile);
            this.reportError(e, undefined, containingFile);
        }
        return null;
    };
    return StaticSymbolResolver;
}());
export { StaticSymbolResolver };
// Remove extra underscore from escaped identifier.
// See https://github.com/Microsoft/TypeScript/blob/master/src/compiler/utilities.ts
export function unescapeIdentifier(identifier) {
    return identifier.startsWith('___') ? identifier.substr(1) : identifier;
}
export function unwrapResolvedMetadata(metadata) {
    if (metadata && metadata.__symbolic === 'resolved') {
        return metadata.symbol;
    }
    return metadata;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3N5bWJvbF9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9hb3Qvc3RhdGljX3N5bWJvbF9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBR0gsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFVBQVUsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUVyRCxPQUFPLEVBQUMsWUFBWSxFQUFvQixNQUFNLGlCQUFpQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxlQUFlLEVBQUUsNEJBQTRCLEVBQUUsNEJBQTRCLEVBQUUscUJBQXFCLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFN0ksSUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDO0FBQ3ZCLElBQU0sRUFBRSxHQUFHLHdCQUF3QixDQUFDO0FBRXBDO0lBQ0UsOEJBQW1CLE1BQW9CLEVBQVMsUUFBYTtRQUExQyxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBSztJQUFHLENBQUM7SUFDbkUsMkJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQzs7QUFpQ0QsSUFBTSx3QkFBd0IsR0FBRyxDQUFDLENBQUM7QUFFbkM7Ozs7Ozs7R0FPRztBQUNIO0lBV0UsOEJBQ1ksSUFBOEIsRUFBVSxpQkFBb0MsRUFDNUUsZUFBOEMsRUFDOUMsYUFBdUQ7UUFGdkQsU0FBSSxHQUFKLElBQUksQ0FBMEI7UUFBVSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBQzVFLG9CQUFlLEdBQWYsZUFBZSxDQUErQjtRQUM5QyxrQkFBYSxHQUFiLGFBQWEsQ0FBMEM7UUFiM0Qsa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBZ0MsQ0FBQztRQUNoRSw4REFBOEQ7UUFDdEQsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBc0MsQ0FBQztRQUNoRSxzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQzlDLDhEQUE4RDtRQUN0RCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7UUFDakQsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQXdCLENBQUM7UUFDdEQsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztRQUNuRCwrQkFBMEIsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztJQUtPLENBQUM7SUFFdkUsNENBQWEsR0FBYixVQUFjLFlBQTBCO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUcsQ0FBQztRQUNwRCxDQUFDO1FBQ0Qsd0NBQXdDO1FBQ3hDLDBEQUEwRDtRQUMxRCxrQkFBa0I7UUFDbEIsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFHLENBQUM7UUFDekUsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztRQUMzQixDQUFDO1FBQ0QsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0QsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUMsZUFBZSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxrRkFBa0Y7UUFDbEYsaUZBQWlGO1FBQ2pGLGdCQUFnQjtRQUNoQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUcsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCwwQ0FBVyxHQUFYLFVBQVksWUFBMEIsRUFBRSxZQUE0QjtRQUE1Qiw2QkFBQSxFQUFBLG1CQUE0QjtRQUNsRSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLENBQUM7UUFDWCxDQUFDO1FBQ0QsSUFBTSxrQkFBa0IsR0FBRyw0QkFBNEIsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0UsRUFBRSxDQUFDLENBQUMsa0JBQWtCLEtBQUssWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDakQsSUFBTSxjQUFjLEdBQUcsNEJBQTRCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZFLElBQU0sVUFBVSxHQUNaLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuRixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxlQUFlLENBQ2hCLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQ2xGLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLENBQUM7UUFDWCxDQUFDO1FBQ0QsSUFBSSxNQUFNLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDdEYsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1osTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBRyxDQUFDO1FBQzdDLENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsOENBQWUsR0FBZixVQUFnQixZQUEwQjtRQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDO0lBQzdFLENBQUM7SUFFRDs7O09BR0c7SUFDSCwyQ0FBWSxHQUFaLFVBQWEsWUFBMEI7UUFDckMsc0ZBQXNGO1FBQ3RGLHFGQUFxRjtRQUNyRiw4RUFBOEU7UUFDOUUsbUJBQW1CO1FBQ25CLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsSUFBSSxjQUFjLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzlFLE9BQU8sY0FBYyxJQUFJLGNBQWMsQ0FBQyxRQUFRLFlBQVksWUFBWSxFQUFFLENBQUM7WUFDekUsY0FBYyxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUNELE1BQU0sQ0FBQyxDQUFDLGNBQWMsSUFBSSxjQUFjLENBQUMsUUFBUSxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO0lBQzlGLENBQUM7SUFFRCxpREFBa0IsR0FBbEIsVUFBbUIsUUFBZ0I7UUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQy9ELENBQUM7SUFFRCw2Q0FBYyxHQUFkLFVBQWUsWUFBMEIsRUFBRSxZQUEwQjtRQUNuRSxZQUFZLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDL0IsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsMERBQTJCLEdBQTNCLFVBQTRCLFFBQWdCLEVBQUUsVUFBa0I7UUFDOUQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCw2Q0FBYyxHQUFkLFVBQWUsUUFBZ0I7UUFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7O2dCQUNyQyxHQUFHLENBQUMsQ0FBaUIsSUFBQSxZQUFBLGlCQUFBLE9BQU8sQ0FBQSxnQ0FBQTtvQkFBdkIsSUFBTSxNQUFNLG9CQUFBO29CQUNmLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDekM7Ozs7Ozs7OztRQUNILENBQUM7O0lBQ0gsQ0FBQztJQUVELGVBQWU7SUFDZiw4Q0FBZSxHQUFmLFVBQW1CLEVBQVc7UUFDNUIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUNwQyxJQUFJLENBQUMsYUFBYSxHQUFHLGNBQU8sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQztZQUNILE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNkLENBQUM7Z0JBQVMsQ0FBQztZQUNULElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDO1FBQ2hDLENBQUM7SUFDSCxDQUFDO0lBRU8sb0RBQXFCLEdBQTdCLFVBQThCLFlBQTBCO1FBQ3RELElBQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUM7UUFDckMsSUFBTSxrQkFBa0IsR0FDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdkYsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFJLFlBQVksR0FBRyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2RSxFQUFFLENBQUMsQ0FBQyxZQUFZLFlBQVksWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsSUFBSSxvQkFBb0IsQ0FDM0IsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksWUFBWSxDQUFDLFVBQVUsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQy9ELEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLENBQUM7UUFDSCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLEtBQUssR0FBRyxZQUFZLENBQUM7WUFDekIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNqRCxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sd0RBQXlCLEdBQWpDLFVBQWtDLFlBQTBCO1FBQzFELElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksb0JBQW9CLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ25GLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsOENBQWUsR0FBZixVQUFnQixlQUF1QixFQUFFLElBQVksRUFBRSxPQUFrQjtRQUN2RSxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCw0Q0FBYSxHQUFiLFVBQWMsUUFBZ0I7UUFDNUIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsV0FBVztnQkFDeEQsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssT0FBTyxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFDbkUsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCwyQ0FBWSxHQUFaLFVBQWEsUUFBZ0I7UUFDM0IsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkUsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUNuQixNQUFNLENBQUMsY0FBYyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxrRkFBa0Y7UUFDbEYsc0ZBQXNGO1FBQ3RGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxJQUFNLGVBQWUsR0FBbUIsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUMsY0FBYztZQUMxQyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsZUFBZSxDQUFDO0lBQ3pCLENBQUM7SUFFTywrQ0FBZ0IsR0FBeEIsVUFBeUIsUUFBZ0I7UUFBekMsaUJBb0ZDO1FBbkZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQztRQUNULENBQUM7UUFDRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JDLElBQU0sZUFBZSxHQUEyQixFQUFFLENBQUM7UUFDbkQsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsbUVBQW1FO1lBQ25FLGlCQUFpQjtZQUNqQixJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBQ0Qsc0RBQXNEO1FBQ3RELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0NBQ2IsWUFBWTtnQkFDckIsb0VBQW9FO2dCQUNwRSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDeEIsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxZQUFpQjt3QkFDNUMsSUFBSSxVQUFrQixDQUFDO3dCQUN2QixFQUFFLENBQUMsQ0FBQyxPQUFPLFlBQVksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDOzRCQUNyQyxVQUFVLEdBQUcsWUFBWSxDQUFDO3dCQUM1QixDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNOLFVBQVUsR0FBRyxZQUFZLENBQUMsRUFBRSxDQUFDO3dCQUMvQixDQUFDO3dCQUNELFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDNUMsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDO3dCQUN6QixFQUFFLENBQUMsQ0FBQyxPQUFPLFlBQVksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDOzRCQUNyQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNsRCxDQUFDO3dCQUNELElBQU0sY0FBYyxHQUFHLEtBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFDdkUsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzs0QkFDbkIsSUFBTSxZQUFZLEdBQUcsS0FBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7NEJBQ25FLElBQU0sWUFBWSxHQUFHLEtBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDOzRCQUNoRSxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ3RFLENBQUM7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTiw4Q0FBOEM7b0JBQzlDLElBQU0sY0FBYyxHQUFHLE9BQUssYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ3ZFLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7d0JBQ25CLElBQU0sYUFBYSxHQUFHLE9BQUssWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUN4RCxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQUMsWUFBWTs0QkFDakMsSUFBTSxZQUFZLEdBQUcsS0FBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUN2RSxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ3RFLENBQUMsQ0FBQyxDQUFDO29CQUNMLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7OztnQkFqQ0QsR0FBRyxDQUFDLENBQXVCLElBQUEsS0FBQSxpQkFBQSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUEsZ0JBQUE7b0JBQXpDLElBQU0sWUFBWSxXQUFBOzRCQUFaLFlBQVk7aUJBaUN0Qjs7Ozs7Ozs7O1FBQ0gsQ0FBQztRQUVELDBEQUEwRDtRQUMxRCxxRUFBcUU7UUFDckUsZ0RBQWdEO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsMkNBQTJDO1lBQzNDLElBQU0scUJBQW1CLEdBQ3JCLElBQUksR0FBRyxDQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUMvRSxJQUFNLFNBQU8sR0FBOEIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFdBQVc7Z0JBQ3BELElBQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDckQsSUFBTSxJQUFJLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRTdDLElBQU0sTUFBTSxHQUFHLEtBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUVwRCxJQUFNLE1BQU0sR0FBRyxTQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLFNBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDM0UsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDWCw2RUFBNkU7b0JBQzdFLHlFQUF5RTtvQkFDekUsYUFBYTtvQkFDYixJQUFNLGNBQWMsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDNUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3dCQUNwQixLQUFJLENBQUMsV0FBVyxDQUNaLElBQUksS0FBSyxDQUFDLDBDQUF3QyxNQUFNLGNBQVMsUUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDcEYsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixLQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDdkQsQ0FBQztnQkFDSCxDQUFDO2dCQUNELGVBQWUsQ0FBQyxJQUFJLENBQ2hCLEtBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLHFCQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDcEYsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsZUFBZSxDQUFDLE9BQU8sQ0FDbkIsVUFBQyxjQUFjLElBQUssT0FBQSxLQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxFQUEvRCxDQUErRCxDQUFDLENBQUM7UUFDekYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBQSxjQUFjLElBQUksT0FBQSxjQUFjLENBQUMsTUFBTSxFQUFyQixDQUFxQixDQUFDLENBQUMsQ0FBQzs7SUFDbEcsQ0FBQztJQUVPLG1EQUFvQixHQUE1QixVQUNJLFlBQTBCLEVBQUUsWUFBb0IsRUFBRSxtQkFBZ0MsRUFDbEYsUUFBYTtRQUZqQixpQkF3RkM7UUFyRkMsNERBQTREO1FBQzVELDZDQUE2QztRQUM3Qyx1Q0FBdUM7UUFDdkMsaURBQWlEO1FBQ2pELG1FQUFtRTtRQUNuRSxJQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksUUFBUTtZQUNsRixRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN2QyxJQUFNLGlCQUFlLEdBQUcsRUFBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFDLENBQUM7WUFDckUsTUFBTSxDQUFDLElBQUksb0JBQW9CLENBQUMsWUFBWSxFQUFFLGlCQUFlLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsSUFBSSxpQkFBbUMsQ0FBQztRQUN4QyxJQUFNLGVBQWUsR0FBaUI7WUFDcEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLHlGQUF5RjtnQkFDekYsNEZBQTRGO2dCQUM1Rix1RkFBdUY7Z0JBQ3ZGLHVEQUF1RDtnQkFDdkQsaUJBQWlCO29CQUNiLEtBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsS0FBSyxDQUFDO3lCQUM5QyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RSxDQUFDO1lBQ0QsTUFBTSxDQUFDLGlCQUFpQixDQUFDO1FBQzNCLENBQUMsQ0FBQztRQUVGLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQjtZQUFtQyxnREFBZ0I7WUFBbkQ7O1lBa0RBLENBQUM7WUFqREMsNkNBQWMsR0FBZCxVQUFlLEdBQXlCLEVBQUUsY0FBd0I7Z0JBQ2hFLElBQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDbkMsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQzVCLElBQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7b0JBQ3JDLGNBQWMsQ0FBQyxJQUFJLE9BQW5CLGNBQWMsbUJBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUU7b0JBQ2xELElBQU0sTUFBTSxHQUFHLGlCQUFNLGNBQWMsWUFBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQ3pELGNBQWMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO29CQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNoQixDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDcEMsSUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUM3QixJQUFNLE1BQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3pFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDVixNQUFNLENBQUMsSUFBSSxDQUFDO29CQUNkLENBQUM7b0JBQ0QsSUFBSSxRQUFRLFNBQVEsQ0FBQztvQkFDckIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDWCxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLFFBQVEsQ0FBRyxDQUFDO3dCQUMvRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7NEJBQ2QsTUFBTSxDQUFDO2dDQUNMLFVBQVUsRUFBRSxPQUFPO2dDQUNuQixPQUFPLEVBQUUsdUJBQXFCLE1BQU0scUJBQWdCLFlBQVksQ0FBQyxRQUFRLE1BQUc7Z0NBQzVFLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtnQ0FDZCxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7Z0NBQ3hCLFFBQVEsRUFBRSxlQUFlLEVBQUU7NkJBQzVCLENBQUM7d0JBQ0osQ0FBQzt3QkFDRCxNQUFNLENBQUM7NEJBQ0wsVUFBVSxFQUFFLFVBQVU7NEJBQ3RCLE1BQU0sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxNQUFJLENBQUM7NEJBQzVDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTs0QkFDZCxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7NEJBQ3hCLFFBQVEsRUFBRSxlQUFlLEVBQUU7eUJBQzVCLENBQUM7b0JBQ0osQ0FBQztvQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM3QyxvQ0FBb0M7d0JBQ3BDLE1BQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE1BQUksRUFBQyxDQUFDO29CQUMvQyxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNOLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxNQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxNQUFJLENBQUMsQ0FBQzt3QkFDbEQsQ0FBQzt3QkFDRCxnQkFBZ0I7d0JBQ2hCLElBQUksQ0FBQztvQkFDUCxDQUFDO2dCQUNILENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxNQUFNLHNCQUFLLEdBQUcsSUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLElBQUU7Z0JBQy9DLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sTUFBTSxDQUFDLGlCQUFNLGNBQWMsWUFBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ25ELENBQUM7WUFDSCxDQUFDO1lBQ0gsMkJBQUM7UUFBRCxDQUFDLEFBbERELENBQW1DLGdCQUFnQixHQWtEbEQ7UUFDRCxJQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFFLElBQUksb0JBQW9CLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLHdCQUF3QixHQUFHLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZFLEVBQUUsQ0FBQyxDQUFDLHdCQUF3QixZQUFZLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLG9CQUFvQixDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU8sMkNBQVksR0FBcEIsVUFBcUIsWUFBMEIsRUFBRSxZQUEwQjtRQUV6RSxZQUFZLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDL0IsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7WUFDekQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RCwyRUFBMkU7WUFDM0UsZ0JBQWdCO1lBQ2hCLHNFQUFzRTtZQUN0RSxxQ0FBcUM7WUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksWUFBWSxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLG9CQUFvQixDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU8sMENBQVcsR0FBbkIsVUFBb0IsS0FBWSxFQUFFLE9BQXNCLEVBQUUsSUFBYTtRQUNyRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxLQUFLLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0ssZ0RBQWlCLEdBQXpCLFVBQTBCLE1BQWM7UUFDdEMsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksWUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBRTtvQkFDekIsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxZQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUNyQyxZQUFVLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUMzQixjQUFjLEdBQUcsRUFBRSxDQUFDO29CQUN0QixDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsY0FBYztvQkFDVixFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBQyxDQUFDO1lBQzlGLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQXdCLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxJQUFNLFlBQVksR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2pELGtDQUFnQyxjQUFjLENBQUMsU0FBUyxDQUFDLG9CQUFlLE1BQU0saUVBQThELENBQUMsQ0FBQztvQkFDOUksMENBQXdDLE1BQU0sd0JBQW1CLGNBQWMsQ0FBQyxTQUFTLENBQUMsbUJBQWMsd0JBQTBCLENBQUM7Z0JBQ3ZJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFDRCxNQUFNLENBQUMsY0FBYyxDQUFDO0lBQ3hCLENBQUM7SUFHRCxnREFBaUIsR0FBakIsVUFBa0IsTUFBYyxFQUFFLFVBQWtCLEVBQUUsY0FBdUI7UUFDM0UsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDNUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FDWixJQUFJLEtBQUssQ0FBQyw4QkFBNEIsTUFBTSxJQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsZUFBZTtnQkFDN0UsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBUyxNQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRU8sNENBQWEsR0FBckIsVUFBc0IsTUFBYyxFQUFFLGNBQXVCO1FBQzNELElBQUksQ0FBQztZQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQTZCLE1BQU0sMkJBQXNCLGNBQWdCLENBQUMsQ0FBQztZQUN6RixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0gsMkJBQUM7QUFBRCxDQUFDLEFBMWRELElBMGRDOztBQUVELG1EQUFtRDtBQUNuRCxvRkFBb0Y7QUFDcEYsTUFBTSw2QkFBNkIsVUFBa0I7SUFDbkQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztBQUMxRSxDQUFDO0FBRUQsTUFBTSxpQ0FBaUMsUUFBYTtJQUNsRCxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3VtbWFyeVJlc29sdmVyfSBmcm9tICcuLi9zdW1tYXJ5X3Jlc29sdmVyJztcbmltcG9ydCB7VmFsdWVUcmFuc2Zvcm1lciwgdmlzaXRWYWx1ZX0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7U3RhdGljU3ltYm9sLCBTdGF0aWNTeW1ib2xDYWNoZX0gZnJvbSAnLi9zdGF0aWNfc3ltYm9sJztcbmltcG9ydCB7aXNHZW5lcmF0ZWRGaWxlLCBzdHJpcFN1bW1hcnlGb3JKaXRGaWxlU3VmZml4LCBzdHJpcFN1bW1hcnlGb3JKaXROYW1lU3VmZml4LCBzdW1tYXJ5Rm9ySml0RmlsZU5hbWUsIHN1bW1hcnlGb3JKaXROYW1lfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBEVFMgPSAvXFwuZFxcLnRzJC87XG5jb25zdCBUUyA9IC9eKD8hLipcXC5kXFwudHMkKS4qXFwudHMkLztcblxuZXhwb3J0IGNsYXNzIFJlc29sdmVkU3RhdGljU3ltYm9sIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN5bWJvbDogU3RhdGljU3ltYm9sLCBwdWJsaWMgbWV0YWRhdGE6IGFueSkge31cbn1cblxuLyoqXG4gKiBUaGUgaG9zdCBvZiB0aGUgU3ltYm9sUmVzb2x2ZXJIb3N0IGRpc2Nvbm5lY3RzIHRoZSBpbXBsZW1lbnRhdGlvbiBmcm9tIFR5cGVTY3JpcHQgLyBvdGhlclxuICogbGFuZ3VhZ2VcbiAqIHNlcnZpY2VzIGFuZCBmcm9tIHVuZGVybHlpbmcgZmlsZSBzeXN0ZW1zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRpY1N5bWJvbFJlc29sdmVySG9zdCB7XG4gIC8qKlxuICAgKiBSZXR1cm4gYSBNb2R1bGVNZXRhZGF0YSBmb3IgdGhlIGdpdmVuIG1vZHVsZS5cbiAgICogQW5ndWxhciBDTEkgd2lsbCBwcm9kdWNlIHRoaXMgbWV0YWRhdGEgZm9yIGEgbW9kdWxlIHdoZW5ldmVyIGEgLmQudHMgZmlsZXMgaXNcbiAgICogcHJvZHVjZWQgYW5kIHRoZSBtb2R1bGUgaGFzIGV4cG9ydGVkIHZhcmlhYmxlcyBvciBjbGFzc2VzIHdpdGggZGVjb3JhdG9ycy4gTW9kdWxlIG1ldGFkYXRhIGNhblxuICAgKiBhbHNvIGJlIHByb2R1Y2VkIGRpcmVjdGx5IGZyb20gVHlwZVNjcmlwdCBzb3VyY2VzIGJ5IHVzaW5nIE1ldGFkYXRhQ29sbGVjdG9yIGluIHRvb2xzL21ldGFkYXRhLlxuICAgKlxuICAgKiBAcGFyYW0gbW9kdWxlUGF0aCBpcyBhIHN0cmluZyBpZGVudGlmaWVyIGZvciBhIG1vZHVsZSBhcyBhbiBhYnNvbHV0ZSBwYXRoLlxuICAgKiBAcmV0dXJucyB0aGUgbWV0YWRhdGEgZm9yIHRoZSBnaXZlbiBtb2R1bGUuXG4gICAqL1xuICBnZXRNZXRhZGF0YUZvcihtb2R1bGVQYXRoOiBzdHJpbmcpOiB7W2tleTogc3RyaW5nXTogYW55fVtdfHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQ29udmVydHMgYSBtb2R1bGUgbmFtZSB0aGF0IGlzIHVzZWQgaW4gYW4gYGltcG9ydGAgdG8gYSBmaWxlIHBhdGguXG4gICAqIEkuZS5cbiAgICogYHBhdGgvdG8vY29udGFpbmluZ0ZpbGUudHNgIGNvbnRhaW5pbmcgYGltcG9ydCB7Li4ufSBmcm9tICdtb2R1bGUtbmFtZSdgLlxuICAgKi9cbiAgbW9kdWxlTmFtZVRvRmlsZU5hbWUobW9kdWxlTmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZT86IHN0cmluZyk6IHN0cmluZ3xudWxsO1xuXG4gIC8qKlxuICAgKiBHZXQgYSBmaWxlIHN1aXRhYmxlIGZvciBkaXNwbGF5IHRvIHRoZSB1c2VyIHRoYXQgc2hvdWxkIGJlIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0IGRpcmVjdG9yeVxuICAgKiBvciB0aGUgY3VycmVudCBkaXJlY3RvcnkuXG4gICAqL1xuICBnZXRPdXRwdXROYW1lKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbmNvbnN0IFNVUFBPUlRFRF9TQ0hFTUFfVkVSU0lPTiA9IDQ7XG5cbi8qKlxuICogVGhpcyBjbGFzcyBpcyByZXNwb25zaWJsZSBmb3IgbG9hZGluZyBtZXRhZGF0YSBwZXIgc3ltYm9sLFxuICogYW5kIG5vcm1hbGl6aW5nIHJlZmVyZW5jZXMgYmV0d2VlbiBzeW1ib2xzLlxuICpcbiAqIEludGVybmFsbHksIGl0IG9ubHkgdXNlcyBzeW1ib2xzIHdpdGhvdXQgbWVtYmVycyxcbiAqIGFuZCBkZWR1Y2VzIHRoZSB2YWx1ZXMgZm9yIHN5bWJvbHMgd2l0aCBtZW1iZXJzIGJhc2VkXG4gKiBvbiB0aGVzZSBzeW1ib2xzLlxuICovXG5leHBvcnQgY2xhc3MgU3RhdGljU3ltYm9sUmVzb2x2ZXIge1xuICBwcml2YXRlIG1ldGFkYXRhQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywge1trZXk6IHN0cmluZ106IGFueX0+KCk7XG4gIC8vIE5vdGU6IHRoaXMgd2lsbCBvbmx5IGNvbnRhaW4gU3RhdGljU3ltYm9scyB3aXRob3V0IG1lbWJlcnMhXG4gIHByaXZhdGUgcmVzb2x2ZWRTeW1ib2xzID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIFJlc29sdmVkU3RhdGljU3ltYm9sPigpO1xuICBwcml2YXRlIHJlc29sdmVkRmlsZVBhdGhzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIC8vIE5vdGU6IHRoaXMgd2lsbCBvbmx5IGNvbnRhaW4gU3RhdGljU3ltYm9scyB3aXRob3V0IG1lbWJlcnMhXG4gIHByaXZhdGUgaW1wb3J0QXMgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgU3RhdGljU3ltYm9sPigpO1xuICBwcml2YXRlIHN5bWJvbFJlc291cmNlUGF0aHMgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgc3RyaW5nPigpO1xuICBwcml2YXRlIHN5bWJvbEZyb21GaWxlID0gbmV3IE1hcDxzdHJpbmcsIFN0YXRpY1N5bWJvbFtdPigpO1xuICBwcml2YXRlIGtub3duRmlsZU5hbWVUb01vZHVsZU5hbWVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaG9zdDogU3RhdGljU3ltYm9sUmVzb2x2ZXJIb3N0LCBwcml2YXRlIHN0YXRpY1N5bWJvbENhY2hlOiBTdGF0aWNTeW1ib2xDYWNoZSxcbiAgICAgIHByaXZhdGUgc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8U3RhdGljU3ltYm9sPixcbiAgICAgIHByaXZhdGUgZXJyb3JSZWNvcmRlcj86IChlcnJvcjogYW55LCBmaWxlTmFtZT86IHN0cmluZykgPT4gdm9pZCkge31cblxuICByZXNvbHZlU3ltYm9sKHN0YXRpY1N5bWJvbDogU3RhdGljU3ltYm9sKTogUmVzb2x2ZWRTdGF0aWNTeW1ib2wge1xuICAgIGlmIChzdGF0aWNTeW1ib2wubWVtYmVycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZVN5bWJvbE1lbWJlcnMoc3RhdGljU3ltYm9sKSAhO1xuICAgIH1cbiAgICAvLyBOb3RlOiBhbHdheXMgYXNrIGZvciBhIHN1bW1hcnkgZmlyc3QsXG4gICAgLy8gYXMgd2UgbWlnaHQgaGF2ZSByZWFkIHNoYWxsb3cgbWV0YWRhdGEgdmlhIGEgLmQudHMgZmlsZVxuICAgIC8vIGZvciB0aGUgc3ltYm9sLlxuICAgIGNvbnN0IHJlc3VsdEZyb21TdW1tYXJ5ID0gdGhpcy5fcmVzb2x2ZVN5bWJvbEZyb21TdW1tYXJ5KHN0YXRpY1N5bWJvbCkgITtcbiAgICBpZiAocmVzdWx0RnJvbVN1bW1hcnkpIHtcbiAgICAgIHJldHVybiByZXN1bHRGcm9tU3VtbWFyeTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0RnJvbUNhY2hlID0gdGhpcy5yZXNvbHZlZFN5bWJvbHMuZ2V0KHN0YXRpY1N5bWJvbCk7XG4gICAgaWYgKHJlc3VsdEZyb21DYWNoZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdEZyb21DYWNoZTtcbiAgICB9XG4gICAgLy8gTm90ZTogU29tZSB1c2VycyB1c2UgbGlicmFyaWVzIHRoYXQgd2VyZSBub3QgY29tcGlsZWQgd2l0aCBuZ2MsIGkuZS4gdGhleSBkb24ndFxuICAgIC8vIGhhdmUgc3VtbWFyaWVzLCBvbmx5IC5kLnRzIGZpbGVzLiBTbyB3ZSBhbHdheXMgbmVlZCB0byBjaGVjayBib3RoLCB0aGUgc3VtbWFyeVxuICAgIC8vIGFuZCBtZXRhZGF0YS5cbiAgICB0aGlzLl9jcmVhdGVTeW1ib2xzT2Yoc3RhdGljU3ltYm9sLmZpbGVQYXRoKTtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlZFN5bWJvbHMuZ2V0KHN0YXRpY1N5bWJvbCkgITtcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRJbXBvcnRBcyBwcm9kdWNlcyBhIHN5bWJvbCB0aGF0IGNhbiBiZSB1c2VkIHRvIGltcG9ydCB0aGUgZ2l2ZW4gc3ltYm9sLlxuICAgKiBUaGUgaW1wb3J0IG1pZ2h0IGJlIGRpZmZlcmVudCB0aGFuIHRoZSBzeW1ib2wgaWYgdGhlIHN5bWJvbCBpcyBleHBvcnRlZCBmcm9tXG4gICAqIGEgbGlicmFyeSB3aXRoIGEgc3VtbWFyeTsgaW4gd2hpY2ggY2FzZSB3ZSB3YW50IHRvIGltcG9ydCB0aGUgc3ltYm9sIGZyb20gdGhlXG4gICAqIG5nZmFjdG9yeSByZS1leHBvcnQgaW5zdGVhZCBvZiBkaXJlY3RseSB0byBhdm9pZCBpbnRyb2R1Y2luZyBhIGRpcmVjdCBkZXBlbmRlbmN5XG4gICAqIG9uIGFuIG90aGVyd2lzZSBpbmRpcmVjdCBkZXBlbmRlbmN5LlxuICAgKlxuICAgKiBAcGFyYW0gc3RhdGljU3ltYm9sIHRoZSBzeW1ib2wgZm9yIHdoaWNoIHRvIGdlbmVyYXRlIGEgaW1wb3J0IHN5bWJvbFxuICAgKi9cbiAgZ2V0SW1wb3J0QXMoc3RhdGljU3ltYm9sOiBTdGF0aWNTeW1ib2wsIHVzZVN1bW1hcmllczogYm9vbGVhbiA9IHRydWUpOiBTdGF0aWNTeW1ib2x8bnVsbCB7XG4gICAgaWYgKHN0YXRpY1N5bWJvbC5tZW1iZXJzLmxlbmd0aCkge1xuICAgICAgY29uc3QgYmFzZVN5bWJvbCA9IHRoaXMuZ2V0U3RhdGljU3ltYm9sKHN0YXRpY1N5bWJvbC5maWxlUGF0aCwgc3RhdGljU3ltYm9sLm5hbWUpO1xuICAgICAgY29uc3QgYmFzZUltcG9ydEFzID0gdGhpcy5nZXRJbXBvcnRBcyhiYXNlU3ltYm9sLCB1c2VTdW1tYXJpZXMpO1xuICAgICAgcmV0dXJuIGJhc2VJbXBvcnRBcyA/XG4gICAgICAgICAgdGhpcy5nZXRTdGF0aWNTeW1ib2woYmFzZUltcG9ydEFzLmZpbGVQYXRoLCBiYXNlSW1wb3J0QXMubmFtZSwgc3RhdGljU3ltYm9sLm1lbWJlcnMpIDpcbiAgICAgICAgICBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzdW1tYXJpemVkRmlsZU5hbWUgPSBzdHJpcFN1bW1hcnlGb3JKaXRGaWxlU3VmZml4KHN0YXRpY1N5bWJvbC5maWxlUGF0aCk7XG4gICAgaWYgKHN1bW1hcml6ZWRGaWxlTmFtZSAhPT0gc3RhdGljU3ltYm9sLmZpbGVQYXRoKSB7XG4gICAgICBjb25zdCBzdW1tYXJpemVkTmFtZSA9IHN0cmlwU3VtbWFyeUZvckppdE5hbWVTdWZmaXgoc3RhdGljU3ltYm9sLm5hbWUpO1xuICAgICAgY29uc3QgYmFzZVN5bWJvbCA9XG4gICAgICAgICAgdGhpcy5nZXRTdGF0aWNTeW1ib2woc3VtbWFyaXplZEZpbGVOYW1lLCBzdW1tYXJpemVkTmFtZSwgc3RhdGljU3ltYm9sLm1lbWJlcnMpO1xuICAgICAgY29uc3QgYmFzZUltcG9ydEFzID0gdGhpcy5nZXRJbXBvcnRBcyhiYXNlU3ltYm9sLCB1c2VTdW1tYXJpZXMpO1xuICAgICAgcmV0dXJuIGJhc2VJbXBvcnRBcyA/XG4gICAgICAgICAgdGhpcy5nZXRTdGF0aWNTeW1ib2woXG4gICAgICAgICAgICAgIHN1bW1hcnlGb3JKaXRGaWxlTmFtZShiYXNlSW1wb3J0QXMuZmlsZVBhdGgpLCBzdW1tYXJ5Rm9ySml0TmFtZShiYXNlSW1wb3J0QXMubmFtZSksXG4gICAgICAgICAgICAgIGJhc2VTeW1ib2wubWVtYmVycykgOlxuICAgICAgICAgIG51bGw7XG4gICAgfVxuICAgIGxldCByZXN1bHQgPSAodXNlU3VtbWFyaWVzICYmIHRoaXMuc3VtbWFyeVJlc29sdmVyLmdldEltcG9ydEFzKHN0YXRpY1N5bWJvbCkpIHx8IG51bGw7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuaW1wb3J0QXMuZ2V0KHN0YXRpY1N5bWJvbCkgITtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRSZXNvdXJjZVBhdGggcHJvZHVjZXMgdGhlIHBhdGggdG8gdGhlIG9yaWdpbmFsIGxvY2F0aW9uIG9mIHRoZSBzeW1ib2wgYW5kIHNob3VsZFxuICAgKiBiZSB1c2VkIHRvIGRldGVybWluZSB0aGUgcmVsYXRpdmUgbG9jYXRpb24gb2YgcmVzb3VyY2UgcmVmZXJlbmNlcyByZWNvcmRlZCBpblxuICAgKiBzeW1ib2wgbWV0YWRhdGEuXG4gICAqL1xuICBnZXRSZXNvdXJjZVBhdGgoc3RhdGljU3ltYm9sOiBTdGF0aWNTeW1ib2wpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN5bWJvbFJlc291cmNlUGF0aHMuZ2V0KHN0YXRpY1N5bWJvbCkgfHwgc3RhdGljU3ltYm9sLmZpbGVQYXRoO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldFR5cGVBcml0eSByZXR1cm5zIHRoZSBudW1iZXIgb2YgZ2VuZXJpYyB0eXBlIHBhcmFtZXRlcnMgdGhlIGdpdmVuIHN5bWJvbFxuICAgKiBoYXMuIElmIHRoZSBzeW1ib2wgaXMgbm90IGEgdHlwZSB0aGUgcmVzdWx0IGlzIG51bGwuXG4gICAqL1xuICBnZXRUeXBlQXJpdHkoc3RhdGljU3ltYm9sOiBTdGF0aWNTeW1ib2wpOiBudW1iZXJ8bnVsbCB7XG4gICAgLy8gSWYgdGhlIGZpbGUgaXMgYSBmYWN0b3J5L25nc3VtbWFyeSBmaWxlLCBkb24ndCByZXNvbHZlIHRoZSBzeW1ib2wgYXMgZG9pbmcgc28gd291bGRcbiAgICAvLyBjYXVzZSB0aGUgbWV0YWRhdGEgZm9yIGFuIGZhY3RvcnkvbmdzdW1tYXJ5IGZpbGUgdG8gYmUgbG9hZGVkIHdoaWNoIGRvZXNuJ3QgZXhpc3QuXG4gICAgLy8gQWxsIHJlZmVyZW5jZXMgdG8gZ2VuZXJhdGVkIGNsYXNzZXMgbXVzdCBpbmNsdWRlIHRoZSBjb3JyZWN0IGFyaXR5IHdoZW5ldmVyXG4gICAgLy8gZ2VuZXJhdGluZyBjb2RlLlxuICAgIGlmIChpc0dlbmVyYXRlZEZpbGUoc3RhdGljU3ltYm9sLmZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCByZXNvbHZlZFN5bWJvbCA9IHVud3JhcFJlc29sdmVkTWV0YWRhdGEodGhpcy5yZXNvbHZlU3ltYm9sKHN0YXRpY1N5bWJvbCkpO1xuICAgIHdoaWxlIChyZXNvbHZlZFN5bWJvbCAmJiByZXNvbHZlZFN5bWJvbC5tZXRhZGF0YSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgcmVzb2x2ZWRTeW1ib2wgPSB1bndyYXBSZXNvbHZlZE1ldGFkYXRhKHRoaXMucmVzb2x2ZVN5bWJvbChyZXNvbHZlZFN5bWJvbC5tZXRhZGF0YSkpO1xuICAgIH1cbiAgICByZXR1cm4gKHJlc29sdmVkU3ltYm9sICYmIHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhICYmIHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhLmFyaXR5KSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0S25vd25Nb2R1bGVOYW1lKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMua25vd25GaWxlTmFtZVRvTW9kdWxlTmFtZXMuZ2V0KGZpbGVQYXRoKSB8fCBudWxsO1xuICB9XG5cbiAgcmVjb3JkSW1wb3J0QXMoc291cmNlU3ltYm9sOiBTdGF0aWNTeW1ib2wsIHRhcmdldFN5bWJvbDogU3RhdGljU3ltYm9sKSB7XG4gICAgc291cmNlU3ltYm9sLmFzc2VydE5vTWVtYmVycygpO1xuICAgIHRhcmdldFN5bWJvbC5hc3NlcnROb01lbWJlcnMoKTtcbiAgICB0aGlzLmltcG9ydEFzLnNldChzb3VyY2VTeW1ib2wsIHRhcmdldFN5bWJvbCk7XG4gIH1cblxuICByZWNvcmRNb2R1bGVOYW1lRm9yRmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZywgbW9kdWxlTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rbm93bkZpbGVOYW1lVG9Nb2R1bGVOYW1lcy5zZXQoZmlsZU5hbWUsIG1vZHVsZU5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludmFsaWRhdGUgYWxsIGluZm9ybWF0aW9uIGRlcml2ZWQgZnJvbSB0aGUgZ2l2ZW4gZmlsZS5cbiAgICpcbiAgICogQHBhcmFtIGZpbGVOYW1lIHRoZSBmaWxlIHRvIGludmFsaWRhdGVcbiAgICovXG4gIGludmFsaWRhdGVGaWxlKGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLm1ldGFkYXRhQ2FjaGUuZGVsZXRlKGZpbGVOYW1lKTtcbiAgICB0aGlzLnJlc29sdmVkRmlsZVBhdGhzLmRlbGV0ZShmaWxlTmFtZSk7XG4gICAgY29uc3Qgc3ltYm9scyA9IHRoaXMuc3ltYm9sRnJvbUZpbGUuZ2V0KGZpbGVOYW1lKTtcbiAgICBpZiAoc3ltYm9scykge1xuICAgICAgdGhpcy5zeW1ib2xGcm9tRmlsZS5kZWxldGUoZmlsZU5hbWUpO1xuICAgICAgZm9yIChjb25zdCBzeW1ib2wgb2Ygc3ltYm9scykge1xuICAgICAgICB0aGlzLnJlc29sdmVkU3ltYm9scy5kZWxldGUoc3ltYm9sKTtcbiAgICAgICAgdGhpcy5pbXBvcnRBcy5kZWxldGUoc3ltYm9sKTtcbiAgICAgICAgdGhpcy5zeW1ib2xSZXNvdXJjZVBhdGhzLmRlbGV0ZShzeW1ib2wpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICBpZ25vcmVFcnJvcnNGb3I8VD4oY2I6ICgpID0+IFQpIHtcbiAgICBjb25zdCByZWNvcmRlciA9IHRoaXMuZXJyb3JSZWNvcmRlcjtcbiAgICB0aGlzLmVycm9yUmVjb3JkZXIgPSAoKSA9PiB7fTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGNiKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZXJyb3JSZWNvcmRlciA9IHJlY29yZGVyO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Jlc29sdmVTeW1ib2xNZW1iZXJzKHN0YXRpY1N5bWJvbDogU3RhdGljU3ltYm9sKTogUmVzb2x2ZWRTdGF0aWNTeW1ib2x8bnVsbCB7XG4gICAgY29uc3QgbWVtYmVycyA9IHN0YXRpY1N5bWJvbC5tZW1iZXJzO1xuICAgIGNvbnN0IGJhc2VSZXNvbHZlZFN5bWJvbCA9XG4gICAgICAgIHRoaXMucmVzb2x2ZVN5bWJvbCh0aGlzLmdldFN0YXRpY1N5bWJvbChzdGF0aWNTeW1ib2wuZmlsZVBhdGgsIHN0YXRpY1N5bWJvbC5uYW1lKSk7XG4gICAgaWYgKCFiYXNlUmVzb2x2ZWRTeW1ib2wpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgYmFzZU1ldGFkYXRhID0gdW53cmFwUmVzb2x2ZWRNZXRhZGF0YShiYXNlUmVzb2x2ZWRTeW1ib2wubWV0YWRhdGEpO1xuICAgIGlmIChiYXNlTWV0YWRhdGEgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgIHJldHVybiBuZXcgUmVzb2x2ZWRTdGF0aWNTeW1ib2woXG4gICAgICAgICAgc3RhdGljU3ltYm9sLCB0aGlzLmdldFN0YXRpY1N5bWJvbChiYXNlTWV0YWRhdGEuZmlsZVBhdGgsIGJhc2VNZXRhZGF0YS5uYW1lLCBtZW1iZXJzKSk7XG4gICAgfSBlbHNlIGlmIChiYXNlTWV0YWRhdGEgJiYgYmFzZU1ldGFkYXRhLl9fc3ltYm9saWMgPT09ICdjbGFzcycpIHtcbiAgICAgIGlmIChiYXNlTWV0YWRhdGEuc3RhdGljcyAmJiBtZW1iZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gbmV3IFJlc29sdmVkU3RhdGljU3ltYm9sKHN0YXRpY1N5bWJvbCwgYmFzZU1ldGFkYXRhLnN0YXRpY3NbbWVtYmVyc1swXV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdmFsdWUgPSBiYXNlTWV0YWRhdGE7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lbWJlcnMubGVuZ3RoICYmIHZhbHVlOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZVttZW1iZXJzW2ldXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUmVzb2x2ZWRTdGF0aWNTeW1ib2woc3RhdGljU3ltYm9sLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVzb2x2ZVN5bWJvbEZyb21TdW1tYXJ5KHN0YXRpY1N5bWJvbDogU3RhdGljU3ltYm9sKTogUmVzb2x2ZWRTdGF0aWNTeW1ib2x8bnVsbCB7XG4gICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuc3VtbWFyeVJlc29sdmVyLnJlc29sdmVTdW1tYXJ5KHN0YXRpY1N5bWJvbCk7XG4gICAgcmV0dXJuIHN1bW1hcnkgPyBuZXcgUmVzb2x2ZWRTdGF0aWNTeW1ib2woc3RhdGljU3ltYm9sLCBzdW1tYXJ5Lm1ldGFkYXRhKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogZ2V0U3RhdGljU3ltYm9sIHByb2R1Y2VzIGEgVHlwZSB3aG9zZSBtZXRhZGF0YSBpcyBrbm93biBidXQgd2hvc2UgaW1wbGVtZW50YXRpb24gaXMgbm90IGxvYWRlZC5cbiAgICogQWxsIHR5cGVzIHBhc3NlZCB0byB0aGUgU3RhdGljUmVzb2x2ZXIgc2hvdWxkIGJlIHBzZXVkby10eXBlcyByZXR1cm5lZCBieSB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIGRlY2xhcmF0aW9uRmlsZSB0aGUgYWJzb2x1dGUgcGF0aCBvZiB0aGUgZmlsZSB3aGVyZSB0aGUgc3ltYm9sIGlzIGRlY2xhcmVkXG4gICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSB0eXBlLlxuICAgKiBAcGFyYW0gbWVtYmVycyBhIHN5bWJvbCBmb3IgYSBzdGF0aWMgbWVtYmVyIG9mIHRoZSBuYW1lZCB0eXBlXG4gICAqL1xuICBnZXRTdGF0aWNTeW1ib2woZGVjbGFyYXRpb25GaWxlOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgbWVtYmVycz86IHN0cmluZ1tdKTogU3RhdGljU3ltYm9sIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0aWNTeW1ib2xDYWNoZS5nZXQoZGVjbGFyYXRpb25GaWxlLCBuYW1lLCBtZW1iZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBoYXNEZWNvcmF0b3JzIGNoZWNrcyBhIGZpbGUncyBtZXRhZGF0YSBmb3IgdGhlIHByZXNlbmNlIG9mIGRlY29yYXRvcnMgd2l0aG91dCBldmFsdWF0aW5nIHRoZVxuICAgKiBtZXRhZGF0YS5cbiAgICpcbiAgICogQHBhcmFtIGZpbGVQYXRoIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIGV4YW1pbmUgZm9yIGRlY29yYXRvcnMuXG4gICAqIEByZXR1cm5zIHRydWUgaWYgYW55IGNsYXNzIGluIHRoZSBmaWxlIGhhcyBhIGRlY29yYXRvci5cbiAgICovXG4gIGhhc0RlY29yYXRvcnMoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5nZXRNb2R1bGVNZXRhZGF0YShmaWxlUGF0aCk7XG4gICAgaWYgKG1ldGFkYXRhWydtZXRhZGF0YSddKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMobWV0YWRhdGFbJ21ldGFkYXRhJ10pLnNvbWUoKG1ldGFkYXRhS2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gbWV0YWRhdGFbJ21ldGFkYXRhJ11bbWV0YWRhdGFLZXldO1xuICAgICAgICByZXR1cm4gZW50cnkgJiYgZW50cnkuX19zeW1ib2xpYyA9PT0gJ2NsYXNzJyAmJiBlbnRyeS5kZWNvcmF0b3JzO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldFN5bWJvbHNPZihmaWxlUGF0aDogc3RyaW5nKTogU3RhdGljU3ltYm9sW10ge1xuICAgIGNvbnN0IHN1bW1hcnlTeW1ib2xzID0gdGhpcy5zdW1tYXJ5UmVzb2x2ZXIuZ2V0U3ltYm9sc09mKGZpbGVQYXRoKTtcbiAgICBpZiAoc3VtbWFyeVN5bWJvbHMpIHtcbiAgICAgIHJldHVybiBzdW1tYXJ5U3ltYm9scztcbiAgICB9XG4gICAgLy8gTm90ZTogU29tZSB1c2VycyB1c2UgbGlicmFyaWVzIHRoYXQgd2VyZSBub3QgY29tcGlsZWQgd2l0aCBuZ2MsIGkuZS4gdGhleSBkb24ndFxuICAgIC8vIGhhdmUgc3VtbWFyaWVzLCBvbmx5IC5kLnRzIGZpbGVzLCBidXQgYHN1bW1hcnlSZXNvbHZlci5pc0xpYnJhcnlGaWxlYCByZXR1cm5zIHRydWUuXG4gICAgdGhpcy5fY3JlYXRlU3ltYm9sc09mKGZpbGVQYXRoKTtcbiAgICBjb25zdCBtZXRhZGF0YVN5bWJvbHM6IFN0YXRpY1N5bWJvbFtdID0gW107XG4gICAgdGhpcy5yZXNvbHZlZFN5bWJvbHMuZm9yRWFjaCgocmVzb2x2ZWRTeW1ib2wpID0+IHtcbiAgICAgIGlmIChyZXNvbHZlZFN5bWJvbC5zeW1ib2wuZmlsZVBhdGggPT09IGZpbGVQYXRoKSB7XG4gICAgICAgIG1ldGFkYXRhU3ltYm9scy5wdXNoKHJlc29sdmVkU3ltYm9sLnN5bWJvbCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1ldGFkYXRhU3ltYm9scztcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZVN5bWJvbHNPZihmaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMucmVzb2x2ZWRGaWxlUGF0aHMuaGFzKGZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJlc29sdmVkRmlsZVBhdGhzLmFkZChmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVzb2x2ZWRTeW1ib2xzOiBSZXNvbHZlZFN0YXRpY1N5bWJvbFtdID0gW107XG4gICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmdldE1vZHVsZU1ldGFkYXRhKGZpbGVQYXRoKTtcbiAgICBpZiAobWV0YWRhdGFbJ2ltcG9ydEFzJ10pIHtcbiAgICAgIC8vIEluZGV4IGJ1bmRsZSBpbmRpY2VzIHNob3VsZCB1c2UgdGhlIGltcG9ydEFzIG1vZHVsZSBuYW1lIGRlZmluZWRcbiAgICAgIC8vIGluIHRoZSBidW5kbGUuXG4gICAgICB0aGlzLmtub3duRmlsZU5hbWVUb01vZHVsZU5hbWVzLnNldChmaWxlUGF0aCwgbWV0YWRhdGFbJ2ltcG9ydEFzJ10pO1xuICAgIH1cbiAgICAvLyBoYW5kbGUgdGhlIHN5bWJvbHMgaW4gb25lIG9mIHRoZSByZS1leHBvcnQgbG9jYXRpb25cbiAgICBpZiAobWV0YWRhdGFbJ2V4cG9ydHMnXSkge1xuICAgICAgZm9yIChjb25zdCBtb2R1bGVFeHBvcnQgb2YgbWV0YWRhdGFbJ2V4cG9ydHMnXSkge1xuICAgICAgICAvLyBoYW5kbGUgdGhlIHN5bWJvbHMgaW4gdGhlIGxpc3Qgb2YgZXhwbGljaXRseSByZS1leHBvcnRlZCBzeW1ib2xzLlxuICAgICAgICBpZiAobW9kdWxlRXhwb3J0LmV4cG9ydCkge1xuICAgICAgICAgIG1vZHVsZUV4cG9ydC5leHBvcnQuZm9yRWFjaCgoZXhwb3J0U3ltYm9sOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGxldCBzeW1ib2xOYW1lOiBzdHJpbmc7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV4cG9ydFN5bWJvbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgc3ltYm9sTmFtZSA9IGV4cG9ydFN5bWJvbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN5bWJvbE5hbWUgPSBleHBvcnRTeW1ib2wuYXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzeW1ib2xOYW1lID0gdW5lc2NhcGVJZGVudGlmaWVyKHN5bWJvbE5hbWUpO1xuICAgICAgICAgICAgbGV0IHN5bU5hbWUgPSBzeW1ib2xOYW1lO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRTeW1ib2wgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHN5bU5hbWUgPSB1bmVzY2FwZUlkZW50aWZpZXIoZXhwb3J0U3ltYm9sLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRNb2R1bGUgPSB0aGlzLnJlc29sdmVNb2R1bGUobW9kdWxlRXhwb3J0LmZyb20sIGZpbGVQYXRoKTtcbiAgICAgICAgICAgIGlmIChyZXNvbHZlZE1vZHVsZSkge1xuICAgICAgICAgICAgICBjb25zdCB0YXJnZXRTeW1ib2wgPSB0aGlzLmdldFN0YXRpY1N5bWJvbChyZXNvbHZlZE1vZHVsZSwgc3ltTmFtZSk7XG4gICAgICAgICAgICAgIGNvbnN0IHNvdXJjZVN5bWJvbCA9IHRoaXMuZ2V0U3RhdGljU3ltYm9sKGZpbGVQYXRoLCBzeW1ib2xOYW1lKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZWRTeW1ib2xzLnB1c2godGhpcy5jcmVhdGVFeHBvcnQoc291cmNlU3ltYm9sLCB0YXJnZXRTeW1ib2wpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBoYW5kbGUgdGhlIHN5bWJvbHMgdmlhIGV4cG9ydCAqIGRpcmVjdGl2ZXMuXG4gICAgICAgICAgY29uc3QgcmVzb2x2ZWRNb2R1bGUgPSB0aGlzLnJlc29sdmVNb2R1bGUobW9kdWxlRXhwb3J0LmZyb20sIGZpbGVQYXRoKTtcbiAgICAgICAgICBpZiAocmVzb2x2ZWRNb2R1bGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5lc3RlZEV4cG9ydHMgPSB0aGlzLmdldFN5bWJvbHNPZihyZXNvbHZlZE1vZHVsZSk7XG4gICAgICAgICAgICBuZXN0ZWRFeHBvcnRzLmZvckVhY2goKHRhcmdldFN5bWJvbCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzb3VyY2VTeW1ib2wgPSB0aGlzLmdldFN0YXRpY1N5bWJvbChmaWxlUGF0aCwgdGFyZ2V0U3ltYm9sLm5hbWUpO1xuICAgICAgICAgICAgICByZXNvbHZlZFN5bWJvbHMucHVzaCh0aGlzLmNyZWF0ZUV4cG9ydChzb3VyY2VTeW1ib2wsIHRhcmdldFN5bWJvbCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIHRoZSBhY3R1YWwgbWV0YWRhdGEuIEhhcyB0byBiZSBhZnRlciB0aGUgZXhwb3J0c1xuICAgIC8vIGFzIHRoZXJlIG1pZ3RoIGJlIGNvbGxpc2lvbnMgaW4gdGhlIG5hbWVzLCBhbmQgd2Ugd2FudCB0aGUgc3ltYm9sc1xuICAgIC8vIG9mIHRoZSBjdXJyZW50IG1vZHVsZSB0byB3aW4gb2Z0ZXIgcmVleHBvcnRzLlxuICAgIGlmIChtZXRhZGF0YVsnbWV0YWRhdGEnXSkge1xuICAgICAgLy8gaGFuZGxlIGRpcmVjdCBkZWNsYXJhdGlvbnMgb2YgdGhlIHN5bWJvbFxuICAgICAgY29uc3QgdG9wTGV2ZWxTeW1ib2xOYW1lcyA9XG4gICAgICAgICAgbmV3IFNldDxzdHJpbmc+KE9iamVjdC5rZXlzKG1ldGFkYXRhWydtZXRhZGF0YSddKS5tYXAodW5lc2NhcGVJZGVudGlmaWVyKSk7XG4gICAgICBjb25zdCBvcmlnaW5zOiB7W2luZGV4OiBzdHJpbmddOiBzdHJpbmd9ID0gbWV0YWRhdGFbJ29yaWdpbnMnXSB8fCB7fTtcbiAgICAgIE9iamVjdC5rZXlzKG1ldGFkYXRhWydtZXRhZGF0YSddKS5mb3JFYWNoKChtZXRhZGF0YUtleSkgPT4ge1xuICAgICAgICBjb25zdCBzeW1ib2xNZXRhID0gbWV0YWRhdGFbJ21ldGFkYXRhJ11bbWV0YWRhdGFLZXldO1xuICAgICAgICBjb25zdCBuYW1lID0gdW5lc2NhcGVJZGVudGlmaWVyKG1ldGFkYXRhS2V5KTtcblxuICAgICAgICBjb25zdCBzeW1ib2wgPSB0aGlzLmdldFN0YXRpY1N5bWJvbChmaWxlUGF0aCwgbmFtZSk7XG5cbiAgICAgICAgY29uc3Qgb3JpZ2luID0gb3JpZ2lucy5oYXNPd25Qcm9wZXJ0eShtZXRhZGF0YUtleSkgJiYgb3JpZ2luc1ttZXRhZGF0YUtleV07XG4gICAgICAgIGlmIChvcmlnaW4pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgc3ltYm9sIGlzIGZyb20gYSBidW5kbGVkIGluZGV4LCB1c2UgdGhlIGRlY2xhcmF0aW9uIGxvY2F0aW9uIG9mIHRoZVxuICAgICAgICAgIC8vIHN5bWJvbCBzbyByZWxhdGl2ZSByZWZlcmVuY2VzIChzdWNoIGFzICcuL215Lmh0bWwnKSB3aWxsIGJlIGNhbGN1bGF0ZWRcbiAgICAgICAgICAvLyBjb3JyZWN0bHkuXG4gICAgICAgICAgY29uc3Qgb3JpZ2luRmlsZVBhdGggPSB0aGlzLnJlc29sdmVNb2R1bGUob3JpZ2luLCBmaWxlUGF0aCk7XG4gICAgICAgICAgaWYgKCFvcmlnaW5GaWxlUGF0aCkge1xuICAgICAgICAgICAgdGhpcy5yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgICBuZXcgRXJyb3IoYENvdWxkbid0IHJlc29sdmUgb3JpZ2luYWwgc3ltYm9sIGZvciAke29yaWdpbn0gZnJvbSAke2ZpbGVQYXRofWApKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zeW1ib2xSZXNvdXJjZVBhdGhzLnNldChzeW1ib2wsIG9yaWdpbkZpbGVQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZWRTeW1ib2xzLnB1c2goXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJlc29sdmVkU3ltYm9sKHN5bWJvbCwgZmlsZVBhdGgsIHRvcExldmVsU3ltYm9sTmFtZXMsIHN5bWJvbE1ldGEpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXNvbHZlZFN5bWJvbHMuZm9yRWFjaChcbiAgICAgICAgKHJlc29sdmVkU3ltYm9sKSA9PiB0aGlzLnJlc29sdmVkU3ltYm9scy5zZXQocmVzb2x2ZWRTeW1ib2wuc3ltYm9sLCByZXNvbHZlZFN5bWJvbCkpO1xuICAgIHRoaXMuc3ltYm9sRnJvbUZpbGUuc2V0KGZpbGVQYXRoLCByZXNvbHZlZFN5bWJvbHMubWFwKHJlc29sdmVkU3ltYm9sID0+IHJlc29sdmVkU3ltYm9sLnN5bWJvbCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVSZXNvbHZlZFN5bWJvbChcbiAgICAgIHNvdXJjZVN5bWJvbDogU3RhdGljU3ltYm9sLCB0b3BMZXZlbFBhdGg6IHN0cmluZywgdG9wTGV2ZWxTeW1ib2xOYW1lczogU2V0PHN0cmluZz4sXG4gICAgICBtZXRhZGF0YTogYW55KTogUmVzb2x2ZWRTdGF0aWNTeW1ib2wge1xuICAgIC8vIEZvciBjbGFzc2VzIHRoYXQgZG9uJ3QgaGF2ZSBBbmd1bGFyIHN1bW1hcmllcyAvIG1ldGFkYXRhLFxuICAgIC8vIHdlIG9ubHkga2VlcCB0aGVpciBhcml0eSwgYnV0IG5vdGhpbmcgZWxzZVxuICAgIC8vIChlLmcuIHRoZWlyIGNvbnN0cnVjdG9yIHBhcmFtZXRlcnMpLlxuICAgIC8vIFdlIGRvIHRoaXMgdG8gcHJldmVudCBpbnRyb2R1Y2luZyBkZWVwIGltcG9ydHNcbiAgICAvLyBhcyB3ZSBkaWRuJ3QgZ2VuZXJhdGUgLm5nZmFjdG9yeS50cyBmaWxlcyB3aXRoIHByb3BlciByZWV4cG9ydHMuXG4gICAgY29uc3QgaXNUc0ZpbGUgPSBUUy50ZXN0KHNvdXJjZVN5bWJvbC5maWxlUGF0aCk7XG4gICAgaWYgKHRoaXMuc3VtbWFyeVJlc29sdmVyLmlzTGlicmFyeUZpbGUoc291cmNlU3ltYm9sLmZpbGVQYXRoKSAmJiAhaXNUc0ZpbGUgJiYgbWV0YWRhdGEgJiZcbiAgICAgICAgbWV0YWRhdGFbJ19fc3ltYm9saWMnXSA9PT0gJ2NsYXNzJykge1xuICAgICAgY29uc3QgdHJhbnNmb3JtZWRNZXRhID0ge19fc3ltYm9saWM6ICdjbGFzcycsIGFyaXR5OiBtZXRhZGF0YS5hcml0eX07XG4gICAgICByZXR1cm4gbmV3IFJlc29sdmVkU3RhdGljU3ltYm9sKHNvdXJjZVN5bWJvbCwgdHJhbnNmb3JtZWRNZXRhKTtcbiAgICB9XG5cbiAgICBsZXQgX29yaWdpbmFsRmlsZU1lbW86IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgY29uc3QgZ2V0T3JpZ2luYWxOYW1lOiAoKSA9PiBzdHJpbmcgPSAoKSA9PiB7XG4gICAgICBpZiAoIV9vcmlnaW5hbEZpbGVNZW1vKSB7XG4gICAgICAgIC8vIEd1ZXNzIHdoYXQgaHRlIG9yaWdpbmFsIGZpbGUgbmFtZSBpcyBmcm9tIHRoZSByZWZlcmVuY2UuIElmIGl0IGhhcyBhIGAuZC50c2AgZXh0ZW5zaW9uXG4gICAgICAgIC8vIHJlcGxhY2UgaXQgd2l0aCBgLnRzYC4gSWYgaXQgYWxyZWFkeSBoYXMgYC50c2AganVzdCBsZWF2ZSBpdCBpbiBwbGFjZS4gSWYgaXQgZG9lc24ndCBoYXZlXG4gICAgICAgIC8vIC50cyBvciAuZC50cywgYXBwZW5kIGAudHMnLiBBbHNvLCBpZiBpdCBpcyBpbiBgbm9kZV9tb2R1bGVzYCwgdHJpbSB0aGUgYG5vZGVfbW9kdWxlYFxuICAgICAgICAvLyBsb2NhdGlvbiBhcyBpdCBpcyBub3QgaW1wb3J0YW50IHRvIGZpbmRpbmcgdGhlIGZpbGUuXG4gICAgICAgIF9vcmlnaW5hbEZpbGVNZW1vID1cbiAgICAgICAgICAgIHRoaXMuaG9zdC5nZXRPdXRwdXROYW1lKHRvcExldmVsUGF0aC5yZXBsYWNlKC8oKFxcLnRzKXwoXFwuZFxcLnRzKXwpJC8sICcudHMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLipub2RlX21vZHVsZXNbL1xcXFxdLywgJycpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfb3JpZ2luYWxGaWxlTWVtbztcbiAgICB9O1xuXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBjbGFzcyBSZWZlcmVuY2VUcmFuc2Zvcm1lciBleHRlbmRzIFZhbHVlVHJhbnNmb3JtZXIge1xuICAgICAgdmlzaXRTdHJpbmdNYXAobWFwOiB7W2tleTogc3RyaW5nXTogYW55fSwgZnVuY3Rpb25QYXJhbXM6IHN0cmluZ1tdKTogYW55IHtcbiAgICAgICAgY29uc3Qgc3ltYm9saWMgPSBtYXBbJ19fc3ltYm9saWMnXTtcbiAgICAgICAgaWYgKHN5bWJvbGljID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc3Qgb2xkTGVuID0gZnVuY3Rpb25QYXJhbXMubGVuZ3RoO1xuICAgICAgICAgIGZ1bmN0aW9uUGFyYW1zLnB1c2goLi4uKG1hcFsncGFyYW1ldGVycyddIHx8IFtdKSk7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gc3VwZXIudmlzaXRTdHJpbmdNYXAobWFwLCBmdW5jdGlvblBhcmFtcyk7XG4gICAgICAgICAgZnVuY3Rpb25QYXJhbXMubGVuZ3RoID0gb2xkTGVuO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoc3ltYm9saWMgPT09ICdyZWZlcmVuY2UnKSB7XG4gICAgICAgICAgY29uc3QgbW9kdWxlID0gbWFwWydtb2R1bGUnXTtcbiAgICAgICAgICBjb25zdCBuYW1lID0gbWFwWyduYW1lJ10gPyB1bmVzY2FwZUlkZW50aWZpZXIobWFwWyduYW1lJ10pIDogbWFwWyduYW1lJ107XG4gICAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgICAgaWYgKG1vZHVsZSkge1xuICAgICAgICAgICAgZmlsZVBhdGggPSBzZWxmLnJlc29sdmVNb2R1bGUobW9kdWxlLCBzb3VyY2VTeW1ib2wuZmlsZVBhdGgpICE7XG4gICAgICAgICAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgX19zeW1ib2xpYzogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQ291bGQgbm90IHJlc29sdmUgJHttb2R1bGV9IHJlbGF0aXZlIHRvICR7c291cmNlU3ltYm9sLmZpbGVQYXRofS5gLFxuICAgICAgICAgICAgICAgIGxpbmU6IG1hcC5saW5lLFxuICAgICAgICAgICAgICAgIGNoYXJhY3RlcjogbWFwLmNoYXJhY3RlcixcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogZ2V0T3JpZ2luYWxOYW1lKClcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIF9fc3ltYm9saWM6ICdyZXNvbHZlZCcsXG4gICAgICAgICAgICAgIHN5bWJvbDogc2VsZi5nZXRTdGF0aWNTeW1ib2woZmlsZVBhdGgsIG5hbWUpLFxuICAgICAgICAgICAgICBsaW5lOiBtYXAubGluZSxcbiAgICAgICAgICAgICAgY2hhcmFjdGVyOiBtYXAuY2hhcmFjdGVyLFxuICAgICAgICAgICAgICBmaWxlTmFtZTogZ2V0T3JpZ2luYWxOYW1lKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIGlmIChmdW5jdGlvblBhcmFtcy5pbmRleE9mKG5hbWUpID49IDApIHtcbiAgICAgICAgICAgIC8vIHJlZmVyZW5jZSB0byBhIGZ1bmN0aW9uIHBhcmFtZXRlclxuICAgICAgICAgICAgcmV0dXJuIHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZTogbmFtZX07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0b3BMZXZlbFN5bWJvbE5hbWVzLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRTdGF0aWNTeW1ib2wodG9wTGV2ZWxQYXRoLCBuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGFtYmllbnQgdmFsdWVcbiAgICAgICAgICAgIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHN5bWJvbGljID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgcmV0dXJuIHsuLi5tYXAsIGZpbGVOYW1lOiBnZXRPcmlnaW5hbE5hbWUoKX07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHN1cGVyLnZpc2l0U3RyaW5nTWFwKG1hcCwgZnVuY3Rpb25QYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHRyYW5zZm9ybWVkTWV0YSA9IHZpc2l0VmFsdWUobWV0YWRhdGEsIG5ldyBSZWZlcmVuY2VUcmFuc2Zvcm1lcigpLCBbXSk7XG4gICAgbGV0IHVud3JhcHBlZFRyYW5zZm9ybWVkTWV0YSA9IHVud3JhcFJlc29sdmVkTWV0YWRhdGEodHJhbnNmb3JtZWRNZXRhKTtcbiAgICBpZiAodW53cmFwcGVkVHJhbnNmb3JtZWRNZXRhIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVFeHBvcnQoc291cmNlU3ltYm9sLCB1bndyYXBwZWRUcmFuc2Zvcm1lZE1ldGEpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFJlc29sdmVkU3RhdGljU3ltYm9sKHNvdXJjZVN5bWJvbCwgdHJhbnNmb3JtZWRNZXRhKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlRXhwb3J0KHNvdXJjZVN5bWJvbDogU3RhdGljU3ltYm9sLCB0YXJnZXRTeW1ib2w6IFN0YXRpY1N5bWJvbCk6XG4gICAgICBSZXNvbHZlZFN0YXRpY1N5bWJvbCB7XG4gICAgc291cmNlU3ltYm9sLmFzc2VydE5vTWVtYmVycygpO1xuICAgIHRhcmdldFN5bWJvbC5hc3NlcnROb01lbWJlcnMoKTtcbiAgICBpZiAodGhpcy5zdW1tYXJ5UmVzb2x2ZXIuaXNMaWJyYXJ5RmlsZShzb3VyY2VTeW1ib2wuZmlsZVBhdGgpICYmXG4gICAgICAgIHRoaXMuc3VtbWFyeVJlc29sdmVyLmlzTGlicmFyeUZpbGUodGFyZ2V0U3ltYm9sLmZpbGVQYXRoKSkge1xuICAgICAgLy8gVGhpcyBjYXNlIGlzIGZvciBhbiBuZyBsaWJyYXJ5IGltcG9ydGluZyBzeW1ib2xzIGZyb20gYSBwbGFpbiB0cyBsaWJyYXJ5XG4gICAgICAvLyB0cmFuc2l0aXZlbHkuXG4gICAgICAvLyBOb3RlOiBXZSByZWx5IG9uIHRoZSBmYWN0IHRoYXQgd2UgZGlzY292ZXIgc3ltYm9scyBpbiB0aGUgZGlyZWN0aW9uXG4gICAgICAvLyBmcm9tIHNvdXJjZSBmaWxlcyB0byBsaWJyYXJ5IGZpbGVzXG4gICAgICB0aGlzLmltcG9ydEFzLnNldCh0YXJnZXRTeW1ib2wsIHRoaXMuZ2V0SW1wb3J0QXMoc291cmNlU3ltYm9sKSB8fCBzb3VyY2VTeW1ib2wpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFJlc29sdmVkU3RhdGljU3ltYm9sKHNvdXJjZVN5bWJvbCwgdGFyZ2V0U3ltYm9sKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVwb3J0RXJyb3IoZXJyb3I6IEVycm9yLCBjb250ZXh0PzogU3RhdGljU3ltYm9sLCBwYXRoPzogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuZXJyb3JSZWNvcmRlcikge1xuICAgICAgdGhpcy5lcnJvclJlY29yZGVyKGVycm9yLCAoY29udGV4dCAmJiBjb250ZXh0LmZpbGVQYXRoKSB8fCBwYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtb2R1bGUgYW4gYWJzb2x1dGUgcGF0aCB0byBhIG1vZHVsZSBmaWxlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRNb2R1bGVNZXRhZGF0YShtb2R1bGU6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgbW9kdWxlTWV0YWRhdGEgPSB0aGlzLm1ldGFkYXRhQ2FjaGUuZ2V0KG1vZHVsZSk7XG4gICAgaWYgKCFtb2R1bGVNZXRhZGF0YSkge1xuICAgICAgY29uc3QgbW9kdWxlTWV0YWRhdGFzID0gdGhpcy5ob3N0LmdldE1ldGFkYXRhRm9yKG1vZHVsZSk7XG4gICAgICBpZiAobW9kdWxlTWV0YWRhdGFzKSB7XG4gICAgICAgIGxldCBtYXhWZXJzaW9uID0gLTE7XG4gICAgICAgIG1vZHVsZU1ldGFkYXRhcy5mb3JFYWNoKChtZCkgPT4ge1xuICAgICAgICAgIGlmIChtZCAmJiBtZFsndmVyc2lvbiddID4gbWF4VmVyc2lvbikge1xuICAgICAgICAgICAgbWF4VmVyc2lvbiA9IG1kWyd2ZXJzaW9uJ107XG4gICAgICAgICAgICBtb2R1bGVNZXRhZGF0YSA9IG1kO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoIW1vZHVsZU1ldGFkYXRhKSB7XG4gICAgICAgIG1vZHVsZU1ldGFkYXRhID1cbiAgICAgICAgICAgIHtfX3N5bWJvbGljOiAnbW9kdWxlJywgdmVyc2lvbjogU1VQUE9SVEVEX1NDSEVNQV9WRVJTSU9OLCBtb2R1bGU6IG1vZHVsZSwgbWV0YWRhdGE6IHt9fTtcbiAgICAgIH1cbiAgICAgIGlmIChtb2R1bGVNZXRhZGF0YVsndmVyc2lvbiddICE9IFNVUFBPUlRFRF9TQ0hFTUFfVkVSU0lPTikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBtb2R1bGVNZXRhZGF0YVsndmVyc2lvbiddID09IDIgP1xuICAgICAgICAgICAgYFVuc3VwcG9ydGVkIG1ldGFkYXRhIHZlcnNpb24gJHttb2R1bGVNZXRhZGF0YVsndmVyc2lvbiddfSBmb3IgbW9kdWxlICR7bW9kdWxlfS4gVGhpcyBtb2R1bGUgc2hvdWxkIGJlIGNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIG5nY2AgOlxuICAgICAgICAgICAgYE1ldGFkYXRhIHZlcnNpb24gbWlzbWF0Y2ggZm9yIG1vZHVsZSAke21vZHVsZX0sIGZvdW5kIHZlcnNpb24gJHttb2R1bGVNZXRhZGF0YVsndmVyc2lvbiddfSwgZXhwZWN0ZWQgJHtTVVBQT1JURURfU0NIRU1BX1ZFUlNJT059YDtcbiAgICAgICAgdGhpcy5yZXBvcnRFcnJvcihuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgICB9XG4gICAgICB0aGlzLm1ldGFkYXRhQ2FjaGUuc2V0KG1vZHVsZSwgbW9kdWxlTWV0YWRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gbW9kdWxlTWV0YWRhdGE7XG4gIH1cblxuXG4gIGdldFN5bWJvbEJ5TW9kdWxlKG1vZHVsZTogc3RyaW5nLCBzeW1ib2xOYW1lOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlPzogc3RyaW5nKTogU3RhdGljU3ltYm9sIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMucmVzb2x2ZU1vZHVsZShtb2R1bGUsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICAgIG5ldyBFcnJvcihgQ291bGQgbm90IHJlc29sdmUgbW9kdWxlICR7bW9kdWxlfSR7Y29udGFpbmluZ0ZpbGUgPyAnIHJlbGF0aXZlIHRvICcgK1xuICAgICAgICAgICAgY29udGFpbmluZ0ZpbGUgOiAnJ31gKSk7XG4gICAgICByZXR1cm4gdGhpcy5nZXRTdGF0aWNTeW1ib2woYEVSUk9SOiR7bW9kdWxlfWAsIHN5bWJvbE5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0aWNTeW1ib2woZmlsZVBhdGgsIHN5bWJvbE5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlTW9kdWxlKG1vZHVsZTogc3RyaW5nLCBjb250YWluaW5nRmlsZT86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuaG9zdC5tb2R1bGVOYW1lVG9GaWxlTmFtZShtb2R1bGUsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBDb3VsZCBub3QgcmVzb2x2ZSBtb2R1bGUgJyR7bW9kdWxlfScgcmVsYXRpdmUgdG8gZmlsZSAke2NvbnRhaW5pbmdGaWxlfWApO1xuICAgICAgdGhpcy5yZXBvcnRFcnJvcihlLCB1bmRlZmluZWQsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLy8gUmVtb3ZlIGV4dHJhIHVuZGVyc2NvcmUgZnJvbSBlc2NhcGVkIGlkZW50aWZpZXIuXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2Jsb2IvbWFzdGVyL3NyYy9jb21waWxlci91dGlsaXRpZXMudHNcbmV4cG9ydCBmdW5jdGlvbiB1bmVzY2FwZUlkZW50aWZpZXIoaWRlbnRpZmllcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlkZW50aWZpZXIuc3RhcnRzV2l0aCgnX19fJykgPyBpZGVudGlmaWVyLnN1YnN0cigxKSA6IGlkZW50aWZpZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXBSZXNvbHZlZE1ldGFkYXRhKG1ldGFkYXRhOiBhbnkpOiBhbnkge1xuICBpZiAobWV0YWRhdGEgJiYgbWV0YWRhdGEuX19zeW1ib2xpYyA9PT0gJ3Jlc29sdmVkJykge1xuICAgIHJldHVybiBtZXRhZGF0YS5zeW1ib2w7XG4gIH1cbiAgcmV0dXJuIG1ldGFkYXRhO1xufSJdfQ==