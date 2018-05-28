/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/metadata_resolver", ["require", "exports", "tslib", "@angular/compiler/src/aot/static_symbol", "@angular/compiler/src/aot/util", "@angular/compiler/src/assertions", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/core", "@angular/compiler/src/directive_resolver", "@angular/compiler/src/identifiers", "@angular/compiler/src/lifecycle_reflector", "@angular/compiler/src/selector", "@angular/compiler/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var static_symbol_1 = require("@angular/compiler/src/aot/static_symbol");
    var util_1 = require("@angular/compiler/src/aot/util");
    var assertions_1 = require("@angular/compiler/src/assertions");
    var cpl = require("@angular/compiler/src/compile_metadata");
    var core_1 = require("@angular/compiler/src/core");
    var directive_resolver_1 = require("@angular/compiler/src/directive_resolver");
    var identifiers_1 = require("@angular/compiler/src/identifiers");
    var lifecycle_reflector_1 = require("@angular/compiler/src/lifecycle_reflector");
    var selector_1 = require("@angular/compiler/src/selector");
    var util_2 = require("@angular/compiler/src/util");
    exports.ERROR_COMPONENT_TYPE = 'ngComponentType';
    // Design notes:
    // - don't lazily create metadata:
    //   For some metadata, we need to do async work sometimes,
    //   so the user has to kick off this loading.
    //   But we want to report errors even when the async work is
    //   not required to check that the user would have been able
    //   to wait correctly.
    var CompileMetadataResolver = /** @class */ (function () {
        function CompileMetadataResolver(_config, _htmlParser, _ngModuleResolver, _directiveResolver, _pipeResolver, _summaryResolver, _schemaRegistry, _directiveNormalizer, _console, _staticSymbolCache, _reflector, _errorCollector) {
            this._config = _config;
            this._htmlParser = _htmlParser;
            this._ngModuleResolver = _ngModuleResolver;
            this._directiveResolver = _directiveResolver;
            this._pipeResolver = _pipeResolver;
            this._summaryResolver = _summaryResolver;
            this._schemaRegistry = _schemaRegistry;
            this._directiveNormalizer = _directiveNormalizer;
            this._console = _console;
            this._staticSymbolCache = _staticSymbolCache;
            this._reflector = _reflector;
            this._errorCollector = _errorCollector;
            this._nonNormalizedDirectiveCache = new Map();
            this._directiveCache = new Map();
            this._summaryCache = new Map();
            this._pipeCache = new Map();
            this._ngModuleCache = new Map();
            this._ngModuleOfTypes = new Map();
            this._shallowModuleCache = new Map();
        }
        CompileMetadataResolver.prototype.getReflector = function () { return this._reflector; };
        CompileMetadataResolver.prototype.clearCacheFor = function (type) {
            var dirMeta = this._directiveCache.get(type);
            this._directiveCache.delete(type);
            this._nonNormalizedDirectiveCache.delete(type);
            this._summaryCache.delete(type);
            this._pipeCache.delete(type);
            this._ngModuleOfTypes.delete(type);
            // Clear all of the NgModule as they contain transitive information!
            this._ngModuleCache.clear();
            if (dirMeta) {
                this._directiveNormalizer.clearCacheFor(dirMeta);
            }
        };
        CompileMetadataResolver.prototype.clearCache = function () {
            this._directiveCache.clear();
            this._nonNormalizedDirectiveCache.clear();
            this._summaryCache.clear();
            this._pipeCache.clear();
            this._ngModuleCache.clear();
            this._ngModuleOfTypes.clear();
            this._directiveNormalizer.clearCache();
        };
        CompileMetadataResolver.prototype._createProxyClass = function (baseType, name) {
            var delegate = null;
            var proxyClass = function () {
                if (!delegate) {
                    throw new Error("Illegal state: Class " + name + " for type " + util_2.stringify(baseType) + " is not compiled yet!");
                }
                return delegate.apply(this, arguments);
            };
            proxyClass.setDelegate = function (d) {
                delegate = d;
                proxyClass.prototype = d.prototype;
            };
            // Make stringify work correctly
            proxyClass.overriddenName = name;
            return proxyClass;
        };
        CompileMetadataResolver.prototype.getGeneratedClass = function (dirType, name) {
            if (dirType instanceof static_symbol_1.StaticSymbol) {
                return this._staticSymbolCache.get(util_1.ngfactoryFilePath(dirType.filePath), name);
            }
            else {
                return this._createProxyClass(dirType, name);
            }
        };
        CompileMetadataResolver.prototype.getComponentViewClass = function (dirType) {
            return this.getGeneratedClass(dirType, cpl.viewClassName(dirType, 0));
        };
        CompileMetadataResolver.prototype.getHostComponentViewClass = function (dirType) {
            return this.getGeneratedClass(dirType, cpl.hostViewClassName(dirType));
        };
        CompileMetadataResolver.prototype.getHostComponentType = function (dirType) {
            var name = cpl.identifierName({ reference: dirType }) + "_Host";
            if (dirType instanceof static_symbol_1.StaticSymbol) {
                return this._staticSymbolCache.get(dirType.filePath, name);
            }
            else {
                var HostClass = function HostClass() { };
                HostClass.overriddenName = name;
                return HostClass;
            }
        };
        CompileMetadataResolver.prototype.getRendererType = function (dirType) {
            if (dirType instanceof static_symbol_1.StaticSymbol) {
                return this._staticSymbolCache.get(util_1.ngfactoryFilePath(dirType.filePath), cpl.rendererTypeName(dirType));
            }
            else {
                // returning an object as proxy,
                // that we fill later during runtime compilation.
                return {};
            }
        };
        CompileMetadataResolver.prototype.getComponentFactory = function (selector, dirType, inputs, outputs) {
            if (dirType instanceof static_symbol_1.StaticSymbol) {
                return this._staticSymbolCache.get(util_1.ngfactoryFilePath(dirType.filePath), cpl.componentFactoryName(dirType));
            }
            else {
                var hostView = this.getHostComponentViewClass(dirType);
                // Note: ngContentSelectors will be filled later once the template is
                // loaded.
                var createComponentFactory = this._reflector.resolveExternalReference(identifiers_1.Identifiers.createComponentFactory);
                return createComponentFactory(selector, dirType, hostView, inputs, outputs, []);
            }
        };
        CompileMetadataResolver.prototype.initComponentFactory = function (factory, ngContentSelectors) {
            if (!(factory instanceof static_symbol_1.StaticSymbol)) {
                (_a = factory.ngContentSelectors).push.apply(_a, tslib_1.__spread(ngContentSelectors));
            }
            var _a;
        };
        CompileMetadataResolver.prototype._loadSummary = function (type, kind) {
            var typeSummary = this._summaryCache.get(type);
            if (!typeSummary) {
                var summary = this._summaryResolver.resolveSummary(type);
                typeSummary = summary ? summary.type : null;
                this._summaryCache.set(type, typeSummary || null);
            }
            return typeSummary && typeSummary.summaryKind === kind ? typeSummary : null;
        };
        CompileMetadataResolver.prototype.getHostComponentMetadata = function (compMeta, hostViewType) {
            var hostType = this.getHostComponentType(compMeta.type.reference);
            if (!hostViewType) {
                hostViewType = this.getHostComponentViewClass(hostType);
            }
            // Note: ! is ok here as this method should only be called with normalized directive
            // metadata, which always fills in the selector.
            var template = selector_1.CssSelector.parse(compMeta.selector)[0].getMatchingElementTemplate();
            var templateUrl = '';
            var htmlAst = this._htmlParser.parse(template, templateUrl);
            return cpl.CompileDirectiveMetadata.create({
                isHost: true,
                type: { reference: hostType, diDeps: [], lifecycleHooks: [] },
                template: new cpl.CompileTemplateMetadata({
                    encapsulation: core_1.ViewEncapsulation.None,
                    template: template,
                    templateUrl: templateUrl,
                    htmlAst: htmlAst,
                    styles: [],
                    styleUrls: [],
                    ngContentSelectors: [],
                    animations: [],
                    isInline: true,
                    externalStylesheets: [],
                    interpolation: null,
                    preserveWhitespaces: false,
                }),
                exportAs: null,
                changeDetection: core_1.ChangeDetectionStrategy.Default,
                inputs: [],
                outputs: [],
                host: {},
                isComponent: true,
                selector: '*',
                providers: [],
                viewProviders: [],
                queries: [],
                guards: {},
                viewQueries: [],
                componentViewType: hostViewType,
                rendererType: { id: '__Host__', encapsulation: core_1.ViewEncapsulation.None, styles: [], data: {} },
                entryComponents: [],
                componentFactory: null
            });
        };
        CompileMetadataResolver.prototype.loadDirectiveMetadata = function (ngModuleType, directiveType, isSync) {
            var _this = this;
            if (this._directiveCache.has(directiveType)) {
                return null;
            }
            directiveType = util_2.resolveForwardRef(directiveType);
            var _a = this.getNonNormalizedDirectiveMetadata(directiveType), annotation = _a.annotation, metadata = _a.metadata;
            var createDirectiveMetadata = function (templateMetadata) {
                var normalizedDirMeta = new cpl.CompileDirectiveMetadata({
                    isHost: false,
                    type: metadata.type,
                    isComponent: metadata.isComponent,
                    selector: metadata.selector,
                    exportAs: metadata.exportAs,
                    changeDetection: metadata.changeDetection,
                    inputs: metadata.inputs,
                    outputs: metadata.outputs,
                    hostListeners: metadata.hostListeners,
                    hostProperties: metadata.hostProperties,
                    hostAttributes: metadata.hostAttributes,
                    providers: metadata.providers,
                    viewProviders: metadata.viewProviders,
                    queries: metadata.queries,
                    guards: metadata.guards,
                    viewQueries: metadata.viewQueries,
                    entryComponents: metadata.entryComponents,
                    componentViewType: metadata.componentViewType,
                    rendererType: metadata.rendererType,
                    componentFactory: metadata.componentFactory,
                    template: templateMetadata
                });
                if (templateMetadata) {
                    _this.initComponentFactory(metadata.componentFactory, templateMetadata.ngContentSelectors);
                }
                _this._directiveCache.set(directiveType, normalizedDirMeta);
                _this._summaryCache.set(directiveType, normalizedDirMeta.toSummary());
                return null;
            };
            if (metadata.isComponent) {
                var template = metadata.template;
                var templateMeta = this._directiveNormalizer.normalizeTemplate({
                    ngModuleType: ngModuleType,
                    componentType: directiveType,
                    moduleUrl: this._reflector.componentModuleUrl(directiveType, annotation),
                    encapsulation: template.encapsulation,
                    template: template.template,
                    templateUrl: template.templateUrl,
                    styles: template.styles,
                    styleUrls: template.styleUrls,
                    animations: template.animations,
                    interpolation: template.interpolation,
                    preserveWhitespaces: template.preserveWhitespaces
                });
                if (util_2.isPromise(templateMeta) && isSync) {
                    this._reportError(componentStillLoadingError(directiveType), directiveType);
                    return null;
                }
                return util_2.SyncAsync.then(templateMeta, createDirectiveMetadata);
            }
            else {
                // directive
                createDirectiveMetadata(null);
                return null;
            }
        };
        CompileMetadataResolver.prototype.getNonNormalizedDirectiveMetadata = function (directiveType) {
            var _this = this;
            directiveType = util_2.resolveForwardRef(directiveType);
            if (!directiveType) {
                return null;
            }
            var cacheEntry = this._nonNormalizedDirectiveCache.get(directiveType);
            if (cacheEntry) {
                return cacheEntry;
            }
            var dirMeta = this._directiveResolver.resolve(directiveType, false);
            if (!dirMeta) {
                return null;
            }
            var nonNormalizedTemplateMetadata = undefined;
            if (core_1.createComponent.isTypeOf(dirMeta)) {
                // component
                var compMeta = dirMeta;
                assertions_1.assertArrayOfStrings('styles', compMeta.styles);
                assertions_1.assertArrayOfStrings('styleUrls', compMeta.styleUrls);
                assertions_1.assertInterpolationSymbols('interpolation', compMeta.interpolation);
                var animations = compMeta.animations;
                nonNormalizedTemplateMetadata = new cpl.CompileTemplateMetadata({
                    encapsulation: util_2.noUndefined(compMeta.encapsulation),
                    template: util_2.noUndefined(compMeta.template),
                    templateUrl: util_2.noUndefined(compMeta.templateUrl),
                    htmlAst: null,
                    styles: compMeta.styles || [],
                    styleUrls: compMeta.styleUrls || [],
                    animations: animations || [],
                    interpolation: util_2.noUndefined(compMeta.interpolation),
                    isInline: !!compMeta.template,
                    externalStylesheets: [],
                    ngContentSelectors: [],
                    preserveWhitespaces: util_2.noUndefined(dirMeta.preserveWhitespaces),
                });
            }
            var changeDetectionStrategy = null;
            var viewProviders = [];
            var entryComponentMetadata = [];
            var selector = dirMeta.selector;
            if (core_1.createComponent.isTypeOf(dirMeta)) {
                // Component
                var compMeta = dirMeta;
                changeDetectionStrategy = compMeta.changeDetection;
                if (compMeta.viewProviders) {
                    viewProviders = this._getProvidersMetadata(compMeta.viewProviders, entryComponentMetadata, "viewProviders for \"" + stringifyType(directiveType) + "\"", [], directiveType);
                }
                if (compMeta.entryComponents) {
                    entryComponentMetadata = flattenAndDedupeArray(compMeta.entryComponents)
                        .map(function (type) { return _this._getEntryComponentMetadata(type); })
                        .concat(entryComponentMetadata);
                }
                if (!selector) {
                    selector = this._schemaRegistry.getDefaultComponentElementName();
                }
            }
            else {
                // Directive
                if (!selector) {
                    this._reportError(util_2.syntaxError("Directive " + stringifyType(directiveType) + " has no selector, please add it!"), directiveType);
                    selector = 'error';
                }
            }
            var providers = [];
            if (dirMeta.providers != null) {
                providers = this._getProvidersMetadata(dirMeta.providers, entryComponentMetadata, "providers for \"" + stringifyType(directiveType) + "\"", [], directiveType);
            }
            var queries = [];
            var viewQueries = [];
            if (dirMeta.queries != null) {
                queries = this._getQueriesMetadata(dirMeta.queries, false, directiveType);
                viewQueries = this._getQueriesMetadata(dirMeta.queries, true, directiveType);
            }
            var metadata = cpl.CompileDirectiveMetadata.create({
                isHost: false,
                selector: selector,
                exportAs: util_2.noUndefined(dirMeta.exportAs),
                isComponent: !!nonNormalizedTemplateMetadata,
                type: this._getTypeMetadata(directiveType),
                template: nonNormalizedTemplateMetadata,
                changeDetection: changeDetectionStrategy,
                inputs: dirMeta.inputs || [],
                outputs: dirMeta.outputs || [],
                host: dirMeta.host || {},
                providers: providers || [],
                viewProviders: viewProviders || [],
                queries: queries || [],
                guards: dirMeta.guards || {},
                viewQueries: viewQueries || [],
                entryComponents: entryComponentMetadata,
                componentViewType: nonNormalizedTemplateMetadata ? this.getComponentViewClass(directiveType) :
                    null,
                rendererType: nonNormalizedTemplateMetadata ? this.getRendererType(directiveType) : null,
                componentFactory: null
            });
            if (nonNormalizedTemplateMetadata) {
                metadata.componentFactory =
                    this.getComponentFactory(selector, directiveType, metadata.inputs, metadata.outputs);
            }
            cacheEntry = { metadata: metadata, annotation: dirMeta };
            this._nonNormalizedDirectiveCache.set(directiveType, cacheEntry);
            return cacheEntry;
        };
        /**
         * Gets the metadata for the given directive.
         * This assumes `loadNgModuleDirectiveAndPipeMetadata` has been called first.
         */
        CompileMetadataResolver.prototype.getDirectiveMetadata = function (directiveType) {
            var dirMeta = this._directiveCache.get(directiveType);
            if (!dirMeta) {
                this._reportError(util_2.syntaxError("Illegal state: getDirectiveMetadata can only be called after loadNgModuleDirectiveAndPipeMetadata for a module that declares it. Directive " + stringifyType(directiveType) + "."), directiveType);
            }
            return dirMeta;
        };
        CompileMetadataResolver.prototype.getDirectiveSummary = function (dirType) {
            var dirSummary = this._loadSummary(dirType, cpl.CompileSummaryKind.Directive);
            if (!dirSummary) {
                this._reportError(util_2.syntaxError("Illegal state: Could not load the summary for directive " + stringifyType(dirType) + "."), dirType);
            }
            return dirSummary;
        };
        CompileMetadataResolver.prototype.isDirective = function (type) {
            return !!this._loadSummary(type, cpl.CompileSummaryKind.Directive) ||
                this._directiveResolver.isDirective(type);
        };
        CompileMetadataResolver.prototype.isPipe = function (type) {
            return !!this._loadSummary(type, cpl.CompileSummaryKind.Pipe) ||
                this._pipeResolver.isPipe(type);
        };
        CompileMetadataResolver.prototype.isNgModule = function (type) {
            return !!this._loadSummary(type, cpl.CompileSummaryKind.NgModule) ||
                this._ngModuleResolver.isNgModule(type);
        };
        CompileMetadataResolver.prototype.getNgModuleSummary = function (moduleType, alreadyCollecting) {
            if (alreadyCollecting === void 0) { alreadyCollecting = null; }
            var moduleSummary = this._loadSummary(moduleType, cpl.CompileSummaryKind.NgModule);
            if (!moduleSummary) {
                var moduleMeta = this.getNgModuleMetadata(moduleType, false, alreadyCollecting);
                moduleSummary = moduleMeta ? moduleMeta.toSummary() : null;
                if (moduleSummary) {
                    this._summaryCache.set(moduleType, moduleSummary);
                }
            }
            return moduleSummary;
        };
        /**
         * Loads the declared directives and pipes of an NgModule.
         */
        CompileMetadataResolver.prototype.loadNgModuleDirectiveAndPipeMetadata = function (moduleType, isSync, throwIfNotFound) {
            var _this = this;
            if (throwIfNotFound === void 0) { throwIfNotFound = true; }
            var ngModule = this.getNgModuleMetadata(moduleType, throwIfNotFound);
            var loading = [];
            if (ngModule) {
                ngModule.declaredDirectives.forEach(function (id) {
                    var promise = _this.loadDirectiveMetadata(moduleType, id.reference, isSync);
                    if (promise) {
                        loading.push(promise);
                    }
                });
                ngModule.declaredPipes.forEach(function (id) { return _this._loadPipeMetadata(id.reference); });
            }
            return Promise.all(loading);
        };
        CompileMetadataResolver.prototype.getShallowModuleMetadata = function (moduleType) {
            var compileMeta = this._shallowModuleCache.get(moduleType);
            if (compileMeta) {
                return compileMeta;
            }
            var ngModuleMeta = directive_resolver_1.findLast(this._reflector.shallowAnnotations(moduleType), core_1.createNgModule.isTypeOf);
            compileMeta = {
                type: this._getTypeMetadata(moduleType),
                rawExports: ngModuleMeta.exports,
                rawImports: ngModuleMeta.imports,
                rawProviders: ngModuleMeta.providers,
            };
            this._shallowModuleCache.set(moduleType, compileMeta);
            return compileMeta;
        };
        CompileMetadataResolver.prototype.getNgModuleMetadata = function (moduleType, throwIfNotFound, alreadyCollecting) {
            var _this = this;
            if (throwIfNotFound === void 0) { throwIfNotFound = true; }
            if (alreadyCollecting === void 0) { alreadyCollecting = null; }
            moduleType = util_2.resolveForwardRef(moduleType);
            var compileMeta = this._ngModuleCache.get(moduleType);
            if (compileMeta) {
                return compileMeta;
            }
            var meta = this._ngModuleResolver.resolve(moduleType, throwIfNotFound);
            if (!meta) {
                return null;
            }
            var declaredDirectives = [];
            var exportedNonModuleIdentifiers = [];
            var declaredPipes = [];
            var importedModules = [];
            var exportedModules = [];
            var providers = [];
            var entryComponents = [];
            var bootstrapComponents = [];
            var schemas = [];
            if (meta.imports) {
                flattenAndDedupeArray(meta.imports).forEach(function (importedType) {
                    var importedModuleType = undefined;
                    if (isValidType(importedType)) {
                        importedModuleType = importedType;
                    }
                    else if (importedType && importedType.ngModule) {
                        var moduleWithProviders = importedType;
                        importedModuleType = moduleWithProviders.ngModule;
                        if (moduleWithProviders.providers) {
                            providers.push.apply(providers, tslib_1.__spread(_this._getProvidersMetadata(moduleWithProviders.providers, entryComponents, "provider for the NgModule '" + stringifyType(importedModuleType) + "'", [], importedType)));
                        }
                    }
                    if (importedModuleType) {
                        if (_this._checkSelfImport(moduleType, importedModuleType))
                            return;
                        if (!alreadyCollecting)
                            alreadyCollecting = new Set();
                        if (alreadyCollecting.has(importedModuleType)) {
                            _this._reportError(util_2.syntaxError(_this._getTypeDescriptor(importedModuleType) + " '" + stringifyType(importedType) + "' is imported recursively by the module '" + stringifyType(moduleType) + "'."), moduleType);
                            return;
                        }
                        alreadyCollecting.add(importedModuleType);
                        var importedModuleSummary = _this.getNgModuleSummary(importedModuleType, alreadyCollecting);
                        alreadyCollecting.delete(importedModuleType);
                        if (!importedModuleSummary) {
                            _this._reportError(util_2.syntaxError("Unexpected " + _this._getTypeDescriptor(importedType) + " '" + stringifyType(importedType) + "' imported by the module '" + stringifyType(moduleType) + "'. Please add a @NgModule annotation."), moduleType);
                            return;
                        }
                        importedModules.push(importedModuleSummary);
                    }
                    else {
                        _this._reportError(util_2.syntaxError("Unexpected value '" + stringifyType(importedType) + "' imported by the module '" + stringifyType(moduleType) + "'"), moduleType);
                        return;
                    }
                });
            }
            if (meta.exports) {
                flattenAndDedupeArray(meta.exports).forEach(function (exportedType) {
                    if (!isValidType(exportedType)) {
                        _this._reportError(util_2.syntaxError("Unexpected value '" + stringifyType(exportedType) + "' exported by the module '" + stringifyType(moduleType) + "'"), moduleType);
                        return;
                    }
                    if (!alreadyCollecting)
                        alreadyCollecting = new Set();
                    if (alreadyCollecting.has(exportedType)) {
                        _this._reportError(util_2.syntaxError(_this._getTypeDescriptor(exportedType) + " '" + util_2.stringify(exportedType) + "' is exported recursively by the module '" + stringifyType(moduleType) + "'"), moduleType);
                        return;
                    }
                    alreadyCollecting.add(exportedType);
                    var exportedModuleSummary = _this.getNgModuleSummary(exportedType, alreadyCollecting);
                    alreadyCollecting.delete(exportedType);
                    if (exportedModuleSummary) {
                        exportedModules.push(exportedModuleSummary);
                    }
                    else {
                        exportedNonModuleIdentifiers.push(_this._getIdentifierMetadata(exportedType));
                    }
                });
            }
            // Note: This will be modified later, so we rely on
            // getting a new instance every time!
            var transitiveModule = this._getTransitiveNgModuleMetadata(importedModules, exportedModules);
            if (meta.declarations) {
                flattenAndDedupeArray(meta.declarations).forEach(function (declaredType) {
                    if (!isValidType(declaredType)) {
                        _this._reportError(util_2.syntaxError("Unexpected value '" + stringifyType(declaredType) + "' declared by the module '" + stringifyType(moduleType) + "'"), moduleType);
                        return;
                    }
                    var declaredIdentifier = _this._getIdentifierMetadata(declaredType);
                    if (_this.isDirective(declaredType)) {
                        transitiveModule.addDirective(declaredIdentifier);
                        declaredDirectives.push(declaredIdentifier);
                        _this._addTypeToModule(declaredType, moduleType);
                    }
                    else if (_this.isPipe(declaredType)) {
                        transitiveModule.addPipe(declaredIdentifier);
                        transitiveModule.pipes.push(declaredIdentifier);
                        declaredPipes.push(declaredIdentifier);
                        _this._addTypeToModule(declaredType, moduleType);
                    }
                    else {
                        _this._reportError(util_2.syntaxError("Unexpected " + _this._getTypeDescriptor(declaredType) + " '" + stringifyType(declaredType) + "' declared by the module '" + stringifyType(moduleType) + "'. Please add a @Pipe/@Directive/@Component annotation."), moduleType);
                        return;
                    }
                });
            }
            var exportedDirectives = [];
            var exportedPipes = [];
            exportedNonModuleIdentifiers.forEach(function (exportedId) {
                if (transitiveModule.directivesSet.has(exportedId.reference)) {
                    exportedDirectives.push(exportedId);
                    transitiveModule.addExportedDirective(exportedId);
                }
                else if (transitiveModule.pipesSet.has(exportedId.reference)) {
                    exportedPipes.push(exportedId);
                    transitiveModule.addExportedPipe(exportedId);
                }
                else {
                    _this._reportError(util_2.syntaxError("Can't export " + _this._getTypeDescriptor(exportedId.reference) + " " + stringifyType(exportedId.reference) + " from " + stringifyType(moduleType) + " as it was neither declared nor imported!"), moduleType);
                    return;
                }
            });
            // The providers of the module have to go last
            // so that they overwrite any other provider we already added.
            if (meta.providers) {
                providers.push.apply(providers, tslib_1.__spread(this._getProvidersMetadata(meta.providers, entryComponents, "provider for the NgModule '" + stringifyType(moduleType) + "'", [], moduleType)));
            }
            if (meta.entryComponents) {
                entryComponents.push.apply(entryComponents, tslib_1.__spread(flattenAndDedupeArray(meta.entryComponents)
                    .map(function (type) { return _this._getEntryComponentMetadata(type); })));
            }
            if (meta.bootstrap) {
                flattenAndDedupeArray(meta.bootstrap).forEach(function (type) {
                    if (!isValidType(type)) {
                        _this._reportError(util_2.syntaxError("Unexpected value '" + stringifyType(type) + "' used in the bootstrap property of module '" + stringifyType(moduleType) + "'"), moduleType);
                        return;
                    }
                    bootstrapComponents.push(_this._getIdentifierMetadata(type));
                });
            }
            entryComponents.push.apply(entryComponents, tslib_1.__spread(bootstrapComponents.map(function (type) { return _this._getEntryComponentMetadata(type.reference); })));
            if (meta.schemas) {
                schemas.push.apply(schemas, tslib_1.__spread(flattenAndDedupeArray(meta.schemas)));
            }
            compileMeta = new cpl.CompileNgModuleMetadata({
                type: this._getTypeMetadata(moduleType),
                providers: providers,
                entryComponents: entryComponents,
                bootstrapComponents: bootstrapComponents,
                schemas: schemas,
                declaredDirectives: declaredDirectives,
                exportedDirectives: exportedDirectives,
                declaredPipes: declaredPipes,
                exportedPipes: exportedPipes,
                importedModules: importedModules,
                exportedModules: exportedModules,
                transitiveModule: transitiveModule,
                id: meta.id || null,
            });
            entryComponents.forEach(function (id) { return transitiveModule.addEntryComponent(id); });
            providers.forEach(function (provider) { return transitiveModule.addProvider(provider, compileMeta.type); });
            transitiveModule.addModule(compileMeta.type);
            this._ngModuleCache.set(moduleType, compileMeta);
            return compileMeta;
        };
        CompileMetadataResolver.prototype._checkSelfImport = function (moduleType, importedModuleType) {
            if (moduleType === importedModuleType) {
                this._reportError(util_2.syntaxError("'" + stringifyType(moduleType) + "' module can't import itself"), moduleType);
                return true;
            }
            return false;
        };
        CompileMetadataResolver.prototype._getTypeDescriptor = function (type) {
            if (isValidType(type)) {
                if (this.isDirective(type)) {
                    return 'directive';
                }
                if (this.isPipe(type)) {
                    return 'pipe';
                }
                if (this.isNgModule(type)) {
                    return 'module';
                }
            }
            if (type.provide) {
                return 'provider';
            }
            return 'value';
        };
        CompileMetadataResolver.prototype._addTypeToModule = function (type, moduleType) {
            var oldModule = this._ngModuleOfTypes.get(type);
            if (oldModule && oldModule !== moduleType) {
                this._reportError(util_2.syntaxError("Type " + stringifyType(type) + " is part of the declarations of 2 modules: " + stringifyType(oldModule) + " and " + stringifyType(moduleType) + "! " +
                    ("Please consider moving " + stringifyType(type) + " to a higher module that imports " + stringifyType(oldModule) + " and " + stringifyType(moduleType) + ". ") +
                    ("You can also create a new NgModule that exports and includes " + stringifyType(type) + " then import that NgModule in " + stringifyType(oldModule) + " and " + stringifyType(moduleType) + ".")), moduleType);
                return;
            }
            this._ngModuleOfTypes.set(type, moduleType);
        };
        CompileMetadataResolver.prototype._getTransitiveNgModuleMetadata = function (importedModules, exportedModules) {
            // collect `providers` / `entryComponents` from all imported and all exported modules
            var result = new cpl.TransitiveCompileNgModuleMetadata();
            var modulesByToken = new Map();
            importedModules.concat(exportedModules).forEach(function (modSummary) {
                modSummary.modules.forEach(function (mod) { return result.addModule(mod); });
                modSummary.entryComponents.forEach(function (comp) { return result.addEntryComponent(comp); });
                var addedTokens = new Set();
                modSummary.providers.forEach(function (entry) {
                    var tokenRef = cpl.tokenReference(entry.provider.token);
                    var prevModules = modulesByToken.get(tokenRef);
                    if (!prevModules) {
                        prevModules = new Set();
                        modulesByToken.set(tokenRef, prevModules);
                    }
                    var moduleRef = entry.module.reference;
                    // Note: the providers of one module may still contain multiple providers
                    // per token (e.g. for multi providers), and we need to preserve these.
                    if (addedTokens.has(tokenRef) || !prevModules.has(moduleRef)) {
                        prevModules.add(moduleRef);
                        addedTokens.add(tokenRef);
                        result.addProvider(entry.provider, entry.module);
                    }
                });
            });
            exportedModules.forEach(function (modSummary) {
                modSummary.exportedDirectives.forEach(function (id) { return result.addExportedDirective(id); });
                modSummary.exportedPipes.forEach(function (id) { return result.addExportedPipe(id); });
            });
            importedModules.forEach(function (modSummary) {
                modSummary.exportedDirectives.forEach(function (id) { return result.addDirective(id); });
                modSummary.exportedPipes.forEach(function (id) { return result.addPipe(id); });
            });
            return result;
        };
        CompileMetadataResolver.prototype._getIdentifierMetadata = function (type) {
            type = util_2.resolveForwardRef(type);
            return { reference: type };
        };
        CompileMetadataResolver.prototype.isInjectable = function (type) {
            var annotations = this._reflector.tryAnnotations(type);
            return annotations.some(function (ann) { return core_1.createInjectable.isTypeOf(ann); });
        };
        CompileMetadataResolver.prototype.getInjectableSummary = function (type) {
            return {
                summaryKind: cpl.CompileSummaryKind.Injectable,
                type: this._getTypeMetadata(type, null, false)
            };
        };
        CompileMetadataResolver.prototype.getInjectableMetadata = function (type, dependencies, throwOnUnknownDeps) {
            if (dependencies === void 0) { dependencies = null; }
            if (throwOnUnknownDeps === void 0) { throwOnUnknownDeps = true; }
            var typeSummary = this._loadSummary(type, cpl.CompileSummaryKind.Injectable);
            var typeMetadata = typeSummary ?
                typeSummary.type :
                this._getTypeMetadata(type, dependencies, throwOnUnknownDeps);
            var annotations = this._reflector.annotations(type).filter(function (ann) { return core_1.createInjectable.isTypeOf(ann); });
            if (annotations.length === 0) {
                return null;
            }
            var meta = annotations[annotations.length - 1];
            return {
                symbol: type,
                type: typeMetadata,
                providedIn: meta.providedIn,
                useValue: meta.useValue,
                useClass: meta.useClass,
                useExisting: meta.useExisting,
                useFactory: meta.useFactory,
                deps: meta.deps,
            };
        };
        CompileMetadataResolver.prototype._getTypeMetadata = function (type, dependencies, throwOnUnknownDeps) {
            if (dependencies === void 0) { dependencies = null; }
            if (throwOnUnknownDeps === void 0) { throwOnUnknownDeps = true; }
            var identifier = this._getIdentifierMetadata(type);
            return {
                reference: identifier.reference,
                diDeps: this._getDependenciesMetadata(identifier.reference, dependencies, throwOnUnknownDeps),
                lifecycleHooks: lifecycle_reflector_1.getAllLifecycleHooks(this._reflector, identifier.reference),
            };
        };
        CompileMetadataResolver.prototype._getFactoryMetadata = function (factory, dependencies) {
            if (dependencies === void 0) { dependencies = null; }
            factory = util_2.resolveForwardRef(factory);
            return { reference: factory, diDeps: this._getDependenciesMetadata(factory, dependencies) };
        };
        /**
         * Gets the metadata for the given pipe.
         * This assumes `loadNgModuleDirectiveAndPipeMetadata` has been called first.
         */
        CompileMetadataResolver.prototype.getPipeMetadata = function (pipeType) {
            var pipeMeta = this._pipeCache.get(pipeType);
            if (!pipeMeta) {
                this._reportError(util_2.syntaxError("Illegal state: getPipeMetadata can only be called after loadNgModuleDirectiveAndPipeMetadata for a module that declares it. Pipe " + stringifyType(pipeType) + "."), pipeType);
            }
            return pipeMeta || null;
        };
        CompileMetadataResolver.prototype.getPipeSummary = function (pipeType) {
            var pipeSummary = this._loadSummary(pipeType, cpl.CompileSummaryKind.Pipe);
            if (!pipeSummary) {
                this._reportError(util_2.syntaxError("Illegal state: Could not load the summary for pipe " + stringifyType(pipeType) + "."), pipeType);
            }
            return pipeSummary;
        };
        CompileMetadataResolver.prototype.getOrLoadPipeMetadata = function (pipeType) {
            var pipeMeta = this._pipeCache.get(pipeType);
            if (!pipeMeta) {
                pipeMeta = this._loadPipeMetadata(pipeType);
            }
            return pipeMeta;
        };
        CompileMetadataResolver.prototype._loadPipeMetadata = function (pipeType) {
            pipeType = util_2.resolveForwardRef(pipeType);
            var pipeAnnotation = this._pipeResolver.resolve(pipeType);
            var pipeMeta = new cpl.CompilePipeMetadata({
                type: this._getTypeMetadata(pipeType),
                name: pipeAnnotation.name,
                pure: !!pipeAnnotation.pure
            });
            this._pipeCache.set(pipeType, pipeMeta);
            this._summaryCache.set(pipeType, pipeMeta.toSummary());
            return pipeMeta;
        };
        CompileMetadataResolver.prototype._getDependenciesMetadata = function (typeOrFunc, dependencies, throwOnUnknownDeps) {
            var _this = this;
            if (throwOnUnknownDeps === void 0) { throwOnUnknownDeps = true; }
            var hasUnknownDeps = false;
            var params = dependencies || this._reflector.parameters(typeOrFunc) || [];
            var dependenciesMetadata = params.map(function (param) {
                var isAttribute = false;
                var isHost = false;
                var isSelf = false;
                var isSkipSelf = false;
                var isOptional = false;
                var token = null;
                if (Array.isArray(param)) {
                    param.forEach(function (paramEntry) {
                        if (core_1.createHost.isTypeOf(paramEntry)) {
                            isHost = true;
                        }
                        else if (core_1.createSelf.isTypeOf(paramEntry)) {
                            isSelf = true;
                        }
                        else if (core_1.createSkipSelf.isTypeOf(paramEntry)) {
                            isSkipSelf = true;
                        }
                        else if (core_1.createOptional.isTypeOf(paramEntry)) {
                            isOptional = true;
                        }
                        else if (core_1.createAttribute.isTypeOf(paramEntry)) {
                            isAttribute = true;
                            token = paramEntry.attributeName;
                        }
                        else if (core_1.createInject.isTypeOf(paramEntry)) {
                            token = paramEntry.token;
                        }
                        else if (core_1.createInjectionToken.isTypeOf(paramEntry) || paramEntry instanceof static_symbol_1.StaticSymbol) {
                            token = paramEntry;
                        }
                        else if (isValidType(paramEntry) && token == null) {
                            token = paramEntry;
                        }
                    });
                }
                else {
                    token = param;
                }
                if (token == null) {
                    hasUnknownDeps = true;
                    return null;
                }
                return {
                    isAttribute: isAttribute,
                    isHost: isHost,
                    isSelf: isSelf,
                    isSkipSelf: isSkipSelf,
                    isOptional: isOptional,
                    token: _this._getTokenMetadata(token)
                };
            });
            if (hasUnknownDeps) {
                var depsTokens = dependenciesMetadata.map(function (dep) { return dep ? stringifyType(dep.token) : '?'; }).join(', ');
                var message = "Can't resolve all parameters for " + stringifyType(typeOrFunc) + ": (" + depsTokens + ").";
                if (throwOnUnknownDeps || this._config.strictInjectionParameters) {
                    this._reportError(util_2.syntaxError(message), typeOrFunc);
                }
                else {
                    this._console.warn("Warning: " + message + " This will become an error in Angular v6.x");
                }
            }
            return dependenciesMetadata;
        };
        CompileMetadataResolver.prototype._getTokenMetadata = function (token) {
            token = util_2.resolveForwardRef(token);
            var compileToken;
            if (typeof token === 'string') {
                compileToken = { value: token };
            }
            else {
                compileToken = { identifier: { reference: token } };
            }
            return compileToken;
        };
        CompileMetadataResolver.prototype._getProvidersMetadata = function (providers, targetEntryComponents, debugInfo, compileProviders, type) {
            var _this = this;
            if (compileProviders === void 0) { compileProviders = []; }
            providers.forEach(function (provider, providerIdx) {
                if (Array.isArray(provider)) {
                    _this._getProvidersMetadata(provider, targetEntryComponents, debugInfo, compileProviders);
                }
                else {
                    provider = util_2.resolveForwardRef(provider);
                    var providerMeta = undefined;
                    if (provider && typeof provider === 'object' && provider.hasOwnProperty('provide')) {
                        _this._validateProvider(provider);
                        providerMeta = new cpl.ProviderMeta(provider.provide, provider);
                    }
                    else if (isValidType(provider)) {
                        providerMeta = new cpl.ProviderMeta(provider, { useClass: provider });
                    }
                    else if (provider === void 0) {
                        _this._reportError(util_2.syntaxError("Encountered undefined provider! Usually this means you have a circular dependencies (might be caused by using 'barrel' index.ts files."));
                        return;
                    }
                    else {
                        var providersInfo = providers.reduce(function (soFar, seenProvider, seenProviderIdx) {
                            if (seenProviderIdx < providerIdx) {
                                soFar.push("" + stringifyType(seenProvider));
                            }
                            else if (seenProviderIdx == providerIdx) {
                                soFar.push("?" + stringifyType(seenProvider) + "?");
                            }
                            else if (seenProviderIdx == providerIdx + 1) {
                                soFar.push('...');
                            }
                            return soFar;
                        }, [])
                            .join(', ');
                        _this._reportError(util_2.syntaxError("Invalid " + (debugInfo ? debugInfo : 'provider') + " - only instances of Provider and Type are allowed, got: [" + providersInfo + "]"), type);
                        return;
                    }
                    if (providerMeta.token ===
                        _this._reflector.resolveExternalReference(identifiers_1.Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS)) {
                        targetEntryComponents.push.apply(targetEntryComponents, tslib_1.__spread(_this._getEntryComponentsFromProvider(providerMeta, type)));
                    }
                    else {
                        compileProviders.push(_this.getProviderMetadata(providerMeta));
                    }
                }
            });
            return compileProviders;
        };
        CompileMetadataResolver.prototype._validateProvider = function (provider) {
            if (provider.hasOwnProperty('useClass') && provider.useClass == null) {
                this._reportError(util_2.syntaxError("Invalid provider for " + stringifyType(provider.provide) + ". useClass cannot be " + provider.useClass + ".\n           Usually it happens when:\n           1. There's a circular dependency (might be caused by using index.ts (barrel) files).\n           2. Class was used before it was declared. Use forwardRef in this case."));
            }
        };
        CompileMetadataResolver.prototype._getEntryComponentsFromProvider = function (provider, type) {
            var _this = this;
            var components = [];
            var collectedIdentifiers = [];
            if (provider.useFactory || provider.useExisting || provider.useClass) {
                this._reportError(util_2.syntaxError("The ANALYZE_FOR_ENTRY_COMPONENTS token only supports useValue!"), type);
                return [];
            }
            if (!provider.multi) {
                this._reportError(util_2.syntaxError("The ANALYZE_FOR_ENTRY_COMPONENTS token only supports 'multi = true'!"), type);
                return [];
            }
            extractIdentifiers(provider.useValue, collectedIdentifiers);
            collectedIdentifiers.forEach(function (identifier) {
                var entry = _this._getEntryComponentMetadata(identifier.reference, false);
                if (entry) {
                    components.push(entry);
                }
            });
            return components;
        };
        CompileMetadataResolver.prototype._getEntryComponentMetadata = function (dirType, throwIfNotFound) {
            if (throwIfNotFound === void 0) { throwIfNotFound = true; }
            var dirMeta = this.getNonNormalizedDirectiveMetadata(dirType);
            if (dirMeta && dirMeta.metadata.isComponent) {
                return { componentType: dirType, componentFactory: dirMeta.metadata.componentFactory };
            }
            var dirSummary = this._loadSummary(dirType, cpl.CompileSummaryKind.Directive);
            if (dirSummary && dirSummary.isComponent) {
                return { componentType: dirType, componentFactory: dirSummary.componentFactory };
            }
            if (throwIfNotFound) {
                throw util_2.syntaxError(dirType.name + " cannot be used as an entry component.");
            }
            return null;
        };
        CompileMetadataResolver.prototype._getInjectableTypeMetadata = function (type, dependencies) {
            if (dependencies === void 0) { dependencies = null; }
            var typeSummary = this._loadSummary(type, cpl.CompileSummaryKind.Injectable);
            if (typeSummary) {
                return typeSummary.type;
            }
            return this._getTypeMetadata(type, dependencies);
        };
        CompileMetadataResolver.prototype.getProviderMetadata = function (provider) {
            var compileDeps = undefined;
            var compileTypeMetadata = null;
            var compileFactoryMetadata = null;
            var token = this._getTokenMetadata(provider.token);
            if (provider.useClass) {
                compileTypeMetadata =
                    this._getInjectableTypeMetadata(provider.useClass, provider.dependencies);
                compileDeps = compileTypeMetadata.diDeps;
                if (provider.token === provider.useClass) {
                    // use the compileTypeMetadata as it contains information about lifecycleHooks...
                    token = { identifier: compileTypeMetadata };
                }
            }
            else if (provider.useFactory) {
                compileFactoryMetadata = this._getFactoryMetadata(provider.useFactory, provider.dependencies);
                compileDeps = compileFactoryMetadata.diDeps;
            }
            return {
                token: token,
                useClass: compileTypeMetadata,
                useValue: provider.useValue,
                useFactory: compileFactoryMetadata,
                useExisting: provider.useExisting ? this._getTokenMetadata(provider.useExisting) : undefined,
                deps: compileDeps,
                multi: provider.multi
            };
        };
        CompileMetadataResolver.prototype._getQueriesMetadata = function (queries, isViewQuery, directiveType) {
            var _this = this;
            var res = [];
            Object.keys(queries).forEach(function (propertyName) {
                var query = queries[propertyName];
                if (query.isViewQuery === isViewQuery) {
                    res.push(_this._getQueryMetadata(query, propertyName, directiveType));
                }
            });
            return res;
        };
        CompileMetadataResolver.prototype._queryVarBindings = function (selector) { return selector.split(/\s*,\s*/); };
        CompileMetadataResolver.prototype._getQueryMetadata = function (q, propertyName, typeOrFunc) {
            var _this = this;
            var selectors;
            if (typeof q.selector === 'string') {
                selectors =
                    this._queryVarBindings(q.selector).map(function (varName) { return _this._getTokenMetadata(varName); });
            }
            else {
                if (!q.selector) {
                    this._reportError(util_2.syntaxError("Can't construct a query for the property \"" + propertyName + "\" of \"" + stringifyType(typeOrFunc) + "\" since the query selector wasn't defined."), typeOrFunc);
                    selectors = [];
                }
                else {
                    selectors = [this._getTokenMetadata(q.selector)];
                }
            }
            return {
                selectors: selectors,
                first: q.first,
                descendants: q.descendants, propertyName: propertyName,
                read: q.read ? this._getTokenMetadata(q.read) : null
            };
        };
        CompileMetadataResolver.prototype._reportError = function (error, type, otherType) {
            if (this._errorCollector) {
                this._errorCollector(error, type);
                if (otherType) {
                    this._errorCollector(error, otherType);
                }
            }
            else {
                throw error;
            }
        };
        return CompileMetadataResolver;
    }());
    exports.CompileMetadataResolver = CompileMetadataResolver;
    function flattenArray(tree, out) {
        if (out === void 0) { out = []; }
        if (tree) {
            for (var i = 0; i < tree.length; i++) {
                var item = util_2.resolveForwardRef(tree[i]);
                if (Array.isArray(item)) {
                    flattenArray(item, out);
                }
                else {
                    out.push(item);
                }
            }
        }
        return out;
    }
    function dedupeArray(array) {
        if (array) {
            return Array.from(new Set(array));
        }
        return [];
    }
    function flattenAndDedupeArray(tree) {
        return dedupeArray(flattenArray(tree));
    }
    function isValidType(value) {
        return (value instanceof static_symbol_1.StaticSymbol) || (value instanceof core_1.Type);
    }
    function extractIdentifiers(value, targetIdentifiers) {
        util_2.visitValue(value, new _CompileValueConverter(), targetIdentifiers);
    }
    var _CompileValueConverter = /** @class */ (function (_super) {
        tslib_1.__extends(_CompileValueConverter, _super);
        function _CompileValueConverter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        _CompileValueConverter.prototype.visitOther = function (value, targetIdentifiers) {
            targetIdentifiers.push({ reference: value });
        };
        return _CompileValueConverter;
    }(util_2.ValueTransformer));
    function stringifyType(type) {
        if (type instanceof static_symbol_1.StaticSymbol) {
            return type.name + " in " + type.filePath;
        }
        else {
            return util_2.stringify(type);
        }
    }
    /**
     * Indicates that a component is still being loaded in a synchronous compile.
     */
    function componentStillLoadingError(compType) {
        var error = Error("Can't compile synchronously as " + util_2.stringify(compType) + " is still being loaded!");
        error[exports.ERROR_COMPONENT_TYPE] = compType;
        return error;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFfcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvbWV0YWRhdGFfcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgseUVBQW9FO0lBQ3BFLHVEQUE2QztJQUM3QywrREFBOEU7SUFDOUUsNERBQTBDO0lBRzFDLG1EQUFnVTtJQUVoVSwrRUFBaUU7SUFDakUsaUVBQTBDO0lBQzFDLGlGQUEyRDtJQUszRCwyREFBdUM7SUFFdkMsbURBQTJJO0lBSTlILFFBQUEsb0JBQW9CLEdBQUcsaUJBQWlCLENBQUM7SUFFdEQsZ0JBQWdCO0lBQ2hCLGtDQUFrQztJQUNsQywyREFBMkQ7SUFDM0QsOENBQThDO0lBQzlDLDZEQUE2RDtJQUM3RCw2REFBNkQ7SUFDN0QsdUJBQXVCO0lBQ3ZCO1FBVUUsaUNBQ1ksT0FBdUIsRUFBVSxXQUF1QixFQUN4RCxpQkFBbUMsRUFBVSxrQkFBcUMsRUFDbEYsYUFBMkIsRUFBVSxnQkFBc0MsRUFDM0UsZUFBc0MsRUFDdEMsb0JBQXlDLEVBQVUsUUFBaUIsRUFDcEUsa0JBQXFDLEVBQVUsVUFBNEIsRUFDM0UsZUFBZ0M7WUFOaEMsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7WUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtZQUN4RCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1lBQVUsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtZQUNsRixrQkFBYSxHQUFiLGFBQWEsQ0FBYztZQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBc0I7WUFDM0Usb0JBQWUsR0FBZixlQUFlLENBQXVCO1lBQ3RDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBcUI7WUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFTO1lBQ3BFLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7WUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFrQjtZQUMzRSxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFoQnBDLGlDQUE0QixHQUNoQyxJQUFJLEdBQUcsRUFBeUUsQ0FBQztZQUM3RSxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFzQyxDQUFDO1lBQ2hFLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQXFDLENBQUM7WUFDN0QsZUFBVSxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO1lBQ3RELG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQXFDLENBQUM7WUFDOUQscUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQWMsQ0FBQztZQUN6Qyx3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBMEMsQ0FBQztRQVNqQyxDQUFDO1FBRWhELDhDQUFZLEdBQVosY0FBbUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBRTVELCtDQUFhLEdBQWIsVUFBYyxJQUFVO1lBQ3RCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQyxvRUFBb0U7WUFDcEUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNaLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkQsQ0FBQztRQUNILENBQUM7UUFFRCw0Q0FBVSxHQUFWO1lBQ0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsNEJBQTRCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN6QyxDQUFDO1FBRU8sbURBQWlCLEdBQXpCLFVBQTBCLFFBQWEsRUFBRSxJQUFZO1lBQ25ELElBQUksUUFBUSxHQUFRLElBQUksQ0FBQztZQUN6QixJQUFNLFVBQVUsR0FBd0I7Z0JBQ3RDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDZCxNQUFNLElBQUksS0FBSyxDQUNYLDBCQUF3QixJQUFJLGtCQUFhLGdCQUFTLENBQUMsUUFBUSxDQUFDLDBCQUF1QixDQUFDLENBQUM7Z0JBQzNGLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQztZQUNGLFVBQVUsQ0FBQyxXQUFXLEdBQUcsVUFBQyxDQUFDO2dCQUN6QixRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUNQLFVBQVcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUM1QyxDQUFDLENBQUM7WUFDRixnQ0FBZ0M7WUFDMUIsVUFBVyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDeEMsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNwQixDQUFDO1FBRU8sbURBQWlCLEdBQXpCLFVBQTBCLE9BQVksRUFBRSxJQUFZO1lBQ2xELEVBQUUsQ0FBQyxDQUFDLE9BQU8sWUFBWSw0QkFBWSxDQUFDLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsd0JBQWlCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hGLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvQyxDQUFDO1FBQ0gsQ0FBQztRQUVPLHVEQUFxQixHQUE3QixVQUE4QixPQUFZO1lBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVELDJEQUF5QixHQUF6QixVQUEwQixPQUFZO1lBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxzREFBb0IsR0FBcEIsVUFBcUIsT0FBWTtZQUMvQixJQUFNLElBQUksR0FBTSxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxDQUFDLFVBQU8sQ0FBQztZQUNoRSxFQUFFLENBQUMsQ0FBQyxPQUFPLFlBQVksNEJBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLElBQU0sU0FBUyxHQUFRLHVCQUFzQixDQUFDLENBQUM7Z0JBQy9DLFNBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUVoQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ25CLENBQUM7UUFDSCxDQUFDO1FBRU8saURBQWUsR0FBdkIsVUFBd0IsT0FBWTtZQUNsQyxFQUFFLENBQUMsQ0FBQyxPQUFPLFlBQVksNEJBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUM5Qix3QkFBaUIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDMUUsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLGdDQUFnQztnQkFDaEMsaURBQWlEO2dCQUNqRCxNQUFNLENBQU0sRUFBRSxDQUFDO1lBQ2pCLENBQUM7UUFDSCxDQUFDO1FBRU8scURBQW1CLEdBQTNCLFVBQ0ksUUFBZ0IsRUFBRSxPQUFZLEVBQUUsTUFBb0MsRUFDcEUsT0FBZ0M7WUFDbEMsRUFBRSxDQUFDLENBQUMsT0FBTyxZQUFZLDRCQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FDOUIsd0JBQWlCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzlFLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pELHFFQUFxRTtnQkFDckUsVUFBVTtnQkFDVixJQUFNLHNCQUFzQixHQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLHlCQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDakYsTUFBTSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQU8sUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdkYsQ0FBQztRQUNILENBQUM7UUFFTyxzREFBb0IsR0FBNUIsVUFBNkIsT0FBNEIsRUFBRSxrQkFBNEI7WUFDckYsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sWUFBWSw0QkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxDQUFBLEtBQUMsT0FBZSxDQUFDLGtCQUFrQixDQUFBLENBQUMsSUFBSSw0QkFBSSxrQkFBa0IsR0FBRTtZQUNsRSxDQUFDOztRQUNILENBQUM7UUFFTyw4Q0FBWSxHQUFwQixVQUFxQixJQUFTLEVBQUUsSUFBNEI7WUFDMUQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzRCxXQUFXLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxXQUFXLElBQUksSUFBSSxDQUFDLENBQUM7WUFDcEQsQ0FBQztZQUNELE1BQU0sQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzlFLENBQUM7UUFFRCwwREFBd0IsR0FBeEIsVUFDSSxRQUFzQyxFQUN0QyxZQUEwQztZQUM1QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUQsQ0FBQztZQUNELG9GQUFvRjtZQUNwRixnREFBZ0Q7WUFDaEQsSUFBTSxRQUFRLEdBQUcsc0JBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFDeEYsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM5RCxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQztnQkFDekMsTUFBTSxFQUFFLElBQUk7Z0JBQ1osSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUM7Z0JBQzNELFFBQVEsRUFBRSxJQUFJLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQztvQkFDeEMsYUFBYSxFQUFFLHdCQUFpQixDQUFDLElBQUk7b0JBQ3JDLFFBQVEsVUFBQTtvQkFDUixXQUFXLGFBQUE7b0JBQ1gsT0FBTyxTQUFBO29CQUNQLE1BQU0sRUFBRSxFQUFFO29CQUNWLFNBQVMsRUFBRSxFQUFFO29CQUNiLGtCQUFrQixFQUFFLEVBQUU7b0JBQ3RCLFVBQVUsRUFBRSxFQUFFO29CQUNkLFFBQVEsRUFBRSxJQUFJO29CQUNkLG1CQUFtQixFQUFFLEVBQUU7b0JBQ3ZCLGFBQWEsRUFBRSxJQUFJO29CQUNuQixtQkFBbUIsRUFBRSxLQUFLO2lCQUMzQixDQUFDO2dCQUNGLFFBQVEsRUFBRSxJQUFJO2dCQUNkLGVBQWUsRUFBRSw4QkFBdUIsQ0FBQyxPQUFPO2dCQUNoRCxNQUFNLEVBQUUsRUFBRTtnQkFDVixPQUFPLEVBQUUsRUFBRTtnQkFDWCxJQUFJLEVBQUUsRUFBRTtnQkFDUixXQUFXLEVBQUUsSUFBSTtnQkFDakIsUUFBUSxFQUFFLEdBQUc7Z0JBQ2IsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2dCQUNYLE1BQU0sRUFBRSxFQUFFO2dCQUNWLFdBQVcsRUFBRSxFQUFFO2dCQUNmLGlCQUFpQixFQUFFLFlBQVk7Z0JBQy9CLFlBQVksRUFDUixFQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLHdCQUFpQixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQVc7Z0JBQzNGLGVBQWUsRUFBRSxFQUFFO2dCQUNuQixnQkFBZ0IsRUFBRSxJQUFJO2FBQ3ZCLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCx1REFBcUIsR0FBckIsVUFBc0IsWUFBaUIsRUFBRSxhQUFrQixFQUFFLE1BQWU7WUFBNUUsaUJBZ0VDO1lBL0RDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUM7WUFDRCxhQUFhLEdBQUcsd0JBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDM0MsSUFBQSwwREFBZ0YsRUFBL0UsMEJBQVUsRUFBRSxzQkFBUSxDQUE0RDtZQUV2RixJQUFNLHVCQUF1QixHQUFHLFVBQUMsZ0JBQW9EO2dCQUNuRixJQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxDQUFDLHdCQUF3QixDQUFDO29CQUN6RCxNQUFNLEVBQUUsS0FBSztvQkFDYixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7b0JBQ25CLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVztvQkFDakMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO29CQUMzQixRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7b0JBQzNCLGVBQWUsRUFBRSxRQUFRLENBQUMsZUFBZTtvQkFDekMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO29CQUN2QixPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU87b0JBQ3pCLGFBQWEsRUFBRSxRQUFRLENBQUMsYUFBYTtvQkFDckMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxjQUFjO29CQUN2QyxjQUFjLEVBQUUsUUFBUSxDQUFDLGNBQWM7b0JBQ3ZDLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUztvQkFDN0IsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhO29CQUNyQyxPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU87b0JBQ3pCLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtvQkFDdkIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXO29CQUNqQyxlQUFlLEVBQUUsUUFBUSxDQUFDLGVBQWU7b0JBQ3pDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxpQkFBaUI7b0JBQzdDLFlBQVksRUFBRSxRQUFRLENBQUMsWUFBWTtvQkFDbkMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLGdCQUFnQjtvQkFDM0MsUUFBUSxFQUFFLGdCQUFnQjtpQkFDM0IsQ0FBQyxDQUFDO2dCQUNILEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztvQkFDckIsS0FBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxnQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUM5RixDQUFDO2dCQUNELEtBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2dCQUMzRCxLQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDckUsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUMsQ0FBQztZQUVGLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBVSxDQUFDO2dCQUNyQyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUM7b0JBQy9ELFlBQVksY0FBQTtvQkFDWixhQUFhLEVBQUUsYUFBYTtvQkFDNUIsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQztvQkFDeEUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhO29CQUNyQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7b0JBQzNCLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVztvQkFDakMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO29CQUN2QixTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVM7b0JBQzdCLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVTtvQkFDL0IsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhO29CQUNyQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsbUJBQW1CO2lCQUNsRCxDQUFDLENBQUM7Z0JBQ0gsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLGFBQWEsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUM1RSxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNkLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1lBQy9ELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixZQUFZO2dCQUNaLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUM7UUFFRCxtRUFBaUMsR0FBakMsVUFBa0MsYUFBa0I7WUFBcEQsaUJBb0hDO1lBbEhDLGFBQWEsR0FBRyx3QkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNqRCxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBQ0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN0RSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDcEIsQ0FBQztZQUNELElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDYixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUNELElBQUksNkJBQTZCLEdBQWdDLFNBQVcsQ0FBQztZQUU3RSxFQUFFLENBQUMsQ0FBQyxzQkFBZSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLFlBQVk7Z0JBQ1osSUFBTSxRQUFRLEdBQUcsT0FBb0IsQ0FBQztnQkFDdEMsaUNBQW9CLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEQsaUNBQW9CLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdEQsdUNBQTBCLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFFcEUsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztnQkFFdkMsNkJBQTZCLEdBQUcsSUFBSSxHQUFHLENBQUMsdUJBQXVCLENBQUM7b0JBQzlELGFBQWEsRUFBRSxrQkFBVyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7b0JBQ2xELFFBQVEsRUFBRSxrQkFBVyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7b0JBQ3hDLFdBQVcsRUFBRSxrQkFBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7b0JBQzlDLE9BQU8sRUFBRSxJQUFJO29CQUNiLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxJQUFJLEVBQUU7b0JBQzdCLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUyxJQUFJLEVBQUU7b0JBQ25DLFVBQVUsRUFBRSxVQUFVLElBQUksRUFBRTtvQkFDNUIsYUFBYSxFQUFFLGtCQUFXLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztvQkFDbEQsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUTtvQkFDN0IsbUJBQW1CLEVBQUUsRUFBRTtvQkFDdkIsa0JBQWtCLEVBQUUsRUFBRTtvQkFDdEIsbUJBQW1CLEVBQUUsa0JBQVcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7aUJBQzlELENBQUMsQ0FBQztZQUNMLENBQUM7WUFFRCxJQUFJLHVCQUF1QixHQUE0QixJQUFNLENBQUM7WUFDOUQsSUFBSSxhQUFhLEdBQWtDLEVBQUUsQ0FBQztZQUN0RCxJQUFJLHNCQUFzQixHQUF3QyxFQUFFLENBQUM7WUFDckUsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUVoQyxFQUFFLENBQUMsQ0FBQyxzQkFBZSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLFlBQVk7Z0JBQ1osSUFBTSxRQUFRLEdBQUcsT0FBb0IsQ0FBQztnQkFDdEMsdUJBQXVCLEdBQUcsUUFBUSxDQUFDLGVBQWlCLENBQUM7Z0JBQ3JELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO29CQUMzQixhQUFhLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUN0QyxRQUFRLENBQUMsYUFBYSxFQUFFLHNCQUFzQixFQUM5Qyx5QkFBc0IsYUFBYSxDQUFDLGFBQWEsQ0FBQyxPQUFHLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNoRixDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUM3QixzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO3lCQUMxQyxHQUFHLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxLQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFHLEVBQXZDLENBQXVDLENBQUM7eUJBQ3RELE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUMvRCxDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDZCxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO2dCQUNuRSxDQUFDO1lBQ0gsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLFlBQVk7Z0JBQ1osRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNkLElBQUksQ0FBQyxZQUFZLENBQ2Isa0JBQVcsQ0FDUCxlQUFhLGFBQWEsQ0FBQyxhQUFhLENBQUMscUNBQWtDLENBQUMsRUFDaEYsYUFBYSxDQUFDLENBQUM7b0JBQ25CLFFBQVEsR0FBRyxPQUFPLENBQUM7Z0JBQ3JCLENBQUM7WUFDSCxDQUFDO1lBRUQsSUFBSSxTQUFTLEdBQWtDLEVBQUUsQ0FBQztZQUNsRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLFNBQVMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQ2xDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLEVBQ3pDLHFCQUFrQixhQUFhLENBQUMsYUFBYSxDQUFDLE9BQUcsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDNUUsQ0FBQztZQUNELElBQUksT0FBTyxHQUErQixFQUFFLENBQUM7WUFDN0MsSUFBSSxXQUFXLEdBQStCLEVBQUUsQ0FBQztZQUNqRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLE9BQU8sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQzFFLFdBQVcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDL0UsQ0FBQztZQUVELElBQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUM7Z0JBQ25ELE1BQU0sRUFBRSxLQUFLO2dCQUNiLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixRQUFRLEVBQUUsa0JBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO2dCQUN2QyxXQUFXLEVBQUUsQ0FBQyxDQUFDLDZCQUE2QjtnQkFDNUMsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUM7Z0JBQzFDLFFBQVEsRUFBRSw2QkFBNkI7Z0JBQ3ZDLGVBQWUsRUFBRSx1QkFBdUI7Z0JBQ3hDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxJQUFJLEVBQUU7Z0JBQzVCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxJQUFJLEVBQUU7Z0JBQzlCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUU7Z0JBQ3hCLFNBQVMsRUFBRSxTQUFTLElBQUksRUFBRTtnQkFDMUIsYUFBYSxFQUFFLGFBQWEsSUFBSSxFQUFFO2dCQUNsQyxPQUFPLEVBQUUsT0FBTyxJQUFJLEVBQUU7Z0JBQ3RCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxJQUFJLEVBQUU7Z0JBQzVCLFdBQVcsRUFBRSxXQUFXLElBQUksRUFBRTtnQkFDOUIsZUFBZSxFQUFFLHNCQUFzQjtnQkFDdkMsaUJBQWlCLEVBQUUsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxJQUFJO2dCQUN2RCxZQUFZLEVBQUUsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3hGLGdCQUFnQixFQUFFLElBQUk7YUFDdkIsQ0FBQyxDQUFDO1lBQ0gsRUFBRSxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxRQUFRLENBQUMsZ0JBQWdCO29CQUNyQixJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRixDQUFDO1lBQ0QsVUFBVSxHQUFHLEVBQUMsUUFBUSxVQUFBLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDcEIsQ0FBQztRQUVEOzs7V0FHRztRQUNILHNEQUFvQixHQUFwQixVQUFxQixhQUFrQjtZQUNyQyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUcsQ0FBQztZQUMxRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLFlBQVksQ0FDYixrQkFBVyxDQUNQLGdKQUE4SSxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQUcsQ0FBQyxFQUNsTCxhQUFhLENBQUMsQ0FBQztZQUNyQixDQUFDO1lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBRUQscURBQW1CLEdBQW5CLFVBQW9CLE9BQVk7WUFDOUIsSUFBTSxVQUFVLEdBQ2lCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5RixFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxZQUFZLENBQ2Isa0JBQVcsQ0FDUCw2REFBMkQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFHLENBQUMsRUFDekYsT0FBTyxDQUFDLENBQUM7WUFDZixDQUFDO1lBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNwQixDQUFDO1FBRUQsNkNBQVcsR0FBWCxVQUFZLElBQVM7WUFDbkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDO2dCQUM5RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCx3Q0FBTSxHQUFOLFVBQU8sSUFBUztZQUNkLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQztnQkFDekQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELDRDQUFVLEdBQVYsVUFBVyxJQUFTO1lBQ2xCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQsb0RBQWtCLEdBQWxCLFVBQW1CLFVBQWUsRUFBRSxpQkFBdUM7WUFBdkMsa0NBQUEsRUFBQSx3QkFBdUM7WUFFekUsSUFBSSxhQUFhLEdBQ2UsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9GLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztnQkFDbEYsYUFBYSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzNELEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDcEQsQ0FBQztZQUNILENBQUM7WUFDRCxNQUFNLENBQUMsYUFBYSxDQUFDO1FBQ3ZCLENBQUM7UUFFRDs7V0FFRztRQUNILHNFQUFvQyxHQUFwQyxVQUFxQyxVQUFlLEVBQUUsTUFBZSxFQUFFLGVBQXNCO1lBQTdGLGlCQWNDO1lBZHNFLGdDQUFBLEVBQUEsc0JBQXNCO1lBRTNGLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDdkUsSUFBTSxPQUFPLEdBQW1CLEVBQUUsQ0FBQztZQUNuQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNiLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFO29CQUNyQyxJQUFNLE9BQU8sR0FBRyxLQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQzdFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDeEIsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztnQkFDSCxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQUUsSUFBSyxPQUFBLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQXBDLENBQW9DLENBQUMsQ0FBQztZQUMvRSxDQUFDO1lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVELDBEQUF3QixHQUF4QixVQUF5QixVQUFlO1lBQ3RDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0QsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDaEIsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUNyQixDQUFDO1lBRUQsSUFBTSxZQUFZLEdBQ2QsNkJBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxFQUFFLHFCQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdEYsV0FBVyxHQUFHO2dCQUNaLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDO2dCQUN2QyxVQUFVLEVBQUUsWUFBWSxDQUFDLE9BQU87Z0JBQ2hDLFVBQVUsRUFBRSxZQUFZLENBQUMsT0FBTztnQkFDaEMsWUFBWSxFQUFFLFlBQVksQ0FBQyxTQUFTO2FBQ3JDLENBQUM7WUFFRixJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxxREFBbUIsR0FBbkIsVUFDSSxVQUFlLEVBQUUsZUFBc0IsRUFDdkMsaUJBQXVDO1lBRjNDLGlCQTBNQztZQXpNb0IsZ0NBQUEsRUFBQSxzQkFBc0I7WUFDdkMsa0NBQUEsRUFBQSx3QkFBdUM7WUFDekMsVUFBVSxHQUFHLHdCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLE1BQU0sQ0FBQyxXQUFXLENBQUM7WUFDckIsQ0FBQztZQUNELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ3pFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDVixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUNELElBQU0sa0JBQWtCLEdBQW9DLEVBQUUsQ0FBQztZQUMvRCxJQUFNLDRCQUE0QixHQUFvQyxFQUFFLENBQUM7WUFDekUsSUFBTSxhQUFhLEdBQW9DLEVBQUUsQ0FBQztZQUMxRCxJQUFNLGVBQWUsR0FBaUMsRUFBRSxDQUFDO1lBQ3pELElBQU0sZUFBZSxHQUFpQyxFQUFFLENBQUM7WUFDekQsSUFBTSxTQUFTLEdBQWtDLEVBQUUsQ0FBQztZQUNwRCxJQUFNLGVBQWUsR0FBd0MsRUFBRSxDQUFDO1lBQ2hFLElBQU0sbUJBQW1CLEdBQW9DLEVBQUUsQ0FBQztZQUNoRSxJQUFNLE9BQU8sR0FBcUIsRUFBRSxDQUFDO1lBRXJDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsWUFBWTtvQkFDdkQsSUFBSSxrQkFBa0IsR0FBUyxTQUFXLENBQUM7b0JBQzNDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzlCLGtCQUFrQixHQUFHLFlBQVksQ0FBQztvQkFDcEMsQ0FBQztvQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUNqRCxJQUFNLG1CQUFtQixHQUF3QixZQUFZLENBQUM7d0JBQzlELGtCQUFrQixHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQzt3QkFDbEQsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs0QkFDbEMsU0FBUyxDQUFDLElBQUksT0FBZCxTQUFTLG1CQUFTLEtBQUksQ0FBQyxxQkFBcUIsQ0FDeEMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFDOUMsZ0NBQThCLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFHLEVBQUUsRUFBRSxFQUN0RSxZQUFZLENBQUMsR0FBRTt3QkFDckIsQ0FBQztvQkFDSCxDQUFDO29CQUVELEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQzt3QkFDdkIsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDOzRCQUFDLE1BQU0sQ0FBQzt3QkFDbEUsRUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQzs0QkFBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO3dCQUN0RCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQzlDLEtBQUksQ0FBQyxZQUFZLENBQ2Isa0JBQVcsQ0FDSixLQUFJLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsVUFBSyxhQUFhLENBQUMsWUFBWSxDQUFDLGlEQUE0QyxhQUFhLENBQUMsVUFBVSxDQUFDLE9BQUksQ0FBQyxFQUM1SixVQUFVLENBQUMsQ0FBQzs0QkFDaEIsTUFBTSxDQUFDO3dCQUNULENBQUM7d0JBQ0QsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7d0JBQzFDLElBQU0scUJBQXFCLEdBQ3ZCLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO3dCQUNuRSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQzt3QkFDN0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7NEJBQzNCLEtBQUksQ0FBQyxZQUFZLENBQ2Isa0JBQVcsQ0FDUCxnQkFBYyxLQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLFVBQUssYUFBYSxDQUFDLFlBQVksQ0FBQyxrQ0FBNkIsYUFBYSxDQUFDLFVBQVUsQ0FBQywwQ0FBdUMsQ0FBQyxFQUNyTCxVQUFVLENBQUMsQ0FBQzs0QkFDaEIsTUFBTSxDQUFDO3dCQUNULENBQUM7d0JBQ0QsZUFBZSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO29CQUM5QyxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNOLEtBQUksQ0FBQyxZQUFZLENBQ2Isa0JBQVcsQ0FDUCx1QkFBcUIsYUFBYSxDQUFDLFlBQVksQ0FBQyxrQ0FBNkIsYUFBYSxDQUFDLFVBQVUsQ0FBQyxNQUFHLENBQUMsRUFDOUcsVUFBVSxDQUFDLENBQUM7d0JBQ2hCLE1BQU0sQ0FBQztvQkFDVCxDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsWUFBWTtvQkFDdkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMvQixLQUFJLENBQUMsWUFBWSxDQUNiLGtCQUFXLENBQ1AsdUJBQXFCLGFBQWEsQ0FBQyxZQUFZLENBQUMsa0NBQTZCLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBRyxDQUFDLEVBQzlHLFVBQVUsQ0FBQyxDQUFDO3dCQUNoQixNQUFNLENBQUM7b0JBQ1QsQ0FBQztvQkFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO3dCQUFDLGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7b0JBQ3RELEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hDLEtBQUksQ0FBQyxZQUFZLENBQ2Isa0JBQVcsQ0FDSixLQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLFVBQUssZ0JBQVMsQ0FBQyxZQUFZLENBQUMsaURBQTRDLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBRyxDQUFDLEVBQ2pKLFVBQVUsQ0FBQyxDQUFDO3dCQUNoQixNQUFNLENBQUM7b0JBQ1QsQ0FBQztvQkFDRCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3BDLElBQU0scUJBQXFCLEdBQUcsS0FBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO29CQUN2RixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3ZDLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQzt3QkFDMUIsZUFBZSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO29CQUM5QyxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNOLDRCQUE0QixDQUFDLElBQUksQ0FBQyxLQUFJLENBQUMsc0JBQXNCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDL0UsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7WUFFRCxtREFBbUQ7WUFDbkQscUNBQXFDO1lBQ3JDLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLDhCQUE4QixDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUMvRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDdEIscUJBQXFCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFlBQVk7b0JBQzVELEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDL0IsS0FBSSxDQUFDLFlBQVksQ0FDYixrQkFBVyxDQUNQLHVCQUFxQixhQUFhLENBQUMsWUFBWSxDQUFDLGtDQUE2QixhQUFhLENBQUMsVUFBVSxDQUFDLE1BQUcsQ0FBQyxFQUM5RyxVQUFVLENBQUMsQ0FBQzt3QkFDaEIsTUFBTSxDQUFDO29CQUNULENBQUM7b0JBQ0QsSUFBTSxrQkFBa0IsR0FBRyxLQUFJLENBQUMsc0JBQXNCLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3JFLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNuQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQzt3QkFDbEQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7d0JBQzVDLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQ2xELENBQUM7b0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNyQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzt3QkFDN0MsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUNoRCxhQUFhLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7d0JBQ3ZDLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQ2xELENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ04sS0FBSSxDQUFDLFlBQVksQ0FDYixrQkFBVyxDQUNQLGdCQUFjLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsVUFBSyxhQUFhLENBQUMsWUFBWSxDQUFDLGtDQUE2QixhQUFhLENBQUMsVUFBVSxDQUFDLDREQUF5RCxDQUFDLEVBQ3ZNLFVBQVUsQ0FBQyxDQUFDO3dCQUNoQixNQUFNLENBQUM7b0JBQ1QsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7WUFFRCxJQUFNLGtCQUFrQixHQUFvQyxFQUFFLENBQUM7WUFDL0QsSUFBTSxhQUFhLEdBQW9DLEVBQUUsQ0FBQztZQUMxRCw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsVUFBQyxVQUFVO2dCQUM5QyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdELGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDcEMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3BELENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0QsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDL0IsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLEtBQUksQ0FBQyxZQUFZLENBQ2Isa0JBQVcsQ0FDUCxrQkFBZ0IsS0FBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBSSxhQUFhLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxjQUFTLGFBQWEsQ0FBQyxVQUFVLENBQUMsOENBQTJDLENBQUMsRUFDdEwsVUFBVSxDQUFDLENBQUM7b0JBQ2hCLE1BQU0sQ0FBQztnQkFDVCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCw4Q0FBOEM7WUFDOUMsOERBQThEO1lBQzlELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixTQUFTLENBQUMsSUFBSSxPQUFkLFNBQVMsbUJBQVMsSUFBSSxDQUFDLHFCQUFxQixDQUN4QyxJQUFJLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFDL0IsZ0NBQThCLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsR0FBRTtZQUNuRixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLGVBQWUsQ0FBQyxJQUFJLE9BQXBCLGVBQWUsbUJBQVMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztxQkFDekMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBRyxFQUF2QyxDQUF1QyxDQUFDLEdBQUU7WUFDbEYsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtvQkFDaEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN2QixLQUFJLENBQUMsWUFBWSxDQUNiLGtCQUFXLENBQ1AsdUJBQXFCLGFBQWEsQ0FBQyxJQUFJLENBQUMsb0RBQStDLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBRyxDQUFDLEVBQ3hILFVBQVUsQ0FBQyxDQUFDO3dCQUNoQixNQUFNLENBQUM7b0JBQ1QsQ0FBQztvQkFDRCxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzlELENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUVELGVBQWUsQ0FBQyxJQUFJLE9BQXBCLGVBQWUsbUJBQ1IsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUcsRUFBakQsQ0FBaUQsQ0FBQyxHQUFFO1lBRTNGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixPQUFPLENBQUMsSUFBSSxPQUFaLE9BQU8sbUJBQVMscUJBQXFCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFFO1lBQ3ZELENBQUM7WUFFRCxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsdUJBQXVCLENBQUM7Z0JBQzVDLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDO2dCQUN2QyxTQUFTLFdBQUE7Z0JBQ1QsZUFBZSxpQkFBQTtnQkFDZixtQkFBbUIscUJBQUE7Z0JBQ25CLE9BQU8sU0FBQTtnQkFDUCxrQkFBa0Isb0JBQUE7Z0JBQ2xCLGtCQUFrQixvQkFBQTtnQkFDbEIsYUFBYSxlQUFBO2dCQUNiLGFBQWEsZUFBQTtnQkFDYixlQUFlLGlCQUFBO2dCQUNmLGVBQWUsaUJBQUE7Z0JBQ2YsZ0JBQWdCLGtCQUFBO2dCQUNoQixFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJO2FBQ3BCLENBQUMsQ0FBQztZQUVILGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFLElBQUssT0FBQSxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsRUFBdEMsQ0FBc0MsQ0FBQyxDQUFDO1lBQ3hFLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRLElBQUssT0FBQSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQWEsQ0FBQyxJQUFJLENBQUMsRUFBMUQsQ0FBMEQsQ0FBQyxDQUFDO1lBQzVGLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDckIsQ0FBQztRQUVPLGtEQUFnQixHQUF4QixVQUF5QixVQUFnQixFQUFFLGtCQUF3QjtZQUNqRSxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsWUFBWSxDQUNiLGtCQUFXLENBQUMsTUFBSSxhQUFhLENBQUMsVUFBVSxDQUFDLGlDQUE4QixDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQzFGLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNmLENBQUM7UUFFTyxvREFBa0IsR0FBMUIsVUFBMkIsSUFBVTtZQUNuQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxDQUFDLFdBQVcsQ0FBQztnQkFDckIsQ0FBQztnQkFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEIsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDaEIsQ0FBQztnQkFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUIsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDbEIsQ0FBQztZQUNILENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBRSxJQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUNwQixDQUFDO1lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBR08sa0RBQWdCLEdBQXhCLFVBQXlCLElBQVUsRUFBRSxVQUFnQjtZQUNuRCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xELEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxTQUFTLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLFlBQVksQ0FDYixrQkFBVyxDQUNQLFVBQVEsYUFBYSxDQUFDLElBQUksQ0FBQyxtREFBOEMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxhQUFRLGFBQWEsQ0FBQyxVQUFVLENBQUMsT0FBSTtxQkFDdEksNEJBQTBCLGFBQWEsQ0FBQyxJQUFJLENBQUMseUNBQW9DLGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBUSxhQUFhLENBQUMsVUFBVSxDQUFDLE9BQUksQ0FBQTtxQkFDOUksa0VBQWdFLGFBQWEsQ0FBQyxJQUFJLENBQUMsc0NBQWlDLGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBUSxhQUFhLENBQUMsVUFBVSxDQUFDLE1BQUcsQ0FBQSxDQUFDLEVBQ3JMLFVBQVUsQ0FBQyxDQUFDO2dCQUNoQixNQUFNLENBQUM7WUFDVCxDQUFDO1lBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVPLGdFQUE4QixHQUF0QyxVQUNJLGVBQTZDLEVBQzdDLGVBQTZDO1lBQy9DLHFGQUFxRjtZQUNyRixJQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDO1lBQzNELElBQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1lBQ2hELGVBQWUsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsVUFBVTtnQkFDekQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFHLElBQUssT0FBQSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUM7Z0JBQzNELFVBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxJQUFLLE9BQUEsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUE5QixDQUE4QixDQUFDLENBQUM7Z0JBQzdFLElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFPLENBQUM7Z0JBQ25DLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztvQkFDakMsSUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUMxRCxJQUFJLFdBQVcsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMvQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7d0JBQ2pCLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBTyxDQUFDO3dCQUM3QixjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztvQkFDNUMsQ0FBQztvQkFDRCxJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztvQkFDekMseUVBQXlFO29CQUN6RSx1RUFBdUU7b0JBQ3ZFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDN0QsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDM0IsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDMUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDbkQsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFVBQVU7Z0JBQ2pDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFLElBQUssT0FBQSxNQUFNLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLEVBQS9CLENBQStCLENBQUMsQ0FBQztnQkFDL0UsVUFBVSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFLElBQUssT0FBQSxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFDLENBQUM7WUFDSCxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUMsVUFBVTtnQkFDakMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQUUsSUFBSyxPQUFBLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztnQkFDdkUsVUFBVSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFLElBQUssT0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFFTyx3REFBc0IsR0FBOUIsVUFBK0IsSUFBVTtZQUN2QyxJQUFJLEdBQUcsd0JBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCw4Q0FBWSxHQUFaLFVBQWEsSUFBUztZQUNwQixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLHVCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFRCxzREFBb0IsR0FBcEIsVUFBcUIsSUFBUztZQUM1QixNQUFNLENBQUM7Z0JBQ0wsV0FBVyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVO2dCQUM5QyxJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO2FBQy9DLENBQUM7UUFDSixDQUFDO1FBRUQsdURBQXFCLEdBQXJCLFVBQ0ksSUFBUyxFQUFFLFlBQStCLEVBQzFDLGtCQUFrQztZQUR2Qiw2QkFBQSxFQUFBLG1CQUErQjtZQUMxQyxtQ0FBQSxFQUFBLHlCQUFrQztZQUNwQyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0UsSUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLENBQUM7Z0JBQzlCLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUVsRSxJQUFNLFdBQVcsR0FDYixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSx1QkFBZ0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQTlCLENBQThCLENBQUMsQ0FBQztZQUVwRixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBRUQsSUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakQsTUFBTSxDQUFDO2dCQUNMLE1BQU0sRUFBRSxJQUFJO2dCQUNaLElBQUksRUFBRSxZQUFZO2dCQUNsQixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQzNCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUN2QixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzdCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDM0IsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQ2hCLENBQUM7UUFDSixDQUFDO1FBRU8sa0RBQWdCLEdBQXhCLFVBQXlCLElBQVUsRUFBRSxZQUErQixFQUFFLGtCQUF5QjtZQUExRCw2QkFBQSxFQUFBLG1CQUErQjtZQUFFLG1DQUFBLEVBQUEseUJBQXlCO1lBRTdGLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUM7Z0JBQ0wsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTO2dCQUMvQixNQUFNLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLGtCQUFrQixDQUFDO2dCQUM3RixjQUFjLEVBQUUsMENBQW9CLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDO2FBQzVFLENBQUM7UUFDSixDQUFDO1FBRU8scURBQW1CLEdBQTNCLFVBQTRCLE9BQWlCLEVBQUUsWUFBK0I7WUFBL0IsNkJBQUEsRUFBQSxtQkFBK0I7WUFFNUUsT0FBTyxHQUFHLHdCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLEVBQUMsQ0FBQztRQUM1RixDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsaURBQWUsR0FBZixVQUFnQixRQUFhO1lBQzNCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDZCxJQUFJLENBQUMsWUFBWSxDQUNiLGtCQUFXLENBQ1Asc0lBQW9JLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBRyxDQUFDLEVBQ25LLFFBQVEsQ0FBQyxDQUFDO1lBQ2hCLENBQUM7WUFDRCxNQUFNLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQztRQUMxQixDQUFDO1FBRUQsZ0RBQWMsR0FBZCxVQUFlLFFBQWE7WUFDMUIsSUFBTSxXQUFXLEdBQ1csSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JGLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLFlBQVksQ0FDYixrQkFBVyxDQUNQLHdEQUFzRCxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQUcsQ0FBQyxFQUNyRixRQUFRLENBQUMsQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNyQixDQUFDO1FBRUQsdURBQXFCLEdBQXJCLFVBQXNCLFFBQWE7WUFDakMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNkLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsQ0FBQztZQUNELE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDbEIsQ0FBQztRQUVPLG1EQUFpQixHQUF6QixVQUEwQixRQUFhO1lBQ3JDLFFBQVEsR0FBRyx3QkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2QyxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUcsQ0FBQztZQUU5RCxJQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztnQkFDM0MsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7Z0JBQ3JDLElBQUksRUFBRSxjQUFjLENBQUMsSUFBSTtnQkFDekIsSUFBSSxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSTthQUM1QixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDbEIsQ0FBQztRQUVPLDBEQUF3QixHQUFoQyxVQUNJLFVBQXlCLEVBQUUsWUFBd0IsRUFDbkQsa0JBQXlCO1lBRjdCLGlCQW1FQztZQWpFRyxtQ0FBQSxFQUFBLHlCQUF5QjtZQUMzQixJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBTSxNQUFNLEdBQUcsWUFBWSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUU1RSxJQUFNLG9CQUFvQixHQUFzQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSztnQkFDL0UsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO2dCQUN4QixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7Z0JBQ25CLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDbkIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUN2QixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7Z0JBQ3ZCLElBQUksS0FBSyxHQUFRLElBQUksQ0FBQztnQkFDdEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxVQUFVO3dCQUN2QixFQUFFLENBQUMsQ0FBQyxpQkFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3BDLE1BQU0sR0FBRyxJQUFJLENBQUM7d0JBQ2hCLENBQUM7d0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGlCQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDM0MsTUFBTSxHQUFHLElBQUksQ0FBQzt3QkFDaEIsQ0FBQzt3QkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMscUJBQWMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMvQyxVQUFVLEdBQUcsSUFBSSxDQUFDO3dCQUNwQixDQUFDO3dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxxQkFBYyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQy9DLFVBQVUsR0FBRyxJQUFJLENBQUM7d0JBQ3BCLENBQUM7d0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHNCQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDaEQsV0FBVyxHQUFHLElBQUksQ0FBQzs0QkFDbkIsS0FBSyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7d0JBQ25DLENBQUM7d0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLG1CQUFZLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDN0MsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7d0JBQzNCLENBQUM7d0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUNOLDJCQUFvQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLFlBQVksNEJBQVksQ0FBQyxDQUFDLENBQUM7NEJBQ3BGLEtBQUssR0FBRyxVQUFVLENBQUM7d0JBQ3JCLENBQUM7d0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDcEQsS0FBSyxHQUFHLFVBQVUsQ0FBQzt3QkFDckIsQ0FBQztvQkFDSCxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLGNBQWMsR0FBRyxJQUFJLENBQUM7b0JBQ3RCLE1BQU0sQ0FBQyxJQUFNLENBQUM7Z0JBQ2hCLENBQUM7Z0JBRUQsTUFBTSxDQUFDO29CQUNMLFdBQVcsYUFBQTtvQkFDWCxNQUFNLFFBQUE7b0JBQ04sTUFBTSxRQUFBO29CQUNOLFVBQVUsWUFBQTtvQkFDVixVQUFVLFlBQUE7b0JBQ1YsS0FBSyxFQUFFLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7aUJBQ3JDLENBQUM7WUFFSixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLElBQU0sVUFBVSxHQUNaLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxVQUFDLEdBQUcsSUFBSyxPQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFwQyxDQUFvQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2RixJQUFNLE9BQU8sR0FDVCxzQ0FBb0MsYUFBYSxDQUFDLFVBQVUsQ0FBQyxXQUFNLFVBQVUsT0FBSSxDQUFDO2dCQUN0RixFQUFFLENBQUMsQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztvQkFDakUsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUN0RCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQVksT0FBTywrQ0FBNEMsQ0FBQyxDQUFDO2dCQUN0RixDQUFDO1lBQ0gsQ0FBQztZQUVELE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztRQUM5QixDQUFDO1FBRU8sbURBQWlCLEdBQXpCLFVBQTBCLEtBQVU7WUFDbEMsS0FBSyxHQUFHLHdCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLElBQUksWUFBc0MsQ0FBQztZQUMzQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixZQUFZLEdBQUcsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUM7WUFDaEMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLFlBQVksR0FBRyxFQUFDLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUMsRUFBQyxDQUFDO1lBQ2xELENBQUM7WUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQ3RCLENBQUM7UUFFTyx1REFBcUIsR0FBN0IsVUFDSSxTQUFxQixFQUFFLHFCQUEwRCxFQUNqRixTQUFrQixFQUFFLGdCQUFvRCxFQUN4RSxJQUFVO1lBSGQsaUJBaURDO1lBL0N1QixpQ0FBQSxFQUFBLHFCQUFvRDtZQUUxRSxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBYSxFQUFFLFdBQW1CO2dCQUNuRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUIsS0FBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFDM0YsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixRQUFRLEdBQUcsd0JBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3ZDLElBQUksWUFBWSxHQUFxQixTQUFXLENBQUM7b0JBQ2pELEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ25GLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDakMsWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNsRSxDQUFDO29CQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxZQUFZLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO29CQUN0RSxDQUFDO29CQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMvQixLQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFXLENBQ3pCLHdJQUF3SSxDQUFDLENBQUMsQ0FBQzt3QkFDL0ksTUFBTSxDQUFDO29CQUNULENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ04sSUFBTSxhQUFhLEdBQ0osU0FBUyxDQUFDLE1BQU0sQ0FDdEIsVUFBQyxLQUFlLEVBQUUsWUFBaUIsRUFBRSxlQUF1Qjs0QkFDMUQsRUFBRSxDQUFDLENBQUMsZUFBZSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0NBQ2xDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBRyxhQUFhLENBQUMsWUFBWSxDQUFHLENBQUMsQ0FBQzs0QkFDL0MsQ0FBQzs0QkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0NBQzFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBSSxhQUFhLENBQUMsWUFBWSxDQUFDLE1BQUcsQ0FBQyxDQUFDOzRCQUNqRCxDQUFDOzRCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzlDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ3BCLENBQUM7NEJBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQzt3QkFDZixDQUFDLEVBQ0QsRUFBRSxDQUFFOzZCQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDcEIsS0FBSSxDQUFDLFlBQVksQ0FDYixrQkFBVyxDQUNQLGNBQVcsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsbUVBQTZELGFBQWEsTUFBRyxDQUFDLEVBQy9ILElBQUksQ0FBQyxDQUFDO3dCQUNWLE1BQU0sQ0FBQztvQkFDVCxDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLO3dCQUNsQixLQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLHlCQUFXLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3ZGLHFCQUFxQixDQUFDLElBQUksT0FBMUIscUJBQXFCLG1CQUFTLEtBQUksQ0FBQywrQkFBK0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEdBQUU7b0JBQzFGLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ04sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUNoRSxDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUMxQixDQUFDO1FBRU8sbURBQWlCLEdBQXpCLFVBQTBCLFFBQWE7WUFDckMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQVcsQ0FDekIsMEJBQXdCLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLDZCQUF3QixRQUFRLENBQUMsUUFBUSwrTkFHeEIsQ0FBQyxDQUFDLENBQUM7WUFDakYsQ0FBQztRQUNILENBQUM7UUFFTyxpRUFBK0IsR0FBdkMsVUFBd0MsUUFBMEIsRUFBRSxJQUFVO1lBQTlFLGlCQTBCQztZQXhCQyxJQUFNLFVBQVUsR0FBd0MsRUFBRSxDQUFDO1lBQzNELElBQU0sb0JBQW9CLEdBQW9DLEVBQUUsQ0FBQztZQUVqRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxZQUFZLENBQ2Isa0JBQVcsQ0FBQyxnRUFBZ0UsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN6RixNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ1osQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxZQUFZLENBQ2Isa0JBQVcsQ0FBQyxzRUFBc0UsQ0FBQyxFQUNuRixJQUFJLENBQUMsQ0FBQztnQkFDVixNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ1osQ0FBQztZQUVELGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUM1RCxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxVQUFVO2dCQUN0QyxJQUFNLEtBQUssR0FBRyxLQUFJLENBQUMsMEJBQTBCLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0UsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDVixVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BCLENBQUM7UUFFTyw0REFBMEIsR0FBbEMsVUFBbUMsT0FBWSxFQUFFLGVBQXNCO1lBQXRCLGdDQUFBLEVBQUEsc0JBQXNCO1lBRXJFLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoRSxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsRUFBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsZ0JBQWtCLEVBQUMsQ0FBQztZQUN6RixDQUFDO1lBQ0QsSUFBTSxVQUFVLEdBQ2lCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5RixFQUFFLENBQUMsQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sQ0FBQyxFQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLGdCQUFrQixFQUFDLENBQUM7WUFDbkYsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sa0JBQVcsQ0FBSSxPQUFPLENBQUMsSUFBSSwyQ0FBd0MsQ0FBQyxDQUFDO1lBQzdFLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVPLDREQUEwQixHQUFsQyxVQUFtQyxJQUFVLEVBQUUsWUFBK0I7WUFBL0IsNkJBQUEsRUFBQSxtQkFBK0I7WUFFNUUsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9FLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQzFCLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQscURBQW1CLEdBQW5CLFVBQW9CLFFBQTBCO1lBQzVDLElBQUksV0FBVyxHQUFzQyxTQUFXLENBQUM7WUFDakUsSUFBSSxtQkFBbUIsR0FBNEIsSUFBTSxDQUFDO1lBQzFELElBQUksc0JBQXNCLEdBQStCLElBQU0sQ0FBQztZQUNoRSxJQUFJLEtBQUssR0FBNkIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU3RSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsbUJBQW1CO29CQUNmLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDOUUsV0FBVyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztnQkFDekMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDekMsaUZBQWlGO29CQUNqRixLQUFLLEdBQUcsRUFBQyxVQUFVLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQztnQkFDNUMsQ0FBQztZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLHNCQUFzQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDOUYsV0FBVyxHQUFHLHNCQUFzQixDQUFDLE1BQU0sQ0FBQztZQUM5QyxDQUFDO1lBRUQsTUFBTSxDQUFDO2dCQUNMLEtBQUssRUFBRSxLQUFLO2dCQUNaLFFBQVEsRUFBRSxtQkFBbUI7Z0JBQzdCLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtnQkFDM0IsVUFBVSxFQUFFLHNCQUFzQjtnQkFDbEMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7Z0JBQzVGLElBQUksRUFBRSxXQUFXO2dCQUNqQixLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7YUFDdEIsQ0FBQztRQUNKLENBQUM7UUFFTyxxREFBbUIsR0FBM0IsVUFDSSxPQUErQixFQUFFLFdBQW9CLEVBQ3JELGFBQW1CO1lBRnZCLGlCQWFDO1lBVkMsSUFBTSxHQUFHLEdBQStCLEVBQUUsQ0FBQztZQUUzQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFlBQW9CO2dCQUNoRCxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDdEMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUN2RSxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2IsQ0FBQztRQUVPLG1EQUFpQixHQUF6QixVQUEwQixRQUFhLElBQWMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhGLG1EQUFpQixHQUF6QixVQUEwQixDQUFRLEVBQUUsWUFBb0IsRUFBRSxVQUF5QjtZQUFuRixpQkF3QkM7WUF0QkMsSUFBSSxTQUFxQyxDQUFDO1lBQzFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxTQUFTO29CQUNMLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsS0FBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxFQUEvQixDQUErQixDQUFDLENBQUM7WUFDekYsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxZQUFZLENBQ2Isa0JBQVcsQ0FDUCxnREFBNkMsWUFBWSxnQkFBUyxhQUFhLENBQUMsVUFBVSxDQUFDLGdEQUE0QyxDQUFDLEVBQzVJLFVBQVUsQ0FBQyxDQUFDO29CQUNoQixTQUFTLEdBQUcsRUFBRSxDQUFDO2dCQUNqQixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztZQUNILENBQUM7WUFFRCxNQUFNLENBQUM7Z0JBQ0wsU0FBUyxXQUFBO2dCQUNULEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztnQkFDZCxXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxZQUFZLGNBQUE7Z0JBQ3hDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFNO2FBQ3ZELENBQUM7UUFDSixDQUFDO1FBRU8sOENBQVksR0FBcEIsVUFBcUIsS0FBVSxFQUFFLElBQVUsRUFBRSxTQUFlO1lBQzFELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbEMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDZCxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDekMsQ0FBQztZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLEtBQUssQ0FBQztZQUNkLENBQUM7UUFDSCxDQUFDO1FBQ0gsOEJBQUM7SUFBRCxDQUFDLEFBbG5DRCxJQWtuQ0M7SUFsbkNZLDBEQUF1QjtJQW9uQ3BDLHNCQUFzQixJQUFXLEVBQUUsR0FBb0I7UUFBcEIsb0JBQUEsRUFBQSxRQUFvQjtRQUNyRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1QsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3JDLElBQU0sSUFBSSxHQUFHLHdCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEIsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDMUIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVELHFCQUFxQixLQUFZO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDVixNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFDRCxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVELCtCQUErQixJQUFXO1FBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELHFCQUFxQixLQUFVO1FBQzdCLE1BQU0sQ0FBQyxDQUFDLEtBQUssWUFBWSw0QkFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksV0FBSSxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVELDRCQUE0QixLQUFVLEVBQUUsaUJBQWtEO1FBQ3hGLGlCQUFVLENBQUMsS0FBSyxFQUFFLElBQUksc0JBQXNCLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRDtRQUFxQyxrREFBZ0I7UUFBckQ7O1FBSUEsQ0FBQztRQUhDLDJDQUFVLEdBQVYsVUFBVyxLQUFVLEVBQUUsaUJBQWtEO1lBQ3ZFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFDSCw2QkFBQztJQUFELENBQUMsQUFKRCxDQUFxQyx1QkFBZ0IsR0FJcEQ7SUFFRCx1QkFBdUIsSUFBUztRQUM5QixFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksNEJBQVksQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFJLElBQUksQ0FBQyxJQUFJLFlBQU8sSUFBSSxDQUFDLFFBQVUsQ0FBQztRQUM1QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsb0NBQW9DLFFBQWM7UUFDaEQsSUFBTSxLQUFLLEdBQ1AsS0FBSyxDQUFDLG9DQUFrQyxnQkFBUyxDQUFDLFFBQVEsQ0FBQyw0QkFBeUIsQ0FBQyxDQUFDO1FBQ3pGLEtBQWEsQ0FBQyw0QkFBb0IsQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUNoRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdGF0aWNTeW1ib2wsIFN0YXRpY1N5bWJvbENhY2hlfSBmcm9tICcuL2FvdC9zdGF0aWNfc3ltYm9sJztcbmltcG9ydCB7bmdmYWN0b3J5RmlsZVBhdGh9IGZyb20gJy4vYW90L3V0aWwnO1xuaW1wb3J0IHthc3NlcnRBcnJheU9mU3RyaW5ncywgYXNzZXJ0SW50ZXJwb2xhdGlvblN5bWJvbHN9IGZyb20gJy4vYXNzZXJ0aW9ucyc7XG5pbXBvcnQgKiBhcyBjcGwgZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7Q29tcGlsZVJlZmxlY3Rvcn0gZnJvbSAnLi9jb21waWxlX3JlZmxlY3Rvcic7XG5pbXBvcnQge0NvbXBpbGVyQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDb21wb25lbnQsIERpcmVjdGl2ZSwgSW5qZWN0YWJsZSwgTW9kdWxlV2l0aFByb3ZpZGVycywgUHJvdmlkZXIsIFF1ZXJ5LCBTY2hlbWFNZXRhZGF0YSwgVHlwZSwgVmlld0VuY2Fwc3VsYXRpb24sIGNyZWF0ZUF0dHJpYnV0ZSwgY3JlYXRlQ29tcG9uZW50LCBjcmVhdGVIb3N0LCBjcmVhdGVJbmplY3QsIGNyZWF0ZUluamVjdGFibGUsIGNyZWF0ZUluamVjdGlvblRva2VuLCBjcmVhdGVOZ01vZHVsZSwgY3JlYXRlT3B0aW9uYWwsIGNyZWF0ZVNlbGYsIGNyZWF0ZVNraXBTZWxmfSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3RpdmVOb3JtYWxpemVyfSBmcm9tICcuL2RpcmVjdGl2ZV9ub3JtYWxpemVyJztcbmltcG9ydCB7RGlyZWN0aXZlUmVzb2x2ZXIsIGZpbmRMYXN0fSBmcm9tICcuL2RpcmVjdGl2ZV9yZXNvbHZlcic7XG5pbXBvcnQge0lkZW50aWZpZXJzfSBmcm9tICcuL2lkZW50aWZpZXJzJztcbmltcG9ydCB7Z2V0QWxsTGlmZWN5Y2xlSG9va3N9IGZyb20gJy4vbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJy4vbWxfcGFyc2VyL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7TmdNb2R1bGVSZXNvbHZlcn0gZnJvbSAnLi9uZ19tb2R1bGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtQaXBlUmVzb2x2ZXJ9IGZyb20gJy4vcGlwZV9yZXNvbHZlcic7XG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi9zY2hlbWEvZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnLi9zZWxlY3Rvcic7XG5pbXBvcnQge1N1bW1hcnlSZXNvbHZlcn0gZnJvbSAnLi9zdW1tYXJ5X3Jlc29sdmVyJztcbmltcG9ydCB7Q29uc29sZSwgU3luY0FzeW5jLCBWYWx1ZVRyYW5zZm9ybWVyLCBpc1Byb21pc2UsIG5vVW5kZWZpbmVkLCByZXNvbHZlRm9yd2FyZFJlZiwgc3RyaW5naWZ5LCBzeW50YXhFcnJvciwgdmlzaXRWYWx1ZX0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IHR5cGUgRXJyb3JDb2xsZWN0b3IgPSAoZXJyb3I6IGFueSwgdHlwZT86IGFueSkgPT4gdm9pZDtcblxuZXhwb3J0IGNvbnN0IEVSUk9SX0NPTVBPTkVOVF9UWVBFID0gJ25nQ29tcG9uZW50VHlwZSc7XG5cbi8vIERlc2lnbiBub3Rlczpcbi8vIC0gZG9uJ3QgbGF6aWx5IGNyZWF0ZSBtZXRhZGF0YTpcbi8vICAgRm9yIHNvbWUgbWV0YWRhdGEsIHdlIG5lZWQgdG8gZG8gYXN5bmMgd29yayBzb21ldGltZXMsXG4vLyAgIHNvIHRoZSB1c2VyIGhhcyB0byBraWNrIG9mZiB0aGlzIGxvYWRpbmcuXG4vLyAgIEJ1dCB3ZSB3YW50IHRvIHJlcG9ydCBlcnJvcnMgZXZlbiB3aGVuIHRoZSBhc3luYyB3b3JrIGlzXG4vLyAgIG5vdCByZXF1aXJlZCB0byBjaGVjayB0aGF0IHRoZSB1c2VyIHdvdWxkIGhhdmUgYmVlbiBhYmxlXG4vLyAgIHRvIHdhaXQgY29ycmVjdGx5LlxuZXhwb3J0IGNsYXNzIENvbXBpbGVNZXRhZGF0YVJlc29sdmVyIHtcbiAgcHJpdmF0ZSBfbm9uTm9ybWFsaXplZERpcmVjdGl2ZUNhY2hlID1cbiAgICAgIG5ldyBNYXA8VHlwZSwge2Fubm90YXRpb246IERpcmVjdGl2ZSwgbWV0YWRhdGE6IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGF9PigpO1xuICBwcml2YXRlIF9kaXJlY3RpdmVDYWNoZSA9IG5ldyBNYXA8VHlwZSwgY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YT4oKTtcbiAgcHJpdmF0ZSBfc3VtbWFyeUNhY2hlID0gbmV3IE1hcDxUeXBlLCBjcGwuQ29tcGlsZVR5cGVTdW1tYXJ5fG51bGw+KCk7XG4gIHByaXZhdGUgX3BpcGVDYWNoZSA9IG5ldyBNYXA8VHlwZSwgY3BsLkNvbXBpbGVQaXBlTWV0YWRhdGE+KCk7XG4gIHByaXZhdGUgX25nTW9kdWxlQ2FjaGUgPSBuZXcgTWFwPFR5cGUsIGNwbC5Db21waWxlTmdNb2R1bGVNZXRhZGF0YT4oKTtcbiAgcHJpdmF0ZSBfbmdNb2R1bGVPZlR5cGVzID0gbmV3IE1hcDxUeXBlLCBUeXBlPigpO1xuICBwcml2YXRlIF9zaGFsbG93TW9kdWxlQ2FjaGUgPSBuZXcgTWFwPFR5cGUsIGNwbC5Db21waWxlU2hhbGxvd01vZHVsZU1ldGFkYXRhPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfY29uZmlnOiBDb21waWxlckNvbmZpZywgcHJpdmF0ZSBfaHRtbFBhcnNlcjogSHRtbFBhcnNlcixcbiAgICAgIHByaXZhdGUgX25nTW9kdWxlUmVzb2x2ZXI6IE5nTW9kdWxlUmVzb2x2ZXIsIHByaXZhdGUgX2RpcmVjdGl2ZVJlc29sdmVyOiBEaXJlY3RpdmVSZXNvbHZlcixcbiAgICAgIHByaXZhdGUgX3BpcGVSZXNvbHZlcjogUGlwZVJlc29sdmVyLCBwcml2YXRlIF9zdW1tYXJ5UmVzb2x2ZXI6IFN1bW1hcnlSZXNvbHZlcjxhbnk+LFxuICAgICAgcHJpdmF0ZSBfc2NoZW1hUmVnaXN0cnk6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSxcbiAgICAgIHByaXZhdGUgX2RpcmVjdGl2ZU5vcm1hbGl6ZXI6IERpcmVjdGl2ZU5vcm1hbGl6ZXIsIHByaXZhdGUgX2NvbnNvbGU6IENvbnNvbGUsXG4gICAgICBwcml2YXRlIF9zdGF0aWNTeW1ib2xDYWNoZTogU3RhdGljU3ltYm9sQ2FjaGUsIHByaXZhdGUgX3JlZmxlY3RvcjogQ29tcGlsZVJlZmxlY3RvcixcbiAgICAgIHByaXZhdGUgX2Vycm9yQ29sbGVjdG9yPzogRXJyb3JDb2xsZWN0b3IpIHt9XG5cbiAgZ2V0UmVmbGVjdG9yKCk6IENvbXBpbGVSZWZsZWN0b3IgeyByZXR1cm4gdGhpcy5fcmVmbGVjdG9yOyB9XG5cbiAgY2xlYXJDYWNoZUZvcih0eXBlOiBUeXBlKSB7XG4gICAgY29uc3QgZGlyTWV0YSA9IHRoaXMuX2RpcmVjdGl2ZUNhY2hlLmdldCh0eXBlKTtcbiAgICB0aGlzLl9kaXJlY3RpdmVDYWNoZS5kZWxldGUodHlwZSk7XG4gICAgdGhpcy5fbm9uTm9ybWFsaXplZERpcmVjdGl2ZUNhY2hlLmRlbGV0ZSh0eXBlKTtcbiAgICB0aGlzLl9zdW1tYXJ5Q2FjaGUuZGVsZXRlKHR5cGUpO1xuICAgIHRoaXMuX3BpcGVDYWNoZS5kZWxldGUodHlwZSk7XG4gICAgdGhpcy5fbmdNb2R1bGVPZlR5cGVzLmRlbGV0ZSh0eXBlKTtcbiAgICAvLyBDbGVhciBhbGwgb2YgdGhlIE5nTW9kdWxlIGFzIHRoZXkgY29udGFpbiB0cmFuc2l0aXZlIGluZm9ybWF0aW9uIVxuICAgIHRoaXMuX25nTW9kdWxlQ2FjaGUuY2xlYXIoKTtcbiAgICBpZiAoZGlyTWV0YSkge1xuICAgICAgdGhpcy5fZGlyZWN0aXZlTm9ybWFsaXplci5jbGVhckNhY2hlRm9yKGRpck1ldGEpO1xuICAgIH1cbiAgfVxuXG4gIGNsZWFyQ2FjaGUoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlyZWN0aXZlQ2FjaGUuY2xlYXIoKTtcbiAgICB0aGlzLl9ub25Ob3JtYWxpemVkRGlyZWN0aXZlQ2FjaGUuY2xlYXIoKTtcbiAgICB0aGlzLl9zdW1tYXJ5Q2FjaGUuY2xlYXIoKTtcbiAgICB0aGlzLl9waXBlQ2FjaGUuY2xlYXIoKTtcbiAgICB0aGlzLl9uZ01vZHVsZUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fbmdNb2R1bGVPZlR5cGVzLmNsZWFyKCk7XG4gICAgdGhpcy5fZGlyZWN0aXZlTm9ybWFsaXplci5jbGVhckNhY2hlKCk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVQcm94eUNsYXNzKGJhc2VUeXBlOiBhbnksIG5hbWU6IHN0cmluZyk6IGNwbC5Qcm94eUNsYXNzIHtcbiAgICBsZXQgZGVsZWdhdGU6IGFueSA9IG51bGw7XG4gICAgY29uc3QgcHJveHlDbGFzczogY3BsLlByb3h5Q2xhc3MgPSA8YW55PmZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFkZWxlZ2F0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgSWxsZWdhbCBzdGF0ZTogQ2xhc3MgJHtuYW1lfSBmb3IgdHlwZSAke3N0cmluZ2lmeShiYXNlVHlwZSl9IGlzIG5vdCBjb21waWxlZCB5ZXQhYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVsZWdhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICAgIHByb3h5Q2xhc3Muc2V0RGVsZWdhdGUgPSAoZCkgPT4ge1xuICAgICAgZGVsZWdhdGUgPSBkO1xuICAgICAgKDxhbnk+cHJveHlDbGFzcykucHJvdG90eXBlID0gZC5wcm90b3R5cGU7XG4gICAgfTtcbiAgICAvLyBNYWtlIHN0cmluZ2lmeSB3b3JrIGNvcnJlY3RseVxuICAgICg8YW55PnByb3h5Q2xhc3MpLm92ZXJyaWRkZW5OYW1lID0gbmFtZTtcbiAgICByZXR1cm4gcHJveHlDbGFzcztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0R2VuZXJhdGVkQ2xhc3MoZGlyVHlwZTogYW55LCBuYW1lOiBzdHJpbmcpOiBTdGF0aWNTeW1ib2x8Y3BsLlByb3h5Q2xhc3Mge1xuICAgIGlmIChkaXJUeXBlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RhdGljU3ltYm9sQ2FjaGUuZ2V0KG5nZmFjdG9yeUZpbGVQYXRoKGRpclR5cGUuZmlsZVBhdGgpLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVByb3h5Q2xhc3MoZGlyVHlwZSwgbmFtZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRDb21wb25lbnRWaWV3Q2xhc3MoZGlyVHlwZTogYW55KTogU3RhdGljU3ltYm9sfGNwbC5Qcm94eUNsYXNzIHtcbiAgICByZXR1cm4gdGhpcy5nZXRHZW5lcmF0ZWRDbGFzcyhkaXJUeXBlLCBjcGwudmlld0NsYXNzTmFtZShkaXJUeXBlLCAwKSk7XG4gIH1cblxuICBnZXRIb3N0Q29tcG9uZW50Vmlld0NsYXNzKGRpclR5cGU6IGFueSk6IFN0YXRpY1N5bWJvbHxjcGwuUHJveHlDbGFzcyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0R2VuZXJhdGVkQ2xhc3MoZGlyVHlwZSwgY3BsLmhvc3RWaWV3Q2xhc3NOYW1lKGRpclR5cGUpKTtcbiAgfVxuXG4gIGdldEhvc3RDb21wb25lbnRUeXBlKGRpclR5cGU6IGFueSk6IFN0YXRpY1N5bWJvbHxUeXBlIHtcbiAgICBjb25zdCBuYW1lID0gYCR7Y3BsLmlkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IGRpclR5cGV9KX1fSG9zdGA7XG4gICAgaWYgKGRpclR5cGUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdGF0aWNTeW1ib2xDYWNoZS5nZXQoZGlyVHlwZS5maWxlUGF0aCwgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IEhvc3RDbGFzcyA9IDxhbnk+ZnVuY3Rpb24gSG9zdENsYXNzKCkge307XG4gICAgICBIb3N0Q2xhc3Mub3ZlcnJpZGRlbk5hbWUgPSBuYW1lO1xuXG4gICAgICByZXR1cm4gSG9zdENsYXNzO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmVuZGVyZXJUeXBlKGRpclR5cGU6IGFueSk6IFN0YXRpY1N5bWJvbHxvYmplY3Qge1xuICAgIGlmIChkaXJUeXBlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RhdGljU3ltYm9sQ2FjaGUuZ2V0KFxuICAgICAgICAgIG5nZmFjdG9yeUZpbGVQYXRoKGRpclR5cGUuZmlsZVBhdGgpLCBjcGwucmVuZGVyZXJUeXBlTmFtZShkaXJUeXBlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHJldHVybmluZyBhbiBvYmplY3QgYXMgcHJveHksXG4gICAgICAvLyB0aGF0IHdlIGZpbGwgbGF0ZXIgZHVyaW5nIHJ1bnRpbWUgY29tcGlsYXRpb24uXG4gICAgICByZXR1cm4gPGFueT57fTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldENvbXBvbmVudEZhY3RvcnkoXG4gICAgICBzZWxlY3Rvcjogc3RyaW5nLCBkaXJUeXBlOiBhbnksIGlucHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ318bnVsbCxcbiAgICAgIG91dHB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogU3RhdGljU3ltYm9sfG9iamVjdCB7XG4gICAgaWYgKGRpclR5cGUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdGF0aWNTeW1ib2xDYWNoZS5nZXQoXG4gICAgICAgICAgbmdmYWN0b3J5RmlsZVBhdGgoZGlyVHlwZS5maWxlUGF0aCksIGNwbC5jb21wb25lbnRGYWN0b3J5TmFtZShkaXJUeXBlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGhvc3RWaWV3ID0gdGhpcy5nZXRIb3N0Q29tcG9uZW50Vmlld0NsYXNzKGRpclR5cGUpO1xuICAgICAgLy8gTm90ZTogbmdDb250ZW50U2VsZWN0b3JzIHdpbGwgYmUgZmlsbGVkIGxhdGVyIG9uY2UgdGhlIHRlbXBsYXRlIGlzXG4gICAgICAvLyBsb2FkZWQuXG4gICAgICBjb25zdCBjcmVhdGVDb21wb25lbnRGYWN0b3J5ID1cbiAgICAgICAgICB0aGlzLl9yZWZsZWN0b3IucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKElkZW50aWZpZXJzLmNyZWF0ZUNvbXBvbmVudEZhY3RvcnkpO1xuICAgICAgcmV0dXJuIGNyZWF0ZUNvbXBvbmVudEZhY3Rvcnkoc2VsZWN0b3IsIGRpclR5cGUsIDxhbnk+aG9zdFZpZXcsIGlucHV0cywgb3V0cHV0cywgW10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5pdENvbXBvbmVudEZhY3RvcnkoZmFjdG9yeTogU3RhdGljU3ltYm9sfG9iamVjdCwgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSkge1xuICAgIGlmICghKGZhY3RvcnkgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpKSB7XG4gICAgICAoZmFjdG9yeSBhcyBhbnkpLm5nQ29udGVudFNlbGVjdG9ycy5wdXNoKC4uLm5nQ29udGVudFNlbGVjdG9ycyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfbG9hZFN1bW1hcnkodHlwZTogYW55LCBraW5kOiBjcGwuQ29tcGlsZVN1bW1hcnlLaW5kKTogY3BsLkNvbXBpbGVUeXBlU3VtbWFyeXxudWxsIHtcbiAgICBsZXQgdHlwZVN1bW1hcnkgPSB0aGlzLl9zdW1tYXJ5Q2FjaGUuZ2V0KHR5cGUpO1xuICAgIGlmICghdHlwZVN1bW1hcnkpIHtcbiAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLl9zdW1tYXJ5UmVzb2x2ZXIucmVzb2x2ZVN1bW1hcnkodHlwZSk7XG4gICAgICB0eXBlU3VtbWFyeSA9IHN1bW1hcnkgPyBzdW1tYXJ5LnR5cGUgOiBudWxsO1xuICAgICAgdGhpcy5fc3VtbWFyeUNhY2hlLnNldCh0eXBlLCB0eXBlU3VtbWFyeSB8fCBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVTdW1tYXJ5ICYmIHR5cGVTdW1tYXJ5LnN1bW1hcnlLaW5kID09PSBraW5kID8gdHlwZVN1bW1hcnkgOiBudWxsO1xuICB9XG5cbiAgZ2V0SG9zdENvbXBvbmVudE1ldGFkYXRhKFxuICAgICAgY29tcE1ldGE6IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICBob3N0Vmlld1R5cGU/OiBTdGF0aWNTeW1ib2x8Y3BsLlByb3h5Q2xhc3MpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICBjb25zdCBob3N0VHlwZSA9IHRoaXMuZ2V0SG9zdENvbXBvbmVudFR5cGUoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UpO1xuICAgIGlmICghaG9zdFZpZXdUeXBlKSB7XG4gICAgICBob3N0Vmlld1R5cGUgPSB0aGlzLmdldEhvc3RDb21wb25lbnRWaWV3Q2xhc3MoaG9zdFR5cGUpO1xuICAgIH1cbiAgICAvLyBOb3RlOiAhIGlzIG9rIGhlcmUgYXMgdGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGggbm9ybWFsaXplZCBkaXJlY3RpdmVcbiAgICAvLyBtZXRhZGF0YSwgd2hpY2ggYWx3YXlzIGZpbGxzIGluIHRoZSBzZWxlY3Rvci5cbiAgICBjb25zdCB0ZW1wbGF0ZSA9IENzc1NlbGVjdG9yLnBhcnNlKGNvbXBNZXRhLnNlbGVjdG9yICEpWzBdLmdldE1hdGNoaW5nRWxlbWVudFRlbXBsYXRlKCk7XG4gICAgY29uc3QgdGVtcGxhdGVVcmwgPSAnJztcbiAgICBjb25zdCBodG1sQXN0ID0gdGhpcy5faHRtbFBhcnNlci5wYXJzZSh0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwpO1xuICAgIHJldHVybiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNyZWF0ZSh7XG4gICAgICBpc0hvc3Q6IHRydWUsXG4gICAgICB0eXBlOiB7cmVmZXJlbmNlOiBob3N0VHlwZSwgZGlEZXBzOiBbXSwgbGlmZWN5Y2xlSG9va3M6IFtdfSxcbiAgICAgIHRlbXBsYXRlOiBuZXcgY3BsLkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgIHRlbXBsYXRlVXJsLFxuICAgICAgICBodG1sQXN0LFxuICAgICAgICBzdHlsZXM6IFtdLFxuICAgICAgICBzdHlsZVVybHM6IFtdLFxuICAgICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IFtdLFxuICAgICAgICBhbmltYXRpb25zOiBbXSxcbiAgICAgICAgaXNJbmxpbmU6IHRydWUsXG4gICAgICAgIGV4dGVybmFsU3R5bGVzaGVldHM6IFtdLFxuICAgICAgICBpbnRlcnBvbGF0aW9uOiBudWxsLFxuICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBmYWxzZSxcbiAgICAgIH0pLFxuICAgICAgZXhwb3J0QXM6IG51bGwsXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gICAgICBpbnB1dHM6IFtdLFxuICAgICAgb3V0cHV0czogW10sXG4gICAgICBob3N0OiB7fSxcbiAgICAgIGlzQ29tcG9uZW50OiB0cnVlLFxuICAgICAgc2VsZWN0b3I6ICcqJyxcbiAgICAgIHByb3ZpZGVyczogW10sXG4gICAgICB2aWV3UHJvdmlkZXJzOiBbXSxcbiAgICAgIHF1ZXJpZXM6IFtdLFxuICAgICAgZ3VhcmRzOiB7fSxcbiAgICAgIHZpZXdRdWVyaWVzOiBbXSxcbiAgICAgIGNvbXBvbmVudFZpZXdUeXBlOiBob3N0Vmlld1R5cGUsXG4gICAgICByZW5kZXJlclR5cGU6XG4gICAgICAgICAge2lkOiAnX19Ib3N0X18nLCBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLCBzdHlsZXM6IFtdLCBkYXRhOiB7fX0gYXMgb2JqZWN0LFxuICAgICAgZW50cnlDb21wb25lbnRzOiBbXSxcbiAgICAgIGNvbXBvbmVudEZhY3Rvcnk6IG51bGxcbiAgICB9KTtcbiAgfVxuXG4gIGxvYWREaXJlY3RpdmVNZXRhZGF0YShuZ01vZHVsZVR5cGU6IGFueSwgZGlyZWN0aXZlVHlwZTogYW55LCBpc1N5bmM6IGJvb2xlYW4pOiBTeW5jQXN5bmM8bnVsbD4ge1xuICAgIGlmICh0aGlzLl9kaXJlY3RpdmVDYWNoZS5oYXMoZGlyZWN0aXZlVHlwZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkaXJlY3RpdmVUeXBlID0gcmVzb2x2ZUZvcndhcmRSZWYoZGlyZWN0aXZlVHlwZSk7XG4gICAgY29uc3Qge2Fubm90YXRpb24sIG1ldGFkYXRhfSA9IHRoaXMuZ2V0Tm9uTm9ybWFsaXplZERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGUpICE7XG5cbiAgICBjb25zdCBjcmVhdGVEaXJlY3RpdmVNZXRhZGF0YSA9ICh0ZW1wbGF0ZU1ldGFkYXRhOiBjcGwuQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEgfCBudWxsKSA9PiB7XG4gICAgICBjb25zdCBub3JtYWxpemVkRGlyTWV0YSA9IG5ldyBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgICAgaXNIb3N0OiBmYWxzZSxcbiAgICAgICAgdHlwZTogbWV0YWRhdGEudHlwZSxcbiAgICAgICAgaXNDb21wb25lbnQ6IG1ldGFkYXRhLmlzQ29tcG9uZW50LFxuICAgICAgICBzZWxlY3RvcjogbWV0YWRhdGEuc2VsZWN0b3IsXG4gICAgICAgIGV4cG9ydEFzOiBtZXRhZGF0YS5leHBvcnRBcyxcbiAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBtZXRhZGF0YS5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgIGlucHV0czogbWV0YWRhdGEuaW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBtZXRhZGF0YS5vdXRwdXRzLFxuICAgICAgICBob3N0TGlzdGVuZXJzOiBtZXRhZGF0YS5ob3N0TGlzdGVuZXJzLFxuICAgICAgICBob3N0UHJvcGVydGllczogbWV0YWRhdGEuaG9zdFByb3BlcnRpZXMsXG4gICAgICAgIGhvc3RBdHRyaWJ1dGVzOiBtZXRhZGF0YS5ob3N0QXR0cmlidXRlcyxcbiAgICAgICAgcHJvdmlkZXJzOiBtZXRhZGF0YS5wcm92aWRlcnMsXG4gICAgICAgIHZpZXdQcm92aWRlcnM6IG1ldGFkYXRhLnZpZXdQcm92aWRlcnMsXG4gICAgICAgIHF1ZXJpZXM6IG1ldGFkYXRhLnF1ZXJpZXMsXG4gICAgICAgIGd1YXJkczogbWV0YWRhdGEuZ3VhcmRzLFxuICAgICAgICB2aWV3UXVlcmllczogbWV0YWRhdGEudmlld1F1ZXJpZXMsXG4gICAgICAgIGVudHJ5Q29tcG9uZW50czogbWV0YWRhdGEuZW50cnlDb21wb25lbnRzLFxuICAgICAgICBjb21wb25lbnRWaWV3VHlwZTogbWV0YWRhdGEuY29tcG9uZW50Vmlld1R5cGUsXG4gICAgICAgIHJlbmRlcmVyVHlwZTogbWV0YWRhdGEucmVuZGVyZXJUeXBlLFxuICAgICAgICBjb21wb25lbnRGYWN0b3J5OiBtZXRhZGF0YS5jb21wb25lbnRGYWN0b3J5LFxuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGVNZXRhZGF0YVxuICAgICAgfSk7XG4gICAgICBpZiAodGVtcGxhdGVNZXRhZGF0YSkge1xuICAgICAgICB0aGlzLmluaXRDb21wb25lbnRGYWN0b3J5KG1ldGFkYXRhLmNvbXBvbmVudEZhY3RvcnkgISwgdGVtcGxhdGVNZXRhZGF0YS5uZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZGlyZWN0aXZlQ2FjaGUuc2V0KGRpcmVjdGl2ZVR5cGUsIG5vcm1hbGl6ZWREaXJNZXRhKTtcbiAgICAgIHRoaXMuX3N1bW1hcnlDYWNoZS5zZXQoZGlyZWN0aXZlVHlwZSwgbm9ybWFsaXplZERpck1ldGEudG9TdW1tYXJ5KCkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIGlmIChtZXRhZGF0YS5pc0NvbXBvbmVudCkge1xuICAgICAgY29uc3QgdGVtcGxhdGUgPSBtZXRhZGF0YS50ZW1wbGF0ZSAhO1xuICAgICAgY29uc3QgdGVtcGxhdGVNZXRhID0gdGhpcy5fZGlyZWN0aXZlTm9ybWFsaXplci5ub3JtYWxpemVUZW1wbGF0ZSh7XG4gICAgICAgIG5nTW9kdWxlVHlwZSxcbiAgICAgICAgY29tcG9uZW50VHlwZTogZGlyZWN0aXZlVHlwZSxcbiAgICAgICAgbW9kdWxlVXJsOiB0aGlzLl9yZWZsZWN0b3IuY29tcG9uZW50TW9kdWxlVXJsKGRpcmVjdGl2ZVR5cGUsIGFubm90YXRpb24pLFxuICAgICAgICBlbmNhcHN1bGF0aW9uOiB0ZW1wbGF0ZS5lbmNhcHN1bGF0aW9uLFxuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUudGVtcGxhdGUsXG4gICAgICAgIHRlbXBsYXRlVXJsOiB0ZW1wbGF0ZS50ZW1wbGF0ZVVybCxcbiAgICAgICAgc3R5bGVzOiB0ZW1wbGF0ZS5zdHlsZXMsXG4gICAgICAgIHN0eWxlVXJsczogdGVtcGxhdGUuc3R5bGVVcmxzLFxuICAgICAgICBhbmltYXRpb25zOiB0ZW1wbGF0ZS5hbmltYXRpb25zLFxuICAgICAgICBpbnRlcnBvbGF0aW9uOiB0ZW1wbGF0ZS5pbnRlcnBvbGF0aW9uLFxuICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiB0ZW1wbGF0ZS5wcmVzZXJ2ZVdoaXRlc3BhY2VzXG4gICAgICB9KTtcbiAgICAgIGlmIChpc1Byb21pc2UodGVtcGxhdGVNZXRhKSAmJiBpc1N5bmMpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoY29tcG9uZW50U3RpbGxMb2FkaW5nRXJyb3IoZGlyZWN0aXZlVHlwZSksIGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBTeW5jQXN5bmMudGhlbih0ZW1wbGF0ZU1ldGEsIGNyZWF0ZURpcmVjdGl2ZU1ldGFkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZGlyZWN0aXZlXG4gICAgICBjcmVhdGVEaXJlY3RpdmVNZXRhZGF0YShudWxsKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldE5vbk5vcm1hbGl6ZWREaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmVUeXBlOiBhbnkpOlxuICAgICAge2Fubm90YXRpb246IERpcmVjdGl2ZSwgbWV0YWRhdGE6IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGF9fG51bGwge1xuICAgIGRpcmVjdGl2ZVR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZihkaXJlY3RpdmVUeXBlKTtcbiAgICBpZiAoIWRpcmVjdGl2ZVR5cGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgY2FjaGVFbnRyeSA9IHRoaXMuX25vbk5vcm1hbGl6ZWREaXJlY3RpdmVDYWNoZS5nZXQoZGlyZWN0aXZlVHlwZSk7XG4gICAgaWYgKGNhY2hlRW50cnkpIHtcbiAgICAgIHJldHVybiBjYWNoZUVudHJ5O1xuICAgIH1cbiAgICBjb25zdCBkaXJNZXRhID0gdGhpcy5fZGlyZWN0aXZlUmVzb2x2ZXIucmVzb2x2ZShkaXJlY3RpdmVUeXBlLCBmYWxzZSk7XG4gICAgaWYgKCFkaXJNZXRhKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IG5vbk5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhOiBjcGwuQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEgPSB1bmRlZmluZWQgITtcblxuICAgIGlmIChjcmVhdGVDb21wb25lbnQuaXNUeXBlT2YoZGlyTWV0YSkpIHtcbiAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgY29uc3QgY29tcE1ldGEgPSBkaXJNZXRhIGFzIENvbXBvbmVudDtcbiAgICAgIGFzc2VydEFycmF5T2ZTdHJpbmdzKCdzdHlsZXMnLCBjb21wTWV0YS5zdHlsZXMpO1xuICAgICAgYXNzZXJ0QXJyYXlPZlN0cmluZ3MoJ3N0eWxlVXJscycsIGNvbXBNZXRhLnN0eWxlVXJscyk7XG4gICAgICBhc3NlcnRJbnRlcnBvbGF0aW9uU3ltYm9scygnaW50ZXJwb2xhdGlvbicsIGNvbXBNZXRhLmludGVycG9sYXRpb24pO1xuXG4gICAgICBjb25zdCBhbmltYXRpb25zID0gY29tcE1ldGEuYW5pbWF0aW9ucztcblxuICAgICAgbm9uTm9ybWFsaXplZFRlbXBsYXRlTWV0YWRhdGEgPSBuZXcgY3BsLkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgICAgZW5jYXBzdWxhdGlvbjogbm9VbmRlZmluZWQoY29tcE1ldGEuZW5jYXBzdWxhdGlvbiksXG4gICAgICAgIHRlbXBsYXRlOiBub1VuZGVmaW5lZChjb21wTWV0YS50ZW1wbGF0ZSksXG4gICAgICAgIHRlbXBsYXRlVXJsOiBub1VuZGVmaW5lZChjb21wTWV0YS50ZW1wbGF0ZVVybCksXG4gICAgICAgIGh0bWxBc3Q6IG51bGwsXG4gICAgICAgIHN0eWxlczogY29tcE1ldGEuc3R5bGVzIHx8IFtdLFxuICAgICAgICBzdHlsZVVybHM6IGNvbXBNZXRhLnN0eWxlVXJscyB8fCBbXSxcbiAgICAgICAgYW5pbWF0aW9uczogYW5pbWF0aW9ucyB8fCBbXSxcbiAgICAgICAgaW50ZXJwb2xhdGlvbjogbm9VbmRlZmluZWQoY29tcE1ldGEuaW50ZXJwb2xhdGlvbiksXG4gICAgICAgIGlzSW5saW5lOiAhIWNvbXBNZXRhLnRlbXBsYXRlLFxuICAgICAgICBleHRlcm5hbFN0eWxlc2hlZXRzOiBbXSxcbiAgICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiBbXSxcbiAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogbm9VbmRlZmluZWQoZGlyTWV0YS5wcmVzZXJ2ZVdoaXRlc3BhY2VzKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxldCBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPSBudWxsICE7XG4gICAgbGV0IHZpZXdQcm92aWRlcnM6IGNwbC5Db21waWxlUHJvdmlkZXJNZXRhZGF0YVtdID0gW107XG4gICAgbGV0IGVudHJ5Q29tcG9uZW50TWV0YWRhdGE6IGNwbC5Db21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdID0gW107XG4gICAgbGV0IHNlbGVjdG9yID0gZGlyTWV0YS5zZWxlY3RvcjtcblxuICAgIGlmIChjcmVhdGVDb21wb25lbnQuaXNUeXBlT2YoZGlyTWV0YSkpIHtcbiAgICAgIC8vIENvbXBvbmVudFxuICAgICAgY29uc3QgY29tcE1ldGEgPSBkaXJNZXRhIGFzIENvbXBvbmVudDtcbiAgICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID0gY29tcE1ldGEuY2hhbmdlRGV0ZWN0aW9uICE7XG4gICAgICBpZiAoY29tcE1ldGEudmlld1Byb3ZpZGVycykge1xuICAgICAgICB2aWV3UHJvdmlkZXJzID0gdGhpcy5fZ2V0UHJvdmlkZXJzTWV0YWRhdGEoXG4gICAgICAgICAgICBjb21wTWV0YS52aWV3UHJvdmlkZXJzLCBlbnRyeUNvbXBvbmVudE1ldGFkYXRhLFxuICAgICAgICAgICAgYHZpZXdQcm92aWRlcnMgZm9yIFwiJHtzdHJpbmdpZnlUeXBlKGRpcmVjdGl2ZVR5cGUpfVwiYCwgW10sIGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgfVxuICAgICAgaWYgKGNvbXBNZXRhLmVudHJ5Q29tcG9uZW50cykge1xuICAgICAgICBlbnRyeUNvbXBvbmVudE1ldGFkYXRhID0gZmxhdHRlbkFuZERlZHVwZUFycmF5KGNvbXBNZXRhLmVudHJ5Q29tcG9uZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKCh0eXBlKSA9PiB0aGlzLl9nZXRFbnRyeUNvbXBvbmVudE1ldGFkYXRhKHR5cGUpICEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChlbnRyeUNvbXBvbmVudE1ldGFkYXRhKTtcbiAgICAgIH1cbiAgICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgICAgc2VsZWN0b3IgPSB0aGlzLl9zY2hlbWFSZWdpc3RyeS5nZXREZWZhdWx0Q29tcG9uZW50RWxlbWVudE5hbWUoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGlyZWN0aXZlXG4gICAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgICAgYERpcmVjdGl2ZSAke3N0cmluZ2lmeVR5cGUoZGlyZWN0aXZlVHlwZSl9IGhhcyBubyBzZWxlY3RvciwgcGxlYXNlIGFkZCBpdCFgKSxcbiAgICAgICAgICAgIGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICBzZWxlY3RvciA9ICdlcnJvcic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHByb3ZpZGVyczogY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhW10gPSBbXTtcbiAgICBpZiAoZGlyTWV0YS5wcm92aWRlcnMgIT0gbnVsbCkge1xuICAgICAgcHJvdmlkZXJzID0gdGhpcy5fZ2V0UHJvdmlkZXJzTWV0YWRhdGEoXG4gICAgICAgICAgZGlyTWV0YS5wcm92aWRlcnMsIGVudHJ5Q29tcG9uZW50TWV0YWRhdGEsXG4gICAgICAgICAgYHByb3ZpZGVycyBmb3IgXCIke3N0cmluZ2lmeVR5cGUoZGlyZWN0aXZlVHlwZSl9XCJgLCBbXSwgZGlyZWN0aXZlVHlwZSk7XG4gICAgfVxuICAgIGxldCBxdWVyaWVzOiBjcGwuQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSA9IFtdO1xuICAgIGxldCB2aWV3UXVlcmllczogY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhW10gPSBbXTtcbiAgICBpZiAoZGlyTWV0YS5xdWVyaWVzICE9IG51bGwpIHtcbiAgICAgIHF1ZXJpZXMgPSB0aGlzLl9nZXRRdWVyaWVzTWV0YWRhdGEoZGlyTWV0YS5xdWVyaWVzLCBmYWxzZSwgZGlyZWN0aXZlVHlwZSk7XG4gICAgICB2aWV3UXVlcmllcyA9IHRoaXMuX2dldFF1ZXJpZXNNZXRhZGF0YShkaXJNZXRhLnF1ZXJpZXMsIHRydWUsIGRpcmVjdGl2ZVR5cGUpO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGFkYXRhID0gY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5jcmVhdGUoe1xuICAgICAgaXNIb3N0OiBmYWxzZSxcbiAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgIGV4cG9ydEFzOiBub1VuZGVmaW5lZChkaXJNZXRhLmV4cG9ydEFzKSxcbiAgICAgIGlzQ29tcG9uZW50OiAhIW5vbk5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhLFxuICAgICAgdHlwZTogdGhpcy5fZ2V0VHlwZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGUpLFxuICAgICAgdGVtcGxhdGU6IG5vbk5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhLFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICAgIGlucHV0czogZGlyTWV0YS5pbnB1dHMgfHwgW10sXG4gICAgICBvdXRwdXRzOiBkaXJNZXRhLm91dHB1dHMgfHwgW10sXG4gICAgICBob3N0OiBkaXJNZXRhLmhvc3QgfHwge30sXG4gICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyB8fCBbXSxcbiAgICAgIHZpZXdQcm92aWRlcnM6IHZpZXdQcm92aWRlcnMgfHwgW10sXG4gICAgICBxdWVyaWVzOiBxdWVyaWVzIHx8IFtdLFxuICAgICAgZ3VhcmRzOiBkaXJNZXRhLmd1YXJkcyB8fCB7fSxcbiAgICAgIHZpZXdRdWVyaWVzOiB2aWV3UXVlcmllcyB8fCBbXSxcbiAgICAgIGVudHJ5Q29tcG9uZW50czogZW50cnlDb21wb25lbnRNZXRhZGF0YSxcbiAgICAgIGNvbXBvbmVudFZpZXdUeXBlOiBub25Ob3JtYWxpemVkVGVtcGxhdGVNZXRhZGF0YSA/IHRoaXMuZ2V0Q29tcG9uZW50Vmlld0NsYXNzKGRpcmVjdGl2ZVR5cGUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICByZW5kZXJlclR5cGU6IG5vbk5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhID8gdGhpcy5nZXRSZW5kZXJlclR5cGUoZGlyZWN0aXZlVHlwZSkgOiBudWxsLFxuICAgICAgY29tcG9uZW50RmFjdG9yeTogbnVsbFxuICAgIH0pO1xuICAgIGlmIChub25Ob3JtYWxpemVkVGVtcGxhdGVNZXRhZGF0YSkge1xuICAgICAgbWV0YWRhdGEuY29tcG9uZW50RmFjdG9yeSA9XG4gICAgICAgICAgdGhpcy5nZXRDb21wb25lbnRGYWN0b3J5KHNlbGVjdG9yLCBkaXJlY3RpdmVUeXBlLCBtZXRhZGF0YS5pbnB1dHMsIG1ldGFkYXRhLm91dHB1dHMpO1xuICAgIH1cbiAgICBjYWNoZUVudHJ5ID0ge21ldGFkYXRhLCBhbm5vdGF0aW9uOiBkaXJNZXRhfTtcbiAgICB0aGlzLl9ub25Ob3JtYWxpemVkRGlyZWN0aXZlQ2FjaGUuc2V0KGRpcmVjdGl2ZVR5cGUsIGNhY2hlRW50cnkpO1xuICAgIHJldHVybiBjYWNoZUVudHJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1ldGFkYXRhIGZvciB0aGUgZ2l2ZW4gZGlyZWN0aXZlLlxuICAgKiBUaGlzIGFzc3VtZXMgYGxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YWAgaGFzIGJlZW4gY2FsbGVkIGZpcnN0LlxuICAgKi9cbiAgZ2V0RGlyZWN0aXZlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZTogYW55KTogY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgY29uc3QgZGlyTWV0YSA9IHRoaXMuX2RpcmVjdGl2ZUNhY2hlLmdldChkaXJlY3RpdmVUeXBlKSAhO1xuICAgIGlmICghZGlyTWV0YSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBnZXREaXJlY3RpdmVNZXRhZGF0YSBjYW4gb25seSBiZSBjYWxsZWQgYWZ0ZXIgbG9hZE5nTW9kdWxlRGlyZWN0aXZlQW5kUGlwZU1ldGFkYXRhIGZvciBhIG1vZHVsZSB0aGF0IGRlY2xhcmVzIGl0LiBEaXJlY3RpdmUgJHtzdHJpbmdpZnlUeXBlKGRpcmVjdGl2ZVR5cGUpfS5gKSxcbiAgICAgICAgICBkaXJlY3RpdmVUeXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpck1ldGE7XG4gIH1cblxuICBnZXREaXJlY3RpdmVTdW1tYXJ5KGRpclR5cGU6IGFueSk6IGNwbC5Db21waWxlRGlyZWN0aXZlU3VtbWFyeSB7XG4gICAgY29uc3QgZGlyU3VtbWFyeSA9XG4gICAgICAgIDxjcGwuQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnk+dGhpcy5fbG9hZFN1bW1hcnkoZGlyVHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5EaXJlY3RpdmUpO1xuICAgIGlmICghZGlyU3VtbWFyeSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBDb3VsZCBub3QgbG9hZCB0aGUgc3VtbWFyeSBmb3IgZGlyZWN0aXZlICR7c3RyaW5naWZ5VHlwZShkaXJUeXBlKX0uYCksXG4gICAgICAgICAgZGlyVHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBkaXJTdW1tYXJ5O1xuICB9XG5cbiAgaXNEaXJlY3RpdmUodHlwZTogYW55KSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbG9hZFN1bW1hcnkodHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5EaXJlY3RpdmUpIHx8XG4gICAgICAgIHRoaXMuX2RpcmVjdGl2ZVJlc29sdmVyLmlzRGlyZWN0aXZlKHR5cGUpO1xuICB9XG5cbiAgaXNQaXBlKHR5cGU6IGFueSkge1xuICAgIHJldHVybiAhIXRoaXMuX2xvYWRTdW1tYXJ5KHR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuUGlwZSkgfHxcbiAgICAgICAgdGhpcy5fcGlwZVJlc29sdmVyLmlzUGlwZSh0eXBlKTtcbiAgfVxuXG4gIGlzTmdNb2R1bGUodHlwZTogYW55KSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbG9hZFN1bW1hcnkodHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5OZ01vZHVsZSkgfHxcbiAgICAgICAgdGhpcy5fbmdNb2R1bGVSZXNvbHZlci5pc05nTW9kdWxlKHR5cGUpO1xuICB9XG5cbiAgZ2V0TmdNb2R1bGVTdW1tYXJ5KG1vZHVsZVR5cGU6IGFueSwgYWxyZWFkeUNvbGxlY3Rpbmc6IFNldDxhbnk+fG51bGwgPSBudWxsKTpcbiAgICAgIGNwbC5Db21waWxlTmdNb2R1bGVTdW1tYXJ5fG51bGwge1xuICAgIGxldCBtb2R1bGVTdW1tYXJ5OiBjcGwuQ29tcGlsZU5nTW9kdWxlU3VtbWFyeXxudWxsID1cbiAgICAgICAgPGNwbC5Db21waWxlTmdNb2R1bGVTdW1tYXJ5PnRoaXMuX2xvYWRTdW1tYXJ5KG1vZHVsZVR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuTmdNb2R1bGUpO1xuICAgIGlmICghbW9kdWxlU3VtbWFyeSkge1xuICAgICAgY29uc3QgbW9kdWxlTWV0YSA9IHRoaXMuZ2V0TmdNb2R1bGVNZXRhZGF0YShtb2R1bGVUeXBlLCBmYWxzZSwgYWxyZWFkeUNvbGxlY3RpbmcpO1xuICAgICAgbW9kdWxlU3VtbWFyeSA9IG1vZHVsZU1ldGEgPyBtb2R1bGVNZXRhLnRvU3VtbWFyeSgpIDogbnVsbDtcbiAgICAgIGlmIChtb2R1bGVTdW1tYXJ5KSB7XG4gICAgICAgIHRoaXMuX3N1bW1hcnlDYWNoZS5zZXQobW9kdWxlVHlwZSwgbW9kdWxlU3VtbWFyeSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtb2R1bGVTdW1tYXJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIHRoZSBkZWNsYXJlZCBkaXJlY3RpdmVzIGFuZCBwaXBlcyBvZiBhbiBOZ01vZHVsZS5cbiAgICovXG4gIGxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YShtb2R1bGVUeXBlOiBhbnksIGlzU3luYzogYm9vbGVhbiwgdGhyb3dJZk5vdEZvdW5kID0gdHJ1ZSk6XG4gICAgICBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IG5nTW9kdWxlID0gdGhpcy5nZXROZ01vZHVsZU1ldGFkYXRhKG1vZHVsZVR5cGUsIHRocm93SWZOb3RGb3VuZCk7XG4gICAgY29uc3QgbG9hZGluZzogUHJvbWlzZTxhbnk+W10gPSBbXTtcbiAgICBpZiAobmdNb2R1bGUpIHtcbiAgICAgIG5nTW9kdWxlLmRlY2xhcmVkRGlyZWN0aXZlcy5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gdGhpcy5sb2FkRGlyZWN0aXZlTWV0YWRhdGEobW9kdWxlVHlwZSwgaWQucmVmZXJlbmNlLCBpc1N5bmMpO1xuICAgICAgICBpZiAocHJvbWlzZSkge1xuICAgICAgICAgIGxvYWRpbmcucHVzaChwcm9taXNlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBuZ01vZHVsZS5kZWNsYXJlZFBpcGVzLmZvckVhY2goKGlkKSA9PiB0aGlzLl9sb2FkUGlwZU1ldGFkYXRhKGlkLnJlZmVyZW5jZSkpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwobG9hZGluZyk7XG4gIH1cblxuICBnZXRTaGFsbG93TW9kdWxlTWV0YWRhdGEobW9kdWxlVHlwZTogYW55KTogY3BsLkNvbXBpbGVTaGFsbG93TW9kdWxlTWV0YWRhdGF8bnVsbCB7XG4gICAgbGV0IGNvbXBpbGVNZXRhID0gdGhpcy5fc2hhbGxvd01vZHVsZUNhY2hlLmdldChtb2R1bGVUeXBlKTtcbiAgICBpZiAoY29tcGlsZU1ldGEpIHtcbiAgICAgIHJldHVybiBjb21waWxlTWV0YTtcbiAgICB9XG5cbiAgICBjb25zdCBuZ01vZHVsZU1ldGEgPVxuICAgICAgICBmaW5kTGFzdCh0aGlzLl9yZWZsZWN0b3Iuc2hhbGxvd0Fubm90YXRpb25zKG1vZHVsZVR5cGUpLCBjcmVhdGVOZ01vZHVsZS5pc1R5cGVPZik7XG5cbiAgICBjb21waWxlTWV0YSA9IHtcbiAgICAgIHR5cGU6IHRoaXMuX2dldFR5cGVNZXRhZGF0YShtb2R1bGVUeXBlKSxcbiAgICAgIHJhd0V4cG9ydHM6IG5nTW9kdWxlTWV0YS5leHBvcnRzLFxuICAgICAgcmF3SW1wb3J0czogbmdNb2R1bGVNZXRhLmltcG9ydHMsXG4gICAgICByYXdQcm92aWRlcnM6IG5nTW9kdWxlTWV0YS5wcm92aWRlcnMsXG4gICAgfTtcblxuICAgIHRoaXMuX3NoYWxsb3dNb2R1bGVDYWNoZS5zZXQobW9kdWxlVHlwZSwgY29tcGlsZU1ldGEpO1xuICAgIHJldHVybiBjb21waWxlTWV0YTtcbiAgfVxuXG4gIGdldE5nTW9kdWxlTWV0YWRhdGEoXG4gICAgICBtb2R1bGVUeXBlOiBhbnksIHRocm93SWZOb3RGb3VuZCA9IHRydWUsXG4gICAgICBhbHJlYWR5Q29sbGVjdGluZzogU2V0PGFueT58bnVsbCA9IG51bGwpOiBjcGwuQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGF8bnVsbCB7XG4gICAgbW9kdWxlVHlwZSA9IHJlc29sdmVGb3J3YXJkUmVmKG1vZHVsZVR5cGUpO1xuICAgIGxldCBjb21waWxlTWV0YSA9IHRoaXMuX25nTW9kdWxlQ2FjaGUuZ2V0KG1vZHVsZVR5cGUpO1xuICAgIGlmIChjb21waWxlTWV0YSkge1xuICAgICAgcmV0dXJuIGNvbXBpbGVNZXRhO1xuICAgIH1cbiAgICBjb25zdCBtZXRhID0gdGhpcy5fbmdNb2R1bGVSZXNvbHZlci5yZXNvbHZlKG1vZHVsZVR5cGUsIHRocm93SWZOb3RGb3VuZCk7XG4gICAgaWYgKCFtZXRhKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgZGVjbGFyZWREaXJlY3RpdmVzOiBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3QgZXhwb3J0ZWROb25Nb2R1bGVJZGVudGlmaWVyczogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuICAgIGNvbnN0IGRlY2xhcmVkUGlwZXM6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgICBjb25zdCBpbXBvcnRlZE1vZHVsZXM6IGNwbC5Db21waWxlTmdNb2R1bGVTdW1tYXJ5W10gPSBbXTtcbiAgICBjb25zdCBleHBvcnRlZE1vZHVsZXM6IGNwbC5Db21waWxlTmdNb2R1bGVTdW1tYXJ5W10gPSBbXTtcbiAgICBjb25zdCBwcm92aWRlcnM6IGNwbC5Db21waWxlUHJvdmlkZXJNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3QgZW50cnlDb21wb25lbnRzOiBjcGwuQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXSA9IFtdO1xuICAgIGNvbnN0IGJvb3RzdHJhcENvbXBvbmVudHM6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgICBjb25zdCBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdID0gW107XG5cbiAgICBpZiAobWV0YS5pbXBvcnRzKSB7XG4gICAgICBmbGF0dGVuQW5kRGVkdXBlQXJyYXkobWV0YS5pbXBvcnRzKS5mb3JFYWNoKChpbXBvcnRlZFR5cGUpID0+IHtcbiAgICAgICAgbGV0IGltcG9ydGVkTW9kdWxlVHlwZTogVHlwZSA9IHVuZGVmaW5lZCAhO1xuICAgICAgICBpZiAoaXNWYWxpZFR5cGUoaW1wb3J0ZWRUeXBlKSkge1xuICAgICAgICAgIGltcG9ydGVkTW9kdWxlVHlwZSA9IGltcG9ydGVkVHlwZTtcbiAgICAgICAgfSBlbHNlIGlmIChpbXBvcnRlZFR5cGUgJiYgaW1wb3J0ZWRUeXBlLm5nTW9kdWxlKSB7XG4gICAgICAgICAgY29uc3QgbW9kdWxlV2l0aFByb3ZpZGVyczogTW9kdWxlV2l0aFByb3ZpZGVycyA9IGltcG9ydGVkVHlwZTtcbiAgICAgICAgICBpbXBvcnRlZE1vZHVsZVR5cGUgPSBtb2R1bGVXaXRoUHJvdmlkZXJzLm5nTW9kdWxlO1xuICAgICAgICAgIGlmIChtb2R1bGVXaXRoUHJvdmlkZXJzLnByb3ZpZGVycykge1xuICAgICAgICAgICAgcHJvdmlkZXJzLnB1c2goLi4udGhpcy5fZ2V0UHJvdmlkZXJzTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgbW9kdWxlV2l0aFByb3ZpZGVycy5wcm92aWRlcnMsIGVudHJ5Q29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICBgcHJvdmlkZXIgZm9yIHRoZSBOZ01vZHVsZSAnJHtzdHJpbmdpZnlUeXBlKGltcG9ydGVkTW9kdWxlVHlwZSl9J2AsIFtdLFxuICAgICAgICAgICAgICAgIGltcG9ydGVkVHlwZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbXBvcnRlZE1vZHVsZVR5cGUpIHtcbiAgICAgICAgICBpZiAodGhpcy5fY2hlY2tTZWxmSW1wb3J0KG1vZHVsZVR5cGUsIGltcG9ydGVkTW9kdWxlVHlwZSkpIHJldHVybjtcbiAgICAgICAgICBpZiAoIWFscmVhZHlDb2xsZWN0aW5nKSBhbHJlYWR5Q29sbGVjdGluZyA9IG5ldyBTZXQoKTtcbiAgICAgICAgICBpZiAoYWxyZWFkeUNvbGxlY3RpbmcuaGFzKGltcG9ydGVkTW9kdWxlVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgJHt0aGlzLl9nZXRUeXBlRGVzY3JpcHRvcihpbXBvcnRlZE1vZHVsZVR5cGUpfSAnJHtzdHJpbmdpZnlUeXBlKGltcG9ydGVkVHlwZSl9JyBpcyBpbXBvcnRlZCByZWN1cnNpdmVseSBieSB0aGUgbW9kdWxlICcke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9Jy5gKSxcbiAgICAgICAgICAgICAgICBtb2R1bGVUeXBlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWxyZWFkeUNvbGxlY3RpbmcuYWRkKGltcG9ydGVkTW9kdWxlVHlwZSk7XG4gICAgICAgICAgY29uc3QgaW1wb3J0ZWRNb2R1bGVTdW1tYXJ5ID1cbiAgICAgICAgICAgICAgdGhpcy5nZXROZ01vZHVsZVN1bW1hcnkoaW1wb3J0ZWRNb2R1bGVUeXBlLCBhbHJlYWR5Q29sbGVjdGluZyk7XG4gICAgICAgICAgYWxyZWFkeUNvbGxlY3RpbmcuZGVsZXRlKGltcG9ydGVkTW9kdWxlVHlwZSk7XG4gICAgICAgICAgaWYgKCFpbXBvcnRlZE1vZHVsZVN1bW1hcnkpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCAke3RoaXMuX2dldFR5cGVEZXNjcmlwdG9yKGltcG9ydGVkVHlwZSl9ICcke3N0cmluZ2lmeVR5cGUoaW1wb3J0ZWRUeXBlKX0nIGltcG9ydGVkIGJ5IHRoZSBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nLiBQbGVhc2UgYWRkIGEgQE5nTW9kdWxlIGFubm90YXRpb24uYCksXG4gICAgICAgICAgICAgICAgbW9kdWxlVHlwZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGltcG9ydGVkTW9kdWxlcy5wdXNoKGltcG9ydGVkTW9kdWxlU3VtbWFyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgdmFsdWUgJyR7c3RyaW5naWZ5VHlwZShpbXBvcnRlZFR5cGUpfScgaW1wb3J0ZWQgYnkgdGhlIG1vZHVsZSAnJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfSdgKSxcbiAgICAgICAgICAgICAgbW9kdWxlVHlwZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobWV0YS5leHBvcnRzKSB7XG4gICAgICBmbGF0dGVuQW5kRGVkdXBlQXJyYXkobWV0YS5leHBvcnRzKS5mb3JFYWNoKChleHBvcnRlZFR5cGUpID0+IHtcbiAgICAgICAgaWYgKCFpc1ZhbGlkVHlwZShleHBvcnRlZFR5cGUpKSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgdmFsdWUgJyR7c3RyaW5naWZ5VHlwZShleHBvcnRlZFR5cGUpfScgZXhwb3J0ZWQgYnkgdGhlIG1vZHVsZSAnJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfSdgKSxcbiAgICAgICAgICAgICAgbW9kdWxlVHlwZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYWxyZWFkeUNvbGxlY3RpbmcpIGFscmVhZHlDb2xsZWN0aW5nID0gbmV3IFNldCgpO1xuICAgICAgICBpZiAoYWxyZWFkeUNvbGxlY3RpbmcuaGFzKGV4cG9ydGVkVHlwZSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgICAgICBgJHt0aGlzLl9nZXRUeXBlRGVzY3JpcHRvcihleHBvcnRlZFR5cGUpfSAnJHtzdHJpbmdpZnkoZXhwb3J0ZWRUeXBlKX0nIGlzIGV4cG9ydGVkIHJlY3Vyc2l2ZWx5IGJ5IHRoZSBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nYCksXG4gICAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhbHJlYWR5Q29sbGVjdGluZy5hZGQoZXhwb3J0ZWRUeXBlKTtcbiAgICAgICAgY29uc3QgZXhwb3J0ZWRNb2R1bGVTdW1tYXJ5ID0gdGhpcy5nZXROZ01vZHVsZVN1bW1hcnkoZXhwb3J0ZWRUeXBlLCBhbHJlYWR5Q29sbGVjdGluZyk7XG4gICAgICAgIGFscmVhZHlDb2xsZWN0aW5nLmRlbGV0ZShleHBvcnRlZFR5cGUpO1xuICAgICAgICBpZiAoZXhwb3J0ZWRNb2R1bGVTdW1tYXJ5KSB7XG4gICAgICAgICAgZXhwb3J0ZWRNb2R1bGVzLnB1c2goZXhwb3J0ZWRNb2R1bGVTdW1tYXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleHBvcnRlZE5vbk1vZHVsZUlkZW50aWZpZXJzLnB1c2godGhpcy5fZ2V0SWRlbnRpZmllck1ldGFkYXRhKGV4cG9ydGVkVHlwZSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBOb3RlOiBUaGlzIHdpbGwgYmUgbW9kaWZpZWQgbGF0ZXIsIHNvIHdlIHJlbHkgb25cbiAgICAvLyBnZXR0aW5nIGEgbmV3IGluc3RhbmNlIGV2ZXJ5IHRpbWUhXG4gICAgY29uc3QgdHJhbnNpdGl2ZU1vZHVsZSA9IHRoaXMuX2dldFRyYW5zaXRpdmVOZ01vZHVsZU1ldGFkYXRhKGltcG9ydGVkTW9kdWxlcywgZXhwb3J0ZWRNb2R1bGVzKTtcbiAgICBpZiAobWV0YS5kZWNsYXJhdGlvbnMpIHtcbiAgICAgIGZsYXR0ZW5BbmREZWR1cGVBcnJheShtZXRhLmRlY2xhcmF0aW9ucykuZm9yRWFjaCgoZGVjbGFyZWRUeXBlKSA9PiB7XG4gICAgICAgIGlmICghaXNWYWxpZFR5cGUoZGVjbGFyZWRUeXBlKSkge1xuICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICBzeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgICAgIGBVbmV4cGVjdGVkIHZhbHVlICcke3N0cmluZ2lmeVR5cGUoZGVjbGFyZWRUeXBlKX0nIGRlY2xhcmVkIGJ5IHRoZSBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nYCksXG4gICAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWNsYXJlZElkZW50aWZpZXIgPSB0aGlzLl9nZXRJZGVudGlmaWVyTWV0YWRhdGEoZGVjbGFyZWRUeXBlKTtcbiAgICAgICAgaWYgKHRoaXMuaXNEaXJlY3RpdmUoZGVjbGFyZWRUeXBlKSkge1xuICAgICAgICAgIHRyYW5zaXRpdmVNb2R1bGUuYWRkRGlyZWN0aXZlKGRlY2xhcmVkSWRlbnRpZmllcik7XG4gICAgICAgICAgZGVjbGFyZWREaXJlY3RpdmVzLnB1c2goZGVjbGFyZWRJZGVudGlmaWVyKTtcbiAgICAgICAgICB0aGlzLl9hZGRUeXBlVG9Nb2R1bGUoZGVjbGFyZWRUeXBlLCBtb2R1bGVUeXBlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzUGlwZShkZWNsYXJlZFR5cGUpKSB7XG4gICAgICAgICAgdHJhbnNpdGl2ZU1vZHVsZS5hZGRQaXBlKGRlY2xhcmVkSWRlbnRpZmllcik7XG4gICAgICAgICAgdHJhbnNpdGl2ZU1vZHVsZS5waXBlcy5wdXNoKGRlY2xhcmVkSWRlbnRpZmllcik7XG4gICAgICAgICAgZGVjbGFyZWRQaXBlcy5wdXNoKGRlY2xhcmVkSWRlbnRpZmllcik7XG4gICAgICAgICAgdGhpcy5fYWRkVHlwZVRvTW9kdWxlKGRlY2xhcmVkVHlwZSwgbW9kdWxlVHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgJHt0aGlzLl9nZXRUeXBlRGVzY3JpcHRvcihkZWNsYXJlZFR5cGUpfSAnJHtzdHJpbmdpZnlUeXBlKGRlY2xhcmVkVHlwZSl9JyBkZWNsYXJlZCBieSB0aGUgbW9kdWxlICcke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9Jy4gUGxlYXNlIGFkZCBhIEBQaXBlL0BEaXJlY3RpdmUvQENvbXBvbmVudCBhbm5vdGF0aW9uLmApLFxuICAgICAgICAgICAgICBtb2R1bGVUeXBlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGV4cG9ydGVkRGlyZWN0aXZlczogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuICAgIGNvbnN0IGV4cG9ydGVkUGlwZXM6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgICBleHBvcnRlZE5vbk1vZHVsZUlkZW50aWZpZXJzLmZvckVhY2goKGV4cG9ydGVkSWQpID0+IHtcbiAgICAgIGlmICh0cmFuc2l0aXZlTW9kdWxlLmRpcmVjdGl2ZXNTZXQuaGFzKGV4cG9ydGVkSWQucmVmZXJlbmNlKSkge1xuICAgICAgICBleHBvcnRlZERpcmVjdGl2ZXMucHVzaChleHBvcnRlZElkKTtcbiAgICAgICAgdHJhbnNpdGl2ZU1vZHVsZS5hZGRFeHBvcnRlZERpcmVjdGl2ZShleHBvcnRlZElkKTtcbiAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGl2ZU1vZHVsZS5waXBlc1NldC5oYXMoZXhwb3J0ZWRJZC5yZWZlcmVuY2UpKSB7XG4gICAgICAgIGV4cG9ydGVkUGlwZXMucHVzaChleHBvcnRlZElkKTtcbiAgICAgICAgdHJhbnNpdGl2ZU1vZHVsZS5hZGRFeHBvcnRlZFBpcGUoZXhwb3J0ZWRJZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgIGBDYW4ndCBleHBvcnQgJHt0aGlzLl9nZXRUeXBlRGVzY3JpcHRvcihleHBvcnRlZElkLnJlZmVyZW5jZSl9ICR7c3RyaW5naWZ5VHlwZShleHBvcnRlZElkLnJlZmVyZW5jZSl9IGZyb20gJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfSBhcyBpdCB3YXMgbmVpdGhlciBkZWNsYXJlZCBub3IgaW1wb3J0ZWQhYCksXG4gICAgICAgICAgICBtb2R1bGVUeXBlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVGhlIHByb3ZpZGVycyBvZiB0aGUgbW9kdWxlIGhhdmUgdG8gZ28gbGFzdFxuICAgIC8vIHNvIHRoYXQgdGhleSBvdmVyd3JpdGUgYW55IG90aGVyIHByb3ZpZGVyIHdlIGFscmVhZHkgYWRkZWQuXG4gICAgaWYgKG1ldGEucHJvdmlkZXJzKSB7XG4gICAgICBwcm92aWRlcnMucHVzaCguLi50aGlzLl9nZXRQcm92aWRlcnNNZXRhZGF0YShcbiAgICAgICAgICBtZXRhLnByb3ZpZGVycywgZW50cnlDb21wb25lbnRzLFxuICAgICAgICAgIGBwcm92aWRlciBmb3IgdGhlIE5nTW9kdWxlICcke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9J2AsIFtdLCBtb2R1bGVUeXBlKSk7XG4gICAgfVxuXG4gICAgaWYgKG1ldGEuZW50cnlDb21wb25lbnRzKSB7XG4gICAgICBlbnRyeUNvbXBvbmVudHMucHVzaCguLi5mbGF0dGVuQW5kRGVkdXBlQXJyYXkobWV0YS5lbnRyeUNvbXBvbmVudHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCh0eXBlID0+IHRoaXMuX2dldEVudHJ5Q29tcG9uZW50TWV0YWRhdGEodHlwZSkgISkpO1xuICAgIH1cblxuICAgIGlmIChtZXRhLmJvb3RzdHJhcCkge1xuICAgICAgZmxhdHRlbkFuZERlZHVwZUFycmF5KG1ldGEuYm9vdHN0cmFwKS5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICBpZiAoIWlzVmFsaWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgdmFsdWUgJyR7c3RyaW5naWZ5VHlwZSh0eXBlKX0nIHVzZWQgaW4gdGhlIGJvb3RzdHJhcCBwcm9wZXJ0eSBvZiBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nYCksXG4gICAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBib290c3RyYXBDb21wb25lbnRzLnB1c2godGhpcy5fZ2V0SWRlbnRpZmllck1ldGFkYXRhKHR5cGUpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGVudHJ5Q29tcG9uZW50cy5wdXNoKFxuICAgICAgICAuLi5ib290c3RyYXBDb21wb25lbnRzLm1hcCh0eXBlID0+IHRoaXMuX2dldEVudHJ5Q29tcG9uZW50TWV0YWRhdGEodHlwZS5yZWZlcmVuY2UpICEpKTtcblxuICAgIGlmIChtZXRhLnNjaGVtYXMpIHtcbiAgICAgIHNjaGVtYXMucHVzaCguLi5mbGF0dGVuQW5kRGVkdXBlQXJyYXkobWV0YS5zY2hlbWFzKSk7XG4gICAgfVxuXG4gICAgY29tcGlsZU1ldGEgPSBuZXcgY3BsLkNvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKHtcbiAgICAgIHR5cGU6IHRoaXMuX2dldFR5cGVNZXRhZGF0YShtb2R1bGVUeXBlKSxcbiAgICAgIHByb3ZpZGVycyxcbiAgICAgIGVudHJ5Q29tcG9uZW50cyxcbiAgICAgIGJvb3RzdHJhcENvbXBvbmVudHMsXG4gICAgICBzY2hlbWFzLFxuICAgICAgZGVjbGFyZWREaXJlY3RpdmVzLFxuICAgICAgZXhwb3J0ZWREaXJlY3RpdmVzLFxuICAgICAgZGVjbGFyZWRQaXBlcyxcbiAgICAgIGV4cG9ydGVkUGlwZXMsXG4gICAgICBpbXBvcnRlZE1vZHVsZXMsXG4gICAgICBleHBvcnRlZE1vZHVsZXMsXG4gICAgICB0cmFuc2l0aXZlTW9kdWxlLFxuICAgICAgaWQ6IG1ldGEuaWQgfHwgbnVsbCxcbiAgICB9KTtcblxuICAgIGVudHJ5Q29tcG9uZW50cy5mb3JFYWNoKChpZCkgPT4gdHJhbnNpdGl2ZU1vZHVsZS5hZGRFbnRyeUNvbXBvbmVudChpZCkpO1xuICAgIHByb3ZpZGVycy5mb3JFYWNoKChwcm92aWRlcikgPT4gdHJhbnNpdGl2ZU1vZHVsZS5hZGRQcm92aWRlcihwcm92aWRlciwgY29tcGlsZU1ldGEgIS50eXBlKSk7XG4gICAgdHJhbnNpdGl2ZU1vZHVsZS5hZGRNb2R1bGUoY29tcGlsZU1ldGEudHlwZSk7XG4gICAgdGhpcy5fbmdNb2R1bGVDYWNoZS5zZXQobW9kdWxlVHlwZSwgY29tcGlsZU1ldGEpO1xuICAgIHJldHVybiBjb21waWxlTWV0YTtcbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrU2VsZkltcG9ydChtb2R1bGVUeXBlOiBUeXBlLCBpbXBvcnRlZE1vZHVsZVR5cGU6IFR5cGUpOiBib29sZWFuIHtcbiAgICBpZiAobW9kdWxlVHlwZSA9PT0gaW1wb3J0ZWRNb2R1bGVUeXBlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBzeW50YXhFcnJvcihgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nIG1vZHVsZSBjYW4ndCBpbXBvcnQgaXRzZWxmYCksIG1vZHVsZVR5cGUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFR5cGVEZXNjcmlwdG9yKHR5cGU6IFR5cGUpOiBzdHJpbmcge1xuICAgIGlmIChpc1ZhbGlkVHlwZSh0eXBlKSkge1xuICAgICAgaWYgKHRoaXMuaXNEaXJlY3RpdmUodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuICdkaXJlY3RpdmUnO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc1BpcGUodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuICdwaXBlJztcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNOZ01vZHVsZSh0eXBlKSkge1xuICAgICAgICByZXR1cm4gJ21vZHVsZSc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCh0eXBlIGFzIGFueSkucHJvdmlkZSkge1xuICAgICAgcmV0dXJuICdwcm92aWRlcic7XG4gICAgfVxuXG4gICAgcmV0dXJuICd2YWx1ZSc7XG4gIH1cblxuXG4gIHByaXZhdGUgX2FkZFR5cGVUb01vZHVsZSh0eXBlOiBUeXBlLCBtb2R1bGVUeXBlOiBUeXBlKSB7XG4gICAgY29uc3Qgb2xkTW9kdWxlID0gdGhpcy5fbmdNb2R1bGVPZlR5cGVzLmdldCh0eXBlKTtcbiAgICBpZiAob2xkTW9kdWxlICYmIG9sZE1vZHVsZSAhPT0gbW9kdWxlVHlwZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBUeXBlICR7c3RyaW5naWZ5VHlwZSh0eXBlKX0gaXMgcGFydCBvZiB0aGUgZGVjbGFyYXRpb25zIG9mIDIgbW9kdWxlczogJHtzdHJpbmdpZnlUeXBlKG9sZE1vZHVsZSl9IGFuZCAke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9ISBgICtcbiAgICAgICAgICAgICAgYFBsZWFzZSBjb25zaWRlciBtb3ZpbmcgJHtzdHJpbmdpZnlUeXBlKHR5cGUpfSB0byBhIGhpZ2hlciBtb2R1bGUgdGhhdCBpbXBvcnRzICR7c3RyaW5naWZ5VHlwZShvbGRNb2R1bGUpfSBhbmQgJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfS4gYCArXG4gICAgICAgICAgICAgIGBZb3UgY2FuIGFsc28gY3JlYXRlIGEgbmV3IE5nTW9kdWxlIHRoYXQgZXhwb3J0cyBhbmQgaW5jbHVkZXMgJHtzdHJpbmdpZnlUeXBlKHR5cGUpfSB0aGVuIGltcG9ydCB0aGF0IE5nTW9kdWxlIGluICR7c3RyaW5naWZ5VHlwZShvbGRNb2R1bGUpfSBhbmQgJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfS5gKSxcbiAgICAgICAgICBtb2R1bGVUeXBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fbmdNb2R1bGVPZlR5cGVzLnNldCh0eXBlLCBtb2R1bGVUeXBlKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFRyYW5zaXRpdmVOZ01vZHVsZU1ldGFkYXRhKFxuICAgICAgaW1wb3J0ZWRNb2R1bGVzOiBjcGwuQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdLFxuICAgICAgZXhwb3J0ZWRNb2R1bGVzOiBjcGwuQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdKTogY3BsLlRyYW5zaXRpdmVDb21waWxlTmdNb2R1bGVNZXRhZGF0YSB7XG4gICAgLy8gY29sbGVjdCBgcHJvdmlkZXJzYCAvIGBlbnRyeUNvbXBvbmVudHNgIGZyb20gYWxsIGltcG9ydGVkIGFuZCBhbGwgZXhwb3J0ZWQgbW9kdWxlc1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBjcGwuVHJhbnNpdGl2ZUNvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKCk7XG4gICAgY29uc3QgbW9kdWxlc0J5VG9rZW4gPSBuZXcgTWFwPGFueSwgU2V0PGFueT4+KCk7XG4gICAgaW1wb3J0ZWRNb2R1bGVzLmNvbmNhdChleHBvcnRlZE1vZHVsZXMpLmZvckVhY2goKG1vZFN1bW1hcnkpID0+IHtcbiAgICAgIG1vZFN1bW1hcnkubW9kdWxlcy5mb3JFYWNoKChtb2QpID0+IHJlc3VsdC5hZGRNb2R1bGUobW9kKSk7XG4gICAgICBtb2RTdW1tYXJ5LmVudHJ5Q29tcG9uZW50cy5mb3JFYWNoKChjb21wKSA9PiByZXN1bHQuYWRkRW50cnlDb21wb25lbnQoY29tcCkpO1xuICAgICAgY29uc3QgYWRkZWRUb2tlbnMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICAgIG1vZFN1bW1hcnkucHJvdmlkZXJzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgIGNvbnN0IHRva2VuUmVmID0gY3BsLnRva2VuUmVmZXJlbmNlKGVudHJ5LnByb3ZpZGVyLnRva2VuKTtcbiAgICAgICAgbGV0IHByZXZNb2R1bGVzID0gbW9kdWxlc0J5VG9rZW4uZ2V0KHRva2VuUmVmKTtcbiAgICAgICAgaWYgKCFwcmV2TW9kdWxlcykge1xuICAgICAgICAgIHByZXZNb2R1bGVzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgICAgICAgbW9kdWxlc0J5VG9rZW4uc2V0KHRva2VuUmVmLCBwcmV2TW9kdWxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbW9kdWxlUmVmID0gZW50cnkubW9kdWxlLnJlZmVyZW5jZTtcbiAgICAgICAgLy8gTm90ZTogdGhlIHByb3ZpZGVycyBvZiBvbmUgbW9kdWxlIG1heSBzdGlsbCBjb250YWluIG11bHRpcGxlIHByb3ZpZGVyc1xuICAgICAgICAvLyBwZXIgdG9rZW4gKGUuZy4gZm9yIG11bHRpIHByb3ZpZGVycyksIGFuZCB3ZSBuZWVkIHRvIHByZXNlcnZlIHRoZXNlLlxuICAgICAgICBpZiAoYWRkZWRUb2tlbnMuaGFzKHRva2VuUmVmKSB8fCAhcHJldk1vZHVsZXMuaGFzKG1vZHVsZVJlZikpIHtcbiAgICAgICAgICBwcmV2TW9kdWxlcy5hZGQobW9kdWxlUmVmKTtcbiAgICAgICAgICBhZGRlZFRva2Vucy5hZGQodG9rZW5SZWYpO1xuICAgICAgICAgIHJlc3VsdC5hZGRQcm92aWRlcihlbnRyeS5wcm92aWRlciwgZW50cnkubW9kdWxlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgZXhwb3J0ZWRNb2R1bGVzLmZvckVhY2goKG1vZFN1bW1hcnkpID0+IHtcbiAgICAgIG1vZFN1bW1hcnkuZXhwb3J0ZWREaXJlY3RpdmVzLmZvckVhY2goKGlkKSA9PiByZXN1bHQuYWRkRXhwb3J0ZWREaXJlY3RpdmUoaWQpKTtcbiAgICAgIG1vZFN1bW1hcnkuZXhwb3J0ZWRQaXBlcy5mb3JFYWNoKChpZCkgPT4gcmVzdWx0LmFkZEV4cG9ydGVkUGlwZShpZCkpO1xuICAgIH0pO1xuICAgIGltcG9ydGVkTW9kdWxlcy5mb3JFYWNoKChtb2RTdW1tYXJ5KSA9PiB7XG4gICAgICBtb2RTdW1tYXJ5LmV4cG9ydGVkRGlyZWN0aXZlcy5mb3JFYWNoKChpZCkgPT4gcmVzdWx0LmFkZERpcmVjdGl2ZShpZCkpO1xuICAgICAgbW9kU3VtbWFyeS5leHBvcnRlZFBpcGVzLmZvckVhY2goKGlkKSA9PiByZXN1bHQuYWRkUGlwZShpZCkpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9nZXRJZGVudGlmaWVyTWV0YWRhdGEodHlwZTogVHlwZSk6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhIHtcbiAgICB0eXBlID0gcmVzb2x2ZUZvcndhcmRSZWYodHlwZSk7XG4gICAgcmV0dXJuIHtyZWZlcmVuY2U6IHR5cGV9O1xuICB9XG5cbiAgaXNJbmplY3RhYmxlKHR5cGU6IGFueSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGFubm90YXRpb25zID0gdGhpcy5fcmVmbGVjdG9yLnRyeUFubm90YXRpb25zKHR5cGUpO1xuICAgIHJldHVybiBhbm5vdGF0aW9ucy5zb21lKGFubiA9PiBjcmVhdGVJbmplY3RhYmxlLmlzVHlwZU9mKGFubikpO1xuICB9XG5cbiAgZ2V0SW5qZWN0YWJsZVN1bW1hcnkodHlwZTogYW55KTogY3BsLkNvbXBpbGVUeXBlU3VtbWFyeSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1bW1hcnlLaW5kOiBjcGwuQ29tcGlsZVN1bW1hcnlLaW5kLkluamVjdGFibGUsXG4gICAgICB0eXBlOiB0aGlzLl9nZXRUeXBlTWV0YWRhdGEodHlwZSwgbnVsbCwgZmFsc2UpXG4gICAgfTtcbiAgfVxuXG4gIGdldEluamVjdGFibGVNZXRhZGF0YShcbiAgICAgIHR5cGU6IGFueSwgZGVwZW5kZW5jaWVzOiBhbnlbXXxudWxsID0gbnVsbCxcbiAgICAgIHRocm93T25Vbmtub3duRGVwczogYm9vbGVhbiA9IHRydWUpOiBjcGwuQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YXxudWxsIHtcbiAgICBjb25zdCB0eXBlU3VtbWFyeSA9IHRoaXMuX2xvYWRTdW1tYXJ5KHR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuSW5qZWN0YWJsZSk7XG4gICAgY29uc3QgdHlwZU1ldGFkYXRhID0gdHlwZVN1bW1hcnkgP1xuICAgICAgICB0eXBlU3VtbWFyeS50eXBlIDpcbiAgICAgICAgdGhpcy5fZ2V0VHlwZU1ldGFkYXRhKHR5cGUsIGRlcGVuZGVuY2llcywgdGhyb3dPblVua25vd25EZXBzKTtcblxuICAgIGNvbnN0IGFubm90YXRpb25zOiBJbmplY3RhYmxlW10gPVxuICAgICAgICB0aGlzLl9yZWZsZWN0b3IuYW5ub3RhdGlvbnModHlwZSkuZmlsdGVyKGFubiA9PiBjcmVhdGVJbmplY3RhYmxlLmlzVHlwZU9mKGFubikpO1xuXG4gICAgaWYgKGFubm90YXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0YSA9IGFubm90YXRpb25zW2Fubm90YXRpb25zLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiB7XG4gICAgICBzeW1ib2w6IHR5cGUsXG4gICAgICB0eXBlOiB0eXBlTWV0YWRhdGEsXG4gICAgICBwcm92aWRlZEluOiBtZXRhLnByb3ZpZGVkSW4sXG4gICAgICB1c2VWYWx1ZTogbWV0YS51c2VWYWx1ZSxcbiAgICAgIHVzZUNsYXNzOiBtZXRhLnVzZUNsYXNzLFxuICAgICAgdXNlRXhpc3Rpbmc6IG1ldGEudXNlRXhpc3RpbmcsXG4gICAgICB1c2VGYWN0b3J5OiBtZXRhLnVzZUZhY3RvcnksXG4gICAgICBkZXBzOiBtZXRhLmRlcHMsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFR5cGVNZXRhZGF0YSh0eXBlOiBUeXBlLCBkZXBlbmRlbmNpZXM6IGFueVtdfG51bGwgPSBudWxsLCB0aHJvd09uVW5rbm93bkRlcHMgPSB0cnVlKTpcbiAgICAgIGNwbC5Db21waWxlVHlwZU1ldGFkYXRhIHtcbiAgICBjb25zdCBpZGVudGlmaWVyID0gdGhpcy5fZ2V0SWRlbnRpZmllck1ldGFkYXRhKHR5cGUpO1xuICAgIHJldHVybiB7XG4gICAgICByZWZlcmVuY2U6IGlkZW50aWZpZXIucmVmZXJlbmNlLFxuICAgICAgZGlEZXBzOiB0aGlzLl9nZXREZXBlbmRlbmNpZXNNZXRhZGF0YShpZGVudGlmaWVyLnJlZmVyZW5jZSwgZGVwZW5kZW5jaWVzLCB0aHJvd09uVW5rbm93bkRlcHMpLFxuICAgICAgbGlmZWN5Y2xlSG9va3M6IGdldEFsbExpZmVjeWNsZUhvb2tzKHRoaXMuX3JlZmxlY3RvciwgaWRlbnRpZmllci5yZWZlcmVuY2UpLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9nZXRGYWN0b3J5TWV0YWRhdGEoZmFjdG9yeTogRnVuY3Rpb24sIGRlcGVuZGVuY2llczogYW55W118bnVsbCA9IG51bGwpOlxuICAgICAgY3BsLkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEge1xuICAgIGZhY3RvcnkgPSByZXNvbHZlRm9yd2FyZFJlZihmYWN0b3J5KTtcbiAgICByZXR1cm4ge3JlZmVyZW5jZTogZmFjdG9yeSwgZGlEZXBzOiB0aGlzLl9nZXREZXBlbmRlbmNpZXNNZXRhZGF0YShmYWN0b3J5LCBkZXBlbmRlbmNpZXMpfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuIHBpcGUuXG4gICAqIFRoaXMgYXNzdW1lcyBgbG9hZE5nTW9kdWxlRGlyZWN0aXZlQW5kUGlwZU1ldGFkYXRhYCBoYXMgYmVlbiBjYWxsZWQgZmlyc3QuXG4gICAqL1xuICBnZXRQaXBlTWV0YWRhdGEocGlwZVR5cGU6IGFueSk6IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhfG51bGwge1xuICAgIGNvbnN0IHBpcGVNZXRhID0gdGhpcy5fcGlwZUNhY2hlLmdldChwaXBlVHlwZSk7XG4gICAgaWYgKCFwaXBlTWV0YSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBnZXRQaXBlTWV0YWRhdGEgY2FuIG9ubHkgYmUgY2FsbGVkIGFmdGVyIGxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YSBmb3IgYSBtb2R1bGUgdGhhdCBkZWNsYXJlcyBpdC4gUGlwZSAke3N0cmluZ2lmeVR5cGUocGlwZVR5cGUpfS5gKSxcbiAgICAgICAgICBwaXBlVHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBwaXBlTWV0YSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0UGlwZVN1bW1hcnkocGlwZVR5cGU6IGFueSk6IGNwbC5Db21waWxlUGlwZVN1bW1hcnkge1xuICAgIGNvbnN0IHBpcGVTdW1tYXJ5ID1cbiAgICAgICAgPGNwbC5Db21waWxlUGlwZVN1bW1hcnk+dGhpcy5fbG9hZFN1bW1hcnkocGlwZVR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuUGlwZSk7XG4gICAgaWYgKCFwaXBlU3VtbWFyeSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBDb3VsZCBub3QgbG9hZCB0aGUgc3VtbWFyeSBmb3IgcGlwZSAke3N0cmluZ2lmeVR5cGUocGlwZVR5cGUpfS5gKSxcbiAgICAgICAgICBwaXBlVHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBwaXBlU3VtbWFyeTtcbiAgfVxuXG4gIGdldE9yTG9hZFBpcGVNZXRhZGF0YShwaXBlVHlwZTogYW55KTogY3BsLkNvbXBpbGVQaXBlTWV0YWRhdGEge1xuICAgIGxldCBwaXBlTWV0YSA9IHRoaXMuX3BpcGVDYWNoZS5nZXQocGlwZVR5cGUpO1xuICAgIGlmICghcGlwZU1ldGEpIHtcbiAgICAgIHBpcGVNZXRhID0gdGhpcy5fbG9hZFBpcGVNZXRhZGF0YShwaXBlVHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBwaXBlTWV0YTtcbiAgfVxuXG4gIHByaXZhdGUgX2xvYWRQaXBlTWV0YWRhdGEocGlwZVR5cGU6IGFueSk6IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhIHtcbiAgICBwaXBlVHlwZSA9IHJlc29sdmVGb3J3YXJkUmVmKHBpcGVUeXBlKTtcbiAgICBjb25zdCBwaXBlQW5ub3RhdGlvbiA9IHRoaXMuX3BpcGVSZXNvbHZlci5yZXNvbHZlKHBpcGVUeXBlKSAhO1xuXG4gICAgY29uc3QgcGlwZU1ldGEgPSBuZXcgY3BsLkNvbXBpbGVQaXBlTWV0YWRhdGEoe1xuICAgICAgdHlwZTogdGhpcy5fZ2V0VHlwZU1ldGFkYXRhKHBpcGVUeXBlKSxcbiAgICAgIG5hbWU6IHBpcGVBbm5vdGF0aW9uLm5hbWUsXG4gICAgICBwdXJlOiAhIXBpcGVBbm5vdGF0aW9uLnB1cmVcbiAgICB9KTtcbiAgICB0aGlzLl9waXBlQ2FjaGUuc2V0KHBpcGVUeXBlLCBwaXBlTWV0YSk7XG4gICAgdGhpcy5fc3VtbWFyeUNhY2hlLnNldChwaXBlVHlwZSwgcGlwZU1ldGEudG9TdW1tYXJ5KCkpO1xuICAgIHJldHVybiBwaXBlTWV0YTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldERlcGVuZGVuY2llc01ldGFkYXRhKFxuICAgICAgdHlwZU9yRnVuYzogVHlwZXxGdW5jdGlvbiwgZGVwZW5kZW5jaWVzOiBhbnlbXXxudWxsLFxuICAgICAgdGhyb3dPblVua25vd25EZXBzID0gdHJ1ZSk6IGNwbC5Db21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXSB7XG4gICAgbGV0IGhhc1Vua25vd25EZXBzID0gZmFsc2U7XG4gICAgY29uc3QgcGFyYW1zID0gZGVwZW5kZW5jaWVzIHx8IHRoaXMuX3JlZmxlY3Rvci5wYXJhbWV0ZXJzKHR5cGVPckZ1bmMpIHx8IFtdO1xuXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzTWV0YWRhdGE6IGNwbC5Db21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXSA9IHBhcmFtcy5tYXAoKHBhcmFtKSA9PiB7XG4gICAgICBsZXQgaXNBdHRyaWJ1dGUgPSBmYWxzZTtcbiAgICAgIGxldCBpc0hvc3QgPSBmYWxzZTtcbiAgICAgIGxldCBpc1NlbGYgPSBmYWxzZTtcbiAgICAgIGxldCBpc1NraXBTZWxmID0gZmFsc2U7XG4gICAgICBsZXQgaXNPcHRpb25hbCA9IGZhbHNlO1xuICAgICAgbGV0IHRva2VuOiBhbnkgPSBudWxsO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW0pKSB7XG4gICAgICAgIHBhcmFtLmZvckVhY2goKHBhcmFtRW50cnkpID0+IHtcbiAgICAgICAgICBpZiAoY3JlYXRlSG9zdC5pc1R5cGVPZihwYXJhbUVudHJ5KSkge1xuICAgICAgICAgICAgaXNIb3N0ID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNyZWF0ZVNlbGYuaXNUeXBlT2YocGFyYW1FbnRyeSkpIHtcbiAgICAgICAgICAgIGlzU2VsZiA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChjcmVhdGVTa2lwU2VsZi5pc1R5cGVPZihwYXJhbUVudHJ5KSkge1xuICAgICAgICAgICAgaXNTa2lwU2VsZiA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChjcmVhdGVPcHRpb25hbC5pc1R5cGVPZihwYXJhbUVudHJ5KSkge1xuICAgICAgICAgICAgaXNPcHRpb25hbCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChjcmVhdGVBdHRyaWJ1dGUuaXNUeXBlT2YocGFyYW1FbnRyeSkpIHtcbiAgICAgICAgICAgIGlzQXR0cmlidXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRva2VuID0gcGFyYW1FbnRyeS5hdHRyaWJ1dGVOYW1lO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3JlYXRlSW5qZWN0LmlzVHlwZU9mKHBhcmFtRW50cnkpKSB7XG4gICAgICAgICAgICB0b2tlbiA9IHBhcmFtRW50cnkudG9rZW47XG4gICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgY3JlYXRlSW5qZWN0aW9uVG9rZW4uaXNUeXBlT2YocGFyYW1FbnRyeSkgfHwgcGFyYW1FbnRyeSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgICAgICAgdG9rZW4gPSBwYXJhbUVudHJ5O1xuICAgICAgICAgIH0gZWxzZSBpZiAoaXNWYWxpZFR5cGUocGFyYW1FbnRyeSkgJiYgdG9rZW4gPT0gbnVsbCkge1xuICAgICAgICAgICAgdG9rZW4gPSBwYXJhbUVudHJ5O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2tlbiA9IHBhcmFtO1xuICAgICAgfVxuICAgICAgaWYgKHRva2VuID09IG51bGwpIHtcbiAgICAgICAgaGFzVW5rbm93bkRlcHMgPSB0cnVlO1xuICAgICAgICByZXR1cm4gbnVsbCAhO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc0F0dHJpYnV0ZSxcbiAgICAgICAgaXNIb3N0LFxuICAgICAgICBpc1NlbGYsXG4gICAgICAgIGlzU2tpcFNlbGYsXG4gICAgICAgIGlzT3B0aW9uYWwsXG4gICAgICAgIHRva2VuOiB0aGlzLl9nZXRUb2tlbk1ldGFkYXRhKHRva2VuKVxuICAgICAgfTtcblxuICAgIH0pO1xuXG4gICAgaWYgKGhhc1Vua25vd25EZXBzKSB7XG4gICAgICBjb25zdCBkZXBzVG9rZW5zID1cbiAgICAgICAgICBkZXBlbmRlbmNpZXNNZXRhZGF0YS5tYXAoKGRlcCkgPT4gZGVwID8gc3RyaW5naWZ5VHlwZShkZXAudG9rZW4pIDogJz8nKS5qb2luKCcsICcpO1xuICAgICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICAgICAgYENhbid0IHJlc29sdmUgYWxsIHBhcmFtZXRlcnMgZm9yICR7c3RyaW5naWZ5VHlwZSh0eXBlT3JGdW5jKX06ICgke2RlcHNUb2tlbnN9KS5gO1xuICAgICAgaWYgKHRocm93T25Vbmtub3duRGVwcyB8fCB0aGlzLl9jb25maWcuc3RyaWN0SW5qZWN0aW9uUGFyYW1ldGVycykge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihzeW50YXhFcnJvcihtZXNzYWdlKSwgdHlwZU9yRnVuYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jb25zb2xlLndhcm4oYFdhcm5pbmc6ICR7bWVzc2FnZX0gVGhpcyB3aWxsIGJlY29tZSBhbiBlcnJvciBpbiBBbmd1bGFyIHY2LnhgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVwZW5kZW5jaWVzTWV0YWRhdGE7XG4gIH1cblxuICBwcml2YXRlIF9nZXRUb2tlbk1ldGFkYXRhKHRva2VuOiBhbnkpOiBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGEge1xuICAgIHRva2VuID0gcmVzb2x2ZUZvcndhcmRSZWYodG9rZW4pO1xuICAgIGxldCBjb21waWxlVG9rZW46IGNwbC5Db21waWxlVG9rZW5NZXRhZGF0YTtcbiAgICBpZiAodHlwZW9mIHRva2VuID09PSAnc3RyaW5nJykge1xuICAgICAgY29tcGlsZVRva2VuID0ge3ZhbHVlOiB0b2tlbn07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbXBpbGVUb2tlbiA9IHtpZGVudGlmaWVyOiB7cmVmZXJlbmNlOiB0b2tlbn19O1xuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZVRva2VuO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UHJvdmlkZXJzTWV0YWRhdGEoXG4gICAgICBwcm92aWRlcnM6IFByb3ZpZGVyW10sIHRhcmdldEVudHJ5Q29tcG9uZW50czogY3BsLkNvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10sXG4gICAgICBkZWJ1Z0luZm8/OiBzdHJpbmcsIGNvbXBpbGVQcm92aWRlcnM6IGNwbC5Db21waWxlUHJvdmlkZXJNZXRhZGF0YVtdID0gW10sXG4gICAgICB0eXBlPzogYW55KTogY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhW10ge1xuICAgIHByb3ZpZGVycy5mb3JFYWNoKChwcm92aWRlcjogYW55LCBwcm92aWRlcklkeDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwcm92aWRlcikpIHtcbiAgICAgICAgdGhpcy5fZ2V0UHJvdmlkZXJzTWV0YWRhdGEocHJvdmlkZXIsIHRhcmdldEVudHJ5Q29tcG9uZW50cywgZGVidWdJbmZvLCBjb21waWxlUHJvdmlkZXJzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb3ZpZGVyID0gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIpO1xuICAgICAgICBsZXQgcHJvdmlkZXJNZXRhOiBjcGwuUHJvdmlkZXJNZXRhID0gdW5kZWZpbmVkICE7XG4gICAgICAgIGlmIChwcm92aWRlciAmJiB0eXBlb2YgcHJvdmlkZXIgPT09ICdvYmplY3QnICYmIHByb3ZpZGVyLmhhc093blByb3BlcnR5KCdwcm92aWRlJykpIHtcbiAgICAgICAgICB0aGlzLl92YWxpZGF0ZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICAgICAgICBwcm92aWRlck1ldGEgPSBuZXcgY3BsLlByb3ZpZGVyTWV0YShwcm92aWRlci5wcm92aWRlLCBwcm92aWRlcik7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNWYWxpZFR5cGUocHJvdmlkZXIpKSB7XG4gICAgICAgICAgcHJvdmlkZXJNZXRhID0gbmV3IGNwbC5Qcm92aWRlck1ldGEocHJvdmlkZXIsIHt1c2VDbGFzczogcHJvdmlkZXJ9KTtcbiAgICAgICAgfSBlbHNlIGlmIChwcm92aWRlciA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3Ioc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBFbmNvdW50ZXJlZCB1bmRlZmluZWQgcHJvdmlkZXIhIFVzdWFsbHkgdGhpcyBtZWFucyB5b3UgaGF2ZSBhIGNpcmN1bGFyIGRlcGVuZGVuY2llcyAobWlnaHQgYmUgY2F1c2VkIGJ5IHVzaW5nICdiYXJyZWwnIGluZGV4LnRzIGZpbGVzLmApKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcHJvdmlkZXJzSW5mbyA9XG4gICAgICAgICAgICAgICg8c3RyaW5nW10+cHJvdmlkZXJzLnJlZHVjZShcbiAgICAgICAgICAgICAgICAgICAoc29GYXI6IHN0cmluZ1tdLCBzZWVuUHJvdmlkZXI6IGFueSwgc2VlblByb3ZpZGVySWR4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgIGlmIChzZWVuUHJvdmlkZXJJZHggPCBwcm92aWRlcklkeCkge1xuICAgICAgICAgICAgICAgICAgICAgICBzb0Zhci5wdXNoKGAke3N0cmluZ2lmeVR5cGUoc2VlblByb3ZpZGVyKX1gKTtcbiAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VlblByb3ZpZGVySWR4ID09IHByb3ZpZGVySWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHNvRmFyLnB1c2goYD8ke3N0cmluZ2lmeVR5cGUoc2VlblByb3ZpZGVyKX0/YCk7XG4gICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlZW5Qcm92aWRlcklkeCA9PSBwcm92aWRlcklkeCArIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgc29GYXIucHVzaCgnLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gc29GYXI7XG4gICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICBbXSkpXG4gICAgICAgICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgICAgICBgSW52YWxpZCAke2RlYnVnSW5mbyA/IGRlYnVnSW5mbyA6ICdwcm92aWRlcid9IC0gb25seSBpbnN0YW5jZXMgb2YgUHJvdmlkZXIgYW5kIFR5cGUgYXJlIGFsbG93ZWQsIGdvdDogWyR7cHJvdmlkZXJzSW5mb31dYCksXG4gICAgICAgICAgICAgIHR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvdmlkZXJNZXRhLnRva2VuID09PVxuICAgICAgICAgICAgdGhpcy5fcmVmbGVjdG9yLnJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShJZGVudGlmaWVycy5BTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTKSkge1xuICAgICAgICAgIHRhcmdldEVudHJ5Q29tcG9uZW50cy5wdXNoKC4uLnRoaXMuX2dldEVudHJ5Q29tcG9uZW50c0Zyb21Qcm92aWRlcihwcm92aWRlck1ldGEsIHR5cGUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb21waWxlUHJvdmlkZXJzLnB1c2godGhpcy5nZXRQcm92aWRlck1ldGFkYXRhKHByb3ZpZGVyTWV0YSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbXBpbGVQcm92aWRlcnM7XG4gIH1cblxuICBwcml2YXRlIF92YWxpZGF0ZVByb3ZpZGVyKHByb3ZpZGVyOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAocHJvdmlkZXIuaGFzT3duUHJvcGVydHkoJ3VzZUNsYXNzJykgJiYgcHJvdmlkZXIudXNlQ2xhc3MgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3Ioc3ludGF4RXJyb3IoXG4gICAgICAgICAgYEludmFsaWQgcHJvdmlkZXIgZm9yICR7c3RyaW5naWZ5VHlwZShwcm92aWRlci5wcm92aWRlKX0uIHVzZUNsYXNzIGNhbm5vdCBiZSAke3Byb3ZpZGVyLnVzZUNsYXNzfS5cbiAgICAgICAgICAgVXN1YWxseSBpdCBoYXBwZW5zIHdoZW46XG4gICAgICAgICAgIDEuIFRoZXJlJ3MgYSBjaXJjdWxhciBkZXBlbmRlbmN5IChtaWdodCBiZSBjYXVzZWQgYnkgdXNpbmcgaW5kZXgudHMgKGJhcnJlbCkgZmlsZXMpLlxuICAgICAgICAgICAyLiBDbGFzcyB3YXMgdXNlZCBiZWZvcmUgaXQgd2FzIGRlY2xhcmVkLiBVc2UgZm9yd2FyZFJlZiBpbiB0aGlzIGNhc2UuYCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldEVudHJ5Q29tcG9uZW50c0Zyb21Qcm92aWRlcihwcm92aWRlcjogY3BsLlByb3ZpZGVyTWV0YSwgdHlwZT86IGFueSk6XG4gICAgICBjcGwuQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXSB7XG4gICAgY29uc3QgY29tcG9uZW50czogY3BsLkNvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10gPSBbXTtcbiAgICBjb25zdCBjb2xsZWN0ZWRJZGVudGlmaWVyczogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgaWYgKHByb3ZpZGVyLnVzZUZhY3RvcnkgfHwgcHJvdmlkZXIudXNlRXhpc3RpbmcgfHwgcHJvdmlkZXIudXNlQ2xhc3MpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIHN5bnRheEVycm9yKGBUaGUgQU5BTFlaRV9GT1JfRU5UUllfQ09NUE9ORU5UUyB0b2tlbiBvbmx5IHN1cHBvcnRzIHVzZVZhbHVlIWApLCB0eXBlKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBpZiAoIXByb3ZpZGVyLm11bHRpKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBzeW50YXhFcnJvcihgVGhlIEFOQUxZWkVfRk9SX0VOVFJZX0NPTVBPTkVOVFMgdG9rZW4gb25seSBzdXBwb3J0cyAnbXVsdGkgPSB0cnVlJyFgKSxcbiAgICAgICAgICB0eXBlKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBleHRyYWN0SWRlbnRpZmllcnMocHJvdmlkZXIudXNlVmFsdWUsIGNvbGxlY3RlZElkZW50aWZpZXJzKTtcbiAgICBjb2xsZWN0ZWRJZGVudGlmaWVycy5mb3JFYWNoKChpZGVudGlmaWVyKSA9PiB7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuX2dldEVudHJ5Q29tcG9uZW50TWV0YWRhdGEoaWRlbnRpZmllci5yZWZlcmVuY2UsIGZhbHNlKTtcbiAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICBjb21wb25lbnRzLnB1c2goZW50cnkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb21wb25lbnRzO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RW50cnlDb21wb25lbnRNZXRhZGF0YShkaXJUeXBlOiBhbnksIHRocm93SWZOb3RGb3VuZCA9IHRydWUpOlxuICAgICAgY3BsLkNvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhfG51bGwge1xuICAgIGNvbnN0IGRpck1ldGEgPSB0aGlzLmdldE5vbk5vcm1hbGl6ZWREaXJlY3RpdmVNZXRhZGF0YShkaXJUeXBlKTtcbiAgICBpZiAoZGlyTWV0YSAmJiBkaXJNZXRhLm1ldGFkYXRhLmlzQ29tcG9uZW50KSB7XG4gICAgICByZXR1cm4ge2NvbXBvbmVudFR5cGU6IGRpclR5cGUsIGNvbXBvbmVudEZhY3Rvcnk6IGRpck1ldGEubWV0YWRhdGEuY29tcG9uZW50RmFjdG9yeSAhfTtcbiAgICB9XG4gICAgY29uc3QgZGlyU3VtbWFyeSA9XG4gICAgICAgIDxjcGwuQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnk+dGhpcy5fbG9hZFN1bW1hcnkoZGlyVHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5EaXJlY3RpdmUpO1xuICAgIGlmIChkaXJTdW1tYXJ5ICYmIGRpclN1bW1hcnkuaXNDb21wb25lbnQpIHtcbiAgICAgIHJldHVybiB7Y29tcG9uZW50VHlwZTogZGlyVHlwZSwgY29tcG9uZW50RmFjdG9yeTogZGlyU3VtbWFyeS5jb21wb25lbnRGYWN0b3J5ICF9O1xuICAgIH1cbiAgICBpZiAodGhyb3dJZk5vdEZvdW5kKSB7XG4gICAgICB0aHJvdyBzeW50YXhFcnJvcihgJHtkaXJUeXBlLm5hbWV9IGNhbm5vdCBiZSB1c2VkIGFzIGFuIGVudHJ5IGNvbXBvbmVudC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9nZXRJbmplY3RhYmxlVHlwZU1ldGFkYXRhKHR5cGU6IFR5cGUsIGRlcGVuZGVuY2llczogYW55W118bnVsbCA9IG51bGwpOlxuICAgICAgY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEge1xuICAgIGNvbnN0IHR5cGVTdW1tYXJ5ID0gdGhpcy5fbG9hZFN1bW1hcnkodHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5JbmplY3RhYmxlKTtcbiAgICBpZiAodHlwZVN1bW1hcnkpIHtcbiAgICAgIHJldHVybiB0eXBlU3VtbWFyeS50eXBlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZ2V0VHlwZU1ldGFkYXRhKHR5cGUsIGRlcGVuZGVuY2llcyk7XG4gIH1cblxuICBnZXRQcm92aWRlck1ldGFkYXRhKHByb3ZpZGVyOiBjcGwuUHJvdmlkZXJNZXRhKTogY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgICBsZXQgY29tcGlsZURlcHM6IGNwbC5Db21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXSA9IHVuZGVmaW5lZCAhO1xuICAgIGxldCBjb21waWxlVHlwZU1ldGFkYXRhOiBjcGwuQ29tcGlsZVR5cGVNZXRhZGF0YSA9IG51bGwgITtcbiAgICBsZXQgY29tcGlsZUZhY3RvcnlNZXRhZGF0YTogY3BsLkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEgPSBudWxsICE7XG4gICAgbGV0IHRva2VuOiBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGEgPSB0aGlzLl9nZXRUb2tlbk1ldGFkYXRhKHByb3ZpZGVyLnRva2VuKTtcblxuICAgIGlmIChwcm92aWRlci51c2VDbGFzcykge1xuICAgICAgY29tcGlsZVR5cGVNZXRhZGF0YSA9XG4gICAgICAgICAgdGhpcy5fZ2V0SW5qZWN0YWJsZVR5cGVNZXRhZGF0YShwcm92aWRlci51c2VDbGFzcywgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIGNvbXBpbGVEZXBzID0gY29tcGlsZVR5cGVNZXRhZGF0YS5kaURlcHM7XG4gICAgICBpZiAocHJvdmlkZXIudG9rZW4gPT09IHByb3ZpZGVyLnVzZUNsYXNzKSB7XG4gICAgICAgIC8vIHVzZSB0aGUgY29tcGlsZVR5cGVNZXRhZGF0YSBhcyBpdCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBsaWZlY3ljbGVIb29rcy4uLlxuICAgICAgICB0b2tlbiA9IHtpZGVudGlmaWVyOiBjb21waWxlVHlwZU1ldGFkYXRhfTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyLnVzZUZhY3RvcnkpIHtcbiAgICAgIGNvbXBpbGVGYWN0b3J5TWV0YWRhdGEgPSB0aGlzLl9nZXRGYWN0b3J5TWV0YWRhdGEocHJvdmlkZXIudXNlRmFjdG9yeSwgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIGNvbXBpbGVEZXBzID0gY29tcGlsZUZhY3RvcnlNZXRhZGF0YS5kaURlcHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgIHVzZUNsYXNzOiBjb21waWxlVHlwZU1ldGFkYXRhLFxuICAgICAgdXNlVmFsdWU6IHByb3ZpZGVyLnVzZVZhbHVlLFxuICAgICAgdXNlRmFjdG9yeTogY29tcGlsZUZhY3RvcnlNZXRhZGF0YSxcbiAgICAgIHVzZUV4aXN0aW5nOiBwcm92aWRlci51c2VFeGlzdGluZyA/IHRoaXMuX2dldFRva2VuTWV0YWRhdGEocHJvdmlkZXIudXNlRXhpc3RpbmcpIDogdW5kZWZpbmVkLFxuICAgICAgZGVwczogY29tcGlsZURlcHMsXG4gICAgICBtdWx0aTogcHJvdmlkZXIubXVsdGlcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UXVlcmllc01ldGFkYXRhKFxuICAgICAgcXVlcmllczoge1trZXk6IHN0cmluZ106IFF1ZXJ5fSwgaXNWaWV3UXVlcnk6IGJvb2xlYW4sXG4gICAgICBkaXJlY3RpdmVUeXBlOiBUeXBlKTogY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhW10ge1xuICAgIGNvbnN0IHJlczogY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhW10gPSBbXTtcblxuICAgIE9iamVjdC5rZXlzKHF1ZXJpZXMpLmZvckVhY2goKHByb3BlcnR5TmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBxdWVyeSA9IHF1ZXJpZXNbcHJvcGVydHlOYW1lXTtcbiAgICAgIGlmIChxdWVyeS5pc1ZpZXdRdWVyeSA9PT0gaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgcmVzLnB1c2godGhpcy5fZ2V0UXVlcnlNZXRhZGF0YShxdWVyeSwgcHJvcGVydHlOYW1lLCBkaXJlY3RpdmVUeXBlKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfcXVlcnlWYXJCaW5kaW5ncyhzZWxlY3RvcjogYW55KTogc3RyaW5nW10geyByZXR1cm4gc2VsZWN0b3Iuc3BsaXQoL1xccyosXFxzKi8pOyB9XG5cbiAgcHJpdmF0ZSBfZ2V0UXVlcnlNZXRhZGF0YShxOiBRdWVyeSwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHR5cGVPckZ1bmM6IFR5cGV8RnVuY3Rpb24pOlxuICAgICAgY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhIHtcbiAgICBsZXQgc2VsZWN0b3JzOiBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGFbXTtcbiAgICBpZiAodHlwZW9mIHEuc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICBzZWxlY3RvcnMgPVxuICAgICAgICAgIHRoaXMuX3F1ZXJ5VmFyQmluZGluZ3MocS5zZWxlY3RvcikubWFwKHZhck5hbWUgPT4gdGhpcy5fZ2V0VG9rZW5NZXRhZGF0YSh2YXJOYW1lKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghcS5zZWxlY3Rvcikge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgIGBDYW4ndCBjb25zdHJ1Y3QgYSBxdWVyeSBmb3IgdGhlIHByb3BlcnR5IFwiJHtwcm9wZXJ0eU5hbWV9XCIgb2YgXCIke3N0cmluZ2lmeVR5cGUodHlwZU9yRnVuYyl9XCIgc2luY2UgdGhlIHF1ZXJ5IHNlbGVjdG9yIHdhc24ndCBkZWZpbmVkLmApLFxuICAgICAgICAgICAgdHlwZU9yRnVuYyk7XG4gICAgICAgIHNlbGVjdG9ycyA9IFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZWN0b3JzID0gW3RoaXMuX2dldFRva2VuTWV0YWRhdGEocS5zZWxlY3RvcildO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzZWxlY3RvcnMsXG4gICAgICBmaXJzdDogcS5maXJzdCxcbiAgICAgIGRlc2NlbmRhbnRzOiBxLmRlc2NlbmRhbnRzLCBwcm9wZXJ0eU5hbWUsXG4gICAgICByZWFkOiBxLnJlYWQgPyB0aGlzLl9nZXRUb2tlbk1ldGFkYXRhKHEucmVhZCkgOiBudWxsICFcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwb3J0RXJyb3IoZXJyb3I6IGFueSwgdHlwZT86IGFueSwgb3RoZXJUeXBlPzogYW55KSB7XG4gICAgaWYgKHRoaXMuX2Vycm9yQ29sbGVjdG9yKSB7XG4gICAgICB0aGlzLl9lcnJvckNvbGxlY3RvcihlcnJvciwgdHlwZSk7XG4gICAgICBpZiAob3RoZXJUeXBlKSB7XG4gICAgICAgIHRoaXMuX2Vycm9yQ29sbGVjdG9yKGVycm9yLCBvdGhlclR5cGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZmxhdHRlbkFycmF5KHRyZWU6IGFueVtdLCBvdXQ6IEFycmF5PGFueT4gPSBbXSk6IEFycmF5PGFueT4ge1xuICBpZiAodHJlZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHJlZS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaXRlbSA9IHJlc29sdmVGb3J3YXJkUmVmKHRyZWVbaV0pO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcbiAgICAgICAgZmxhdHRlbkFycmF5KGl0ZW0sIG91dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQucHVzaChpdGVtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gZGVkdXBlQXJyYXkoYXJyYXk6IGFueVtdKTogQXJyYXk8YW55PiB7XG4gIGlmIChhcnJheSkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoYXJyYXkpKTtcbiAgfVxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5BbmREZWR1cGVBcnJheSh0cmVlOiBhbnlbXSk6IEFycmF5PGFueT4ge1xuICByZXR1cm4gZGVkdXBlQXJyYXkoZmxhdHRlbkFycmF5KHRyZWUpKTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFR5cGUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKHZhbHVlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB8fCAodmFsdWUgaW5zdGFuY2VvZiBUeXBlKTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdElkZW50aWZpZXJzKHZhbHVlOiBhbnksIHRhcmdldElkZW50aWZpZXJzOiBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdKSB7XG4gIHZpc2l0VmFsdWUodmFsdWUsIG5ldyBfQ29tcGlsZVZhbHVlQ29udmVydGVyKCksIHRhcmdldElkZW50aWZpZXJzKTtcbn1cblxuY2xhc3MgX0NvbXBpbGVWYWx1ZUNvbnZlcnRlciBleHRlbmRzIFZhbHVlVHJhbnNmb3JtZXIge1xuICB2aXNpdE90aGVyKHZhbHVlOiBhbnksIHRhcmdldElkZW50aWZpZXJzOiBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdKTogYW55IHtcbiAgICB0YXJnZXRJZGVudGlmaWVycy5wdXNoKHtyZWZlcmVuY2U6IHZhbHVlfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5VHlwZSh0eXBlOiBhbnkpOiBzdHJpbmcge1xuICBpZiAodHlwZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgIHJldHVybiBgJHt0eXBlLm5hbWV9IGluICR7dHlwZS5maWxlUGF0aH1gO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHJpbmdpZnkodHlwZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbmRpY2F0ZXMgdGhhdCBhIGNvbXBvbmVudCBpcyBzdGlsbCBiZWluZyBsb2FkZWQgaW4gYSBzeW5jaHJvbm91cyBjb21waWxlLlxuICovXG5mdW5jdGlvbiBjb21wb25lbnRTdGlsbExvYWRpbmdFcnJvcihjb21wVHlwZTogVHlwZSkge1xuICBjb25zdCBlcnJvciA9XG4gICAgICBFcnJvcihgQ2FuJ3QgY29tcGlsZSBzeW5jaHJvbm91c2x5IGFzICR7c3RyaW5naWZ5KGNvbXBUeXBlKX0gaXMgc3RpbGwgYmVpbmcgbG9hZGVkIWApO1xuICAoZXJyb3IgYXMgYW55KVtFUlJPUl9DT01QT05FTlRfVFlQRV0gPSBjb21wVHlwZTtcbiAgcmV0dXJuIGVycm9yO1xufVxuIl19