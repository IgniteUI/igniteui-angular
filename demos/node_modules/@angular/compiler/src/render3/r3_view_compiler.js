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
        define("@angular/compiler/src/render3/r3_view_compiler", ["require", "exports", "tslib", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/compiler_util/expression_converter", "@angular/compiler/src/expression_parser/ast", "@angular/compiler/src/identifiers", "@angular/compiler/src/lifecycle_reflector", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/parse_util", "@angular/compiler/src/selector", "@angular/compiler/src/template_parser/template_ast", "@angular/compiler/src/util", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/r3_types"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var expression_converter_1 = require("@angular/compiler/src/compiler_util/expression_converter");
    var ast_1 = require("@angular/compiler/src/expression_parser/ast");
    var identifiers_1 = require("@angular/compiler/src/identifiers");
    var lifecycle_reflector_1 = require("@angular/compiler/src/lifecycle_reflector");
    var o = require("@angular/compiler/src/output/output_ast");
    var parse_util_1 = require("@angular/compiler/src/parse_util");
    var selector_1 = require("@angular/compiler/src/selector");
    var template_ast_1 = require("@angular/compiler/src/template_parser/template_ast");
    var util_1 = require("@angular/compiler/src/util");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var r3_types_1 = require("@angular/compiler/src/render3/r3_types");
    /** Name of the context parameter passed into a template function */
    var CONTEXT_NAME = 'ctx';
    /** Name of the RenderFlag passed into a template function */
    var RENDER_FLAGS = 'rf';
    /** Name of the temporary to use during data binding */
    var TEMPORARY_NAME = '_t';
    /** The prefix reference variables */
    var REFERENCE_PREFIX = '_r';
    /** The name of the implicit context reference */
    var IMPLICIT_REFERENCE = '$implicit';
    /** Name of the i18n attributes **/
    var I18N_ATTR = 'i18n';
    var I18N_ATTR_PREFIX = 'i18n-';
    /** I18n separators for metadata **/
    var MEANING_SEPARATOR = '|';
    var ID_SEPARATOR = '@@';
    function compileDirective(outputCtx, directive, reflector, bindingParser, mode) {
        var definitionMapValues = [];
        var field = function (key, value) {
            if (value) {
                definitionMapValues.push({ key: key, value: value, quoted: false });
            }
        };
        // e.g. 'type: MyDirective`
        field('type', outputCtx.importExpr(directive.type.reference));
        // e.g. `selectors: [['', 'someDir', '']]`
        field('selectors', createDirectiveSelector(directive.selector));
        // e.g. `factory: () => new MyApp(injectElementRef())`
        field('factory', createFactory(directive.type, outputCtx, reflector, directive.queries));
        // e.g. `hostBindings: (dirIndex, elIndex) => { ... }
        field('hostBindings', createHostBindingsFunction(directive, outputCtx, bindingParser));
        // e.g. `attributes: ['role', 'listbox']`
        field('attributes', createHostAttributesArray(directive, outputCtx));
        // e.g 'inputs: {a: 'a'}`
        field('inputs', conditionallyCreateMapObjectLiteral(directive.inputs, outputCtx));
        // e.g 'outputs: {a: 'a'}`
        field('outputs', conditionallyCreateMapObjectLiteral(directive.outputs, outputCtx));
        var className = compile_metadata_1.identifierName(directive.type);
        className || util_1.error("Cannot resolver the name of " + directive.type);
        var definitionField = outputCtx.constantPool.propertyNameOf(1 /* Directive */);
        var definitionFunction = o.importExpr(r3_identifiers_1.Identifiers.defineDirective).callFn([o.literalMap(definitionMapValues)]);
        if (mode === 0 /* PartialClass */) {
            // Create the partial class to be merged with the actual class.
            outputCtx.statements.push(new o.ClassStmt(
            /* name */ className, 
            /* parent */ null, 
            /* fields */ [new o.ClassField(
                /* name */ definitionField, 
                /* type */ o.INFERRED_TYPE, 
                /* modifiers */ [o.StmtModifier.Static], 
                /* initializer */ definitionFunction)], 
            /* getters */ [], 
            /* constructorMethod */ new o.ClassMethod(null, [], []), 
            /* methods */ []));
        }
        else {
            // Create back-patch definition.
            var classReference = outputCtx.importExpr(directive.type.reference);
            // Create the back-patch statement
            outputCtx.statements.push(new o.CommentStmt(r3_types_1.BUILD_OPTIMIZER_COLOCATE));
            outputCtx.statements.push(classReference.prop(definitionField).set(definitionFunction).toStmt());
        }
    }
    exports.compileDirective = compileDirective;
    function compileComponent(outputCtx, component, pipeSummaries, template, reflector, bindingParser, mode) {
        var definitionMapValues = [];
        // Pipes and Directives found in the template
        var pipes = new Set();
        var directives = new Set();
        var field = function (key, value) {
            if (value) {
                definitionMapValues.push({ key: key, value: value, quoted: false });
            }
        };
        // e.g. `type: MyApp`
        field('type', outputCtx.importExpr(component.type.reference));
        // e.g. `selectors: [['my-app']]`
        field('selectors', createDirectiveSelector(component.selector));
        var selector = component.selector && selector_1.CssSelector.parse(component.selector);
        var firstSelector = selector && selector[0];
        // e.g. `attr: ["class", ".my.app"]
        // This is optional an only included if the first selector of a component specifies attributes.
        if (firstSelector) {
            var selectorAttributes = firstSelector.getAttrs();
            if (selectorAttributes.length) {
                field('attrs', outputCtx.constantPool.getConstLiteral(o.literalArr(selectorAttributes.map(function (value) { return value != null ? o.literal(value) : o.literal(undefined); })), 
                /* forceShared */ true));
            }
        }
        // e.g. `factory: function MyApp_Factory() { return new MyApp(injectElementRef()); }`
        field('factory', createFactory(component.type, outputCtx, reflector, component.queries));
        // e.g `hostBindings: function MyApp_HostBindings { ... }
        field('hostBindings', createHostBindingsFunction(component, outputCtx, bindingParser));
        // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
        var templateTypeName = component.type.reference.name;
        var templateName = templateTypeName ? templateTypeName + "_Template" : null;
        var pipeMap = new Map(pipeSummaries.map(function (pipe) { return [pipe.name, pipe]; }));
        var templateFunctionExpression = new TemplateDefinitionBuilder(outputCtx, outputCtx.constantPool, reflector, CONTEXT_NAME, BindingScope.ROOT_SCOPE, 0, component.template.ngContentSelectors, templateTypeName, templateName, pipeMap, component.viewQueries, directives, pipes)
            .buildTemplateFunction(template, []);
        field('template', templateFunctionExpression);
        // e.g. `directives: [MyDirective]`
        if (directives.size) {
            var expressions = Array.from(directives).map(function (d) { return outputCtx.importExpr(d); });
            field('directives', o.literalArr(expressions));
        }
        // e.g. `pipes: [MyPipe]`
        if (pipes.size) {
            var expressions = Array.from(pipes).map(function (p) { return outputCtx.importExpr(p); });
            field('pipes', o.literalArr(expressions));
        }
        // e.g `inputs: {a: 'a'}`
        field('inputs', conditionallyCreateMapObjectLiteral(component.inputs, outputCtx));
        // e.g 'outputs: {a: 'a'}`
        field('outputs', conditionallyCreateMapObjectLiteral(component.outputs, outputCtx));
        // e.g. `features: [NgOnChangesFeature(MyComponent)]`
        var features = [];
        if (component.type.lifecycleHooks.some(function (lifecycle) { return lifecycle == lifecycle_reflector_1.LifecycleHooks.OnChanges; })) {
            features.push(o.importExpr(r3_identifiers_1.Identifiers.NgOnChangesFeature, null, null).callFn([outputCtx.importExpr(component.type.reference)]));
        }
        if (features.length) {
            field('features', o.literalArr(features));
        }
        var definitionField = outputCtx.constantPool.propertyNameOf(2 /* Component */);
        var definitionFunction = o.importExpr(r3_identifiers_1.Identifiers.defineComponent).callFn([o.literalMap(definitionMapValues)]);
        if (mode === 0 /* PartialClass */) {
            var className = compile_metadata_1.identifierName(component.type);
            className || util_1.error("Cannot resolver the name of " + component.type);
            // Create the partial class to be merged with the actual class.
            outputCtx.statements.push(new o.ClassStmt(
            /* name */ className, 
            /* parent */ null, 
            /* fields */ [new o.ClassField(
                /* name */ definitionField, 
                /* type */ o.INFERRED_TYPE, 
                /* modifiers */ [o.StmtModifier.Static], 
                /* initializer */ definitionFunction)], 
            /* getters */ [], 
            /* constructorMethod */ new o.ClassMethod(null, [], []), 
            /* methods */ []));
        }
        else {
            var classReference = outputCtx.importExpr(component.type.reference);
            // Create the back-patch statement
            outputCtx.statements.push(new o.CommentStmt(r3_types_1.BUILD_OPTIMIZER_COLOCATE), classReference.prop(definitionField).set(definitionFunction).toStmt());
        }
    }
    exports.compileComponent = compileComponent;
    // TODO: Remove these when the things are fully supported
    function unknown(arg) {
        throw new Error("Builder " + this.constructor.name + " is unable to handle " + arg.constructor.name + " yet");
    }
    function unsupported(feature) {
        if (this) {
            throw new Error("Builder " + this.constructor.name + " doesn't support " + feature + " yet");
        }
        throw new Error("Feature " + feature + " is not supported yet");
    }
    var BINDING_INSTRUCTION_MAP = (_a = {},
        _a[template_ast_1.PropertyBindingType.Property] = r3_identifiers_1.Identifiers.elementProperty,
        _a[template_ast_1.PropertyBindingType.Attribute] = r3_identifiers_1.Identifiers.elementAttribute,
        _a[template_ast_1.PropertyBindingType.Class] = r3_identifiers_1.Identifiers.elementClassNamed,
        _a[template_ast_1.PropertyBindingType.Style] = r3_identifiers_1.Identifiers.elementStyleNamed,
        _a);
    function interpolate(args) {
        args = args.slice(1); // Ignore the length prefix added for render2
        switch (args.length) {
            case 3:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation1).callFn(args);
            case 5:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation2).callFn(args);
            case 7:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation3).callFn(args);
            case 9:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation4).callFn(args);
            case 11:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation5).callFn(args);
            case 13:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation6).callFn(args);
            case 15:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation7).callFn(args);
            case 17:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation8).callFn(args);
        }
        (args.length >= 19 && args.length % 2 == 1) ||
            util_1.error("Invalid interpolation argument length " + args.length);
        return o.importExpr(r3_identifiers_1.Identifiers.interpolationV).callFn([o.literalArr(args)]);
    }
    function pipeBinding(args) {
        switch (args.length) {
            case 0:
                // The first parameter to pipeBind is always the value to be transformed followed
                // by arg.length arguments so the total number of arguments to pipeBind are
                // arg.length + 1.
                return r3_identifiers_1.Identifiers.pipeBind1;
            case 1:
                return r3_identifiers_1.Identifiers.pipeBind2;
            case 2:
                return r3_identifiers_1.Identifiers.pipeBind3;
            default:
                return r3_identifiers_1.Identifiers.pipeBindV;
        }
    }
    var pureFunctionIdentifiers = [
        r3_identifiers_1.Identifiers.pureFunction0, r3_identifiers_1.Identifiers.pureFunction1, r3_identifiers_1.Identifiers.pureFunction2, r3_identifiers_1.Identifiers.pureFunction3, r3_identifiers_1.Identifiers.pureFunction4,
        r3_identifiers_1.Identifiers.pureFunction5, r3_identifiers_1.Identifiers.pureFunction6, r3_identifiers_1.Identifiers.pureFunction7, r3_identifiers_1.Identifiers.pureFunction8
    ];
    function getLiteralFactory(outputContext, literal) {
        var _a = outputContext.constantPool.getLiteralFactory(literal), literalFactory = _a.literalFactory, literalFactoryArguments = _a.literalFactoryArguments;
        literalFactoryArguments.length > 0 || util_1.error("Expected arguments to a literal factory function");
        var pureFunctionIdent = pureFunctionIdentifiers[literalFactoryArguments.length] || r3_identifiers_1.Identifiers.pureFunctionV;
        // Literal factories are pure functions that only need to be re-invoked when the parameters
        // change.
        return o.importExpr(pureFunctionIdent).callFn(tslib_1.__spread([literalFactory], literalFactoryArguments));
    }
    function noop() { }
    var BindingScope = /** @class */ (function () {
        function BindingScope(parent, declareLocalVarCallback) {
            if (parent === void 0) { parent = null; }
            if (declareLocalVarCallback === void 0) { declareLocalVarCallback = noop; }
            this.parent = parent;
            this.declareLocalVarCallback = declareLocalVarCallback;
            /**
             * Keeps a map from local variables to their expressions.
             *
             * This is used when one refers to variable such as: 'let abc = a.b.c`.
             * - key to the map is the string literal `"abc"`.
             * - value `lhs` is the left hand side which is an AST representing `abc`.
             * - value `rhs` is the right hand side which is an AST representing `a.b.c`.
             * - value `declared` is true if the `declareLocalVarCallback` has been called for this scope
             * already.
             */
            this.map = new Map();
            this.referenceNameIndex = 0;
        }
        BindingScope.prototype.get = function (name) {
            var current = this;
            while (current) {
                var value = current.map.get(name);
                if (value != null) {
                    if (current !== this) {
                        // make a local copy and reset the `declared` state.
                        value = { lhs: value.lhs, rhs: value.rhs, declared: false };
                        // Cache the value locally.
                        this.map.set(name, value);
                    }
                    if (value.rhs && !value.declared) {
                        // if it is first time we are referencing the variable in the scope
                        // than invoke the callback to insert variable declaration.
                        this.declareLocalVarCallback(value.lhs, value.rhs);
                        value.declared = true;
                    }
                    return value.lhs;
                }
                current = current.parent;
            }
            return null;
        };
        /**
         * Create a local variable for later reference.
         *
         * @param name Name of the variable.
         * @param lhs AST representing the left hand side of the `let lhs = rhs;`.
         * @param rhs AST representing the right hand side of the `let lhs = rhs;`. The `rhs` can be
         * `undefined` for variable that are ambient such as `$event` and which don't have `rhs`
         * declaration.
         */
        BindingScope.prototype.set = function (name, lhs, rhs) {
            !this.map.has(name) ||
                util_1.error("The name " + name + " is already defined in scope to be " + this.map.get(name));
            this.map.set(name, { lhs: lhs, rhs: rhs, declared: false });
            return this;
        };
        BindingScope.prototype.getLocal = function (name) { return this.get(name); };
        BindingScope.prototype.nestedScope = function (declareCallback) {
            return new BindingScope(this, declareCallback);
        };
        BindingScope.prototype.freshReferenceName = function () {
            var current = this;
            // Find the top scope as it maintains the global reference count
            while (current.parent)
                current = current.parent;
            var ref = "" + REFERENCE_PREFIX + current.referenceNameIndex++;
            return ref;
        };
        BindingScope.ROOT_SCOPE = new BindingScope().set('$event', o.variable('$event'));
        return BindingScope;
    }());
    var TemplateDefinitionBuilder = /** @class */ (function () {
        function TemplateDefinitionBuilder(outputCtx, constantPool, reflector, contextParameter, parentBindingScope, level, ngContentSelectors, contextName, templateName, pipeMap, viewQueries, directives, pipes) {
            if (level === void 0) { level = 0; }
            var _this = this;
            this.outputCtx = outputCtx;
            this.constantPool = constantPool;
            this.reflector = reflector;
            this.contextParameter = contextParameter;
            this.level = level;
            this.ngContentSelectors = ngContentSelectors;
            this.contextName = contextName;
            this.templateName = templateName;
            this.pipeMap = pipeMap;
            this.viewQueries = viewQueries;
            this.directives = directives;
            this.pipes = pipes;
            this._dataIndex = 0;
            this._bindingContext = 0;
            this._temporaryAllocated = false;
            this._prefix = [];
            this._creationMode = [];
            this._variableMode = [];
            this._bindingMode = [];
            this._postfix = [];
            this._projectionDefinitionIndex = 0;
            this.unsupported = unsupported;
            this.invalid = invalid;
            // Whether we are inside a translatable element (`<p i18n>... somewhere here ... </p>)
            this._inI18nSection = false;
            this._i18nSectionIndex = -1;
            // Maps of placeholder to node indexes for each of the i18n section
            this._phToNodeIdxes = [{}];
            // These should be handled in the template or element directly.
            this.visitReference = invalid;
            this.visitVariable = invalid;
            this.visitEvent = invalid;
            this.visitElementProperty = invalid;
            this.visitAttr = invalid;
            // These should be handled in the template or element directly
            this.visitDirective = invalid;
            this.visitDirectiveProperty = invalid;
            this.bindingScope =
                parentBindingScope.nestedScope(function (lhsVar, expression) {
                    _this._bindingMode.push(lhsVar.set(expression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
                });
            this._valueConverter = new ValueConverter(outputCtx, function () { return _this.allocateDataSlot(); }, function (name, localName, slot, value) {
                _this.bindingScope.set(localName, value);
                var pipe = pipeMap.get(name);
                pipe || util_1.error("Could not find pipe " + name);
                _this.pipes.add(pipe.type.reference);
                _this._creationMode.push(o.importExpr(r3_identifiers_1.Identifiers.pipe).callFn([o.literal(slot), o.literal(name)]).toStmt());
            });
        }
        TemplateDefinitionBuilder.prototype.buildTemplateFunction = function (nodes, variables) {
            try {
                // Create variable bindings
                for (var variables_1 = tslib_1.__values(variables), variables_1_1 = variables_1.next(); !variables_1_1.done; variables_1_1 = variables_1.next()) {
                    var variable = variables_1_1.value;
                    var variableName = variable.name;
                    var expression = o.variable(this.contextParameter).prop(variable.value || IMPLICIT_REFERENCE);
                    var scopedName = this.bindingScope.freshReferenceName();
                    // Add the reference to the local scope.
                    this.bindingScope.set(variableName, o.variable(variableName + scopedName), expression);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (variables_1_1 && !variables_1_1.done && (_a = variables_1.return)) _a.call(variables_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Collect content projections
            if (this.ngContentSelectors && this.ngContentSelectors.length > 0) {
                var contentProjections = getContentProjection(nodes, this.ngContentSelectors);
                this._contentProjections = contentProjections;
                if (contentProjections.size > 0) {
                    var selectors_1 = [];
                    Array.from(contentProjections.values()).forEach(function (info) {
                        if (info.selector) {
                            selectors_1[info.index - 1] = info.selector;
                        }
                    });
                    var projectionIndex = this._projectionDefinitionIndex = this.allocateDataSlot();
                    var parameters = [o.literal(projectionIndex)];
                    if (selectors_1.some(function (value) { return !value; })) {
                        util_1.error("content project information skipped an index");
                    }
                    if (selectors_1.length > 1) {
                        var r3Selectors = selectors_1.map(function (s) { return parseSelectorToR3Selector(s); });
                        // `projectionDef` needs both the parsed and raw value of the selectors
                        var parsed = this.outputCtx.constantPool.getConstLiteral(asLiteral(r3Selectors), true);
                        var unParsed = this.outputCtx.constantPool.getConstLiteral(asLiteral(selectors_1), true);
                        parameters.push(parsed, unParsed);
                    }
                    this.instruction.apply(this, tslib_1.__spread([this._creationMode, null, r3_identifiers_1.Identifiers.projectionDef], parameters));
                }
            }
            try {
                // Define and update any view queries
                for (var _b = tslib_1.__values(this.viewQueries), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var query = _c.value;
                    // e.g. r3.Q(0, somePredicate, true);
                    var querySlot = this.allocateDataSlot();
                    var predicate = getQueryPredicate(query, this.outputCtx);
                    var args = [
                        /* memoryIndex */ o.literal(querySlot, o.INFERRED_TYPE),
                        /* predicate */ predicate,
                        /* descend */ o.literal(query.descendants, o.INFERRED_TYPE)
                    ];
                    if (query.read) {
                        args.push(this.outputCtx.importExpr(query.read.identifier.reference));
                    }
                    this.instruction.apply(this, tslib_1.__spread([this._creationMode, null, r3_identifiers_1.Identifiers.query], args));
                    // (r3.qR(tmp = r3.ɵld(0)) && (ctx.someDir = tmp));
                    var temporary = this.temp();
                    var getQueryList = o.importExpr(r3_identifiers_1.Identifiers.load).callFn([o.literal(querySlot)]);
                    var refresh = o.importExpr(r3_identifiers_1.Identifiers.queryRefresh).callFn([temporary.set(getQueryList)]);
                    var updateDirective = o.variable(CONTEXT_NAME)
                        .prop(query.propertyName)
                        .set(query.first ? temporary.prop('first') : temporary);
                    this._bindingMode.push(refresh.and(updateDirective).toStmt());
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            template_ast_1.templateVisitAll(this, nodes);
            var creationMode = this._creationMode.length > 0 ?
                [o.ifStmt(o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(1 /* Create */), null, false), this._creationMode)] :
                [];
            var updateMode = this._bindingMode.length > 0 ?
                [o.ifStmt(o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(2 /* Update */), null, false), this._bindingMode)] :
                [];
            try {
                // Generate maps of placeholder name to node indexes
                // TODO(vicb): This is a WIP, not fully supported yet
                for (var _e = tslib_1.__values(this._phToNodeIdxes), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var phToNodeIdx = _f.value;
                    if (Object.keys(phToNodeIdx).length > 0) {
                        var scopedName = this.bindingScope.freshReferenceName();
                        var phMap = o.variable(scopedName)
                            .set(mapToExpression(phToNodeIdx, true))
                            .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]);
                        this._prefix.push(phMap);
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_g = _e.return)) _g.call(_e);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return o.fn([new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(this.contextParameter, null)], tslib_1.__spread(this._prefix, creationMode, this._variableMode, updateMode, this._postfix), o.INFERRED_TYPE, null, this.templateName);
            var e_1, _a, e_2, _d, e_3, _g;
        };
        // LocalResolver
        TemplateDefinitionBuilder.prototype.getLocal = function (name) { return this.bindingScope.get(name); };
        // TemplateAstVisitor
        TemplateDefinitionBuilder.prototype.visitNgContent = function (ngContent) {
            var info = this._contentProjections.get(ngContent);
            info ||
                util_1.error("Expected " + ngContent.sourceSpan + " to be included in content projection collection");
            var slot = this.allocateDataSlot();
            var parameters = [o.literal(slot), o.literal(this._projectionDefinitionIndex)];
            if (info.index !== 0) {
                parameters.push(o.literal(info.index));
            }
            this.instruction.apply(this, tslib_1.__spread([this._creationMode, ngContent.sourceSpan, r3_identifiers_1.Identifiers.projection], parameters));
        };
        // TemplateAstVisitor
        TemplateDefinitionBuilder.prototype.visitElement = function (element) {
            var _this = this;
            var elementIndex = this.allocateDataSlot();
            var referenceDataSlots = new Map();
            var wasInI18nSection = this._inI18nSection;
            var outputAttrs = {};
            var attrI18nMetas = {};
            var i18nMeta = '';
            // Elements inside i18n sections are replaced with placeholders
            // TODO(vicb): nested elements are a WIP in this phase
            if (this._inI18nSection) {
                var phName = element.name.toLowerCase();
                if (!this._phToNodeIdxes[this._i18nSectionIndex][phName]) {
                    this._phToNodeIdxes[this._i18nSectionIndex][phName] = [];
                }
                this._phToNodeIdxes[this._i18nSectionIndex][phName].push(elementIndex);
            }
            try {
                // Handle i18n attributes
                for (var _a = tslib_1.__values(element.attrs), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var attr = _b.value;
                    var name_1 = attr.name;
                    var value = attr.value;
                    if (name_1 === I18N_ATTR) {
                        if (this._inI18nSection) {
                            throw new Error("Could not mark an element as translatable inside of a translatable section");
                        }
                        this._inI18nSection = true;
                        this._i18nSectionIndex++;
                        this._phToNodeIdxes[this._i18nSectionIndex] = {};
                        i18nMeta = value;
                    }
                    else if (name_1.startsWith(I18N_ATTR_PREFIX)) {
                        attrI18nMetas[name_1.slice(I18N_ATTR_PREFIX.length)] = value;
                    }
                    else {
                        outputAttrs[name_1] = value;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_4) throw e_4.error; }
            }
            // Element creation mode
            var parameters = [
                o.literal(elementIndex),
                o.literal(element.name),
            ];
            element.directives.forEach(function (directive) { return _this.directives.add(directive.directive.type.reference); });
            // Add the attributes
            var i18nMessages = [];
            var attributes = [];
            var hasI18nAttr = false;
            Object.getOwnPropertyNames(outputAttrs).forEach(function (name) {
                var value = outputAttrs[name];
                attributes.push(o.literal(name));
                if (attrI18nMetas.hasOwnProperty(name)) {
                    hasI18nAttr = true;
                    var meta = parseI18nMeta(attrI18nMetas[name]);
                    var variable = _this.constantPool.getTranslation(value, meta);
                    attributes.push(variable);
                }
                else {
                    attributes.push(o.literal(value));
                }
            });
            var attrArg = o.TYPED_NULL_EXPR;
            if (attributes.length > 0) {
                attrArg = hasI18nAttr ? getLiteralFactory(this.outputCtx, o.literalArr(attributes)) :
                    this.constantPool.getConstLiteral(o.literalArr(attributes), true);
            }
            parameters.push(attrArg);
            if (element.references && element.references.length > 0) {
                var references = compile_metadata_1.flatten(element.references.map(function (reference) {
                    var slot = _this.allocateDataSlot();
                    referenceDataSlots.set(reference.name, slot);
                    // Generate the update temporary.
                    var variableName = _this.bindingScope.freshReferenceName();
                    _this._variableMode.push(o.variable(variableName, o.INFERRED_TYPE)
                        .set(o.importExpr(r3_identifiers_1.Identifiers.load).callFn([o.literal(slot)]))
                        .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
                    _this.bindingScope.set(reference.name, o.variable(variableName));
                    return [reference.name, reference.originalValue];
                })).map(function (value) { return o.literal(value); });
                parameters.push(this.constantPool.getConstLiteral(o.literalArr(references), /* forceShared */ true));
            }
            else {
                parameters.push(o.TYPED_NULL_EXPR);
            }
            // Generate the instruction create element instruction
            if (i18nMessages.length > 0) {
                (_d = this._creationMode).push.apply(_d, tslib_1.__spread(i18nMessages));
            }
            this.instruction.apply(this, tslib_1.__spread([this._creationMode, element.sourceSpan, r3_identifiers_1.Identifiers.createElement], trimTrailingNulls(parameters)));
            var implicit = o.variable(CONTEXT_NAME);
            // Generate Listeners (outputs)
            element.outputs.forEach(function (outputAst) {
                var functionName = _this.templateName + "_" + element.name + "_" + outputAst.name + "_listener";
                var localVars = [];
                var bindingScope = _this.bindingScope.nestedScope(function (lhsVar, rhsExpression) {
                    localVars.push(lhsVar.set(rhsExpression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
                });
                var bindingExpr = expression_converter_1.convertActionBinding(bindingScope, o.variable(CONTEXT_NAME), outputAst.handler, 'b', function () { return util_1.error('Unexpected interpolation'); });
                var handler = o.fn([new o.FnParam('$event', o.DYNAMIC_TYPE)], tslib_1.__spread(localVars, bindingExpr.render3Stmts), o.INFERRED_TYPE, null, functionName);
                _this.instruction(_this._creationMode, outputAst.sourceSpan, r3_identifiers_1.Identifiers.listener, o.literal(outputAst.name), handler);
            });
            try {
                // Generate element input bindings
                for (var _e = tslib_1.__values(element.inputs), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var input = _f.value;
                    if (input.isAnimation) {
                        this.unsupported('animations');
                    }
                    var convertedBinding = this.convertPropertyBinding(implicit, input.value);
                    var instruction = BINDING_INSTRUCTION_MAP[input.type];
                    if (instruction) {
                        // TODO(chuckj): runtime: security context?
                        this.instruction(this._bindingMode, input.sourceSpan, instruction, o.literal(elementIndex), o.literal(input.name), convertedBinding);
                    }
                    else {
                        this.unsupported("binding " + template_ast_1.PropertyBindingType[input.type]);
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_g = _e.return)) _g.call(_e);
                }
                finally { if (e_5) throw e_5.error; }
            }
            // Generate directives input bindings
            this._visitDirectives(element.directives, implicit, elementIndex);
            // Traverse element child nodes
            if (this._inI18nSection && element.children.length == 1 &&
                element.children[0] instanceof template_ast_1.TextAst) {
                var text = element.children[0];
                this.visitSingleI18nTextChild(text, i18nMeta);
            }
            else {
                template_ast_1.templateVisitAll(this, element.children);
            }
            // Finish element construction mode.
            this.instruction(this._creationMode, element.endSourceSpan || element.sourceSpan, r3_identifiers_1.Identifiers.elementEnd);
            // Restore the state before exiting this node
            this._inI18nSection = wasInI18nSection;
            var e_4, _c, _d, e_5, _g;
        };
        TemplateDefinitionBuilder.prototype._visitDirectives = function (directives, implicit, nodeIndex) {
            try {
                for (var directives_1 = tslib_1.__values(directives), directives_1_1 = directives_1.next(); !directives_1_1.done; directives_1_1 = directives_1.next()) {
                    var directive = directives_1_1.value;
                    // Creation mode
                    // e.g. D(0, TodoComponentDef.n(), TodoComponentDef);
                    var directiveType = directive.directive.type.reference;
                    var kind = directive.directive.isComponent ? 2 /* Component */ : 1 /* Directive */;
                    try {
                        // Note: *do not cache* calls to this.directiveOf() as the constant pool needs to know if the
                        // node is referenced multiple times to know that it must generate the reference into a
                        // temporary.
                        // Bindings
                        for (var _a = tslib_1.__values(directive.inputs), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var input = _b.value;
                            var convertedBinding = this.convertPropertyBinding(implicit, input.value);
                            this.instruction(this._bindingMode, directive.sourceSpan, r3_identifiers_1.Identifiers.elementProperty, o.literal(nodeIndex), o.literal(input.templateName), o.importExpr(r3_identifiers_1.Identifiers.bind).callFn([convertedBinding]));
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (directives_1_1 && !directives_1_1.done && (_d = directives_1.return)) _d.call(directives_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
            var e_7, _d, e_6, _c;
        };
        // TemplateAstVisitor
        TemplateDefinitionBuilder.prototype.visitEmbeddedTemplate = function (template) {
            var _this = this;
            var templateIndex = this.allocateDataSlot();
            var templateRef = this.reflector.resolveExternalReference(identifiers_1.Identifiers.TemplateRef);
            var templateDirective = template.directives.find(function (directive) { return directive.directive.type.diDeps.some(function (dependency) {
                return dependency.token != null && (compile_metadata_1.tokenReference(dependency.token) == templateRef);
            }); });
            var contextName = this.contextName && templateDirective && templateDirective.directive.type.reference.name ?
                this.contextName + "_" + templateDirective.directive.type.reference.name :
                null;
            var templateName = contextName ? contextName + "_Template_" + templateIndex : "Template_" + templateIndex;
            var templateContext = "ctx" + this.level;
            var parameters = [o.variable(templateName), o.literal(null, o.INFERRED_TYPE)];
            var attributeNames = [];
            template.directives.forEach(function (directiveAst) {
                _this.directives.add(directiveAst.directive.type.reference);
                selector_1.CssSelector.parse(directiveAst.directive.selector).forEach(function (selector) {
                    selector.attrs.forEach(function (value) {
                        // Convert '' (falsy) strings into `null`. This is needed because we want
                        // to communicate to runtime that these attributes are present for
                        // selector matching, but should not actually be added to the DOM.
                        // attributeNames.push(o.literal(value ? value : null));
                        // TODO(misko): make the above comment true, for now just write to DOM because
                        // the runtime selectors have not been updated.
                        attributeNames.push(o.literal(value));
                    });
                });
            });
            if (attributeNames.length) {
                parameters.push(this.constantPool.getConstLiteral(o.literalArr(attributeNames), /* forcedShared */ true));
            }
            // e.g. C(1, C1Template)
            this.instruction.apply(this, tslib_1.__spread([this._creationMode, template.sourceSpan, r3_identifiers_1.Identifiers.containerCreate, o.literal(templateIndex)], trimTrailingNulls(parameters)));
            // Generate directives
            this._visitDirectives(template.directives, o.variable(CONTEXT_NAME), templateIndex);
            // Create the template function
            var templateVisitor = new TemplateDefinitionBuilder(this.outputCtx, this.constantPool, this.reflector, templateContext, this.bindingScope, this.level + 1, this.ngContentSelectors, contextName, templateName, this.pipeMap, [], this.directives, this.pipes);
            var templateFunctionExpr = templateVisitor.buildTemplateFunction(template.children, template.variables);
            this._postfix.push(templateFunctionExpr.toDeclStmt(templateName, null));
        };
        // TemplateAstVisitor
        TemplateDefinitionBuilder.prototype.visitBoundText = function (text) {
            var nodeIndex = this.allocateDataSlot();
            // Creation mode
            this.instruction(this._creationMode, text.sourceSpan, r3_identifiers_1.Identifiers.text, o.literal(nodeIndex));
            this.instruction(this._bindingMode, text.sourceSpan, r3_identifiers_1.Identifiers.textCreateBound, o.literal(nodeIndex), this.convertPropertyBinding(o.variable(CONTEXT_NAME), text.value));
        };
        // TemplateAstVisitor
        TemplateDefinitionBuilder.prototype.visitText = function (text) {
            // Text is defined in creation mode only.
            this.instruction(this._creationMode, text.sourceSpan, r3_identifiers_1.Identifiers.text, o.literal(this.allocateDataSlot()), o.literal(text.value));
        };
        // When the content of the element is a single text node the translation can be inlined:
        //
        // `<p i18n="desc|mean">some content</p>`
        // compiles to
        // ```
        // /**
        // * @desc desc
        // * @meaning mean
        // */
        // const MSG_XYZ = goog.getMsg('some content');
        // i0.ɵT(1, MSG_XYZ);
        // ```
        TemplateDefinitionBuilder.prototype.visitSingleI18nTextChild = function (text, i18nMeta) {
            var meta = parseI18nMeta(i18nMeta);
            var variable = this.constantPool.getTranslation(text.value, meta);
            this.instruction(this._creationMode, text.sourceSpan, r3_identifiers_1.Identifiers.text, o.literal(this.allocateDataSlot()), variable);
        };
        TemplateDefinitionBuilder.prototype.allocateDataSlot = function () { return this._dataIndex++; };
        TemplateDefinitionBuilder.prototype.bindingContext = function () { return "" + this._bindingContext++; };
        TemplateDefinitionBuilder.prototype.instruction = function (statements, span, reference) {
            var params = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                params[_i - 3] = arguments[_i];
            }
            statements.push(o.importExpr(reference, null, span).callFn(params, span).toStmt());
        };
        TemplateDefinitionBuilder.prototype.definitionOf = function (type, kind) {
            return this.constantPool.getDefinition(type, kind, this.outputCtx);
        };
        TemplateDefinitionBuilder.prototype.temp = function () {
            if (!this._temporaryAllocated) {
                this._prefix.push(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
                this._temporaryAllocated = true;
            }
            return o.variable(TEMPORARY_NAME);
        };
        TemplateDefinitionBuilder.prototype.convertPropertyBinding = function (implicit, value) {
            var pipesConvertedValue = value.visit(this._valueConverter);
            var convertedPropertyBinding = expression_converter_1.convertPropertyBinding(this, implicit, pipesConvertedValue, this.bindingContext(), expression_converter_1.BindingForm.TrySimple, interpolate);
            (_a = this._bindingMode).push.apply(_a, tslib_1.__spread(convertedPropertyBinding.stmts));
            return convertedPropertyBinding.currValExpr;
            var _a;
        };
        return TemplateDefinitionBuilder;
    }());
    function getQueryPredicate(query, outputCtx) {
        if (query.selectors.length > 1 || (query.selectors.length == 1 && query.selectors[0].value)) {
            var selectors = query.selectors.map(function (value) { return value.value; });
            selectors.some(function (value) { return !value; }) && util_1.error('Found a type among the string selectors expected');
            return outputCtx.constantPool.getConstLiteral(o.literalArr(selectors.map(function (value) { return o.literal(value); })));
        }
        if (query.selectors.length == 1) {
            var first = query.selectors[0];
            if (first.identifier) {
                return outputCtx.importExpr(first.identifier.reference);
            }
        }
        util_1.error('Unexpected query form');
        return o.NULL_EXPR;
    }
    function createFactory(type, outputCtx, reflector, queries) {
        var args = [];
        var elementRef = reflector.resolveExternalReference(identifiers_1.Identifiers.ElementRef);
        var templateRef = reflector.resolveExternalReference(identifiers_1.Identifiers.TemplateRef);
        var viewContainerRef = reflector.resolveExternalReference(identifiers_1.Identifiers.ViewContainerRef);
        try {
            for (var _a = tslib_1.__values(type.diDeps), _b = _a.next(); !_b.done; _b = _a.next()) {
                var dependency = _b.value;
                var token = dependency.token;
                if (token) {
                    var tokenRef = compile_metadata_1.tokenReference(token);
                    if (tokenRef === elementRef) {
                        args.push(o.importExpr(r3_identifiers_1.Identifiers.injectElementRef).callFn([]));
                    }
                    else if (tokenRef === templateRef) {
                        args.push(o.importExpr(r3_identifiers_1.Identifiers.injectTemplateRef).callFn([]));
                    }
                    else if (tokenRef === viewContainerRef) {
                        args.push(o.importExpr(r3_identifiers_1.Identifiers.injectViewContainerRef).callFn([]));
                    }
                    else if (dependency.isAttribute) {
                        args.push(o.importExpr(r3_identifiers_1.Identifiers.injectAttribute).callFn([o.literal(dependency.token.value)]));
                    }
                    else {
                        var tokenValue = token.identifier != null ? outputCtx.importExpr(tokenRef) : o.literal(tokenRef);
                        var directiveInjectArgs = [tokenValue];
                        var flags = extractFlags(dependency);
                        if (flags != 0 /* Default */) {
                            // Append flag information if other than default.
                            directiveInjectArgs.push(o.literal(flags));
                        }
                        args.push(o.importExpr(r3_identifiers_1.Identifiers.directiveInject).callFn(directiveInjectArgs));
                    }
                }
                else {
                    unsupported('dependency without a token');
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_8) throw e_8.error; }
        }
        var queryDefinitions = [];
        try {
            for (var queries_1 = tslib_1.__values(queries), queries_1_1 = queries_1.next(); !queries_1_1.done; queries_1_1 = queries_1.next()) {
                var query = queries_1_1.value;
                var predicate = getQueryPredicate(query, outputCtx);
                // e.g. r3.Q(null, somePredicate, false) or r3.Q(null, ['div'], false)
                var parameters = [
                    /* memoryIndex */ o.literal(null, o.INFERRED_TYPE),
                    /* predicate */ predicate,
                    /* descend */ o.literal(query.descendants)
                ];
                if (query.read) {
                    parameters.push(outputCtx.importExpr(query.read.identifier.reference));
                }
                queryDefinitions.push(o.importExpr(r3_identifiers_1.Identifiers.query).callFn(parameters));
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (queries_1_1 && !queries_1_1.done && (_d = queries_1.return)) _d.call(queries_1);
            }
            finally { if (e_9) throw e_9.error; }
        }
        var createInstance = new o.InstantiateExpr(outputCtx.importExpr(type.reference), args);
        var result = queryDefinitions.length > 0 ? o.literalArr(tslib_1.__spread([createInstance], queryDefinitions)) :
            createInstance;
        return o.fn([], [new o.ReturnStatement(result)], o.INFERRED_TYPE, null, type.reference.name ? type.reference.name + "_Factory" : null);
        var e_8, _c, e_9, _d;
    }
    exports.createFactory = createFactory;
    function extractFlags(dependency) {
        var flags = 0 /* Default */;
        if (dependency.isHost) {
            flags |= 1 /* Host */;
        }
        if (dependency.isOptional) {
            flags |= 8 /* Optional */;
        }
        if (dependency.isSelf) {
            flags |= 2 /* Self */;
        }
        if (dependency.isSkipSelf) {
            flags |= 4 /* SkipSelf */;
        }
        if (dependency.isValue) {
            unsupported('value dependencies');
        }
        return flags;
    }
    /**
     *  Remove trailing null nodes as they are implied.
     */
    function trimTrailingNulls(parameters) {
        while (o.isNull(parameters[parameters.length - 1])) {
            parameters.pop();
        }
        return parameters;
    }
    // Turn a directive selector into an R3-compatible selector for directive def
    function createDirectiveSelector(selector) {
        return asLiteral(parseSelectorToR3Selector(selector));
    }
    function createHostAttributesArray(directiveMetadata, outputCtx) {
        var values = [];
        var attributes = directiveMetadata.hostAttributes;
        try {
            for (var _a = tslib_1.__values(Object.getOwnPropertyNames(attributes)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var key = _b.value;
                var value = attributes[key];
                values.push(o.literal(key), o.literal(value));
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_10) throw e_10.error; }
        }
        if (values.length > 0) {
            return outputCtx.constantPool.getConstLiteral(o.literalArr(values));
        }
        return null;
        var e_10, _c;
    }
    // Return a host binding function or null if one is not necessary.
    function createHostBindingsFunction(directiveMetadata, outputCtx, bindingParser) {
        var statements = [];
        var temporary = function () {
            var declared = false;
            return function () {
                if (!declared) {
                    statements.push(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
                    declared = true;
                }
                return o.variable(TEMPORARY_NAME);
            };
        }();
        var hostBindingSourceSpan = parse_util_1.typeSourceSpan(directiveMetadata.isComponent ? 'Component' : 'Directive', directiveMetadata.type);
        // Calculate the queries
        for (var index = 0; index < directiveMetadata.queries.length; index++) {
            var query = directiveMetadata.queries[index];
            // e.g. r3.qR(tmp = r3.ld(dirIndex)[1]) && (r3.ld(dirIndex)[0].someDir = tmp);
            var getDirectiveMemory = o.importExpr(r3_identifiers_1.Identifiers.load).callFn([o.variable('dirIndex')]);
            // The query list is at the query index + 1 because the directive itself is in slot 0.
            var getQueryList = getDirectiveMemory.key(o.literal(index + 1));
            var assignToTemporary = temporary().set(getQueryList);
            var callQueryRefresh = o.importExpr(r3_identifiers_1.Identifiers.queryRefresh).callFn([assignToTemporary]);
            var updateDirective = getDirectiveMemory.key(o.literal(0, o.INFERRED_TYPE))
                .prop(query.propertyName)
                .set(query.first ? temporary().prop('first') : temporary());
            var andExpression = callQueryRefresh.and(updateDirective);
            statements.push(andExpression.toStmt());
        }
        var directiveSummary = directiveMetadata.toSummary();
        // Calculate the host property bindings
        var bindings = bindingParser.createBoundHostProperties(directiveSummary, hostBindingSourceSpan);
        var bindingContext = o.importExpr(r3_identifiers_1.Identifiers.load).callFn([o.variable('dirIndex')]);
        if (bindings) {
            try {
                for (var bindings_1 = tslib_1.__values(bindings), bindings_1_1 = bindings_1.next(); !bindings_1_1.done; bindings_1_1 = bindings_1.next()) {
                    var binding = bindings_1_1.value;
                    var bindingExpr = expression_converter_1.convertPropertyBinding(null, bindingContext, binding.expression, 'b', expression_converter_1.BindingForm.TrySimple, function () { return util_1.error('Unexpected interpolation'); });
                    statements.push.apply(statements, tslib_1.__spread(bindingExpr.stmts));
                    statements.push(o.importExpr(r3_identifiers_1.Identifiers.elementProperty)
                        .callFn([
                        o.variable('elIndex'), o.literal(binding.name),
                        o.importExpr(r3_identifiers_1.Identifiers.bind).callFn([bindingExpr.currValExpr])
                    ])
                        .toStmt());
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (bindings_1_1 && !bindings_1_1.done && (_a = bindings_1.return)) _a.call(bindings_1);
                }
                finally { if (e_11) throw e_11.error; }
            }
        }
        // Calculate host event bindings
        var eventBindings = bindingParser.createDirectiveHostEventAsts(directiveSummary, hostBindingSourceSpan);
        if (eventBindings) {
            try {
                for (var eventBindings_1 = tslib_1.__values(eventBindings), eventBindings_1_1 = eventBindings_1.next(); !eventBindings_1_1.done; eventBindings_1_1 = eventBindings_1.next()) {
                    var binding = eventBindings_1_1.value;
                    var bindingExpr = expression_converter_1.convertActionBinding(null, bindingContext, binding.handler, 'b', function () { return util_1.error('Unexpected interpolation'); });
                    var bindingName = binding.name && compile_metadata_1.sanitizeIdentifier(binding.name);
                    var typeName = compile_metadata_1.identifierName(directiveMetadata.type);
                    var functionName = typeName && bindingName ? typeName + "_" + bindingName + "_HostBindingHandler" : null;
                    var handler = o.fn([new o.FnParam('$event', o.DYNAMIC_TYPE)], tslib_1.__spread(bindingExpr.stmts, [new o.ReturnStatement(bindingExpr.allowDefault)]), o.INFERRED_TYPE, null, functionName);
                    statements.push(o.importExpr(r3_identifiers_1.Identifiers.listener).callFn([o.literal(binding.name), handler]).toStmt());
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (eventBindings_1_1 && !eventBindings_1_1.done && (_b = eventBindings_1.return)) _b.call(eventBindings_1);
                }
                finally { if (e_12) throw e_12.error; }
            }
        }
        if (statements.length > 0) {
            var typeName = directiveMetadata.type.reference.name;
            return o.fn([new o.FnParam('dirIndex', o.NUMBER_TYPE), new o.FnParam('elIndex', o.NUMBER_TYPE)], statements, o.INFERRED_TYPE, null, typeName ? typeName + "_HostBindings" : null);
        }
        return null;
        var e_11, _a, e_12, _b;
    }
    function conditionallyCreateMapObjectLiteral(keys, outputCtx) {
        if (Object.getOwnPropertyNames(keys).length > 0) {
            return mapToExpression(keys);
        }
        return null;
    }
    var ValueConverter = /** @class */ (function (_super) {
        tslib_1.__extends(ValueConverter, _super);
        function ValueConverter(outputCtx, allocateSlot, definePipe) {
            var _this = _super.call(this) || this;
            _this.outputCtx = outputCtx;
            _this.allocateSlot = allocateSlot;
            _this.definePipe = definePipe;
            _this.pipeSlots = new Map();
            return _this;
        }
        // AstMemoryEfficientTransformer
        ValueConverter.prototype.visitPipe = function (pipe, context) {
            // Allocate a slot to create the pipe
            var slot = this.allocateSlot();
            var slotPseudoLocal = "PIPE:" + slot;
            var target = new ast_1.PropertyRead(pipe.span, new ast_1.ImplicitReceiver(pipe.span), slotPseudoLocal);
            var bindingId = pipeBinding(pipe.args);
            this.definePipe(pipe.name, slotPseudoLocal, slot, o.importExpr(bindingId));
            var value = pipe.exp.visit(this);
            var args = this.visitAll(pipe.args);
            return new ast_1.FunctionCall(pipe.span, target, tslib_1.__spread([new ast_1.LiteralPrimitive(pipe.span, slot), value], args));
        };
        ValueConverter.prototype.visitLiteralArray = function (array, context) {
            var _this = this;
            return new expression_converter_1.BuiltinFunctionCall(array.span, this.visitAll(array.expressions), function (values) {
                // If the literal has calculated (non-literal) elements transform it into
                // calls to literal factories that compose the literal and will cache intermediate
                // values. Otherwise, just return an literal array that contains the values.
                var literal = o.literalArr(values);
                return values.every(function (a) { return a.isConstant(); }) ?
                    _this.outputCtx.constantPool.getConstLiteral(literal, true) :
                    getLiteralFactory(_this.outputCtx, literal);
            });
        };
        ValueConverter.prototype.visitLiteralMap = function (map, context) {
            var _this = this;
            return new expression_converter_1.BuiltinFunctionCall(map.span, this.visitAll(map.values), function (values) {
                // If the literal has calculated (non-literal) elements  transform it into
                // calls to literal factories that compose the literal and will cache intermediate
                // values. Otherwise, just return an literal array that contains the values.
                var literal = o.literalMap(values.map(function (value, index) { return ({ key: map.keys[index].key, value: value, quoted: map.keys[index].quoted }); }));
                return values.every(function (a) { return a.isConstant(); }) ?
                    _this.outputCtx.constantPool.getConstLiteral(literal, true) :
                    getLiteralFactory(_this.outputCtx, literal);
            });
        };
        return ValueConverter;
    }(ast_1.AstMemoryEfficientTransformer));
    function invalid(arg) {
        throw new Error("Invalid state: Visitor " + this.constructor.name + " doesn't handle " + o.constructor.name);
    }
    var ContentProjectionVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(ContentProjectionVisitor, _super);
        function ContentProjectionVisitor(projectionMap, ngContentSelectors) {
            var _this = _super.call(this) || this;
            _this.projectionMap = projectionMap;
            _this.ngContentSelectors = ngContentSelectors;
            _this.index = 1;
            return _this;
        }
        ContentProjectionVisitor.prototype.visitNgContent = function (ngContent) {
            var selector = this.ngContentSelectors[ngContent.index];
            if (selector == null) {
                util_1.error("could not find selector for index " + ngContent.index + " in " + ngContent);
            }
            if (!selector || selector === '*') {
                this.projectionMap.set(ngContent, { index: 0 });
            }
            else {
                this.projectionMap.set(ngContent, { index: this.index++, selector: selector });
            }
        };
        return ContentProjectionVisitor;
    }(template_ast_1.RecursiveTemplateAstVisitor));
    function getContentProjection(nodes, ngContentSelectors) {
        var projectIndexMap = new Map();
        var visitor = new ContentProjectionVisitor(projectIndexMap, ngContentSelectors);
        template_ast_1.templateVisitAll(visitor, nodes);
        return projectIndexMap;
    }
    function parserSelectorToSimpleSelector(selector) {
        var classes = selector.classNames && selector.classNames.length ? tslib_1.__spread([8 /* CLASS */], selector.classNames) :
            [];
        var elementName = selector.element && selector.element !== '*' ? selector.element : '';
        return tslib_1.__spread([elementName], selector.attrs, classes);
    }
    function parserSelectorToNegativeSelector(selector) {
        var classes = selector.classNames && selector.classNames.length ? tslib_1.__spread([8 /* CLASS */], selector.classNames) :
            [];
        if (selector.element) {
            return tslib_1.__spread([
                1 /* NOT */ | 4 /* ELEMENT */, selector.element
            ], selector.attrs, classes);
        }
        else if (selector.attrs.length) {
            return tslib_1.__spread([1 /* NOT */ | 2 /* ATTRIBUTE */], selector.attrs, classes);
        }
        else {
            return selector.classNames && selector.classNames.length ? tslib_1.__spread([1 /* NOT */ | 8 /* CLASS */], selector.classNames) :
                [];
        }
    }
    function parserSelectorToR3Selector(selector) {
        var positive = parserSelectorToSimpleSelector(selector);
        var negative = selector.notSelectors && selector.notSelectors.length ?
            selector.notSelectors.map(function (notSelector) { return parserSelectorToNegativeSelector(notSelector); }) :
            [];
        return positive.concat.apply(positive, tslib_1.__spread(negative));
    }
    function parseSelectorToR3Selector(selector) {
        var selectors = selector_1.CssSelector.parse(selector);
        return selectors.map(parserSelectorToR3Selector);
    }
    function asLiteral(value) {
        if (Array.isArray(value)) {
            return o.literalArr(value.map(asLiteral));
        }
        return o.literal(value, o.INFERRED_TYPE);
    }
    function mapToExpression(map, quoted) {
        if (quoted === void 0) { quoted = false; }
        return o.literalMap(Object.getOwnPropertyNames(map).map(function (key) { return ({ key: key, quoted: quoted, value: asLiteral(map[key]) }); }));
    }
    // Parse i18n metas like:
    // - "@@id",
    // - "description[@@id]",
    // - "meaning|description[@@id]"
    function parseI18nMeta(i18n) {
        var meaning;
        var description;
        var id;
        if (i18n) {
            // TODO(vicb): figure out how to force a message ID with closure ?
            var idIndex = i18n.indexOf(ID_SEPARATOR);
            var descIndex = i18n.indexOf(MEANING_SEPARATOR);
            var meaningAndDesc = void 0;
            _a = tslib_1.__read((idIndex > -1) ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''], 2), meaningAndDesc = _a[0], id = _a[1];
            _b = tslib_1.__read((descIndex > -1) ?
                [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
                ['', meaningAndDesc], 2), meaning = _b[0], description = _b[1];
        }
        return { description: description, id: id, meaning: meaning };
        var _a, _b;
    }
    var _a;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfdmlld19jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3IzX3ZpZXdfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsMkVBQTBUO0lBRTFULGlHQUFzUDtJQUd0UCxtRUFBME47SUFDMU4saUVBQTJDO0lBQzNDLGlGQUFzRDtJQUN0RCwyREFBMEM7SUFDMUMsK0RBQThEO0lBQzlELDJEQUF3QztJQUV4QyxtRkFBd1c7SUFDeFcsbURBQTZDO0lBRTdDLCtFQUFtRDtJQUNuRCxtRUFBZ0U7SUFHaEUsb0VBQW9FO0lBQ3BFLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQztJQUUzQiw2REFBNkQ7SUFDN0QsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBRTFCLHVEQUF1RDtJQUN2RCxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFFNUIscUNBQXFDO0lBQ3JDLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0lBRTlCLGlEQUFpRDtJQUNqRCxJQUFNLGtCQUFrQixHQUFHLFdBQVcsQ0FBQztJQUV2QyxtQ0FBbUM7SUFDbkMsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO0lBRWpDLG9DQUFvQztJQUNwQyxJQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQztJQUM5QixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUM7SUFFMUIsMEJBQ0ksU0FBd0IsRUFBRSxTQUFtQyxFQUFFLFNBQTJCLEVBQzFGLGFBQTRCLEVBQUUsSUFBZ0I7UUFDaEQsSUFBTSxtQkFBbUIsR0FBMEQsRUFBRSxDQUFDO1FBRXRGLElBQU0sS0FBSyxHQUFHLFVBQUMsR0FBVyxFQUFFLEtBQTBCO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFD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QUFDLENBQUM7WUFDdEQsS0FBSyxDQUFDO2dCQUNKLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLDRCQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RELEtBQUssQ0FBQztnQkFDSixNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyw0QkFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RCxLQUFLLEVBQUU7Z0JBQ0wsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsNEJBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEQsS0FBSyxFQUFFO2dCQUNMLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLDRCQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RELEtBQUssRUFBRTtnQkFDTCxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyw0QkFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RCxLQUFLLEVBQUU7Z0JBQ0wsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsNEJBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUNELENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLFlBQUssQ0FBQywyQ0FBeUMsSUFBSSxDQUFDLE1BQVEsQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLDRCQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJ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QUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUEzQyxDQUEyQyxDQUFDLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBRUQseUJBQXlCO0lBQ3pCLFlBQVk7SUFDWix5QkFBeUI7SUFDekIsZ0NBQWdDO0lBQ2hDLHVCQUF1QixJQUFhO1FBQ2xDLElBQUksT0FBeUIsQ0FBQztRQUM5QixJQUFJLFdBQTZCLENBQUM7UUFDbEMsSUFBSSxFQUFvQixDQUFDO1FBRXpCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVCxrRUFBa0U7WUFDbEUsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUzQyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDbEQsSUFBSSxjQUFjLFNBQVEsQ0FBQztZQUMzQix1R0FDbUYsRUFEbEYsc0JBQWMsRUFBRSxVQUFFLENBQ2lFO1lBQ3BGOzt3Q0FFd0IsRUFGdkIsZUFBTyxFQUFFLG1CQUFXLENBRUk7UUFDM0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxFQUFDLFdBQVcsYUFBQSxFQUFFLEVBQUUsSUFBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7O0lBQ3BDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLCBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5LCBDb21waWxlUGlwZVN1bW1hcnksIENvbXBpbGVRdWVyeU1ldGFkYXRhLCBDb21waWxlVG9rZW5NZXRhZGF0YSwgQ29tcGlsZVR5cGVNZXRhZGF0YSwgQ29tcGlsZVR5cGVTdW1tYXJ5LCBmbGF0dGVuLCBpZGVudGlmaWVyTmFtZSwgcmVuZGVyZXJUeXBlTmFtZSwgc2FuaXRpemVJZGVudGlmaWVyLCB0b2tlblJlZmVyZW5jZSwgdmlld0NsYXNzTmFtZX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0NvbXBpbGVSZWZsZWN0b3J9IGZyb20gJy4uL2NvbXBpbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7QmluZGluZ0Zvcm0sIEJ1aWx0aW5Db252ZXJ0ZXIsIEJ1aWx0aW5GdW5jdGlvbkNhbGwsIENvbnZlcnRQcm9wZXJ0eUJpbmRpbmdSZXN1bHQsIEV2ZW50SGFuZGxlclZhcnMsIExvY2FsUmVzb2x2ZXIsIGNvbnZlcnRBY3Rpb25CaW5kaW5nLCBjb252ZXJ0UHJvcGVydHlCaW5kaW5nLCBjb252ZXJ0UHJvcGVydHlCaW5kaW5nQnVpbHRpbnN9IGZyb20gJy4uL2NvbXBpbGVyX3V0aWwvZXhwcmVzc2lvbl9jb252ZXJ0ZXInO1xuaW1wb3J0IHtDb25zdGFudFBvb2wsIERlZmluaXRpb25LaW5kfSBmcm9tICcuLi9jb25zdGFudF9wb29sJztcbmltcG9ydCB7SW5qZWN0RmxhZ3N9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtBU1QsIEFzdE1lbW9yeUVmZmljaWVudFRyYW5zZm9ybWVyLCBBc3RUcmFuc2Zvcm1lciwgQmluZGluZ1BpcGUsIEZ1bmN0aW9uQ2FsbCwgSW1wbGljaXRSZWNlaXZlciwgTGl0ZXJhbEFycmF5LCBMaXRlcmFsTWFwLCBMaXRlcmFsUHJpbWl0aXZlLCBNZXRob2RDYWxsLCBQYXJzZVNwYW4sIFByb3BlcnR5UmVhZH0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnN9IGZyb20gJy4uL2lkZW50aWZpZXJzJztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3N9IGZyb20gJy4uL2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlU291cmNlU3BhbiwgdHlwZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnLi4vc2VsZWN0b3InO1xuaW1wb3J0IHtCaW5kaW5nUGFyc2VyfSBmcm9tICcuLi90ZW1wbGF0ZV9wYXJzZXIvYmluZGluZ19wYXJzZXInO1xuaW1wb3J0IHtBdHRyQXN0LCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgQm91bmRFdmVudEFzdCwgQm91bmRUZXh0QXN0LCBEaXJlY3RpdmVBc3QsIEVsZW1lbnRBc3QsIEVtYmVkZGVkVGVtcGxhdGVBc3QsIE5nQ29udGVudEFzdCwgUHJvcGVydHlCaW5kaW5nVHlwZSwgUHJvdmlkZXJBc3QsIFF1ZXJ5TWF0Y2gsIFJlY3Vyc2l2ZVRlbXBsYXRlQXN0VmlzaXRvciwgUmVmZXJlbmNlQXN0LCBUZW1wbGF0ZUFzdCwgVGVtcGxhdGVBc3RWaXNpdG9yLCBUZXh0QXN0LCBWYXJpYWJsZUFzdCwgdGVtcGxhdGVWaXNpdEFsbH0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge091dHB1dENvbnRleHQsIGVycm9yfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQge0JVSUxEX09QVElNSVpFUl9DT0xPQ0FURSwgT3V0cHV0TW9kZX0gZnJvbSAnLi9yM190eXBlcyc7XG5cblxuLyoqIE5hbWUgb2YgdGhlIGNvbnRleHQgcGFyYW1ldGVyIHBhc3NlZCBpbnRvIGEgdGVtcGxhdGUgZnVuY3Rpb24gKi9cbmNvbnN0IENPTlRFWFRfTkFNRSA9ICdjdHgnO1xuXG4vKiogTmFtZSBvZiB0aGUgUmVuZGVyRmxhZyBwYXNzZWQgaW50byBhIHRlbXBsYXRlIGZ1bmN0aW9uICovXG5jb25zdCBSRU5ERVJfRkxBR1MgPSAncmYnO1xuXG4vKiogTmFtZSBvZiB0aGUgdGVtcG9yYXJ5IHRvIHVzZSBkdXJpbmcgZGF0YSBiaW5kaW5nICovXG5jb25zdCBURU1QT1JBUllfTkFNRSA9ICdfdCc7XG5cbi8qKiBUaGUgcHJlZml4IHJlZmVyZW5jZSB2YXJpYWJsZXMgKi9cbmNvbnN0IFJFRkVSRU5DRV9QUkVGSVggPSAnX3InO1xuXG4vKiogVGhlIG5hbWUgb2YgdGhlIGltcGxpY2l0IGNvbnRleHQgcmVmZXJlbmNlICovXG5jb25zdCBJTVBMSUNJVF9SRUZFUkVOQ0UgPSAnJGltcGxpY2l0JztcblxuLyoqIE5hbWUgb2YgdGhlIGkxOG4gYXR0cmlidXRlcyAqKi9cbmNvbnN0IEkxOE5fQVRUUiA9ICdpMThuJztcbmNvbnN0IEkxOE5fQVRUUl9QUkVGSVggPSAnaTE4bi0nO1xuXG4vKiogSTE4biBzZXBhcmF0b3JzIGZvciBtZXRhZGF0YSAqKi9cbmNvbnN0IE1FQU5JTkdfU0VQQVJBVE9SID0gJ3wnO1xuY29uc3QgSURfU0VQQVJBVE9SID0gJ0BAJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEaXJlY3RpdmUoXG4gICAgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIsIG1vZGU6IE91dHB1dE1vZGUpIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcFZhbHVlczoge2tleTogc3RyaW5nLCBxdW90ZWQ6IGJvb2xlYW4sIHZhbHVlOiBvLkV4cHJlc3Npb259W10gPSBbXTtcblxuICBjb25zdCBmaWVsZCA9IChrZXk6IHN0cmluZywgdmFsdWU6IG8uRXhwcmVzc2lvbiB8IG51bGwpID0+IHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGRlZmluaXRpb25NYXBWYWx1ZXMucHVzaCh7a2V5LCB2YWx1ZSwgcXVvdGVkOiBmYWxzZX0pO1xuICAgIH1cbiAgfTtcblxuICAvLyBlLmcuICd0eXBlOiBNeURpcmVjdGl2ZWBcbiAgZmllbGQoJ3R5cGUnLCBvdXRwdXRDdHguaW1wb3J0RXhwcihkaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UpKTtcblxuICAvLyBlLmcuIGBzZWxlY3RvcnM6IFtbJycsICdzb21lRGlyJywgJyddXWBcbiAgZmllbGQoJ3NlbGVjdG9ycycsIGNyZWF0ZURpcmVjdGl2ZVNlbGVjdG9yKGRpcmVjdGl2ZS5zZWxlY3RvciAhKSk7XG5cbiAgLy8gZS5nLiBgZmFjdG9yeTogKCkgPT4gbmV3IE15QXBwKGluamVjdEVsZW1lbnRSZWYoKSlgXG4gIGZpZWxkKCdmYWN0b3J5JywgY3JlYXRlRmFjdG9yeShkaXJlY3RpdmUudHlwZSwgb3V0cHV0Q3R4LCByZWZsZWN0b3IsIGRpcmVjdGl2ZS5xdWVyaWVzKSk7XG5cbiAgLy8gZS5nLiBgaG9zdEJpbmRpbmdzOiAoZGlySW5kZXgsIGVsSW5kZXgpID0+IHsgLi4uIH1cbiAgZmllbGQoJ2hvc3RCaW5kaW5ncycsIGNyZWF0ZUhvc3RCaW5kaW5nc0Z1bmN0aW9uKGRpcmVjdGl2ZSwgb3V0cHV0Q3R4LCBiaW5kaW5nUGFyc2VyKSk7XG5cbiAgLy8gZS5nLiBgYXR0cmlidXRlczogWydyb2xlJywgJ2xpc3Rib3gnXWBcbiAgZmllbGQoJ2F0dHJpYnV0ZXMnLCBjcmVhdGVIb3N0QXR0cmlidXRlc0FycmF5KGRpcmVjdGl2ZSwgb3V0cHV0Q3R4KSk7XG5cbiAgLy8gZS5nICdpbnB1dHM6IHthOiAnYSd9YFxuICBmaWVsZCgnaW5wdXRzJywgY29uZGl0aW9uYWxseUNyZWF0ZU1hcE9iamVjdExpdGVyYWwoZGlyZWN0aXZlLmlucHV0cywgb3V0cHV0Q3R4KSk7XG5cbiAgLy8gZS5nICdvdXRwdXRzOiB7YTogJ2EnfWBcbiAgZmllbGQoJ291dHB1dHMnLCBjb25kaXRpb25hbGx5Q3JlYXRlTWFwT2JqZWN0TGl0ZXJhbChkaXJlY3RpdmUub3V0cHV0cywgb3V0cHV0Q3R4KSk7XG5cbiAgY29uc3QgY2xhc3NOYW1lID0gaWRlbnRpZmllck5hbWUoZGlyZWN0aXZlLnR5cGUpICE7XG4gIGNsYXNzTmFtZSB8fCBlcnJvcihgQ2Fubm90IHJlc29sdmVyIHRoZSBuYW1lIG9mICR7ZGlyZWN0aXZlLnR5cGV9YCk7XG5cbiAgY29uc3QgZGVmaW5pdGlvbkZpZWxkID0gb3V0cHV0Q3R4LmNvbnN0YW50UG9vbC5wcm9wZXJ0eU5hbWVPZihEZWZpbml0aW9uS2luZC5EaXJlY3RpdmUpO1xuICBjb25zdCBkZWZpbml0aW9uRnVuY3Rpb24gPVxuICAgICAgby5pbXBvcnRFeHByKFIzLmRlZmluZURpcmVjdGl2ZSkuY2FsbEZuKFtvLmxpdGVyYWxNYXAoZGVmaW5pdGlvbk1hcFZhbHVlcyldKTtcblxuICBpZiAobW9kZSA9PT0gT3V0cHV0TW9kZS5QYXJ0aWFsQ2xhc3MpIHtcbiAgICAvLyBDcmVhdGUgdGhlIHBhcnRpYWwgY2xhc3MgdG8gYmUgbWVyZ2VkIHdpdGggdGhlIGFjdHVhbCBjbGFzcy5cbiAgICBvdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKG5ldyBvLkNsYXNzU3RtdChcbiAgICAgICAgLyogbmFtZSAqLyBjbGFzc05hbWUsXG4gICAgICAgIC8qIHBhcmVudCAqLyBudWxsLFxuICAgICAgICAvKiBmaWVsZHMgKi9bbmV3IG8uQ2xhc3NGaWVsZChcbiAgICAgICAgICAgIC8qIG5hbWUgKi8gZGVmaW5pdGlvbkZpZWxkLFxuICAgICAgICAgICAgLyogdHlwZSAqLyBvLklORkVSUkVEX1RZUEUsXG4gICAgICAgICAgICAvKiBtb2RpZmllcnMgKi9bby5TdG10TW9kaWZpZXIuU3RhdGljXSxcbiAgICAgICAgICAgIC8qIGluaXRpYWxpemVyICovIGRlZmluaXRpb25GdW5jdGlvbildLFxuICAgICAgICAvKiBnZXR0ZXJzICovW10sXG4gICAgICAgIC8qIGNvbnN0cnVjdG9yTWV0aG9kICovIG5ldyBvLkNsYXNzTWV0aG9kKG51bGwsIFtdLCBbXSksXG4gICAgICAgIC8qIG1ldGhvZHMgKi9bXSkpO1xuICB9IGVsc2Uge1xuICAgIC8vIENyZWF0ZSBiYWNrLXBhdGNoIGRlZmluaXRpb24uXG4gICAgY29uc3QgY2xhc3NSZWZlcmVuY2UgPSBvdXRwdXRDdHguaW1wb3J0RXhwcihkaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBiYWNrLXBhdGNoIHN0YXRlbWVudFxuICAgIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2gobmV3IG8uQ29tbWVudFN0bXQoQlVJTERfT1BUSU1JWkVSX0NPTE9DQVRFKSk7XG4gICAgb3V0cHV0Q3R4LnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgY2xhc3NSZWZlcmVuY2UucHJvcChkZWZpbml0aW9uRmllbGQpLnNldChkZWZpbml0aW9uRnVuY3Rpb24pLnRvU3RtdCgpKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUNvbXBvbmVudChcbiAgICBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQsIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgIHBpcGVTdW1tYXJpZXM6IENvbXBpbGVQaXBlU3VtbWFyeVtdLCB0ZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSwgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIsIG1vZGU6IE91dHB1dE1vZGUpIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcFZhbHVlczoge2tleTogc3RyaW5nLCBxdW90ZWQ6IGJvb2xlYW4sIHZhbHVlOiBvLkV4cHJlc3Npb259W10gPSBbXTtcblxuICAvLyBQaXBlcyBhbmQgRGlyZWN0aXZlcyBmb3VuZCBpbiB0aGUgdGVtcGxhdGVcbiAgY29uc3QgcGlwZXMgPSBuZXcgU2V0PGFueT4oKTtcbiAgY29uc3QgZGlyZWN0aXZlcyA9IG5ldyBTZXQ8YW55PigpO1xuXG4gIGNvbnN0IGZpZWxkID0gKGtleTogc3RyaW5nLCB2YWx1ZTogby5FeHByZXNzaW9uIHwgbnVsbCkgPT4ge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgZGVmaW5pdGlvbk1hcFZhbHVlcy5wdXNoKHtrZXksIHZhbHVlLCBxdW90ZWQ6IGZhbHNlfSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGUuZy4gYHR5cGU6IE15QXBwYFxuICBmaWVsZCgndHlwZScsIG91dHB1dEN0eC5pbXBvcnRFeHByKGNvbXBvbmVudC50eXBlLnJlZmVyZW5jZSkpO1xuXG4gIC8vIGUuZy4gYHNlbGVjdG9yczogW1snbXktYXBwJ11dYFxuICBmaWVsZCgnc2VsZWN0b3JzJywgY3JlYXRlRGlyZWN0aXZlU2VsZWN0b3IoY29tcG9uZW50LnNlbGVjdG9yICEpKTtcblxuICBjb25zdCBzZWxlY3RvciA9IGNvbXBvbmVudC5zZWxlY3RvciAmJiBDc3NTZWxlY3Rvci5wYXJzZShjb21wb25lbnQuc2VsZWN0b3IpO1xuICBjb25zdCBmaXJzdFNlbGVjdG9yID0gc2VsZWN0b3IgJiYgc2VsZWN0b3JbMF07XG5cbiAgLy8gZS5nLiBgYXR0cjogW1wiY2xhc3NcIiwgXCIubXkuYXBwXCJdXG4gIC8vIFRoaXMgaXMgb3B0aW9uYWwgYW4gb25seSBpbmNsdWRlZCBpZiB0aGUgZmlyc3Qgc2VsZWN0b3Igb2YgYSBjb21wb25lbnQgc3BlY2lmaWVzIGF0dHJpYnV0ZXMuXG4gIGlmIChmaXJzdFNlbGVjdG9yKSB7XG4gICAgY29uc3Qgc2VsZWN0b3JBdHRyaWJ1dGVzID0gZmlyc3RTZWxlY3Rvci5nZXRBdHRycygpO1xuICAgIGlmIChzZWxlY3RvckF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgICBmaWVsZChcbiAgICAgICAgICAnYXR0cnMnLCBvdXRwdXRDdHguY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChcbiAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsQXJyKHNlbGVjdG9yQXR0cmlidXRlcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9PiB2YWx1ZSAhPSBudWxsID8gby5saXRlcmFsKHZhbHVlKSA6IG8ubGl0ZXJhbCh1bmRlZmluZWQpKSksXG4gICAgICAgICAgICAgICAgICAgICAgIC8qIGZvcmNlU2hhcmVkICovIHRydWUpKTtcbiAgICB9XG4gIH1cblxuICAvLyBlLmcuIGBmYWN0b3J5OiBmdW5jdGlvbiBNeUFwcF9GYWN0b3J5KCkgeyByZXR1cm4gbmV3IE15QXBwKGluamVjdEVsZW1lbnRSZWYoKSk7IH1gXG4gIGZpZWxkKCdmYWN0b3J5JywgY3JlYXRlRmFjdG9yeShjb21wb25lbnQudHlwZSwgb3V0cHV0Q3R4LCByZWZsZWN0b3IsIGNvbXBvbmVudC5xdWVyaWVzKSk7XG5cbiAgLy8gZS5nIGBob3N0QmluZGluZ3M6IGZ1bmN0aW9uIE15QXBwX0hvc3RCaW5kaW5ncyB7IC4uLiB9XG4gIGZpZWxkKCdob3N0QmluZGluZ3MnLCBjcmVhdGVIb3N0QmluZGluZ3NGdW5jdGlvbihjb21wb25lbnQsIG91dHB1dEN0eCwgYmluZGluZ1BhcnNlcikpO1xuXG4gIC8vIGUuZy4gYHRlbXBsYXRlOiBmdW5jdGlvbiBNeUNvbXBvbmVudF9UZW1wbGF0ZShfY3R4LCBfY20pIHsuLi59YFxuICBjb25zdCB0ZW1wbGF0ZVR5cGVOYW1lID0gY29tcG9uZW50LnR5cGUucmVmZXJlbmNlLm5hbWU7XG4gIGNvbnN0IHRlbXBsYXRlTmFtZSA9IHRlbXBsYXRlVHlwZU5hbWUgPyBgJHt0ZW1wbGF0ZVR5cGVOYW1lfV9UZW1wbGF0ZWAgOiBudWxsO1xuICBjb25zdCBwaXBlTWFwID1cbiAgICAgIG5ldyBNYXAocGlwZVN1bW1hcmllcy5tYXA8W3N0cmluZywgQ29tcGlsZVBpcGVTdW1tYXJ5XT4ocGlwZSA9PiBbcGlwZS5uYW1lLCBwaXBlXSkpO1xuICBjb25zdCB0ZW1wbGF0ZUZ1bmN0aW9uRXhwcmVzc2lvbiA9XG4gICAgICBuZXcgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcihcbiAgICAgICAgICBvdXRwdXRDdHgsIG91dHB1dEN0eC5jb25zdGFudFBvb2wsIHJlZmxlY3RvciwgQ09OVEVYVF9OQU1FLCBCaW5kaW5nU2NvcGUuUk9PVF9TQ09QRSwgMCxcbiAgICAgICAgICBjb21wb25lbnQudGVtcGxhdGUgIS5uZ0NvbnRlbnRTZWxlY3RvcnMsIHRlbXBsYXRlVHlwZU5hbWUsIHRlbXBsYXRlTmFtZSwgcGlwZU1hcCxcbiAgICAgICAgICBjb21wb25lbnQudmlld1F1ZXJpZXMsIGRpcmVjdGl2ZXMsIHBpcGVzKVxuICAgICAgICAgIC5idWlsZFRlbXBsYXRlRnVuY3Rpb24odGVtcGxhdGUsIFtdKTtcblxuICBmaWVsZCgndGVtcGxhdGUnLCB0ZW1wbGF0ZUZ1bmN0aW9uRXhwcmVzc2lvbik7XG5cbiAgLy8gZS5nLiBgZGlyZWN0aXZlczogW015RGlyZWN0aXZlXWBcbiAgaWYgKGRpcmVjdGl2ZXMuc2l6ZSkge1xuICAgIGNvbnN0IGV4cHJlc3Npb25zID0gQXJyYXkuZnJvbShkaXJlY3RpdmVzKS5tYXAoZCA9PiBvdXRwdXRDdHguaW1wb3J0RXhwcihkKSk7XG4gICAgZmllbGQoJ2RpcmVjdGl2ZXMnLCBvLmxpdGVyYWxBcnIoZXhwcmVzc2lvbnMpKTtcbiAgfVxuXG4gIC8vIGUuZy4gYHBpcGVzOiBbTXlQaXBlXWBcbiAgaWYgKHBpcGVzLnNpemUpIHtcbiAgICBjb25zdCBleHByZXNzaW9ucyA9IEFycmF5LmZyb20ocGlwZXMpLm1hcChwID0+IG91dHB1dEN0eC5pbXBvcnRFeHByKHApKTtcbiAgICBmaWVsZCgncGlwZXMnLCBvLmxpdGVyYWxBcnIoZXhwcmVzc2lvbnMpKTtcbiAgfVxuXG4gIC8vIGUuZyBgaW5wdXRzOiB7YTogJ2EnfWBcbiAgZmllbGQoJ2lucHV0cycsIGNvbmRpdGlvbmFsbHlDcmVhdGVNYXBPYmplY3RMaXRlcmFsKGNvbXBvbmVudC5pbnB1dHMsIG91dHB1dEN0eCkpO1xuXG4gIC8vIGUuZyAnb3V0cHV0czoge2E6ICdhJ31gXG4gIGZpZWxkKCdvdXRwdXRzJywgY29uZGl0aW9uYWxseUNyZWF0ZU1hcE9iamVjdExpdGVyYWwoY29tcG9uZW50Lm91dHB1dHMsIG91dHB1dEN0eCkpO1xuXG4gIC8vIGUuZy4gYGZlYXR1cmVzOiBbTmdPbkNoYW5nZXNGZWF0dXJlKE15Q29tcG9uZW50KV1gXG4gIGNvbnN0IGZlYXR1cmVzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICBpZiAoY29tcG9uZW50LnR5cGUubGlmZWN5Y2xlSG9va3Muc29tZShsaWZlY3ljbGUgPT4gbGlmZWN5Y2xlID09IExpZmVjeWNsZUhvb2tzLk9uQ2hhbmdlcykpIHtcbiAgICBmZWF0dXJlcy5wdXNoKG8uaW1wb3J0RXhwcihSMy5OZ09uQ2hhbmdlc0ZlYXR1cmUsIG51bGwsIG51bGwpLmNhbGxGbihbb3V0cHV0Q3R4LmltcG9ydEV4cHIoXG4gICAgICAgIGNvbXBvbmVudC50eXBlLnJlZmVyZW5jZSldKSk7XG4gIH1cbiAgaWYgKGZlYXR1cmVzLmxlbmd0aCkge1xuICAgIGZpZWxkKCdmZWF0dXJlcycsIG8ubGl0ZXJhbEFycihmZWF0dXJlcykpO1xuICB9XG5cbiAgY29uc3QgZGVmaW5pdGlvbkZpZWxkID0gb3V0cHV0Q3R4LmNvbnN0YW50UG9vbC5wcm9wZXJ0eU5hbWVPZihEZWZpbml0aW9uS2luZC5Db21wb25lbnQpO1xuICBjb25zdCBkZWZpbml0aW9uRnVuY3Rpb24gPVxuICAgICAgby5pbXBvcnRFeHByKFIzLmRlZmluZUNvbXBvbmVudCkuY2FsbEZuKFtvLmxpdGVyYWxNYXAoZGVmaW5pdGlvbk1hcFZhbHVlcyldKTtcbiAgaWYgKG1vZGUgPT09IE91dHB1dE1vZGUuUGFydGlhbENsYXNzKSB7XG4gICAgY29uc3QgY2xhc3NOYW1lID0gaWRlbnRpZmllck5hbWUoY29tcG9uZW50LnR5cGUpICE7XG4gICAgY2xhc3NOYW1lIHx8IGVycm9yKGBDYW5ub3QgcmVzb2x2ZXIgdGhlIG5hbWUgb2YgJHtjb21wb25lbnQudHlwZX1gKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgcGFydGlhbCBjbGFzcyB0byBiZSBtZXJnZWQgd2l0aCB0aGUgYWN0dWFsIGNsYXNzLlxuICAgIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2gobmV3IG8uQ2xhc3NTdG10KFxuICAgICAgICAvKiBuYW1lICovIGNsYXNzTmFtZSxcbiAgICAgICAgLyogcGFyZW50ICovIG51bGwsXG4gICAgICAgIC8qIGZpZWxkcyAqL1tuZXcgby5DbGFzc0ZpZWxkKFxuICAgICAgICAgICAgLyogbmFtZSAqLyBkZWZpbml0aW9uRmllbGQsXG4gICAgICAgICAgICAvKiB0eXBlICovIG8uSU5GRVJSRURfVFlQRSxcbiAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqL1tvLlN0bXRNb2RpZmllci5TdGF0aWNdLFxuICAgICAgICAgICAgLyogaW5pdGlhbGl6ZXIgKi8gZGVmaW5pdGlvbkZ1bmN0aW9uKV0sXG4gICAgICAgIC8qIGdldHRlcnMgKi9bXSxcbiAgICAgICAgLyogY29uc3RydWN0b3JNZXRob2QgKi8gbmV3IG8uQ2xhc3NNZXRob2QobnVsbCwgW10sIFtdKSxcbiAgICAgICAgLyogbWV0aG9kcyAqL1tdKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY2xhc3NSZWZlcmVuY2UgPSBvdXRwdXRDdHguaW1wb3J0RXhwcihjb21wb25lbnQudHlwZS5yZWZlcmVuY2UpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBiYWNrLXBhdGNoIHN0YXRlbWVudFxuICAgIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgIG5ldyBvLkNvbW1lbnRTdG10KEJVSUxEX09QVElNSVpFUl9DT0xPQ0FURSksXG4gICAgICAgIGNsYXNzUmVmZXJlbmNlLnByb3AoZGVmaW5pdGlvbkZpZWxkKS5zZXQoZGVmaW5pdGlvbkZ1bmN0aW9uKS50b1N0bXQoKSk7XG4gIH1cbn1cblxuLy8gVE9ETzogUmVtb3ZlIHRoZXNlIHdoZW4gdGhlIHRoaW5ncyBhcmUgZnVsbHkgc3VwcG9ydGVkXG5mdW5jdGlvbiB1bmtub3duPFQ+KGFyZzogby5FeHByZXNzaW9uIHwgby5TdGF0ZW1lbnQgfCBUZW1wbGF0ZUFzdCk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYEJ1aWxkZXIgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGlzIHVuYWJsZSB0byBoYW5kbGUgJHthcmcuY29uc3RydWN0b3IubmFtZX0geWV0YCk7XG59XG5cbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKGZlYXR1cmU6IHN0cmluZyk6IG5ldmVyIHtcbiAgaWYgKHRoaXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJ1aWxkZXIgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGRvZXNuJ3Qgc3VwcG9ydCAke2ZlYXR1cmV9IHlldGApO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgRmVhdHVyZSAke2ZlYXR1cmV9IGlzIG5vdCBzdXBwb3J0ZWQgeWV0YCk7XG59XG5cbmNvbnN0IEJJTkRJTkdfSU5TVFJVQ1RJT05fTUFQOiB7W2luZGV4OiBudW1iZXJdOiBvLkV4dGVybmFsUmVmZXJlbmNlIHwgdW5kZWZpbmVkfSA9IHtcbiAgW1Byb3BlcnR5QmluZGluZ1R5cGUuUHJvcGVydHldOiBSMy5lbGVtZW50UHJvcGVydHksXG4gIFtQcm9wZXJ0eUJpbmRpbmdUeXBlLkF0dHJpYnV0ZV06IFIzLmVsZW1lbnRBdHRyaWJ1dGUsXG4gIFtQcm9wZXJ0eUJpbmRpbmdUeXBlLkNsYXNzXTogUjMuZWxlbWVudENsYXNzTmFtZWQsXG4gIFtQcm9wZXJ0eUJpbmRpbmdUeXBlLlN0eWxlXTogUjMuZWxlbWVudFN0eWxlTmFtZWRcbn07XG5cbmZ1bmN0aW9uIGludGVycG9sYXRlKGFyZ3M6IG8uRXhwcmVzc2lvbltdKTogby5FeHByZXNzaW9uIHtcbiAgYXJncyA9IGFyZ3Muc2xpY2UoMSk7ICAvLyBJZ25vcmUgdGhlIGxlbmd0aCBwcmVmaXggYWRkZWQgZm9yIHJlbmRlcjJcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjEpLmNhbGxGbihhcmdzKTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb24yKS5jYWxsRm4oYXJncyk7XG4gICAgY2FzZSA3OlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnRlcnBvbGF0aW9uMykuY2FsbEZuKGFyZ3MpO1xuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjQpLmNhbGxGbihhcmdzKTtcbiAgICBjYXNlIDExOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnRlcnBvbGF0aW9uNSkuY2FsbEZuKGFyZ3MpO1xuICAgIGNhc2UgMTM6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb242KS5jYWxsRm4oYXJncyk7XG4gICAgY2FzZSAxNTpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjcpLmNhbGxGbihhcmdzKTtcbiAgICBjYXNlIDE3OlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnRlcnBvbGF0aW9uOCkuY2FsbEZuKGFyZ3MpO1xuICB9XG4gIChhcmdzLmxlbmd0aCA+PSAxOSAmJiBhcmdzLmxlbmd0aCAlIDIgPT0gMSkgfHxcbiAgICAgIGVycm9yKGBJbnZhbGlkIGludGVycG9sYXRpb24gYXJndW1lbnQgbGVuZ3RoICR7YXJncy5sZW5ndGh9YCk7XG4gIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvblYpLmNhbGxGbihbby5saXRlcmFsQXJyKGFyZ3MpXSk7XG59XG5cbmZ1bmN0aW9uIHBpcGVCaW5kaW5nKGFyZ3M6IG8uRXhwcmVzc2lvbltdKTogby5FeHRlcm5hbFJlZmVyZW5jZSB7XG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIHRvIHBpcGVCaW5kIGlzIGFsd2F5cyB0aGUgdmFsdWUgdG8gYmUgdHJhbnNmb3JtZWQgZm9sbG93ZWRcbiAgICAgIC8vIGJ5IGFyZy5sZW5ndGggYXJndW1lbnRzIHNvIHRoZSB0b3RhbCBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHBpcGVCaW5kIGFyZVxuICAgICAgLy8gYXJnLmxlbmd0aCArIDEuXG4gICAgICByZXR1cm4gUjMucGlwZUJpbmQxO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBSMy5waXBlQmluZDI7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIFIzLnBpcGVCaW5kMztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFIzLnBpcGVCaW5kVjtcbiAgfVxufVxuXG5jb25zdCBwdXJlRnVuY3Rpb25JZGVudGlmaWVycyA9IFtcbiAgUjMucHVyZUZ1bmN0aW9uMCwgUjMucHVyZUZ1bmN0aW9uMSwgUjMucHVyZUZ1bmN0aW9uMiwgUjMucHVyZUZ1bmN0aW9uMywgUjMucHVyZUZ1bmN0aW9uNCxcbiAgUjMucHVyZUZ1bmN0aW9uNSwgUjMucHVyZUZ1bmN0aW9uNiwgUjMucHVyZUZ1bmN0aW9uNywgUjMucHVyZUZ1bmN0aW9uOFxuXTtcbmZ1bmN0aW9uIGdldExpdGVyYWxGYWN0b3J5KFxuICAgIG91dHB1dENvbnRleHQ6IE91dHB1dENvbnRleHQsIGxpdGVyYWw6IG8uTGl0ZXJhbEFycmF5RXhwciB8IG8uTGl0ZXJhbE1hcEV4cHIpOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCB7bGl0ZXJhbEZhY3RvcnksIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzfSA9XG4gICAgICBvdXRwdXRDb250ZXh0LmNvbnN0YW50UG9vbC5nZXRMaXRlcmFsRmFjdG9yeShsaXRlcmFsKTtcbiAgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMubGVuZ3RoID4gMCB8fCBlcnJvcihgRXhwZWN0ZWQgYXJndW1lbnRzIHRvIGEgbGl0ZXJhbCBmYWN0b3J5IGZ1bmN0aW9uYCk7XG4gIGxldCBwdXJlRnVuY3Rpb25JZGVudCA9XG4gICAgICBwdXJlRnVuY3Rpb25JZGVudGlmaWVyc1tsaXRlcmFsRmFjdG9yeUFyZ3VtZW50cy5sZW5ndGhdIHx8IFIzLnB1cmVGdW5jdGlvblY7XG5cbiAgLy8gTGl0ZXJhbCBmYWN0b3JpZXMgYXJlIHB1cmUgZnVuY3Rpb25zIHRoYXQgb25seSBuZWVkIHRvIGJlIHJlLWludm9rZWQgd2hlbiB0aGUgcGFyYW1ldGVyc1xuICAvLyBjaGFuZ2UuXG4gIHJldHVybiBvLmltcG9ydEV4cHIocHVyZUZ1bmN0aW9uSWRlbnQpLmNhbGxGbihbbGl0ZXJhbEZhY3RvcnksIC4uLmxpdGVyYWxGYWN0b3J5QXJndW1lbnRzXSk7XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vKipcbiAqIEZ1bmN0aW9uIHdoaWNoIGlzIGV4ZWN1dGVkIHdoZW5ldmVyIGEgdmFyaWFibGUgaXMgcmVmZXJlbmNlZCBmb3IgdGhlIGZpcnN0IHRpbWUgaW4gYSBnaXZlblxuICogc2NvcGUuXG4gKlxuICogSXQgaXMgZXhwZWN0ZWQgdGhhdCB0aGUgZnVuY3Rpb24gY3JlYXRlcyB0aGUgYGNvbnN0IGxvY2FsTmFtZSA9IGV4cHJlc3Npb25gOyBzdGF0ZW1lbnQuXG4gKi9cbnR5cGUgRGVjbGFyZUxvY2FsVmFyQ2FsbGJhY2sgPSAobGhzVmFyOiBvLlJlYWRWYXJFeHByLCByaHNFeHByZXNzaW9uOiBvLkV4cHJlc3Npb24pID0+IHZvaWQ7XG5cbmNsYXNzIEJpbmRpbmdTY29wZSBpbXBsZW1lbnRzIExvY2FsUmVzb2x2ZXIge1xuICAvKipcbiAgICogS2VlcHMgYSBtYXAgZnJvbSBsb2NhbCB2YXJpYWJsZXMgdG8gdGhlaXIgZXhwcmVzc2lvbnMuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCB3aGVuIG9uZSByZWZlcnMgdG8gdmFyaWFibGUgc3VjaCBhczogJ2xldCBhYmMgPSBhLmIuY2AuXG4gICAqIC0ga2V5IHRvIHRoZSBtYXAgaXMgdGhlIHN0cmluZyBsaXRlcmFsIGBcImFiY1wiYC5cbiAgICogLSB2YWx1ZSBgbGhzYCBpcyB0aGUgbGVmdCBoYW5kIHNpZGUgd2hpY2ggaXMgYW4gQVNUIHJlcHJlc2VudGluZyBgYWJjYC5cbiAgICogLSB2YWx1ZSBgcmhzYCBpcyB0aGUgcmlnaHQgaGFuZCBzaWRlIHdoaWNoIGlzIGFuIEFTVCByZXByZXNlbnRpbmcgYGEuYi5jYC5cbiAgICogLSB2YWx1ZSBgZGVjbGFyZWRgIGlzIHRydWUgaWYgdGhlIGBkZWNsYXJlTG9jYWxWYXJDYWxsYmFja2AgaGFzIGJlZW4gY2FsbGVkIGZvciB0aGlzIHNjb3BlXG4gICAqIGFscmVhZHkuXG4gICAqL1xuICBwcml2YXRlIG1hcCA9IG5ldyBNYXAgPCBzdHJpbmcsIHtcbiAgICBsaHM6IG8uUmVhZFZhckV4cHI7XG4gICAgcmhzOiBvLkV4cHJlc3Npb258dW5kZWZpbmVkO1xuICAgIGRlY2xhcmVkOiBib29sZWFuO1xuICB9XG4gID4gKCk7XG4gIHByaXZhdGUgcmVmZXJlbmNlTmFtZUluZGV4ID0gMDtcblxuICBzdGF0aWMgUk9PVF9TQ09QRSA9IG5ldyBCaW5kaW5nU2NvcGUoKS5zZXQoJyRldmVudCcsIG8udmFyaWFibGUoJyRldmVudCcpKTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBwYXJlbnQ6IEJpbmRpbmdTY29wZXxudWxsID0gbnVsbCxcbiAgICAgIHByaXZhdGUgZGVjbGFyZUxvY2FsVmFyQ2FsbGJhY2s6IERlY2xhcmVMb2NhbFZhckNhbGxiYWNrID0gbm9vcCkge31cblxuICBnZXQobmFtZTogc3RyaW5nKTogby5FeHByZXNzaW9ufG51bGwge1xuICAgIGxldCBjdXJyZW50OiBCaW5kaW5nU2NvcGV8bnVsbCA9IHRoaXM7XG4gICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgIGxldCB2YWx1ZSA9IGN1cnJlbnQubWFwLmdldChuYW1lKTtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjdXJyZW50ICE9PSB0aGlzKSB7XG4gICAgICAgICAgLy8gbWFrZSBhIGxvY2FsIGNvcHkgYW5kIHJlc2V0IHRoZSBgZGVjbGFyZWRgIHN0YXRlLlxuICAgICAgICAgIHZhbHVlID0ge2xoczogdmFsdWUubGhzLCByaHM6IHZhbHVlLnJocywgZGVjbGFyZWQ6IGZhbHNlfTtcbiAgICAgICAgICAvLyBDYWNoZSB0aGUgdmFsdWUgbG9jYWxseS5cbiAgICAgICAgICB0aGlzLm1hcC5zZXQobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZS5yaHMgJiYgIXZhbHVlLmRlY2xhcmVkKSB7XG4gICAgICAgICAgLy8gaWYgaXQgaXMgZmlyc3QgdGltZSB3ZSBhcmUgcmVmZXJlbmNpbmcgdGhlIHZhcmlhYmxlIGluIHRoZSBzY29wZVxuICAgICAgICAgIC8vIHRoYW4gaW52b2tlIHRoZSBjYWxsYmFjayB0byBpbnNlcnQgdmFyaWFibGUgZGVjbGFyYXRpb24uXG4gICAgICAgICAgdGhpcy5kZWNsYXJlTG9jYWxWYXJDYWxsYmFjayh2YWx1ZS5saHMsIHZhbHVlLnJocyk7XG4gICAgICAgICAgdmFsdWUuZGVjbGFyZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZS5saHM7XG4gICAgICB9XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxvY2FsIHZhcmlhYmxlIGZvciBsYXRlciByZWZlcmVuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgKiBAcGFyYW0gbGhzIEFTVCByZXByZXNlbnRpbmcgdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHRoZSBgbGV0IGxocyA9IHJocztgLlxuICAgKiBAcGFyYW0gcmhzIEFTVCByZXByZXNlbnRpbmcgdGhlIHJpZ2h0IGhhbmQgc2lkZSBvZiB0aGUgYGxldCBsaHMgPSByaHM7YC4gVGhlIGByaHNgIGNhbiBiZVxuICAgKiBgdW5kZWZpbmVkYCBmb3IgdmFyaWFibGUgdGhhdCBhcmUgYW1iaWVudCBzdWNoIGFzIGAkZXZlbnRgIGFuZCB3aGljaCBkb24ndCBoYXZlIGByaHNgXG4gICAqIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgc2V0KG5hbWU6IHN0cmluZywgbGhzOiBvLlJlYWRWYXJFeHByLCByaHM/OiBvLkV4cHJlc3Npb24pOiBCaW5kaW5nU2NvcGUge1xuICAgICF0aGlzLm1hcC5oYXMobmFtZSkgfHxcbiAgICAgICAgZXJyb3IoYFRoZSBuYW1lICR7bmFtZX0gaXMgYWxyZWFkeSBkZWZpbmVkIGluIHNjb3BlIHRvIGJlICR7dGhpcy5tYXAuZ2V0KG5hbWUpfWApO1xuICAgIHRoaXMubWFwLnNldChuYW1lLCB7bGhzOiBsaHMsIHJoczogcmhzLCBkZWNsYXJlZDogZmFsc2V9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldExvY2FsKG5hbWU6IHN0cmluZyk6IChvLkV4cHJlc3Npb258bnVsbCkgeyByZXR1cm4gdGhpcy5nZXQobmFtZSk7IH1cblxuICBuZXN0ZWRTY29wZShkZWNsYXJlQ2FsbGJhY2s6IERlY2xhcmVMb2NhbFZhckNhbGxiYWNrKTogQmluZGluZ1Njb3BlIHtcbiAgICByZXR1cm4gbmV3IEJpbmRpbmdTY29wZSh0aGlzLCBkZWNsYXJlQ2FsbGJhY2spO1xuICB9XG5cbiAgZnJlc2hSZWZlcmVuY2VOYW1lKCk6IHN0cmluZyB7XG4gICAgbGV0IGN1cnJlbnQ6IEJpbmRpbmdTY29wZSA9IHRoaXM7XG4gICAgLy8gRmluZCB0aGUgdG9wIHNjb3BlIGFzIGl0IG1haW50YWlucyB0aGUgZ2xvYmFsIHJlZmVyZW5jZSBjb3VudFxuICAgIHdoaWxlIChjdXJyZW50LnBhcmVudCkgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgIGNvbnN0IHJlZiA9IGAke1JFRkVSRU5DRV9QUkVGSVh9JHtjdXJyZW50LnJlZmVyZW5jZU5hbWVJbmRleCsrfWA7XG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuXG4vLyBQYXN0ZWQgZnJvbSByZW5kZXIzL2ludGVyZmFjZXMvZGVmaW5pdGlvbiBzaW5jZSBpdCBjYW5ub3QgYmUgcmVmZXJlbmNlZCBkaXJlY3RseVxuLyoqXG4gKiBGbGFncyBwYXNzZWQgaW50byB0ZW1wbGF0ZSBmdW5jdGlvbnMgdG8gZGV0ZXJtaW5lIHdoaWNoIGJsb2NrcyAoaS5lLiBjcmVhdGlvbiwgdXBkYXRlKVxuICogc2hvdWxkIGJlIGV4ZWN1dGVkLlxuICpcbiAqIFR5cGljYWxseSwgYSB0ZW1wbGF0ZSBydW5zIGJvdGggdGhlIGNyZWF0aW9uIGJsb2NrIGFuZCB0aGUgdXBkYXRlIGJsb2NrIG9uIGluaXRpYWxpemF0aW9uIGFuZFxuICogc3Vic2VxdWVudCBydW5zIG9ubHkgZXhlY3V0ZSB0aGUgdXBkYXRlIGJsb2NrLiBIb3dldmVyLCBkeW5hbWljYWxseSBjcmVhdGVkIHZpZXdzIHJlcXVpcmUgdGhhdFxuICogdGhlIGNyZWF0aW9uIGJsb2NrIGJlIGV4ZWN1dGVkIHNlcGFyYXRlbHkgZnJvbSB0aGUgdXBkYXRlIGJsb2NrIChmb3IgYmFja3dhcmRzIGNvbXBhdCkuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFJlbmRlckZsYWdzIHtcbiAgLyogV2hldGhlciB0byBydW4gdGhlIGNyZWF0aW9uIGJsb2NrIChlLmcuIGNyZWF0ZSBlbGVtZW50cyBhbmQgZGlyZWN0aXZlcykgKi9cbiAgQ3JlYXRlID0gMGIwMSxcblxuICAvKiBXaGV0aGVyIHRvIHJ1biB0aGUgdXBkYXRlIGJsb2NrIChlLmcuIHJlZnJlc2ggYmluZGluZ3MpICovXG4gIFVwZGF0ZSA9IDBiMTBcbn1cblxuY2xhc3MgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0VmlzaXRvciwgTG9jYWxSZXNvbHZlciB7XG4gIHByaXZhdGUgX2RhdGFJbmRleCA9IDA7XG4gIHByaXZhdGUgX2JpbmRpbmdDb250ZXh0ID0gMDtcbiAgcHJpdmF0ZSBfdGVtcG9yYXJ5QWxsb2NhdGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX3ByZWZpeDogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICBwcml2YXRlIF9jcmVhdGlvbk1vZGU6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgcHJpdmF0ZSBfdmFyaWFibGVNb2RlOiBvLlN0YXRlbWVudFtdID0gW107XG4gIHByaXZhdGUgX2JpbmRpbmdNb2RlOiBvLlN0YXRlbWVudFtdID0gW107XG4gIHByaXZhdGUgX3Bvc3RmaXg6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgcHJpdmF0ZSBfY29udGVudFByb2plY3Rpb25zOiBNYXA8TmdDb250ZW50QXN0LCBOZ0NvbnRlbnRJbmZvPjtcbiAgcHJpdmF0ZSBfcHJvamVjdGlvbkRlZmluaXRpb25JbmRleCA9IDA7XG4gIHByaXZhdGUgX3ZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcjtcbiAgcHJpdmF0ZSB1bnN1cHBvcnRlZCA9IHVuc3VwcG9ydGVkO1xuICBwcml2YXRlIGludmFsaWQgPSBpbnZhbGlkO1xuICBwcml2YXRlIGJpbmRpbmdTY29wZTogQmluZGluZ1Njb3BlO1xuXG4gIC8vIFdoZXRoZXIgd2UgYXJlIGluc2lkZSBhIHRyYW5zbGF0YWJsZSBlbGVtZW50IChgPHAgaTE4bj4uLi4gc29tZXdoZXJlIGhlcmUgLi4uIDwvcD4pXG4gIHByaXZhdGUgX2luSTE4blNlY3Rpb246IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfaTE4blNlY3Rpb25JbmRleCA9IC0xO1xuICAvLyBNYXBzIG9mIHBsYWNlaG9sZGVyIHRvIG5vZGUgaW5kZXhlcyBmb3IgZWFjaCBvZiB0aGUgaTE4biBzZWN0aW9uXG4gIHByaXZhdGUgX3BoVG9Ob2RlSWR4ZXM6IHtbcGhOYW1lOiBzdHJpbmddOiBudW1iZXJbXX1bXSA9IFt7fV07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgcHJpdmF0ZSBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCxcbiAgICAgIHByaXZhdGUgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLCBwcml2YXRlIGNvbnRleHRQYXJhbWV0ZXI6IHN0cmluZyxcbiAgICAgIHBhcmVudEJpbmRpbmdTY29wZTogQmluZGluZ1Njb3BlLCBwcml2YXRlIGxldmVsID0gMCwgcHJpdmF0ZSBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdLFxuICAgICAgcHJpdmF0ZSBjb250ZXh0TmFtZTogc3RyaW5nfG51bGwsIHByaXZhdGUgdGVtcGxhdGVOYW1lOiBzdHJpbmd8bnVsbCxcbiAgICAgIHByaXZhdGUgcGlwZU1hcDogTWFwPHN0cmluZywgQ29tcGlsZVBpcGVTdW1tYXJ5PiwgcHJpdmF0ZSB2aWV3UXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICAgIHByaXZhdGUgZGlyZWN0aXZlczogU2V0PGFueT4sIHByaXZhdGUgcGlwZXM6IFNldDxhbnk+KSB7XG4gICAgdGhpcy5iaW5kaW5nU2NvcGUgPVxuICAgICAgICBwYXJlbnRCaW5kaW5nU2NvcGUubmVzdGVkU2NvcGUoKGxoc1Zhcjogby5SZWFkVmFyRXhwciwgZXhwcmVzc2lvbjogby5FeHByZXNzaW9uKSA9PiB7XG4gICAgICAgICAgdGhpcy5fYmluZGluZ01vZGUucHVzaChcbiAgICAgICAgICAgICAgbGhzVmFyLnNldChleHByZXNzaW9uKS50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuICAgICAgICB9KTtcbiAgICB0aGlzLl92YWx1ZUNvbnZlcnRlciA9IG5ldyBWYWx1ZUNvbnZlcnRlcihcbiAgICAgICAgb3V0cHV0Q3R4LCAoKSA9PiB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKSwgKG5hbWUsIGxvY2FsTmFtZSwgc2xvdCwgdmFsdWU6IG8uUmVhZFZhckV4cHIpID0+IHtcbiAgICAgICAgICB0aGlzLmJpbmRpbmdTY29wZS5zZXQobG9jYWxOYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgY29uc3QgcGlwZSA9IHBpcGVNYXAuZ2V0KG5hbWUpICE7XG4gICAgICAgICAgcGlwZSB8fCBlcnJvcihgQ291bGQgbm90IGZpbmQgcGlwZSAke25hbWV9YCk7XG4gICAgICAgICAgdGhpcy5waXBlcy5hZGQocGlwZS50eXBlLnJlZmVyZW5jZSk7XG4gICAgICAgICAgdGhpcy5fY3JlYXRpb25Nb2RlLnB1c2goXG4gICAgICAgICAgICAgIG8uaW1wb3J0RXhwcihSMy5waXBlKS5jYWxsRm4oW28ubGl0ZXJhbChzbG90KSwgby5saXRlcmFsKG5hbWUpXSkudG9TdG10KCkpO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkVGVtcGxhdGVGdW5jdGlvbihub2RlczogVGVtcGxhdGVBc3RbXSwgdmFyaWFibGVzOiBWYXJpYWJsZUFzdFtdKTogby5GdW5jdGlvbkV4cHIge1xuICAgIC8vIENyZWF0ZSB2YXJpYWJsZSBiaW5kaW5nc1xuICAgIGZvciAoY29uc3QgdmFyaWFibGUgb2YgdmFyaWFibGVzKSB7XG4gICAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSB2YXJpYWJsZS5uYW1lO1xuICAgICAgY29uc3QgZXhwcmVzc2lvbiA9XG4gICAgICAgICAgby52YXJpYWJsZSh0aGlzLmNvbnRleHRQYXJhbWV0ZXIpLnByb3AodmFyaWFibGUudmFsdWUgfHwgSU1QTElDSVRfUkVGRVJFTkNFKTtcbiAgICAgIGNvbnN0IHNjb3BlZE5hbWUgPSB0aGlzLmJpbmRpbmdTY29wZS5mcmVzaFJlZmVyZW5jZU5hbWUoKTtcbiAgICAgIC8vIEFkZCB0aGUgcmVmZXJlbmNlIHRvIHRoZSBsb2NhbCBzY29wZS5cbiAgICAgIHRoaXMuYmluZGluZ1Njb3BlLnNldCh2YXJpYWJsZU5hbWUsIG8udmFyaWFibGUodmFyaWFibGVOYW1lICsgc2NvcGVkTmFtZSksIGV4cHJlc3Npb24pO1xuICAgIH1cblxuICAgIC8vIENvbGxlY3QgY29udGVudCBwcm9qZWN0aW9uc1xuICAgIGlmICh0aGlzLm5nQ29udGVudFNlbGVjdG9ycyAmJiB0aGlzLm5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBjb250ZW50UHJvamVjdGlvbnMgPSBnZXRDb250ZW50UHJvamVjdGlvbihub2RlcywgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgICAgdGhpcy5fY29udGVudFByb2plY3Rpb25zID0gY29udGVudFByb2plY3Rpb25zO1xuXG4gICAgICBpZiAoY29udGVudFByb2plY3Rpb25zLnNpemUgPiAwKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9yczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICBBcnJheS5mcm9tKGNvbnRlbnRQcm9qZWN0aW9ucy52YWx1ZXMoKSkuZm9yRWFjaChpbmZvID0+IHtcbiAgICAgICAgICBpZiAoaW5mby5zZWxlY3Rvcikge1xuICAgICAgICAgICAgc2VsZWN0b3JzW2luZm8uaW5kZXggLSAxXSA9IGluZm8uc2VsZWN0b3I7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBwcm9qZWN0aW9uSW5kZXggPSB0aGlzLl9wcm9qZWN0aW9uRGVmaW5pdGlvbkluZGV4ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG4gICAgICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW28ubGl0ZXJhbChwcm9qZWN0aW9uSW5kZXgpXTtcblxuICAgICAgICBpZiAoc2VsZWN0b3JzLnNvbWUodmFsdWUgPT4gIXZhbHVlKSkge1xuICAgICAgICAgIGVycm9yKGBjb250ZW50IHByb2plY3QgaW5mb3JtYXRpb24gc2tpcHBlZCBhbiBpbmRleGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdG9ycy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgY29uc3QgcjNTZWxlY3RvcnMgPSBzZWxlY3RvcnMubWFwKHMgPT4gcGFyc2VTZWxlY3RvclRvUjNTZWxlY3RvcihzKSk7XG4gICAgICAgICAgLy8gYHByb2plY3Rpb25EZWZgIG5lZWRzIGJvdGggdGhlIHBhcnNlZCBhbmQgcmF3IHZhbHVlIG9mIHRoZSBzZWxlY3RvcnNcbiAgICAgICAgICBjb25zdCBwYXJzZWQgPSB0aGlzLm91dHB1dEN0eC5jb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKGFzTGl0ZXJhbChyM1NlbGVjdG9ycyksIHRydWUpO1xuICAgICAgICAgIGNvbnN0IHVuUGFyc2VkID0gdGhpcy5vdXRwdXRDdHguY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChhc0xpdGVyYWwoc2VsZWN0b3JzKSwgdHJ1ZSk7XG4gICAgICAgICAgcGFyYW1ldGVycy5wdXNoKHBhcnNlZCwgdW5QYXJzZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbnN0cnVjdGlvbih0aGlzLl9jcmVhdGlvbk1vZGUsIG51bGwsIFIzLnByb2plY3Rpb25EZWYsIC4uLnBhcmFtZXRlcnMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmluZSBhbmQgdXBkYXRlIGFueSB2aWV3IHF1ZXJpZXNcbiAgICBmb3IgKGxldCBxdWVyeSBvZiB0aGlzLnZpZXdRdWVyaWVzKSB7XG4gICAgICAvLyBlLmcuIHIzLlEoMCwgc29tZVByZWRpY2F0ZSwgdHJ1ZSk7XG4gICAgICBjb25zdCBxdWVyeVNsb3QgPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICAgIGNvbnN0IHByZWRpY2F0ZSA9IGdldFF1ZXJ5UHJlZGljYXRlKHF1ZXJ5LCB0aGlzLm91dHB1dEN0eCk7XG4gICAgICBjb25zdCBhcmdzID0gW1xuICAgICAgICAvKiBtZW1vcnlJbmRleCAqLyBvLmxpdGVyYWwocXVlcnlTbG90LCBvLklORkVSUkVEX1RZUEUpLFxuICAgICAgICAvKiBwcmVkaWNhdGUgKi8gcHJlZGljYXRlLFxuICAgICAgICAvKiBkZXNjZW5kICovIG8ubGl0ZXJhbChxdWVyeS5kZXNjZW5kYW50cywgby5JTkZFUlJFRF9UWVBFKVxuICAgICAgXTtcblxuICAgICAgaWYgKHF1ZXJ5LnJlYWQpIHtcbiAgICAgICAgYXJncy5wdXNoKHRoaXMub3V0cHV0Q3R4LmltcG9ydEV4cHIocXVlcnkucmVhZC5pZGVudGlmaWVyICEucmVmZXJlbmNlKSk7XG4gICAgICB9XG4gICAgICB0aGlzLmluc3RydWN0aW9uKHRoaXMuX2NyZWF0aW9uTW9kZSwgbnVsbCwgUjMucXVlcnksIC4uLmFyZ3MpO1xuXG4gICAgICAvLyAocjMucVIodG1wID0gcjMuybVsZCgwKSkgJiYgKGN0eC5zb21lRGlyID0gdG1wKSk7XG4gICAgICBjb25zdCB0ZW1wb3JhcnkgPSB0aGlzLnRlbXAoKTtcbiAgICAgIGNvbnN0IGdldFF1ZXJ5TGlzdCA9IG8uaW1wb3J0RXhwcihSMy5sb2FkKS5jYWxsRm4oW28ubGl0ZXJhbChxdWVyeVNsb3QpXSk7XG4gICAgICBjb25zdCByZWZyZXNoID0gby5pbXBvcnRFeHByKFIzLnF1ZXJ5UmVmcmVzaCkuY2FsbEZuKFt0ZW1wb3Jhcnkuc2V0KGdldFF1ZXJ5TGlzdCldKTtcbiAgICAgIGNvbnN0IHVwZGF0ZURpcmVjdGl2ZSA9IG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKHF1ZXJ5LnByb3BlcnR5TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KHF1ZXJ5LmZpcnN0ID8gdGVtcG9yYXJ5LnByb3AoJ2ZpcnN0JykgOiB0ZW1wb3JhcnkpO1xuICAgICAgdGhpcy5fYmluZGluZ01vZGUucHVzaChyZWZyZXNoLmFuZCh1cGRhdGVEaXJlY3RpdmUpLnRvU3RtdCgpKTtcbiAgICB9XG5cbiAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIG5vZGVzKTtcblxuICAgIGNvbnN0IGNyZWF0aW9uTW9kZSA9IHRoaXMuX2NyZWF0aW9uTW9kZS5sZW5ndGggPiAwID9cbiAgICAgICAgW28uaWZTdG10KFxuICAgICAgICAgICAgby52YXJpYWJsZShSRU5ERVJfRkxBR1MpLmJpdHdpc2VBbmQoby5saXRlcmFsKFJlbmRlckZsYWdzLkNyZWF0ZSksIG51bGwsIGZhbHNlKSxcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZSldIDpcbiAgICAgICAgW107XG5cbiAgICBjb25zdCB1cGRhdGVNb2RlID0gdGhpcy5fYmluZGluZ01vZGUubGVuZ3RoID4gMCA/XG4gICAgICAgIFtvLmlmU3RtdChcbiAgICAgICAgICAgIG8udmFyaWFibGUoUkVOREVSX0ZMQUdTKS5iaXR3aXNlQW5kKG8ubGl0ZXJhbChSZW5kZXJGbGFncy5VcGRhdGUpLCBudWxsLCBmYWxzZSksXG4gICAgICAgICAgICB0aGlzLl9iaW5kaW5nTW9kZSldIDpcbiAgICAgICAgW107XG5cbiAgICAvLyBHZW5lcmF0ZSBtYXBzIG9mIHBsYWNlaG9sZGVyIG5hbWUgdG8gbm9kZSBpbmRleGVzXG4gICAgLy8gVE9ETyh2aWNiKTogVGhpcyBpcyBhIFdJUCwgbm90IGZ1bGx5IHN1cHBvcnRlZCB5ZXRcbiAgICBmb3IgKGNvbnN0IHBoVG9Ob2RlSWR4IG9mIHRoaXMuX3BoVG9Ob2RlSWR4ZXMpIHtcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwaFRvTm9kZUlkeCkubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBzY29wZWROYW1lID0gdGhpcy5iaW5kaW5nU2NvcGUuZnJlc2hSZWZlcmVuY2VOYW1lKCk7XG4gICAgICAgIGNvbnN0IHBoTWFwID0gby52YXJpYWJsZShzY29wZWROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KG1hcFRvRXhwcmVzc2lvbihwaFRvTm9kZUlkeCwgdHJ1ZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSk7XG5cbiAgICAgICAgdGhpcy5fcHJlZml4LnB1c2gocGhNYXApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvLmZuKFxuICAgICAgICBbbmV3IG8uRm5QYXJhbShSRU5ERVJfRkxBR1MsIG8uTlVNQkVSX1RZUEUpLCBuZXcgby5GblBhcmFtKHRoaXMuY29udGV4dFBhcmFtZXRlciwgbnVsbCldLFxuICAgICAgICBbXG4gICAgICAgICAgLy8gVGVtcG9yYXJ5IHZhcmlhYmxlIGRlY2xhcmF0aW9ucyBmb3IgcXVlcnkgcmVmcmVzaCAoaS5lLiBsZXQgX3Q6IGFueTspXG4gICAgICAgICAgLi4udGhpcy5fcHJlZml4LFxuICAgICAgICAgIC8vIENyZWF0aW5nIG1vZGUgKGkuZS4gaWYgKHJmICYgUmVuZGVyRmxhZ3MuQ3JlYXRlKSB7IC4uLiB9KVxuICAgICAgICAgIC4uLmNyZWF0aW9uTW9kZSxcbiAgICAgICAgICAvLyBUZW1wb3JhcnkgdmFyaWFibGUgZGVjbGFyYXRpb25zIGZvciBsb2NhbCByZWZzIChpLmUuIGNvbnN0IHRtcCA9IGxkKDEpIGFzIGFueSlcbiAgICAgICAgICAuLi50aGlzLl92YXJpYWJsZU1vZGUsXG4gICAgICAgICAgLy8gQmluZGluZyBhbmQgcmVmcmVzaCBtb2RlIChpLmUuIGlmIChyZiAmIFJlbmRlckZsYWdzLlVwZGF0ZSkgey4uLn0pXG4gICAgICAgICAgLi4udXBkYXRlTW9kZSxcbiAgICAgICAgICAvLyBOZXN0ZWQgdGVtcGxhdGVzIChpLmUuIGZ1bmN0aW9uIENvbXBUZW1wbGF0ZSgpIHt9KVxuICAgICAgICAgIC4uLnRoaXMuX3Bvc3RmaXhcbiAgICAgICAgXSxcbiAgICAgICAgby5JTkZFUlJFRF9UWVBFLCBudWxsLCB0aGlzLnRlbXBsYXRlTmFtZSk7XG4gIH1cblxuICAvLyBMb2NhbFJlc29sdmVyXG4gIGdldExvY2FsKG5hbWU6IHN0cmluZyk6IG8uRXhwcmVzc2lvbnxudWxsIHsgcmV0dXJuIHRoaXMuYmluZGluZ1Njb3BlLmdldChuYW1lKTsgfVxuXG4gIC8vIFRlbXBsYXRlQXN0VmlzaXRvclxuICB2aXNpdE5nQ29udGVudChuZ0NvbnRlbnQ6IE5nQ29udGVudEFzdCkge1xuICAgIGNvbnN0IGluZm8gPSB0aGlzLl9jb250ZW50UHJvamVjdGlvbnMuZ2V0KG5nQ29udGVudCkgITtcbiAgICBpbmZvIHx8XG4gICAgICAgIGVycm9yKGBFeHBlY3RlZCAke25nQ29udGVudC5zb3VyY2VTcGFufSB0byBiZSBpbmNsdWRlZCBpbiBjb250ZW50IHByb2plY3Rpb24gY29sbGVjdGlvbmApO1xuICAgIGNvbnN0IHNsb3QgPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gW28ubGl0ZXJhbChzbG90KSwgby5saXRlcmFsKHRoaXMuX3Byb2plY3Rpb25EZWZpbml0aW9uSW5kZXgpXTtcbiAgICBpZiAoaW5mby5pbmRleCAhPT0gMCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8ubGl0ZXJhbChpbmZvLmluZGV4KSk7XG4gICAgfVxuICAgIHRoaXMuaW5zdHJ1Y3Rpb24odGhpcy5fY3JlYXRpb25Nb2RlLCBuZ0NvbnRlbnQuc291cmNlU3BhbiwgUjMucHJvamVjdGlvbiwgLi4ucGFyYW1ldGVycyk7XG4gIH1cblxuICAvLyBUZW1wbGF0ZUFzdFZpc2l0b3JcbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnRBc3QpIHtcbiAgICBjb25zdCBlbGVtZW50SW5kZXggPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICBjb25zdCByZWZlcmVuY2VEYXRhU2xvdHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICAgIGNvbnN0IHdhc0luSTE4blNlY3Rpb24gPSB0aGlzLl9pbkkxOG5TZWN0aW9uO1xuXG4gICAgY29uc3Qgb3V0cHV0QXR0cnM6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGNvbnN0IGF0dHJJMThuTWV0YXM6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGxldCBpMThuTWV0YTogc3RyaW5nID0gJyc7XG5cbiAgICAvLyBFbGVtZW50cyBpbnNpZGUgaTE4biBzZWN0aW9ucyBhcmUgcmVwbGFjZWQgd2l0aCBwbGFjZWhvbGRlcnNcbiAgICAvLyBUT0RPKHZpY2IpOiBuZXN0ZWQgZWxlbWVudHMgYXJlIGEgV0lQIGluIHRoaXMgcGhhc2VcbiAgICBpZiAodGhpcy5faW5JMThuU2VjdGlvbikge1xuICAgICAgY29uc3QgcGhOYW1lID0gZWxlbWVudC5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIXRoaXMuX3BoVG9Ob2RlSWR4ZXNbdGhpcy5faTE4blNlY3Rpb25JbmRleF1bcGhOYW1lXSkge1xuICAgICAgICB0aGlzLl9waFRvTm9kZUlkeGVzW3RoaXMuX2kxOG5TZWN0aW9uSW5kZXhdW3BoTmFtZV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BoVG9Ob2RlSWR4ZXNbdGhpcy5faTE4blNlY3Rpb25JbmRleF1bcGhOYW1lXS5wdXNoKGVsZW1lbnRJbmRleCk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGkxOG4gYXR0cmlidXRlc1xuICAgIGZvciAoY29uc3QgYXR0ciBvZiBlbGVtZW50LmF0dHJzKSB7XG4gICAgICBjb25zdCBuYW1lID0gYXR0ci5uYW1lO1xuICAgICAgY29uc3QgdmFsdWUgPSBhdHRyLnZhbHVlO1xuICAgICAgaWYgKG5hbWUgPT09IEkxOE5fQVRUUikge1xuICAgICAgICBpZiAodGhpcy5faW5JMThuU2VjdGlvbikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYENvdWxkIG5vdCBtYXJrIGFuIGVsZW1lbnQgYXMgdHJhbnNsYXRhYmxlIGluc2lkZSBvZiBhIHRyYW5zbGF0YWJsZSBzZWN0aW9uYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW5JMThuU2VjdGlvbiA9IHRydWU7XG4gICAgICAgIHRoaXMuX2kxOG5TZWN0aW9uSW5kZXgrKztcbiAgICAgICAgdGhpcy5fcGhUb05vZGVJZHhlc1t0aGlzLl9pMThuU2VjdGlvbkluZGV4XSA9IHt9O1xuICAgICAgICBpMThuTWV0YSA9IHZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgoSTE4Tl9BVFRSX1BSRUZJWCkpIHtcbiAgICAgICAgYXR0ckkxOG5NZXRhc1tuYW1lLnNsaWNlKEkxOE5fQVRUUl9QUkVGSVgubGVuZ3RoKV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dEF0dHJzW25hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRWxlbWVudCBjcmVhdGlvbiBtb2RlXG4gICAgY29uc3QgcGFyYW1ldGVyczogby5FeHByZXNzaW9uW10gPSBbXG4gICAgICBvLmxpdGVyYWwoZWxlbWVudEluZGV4KSxcbiAgICAgIG8ubGl0ZXJhbChlbGVtZW50Lm5hbWUpLFxuICAgIF07XG5cbiAgICBlbGVtZW50LmRpcmVjdGl2ZXMuZm9yRWFjaChcbiAgICAgICAgZGlyZWN0aXZlID0+IHRoaXMuZGlyZWN0aXZlcy5hZGQoZGlyZWN0aXZlLmRpcmVjdGl2ZS50eXBlLnJlZmVyZW5jZSkpO1xuXG4gICAgLy8gQWRkIHRoZSBhdHRyaWJ1dGVzXG4gICAgY29uc3QgaTE4bk1lc3NhZ2VzOiBvLlN0YXRlbWVudFtdID0gW107XG4gICAgY29uc3QgYXR0cmlidXRlczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBsZXQgaGFzSTE4bkF0dHIgPSBmYWxzZTtcblxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG91dHB1dEF0dHJzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBvdXRwdXRBdHRyc1tuYW1lXTtcbiAgICAgIGF0dHJpYnV0ZXMucHVzaChvLmxpdGVyYWwobmFtZSkpO1xuICAgICAgaWYgKGF0dHJJMThuTWV0YXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgaGFzSTE4bkF0dHIgPSB0cnVlO1xuICAgICAgICBjb25zdCBtZXRhID0gcGFyc2VJMThuTWV0YShhdHRySTE4bk1ldGFzW25hbWVdKTtcbiAgICAgICAgY29uc3QgdmFyaWFibGUgPSB0aGlzLmNvbnN0YW50UG9vbC5nZXRUcmFuc2xhdGlvbih2YWx1ZSwgbWV0YSk7XG4gICAgICAgIGF0dHJpYnV0ZXMucHVzaCh2YXJpYWJsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyaWJ1dGVzLnB1c2goby5saXRlcmFsKHZhbHVlKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgYXR0ckFyZzogby5FeHByZXNzaW9uID0gby5UWVBFRF9OVUxMX0VYUFI7XG5cbiAgICBpZiAoYXR0cmlidXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICBhdHRyQXJnID0gaGFzSTE4bkF0dHIgPyBnZXRMaXRlcmFsRmFjdG9yeSh0aGlzLm91dHB1dEN0eCwgby5saXRlcmFsQXJyKGF0dHJpYnV0ZXMpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwoby5saXRlcmFsQXJyKGF0dHJpYnV0ZXMpLCB0cnVlKTtcbiAgICB9XG5cbiAgICBwYXJhbWV0ZXJzLnB1c2goYXR0ckFyZyk7XG5cbiAgICBpZiAoZWxlbWVudC5yZWZlcmVuY2VzICYmIGVsZW1lbnQucmVmZXJlbmNlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCByZWZlcmVuY2VzID1cbiAgICAgICAgICBmbGF0dGVuKGVsZW1lbnQucmVmZXJlbmNlcy5tYXAocmVmZXJlbmNlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICAgICAgICAgIHJlZmVyZW5jZURhdGFTbG90cy5zZXQocmVmZXJlbmNlLm5hbWUsIHNsb3QpO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgdGhlIHVwZGF0ZSB0ZW1wb3JhcnkuXG4gICAgICAgICAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSB0aGlzLmJpbmRpbmdTY29wZS5mcmVzaFJlZmVyZW5jZU5hbWUoKTtcbiAgICAgICAgICAgIHRoaXMuX3ZhcmlhYmxlTW9kZS5wdXNoKG8udmFyaWFibGUodmFyaWFibGVOYW1lLCBvLklORkVSUkVEX1RZUEUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoUjMubG9hZCkuY2FsbEZuKFtvLmxpdGVyYWwoc2xvdCldKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChvLklORkVSUkVEX1RZUEUsIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pKTtcbiAgICAgICAgICAgIHRoaXMuYmluZGluZ1Njb3BlLnNldChyZWZlcmVuY2UubmFtZSwgby52YXJpYWJsZSh2YXJpYWJsZU5hbWUpKTtcbiAgICAgICAgICAgIHJldHVybiBbcmVmZXJlbmNlLm5hbWUsIHJlZmVyZW5jZS5vcmlnaW5hbFZhbHVlXTtcbiAgICAgICAgICB9KSkubWFwKHZhbHVlID0+IG8ubGl0ZXJhbCh2YWx1ZSkpO1xuICAgICAgcGFyYW1ldGVycy5wdXNoKFxuICAgICAgICAgIHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWxBcnIocmVmZXJlbmNlcyksIC8qIGZvcmNlU2hhcmVkICovIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8uVFlQRURfTlVMTF9FWFBSKTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSB0aGUgaW5zdHJ1Y3Rpb24gY3JlYXRlIGVsZW1lbnQgaW5zdHJ1Y3Rpb25cbiAgICBpZiAoaTE4bk1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZS5wdXNoKC4uLmkxOG5NZXNzYWdlcyk7XG4gICAgfVxuICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZSwgZWxlbWVudC5zb3VyY2VTcGFuLCBSMy5jcmVhdGVFbGVtZW50LCAuLi50cmltVHJhaWxpbmdOdWxscyhwYXJhbWV0ZXJzKSk7XG5cbiAgICBjb25zdCBpbXBsaWNpdCA9IG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKTtcblxuICAgIC8vIEdlbmVyYXRlIExpc3RlbmVycyAob3V0cHV0cylcbiAgICBlbGVtZW50Lm91dHB1dHMuZm9yRWFjaCgob3V0cHV0QXN0OiBCb3VuZEV2ZW50QXN0KSA9PiB7XG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBgJHt0aGlzLnRlbXBsYXRlTmFtZX1fJHtlbGVtZW50Lm5hbWV9XyR7b3V0cHV0QXN0Lm5hbWV9X2xpc3RlbmVyYDtcbiAgICAgIGNvbnN0IGxvY2FsVmFyczogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgICAgY29uc3QgYmluZGluZ1Njb3BlID1cbiAgICAgICAgICB0aGlzLmJpbmRpbmdTY29wZS5uZXN0ZWRTY29wZSgobGhzVmFyOiBvLlJlYWRWYXJFeHByLCByaHNFeHByZXNzaW9uOiBvLkV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICAgIGxvY2FsVmFycy5wdXNoKFxuICAgICAgICAgICAgICAgIGxoc1Zhci5zZXQocmhzRXhwcmVzc2lvbikudG9EZWNsU3RtdChvLklORkVSUkVEX1RZUEUsIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pKTtcbiAgICAgICAgICB9KTtcbiAgICAgIGNvbnN0IGJpbmRpbmdFeHByID0gY29udmVydEFjdGlvbkJpbmRpbmcoXG4gICAgICAgICAgYmluZGluZ1Njb3BlLCBvLnZhcmlhYmxlKENPTlRFWFRfTkFNRSksIG91dHB1dEFzdC5oYW5kbGVyLCAnYicsXG4gICAgICAgICAgKCkgPT4gZXJyb3IoJ1VuZXhwZWN0ZWQgaW50ZXJwb2xhdGlvbicpKTtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBvLmZuKFxuICAgICAgICAgIFtuZXcgby5GblBhcmFtKCckZXZlbnQnLCBvLkRZTkFNSUNfVFlQRSldLCBbLi4ubG9jYWxWYXJzLCAuLi5iaW5kaW5nRXhwci5yZW5kZXIzU3RtdHNdLFxuICAgICAgICAgIG8uSU5GRVJSRURfVFlQRSwgbnVsbCwgZnVuY3Rpb25OYW1lKTtcbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgdGhpcy5fY3JlYXRpb25Nb2RlLCBvdXRwdXRBc3Quc291cmNlU3BhbiwgUjMubGlzdGVuZXIsIG8ubGl0ZXJhbChvdXRwdXRBc3QubmFtZSksXG4gICAgICAgICAgaGFuZGxlcik7XG4gICAgfSk7XG5cblxuICAgIC8vIEdlbmVyYXRlIGVsZW1lbnQgaW5wdXQgYmluZGluZ3NcbiAgICBmb3IgKGxldCBpbnB1dCBvZiBlbGVtZW50LmlucHV0cykge1xuICAgICAgaWYgKGlucHV0LmlzQW5pbWF0aW9uKSB7XG4gICAgICAgIHRoaXMudW5zdXBwb3J0ZWQoJ2FuaW1hdGlvbnMnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbnZlcnRlZEJpbmRpbmcgPSB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoaW1wbGljaXQsIGlucHV0LnZhbHVlKTtcbiAgICAgIGNvbnN0IGluc3RydWN0aW9uID0gQklORElOR19JTlNUUlVDVElPTl9NQVBbaW5wdXQudHlwZV07XG4gICAgICBpZiAoaW5zdHJ1Y3Rpb24pIHtcbiAgICAgICAgLy8gVE9ETyhjaHVja2opOiBydW50aW1lOiBzZWN1cml0eSBjb250ZXh0P1xuICAgICAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICAgICAgdGhpcy5fYmluZGluZ01vZGUsIGlucHV0LnNvdXJjZVNwYW4sIGluc3RydWN0aW9uLCBvLmxpdGVyYWwoZWxlbWVudEluZGV4KSxcbiAgICAgICAgICAgIG8ubGl0ZXJhbChpbnB1dC5uYW1lKSwgY29udmVydGVkQmluZGluZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVuc3VwcG9ydGVkKGBiaW5kaW5nICR7UHJvcGVydHlCaW5kaW5nVHlwZVtpbnB1dC50eXBlXX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSBkaXJlY3RpdmVzIGlucHV0IGJpbmRpbmdzXG4gICAgdGhpcy5fdmlzaXREaXJlY3RpdmVzKGVsZW1lbnQuZGlyZWN0aXZlcywgaW1wbGljaXQsIGVsZW1lbnRJbmRleCk7XG5cbiAgICAvLyBUcmF2ZXJzZSBlbGVtZW50IGNoaWxkIG5vZGVzXG4gICAgaWYgKHRoaXMuX2luSTE4blNlY3Rpb24gJiYgZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT0gMSAmJlxuICAgICAgICBlbGVtZW50LmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgVGV4dEFzdCkge1xuICAgICAgY29uc3QgdGV4dCA9IGVsZW1lbnQuY2hpbGRyZW5bMF0gYXMgVGV4dEFzdDtcbiAgICAgIHRoaXMudmlzaXRTaW5nbGVJMThuVGV4dENoaWxkKHRleHQsIGkxOG5NZXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGVtcGxhdGVWaXNpdEFsbCh0aGlzLCBlbGVtZW50LmNoaWxkcmVuKTtcbiAgICB9XG5cbiAgICAvLyBGaW5pc2ggZWxlbWVudCBjb25zdHJ1Y3Rpb24gbW9kZS5cbiAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLl9jcmVhdGlvbk1vZGUsIGVsZW1lbnQuZW5kU291cmNlU3BhbiB8fCBlbGVtZW50LnNvdXJjZVNwYW4sIFIzLmVsZW1lbnRFbmQpO1xuXG4gICAgLy8gUmVzdG9yZSB0aGUgc3RhdGUgYmVmb3JlIGV4aXRpbmcgdGhpcyBub2RlXG4gICAgdGhpcy5faW5JMThuU2VjdGlvbiA9IHdhc0luSTE4blNlY3Rpb247XG4gIH1cblxuICBwcml2YXRlIF92aXNpdERpcmVjdGl2ZXMoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sIGltcGxpY2l0OiBvLkV4cHJlc3Npb24sIG5vZGVJbmRleDogbnVtYmVyKSB7XG4gICAgZm9yIChsZXQgZGlyZWN0aXZlIG9mIGRpcmVjdGl2ZXMpIHtcbiAgICAgIC8vIENyZWF0aW9uIG1vZGVcbiAgICAgIC8vIGUuZy4gRCgwLCBUb2RvQ29tcG9uZW50RGVmLm4oKSwgVG9kb0NvbXBvbmVudERlZik7XG4gICAgICBjb25zdCBkaXJlY3RpdmVUeXBlID0gZGlyZWN0aXZlLmRpcmVjdGl2ZS50eXBlLnJlZmVyZW5jZTtcbiAgICAgIGNvbnN0IGtpbmQgPVxuICAgICAgICAgIGRpcmVjdGl2ZS5kaXJlY3RpdmUuaXNDb21wb25lbnQgPyBEZWZpbml0aW9uS2luZC5Db21wb25lbnQgOiBEZWZpbml0aW9uS2luZC5EaXJlY3RpdmU7XG5cbiAgICAgIC8vIE5vdGU6ICpkbyBub3QgY2FjaGUqIGNhbGxzIHRvIHRoaXMuZGlyZWN0aXZlT2YoKSBhcyB0aGUgY29uc3RhbnQgcG9vbCBuZWVkcyB0byBrbm93IGlmIHRoZVxuICAgICAgLy8gbm9kZSBpcyByZWZlcmVuY2VkIG11bHRpcGxlIHRpbWVzIHRvIGtub3cgdGhhdCBpdCBtdXN0IGdlbmVyYXRlIHRoZSByZWZlcmVuY2UgaW50byBhXG4gICAgICAvLyB0ZW1wb3JhcnkuXG5cbiAgICAgIC8vIEJpbmRpbmdzXG4gICAgICBmb3IgKGNvbnN0IGlucHV0IG9mIGRpcmVjdGl2ZS5pbnB1dHMpIHtcbiAgICAgICAgY29uc3QgY29udmVydGVkQmluZGluZyA9IHRoaXMuY29udmVydFByb3BlcnR5QmluZGluZyhpbXBsaWNpdCwgaW5wdXQudmFsdWUpO1xuICAgICAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICAgICAgdGhpcy5fYmluZGluZ01vZGUsIGRpcmVjdGl2ZS5zb3VyY2VTcGFuLCBSMy5lbGVtZW50UHJvcGVydHksIG8ubGl0ZXJhbChub2RlSW5kZXgpLFxuICAgICAgICAgICAgby5saXRlcmFsKGlucHV0LnRlbXBsYXRlTmFtZSksIG8uaW1wb3J0RXhwcihSMy5iaW5kKS5jYWxsRm4oW2NvbnZlcnRlZEJpbmRpbmddKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVGVtcGxhdGVBc3RWaXNpdG9yXG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZSh0ZW1wbGF0ZTogRW1iZWRkZWRUZW1wbGF0ZUFzdCkge1xuICAgIGNvbnN0IHRlbXBsYXRlSW5kZXggPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcblxuICAgIGNvbnN0IHRlbXBsYXRlUmVmID0gdGhpcy5yZWZsZWN0b3IucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKElkZW50aWZpZXJzLlRlbXBsYXRlUmVmKTtcbiAgICBjb25zdCB0ZW1wbGF0ZURpcmVjdGl2ZSA9IHRlbXBsYXRlLmRpcmVjdGl2ZXMuZmluZChcbiAgICAgICAgZGlyZWN0aXZlID0+IGRpcmVjdGl2ZS5kaXJlY3RpdmUudHlwZS5kaURlcHMuc29tZShcbiAgICAgICAgICAgIGRlcGVuZGVuY3kgPT5cbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5LnRva2VuICE9IG51bGwgJiYgKHRva2VuUmVmZXJlbmNlKGRlcGVuZGVuY3kudG9rZW4pID09IHRlbXBsYXRlUmVmKSkpO1xuICAgIGNvbnN0IGNvbnRleHROYW1lID1cbiAgICAgICAgdGhpcy5jb250ZXh0TmFtZSAmJiB0ZW1wbGF0ZURpcmVjdGl2ZSAmJiB0ZW1wbGF0ZURpcmVjdGl2ZS5kaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UubmFtZSA/XG4gICAgICAgIGAke3RoaXMuY29udGV4dE5hbWV9XyR7dGVtcGxhdGVEaXJlY3RpdmUuZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlLm5hbWV9YCA6XG4gICAgICAgIG51bGw7XG4gICAgY29uc3QgdGVtcGxhdGVOYW1lID1cbiAgICAgICAgY29udGV4dE5hbWUgPyBgJHtjb250ZXh0TmFtZX1fVGVtcGxhdGVfJHt0ZW1wbGF0ZUluZGV4fWAgOiBgVGVtcGxhdGVfJHt0ZW1wbGF0ZUluZGV4fWA7XG4gICAgY29uc3QgdGVtcGxhdGVDb250ZXh0ID0gYGN0eCR7dGhpcy5sZXZlbH1gO1xuXG4gICAgY29uc3QgcGFyYW1ldGVyczogby5FeHByZXNzaW9uW10gPSBbby52YXJpYWJsZSh0ZW1wbGF0ZU5hbWUpLCBvLmxpdGVyYWwobnVsbCwgby5JTkZFUlJFRF9UWVBFKV07XG4gICAgY29uc3QgYXR0cmlidXRlTmFtZXM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgdGVtcGxhdGUuZGlyZWN0aXZlcy5mb3JFYWNoKChkaXJlY3RpdmVBc3Q6IERpcmVjdGl2ZUFzdCkgPT4ge1xuICAgICAgdGhpcy5kaXJlY3RpdmVzLmFkZChkaXJlY3RpdmVBc3QuZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlKTtcbiAgICAgIENzc1NlbGVjdG9yLnBhcnNlKGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUuc2VsZWN0b3IgISkuZm9yRWFjaChzZWxlY3RvciA9PiB7XG4gICAgICAgIHNlbGVjdG9yLmF0dHJzLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgLy8gQ29udmVydCAnJyAoZmFsc3kpIHN0cmluZ3MgaW50byBgbnVsbGAuIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2Ugd2Ugd2FudFxuICAgICAgICAgIC8vIHRvIGNvbW11bmljYXRlIHRvIHJ1bnRpbWUgdGhhdCB0aGVzZSBhdHRyaWJ1dGVzIGFyZSBwcmVzZW50IGZvclxuICAgICAgICAgIC8vIHNlbGVjdG9yIG1hdGNoaW5nLCBidXQgc2hvdWxkIG5vdCBhY3R1YWxseSBiZSBhZGRlZCB0byB0aGUgRE9NLlxuICAgICAgICAgIC8vIGF0dHJpYnV0ZU5hbWVzLnB1c2goby5saXRlcmFsKHZhbHVlID8gdmFsdWUgOiBudWxsKSk7XG5cbiAgICAgICAgICAvLyBUT0RPKG1pc2tvKTogbWFrZSB0aGUgYWJvdmUgY29tbWVudCB0cnVlLCBmb3Igbm93IGp1c3Qgd3JpdGUgdG8gRE9NIGJlY2F1c2VcbiAgICAgICAgICAvLyB0aGUgcnVudGltZSBzZWxlY3RvcnMgaGF2ZSBub3QgYmVlbiB1cGRhdGVkLlxuICAgICAgICAgIGF0dHJpYnV0ZU5hbWVzLnB1c2goby5saXRlcmFsKHZhbHVlKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYgKGF0dHJpYnV0ZU5hbWVzLmxlbmd0aCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKFxuICAgICAgICAgIHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWxBcnIoYXR0cmlidXRlTmFtZXMpLCAvKiBmb3JjZWRTaGFyZWQgKi8gdHJ1ZSkpO1xuICAgIH1cblxuICAgIC8vIGUuZy4gQygxLCBDMVRlbXBsYXRlKVxuICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZSwgdGVtcGxhdGUuc291cmNlU3BhbiwgUjMuY29udGFpbmVyQ3JlYXRlLCBvLmxpdGVyYWwodGVtcGxhdGVJbmRleCksXG4gICAgICAgIC4uLnRyaW1UcmFpbGluZ051bGxzKHBhcmFtZXRlcnMpKTtcblxuICAgIC8vIEdlbmVyYXRlIGRpcmVjdGl2ZXNcbiAgICB0aGlzLl92aXNpdERpcmVjdGl2ZXModGVtcGxhdGUuZGlyZWN0aXZlcywgby52YXJpYWJsZShDT05URVhUX05BTUUpLCB0ZW1wbGF0ZUluZGV4KTtcblxuICAgIC8vIENyZWF0ZSB0aGUgdGVtcGxhdGUgZnVuY3Rpb25cbiAgICBjb25zdCB0ZW1wbGF0ZVZpc2l0b3IgPSBuZXcgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcihcbiAgICAgICAgdGhpcy5vdXRwdXRDdHgsIHRoaXMuY29uc3RhbnRQb29sLCB0aGlzLnJlZmxlY3RvciwgdGVtcGxhdGVDb250ZXh0LCB0aGlzLmJpbmRpbmdTY29wZSxcbiAgICAgICAgdGhpcy5sZXZlbCArIDEsIHRoaXMubmdDb250ZW50U2VsZWN0b3JzLCBjb250ZXh0TmFtZSwgdGVtcGxhdGVOYW1lLCB0aGlzLnBpcGVNYXAsIFtdLFxuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMsIHRoaXMucGlwZXMpO1xuICAgIGNvbnN0IHRlbXBsYXRlRnVuY3Rpb25FeHByID1cbiAgICAgICAgdGVtcGxhdGVWaXNpdG9yLmJ1aWxkVGVtcGxhdGVGdW5jdGlvbih0ZW1wbGF0ZS5jaGlsZHJlbiwgdGVtcGxhdGUudmFyaWFibGVzKTtcbiAgICB0aGlzLl9wb3N0Zml4LnB1c2godGVtcGxhdGVGdW5jdGlvbkV4cHIudG9EZWNsU3RtdCh0ZW1wbGF0ZU5hbWUsIG51bGwpKTtcbiAgfVxuXG4gIC8vIFRoZXNlIHNob3VsZCBiZSBoYW5kbGVkIGluIHRoZSB0ZW1wbGF0ZSBvciBlbGVtZW50IGRpcmVjdGx5LlxuICByZWFkb25seSB2aXNpdFJlZmVyZW5jZSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0VmFyaWFibGUgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdEV2ZW50ID0gaW52YWxpZDtcbiAgcmVhZG9ubHkgdmlzaXRFbGVtZW50UHJvcGVydHkgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdEF0dHIgPSBpbnZhbGlkO1xuXG4gIC8vIFRlbXBsYXRlQXN0VmlzaXRvclxuICB2aXNpdEJvdW5kVGV4dCh0ZXh0OiBCb3VuZFRleHRBc3QpIHtcbiAgICBjb25zdCBub2RlSW5kZXggPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcblxuICAgIC8vIENyZWF0aW9uIG1vZGVcbiAgICB0aGlzLmluc3RydWN0aW9uKHRoaXMuX2NyZWF0aW9uTW9kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBvLmxpdGVyYWwobm9kZUluZGV4KSk7XG5cbiAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLl9iaW5kaW5nTW9kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0Q3JlYXRlQm91bmQsIG8ubGl0ZXJhbChub2RlSW5kZXgpLFxuICAgICAgICB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoby52YXJpYWJsZShDT05URVhUX05BTUUpLCB0ZXh0LnZhbHVlKSk7XG4gIH1cblxuICAvLyBUZW1wbGF0ZUFzdFZpc2l0b3JcbiAgdmlzaXRUZXh0KHRleHQ6IFRleHRBc3QpIHtcbiAgICAvLyBUZXh0IGlzIGRlZmluZWQgaW4gY3JlYXRpb24gbW9kZSBvbmx5LlxuICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBvLmxpdGVyYWwodGhpcy5hbGxvY2F0ZURhdGFTbG90KCkpLFxuICAgICAgICBvLmxpdGVyYWwodGV4dC52YWx1ZSkpO1xuICB9XG5cbiAgLy8gV2hlbiB0aGUgY29udGVudCBvZiB0aGUgZWxlbWVudCBpcyBhIHNpbmdsZSB0ZXh0IG5vZGUgdGhlIHRyYW5zbGF0aW9uIGNhbiBiZSBpbmxpbmVkOlxuICAvL1xuICAvLyBgPHAgaTE4bj1cImRlc2N8bWVhblwiPnNvbWUgY29udGVudDwvcD5gXG4gIC8vIGNvbXBpbGVzIHRvXG4gIC8vIGBgYFxuICAvLyAvKipcbiAgLy8gKiBAZGVzYyBkZXNjXG4gIC8vICogQG1lYW5pbmcgbWVhblxuICAvLyAqL1xuICAvLyBjb25zdCBNU0dfWFlaID0gZ29vZy5nZXRNc2coJ3NvbWUgY29udGVudCcpO1xuICAvLyBpMC7JtVQoMSwgTVNHX1hZWik7XG4gIC8vIGBgYFxuICB2aXNpdFNpbmdsZUkxOG5UZXh0Q2hpbGQodGV4dDogVGV4dEFzdCwgaTE4bk1ldGE6IHN0cmluZykge1xuICAgIGNvbnN0IG1ldGEgPSBwYXJzZUkxOG5NZXRhKGkxOG5NZXRhKTtcbiAgICBjb25zdCB2YXJpYWJsZSA9IHRoaXMuY29uc3RhbnRQb29sLmdldFRyYW5zbGF0aW9uKHRleHQudmFsdWUsIG1ldGEpO1xuICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBvLmxpdGVyYWwodGhpcy5hbGxvY2F0ZURhdGFTbG90KCkpLCB2YXJpYWJsZSk7XG4gIH1cblxuICAvLyBUaGVzZSBzaG91bGQgYmUgaGFuZGxlZCBpbiB0aGUgdGVtcGxhdGUgb3IgZWxlbWVudCBkaXJlY3RseVxuICByZWFkb25seSB2aXNpdERpcmVjdGl2ZSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0RGlyZWN0aXZlUHJvcGVydHkgPSBpbnZhbGlkO1xuXG4gIHByaXZhdGUgYWxsb2NhdGVEYXRhU2xvdCgpIHsgcmV0dXJuIHRoaXMuX2RhdGFJbmRleCsrOyB9XG4gIHByaXZhdGUgYmluZGluZ0NvbnRleHQoKSB7IHJldHVybiBgJHt0aGlzLl9iaW5kaW5nQ29udGV4dCsrfWA7IH1cblxuICBwcml2YXRlIGluc3RydWN0aW9uKFxuICAgICAgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSwgc3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZSxcbiAgICAgIC4uLnBhcmFtczogby5FeHByZXNzaW9uW10pIHtcbiAgICBzdGF0ZW1lbnRzLnB1c2goby5pbXBvcnRFeHByKHJlZmVyZW5jZSwgbnVsbCwgc3BhbikuY2FsbEZuKHBhcmFtcywgc3BhbikudG9TdG10KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBkZWZpbml0aW9uT2YodHlwZTogYW55LCBraW5kOiBEZWZpbml0aW9uS2luZCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RhbnRQb29sLmdldERlZmluaXRpb24odHlwZSwga2luZCwgdGhpcy5vdXRwdXRDdHgpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wKCk6IG8uUmVhZFZhckV4cHIge1xuICAgIGlmICghdGhpcy5fdGVtcG9yYXJ5QWxsb2NhdGVkKSB7XG4gICAgICB0aGlzLl9wcmVmaXgucHVzaChuZXcgby5EZWNsYXJlVmFyU3RtdChURU1QT1JBUllfTkFNRSwgdW5kZWZpbmVkLCBvLkRZTkFNSUNfVFlQRSkpO1xuICAgICAgdGhpcy5fdGVtcG9yYXJ5QWxsb2NhdGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG8udmFyaWFibGUoVEVNUE9SQVJZX05BTUUpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKGltcGxpY2l0OiBvLkV4cHJlc3Npb24sIHZhbHVlOiBBU1QpOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IHBpcGVzQ29udmVydGVkVmFsdWUgPSB2YWx1ZS52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG4gICAgY29uc3QgY29udmVydGVkUHJvcGVydHlCaW5kaW5nID0gY29udmVydFByb3BlcnR5QmluZGluZyhcbiAgICAgICAgdGhpcywgaW1wbGljaXQsIHBpcGVzQ29udmVydGVkVmFsdWUsIHRoaXMuYmluZGluZ0NvbnRleHQoKSwgQmluZGluZ0Zvcm0uVHJ5U2ltcGxlLFxuICAgICAgICBpbnRlcnBvbGF0ZSk7XG4gICAgdGhpcy5fYmluZGluZ01vZGUucHVzaCguLi5jb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcuc3RtdHMpO1xuICAgIHJldHVybiBjb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcuY3VyclZhbEV4cHI7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UXVlcnlQcmVkaWNhdGUocXVlcnk6IENvbXBpbGVRdWVyeU1ldGFkYXRhLCBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQpOiBvLkV4cHJlc3Npb24ge1xuICBpZiAocXVlcnkuc2VsZWN0b3JzLmxlbmd0aCA+IDEgfHwgKHF1ZXJ5LnNlbGVjdG9ycy5sZW5ndGggPT0gMSAmJiBxdWVyeS5zZWxlY3RvcnNbMF0udmFsdWUpKSB7XG4gICAgY29uc3Qgc2VsZWN0b3JzID0gcXVlcnkuc2VsZWN0b3JzLm1hcCh2YWx1ZSA9PiB2YWx1ZS52YWx1ZSBhcyBzdHJpbmcpO1xuICAgIHNlbGVjdG9ycy5zb21lKHZhbHVlID0+ICF2YWx1ZSkgJiYgZXJyb3IoJ0ZvdW5kIGEgdHlwZSBhbW9uZyB0aGUgc3RyaW5nIHNlbGVjdG9ycyBleHBlY3RlZCcpO1xuICAgIHJldHVybiBvdXRwdXRDdHguY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChcbiAgICAgICAgby5saXRlcmFsQXJyKHNlbGVjdG9ycy5tYXAodmFsdWUgPT4gby5saXRlcmFsKHZhbHVlKSkpKTtcbiAgfVxuXG4gIGlmIChxdWVyeS5zZWxlY3RvcnMubGVuZ3RoID09IDEpIHtcbiAgICBjb25zdCBmaXJzdCA9IHF1ZXJ5LnNlbGVjdG9yc1swXTtcbiAgICBpZiAoZmlyc3QuaWRlbnRpZmllcikge1xuICAgICAgcmV0dXJuIG91dHB1dEN0eC5pbXBvcnRFeHByKGZpcnN0LmlkZW50aWZpZXIucmVmZXJlbmNlKTtcbiAgICB9XG4gIH1cblxuICBlcnJvcignVW5leHBlY3RlZCBxdWVyeSBmb3JtJyk7XG4gIHJldHVybiBvLk5VTExfRVhQUjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZhY3RvcnkoXG4gICAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSwgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCByZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsXG4gICAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSk6IG8uRXhwcmVzc2lvbiB7XG4gIGxldCBhcmdzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gIGNvbnN0IGVsZW1lbnRSZWYgPSByZWZsZWN0b3IucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKElkZW50aWZpZXJzLkVsZW1lbnRSZWYpO1xuICBjb25zdCB0ZW1wbGF0ZVJlZiA9IHJlZmxlY3Rvci5yZXNvbHZlRXh0ZXJuYWxSZWZlcmVuY2UoSWRlbnRpZmllcnMuVGVtcGxhdGVSZWYpO1xuICBjb25zdCB2aWV3Q29udGFpbmVyUmVmID0gcmVmbGVjdG9yLnJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShJZGVudGlmaWVycy5WaWV3Q29udGFpbmVyUmVmKTtcblxuICBmb3IgKGxldCBkZXBlbmRlbmN5IG9mIHR5cGUuZGlEZXBzKSB7XG4gICAgY29uc3QgdG9rZW4gPSBkZXBlbmRlbmN5LnRva2VuO1xuICAgIGlmICh0b2tlbikge1xuICAgICAgY29uc3QgdG9rZW5SZWYgPSB0b2tlblJlZmVyZW5jZSh0b2tlbik7XG4gICAgICBpZiAodG9rZW5SZWYgPT09IGVsZW1lbnRSZWYpIHtcbiAgICAgICAgYXJncy5wdXNoKG8uaW1wb3J0RXhwcihSMy5pbmplY3RFbGVtZW50UmVmKS5jYWxsRm4oW10pKTtcbiAgICAgIH0gZWxzZSBpZiAodG9rZW5SZWYgPT09IHRlbXBsYXRlUmVmKSB7XG4gICAgICAgIGFyZ3MucHVzaChvLmltcG9ydEV4cHIoUjMuaW5qZWN0VGVtcGxhdGVSZWYpLmNhbGxGbihbXSkpO1xuICAgICAgfSBlbHNlIGlmICh0b2tlblJlZiA9PT0gdmlld0NvbnRhaW5lclJlZikge1xuICAgICAgICBhcmdzLnB1c2goby5pbXBvcnRFeHByKFIzLmluamVjdFZpZXdDb250YWluZXJSZWYpLmNhbGxGbihbXSkpO1xuICAgICAgfSBlbHNlIGlmIChkZXBlbmRlbmN5LmlzQXR0cmlidXRlKSB7XG4gICAgICAgIGFyZ3MucHVzaChvLmltcG9ydEV4cHIoUjMuaW5qZWN0QXR0cmlidXRlKS5jYWxsRm4oW28ubGl0ZXJhbChkZXBlbmRlbmN5LnRva2VuICEudmFsdWUpXSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdG9rZW5WYWx1ZSA9XG4gICAgICAgICAgICB0b2tlbi5pZGVudGlmaWVyICE9IG51bGwgPyBvdXRwdXRDdHguaW1wb3J0RXhwcih0b2tlblJlZikgOiBvLmxpdGVyYWwodG9rZW5SZWYpO1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVJbmplY3RBcmdzID0gW3Rva2VuVmFsdWVdO1xuICAgICAgICBjb25zdCBmbGFncyA9IGV4dHJhY3RGbGFncyhkZXBlbmRlbmN5KTtcbiAgICAgICAgaWYgKGZsYWdzICE9IEluamVjdEZsYWdzLkRlZmF1bHQpIHtcbiAgICAgICAgICAvLyBBcHBlbmQgZmxhZyBpbmZvcm1hdGlvbiBpZiBvdGhlciB0aGFuIGRlZmF1bHQuXG4gICAgICAgICAgZGlyZWN0aXZlSW5qZWN0QXJncy5wdXNoKG8ubGl0ZXJhbChmbGFncykpO1xuICAgICAgICB9XG4gICAgICAgIGFyZ3MucHVzaChvLmltcG9ydEV4cHIoUjMuZGlyZWN0aXZlSW5qZWN0KS5jYWxsRm4oZGlyZWN0aXZlSW5qZWN0QXJncykpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB1bnN1cHBvcnRlZCgnZGVwZW5kZW5jeSB3aXRob3V0IGEgdG9rZW4nKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBxdWVyeURlZmluaXRpb25zOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICBmb3IgKGxldCBxdWVyeSBvZiBxdWVyaWVzKSB7XG4gICAgY29uc3QgcHJlZGljYXRlID0gZ2V0UXVlcnlQcmVkaWNhdGUocXVlcnksIG91dHB1dEN0eCk7XG5cbiAgICAvLyBlLmcuIHIzLlEobnVsbCwgc29tZVByZWRpY2F0ZSwgZmFsc2UpIG9yIHIzLlEobnVsbCwgWydkaXYnXSwgZmFsc2UpXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IFtcbiAgICAgIC8qIG1lbW9yeUluZGV4ICovIG8ubGl0ZXJhbChudWxsLCBvLklORkVSUkVEX1RZUEUpLFxuICAgICAgLyogcHJlZGljYXRlICovIHByZWRpY2F0ZSxcbiAgICAgIC8qIGRlc2NlbmQgKi8gby5saXRlcmFsKHF1ZXJ5LmRlc2NlbmRhbnRzKVxuICAgIF07XG5cbiAgICBpZiAocXVlcnkucmVhZCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG91dHB1dEN0eC5pbXBvcnRFeHByKHF1ZXJ5LnJlYWQuaWRlbnRpZmllciAhLnJlZmVyZW5jZSkpO1xuICAgIH1cblxuICAgIHF1ZXJ5RGVmaW5pdGlvbnMucHVzaChvLmltcG9ydEV4cHIoUjMucXVlcnkpLmNhbGxGbihwYXJhbWV0ZXJzKSk7XG4gIH1cblxuICBjb25zdCBjcmVhdGVJbnN0YW5jZSA9IG5ldyBvLkluc3RhbnRpYXRlRXhwcihvdXRwdXRDdHguaW1wb3J0RXhwcih0eXBlLnJlZmVyZW5jZSksIGFyZ3MpO1xuICBjb25zdCByZXN1bHQgPSBxdWVyeURlZmluaXRpb25zLmxlbmd0aCA+IDAgPyBvLmxpdGVyYWxBcnIoW2NyZWF0ZUluc3RhbmNlLCAuLi5xdWVyeURlZmluaXRpb25zXSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVJbnN0YW5jZTtcblxuICByZXR1cm4gby5mbihcbiAgICAgIFtdLCBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KHJlc3VsdCldLCBvLklORkVSUkVEX1RZUEUsIG51bGwsXG4gICAgICB0eXBlLnJlZmVyZW5jZS5uYW1lID8gYCR7dHlwZS5yZWZlcmVuY2UubmFtZX1fRmFjdG9yeWAgOiBudWxsKTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdEZsYWdzKGRlcGVuZGVuY3k6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSk6IEluamVjdEZsYWdzIHtcbiAgbGV0IGZsYWdzID0gSW5qZWN0RmxhZ3MuRGVmYXVsdDtcbiAgaWYgKGRlcGVuZGVuY3kuaXNIb3N0KSB7XG4gICAgZmxhZ3MgfD0gSW5qZWN0RmxhZ3MuSG9zdDtcbiAgfVxuICBpZiAoZGVwZW5kZW5jeS5pc09wdGlvbmFsKSB7XG4gICAgZmxhZ3MgfD0gSW5qZWN0RmxhZ3MuT3B0aW9uYWw7XG4gIH1cbiAgaWYgKGRlcGVuZGVuY3kuaXNTZWxmKSB7XG4gICAgZmxhZ3MgfD0gSW5qZWN0RmxhZ3MuU2VsZjtcbiAgfVxuICBpZiAoZGVwZW5kZW5jeS5pc1NraXBTZWxmKSB7XG4gICAgZmxhZ3MgfD0gSW5qZWN0RmxhZ3MuU2tpcFNlbGY7XG4gIH1cbiAgaWYgKGRlcGVuZGVuY3kuaXNWYWx1ZSkge1xuICAgIHVuc3VwcG9ydGVkKCd2YWx1ZSBkZXBlbmRlbmNpZXMnKTtcbiAgfVxuICByZXR1cm4gZmxhZ3M7XG59XG5cbi8qKlxuICogIFJlbW92ZSB0cmFpbGluZyBudWxsIG5vZGVzIGFzIHRoZXkgYXJlIGltcGxpZWQuXG4gKi9cbmZ1bmN0aW9uIHRyaW1UcmFpbGluZ051bGxzKHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdKTogby5FeHByZXNzaW9uW10ge1xuICB3aGlsZSAoby5pc051bGwocGFyYW1ldGVyc1twYXJhbWV0ZXJzLmxlbmd0aCAtIDFdKSkge1xuICAgIHBhcmFtZXRlcnMucG9wKCk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtZXRlcnM7XG59XG5cbnR5cGUgSG9zdEJpbmRpbmdzID0ge1xuICBba2V5OiBzdHJpbmddOiBzdHJpbmdcbn07XG5cbi8vIFR1cm4gYSBkaXJlY3RpdmUgc2VsZWN0b3IgaW50byBhbiBSMy1jb21wYXRpYmxlIHNlbGVjdG9yIGZvciBkaXJlY3RpdmUgZGVmXG5mdW5jdGlvbiBjcmVhdGVEaXJlY3RpdmVTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIGFzTGl0ZXJhbChwYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKHNlbGVjdG9yKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhvc3RBdHRyaWJ1dGVzQXJyYXkoXG4gICAgZGlyZWN0aXZlTWV0YWRhdGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0KTogby5FeHByZXNzaW9ufG51bGwge1xuICBjb25zdCB2YWx1ZXM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gIGNvbnN0IGF0dHJpYnV0ZXMgPSBkaXJlY3RpdmVNZXRhZGF0YS5ob3N0QXR0cmlidXRlcztcbiAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGF0dHJpYnV0ZXMpKSB7XG4gICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgdmFsdWVzLnB1c2goby5saXRlcmFsKGtleSksIG8ubGl0ZXJhbCh2YWx1ZSkpO1xuICB9XG4gIGlmICh2YWx1ZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBvdXRwdXRDdHguY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWxBcnIodmFsdWVzKSk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFJldHVybiBhIGhvc3QgYmluZGluZyBmdW5jdGlvbiBvciBudWxsIGlmIG9uZSBpcyBub3QgbmVjZXNzYXJ5LlxuZnVuY3Rpb24gY3JlYXRlSG9zdEJpbmRpbmdzRnVuY3Rpb24oXG4gICAgZGlyZWN0aXZlTWV0YWRhdGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gIGNvbnN0IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcblxuICBjb25zdCB0ZW1wb3JhcnkgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZGVjbGFyZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKCFkZWNsYXJlZCkge1xuICAgICAgICBzdGF0ZW1lbnRzLnB1c2gobmV3IG8uRGVjbGFyZVZhclN0bXQoVEVNUE9SQVJZX05BTUUsIHVuZGVmaW5lZCwgby5EWU5BTUlDX1RZUEUpKTtcbiAgICAgICAgZGVjbGFyZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG8udmFyaWFibGUoVEVNUE9SQVJZX05BTUUpO1xuICAgIH07XG4gIH0oKTtcblxuICBjb25zdCBob3N0QmluZGluZ1NvdXJjZVNwYW4gPSB0eXBlU291cmNlU3BhbihcbiAgICAgIGRpcmVjdGl2ZU1ldGFkYXRhLmlzQ29tcG9uZW50ID8gJ0NvbXBvbmVudCcgOiAnRGlyZWN0aXZlJywgZGlyZWN0aXZlTWV0YWRhdGEudHlwZSk7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBxdWVyaWVzXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBkaXJlY3RpdmVNZXRhZGF0YS5xdWVyaWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgIGNvbnN0IHF1ZXJ5ID0gZGlyZWN0aXZlTWV0YWRhdGEucXVlcmllc1tpbmRleF07XG5cbiAgICAvLyBlLmcuIHIzLnFSKHRtcCA9IHIzLmxkKGRpckluZGV4KVsxXSkgJiYgKHIzLmxkKGRpckluZGV4KVswXS5zb21lRGlyID0gdG1wKTtcbiAgICBjb25zdCBnZXREaXJlY3RpdmVNZW1vcnkgPSBvLmltcG9ydEV4cHIoUjMubG9hZCkuY2FsbEZuKFtvLnZhcmlhYmxlKCdkaXJJbmRleCcpXSk7XG4gICAgLy8gVGhlIHF1ZXJ5IGxpc3QgaXMgYXQgdGhlIHF1ZXJ5IGluZGV4ICsgMSBiZWNhdXNlIHRoZSBkaXJlY3RpdmUgaXRzZWxmIGlzIGluIHNsb3QgMC5cbiAgICBjb25zdCBnZXRRdWVyeUxpc3QgPSBnZXREaXJlY3RpdmVNZW1vcnkua2V5KG8ubGl0ZXJhbChpbmRleCArIDEpKTtcbiAgICBjb25zdCBhc3NpZ25Ub1RlbXBvcmFyeSA9IHRlbXBvcmFyeSgpLnNldChnZXRRdWVyeUxpc3QpO1xuICAgIGNvbnN0IGNhbGxRdWVyeVJlZnJlc2ggPSBvLmltcG9ydEV4cHIoUjMucXVlcnlSZWZyZXNoKS5jYWxsRm4oW2Fzc2lnblRvVGVtcG9yYXJ5XSk7XG4gICAgY29uc3QgdXBkYXRlRGlyZWN0aXZlID0gZ2V0RGlyZWN0aXZlTWVtb3J5LmtleShvLmxpdGVyYWwoMCwgby5JTkZFUlJFRF9UWVBFKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AocXVlcnkucHJvcGVydHlOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KHF1ZXJ5LmZpcnN0ID8gdGVtcG9yYXJ5KCkucHJvcCgnZmlyc3QnKSA6IHRlbXBvcmFyeSgpKTtcbiAgICBjb25zdCBhbmRFeHByZXNzaW9uID0gY2FsbFF1ZXJ5UmVmcmVzaC5hbmQodXBkYXRlRGlyZWN0aXZlKTtcbiAgICBzdGF0ZW1lbnRzLnB1c2goYW5kRXhwcmVzc2lvbi50b1N0bXQoKSk7XG4gIH1cblxuICBjb25zdCBkaXJlY3RpdmVTdW1tYXJ5ID0gZGlyZWN0aXZlTWV0YWRhdGEudG9TdW1tYXJ5KCk7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBob3N0IHByb3BlcnR5IGJpbmRpbmdzXG4gIGNvbnN0IGJpbmRpbmdzID0gYmluZGluZ1BhcnNlci5jcmVhdGVCb3VuZEhvc3RQcm9wZXJ0aWVzKGRpcmVjdGl2ZVN1bW1hcnksIGhvc3RCaW5kaW5nU291cmNlU3Bhbik7XG4gIGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gby5pbXBvcnRFeHByKFIzLmxvYWQpLmNhbGxGbihbby52YXJpYWJsZSgnZGlySW5kZXgnKV0pO1xuICBpZiAoYmluZGluZ3MpIHtcbiAgICBmb3IgKGNvbnN0IGJpbmRpbmcgb2YgYmluZGluZ3MpIHtcbiAgICAgIGNvbnN0IGJpbmRpbmdFeHByID0gY29udmVydFByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICBudWxsLCBiaW5kaW5nQ29udGV4dCwgYmluZGluZy5leHByZXNzaW9uLCAnYicsIEJpbmRpbmdGb3JtLlRyeVNpbXBsZSxcbiAgICAgICAgICAoKSA9PiBlcnJvcignVW5leHBlY3RlZCBpbnRlcnBvbGF0aW9uJykpO1xuICAgICAgc3RhdGVtZW50cy5wdXNoKC4uLmJpbmRpbmdFeHByLnN0bXRzKTtcbiAgICAgIHN0YXRlbWVudHMucHVzaChvLmltcG9ydEV4cHIoUjMuZWxlbWVudFByb3BlcnR5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FsbEZuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnZhcmlhYmxlKCdlbEluZGV4JyksIG8ubGl0ZXJhbChiaW5kaW5nLm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uaW1wb3J0RXhwcihSMy5iaW5kKS5jYWxsRm4oW2JpbmRpbmdFeHByLmN1cnJWYWxFeHByXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgICB9XG4gIH1cblxuICAvLyBDYWxjdWxhdGUgaG9zdCBldmVudCBiaW5kaW5nc1xuICBjb25zdCBldmVudEJpbmRpbmdzID1cbiAgICAgIGJpbmRpbmdQYXJzZXIuY3JlYXRlRGlyZWN0aXZlSG9zdEV2ZW50QXN0cyhkaXJlY3RpdmVTdW1tYXJ5LCBob3N0QmluZGluZ1NvdXJjZVNwYW4pO1xuICBpZiAoZXZlbnRCaW5kaW5ncykge1xuICAgIGZvciAoY29uc3QgYmluZGluZyBvZiBldmVudEJpbmRpbmdzKSB7XG4gICAgICBjb25zdCBiaW5kaW5nRXhwciA9IGNvbnZlcnRBY3Rpb25CaW5kaW5nKFxuICAgICAgICAgIG51bGwsIGJpbmRpbmdDb250ZXh0LCBiaW5kaW5nLmhhbmRsZXIsICdiJywgKCkgPT4gZXJyb3IoJ1VuZXhwZWN0ZWQgaW50ZXJwb2xhdGlvbicpKTtcbiAgICAgIGNvbnN0IGJpbmRpbmdOYW1lID0gYmluZGluZy5uYW1lICYmIHNhbml0aXplSWRlbnRpZmllcihiaW5kaW5nLm5hbWUpO1xuICAgICAgY29uc3QgdHlwZU5hbWUgPSBpZGVudGlmaWVyTmFtZShkaXJlY3RpdmVNZXRhZGF0YS50eXBlKTtcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9XG4gICAgICAgICAgdHlwZU5hbWUgJiYgYmluZGluZ05hbWUgPyBgJHt0eXBlTmFtZX1fJHtiaW5kaW5nTmFtZX1fSG9zdEJpbmRpbmdIYW5kbGVyYCA6IG51bGw7XG4gICAgICBjb25zdCBoYW5kbGVyID0gby5mbihcbiAgICAgICAgICBbbmV3IG8uRm5QYXJhbSgnJGV2ZW50Jywgby5EWU5BTUlDX1RZUEUpXSxcbiAgICAgICAgICBbLi4uYmluZGluZ0V4cHIuc3RtdHMsIG5ldyBvLlJldHVyblN0YXRlbWVudChiaW5kaW5nRXhwci5hbGxvd0RlZmF1bHQpXSwgby5JTkZFUlJFRF9UWVBFLFxuICAgICAgICAgIG51bGwsIGZ1bmN0aW9uTmFtZSk7XG4gICAgICBzdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgICAgby5pbXBvcnRFeHByKFIzLmxpc3RlbmVyKS5jYWxsRm4oW28ubGl0ZXJhbChiaW5kaW5nLm5hbWUpLCBoYW5kbGVyXSkudG9TdG10KCkpO1xuICAgIH1cbiAgfVxuXG5cbiAgaWYgKHN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHR5cGVOYW1lID0gZGlyZWN0aXZlTWV0YWRhdGEudHlwZS5yZWZlcmVuY2UubmFtZTtcbiAgICByZXR1cm4gby5mbihcbiAgICAgICAgW25ldyBvLkZuUGFyYW0oJ2RpckluZGV4Jywgby5OVU1CRVJfVFlQRSksIG5ldyBvLkZuUGFyYW0oJ2VsSW5kZXgnLCBvLk5VTUJFUl9UWVBFKV0sXG4gICAgICAgIHN0YXRlbWVudHMsIG8uSU5GRVJSRURfVFlQRSwgbnVsbCwgdHlwZU5hbWUgPyBgJHt0eXBlTmFtZX1fSG9zdEJpbmRpbmdzYCA6IG51bGwpO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGNvbmRpdGlvbmFsbHlDcmVhdGVNYXBPYmplY3RMaXRlcmFsKFxuICAgIGtleXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LCBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhrZXlzKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIG1hcFRvRXhwcmVzc2lvbihrZXlzKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuY2xhc3MgVmFsdWVDb252ZXJ0ZXIgZXh0ZW5kcyBBc3RNZW1vcnlFZmZpY2llbnRUcmFuc2Zvcm1lciB7XG4gIHByaXZhdGUgcGlwZVNsb3RzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgcHJpdmF0ZSBhbGxvY2F0ZVNsb3Q6ICgpID0+IG51bWJlcixcbiAgICAgIHByaXZhdGUgZGVmaW5lUGlwZTpcbiAgICAgICAgICAobmFtZTogc3RyaW5nLCBsb2NhbE5hbWU6IHN0cmluZywgc2xvdDogbnVtYmVyLCB2YWx1ZTogby5FeHByZXNzaW9uKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIC8vIEFzdE1lbW9yeUVmZmljaWVudFRyYW5zZm9ybWVyXG4gIHZpc2l0UGlwZShwaXBlOiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICAvLyBBbGxvY2F0ZSBhIHNsb3QgdG8gY3JlYXRlIHRoZSBwaXBlXG4gICAgY29uc3Qgc2xvdCA9IHRoaXMuYWxsb2NhdGVTbG90KCk7XG4gICAgY29uc3Qgc2xvdFBzZXVkb0xvY2FsID0gYFBJUEU6JHtzbG90fWA7XG4gICAgY29uc3QgdGFyZ2V0ID0gbmV3IFByb3BlcnR5UmVhZChwaXBlLnNwYW4sIG5ldyBJbXBsaWNpdFJlY2VpdmVyKHBpcGUuc3BhbiksIHNsb3RQc2V1ZG9Mb2NhbCk7XG4gICAgY29uc3QgYmluZGluZ0lkID0gcGlwZUJpbmRpbmcocGlwZS5hcmdzKTtcbiAgICB0aGlzLmRlZmluZVBpcGUocGlwZS5uYW1lLCBzbG90UHNldWRvTG9jYWwsIHNsb3QsIG8uaW1wb3J0RXhwcihiaW5kaW5nSWQpKTtcbiAgICBjb25zdCB2YWx1ZSA9IHBpcGUuZXhwLnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnZpc2l0QWxsKHBpcGUuYXJncyk7XG5cbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uQ2FsbChcbiAgICAgICAgcGlwZS5zcGFuLCB0YXJnZXQsIFtuZXcgTGl0ZXJhbFByaW1pdGl2ZShwaXBlLnNwYW4sIHNsb3QpLCB2YWx1ZSwgLi4uYXJnc10pO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXJyYXk6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJ1aWx0aW5GdW5jdGlvbkNhbGwoYXJyYXkuc3BhbiwgdGhpcy52aXNpdEFsbChhcnJheS5leHByZXNzaW9ucyksIHZhbHVlcyA9PiB7XG4gICAgICAvLyBJZiB0aGUgbGl0ZXJhbCBoYXMgY2FsY3VsYXRlZCAobm9uLWxpdGVyYWwpIGVsZW1lbnRzIHRyYW5zZm9ybSBpdCBpbnRvXG4gICAgICAvLyBjYWxscyB0byBsaXRlcmFsIGZhY3RvcmllcyB0aGF0IGNvbXBvc2UgdGhlIGxpdGVyYWwgYW5kIHdpbGwgY2FjaGUgaW50ZXJtZWRpYXRlXG4gICAgICAvLyB2YWx1ZXMuIE90aGVyd2lzZSwganVzdCByZXR1cm4gYW4gbGl0ZXJhbCBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB2YWx1ZXMuXG4gICAgICBjb25zdCBsaXRlcmFsID0gby5saXRlcmFsQXJyKHZhbHVlcyk7XG4gICAgICByZXR1cm4gdmFsdWVzLmV2ZXJ5KGEgPT4gYS5pc0NvbnN0YW50KCkpID9cbiAgICAgICAgICB0aGlzLm91dHB1dEN0eC5jb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKGxpdGVyYWwsIHRydWUpIDpcbiAgICAgICAgICBnZXRMaXRlcmFsRmFjdG9yeSh0aGlzLm91dHB1dEN0eCwgbGl0ZXJhbCk7XG4gICAgfSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxNYXAobWFwOiBMaXRlcmFsTWFwLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgQnVpbHRpbkZ1bmN0aW9uQ2FsbChtYXAuc3BhbiwgdGhpcy52aXNpdEFsbChtYXAudmFsdWVzKSwgdmFsdWVzID0+IHtcbiAgICAgIC8vIElmIHRoZSBsaXRlcmFsIGhhcyBjYWxjdWxhdGVkIChub24tbGl0ZXJhbCkgZWxlbWVudHMgIHRyYW5zZm9ybSBpdCBpbnRvXG4gICAgICAvLyBjYWxscyB0byBsaXRlcmFsIGZhY3RvcmllcyB0aGF0IGNvbXBvc2UgdGhlIGxpdGVyYWwgYW5kIHdpbGwgY2FjaGUgaW50ZXJtZWRpYXRlXG4gICAgICAvLyB2YWx1ZXMuIE90aGVyd2lzZSwganVzdCByZXR1cm4gYW4gbGl0ZXJhbCBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB2YWx1ZXMuXG4gICAgICBjb25zdCBsaXRlcmFsID0gby5saXRlcmFsTWFwKHZhbHVlcy5tYXAoXG4gICAgICAgICAgKHZhbHVlLCBpbmRleCkgPT4gKHtrZXk6IG1hcC5rZXlzW2luZGV4XS5rZXksIHZhbHVlLCBxdW90ZWQ6IG1hcC5rZXlzW2luZGV4XS5xdW90ZWR9KSkpO1xuICAgICAgcmV0dXJuIHZhbHVlcy5ldmVyeShhID0+IGEuaXNDb25zdGFudCgpKSA/XG4gICAgICAgICAgdGhpcy5vdXRwdXRDdHguY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChsaXRlcmFsLCB0cnVlKSA6XG4gICAgICAgICAgZ2V0TGl0ZXJhbEZhY3RvcnkodGhpcy5vdXRwdXRDdHgsIGxpdGVyYWwpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGludmFsaWQ8VD4oYXJnOiBvLkV4cHJlc3Npb24gfCBvLlN0YXRlbWVudCB8IFRlbXBsYXRlQXN0KTogbmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgSW52YWxpZCBzdGF0ZTogVmlzaXRvciAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gZG9lc24ndCBoYW5kbGUgJHtvLmNvbnN0cnVjdG9yLm5hbWV9YCk7XG59XG5cbmludGVyZmFjZSBOZ0NvbnRlbnRJbmZvIHtcbiAgaW5kZXg6IG51bWJlcjtcbiAgc2VsZWN0b3I/OiBzdHJpbmc7XG59XG5cbmNsYXNzIENvbnRlbnRQcm9qZWN0aW9uVmlzaXRvciBleHRlbmRzIFJlY3Vyc2l2ZVRlbXBsYXRlQXN0VmlzaXRvciB7XG4gIHByaXZhdGUgaW5kZXggPSAxO1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcHJvamVjdGlvbk1hcDogTWFwPE5nQ29udGVudEFzdCwgTmdDb250ZW50SW5mbz4sXG4gICAgICBwcml2YXRlIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgdmlzaXROZ0NvbnRlbnQobmdDb250ZW50OiBOZ0NvbnRlbnRBc3QpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IHRoaXMubmdDb250ZW50U2VsZWN0b3JzW25nQ29udGVudC5pbmRleF07XG4gICAgaWYgKHNlbGVjdG9yID09IG51bGwpIHtcbiAgICAgIGVycm9yKGBjb3VsZCBub3QgZmluZCBzZWxlY3RvciBmb3IgaW5kZXggJHtuZ0NvbnRlbnQuaW5kZXh9IGluICR7bmdDb250ZW50fWApO1xuICAgIH1cblxuICAgIGlmICghc2VsZWN0b3IgfHwgc2VsZWN0b3IgPT09ICcqJykge1xuICAgICAgdGhpcy5wcm9qZWN0aW9uTWFwLnNldChuZ0NvbnRlbnQsIHtpbmRleDogMH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb2plY3Rpb25NYXAuc2V0KG5nQ29udGVudCwge2luZGV4OiB0aGlzLmluZGV4KyssIHNlbGVjdG9yfSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldENvbnRlbnRQcm9qZWN0aW9uKG5vZGVzOiBUZW1wbGF0ZUFzdFtdLCBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IHByb2plY3RJbmRleE1hcCA9IG5ldyBNYXA8TmdDb250ZW50QXN0LCBOZ0NvbnRlbnRJbmZvPigpO1xuICBjb25zdCB2aXNpdG9yID0gbmV3IENvbnRlbnRQcm9qZWN0aW9uVmlzaXRvcihwcm9qZWN0SW5kZXhNYXAsIG5nQ29udGVudFNlbGVjdG9ycyk7XG4gIHRlbXBsYXRlVmlzaXRBbGwodmlzaXRvciwgbm9kZXMpO1xuICByZXR1cm4gcHJvamVjdEluZGV4TWFwO1xufVxuXG5cbi8qKlxuICogRmxhZ3MgdXNlZCB0byBnZW5lcmF0ZSBSMy1zdHlsZSBDU1MgU2VsZWN0b3JzLiBUaGV5IGFyZSBwYXN0ZWQgZnJvbVxuICogY29yZS9zcmMvcmVuZGVyMy9wcm9qZWN0aW9uLnRzIGJlY2F1c2UgdGhleSBjYW5ub3QgYmUgcmVmZXJlbmNlZCBkaXJlY3RseS5cbiAqL1xuY29uc3QgZW51bSBTZWxlY3RvckZsYWdzIHtcbiAgLyoqIEluZGljYXRlcyB0aGlzIGlzIHRoZSBiZWdpbm5pbmcgb2YgYSBuZXcgbmVnYXRpdmUgc2VsZWN0b3IgKi9cbiAgTk9UID0gMGIwMDAxLFxuXG4gIC8qKiBNb2RlIGZvciBtYXRjaGluZyBhdHRyaWJ1dGVzICovXG4gIEFUVFJJQlVURSA9IDBiMDAxMCxcblxuICAvKiogTW9kZSBmb3IgbWF0Y2hpbmcgdGFnIG5hbWVzICovXG4gIEVMRU1FTlQgPSAwYjAxMDAsXG5cbiAgLyoqIE1vZGUgZm9yIG1hdGNoaW5nIGNsYXNzIG5hbWVzICovXG4gIENMQVNTID0gMGIxMDAwLFxufVxuXG4vLyBUaGVzZSBhcmUgYSBjb3B5IHRoZSBDU1MgdHlwZXMgZnJvbSBjb3JlL3NyYy9yZW5kZXIzL2ludGVyZmFjZXMvcHJvamVjdGlvbi50c1xuLy8gVGhleSBhcmUgZHVwbGljYXRlZCBoZXJlIGFzIHRoZXkgY2Fubm90IGJlIGRpcmVjdGx5IHJlZmVyZW5jZWQgZnJvbSBjb3JlLlxudHlwZSBSM0Nzc1NlbGVjdG9yID0gKHN0cmluZyB8IFNlbGVjdG9yRmxhZ3MpW107XG50eXBlIFIzQ3NzU2VsZWN0b3JMaXN0ID0gUjNDc3NTZWxlY3RvcltdO1xuXG5mdW5jdGlvbiBwYXJzZXJTZWxlY3RvclRvU2ltcGxlU2VsZWN0b3Ioc2VsZWN0b3I6IENzc1NlbGVjdG9yKTogUjNDc3NTZWxlY3RvciB7XG4gIGNvbnN0IGNsYXNzZXMgPSBzZWxlY3Rvci5jbGFzc05hbWVzICYmIHNlbGVjdG9yLmNsYXNzTmFtZXMubGVuZ3RoID9cbiAgICAgIFtTZWxlY3RvckZsYWdzLkNMQVNTLCAuLi5zZWxlY3Rvci5jbGFzc05hbWVzXSA6XG4gICAgICBbXTtcbiAgY29uc3QgZWxlbWVudE5hbWUgPSBzZWxlY3Rvci5lbGVtZW50ICYmIHNlbGVjdG9yLmVsZW1lbnQgIT09ICcqJyA/IHNlbGVjdG9yLmVsZW1lbnQgOiAnJztcbiAgcmV0dXJuIFtlbGVtZW50TmFtZSwgLi4uc2VsZWN0b3IuYXR0cnMsIC4uLmNsYXNzZXNdO1xufVxuXG5mdW5jdGlvbiBwYXJzZXJTZWxlY3RvclRvTmVnYXRpdmVTZWxlY3RvcihzZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBSM0Nzc1NlbGVjdG9yIHtcbiAgY29uc3QgY2xhc3NlcyA9IHNlbGVjdG9yLmNsYXNzTmFtZXMgJiYgc2VsZWN0b3IuY2xhc3NOYW1lcy5sZW5ndGggP1xuICAgICAgW1NlbGVjdG9yRmxhZ3MuQ0xBU1MsIC4uLnNlbGVjdG9yLmNsYXNzTmFtZXNdIDpcbiAgICAgIFtdO1xuXG4gIGlmIChzZWxlY3Rvci5lbGVtZW50KSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIFNlbGVjdG9yRmxhZ3MuTk9UIHwgU2VsZWN0b3JGbGFncy5FTEVNRU5ULCBzZWxlY3Rvci5lbGVtZW50LCAuLi5zZWxlY3Rvci5hdHRycywgLi4uY2xhc3Nlc1xuICAgIF07XG4gIH0gZWxzZSBpZiAoc2VsZWN0b3IuYXR0cnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFtTZWxlY3RvckZsYWdzLk5PVCB8IFNlbGVjdG9yRmxhZ3MuQVRUUklCVVRFLCAuLi5zZWxlY3Rvci5hdHRycywgLi4uY2xhc3Nlc107XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yLmNsYXNzTmFtZXMgJiYgc2VsZWN0b3IuY2xhc3NOYW1lcy5sZW5ndGggP1xuICAgICAgICBbU2VsZWN0b3JGbGFncy5OT1QgfCBTZWxlY3RvckZsYWdzLkNMQVNTLCAuLi5zZWxlY3Rvci5jbGFzc05hbWVzXSA6XG4gICAgICAgIFtdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlclNlbGVjdG9yVG9SM1NlbGVjdG9yKHNlbGVjdG9yOiBDc3NTZWxlY3Rvcik6IFIzQ3NzU2VsZWN0b3Ige1xuICBjb25zdCBwb3NpdGl2ZSA9IHBhcnNlclNlbGVjdG9yVG9TaW1wbGVTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgY29uc3QgbmVnYXRpdmU6IFIzQ3NzU2VsZWN0b3JMaXN0ID0gc2VsZWN0b3Iubm90U2VsZWN0b3JzICYmIHNlbGVjdG9yLm5vdFNlbGVjdG9ycy5sZW5ndGggP1xuICAgICAgc2VsZWN0b3Iubm90U2VsZWN0b3JzLm1hcChub3RTZWxlY3RvciA9PiBwYXJzZXJTZWxlY3RvclRvTmVnYXRpdmVTZWxlY3Rvcihub3RTZWxlY3RvcikpIDpcbiAgICAgIFtdO1xuXG4gIHJldHVybiBwb3NpdGl2ZS5jb25jYXQoLi4ubmVnYXRpdmUpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiBSM0Nzc1NlbGVjdG9yTGlzdCB7XG4gIGNvbnN0IHNlbGVjdG9ycyA9IENzc1NlbGVjdG9yLnBhcnNlKHNlbGVjdG9yKTtcbiAgcmV0dXJuIHNlbGVjdG9ycy5tYXAocGFyc2VyU2VsZWN0b3JUb1IzU2VsZWN0b3IpO1xufVxuXG5mdW5jdGlvbiBhc0xpdGVyYWwodmFsdWU6IGFueSk6IG8uRXhwcmVzc2lvbiB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiBvLmxpdGVyYWxBcnIodmFsdWUubWFwKGFzTGl0ZXJhbCkpO1xuICB9XG4gIHJldHVybiBvLmxpdGVyYWwodmFsdWUsIG8uSU5GRVJSRURfVFlQRSk7XG59XG5cbmZ1bmN0aW9uIG1hcFRvRXhwcmVzc2lvbihtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBxdW90ZWQgPSBmYWxzZSk6IG8uRXhwcmVzc2lvbiB7XG4gIHJldHVybiBvLmxpdGVyYWxNYXAoXG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtYXApLm1hcChrZXkgPT4gKHtrZXksIHF1b3RlZCwgdmFsdWU6IGFzTGl0ZXJhbChtYXBba2V5XSl9KSkpO1xufVxuXG4vLyBQYXJzZSBpMThuIG1ldGFzIGxpa2U6XG4vLyAtIFwiQEBpZFwiLFxuLy8gLSBcImRlc2NyaXB0aW9uW0BAaWRdXCIsXG4vLyAtIFwibWVhbmluZ3xkZXNjcmlwdGlvbltAQGlkXVwiXG5mdW5jdGlvbiBwYXJzZUkxOG5NZXRhKGkxOG4/OiBzdHJpbmcpOiB7ZGVzY3JpcHRpb24/OiBzdHJpbmcsIGlkPzogc3RyaW5nLCBtZWFuaW5nPzogc3RyaW5nfSB7XG4gIGxldCBtZWFuaW5nOiBzdHJpbmd8dW5kZWZpbmVkO1xuICBsZXQgZGVzY3JpcHRpb246IHN0cmluZ3x1bmRlZmluZWQ7XG4gIGxldCBpZDogc3RyaW5nfHVuZGVmaW5lZDtcblxuICBpZiAoaTE4bikge1xuICAgIC8vIFRPRE8odmljYik6IGZpZ3VyZSBvdXQgaG93IHRvIGZvcmNlIGEgbWVzc2FnZSBJRCB3aXRoIGNsb3N1cmUgP1xuICAgIGNvbnN0IGlkSW5kZXggPSBpMThuLmluZGV4T2YoSURfU0VQQVJBVE9SKTtcblxuICAgIGNvbnN0IGRlc2NJbmRleCA9IGkxOG4uaW5kZXhPZihNRUFOSU5HX1NFUEFSQVRPUik7XG4gICAgbGV0IG1lYW5pbmdBbmREZXNjOiBzdHJpbmc7XG4gICAgW21lYW5pbmdBbmREZXNjLCBpZF0gPVxuICAgICAgICAoaWRJbmRleCA+IC0xKSA/IFtpMThuLnNsaWNlKDAsIGlkSW5kZXgpLCBpMThuLnNsaWNlKGlkSW5kZXggKyAyKV0gOiBbaTE4biwgJyddO1xuICAgIFttZWFuaW5nLCBkZXNjcmlwdGlvbl0gPSAoZGVzY0luZGV4ID4gLTEpID9cbiAgICAgICAgW21lYW5pbmdBbmREZXNjLnNsaWNlKDAsIGRlc2NJbmRleCksIG1lYW5pbmdBbmREZXNjLnNsaWNlKGRlc2NJbmRleCArIDEpXSA6XG4gICAgICAgIFsnJywgbWVhbmluZ0FuZERlc2NdO1xuICB9XG5cbiAgcmV0dXJuIHtkZXNjcmlwdGlvbiwgaWQsIG1lYW5pbmd9O1xufVxuIl19