/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { componentFactoryName, flatten, identifierName, templateSourceUrl } from '../compile_metadata';
import { ConstantPool } from '../constant_pool';
import { ViewEncapsulation } from '../core';
import { MessageBundle } from '../i18n/message_bundle';
import { Identifiers, createTokenForExternalReference } from '../identifiers';
import { HtmlParser } from '../ml_parser/html_parser';
import { DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig } from '../ml_parser/interpolation_config';
import * as o from '../output/output_ast';
import { compileNgModule as compileIvyModule } from '../render3/r3_module_compiler';
import { compilePipe as compileIvyPipe } from '../render3/r3_pipe_compiler';
import { compileComponent as compileIvyComponent, compileDirective as compileIvyDirective } from '../render3/r3_view_compiler';
import { BindingParser } from '../template_parser/binding_parser';
import { error, syntaxError, visitValue } from '../util';
import { GeneratedFile } from './generated_file';
import { listLazyRoutes, parseLazyRoute } from './lazy_routes';
import { StaticSymbol } from './static_symbol';
import { createForJitStub, serializeSummaries } from './summary_serializer';
import { ngfactoryFilePath, normalizeGenFileSuffix, splitTypescriptSuffix, summaryFileName, summaryForJitFileName } from './util';
var StubEmitFlags;
(function (StubEmitFlags) {
    StubEmitFlags[StubEmitFlags["Basic"] = 1] = "Basic";
    StubEmitFlags[StubEmitFlags["TypeCheck"] = 2] = "TypeCheck";
    StubEmitFlags[StubEmitFlags["All"] = 3] = "All";
})(StubEmitFlags || (StubEmitFlags = {}));
export class AotCompiler {
    constructor(_config, _options, _host, reflector, _metadataResolver, _templateParser, _styleCompiler, _viewCompiler, _typeCheckCompiler, _ngModuleCompiler, _injectableCompiler, _outputEmitter, _summaryResolver, _symbolResolver) {
        this._config = _config;
        this._options = _options;
        this._host = _host;
        this.reflector = reflector;
        this._metadataResolver = _metadataResolver;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._typeCheckCompiler = _typeCheckCompiler;
        this._ngModuleCompiler = _ngModuleCompiler;
        this._injectableCompiler = _injectableCompiler;
        this._outputEmitter = _outputEmitter;
        this._summaryResolver = _summaryResolver;
        this._symbolResolver = _symbolResolver;
        this._templateAstCache = new Map();
        this._analyzedFiles = new Map();
        this._analyzedFilesForInjectables = new Map();
    }
    clearCache() { this._metadataResolver.clearCache(); }
    analyzeModulesSync(rootFiles) {
        const analyzeResult = analyzeAndValidateNgModules(rootFiles, this._host, this._symbolResolver, this._metadataResolver);
        analyzeResult.ngModules.forEach(ngModule => this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, true));
        return analyzeResult;
    }
    analyzeModulesAsync(rootFiles) {
        const analyzeResult = analyzeAndValidateNgModules(rootFiles, this._host, this._symbolResolver, this._metadataResolver);
        return Promise
            .all(analyzeResult.ngModules.map(ngModule => this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, false)))
            .then(() => analyzeResult);
    }
    _analyzeFile(fileName) {
        let analyzedFile = this._analyzedFiles.get(fileName);
        if (!analyzedFile) {
            analyzedFile =
                analyzeFile(this._host, this._symbolResolver, this._metadataResolver, fileName);
            this._analyzedFiles.set(fileName, analyzedFile);
        }
        return analyzedFile;
    }
    _analyzeFileForInjectables(fileName) {
        let analyzedFile = this._analyzedFilesForInjectables.get(fileName);
        if (!analyzedFile) {
            analyzedFile = analyzeFileForInjectables(this._host, this._symbolResolver, this._metadataResolver, fileName);
            this._analyzedFilesForInjectables.set(fileName, analyzedFile);
        }
        return analyzedFile;
    }
    findGeneratedFileNames(fileName) {
        const genFileNames = [];
        const file = this._analyzeFile(fileName);
        // Make sure we create a .ngfactory if we have a injectable/directive/pipe/NgModule
        // or a reference to a non source file.
        // Note: This is overestimating the required .ngfactory files as the real calculation is harder.
        // Only do this for StubEmitFlags.Basic, as adding a type check block
        // does not change this file (as we generate type check blocks based on NgModules).
        if (this._options.allowEmptyCodegenFiles || file.directives.length || file.pipes.length ||
            file.injectables.length || file.ngModules.length || file.exportsNonSourceFiles) {
            genFileNames.push(ngfactoryFilePath(file.fileName, true));
            if (this._options.enableSummariesForJit) {
                genFileNames.push(summaryForJitFileName(file.fileName, true));
            }
        }
        const fileSuffix = normalizeGenFileSuffix(splitTypescriptSuffix(file.fileName, true)[1]);
        file.directives.forEach((dirSymbol) => {
            const compMeta = this._metadataResolver.getNonNormalizedDirectiveMetadata(dirSymbol).metadata;
            if (!compMeta.isComponent) {
                return;
            }
            // Note: compMeta is a component and therefore template is non null.
            compMeta.template.styleUrls.forEach((styleUrl) => {
                const normalizedUrl = this._host.resourceNameToFileName(styleUrl, file.fileName);
                if (!normalizedUrl) {
                    throw syntaxError(`Couldn't resolve resource ${styleUrl} relative to ${file.fileName}`);
                }
                const needsShim = (compMeta.template.encapsulation ||
                    this._config.defaultEncapsulation) === ViewEncapsulation.Emulated;
                genFileNames.push(_stylesModuleUrl(normalizedUrl, needsShim, fileSuffix));
                if (this._options.allowEmptyCodegenFiles) {
                    genFileNames.push(_stylesModuleUrl(normalizedUrl, !needsShim, fileSuffix));
                }
            });
        });
        return genFileNames;
    }
    emitBasicStub(genFileName, originalFileName) {
        const outputCtx = this._createOutputContext(genFileName);
        if (genFileName.endsWith('.ngfactory.ts')) {
            if (!originalFileName) {
                throw new Error(`Assertion error: require the original file for .ngfactory.ts stubs. File: ${genFileName}`);
            }
            const originalFile = this._analyzeFile(originalFileName);
            this._createNgFactoryStub(outputCtx, originalFile, StubEmitFlags.Basic);
        }
        else if (genFileName.endsWith('.ngsummary.ts')) {
            if (this._options.enableSummariesForJit) {
                if (!originalFileName) {
                    throw new Error(`Assertion error: require the original file for .ngsummary.ts stubs. File: ${genFileName}`);
                }
                const originalFile = this._analyzeFile(originalFileName);
                _createEmptyStub(outputCtx);
                originalFile.ngModules.forEach(ngModule => {
                    // create exports that user code can reference
                    createForJitStub(outputCtx, ngModule.type.reference);
                });
            }
        }
        else if (genFileName.endsWith('.ngstyle.ts')) {
            _createEmptyStub(outputCtx);
        }
        // Note: for the stubs, we don't need a property srcFileUrl,
        // as later on in emitAllImpls we will create the proper GeneratedFiles with the
        // correct srcFileUrl.
        // This is good as e.g. for .ngstyle.ts files we can't derive
        // the url of components based on the genFileUrl.
        return this._codegenSourceModule('unknown', outputCtx);
    }
    emitTypeCheckStub(genFileName, originalFileName) {
        const originalFile = this._analyzeFile(originalFileName);
        const outputCtx = this._createOutputContext(genFileName);
        if (genFileName.endsWith('.ngfactory.ts')) {
            this._createNgFactoryStub(outputCtx, originalFile, StubEmitFlags.TypeCheck);
        }
        return outputCtx.statements.length > 0 ?
            this._codegenSourceModule(originalFile.fileName, outputCtx) :
            null;
    }
    loadFilesAsync(fileNames, tsFiles) {
        const files = fileNames.map(fileName => this._analyzeFile(fileName));
        const loadingPromises = [];
        files.forEach(file => file.ngModules.forEach(ngModule => loadingPromises.push(this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, false))));
        const analyzedInjectables = tsFiles.map(tsFile => this._analyzeFileForInjectables(tsFile));
        return Promise.all(loadingPromises).then(_ => ({
            analyzedModules: mergeAndValidateNgFiles(files),
            analyzedInjectables: analyzedInjectables,
        }));
    }
    loadFilesSync(fileNames, tsFiles) {
        const files = fileNames.map(fileName => this._analyzeFile(fileName));
        files.forEach(file => file.ngModules.forEach(ngModule => this._metadataResolver.loadNgModuleDirectiveAndPipeMetadata(ngModule.type.reference, true)));
        const analyzedInjectables = tsFiles.map(tsFile => this._analyzeFileForInjectables(tsFile));
        return {
            analyzedModules: mergeAndValidateNgFiles(files),
            analyzedInjectables: analyzedInjectables,
        };
    }
    _createNgFactoryStub(outputCtx, file, emitFlags) {
        let componentId = 0;
        file.ngModules.forEach((ngModuleMeta, ngModuleIndex) => {
            // Note: the code below needs to executed for StubEmitFlags.Basic and StubEmitFlags.TypeCheck,
            // so we don't change the .ngfactory file too much when adding the type-check block.
            // create exports that user code can reference
            this._ngModuleCompiler.createStub(outputCtx, ngModuleMeta.type.reference);
            // add references to the symbols from the metadata.
            // These can be used by the type check block for components,
            // and they also cause TypeScript to include these files into the program too,
            // which will make them part of the analyzedFiles.
            const externalReferences = [
                // Add references that are available from all the modules and imports.
                ...ngModuleMeta.transitiveModule.directives.map(d => d.reference),
                ...ngModuleMeta.transitiveModule.pipes.map(d => d.reference),
                ...ngModuleMeta.importedModules.map(m => m.type.reference),
                ...ngModuleMeta.exportedModules.map(m => m.type.reference),
                // Add references that might be inserted by the template compiler.
                ...this._externalIdentifierReferences([Identifiers.TemplateRef, Identifiers.ElementRef]),
            ];
            const externalReferenceVars = new Map();
            externalReferences.forEach((ref, typeIndex) => {
                externalReferenceVars.set(ref, `_decl${ngModuleIndex}_${typeIndex}`);
            });
            externalReferenceVars.forEach((varName, reference) => {
                outputCtx.statements.push(o.variable(varName)
                    .set(o.NULL_EXPR.cast(o.DYNAMIC_TYPE))
                    .toDeclStmt(o.expressionType(outputCtx.importExpr(reference, /* typeParams */ null, /* useSummaries */ false))));
            });
            if (emitFlags & StubEmitFlags.TypeCheck) {
                // add the type-check block for all components of the NgModule
                ngModuleMeta.declaredDirectives.forEach((dirId) => {
                    const compMeta = this._metadataResolver.getDirectiveMetadata(dirId.reference);
                    if (!compMeta.isComponent) {
                        return;
                    }
                    componentId++;
                    this._createTypeCheckBlock(outputCtx, `${compMeta.type.reference.name}_Host_${componentId}`, ngModuleMeta, this._metadataResolver.getHostComponentMetadata(compMeta), [compMeta.type], externalReferenceVars);
                    this._createTypeCheckBlock(outputCtx, `${compMeta.type.reference.name}_${componentId}`, ngModuleMeta, compMeta, ngModuleMeta.transitiveModule.directives, externalReferenceVars);
                });
            }
        });
        if (outputCtx.statements.length === 0) {
            _createEmptyStub(outputCtx);
        }
    }
    _externalIdentifierReferences(references) {
        const result = [];
        for (let reference of references) {
            const token = createTokenForExternalReference(this.reflector, reference);
            if (token.identifier) {
                result.push(token.identifier.reference);
            }
        }
        return result;
    }
    _createTypeCheckBlock(ctx, componentId, moduleMeta, compMeta, directives, externalReferenceVars) {
        const { template: parsedTemplate, pipes: usedPipes } = this._parseTemplate(compMeta, moduleMeta, directives);
        ctx.statements.push(...this._typeCheckCompiler.compileComponent(componentId, compMeta, parsedTemplate, usedPipes, externalReferenceVars, ctx));
    }
    emitMessageBundle(analyzeResult, locale) {
        const errors = [];
        const htmlParser = new HtmlParser();
        // TODO(vicb): implicit tags & attributes
        const messageBundle = new MessageBundle(htmlParser, [], {}, locale);
        analyzeResult.files.forEach(file => {
            const compMetas = [];
            file.directives.forEach(directiveType => {
                const dirMeta = this._metadataResolver.getDirectiveMetadata(directiveType);
                if (dirMeta && dirMeta.isComponent) {
                    compMetas.push(dirMeta);
                }
            });
            compMetas.forEach(compMeta => {
                const html = compMeta.template.template;
                const interpolationConfig = InterpolationConfig.fromArray(compMeta.template.interpolation);
                errors.push(...messageBundle.updateFromTemplate(html, file.fileName, interpolationConfig));
            });
        });
        if (errors.length) {
            throw new Error(errors.map(e => e.toString()).join('\n'));
        }
        return messageBundle;
    }
    emitAllPartialModules({ ngModuleByPipeOrDirective, files }, r3Files) {
        const contextMap = new Map();
        const getContext = (fileName) => {
            if (!contextMap.has(fileName)) {
                contextMap.set(fileName, this._createOutputContext(fileName));
            }
            return contextMap.get(fileName);
        };
        files.forEach(file => this._compilePartialModule(file.fileName, ngModuleByPipeOrDirective, file.directives, file.pipes, file.ngModules, file.injectables, getContext(file.fileName)));
        r3Files.forEach(file => this._compileShallowModules(file.fileName, file.shallowModules, getContext(file.fileName)));
        return Array.from(contextMap.values())
            .map(context => ({
            fileName: context.genFilePath,
            statements: [...context.constantPool.statements, ...context.statements],
        }));
    }
    _compileShallowModules(fileName, shallowModules, context) {
        shallowModules.forEach(module => compileIvyModule(context, module, this._injectableCompiler));
    }
    _compilePartialModule(fileName, ngModuleByPipeOrDirective, directives, pipes, ngModules, injectables, context) {
        const classes = [];
        const errors = [];
        const hostBindingParser = new BindingParser(this._templateParser.expressionParser, DEFAULT_INTERPOLATION_CONFIG, null, [], errors);
        // Process all components and directives
        directives.forEach(directiveType => {
            const directiveMetadata = this._metadataResolver.getDirectiveMetadata(directiveType);
            if (directiveMetadata.isComponent) {
                const module = ngModuleByPipeOrDirective.get(directiveType);
                module ||
                    error(`Cannot determine the module for component '${identifierName(directiveMetadata.type)}'`);
                const { template: parsedTemplate, pipes: parsedPipes } = this._parseTemplate(directiveMetadata, module, module.transitiveModule.directives);
                compileIvyComponent(context, directiveMetadata, parsedPipes, parsedTemplate, this.reflector, hostBindingParser, 0 /* PartialClass */);
            }
            else {
                compileIvyDirective(context, directiveMetadata, this.reflector, hostBindingParser, 0 /* PartialClass */);
            }
        });
        pipes.forEach(pipeType => {
            const pipeMetadata = this._metadataResolver.getPipeMetadata(pipeType);
            if (pipeMetadata) {
                compileIvyPipe(context, pipeMetadata, this.reflector, 0 /* PartialClass */);
            }
        });
        injectables.forEach(injectable => this._injectableCompiler.compile(injectable, context));
    }
    emitAllPartialModules2(files) {
        // Using reduce like this is a select many pattern (where map is a select pattern)
        return files.reduce((r, file) => {
            r.push(...this._emitPartialModule2(file.fileName, file.injectables));
            return r;
        }, []);
    }
    _emitPartialModule2(fileName, injectables) {
        const context = this._createOutputContext(fileName);
        injectables.forEach(injectable => this._injectableCompiler.compile(injectable, context));
        if (context.statements && context.statements.length > 0) {
            return [{ fileName, statements: [...context.constantPool.statements, ...context.statements] }];
        }
        return [];
    }
    emitAllImpls(analyzeResult) {
        const { ngModuleByPipeOrDirective, files } = analyzeResult;
        const sourceModules = files.map(file => this._compileImplFile(file.fileName, ngModuleByPipeOrDirective, file.directives, file.pipes, file.ngModules, file.injectables));
        return flatten(sourceModules);
    }
    _compileImplFile(srcFileUrl, ngModuleByPipeOrDirective, directives, pipes, ngModules, injectables) {
        const fileSuffix = normalizeGenFileSuffix(splitTypescriptSuffix(srcFileUrl, true)[1]);
        const generatedFiles = [];
        const outputCtx = this._createOutputContext(ngfactoryFilePath(srcFileUrl, true));
        generatedFiles.push(...this._createSummary(srcFileUrl, directives, pipes, ngModules, injectables, outputCtx));
        // compile all ng modules
        ngModules.forEach((ngModuleMeta) => this._compileModule(outputCtx, ngModuleMeta));
        // compile components
        directives.forEach((dirType) => {
            const compMeta = this._metadataResolver.getDirectiveMetadata(dirType);
            if (!compMeta.isComponent) {
                return;
            }
            const ngModule = ngModuleByPipeOrDirective.get(dirType);
            if (!ngModule) {
                throw new Error(`Internal Error: cannot determine the module for component ${identifierName(compMeta.type)}!`);
            }
            // compile styles
            const componentStylesheet = this._styleCompiler.compileComponent(outputCtx, compMeta);
            // Note: compMeta is a component and therefore template is non null.
            compMeta.template.externalStylesheets.forEach((stylesheetMeta) => {
                // Note: fill non shim and shim style files as they might
                // be shared by component with and without ViewEncapsulation.
                const shim = this._styleCompiler.needsStyleShim(compMeta);
                generatedFiles.push(this._codegenStyles(srcFileUrl, compMeta, stylesheetMeta, shim, fileSuffix));
                if (this._options.allowEmptyCodegenFiles) {
                    generatedFiles.push(this._codegenStyles(srcFileUrl, compMeta, stylesheetMeta, !shim, fileSuffix));
                }
            });
            // compile components
            const compViewVars = this._compileComponent(outputCtx, compMeta, ngModule, ngModule.transitiveModule.directives, componentStylesheet, fileSuffix);
            this._compileComponentFactory(outputCtx, compMeta, ngModule, fileSuffix);
        });
        if (outputCtx.statements.length > 0 || this._options.allowEmptyCodegenFiles) {
            const srcModule = this._codegenSourceModule(srcFileUrl, outputCtx);
            generatedFiles.unshift(srcModule);
        }
        return generatedFiles;
    }
    _createSummary(srcFileName, directives, pipes, ngModules, injectables, ngFactoryCtx) {
        const symbolSummaries = this._symbolResolver.getSymbolsOf(srcFileName)
            .map(symbol => this._symbolResolver.resolveSymbol(symbol));
        const typeData = [
            ...ngModules.map(meta => ({
                summary: this._metadataResolver.getNgModuleSummary(meta.type.reference),
                metadata: this._metadataResolver.getNgModuleMetadata(meta.type.reference)
            })),
            ...directives.map(ref => ({
                summary: this._metadataResolver.getDirectiveSummary(ref),
                metadata: this._metadataResolver.getDirectiveMetadata(ref)
            })),
            ...pipes.map(ref => ({
                summary: this._metadataResolver.getPipeSummary(ref),
                metadata: this._metadataResolver.getPipeMetadata(ref)
            })),
            ...injectables.map(ref => ({
                summary: this._metadataResolver.getInjectableSummary(ref.symbol),
                metadata: this._metadataResolver.getInjectableSummary(ref.symbol).type
            }))
        ];
        const forJitOutputCtx = this._options.enableSummariesForJit ?
            this._createOutputContext(summaryForJitFileName(srcFileName, true)) :
            null;
        const { json, exportAs } = serializeSummaries(srcFileName, forJitOutputCtx, this._summaryResolver, this._symbolResolver, symbolSummaries, typeData);
        exportAs.forEach((entry) => {
            ngFactoryCtx.statements.push(o.variable(entry.exportAs).set(ngFactoryCtx.importExpr(entry.symbol)).toDeclStmt(null, [
                o.StmtModifier.Exported
            ]));
        });
        const summaryJson = new GeneratedFile(srcFileName, summaryFileName(srcFileName), json);
        const result = [summaryJson];
        if (forJitOutputCtx) {
            result.push(this._codegenSourceModule(srcFileName, forJitOutputCtx));
        }
        return result;
    }
    _compileModule(outputCtx, ngModule) {
        const providers = [];
        if (this._options.locale) {
            const normalizedLocale = this._options.locale.replace(/_/g, '-');
            providers.push({
                token: createTokenForExternalReference(this.reflector, Identifiers.LOCALE_ID),
                useValue: normalizedLocale,
            });
        }
        if (this._options.i18nFormat) {
            providers.push({
                token: createTokenForExternalReference(this.reflector, Identifiers.TRANSLATIONS_FORMAT),
                useValue: this._options.i18nFormat
            });
        }
        this._ngModuleCompiler.compile(outputCtx, ngModule, providers);
    }
    _compileComponentFactory(outputCtx, compMeta, ngModule, fileSuffix) {
        const hostMeta = this._metadataResolver.getHostComponentMetadata(compMeta);
        const hostViewFactoryVar = this._compileComponent(outputCtx, hostMeta, ngModule, [compMeta.type], null, fileSuffix)
            .viewClassVar;
        const compFactoryVar = componentFactoryName(compMeta.type.reference);
        const inputsExprs = [];
        for (let propName in compMeta.inputs) {
            const templateName = compMeta.inputs[propName];
            // Don't quote so that the key gets minified...
            inputsExprs.push(new o.LiteralMapEntry(propName, o.literal(templateName), false));
        }
        const outputsExprs = [];
        for (let propName in compMeta.outputs) {
            const templateName = compMeta.outputs[propName];
            // Don't quote so that the key gets minified...
            outputsExprs.push(new o.LiteralMapEntry(propName, o.literal(templateName), false));
        }
        outputCtx.statements.push(o.variable(compFactoryVar)
            .set(o.importExpr(Identifiers.createComponentFactory).callFn([
            o.literal(compMeta.selector), outputCtx.importExpr(compMeta.type.reference),
            o.variable(hostViewFactoryVar), new o.LiteralMapExpr(inputsExprs),
            new o.LiteralMapExpr(outputsExprs),
            o.literalArr(compMeta.template.ngContentSelectors.map(selector => o.literal(selector)))
        ]))
            .toDeclStmt(o.importType(Identifiers.ComponentFactory, [o.expressionType(outputCtx.importExpr(compMeta.type.reference))], [o.TypeModifier.Const]), [o.StmtModifier.Final, o.StmtModifier.Exported]));
    }
    _compileComponent(outputCtx, compMeta, ngModule, directiveIdentifiers, componentStyles, fileSuffix) {
        const { template: parsedTemplate, pipes: usedPipes } = this._parseTemplate(compMeta, ngModule, directiveIdentifiers);
        const stylesExpr = componentStyles ? o.variable(componentStyles.stylesVar) : o.literalArr([]);
        const viewResult = this._viewCompiler.compileComponent(outputCtx, compMeta, parsedTemplate, stylesExpr, usedPipes);
        if (componentStyles) {
            _resolveStyleStatements(this._symbolResolver, componentStyles, this._styleCompiler.needsStyleShim(compMeta), fileSuffix);
        }
        return viewResult;
    }
    _parseTemplate(compMeta, ngModule, directiveIdentifiers) {
        if (this._templateAstCache.has(compMeta.type.reference)) {
            return this._templateAstCache.get(compMeta.type.reference);
        }
        const preserveWhitespaces = compMeta.template.preserveWhitespaces;
        const directives = directiveIdentifiers.map(dir => this._metadataResolver.getDirectiveSummary(dir.reference));
        const pipes = ngModule.transitiveModule.pipes.map(pipe => this._metadataResolver.getPipeSummary(pipe.reference));
        const result = this._templateParser.parse(compMeta, compMeta.template.htmlAst, directives, pipes, ngModule.schemas, templateSourceUrl(ngModule.type, compMeta, compMeta.template), preserveWhitespaces);
        this._templateAstCache.set(compMeta.type.reference, result);
        return result;
    }
    _createOutputContext(genFilePath) {
        const importExpr = (symbol, typeParams = null, useSummaries = true) => {
            if (!(symbol instanceof StaticSymbol)) {
                throw new Error(`Internal error: unknown identifier ${JSON.stringify(symbol)}`);
            }
            const arity = this._symbolResolver.getTypeArity(symbol) || 0;
            const { filePath, name, members } = this._symbolResolver.getImportAs(symbol, useSummaries) || symbol;
            const importModule = this._fileNameToModuleName(filePath, genFilePath);
            // It should be good enough to compare filePath to genFilePath and if they are equal
            // there is a self reference. However, ngfactory files generate to .ts but their
            // symbols have .d.ts so a simple compare is insufficient. They should be canonical
            // and is tracked by #17705.
            const selfReference = this._fileNameToModuleName(genFilePath, genFilePath);
            const moduleName = importModule === selfReference ? null : importModule;
            // If we are in a type expression that refers to a generic type then supply
            // the required type parameters. If there were not enough type parameters
            // supplied, supply any as the type. Outside a type expression the reference
            // should not supply type parameters and be treated as a simple value reference
            // to the constructor function itself.
            const suppliedTypeParams = typeParams || [];
            const missingTypeParamsCount = arity - suppliedTypeParams.length;
            const allTypeParams = suppliedTypeParams.concat(new Array(missingTypeParamsCount).fill(o.DYNAMIC_TYPE));
            return members.reduce((expr, memberName) => expr.prop(memberName), o.importExpr(new o.ExternalReference(moduleName, name, null), allTypeParams));
        };
        return { statements: [], genFilePath, importExpr, constantPool: new ConstantPool() };
    }
    _fileNameToModuleName(importedFilePath, containingFilePath) {
        return this._summaryResolver.getKnownModuleName(importedFilePath) ||
            this._symbolResolver.getKnownModuleName(importedFilePath) ||
            this._host.fileNameToModuleName(importedFilePath, containingFilePath);
    }
    _codegenStyles(srcFileUrl, compMeta, stylesheetMetadata, isShimmed, fileSuffix) {
        const outputCtx = this._createOutputContext(_stylesModuleUrl(stylesheetMetadata.moduleUrl, isShimmed, fileSuffix));
        const compiledStylesheet = this._styleCompiler.compileStyles(outputCtx, compMeta, stylesheetMetadata, isShimmed);
        _resolveStyleStatements(this._symbolResolver, compiledStylesheet, isShimmed, fileSuffix);
        return this._codegenSourceModule(srcFileUrl, outputCtx);
    }
    _codegenSourceModule(srcFileUrl, ctx) {
        return new GeneratedFile(srcFileUrl, ctx.genFilePath, ctx.statements);
    }
    listLazyRoutes(entryRoute, analyzedModules) {
        const self = this;
        if (entryRoute) {
            const symbol = parseLazyRoute(entryRoute, this.reflector).referencedModule;
            return visitLazyRoute(symbol);
        }
        else if (analyzedModules) {
            const allLazyRoutes = [];
            for (const ngModule of analyzedModules.ngModules) {
                const lazyRoutes = listLazyRoutes(ngModule, this.reflector);
                for (const lazyRoute of lazyRoutes) {
                    allLazyRoutes.push(lazyRoute);
                }
            }
            return allLazyRoutes;
        }
        else {
            throw new Error(`Either route or analyzedModules has to be specified!`);
        }
        function visitLazyRoute(symbol, seenRoutes = new Set(), allLazyRoutes = []) {
            // Support pointing to default exports, but stop recursing there,
            // as the StaticReflector does not yet support default exports.
            if (seenRoutes.has(symbol) || !symbol.name) {
                return allLazyRoutes;
            }
            seenRoutes.add(symbol);
            const lazyRoutes = listLazyRoutes(self._metadataResolver.getNgModuleMetadata(symbol, true), self.reflector);
            for (const lazyRoute of lazyRoutes) {
                allLazyRoutes.push(lazyRoute);
                visitLazyRoute(lazyRoute.referencedModule, seenRoutes, allLazyRoutes);
            }
            return allLazyRoutes;
        }
    }
}
function _createEmptyStub(outputCtx) {
    // Note: We need to produce at least one import statement so that
    // TypeScript knows that the file is an es6 module. Otherwise our generated
    // exports / imports won't be emitted properly by TypeScript.
    outputCtx.statements.push(o.importExpr(Identifiers.ComponentFactory).toStmt());
}
function _resolveStyleStatements(symbolResolver, compileResult, needsShim, fileSuffix) {
    compileResult.dependencies.forEach((dep) => {
        dep.setValue(symbolResolver.getStaticSymbol(_stylesModuleUrl(dep.moduleUrl, needsShim, fileSuffix), dep.name));
    });
}
function _stylesModuleUrl(stylesheetUrl, shim, suffix) {
    return `${stylesheetUrl}${shim ? '.shim' : ''}.ngstyle${suffix}`;
}
export function analyzeNgModules(fileNames, host, staticSymbolResolver, metadataResolver) {
    const files = _analyzeFilesIncludingNonProgramFiles(fileNames, host, staticSymbolResolver, metadataResolver);
    return mergeAnalyzedFiles(files);
}
export function analyzeAndValidateNgModules(fileNames, host, staticSymbolResolver, metadataResolver) {
    return validateAnalyzedModules(analyzeNgModules(fileNames, host, staticSymbolResolver, metadataResolver));
}
function validateAnalyzedModules(analyzedModules) {
    if (analyzedModules.symbolsMissingModule && analyzedModules.symbolsMissingModule.length) {
        const messages = analyzedModules.symbolsMissingModule.map(s => `Cannot determine the module for class ${s.name} in ${s.filePath}! Add ${s.name} to the NgModule to fix it.`);
        throw syntaxError(messages.join('\n'));
    }
    return analyzedModules;
}
// Analyzes all of the program files,
// including files that are not part of the program
// but are referenced by an NgModule.
function _analyzeFilesIncludingNonProgramFiles(fileNames, host, staticSymbolResolver, metadataResolver) {
    const seenFiles = new Set();
    const files = [];
    const visitFile = (fileName) => {
        if (seenFiles.has(fileName) || !host.isSourceFile(fileName)) {
            return false;
        }
        seenFiles.add(fileName);
        const analyzedFile = analyzeFile(host, staticSymbolResolver, metadataResolver, fileName);
        files.push(analyzedFile);
        analyzedFile.ngModules.forEach(ngModule => {
            ngModule.transitiveModule.modules.forEach(modMeta => visitFile(modMeta.reference.filePath));
        });
    };
    fileNames.forEach((fileName) => visitFile(fileName));
    return files;
}
export function analyzeFile(host, staticSymbolResolver, metadataResolver, fileName) {
    const directives = [];
    const pipes = [];
    const injectables = [];
    const ngModules = [];
    const hasDecorators = staticSymbolResolver.hasDecorators(fileName);
    let exportsNonSourceFiles = false;
    // Don't analyze .d.ts files that have no decorators as a shortcut
    // to speed up the analysis. This prevents us from
    // resolving the references in these files.
    // Note: exportsNonSourceFiles is only needed when compiling with summaries,
    // which is not the case when .d.ts files are treated as input files.
    if (!fileName.endsWith('.d.ts') || hasDecorators) {
        staticSymbolResolver.getSymbolsOf(fileName).forEach((symbol) => {
            const resolvedSymbol = staticSymbolResolver.resolveSymbol(symbol);
            const symbolMeta = resolvedSymbol.metadata;
            if (!symbolMeta || symbolMeta.__symbolic === 'error') {
                return;
            }
            let isNgSymbol = false;
            if (symbolMeta.__symbolic === 'class') {
                if (metadataResolver.isDirective(symbol)) {
                    isNgSymbol = true;
                    directives.push(symbol);
                }
                else if (metadataResolver.isPipe(symbol)) {
                    isNgSymbol = true;
                    pipes.push(symbol);
                }
                else if (metadataResolver.isNgModule(symbol)) {
                    const ngModule = metadataResolver.getNgModuleMetadata(symbol, false);
                    if (ngModule) {
                        isNgSymbol = true;
                        ngModules.push(ngModule);
                    }
                }
                else if (metadataResolver.isInjectable(symbol)) {
                    isNgSymbol = true;
                    const injectable = metadataResolver.getInjectableMetadata(symbol, null, false);
                    if (injectable) {
                        injectables.push(injectable);
                    }
                }
            }
            if (!isNgSymbol) {
                exportsNonSourceFiles =
                    exportsNonSourceFiles || isValueExportingNonSourceFile(host, symbolMeta);
            }
        });
    }
    return {
        fileName, directives, pipes, ngModules, injectables, exportsNonSourceFiles,
    };
}
export function analyzeFileForInjectables(host, staticSymbolResolver, metadataResolver, fileName) {
    const injectables = [];
    const shallowModules = [];
    if (staticSymbolResolver.hasDecorators(fileName)) {
        staticSymbolResolver.getSymbolsOf(fileName).forEach((symbol) => {
            const resolvedSymbol = staticSymbolResolver.resolveSymbol(symbol);
            const symbolMeta = resolvedSymbol.metadata;
            if (!symbolMeta || symbolMeta.__symbolic === 'error') {
                return;
            }
            let isNgSymbol = false;
            if (symbolMeta.__symbolic === 'class') {
                if (metadataResolver.isInjectable(symbol)) {
                    isNgSymbol = true;
                    const injectable = metadataResolver.getInjectableMetadata(symbol, null, false);
                    if (injectable) {
                        injectables.push(injectable);
                    }
                }
                else if (metadataResolver.isNgModule(symbol)) {
                    isNgSymbol = true;
                    const module = metadataResolver.getShallowModuleMetadata(symbol);
                    if (module) {
                        shallowModules.push(module);
                    }
                }
            }
        });
    }
    return { fileName, injectables, shallowModules };
}
function isValueExportingNonSourceFile(host, metadata) {
    let exportsNonSourceFiles = false;
    class Visitor {
        visitArray(arr, context) { arr.forEach(v => visitValue(v, this, context)); }
        visitStringMap(map, context) {
            Object.keys(map).forEach((key) => visitValue(map[key], this, context));
        }
        visitPrimitive(value, context) { }
        visitOther(value, context) {
            if (value instanceof StaticSymbol && !host.isSourceFile(value.filePath)) {
                exportsNonSourceFiles = true;
            }
        }
    }
    visitValue(metadata, new Visitor(), null);
    return exportsNonSourceFiles;
}
export function mergeAnalyzedFiles(analyzedFiles) {
    const allNgModules = [];
    const ngModuleByPipeOrDirective = new Map();
    const allPipesAndDirectives = new Set();
    analyzedFiles.forEach(af => {
        af.ngModules.forEach(ngModule => {
            allNgModules.push(ngModule);
            ngModule.declaredDirectives.forEach(d => ngModuleByPipeOrDirective.set(d.reference, ngModule));
            ngModule.declaredPipes.forEach(p => ngModuleByPipeOrDirective.set(p.reference, ngModule));
        });
        af.directives.forEach(d => allPipesAndDirectives.add(d));
        af.pipes.forEach(p => allPipesAndDirectives.add(p));
    });
    const symbolsMissingModule = [];
    allPipesAndDirectives.forEach(ref => {
        if (!ngModuleByPipeOrDirective.has(ref)) {
            symbolsMissingModule.push(ref);
        }
    });
    return {
        ngModules: allNgModules,
        ngModuleByPipeOrDirective,
        symbolsMissingModule,
        files: analyzedFiles
    };
}
function mergeAndValidateNgFiles(files) {
    return validateAnalyzedModules(mergeAnalyzedFiles(files));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvYW90L2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBbVYsb0JBQW9CLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxpQkFBaUIsRUFBaUIsTUFBTSxxQkFBcUIsQ0FBQztBQUV2YyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsV0FBVyxFQUFFLCtCQUErQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHNUUsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3BELE9BQU8sRUFBQyw0QkFBNEIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBR3BHLE9BQU8sS0FBSyxDQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFMUMsT0FBTyxFQUFDLGVBQWUsSUFBSSxnQkFBZ0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxXQUFXLElBQUksY0FBYyxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFFMUUsT0FBTyxFQUFDLGdCQUFnQixJQUFJLG1CQUFtQixFQUFFLGdCQUFnQixJQUFJLG1CQUFtQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFHN0gsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBR2hFLE9BQU8sRUFBOEIsS0FBSyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFNcEYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FB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QyxDQUFDLENBQUM7UUFDNUYsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pELEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLG9CQUFvQixHQUFtQixFQUFFLENBQUM7SUFDaEQscUJBQXFCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDO1FBQ0wsU0FBUyxFQUFFLFlBQVk7UUFDdkIseUJBQXlCO1FBQ3pCLG9CQUFvQjtRQUNwQixLQUFLLEVBQUUsYUFBYTtLQUNyQixDQUFDO0FBQ0osQ0FBQztBQUVELGlDQUFpQyxLQUF1QjtJQUN0RCxNQUFNLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUM1RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnksIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGEsIENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLCBDb21waWxlTmdNb2R1bGVTdW1tYXJ5LCBDb21waWxlUGlwZU1ldGFkYXRhLCBDb21waWxlUGlwZVN1bW1hcnksIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLCBDb21waWxlU2hhbGxvd01vZHVsZU1ldGFkYXRhLCBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhLCBDb21waWxlU3VtbWFyeUtpbmQsIENvbXBpbGVUeXBlTWV0YWRhdGEsIENvbXBpbGVUeXBlU3VtbWFyeSwgY29tcG9uZW50RmFjdG9yeU5hbWUsIGZsYXR0ZW4sIGlkZW50aWZpZXJOYW1lLCB0ZW1wbGF0ZVNvdXJjZVVybCwgdG9rZW5SZWZlcmVuY2V9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtDb21waWxlckNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICcuLi9jb25zdGFudF9wb29sJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtNZXNzYWdlQnVuZGxlfSBmcm9tICcuLi9pMThuL21lc3NhZ2VfYnVuZGxlJztcbmltcG9ydCB7SWRlbnRpZmllcnMsIGNyZWF0ZVRva2VuRm9yRXh0ZXJuYWxSZWZlcmVuY2V9IGZyb20gJy4uL2lkZW50aWZpZXJzJztcbmltcG9ydCB7SW5qZWN0YWJsZUNvbXBpbGVyfSBmcm9tICcuLi9pbmplY3RhYmxlX2NvbXBpbGVyJztcbmltcG9ydCB7Q29tcGlsZU1ldGFkYXRhUmVzb2x2ZXJ9IGZyb20gJy4uL21ldGFkYXRhX3Jlc29sdmVyJztcbmltcG9ydCB7SHRtbFBhcnNlcn0gZnJvbSAnLi4vbWxfcGFyc2VyL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7REVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgSW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi4vbWxfcGFyc2VyL2ludGVycG9sYXRpb25fY29uZmlnJztcbmltcG9ydCB7TmdNb2R1bGVDb21waWxlcn0gZnJvbSAnLi4vbmdfbW9kdWxlX2NvbXBpbGVyJztcbmltcG9ydCB7T3V0cHV0RW1pdHRlcn0gZnJvbSAnLi4vb3V0cHV0L2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlRXJyb3J9IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtjb21waWxlTmdNb2R1bGUgYXMgY29tcGlsZUl2eU1vZHVsZX0gZnJvbSAnLi4vcmVuZGVyMy9yM19tb2R1bGVfY29tcGlsZXInO1xuaW1wb3J0IHtjb21waWxlUGlwZSBhcyBjb21waWxlSXZ5UGlwZX0gZnJvbSAnLi4vcmVuZGVyMy9yM19waXBlX2NvbXBpbGVyJztcbmltcG9ydCB7T3V0cHV0TW9kZX0gZnJvbSAnLi4vcmVuZGVyMy9yM190eXBlcyc7XG5pbXBvcnQge2NvbXBpbGVDb21wb25lbnQgYXMgY29tcGlsZUl2eUNvbXBvbmVudCwgY29tcGlsZURpcmVjdGl2ZSBhcyBjb21waWxlSXZ5RGlyZWN0aXZlfSBmcm9tICcuLi9yZW5kZXIzL3IzX3ZpZXdfY29tcGlsZXInO1xuaW1wb3J0IHtDb21waWxlZFN0eWxlc2hlZXQsIFN0eWxlQ29tcGlsZXJ9IGZyb20gJy4uL3N0eWxlX2NvbXBpbGVyJztcbmltcG9ydCB7U3VtbWFyeVJlc29sdmVyfSBmcm9tICcuLi9zdW1tYXJ5X3Jlc29sdmVyJztcbmltcG9ydCB7QmluZGluZ1BhcnNlcn0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyJztcbmltcG9ydCB7VGVtcGxhdGVBc3R9IGZyb20gJy4uL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9hc3QnO1xuaW1wb3J0IHtUZW1wbGF0ZVBhcnNlcn0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL3RlbXBsYXRlX3BhcnNlcic7XG5pbXBvcnQge091dHB1dENvbnRleHQsIFZhbHVlVmlzaXRvciwgZXJyb3IsIHN5bnRheEVycm9yLCB2aXNpdFZhbHVlfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7VHlwZUNoZWNrQ29tcGlsZXJ9IGZyb20gJy4uL3ZpZXdfY29tcGlsZXIvdHlwZV9jaGVja19jb21waWxlcic7XG5pbXBvcnQge1ZpZXdDb21waWxlUmVzdWx0LCBWaWV3Q29tcGlsZXJ9IGZyb20gJy4uL3ZpZXdfY29tcGlsZXIvdmlld19jb21waWxlcic7XG5cbmltcG9ydCB7QW90Q29tcGlsZXJIb3N0fSBmcm9tICcuL2NvbXBpbGVyX2hvc3QnO1xuaW1wb3J0IHtBb3RDb21waWxlck9wdGlvbnN9IGZyb20gJy4vY29tcGlsZXJfb3B0aW9ucyc7XG5pbXBvcnQge0dlbmVyYXRlZEZpbGV9IGZyb20gJy4vZ2VuZXJhdGVkX2ZpbGUnO1xuaW1wb3J0IHtMYXp5Um91dGUsIGxpc3RMYXp5Um91dGVzLCBwYXJzZUxhenlSb3V0ZX0gZnJvbSAnLi9sYXp5X3JvdXRlcyc7XG5pbXBvcnQge1BhcnRpYWxNb2R1bGV9IGZyb20gJy4vcGFydGlhbF9tb2R1bGUnO1xuaW1wb3J0IHtTdGF0aWNSZWZsZWN0b3J9IGZyb20gJy4vc3RhdGljX3JlZmxlY3Rvcic7XG5pbXBvcnQge1N0YXRpY1N5bWJvbH0gZnJvbSAnLi9zdGF0aWNfc3ltYm9sJztcbmltcG9ydCB7UmVzb2x2ZWRTdGF0aWNTeW1ib2wsIFN0YXRpY1N5bWJvbFJlc29sdmVyfSBmcm9tICcuL3N0YXRpY19zeW1ib2xfcmVzb2x2ZXInO1xuaW1wb3J0IHtjcmVhdGVGb3JKaXRTdHViLCBzZXJpYWxpemVTdW1tYXJpZXN9IGZyb20gJy4vc3VtbWFyeV9zZXJpYWxpemVyJztcbmltcG9ydCB7bmdmYWN0b3J5RmlsZVBhdGgsIG5vcm1hbGl6ZUdlbkZpbGVTdWZmaXgsIHNwbGl0VHlwZXNjcmlwdFN1ZmZpeCwgc3VtbWFyeUZpbGVOYW1lLCBzdW1tYXJ5Rm9ySml0RmlsZU5hbWUsIHN1bW1hcnlGb3JKaXROYW1lfSBmcm9tICcuL3V0aWwnO1xuXG5lbnVtIFN0dWJFbWl0RmxhZ3Mge1xuICBCYXNpYyA9IDEgPDwgMCxcbiAgVHlwZUNoZWNrID0gMSA8PCAxLFxuICBBbGwgPSBUeXBlQ2hlY2sgfCBCYXNpY1xufVxuXG5leHBvcnQgY2xhc3MgQW90Q29tcGlsZXIge1xuICBwcml2YXRlIF90ZW1wbGF0ZUFzdENhY2hlID1cbiAgICAgIG5ldyBNYXA8U3RhdGljU3ltYm9sLCB7dGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sIHBpcGVzOiBDb21waWxlUGlwZVN1bW1hcnlbXX0+KCk7XG4gIHByaXZhdGUgX2FuYWx5emVkRmlsZXMgPSBuZXcgTWFwPHN0cmluZywgTmdBbmFseXplZEZpbGU+KCk7XG4gIHByaXZhdGUgX2FuYWx5emVkRmlsZXNGb3JJbmplY3RhYmxlcyA9IG5ldyBNYXA8c3RyaW5nLCBOZ0FuYWx5emVkRmlsZVdpdGhJbmplY3RhYmxlcz4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2NvbmZpZzogQ29tcGlsZXJDb25maWcsIHByaXZhdGUgX29wdGlvbnM6IEFvdENvbXBpbGVyT3B0aW9ucyxcbiAgICAgIHByaXZhdGUgX2hvc3Q6IEFvdENvbXBpbGVySG9zdCwgcmVhZG9ubHkgcmVmbGVjdG9yOiBTdGF0aWNSZWZsZWN0b3IsXG4gICAgICBwcml2YXRlIF9tZXRhZGF0YVJlc29sdmVyOiBDb21waWxlTWV0YWRhdGFSZXNvbHZlciwgcHJpdmF0ZSBfdGVtcGxhdGVQYXJzZXI6IFRlbXBsYXRlUGFyc2VyLFxuICAgICAgcHJpdmF0ZSBfc3R5bGVDb21waWxlcjogU3R5bGVDb21waWxlciwgcHJpdmF0ZSBfdmlld0NvbXBpbGVyOiBWaWV3Q29tcGlsZXIsXG4gICAgICBwcml2YXRlIF90eXBlQ2hlY2tDb21waWxlcjogVHlwZUNoZWNrQ29tcGlsZXIsIHByaXZhdGUgX25nTW9kdWxlQ29tcGlsZXI6IE5nTW9kdWxlQ29tcGlsZXIsXG4gICAgICBwcml2YXRlIF9pbmplY3RhYmxlQ29tcGlsZXI6IEluamVjdGFibGVDb21waWxlciwgcHJpdmF0ZSBfb3V0cHV0RW1pdHRlcjogT3V0cHV0RW1pdHRlcixcbiAgICAgIHByaXZhdGUgX3N1bW1hcnlSZXNvbHZlcjogU3VtbWFyeVJlc29sdmVyPFN0YXRpY1N5bWJvbD4sXG4gICAgICBwcml2YXRlIF9zeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIpIHt9XG5cbiAgY2xlYXJDYWNoZSgpIHsgdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5jbGVhckNhY2hlKCk7IH1cblxuICBhbmFseXplTW9kdWxlc1N5bmMocm9vdEZpbGVzOiBzdHJpbmdbXSk6IE5nQW5hbHl6ZWRNb2R1bGVzIHtcbiAgICBjb25zdCBhbmFseXplUmVzdWx0ID0gYW5hbHl6ZUFuZFZhbGlkYXRlTmdNb2R1bGVzKFxuICAgICAgICByb290RmlsZXMsIHRoaXMuX2hvc3QsIHRoaXMuX3N5bWJvbFJlc29sdmVyLCB0aGlzLl9tZXRhZGF0YVJlc29sdmVyKTtcbiAgICBhbmFseXplUmVzdWx0Lm5nTW9kdWxlcy5mb3JFYWNoKFxuICAgICAgICBuZ01vZHVsZSA9PiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YShcbiAgICAgICAgICAgIG5nTW9kdWxlLnR5cGUucmVmZXJlbmNlLCB0cnVlKSk7XG4gICAgcmV0dXJuIGFuYWx5emVSZXN1bHQ7XG4gIH1cblxuICBhbmFseXplTW9kdWxlc0FzeW5jKHJvb3RGaWxlczogc3RyaW5nW10pOiBQcm9taXNlPE5nQW5hbHl6ZWRNb2R1bGVzPiB7XG4gICAgY29uc3QgYW5hbHl6ZVJlc3VsdCA9IGFuYWx5emVBbmRWYWxpZGF0ZU5nTW9kdWxlcyhcbiAgICAgICAgcm9vdEZpbGVzLCB0aGlzLl9ob3N0LCB0aGlzLl9zeW1ib2xSZXNvbHZlciwgdGhpcy5fbWV0YWRhdGFSZXNvbHZlcik7XG4gICAgcmV0dXJuIFByb21pc2VcbiAgICAgICAgLmFsbChhbmFseXplUmVzdWx0Lm5nTW9kdWxlcy5tYXAoXG4gICAgICAgICAgICBuZ01vZHVsZSA9PiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YShcbiAgICAgICAgICAgICAgICBuZ01vZHVsZS50eXBlLnJlZmVyZW5jZSwgZmFsc2UpKSlcbiAgICAgICAgLnRoZW4oKCkgPT4gYW5hbHl6ZVJlc3VsdCk7XG4gIH1cblxuICBwcml2YXRlIF9hbmFseXplRmlsZShmaWxlTmFtZTogc3RyaW5nKTogTmdBbmFseXplZEZpbGUge1xuICAgIGxldCBhbmFseXplZEZpbGUgPSB0aGlzLl9hbmFseXplZEZpbGVzLmdldChmaWxlTmFtZSk7XG4gICAgaWYgKCFhbmFseXplZEZpbGUpIHtcbiAgICAgIGFuYWx5emVkRmlsZSA9XG4gICAgICAgICAgYW5hbHl6ZUZpbGUodGhpcy5faG9zdCwgdGhpcy5fc3ltYm9sUmVzb2x2ZXIsIHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIsIGZpbGVOYW1lKTtcbiAgICAgIHRoaXMuX2FuYWx5emVkRmlsZXMuc2V0KGZpbGVOYW1lLCBhbmFseXplZEZpbGUpO1xuICAgIH1cbiAgICByZXR1cm4gYW5hbHl6ZWRGaWxlO1xuICB9XG5cbiAgcHJpdmF0ZSBfYW5hbHl6ZUZpbGVGb3JJbmplY3RhYmxlcyhmaWxlTmFtZTogc3RyaW5nKTogTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXMge1xuICAgIGxldCBhbmFseXplZEZpbGUgPSB0aGlzLl9hbmFseXplZEZpbGVzRm9ySW5qZWN0YWJsZXMuZ2V0KGZpbGVOYW1lKTtcbiAgICBpZiAoIWFuYWx5emVkRmlsZSkge1xuICAgICAgYW5hbHl6ZWRGaWxlID0gYW5hbHl6ZUZpbGVGb3JJbmplY3RhYmxlcyhcbiAgICAgICAgICB0aGlzLl9ob3N0LCB0aGlzLl9zeW1ib2xSZXNvbHZlciwgdGhpcy5fbWV0YWRhdGFSZXNvbHZlciwgZmlsZU5hbWUpO1xuICAgICAgdGhpcy5fYW5hbHl6ZWRGaWxlc0ZvckluamVjdGFibGVzLnNldChmaWxlTmFtZSwgYW5hbHl6ZWRGaWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIGFuYWx5emVkRmlsZTtcbiAgfVxuXG4gIGZpbmRHZW5lcmF0ZWRGaWxlTmFtZXMoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBnZW5GaWxlTmFtZXM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgZmlsZSA9IHRoaXMuX2FuYWx5emVGaWxlKGZpbGVOYW1lKTtcbiAgICAvLyBNYWtlIHN1cmUgd2UgY3JlYXRlIGEgLm5nZmFjdG9yeSBpZiB3ZSBoYXZlIGEgaW5qZWN0YWJsZS9kaXJlY3RpdmUvcGlwZS9OZ01vZHVsZVxuICAgIC8vIG9yIGEgcmVmZXJlbmNlIHRvIGEgbm9uIHNvdXJjZSBmaWxlLlxuICAgIC8vIE5vdGU6IFRoaXMgaXMgb3ZlcmVzdGltYXRpbmcgdGhlIHJlcXVpcmVkIC5uZ2ZhY3RvcnkgZmlsZXMgYXMgdGhlIHJlYWwgY2FsY3VsYXRpb24gaXMgaGFyZGVyLlxuICAgIC8vIE9ubHkgZG8gdGhpcyBmb3IgU3R1YkVtaXRGbGFncy5CYXNpYywgYXMgYWRkaW5nIGEgdHlwZSBjaGVjayBibG9ja1xuICAgIC8vIGRvZXMgbm90IGNoYW5nZSB0aGlzIGZpbGUgKGFzIHdlIGdlbmVyYXRlIHR5cGUgY2hlY2sgYmxvY2tzIGJhc2VkIG9uIE5nTW9kdWxlcykuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuYWxsb3dFbXB0eUNvZGVnZW5GaWxlcyB8fCBmaWxlLmRpcmVjdGl2ZXMubGVuZ3RoIHx8IGZpbGUucGlwZXMubGVuZ3RoIHx8XG4gICAgICAgIGZpbGUuaW5qZWN0YWJsZXMubGVuZ3RoIHx8IGZpbGUubmdNb2R1bGVzLmxlbmd0aCB8fCBmaWxlLmV4cG9ydHNOb25Tb3VyY2VGaWxlcykge1xuICAgICAgZ2VuRmlsZU5hbWVzLnB1c2gobmdmYWN0b3J5RmlsZVBhdGgoZmlsZS5maWxlTmFtZSwgdHJ1ZSkpO1xuICAgICAgaWYgKHRoaXMuX29wdGlvbnMuZW5hYmxlU3VtbWFyaWVzRm9ySml0KSB7XG4gICAgICAgIGdlbkZpbGVOYW1lcy5wdXNoKHN1bW1hcnlGb3JKaXRGaWxlTmFtZShmaWxlLmZpbGVOYW1lLCB0cnVlKSk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGZpbGVTdWZmaXggPSBub3JtYWxpemVHZW5GaWxlU3VmZml4KHNwbGl0VHlwZXNjcmlwdFN1ZmZpeChmaWxlLmZpbGVOYW1lLCB0cnVlKVsxXSk7XG4gICAgZmlsZS5kaXJlY3RpdmVzLmZvckVhY2goKGRpclN5bWJvbCkgPT4ge1xuICAgICAgY29uc3QgY29tcE1ldGEgPVxuICAgICAgICAgIHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0Tm9uTm9ybWFsaXplZERpcmVjdGl2ZU1ldGFkYXRhKGRpclN5bWJvbCkgIS5tZXRhZGF0YTtcbiAgICAgIGlmICghY29tcE1ldGEuaXNDb21wb25lbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gTm90ZTogY29tcE1ldGEgaXMgYSBjb21wb25lbnQgYW5kIHRoZXJlZm9yZSB0ZW1wbGF0ZSBpcyBub24gbnVsbC5cbiAgICAgIGNvbXBNZXRhLnRlbXBsYXRlICEuc3R5bGVVcmxzLmZvckVhY2goKHN0eWxlVXJsKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRVcmwgPSB0aGlzLl9ob3N0LnJlc291cmNlTmFtZVRvRmlsZU5hbWUoc3R5bGVVcmwsIGZpbGUuZmlsZU5hbWUpO1xuICAgICAgICBpZiAoIW5vcm1hbGl6ZWRVcmwpIHtcbiAgICAgICAgICB0aHJvdyBzeW50YXhFcnJvcihgQ291bGRuJ3QgcmVzb2x2ZSByZXNvdXJjZSAke3N0eWxlVXJsfSByZWxhdGl2ZSB0byAke2ZpbGUuZmlsZU5hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmVlZHNTaGltID0gKGNvbXBNZXRhLnRlbXBsYXRlICEuZW5jYXBzdWxhdGlvbiB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29uZmlnLmRlZmF1bHRFbmNhcHN1bGF0aW9uKSA9PT0gVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQ7XG4gICAgICAgIGdlbkZpbGVOYW1lcy5wdXNoKF9zdHlsZXNNb2R1bGVVcmwobm9ybWFsaXplZFVybCwgbmVlZHNTaGltLCBmaWxlU3VmZml4KSk7XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLmFsbG93RW1wdHlDb2RlZ2VuRmlsZXMpIHtcbiAgICAgICAgICBnZW5GaWxlTmFtZXMucHVzaChfc3R5bGVzTW9kdWxlVXJsKG5vcm1hbGl6ZWRVcmwsICFuZWVkc1NoaW0sIGZpbGVTdWZmaXgpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGdlbkZpbGVOYW1lcztcbiAgfVxuXG4gIGVtaXRCYXNpY1N0dWIoZ2VuRmlsZU5hbWU6IHN0cmluZywgb3JpZ2luYWxGaWxlTmFtZT86IHN0cmluZyk6IEdlbmVyYXRlZEZpbGUge1xuICAgIGNvbnN0IG91dHB1dEN0eCA9IHRoaXMuX2NyZWF0ZU91dHB1dENvbnRleHQoZ2VuRmlsZU5hbWUpO1xuICAgIGlmIChnZW5GaWxlTmFtZS5lbmRzV2l0aCgnLm5nZmFjdG9yeS50cycpKSB7XG4gICAgICBpZiAoIW9yaWdpbmFsRmlsZU5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEFzc2VydGlvbiBlcnJvcjogcmVxdWlyZSB0aGUgb3JpZ2luYWwgZmlsZSBmb3IgLm5nZmFjdG9yeS50cyBzdHVicy4gRmlsZTogJHtnZW5GaWxlTmFtZX1gKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9yaWdpbmFsRmlsZSA9IHRoaXMuX2FuYWx5emVGaWxlKG9yaWdpbmFsRmlsZU5hbWUpO1xuICAgICAgdGhpcy5fY3JlYXRlTmdGYWN0b3J5U3R1YihvdXRwdXRDdHgsIG9yaWdpbmFsRmlsZSwgU3R1YkVtaXRGbGFncy5CYXNpYyk7XG4gICAgfSBlbHNlIGlmIChnZW5GaWxlTmFtZS5lbmRzV2l0aCgnLm5nc3VtbWFyeS50cycpKSB7XG4gICAgICBpZiAodGhpcy5fb3B0aW9ucy5lbmFibGVTdW1tYXJpZXNGb3JKaXQpIHtcbiAgICAgICAgaWYgKCFvcmlnaW5hbEZpbGVOYW1lKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgQXNzZXJ0aW9uIGVycm9yOiByZXF1aXJlIHRoZSBvcmlnaW5hbCBmaWxlIGZvciAubmdzdW1tYXJ5LnRzIHN0dWJzLiBGaWxlOiAke2dlbkZpbGVOYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsRmlsZSA9IHRoaXMuX2FuYWx5emVGaWxlKG9yaWdpbmFsRmlsZU5hbWUpO1xuICAgICAgICBfY3JlYXRlRW1wdHlTdHViKG91dHB1dEN0eCk7XG4gICAgICAgIG9yaWdpbmFsRmlsZS5uZ01vZHVsZXMuZm9yRWFjaChuZ01vZHVsZSA9PiB7XG4gICAgICAgICAgLy8gY3JlYXRlIGV4cG9ydHMgdGhhdCB1c2VyIGNvZGUgY2FuIHJlZmVyZW5jZVxuICAgICAgICAgIGNyZWF0ZUZvckppdFN0dWIob3V0cHV0Q3R4LCBuZ01vZHVsZS50eXBlLnJlZmVyZW5jZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZ2VuRmlsZU5hbWUuZW5kc1dpdGgoJy5uZ3N0eWxlLnRzJykpIHtcbiAgICAgIF9jcmVhdGVFbXB0eVN0dWIob3V0cHV0Q3R4KTtcbiAgICB9XG4gICAgLy8gTm90ZTogZm9yIHRoZSBzdHVicywgd2UgZG9uJ3QgbmVlZCBhIHByb3BlcnR5IHNyY0ZpbGVVcmwsXG4gICAgLy8gYXMgbGF0ZXIgb24gaW4gZW1pdEFsbEltcGxzIHdlIHdpbGwgY3JlYXRlIHRoZSBwcm9wZXIgR2VuZXJhdGVkRmlsZXMgd2l0aCB0aGVcbiAgICAvLyBjb3JyZWN0IHNyY0ZpbGVVcmwuXG4gICAgLy8gVGhpcyBpcyBnb29kIGFzIGUuZy4gZm9yIC5uZ3N0eWxlLnRzIGZpbGVzIHdlIGNhbid0IGRlcml2ZVxuICAgIC8vIHRoZSB1cmwgb2YgY29tcG9uZW50cyBiYXNlZCBvbiB0aGUgZ2VuRmlsZVVybC5cbiAgICByZXR1cm4gdGhpcy5fY29kZWdlblNvdXJjZU1vZHVsZSgndW5rbm93bicsIG91dHB1dEN0eCk7XG4gIH1cblxuICBlbWl0VHlwZUNoZWNrU3R1YihnZW5GaWxlTmFtZTogc3RyaW5nLCBvcmlnaW5hbEZpbGVOYW1lOiBzdHJpbmcpOiBHZW5lcmF0ZWRGaWxlfG51bGwge1xuICAgIGNvbnN0IG9yaWdpbmFsRmlsZSA9IHRoaXMuX2FuYWx5emVGaWxlKG9yaWdpbmFsRmlsZU5hbWUpO1xuICAgIGNvbnN0IG91dHB1dEN0eCA9IHRoaXMuX2NyZWF0ZU91dHB1dENvbnRleHQoZ2VuRmlsZU5hbWUpO1xuICAgIGlmIChnZW5GaWxlTmFtZS5lbmRzV2l0aCgnLm5nZmFjdG9yeS50cycpKSB7XG4gICAgICB0aGlzLl9jcmVhdGVOZ0ZhY3RvcnlTdHViKG91dHB1dEN0eCwgb3JpZ2luYWxGaWxlLCBTdHViRW1pdEZsYWdzLlR5cGVDaGVjayk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXRDdHguc3RhdGVtZW50cy5sZW5ndGggPiAwID9cbiAgICAgICAgdGhpcy5fY29kZWdlblNvdXJjZU1vZHVsZShvcmlnaW5hbEZpbGUuZmlsZU5hbWUsIG91dHB1dEN0eCkgOlxuICAgICAgICBudWxsO1xuICB9XG5cbiAgbG9hZEZpbGVzQXN5bmMoZmlsZU5hbWVzOiBzdHJpbmdbXSwgdHNGaWxlczogc3RyaW5nW10pOiBQcm9taXNlPFxuICAgICAge2FuYWx5emVkTW9kdWxlczogTmdBbmFseXplZE1vZHVsZXMsIGFuYWx5emVkSW5qZWN0YWJsZXM6IE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzW119PiB7XG4gICAgY29uc3QgZmlsZXMgPSBmaWxlTmFtZXMubWFwKGZpbGVOYW1lID0+IHRoaXMuX2FuYWx5emVGaWxlKGZpbGVOYW1lKSk7XG4gICAgY29uc3QgbG9hZGluZ1Byb21pc2VzOiBQcm9taXNlPE5nQW5hbHl6ZWRNb2R1bGVzPltdID0gW107XG4gICAgZmlsZXMuZm9yRWFjaChcbiAgICAgICAgZmlsZSA9PiBmaWxlLm5nTW9kdWxlcy5mb3JFYWNoKFxuICAgICAgICAgICAgbmdNb2R1bGUgPT5cbiAgICAgICAgICAgICAgICBsb2FkaW5nUHJvbWlzZXMucHVzaCh0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YShcbiAgICAgICAgICAgICAgICAgICAgbmdNb2R1bGUudHlwZS5yZWZlcmVuY2UsIGZhbHNlKSkpKTtcbiAgICBjb25zdCBhbmFseXplZEluamVjdGFibGVzID0gdHNGaWxlcy5tYXAodHNGaWxlID0+IHRoaXMuX2FuYWx5emVGaWxlRm9ySW5qZWN0YWJsZXModHNGaWxlKSk7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKGxvYWRpbmdQcm9taXNlcykudGhlbihfID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuYWx5emVkTW9kdWxlczogbWVyZ2VBbmRWYWxpZGF0ZU5nRmlsZXMoZmlsZXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmFseXplZEluamVjdGFibGVzOiBhbmFseXplZEluamVjdGFibGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgbG9hZEZpbGVzU3luYyhmaWxlTmFtZXM6IHN0cmluZ1tdLCB0c0ZpbGVzOiBzdHJpbmdbXSk6XG4gICAgICB7YW5hbHl6ZWRNb2R1bGVzOiBOZ0FuYWx5emVkTW9kdWxlcywgYW5hbHl6ZWRJbmplY3RhYmxlczogTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXNbXX0ge1xuICAgIGNvbnN0IGZpbGVzID0gZmlsZU5hbWVzLm1hcChmaWxlTmFtZSA9PiB0aGlzLl9hbmFseXplRmlsZShmaWxlTmFtZSkpO1xuICAgIGZpbGVzLmZvckVhY2goXG4gICAgICAgIGZpbGUgPT4gZmlsZS5uZ01vZHVsZXMuZm9yRWFjaChcbiAgICAgICAgICAgIG5nTW9kdWxlID0+IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIubG9hZE5nTW9kdWxlRGlyZWN0aXZlQW5kUGlwZU1ldGFkYXRhKFxuICAgICAgICAgICAgICAgIG5nTW9kdWxlLnR5cGUucmVmZXJlbmNlLCB0cnVlKSkpO1xuICAgIGNvbnN0IGFuYWx5emVkSW5qZWN0YWJsZXMgPSB0c0ZpbGVzLm1hcCh0c0ZpbGUgPT4gdGhpcy5fYW5hbHl6ZUZpbGVGb3JJbmplY3RhYmxlcyh0c0ZpbGUpKTtcbiAgICByZXR1cm4ge1xuICAgICAgYW5hbHl6ZWRNb2R1bGVzOiBtZXJnZUFuZFZhbGlkYXRlTmdGaWxlcyhmaWxlcyksXG4gICAgICBhbmFseXplZEluamVjdGFibGVzOiBhbmFseXplZEluamVjdGFibGVzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVOZ0ZhY3RvcnlTdHViKFxuICAgICAgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBmaWxlOiBOZ0FuYWx5emVkRmlsZSwgZW1pdEZsYWdzOiBTdHViRW1pdEZsYWdzKSB7XG4gICAgbGV0IGNvbXBvbmVudElkID0gMDtcbiAgICBmaWxlLm5nTW9kdWxlcy5mb3JFYWNoKChuZ01vZHVsZU1ldGEsIG5nTW9kdWxlSW5kZXgpID0+IHtcbiAgICAgIC8vIE5vdGU6IHRoZSBjb2RlIGJlbG93IG5lZWRzIHRvIGV4ZWN1dGVkIGZvciBTdHViRW1pdEZsYWdzLkJhc2ljIGFuZCBTdHViRW1pdEZsYWdzLlR5cGVDaGVjayxcbiAgICAgIC8vIHNvIHdlIGRvbid0IGNoYW5nZSB0aGUgLm5nZmFjdG9yeSBmaWxlIHRvbyBtdWNoIHdoZW4gYWRkaW5nIHRoZSB0eXBlLWNoZWNrIGJsb2NrLlxuXG4gICAgICAvLyBjcmVhdGUgZXhwb3J0cyB0aGF0IHVzZXIgY29kZSBjYW4gcmVmZXJlbmNlXG4gICAgICB0aGlzLl9uZ01vZHVsZUNvbXBpbGVyLmNyZWF0ZVN0dWIob3V0cHV0Q3R4LCBuZ01vZHVsZU1ldGEudHlwZS5yZWZlcmVuY2UpO1xuXG4gICAgICAvLyBhZGQgcmVmZXJlbmNlcyB0byB0aGUgc3ltYm9scyBmcm9tIHRoZSBtZXRhZGF0YS5cbiAgICAgIC8vIFRoZXNlIGNhbiBiZSB1c2VkIGJ5IHRoZSB0eXBlIGNoZWNrIGJsb2NrIGZvciBjb21wb25lbnRzLFxuICAgICAgLy8gYW5kIHRoZXkgYWxzbyBjYXVzZSBUeXBlU2NyaXB0IHRvIGluY2x1ZGUgdGhlc2UgZmlsZXMgaW50byB0aGUgcHJvZ3JhbSB0b28sXG4gICAgICAvLyB3aGljaCB3aWxsIG1ha2UgdGhlbSBwYXJ0IG9mIHRoZSBhbmFseXplZEZpbGVzLlxuICAgICAgY29uc3QgZXh0ZXJuYWxSZWZlcmVuY2VzOiBTdGF0aWNTeW1ib2xbXSA9IFtcbiAgICAgICAgLy8gQWRkIHJlZmVyZW5jZXMgdGhhdCBhcmUgYXZhaWxhYmxlIGZyb20gYWxsIHRoZSBtb2R1bGVzIGFuZCBpbXBvcnRzLlxuICAgICAgICAuLi5uZ01vZHVsZU1ldGEudHJhbnNpdGl2ZU1vZHVsZS5kaXJlY3RpdmVzLm1hcChkID0+IGQucmVmZXJlbmNlKSxcbiAgICAgICAgLi4ubmdNb2R1bGVNZXRhLnRyYW5zaXRpdmVNb2R1bGUucGlwZXMubWFwKGQgPT4gZC5yZWZlcmVuY2UpLFxuICAgICAgICAuLi5uZ01vZHVsZU1ldGEuaW1wb3J0ZWRNb2R1bGVzLm1hcChtID0+IG0udHlwZS5yZWZlcmVuY2UpLFxuICAgICAgICAuLi5uZ01vZHVsZU1ldGEuZXhwb3J0ZWRNb2R1bGVzLm1hcChtID0+IG0udHlwZS5yZWZlcmVuY2UpLFxuXG4gICAgICAgIC8vIEFkZCByZWZlcmVuY2VzIHRoYXQgbWlnaHQgYmUgaW5zZXJ0ZWQgYnkgdGhlIHRlbXBsYXRlIGNvbXBpbGVyLlxuICAgICAgICAuLi50aGlzLl9leHRlcm5hbElkZW50aWZpZXJSZWZlcmVuY2VzKFtJZGVudGlmaWVycy5UZW1wbGF0ZVJlZiwgSWRlbnRpZmllcnMuRWxlbWVudFJlZl0pLFxuICAgICAgXTtcblxuICAgICAgY29uc3QgZXh0ZXJuYWxSZWZlcmVuY2VWYXJzID0gbmV3IE1hcDxhbnksIHN0cmluZz4oKTtcbiAgICAgIGV4dGVybmFsUmVmZXJlbmNlcy5mb3JFYWNoKChyZWYsIHR5cGVJbmRleCkgPT4ge1xuICAgICAgICBleHRlcm5hbFJlZmVyZW5jZVZhcnMuc2V0KHJlZiwgYF9kZWNsJHtuZ01vZHVsZUluZGV4fV8ke3R5cGVJbmRleH1gKTtcbiAgICAgIH0pO1xuICAgICAgZXh0ZXJuYWxSZWZlcmVuY2VWYXJzLmZvckVhY2goKHZhck5hbWUsIHJlZmVyZW5jZSkgPT4ge1xuICAgICAgICBvdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKFxuICAgICAgICAgICAgby52YXJpYWJsZSh2YXJOYW1lKVxuICAgICAgICAgICAgICAgIC5zZXQoby5OVUxMX0VYUFIuY2FzdChvLkRZTkFNSUNfVFlQRSkpXG4gICAgICAgICAgICAgICAgLnRvRGVjbFN0bXQoby5leHByZXNzaW9uVHlwZShvdXRwdXRDdHguaW1wb3J0RXhwcihcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLCAvKiB0eXBlUGFyYW1zICovIG51bGwsIC8qIHVzZVN1bW1hcmllcyAqLyBmYWxzZSkpKSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGVtaXRGbGFncyAmIFN0dWJFbWl0RmxhZ3MuVHlwZUNoZWNrKSB7XG4gICAgICAgIC8vIGFkZCB0aGUgdHlwZS1jaGVjayBibG9jayBmb3IgYWxsIGNvbXBvbmVudHMgb2YgdGhlIE5nTW9kdWxlXG4gICAgICAgIG5nTW9kdWxlTWV0YS5kZWNsYXJlZERpcmVjdGl2ZXMuZm9yRWFjaCgoZGlySWQpID0+IHtcbiAgICAgICAgICBjb25zdCBjb21wTWV0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0RGlyZWN0aXZlTWV0YWRhdGEoZGlySWQucmVmZXJlbmNlKTtcbiAgICAgICAgICBpZiAoIWNvbXBNZXRhLmlzQ29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbXBvbmVudElkKys7XG4gICAgICAgICAgdGhpcy5fY3JlYXRlVHlwZUNoZWNrQmxvY2soXG4gICAgICAgICAgICAgIG91dHB1dEN0eCwgYCR7Y29tcE1ldGEudHlwZS5yZWZlcmVuY2UubmFtZX1fSG9zdF8ke2NvbXBvbmVudElkfWAsIG5nTW9kdWxlTWV0YSxcbiAgICAgICAgICAgICAgdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRIb3N0Q29tcG9uZW50TWV0YWRhdGEoY29tcE1ldGEpLCBbY29tcE1ldGEudHlwZV0sXG4gICAgICAgICAgICAgIGV4dGVybmFsUmVmZXJlbmNlVmFycyk7XG4gICAgICAgICAgdGhpcy5fY3JlYXRlVHlwZUNoZWNrQmxvY2soXG4gICAgICAgICAgICAgIG91dHB1dEN0eCwgYCR7Y29tcE1ldGEudHlwZS5yZWZlcmVuY2UubmFtZX1fJHtjb21wb25lbnRJZH1gLCBuZ01vZHVsZU1ldGEsIGNvbXBNZXRhLFxuICAgICAgICAgICAgICBuZ01vZHVsZU1ldGEudHJhbnNpdGl2ZU1vZHVsZS5kaXJlY3RpdmVzLCBleHRlcm5hbFJlZmVyZW5jZVZhcnMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChvdXRwdXRDdHguc3RhdGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIF9jcmVhdGVFbXB0eVN0dWIob3V0cHV0Q3R4KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9leHRlcm5hbElkZW50aWZpZXJSZWZlcmVuY2VzKHJlZmVyZW5jZXM6IG8uRXh0ZXJuYWxSZWZlcmVuY2VbXSk6IFN0YXRpY1N5bWJvbFtdIHtcbiAgICBjb25zdCByZXN1bHQ6IFN0YXRpY1N5bWJvbFtdID0gW107XG4gICAgZm9yIChsZXQgcmVmZXJlbmNlIG9mIHJlZmVyZW5jZXMpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gY3JlYXRlVG9rZW5Gb3JFeHRlcm5hbFJlZmVyZW5jZSh0aGlzLnJlZmxlY3RvciwgcmVmZXJlbmNlKTtcbiAgICAgIGlmICh0b2tlbi5pZGVudGlmaWVyKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRva2VuLmlkZW50aWZpZXIucmVmZXJlbmNlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZVR5cGVDaGVja0Jsb2NrKFxuICAgICAgY3R4OiBPdXRwdXRDb250ZXh0LCBjb21wb25lbnRJZDogc3RyaW5nLCBtb2R1bGVNZXRhOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSxcbiAgICAgIGNvbXBNZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIGRpcmVjdGl2ZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSxcbiAgICAgIGV4dGVybmFsUmVmZXJlbmNlVmFyczogTWFwPGFueSwgc3RyaW5nPikge1xuICAgIGNvbnN0IHt0ZW1wbGF0ZTogcGFyc2VkVGVtcGxhdGUsIHBpcGVzOiB1c2VkUGlwZXN9ID1cbiAgICAgICAgdGhpcy5fcGFyc2VUZW1wbGF0ZShjb21wTWV0YSwgbW9kdWxlTWV0YSwgZGlyZWN0aXZlcyk7XG4gICAgY3R4LnN0YXRlbWVudHMucHVzaCguLi50aGlzLl90eXBlQ2hlY2tDb21waWxlci5jb21waWxlQ29tcG9uZW50KFxuICAgICAgICBjb21wb25lbnRJZCwgY29tcE1ldGEsIHBhcnNlZFRlbXBsYXRlLCB1c2VkUGlwZXMsIGV4dGVybmFsUmVmZXJlbmNlVmFycywgY3R4KSk7XG4gIH1cblxuICBlbWl0TWVzc2FnZUJ1bmRsZShhbmFseXplUmVzdWx0OiBOZ0FuYWx5emVkTW9kdWxlcywgbG9jYWxlOiBzdHJpbmd8bnVsbCk6IE1lc3NhZ2VCdW5kbGUge1xuICAgIGNvbnN0IGVycm9yczogUGFyc2VFcnJvcltdID0gW107XG4gICAgY29uc3QgaHRtbFBhcnNlciA9IG5ldyBIdG1sUGFyc2VyKCk7XG5cbiAgICAvLyBUT0RPKHZpY2IpOiBpbXBsaWNpdCB0YWdzICYgYXR0cmlidXRlc1xuICAgIGNvbnN0IG1lc3NhZ2VCdW5kbGUgPSBuZXcgTWVzc2FnZUJ1bmRsZShodG1sUGFyc2VyLCBbXSwge30sIGxvY2FsZSk7XG5cbiAgICBhbmFseXplUmVzdWx0LmZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICBjb25zdCBjb21wTWV0YXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdID0gW107XG4gICAgICBmaWxlLmRpcmVjdGl2ZXMuZm9yRWFjaChkaXJlY3RpdmVUeXBlID0+IHtcbiAgICAgICAgY29uc3QgZGlyTWV0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0RGlyZWN0aXZlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZSk7XG4gICAgICAgIGlmIChkaXJNZXRhICYmIGRpck1ldGEuaXNDb21wb25lbnQpIHtcbiAgICAgICAgICBjb21wTWV0YXMucHVzaChkaXJNZXRhKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb21wTWV0YXMuZm9yRWFjaChjb21wTWV0YSA9PiB7XG4gICAgICAgIGNvbnN0IGh0bWwgPSBjb21wTWV0YS50ZW1wbGF0ZSAhLnRlbXBsYXRlICE7XG4gICAgICAgIGNvbnN0IGludGVycG9sYXRpb25Db25maWcgPVxuICAgICAgICAgICAgSW50ZXJwb2xhdGlvbkNvbmZpZy5mcm9tQXJyYXkoY29tcE1ldGEudGVtcGxhdGUgIS5pbnRlcnBvbGF0aW9uKTtcbiAgICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgICAuLi5tZXNzYWdlQnVuZGxlLnVwZGF0ZUZyb21UZW1wbGF0ZShodG1sLCBmaWxlLmZpbGVOYW1lLCBpbnRlcnBvbGF0aW9uQ29uZmlnKSAhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcnMubWFwKGUgPT4gZS50b1N0cmluZygpKS5qb2luKCdcXG4nKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lc3NhZ2VCdW5kbGU7XG4gIH1cblxuICBlbWl0QWxsUGFydGlhbE1vZHVsZXMoXG4gICAgICB7bmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZSwgZmlsZXN9OiBOZ0FuYWx5emVkTW9kdWxlcyxcbiAgICAgIHIzRmlsZXM6IE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzW10pOiBQYXJ0aWFsTW9kdWxlW10ge1xuICAgIGNvbnN0IGNvbnRleHRNYXAgPSBuZXcgTWFwPHN0cmluZywgT3V0cHV0Q29udGV4dD4oKTtcblxuICAgIGNvbnN0IGdldENvbnRleHQgPSAoZmlsZU5hbWU6IHN0cmluZyk6IE91dHB1dENvbnRleHQgPT4ge1xuICAgICAgaWYgKCFjb250ZXh0TWFwLmhhcyhmaWxlTmFtZSkpIHtcbiAgICAgICAgY29udGV4dE1hcC5zZXQoZmlsZU5hbWUsIHRoaXMuX2NyZWF0ZU91dHB1dENvbnRleHQoZmlsZU5hbWUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZXh0TWFwLmdldChmaWxlTmFtZSkgITtcbiAgICB9O1xuXG4gICAgZmlsZXMuZm9yRWFjaChcbiAgICAgICAgZmlsZSA9PiB0aGlzLl9jb21waWxlUGFydGlhbE1vZHVsZShcbiAgICAgICAgICAgIGZpbGUuZmlsZU5hbWUsIG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUsIGZpbGUuZGlyZWN0aXZlcywgZmlsZS5waXBlcywgZmlsZS5uZ01vZHVsZXMsXG4gICAgICAgICAgICBmaWxlLmluamVjdGFibGVzLCBnZXRDb250ZXh0KGZpbGUuZmlsZU5hbWUpKSk7XG4gICAgcjNGaWxlcy5mb3JFYWNoKFxuICAgICAgICBmaWxlID0+IHRoaXMuX2NvbXBpbGVTaGFsbG93TW9kdWxlcyhcbiAgICAgICAgICAgIGZpbGUuZmlsZU5hbWUsIGZpbGUuc2hhbGxvd01vZHVsZXMsIGdldENvbnRleHQoZmlsZS5maWxlTmFtZSkpKTtcblxuICAgIHJldHVybiBBcnJheS5mcm9tKGNvbnRleHRNYXAudmFsdWVzKCkpXG4gICAgICAgIC5tYXAoY29udGV4dCA9PiAoe1xuICAgICAgICAgICAgICAgZmlsZU5hbWU6IGNvbnRleHQuZ2VuRmlsZVBhdGgsXG4gICAgICAgICAgICAgICBzdGF0ZW1lbnRzOiBbLi4uY29udGV4dC5jb25zdGFudFBvb2wuc3RhdGVtZW50cywgLi4uY29udGV4dC5zdGF0ZW1lbnRzXSxcbiAgICAgICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlU2hhbGxvd01vZHVsZXMoXG4gICAgICBmaWxlTmFtZTogc3RyaW5nLCBzaGFsbG93TW9kdWxlczogQ29tcGlsZVNoYWxsb3dNb2R1bGVNZXRhZGF0YVtdLFxuICAgICAgY29udGV4dDogT3V0cHV0Q29udGV4dCk6IHZvaWQge1xuICAgIHNoYWxsb3dNb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IGNvbXBpbGVJdnlNb2R1bGUoY29udGV4dCwgbW9kdWxlLCB0aGlzLl9pbmplY3RhYmxlQ29tcGlsZXIpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBpbGVQYXJ0aWFsTW9kdWxlKFxuICAgICAgZmlsZU5hbWU6IHN0cmluZywgbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZTogTWFwPFN0YXRpY1N5bWJvbCwgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGE+LFxuICAgICAgZGlyZWN0aXZlczogU3RhdGljU3ltYm9sW10sIHBpcGVzOiBTdGF0aWNTeW1ib2xbXSwgbmdNb2R1bGVzOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YVtdLFxuICAgICAgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXSwgY29udGV4dDogT3V0cHV0Q29udGV4dCk6IHZvaWQge1xuICAgIGNvbnN0IGNsYXNzZXM6IG8uQ2xhc3NTdG10W10gPSBbXTtcbiAgICBjb25zdCBlcnJvcnM6IFBhcnNlRXJyb3JbXSA9IFtdO1xuXG4gICAgY29uc3QgaG9zdEJpbmRpbmdQYXJzZXIgPSBuZXcgQmluZGluZ1BhcnNlcihcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVQYXJzZXIuZXhwcmVzc2lvblBhcnNlciwgREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgbnVsbCAhLCBbXSwgZXJyb3JzKTtcblxuICAgIC8vIFByb2Nlc3MgYWxsIGNvbXBvbmVudHMgYW5kIGRpcmVjdGl2ZXNcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goZGlyZWN0aXZlVHlwZSA9PiB7XG4gICAgICBjb25zdCBkaXJlY3RpdmVNZXRhZGF0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0RGlyZWN0aXZlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZSk7XG4gICAgICBpZiAoZGlyZWN0aXZlTWV0YWRhdGEuaXNDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlID0gbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZS5nZXQoZGlyZWN0aXZlVHlwZSkgITtcbiAgICAgICAgbW9kdWxlIHx8XG4gICAgICAgICAgICBlcnJvcihcbiAgICAgICAgICAgICAgICBgQ2Fubm90IGRldGVybWluZSB0aGUgbW9kdWxlIGZvciBjb21wb25lbnQgJyR7aWRlbnRpZmllck5hbWUoZGlyZWN0aXZlTWV0YWRhdGEudHlwZSl9J2ApO1xuXG4gICAgICAgIGNvbnN0IHt0ZW1wbGF0ZTogcGFyc2VkVGVtcGxhdGUsIHBpcGVzOiBwYXJzZWRQaXBlc30gPVxuICAgICAgICAgICAgdGhpcy5fcGFyc2VUZW1wbGF0ZShkaXJlY3RpdmVNZXRhZGF0YSwgbW9kdWxlLCBtb2R1bGUudHJhbnNpdGl2ZU1vZHVsZS5kaXJlY3RpdmVzKTtcbiAgICAgICAgY29tcGlsZUl2eUNvbXBvbmVudChcbiAgICAgICAgICAgIGNvbnRleHQsIGRpcmVjdGl2ZU1ldGFkYXRhLCBwYXJzZWRQaXBlcywgcGFyc2VkVGVtcGxhdGUsIHRoaXMucmVmbGVjdG9yLFxuICAgICAgICAgICAgaG9zdEJpbmRpbmdQYXJzZXIsIE91dHB1dE1vZGUuUGFydGlhbENsYXNzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbXBpbGVJdnlEaXJlY3RpdmUoXG4gICAgICAgICAgICBjb250ZXh0LCBkaXJlY3RpdmVNZXRhZGF0YSwgdGhpcy5yZWZsZWN0b3IsIGhvc3RCaW5kaW5nUGFyc2VyLCBPdXRwdXRNb2RlLlBhcnRpYWxDbGFzcyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBwaXBlcy5mb3JFYWNoKHBpcGVUeXBlID0+IHtcbiAgICAgIGNvbnN0IHBpcGVNZXRhZGF0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0UGlwZU1ldGFkYXRhKHBpcGVUeXBlKTtcbiAgICAgIGlmIChwaXBlTWV0YWRhdGEpIHtcbiAgICAgICAgY29tcGlsZUl2eVBpcGUoY29udGV4dCwgcGlwZU1ldGFkYXRhLCB0aGlzLnJlZmxlY3RvciwgT3V0cHV0TW9kZS5QYXJ0aWFsQ2xhc3MpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaW5qZWN0YWJsZXMuZm9yRWFjaChpbmplY3RhYmxlID0+IHRoaXMuX2luamVjdGFibGVDb21waWxlci5jb21waWxlKGluamVjdGFibGUsIGNvbnRleHQpKTtcbiAgfVxuXG4gIGVtaXRBbGxQYXJ0aWFsTW9kdWxlczIoZmlsZXM6IE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzW10pOiBQYXJ0aWFsTW9kdWxlW10ge1xuICAgIC8vIFVzaW5nIHJlZHVjZSBsaWtlIHRoaXMgaXMgYSBzZWxlY3QgbWFueSBwYXR0ZXJuICh3aGVyZSBtYXAgaXMgYSBzZWxlY3QgcGF0dGVybilcbiAgICByZXR1cm4gZmlsZXMucmVkdWNlPFBhcnRpYWxNb2R1bGVbXT4oKHIsIGZpbGUpID0+IHtcbiAgICAgIHIucHVzaCguLi50aGlzLl9lbWl0UGFydGlhbE1vZHVsZTIoZmlsZS5maWxlTmFtZSwgZmlsZS5pbmplY3RhYmxlcykpO1xuICAgICAgcmV0dXJuIHI7XG4gICAgfSwgW10pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW1pdFBhcnRpYWxNb2R1bGUyKGZpbGVOYW1lOiBzdHJpbmcsIGluamVjdGFibGVzOiBDb21waWxlSW5qZWN0YWJsZU1ldGFkYXRhW10pOlxuICAgICAgUGFydGlhbE1vZHVsZVtdIHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5fY3JlYXRlT3V0cHV0Q29udGV4dChmaWxlTmFtZSk7XG5cbiAgICBpbmplY3RhYmxlcy5mb3JFYWNoKGluamVjdGFibGUgPT4gdGhpcy5faW5qZWN0YWJsZUNvbXBpbGVyLmNvbXBpbGUoaW5qZWN0YWJsZSwgY29udGV4dCkpO1xuXG4gICAgaWYgKGNvbnRleHQuc3RhdGVtZW50cyAmJiBjb250ZXh0LnN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIFt7ZmlsZU5hbWUsIHN0YXRlbWVudHM6IFsuLi5jb250ZXh0LmNvbnN0YW50UG9vbC5zdGF0ZW1lbnRzLCAuLi5jb250ZXh0LnN0YXRlbWVudHNdfV07XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGVtaXRBbGxJbXBscyhhbmFseXplUmVzdWx0OiBOZ0FuYWx5emVkTW9kdWxlcyk6IEdlbmVyYXRlZEZpbGVbXSB7XG4gICAgY29uc3Qge25nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmUsIGZpbGVzfSA9IGFuYWx5emVSZXN1bHQ7XG4gICAgY29uc3Qgc291cmNlTW9kdWxlcyA9IGZpbGVzLm1hcChcbiAgICAgICAgZmlsZSA9PiB0aGlzLl9jb21waWxlSW1wbEZpbGUoXG4gICAgICAgICAgICBmaWxlLmZpbGVOYW1lLCBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlLCBmaWxlLmRpcmVjdGl2ZXMsIGZpbGUucGlwZXMsIGZpbGUubmdNb2R1bGVzLFxuICAgICAgICAgICAgZmlsZS5pbmplY3RhYmxlcykpO1xuICAgIHJldHVybiBmbGF0dGVuKHNvdXJjZU1vZHVsZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGlsZUltcGxGaWxlKFxuICAgICAgc3JjRmlsZVVybDogc3RyaW5nLCBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlOiBNYXA8U3RhdGljU3ltYm9sLCBDb21waWxlTmdNb2R1bGVNZXRhZGF0YT4sXG4gICAgICBkaXJlY3RpdmVzOiBTdGF0aWNTeW1ib2xbXSwgcGlwZXM6IFN0YXRpY1N5bWJvbFtdLCBuZ01vZHVsZXM6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhW10sXG4gICAgICBpbmplY3RhYmxlczogQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YVtdKTogR2VuZXJhdGVkRmlsZVtdIHtcbiAgICBjb25zdCBmaWxlU3VmZml4ID0gbm9ybWFsaXplR2VuRmlsZVN1ZmZpeChzcGxpdFR5cGVzY3JpcHRTdWZmaXgoc3JjRmlsZVVybCwgdHJ1ZSlbMV0pO1xuICAgIGNvbnN0IGdlbmVyYXRlZEZpbGVzOiBHZW5lcmF0ZWRGaWxlW10gPSBbXTtcblxuICAgIGNvbnN0IG91dHB1dEN0eCA9IHRoaXMuX2NyZWF0ZU91dHB1dENvbnRleHQobmdmYWN0b3J5RmlsZVBhdGgoc3JjRmlsZVVybCwgdHJ1ZSkpO1xuXG4gICAgZ2VuZXJhdGVkRmlsZXMucHVzaChcbiAgICAgICAgLi4udGhpcy5fY3JlYXRlU3VtbWFyeShzcmNGaWxlVXJsLCBkaXJlY3RpdmVzLCBwaXBlcywgbmdNb2R1bGVzLCBpbmplY3RhYmxlcywgb3V0cHV0Q3R4KSk7XG5cbiAgICAvLyBjb21waWxlIGFsbCBuZyBtb2R1bGVzXG4gICAgbmdNb2R1bGVzLmZvckVhY2goKG5nTW9kdWxlTWV0YSkgPT4gdGhpcy5fY29tcGlsZU1vZHVsZShvdXRwdXRDdHgsIG5nTW9kdWxlTWV0YSkpO1xuXG4gICAgLy8gY29tcGlsZSBjb21wb25lbnRzXG4gICAgZGlyZWN0aXZlcy5mb3JFYWNoKChkaXJUeXBlKSA9PiB7XG4gICAgICBjb25zdCBjb21wTWV0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0RGlyZWN0aXZlTWV0YWRhdGEoPGFueT5kaXJUeXBlKTtcbiAgICAgIGlmICghY29tcE1ldGEuaXNDb21wb25lbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgbmdNb2R1bGUgPSBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlLmdldChkaXJUeXBlKTtcbiAgICAgIGlmICghbmdNb2R1bGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEludGVybmFsIEVycm9yOiBjYW5ub3QgZGV0ZXJtaW5lIHRoZSBtb2R1bGUgZm9yIGNvbXBvbmVudCAke2lkZW50aWZpZXJOYW1lKGNvbXBNZXRhLnR5cGUpfSFgKTtcbiAgICAgIH1cblxuICAgICAgLy8gY29tcGlsZSBzdHlsZXNcbiAgICAgIGNvbnN0IGNvbXBvbmVudFN0eWxlc2hlZXQgPSB0aGlzLl9zdHlsZUNvbXBpbGVyLmNvbXBpbGVDb21wb25lbnQob3V0cHV0Q3R4LCBjb21wTWV0YSk7XG4gICAgICAvLyBOb3RlOiBjb21wTWV0YSBpcyBhIGNvbXBvbmVudCBhbmQgdGhlcmVmb3JlIHRlbXBsYXRlIGlzIG5vbiBudWxsLlxuICAgICAgY29tcE1ldGEudGVtcGxhdGUgIS5leHRlcm5hbFN0eWxlc2hlZXRzLmZvckVhY2goKHN0eWxlc2hlZXRNZXRhKSA9PiB7XG4gICAgICAgIC8vIE5vdGU6IGZpbGwgbm9uIHNoaW0gYW5kIHNoaW0gc3R5bGUgZmlsZXMgYXMgdGhleSBtaWdodFxuICAgICAgICAvLyBiZSBzaGFyZWQgYnkgY29tcG9uZW50IHdpdGggYW5kIHdpdGhvdXQgVmlld0VuY2Fwc3VsYXRpb24uXG4gICAgICAgIGNvbnN0IHNoaW0gPSB0aGlzLl9zdHlsZUNvbXBpbGVyLm5lZWRzU3R5bGVTaGltKGNvbXBNZXRhKTtcbiAgICAgICAgZ2VuZXJhdGVkRmlsZXMucHVzaChcbiAgICAgICAgICAgIHRoaXMuX2NvZGVnZW5TdHlsZXMoc3JjRmlsZVVybCwgY29tcE1ldGEsIHN0eWxlc2hlZXRNZXRhLCBzaGltLCBmaWxlU3VmZml4KSk7XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLmFsbG93RW1wdHlDb2RlZ2VuRmlsZXMpIHtcbiAgICAgICAgICBnZW5lcmF0ZWRGaWxlcy5wdXNoKFxuICAgICAgICAgICAgICB0aGlzLl9jb2RlZ2VuU3R5bGVzKHNyY0ZpbGVVcmwsIGNvbXBNZXRhLCBzdHlsZXNoZWV0TWV0YSwgIXNoaW0sIGZpbGVTdWZmaXgpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGNvbXBpbGUgY29tcG9uZW50c1xuICAgICAgY29uc3QgY29tcFZpZXdWYXJzID0gdGhpcy5fY29tcGlsZUNvbXBvbmVudChcbiAgICAgICAgICBvdXRwdXRDdHgsIGNvbXBNZXRhLCBuZ01vZHVsZSwgbmdNb2R1bGUudHJhbnNpdGl2ZU1vZHVsZS5kaXJlY3RpdmVzLCBjb21wb25lbnRTdHlsZXNoZWV0LFxuICAgICAgICAgIGZpbGVTdWZmaXgpO1xuICAgICAgdGhpcy5fY29tcGlsZUNvbXBvbmVudEZhY3Rvcnkob3V0cHV0Q3R4LCBjb21wTWV0YSwgbmdNb2R1bGUsIGZpbGVTdWZmaXgpO1xuICAgIH0pO1xuICAgIGlmIChvdXRwdXRDdHguc3RhdGVtZW50cy5sZW5ndGggPiAwIHx8IHRoaXMuX29wdGlvbnMuYWxsb3dFbXB0eUNvZGVnZW5GaWxlcykge1xuICAgICAgY29uc3Qgc3JjTW9kdWxlID0gdGhpcy5fY29kZWdlblNvdXJjZU1vZHVsZShzcmNGaWxlVXJsLCBvdXRwdXRDdHgpO1xuICAgICAgZ2VuZXJhdGVkRmlsZXMudW5zaGlmdChzcmNNb2R1bGUpO1xuICAgIH1cbiAgICByZXR1cm4gZ2VuZXJhdGVkRmlsZXM7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVTdW1tYXJ5KFxuICAgICAgc3JjRmlsZU5hbWU6IHN0cmluZywgZGlyZWN0aXZlczogU3RhdGljU3ltYm9sW10sIHBpcGVzOiBTdGF0aWNTeW1ib2xbXSxcbiAgICAgIG5nTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGFbXSwgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXSxcbiAgICAgIG5nRmFjdG9yeUN0eDogT3V0cHV0Q29udGV4dCk6IEdlbmVyYXRlZEZpbGVbXSB7XG4gICAgY29uc3Qgc3ltYm9sU3VtbWFyaWVzID0gdGhpcy5fc3ltYm9sUmVzb2x2ZXIuZ2V0U3ltYm9sc09mKHNyY0ZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHN5bWJvbCA9PiB0aGlzLl9zeW1ib2xSZXNvbHZlci5yZXNvbHZlU3ltYm9sKHN5bWJvbCkpO1xuICAgIGNvbnN0IHR5cGVEYXRhOiB7XG4gICAgICBzdW1tYXJ5OiBDb21waWxlVHlwZVN1bW1hcnksXG4gICAgICBtZXRhZGF0YTogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEgfCBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEgfCBDb21waWxlUGlwZU1ldGFkYXRhIHxcbiAgICAgICAgICBDb21waWxlVHlwZU1ldGFkYXRhXG4gICAgfVtdID1cbiAgICAgICAgW1xuICAgICAgICAgIC4uLm5nTW9kdWxlcy5tYXAoXG4gICAgICAgICAgICAgIG1ldGEgPT4gKHtcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldE5nTW9kdWxlU3VtbWFyeShtZXRhLnR5cGUucmVmZXJlbmNlKSAhLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldE5nTW9kdWxlTWV0YWRhdGEobWV0YS50eXBlLnJlZmVyZW5jZSkgIVxuICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgLi4uZGlyZWN0aXZlcy5tYXAocmVmID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5OiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZVN1bW1hcnkocmVmKSAhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0RGlyZWN0aXZlTWV0YWRhdGEocmVmKSAhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgIC4uLnBpcGVzLm1hcChyZWYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5OiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldFBpcGVTdW1tYXJ5KHJlZikgISxcbiAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YTogdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRQaXBlTWV0YWRhdGEocmVmKSAhXG4gICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAuLi5pbmplY3RhYmxlcy5tYXAoXG4gICAgICAgICAgICAgIHJlZiA9PiAoe1xuICAgICAgICAgICAgICAgIHN1bW1hcnk6IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0SW5qZWN0YWJsZVN1bW1hcnkocmVmLnN5bWJvbCkgISxcbiAgICAgICAgICAgICAgICBtZXRhZGF0YTogdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRJbmplY3RhYmxlU3VtbWFyeShyZWYuc3ltYm9sKSAhLnR5cGVcbiAgICAgICAgICAgICAgfSkpXG4gICAgICAgIF07XG4gICAgY29uc3QgZm9ySml0T3V0cHV0Q3R4ID0gdGhpcy5fb3B0aW9ucy5lbmFibGVTdW1tYXJpZXNGb3JKaXQgP1xuICAgICAgICB0aGlzLl9jcmVhdGVPdXRwdXRDb250ZXh0KHN1bW1hcnlGb3JKaXRGaWxlTmFtZShzcmNGaWxlTmFtZSwgdHJ1ZSkpIDpcbiAgICAgICAgbnVsbDtcbiAgICBjb25zdCB7anNvbiwgZXhwb3J0QXN9ID0gc2VyaWFsaXplU3VtbWFyaWVzKFxuICAgICAgICBzcmNGaWxlTmFtZSwgZm9ySml0T3V0cHV0Q3R4LCB0aGlzLl9zdW1tYXJ5UmVzb2x2ZXIsIHRoaXMuX3N5bWJvbFJlc29sdmVyLCBzeW1ib2xTdW1tYXJpZXMsXG4gICAgICAgIHR5cGVEYXRhKTtcbiAgICBleHBvcnRBcy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgbmdGYWN0b3J5Q3R4LnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgICBvLnZhcmlhYmxlKGVudHJ5LmV4cG9ydEFzKS5zZXQobmdGYWN0b3J5Q3R4LmltcG9ydEV4cHIoZW50cnkuc3ltYm9sKSkudG9EZWNsU3RtdChudWxsLCBbXG4gICAgICAgICAgICBvLlN0bXRNb2RpZmllci5FeHBvcnRlZFxuICAgICAgICAgIF0pKTtcbiAgICB9KTtcbiAgICBjb25zdCBzdW1tYXJ5SnNvbiA9IG5ldyBHZW5lcmF0ZWRGaWxlKHNyY0ZpbGVOYW1lLCBzdW1tYXJ5RmlsZU5hbWUoc3JjRmlsZU5hbWUpLCBqc29uKTtcbiAgICBjb25zdCByZXN1bHQgPSBbc3VtbWFyeUpzb25dO1xuICAgIGlmIChmb3JKaXRPdXRwdXRDdHgpIHtcbiAgICAgIHJlc3VsdC5wdXNoKHRoaXMuX2NvZGVnZW5Tb3VyY2VNb2R1bGUoc3JjRmlsZU5hbWUsIGZvckppdE91dHB1dEN0eCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGlsZU1vZHVsZShvdXRwdXRDdHg6IE91dHB1dENvbnRleHQsIG5nTW9kdWxlOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSk6IHZvaWQge1xuICAgIGNvbnN0IHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMubG9jYWxlKSB7XG4gICAgICBjb25zdCBub3JtYWxpemVkTG9jYWxlID0gdGhpcy5fb3B0aW9ucy5sb2NhbGUucmVwbGFjZSgvXy9nLCAnLScpO1xuICAgICAgcHJvdmlkZXJzLnB1c2goe1xuICAgICAgICB0b2tlbjogY3JlYXRlVG9rZW5Gb3JFeHRlcm5hbFJlZmVyZW5jZSh0aGlzLnJlZmxlY3RvciwgSWRlbnRpZmllcnMuTE9DQUxFX0lEKSxcbiAgICAgICAgdXNlVmFsdWU6IG5vcm1hbGl6ZWRMb2NhbGUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5pMThuRm9ybWF0KSB7XG4gICAgICBwcm92aWRlcnMucHVzaCh7XG4gICAgICAgIHRva2VuOiBjcmVhdGVUb2tlbkZvckV4dGVybmFsUmVmZXJlbmNlKHRoaXMucmVmbGVjdG9yLCBJZGVudGlmaWVycy5UUkFOU0xBVElPTlNfRk9STUFUKSxcbiAgICAgICAgdXNlVmFsdWU6IHRoaXMuX29wdGlvbnMuaTE4bkZvcm1hdFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbmdNb2R1bGVDb21waWxlci5jb21waWxlKG91dHB1dEN0eCwgbmdNb2R1bGUsIHByb3ZpZGVycyk7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlQ29tcG9uZW50RmFjdG9yeShcbiAgICAgIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgIG5nTW9kdWxlOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSwgZmlsZVN1ZmZpeDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgaG9zdE1ldGEgPSB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldEhvc3RDb21wb25lbnRNZXRhZGF0YShjb21wTWV0YSk7XG4gICAgY29uc3QgaG9zdFZpZXdGYWN0b3J5VmFyID1cbiAgICAgICAgdGhpcy5fY29tcGlsZUNvbXBvbmVudChvdXRwdXRDdHgsIGhvc3RNZXRhLCBuZ01vZHVsZSwgW2NvbXBNZXRhLnR5cGVdLCBudWxsLCBmaWxlU3VmZml4KVxuICAgICAgICAgICAgLnZpZXdDbGFzc1ZhcjtcbiAgICBjb25zdCBjb21wRmFjdG9yeVZhciA9IGNvbXBvbmVudEZhY3RvcnlOYW1lKGNvbXBNZXRhLnR5cGUucmVmZXJlbmNlKTtcbiAgICBjb25zdCBpbnB1dHNFeHByczogby5MaXRlcmFsTWFwRW50cnlbXSA9IFtdO1xuICAgIGZvciAobGV0IHByb3BOYW1lIGluIGNvbXBNZXRhLmlucHV0cykge1xuICAgICAgY29uc3QgdGVtcGxhdGVOYW1lID0gY29tcE1ldGEuaW5wdXRzW3Byb3BOYW1lXTtcbiAgICAgIC8vIERvbid0IHF1b3RlIHNvIHRoYXQgdGhlIGtleSBnZXRzIG1pbmlmaWVkLi4uXG4gICAgICBpbnB1dHNFeHBycy5wdXNoKG5ldyBvLkxpdGVyYWxNYXBFbnRyeShwcm9wTmFtZSwgby5saXRlcmFsKHRlbXBsYXRlTmFtZSksIGZhbHNlKSk7XG4gICAgfVxuICAgIGNvbnN0IG91dHB1dHNFeHByczogby5MaXRlcmFsTWFwRW50cnlbXSA9IFtdO1xuICAgIGZvciAobGV0IHByb3BOYW1lIGluIGNvbXBNZXRhLm91dHB1dHMpIHtcbiAgICAgIGNvbnN0IHRlbXBsYXRlTmFtZSA9IGNvbXBNZXRhLm91dHB1dHNbcHJvcE5hbWVdO1xuICAgICAgLy8gRG9uJ3QgcXVvdGUgc28gdGhhdCB0aGUga2V5IGdldHMgbWluaWZpZWQuLi5cbiAgICAgIG91dHB1dHNFeHBycy5wdXNoKG5ldyBvLkxpdGVyYWxNYXBFbnRyeShwcm9wTmFtZSwgby5saXRlcmFsKHRlbXBsYXRlTmFtZSksIGZhbHNlKSk7XG4gICAgfVxuXG4gICAgb3V0cHV0Q3R4LnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgby52YXJpYWJsZShjb21wRmFjdG9yeVZhcilcbiAgICAgICAgICAgIC5zZXQoby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmNyZWF0ZUNvbXBvbmVudEZhY3RvcnkpLmNhbGxGbihbXG4gICAgICAgICAgICAgIG8ubGl0ZXJhbChjb21wTWV0YS5zZWxlY3RvciksIG91dHB1dEN0eC5pbXBvcnRFeHByKGNvbXBNZXRhLnR5cGUucmVmZXJlbmNlKSxcbiAgICAgICAgICAgICAgby52YXJpYWJsZShob3N0Vmlld0ZhY3RvcnlWYXIpLCBuZXcgby5MaXRlcmFsTWFwRXhwcihpbnB1dHNFeHBycyksXG4gICAgICAgICAgICAgIG5ldyBvLkxpdGVyYWxNYXBFeHByKG91dHB1dHNFeHBycyksXG4gICAgICAgICAgICAgIG8ubGl0ZXJhbEFycihcbiAgICAgICAgICAgICAgICAgIGNvbXBNZXRhLnRlbXBsYXRlICEubmdDb250ZW50U2VsZWN0b3JzLm1hcChzZWxlY3RvciA9PiBvLmxpdGVyYWwoc2VsZWN0b3IpKSlcbiAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgLnRvRGVjbFN0bXQoXG4gICAgICAgICAgICAgICAgby5pbXBvcnRUeXBlKFxuICAgICAgICAgICAgICAgICAgICBJZGVudGlmaWVycy5Db21wb25lbnRGYWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICBbby5leHByZXNzaW9uVHlwZShvdXRwdXRDdHguaW1wb3J0RXhwcihjb21wTWV0YS50eXBlLnJlZmVyZW5jZSkpICFdLFxuICAgICAgICAgICAgICAgICAgICBbby5UeXBlTW9kaWZpZXIuQ29uc3RdKSxcbiAgICAgICAgICAgICAgICBbby5TdG10TW9kaWZpZXIuRmluYWwsIG8uU3RtdE1vZGlmaWVyLkV4cG9ydGVkXSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGlsZUNvbXBvbmVudChcbiAgICAgIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgIG5nTW9kdWxlOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSwgZGlyZWN0aXZlSWRlbnRpZmllcnM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSxcbiAgICAgIGNvbXBvbmVudFN0eWxlczogQ29tcGlsZWRTdHlsZXNoZWV0fG51bGwsIGZpbGVTdWZmaXg6IHN0cmluZyk6IFZpZXdDb21waWxlUmVzdWx0IHtcbiAgICBjb25zdCB7dGVtcGxhdGU6IHBhcnNlZFRlbXBsYXRlLCBwaXBlczogdXNlZFBpcGVzfSA9XG4gICAgICAgIHRoaXMuX3BhcnNlVGVtcGxhdGUoY29tcE1ldGEsIG5nTW9kdWxlLCBkaXJlY3RpdmVJZGVudGlmaWVycyk7XG4gICAgY29uc3Qgc3R5bGVzRXhwciA9IGNvbXBvbmVudFN0eWxlcyA/IG8udmFyaWFibGUoY29tcG9uZW50U3R5bGVzLnN0eWxlc1ZhcikgOiBvLmxpdGVyYWxBcnIoW10pO1xuICAgIGNvbnN0IHZpZXdSZXN1bHQgPSB0aGlzLl92aWV3Q29tcGlsZXIuY29tcGlsZUNvbXBvbmVudChcbiAgICAgICAgb3V0cHV0Q3R4LCBjb21wTWV0YSwgcGFyc2VkVGVtcGxhdGUsIHN0eWxlc0V4cHIsIHVzZWRQaXBlcyk7XG4gICAgaWYgKGNvbXBvbmVudFN0eWxlcykge1xuICAgICAgX3Jlc29sdmVTdHlsZVN0YXRlbWVudHMoXG4gICAgICAgICAgdGhpcy5fc3ltYm9sUmVzb2x2ZXIsIGNvbXBvbmVudFN0eWxlcywgdGhpcy5fc3R5bGVDb21waWxlci5uZWVkc1N0eWxlU2hpbShjb21wTWV0YSksXG4gICAgICAgICAgZmlsZVN1ZmZpeCk7XG4gICAgfVxuICAgIHJldHVybiB2aWV3UmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VUZW1wbGF0ZShcbiAgICAgIGNvbXBNZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIG5nTW9kdWxlOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSxcbiAgICAgIGRpcmVjdGl2ZUlkZW50aWZpZXJzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10pOlxuICAgICAge3RlbXBsYXRlOiBUZW1wbGF0ZUFzdFtdLCBwaXBlczogQ29tcGlsZVBpcGVTdW1tYXJ5W119IHtcbiAgICBpZiAodGhpcy5fdGVtcGxhdGVBc3RDYWNoZS5oYXMoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVBc3RDYWNoZS5nZXQoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UpICE7XG4gICAgfVxuICAgIGNvbnN0IHByZXNlcnZlV2hpdGVzcGFjZXMgPSBjb21wTWV0YSAhLnRlbXBsYXRlICEucHJlc2VydmVXaGl0ZXNwYWNlcztcbiAgICBjb25zdCBkaXJlY3RpdmVzID1cbiAgICAgICAgZGlyZWN0aXZlSWRlbnRpZmllcnMubWFwKGRpciA9PiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZVN1bW1hcnkoZGlyLnJlZmVyZW5jZSkpO1xuICAgIGNvbnN0IHBpcGVzID0gbmdNb2R1bGUudHJhbnNpdGl2ZU1vZHVsZS5waXBlcy5tYXAoXG4gICAgICAgIHBpcGUgPT4gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRQaXBlU3VtbWFyeShwaXBlLnJlZmVyZW5jZSkpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3RlbXBsYXRlUGFyc2VyLnBhcnNlKFxuICAgICAgICBjb21wTWV0YSwgY29tcE1ldGEudGVtcGxhdGUgIS5odG1sQXN0ICEsIGRpcmVjdGl2ZXMsIHBpcGVzLCBuZ01vZHVsZS5zY2hlbWFzLFxuICAgICAgICB0ZW1wbGF0ZVNvdXJjZVVybChuZ01vZHVsZS50eXBlLCBjb21wTWV0YSwgY29tcE1ldGEudGVtcGxhdGUgISksIHByZXNlcnZlV2hpdGVzcGFjZXMpO1xuICAgIHRoaXMuX3RlbXBsYXRlQXN0Q2FjaGUuc2V0KGNvbXBNZXRhLnR5cGUucmVmZXJlbmNlLCByZXN1bHQpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVPdXRwdXRDb250ZXh0KGdlbkZpbGVQYXRoOiBzdHJpbmcpOiBPdXRwdXRDb250ZXh0IHtcbiAgICBjb25zdCBpbXBvcnRFeHByID1cbiAgICAgICAgKHN5bWJvbDogU3RhdGljU3ltYm9sLCB0eXBlUGFyYW1zOiBvLlR5cGVbXSB8IG51bGwgPSBudWxsLFxuICAgICAgICAgdXNlU3VtbWFyaWVzOiBib29sZWFuID0gdHJ1ZSkgPT4ge1xuICAgICAgICAgIGlmICghKHN5bWJvbCBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW50ZXJuYWwgZXJyb3I6IHVua25vd24gaWRlbnRpZmllciAke0pTT04uc3RyaW5naWZ5KHN5bWJvbCl9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGFyaXR5ID0gdGhpcy5fc3ltYm9sUmVzb2x2ZXIuZ2V0VHlwZUFyaXR5KHN5bWJvbCkgfHwgMDtcbiAgICAgICAgICBjb25zdCB7ZmlsZVBhdGgsIG5hbWUsIG1lbWJlcnN9ID1cbiAgICAgICAgICAgICAgdGhpcy5fc3ltYm9sUmVzb2x2ZXIuZ2V0SW1wb3J0QXMoc3ltYm9sLCB1c2VTdW1tYXJpZXMpIHx8IHN5bWJvbDtcbiAgICAgICAgICBjb25zdCBpbXBvcnRNb2R1bGUgPSB0aGlzLl9maWxlTmFtZVRvTW9kdWxlTmFtZShmaWxlUGF0aCwgZ2VuRmlsZVBhdGgpO1xuXG4gICAgICAgICAgLy8gSXQgc2hvdWxkIGJlIGdvb2QgZW5vdWdoIHRvIGNvbXBhcmUgZmlsZVBhdGggdG8gZ2VuRmlsZVBhdGggYW5kIGlmIHRoZXkgYXJlIGVxdWFsXG4gICAgICAgICAgLy8gdGhlcmUgaXMgYSBzZWxmIHJlZmVyZW5jZS4gSG93ZXZlciwgbmdmYWN0b3J5IGZpbGVzIGdlbmVyYXRlIHRvIC50cyBidXQgdGhlaXJcbiAgICAgICAgICAvLyBzeW1ib2xzIGhhdmUgLmQudHMgc28gYSBzaW1wbGUgY29tcGFyZSBpcyBpbnN1ZmZpY2llbnQuIFRoZXkgc2hvdWxkIGJlIGNhbm9uaWNhbFxuICAgICAgICAgIC8vIGFuZCBpcyB0cmFja2VkIGJ5ICMxNzcwNS5cbiAgICAgICAgICBjb25zdCBzZWxmUmVmZXJlbmNlID0gdGhpcy5fZmlsZU5hbWVUb01vZHVsZU5hbWUoZ2VuRmlsZVBhdGgsIGdlbkZpbGVQYXRoKTtcbiAgICAgICAgICBjb25zdCBtb2R1bGVOYW1lID0gaW1wb3J0TW9kdWxlID09PSBzZWxmUmVmZXJlbmNlID8gbnVsbCA6IGltcG9ydE1vZHVsZTtcblxuICAgICAgICAgIC8vIElmIHdlIGFyZSBpbiBhIHR5cGUgZXhwcmVzc2lvbiB0aGF0IHJlZmVycyB0byBhIGdlbmVyaWMgdHlwZSB0aGVuIHN1cHBseVxuICAgICAgICAgIC8vIHRoZSByZXF1aXJlZCB0eXBlIHBhcmFtZXRlcnMuIElmIHRoZXJlIHdlcmUgbm90IGVub3VnaCB0eXBlIHBhcmFtZXRlcnNcbiAgICAgICAgICAvLyBzdXBwbGllZCwgc3VwcGx5IGFueSBhcyB0aGUgdHlwZS4gT3V0c2lkZSBhIHR5cGUgZXhwcmVzc2lvbiB0aGUgcmVmZXJlbmNlXG4gICAgICAgICAgLy8gc2hvdWxkIG5vdCBzdXBwbHkgdHlwZSBwYXJhbWV0ZXJzIGFuZCBiZSB0cmVhdGVkIGFzIGEgc2ltcGxlIHZhbHVlIHJlZmVyZW5jZVxuICAgICAgICAgIC8vIHRvIHRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBpdHNlbGYuXG4gICAgICAgICAgY29uc3Qgc3VwcGxpZWRUeXBlUGFyYW1zID0gdHlwZVBhcmFtcyB8fCBbXTtcbiAgICAgICAgICBjb25zdCBtaXNzaW5nVHlwZVBhcmFtc0NvdW50ID0gYXJpdHkgLSBzdXBwbGllZFR5cGVQYXJhbXMubGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IGFsbFR5cGVQYXJhbXMgPVxuICAgICAgICAgICAgICBzdXBwbGllZFR5cGVQYXJhbXMuY29uY2F0KG5ldyBBcnJheShtaXNzaW5nVHlwZVBhcmFtc0NvdW50KS5maWxsKG8uRFlOQU1JQ19UWVBFKSk7XG4gICAgICAgICAgcmV0dXJuIG1lbWJlcnMucmVkdWNlKFxuICAgICAgICAgICAgICAoZXhwciwgbWVtYmVyTmFtZSkgPT4gZXhwci5wcm9wKG1lbWJlck5hbWUpLFxuICAgICAgICAgICAgICA8by5FeHByZXNzaW9uPm8uaW1wb3J0RXhwcihcbiAgICAgICAgICAgICAgICAgIG5ldyBvLkV4dGVybmFsUmVmZXJlbmNlKG1vZHVsZU5hbWUsIG5hbWUsIG51bGwpLCBhbGxUeXBlUGFyYW1zKSk7XG4gICAgICAgIH07XG5cbiAgICByZXR1cm4ge3N0YXRlbWVudHM6IFtdLCBnZW5GaWxlUGF0aCwgaW1wb3J0RXhwciwgY29uc3RhbnRQb29sOiBuZXcgQ29uc3RhbnRQb29sKCl9O1xuICB9XG5cbiAgcHJpdmF0ZSBfZmlsZU5hbWVUb01vZHVsZU5hbWUoaW1wb3J0ZWRGaWxlUGF0aDogc3RyaW5nLCBjb250YWluaW5nRmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3N1bW1hcnlSZXNvbHZlci5nZXRLbm93bk1vZHVsZU5hbWUoaW1wb3J0ZWRGaWxlUGF0aCkgfHxcbiAgICAgICAgdGhpcy5fc3ltYm9sUmVzb2x2ZXIuZ2V0S25vd25Nb2R1bGVOYW1lKGltcG9ydGVkRmlsZVBhdGgpIHx8XG4gICAgICAgIHRoaXMuX2hvc3QuZmlsZU5hbWVUb01vZHVsZU5hbWUoaW1wb3J0ZWRGaWxlUGF0aCwgY29udGFpbmluZ0ZpbGVQYXRoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvZGVnZW5TdHlsZXMoXG4gICAgICBzcmNGaWxlVXJsOiBzdHJpbmcsIGNvbXBNZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICBzdHlsZXNoZWV0TWV0YWRhdGE6IENvbXBpbGVTdHlsZXNoZWV0TWV0YWRhdGEsIGlzU2hpbW1lZDogYm9vbGVhbixcbiAgICAgIGZpbGVTdWZmaXg6IHN0cmluZyk6IEdlbmVyYXRlZEZpbGUge1xuICAgIGNvbnN0IG91dHB1dEN0eCA9IHRoaXMuX2NyZWF0ZU91dHB1dENvbnRleHQoXG4gICAgICAgIF9zdHlsZXNNb2R1bGVVcmwoc3R5bGVzaGVldE1ldGFkYXRhLm1vZHVsZVVybCAhLCBpc1NoaW1tZWQsIGZpbGVTdWZmaXgpKTtcbiAgICBjb25zdCBjb21waWxlZFN0eWxlc2hlZXQgPVxuICAgICAgICB0aGlzLl9zdHlsZUNvbXBpbGVyLmNvbXBpbGVTdHlsZXMob3V0cHV0Q3R4LCBjb21wTWV0YSwgc3R5bGVzaGVldE1ldGFkYXRhLCBpc1NoaW1tZWQpO1xuICAgIF9yZXNvbHZlU3R5bGVTdGF0ZW1lbnRzKHRoaXMuX3N5bWJvbFJlc29sdmVyLCBjb21waWxlZFN0eWxlc2hlZXQsIGlzU2hpbW1lZCwgZmlsZVN1ZmZpeCk7XG4gICAgcmV0dXJuIHRoaXMuX2NvZGVnZW5Tb3VyY2VNb2R1bGUoc3JjRmlsZVVybCwgb3V0cHV0Q3R4KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvZGVnZW5Tb3VyY2VNb2R1bGUoc3JjRmlsZVVybDogc3RyaW5nLCBjdHg6IE91dHB1dENvbnRleHQpOiBHZW5lcmF0ZWRGaWxlIHtcbiAgICByZXR1cm4gbmV3IEdlbmVyYXRlZEZpbGUoc3JjRmlsZVVybCwgY3R4LmdlbkZpbGVQYXRoLCBjdHguc3RhdGVtZW50cyk7XG4gIH1cblxuICBsaXN0TGF6eVJvdXRlcyhlbnRyeVJvdXRlPzogc3RyaW5nLCBhbmFseXplZE1vZHVsZXM/OiBOZ0FuYWx5emVkTW9kdWxlcyk6IExhenlSb3V0ZVtdIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBpZiAoZW50cnlSb3V0ZSkge1xuICAgICAgY29uc3Qgc3ltYm9sID0gcGFyc2VMYXp5Um91dGUoZW50cnlSb3V0ZSwgdGhpcy5yZWZsZWN0b3IpLnJlZmVyZW5jZWRNb2R1bGU7XG4gICAgICByZXR1cm4gdmlzaXRMYXp5Um91dGUoc3ltYm9sKTtcbiAgICB9IGVsc2UgaWYgKGFuYWx5emVkTW9kdWxlcykge1xuICAgICAgY29uc3QgYWxsTGF6eVJvdXRlczogTGF6eVJvdXRlW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgbmdNb2R1bGUgb2YgYW5hbHl6ZWRNb2R1bGVzLm5nTW9kdWxlcykge1xuICAgICAgICBjb25zdCBsYXp5Um91dGVzID0gbGlzdExhenlSb3V0ZXMobmdNb2R1bGUsIHRoaXMucmVmbGVjdG9yKTtcbiAgICAgICAgZm9yIChjb25zdCBsYXp5Um91dGUgb2YgbGF6eVJvdXRlcykge1xuICAgICAgICAgIGFsbExhenlSb3V0ZXMucHVzaChsYXp5Um91dGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYWxsTGF6eVJvdXRlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFaXRoZXIgcm91dGUgb3IgYW5hbHl6ZWRNb2R1bGVzIGhhcyB0byBiZSBzcGVjaWZpZWQhYCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmlzaXRMYXp5Um91dGUoXG4gICAgICAgIHN5bWJvbDogU3RhdGljU3ltYm9sLCBzZWVuUm91dGVzID0gbmV3IFNldDxTdGF0aWNTeW1ib2w+KCksXG4gICAgICAgIGFsbExhenlSb3V0ZXM6IExhenlSb3V0ZVtdID0gW10pOiBMYXp5Um91dGVbXSB7XG4gICAgICAvLyBTdXBwb3J0IHBvaW50aW5nIHRvIGRlZmF1bHQgZXhwb3J0cywgYnV0IHN0b3AgcmVjdXJzaW5nIHRoZXJlLFxuICAgICAgLy8gYXMgdGhlIFN0YXRpY1JlZmxlY3RvciBkb2VzIG5vdCB5ZXQgc3VwcG9ydCBkZWZhdWx0IGV4cG9ydHMuXG4gICAgICBpZiAoc2VlblJvdXRlcy5oYXMoc3ltYm9sKSB8fCAhc3ltYm9sLm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGFsbExhenlSb3V0ZXM7XG4gICAgICB9XG4gICAgICBzZWVuUm91dGVzLmFkZChzeW1ib2wpO1xuICAgICAgY29uc3QgbGF6eVJvdXRlcyA9IGxpc3RMYXp5Um91dGVzKFxuICAgICAgICAgIHNlbGYuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0TmdNb2R1bGVNZXRhZGF0YShzeW1ib2wsIHRydWUpICEsIHNlbGYucmVmbGVjdG9yKTtcbiAgICAgIGZvciAoY29uc3QgbGF6eVJvdXRlIG9mIGxhenlSb3V0ZXMpIHtcbiAgICAgICAgYWxsTGF6eVJvdXRlcy5wdXNoKGxhenlSb3V0ZSk7XG4gICAgICAgIHZpc2l0TGF6eVJvdXRlKGxhenlSb3V0ZS5yZWZlcmVuY2VkTW9kdWxlLCBzZWVuUm91dGVzLCBhbGxMYXp5Um91dGVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhbGxMYXp5Um91dGVzO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlRW1wdHlTdHViKG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCkge1xuICAvLyBOb3RlOiBXZSBuZWVkIHRvIHByb2R1Y2UgYXQgbGVhc3Qgb25lIGltcG9ydCBzdGF0ZW1lbnQgc28gdGhhdFxuICAvLyBUeXBlU2NyaXB0IGtub3dzIHRoYXQgdGhlIGZpbGUgaXMgYW4gZXM2IG1vZHVsZS4gT3RoZXJ3aXNlIG91ciBnZW5lcmF0ZWRcbiAgLy8gZXhwb3J0cyAvIGltcG9ydHMgd29uJ3QgYmUgZW1pdHRlZCBwcm9wZXJseSBieSBUeXBlU2NyaXB0LlxuICBvdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5Db21wb25lbnRGYWN0b3J5KS50b1N0bXQoKSk7XG59XG5cblxuZnVuY3Rpb24gX3Jlc29sdmVTdHlsZVN0YXRlbWVudHMoXG4gICAgc3ltYm9sUmVzb2x2ZXI6IFN0YXRpY1N5bWJvbFJlc29sdmVyLCBjb21waWxlUmVzdWx0OiBDb21waWxlZFN0eWxlc2hlZXQsIG5lZWRzU2hpbTogYm9vbGVhbixcbiAgICBmaWxlU3VmZml4OiBzdHJpbmcpOiB2b2lkIHtcbiAgY29tcGlsZVJlc3VsdC5kZXBlbmRlbmNpZXMuZm9yRWFjaCgoZGVwKSA9PiB7XG4gICAgZGVwLnNldFZhbHVlKHN5bWJvbFJlc29sdmVyLmdldFN0YXRpY1N5bWJvbChcbiAgICAgICAgX3N0eWxlc01vZHVsZVVybChkZXAubW9kdWxlVXJsLCBuZWVkc1NoaW0sIGZpbGVTdWZmaXgpLCBkZXAubmFtZSkpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gX3N0eWxlc01vZHVsZVVybChzdHlsZXNoZWV0VXJsOiBzdHJpbmcsIHNoaW06IGJvb2xlYW4sIHN1ZmZpeDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3N0eWxlc2hlZXRVcmx9JHtzaGltID8gJy5zaGltJyA6ICcnfS5uZ3N0eWxlJHtzdWZmaXh9YDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gIG5nTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGFbXTtcbiAgbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZTogTWFwPFN0YXRpY1N5bWJvbCwgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGE+O1xuICBmaWxlczogTmdBbmFseXplZEZpbGVbXTtcbiAgc3ltYm9sc01pc3NpbmdNb2R1bGU/OiBTdGF0aWNTeW1ib2xbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZ0FuYWx5emVkRmlsZVdpdGhJbmplY3RhYmxlcyB7XG4gIGZpbGVOYW1lOiBzdHJpbmc7XG4gIGluamVjdGFibGVzOiBDb21waWxlSW5qZWN0YWJsZU1ldGFkYXRhW107XG4gIHNoYWxsb3dNb2R1bGVzOiBDb21waWxlU2hhbGxvd01vZHVsZU1ldGFkYXRhW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmdBbmFseXplZEZpbGUge1xuICBmaWxlTmFtZTogc3RyaW5nO1xuICBkaXJlY3RpdmVzOiBTdGF0aWNTeW1ib2xbXTtcbiAgcGlwZXM6IFN0YXRpY1N5bWJvbFtdO1xuICBuZ01vZHVsZXM6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhW107XG4gIGluamVjdGFibGVzOiBDb21waWxlSW5qZWN0YWJsZU1ldGFkYXRhW107XG4gIGV4cG9ydHNOb25Tb3VyY2VGaWxlczogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZ0FuYWx5emVNb2R1bGVzSG9zdCB7IGlzU291cmNlRmlsZShmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbjsgfVxuXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZU5nTW9kdWxlcyhcbiAgICBmaWxlTmFtZXM6IHN0cmluZ1tdLCBob3N0OiBOZ0FuYWx5emVNb2R1bGVzSG9zdCwgc3RhdGljU3ltYm9sUmVzb2x2ZXI6IFN0YXRpY1N5bWJvbFJlc29sdmVyLFxuICAgIG1ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyKTogTmdBbmFseXplZE1vZHVsZXMge1xuICBjb25zdCBmaWxlcyA9IF9hbmFseXplRmlsZXNJbmNsdWRpbmdOb25Qcm9ncmFtRmlsZXMoXG4gICAgICBmaWxlTmFtZXMsIGhvc3QsIHN0YXRpY1N5bWJvbFJlc29sdmVyLCBtZXRhZGF0YVJlc29sdmVyKTtcbiAgcmV0dXJuIG1lcmdlQW5hbHl6ZWRGaWxlcyhmaWxlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmFseXplQW5kVmFsaWRhdGVOZ01vZHVsZXMoXG4gICAgZmlsZU5hbWVzOiBzdHJpbmdbXSwgaG9zdDogTmdBbmFseXplTW9kdWxlc0hvc3QsIHN0YXRpY1N5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcixcbiAgICBtZXRhZGF0YVJlc29sdmVyOiBDb21waWxlTWV0YWRhdGFSZXNvbHZlcik6IE5nQW5hbHl6ZWRNb2R1bGVzIHtcbiAgcmV0dXJuIHZhbGlkYXRlQW5hbHl6ZWRNb2R1bGVzKFxuICAgICAgYW5hbHl6ZU5nTW9kdWxlcyhmaWxlTmFtZXMsIGhvc3QsIHN0YXRpY1N5bWJvbFJlc29sdmVyLCBtZXRhZGF0YVJlc29sdmVyKSk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlQW5hbHl6ZWRNb2R1bGVzKGFuYWx5emVkTW9kdWxlczogTmdBbmFseXplZE1vZHVsZXMpOiBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gIGlmIChhbmFseXplZE1vZHVsZXMuc3ltYm9sc01pc3NpbmdNb2R1bGUgJiYgYW5hbHl6ZWRNb2R1bGVzLnN5bWJvbHNNaXNzaW5nTW9kdWxlLmxlbmd0aCkge1xuICAgIGNvbnN0IG1lc3NhZ2VzID0gYW5hbHl6ZWRNb2R1bGVzLnN5bWJvbHNNaXNzaW5nTW9kdWxlLm1hcChcbiAgICAgICAgcyA9PlxuICAgICAgICAgICAgYENhbm5vdCBkZXRlcm1pbmUgdGhlIG1vZHVsZSBmb3IgY2xhc3MgJHtzLm5hbWV9IGluICR7cy5maWxlUGF0aH0hIEFkZCAke3MubmFtZX0gdG8gdGhlIE5nTW9kdWxlIHRvIGZpeCBpdC5gKTtcbiAgICB0aHJvdyBzeW50YXhFcnJvcihtZXNzYWdlcy5qb2luKCdcXG4nKSk7XG4gIH1cbiAgcmV0dXJuIGFuYWx5emVkTW9kdWxlcztcbn1cblxuLy8gQW5hbHl6ZXMgYWxsIG9mIHRoZSBwcm9ncmFtIGZpbGVzLFxuLy8gaW5jbHVkaW5nIGZpbGVzIHRoYXQgYXJlIG5vdCBwYXJ0IG9mIHRoZSBwcm9ncmFtXG4vLyBidXQgYXJlIHJlZmVyZW5jZWQgYnkgYW4gTmdNb2R1bGUuXG5mdW5jdGlvbiBfYW5hbHl6ZUZpbGVzSW5jbHVkaW5nTm9uUHJvZ3JhbUZpbGVzKFxuICAgIGZpbGVOYW1lczogc3RyaW5nW10sIGhvc3Q6IE5nQW5hbHl6ZU1vZHVsZXNIb3N0LCBzdGF0aWNTeW1ib2xSZXNvbHZlcjogU3RhdGljU3ltYm9sUmVzb2x2ZXIsXG4gICAgbWV0YWRhdGFSZXNvbHZlcjogQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIpOiBOZ0FuYWx5emVkRmlsZVtdIHtcbiAgY29uc3Qgc2VlbkZpbGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IGZpbGVzOiBOZ0FuYWx5emVkRmlsZVtdID0gW107XG5cbiAgY29uc3QgdmlzaXRGaWxlID0gKGZpbGVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoc2VlbkZpbGVzLmhhcyhmaWxlTmFtZSkgfHwgIWhvc3QuaXNTb3VyY2VGaWxlKGZpbGVOYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBzZWVuRmlsZXMuYWRkKGZpbGVOYW1lKTtcbiAgICBjb25zdCBhbmFseXplZEZpbGUgPSBhbmFseXplRmlsZShob3N0LCBzdGF0aWNTeW1ib2xSZXNvbHZlciwgbWV0YWRhdGFSZXNvbHZlciwgZmlsZU5hbWUpO1xuICAgIGZpbGVzLnB1c2goYW5hbHl6ZWRGaWxlKTtcbiAgICBhbmFseXplZEZpbGUubmdNb2R1bGVzLmZvckVhY2gobmdNb2R1bGUgPT4ge1xuICAgICAgbmdNb2R1bGUudHJhbnNpdGl2ZU1vZHVsZS5tb2R1bGVzLmZvckVhY2gobW9kTWV0YSA9PiB2aXNpdEZpbGUobW9kTWV0YS5yZWZlcmVuY2UuZmlsZVBhdGgpKTtcbiAgICB9KTtcbiAgfTtcbiAgZmlsZU5hbWVzLmZvckVhY2goKGZpbGVOYW1lKSA9PiB2aXNpdEZpbGUoZmlsZU5hbWUpKTtcbiAgcmV0dXJuIGZpbGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZUZpbGUoXG4gICAgaG9zdDogTmdBbmFseXplTW9kdWxlc0hvc3QsIHN0YXRpY1N5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcixcbiAgICBtZXRhZGF0YVJlc29sdmVyOiBDb21waWxlTWV0YWRhdGFSZXNvbHZlciwgZmlsZU5hbWU6IHN0cmluZyk6IE5nQW5hbHl6ZWRGaWxlIHtcbiAgY29uc3QgZGlyZWN0aXZlczogU3RhdGljU3ltYm9sW10gPSBbXTtcbiAgY29uc3QgcGlwZXM6IFN0YXRpY1N5bWJvbFtdID0gW107XG4gIGNvbnN0IGluamVjdGFibGVzOiBDb21waWxlSW5qZWN0YWJsZU1ldGFkYXRhW10gPSBbXTtcbiAgY29uc3QgbmdNb2R1bGVzOiBDb21waWxlTmdNb2R1bGVNZXRhZGF0YVtdID0gW107XG4gIGNvbnN0IGhhc0RlY29yYXRvcnMgPSBzdGF0aWNTeW1ib2xSZXNvbHZlci5oYXNEZWNvcmF0b3JzKGZpbGVOYW1lKTtcbiAgbGV0IGV4cG9ydHNOb25Tb3VyY2VGaWxlcyA9IGZhbHNlO1xuICAvLyBEb24ndCBhbmFseXplIC5kLnRzIGZpbGVzIHRoYXQgaGF2ZSBubyBkZWNvcmF0b3JzIGFzIGEgc2hvcnRjdXRcbiAgLy8gdG8gc3BlZWQgdXAgdGhlIGFuYWx5c2lzLiBUaGlzIHByZXZlbnRzIHVzIGZyb21cbiAgLy8gcmVzb2x2aW5nIHRoZSByZWZlcmVuY2VzIGluIHRoZXNlIGZpbGVzLlxuICAvLyBOb3RlOiBleHBvcnRzTm9uU291cmNlRmlsZXMgaXMgb25seSBuZWVkZWQgd2hlbiBjb21waWxpbmcgd2l0aCBzdW1tYXJpZXMsXG4gIC8vIHdoaWNoIGlzIG5vdCB0aGUgY2FzZSB3aGVuIC5kLnRzIGZpbGVzIGFyZSB0cmVhdGVkIGFzIGlucHV0IGZpbGVzLlxuICBpZiAoIWZpbGVOYW1lLmVuZHNXaXRoKCcuZC50cycpIHx8IGhhc0RlY29yYXRvcnMpIHtcbiAgICBzdGF0aWNTeW1ib2xSZXNvbHZlci5nZXRTeW1ib2xzT2YoZmlsZU5hbWUpLmZvckVhY2goKHN5bWJvbCkgPT4ge1xuICAgICAgY29uc3QgcmVzb2x2ZWRTeW1ib2wgPSBzdGF0aWNTeW1ib2xSZXNvbHZlci5yZXNvbHZlU3ltYm9sKHN5bWJvbCk7XG4gICAgICBjb25zdCBzeW1ib2xNZXRhID0gcmVzb2x2ZWRTeW1ib2wubWV0YWRhdGE7XG4gICAgICBpZiAoIXN5bWJvbE1ldGEgfHwgc3ltYm9sTWV0YS5fX3N5bWJvbGljID09PSAnZXJyb3InKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxldCBpc05nU3ltYm9sID0gZmFsc2U7XG4gICAgICBpZiAoc3ltYm9sTWV0YS5fX3N5bWJvbGljID09PSAnY2xhc3MnKSB7XG4gICAgICAgIGlmIChtZXRhZGF0YVJlc29sdmVyLmlzRGlyZWN0aXZlKHN5bWJvbCkpIHtcbiAgICAgICAgICBpc05nU3ltYm9sID0gdHJ1ZTtcbiAgICAgICAgICBkaXJlY3RpdmVzLnB1c2goc3ltYm9sKTtcbiAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YVJlc29sdmVyLmlzUGlwZShzeW1ib2wpKSB7XG4gICAgICAgICAgaXNOZ1N5bWJvbCA9IHRydWU7XG4gICAgICAgICAgcGlwZXMucHVzaChzeW1ib2wpO1xuICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhUmVzb2x2ZXIuaXNOZ01vZHVsZShzeW1ib2wpKSB7XG4gICAgICAgICAgY29uc3QgbmdNb2R1bGUgPSBtZXRhZGF0YVJlc29sdmVyLmdldE5nTW9kdWxlTWV0YWRhdGEoc3ltYm9sLCBmYWxzZSk7XG4gICAgICAgICAgaWYgKG5nTW9kdWxlKSB7XG4gICAgICAgICAgICBpc05nU3ltYm9sID0gdHJ1ZTtcbiAgICAgICAgICAgIG5nTW9kdWxlcy5wdXNoKG5nTW9kdWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGFSZXNvbHZlci5pc0luamVjdGFibGUoc3ltYm9sKSkge1xuICAgICAgICAgIGlzTmdTeW1ib2wgPSB0cnVlO1xuICAgICAgICAgIGNvbnN0IGluamVjdGFibGUgPSBtZXRhZGF0YVJlc29sdmVyLmdldEluamVjdGFibGVNZXRhZGF0YShzeW1ib2wsIG51bGwsIGZhbHNlKTtcbiAgICAgICAgICBpZiAoaW5qZWN0YWJsZSkge1xuICAgICAgICAgICAgaW5qZWN0YWJsZXMucHVzaChpbmplY3RhYmxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaXNOZ1N5bWJvbCkge1xuICAgICAgICBleHBvcnRzTm9uU291cmNlRmlsZXMgPVxuICAgICAgICAgICAgZXhwb3J0c05vblNvdXJjZUZpbGVzIHx8IGlzVmFsdWVFeHBvcnRpbmdOb25Tb3VyY2VGaWxlKGhvc3QsIHN5bWJvbE1ldGEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiB7XG4gICAgICBmaWxlTmFtZSwgZGlyZWN0aXZlcywgcGlwZXMsIG5nTW9kdWxlcywgaW5qZWN0YWJsZXMsIGV4cG9ydHNOb25Tb3VyY2VGaWxlcyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVGaWxlRm9ySW5qZWN0YWJsZXMoXG4gICAgaG9zdDogTmdBbmFseXplTW9kdWxlc0hvc3QsIHN0YXRpY1N5bWJvbFJlc29sdmVyOiBTdGF0aWNTeW1ib2xSZXNvbHZlcixcbiAgICBtZXRhZGF0YVJlc29sdmVyOiBDb21waWxlTWV0YWRhdGFSZXNvbHZlciwgZmlsZU5hbWU6IHN0cmluZyk6IE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzIHtcbiAgY29uc3QgaW5qZWN0YWJsZXM6IENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGFbXSA9IFtdO1xuICBjb25zdCBzaGFsbG93TW9kdWxlczogQ29tcGlsZVNoYWxsb3dNb2R1bGVNZXRhZGF0YVtdID0gW107XG4gIGlmIChzdGF0aWNTeW1ib2xSZXNvbHZlci5oYXNEZWNvcmF0b3JzKGZpbGVOYW1lKSkge1xuICAgIHN0YXRpY1N5bWJvbFJlc29sdmVyLmdldFN5bWJvbHNPZihmaWxlTmFtZSkuZm9yRWFjaCgoc3ltYm9sKSA9PiB7XG4gICAgICBjb25zdCByZXNvbHZlZFN5bWJvbCA9IHN0YXRpY1N5bWJvbFJlc29sdmVyLnJlc29sdmVTeW1ib2woc3ltYm9sKTtcbiAgICAgIGNvbnN0IHN5bWJvbE1ldGEgPSByZXNvbHZlZFN5bWJvbC5tZXRhZGF0YTtcbiAgICAgIGlmICghc3ltYm9sTWV0YSB8fCBzeW1ib2xNZXRhLl9fc3ltYm9saWMgPT09ICdlcnJvcicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGV0IGlzTmdTeW1ib2wgPSBmYWxzZTtcbiAgICAgIGlmIChzeW1ib2xNZXRhLl9fc3ltYm9saWMgPT09ICdjbGFzcycpIHtcbiAgICAgICAgaWYgKG1ldGFkYXRhUmVzb2x2ZXIuaXNJbmplY3RhYmxlKHN5bWJvbCkpIHtcbiAgICAgICAgICBpc05nU3ltYm9sID0gdHJ1ZTtcbiAgICAgICAgICBjb25zdCBpbmplY3RhYmxlID0gbWV0YWRhdGFSZXNvbHZlci5nZXRJbmplY3RhYmxlTWV0YWRhdGEoc3ltYm9sLCBudWxsLCBmYWxzZSk7XG4gICAgICAgICAgaWYgKGluamVjdGFibGUpIHtcbiAgICAgICAgICAgIGluamVjdGFibGVzLnB1c2goaW5qZWN0YWJsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhUmVzb2x2ZXIuaXNOZ01vZHVsZShzeW1ib2wpKSB7XG4gICAgICAgICAgaXNOZ1N5bWJvbCA9IHRydWU7XG4gICAgICAgICAgY29uc3QgbW9kdWxlID0gbWV0YWRhdGFSZXNvbHZlci5nZXRTaGFsbG93TW9kdWxlTWV0YWRhdGEoc3ltYm9sKTtcbiAgICAgICAgICBpZiAobW9kdWxlKSB7XG4gICAgICAgICAgICBzaGFsbG93TW9kdWxlcy5wdXNoKG1vZHVsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHtmaWxlTmFtZSwgaW5qZWN0YWJsZXMsIHNoYWxsb3dNb2R1bGVzfTtcbn1cblxuZnVuY3Rpb24gaXNWYWx1ZUV4cG9ydGluZ05vblNvdXJjZUZpbGUoaG9zdDogTmdBbmFseXplTW9kdWxlc0hvc3QsIG1ldGFkYXRhOiBhbnkpOiBib29sZWFuIHtcbiAgbGV0IGV4cG9ydHNOb25Tb3VyY2VGaWxlcyA9IGZhbHNlO1xuXG4gIGNsYXNzIFZpc2l0b3IgaW1wbGVtZW50cyBWYWx1ZVZpc2l0b3Ige1xuICAgIHZpc2l0QXJyYXkoYXJyOiBhbnlbXSwgY29udGV4dDogYW55KTogYW55IHsgYXJyLmZvckVhY2godiA9PiB2aXNpdFZhbHVlKHYsIHRoaXMsIGNvbnRleHQpKTsgfVxuICAgIHZpc2l0U3RyaW5nTWFwKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgICBPYmplY3Qua2V5cyhtYXApLmZvckVhY2goKGtleSkgPT4gdmlzaXRWYWx1ZShtYXBba2V5XSwgdGhpcywgY29udGV4dCkpO1xuICAgIH1cbiAgICB2aXNpdFByaW1pdGl2ZSh2YWx1ZTogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgICB2aXNpdE90aGVyKHZhbHVlOiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wgJiYgIWhvc3QuaXNTb3VyY2VGaWxlKHZhbHVlLmZpbGVQYXRoKSkge1xuICAgICAgICBleHBvcnRzTm9uU291cmNlRmlsZXMgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZpc2l0VmFsdWUobWV0YWRhdGEsIG5ldyBWaXNpdG9yKCksIG51bGwpO1xuICByZXR1cm4gZXhwb3J0c05vblNvdXJjZUZpbGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VBbmFseXplZEZpbGVzKGFuYWx5emVkRmlsZXM6IE5nQW5hbHl6ZWRGaWxlW10pOiBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gIGNvbnN0IGFsbE5nTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGFbXSA9IFtdO1xuICBjb25zdCBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlID0gbmV3IE1hcDxTdGF0aWNTeW1ib2wsIENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhPigpO1xuICBjb25zdCBhbGxQaXBlc0FuZERpcmVjdGl2ZXMgPSBuZXcgU2V0PFN0YXRpY1N5bWJvbD4oKTtcblxuICBhbmFseXplZEZpbGVzLmZvckVhY2goYWYgPT4ge1xuICAgIGFmLm5nTW9kdWxlcy5mb3JFYWNoKG5nTW9kdWxlID0+IHtcbiAgICAgIGFsbE5nTW9kdWxlcy5wdXNoKG5nTW9kdWxlKTtcbiAgICAgIG5nTW9kdWxlLmRlY2xhcmVkRGlyZWN0aXZlcy5mb3JFYWNoKFxuICAgICAgICAgIGQgPT4gbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZS5zZXQoZC5yZWZlcmVuY2UsIG5nTW9kdWxlKSk7XG4gICAgICBuZ01vZHVsZS5kZWNsYXJlZFBpcGVzLmZvckVhY2gocCA9PiBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlLnNldChwLnJlZmVyZW5jZSwgbmdNb2R1bGUpKTtcbiAgICB9KTtcbiAgICBhZi5kaXJlY3RpdmVzLmZvckVhY2goZCA9PiBhbGxQaXBlc0FuZERpcmVjdGl2ZXMuYWRkKGQpKTtcbiAgICBhZi5waXBlcy5mb3JFYWNoKHAgPT4gYWxsUGlwZXNBbmREaXJlY3RpdmVzLmFkZChwKSk7XG4gIH0pO1xuXG4gIGNvbnN0IHN5bWJvbHNNaXNzaW5nTW9kdWxlOiBTdGF0aWNTeW1ib2xbXSA9IFtdO1xuICBhbGxQaXBlc0FuZERpcmVjdGl2ZXMuZm9yRWFjaChyZWYgPT4ge1xuICAgIGlmICghbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZS5oYXMocmVmKSkge1xuICAgICAgc3ltYm9sc01pc3NpbmdNb2R1bGUucHVzaChyZWYpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB7XG4gICAgbmdNb2R1bGVzOiBhbGxOZ01vZHVsZXMsXG4gICAgbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZSxcbiAgICBzeW1ib2xzTWlzc2luZ01vZHVsZSxcbiAgICBmaWxlczogYW5hbHl6ZWRGaWxlc1xuICB9O1xufVxuXG5mdW5jdGlvbiBtZXJnZUFuZFZhbGlkYXRlTmdGaWxlcyhmaWxlczogTmdBbmFseXplZEZpbGVbXSk6IE5nQW5hbHl6ZWRNb2R1bGVzIHtcbiAgcmV0dXJuIHZhbGlkYXRlQW5hbHl6ZWRNb2R1bGVzKG1lcmdlQW5hbHl6ZWRGaWxlcyhmaWxlcykpO1xufVxuIl19