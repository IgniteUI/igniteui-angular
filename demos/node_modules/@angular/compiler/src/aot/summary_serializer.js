(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/aot/summary_serializer", ["require", "exports", "tslib", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/util", "@angular/compiler/src/aot/static_symbol", "@angular/compiler/src/aot/static_symbol_resolver", "@angular/compiler/src/aot/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var o = require("@angular/compiler/src/output/output_ast");
    var util_1 = require("@angular/compiler/src/util");
    var static_symbol_1 = require("@angular/compiler/src/aot/static_symbol");
    var static_symbol_resolver_1 = require("@angular/compiler/src/aot/static_symbol_resolver");
    var util_2 = require("@angular/compiler/src/aot/util");
    function serializeSummaries(srcFileName, forJitCtx, summaryResolver, symbolResolver, symbols, types) {
        var toJsonSerializer = new ToJsonSerializer(symbolResolver, summaryResolver, srcFileName);
        // for symbols, we use everything except for the class metadata itself
        // (we keep the statics though), as the class metadata is contained in the
        // CompileTypeSummary.
        symbols.forEach(function (resolvedSymbol) { return toJsonSerializer.addSummary({ symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata }); });
        // Add type summaries.
        types.forEach(function (_a) {
            var summary = _a.summary, metadata = _a.metadata;
            toJsonSerializer.addSummary({ symbol: summary.type.reference, metadata: undefined, type: summary });
        });
        var _a = toJsonSerializer.serialize(), json = _a.json, exportAs = _a.exportAs;
        if (forJitCtx) {
            var forJitSerializer_1 = new ForJitSerializer(forJitCtx, symbolResolver, summaryResolver);
            types.forEach(function (_a) {
                var summary = _a.summary, metadata = _a.metadata;
                forJitSerializer_1.addSourceType(summary, metadata);
            });
            toJsonSerializer.unprocessedSymbolSummariesBySymbol.forEach(function (summary) {
                if (summaryResolver.isLibraryFile(summary.symbol.filePath) && summary.type) {
                    forJitSerializer_1.addLibType(summary.type);
                }
            });
            forJitSerializer_1.serialize(exportAs);
        }
        return { json: json, exportAs: exportAs };
    }
    exports.serializeSummaries = serializeSummaries;
    function deserializeSummaries(symbolCache, summaryResolver, libraryFileName, json) {
        var deserializer = new FromJsonDeserializer(symbolCache, summaryResolver);
        return deserializer.deserialize(libraryFileName, json);
    }
    exports.deserializeSummaries = deserializeSummaries;
    function createForJitStub(outputCtx, reference) {
        return createSummaryForJitFunction(outputCtx, reference, o.NULL_EXPR);
    }
    exports.createForJitStub = createForJitStub;
    function createSummaryForJitFunction(outputCtx, reference, value) {
        var fnName = util_2.summaryForJitName(reference.name);
        outputCtx.statements.push(o.fn([], [new o.ReturnStatement(value)], new o.ArrayType(o.DYNAMIC_TYPE)).toDeclStmt(fnName, [
            o.StmtModifier.Final, o.StmtModifier.Exported
        ]));
    }
    var ToJsonSerializer = /** @class */ (function (_super) {
        tslib_1.__extends(ToJsonSerializer, _super);
        function ToJsonSerializer(symbolResolver, summaryResolver, srcFileName) {
            var _this = _super.call(this) || this;
            _this.symbolResolver = symbolResolver;
            _this.summaryResolver = summaryResolver;
            _this.srcFileName = srcFileName;
            // Note: This only contains symbols without members.
            _this.symbols = [];
            _this.indexBySymbol = new Map();
            _this.reexportedBy = new Map();
            // This now contains a `__symbol: number` in the place of
            // StaticSymbols, but otherwise has the same shape as the original objects.
            _this.processedSummaryBySymbol = new Map();
            _this.processedSummaries = [];
            _this.unprocessedSymbolSummariesBySymbol = new Map();
            _this.moduleName = symbolResolver.getKnownModuleName(srcFileName);
            return _this;
        }
        ToJsonSerializer.prototype.addSummary = function (summary) {
            var _this = this;
            var unprocessedSummary = this.unprocessedSymbolSummariesBySymbol.get(summary.symbol);
            var processedSummary = this.processedSummaryBySymbol.get(summary.symbol);
            if (!unprocessedSummary) {
                unprocessedSummary = { symbol: summary.symbol, metadata: undefined };
                this.unprocessedSymbolSummariesBySymbol.set(summary.symbol, unprocessedSummary);
                processedSummary = { symbol: this.processValue(summary.symbol, 0 /* None */) };
                this.processedSummaries.push(processedSummary);
                this.processedSummaryBySymbol.set(summary.symbol, processedSummary);
            }
            if (!unprocessedSummary.metadata && summary.metadata) {
                var metadata_1 = summary.metadata || {};
                if (metadata_1.__symbolic === 'class') {
                    // For classes, we keep everything except their class decorators.
                    // We need to keep e.g. the ctor args, method names, method decorators
                    // so that the class can be extended in another compilation unit.
                    // We don't keep the class decorators as
                    // 1) they refer to data
                    //   that should not cause a rebuild of downstream compilation units
                    //   (e.g. inline templates of @Component, or @NgModule.declarations)
                    // 2) their data is already captured in TypeSummaries, e.g. DirectiveSummary.
                    var clone_1 = {};
                    Object.keys(metadata_1).forEach(function (propName) {
                        if (propName !== 'decorators') {
                            clone_1[propName] = metadata_1[propName];
                        }
                    });
                    metadata_1 = clone_1;
                }
                else if (isCall(metadata_1)) {
                    if (!isFunctionCall(metadata_1) && !isMethodCallOnVariable(metadata_1)) {
                        // Don't store complex calls as we won't be able to simplify them anyways later on.
                        metadata_1 = {
                            __symbolic: 'error',
                            message: 'Complex function calls are not supported.',
                        };
                    }
                }
                // Note: We need to keep storing ctor calls for e.g.
                // `export const x = new InjectionToken(...)`
                unprocessedSummary.metadata = metadata_1;
                processedSummary.metadata = this.processValue(metadata_1, 1 /* ResolveValue */);
                if (metadata_1 instanceof static_symbol_1.StaticSymbol &&
                    this.summaryResolver.isLibraryFile(metadata_1.filePath)) {
                    var declarationSymbol = this.symbols[this.indexBySymbol.get(metadata_1)];
                    if (!util_2.isLoweredSymbol(declarationSymbol.name)) {
                        // Note: symbols that were introduced during codegen in the user file can have a reexport
                        // if a user used `export *`. However, we can't rely on this as tsickle will change
                        // `export *` into named exports, using only the information from the typechecker.
                        // As we introduce the new symbols after typecheck, Tsickle does not know about them,
                        // and omits them when expanding `export *`.
                        // So we have to keep reexporting these symbols manually via .ngfactory files.
                        this.reexportedBy.set(declarationSymbol, summary.symbol);
                    }
                }
            }
            if (!unprocessedSummary.type && summary.type) {
                unprocessedSummary.type = summary.type;
                // Note: We don't add the summaries of all referenced symbols as for the ResolvedSymbols,
                // as the type summaries already contain the transitive data that they require
                // (in a minimal way).
                processedSummary.type = this.processValue(summary.type, 0 /* None */);
                // except for reexported directives / pipes, so we need to store
                // their summaries explicitly.
                if (summary.type.summaryKind === compile_metadata_1.CompileSummaryKind.NgModule) {
                    var ngModuleSummary = summary.type;
                    ngModuleSummary.exportedDirectives.concat(ngModuleSummary.exportedPipes).forEach(function (id) {
                        var symbol = id.reference;
                        if (_this.summaryResolver.isLibraryFile(symbol.filePath) &&
                            !_this.unprocessedSymbolSummariesBySymbol.has(symbol)) {
                            var summary_1 = _this.summaryResolver.resolveSummary(symbol);
                            if (summary_1) {
                                _this.addSummary(summary_1);
                            }
                        }
                    });
                }
            }
        };
        ToJsonSerializer.prototype.serialize = function () {
            var _this = this;
            var exportAs = [];
            var json = JSON.stringify({
                moduleName: this.moduleName,
                summaries: this.processedSummaries,
                symbols: this.symbols.map(function (symbol, index) {
                    symbol.assertNoMembers();
                    var importAs = undefined;
                    if (_this.summaryResolver.isLibraryFile(symbol.filePath)) {
                        var reexportSymbol = _this.reexportedBy.get(symbol);
                        if (reexportSymbol) {
                            importAs = _this.indexBySymbol.get(reexportSymbol);
                        }
                        else {
                            var summary = _this.unprocessedSymbolSummariesBySymbol.get(symbol);
                            if (!summary || !summary.metadata || summary.metadata.__symbolic !== 'interface') {
                                importAs = symbol.name + "_" + index;
                                exportAs.push({ symbol: symbol, exportAs: importAs });
                            }
                        }
                    }
                    return {
                        __symbol: index,
                        name: symbol.name,
                        filePath: _this.summaryResolver.toSummaryFileName(symbol.filePath, _this.srcFileName),
                        importAs: importAs
                    };
                })
            });
            return { json: json, exportAs: exportAs };
        };
        ToJsonSerializer.prototype.processValue = function (value, flags) {
            return util_1.visitValue(value, this, flags);
        };
        ToJsonSerializer.prototype.visitOther = function (value, context) {
            if (value instanceof static_symbol_1.StaticSymbol) {
                var baseSymbol = this.symbolResolver.getStaticSymbol(value.filePath, value.name);
                var index = this.visitStaticSymbol(baseSymbol, context);
                return { __symbol: index, members: value.members };
            }
        };
        /**
         * Strip line and character numbers from ngsummaries.
         * Emitting them causes white spaces changes to retrigger upstream
         * recompilations in bazel.
         * TODO: find out a way to have line and character numbers in errors without
         * excessive recompilation in bazel.
         */
        ToJsonSerializer.prototype.visitStringMap = function (map, context) {
            if (map['__symbolic'] === 'resolved') {
                return util_1.visitValue(map.symbol, this, context);
            }
            if (map['__symbolic'] === 'error') {
                delete map['line'];
                delete map['character'];
            }
            return _super.prototype.visitStringMap.call(this, map, context);
        };
        /**
         * Returns null if the options.resolveValue is true, and the summary for the symbol
         * resolved to a type or could not be resolved.
         */
        ToJsonSerializer.prototype.visitStaticSymbol = function (baseSymbol, flags) {
            var index = this.indexBySymbol.get(baseSymbol);
            var summary = null;
            if (flags & 1 /* ResolveValue */ &&
                this.summaryResolver.isLibraryFile(baseSymbol.filePath)) {
                if (this.unprocessedSymbolSummariesBySymbol.has(baseSymbol)) {
                    // the summary for this symbol was already added
                    // -> nothing to do.
                    return index;
                }
                summary = this.loadSummary(baseSymbol);
                if (summary && summary.metadata instanceof static_symbol_1.StaticSymbol) {
                    // The summary is a reexport
                    index = this.visitStaticSymbol(summary.metadata, flags);
                    // reset the summary as it is just a reexport, so we don't want to store it.
                    summary = null;
                }
            }
            else if (index != null) {
                // Note: == on purpose to compare with undefined!
                // No summary and the symbol is already added -> nothing to do.
                return index;
            }
            // Note: == on purpose to compare with undefined!
            if (index == null) {
                index = this.symbols.length;
                this.symbols.push(baseSymbol);
            }
            this.indexBySymbol.set(baseSymbol, index);
            if (summary) {
                this.addSummary(summary);
            }
            return index;
        };
        ToJsonSerializer.prototype.loadSummary = function (symbol) {
            var summary = this.summaryResolver.resolveSummary(symbol);
            if (!summary) {
                // some symbols might originate from a plain typescript library
                // that just exported .d.ts and .metadata.json files, i.e. where no summary
                // files were created.
                var resolvedSymbol = this.symbolResolver.resolveSymbol(symbol);
                if (resolvedSymbol) {
                    summary = { symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata };
                }
            }
            return summary;
        };
        return ToJsonSerializer;
    }(util_1.ValueTransformer));
    var ForJitSerializer = /** @class */ (function () {
        function ForJitSerializer(outputCtx, symbolResolver, summaryResolver) {
            this.outputCtx = outputCtx;
            this.symbolResolver = symbolResolver;
            this.summaryResolver = summaryResolver;
            this.data = [];
        }
        ForJitSerializer.prototype.addSourceType = function (summary, metadata) {
            this.data.push({ summary: summary, metadata: metadata, isLibrary: false });
        };
        ForJitSerializer.prototype.addLibType = function (summary) {
            this.data.push({ summary: summary, metadata: null, isLibrary: true });
        };
        ForJitSerializer.prototype.serialize = function (exportAsArr) {
            var _this = this;
            var exportAsBySymbol = new Map();
            try {
                for (var exportAsArr_1 = tslib_1.__values(exportAsArr), exportAsArr_1_1 = exportAsArr_1.next(); !exportAsArr_1_1.done; exportAsArr_1_1 = exportAsArr_1.next()) {
                    var _a = exportAsArr_1_1.value, symbol = _a.symbol, exportAs = _a.exportAs;
                    exportAsBySymbol.set(symbol, exportAs);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (exportAsArr_1_1 && !exportAsArr_1_1.done && (_b = exportAsArr_1.return)) _b.call(exportAsArr_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var ngModuleSymbols = new Set();
            try {
                for (var _c = tslib_1.__values(this.data), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var _e = _d.value, summary = _e.summary, metadata = _e.metadata, isLibrary = _e.isLibrary;
                    if (summary.summaryKind === compile_metadata_1.CompileSummaryKind.NgModule) {
                        // collect the symbols that refer to NgModule classes.
                        // Note: we can't just rely on `summary.type.summaryKind` to determine this as
                        // we don't add the summaries of all referenced symbols when we serialize type summaries.
                        // See serializeSummaries for details.
                        ngModuleSymbols.add(summary.type.reference);
                        var modSummary = summary;
                        try {
                            for (var _f = tslib_1.__values(modSummary.modules), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var mod = _g.value;
                                ngModuleSymbols.add(mod.reference);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_h = _f.return)) _h.call(_f);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                    if (!isLibrary) {
                        var fnName = util_2.summaryForJitName(summary.type.reference.name);
                        createSummaryForJitFunction(this.outputCtx, summary.type.reference, this.serializeSummaryWithDeps(summary, metadata));
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_j = _c.return)) _j.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
            }
            ngModuleSymbols.forEach(function (ngModuleSymbol) {
                if (_this.summaryResolver.isLibraryFile(ngModuleSymbol.filePath)) {
                    var exportAs = exportAsBySymbol.get(ngModuleSymbol) || ngModuleSymbol.name;
                    var jitExportAsName = util_2.summaryForJitName(exportAs);
                    _this.outputCtx.statements.push(o.variable(jitExportAsName)
                        .set(_this.serializeSummaryRef(ngModuleSymbol))
                        .toDeclStmt(null, [o.StmtModifier.Exported]));
                }
            });
            var e_1, _b, e_3, _j, e_2, _h;
        };
        ForJitSerializer.prototype.serializeSummaryWithDeps = function (summary, metadata) {
            var _this = this;
            var expressions = [this.serializeSummary(summary)];
            var providers = [];
            if (metadata instanceof compile_metadata_1.CompileNgModuleMetadata) {
                expressions.push.apply(expressions, tslib_1.__spread(
                // For directives / pipes, we only add the declared ones,
                // and rely on transitively importing NgModules to get the transitive
                // summaries.
                metadata.declaredDirectives.concat(metadata.declaredPipes)
                    .map(function (type) { return type.reference; })
                    .concat(metadata.transitiveModule.modules.map(function (type) { return type.reference; })
                    .filter(function (ref) { return ref !== metadata.type.reference; }))
                    .map(function (ref) { return _this.serializeSummaryRef(ref); })));
                // Note: We don't use `NgModuleSummary.providers`, as that one is transitive,
                // and we already have transitive modules.
                providers = metadata.providers;
            }
            else if (summary.summaryKind === compile_metadata_1.CompileSummaryKind.Directive) {
                var dirSummary = summary;
                providers = dirSummary.providers.concat(dirSummary.viewProviders);
            }
            // Note: We can't just refer to the `ngsummary.ts` files for `useClass` providers (as we do for
            // declaredDirectives / declaredPipes), as we allow
            // providers without ctor arguments to skip the `@Injectable` decorator,
            // i.e. we didn't generate .ngsummary.ts files for these.
            expressions.push.apply(expressions, tslib_1.__spread(providers.filter(function (provider) { return !!provider.useClass; }).map(function (provider) { return _this.serializeSummary({
                summaryKind: compile_metadata_1.CompileSummaryKind.Injectable, type: provider.useClass
            }); })));
            return o.literalArr(expressions);
        };
        ForJitSerializer.prototype.serializeSummaryRef = function (typeSymbol) {
            var jitImportedSymbol = this.symbolResolver.getStaticSymbol(util_2.summaryForJitFileName(typeSymbol.filePath), util_2.summaryForJitName(typeSymbol.name));
            return this.outputCtx.importExpr(jitImportedSymbol);
        };
        ForJitSerializer.prototype.serializeSummary = function (data) {
            var outputCtx = this.outputCtx;
            var Transformer = /** @class */ (function () {
                function Transformer() {
                }
                Transformer.prototype.visitArray = function (arr, context) {
                    var _this = this;
                    return o.literalArr(arr.map(function (entry) { return util_1.visitValue(entry, _this, context); }));
                };
                Transformer.prototype.visitStringMap = function (map, context) {
                    var _this = this;
                    return new o.LiteralMapExpr(Object.keys(map).map(function (key) { return new o.LiteralMapEntry(key, util_1.visitValue(map[key], _this, context), false); }));
                };
                Transformer.prototype.visitPrimitive = function (value, context) { return o.literal(value); };
                Transformer.prototype.visitOther = function (value, context) {
                    if (value instanceof static_symbol_1.StaticSymbol) {
                        return outputCtx.importExpr(value);
                    }
                    else {
                        throw new Error("Illegal State: Encountered value " + value);
                    }
                };
                return Transformer;
            }());
            return util_1.visitValue(data, new Transformer(), null);
        };
        return ForJitSerializer;
    }());
    var FromJsonDeserializer = /** @class */ (function (_super) {
        tslib_1.__extends(FromJsonDeserializer, _super);
        function FromJsonDeserializer(symbolCache, summaryResolver) {
            var _this = _super.call(this) || this;
            _this.symbolCache = symbolCache;
            _this.summaryResolver = summaryResolver;
            return _this;
        }
        FromJsonDeserializer.prototype.deserialize = function (libraryFileName, json) {
            var _this = this;
            var data = JSON.parse(json);
            var allImportAs = [];
            this.symbols = data.symbols.map(function (serializedSymbol) { return _this.symbolCache.get(_this.summaryResolver.fromSummaryFileName(serializedSymbol.filePath, libraryFileName), serializedSymbol.name); });
            data.symbols.forEach(function (serializedSymbol, index) {
                var symbol = _this.symbols[index];
                var importAs = serializedSymbol.importAs;
                if (typeof importAs === 'number') {
                    allImportAs.push({ symbol: symbol, importAs: _this.symbols[importAs] });
                }
                else if (typeof importAs === 'string') {
                    allImportAs.push({ symbol: symbol, importAs: _this.symbolCache.get(util_2.ngfactoryFilePath(libraryFileName), importAs) });
                }
            });
            var summaries = util_1.visitValue(data.summaries, this, null);
            return { moduleName: data.moduleName, summaries: summaries, importAs: allImportAs };
        };
        FromJsonDeserializer.prototype.visitStringMap = function (map, context) {
            if ('__symbol' in map) {
                var baseSymbol = this.symbols[map['__symbol']];
                var members = map['members'];
                return members.length ? this.symbolCache.get(baseSymbol.filePath, baseSymbol.name, members) :
                    baseSymbol;
            }
            else {
                return _super.prototype.visitStringMap.call(this, map, context);
            }
        };
        return FromJsonDeserializer;
    }(util_1.ValueTransformer));
    function isCall(metadata) {
        return metadata && metadata.__symbolic === 'call';
    }
    function isFunctionCall(metadata) {
        return isCall(metadata) && static_symbol_resolver_1.unwrapResolvedMetadata(metadata.expression) instanceof static_symbol_1.StaticSymbol;
    }
    function isMethodCallOnVariable(metadata) {
        return isCall(metadata) && metadata.expression && metadata.expression.__symbolic === 'select' &&
            static_symbol_resolver_1.unwrapResolvedMetadata(metadata.expression.expression) instanceof static_symbol_1.StaticSymbol;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeV9zZXJpYWxpemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2FvdC9zdW1tYXJ5X3NlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsMkVBQWtQO0lBQ2xQLDJEQUEwQztJQUUxQyxtREFBa0Y7SUFFbEYseUVBQWdFO0lBQ2hFLDJGQUE0RztJQUM1Ryx1REFBb0c7SUFFcEcsNEJBQ0ksV0FBbUIsRUFBRSxTQUErQixFQUNwRCxlQUE4QyxFQUFFLGNBQW9DLEVBQ3BGLE9BQStCLEVBQUUsS0FJOUI7UUFDTCxJQUFNLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUU1RixzRUFBc0U7UUFDdEUsMEVBQTBFO1FBQzFFLHNCQUFzQjtRQUN0QixPQUFPLENBQUMsT0FBTyxDQUNYLFVBQUMsY0FBYyxJQUFLLE9BQUEsZ0JBQWdCLENBQUMsVUFBVSxDQUMzQyxFQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFDLENBQUMsRUFEbkQsQ0FDbUQsQ0FBQyxDQUFDO1FBRTdFLHNCQUFzQjtRQUN0QixLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBbUI7Z0JBQWxCLG9CQUFPLEVBQUUsc0JBQVE7WUFDL0IsZ0JBQWdCLENBQUMsVUFBVSxDQUN2QixFQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBQzVFLENBQUMsQ0FBQyxDQUFDO1FBQ0csSUFBQSxpQ0FBK0MsRUFBOUMsY0FBSSxFQUFFLHNCQUFRLENBQWlDO1FBQ3RELEVBQUUsQ0FBQyxD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QUFLLFFBQVE7WUFDekYsK0NBQXNCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsWUFBWSw0QkFBWSxDQUFDO0lBQ3JGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnksIENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLCBDb21waWxlTmdNb2R1bGVTdW1tYXJ5LCBDb21waWxlUGlwZU1ldGFkYXRhLCBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSwgQ29tcGlsZVN1bW1hcnlLaW5kLCBDb21waWxlVHlwZU1ldGFkYXRhLCBDb21waWxlVHlwZVN1bW1hcnl9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1N1bW1hcnksIFN1bW1hcnlSZXNvbHZlcn0gZnJvbSAnLi4vc3VtbWFyeV9yZXNvbHZlcic7XG5pbXBvcnQge091dHB1dENvbnRleHQsIFZhbHVlVHJhbnNmb3JtZXIsIFZhbHVlVmlzaXRvciwgdmlzaXRWYWx1ZX0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7U3RhdGljU3ltYm9sLCBTdGF0aWNTeW1ib2xDYWNoZX0gZnJvbSAnLi9zdGF0aWNfc3ltYm9sJztcbmltcG9ydCB7UmVzb2x2ZWRTdGF0aWNTeW1ib2wsIFN0YXRpY1N5bWJvbFJlc29sdmVyLCB1bndyYXBSZXNvbHZlZE1ldGFkYXRhfSBmcm9tICcuL3N0YXRpY19zeW1ib2xfcmVzb2x2ZXInO1xuaW1wb3J0IHtpc0xvd2VyZWRTeW1ib2wsIG5nZmFjdG9yeUZpbGVQYXRoLCBzdW1tYXJ5Rm9ySml0RmlsZU5hbWUsIHN1bW1hcnlGb3JKaXROYW1lfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplU3VtbWFyaWVzKFxuICAgIHNyY0ZpbGVOYW1lOiBzdHJpbmcsIGZvckppdEN0eDogT3V0cHV0Q29udGV4dCB8IG51bGwsXG4gICAgc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8U3RhdGljU3ltYm9sPiwgc3ltYm9sUmVzb2x2ZXI6IFN0YXRpY1N5bWJvbFJlc29sdmVyLFxuICAgIHN5bWJvbHM6IFJlc29sdmVkU3RhdGljU3ltYm9sW10sIHR5cGVzOiB7XG4gICAgICBzdW1tYXJ5OiBDb21waWxlVHlwZVN1bW1hcnksXG4gICAgICBtZXRhZGF0YTogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEgfCBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEgfCBDb21waWxlUGlwZU1ldGFkYXRhIHxcbiAgICAgICAgICBDb21waWxlVHlwZU1ldGFkYXRhXG4gICAgfVtdKToge2pzb246IHN0cmluZywgZXhwb3J0QXM6IHtzeW1ib2w6IFN0YXRpY1N5bWJvbCwgZXhwb3J0QXM6IHN0cmluZ31bXX0ge1xuICBjb25zdCB0b0pzb25TZXJpYWxpemVyID0gbmV3IFRvSnNvblNlcmlhbGl6ZXIoc3ltYm9sUmVzb2x2ZXIsIHN1bW1hcnlSZXNvbHZlciwgc3JjRmlsZU5hbWUpO1xuXG4gIC8vIGZvciBzeW1ib2xzLCB3ZSB1c2UgZXZlcnl0aGluZyBleGNlcHQgZm9yIHRoZSBjbGFzcyBtZXRhZGF0YSBpdHNlbGZcbiAgLy8gKHdlIGtlZXAgdGhlIHN0YXRpY3MgdGhvdWdoKSwgYXMgdGhlIGNsYXNzIG1ldGFkYXRhIGlzIGNvbnRhaW5lZCBpbiB0aGVcbiAgLy8gQ29tcGlsZVR5cGVTdW1tYXJ5LlxuICBzeW1ib2xzLmZvckVhY2goXG4gICAgICAocmVzb2x2ZWRTeW1ib2wpID0+IHRvSnNvblNlcmlhbGl6ZXIuYWRkU3VtbWFyeShcbiAgICAgICAgICB7c3ltYm9sOiByZXNvbHZlZFN5bWJvbC5zeW1ib2wsIG1ldGFkYXRhOiByZXNvbHZlZFN5bWJvbC5tZXRhZGF0YX0pKTtcblxuICAvLyBBZGQgdHlwZSBzdW1tYXJpZXMuXG4gIHR5cGVzLmZvckVhY2goKHtzdW1tYXJ5LCBtZXRhZGF0YX0pID0+IHtcbiAgICB0b0pzb25TZXJpYWxpemVyLmFkZFN1bW1hcnkoXG4gICAgICAgIHtzeW1ib2w6IHN1bW1hcnkudHlwZS5yZWZlcmVuY2UsIG1ldGFkYXRhOiB1bmRlZmluZWQsIHR5cGU6IHN1bW1hcnl9KTtcbiAgfSk7XG4gIGNvbnN0IHtqc29uLCBleHBvcnRBc30gPSB0b0pzb25TZXJpYWxpemVyLnNlcmlhbGl6ZSgpO1xuICBpZiAoZm9ySml0Q3R4KSB7XG4gICAgY29uc3QgZm9ySml0U2VyaWFsaXplciA9IG5ldyBGb3JKaXRTZXJpYWxpemVyKGZvckppdEN0eCwgc3ltYm9sUmVzb2x2ZXIsIHN1bW1hcnlSZXNvbHZlcik7XG4gICAgdHlwZXMuZm9yRWFjaCgoe3N1bW1hcnksIG1ldGFkYXRhfSkgPT4geyBmb3JKaXRTZXJpYWxpemVyLmFkZFNvdXJjZVR5cGUoc3VtbWFyeSwgbWV0YWRhdGEpOyB9KTtcbiAgICB0b0pzb25TZXJpYWxpemVyLnVucHJvY2Vzc2VkU3ltYm9sU3VtbWFyaWVzQnlTeW1ib2wuZm9yRWFjaCgoc3VtbWFyeSkgPT4ge1xuICAgICAgaWYgKHN1bW1hcnlSZXNvbHZlci5pc0xpYnJhcnlGaWxlKHN1bW1hcnkuc3ltYm9sLmZpbGVQYXRoKSAmJiBzdW1tYXJ5LnR5cGUpIHtcbiAgICAgICAgZm9ySml0U2VyaWFsaXplci5hZGRMaWJUeXBlKHN1bW1hcnkudHlwZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZm9ySml0U2VyaWFsaXplci5zZXJpYWxpemUoZXhwb3J0QXMpO1xuICB9XG4gIHJldHVybiB7anNvbiwgZXhwb3J0QXN9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzZXJpYWxpemVTdW1tYXJpZXMoXG4gICAgc3ltYm9sQ2FjaGU6IFN0YXRpY1N5bWJvbENhY2hlLCBzdW1tYXJ5UmVzb2x2ZXI6IFN1bW1hcnlSZXNvbHZlcjxTdGF0aWNTeW1ib2w+LFxuICAgIGxpYnJhcnlGaWxlTmFtZTogc3RyaW5nLCBqc29uOiBzdHJpbmcpOiB7XG4gIG1vZHVsZU5hbWU6IHN0cmluZyB8IG51bGwsXG4gIHN1bW1hcmllczogU3VtbWFyeTxTdGF0aWNTeW1ib2w+W10sXG4gIGltcG9ydEFzOiB7c3ltYm9sOiBTdGF0aWNTeW1ib2wsIGltcG9ydEFzOiBTdGF0aWNTeW1ib2x9W11cbn0ge1xuICBjb25zdCBkZXNlcmlhbGl6ZXIgPSBuZXcgRnJvbUpzb25EZXNlcmlhbGl6ZXIoc3ltYm9sQ2FjaGUsIHN1bW1hcnlSZXNvbHZlcik7XG4gIHJldHVybiBkZXNlcmlhbGl6ZXIuZGVzZXJpYWxpemUobGlicmFyeUZpbGVOYW1lLCBqc29uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZvckppdFN0dWIob3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCByZWZlcmVuY2U6IFN0YXRpY1N5bWJvbCkge1xuICByZXR1cm4gY3JlYXRlU3VtbWFyeUZvckppdEZ1bmN0aW9uKG91dHB1dEN0eCwgcmVmZXJlbmNlLCBvLk5VTExfRVhQUik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN1bW1hcnlGb3JKaXRGdW5jdGlvbihcbiAgICBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQsIHJlZmVyZW5jZTogU3RhdGljU3ltYm9sLCB2YWx1ZTogby5FeHByZXNzaW9uKSB7XG4gIGNvbnN0IGZuTmFtZSA9IHN1bW1hcnlGb3JKaXROYW1lKHJlZmVyZW5jZS5uYW1lKTtcbiAgb3V0cHV0Q3R4LnN0YXRlbWVudHMucHVzaChcbiAgICAgIG8uZm4oW10sIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQodmFsdWUpXSwgbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFKSkudG9EZWNsU3RtdChmbk5hbWUsIFtcbiAgICAgICAgby5TdG10TW9kaWZpZXIuRmluYWwsIG8uU3RtdE1vZGlmaWVyLkV4cG9ydGVkXG4gICAgICBdKSk7XG59XG5cbmNvbnN0IGVudW0gU2VyaWFsaXphdGlvbkZsYWdzIHtcbiAgTm9uZSA9IDAsXG4gIFJlc29sdmVWYWx1ZSA9IDEsXG59XG5cbmNsYXNzIFRvSnNvblNlcmlhbGl6ZXIgZXh0ZW5kcyBWYWx1ZVRyYW5zZm9ybWVyIHtcbiAgLy8gTm90ZTogVGhpcyBvbmx5IGNvbnRhaW5zIHN5bWJvbHMgd2l0aG91dCBtZW1iZXJzLlxuICBwcml2YXRlIHN5bWJvbHM6IFN0YXRpY1N5bWJvbFtdID0gW107XG4gIHByaXZhdGUgaW5kZXhCeVN5bWJvbCA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCBudW1iZXI+KCk7XG4gIHByaXZhdGUgcmVleHBvcnRlZEJ5ID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIFN0YXRpY1N5bWJvbD4oKTtcbiAgLy8gVGhpcyBub3cgY29udGFpbnMgYSBgX19zeW1ib2w6IG51bWJlcmAgaW4gdGhlIHBsYWNlIG9mXG4gIC8vIFN0YXRpY1N5bWJvbHMsIGJ1dCBvdGhlcndpc2UgaGFzIHRoZSBzYW1lIHNoYXBlIGFzIHRoZSBvcmlnaW5hbCBvYmplY3RzLlxuICBwcml2YXRlIHByb2Nlc3NlZFN1bW1hcnlCeVN5bWJvbCA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCBhbnk+KCk7XG4gIHByaXZhdGUgcHJvY2Vzc2VkU3VtbWFyaWVzOiBhbnlbXSA9IFtdO1xuICBwcml2YXRlIG1vZHVsZU5hbWU6IHN0cmluZ3xudWxsO1xuXG4gIHVucHJvY2Vzc2VkU3ltYm9sU3VtbWFyaWVzQnlTeW1ib2wgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgU3VtbWFyeTxTdGF0aWNTeW1ib2w+PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBzeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsXG4gICAgICBwcml2YXRlIHN1bW1hcnlSZXNvbHZlcjogU3VtbWFyeVJlc29sdmVyPFN0YXRpY1N5bWJvbD4sIHByaXZhdGUgc3JjRmlsZU5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5tb2R1bGVOYW1lID0gc3ltYm9sUmVzb2x2ZXIuZ2V0S25vd25Nb2R1bGVOYW1lKHNyY0ZpbGVOYW1lKTtcbiAgfVxuXG4gIGFkZFN1bW1hcnkoc3VtbWFyeTogU3VtbWFyeTxTdGF0aWNTeW1ib2w+KSB7XG4gICAgbGV0IHVucHJvY2Vzc2VkU3VtbWFyeSA9IHRoaXMudW5wcm9jZXNzZWRTeW1ib2xTdW1tYXJpZXNCeVN5bWJvbC5nZXQoc3VtbWFyeS5zeW1ib2wpO1xuICAgIGxldCBwcm9jZXNzZWRTdW1tYXJ5ID0gdGhpcy5wcm9jZXNzZWRTdW1tYXJ5QnlTeW1ib2wuZ2V0KHN1bW1hcnkuc3ltYm9sKTtcbiAgICBpZiAoIXVucHJvY2Vzc2VkU3VtbWFyeSkge1xuICAgICAgdW5wcm9jZXNzZWRTdW1tYXJ5ID0ge3N5bWJvbDogc3VtbWFyeS5zeW1ib2wsIG1ldGFkYXRhOiB1bmRlZmluZWR9O1xuICAgICAgdGhpcy51bnByb2Nlc3NlZFN5bWJvbFN1bW1hcmllc0J5U3ltYm9sLnNldChzdW1tYXJ5LnN5bWJvbCwgdW5wcm9jZXNzZWRTdW1tYXJ5KTtcbiAgICAgIHByb2Nlc3NlZFN1bW1hcnkgPSB7c3ltYm9sOiB0aGlzLnByb2Nlc3NWYWx1ZShzdW1tYXJ5LnN5bWJvbCwgU2VyaWFsaXphdGlvbkZsYWdzLk5vbmUpfTtcbiAgICAgIHRoaXMucHJvY2Vzc2VkU3VtbWFyaWVzLnB1c2gocHJvY2Vzc2VkU3VtbWFyeSk7XG4gICAgICB0aGlzLnByb2Nlc3NlZFN1bW1hcnlCeVN5bWJvbC5zZXQoc3VtbWFyeS5zeW1ib2wsIHByb2Nlc3NlZFN1bW1hcnkpO1xuICAgIH1cbiAgICBpZiAoIXVucHJvY2Vzc2VkU3VtbWFyeS5tZXRhZGF0YSAmJiBzdW1tYXJ5Lm1ldGFkYXRhKSB7XG4gICAgICBsZXQgbWV0YWRhdGEgPSBzdW1tYXJ5Lm1ldGFkYXRhIHx8IHt9O1xuICAgICAgaWYgKG1ldGFkYXRhLl9fc3ltYm9saWMgPT09ICdjbGFzcycpIHtcbiAgICAgICAgLy8gRm9yIGNsYXNzZXMsIHdlIGtlZXAgZXZlcnl0aGluZyBleGNlcHQgdGhlaXIgY2xhc3MgZGVjb3JhdG9ycy5cbiAgICAgICAgLy8gV2UgbmVlZCB0byBrZWVwIGUuZy4gdGhlIGN0b3IgYXJncywgbWV0aG9kIG5hbWVzLCBtZXRob2QgZGVjb3JhdG9yc1xuICAgICAgICAvLyBzbyB0aGF0IHRoZSBjbGFzcyBjYW4gYmUgZXh0ZW5kZWQgaW4gYW5vdGhlciBjb21waWxhdGlvbiB1bml0LlxuICAgICAgICAvLyBXZSBkb24ndCBrZWVwIHRoZSBjbGFzcyBkZWNvcmF0b3JzIGFzXG4gICAgICAgIC8vIDEpIHRoZXkgcmVmZXIgdG8gZGF0YVxuICAgICAgICAvLyAgIHRoYXQgc2hvdWxkIG5vdCBjYXVzZSBhIHJlYnVpbGQgb2YgZG93bnN0cmVhbSBjb21waWxhdGlvbiB1bml0c1xuICAgICAgICAvLyAgIChlLmcuIGlubGluZSB0ZW1wbGF0ZXMgb2YgQENvbXBvbmVudCwgb3IgQE5nTW9kdWxlLmRlY2xhcmF0aW9ucylcbiAgICAgICAgLy8gMikgdGhlaXIgZGF0YSBpcyBhbHJlYWR5IGNhcHR1cmVkIGluIFR5cGVTdW1tYXJpZXMsIGUuZy4gRGlyZWN0aXZlU3VtbWFyeS5cbiAgICAgICAgY29uc3QgY2xvbmU6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKG1ldGFkYXRhKS5mb3JFYWNoKChwcm9wTmFtZSkgPT4ge1xuICAgICAgICAgIGlmIChwcm9wTmFtZSAhPT0gJ2RlY29yYXRvcnMnKSB7XG4gICAgICAgICAgICBjbG9uZVtwcm9wTmFtZV0gPSBtZXRhZGF0YVtwcm9wTmFtZV07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWV0YWRhdGEgPSBjbG9uZTtcbiAgICAgIH0gZWxzZSBpZiAoaXNDYWxsKG1ldGFkYXRhKSkge1xuICAgICAgICBpZiAoIWlzRnVuY3Rpb25DYWxsKG1ldGFkYXRhKSAmJiAhaXNNZXRob2RDYWxsT25WYXJpYWJsZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAvLyBEb24ndCBzdG9yZSBjb21wbGV4IGNhbGxzIGFzIHdlIHdvbid0IGJlIGFibGUgdG8gc2ltcGxpZnkgdGhlbSBhbnl3YXlzIGxhdGVyIG9uLlxuICAgICAgICAgIG1ldGFkYXRhID0ge1xuICAgICAgICAgICAgX19zeW1ib2xpYzogJ2Vycm9yJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdDb21wbGV4IGZ1bmN0aW9uIGNhbGxzIGFyZSBub3Qgc3VwcG9ydGVkLicsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gTm90ZTogV2UgbmVlZCB0byBrZWVwIHN0b3JpbmcgY3RvciBjYWxscyBmb3IgZS5nLlxuICAgICAgLy8gYGV4cG9ydCBjb25zdCB4ID0gbmV3IEluamVjdGlvblRva2VuKC4uLilgXG4gICAgICB1bnByb2Nlc3NlZFN1bW1hcnkubWV0YWRhdGEgPSBtZXRhZGF0YTtcbiAgICAgIHByb2Nlc3NlZFN1bW1hcnkubWV0YWRhdGEgPSB0aGlzLnByb2Nlc3NWYWx1ZShtZXRhZGF0YSwgU2VyaWFsaXphdGlvbkZsYWdzLlJlc29sdmVWYWx1ZSk7XG4gICAgICBpZiAobWV0YWRhdGEgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wgJiZcbiAgICAgICAgICB0aGlzLnN1bW1hcnlSZXNvbHZlci5pc0xpYnJhcnlGaWxlKG1ldGFkYXRhLmZpbGVQYXRoKSkge1xuICAgICAgICBjb25zdCBkZWNsYXJhdGlvblN5bWJvbCA9IHRoaXMuc3ltYm9sc1t0aGlzLmluZGV4QnlTeW1ib2wuZ2V0KG1ldGFkYXRhKSAhXTtcbiAgICAgICAgaWYgKCFpc0xvd2VyZWRTeW1ib2woZGVjbGFyYXRpb25TeW1ib2wubmFtZSkpIHtcbiAgICAgICAgICAvLyBOb3RlOiBzeW1ib2xzIHRoYXQgd2VyZSBpbnRyb2R1Y2VkIGR1cmluZyBjb2RlZ2VuIGluIHRoZSB1c2VyIGZpbGUgY2FuIGhhdmUgYSByZWV4cG9ydFxuICAgICAgICAgIC8vIGlmIGEgdXNlciB1c2VkIGBleHBvcnQgKmAuIEhvd2V2ZXIsIHdlIGNhbid0IHJlbHkgb24gdGhpcyBhcyB0c2lja2xlIHdpbGwgY2hhbmdlXG4gICAgICAgICAgLy8gYGV4cG9ydCAqYCBpbnRvIG5hbWVkIGV4cG9ydHMsIHVzaW5nIG9ubHkgdGhlIGluZm9ybWF0aW9uIGZyb20gdGhlIHR5cGVjaGVja2VyLlxuICAgICAgICAgIC8vIEFzIHdlIGludHJvZHVjZSB0aGUgbmV3IHN5bWJvbHMgYWZ0ZXIgdHlwZWNoZWNrLCBUc2lja2xlIGRvZXMgbm90IGtub3cgYWJvdXQgdGhlbSxcbiAgICAgICAgICAvLyBhbmQgb21pdHMgdGhlbSB3aGVuIGV4cGFuZGluZyBgZXhwb3J0ICpgLlxuICAgICAgICAgIC8vIFNvIHdlIGhhdmUgdG8ga2VlcCByZWV4cG9ydGluZyB0aGVzZSBzeW1ib2xzIG1hbnVhbGx5IHZpYSAubmdmYWN0b3J5IGZpbGVzLlxuICAgICAgICAgIHRoaXMucmVleHBvcnRlZEJ5LnNldChkZWNsYXJhdGlvblN5bWJvbCwgc3VtbWFyeS5zeW1ib2wpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghdW5wcm9jZXNzZWRTdW1tYXJ5LnR5cGUgJiYgc3VtbWFyeS50eXBlKSB7XG4gICAgICB1bnByb2Nlc3NlZFN1bW1hcnkudHlwZSA9IHN1bW1hcnkudHlwZTtcbiAgICAgIC8vIE5vdGU6IFdlIGRvbid0IGFkZCB0aGUgc3VtbWFyaWVzIG9mIGFsbCByZWZlcmVuY2VkIHN5bWJvbHMgYXMgZm9yIHRoZSBSZXNvbHZlZFN5bWJvbHMsXG4gICAgICAvLyBhcyB0aGUgdHlwZSBzdW1tYXJpZXMgYWxyZWFkeSBjb250YWluIHRoZSB0cmFuc2l0aXZlIGRhdGEgdGhhdCB0aGV5IHJlcXVpcmVcbiAgICAgIC8vIChpbiBhIG1pbmltYWwgd2F5KS5cbiAgICAgIHByb2Nlc3NlZFN1bW1hcnkudHlwZSA9IHRoaXMucHJvY2Vzc1ZhbHVlKHN1bW1hcnkudHlwZSwgU2VyaWFsaXphdGlvbkZsYWdzLk5vbmUpO1xuICAgICAgLy8gZXhjZXB0IGZvciByZWV4cG9ydGVkIGRpcmVjdGl2ZXMgLyBwaXBlcywgc28gd2UgbmVlZCB0byBzdG9yZVxuICAgICAgLy8gdGhlaXIgc3VtbWFyaWVzIGV4cGxpY2l0bHkuXG4gICAgICBpZiAoc3VtbWFyeS50eXBlLnN1bW1hcnlLaW5kID09PSBDb21waWxlU3VtbWFyeUtpbmQuTmdNb2R1bGUpIHtcbiAgICAgICAgY29uc3QgbmdNb2R1bGVTdW1tYXJ5ID0gPENvbXBpbGVOZ01vZHVsZVN1bW1hcnk+c3VtbWFyeS50eXBlO1xuICAgICAgICBuZ01vZHVsZVN1bW1hcnkuZXhwb3J0ZWREaXJlY3RpdmVzLmNvbmNhdChuZ01vZHVsZVN1bW1hcnkuZXhwb3J0ZWRQaXBlcykuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgICAgICBjb25zdCBzeW1ib2w6IFN0YXRpY1N5bWJvbCA9IGlkLnJlZmVyZW5jZTtcbiAgICAgICAgICBpZiAodGhpcy5zdW1tYXJ5UmVzb2x2ZXIuaXNMaWJyYXJ5RmlsZShzeW1ib2wuZmlsZVBhdGgpICYmXG4gICAgICAgICAgICAgICF0aGlzLnVucHJvY2Vzc2VkU3ltYm9sU3VtbWFyaWVzQnlTeW1ib2wuaGFzKHN5bWJvbCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLnN1bW1hcnlSZXNvbHZlci5yZXNvbHZlU3VtbWFyeShzeW1ib2wpO1xuICAgICAgICAgICAgaWYgKHN1bW1hcnkpIHtcbiAgICAgICAgICAgICAgdGhpcy5hZGRTdW1tYXJ5KHN1bW1hcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2VyaWFsaXplKCk6IHtqc29uOiBzdHJpbmcsIGV4cG9ydEFzOiB7c3ltYm9sOiBTdGF0aWNTeW1ib2wsIGV4cG9ydEFzOiBzdHJpbmd9W119IHtcbiAgICBjb25zdCBleHBvcnRBczoge3N5bWJvbDogU3RhdGljU3ltYm9sLCBleHBvcnRBczogc3RyaW5nfVtdID0gW107XG4gICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIG1vZHVsZU5hbWU6IHRoaXMubW9kdWxlTmFtZSxcbiAgICAgIHN1bW1hcmllczogdGhpcy5wcm9jZXNzZWRTdW1tYXJpZXMsXG4gICAgICBzeW1ib2xzOiB0aGlzLnN5bWJvbHMubWFwKChzeW1ib2wsIGluZGV4KSA9PiB7XG4gICAgICAgIHN5bWJvbC5hc3NlcnROb01lbWJlcnMoKTtcbiAgICAgICAgbGV0IGltcG9ydEFzOiBzdHJpbmd8bnVtYmVyID0gdW5kZWZpbmVkICE7XG4gICAgICAgIGlmICh0aGlzLnN1bW1hcnlSZXNvbHZlci5pc0xpYnJhcnlGaWxlKHN5bWJvbC5maWxlUGF0aCkpIHtcbiAgICAgICAgICBjb25zdCByZWV4cG9ydFN5bWJvbCA9IHRoaXMucmVleHBvcnRlZEJ5LmdldChzeW1ib2wpO1xuICAgICAgICAgIGlmIChyZWV4cG9ydFN5bWJvbCkge1xuICAgICAgICAgICAgaW1wb3J0QXMgPSB0aGlzLmluZGV4QnlTeW1ib2wuZ2V0KHJlZXhwb3J0U3ltYm9sKSAhO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy51bnByb2Nlc3NlZFN5bWJvbFN1bW1hcmllc0J5U3ltYm9sLmdldChzeW1ib2wpO1xuICAgICAgICAgICAgaWYgKCFzdW1tYXJ5IHx8ICFzdW1tYXJ5Lm1ldGFkYXRhIHx8IHN1bW1hcnkubWV0YWRhdGEuX19zeW1ib2xpYyAhPT0gJ2ludGVyZmFjZScpIHtcbiAgICAgICAgICAgICAgaW1wb3J0QXMgPSBgJHtzeW1ib2wubmFtZX1fJHtpbmRleH1gO1xuICAgICAgICAgICAgICBleHBvcnRBcy5wdXNoKHtzeW1ib2wsIGV4cG9ydEFzOiBpbXBvcnRBc30pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIF9fc3ltYm9sOiBpbmRleCxcbiAgICAgICAgICBuYW1lOiBzeW1ib2wubmFtZSxcbiAgICAgICAgICBmaWxlUGF0aDogdGhpcy5zdW1tYXJ5UmVzb2x2ZXIudG9TdW1tYXJ5RmlsZU5hbWUoc3ltYm9sLmZpbGVQYXRoLCB0aGlzLnNyY0ZpbGVOYW1lKSxcbiAgICAgICAgICBpbXBvcnRBczogaW1wb3J0QXNcbiAgICAgICAgfTtcbiAgICAgIH0pXG4gICAgfSk7XG4gICAgcmV0dXJuIHtqc29uLCBleHBvcnRBc307XG4gIH1cblxuICBwcml2YXRlIHByb2Nlc3NWYWx1ZSh2YWx1ZTogYW55LCBmbGFnczogU2VyaWFsaXphdGlvbkZsYWdzKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRWYWx1ZSh2YWx1ZSwgdGhpcywgZmxhZ3MpO1xuICB9XG5cbiAgdmlzaXRPdGhlcih2YWx1ZTogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgbGV0IGJhc2VTeW1ib2wgPSB0aGlzLnN5bWJvbFJlc29sdmVyLmdldFN0YXRpY1N5bWJvbCh2YWx1ZS5maWxlUGF0aCwgdmFsdWUubmFtZSk7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMudmlzaXRTdGF0aWNTeW1ib2woYmFzZVN5bWJvbCwgY29udGV4dCk7XG4gICAgICByZXR1cm4ge19fc3ltYm9sOiBpbmRleCwgbWVtYmVyczogdmFsdWUubWVtYmVyc307XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0cmlwIGxpbmUgYW5kIGNoYXJhY3RlciBudW1iZXJzIGZyb20gbmdzdW1tYXJpZXMuXG4gICAqIEVtaXR0aW5nIHRoZW0gY2F1c2VzIHdoaXRlIHNwYWNlcyBjaGFuZ2VzIHRvIHJldHJpZ2dlciB1cHN0cmVhbVxuICAgKiByZWNvbXBpbGF0aW9ucyBpbiBiYXplbC5cbiAgICogVE9ETzogZmluZCBvdXQgYSB3YXkgdG8gaGF2ZSBsaW5lIGFuZCBjaGFyYWN0ZXIgbnVtYmVycyBpbiBlcnJvcnMgd2l0aG91dFxuICAgKiBleGNlc3NpdmUgcmVjb21waWxhdGlvbiBpbiBiYXplbC5cbiAgICovXG4gIHZpc2l0U3RyaW5nTWFwKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKG1hcFsnX19zeW1ib2xpYyddID09PSAncmVzb2x2ZWQnKSB7XG4gICAgICByZXR1cm4gdmlzaXRWYWx1ZShtYXAuc3ltYm9sLCB0aGlzLCBjb250ZXh0KTtcbiAgICB9XG4gICAgaWYgKG1hcFsnX19zeW1ib2xpYyddID09PSAnZXJyb3InKSB7XG4gICAgICBkZWxldGUgbWFwWydsaW5lJ107XG4gICAgICBkZWxldGUgbWFwWydjaGFyYWN0ZXInXTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLnZpc2l0U3RyaW5nTWFwKG1hcCwgY29udGV4dCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBudWxsIGlmIHRoZSBvcHRpb25zLnJlc29sdmVWYWx1ZSBpcyB0cnVlLCBhbmQgdGhlIHN1bW1hcnkgZm9yIHRoZSBzeW1ib2xcbiAgICogcmVzb2x2ZWQgdG8gYSB0eXBlIG9yIGNvdWxkIG5vdCBiZSByZXNvbHZlZC5cbiAgICovXG4gIHByaXZhdGUgdmlzaXRTdGF0aWNTeW1ib2woYmFzZVN5bWJvbDogU3RhdGljU3ltYm9sLCBmbGFnczogU2VyaWFsaXphdGlvbkZsYWdzKTogbnVtYmVyIHtcbiAgICBsZXQgaW5kZXg6IG51bWJlcnx1bmRlZmluZWR8bnVsbCA9IHRoaXMuaW5kZXhCeVN5bWJvbC5nZXQoYmFzZVN5bWJvbCk7XG4gICAgbGV0IHN1bW1hcnk6IFN1bW1hcnk8U3RhdGljU3ltYm9sPnxudWxsID0gbnVsbDtcbiAgICBpZiAoZmxhZ3MgJiBTZXJpYWxpemF0aW9uRmxhZ3MuUmVzb2x2ZVZhbHVlICYmXG4gICAgICAgIHRoaXMuc3VtbWFyeVJlc29sdmVyLmlzTGlicmFyeUZpbGUoYmFzZVN5bWJvbC5maWxlUGF0aCkpIHtcbiAgICAgIGlmICh0aGlzLnVucHJvY2Vzc2VkU3ltYm9sU3VtbWFyaWVzQnlTeW1ib2wuaGFzKGJhc2VTeW1ib2wpKSB7XG4gICAgICAgIC8vIHRoZSBzdW1tYXJ5IGZvciB0aGlzIHN5bWJvbCB3YXMgYWxyZWFkeSBhZGRlZFxuICAgICAgICAvLyAtPiBub3RoaW5nIHRvIGRvLlxuICAgICAgICByZXR1cm4gaW5kZXggITtcbiAgICAgIH1cbiAgICAgIHN1bW1hcnkgPSB0aGlzLmxvYWRTdW1tYXJ5KGJhc2VTeW1ib2wpO1xuICAgICAgaWYgKHN1bW1hcnkgJiYgc3VtbWFyeS5tZXRhZGF0YSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgICAvLyBUaGUgc3VtbWFyeSBpcyBhIHJlZXhwb3J0XG4gICAgICAgIGluZGV4ID0gdGhpcy52aXNpdFN0YXRpY1N5bWJvbChzdW1tYXJ5Lm1ldGFkYXRhLCBmbGFncyk7XG4gICAgICAgIC8vIHJlc2V0IHRoZSBzdW1tYXJ5IGFzIGl0IGlzIGp1c3QgYSByZWV4cG9ydCwgc28gd2UgZG9uJ3Qgd2FudCB0byBzdG9yZSBpdC5cbiAgICAgICAgc3VtbWFyeSA9IG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpbmRleCAhPSBudWxsKSB7XG4gICAgICAvLyBOb3RlOiA9PSBvbiBwdXJwb3NlIHRvIGNvbXBhcmUgd2l0aCB1bmRlZmluZWQhXG4gICAgICAvLyBObyBzdW1tYXJ5IGFuZCB0aGUgc3ltYm9sIGlzIGFscmVhZHkgYWRkZWQgLT4gbm90aGluZyB0byBkby5cbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG4gICAgLy8gTm90ZTogPT0gb24gcHVycG9zZSB0byBjb21wYXJlIHdpdGggdW5kZWZpbmVkIVxuICAgIGlmIChpbmRleCA9PSBudWxsKSB7XG4gICAgICBpbmRleCA9IHRoaXMuc3ltYm9scy5sZW5ndGg7XG4gICAgICB0aGlzLnN5bWJvbHMucHVzaChiYXNlU3ltYm9sKTtcbiAgICB9XG4gICAgdGhpcy5pbmRleEJ5U3ltYm9sLnNldChiYXNlU3ltYm9sLCBpbmRleCk7XG4gICAgaWYgKHN1bW1hcnkpIHtcbiAgICAgIHRoaXMuYWRkU3VtbWFyeShzdW1tYXJ5KTtcbiAgICB9XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkU3VtbWFyeShzeW1ib2w6IFN0YXRpY1N5bWJvbCk6IFN1bW1hcnk8U3RhdGljU3ltYm9sPnxudWxsIHtcbiAgICBsZXQgc3VtbWFyeSA9IHRoaXMuc3VtbWFyeVJlc29sdmVyLnJlc29sdmVTdW1tYXJ5KHN5bWJvbCk7XG4gICAgaWYgKCFzdW1tYXJ5KSB7XG4gICAgICAvLyBzb21lIHN5bWJvbHMgbWlnaHQgb3JpZ2luYXRlIGZyb20gYSBwbGFpbiB0eXBlc2NyaXB0IGxpYnJhcnlcbiAgICAgIC8vIHRoYXQganVzdCBleHBvcnRlZCAuZC50cyBhbmQgLm1ldGFkYXRhLmpzb24gZmlsZXMsIGkuZS4gd2hlcmUgbm8gc3VtbWFyeVxuICAgICAgLy8gZmlsZXMgd2VyZSBjcmVhdGVkLlxuICAgICAgY29uc3QgcmVzb2x2ZWRTeW1ib2wgPSB0aGlzLnN5bWJvbFJlc29sdmVyLnJlc29sdmVTeW1ib2woc3ltYm9sKTtcbiAgICAgIGlmIChyZXNvbHZlZFN5bWJvbCkge1xuICAgICAgICBzdW1tYXJ5ID0ge3N5bWJvbDogcmVzb2x2ZWRTeW1ib2wuc3ltYm9sLCBtZXRhZGF0YTogcmVzb2x2ZWRTeW1ib2wubWV0YWRhdGF9O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VtbWFyeTtcbiAgfVxufVxuXG5jbGFzcyBGb3JKaXRTZXJpYWxpemVyIHtcbiAgcHJpdmF0ZSBkYXRhOiBBcnJheTx7XG4gICAgc3VtbWFyeTogQ29tcGlsZVR5cGVTdW1tYXJ5LFxuICAgIG1ldGFkYXRhOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YXxDb21waWxlRGlyZWN0aXZlTWV0YWRhdGF8Q29tcGlsZVBpcGVNZXRhZGF0YXxcbiAgICBDb21waWxlVHlwZU1ldGFkYXRhfG51bGwsXG4gICAgaXNMaWJyYXJ5OiBib29sZWFuXG4gIH0+ID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgcHJpdmF0ZSBzeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsXG4gICAgICBwcml2YXRlIHN1bW1hcnlSZXNvbHZlcjogU3VtbWFyeVJlc29sdmVyPFN0YXRpY1N5bWJvbD4pIHt9XG5cbiAgYWRkU291cmNlVHlwZShcbiAgICAgIHN1bW1hcnk6IENvbXBpbGVUeXBlU3VtbWFyeSwgbWV0YWRhdGE6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhfENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YXxcbiAgICAgIENvbXBpbGVQaXBlTWV0YWRhdGF8Q29tcGlsZVR5cGVNZXRhZGF0YSkge1xuICAgIHRoaXMuZGF0YS5wdXNoKHtzdW1tYXJ5LCBtZXRhZGF0YSwgaXNMaWJyYXJ5OiBmYWxzZX0pO1xuICB9XG5cbiAgYWRkTGliVHlwZShzdW1tYXJ5OiBDb21waWxlVHlwZVN1bW1hcnkpIHtcbiAgICB0aGlzLmRhdGEucHVzaCh7c3VtbWFyeSwgbWV0YWRhdGE6IG51bGwsIGlzTGlicmFyeTogdHJ1ZX0pO1xuICB9XG5cbiAgc2VyaWFsaXplKGV4cG9ydEFzQXJyOiB7c3ltYm9sOiBTdGF0aWNTeW1ib2wsIGV4cG9ydEFzOiBzdHJpbmd9W10pOiB2b2lkIHtcbiAgICBjb25zdCBleHBvcnRBc0J5U3ltYm9sID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIHN0cmluZz4oKTtcbiAgICBmb3IgKGNvbnN0IHtzeW1ib2wsIGV4cG9ydEFzfSBvZiBleHBvcnRBc0Fycikge1xuICAgICAgZXhwb3J0QXNCeVN5bWJvbC5zZXQoc3ltYm9sLCBleHBvcnRBcyk7XG4gICAgfVxuICAgIGNvbnN0IG5nTW9kdWxlU3ltYm9scyA9IG5ldyBTZXQ8U3RhdGljU3ltYm9sPigpO1xuXG4gICAgZm9yIChjb25zdCB7c3VtbWFyeSwgbWV0YWRhdGEsIGlzTGlicmFyeX0gb2YgdGhpcy5kYXRhKSB7XG4gICAgICBpZiAoc3VtbWFyeS5zdW1tYXJ5S2luZCA9PT0gQ29tcGlsZVN1bW1hcnlLaW5kLk5nTW9kdWxlKSB7XG4gICAgICAgIC8vIGNvbGxlY3QgdGhlIHN5bWJvbHMgdGhhdCByZWZlciB0byBOZ01vZHVsZSBjbGFzc2VzLlxuICAgICAgICAvLyBOb3RlOiB3ZSBjYW4ndCBqdXN0IHJlbHkgb24gYHN1bW1hcnkudHlwZS5zdW1tYXJ5S2luZGAgdG8gZGV0ZXJtaW5lIHRoaXMgYXNcbiAgICAgICAgLy8gd2UgZG9uJ3QgYWRkIHRoZSBzdW1tYXJpZXMgb2YgYWxsIHJlZmVyZW5jZWQgc3ltYm9scyB3aGVuIHdlIHNlcmlhbGl6ZSB0eXBlIHN1bW1hcmllcy5cbiAgICAgICAgLy8gU2VlIHNlcmlhbGl6ZVN1bW1hcmllcyBmb3IgZGV0YWlscy5cbiAgICAgICAgbmdNb2R1bGVTeW1ib2xzLmFkZChzdW1tYXJ5LnR5cGUucmVmZXJlbmNlKTtcbiAgICAgICAgY29uc3QgbW9kU3VtbWFyeSA9IDxDb21waWxlTmdNb2R1bGVTdW1tYXJ5PnN1bW1hcnk7XG4gICAgICAgIGZvciAoY29uc3QgbW9kIG9mIG1vZFN1bW1hcnkubW9kdWxlcykge1xuICAgICAgICAgIG5nTW9kdWxlU3ltYm9scy5hZGQobW9kLnJlZmVyZW5jZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaXNMaWJyYXJ5KSB7XG4gICAgICAgIGNvbnN0IGZuTmFtZSA9IHN1bW1hcnlGb3JKaXROYW1lKHN1bW1hcnkudHlwZS5yZWZlcmVuY2UubmFtZSk7XG4gICAgICAgIGNyZWF0ZVN1bW1hcnlGb3JKaXRGdW5jdGlvbihcbiAgICAgICAgICAgIHRoaXMub3V0cHV0Q3R4LCBzdW1tYXJ5LnR5cGUucmVmZXJlbmNlLFxuICAgICAgICAgICAgdGhpcy5zZXJpYWxpemVTdW1tYXJ5V2l0aERlcHMoc3VtbWFyeSwgbWV0YWRhdGEgISkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG5nTW9kdWxlU3ltYm9scy5mb3JFYWNoKChuZ01vZHVsZVN5bWJvbCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3VtbWFyeVJlc29sdmVyLmlzTGlicmFyeUZpbGUobmdNb2R1bGVTeW1ib2wuZmlsZVBhdGgpKSB7XG4gICAgICAgIGxldCBleHBvcnRBcyA9IGV4cG9ydEFzQnlTeW1ib2wuZ2V0KG5nTW9kdWxlU3ltYm9sKSB8fCBuZ01vZHVsZVN5bWJvbC5uYW1lO1xuICAgICAgICBjb25zdCBqaXRFeHBvcnRBc05hbWUgPSBzdW1tYXJ5Rm9ySml0TmFtZShleHBvcnRBcyk7XG4gICAgICAgIHRoaXMub3V0cHV0Q3R4LnN0YXRlbWVudHMucHVzaChvLnZhcmlhYmxlKGppdEV4cG9ydEFzTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KHRoaXMuc2VyaWFsaXplU3VtbWFyeVJlZihuZ01vZHVsZVN5bWJvbCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvRGVjbFN0bXQobnVsbCwgW28uU3RtdE1vZGlmaWVyLkV4cG9ydGVkXSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXJpYWxpemVTdW1tYXJ5V2l0aERlcHMoXG4gICAgICBzdW1tYXJ5OiBDb21waWxlVHlwZVN1bW1hcnksIG1ldGFkYXRhOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YXxDb21waWxlRGlyZWN0aXZlTWV0YWRhdGF8XG4gICAgICBDb21waWxlUGlwZU1ldGFkYXRhfENvbXBpbGVUeXBlTWV0YWRhdGEpOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGV4cHJlc3Npb25zOiBvLkV4cHJlc3Npb25bXSA9IFt0aGlzLnNlcmlhbGl6ZVN1bW1hcnkoc3VtbWFyeSldO1xuICAgIGxldCBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10gPSBbXTtcbiAgICBpZiAobWV0YWRhdGEgaW5zdGFuY2VvZiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSkge1xuICAgICAgZXhwcmVzc2lvbnMucHVzaCguLi5cbiAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGRpcmVjdGl2ZXMgLyBwaXBlcywgd2Ugb25seSBhZGQgdGhlIGRlY2xhcmVkIG9uZXMsXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIGFuZCByZWx5IG9uIHRyYW5zaXRpdmVseSBpbXBvcnRpbmcgTmdNb2R1bGVzIHRvIGdldCB0aGUgdHJhbnNpdGl2ZVxuICAgICAgICAgICAgICAgICAgICAgICAvLyBzdW1tYXJpZXMuXG4gICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhLmRlY2xhcmVkRGlyZWN0aXZlcy5jb25jYXQobWV0YWRhdGEuZGVjbGFyZWRQaXBlcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAodHlwZSA9PiB0eXBlLnJlZmVyZW5jZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBtb2R1bGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgYWxzbyBhZGQgdGhlIHN1bW1hcmllcyBmb3IgbW9kdWxlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZnJvbSBsaWJyYXJpZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIG9rIGFzIHdlIHByb2R1Y2UgcmVleHBvcnRzIGZvciBhbGwgdHJhbnNpdGl2ZSBtb2R1bGVzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChtZXRhZGF0YS50cmFuc2l0aXZlTW9kdWxlLm1vZHVsZXMubWFwKHR5cGUgPT4gdHlwZS5yZWZlcmVuY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHJlZiA9PiByZWYgIT09IG1ldGFkYXRhLnR5cGUucmVmZXJlbmNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKHJlZikgPT4gdGhpcy5zZXJpYWxpemVTdW1tYXJ5UmVmKHJlZikpKTtcbiAgICAgIC8vIE5vdGU6IFdlIGRvbid0IHVzZSBgTmdNb2R1bGVTdW1tYXJ5LnByb3ZpZGVyc2AsIGFzIHRoYXQgb25lIGlzIHRyYW5zaXRpdmUsXG4gICAgICAvLyBhbmQgd2UgYWxyZWFkeSBoYXZlIHRyYW5zaXRpdmUgbW9kdWxlcy5cbiAgICAgIHByb3ZpZGVycyA9IG1ldGFkYXRhLnByb3ZpZGVycztcbiAgICB9IGVsc2UgaWYgKHN1bW1hcnkuc3VtbWFyeUtpbmQgPT09IENvbXBpbGVTdW1tYXJ5S2luZC5EaXJlY3RpdmUpIHtcbiAgICAgIGNvbnN0IGRpclN1bW1hcnkgPSA8Q29tcGlsZURpcmVjdGl2ZVN1bW1hcnk+c3VtbWFyeTtcbiAgICAgIHByb3ZpZGVycyA9IGRpclN1bW1hcnkucHJvdmlkZXJzLmNvbmNhdChkaXJTdW1tYXJ5LnZpZXdQcm92aWRlcnMpO1xuICAgIH1cbiAgICAvLyBOb3RlOiBXZSBjYW4ndCBqdXN0IHJlZmVyIHRvIHRoZSBgbmdzdW1tYXJ5LnRzYCBmaWxlcyBmb3IgYHVzZUNsYXNzYCBwcm92aWRlcnMgKGFzIHdlIGRvIGZvclxuICAgIC8vIGRlY2xhcmVkRGlyZWN0aXZlcyAvIGRlY2xhcmVkUGlwZXMpLCBhcyB3ZSBhbGxvd1xuICAgIC8vIHByb3ZpZGVycyB3aXRob3V0IGN0b3IgYXJndW1lbnRzIHRvIHNraXAgdGhlIGBASW5qZWN0YWJsZWAgZGVjb3JhdG9yLFxuICAgIC8vIGkuZS4gd2UgZGlkbid0IGdlbmVyYXRlIC5uZ3N1bW1hcnkudHMgZmlsZXMgZm9yIHRoZXNlLlxuICAgIGV4cHJlc3Npb25zLnB1c2goXG4gICAgICAgIC4uLnByb3ZpZGVycy5maWx0ZXIocHJvdmlkZXIgPT4gISFwcm92aWRlci51c2VDbGFzcykubWFwKHByb3ZpZGVyID0+IHRoaXMuc2VyaWFsaXplU3VtbWFyeSh7XG4gICAgICAgICAgc3VtbWFyeUtpbmQ6IENvbXBpbGVTdW1tYXJ5S2luZC5JbmplY3RhYmxlLCB0eXBlOiBwcm92aWRlci51c2VDbGFzc1xuICAgICAgICB9IGFzIENvbXBpbGVUeXBlU3VtbWFyeSkpKTtcbiAgICByZXR1cm4gby5saXRlcmFsQXJyKGV4cHJlc3Npb25zKTtcbiAgfVxuXG4gIHByaXZhdGUgc2VyaWFsaXplU3VtbWFyeVJlZih0eXBlU3ltYm9sOiBTdGF0aWNTeW1ib2wpOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGppdEltcG9ydGVkU3ltYm9sID0gdGhpcy5zeW1ib2xSZXNvbHZlci5nZXRTdGF0aWNTeW1ib2woXG4gICAgICAgIHN1bW1hcnlGb3JKaXRGaWxlTmFtZSh0eXBlU3ltYm9sLmZpbGVQYXRoKSwgc3VtbWFyeUZvckppdE5hbWUodHlwZVN5bWJvbC5uYW1lKSk7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0Q3R4LmltcG9ydEV4cHIoaml0SW1wb3J0ZWRTeW1ib2wpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXJpYWxpemVTdW1tYXJ5KGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogby5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBvdXRwdXRDdHggPSB0aGlzLm91dHB1dEN0eDtcblxuICAgIGNsYXNzIFRyYW5zZm9ybWVyIGltcGxlbWVudHMgVmFsdWVWaXNpdG9yIHtcbiAgICAgIHZpc2l0QXJyYXkoYXJyOiBhbnlbXSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIG8ubGl0ZXJhbEFycihhcnIubWFwKGVudHJ5ID0+IHZpc2l0VmFsdWUoZW50cnksIHRoaXMsIGNvbnRleHQpKSk7XG4gICAgICB9XG4gICAgICB2aXNpdFN0cmluZ01hcChtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgICByZXR1cm4gbmV3IG8uTGl0ZXJhbE1hcEV4cHIoT2JqZWN0LmtleXMobWFwKS5tYXAoXG4gICAgICAgICAgICAoa2V5KSA9PiBuZXcgby5MaXRlcmFsTWFwRW50cnkoa2V5LCB2aXNpdFZhbHVlKG1hcFtrZXldLCB0aGlzLCBjb250ZXh0KSwgZmFsc2UpKSk7XG4gICAgICB9XG4gICAgICB2aXNpdFByaW1pdGl2ZSh2YWx1ZTogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gby5saXRlcmFsKHZhbHVlKTsgfVxuICAgICAgdmlzaXRPdGhlcih2YWx1ZTogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgICAgICByZXR1cm4gb3V0cHV0Q3R4LmltcG9ydEV4cHIodmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSWxsZWdhbCBTdGF0ZTogRW5jb3VudGVyZWQgdmFsdWUgJHt2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2aXNpdFZhbHVlKGRhdGEsIG5ldyBUcmFuc2Zvcm1lcigpLCBudWxsKTtcbiAgfVxufVxuXG5jbGFzcyBGcm9tSnNvbkRlc2VyaWFsaXplciBleHRlbmRzIFZhbHVlVHJhbnNmb3JtZXIge1xuICBwcml2YXRlIHN5bWJvbHM6IFN0YXRpY1N5bWJvbFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBzeW1ib2xDYWNoZTogU3RhdGljU3ltYm9sQ2FjaGUsXG4gICAgICBwcml2YXRlIHN1bW1hcnlSZXNvbHZlcjogU3VtbWFyeVJlc29sdmVyPFN0YXRpY1N5bWJvbD4pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZGVzZXJpYWxpemUobGlicmFyeUZpbGVOYW1lOiBzdHJpbmcsIGpzb246IHN0cmluZyk6IHtcbiAgICBtb2R1bGVOYW1lOiBzdHJpbmcgfCBudWxsLFxuICAgIHN1bW1hcmllczogU3VtbWFyeTxTdGF0aWNTeW1ib2w+W10sXG4gICAgaW1wb3J0QXM6IHtzeW1ib2w6IFN0YXRpY1N5bWJvbCwgaW1wb3J0QXM6IFN0YXRpY1N5bWJvbH1bXVxuICB9IHtcbiAgICBjb25zdCBkYXRhOiB7bW9kdWxlTmFtZTogc3RyaW5nIHwgbnVsbCwgc3VtbWFyaWVzOiBhbnlbXSwgc3ltYm9sczogYW55W119ID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICBjb25zdCBhbGxJbXBvcnRBczoge3N5bWJvbDogU3RhdGljU3ltYm9sLCBpbXBvcnRBczogU3RhdGljU3ltYm9sfVtdID0gW107XG4gICAgdGhpcy5zeW1ib2xzID0gZGF0YS5zeW1ib2xzLm1hcChcbiAgICAgICAgKHNlcmlhbGl6ZWRTeW1ib2wpID0+IHRoaXMuc3ltYm9sQ2FjaGUuZ2V0KFxuICAgICAgICAgICAgdGhpcy5zdW1tYXJ5UmVzb2x2ZXIuZnJvbVN1bW1hcnlGaWxlTmFtZShzZXJpYWxpemVkU3ltYm9sLmZpbGVQYXRoLCBsaWJyYXJ5RmlsZU5hbWUpLFxuICAgICAgICAgICAgc2VyaWFsaXplZFN5bWJvbC5uYW1lKSk7XG4gICAgZGF0YS5zeW1ib2xzLmZvckVhY2goKHNlcmlhbGl6ZWRTeW1ib2wsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBzeW1ib2wgPSB0aGlzLnN5bWJvbHNbaW5kZXhdO1xuICAgICAgY29uc3QgaW1wb3J0QXMgPSBzZXJpYWxpemVkU3ltYm9sLmltcG9ydEFzO1xuICAgICAgaWYgKHR5cGVvZiBpbXBvcnRBcyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgYWxsSW1wb3J0QXMucHVzaCh7c3ltYm9sLCBpbXBvcnRBczogdGhpcy5zeW1ib2xzW2ltcG9ydEFzXX0pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW1wb3J0QXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGFsbEltcG9ydEFzLnB1c2goXG4gICAgICAgICAgICB7c3ltYm9sLCBpbXBvcnRBczogdGhpcy5zeW1ib2xDYWNoZS5nZXQobmdmYWN0b3J5RmlsZVBhdGgobGlicmFyeUZpbGVOYW1lKSwgaW1wb3J0QXMpfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc3Qgc3VtbWFyaWVzID0gdmlzaXRWYWx1ZShkYXRhLnN1bW1hcmllcywgdGhpcywgbnVsbCkgYXMgU3VtbWFyeTxTdGF0aWNTeW1ib2w+W107XG4gICAgcmV0dXJuIHttb2R1bGVOYW1lOiBkYXRhLm1vZHVsZU5hbWUsIHN1bW1hcmllcywgaW1wb3J0QXM6IGFsbEltcG9ydEFzfTtcbiAgfVxuXG4gIHZpc2l0U3RyaW5nTWFwKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKCdfX3N5bWJvbCcgaW4gbWFwKSB7XG4gICAgICBjb25zdCBiYXNlU3ltYm9sID0gdGhpcy5zeW1ib2xzW21hcFsnX19zeW1ib2wnXV07XG4gICAgICBjb25zdCBtZW1iZXJzID0gbWFwWydtZW1iZXJzJ107XG4gICAgICByZXR1cm4gbWVtYmVycy5sZW5ndGggPyB0aGlzLnN5bWJvbENhY2hlLmdldChiYXNlU3ltYm9sLmZpbGVQYXRoLCBiYXNlU3ltYm9sLm5hbWUsIG1lbWJlcnMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VTeW1ib2w7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdXBlci52aXNpdFN0cmluZ01hcChtYXAsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NhbGwobWV0YWRhdGE6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbWV0YWRhdGEgJiYgbWV0YWRhdGEuX19zeW1ib2xpYyA9PT0gJ2NhbGwnO1xufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uQ2FsbChtZXRhZGF0YTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0NhbGwobWV0YWRhdGEpICYmIHVud3JhcFJlc29sdmVkTWV0YWRhdGEobWV0YWRhdGEuZXhwcmVzc2lvbikgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2w7XG59XG5cbmZ1bmN0aW9uIGlzTWV0aG9kQ2FsbE9uVmFyaWFibGUobWV0YWRhdGE6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNDYWxsKG1ldGFkYXRhKSAmJiBtZXRhZGF0YS5leHByZXNzaW9uICYmIG1ldGFkYXRhLmV4cHJlc3Npb24uX19zeW1ib2xpYyA9PT0gJ3NlbGVjdCcgJiZcbiAgICAgIHVud3JhcFJlc29sdmVkTWV0YWRhdGEobWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uKSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbDtcbn1cbiJdfQ==