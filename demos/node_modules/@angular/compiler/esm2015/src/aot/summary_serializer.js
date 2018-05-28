/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileNgModuleMetadata, CompileSummaryKind } from '../compile_metadata';
import * as o from '../output/output_ast';
import { ValueTransformer, visitValue } from '../util';
import { StaticSymbol } from './static_symbol';
import { unwrapResolvedMetadata } from './static_symbol_resolver';
import { isLoweredSymbol, ngfactoryFilePath, summaryForJitFileName, summaryForJitName } from './util';
export function serializeSummaries(srcFileName, forJitCtx, summaryResolver, symbolResolver, symbols, types) {
    const toJsonSerializer = new ToJsonSerializer(symbolResolver, summaryResolver, srcFileName);
    // for symbols, we use everything except for the class metadata itself
    // (we keep the statics though), as the class metadata is contained in the
    // CompileTypeSummary.
    symbols.forEach((resolvedSymbol) => toJsonSerializer.addSummary({ symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata }));
    // Add type summaries.
    types.forEach(({ summary, metadata }) => {
        toJsonSerializer.addSummary({ symbol: summary.type.reference, metadata: undefined, type: summary });
    });
    const { json, exportAs } = toJsonSerializer.serialize();
    if (forJitCtx) {
        const forJitSerializer = new ForJitSerializer(forJitCtx, symbolResolver, summaryResolver);
        types.forEach(({ summary, metadata }) => { forJitSerializer.addSourceType(summary, metadata); });
        toJsonSerializer.unprocessedSymbolSummariesBySymbol.forEach((summary) => {
            if (summaryResolver.isLibraryFile(summary.symbol.filePath) && summary.type) {
                forJitSerializer.addLibType(summary.type);
            }
        });
        forJitSerializer.serialize(exportAs);
    }
    return { json, exportAs };
}
export function deserializeSummaries(symbolCache, summaryResolver, libraryFileName, json) {
    const deserializer = new FromJsonDeserializer(symbolCache, summaryResolver);
    return deserializer.deserialize(libraryFileName, json);
}
export function createForJitStub(outputCtx, reference) {
    return createSummaryForJitFunction(outputCtx, reference, o.NULL_EXPR);
}
function createSummaryForJitFunction(outputCtx, reference, value) {
    const fnName = summaryForJitName(reference.name);
    outputCtx.statements.push(o.fn([], [new o.ReturnStatement(value)], new o.ArrayType(o.DYNAMIC_TYPE)).toDeclStmt(fnName, [
        o.StmtModifier.Final, o.StmtModifier.Exported
    ]));
}
class ToJsonSerializer extends ValueTransformer {
    constructor(symbolResolver, summaryResolver, srcFileName) {
        super();
        this.symbolResolver = symbolResolver;
        this.summaryResolver = summaryResolver;
        this.srcFileName = srcFileName;
        // Note: This only contains symbols without members.
        this.symbols = [];
        this.indexBySymbol = new Map();
        this.reexportedBy = new Map();
        // This now contains a `__symbol: number` in the place of
        // StaticSymbols, but otherwise has the same shape as the original objects.
        this.processedSummaryBySymbol = new Map();
        this.processedSummaries = [];
        this.unprocessedSymbolSummariesBySymbol = new Map();
        this.moduleName = symbolResolver.getKnownModuleName(srcFileName);
    }
    addSummary(summary) {
        let unprocessedSummary = this.unprocessedSymbolSummariesBySymbol.get(summary.symbol);
        let processedSummary = this.processedSummaryBySymbol.get(summary.symbol);
        if (!unprocessedSummary) {
            unprocessedSummary = { symbol: summary.symbol, metadata: undefined };
            this.unprocessedSymbolSummariesBySymbol.set(summary.symbol, unprocessedSummary);
            processedSummary = { symbol: this.processValue(summary.symbol, 0 /* None */) };
            this.processedSummaries.push(processedSummary);
            this.processedSummaryBySymbol.set(summary.symbol, processedSummary);
        }
        if (!unprocessedSummary.metadata && summary.metadata) {
            let metadata = summary.metadata || {};
            if (metadata.__symbolic === 'class') {
                // For classes, we keep everything except their class decorators.
                // We need to keep e.g. the ctor args, method names, method decorators
                // so that the class can be extended in another compilation unit.
                // We don't keep the class decorators as
                // 1) they refer to data
                //   that should not cause a rebuild of downstream compilation units
                //   (e.g. inline templates of @Component, or @NgModule.declarations)
                // 2) their data is already captured in TypeSummaries, e.g. DirectiveSummary.
                const clone = {};
                Object.keys(metadata).forEach((propName) => {
                    if (propName !== 'decorators') {
                        clone[propName] = metadata[propName];
                    }
                });
                metadata = clone;
            }
            else if (isCall(metadata)) {
                if (!isFunctionCall(metadata) && !isMethodCallOnVariable(metadata)) {
                    // Don't store complex calls as we won't be able to simplify them anyways later on.
                    metadata = {
                        __symbolic: 'error',
                        message: 'Complex function calls are not supported.',
                    };
                }
            }
            // Note: We need to keep storing ctor calls for e.g.
            // `export const x = new InjectionToken(...)`
            unprocessedSummary.metadata = metadata;
            processedSummary.metadata = this.processValue(metadata, 1 /* ResolveValue */);
            if (metadata instanceof StaticSymbol &&
                this.summaryResolver.isLibraryFile(metadata.filePath)) {
                const declarationSymbol = this.symbols[this.indexBySymbol.get(metadata)];
                if (!isLoweredSymbol(declarationSymbol.name)) {
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
            if (summary.type.summaryKind === CompileSummaryKind.NgModule) {
                const ngModuleSummary = summary.type;
                ngModuleSummary.exportedDirectives.concat(ngModuleSummary.exportedPipes).forEach((id) => {
                    const symbol = id.reference;
                    if (this.summaryResolver.isLibraryFile(symbol.filePath) &&
                        !this.unprocessedSymbolSummariesBySymbol.has(symbol)) {
                        const summary = this.summaryResolver.resolveSummary(symbol);
                        if (summary) {
                            this.addSummary(summary);
                        }
                    }
                });
            }
        }
    }
    serialize() {
        const exportAs = [];
        const json = JSON.stringify({
            moduleName: this.moduleName,
            summaries: this.processedSummaries,
            symbols: this.symbols.map((symbol, index) => {
                symbol.assertNoMembers();
                let importAs = undefined;
                if (this.summaryResolver.isLibraryFile(symbol.filePath)) {
                    const reexportSymbol = this.reexportedBy.get(symbol);
                    if (reexportSymbol) {
                        importAs = this.indexBySymbol.get(reexportSymbol);
                    }
                    else {
                        const summary = this.unprocessedSymbolSummariesBySymbol.get(symbol);
                        if (!summary || !summary.metadata || summary.metadata.__symbolic !== 'interface') {
                            importAs = `${symbol.name}_${index}`;
                            exportAs.push({ symbol, exportAs: importAs });
                        }
                    }
                }
                return {
                    __symbol: index,
                    name: symbol.name,
                    filePath: this.summaryResolver.toSummaryFileName(symbol.filePath, this.srcFileName),
                    importAs: importAs
                };
            })
        });
        return { json, exportAs };
    }
    processValue(value, flags) {
        return visitValue(value, this, flags);
    }
    visitOther(value, context) {
        if (value instanceof StaticSymbol) {
            let baseSymbol = this.symbolResolver.getStaticSymbol(value.filePath, value.name);
            const index = this.visitStaticSymbol(baseSymbol, context);
            return { __symbol: index, members: value.members };
        }
    }
    /**
     * Strip line and character numbers from ngsummaries.
     * Emitting them causes white spaces changes to retrigger upstream
     * recompilations in bazel.
     * TODO: find out a way to have line and character numbers in errors without
     * excessive recompilation in bazel.
     */
    visitStringMap(map, context) {
        if (map['__symbolic'] === 'resolved') {
            return visitValue(map.symbol, this, context);
        }
        if (map['__symbolic'] === 'error') {
            delete map['line'];
            delete map['character'];
        }
        return super.visitStringMap(map, context);
    }
    /**
     * Returns null if the options.resolveValue is true, and the summary for the symbol
     * resolved to a type or could not be resolved.
     */
    visitStaticSymbol(baseSymbol, flags) {
        let index = this.indexBySymbol.get(baseSymbol);
        let summary = null;
        if (flags & 1 /* ResolveValue */ &&
            this.summaryResolver.isLibraryFile(baseSymbol.filePath)) {
            if (this.unprocessedSymbolSummariesBySymbol.has(baseSymbol)) {
                // the summary for this symbol was already added
                // -> nothing to do.
                return index;
            }
            summary = this.loadSummary(baseSymbol);
            if (summary && summary.metadata instanceof StaticSymbol) {
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
    }
    loadSummary(symbol) {
        let summary = this.summaryResolver.resolveSummary(symbol);
        if (!summary) {
            // some symbols might originate from a plain typescript library
            // that just exported .d.ts and .metadata.json files, i.e. where no summary
            // files were created.
            const resolvedSymbol = this.symbolResolver.resolveSymbol(symbol);
            if (resolvedSymbol) {
                summary = { symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata };
            }
        }
        return summary;
    }
}
class ForJitSerializer {
    constructor(outputCtx, symbolResolver, summaryResolver) {
        this.outputCtx = outputCtx;
        this.symbolResolver = symbolResolver;
        this.summaryResolver = summaryResolver;
        this.data = [];
    }
    addSourceType(summary, metadata) {
        this.data.push({ summary, metadata, isLibrary: false });
    }
    addLibType(summary) {
        this.data.push({ summary, metadata: null, isLibrary: true });
    }
    serialize(exportAsArr) {
        const exportAsBySymbol = new Map();
        for (const { symbol, exportAs } of exportAsArr) {
            exportAsBySymbol.set(symbol, exportAs);
        }
        const ngModuleSymbols = new Set();
        for (const { summary, metadata, isLibrary } of this.data) {
            if (summary.summaryKind === CompileSummaryKind.NgModule) {
                // collect the symbols that refer to NgModule classes.
                // Note: we can't just rely on `summary.type.summaryKind` to determine this as
                // we don't add the summaries of all referenced symbols when we serialize type summaries.
                // See serializeSummaries for details.
                ngModuleSymbols.add(summary.type.reference);
                const modSummary = summary;
                for (const mod of modSummary.modules) {
                    ngModuleSymbols.add(mod.reference);
                }
            }
            if (!isLibrary) {
                const fnName = summaryForJitName(summary.type.reference.name);
                createSummaryForJitFunction(this.outputCtx, summary.type.reference, this.serializeSummaryWithDeps(summary, metadata));
            }
        }
        ngModuleSymbols.forEach((ngModuleSymbol) => {
            if (this.summaryResolver.isLibraryFile(ngModuleSymbol.filePath)) {
                let exportAs = exportAsBySymbol.get(ngModuleSymbol) || ngModuleSymbol.name;
                const jitExportAsName = summaryForJitName(exportAs);
                this.outputCtx.statements.push(o.variable(jitExportAsName)
                    .set(this.serializeSummaryRef(ngModuleSymbol))
                    .toDeclStmt(null, [o.StmtModifier.Exported]));
            }
        });
    }
    serializeSummaryWithDeps(summary, metadata) {
        const expressions = [this.serializeSummary(summary)];
        let providers = [];
        if (metadata instanceof CompileNgModuleMetadata) {
            expressions.push(...
            // For directives / pipes, we only add the declared ones,
            // and rely on transitively importing NgModules to get the transitive
            // summaries.
            metadata.declaredDirectives.concat(metadata.declaredPipes)
                .map(type => type.reference)
                .concat(metadata.transitiveModule.modules.map(type => type.reference)
                .filter(ref => ref !== metadata.type.reference))
                .map((ref) => this.serializeSummaryRef(ref)));
            // Note: We don't use `NgModuleSummary.providers`, as that one is transitive,
            // and we already have transitive modules.
            providers = metadata.providers;
        }
        else if (summary.summaryKind === CompileSummaryKind.Directive) {
            const dirSummary = summary;
            providers = dirSummary.providers.concat(dirSummary.viewProviders);
        }
        // Note: We can't just refer to the `ngsummary.ts` files for `useClass` providers (as we do for
        // declaredDirectives / declaredPipes), as we allow
        // providers without ctor arguments to skip the `@Injectable` decorator,
        // i.e. we didn't generate .ngsummary.ts files for these.
        expressions.push(...providers.filter(provider => !!provider.useClass).map(provider => this.serializeSummary({
            summaryKind: CompileSummaryKind.Injectable, type: provider.useClass
        })));
        return o.literalArr(expressions);
    }
    serializeSummaryRef(typeSymbol) {
        const jitImportedSymbol = this.symbolResolver.getStaticSymbol(summaryForJitFileName(typeSymbol.filePath), summaryForJitName(typeSymbol.name));
        return this.outputCtx.importExpr(jitImportedSymbol);
    }
    serializeSummary(data) {
        const outputCtx = this.outputCtx;
        class Transformer {
            visitArray(arr, context) {
                return o.literalArr(arr.map(entry => visitValue(entry, this, context)));
            }
            visitStringMap(map, context) {
                return new o.LiteralMapExpr(Object.keys(map).map((key) => new o.LiteralMapEntry(key, visitValue(map[key], this, context), false)));
            }
            visitPrimitive(value, context) { return o.literal(value); }
            visitOther(value, context) {
                if (value instanceof StaticSymbol) {
                    return outputCtx.importExpr(value);
                }
                else {
                    throw new Error(`Illegal State: Encountered value ${value}`);
                }
            }
        }
        return visitValue(data, new Transformer(), null);
    }
}
class FromJsonDeserializer extends ValueTransformer {
    constructor(symbolCache, summaryResolver) {
        super();
        this.symbolCache = symbolCache;
        this.summaryResolver = summaryResolver;
    }
    deserialize(libraryFileName, json) {
        const data = JSON.parse(json);
        const allImportAs = [];
        this.symbols = data.symbols.map((serializedSymbol) => this.symbolCache.get(this.summaryResolver.fromSummaryFileName(serializedSymbol.filePath, libraryFileName), serializedSymbol.name));
        data.symbols.forEach((serializedSymbol, index) => {
            const symbol = this.symbols[index];
            const importAs = serializedSymbol.importAs;
            if (typeof importAs === 'number') {
                allImportAs.push({ symbol, importAs: this.symbols[importAs] });
            }
            else if (typeof importAs === 'string') {
                allImportAs.push({ symbol, importAs: this.symbolCache.get(ngfactoryFilePath(libraryFileName), importAs) });
            }
        });
        const summaries = visitValue(data.summaries, this, null);
        return { moduleName: data.moduleName, summaries, importAs: allImportAs };
    }
    visitStringMap(map, context) {
        if ('__symbol' in map) {
            const baseSymbol = this.symbols[map['__symbol']];
            const members = map['members'];
            return members.length ? this.symbolCache.get(baseSymbol.filePath, baseSymbol.name, members) :
                baseSymbol;
        }
        else {
            return super.visitStringMap(map, context);
        }
    }
}
function isCall(metadata) {
    return metadata && metadata.__symbolic === 'call';
}
function isFunctionCall(metadata) {
    return isCall(metadata) && unwrapResolvedMetadata(metadata.expression) instanceof StaticSymbol;
}
function isMethodCallOnVariable(metadata) {
    return isCall(metadata) && metadata.expression && metadata.expression.__symbolic === 'select' &&
        unwrapResolvedMetadata(metadata.expression.expression) instanceof StaticSymbol;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeV9zZXJpYWxpemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2FvdC9zdW1tYXJ5X3NlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFvRCx1QkFBdUIsRUFBd0Usa0JBQWtCLEVBQTBDLE1BQU0scUJBQXFCLENBQUM7QUFDbFAsT0FBTyxLQUFLLENBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUUxQyxPQUFPLEVBQWdCLGdCQUFnQixFQUFnQixVQUFVLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFbEYsT0FBTyxFQUFDLFlBQVksRUFBb0IsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRSxPQUFPLEVBQTZDLHNCQUFzQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDNUcsT0FBTyxFQUFDLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUVwRyxNQUFNLDZCQUNGLFdBQW1CLEVBQUUsU0FBK0IsRUFDcEQsZUFBOEMsRUFBRSxjQUFvQyxFQUNwRixPQUErQixFQUFFLEtBSTlCO0lBQ0wsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxlQUFlLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFNUYsc0VBQXNFO0lBQ3RFLDBFQUEwRTtJQUMxRSxzQkFBc0I7SUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FDWCxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUMzQyxFQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdFLHNCQUFzQjtJQUN0QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxPQUFP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QUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3JFLFVBQVUsQ0FBQztRQUNyQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsQ0FBQztJQUNILENBQUM7Q0FDRjtBQUVELGdCQUFnQixRQUFhO0lBQzNCLE1BQU0sQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxNQUFNLENBQUM7QUFDcEQsQ0FBQztBQUVELHdCQUF3QixRQUFhO0lBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksc0JBQXNCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZLFlBQVksQ0FBQztBQUNqRyxDQUFDO0FBRUQsZ0NBQWdDLFFBQWE7SUFDM0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxLQUFLLFFBQVE7UUFDekYsc0JBQXNCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsWUFBWSxZQUFZLENBQUM7QUFDckYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSwgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEsIENvbXBpbGVOZ01vZHVsZVN1bW1hcnksIENvbXBpbGVQaXBlTWV0YWRhdGEsIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLCBDb21waWxlU3VtbWFyeUtpbmQsIENvbXBpbGVUeXBlTWV0YWRhdGEsIENvbXBpbGVUeXBlU3VtbWFyeX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7U3VtbWFyeSwgU3VtbWFyeVJlc29sdmVyfSBmcm9tICcuLi9zdW1tYXJ5X3Jlc29sdmVyJztcbmltcG9ydCB7T3V0cHV0Q29udGV4dCwgVmFsdWVUcmFuc2Zvcm1lciwgVmFsdWVWaXNpdG9yLCB2aXNpdFZhbHVlfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtTdGF0aWNTeW1ib2wsIFN0YXRpY1N5bWJvbENhY2hlfSBmcm9tICcuL3N0YXRpY19zeW1ib2wnO1xuaW1wb3J0IHtSZXNvbHZlZFN0YXRpY1N5bWJvbCwgU3RhdGljU3ltYm9sUmVzb2x2ZXIsIHVud3JhcFJlc29sdmVkTWV0YWRhdGF9IGZyb20gJy4vc3RhdGljX3N5bWJvbF9yZXNvbHZlcic7XG5pbXBvcnQge2lzTG93ZXJlZFN5bWJvbCwgbmdmYWN0b3J5RmlsZVBhdGgsIHN1bW1hcnlGb3JKaXRGaWxlTmFtZSwgc3VtbWFyeUZvckppdE5hbWV9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVTdW1tYXJpZXMoXG4gICAgc3JjRmlsZU5hbWU6IHN0cmluZywgZm9ySml0Q3R4OiBPdXRwdXRDb250ZXh0IHwgbnVsbCxcbiAgICBzdW1tYXJ5UmVzb2x2ZXI6IFN1bW1hcnlSZXNvbHZlcjxTdGF0aWNTeW1ib2w+LCBzeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsXG4gICAgc3ltYm9sczogUmVzb2x2ZWRTdGF0aWNTeW1ib2xbXSwgdHlwZXM6IHtcbiAgICAgIHN1bW1hcnk6IENvbXBpbGVUeXBlU3VtbWFyeSxcbiAgICAgIG1ldGFkYXRhOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSB8IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB8IENvbXBpbGVQaXBlTWV0YWRhdGEgfFxuICAgICAgICAgIENvbXBpbGVUeXBlTWV0YWRhdGFcbiAgICB9W10pOiB7anNvbjogc3RyaW5nLCBleHBvcnRBczoge3N5bWJvbDogU3RhdGljU3ltYm9sLCBleHBvcnRBczogc3RyaW5nfVtdfSB7XG4gIGNvbnN0IHRvSnNvblNlcmlhbGl6ZXIgPSBuZXcgVG9Kc29uU2VyaWFsaXplcihzeW1ib2xSZXNvbHZlciwgc3VtbWFyeVJlc29sdmVyLCBzcmNGaWxlTmFtZSk7XG5cbiAgLy8gZm9yIHN5bWJvbHMsIHdlIHVzZSBldmVyeXRoaW5nIGV4Y2VwdCBmb3IgdGhlIGNsYXNzIG1ldGFkYXRhIGl0c2VsZlxuICAvLyAod2Uga2VlcCB0aGUgc3RhdGljcyB0aG91Z2gpLCBhcyB0aGUgY2xhc3MgbWV0YWRhdGEgaXMgY29udGFpbmVkIGluIHRoZVxuICAvLyBDb21waWxlVHlwZVN1bW1hcnkuXG4gIHN5bWJvbHMuZm9yRWFjaChcbiAgICAgIChyZXNvbHZlZFN5bWJvbCkgPT4gdG9Kc29uU2VyaWFsaXplci5hZGRTdW1tYXJ5KFxuICAgICAgICAgIHtzeW1ib2w6IHJlc29sdmVkU3ltYm9sLnN5bWJvbCwgbWV0YWRhdGE6IHJlc29sdmVkU3ltYm9sLm1ldGFkYXRhfSkpO1xuXG4gIC8vIEFkZCB0eXBlIHN1bW1hcmllcy5cbiAgdHlwZXMuZm9yRWFjaCgoe3N1bW1hcnksIG1ldGFkYXRhfSkgPT4ge1xuICAgIHRvSnNvblNlcmlhbGl6ZXIuYWRkU3VtbWFyeShcbiAgICAgICAge3N5bWJvbDogc3VtbWFyeS50eXBlLnJlZmVyZW5jZSwgbWV0YWRhdGE6IHVuZGVmaW5lZCwgdHlwZTogc3VtbWFyeX0pO1xuICB9KTtcbiAgY29uc3Qge2pzb24sIGV4cG9ydEFzfSA9IHRvSnNvblNlcmlhbGl6ZXIuc2VyaWFsaXplKCk7XG4gIGlmIChmb3JKaXRDdHgpIHtcbiAgICBjb25zdCBmb3JKaXRTZXJpYWxpemVyID0gbmV3IEZvckppdFNlcmlhbGl6ZXIoZm9ySml0Q3R4LCBzeW1ib2xSZXNvbHZlciwgc3VtbWFyeVJlc29sdmVyKTtcbiAgICB0eXBlcy5mb3JFYWNoKCh7c3VtbWFyeSwgbWV0YWRhdGF9KSA9PiB7IGZvckppdFNlcmlhbGl6ZXIuYWRkU291cmNlVHlwZShzdW1tYXJ5LCBtZXRhZGF0YSk7IH0pO1xuICAgIHRvSnNvblNlcmlhbGl6ZXIudW5wcm9jZXNzZWRTeW1ib2xTdW1tYXJpZXNCeVN5bWJvbC5mb3JFYWNoKChzdW1tYXJ5KSA9PiB7XG4gICAgICBpZiAoc3VtbWFyeVJlc29sdmVyLmlzTGlicmFyeUZpbGUoc3VtbWFyeS5zeW1ib2wuZmlsZVBhdGgpICYmIHN1bW1hcnkudHlwZSkge1xuICAgICAgICBmb3JKaXRTZXJpYWxpemVyLmFkZExpYlR5cGUoc3VtbWFyeS50eXBlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBmb3JKaXRTZXJpYWxpemVyLnNlcmlhbGl6ZShleHBvcnRBcyk7XG4gIH1cbiAgcmV0dXJuIHtqc29uLCBleHBvcnRBc307XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXNlcmlhbGl6ZVN1bW1hcmllcyhcbiAgICBzeW1ib2xDYWNoZTogU3RhdGljU3ltYm9sQ2FjaGUsIHN1bW1hcnlSZXNvbHZlcjogU3VtbWFyeVJlc29sdmVyPFN0YXRpY1N5bWJvbD4sXG4gICAgbGlicmFyeUZpbGVOYW1lOiBzdHJpbmcsIGpzb246IHN0cmluZyk6IHtcbiAgbW9kdWxlTmFtZTogc3RyaW5nIHwgbnVsbCxcbiAgc3VtbWFyaWVzOiBTdW1tYXJ5PFN0YXRpY1N5bWJvbD5bXSxcbiAgaW1wb3J0QXM6IHtzeW1ib2w6IFN0YXRpY1N5bWJvbCwgaW1wb3J0QXM6IFN0YXRpY1N5bWJvbH1bXVxufSB7XG4gIGNvbnN0IGRlc2VyaWFsaXplciA9IG5ldyBGcm9tSnNvbkRlc2VyaWFsaXplcihzeW1ib2xDYWNoZSwgc3VtbWFyeVJlc29sdmVyKTtcbiAgcmV0dXJuIGRlc2VyaWFsaXplci5kZXNlcmlhbGl6ZShsaWJyYXJ5RmlsZU5hbWUsIGpzb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRm9ySml0U3R1YihvdXRwdXRDdHg6IE91dHB1dENvbnRleHQsIHJlZmVyZW5jZTogU3RhdGljU3ltYm9sKSB7XG4gIHJldHVybiBjcmVhdGVTdW1tYXJ5Rm9ySml0RnVuY3Rpb24ob3V0cHV0Q3R4LCByZWZlcmVuY2UsIG8uTlVMTF9FWFBSKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3VtbWFyeUZvckppdEZ1bmN0aW9uKFxuICAgIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgcmVmZXJlbmNlOiBTdGF0aWNTeW1ib2wsIHZhbHVlOiBvLkV4cHJlc3Npb24pIHtcbiAgY29uc3QgZm5OYW1lID0gc3VtbWFyeUZvckppdE5hbWUocmVmZXJlbmNlLm5hbWUpO1xuICBvdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKFxuICAgICAgby5mbihbXSwgW25ldyBvLlJldHVyblN0YXRlbWVudCh2YWx1ZSldLCBuZXcgby5BcnJheVR5cGUoby5EWU5BTUlDX1RZUEUpKS50b0RlY2xTdG10KGZuTmFtZSwgW1xuICAgICAgICBvLlN0bXRNb2RpZmllci5GaW5hbCwgby5TdG10TW9kaWZpZXIuRXhwb3J0ZWRcbiAgICAgIF0pKTtcbn1cblxuY29uc3QgZW51bSBTZXJpYWxpemF0aW9uRmxhZ3Mge1xuICBOb25lID0gMCxcbiAgUmVzb2x2ZVZhbHVlID0gMSxcbn1cblxuY2xhc3MgVG9Kc29uU2VyaWFsaXplciBleHRlbmRzIFZhbHVlVHJhbnNmb3JtZXIge1xuICAvLyBOb3RlOiBUaGlzIG9ubHkgY29udGFpbnMgc3ltYm9scyB3aXRob3V0IG1lbWJlcnMuXG4gIHByaXZhdGUgc3ltYm9sczogU3RhdGljU3ltYm9sW10gPSBbXTtcbiAgcHJpdmF0ZSBpbmRleEJ5U3ltYm9sID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIG51bWJlcj4oKTtcbiAgcHJpdmF0ZSByZWV4cG9ydGVkQnkgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgU3RhdGljU3ltYm9sPigpO1xuICAvLyBUaGlzIG5vdyBjb250YWlucyBhIGBfX3N5bWJvbDogbnVtYmVyYCBpbiB0aGUgcGxhY2Ugb2ZcbiAgLy8gU3RhdGljU3ltYm9scywgYnV0IG90aGVyd2lzZSBoYXMgdGhlIHNhbWUgc2hhcGUgYXMgdGhlIG9yaWdpbmFsIG9iamVjdHMuXG4gIHByaXZhdGUgcHJvY2Vzc2VkU3VtbWFyeUJ5U3ltYm9sID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIGFueT4oKTtcbiAgcHJpdmF0ZSBwcm9jZXNzZWRTdW1tYXJpZXM6IGFueVtdID0gW107XG4gIHByaXZhdGUgbW9kdWxlTmFtZTogc3RyaW5nfG51bGw7XG5cbiAgdW5wcm9jZXNzZWRTeW1ib2xTdW1tYXJpZXNCeVN5bWJvbCA9IG5ldyBNYXA8U3RhdGljU3ltYm9sLCBTdW1tYXJ5PFN0YXRpY1N5bWJvbD4+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHN5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcixcbiAgICAgIHByaXZhdGUgc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8U3RhdGljU3ltYm9sPiwgcHJpdmF0ZSBzcmNGaWxlTmFtZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm1vZHVsZU5hbWUgPSBzeW1ib2xSZXNvbHZlci5nZXRLbm93bk1vZHVsZU5hbWUoc3JjRmlsZU5hbWUpO1xuICB9XG5cbiAgYWRkU3VtbWFyeShzdW1tYXJ5OiBTdW1tYXJ5PFN0YXRpY1N5bWJvbD4pIHtcbiAgICBsZXQgdW5wcm9jZXNzZWRTdW1tYXJ5ID0gdGhpcy51bnByb2Nlc3NlZFN5bWJvbFN1bW1hcmllc0J5U3ltYm9sLmdldChzdW1tYXJ5LnN5bWJvbCk7XG4gICAgbGV0IHByb2Nlc3NlZFN1bW1hcnkgPSB0aGlzLnByb2Nlc3NlZFN1bW1hcnlCeVN5bWJvbC5nZXQoc3VtbWFyeS5zeW1ib2wpO1xuICAgIGlmICghdW5wcm9jZXNzZWRTdW1tYXJ5KSB7XG4gICAgICB1bnByb2Nlc3NlZFN1bW1hcnkgPSB7c3ltYm9sOiBzdW1tYXJ5LnN5bWJvbCwgbWV0YWRhdGE6IHVuZGVmaW5lZH07XG4gICAgICB0aGlzLnVucHJvY2Vzc2VkU3ltYm9sU3VtbWFyaWVzQnlTeW1ib2wuc2V0KHN1bW1hcnkuc3ltYm9sLCB1bnByb2Nlc3NlZFN1bW1hcnkpO1xuICAgICAgcHJvY2Vzc2VkU3VtbWFyeSA9IHtzeW1ib2w6IHRoaXMucHJvY2Vzc1ZhbHVlKHN1bW1hcnkuc3ltYm9sLCBTZXJpYWxpemF0aW9uRmxhZ3MuTm9uZSl9O1xuICAgICAgdGhpcy5wcm9jZXNzZWRTdW1tYXJpZXMucHVzaChwcm9jZXNzZWRTdW1tYXJ5KTtcbiAgICAgIHRoaXMucHJvY2Vzc2VkU3VtbWFyeUJ5U3ltYm9sLnNldChzdW1tYXJ5LnN5bWJvbCwgcHJvY2Vzc2VkU3VtbWFyeSk7XG4gICAgfVxuICAgIGlmICghdW5wcm9jZXNzZWRTdW1tYXJ5Lm1ldGFkYXRhICYmIHN1bW1hcnkubWV0YWRhdGEpIHtcbiAgICAgIGxldCBtZXRhZGF0YSA9IHN1bW1hcnkubWV0YWRhdGEgfHwge307XG4gICAgICBpZiAobWV0YWRhdGEuX19zeW1ib2xpYyA9PT0gJ2NsYXNzJykge1xuICAgICAgICAvLyBGb3IgY2xhc3Nlcywgd2Uga2VlcCBldmVyeXRoaW5nIGV4Y2VwdCB0aGVpciBjbGFzcyBkZWNvcmF0b3JzLlxuICAgICAgICAvLyBXZSBuZWVkIHRvIGtlZXAgZS5nLiB0aGUgY3RvciBhcmdzLCBtZXRob2QgbmFtZXMsIG1ldGhvZCBkZWNvcmF0b3JzXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGNsYXNzIGNhbiBiZSBleHRlbmRlZCBpbiBhbm90aGVyIGNvbXBpbGF0aW9uIHVuaXQuXG4gICAgICAgIC8vIFdlIGRvbid0IGtlZXAgdGhlIGNsYXNzIGRlY29yYXRvcnMgYXNcbiAgICAgICAgLy8gMSkgdGhleSByZWZlciB0byBkYXRhXG4gICAgICAgIC8vICAgdGhhdCBzaG91bGQgbm90IGNhdXNlIGEgcmVidWlsZCBvZiBkb3duc3RyZWFtIGNvbXBpbGF0aW9uIHVuaXRzXG4gICAgICAgIC8vICAgKGUuZy4gaW5saW5lIHRlbXBsYXRlcyBvZiBAQ29tcG9uZW50LCBvciBATmdNb2R1bGUuZGVjbGFyYXRpb25zKVxuICAgICAgICAvLyAyKSB0aGVpciBkYXRhIGlzIGFscmVhZHkgY2FwdHVyZWQgaW4gVHlwZVN1bW1hcmllcywgZS5nLiBEaXJlY3RpdmVTdW1tYXJ5LlxuICAgICAgICBjb25zdCBjbG9uZToge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXMobWV0YWRhdGEpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKHByb3BOYW1lICE9PSAnZGVjb3JhdG9ycycpIHtcbiAgICAgICAgICAgIGNsb25lW3Byb3BOYW1lXSA9IG1ldGFkYXRhW3Byb3BOYW1lXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBtZXRhZGF0YSA9IGNsb25lO1xuICAgICAgfSBlbHNlIGlmIChpc0NhbGwobWV0YWRhdGEpKSB7XG4gICAgICAgIGlmICghaXNGdW5jdGlvbkNhbGwobWV0YWRhdGEpICYmICFpc01ldGhvZENhbGxPblZhcmlhYmxlKG1ldGFkYXRhKSkge1xuICAgICAgICAgIC8vIERvbid0IHN0b3JlIGNvbXBsZXggY2FsbHMgYXMgd2Ugd29uJ3QgYmUgYWJsZSB0byBzaW1wbGlmeSB0aGVtIGFueXdheXMgbGF0ZXIgb24uXG4gICAgICAgICAgbWV0YWRhdGEgPSB7XG4gICAgICAgICAgICBfX3N5bWJvbGljOiAnZXJyb3InLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0NvbXBsZXggZnVuY3Rpb24gY2FsbHMgYXJlIG5vdCBzdXBwb3J0ZWQuJyxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBOb3RlOiBXZSBuZWVkIHRvIGtlZXAgc3RvcmluZyBjdG9yIGNhbGxzIGZvciBlLmcuXG4gICAgICAvLyBgZXhwb3J0IGNvbnN0IHggPSBuZXcgSW5qZWN0aW9uVG9rZW4oLi4uKWBcbiAgICAgIHVucHJvY2Vzc2VkU3VtbWFyeS5tZXRhZGF0YSA9IG1ldGFkYXRhO1xuICAgICAgcHJvY2Vzc2VkU3VtbWFyeS5tZXRhZGF0YSA9IHRoaXMucHJvY2Vzc1ZhbHVlKG1ldGFkYXRhLCBTZXJpYWxpemF0aW9uRmxhZ3MuUmVzb2x2ZVZhbHVlKTtcbiAgICAgIGlmIChtZXRhZGF0YSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCAmJlxuICAgICAgICAgIHRoaXMuc3VtbWFyeVJlc29sdmVyLmlzTGlicmFyeUZpbGUobWV0YWRhdGEuZmlsZVBhdGgpKSB7XG4gICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uU3ltYm9sID0gdGhpcy5zeW1ib2xzW3RoaXMuaW5kZXhCeVN5bWJvbC5nZXQobWV0YWRhdGEpICFdO1xuICAgICAgICBpZiAoIWlzTG93ZXJlZFN5bWJvbChkZWNsYXJhdGlvblN5bWJvbC5uYW1lKSkge1xuICAgICAgICAgIC8vIE5vdGU6IHN5bWJvbHMgdGhhdCB3ZXJlIGludHJvZHVjZWQgZHVyaW5nIGNvZGVnZW4gaW4gdGhlIHVzZXIgZmlsZSBjYW4gaGF2ZSBhIHJlZXhwb3J0XG4gICAgICAgICAgLy8gaWYgYSB1c2VyIHVzZWQgYGV4cG9ydCAqYC4gSG93ZXZlciwgd2UgY2FuJ3QgcmVseSBvbiB0aGlzIGFzIHRzaWNrbGUgd2lsbCBjaGFuZ2VcbiAgICAgICAgICAvLyBgZXhwb3J0ICpgIGludG8gbmFtZWQgZXhwb3J0cywgdXNpbmcgb25seSB0aGUgaW5mb3JtYXRpb24gZnJvbSB0aGUgdHlwZWNoZWNrZXIuXG4gICAgICAgICAgLy8gQXMgd2UgaW50cm9kdWNlIHRoZSBuZXcgc3ltYm9scyBhZnRlciB0eXBlY2hlY2ssIFRzaWNrbGUgZG9lcyBub3Qga25vdyBhYm91dCB0aGVtLFxuICAgICAgICAgIC8vIGFuZCBvbWl0cyB0aGVtIHdoZW4gZXhwYW5kaW5nIGBleHBvcnQgKmAuXG4gICAgICAgICAgLy8gU28gd2UgaGF2ZSB0byBrZWVwIHJlZXhwb3J0aW5nIHRoZXNlIHN5bWJvbHMgbWFudWFsbHkgdmlhIC5uZ2ZhY3RvcnkgZmlsZXMuXG4gICAgICAgICAgdGhpcy5yZWV4cG9ydGVkQnkuc2V0KGRlY2xhcmF0aW9uU3ltYm9sLCBzdW1tYXJ5LnN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCF1bnByb2Nlc3NlZFN1bW1hcnkudHlwZSAmJiBzdW1tYXJ5LnR5cGUpIHtcbiAgICAgIHVucHJvY2Vzc2VkU3VtbWFyeS50eXBlID0gc3VtbWFyeS50eXBlO1xuICAgICAgLy8gTm90ZTogV2UgZG9uJ3QgYWRkIHRoZSBzdW1tYXJpZXMgb2YgYWxsIHJlZmVyZW5jZWQgc3ltYm9scyBhcyBmb3IgdGhlIFJlc29sdmVkU3ltYm9scyxcbiAgICAgIC8vIGFzIHRoZSB0eXBlIHN1bW1hcmllcyBhbHJlYWR5IGNvbnRhaW4gdGhlIHRyYW5zaXRpdmUgZGF0YSB0aGF0IHRoZXkgcmVxdWlyZVxuICAgICAgLy8gKGluIGEgbWluaW1hbCB3YXkpLlxuICAgICAgcHJvY2Vzc2VkU3VtbWFyeS50eXBlID0gdGhpcy5wcm9jZXNzVmFsdWUoc3VtbWFyeS50eXBlLCBTZXJpYWxpemF0aW9uRmxhZ3MuTm9uZSk7XG4gICAgICAvLyBleGNlcHQgZm9yIHJlZXhwb3J0ZWQgZGlyZWN0aXZlcyAvIHBpcGVzLCBzbyB3ZSBuZWVkIHRvIHN0b3JlXG4gICAgICAvLyB0aGVpciBzdW1tYXJpZXMgZXhwbGljaXRseS5cbiAgICAgIGlmIChzdW1tYXJ5LnR5cGUuc3VtbWFyeUtpbmQgPT09IENvbXBpbGVTdW1tYXJ5S2luZC5OZ01vZHVsZSkge1xuICAgICAgICBjb25zdCBuZ01vZHVsZVN1bW1hcnkgPSA8Q29tcGlsZU5nTW9kdWxlU3VtbWFyeT5zdW1tYXJ5LnR5cGU7XG4gICAgICAgIG5nTW9kdWxlU3VtbWFyeS5leHBvcnRlZERpcmVjdGl2ZXMuY29uY2F0KG5nTW9kdWxlU3VtbWFyeS5leHBvcnRlZFBpcGVzKS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHN5bWJvbDogU3RhdGljU3ltYm9sID0gaWQucmVmZXJlbmNlO1xuICAgICAgICAgIGlmICh0aGlzLnN1bW1hcnlSZXNvbHZlci5pc0xpYnJhcnlGaWxlKHN5bWJvbC5maWxlUGF0aCkgJiZcbiAgICAgICAgICAgICAgIXRoaXMudW5wcm9jZXNzZWRTeW1ib2xTdW1tYXJpZXNCeVN5bWJvbC5oYXMoc3ltYm9sKSkge1xuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuc3VtbWFyeVJlc29sdmVyLnJlc29sdmVTdW1tYXJ5KHN5bWJvbCk7XG4gICAgICAgICAgICBpZiAoc3VtbWFyeSkge1xuICAgICAgICAgICAgICB0aGlzLmFkZFN1bW1hcnkoc3VtbWFyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXJpYWxpemUoKToge2pzb246IHN0cmluZywgZXhwb3J0QXM6IHtzeW1ib2w6IFN0YXRpY1N5bWJvbCwgZXhwb3J0QXM6IHN0cmluZ31bXX0ge1xuICAgIGNvbnN0IGV4cG9ydEFzOiB7c3ltYm9sOiBTdGF0aWNTeW1ib2wsIGV4cG9ydEFzOiBzdHJpbmd9W10gPSBbXTtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgbW9kdWxlTmFtZTogdGhpcy5tb2R1bGVOYW1lLFxuICAgICAgc3VtbWFyaWVzOiB0aGlzLnByb2Nlc3NlZFN1bW1hcmllcyxcbiAgICAgIHN5bWJvbHM6IHRoaXMuc3ltYm9scy5tYXAoKHN5bWJvbCwgaW5kZXgpID0+IHtcbiAgICAgICAgc3ltYm9sLmFzc2VydE5vTWVtYmVycygpO1xuICAgICAgICBsZXQgaW1wb3J0QXM6IHN0cmluZ3xudW1iZXIgPSB1bmRlZmluZWQgITtcbiAgICAgICAgaWYgKHRoaXMuc3VtbWFyeVJlc29sdmVyLmlzTGlicmFyeUZpbGUoc3ltYm9sLmZpbGVQYXRoKSkge1xuICAgICAgICAgIGNvbnN0IHJlZXhwb3J0U3ltYm9sID0gdGhpcy5yZWV4cG9ydGVkQnkuZ2V0KHN5bWJvbCk7XG4gICAgICAgICAgaWYgKHJlZXhwb3J0U3ltYm9sKSB7XG4gICAgICAgICAgICBpbXBvcnRBcyA9IHRoaXMuaW5kZXhCeVN5bWJvbC5nZXQocmVleHBvcnRTeW1ib2wpICE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLnVucHJvY2Vzc2VkU3ltYm9sU3VtbWFyaWVzQnlTeW1ib2wuZ2V0KHN5bWJvbCk7XG4gICAgICAgICAgICBpZiAoIXN1bW1hcnkgfHwgIXN1bW1hcnkubWV0YWRhdGEgfHwgc3VtbWFyeS5tZXRhZGF0YS5fX3N5bWJvbGljICE9PSAnaW50ZXJmYWNlJykge1xuICAgICAgICAgICAgICBpbXBvcnRBcyA9IGAke3N5bWJvbC5uYW1lfV8ke2luZGV4fWA7XG4gICAgICAgICAgICAgIGV4cG9ydEFzLnB1c2goe3N5bWJvbCwgZXhwb3J0QXM6IGltcG9ydEFzfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgX19zeW1ib2w6IGluZGV4LFxuICAgICAgICAgIG5hbWU6IHN5bWJvbC5uYW1lLFxuICAgICAgICAgIGZpbGVQYXRoOiB0aGlzLnN1bW1hcnlSZXNvbHZlci50b1N1bW1hcnlGaWxlTmFtZShzeW1ib2wuZmlsZVBhdGgsIHRoaXMuc3JjRmlsZU5hbWUpLFxuICAgICAgICAgIGltcG9ydEFzOiBpbXBvcnRBc1xuICAgICAgICB9O1xuICAgICAgfSlcbiAgICB9KTtcbiAgICByZXR1cm4ge2pzb24sIGV4cG9ydEFzfTtcbiAgfVxuXG4gIHByaXZhdGUgcHJvY2Vzc1ZhbHVlKHZhbHVlOiBhbnksIGZsYWdzOiBTZXJpYWxpemF0aW9uRmxhZ3MpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdFZhbHVlKHZhbHVlLCB0aGlzLCBmbGFncyk7XG4gIH1cblxuICB2aXNpdE90aGVyKHZhbHVlOiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICBsZXQgYmFzZVN5bWJvbCA9IHRoaXMuc3ltYm9sUmVzb2x2ZXIuZ2V0U3RhdGljU3ltYm9sKHZhbHVlLmZpbGVQYXRoLCB2YWx1ZS5uYW1lKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy52aXNpdFN0YXRpY1N5bWJvbChiYXNlU3ltYm9sLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiB7X19zeW1ib2w6IGluZGV4LCBtZW1iZXJzOiB2YWx1ZS5tZW1iZXJzfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RyaXAgbGluZSBhbmQgY2hhcmFjdGVyIG51bWJlcnMgZnJvbSBuZ3N1bW1hcmllcy5cbiAgICogRW1pdHRpbmcgdGhlbSBjYXVzZXMgd2hpdGUgc3BhY2VzIGNoYW5nZXMgdG8gcmV0cmlnZ2VyIHVwc3RyZWFtXG4gICAqIHJlY29tcGlsYXRpb25zIGluIGJhemVsLlxuICAgKiBUT0RPOiBmaW5kIG91dCBhIHdheSB0byBoYXZlIGxpbmUgYW5kIGNoYXJhY3RlciBudW1iZXJzIGluIGVycm9ycyB3aXRob3V0XG4gICAqIGV4Y2Vzc2l2ZSByZWNvbXBpbGF0aW9uIGluIGJhemVsLlxuICAgKi9cbiAgdmlzaXRTdHJpbmdNYXAobWFwOiB7W2tleTogc3RyaW5nXTogYW55fSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBpZiAobWFwWydfX3N5bWJvbGljJ10gPT09ICdyZXNvbHZlZCcpIHtcbiAgICAgIHJldHVybiB2aXNpdFZhbHVlKG1hcC5zeW1ib2wsIHRoaXMsIGNvbnRleHQpO1xuICAgIH1cbiAgICBpZiAobWFwWydfX3N5bWJvbGljJ10gPT09ICdlcnJvcicpIHtcbiAgICAgIGRlbGV0ZSBtYXBbJ2xpbmUnXTtcbiAgICAgIGRlbGV0ZSBtYXBbJ2NoYXJhY3RlciddO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIudmlzaXRTdHJpbmdNYXAobWFwLCBjb250ZXh0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG51bGwgaWYgdGhlIG9wdGlvbnMucmVzb2x2ZVZhbHVlIGlzIHRydWUsIGFuZCB0aGUgc3VtbWFyeSBmb3IgdGhlIHN5bWJvbFxuICAgKiByZXNvbHZlZCB0byBhIHR5cGUgb3IgY291bGQgbm90IGJlIHJlc29sdmVkLlxuICAgKi9cbiAgcHJpdmF0ZSB2aXNpdFN0YXRpY1N5bWJvbChiYXNlU3ltYm9sOiBTdGF0aWNTeW1ib2wsIGZsYWdzOiBTZXJpYWxpemF0aW9uRmxhZ3MpOiBudW1iZXIge1xuICAgIGxldCBpbmRleDogbnVtYmVyfHVuZGVmaW5lZHxudWxsID0gdGhpcy5pbmRleEJ5U3ltYm9sLmdldChiYXNlU3ltYm9sKTtcbiAgICBsZXQgc3VtbWFyeTogU3VtbWFyeTxTdGF0aWNTeW1ib2w+fG51bGwgPSBudWxsO1xuICAgIGlmIChmbGFncyAmIFNlcmlhbGl6YXRpb25GbGFncy5SZXNvbHZlVmFsdWUgJiZcbiAgICAgICAgdGhpcy5zdW1tYXJ5UmVzb2x2ZXIuaXNMaWJyYXJ5RmlsZShiYXNlU3ltYm9sLmZpbGVQYXRoKSkge1xuICAgICAgaWYgKHRoaXMudW5wcm9jZXNzZWRTeW1ib2xTdW1tYXJpZXNCeVN5bWJvbC5oYXMoYmFzZVN5bWJvbCkpIHtcbiAgICAgICAgLy8gdGhlIHN1bW1hcnkgZm9yIHRoaXMgc3ltYm9sIHdhcyBhbHJlYWR5IGFkZGVkXG4gICAgICAgIC8vIC0+IG5vdGhpbmcgdG8gZG8uXG4gICAgICAgIHJldHVybiBpbmRleCAhO1xuICAgICAgfVxuICAgICAgc3VtbWFyeSA9IHRoaXMubG9hZFN1bW1hcnkoYmFzZVN5bWJvbCk7XG4gICAgICBpZiAoc3VtbWFyeSAmJiBzdW1tYXJ5Lm1ldGFkYXRhIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICAgIC8vIFRoZSBzdW1tYXJ5IGlzIGEgcmVleHBvcnRcbiAgICAgICAgaW5kZXggPSB0aGlzLnZpc2l0U3RhdGljU3ltYm9sKHN1bW1hcnkubWV0YWRhdGEsIGZsYWdzKTtcbiAgICAgICAgLy8gcmVzZXQgdGhlIHN1bW1hcnkgYXMgaXQgaXMganVzdCBhIHJlZXhwb3J0LCBzbyB3ZSBkb24ndCB3YW50IHRvIHN0b3JlIGl0LlxuICAgICAgICBzdW1tYXJ5ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGluZGV4ICE9IG51bGwpIHtcbiAgICAgIC8vIE5vdGU6ID09IG9uIHB1cnBvc2UgdG8gY29tcGFyZSB3aXRoIHVuZGVmaW5lZCFcbiAgICAgIC8vIE5vIHN1bW1hcnkgYW5kIHRoZSBzeW1ib2wgaXMgYWxyZWFkeSBhZGRlZCAtPiBub3RoaW5nIHRvIGRvLlxuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbiAgICAvLyBOb3RlOiA9PSBvbiBwdXJwb3NlIHRvIGNvbXBhcmUgd2l0aCB1bmRlZmluZWQhXG4gICAgaWYgKGluZGV4ID09IG51bGwpIHtcbiAgICAgIGluZGV4ID0gdGhpcy5zeW1ib2xzLmxlbmd0aDtcbiAgICAgIHRoaXMuc3ltYm9scy5wdXNoKGJhc2VTeW1ib2wpO1xuICAgIH1cbiAgICB0aGlzLmluZGV4QnlTeW1ib2wuc2V0KGJhc2VTeW1ib2wsIGluZGV4KTtcbiAgICBpZiAoc3VtbWFyeSkge1xuICAgICAgdGhpcy5hZGRTdW1tYXJ5KHN1bW1hcnkpO1xuICAgIH1cbiAgICByZXR1cm4gaW5kZXg7XG4gIH1cblxuICBwcml2YXRlIGxvYWRTdW1tYXJ5KHN5bWJvbDogU3RhdGljU3ltYm9sKTogU3VtbWFyeTxTdGF0aWNTeW1ib2w+fG51bGwge1xuICAgIGxldCBzdW1tYXJ5ID0gdGhpcy5zdW1tYXJ5UmVzb2x2ZXIucmVzb2x2ZVN1bW1hcnkoc3ltYm9sKTtcbiAgICBpZiAoIXN1bW1hcnkpIHtcbiAgICAgIC8vIHNvbWUgc3ltYm9scyBtaWdodCBvcmlnaW5hdGUgZnJvbSBhIHBsYWluIHR5cGVzY3JpcHQgbGlicmFyeVxuICAgICAgLy8gdGhhdCBqdXN0IGV4cG9ydGVkIC5kLnRzIGFuZCAubWV0YWRhdGEuanNvbiBmaWxlcywgaS5lLiB3aGVyZSBubyBzdW1tYXJ5XG4gICAgICAvLyBmaWxlcyB3ZXJlIGNyZWF0ZWQuXG4gICAgICBjb25zdCByZXNvbHZlZFN5bWJvbCA9IHRoaXMuc3ltYm9sUmVzb2x2ZXIucmVzb2x2ZVN5bWJvbChzeW1ib2wpO1xuICAgICAgaWYgKHJlc29sdmVkU3ltYm9sKSB7XG4gICAgICAgIHN1bW1hcnkgPSB7c3ltYm9sOiByZXNvbHZlZFN5bWJvbC5zeW1ib2wsIG1ldGFkYXRhOiByZXNvbHZlZFN5bWJvbC5tZXRhZGF0YX07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdW1tYXJ5O1xuICB9XG59XG5cbmNsYXNzIEZvckppdFNlcmlhbGl6ZXIge1xuICBwcml2YXRlIGRhdGE6IEFycmF5PHtcbiAgICBzdW1tYXJ5OiBDb21waWxlVHlwZVN1bW1hcnksXG4gICAgbWV0YWRhdGE6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhfENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YXxDb21waWxlUGlwZU1ldGFkYXRhfFxuICAgIENvbXBpbGVUeXBlTWV0YWRhdGF8bnVsbCxcbiAgICBpc0xpYnJhcnk6IGJvb2xlYW5cbiAgfT4gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBwcml2YXRlIHN5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcixcbiAgICAgIHByaXZhdGUgc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8U3RhdGljU3ltYm9sPikge31cblxuICBhZGRTb3VyY2VUeXBlKFxuICAgICAgc3VtbWFyeTogQ29tcGlsZVR5cGVTdW1tYXJ5LCBtZXRhZGF0YTogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGF8Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhfFxuICAgICAgQ29tcGlsZVBpcGVNZXRhZGF0YXxDb21waWxlVHlwZU1ldGFkYXRhKSB7XG4gICAgdGhpcy5kYXRhLnB1c2goe3N1bW1hcnksIG1ldGFkYXRhLCBpc0xpYnJhcnk6IGZhbHNlfSk7XG4gIH1cblxuICBhZGRMaWJUeXBlKHN1bW1hcnk6IENvbXBpbGVUeXBlU3VtbWFyeSkge1xuICAgIHRoaXMuZGF0YS5wdXNoKHtzdW1tYXJ5LCBtZXRhZGF0YTogbnVsbCwgaXNMaWJyYXJ5OiB0cnVlfSk7XG4gIH1cblxuICBzZXJpYWxpemUoZXhwb3J0QXNBcnI6IHtzeW1ib2w6IFN0YXRpY1N5bWJvbCwgZXhwb3J0QXM6IHN0cmluZ31bXSk6IHZvaWQge1xuICAgIGNvbnN0IGV4cG9ydEFzQnlTeW1ib2wgPSBuZXcgTWFwPFN0YXRpY1N5bWJvbCwgc3RyaW5nPigpO1xuICAgIGZvciAoY29uc3Qge3N5bWJvbCwgZXhwb3J0QXN9IG9mIGV4cG9ydEFzQXJyKSB7XG4gICAgICBleHBvcnRBc0J5U3ltYm9sLnNldChzeW1ib2wsIGV4cG9ydEFzKTtcbiAgICB9XG4gICAgY29uc3QgbmdNb2R1bGVTeW1ib2xzID0gbmV3IFNldDxTdGF0aWNTeW1ib2w+KCk7XG5cbiAgICBmb3IgKGNvbnN0IHtzdW1tYXJ5LCBtZXRhZGF0YSwgaXNMaWJyYXJ5fSBvZiB0aGlzLmRhdGEpIHtcbiAgICAgIGlmIChzdW1tYXJ5LnN1bW1hcnlLaW5kID09PSBDb21waWxlU3VtbWFyeUtpbmQuTmdNb2R1bGUpIHtcbiAgICAgICAgLy8gY29sbGVjdCB0aGUgc3ltYm9scyB0aGF0IHJlZmVyIHRvIE5nTW9kdWxlIGNsYXNzZXMuXG4gICAgICAgIC8vIE5vdGU6IHdlIGNhbid0IGp1c3QgcmVseSBvbiBgc3VtbWFyeS50eXBlLnN1bW1hcnlLaW5kYCB0byBkZXRlcm1pbmUgdGhpcyBhc1xuICAgICAgICAvLyB3ZSBkb24ndCBhZGQgdGhlIHN1bW1hcmllcyBvZiBhbGwgcmVmZXJlbmNlZCBzeW1ib2xzIHdoZW4gd2Ugc2VyaWFsaXplIHR5cGUgc3VtbWFyaWVzLlxuICAgICAgICAvLyBTZWUgc2VyaWFsaXplU3VtbWFyaWVzIGZvciBkZXRhaWxzLlxuICAgICAgICBuZ01vZHVsZVN5bWJvbHMuYWRkKHN1bW1hcnkudHlwZS5yZWZlcmVuY2UpO1xuICAgICAgICBjb25zdCBtb2RTdW1tYXJ5ID0gPENvbXBpbGVOZ01vZHVsZVN1bW1hcnk+c3VtbWFyeTtcbiAgICAgICAgZm9yIChjb25zdCBtb2Qgb2YgbW9kU3VtbWFyeS5tb2R1bGVzKSB7XG4gICAgICAgICAgbmdNb2R1bGVTeW1ib2xzLmFkZChtb2QucmVmZXJlbmNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFpc0xpYnJhcnkpIHtcbiAgICAgICAgY29uc3QgZm5OYW1lID0gc3VtbWFyeUZvckppdE5hbWUoc3VtbWFyeS50eXBlLnJlZmVyZW5jZS5uYW1lKTtcbiAgICAgICAgY3JlYXRlU3VtbWFyeUZvckppdEZ1bmN0aW9uKFxuICAgICAgICAgICAgdGhpcy5vdXRwdXRDdHgsIHN1bW1hcnkudHlwZS5yZWZlcmVuY2UsXG4gICAgICAgICAgICB0aGlzLnNlcmlhbGl6ZVN1bW1hcnlXaXRoRGVwcyhzdW1tYXJ5LCBtZXRhZGF0YSAhKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbmdNb2R1bGVTeW1ib2xzLmZvckVhY2goKG5nTW9kdWxlU3ltYm9sKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdW1tYXJ5UmVzb2x2ZXIuaXNMaWJyYXJ5RmlsZShuZ01vZHVsZVN5bWJvbC5maWxlUGF0aCkpIHtcbiAgICAgICAgbGV0IGV4cG9ydEFzID0gZXhwb3J0QXNCeVN5bWJvbC5nZXQobmdNb2R1bGVTeW1ib2wpIHx8IG5nTW9kdWxlU3ltYm9sLm5hbWU7XG4gICAgICAgIGNvbnN0IGppdEV4cG9ydEFzTmFtZSA9IHN1bW1hcnlGb3JKaXROYW1lKGV4cG9ydEFzKTtcbiAgICAgICAgdGhpcy5vdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKG8udmFyaWFibGUoaml0RXhwb3J0QXNOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZXQodGhpcy5zZXJpYWxpemVTdW1tYXJ5UmVmKG5nTW9kdWxlU3ltYm9sKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChudWxsLCBbby5TdG10TW9kaWZpZXIuRXhwb3J0ZWRdKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHNlcmlhbGl6ZVN1bW1hcnlXaXRoRGVwcyhcbiAgICAgIHN1bW1hcnk6IENvbXBpbGVUeXBlU3VtbWFyeSwgbWV0YWRhdGE6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhfENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YXxcbiAgICAgIENvbXBpbGVQaXBlTWV0YWRhdGF8Q29tcGlsZVR5cGVNZXRhZGF0YSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZXhwcmVzc2lvbnM6IG8uRXhwcmVzc2lvbltdID0gW3RoaXMuc2VyaWFsaXplU3VtbWFyeShzdW1tYXJ5KV07XG4gICAgbGV0IHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSA9IFtdO1xuICAgIGlmIChtZXRhZGF0YSBpbnN0YW5jZW9mIENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKSB7XG4gICAgICBleHByZXNzaW9ucy5wdXNoKC4uLlxuICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgZGlyZWN0aXZlcyAvIHBpcGVzLCB3ZSBvbmx5IGFkZCB0aGUgZGVjbGFyZWQgb25lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgLy8gYW5kIHJlbHkgb24gdHJhbnNpdGl2ZWx5IGltcG9ydGluZyBOZ01vZHVsZXMgdG8gZ2V0IHRoZSB0cmFuc2l0aXZlXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIHN1bW1hcmllcy5cbiAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGEuZGVjbGFyZWREaXJlY3RpdmVzLmNvbmNhdChtZXRhZGF0YS5kZWNsYXJlZFBpcGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCh0eXBlID0+IHR5cGUucmVmZXJlbmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIG1vZHVsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBhbHNvIGFkZCB0aGUgc3VtbWFyaWVzIGZvciBtb2R1bGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmcm9tIGxpYnJhcmllcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgb2sgYXMgd2UgcHJvZHVjZSByZWV4cG9ydHMgZm9yIGFsbCB0cmFuc2l0aXZlIG1vZHVsZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAuY29uY2F0KG1ldGFkYXRhLnRyYW5zaXRpdmVNb2R1bGUubW9kdWxlcy5tYXAodHlwZSA9PiB0eXBlLnJlZmVyZW5jZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIocmVmID0+IHJlZiAhPT0gbWV0YWRhdGEudHlwZS5yZWZlcmVuY2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgocmVmKSA9PiB0aGlzLnNlcmlhbGl6ZVN1bW1hcnlSZWYocmVmKSkpO1xuICAgICAgLy8gTm90ZTogV2UgZG9uJ3QgdXNlIGBOZ01vZHVsZVN1bW1hcnkucHJvdmlkZXJzYCwgYXMgdGhhdCBvbmUgaXMgdHJhbnNpdGl2ZSxcbiAgICAgIC8vIGFuZCB3ZSBhbHJlYWR5IGhhdmUgdHJhbnNpdGl2ZSBtb2R1bGVzLlxuICAgICAgcHJvdmlkZXJzID0gbWV0YWRhdGEucHJvdmlkZXJzO1xuICAgIH0gZWxzZSBpZiAoc3VtbWFyeS5zdW1tYXJ5S2luZCA9PT0gQ29tcGlsZVN1bW1hcnlLaW5kLkRpcmVjdGl2ZSkge1xuICAgICAgY29uc3QgZGlyU3VtbWFyeSA9IDxDb21waWxlRGlyZWN0aXZlU3VtbWFyeT5zdW1tYXJ5O1xuICAgICAgcHJvdmlkZXJzID0gZGlyU3VtbWFyeS5wcm92aWRlcnMuY29uY2F0KGRpclN1bW1hcnkudmlld1Byb3ZpZGVycyk7XG4gICAgfVxuICAgIC8vIE5vdGU6IFdlIGNhbid0IGp1c3QgcmVmZXIgdG8gdGhlIGBuZ3N1bW1hcnkudHNgIGZpbGVzIGZvciBgdXNlQ2xhc3NgIHByb3ZpZGVycyAoYXMgd2UgZG8gZm9yXG4gICAgLy8gZGVjbGFyZWREaXJlY3RpdmVzIC8gZGVjbGFyZWRQaXBlcyksIGFzIHdlIGFsbG93XG4gICAgLy8gcHJvdmlkZXJzIHdpdGhvdXQgY3RvciBhcmd1bWVudHMgdG8gc2tpcCB0aGUgYEBJbmplY3RhYmxlYCBkZWNvcmF0b3IsXG4gICAgLy8gaS5lLiB3ZSBkaWRuJ3QgZ2VuZXJhdGUgLm5nc3VtbWFyeS50cyBmaWxlcyBmb3IgdGhlc2UuXG4gICAgZXhwcmVzc2lvbnMucHVzaChcbiAgICAgICAgLi4ucHJvdmlkZXJzLmZpbHRlcihwcm92aWRlciA9PiAhIXByb3ZpZGVyLnVzZUNsYXNzKS5tYXAocHJvdmlkZXIgPT4gdGhpcy5zZXJpYWxpemVTdW1tYXJ5KHtcbiAgICAgICAgICBzdW1tYXJ5S2luZDogQ29tcGlsZVN1bW1hcnlLaW5kLkluamVjdGFibGUsIHR5cGU6IHByb3ZpZGVyLnVzZUNsYXNzXG4gICAgICAgIH0gYXMgQ29tcGlsZVR5cGVTdW1tYXJ5KSkpO1xuICAgIHJldHVybiBvLmxpdGVyYWxBcnIoZXhwcmVzc2lvbnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXJpYWxpemVTdW1tYXJ5UmVmKHR5cGVTeW1ib2w6IFN0YXRpY1N5bWJvbCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3Qgaml0SW1wb3J0ZWRTeW1ib2wgPSB0aGlzLnN5bWJvbFJlc29sdmVyLmdldFN0YXRpY1N5bWJvbChcbiAgICAgICAgc3VtbWFyeUZvckppdEZpbGVOYW1lKHR5cGVTeW1ib2wuZmlsZVBhdGgpLCBzdW1tYXJ5Rm9ySml0TmFtZSh0eXBlU3ltYm9sLm5hbWUpKTtcbiAgICByZXR1cm4gdGhpcy5vdXRwdXRDdHguaW1wb3J0RXhwcihqaXRJbXBvcnRlZFN5bWJvbCk7XG4gIH1cblxuICBwcml2YXRlIHNlcmlhbGl6ZVN1bW1hcnkoZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IG91dHB1dEN0eCA9IHRoaXMub3V0cHV0Q3R4O1xuXG4gICAgY2xhc3MgVHJhbnNmb3JtZXIgaW1wbGVtZW50cyBWYWx1ZVZpc2l0b3Ige1xuICAgICAgdmlzaXRBcnJheShhcnI6IGFueVtdLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgICByZXR1cm4gby5saXRlcmFsQXJyKGFyci5tYXAoZW50cnkgPT4gdmlzaXRWYWx1ZShlbnRyeSwgdGhpcywgY29udGV4dCkpKTtcbiAgICAgIH1cbiAgICAgIHZpc2l0U3RyaW5nTWFwKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiBuZXcgby5MaXRlcmFsTWFwRXhwcihPYmplY3Qua2V5cyhtYXApLm1hcChcbiAgICAgICAgICAgIChrZXkpID0+IG5ldyBvLkxpdGVyYWxNYXBFbnRyeShrZXksIHZpc2l0VmFsdWUobWFwW2tleV0sIHRoaXMsIGNvbnRleHQpLCBmYWxzZSkpKTtcbiAgICAgIH1cbiAgICAgIHZpc2l0UHJpbWl0aXZlKHZhbHVlOiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBvLmxpdGVyYWwodmFsdWUpOyB9XG4gICAgICB2aXNpdE90aGVyKHZhbHVlOiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgICAgIHJldHVybiBvdXRwdXRDdHguaW1wb3J0RXhwcih2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbGxlZ2FsIFN0YXRlOiBFbmNvdW50ZXJlZCB2YWx1ZSAke3ZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZpc2l0VmFsdWUoZGF0YSwgbmV3IFRyYW5zZm9ybWVyKCksIG51bGwpO1xuICB9XG59XG5cbmNsYXNzIEZyb21Kc29uRGVzZXJpYWxpemVyIGV4dGVuZHMgVmFsdWVUcmFuc2Zvcm1lciB7XG4gIHByaXZhdGUgc3ltYm9sczogU3RhdGljU3ltYm9sW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHN5bWJvbENhY2hlOiBTdGF0aWNTeW1ib2xDYWNoZSxcbiAgICAgIHByaXZhdGUgc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8U3RhdGljU3ltYm9sPikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBkZXNlcmlhbGl6ZShsaWJyYXJ5RmlsZU5hbWU6IHN0cmluZywganNvbjogc3RyaW5nKToge1xuICAgIG1vZHVsZU5hbWU6IHN0cmluZyB8IG51bGwsXG4gICAgc3VtbWFyaWVzOiBTdW1tYXJ5PFN0YXRpY1N5bWJvbD5bXSxcbiAgICBpbXBvcnRBczoge3N5bWJvbDogU3RhdGljU3ltYm9sLCBpbXBvcnRBczogU3RhdGljU3ltYm9sfVtdXG4gIH0ge1xuICAgIGNvbnN0IGRhdGE6IHttb2R1bGVOYW1lOiBzdHJpbmcgfCBudWxsLCBzdW1tYXJpZXM6IGFueVtdLCBzeW1ib2xzOiBhbnlbXX0gPSBKU09OLnBhcnNlKGpzb24pO1xuICAgIGNvbnN0IGFsbEltcG9ydEFzOiB7c3ltYm9sOiBTdGF0aWNTeW1ib2wsIGltcG9ydEFzOiBTdGF0aWNTeW1ib2x9W10gPSBbXTtcbiAgICB0aGlzLnN5bWJvbHMgPSBkYXRhLnN5bWJvbHMubWFwKFxuICAgICAgICAoc2VyaWFsaXplZFN5bWJvbCkgPT4gdGhpcy5zeW1ib2xDYWNoZS5nZXQoXG4gICAgICAgICAgICB0aGlzLnN1bW1hcnlSZXNvbHZlci5mcm9tU3VtbWFyeUZpbGVOYW1lKHNlcmlhbGl6ZWRTeW1ib2wuZmlsZVBhdGgsIGxpYnJhcnlGaWxlTmFtZSksXG4gICAgICAgICAgICBzZXJpYWxpemVkU3ltYm9sLm5hbWUpKTtcbiAgICBkYXRhLnN5bWJvbHMuZm9yRWFjaCgoc2VyaWFsaXplZFN5bWJvbCwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuc3ltYm9sc1tpbmRleF07XG4gICAgICBjb25zdCBpbXBvcnRBcyA9IHNlcmlhbGl6ZWRTeW1ib2wuaW1wb3J0QXM7XG4gICAgICBpZiAodHlwZW9mIGltcG9ydEFzID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbGxJbXBvcnRBcy5wdXNoKHtzeW1ib2wsIGltcG9ydEFzOiB0aGlzLnN5bWJvbHNbaW1wb3J0QXNdfSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbXBvcnRBcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgYWxsSW1wb3J0QXMucHVzaChcbiAgICAgICAgICAgIHtzeW1ib2wsIGltcG9ydEFzOiB0aGlzLnN5bWJvbENhY2hlLmdldChuZ2ZhY3RvcnlGaWxlUGF0aChsaWJyYXJ5RmlsZU5hbWUpLCBpbXBvcnRBcyl9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBzdW1tYXJpZXMgPSB2aXNpdFZhbHVlKGRhdGEuc3VtbWFyaWVzLCB0aGlzLCBudWxsKSBhcyBTdW1tYXJ5PFN0YXRpY1N5bWJvbD5bXTtcbiAgICByZXR1cm4ge21vZHVsZU5hbWU6IGRhdGEubW9kdWxlTmFtZSwgc3VtbWFyaWVzLCBpbXBvcnRBczogYWxsSW1wb3J0QXN9O1xuICB9XG5cbiAgdmlzaXRTdHJpbmdNYXAobWFwOiB7W2tleTogc3RyaW5nXTogYW55fSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBpZiAoJ19fc3ltYm9sJyBpbiBtYXApIHtcbiAgICAgIGNvbnN0IGJhc2VTeW1ib2wgPSB0aGlzLnN5bWJvbHNbbWFwWydfX3N5bWJvbCddXTtcbiAgICAgIGNvbnN0IG1lbWJlcnMgPSBtYXBbJ21lbWJlcnMnXTtcbiAgICAgIHJldHVybiBtZW1iZXJzLmxlbmd0aCA/IHRoaXMuc3ltYm9sQ2FjaGUuZ2V0KGJhc2VTeW1ib2wuZmlsZVBhdGgsIGJhc2VTeW1ib2wubmFtZSwgbWVtYmVycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVN5bWJvbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLnZpc2l0U3RyaW5nTWFwKG1hcCwgY29udGV4dCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ2FsbChtZXRhZGF0YTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBtZXRhZGF0YSAmJiBtZXRhZGF0YS5fX3N5bWJvbGljID09PSAnY2FsbCc7XG59XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb25DYWxsKG1ldGFkYXRhOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQ2FsbChtZXRhZGF0YSkgJiYgdW53cmFwUmVzb2x2ZWRNZXRhZGF0YShtZXRhZGF0YS5leHByZXNzaW9uKSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbDtcbn1cblxuZnVuY3Rpb24gaXNNZXRob2RDYWxsT25WYXJpYWJsZShtZXRhZGF0YTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0NhbGwobWV0YWRhdGEpICYmIG1ldGFkYXRhLmV4cHJlc3Npb24gJiYgbWV0YWRhdGEuZXhwcmVzc2lvbi5fX3N5bWJvbGljID09PSAnc2VsZWN0JyAmJlxuICAgICAgdW53cmFwUmVzb2x2ZWRNZXRhZGF0YShtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24pIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sO1xufVxuIl19