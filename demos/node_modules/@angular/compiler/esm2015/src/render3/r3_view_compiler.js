/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { flatten, identifierName, sanitizeIdentifier, tokenReference } from '../compile_metadata';
import { BindingForm, BuiltinFunctionCall, convertActionBinding, convertPropertyBinding } from '../compiler_util/expression_converter';
import { AstMemoryEfficientTransformer, FunctionCall, ImplicitReceiver, LiteralPrimitive, PropertyRead } from '../expression_parser/ast';
import { Identifiers } from '../identifiers';
import { LifecycleHooks } from '../lifecycle_reflector';
import * as o from '../output/output_ast';
import { typeSourceSpan } from '../parse_util';
import { CssSelector } from '../selector';
import { PropertyBindingType, RecursiveTemplateAstVisitor, TextAst, templateVisitAll } from '../template_parser/template_ast';
import { error } from '../util';
import { Identifiers as R3 } from './r3_identifiers';
import { BUILD_OPTIMIZER_COLOCATE } from './r3_types';
/** Name of the context parameter passed into a template function */
const CONTEXT_NAME = 'ctx';
/** Name of the RenderFlag passed into a template function */
const RENDER_FLAGS = 'rf';
/** Name of the temporary to use during data binding */
const TEMPORARY_NAME = '_t';
/** The prefix reference variables */
const REFERENCE_PREFIX = '_r';
/** The name of the implicit context reference */
const IMPLICIT_REFERENCE = '$implicit';
/** Name of the i18n attributes **/
const I18N_ATTR = 'i18n';
const I18N_ATTR_PREFIX = 'i18n-';
/** I18n separators for metadata **/
const MEANING_SEPARATOR = '|';
const ID_SEPARATOR = '@@';
export function compileDirective(outputCtx, directive, reflector, bindingParser, mode) {
    const definitionMapValues = [];
    const field = (key, value) => {
        if (value) {
            definitionMapValues.push({ key, value, quoted: false });
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
    const className = identifierName(directive.type);
    className || error(`Cannot resolver the name of ${directive.type}`);
    const definitionField = outputCtx.constantPool.propertyNameOf(1 /* Directive */);
    const definitionFunction = o.importExpr(R3.defineDirective).callFn([o.literalMap(definitionMapValues)]);
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
        const classReference = outputCtx.importExpr(directive.type.reference);
        // Create the back-patch statement
        outputCtx.statements.push(new o.CommentStmt(BUILD_OPTIMIZER_COLOCATE));
        outputCtx.statements.push(classReference.prop(definitionField).set(definitionFunction).toStmt());
    }
}
export function compileComponent(outputCtx, component, pipeSummaries, template, reflector, bindingParser, mode) {
    const definitionMapValues = [];
    // Pipes and Directives found in the template
    const pipes = new Set();
    const directives = new Set();
    const field = (key, value) => {
        if (value) {
            definitionMapValues.push({ key, value, quoted: false });
        }
    };
    // e.g. `type: MyApp`
    field('type', outputCtx.importExpr(component.type.reference));
    // e.g. `selectors: [['my-app']]`
    field('selectors', createDirectiveSelector(component.selector));
    const selector = component.selector && CssSelector.parse(component.selector);
    const firstSelector = selector && selector[0];
    // e.g. `attr: ["class", ".my.app"]
    // This is optional an only included if the first selector of a component specifies attributes.
    if (firstSelector) {
        const selectorAttributes = firstSelector.getAttrs();
        if (selectorAttributes.length) {
            field('attrs', outputCtx.constantPool.getConstLiteral(o.literalArr(selectorAttributes.map(value => value != null ? o.literal(value) : o.literal(undefined))), 
            /* forceShared */ true));
        }
    }
    // e.g. `factory: function MyApp_Factory() { return new MyApp(injectElementRef()); }`
    field('factory', createFactory(component.type, outputCtx, reflector, component.queries));
    // e.g `hostBindings: function MyApp_HostBindings { ... }
    field('hostBindings', createHostBindingsFunction(component, outputCtx, bindingParser));
    // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
    const templateTypeName = component.type.reference.name;
    const templateName = templateTypeName ? `${templateTypeName}_Template` : null;
    const pipeMap = new Map(pipeSummaries.map(pipe => [pipe.name, pipe]));
    const templateFunctionExpression = new TemplateDefinitionBuilder(outputCtx, outputCtx.constantPool, reflector, CONTEXT_NAME, BindingScope.ROOT_SCOPE, 0, component.template.ngContentSelectors, templateTypeName, templateName, pipeMap, component.viewQueries, directives, pipes)
        .buildTemplateFunction(template, []);
    field('template', templateFunctionExpression);
    // e.g. `directives: [MyDirective]`
    if (directives.size) {
        const expressions = Array.from(directives).map(d => outputCtx.importExpr(d));
        field('directives', o.literalArr(expressions));
    }
    // e.g. `pipes: [MyPipe]`
    if (pipes.size) {
        const expressions = Array.from(pipes).map(p => outputCtx.importExpr(p));
        field('pipes', o.literalArr(expressions));
    }
    // e.g `inputs: {a: 'a'}`
    field('inputs', conditionallyCreateMapObjectLiteral(component.inputs, outputCtx));
    // e.g 'outputs: {a: 'a'}`
    field('outputs', conditionallyCreateMapObjectLiteral(component.outputs, outputCtx));
    // e.g. `features: [NgOnChangesFeature(MyComponent)]`
    const features = [];
    if (component.type.lifecycleHooks.some(lifecycle => lifecycle == LifecycleHooks.OnChanges)) {
        features.push(o.importExpr(R3.NgOnChangesFeature, null, null).callFn([outputCtx.importExpr(component.type.reference)]));
    }
    if (features.length) {
        field('features', o.literalArr(features));
    }
    const definitionField = outputCtx.constantPool.propertyNameOf(2 /* Component */);
    const definitionFunction = o.importExpr(R3.defineComponent).callFn([o.literalMap(definitionMapValues)]);
    if (mode === 0 /* PartialClass */) {
        const className = identifierName(component.type);
        className || error(`Cannot resolver the name of ${component.type}`);
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
        const classReference = outputCtx.importExpr(component.type.reference);
        // Create the back-patch statement
        outputCtx.statements.push(new o.CommentStmt(BUILD_OPTIMIZER_COLOCATE), classReference.prop(definitionField).set(definitionFunction).toStmt());
    }
}
// TODO: Remove these when the things are fully supported
function unknown(arg) {
    throw new Error(`Builder ${this.constructor.name} is unable to handle ${arg.constructor.name} yet`);
}
function unsupported(feature) {
    if (this) {
        throw new Error(`Builder ${this.constructor.name} doesn't support ${feature} yet`);
    }
    throw new Error(`Feature ${feature} is not supported yet`);
}
const BINDING_INSTRUCTION_MAP = {
    [PropertyBindingType.Property]: R3.elementProperty,
    [PropertyBindingType.Attribute]: R3.elementAttribute,
    [PropertyBindingType.Class]: R3.elementClassNamed,
    [PropertyBindingType.Style]: R3.elementStyleNamed
};
function interpolate(args) {
    args = args.slice(1); // Ignore the length prefix added for render2
    switch (args.length) {
        case 3:
            return o.importExpr(R3.interpolation1).callFn(args);
        case 5:
            return o.importExpr(R3.interpolation2).callFn(args);
        case 7:
            return o.importExpr(R3.interpolation3).callFn(args);
        case 9:
            return o.importExpr(R3.interpolation4).callFn(args);
        case 11:
            return o.importExpr(R3.interpolation5).callFn(args);
        case 13:
            return o.importExpr(R3.interpolation6).callFn(args);
        case 15:
            return o.importExpr(R3.interpolation7).callFn(args);
        case 17:
            return o.importExpr(R3.interpolation8).callFn(args);
    }
    (args.length >= 19 && args.length % 2 == 1) ||
        error(`Invalid interpolation argument length ${args.length}`);
    return o.importExpr(R3.interpolationV).callFn([o.literalArr(args)]);
}
function pipeBinding(args) {
    switch (args.length) {
        case 0:
            // The first parameter to pipeBind is always the value to be transformed followed
            // by arg.length arguments so the total number of arguments to pipeBind are
            // arg.length + 1.
            return R3.pipeBind1;
        case 1:
            return R3.pipeBind2;
        case 2:
            return R3.pipeBind3;
        default:
            return R3.pipeBindV;
    }
}
const pureFunctionIdentifiers = [
    R3.pureFunction0, R3.pureFunction1, R3.pureFunction2, R3.pureFunction3, R3.pureFunction4,
    R3.pureFunction5, R3.pureFunction6, R3.pureFunction7, R3.pureFunction8
];
function getLiteralFactory(outputContext, literal) {
    const { literalFactory, literalFactoryArguments } = outputContext.constantPool.getLiteralFactory(literal);
    literalFactoryArguments.length > 0 || error(`Expected arguments to a literal factory function`);
    let pureFunctionIdent = pureFunctionIdentifiers[literalFactoryArguments.length] || R3.pureFunctionV;
    // Literal factories are pure functions that only need to be re-invoked when the parameters
    // change.
    return o.importExpr(pureFunctionIdent).callFn([literalFactory, ...literalFactoryArguments]);
}
function noop() { }
class BindingScope {
    constructor(parent = null, declareLocalVarCallback = noop) {
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
    get(name) {
        let current = this;
        while (current) {
            let value = current.map.get(name);
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
    }
    /**
     * Create a local variable for later reference.
     *
     * @param name Name of the variable.
     * @param lhs AST representing the left hand side of the `let lhs = rhs;`.
     * @param rhs AST representing the right hand side of the `let lhs = rhs;`. The `rhs` can be
     * `undefined` for variable that are ambient such as `$event` and which don't have `rhs`
     * declaration.
     */
    set(name, lhs, rhs) {
        !this.map.has(name) ||
            error(`The name ${name} is already defined in scope to be ${this.map.get(name)}`);
        this.map.set(name, { lhs: lhs, rhs: rhs, declared: false });
        return this;
    }
    getLocal(name) { return this.get(name); }
    nestedScope(declareCallback) {
        return new BindingScope(this, declareCallback);
    }
    freshReferenceName() {
        let current = this;
        // Find the top scope as it maintains the global reference count
        while (current.parent)
            current = current.parent;
        const ref = `${REFERENCE_PREFIX}${current.referenceNameIndex++}`;
        return ref;
    }
}
BindingScope.ROOT_SCOPE = new BindingScope().set('$event', o.variable('$event'));
class TemplateDefinitionBuilder {
    constructor(outputCtx, constantPool, reflector, contextParameter, parentBindingScope, level = 0, ngContentSelectors, contextName, templateName, pipeMap, viewQueries, directives, pipes) {
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
            parentBindingScope.nestedScope((lhsVar, expression) => {
                this._bindingMode.push(lhsVar.set(expression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            });
        this._valueConverter = new ValueConverter(outputCtx, () => this.allocateDataSlot(), (name, localName, slot, value) => {
            this.bindingScope.set(localName, value);
            const pipe = pipeMap.get(name);
            pipe || error(`Could not find pipe ${name}`);
            this.pipes.add(pipe.type.reference);
            this._creationMode.push(o.importExpr(R3.pipe).callFn([o.literal(slot), o.literal(name)]).toStmt());
        });
    }
    buildTemplateFunction(nodes, variables) {
        // Create variable bindings
        for (const variable of variables) {
            const variableName = variable.name;
            const expression = o.variable(this.contextParameter).prop(variable.value || IMPLICIT_REFERENCE);
            const scopedName = this.bindingScope.freshReferenceName();
            // Add the reference to the local scope.
            this.bindingScope.set(variableName, o.variable(variableName + scopedName), expression);
        }
        // Collect content projections
        if (this.ngContentSelectors && this.ngContentSelectors.length > 0) {
            const contentProjections = getContentProjection(nodes, this.ngContentSelectors);
            this._contentProjections = contentProjections;
            if (contentProjections.size > 0) {
                const selectors = [];
                Array.from(contentProjections.values()).forEach(info => {
                    if (info.selector) {
                        selectors[info.index - 1] = info.selector;
                    }
                });
                const projectionIndex = this._projectionDefinitionIndex = this.allocateDataSlot();
                const parameters = [o.literal(projectionIndex)];
                if (selectors.some(value => !value)) {
                    error(`content project information skipped an index`);
                }
                if (selectors.length > 1) {
                    const r3Selectors = selectors.map(s => parseSelectorToR3Selector(s));
                    // `projectionDef` needs both the parsed and raw value of the selectors
                    const parsed = this.outputCtx.constantPool.getConstLiteral(asLiteral(r3Selectors), true);
                    const unParsed = this.outputCtx.constantPool.getConstLiteral(asLiteral(selectors), true);
                    parameters.push(parsed, unParsed);
                }
                this.instruction(this._creationMode, null, R3.projectionDef, ...parameters);
            }
        }
        // Define and update any view queries
        for (let query of this.viewQueries) {
            // e.g. r3.Q(0, somePredicate, true);
            const querySlot = this.allocateDataSlot();
            const predicate = getQueryPredicate(query, this.outputCtx);
            const args = [
                /* memoryIndex */ o.literal(querySlot, o.INFERRED_TYPE),
                /* predicate */ predicate,
                /* descend */ o.literal(query.descendants, o.INFERRED_TYPE)
            ];
            if (query.read) {
                args.push(this.outputCtx.importExpr(query.read.identifier.reference));
            }
            this.instruction(this._creationMode, null, R3.query, ...args);
            // (r3.qR(tmp = r3.ɵld(0)) && (ctx.someDir = tmp));
            const temporary = this.temp();
            const getQueryList = o.importExpr(R3.load).callFn([o.literal(querySlot)]);
            const refresh = o.importExpr(R3.queryRefresh).callFn([temporary.set(getQueryList)]);
            const updateDirective = o.variable(CONTEXT_NAME)
                .prop(query.propertyName)
                .set(query.first ? temporary.prop('first') : temporary);
            this._bindingMode.push(refresh.and(updateDirective).toStmt());
        }
        templateVisitAll(this, nodes);
        const creationMode = this._creationMode.length > 0 ?
            [o.ifStmt(o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(1 /* Create */), null, false), this._creationMode)] :
            [];
        const updateMode = this._bindingMode.length > 0 ?
            [o.ifStmt(o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(2 /* Update */), null, false), this._bindingMode)] :
            [];
        // Generate maps of placeholder name to node indexes
        // TODO(vicb): This is a WIP, not fully supported yet
        for (const phToNodeIdx of this._phToNodeIdxes) {
            if (Object.keys(phToNodeIdx).length > 0) {
                const scopedName = this.bindingScope.freshReferenceName();
                const phMap = o.variable(scopedName)
                    .set(mapToExpression(phToNodeIdx, true))
                    .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]);
                this._prefix.push(phMap);
            }
        }
        return o.fn([new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(this.contextParameter, null)], [
            // Temporary variable declarations for query refresh (i.e. let _t: any;)
            ...this._prefix,
            // Creating mode (i.e. if (rf & RenderFlags.Create) { ... })
            ...creationMode,
            // Temporary variable declarations for local refs (i.e. const tmp = ld(1) as any)
            ...this._variableMode,
            // Binding and refresh mode (i.e. if (rf & RenderFlags.Update) {...})
            ...updateMode,
            // Nested templates (i.e. function CompTemplate() {})
            ...this._postfix
        ], o.INFERRED_TYPE, null, this.templateName);
    }
    // LocalResolver
    getLocal(name) { return this.bindingScope.get(name); }
    // TemplateAstVisitor
    visitNgContent(ngContent) {
        const info = this._contentProjections.get(ngContent);
        info ||
            error(`Expected ${ngContent.sourceSpan} to be included in content projection collection`);
        const slot = this.allocateDataSlot();
        const parameters = [o.literal(slot), o.literal(this._projectionDefinitionIndex)];
        if (info.index !== 0) {
            parameters.push(o.literal(info.index));
        }
        this.instruction(this._creationMode, ngContent.sourceSpan, R3.projection, ...parameters);
    }
    // TemplateAstVisitor
    visitElement(element) {
        const elementIndex = this.allocateDataSlot();
        const referenceDataSlots = new Map();
        const wasInI18nSection = this._inI18nSection;
        const outputAttrs = {};
        const attrI18nMetas = {};
        let i18nMeta = '';
        // Elements inside i18n sections are replaced with placeholders
        // TODO(vicb): nested elements are a WIP in this phase
        if (this._inI18nSection) {
            const phName = element.name.toLowerCase();
            if (!this._phToNodeIdxes[this._i18nSectionIndex][phName]) {
                this._phToNodeIdxes[this._i18nSectionIndex][phName] = [];
            }
            this._phToNodeIdxes[this._i18nSectionIndex][phName].push(elementIndex);
        }
        // Handle i18n attributes
        for (const attr of element.attrs) {
            const name = attr.name;
            const value = attr.value;
            if (name === I18N_ATTR) {
                if (this._inI18nSection) {
                    throw new Error(`Could not mark an element as translatable inside of a translatable section`);
                }
                this._inI18nSection = true;
                this._i18nSectionIndex++;
                this._phToNodeIdxes[this._i18nSectionIndex] = {};
                i18nMeta = value;
            }
            else if (name.startsWith(I18N_ATTR_PREFIX)) {
                attrI18nMetas[name.slice(I18N_ATTR_PREFIX.length)] = value;
            }
            else {
                outputAttrs[name] = value;
            }
        }
        // Element creation mode
        const parameters = [
            o.literal(elementIndex),
            o.literal(element.name),
        ];
        element.directives.forEach(directive => this.directives.add(directive.directive.type.reference));
        // Add the attributes
        const i18nMessages = [];
        const attributes = [];
        let hasI18nAttr = false;
        Object.getOwnPropertyNames(outputAttrs).forEach(name => {
            const value = outputAttrs[name];
            attributes.push(o.literal(name));
            if (attrI18nMetas.hasOwnProperty(name)) {
                hasI18nAttr = true;
                const meta = parseI18nMeta(attrI18nMetas[name]);
                const variable = this.constantPool.getTranslation(value, meta);
                attributes.push(variable);
            }
            else {
                attributes.push(o.literal(value));
            }
        });
        let attrArg = o.TYPED_NULL_EXPR;
        if (attributes.length > 0) {
            attrArg = hasI18nAttr ? getLiteralFactory(this.outputCtx, o.literalArr(attributes)) :
                this.constantPool.getConstLiteral(o.literalArr(attributes), true);
        }
        parameters.push(attrArg);
        if (element.references && element.references.length > 0) {
            const references = flatten(element.references.map(reference => {
                const slot = this.allocateDataSlot();
                referenceDataSlots.set(reference.name, slot);
                // Generate the update temporary.
                const variableName = this.bindingScope.freshReferenceName();
                this._variableMode.push(o.variable(variableName, o.INFERRED_TYPE)
                    .set(o.importExpr(R3.load).callFn([o.literal(slot)]))
                    .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
                this.bindingScope.set(reference.name, o.variable(variableName));
                return [reference.name, reference.originalValue];
            })).map(value => o.literal(value));
            parameters.push(this.constantPool.getConstLiteral(o.literalArr(references), /* forceShared */ true));
        }
        else {
            parameters.push(o.TYPED_NULL_EXPR);
        }
        // Generate the instruction create element instruction
        if (i18nMessages.length > 0) {
            this._creationMode.push(...i18nMessages);
        }
        this.instruction(this._creationMode, element.sourceSpan, R3.createElement, ...trimTrailingNulls(parameters));
        const implicit = o.variable(CONTEXT_NAME);
        // Generate Listeners (outputs)
        element.outputs.forEach((outputAst) => {
            const functionName = `${this.templateName}_${element.name}_${outputAst.name}_listener`;
            const localVars = [];
            const bindingScope = this.bindingScope.nestedScope((lhsVar, rhsExpression) => {
                localVars.push(lhsVar.set(rhsExpression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            });
            const bindingExpr = convertActionBinding(bindingScope, o.variable(CONTEXT_NAME), outputAst.handler, 'b', () => error('Unexpected interpolation'));
            const handler = o.fn([new o.FnParam('$event', o.DYNAMIC_TYPE)], [...localVars, ...bindingExpr.render3Stmts], o.INFERRED_TYPE, null, functionName);
            this.instruction(this._creationMode, outputAst.sourceSpan, R3.listener, o.literal(outputAst.name), handler);
        });
        // Generate element input bindings
        for (let input of element.inputs) {
            if (input.isAnimation) {
                this.unsupported('animations');
            }
            const convertedBinding = this.convertPropertyBinding(implicit, input.value);
            const instruction = BINDING_INSTRUCTION_MAP[input.type];
            if (instruction) {
                // TODO(chuckj): runtime: security context?
                this.instruction(this._bindingMode, input.sourceSpan, instruction, o.literal(elementIndex), o.literal(input.name), convertedBinding);
            }
            else {
                this.unsupported(`binding ${PropertyBindingType[input.type]}`);
            }
        }
        // Generate directives input bindings
        this._visitDirectives(element.directives, implicit, elementIndex);
        // Traverse element child nodes
        if (this._inI18nSection && element.children.length == 1 &&
            element.children[0] instanceof TextAst) {
            const text = element.children[0];
            this.visitSingleI18nTextChild(text, i18nMeta);
        }
        else {
            templateVisitAll(this, element.children);
        }
        // Finish element construction mode.
        this.instruction(this._creationMode, element.endSourceSpan || element.sourceSpan, R3.elementEnd);
        // Restore the state before exiting this node
        this._inI18nSection = wasInI18nSection;
    }
    _visitDirectives(directives, implicit, nodeIndex) {
        for (let directive of directives) {
            // Creation mode
            // e.g. D(0, TodoComponentDef.n(), TodoComponentDef);
            const directiveType = directive.directive.type.reference;
            const kind = directive.directive.isComponent ? 2 /* Component */ : 1 /* Directive */;
            // Note: *do not cache* calls to this.directiveOf() as the constant pool needs to know if the
            // node is referenced multiple times to know that it must generate the reference into a
            // temporary.
            // Bindings
            for (const input of directive.inputs) {
                const convertedBinding = this.convertPropertyBinding(implicit, input.value);
                this.instruction(this._bindingMode, directive.sourceSpan, R3.elementProperty, o.literal(nodeIndex), o.literal(input.templateName), o.importExpr(R3.bind).callFn([convertedBinding]));
            }
        }
    }
    // TemplateAstVisitor
    visitEmbeddedTemplate(template) {
        const templateIndex = this.allocateDataSlot();
        const templateRef = this.reflector.resolveExternalReference(Identifiers.TemplateRef);
        const templateDirective = template.directives.find(directive => directive.directive.type.diDeps.some(dependency => dependency.token != null && (tokenReference(dependency.token) == templateRef)));
        const contextName = this.contextName && templateDirective && templateDirective.directive.type.reference.name ?
            `${this.contextName}_${templateDirective.directive.type.reference.name}` :
            null;
        const templateName = contextName ? `${contextName}_Template_${templateIndex}` : `Template_${templateIndex}`;
        const templateContext = `ctx${this.level}`;
        const parameters = [o.variable(templateName), o.literal(null, o.INFERRED_TYPE)];
        const attributeNames = [];
        template.directives.forEach((directiveAst) => {
            this.directives.add(directiveAst.directive.type.reference);
            CssSelector.parse(directiveAst.directive.selector).forEach(selector => {
                selector.attrs.forEach((value) => {
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
        this.instruction(this._creationMode, template.sourceSpan, R3.containerCreate, o.literal(templateIndex), ...trimTrailingNulls(parameters));
        // Generate directives
        this._visitDirectives(template.directives, o.variable(CONTEXT_NAME), templateIndex);
        // Create the template function
        const templateVisitor = new TemplateDefinitionBuilder(this.outputCtx, this.constantPool, this.reflector, templateContext, this.bindingScope, this.level + 1, this.ngContentSelectors, contextName, templateName, this.pipeMap, [], this.directives, this.pipes);
        const templateFunctionExpr = templateVisitor.buildTemplateFunction(template.children, template.variables);
        this._postfix.push(templateFunctionExpr.toDeclStmt(templateName, null));
    }
    // TemplateAstVisitor
    visitBoundText(text) {
        const nodeIndex = this.allocateDataSlot();
        // Creation mode
        this.instruction(this._creationMode, text.sourceSpan, R3.text, o.literal(nodeIndex));
        this.instruction(this._bindingMode, text.sourceSpan, R3.textCreateBound, o.literal(nodeIndex), this.convertPropertyBinding(o.variable(CONTEXT_NAME), text.value));
    }
    // TemplateAstVisitor
    visitText(text) {
        // Text is defined in creation mode only.
        this.instruction(this._creationMode, text.sourceSpan, R3.text, o.literal(this.allocateDataSlot()), o.literal(text.value));
    }
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
    visitSingleI18nTextChild(text, i18nMeta) {
        const meta = parseI18nMeta(i18nMeta);
        const variable = this.constantPool.getTranslation(text.value, meta);
        this.instruction(this._creationMode, text.sourceSpan, R3.text, o.literal(this.allocateDataSlot()), variable);
    }
    allocateDataSlot() { return this._dataIndex++; }
    bindingContext() { return `${this._bindingContext++}`; }
    instruction(statements, span, reference, ...params) {
        statements.push(o.importExpr(reference, null, span).callFn(params, span).toStmt());
    }
    definitionOf(type, kind) {
        return this.constantPool.getDefinition(type, kind, this.outputCtx);
    }
    temp() {
        if (!this._temporaryAllocated) {
            this._prefix.push(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
            this._temporaryAllocated = true;
        }
        return o.variable(TEMPORARY_NAME);
    }
    convertPropertyBinding(implicit, value) {
        const pipesConvertedValue = value.visit(this._valueConverter);
        const convertedPropertyBinding = convertPropertyBinding(this, implicit, pipesConvertedValue, this.bindingContext(), BindingForm.TrySimple, interpolate);
        this._bindingMode.push(...convertedPropertyBinding.stmts);
        return convertedPropertyBinding.currValExpr;
    }
}
function getQueryPredicate(query, outputCtx) {
    if (query.selectors.length > 1 || (query.selectors.length == 1 && query.selectors[0].value)) {
        const selectors = query.selectors.map(value => value.value);
        selectors.some(value => !value) && error('Found a type among the string selectors expected');
        return outputCtx.constantPool.getConstLiteral(o.literalArr(selectors.map(value => o.literal(value))));
    }
    if (query.selectors.length == 1) {
        const first = query.selectors[0];
        if (first.identifier) {
            return outputCtx.importExpr(first.identifier.reference);
        }
    }
    error('Unexpected query form');
    return o.NULL_EXPR;
}
export function createFactory(type, outputCtx, reflector, queries) {
    let args = [];
    const elementRef = reflector.resolveExternalReference(Identifiers.ElementRef);
    const templateRef = reflector.resolveExternalReference(Identifiers.TemplateRef);
    const viewContainerRef = reflector.resolveExternalReference(Identifiers.ViewContainerRef);
    for (let dependency of type.diDeps) {
        const token = dependency.token;
        if (token) {
            const tokenRef = tokenReference(token);
            if (tokenRef === elementRef) {
                args.push(o.importExpr(R3.injectElementRef).callFn([]));
            }
            else if (tokenRef === templateRef) {
                args.push(o.importExpr(R3.injectTemplateRef).callFn([]));
            }
            else if (tokenRef === viewContainerRef) {
                args.push(o.importExpr(R3.injectViewContainerRef).callFn([]));
            }
            else if (dependency.isAttribute) {
                args.push(o.importExpr(R3.injectAttribute).callFn([o.literal(dependency.token.value)]));
            }
            else {
                const tokenValue = token.identifier != null ? outputCtx.importExpr(tokenRef) : o.literal(tokenRef);
                const directiveInjectArgs = [tokenValue];
                const flags = extractFlags(dependency);
                if (flags != 0 /* Default */) {
                    // Append flag information if other than default.
                    directiveInjectArgs.push(o.literal(flags));
                }
                args.push(o.importExpr(R3.directiveInject).callFn(directiveInjectArgs));
            }
        }
        else {
            unsupported('dependency without a token');
        }
    }
    const queryDefinitions = [];
    for (let query of queries) {
        const predicate = getQueryPredicate(query, outputCtx);
        // e.g. r3.Q(null, somePredicate, false) or r3.Q(null, ['div'], false)
        const parameters = [
            /* memoryIndex */ o.literal(null, o.INFERRED_TYPE),
            /* predicate */ predicate,
            /* descend */ o.literal(query.descendants)
        ];
        if (query.read) {
            parameters.push(outputCtx.importExpr(query.read.identifier.reference));
        }
        queryDefinitions.push(o.importExpr(R3.query).callFn(parameters));
    }
    const createInstance = new o.InstantiateExpr(outputCtx.importExpr(type.reference), args);
    const result = queryDefinitions.length > 0 ? o.literalArr([createInstance, ...queryDefinitions]) :
        createInstance;
    return o.fn([], [new o.ReturnStatement(result)], o.INFERRED_TYPE, null, type.reference.name ? `${type.reference.name}_Factory` : null);
}
function extractFlags(dependency) {
    let flags = 0 /* Default */;
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
    const values = [];
    const attributes = directiveMetadata.hostAttributes;
    for (let key of Object.getOwnPropertyNames(attributes)) {
        const value = attributes[key];
        values.push(o.literal(key), o.literal(value));
    }
    if (values.length > 0) {
        return outputCtx.constantPool.getConstLiteral(o.literalArr(values));
    }
    return null;
}
// Return a host binding function or null if one is not necessary.
function createHostBindingsFunction(directiveMetadata, outputCtx, bindingParser) {
    const statements = [];
    const temporary = function () {
        let declared = false;
        return () => {
            if (!declared) {
                statements.push(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
                declared = true;
            }
            return o.variable(TEMPORARY_NAME);
        };
    }();
    const hostBindingSourceSpan = typeSourceSpan(directiveMetadata.isComponent ? 'Component' : 'Directive', directiveMetadata.type);
    // Calculate the queries
    for (let index = 0; index < directiveMetadata.queries.length; index++) {
        const query = directiveMetadata.queries[index];
        // e.g. r3.qR(tmp = r3.ld(dirIndex)[1]) && (r3.ld(dirIndex)[0].someDir = tmp);
        const getDirectiveMemory = o.importExpr(R3.load).callFn([o.variable('dirIndex')]);
        // The query list is at the query index + 1 because the directive itself is in slot 0.
        const getQueryList = getDirectiveMemory.key(o.literal(index + 1));
        const assignToTemporary = temporary().set(getQueryList);
        const callQueryRefresh = o.importExpr(R3.queryRefresh).callFn([assignToTemporary]);
        const updateDirective = getDirectiveMemory.key(o.literal(0, o.INFERRED_TYPE))
            .prop(query.propertyName)
            .set(query.first ? temporary().prop('first') : temporary());
        const andExpression = callQueryRefresh.and(updateDirective);
        statements.push(andExpression.toStmt());
    }
    const directiveSummary = directiveMetadata.toSummary();
    // Calculate the host property bindings
    const bindings = bindingParser.createBoundHostProperties(directiveSummary, hostBindingSourceSpan);
    const bindingContext = o.importExpr(R3.load).callFn([o.variable('dirIndex')]);
    if (bindings) {
        for (const binding of bindings) {
            const bindingExpr = convertPropertyBinding(null, bindingContext, binding.expression, 'b', BindingForm.TrySimple, () => error('Unexpected interpolation'));
            statements.push(...bindingExpr.stmts);
            statements.push(o.importExpr(R3.elementProperty)
                .callFn([
                o.variable('elIndex'), o.literal(binding.name),
                o.importExpr(R3.bind).callFn([bindingExpr.currValExpr])
            ])
                .toStmt());
        }
    }
    // Calculate host event bindings
    const eventBindings = bindingParser.createDirectiveHostEventAsts(directiveSummary, hostBindingSourceSpan);
    if (eventBindings) {
        for (const binding of eventBindings) {
            const bindingExpr = convertActionBinding(null, bindingContext, binding.handler, 'b', () => error('Unexpected interpolation'));
            const bindingName = binding.name && sanitizeIdentifier(binding.name);
            const typeName = identifierName(directiveMetadata.type);
            const functionName = typeName && bindingName ? `${typeName}_${bindingName}_HostBindingHandler` : null;
            const handler = o.fn([new o.FnParam('$event', o.DYNAMIC_TYPE)], [...bindingExpr.stmts, new o.ReturnStatement(bindingExpr.allowDefault)], o.INFERRED_TYPE, null, functionName);
            statements.push(o.importExpr(R3.listener).callFn([o.literal(binding.name), handler]).toStmt());
        }
    }
    if (statements.length > 0) {
        const typeName = directiveMetadata.type.reference.name;
        return o.fn([new o.FnParam('dirIndex', o.NUMBER_TYPE), new o.FnParam('elIndex', o.NUMBER_TYPE)], statements, o.INFERRED_TYPE, null, typeName ? `${typeName}_HostBindings` : null);
    }
    return null;
}
function conditionallyCreateMapObjectLiteral(keys, outputCtx) {
    if (Object.getOwnPropertyNames(keys).length > 0) {
        return mapToExpression(keys);
    }
    return null;
}
class ValueConverter extends AstMemoryEfficientTransformer {
    constructor(outputCtx, allocateSlot, definePipe) {
        super();
        this.outputCtx = outputCtx;
        this.allocateSlot = allocateSlot;
        this.definePipe = definePipe;
        this.pipeSlots = new Map();
    }
    // AstMemoryEfficientTransformer
    visitPipe(pipe, context) {
        // Allocate a slot to create the pipe
        const slot = this.allocateSlot();
        const slotPseudoLocal = `PIPE:${slot}`;
        const target = new PropertyRead(pipe.span, new ImplicitReceiver(pipe.span), slotPseudoLocal);
        const bindingId = pipeBinding(pipe.args);
        this.definePipe(pipe.name, slotPseudoLocal, slot, o.importExpr(bindingId));
        const value = pipe.exp.visit(this);
        const args = this.visitAll(pipe.args);
        return new FunctionCall(pipe.span, target, [new LiteralPrimitive(pipe.span, slot), value, ...args]);
    }
    visitLiteralArray(array, context) {
        return new BuiltinFunctionCall(array.span, this.visitAll(array.expressions), values => {
            // If the literal has calculated (non-literal) elements transform it into
            // calls to literal factories that compose the literal and will cache intermediate
            // values. Otherwise, just return an literal array that contains the values.
            const literal = o.literalArr(values);
            return values.every(a => a.isConstant()) ?
                this.outputCtx.constantPool.getConstLiteral(literal, true) :
                getLiteralFactory(this.outputCtx, literal);
        });
    }
    visitLiteralMap(map, context) {
        return new BuiltinFunctionCall(map.span, this.visitAll(map.values), values => {
            // If the literal has calculated (non-literal) elements  transform it into
            // calls to literal factories that compose the literal and will cache intermediate
            // values. Otherwise, just return an literal array that contains the values.
            const literal = o.literalMap(values.map((value, index) => ({ key: map.keys[index].key, value, quoted: map.keys[index].quoted })));
            return values.every(a => a.isConstant()) ?
                this.outputCtx.constantPool.getConstLiteral(literal, true) :
                getLiteralFactory(this.outputCtx, literal);
        });
    }
}
function invalid(arg) {
    throw new Error(`Invalid state: Visitor ${this.constructor.name} doesn't handle ${o.constructor.name}`);
}
class ContentProjectionVisitor extends RecursiveTemplateAstVisitor {
    constructor(projectionMap, ngContentSelectors) {
        super();
        this.projectionMap = projectionMap;
        this.ngContentSelectors = ngContentSelectors;
        this.index = 1;
    }
    visitNgContent(ngContent) {
        const selector = this.ngContentSelectors[ngContent.index];
        if (selector == null) {
            error(`could not find selector for index ${ngContent.index} in ${ngContent}`);
        }
        if (!selector || selector === '*') {
            this.projectionMap.set(ngContent, { index: 0 });
        }
        else {
            this.projectionMap.set(ngContent, { index: this.index++, selector });
        }
    }
}
function getContentProjection(nodes, ngContentSelectors) {
    const projectIndexMap = new Map();
    const visitor = new ContentProjectionVisitor(projectIndexMap, ngContentSelectors);
    templateVisitAll(visitor, nodes);
    return projectIndexMap;
}
function parserSelectorToSimpleSelector(selector) {
    const classes = selector.classNames && selector.classNames.length ?
        [8 /* CLASS */, ...selector.classNames] :
        [];
    const elementName = selector.element && selector.element !== '*' ? selector.element : '';
    return [elementName, ...selector.attrs, ...classes];
}
function parserSelectorToNegativeSelector(selector) {
    const classes = selector.classNames && selector.classNames.length ?
        [8 /* CLASS */, ...selector.classNames] :
        [];
    if (selector.element) {
        return [
            1 /* NOT */ | 4 /* ELEMENT */, selector.element, ...selector.attrs, ...classes
        ];
    }
    else if (selector.attrs.length) {
        return [1 /* NOT */ | 2 /* ATTRIBUTE */, ...selector.attrs, ...classes];
    }
    else {
        return selector.classNames && selector.classNames.length ?
            [1 /* NOT */ | 8 /* CLASS */, ...selector.classNames] :
            [];
    }
}
function parserSelectorToR3Selector(selector) {
    const positive = parserSelectorToSimpleSelector(selector);
    const negative = selector.notSelectors && selector.notSelectors.length ?
        selector.notSelectors.map(notSelector => parserSelectorToNegativeSelector(notSelector)) :
        [];
    return positive.concat(...negative);
}
function parseSelectorToR3Selector(selector) {
    const selectors = CssSelector.parse(selector);
    return selectors.map(parserSelectorToR3Selector);
}
function asLiteral(value) {
    if (Array.isArray(value)) {
        return o.literalArr(value.map(asLiteral));
    }
    return o.literal(value, o.INFERRED_TYPE);
}
function mapToExpression(map, quoted = false) {
    return o.literalMap(Object.getOwnPropertyNames(map).map(key => ({ key, quoted, value: asLiteral(map[key]) })));
}
// Parse i18n metas like:
// - "@@id",
// - "description[@@id]",
// - "meaning|description[@@id]"
function parseI18nMeta(i18n) {
    let meaning;
    let description;
    let id;
    if (i18n) {
        // TODO(vicb): figure out how to force a message ID with closure ?
        const idIndex = i18n.indexOf(ID_SEPARATOR);
        const descIndex = i18n.indexOf(MEANING_SEPARATOR);
        let meaningAndDesc;
        [meaningAndDesc, id] =
            (idIndex > -1) ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''];
        [meaning, description] = (descIndex > -1) ?
            [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
            ['', meaningAndDesc];
    }
    return { description, id, meaning };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfdmlld19jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3IzX3ZpZXdfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUEwTCxPQUFPLEVBQUUsY0FBYyxFQUFvQixrQkFBa0IsRUFBRSxjQUFjLEVBQWdCLE1BQU0scUJBQXFCLENBQUM7QUFFMVQsT0FBTyxFQUFDLFdBQVcsRUFBb0IsbUJBQW1CLEVBQWlFLG9CQUFvQixFQUFFLHNCQUFzQixFQUFpQyxNQUFNLHVDQUF1QyxDQUFDO0FBR3RQLE9BQU8sRUFBTSw2QkFBNkIsRUFBK0IsWUFBWSxFQUFFLGdCQUFnQixFQUE0QixnQkFBZ0IsRUFBeUIsWUFBWSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDMU4sT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzNDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RCxPQUFPLEtBQUssQ0FBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzFDLE9BQU8sRUFBa0IsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFeEMsT0FBTyxFQUF3SixtQkFBbUIsRUFBMkIsMkJBQTJCLEVBQWlELE9BQU8sRUFBZSxnQkFBZ0IsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3hXLE9BQU8sRUFBZ0IsS0FBSyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRTdDLE9BQU8sRUFBQyxXQUFXLElBQUksRUFBRSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDbkQsT0FBTyxFQUFDLHdCQUF3QixFQUFhLE1BQU0sWUFBWSxDQUFDO0FBR2hFLG9FQUFvRTtBQUNwRSxNQUFNLFlBQVksR0FBRyxLQUFLLENB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Q0FBQyxDQUFDO1FBRTNDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNsRCxJQUFJLGNBQXNCLENBQUM7UUFDM0IsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO1lBQ2hCLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEYsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUUsY0FBYyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNFLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBQyxXQUFXLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBQyxDQUFDO0FBQ3BDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLCBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5LCBDb21waWxlUGlwZVN1bW1hcnksIENvbXBpbGVRdWVyeU1ldGFkYXRhLCBDb21waWxlVG9rZW5NZXRhZGF0YSwgQ29tcGlsZVR5cGVNZXRhZGF0YSwgQ29tcGlsZVR5cGVTdW1tYXJ5LCBmbGF0dGVuLCBpZGVudGlmaWVyTmFtZSwgcmVuZGVyZXJUeXBlTmFtZSwgc2FuaXRpemVJZGVudGlmaWVyLCB0b2tlblJlZmVyZW5jZSwgdmlld0NsYXNzTmFtZX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0NvbXBpbGVSZWZsZWN0b3J9IGZyb20gJy4uL2NvbXBpbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7QmluZGluZ0Zvcm0sIEJ1aWx0aW5Db252ZXJ0ZXIsIEJ1aWx0aW5GdW5jdGlvbkNhbGwsIENvbnZlcnRQcm9wZXJ0eUJpbmRpbmdSZXN1bHQsIEV2ZW50SGFuZGxlclZhcnMsIExvY2FsUmVzb2x2ZXIsIGNvbnZlcnRBY3Rpb25CaW5kaW5nLCBjb252ZXJ0UHJvcGVydHlCaW5kaW5nLCBjb252ZXJ0UHJvcGVydHlCaW5kaW5nQnVpbHRpbnN9IGZyb20gJy4uL2NvbXBpbGVyX3V0aWwvZXhwcmVzc2lvbl9jb252ZXJ0ZXInO1xuaW1wb3J0IHtDb25zdGFudFBvb2wsIERlZmluaXRpb25LaW5kfSBmcm9tICcuLi9jb25zdGFudF9wb29sJztcbmltcG9ydCB7SW5qZWN0RmxhZ3N9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtBU1QsIEFzdE1lbW9yeUVmZmljaWVudFRyYW5zZm9ybWVyLCBBc3RUcmFuc2Zvcm1lciwgQmluZGluZ1BpcGUsIEZ1bmN0aW9uQ2FsbCwgSW1wbGljaXRSZWNlaXZlciwgTGl0ZXJhbEFycmF5LCBMaXRlcmFsTWFwLCBMaXRlcmFsUHJpbWl0aXZlLCBNZXRob2RDYWxsLCBQYXJzZVNwYW4sIFByb3BlcnR5UmVhZH0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnN9IGZyb20gJy4uL2lkZW50aWZpZXJzJztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3N9IGZyb20gJy4uL2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlU291cmNlU3BhbiwgdHlwZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnLi4vc2VsZWN0b3InO1xuaW1wb3J0IHtCaW5kaW5nUGFyc2VyfSBmcm9tICcuLi90ZW1wbGF0ZV9wYXJzZXIvYmluZGluZ19wYXJzZXInO1xuaW1wb3J0IHtBdHRyQXN0LCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgQm91bmRFdmVudEFzdCwgQm91bmRUZXh0QXN0LCBEaXJlY3RpdmVBc3QsIEVsZW1lbnRBc3QsIEVtYmVkZGVkVGVtcGxhdGVBc3QsIE5nQ29udGVudEFzdCwgUHJvcGVydHlCaW5kaW5nVHlwZSwgUHJvdmlkZXJBc3QsIFF1ZXJ5TWF0Y2gsIFJlY3Vyc2l2ZVRlbXBsYXRlQXN0VmlzaXRvciwgUmVmZXJlbmNlQXN0LCBUZW1wbGF0ZUFzdCwgVGVtcGxhdGVBc3RWaXNpdG9yLCBUZXh0QXN0LCBWYXJpYWJsZUFzdCwgdGVtcGxhdGVWaXNpdEFsbH0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge091dHB1dENvbnRleHQsIGVycm9yfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQge0JVSUxEX09QVElNSVpFUl9DT0xPQ0FURSwgT3V0cHV0TW9kZX0gZnJvbSAnLi9yM190eXBlcyc7XG5cblxuLyoqIE5hbWUgb2YgdGhlIGNvbnRleHQgcGFyYW1ldGVyIHBhc3NlZCBpbnRvIGEgdGVtcGxhdGUgZnVuY3Rpb24gKi9cbmNvbnN0IENPTlRFWFRfTkFNRSA9ICdjdHgnO1xuXG4vKiogTmFtZSBvZiB0aGUgUmVuZGVyRmxhZyBwYXNzZWQgaW50byBhIHRlbXBsYXRlIGZ1bmN0aW9uICovXG5jb25zdCBSRU5ERVJfRkxBR1MgPSAncmYnO1xuXG4vKiogTmFtZSBvZiB0aGUgdGVtcG9yYXJ5IHRvIHVzZSBkdXJpbmcgZGF0YSBiaW5kaW5nICovXG5jb25zdCBURU1QT1JBUllfTkFNRSA9ICdfdCc7XG5cbi8qKiBUaGUgcHJlZml4IHJlZmVyZW5jZSB2YXJpYWJsZXMgKi9cbmNvbnN0IFJFRkVSRU5DRV9QUkVGSVggPSAnX3InO1xuXG4vKiogVGhlIG5hbWUgb2YgdGhlIGltcGxpY2l0IGNvbnRleHQgcmVmZXJlbmNlICovXG5jb25zdCBJTVBMSUNJVF9SRUZFUkVOQ0UgPSAnJGltcGxpY2l0JztcblxuLyoqIE5hbWUgb2YgdGhlIGkxOG4gYXR0cmlidXRlcyAqKi9cbmNvbnN0IEkxOE5fQVRUUiA9ICdpMThuJztcbmNvbnN0IEkxOE5fQVRUUl9QUkVGSVggPSAnaTE4bi0nO1xuXG4vKiogSTE4biBzZXBhcmF0b3JzIGZvciBtZXRhZGF0YSAqKi9cbmNvbnN0IE1FQU5JTkdfU0VQQVJBVE9SID0gJ3wnO1xuY29uc3QgSURfU0VQQVJBVE9SID0gJ0BAJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEaXJlY3RpdmUoXG4gICAgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCBkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIsIG1vZGU6IE91dHB1dE1vZGUpIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcFZhbHVlczoge2tleTogc3RyaW5nLCBxdW90ZWQ6IGJvb2xlYW4sIHZhbHVlOiBvLkV4cHJlc3Npb259W10gPSBbXTtcblxuICBjb25zdCBmaWVsZCA9IChrZXk6IHN0cmluZywgdmFsdWU6IG8uRXhwcmVzc2lvbiB8IG51bGwpID0+IHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGRlZmluaXRpb25NYXBWYWx1ZXMucHVzaCh7a2V5LCB2YWx1ZSwgcXVvdGVkOiBmYWxzZX0pO1xuICAgIH1cbiAgfTtcblxuICAvLyBlLmcuICd0eXBlOiBNeURpcmVjdGl2ZWBcbiAgZmllbGQoJ3R5cGUnLCBvdXRwdXRDdHguaW1wb3J0RXhwcihkaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UpKTtcblxuICAvLyBlLmcuIGBzZWxlY3RvcnM6IFtbJycsICdzb21lRGlyJywgJyddXWBcbiAgZmllbGQoJ3NlbGVjdG9ycycsIGNyZWF0ZURpcmVjdGl2ZVNlbGVjdG9yKGRpcmVjdGl2ZS5zZWxlY3RvciAhKSk7XG5cbiAgLy8gZS5nLiBgZmFjdG9yeTogKCkgPT4gbmV3IE15QXBwKGluamVjdEVsZW1lbnRSZWYoKSlgXG4gIGZpZWxkKCdmYWN0b3J5JywgY3JlYXRlRmFjdG9yeShkaXJlY3RpdmUudHlwZSwgb3V0cHV0Q3R4LCByZWZsZWN0b3IsIGRpcmVjdGl2ZS5xdWVyaWVzKSk7XG5cbiAgLy8gZS5nLiBgaG9zdEJpbmRpbmdzOiAoZGlySW5kZXgsIGVsSW5kZXgpID0+IHsgLi4uIH1cbiAgZmllbGQoJ2hvc3RCaW5kaW5ncycsIGNyZWF0ZUhvc3RCaW5kaW5nc0Z1bmN0aW9uKGRpcmVjdGl2ZSwgb3V0cHV0Q3R4LCBiaW5kaW5nUGFyc2VyKSk7XG5cbiAgLy8gZS5nLiBgYXR0cmlidXRlczogWydyb2xlJywgJ2xpc3Rib3gnXWBcbiAgZmllbGQoJ2F0dHJpYnV0ZXMnLCBjcmVhdGVIb3N0QXR0cmlidXRlc0FycmF5KGRpcmVjdGl2ZSwgb3V0cHV0Q3R4KSk7XG5cbiAgLy8gZS5nICdpbnB1dHM6IHthOiAnYSd9YFxuICBmaWVsZCgnaW5wdXRzJywgY29uZGl0aW9uYWxseUNyZWF0ZU1hcE9iamVjdExpdGVyYWwoZGlyZWN0aXZlLmlucHV0cywgb3V0cHV0Q3R4KSk7XG5cbiAgLy8gZS5nICdvdXRwdXRzOiB7YTogJ2EnfWBcbiAgZmllbGQoJ291dHB1dHMnLCBjb25kaXRpb25hbGx5Q3JlYXRlTWFwT2JqZWN0TGl0ZXJhbChkaXJlY3RpdmUub3V0cHV0cywgb3V0cHV0Q3R4KSk7XG5cbiAgY29uc3QgY2xhc3NOYW1lID0gaWRlbnRpZmllck5hbWUoZGlyZWN0aXZlLnR5cGUpICE7XG4gIGNsYXNzTmFtZSB8fCBlcnJvcihgQ2Fubm90IHJlc29sdmVyIHRoZSBuYW1lIG9mICR7ZGlyZWN0aXZlLnR5cGV9YCk7XG5cbiAgY29uc3QgZGVmaW5pdGlvbkZpZWxkID0gb3V0cHV0Q3R4LmNvbnN0YW50UG9vbC5wcm9wZXJ0eU5hbWVPZihEZWZpbml0aW9uS2luZC5EaXJlY3RpdmUpO1xuICBjb25zdCBkZWZpbml0aW9uRnVuY3Rpb24gPVxuICAgICAgby5pbXBvcnRFeHByKFIzLmRlZmluZURpcmVjdGl2ZSkuY2FsbEZuKFtvLmxpdGVyYWxNYXAoZGVmaW5pdGlvbk1hcFZhbHVlcyldKTtcblxuICBpZiAobW9kZSA9PT0gT3V0cHV0TW9kZS5QYXJ0aWFsQ2xhc3MpIHtcbiAgICAvLyBDcmVhdGUgdGhlIHBhcnRpYWwgY2xhc3MgdG8gYmUgbWVyZ2VkIHdpdGggdGhlIGFjdHVhbCBjbGFzcy5cbiAgICBvdXRwdXRDdHguc3RhdGVtZW50cy5wdXNoKG5ldyBvLkNsYXNzU3RtdChcbiAgICAgICAgLyogbmFtZSAqLyBjbGFzc05hbWUsXG4gICAgICAgIC8qIHBhcmVudCAqLyBudWxsLFxuICAgICAgICAvKiBmaWVsZHMgKi9bbmV3IG8uQ2xhc3NGaWVsZChcbiAgICAgICAgICAgIC8qIG5hbWUgKi8gZGVmaW5pdGlvbkZpZWxkLFxuICAgICAgICAgICAgLyogdHlwZSAqLyBvLklORkVSUkVEX1RZUEUsXG4gICAgICAgICAgICAvKiBtb2RpZmllcnMgKi9bby5TdG10TW9kaWZpZXIuU3RhdGljXSxcbiAgICAgICAgICAgIC8qIGluaXRpYWxpemVyICovIGRlZmluaXRpb25GdW5jdGlvbildLFxuICAgICAgICAvKiBnZXR0ZXJzICovW10sXG4gICAgICAgIC8qIGNvbnN0cnVjdG9yTWV0aG9kICovIG5ldyBvLkNsYXNzTWV0aG9kKG51bGwsIFtdLCBbXSksXG4gICAgICAgIC8qIG1ldGhvZHMgKi9bXSkpO1xuICB9IGVsc2Uge1xuICAgIC8vIENyZWF0ZSBiYWNrLXBhdGNoIGRlZmluaXRpb24uXG4gICAgY29uc3QgY2xhc3NSZWZlcmVuY2UgPSBvdXRwdXRDdHguaW1wb3J0RXhwcihkaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBiYWNrLXBhdGNoIHN0YXRlbWVudFxuICAgIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2gobmV3IG8uQ29tbWVudFN0bXQoQlVJTERfT1BUSU1JWkVSX0NPTE9DQVRFKSk7XG4gICAgb3V0cHV0Q3R4LnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgY2xhc3NSZWZlcmVuY2UucHJvcChkZWZpbml0aW9uRmllbGQpLnNldChkZWZpbml0aW9uRnVuY3Rpb24pLnRvU3RtdCgpKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUNvbXBvbmVudChcbiAgICBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQsIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgIHBpcGVTdW1tYXJpZXM6IENvbXBpbGVQaXBlU3VtbWFyeVtdLCB0ZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSwgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIsIG1vZGU6IE91dHB1dE1vZGUpIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcFZhbHVlczoge2tleTogc3RyaW5nLCBxdW90ZWQ6IGJvb2xlYW4sIHZhbHVlOiBvLkV4cHJlc3Npb259W10gPSBbXTtcblxuICAvLyBQaXBlcyBhbmQgRGlyZWN0aXZlcyBmb3VuZCBpbiB0aGUgdGVtcGxhdGVcbiAgY29uc3QgcGlwZXMgPSBuZXcgU2V0PGFueT4oKTtcbiAgY29uc3QgZGlyZWN0aXZlcyA9IG5ldyBTZXQ8YW55PigpO1xuXG4gIGNvbnN0IGZpZWxkID0gKGtleTogc3RyaW5nLCB2YWx1ZTogby5FeHByZXNzaW9uIHwgbnVsbCkgPT4ge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgZGVmaW5pdGlvbk1hcFZhbHVlcy5wdXNoKHtrZXksIHZhbHVlLCBxdW90ZWQ6IGZhbHNlfSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGUuZy4gYHR5cGU6IE15QXBwYFxuICBmaWVsZCgndHlwZScsIG91dHB1dEN0eC5pbXBvcnRFeHByKGNvbXBvbmVudC50eXBlLnJlZmVyZW5jZSkpO1xuXG4gIC8vIGUuZy4gYHNlbGVjdG9yczogW1snbXktYXBwJ11dYFxuICBmaWVsZCgnc2VsZWN0b3JzJywgY3JlYXRlRGlyZWN0aXZlU2VsZWN0b3IoY29tcG9uZW50LnNlbGVjdG9yICEpKTtcblxuICBjb25zdCBzZWxlY3RvciA9IGNvbXBvbmVudC5zZWxlY3RvciAmJiBDc3NTZWxlY3Rvci5wYXJzZShjb21wb25lbnQuc2VsZWN0b3IpO1xuICBjb25zdCBmaXJzdFNlbGVjdG9yID0gc2VsZWN0b3IgJiYgc2VsZWN0b3JbMF07XG5cbiAgLy8gZS5nLiBgYXR0cjogW1wiY2xhc3NcIiwgXCIubXkuYXBwXCJdXG4gIC8vIFRoaXMgaXMgb3B0aW9uYWwgYW4gb25seSBpbmNsdWRlZCBpZiB0aGUgZmlyc3Qgc2VsZWN0b3Igb2YgYSBjb21wb25lbnQgc3BlY2lmaWVzIGF0dHJpYnV0ZXMuXG4gIGlmIChmaXJzdFNlbGVjdG9yKSB7XG4gICAgY29uc3Qgc2VsZWN0b3JBdHRyaWJ1dGVzID0gZmlyc3RTZWxlY3Rvci5nZXRBdHRycygpO1xuICAgIGlmIChzZWxlY3RvckF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgICBmaWVsZChcbiAgICAgICAgICAnYXR0cnMnLCBvdXRwdXRDdHguY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChcbiAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsQXJyKHNlbGVjdG9yQXR0cmlidXRlcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9PiB2YWx1ZSAhPSBudWxsID8gby5saXRlcmFsKHZhbHVlKSA6IG8ubGl0ZXJhbCh1bmRlZmluZWQpKSksXG4gICAgICAgICAgICAgICAgICAgICAgIC8qIGZvcmNlU2hhcmVkICovIHRydWUpKTtcbiAgICB9XG4gIH1cblxuICAvLyBlLmcuIGBmYWN0b3J5OiBmdW5jdGlvbiBNeUFwcF9GYWN0b3J5KCkgeyByZXR1cm4gbmV3IE15QXBwKGluamVjdEVsZW1lbnRSZWYoKSk7IH1gXG4gIGZpZWxkKCdmYWN0b3J5JywgY3JlYXRlRmFjdG9yeShjb21wb25lbnQudHlwZSwgb3V0cHV0Q3R4LCByZWZsZWN0b3IsIGNvbXBvbmVudC5xdWVyaWVzKSk7XG5cbiAgLy8gZS5nIGBob3N0QmluZGluZ3M6IGZ1bmN0aW9uIE15QXBwX0hvc3RCaW5kaW5ncyB7IC4uLiB9XG4gIGZpZWxkKCdob3N0QmluZGluZ3MnLCBjcmVhdGVIb3N0QmluZGluZ3NGdW5jdGlvbihjb21wb25lbnQsIG91dHB1dEN0eCwgYmluZGluZ1BhcnNlcikpO1xuXG4gIC8vIGUuZy4gYHRlbXBsYXRlOiBmdW5jdGlvbiBNeUNvbXBvbmVudF9UZW1wbGF0ZShfY3R4LCBfY20pIHsuLi59YFxuICBjb25zdCB0ZW1wbGF0ZVR5cGVOYW1lID0gY29tcG9uZW50LnR5cGUucmVmZXJlbmNlLm5hbWU7XG4gIGNvbnN0IHRlbXBsYXRlTmFtZSA9IHRlbXBsYXRlVHlwZU5hbWUgPyBgJHt0ZW1wbGF0ZVR5cGVOYW1lfV9UZW1wbGF0ZWAgOiBudWxsO1xuICBjb25zdCBwaXBlTWFwID1cbiAgICAgIG5ldyBNYXAocGlwZVN1bW1hcmllcy5tYXA8W3N0cmluZywgQ29tcGlsZVBpcGVTdW1tYXJ5XT4ocGlwZSA9PiBbcGlwZS5uYW1lLCBwaXBlXSkpO1xuICBjb25zdCB0ZW1wbGF0ZUZ1bmN0aW9uRXhwcmVzc2lvbiA9XG4gICAgICBuZXcgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcihcbiAgICAgICAgICBvdXRwdXRDdHgsIG91dHB1dEN0eC5jb25zdGFudFBvb2wsIHJlZmxlY3RvciwgQ09OVEVYVF9OQU1FLCBCaW5kaW5nU2NvcGUuUk9PVF9TQ09QRSwgMCxcbiAgICAgICAgICBjb21wb25lbnQudGVtcGxhdGUgIS5uZ0NvbnRlbnRTZWxlY3RvcnMsIHRlbXBsYXRlVHlwZU5hbWUsIHRlbXBsYXRlTmFtZSwgcGlwZU1hcCxcbiAgICAgICAgICBjb21wb25lbnQudmlld1F1ZXJpZXMsIGRpcmVjdGl2ZXMsIHBpcGVzKVxuICAgICAgICAgIC5idWlsZFRlbXBsYXRlRnVuY3Rpb24odGVtcGxhdGUsIFtdKTtcblxuICBmaWVsZCgndGVtcGxhdGUnLCB0ZW1wbGF0ZUZ1bmN0aW9uRXhwcmVzc2lvbik7XG5cbiAgLy8gZS5nLiBgZGlyZWN0aXZlczogW015RGlyZWN0aXZlXWBcbiAgaWYgKGRpcmVjdGl2ZXMuc2l6ZSkge1xuICAgIGNvbnN0IGV4cHJlc3Npb25zID0gQXJyYXkuZnJvbShkaXJlY3RpdmVzKS5tYXAoZCA9PiBvdXRwdXRDdHguaW1wb3J0RXhwcihkKSk7XG4gICAgZmllbGQoJ2RpcmVjdGl2ZXMnLCBvLmxpdGVyYWxBcnIoZXhwcmVzc2lvbnMpKTtcbiAgfVxuXG4gIC8vIGUuZy4gYHBpcGVzOiBbTXlQaXBlXWBcbiAgaWYgKHBpcGVzLnNpemUpIHtcbiAgICBjb25zdCBleHByZXNzaW9ucyA9IEFycmF5LmZyb20ocGlwZXMpLm1hcChwID0+IG91dHB1dEN0eC5pbXBvcnRFeHByKHApKTtcbiAgICBmaWVsZCgncGlwZXMnLCBvLmxpdGVyYWxBcnIoZXhwcmVzc2lvbnMpKTtcbiAgfVxuXG4gIC8vIGUuZyBgaW5wdXRzOiB7YTogJ2EnfWBcbiAgZmllbGQoJ2lucHV0cycsIGNvbmRpdGlvbmFsbHlDcmVhdGVNYXBPYmplY3RMaXRlcmFsKGNvbXBvbmVudC5pbnB1dHMsIG91dHB1dEN0eCkpO1xuXG4gIC8vIGUuZyAnb3V0cHV0czoge2E6ICdhJ31gXG4gIGZpZWxkKCdvdXRwdXRzJywgY29uZGl0aW9uYWxseUNyZWF0ZU1hcE9iamVjdExpdGVyYWwoY29tcG9uZW50Lm91dHB1dHMsIG91dHB1dEN0eCkpO1xuXG4gIC8vIGUuZy4gYGZlYXR1cmVzOiBbTmdPbkNoYW5nZXNGZWF0dXJlKE15Q29tcG9uZW50KV1gXG4gIGNvbnN0IGZlYXR1cmVzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICBpZiAoY29tcG9uZW50LnR5cGUubGlmZWN5Y2xlSG9va3Muc29tZShsaWZlY3ljbGUgPT4gbGlmZWN5Y2xlID09IExpZmVjeWNsZUhvb2tzLk9uQ2hhbmdlcykpIHtcbiAgICBmZWF0dXJlcy5wdXNoKG8uaW1wb3J0RXhwcihSMy5OZ09uQ2hhbmdlc0ZlYXR1cmUsIG51bGwsIG51bGwpLmNhbGxGbihbb3V0cHV0Q3R4LmltcG9ydEV4cHIoXG4gICAgICAgIGNvbXBvbmVudC50eXBlLnJlZmVyZW5jZSldKSk7XG4gIH1cbiAgaWYgKGZlYXR1cmVzLmxlbmd0aCkge1xuICAgIGZpZWxkKCdmZWF0dXJlcycsIG8ubGl0ZXJhbEFycihmZWF0dXJlcykpO1xuICB9XG5cbiAgY29uc3QgZGVmaW5pdGlvbkZpZWxkID0gb3V0cHV0Q3R4LmNvbnN0YW50UG9vbC5wcm9wZXJ0eU5hbWVPZihEZWZpbml0aW9uS2luZC5Db21wb25lbnQpO1xuICBjb25zdCBkZWZpbml0aW9uRnVuY3Rpb24gPVxuICAgICAgby5pbXBvcnRFeHByKFIzLmRlZmluZUNvbXBvbmVudCkuY2FsbEZuKFtvLmxpdGVyYWxNYXAoZGVmaW5pdGlvbk1hcFZhbHVlcyldKTtcbiAgaWYgKG1vZGUgPT09IE91dHB1dE1vZGUuUGFydGlhbENsYXNzKSB7XG4gICAgY29uc3QgY2xhc3NOYW1lID0gaWRlbnRpZmllck5hbWUoY29tcG9uZW50LnR5cGUpICE7XG4gICAgY2xhc3NOYW1lIHx8IGVycm9yKGBDYW5ub3QgcmVzb2x2ZXIgdGhlIG5hbWUgb2YgJHtjb21wb25lbnQudHlwZX1gKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgcGFydGlhbCBjbGFzcyB0byBiZSBtZXJnZWQgd2l0aCB0aGUgYWN0dWFsIGNsYXNzLlxuICAgIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2gobmV3IG8uQ2xhc3NTdG10KFxuICAgICAgICAvKiBuYW1lICovIGNsYXNzTmFtZSxcbiAgICAgICAgLyogcGFyZW50ICovIG51bGwsXG4gICAgICAgIC8qIGZpZWxkcyAqL1tuZXcgby5DbGFzc0ZpZWxkKFxuICAgICAgICAgICAgLyogbmFtZSAqLyBkZWZpbml0aW9uRmllbGQsXG4gICAgICAgICAgICAvKiB0eXBlICovIG8uSU5GRVJSRURfVFlQRSxcbiAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqL1tvLlN0bXRNb2RpZmllci5TdGF0aWNdLFxuICAgICAgICAgICAgLyogaW5pdGlhbGl6ZXIgKi8gZGVmaW5pdGlvbkZ1bmN0aW9uKV0sXG4gICAgICAgIC8qIGdldHRlcnMgKi9bXSxcbiAgICAgICAgLyogY29uc3RydWN0b3JNZXRob2QgKi8gbmV3IG8uQ2xhc3NNZXRob2QobnVsbCwgW10sIFtdKSxcbiAgICAgICAgLyogbWV0aG9kcyAqL1tdKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgY2xhc3NSZWZlcmVuY2UgPSBvdXRwdXRDdHguaW1wb3J0RXhwcihjb21wb25lbnQudHlwZS5yZWZlcmVuY2UpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBiYWNrLXBhdGNoIHN0YXRlbWVudFxuICAgIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgIG5ldyBvLkNvbW1lbnRTdG10KEJVSUxEX09QVElNSVpFUl9DT0xPQ0FURSksXG4gICAgICAgIGNsYXNzUmVmZXJlbmNlLnByb3AoZGVmaW5pdGlvbkZpZWxkKS5zZXQoZGVmaW5pdGlvbkZ1bmN0aW9uKS50b1N0bXQoKSk7XG4gIH1cbn1cblxuLy8gVE9ETzogUmVtb3ZlIHRoZXNlIHdoZW4gdGhlIHRoaW5ncyBhcmUgZnVsbHkgc3VwcG9ydGVkXG5mdW5jdGlvbiB1bmtub3duPFQ+KGFyZzogby5FeHByZXNzaW9uIHwgby5TdGF0ZW1lbnQgfCBUZW1wbGF0ZUFzdCk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYEJ1aWxkZXIgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGlzIHVuYWJsZSB0byBoYW5kbGUgJHthcmcuY29uc3RydWN0b3IubmFtZX0geWV0YCk7XG59XG5cbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKGZlYXR1cmU6IHN0cmluZyk6IG5ldmVyIHtcbiAgaWYgKHRoaXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJ1aWxkZXIgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGRvZXNuJ3Qgc3VwcG9ydCAke2ZlYXR1cmV9IHlldGApO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgRmVhdHVyZSAke2ZlYXR1cmV9IGlzIG5vdCBzdXBwb3J0ZWQgeWV0YCk7XG59XG5cbmNvbnN0IEJJTkRJTkdfSU5TVFJVQ1RJT05fTUFQOiB7W2luZGV4OiBudW1iZXJdOiBvLkV4dGVybmFsUmVmZXJlbmNlIHwgdW5kZWZpbmVkfSA9IHtcbiAgW1Byb3BlcnR5QmluZGluZ1R5cGUuUHJvcGVydHldOiBSMy5lbGVtZW50UHJvcGVydHksXG4gIFtQcm9wZXJ0eUJpbmRpbmdUeXBlLkF0dHJpYnV0ZV06IFIzLmVsZW1lbnRBdHRyaWJ1dGUsXG4gIFtQcm9wZXJ0eUJpbmRpbmdUeXBlLkNsYXNzXTogUjMuZWxlbWVudENsYXNzTmFtZWQsXG4gIFtQcm9wZXJ0eUJpbmRpbmdUeXBlLlN0eWxlXTogUjMuZWxlbWVudFN0eWxlTmFtZWRcbn07XG5cbmZ1bmN0aW9uIGludGVycG9sYXRlKGFyZ3M6IG8uRXhwcmVzc2lvbltdKTogby5FeHByZXNzaW9uIHtcbiAgYXJncyA9IGFyZ3Muc2xpY2UoMSk7ICAvLyBJZ25vcmUgdGhlIGxlbmd0aCBwcmVmaXggYWRkZWQgZm9yIHJlbmRlcjJcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjEpLmNhbGxGbihhcmdzKTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb24yKS5jYWxsRm4oYXJncyk7XG4gICAgY2FzZSA3OlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnRlcnBvbGF0aW9uMykuY2FsbEZuKGFyZ3MpO1xuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjQpLmNhbGxGbihhcmdzKTtcbiAgICBjYXNlIDExOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnRlcnBvbGF0aW9uNSkuY2FsbEZuKGFyZ3MpO1xuICAgIGNhc2UgMTM6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb242KS5jYWxsRm4oYXJncyk7XG4gICAgY2FzZSAxNTpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjcpLmNhbGxGbihhcmdzKTtcbiAgICBjYXNlIDE3OlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnRlcnBvbGF0aW9uOCkuY2FsbEZuKGFyZ3MpO1xuICB9XG4gIChhcmdzLmxlbmd0aCA+PSAxOSAmJiBhcmdzLmxlbmd0aCAlIDIgPT0gMSkgfHxcbiAgICAgIGVycm9yKGBJbnZhbGlkIGludGVycG9sYXRpb24gYXJndW1lbnQgbGVuZ3RoICR7YXJncy5sZW5ndGh9YCk7XG4gIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvblYpLmNhbGxGbihbby5saXRlcmFsQXJyKGFyZ3MpXSk7XG59XG5cbmZ1bmN0aW9uIHBpcGVCaW5kaW5nKGFyZ3M6IG8uRXhwcmVzc2lvbltdKTogby5FeHRlcm5hbFJlZmVyZW5jZSB7XG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIHRvIHBpcGVCaW5kIGlzIGFsd2F5cyB0aGUgdmFsdWUgdG8gYmUgdHJhbnNmb3JtZWQgZm9sbG93ZWRcbiAgICAgIC8vIGJ5IGFyZy5sZW5ndGggYXJndW1lbnRzIHNvIHRoZSB0b3RhbCBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHBpcGVCaW5kIGFyZVxuICAgICAgLy8gYXJnLmxlbmd0aCArIDEuXG4gICAgICByZXR1cm4gUjMucGlwZUJpbmQxO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBSMy5waXBlQmluZDI7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIFIzLnBpcGVCaW5kMztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFIzLnBpcGVCaW5kVjtcbiAgfVxufVxuXG5jb25zdCBwdXJlRnVuY3Rpb25JZGVudGlmaWVycyA9IFtcbiAgUjMucHVyZUZ1bmN0aW9uMCwgUjMucHVyZUZ1bmN0aW9uMSwgUjMucHVyZUZ1bmN0aW9uMiwgUjMucHVyZUZ1bmN0aW9uMywgUjMucHVyZUZ1bmN0aW9uNCxcbiAgUjMucHVyZUZ1bmN0aW9uNSwgUjMucHVyZUZ1bmN0aW9uNiwgUjMucHVyZUZ1bmN0aW9uNywgUjMucHVyZUZ1bmN0aW9uOFxuXTtcbmZ1bmN0aW9uIGdldExpdGVyYWxGYWN0b3J5KFxuICAgIG91dHB1dENvbnRleHQ6IE91dHB1dENvbnRleHQsIGxpdGVyYWw6IG8uTGl0ZXJhbEFycmF5RXhwciB8IG8uTGl0ZXJhbE1hcEV4cHIpOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCB7bGl0ZXJhbEZhY3RvcnksIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzfSA9XG4gICAgICBvdXRwdXRDb250ZXh0LmNvbnN0YW50UG9vbC5nZXRMaXRlcmFsRmFjdG9yeShsaXRlcmFsKTtcbiAgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMubGVuZ3RoID4gMCB8fCBlcnJvcihgRXhwZWN0ZWQgYXJndW1lbnRzIHRvIGEgbGl0ZXJhbCBmYWN0b3J5IGZ1bmN0aW9uYCk7XG4gIGxldCBwdXJlRnVuY3Rpb25JZGVudCA9XG4gICAgICBwdXJlRnVuY3Rpb25JZGVudGlmaWVyc1tsaXRlcmFsRmFjdG9yeUFyZ3VtZW50cy5sZW5ndGhdIHx8IFIzLnB1cmVGdW5jdGlvblY7XG5cbiAgLy8gTGl0ZXJhbCBmYWN0b3JpZXMgYXJlIHB1cmUgZnVuY3Rpb25zIHRoYXQgb25seSBuZWVkIHRvIGJlIHJlLWludm9rZWQgd2hlbiB0aGUgcGFyYW1ldGVyc1xuICAvLyBjaGFuZ2UuXG4gIHJldHVybiBvLmltcG9ydEV4cHIocHVyZUZ1bmN0aW9uSWRlbnQpLmNhbGxGbihbbGl0ZXJhbEZhY3RvcnksIC4uLmxpdGVyYWxGYWN0b3J5QXJndW1lbnRzXSk7XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vKipcbiAqIEZ1bmN0aW9uIHdoaWNoIGlzIGV4ZWN1dGVkIHdoZW5ldmVyIGEgdmFyaWFibGUgaXMgcmVmZXJlbmNlZCBmb3IgdGhlIGZpcnN0IHRpbWUgaW4gYSBnaXZlblxuICogc2NvcGUuXG4gKlxuICogSXQgaXMgZXhwZWN0ZWQgdGhhdCB0aGUgZnVuY3Rpb24gY3JlYXRlcyB0aGUgYGNvbnN0IGxvY2FsTmFtZSA9IGV4cHJlc3Npb25gOyBzdGF0ZW1lbnQuXG4gKi9cbnR5cGUgRGVjbGFyZUxvY2FsVmFyQ2FsbGJhY2sgPSAobGhzVmFyOiBvLlJlYWRWYXJFeHByLCByaHNFeHByZXNzaW9uOiBvLkV4cHJlc3Npb24pID0+IHZvaWQ7XG5cbmNsYXNzIEJpbmRpbmdTY29wZSBpbXBsZW1lbnRzIExvY2FsUmVzb2x2ZXIge1xuICAvKipcbiAgICogS2VlcHMgYSBtYXAgZnJvbSBsb2NhbCB2YXJpYWJsZXMgdG8gdGhlaXIgZXhwcmVzc2lvbnMuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCB3aGVuIG9uZSByZWZlcnMgdG8gdmFyaWFibGUgc3VjaCBhczogJ2xldCBhYmMgPSBhLmIuY2AuXG4gICAqIC0ga2V5IHRvIHRoZSBtYXAgaXMgdGhlIHN0cmluZyBsaXRlcmFsIGBcImFiY1wiYC5cbiAgICogLSB2YWx1ZSBgbGhzYCBpcyB0aGUgbGVmdCBoYW5kIHNpZGUgd2hpY2ggaXMgYW4gQVNUIHJlcHJlc2VudGluZyBgYWJjYC5cbiAgICogLSB2YWx1ZSBgcmhzYCBpcyB0aGUgcmlnaHQgaGFuZCBzaWRlIHdoaWNoIGlzIGFuIEFTVCByZXByZXNlbnRpbmcgYGEuYi5jYC5cbiAgICogLSB2YWx1ZSBgZGVjbGFyZWRgIGlzIHRydWUgaWYgdGhlIGBkZWNsYXJlTG9jYWxWYXJDYWxsYmFja2AgaGFzIGJlZW4gY2FsbGVkIGZvciB0aGlzIHNjb3BlXG4gICAqIGFscmVhZHkuXG4gICAqL1xuICBwcml2YXRlIG1hcCA9IG5ldyBNYXAgPCBzdHJpbmcsIHtcbiAgICBsaHM6IG8uUmVhZFZhckV4cHI7XG4gICAgcmhzOiBvLkV4cHJlc3Npb258dW5kZWZpbmVkO1xuICAgIGRlY2xhcmVkOiBib29sZWFuO1xuICB9XG4gID4gKCk7XG4gIHByaXZhdGUgcmVmZXJlbmNlTmFtZUluZGV4ID0gMDtcblxuICBzdGF0aWMgUk9PVF9TQ09QRSA9IG5ldyBCaW5kaW5nU2NvcGUoKS5zZXQoJyRldmVudCcsIG8udmFyaWFibGUoJyRldmVudCcpKTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBwYXJlbnQ6IEJpbmRpbmdTY29wZXxudWxsID0gbnVsbCxcbiAgICAgIHByaXZhdGUgZGVjbGFyZUxvY2FsVmFyQ2FsbGJhY2s6IERlY2xhcmVMb2NhbFZhckNhbGxiYWNrID0gbm9vcCkge31cblxuICBnZXQobmFtZTogc3RyaW5nKTogby5FeHByZXNzaW9ufG51bGwge1xuICAgIGxldCBjdXJyZW50OiBCaW5kaW5nU2NvcGV8bnVsbCA9IHRoaXM7XG4gICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgIGxldCB2YWx1ZSA9IGN1cnJlbnQubWFwLmdldChuYW1lKTtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjdXJyZW50ICE9PSB0aGlzKSB7XG4gICAgICAgICAgLy8gbWFrZSBhIGxvY2FsIGNvcHkgYW5kIHJlc2V0IHRoZSBgZGVjbGFyZWRgIHN0YXRlLlxuICAgICAgICAgIHZhbHVlID0ge2xoczogdmFsdWUubGhzLCByaHM6IHZhbHVlLnJocywgZGVjbGFyZWQ6IGZhbHNlfTtcbiAgICAgICAgICAvLyBDYWNoZSB0aGUgdmFsdWUgbG9jYWxseS5cbiAgICAgICAgICB0aGlzLm1hcC5zZXQobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZS5yaHMgJiYgIXZhbHVlLmRlY2xhcmVkKSB7XG4gICAgICAgICAgLy8gaWYgaXQgaXMgZmlyc3QgdGltZSB3ZSBhcmUgcmVmZXJlbmNpbmcgdGhlIHZhcmlhYmxlIGluIHRoZSBzY29wZVxuICAgICAgICAgIC8vIHRoYW4gaW52b2tlIHRoZSBjYWxsYmFjayB0byBpbnNlcnQgdmFyaWFibGUgZGVjbGFyYXRpb24uXG4gICAgICAgICAgdGhpcy5kZWNsYXJlTG9jYWxWYXJDYWxsYmFjayh2YWx1ZS5saHMsIHZhbHVlLnJocyk7XG4gICAgICAgICAgdmFsdWUuZGVjbGFyZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZS5saHM7XG4gICAgICB9XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxvY2FsIHZhcmlhYmxlIGZvciBsYXRlciByZWZlcmVuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgKiBAcGFyYW0gbGhzIEFTVCByZXByZXNlbnRpbmcgdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHRoZSBgbGV0IGxocyA9IHJocztgLlxuICAgKiBAcGFyYW0gcmhzIEFTVCByZXByZXNlbnRpbmcgdGhlIHJpZ2h0IGhhbmQgc2lkZSBvZiB0aGUgYGxldCBsaHMgPSByaHM7YC4gVGhlIGByaHNgIGNhbiBiZVxuICAgKiBgdW5kZWZpbmVkYCBmb3IgdmFyaWFibGUgdGhhdCBhcmUgYW1iaWVudCBzdWNoIGFzIGAkZXZlbnRgIGFuZCB3aGljaCBkb24ndCBoYXZlIGByaHNgXG4gICAqIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgc2V0KG5hbWU6IHN0cmluZywgbGhzOiBvLlJlYWRWYXJFeHByLCByaHM/OiBvLkV4cHJlc3Npb24pOiBCaW5kaW5nU2NvcGUge1xuICAgICF0aGlzLm1hcC5oYXMobmFtZSkgfHxcbiAgICAgICAgZXJyb3IoYFRoZSBuYW1lICR7bmFtZX0gaXMgYWxyZWFkeSBkZWZpbmVkIGluIHNjb3BlIHRvIGJlICR7dGhpcy5tYXAuZ2V0KG5hbWUpfWApO1xuICAgIHRoaXMubWFwLnNldChuYW1lLCB7bGhzOiBsaHMsIHJoczogcmhzLCBkZWNsYXJlZDogZmFsc2V9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldExvY2FsKG5hbWU6IHN0cmluZyk6IChvLkV4cHJlc3Npb258bnVsbCkgeyByZXR1cm4gdGhpcy5nZXQobmFtZSk7IH1cblxuICBuZXN0ZWRTY29wZShkZWNsYXJlQ2FsbGJhY2s6IERlY2xhcmVMb2NhbFZhckNhbGxiYWNrKTogQmluZGluZ1Njb3BlIHtcbiAgICByZXR1cm4gbmV3IEJpbmRpbmdTY29wZSh0aGlzLCBkZWNsYXJlQ2FsbGJhY2spO1xuICB9XG5cbiAgZnJlc2hSZWZlcmVuY2VOYW1lKCk6IHN0cmluZyB7XG4gICAgbGV0IGN1cnJlbnQ6IEJpbmRpbmdTY29wZSA9IHRoaXM7XG4gICAgLy8gRmluZCB0aGUgdG9wIHNjb3BlIGFzIGl0IG1haW50YWlucyB0aGUgZ2xvYmFsIHJlZmVyZW5jZSBjb3VudFxuICAgIHdoaWxlIChjdXJyZW50LnBhcmVudCkgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgIGNvbnN0IHJlZiA9IGAke1JFRkVSRU5DRV9QUkVGSVh9JHtjdXJyZW50LnJlZmVyZW5jZU5hbWVJbmRleCsrfWA7XG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuXG4vLyBQYXN0ZWQgZnJvbSByZW5kZXIzL2ludGVyZmFjZXMvZGVmaW5pdGlvbiBzaW5jZSBpdCBjYW5ub3QgYmUgcmVmZXJlbmNlZCBkaXJlY3RseVxuLyoqXG4gKiBGbGFncyBwYXNzZWQgaW50byB0ZW1wbGF0ZSBmdW5jdGlvbnMgdG8gZGV0ZXJtaW5lIHdoaWNoIGJsb2NrcyAoaS5lLiBjcmVhdGlvbiwgdXBkYXRlKVxuICogc2hvdWxkIGJlIGV4ZWN1dGVkLlxuICpcbiAqIFR5cGljYWxseSwgYSB0ZW1wbGF0ZSBydW5zIGJvdGggdGhlIGNyZWF0aW9uIGJsb2NrIGFuZCB0aGUgdXBkYXRlIGJsb2NrIG9uIGluaXRpYWxpemF0aW9uIGFuZFxuICogc3Vic2VxdWVudCBydW5zIG9ubHkgZXhlY3V0ZSB0aGUgdXBkYXRlIGJsb2NrLiBIb3dldmVyLCBkeW5hbWljYWxseSBjcmVhdGVkIHZpZXdzIHJlcXVpcmUgdGhhdFxuICogdGhlIGNyZWF0aW9uIGJsb2NrIGJlIGV4ZWN1dGVkIHNlcGFyYXRlbHkgZnJvbSB0aGUgdXBkYXRlIGJsb2NrIChmb3IgYmFja3dhcmRzIGNvbXBhdCkuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFJlbmRlckZsYWdzIHtcbiAgLyogV2hldGhlciB0byBydW4gdGhlIGNyZWF0aW9uIGJsb2NrIChlLmcuIGNyZWF0ZSBlbGVtZW50cyBhbmQgZGlyZWN0aXZlcykgKi9cbiAgQ3JlYXRlID0gMGIwMSxcblxuICAvKiBXaGV0aGVyIHRvIHJ1biB0aGUgdXBkYXRlIGJsb2NrIChlLmcuIHJlZnJlc2ggYmluZGluZ3MpICovXG4gIFVwZGF0ZSA9IDBiMTBcbn1cblxuY2xhc3MgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0VmlzaXRvciwgTG9jYWxSZXNvbHZlciB7XG4gIHByaXZhdGUgX2RhdGFJbmRleCA9IDA7XG4gIHByaXZhdGUgX2JpbmRpbmdDb250ZXh0ID0gMDtcbiAgcHJpdmF0ZSBfdGVtcG9yYXJ5QWxsb2NhdGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX3ByZWZpeDogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICBwcml2YXRlIF9jcmVhdGlvbk1vZGU6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgcHJpdmF0ZSBfdmFyaWFibGVNb2RlOiBvLlN0YXRlbWVudFtdID0gW107XG4gIHByaXZhdGUgX2JpbmRpbmdNb2RlOiBvLlN0YXRlbWVudFtdID0gW107XG4gIHByaXZhdGUgX3Bvc3RmaXg6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgcHJpdmF0ZSBfY29udGVudFByb2plY3Rpb25zOiBNYXA8TmdDb250ZW50QXN0LCBOZ0NvbnRlbnRJbmZvPjtcbiAgcHJpdmF0ZSBfcHJvamVjdGlvbkRlZmluaXRpb25JbmRleCA9IDA7XG4gIHByaXZhdGUgX3ZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcjtcbiAgcHJpdmF0ZSB1bnN1cHBvcnRlZCA9IHVuc3VwcG9ydGVkO1xuICBwcml2YXRlIGludmFsaWQgPSBpbnZhbGlkO1xuICBwcml2YXRlIGJpbmRpbmdTY29wZTogQmluZGluZ1Njb3BlO1xuXG4gIC8vIFdoZXRoZXIgd2UgYXJlIGluc2lkZSBhIHRyYW5zbGF0YWJsZSBlbGVtZW50IChgPHAgaTE4bj4uLi4gc29tZXdoZXJlIGhlcmUgLi4uIDwvcD4pXG4gIHByaXZhdGUgX2luSTE4blNlY3Rpb246IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfaTE4blNlY3Rpb25JbmRleCA9IC0xO1xuICAvLyBNYXBzIG9mIHBsYWNlaG9sZGVyIHRvIG5vZGUgaW5kZXhlcyBmb3IgZWFjaCBvZiB0aGUgaTE4biBzZWN0aW9uXG4gIHByaXZhdGUgX3BoVG9Ob2RlSWR4ZXM6IHtbcGhOYW1lOiBzdHJpbmddOiBudW1iZXJbXX1bXSA9IFt7fV07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgcHJpdmF0ZSBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCxcbiAgICAgIHByaXZhdGUgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLCBwcml2YXRlIGNvbnRleHRQYXJhbWV0ZXI6IHN0cmluZyxcbiAgICAgIHBhcmVudEJpbmRpbmdTY29wZTogQmluZGluZ1Njb3BlLCBwcml2YXRlIGxldmVsID0gMCwgcHJpdmF0ZSBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdLFxuICAgICAgcHJpdmF0ZSBjb250ZXh0TmFtZTogc3RyaW5nfG51bGwsIHByaXZhdGUgdGVtcGxhdGVOYW1lOiBzdHJpbmd8bnVsbCxcbiAgICAgIHByaXZhdGUgcGlwZU1hcDogTWFwPHN0cmluZywgQ29tcGlsZVBpcGVTdW1tYXJ5PiwgcHJpdmF0ZSB2aWV3UXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICAgIHByaXZhdGUgZGlyZWN0aXZlczogU2V0PGFueT4sIHByaXZhdGUgcGlwZXM6IFNldDxhbnk+KSB7XG4gICAgdGhpcy5iaW5kaW5nU2NvcGUgPVxuICAgICAgICBwYXJlbnRCaW5kaW5nU2NvcGUubmVzdGVkU2NvcGUoKGxoc1Zhcjogby5SZWFkVmFyRXhwciwgZXhwcmVzc2lvbjogby5FeHByZXNzaW9uKSA9PiB7XG4gICAgICAgICAgdGhpcy5fYmluZGluZ01vZGUucHVzaChcbiAgICAgICAgICAgICAgbGhzVmFyLnNldChleHByZXNzaW9uKS50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuICAgICAgICB9KTtcbiAgICB0aGlzLl92YWx1ZUNvbnZlcnRlciA9IG5ldyBWYWx1ZUNvbnZlcnRlcihcbiAgICAgICAgb3V0cHV0Q3R4LCAoKSA9PiB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKSwgKG5hbWUsIGxvY2FsTmFtZSwgc2xvdCwgdmFsdWU6IG8uUmVhZFZhckV4cHIpID0+IHtcbiAgICAgICAgICB0aGlzLmJpbmRpbmdTY29wZS5zZXQobG9jYWxOYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgY29uc3QgcGlwZSA9IHBpcGVNYXAuZ2V0KG5hbWUpICE7XG4gICAgICAgICAgcGlwZSB8fCBlcnJvcihgQ291bGQgbm90IGZpbmQgcGlwZSAke25hbWV9YCk7XG4gICAgICAgICAgdGhpcy5waXBlcy5hZGQocGlwZS50eXBlLnJlZmVyZW5jZSk7XG4gICAgICAgICAgdGhpcy5fY3JlYXRpb25Nb2RlLnB1c2goXG4gICAgICAgICAgICAgIG8uaW1wb3J0RXhwcihSMy5waXBlKS5jYWxsRm4oW28ubGl0ZXJhbChzbG90KSwgby5saXRlcmFsKG5hbWUpXSkudG9TdG10KCkpO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkVGVtcGxhdGVGdW5jdGlvbihub2RlczogVGVtcGxhdGVBc3RbXSwgdmFyaWFibGVzOiBWYXJpYWJsZUFzdFtdKTogby5GdW5jdGlvbkV4cHIge1xuICAgIC8vIENyZWF0ZSB2YXJpYWJsZSBiaW5kaW5nc1xuICAgIGZvciAoY29uc3QgdmFyaWFibGUgb2YgdmFyaWFibGVzKSB7XG4gICAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSB2YXJpYWJsZS5uYW1lO1xuICAgICAgY29uc3QgZXhwcmVzc2lvbiA9XG4gICAgICAgICAgby52YXJpYWJsZSh0aGlzLmNvbnRleHRQYXJhbWV0ZXIpLnByb3AodmFyaWFibGUudmFsdWUgfHwgSU1QTElDSVRfUkVGRVJFTkNFKTtcbiAgICAgIGNvbnN0IHNjb3BlZE5hbWUgPSB0aGlzLmJpbmRpbmdTY29wZS5mcmVzaFJlZmVyZW5jZU5hbWUoKTtcbiAgICAgIC8vIEFkZCB0aGUgcmVmZXJlbmNlIHRvIHRoZSBsb2NhbCBzY29wZS5cbiAgICAgIHRoaXMuYmluZGluZ1Njb3BlLnNldCh2YXJpYWJsZU5hbWUsIG8udmFyaWFibGUodmFyaWFibGVOYW1lICsgc2NvcGVkTmFtZSksIGV4cHJlc3Npb24pO1xuICAgIH1cblxuICAgIC8vIENvbGxlY3QgY29udGVudCBwcm9qZWN0aW9uc1xuICAgIGlmICh0aGlzLm5nQ29udGVudFNlbGVjdG9ycyAmJiB0aGlzLm5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBjb250ZW50UHJvamVjdGlvbnMgPSBnZXRDb250ZW50UHJvamVjdGlvbihub2RlcywgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgICAgdGhpcy5fY29udGVudFByb2plY3Rpb25zID0gY29udGVudFByb2plY3Rpb25zO1xuXG4gICAgICBpZiAoY29udGVudFByb2plY3Rpb25zLnNpemUgPiAwKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9yczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICBBcnJheS5mcm9tKGNvbnRlbnRQcm9qZWN0aW9ucy52YWx1ZXMoKSkuZm9yRWFjaChpbmZvID0+IHtcbiAgICAgICAgICBpZiAoaW5mby5zZWxlY3Rvcikge1xuICAgICAgICAgICAgc2VsZWN0b3JzW2luZm8uaW5kZXggLSAxXSA9IGluZm8uc2VsZWN0b3I7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBwcm9qZWN0aW9uSW5kZXggPSB0aGlzLl9wcm9qZWN0aW9uRGVmaW5pdGlvbkluZGV4ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG4gICAgICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW28ubGl0ZXJhbChwcm9qZWN0aW9uSW5kZXgpXTtcblxuICAgICAgICBpZiAoc2VsZWN0b3JzLnNvbWUodmFsdWUgPT4gIXZhbHVlKSkge1xuICAgICAgICAgIGVycm9yKGBjb250ZW50IHByb2plY3QgaW5mb3JtYXRpb24gc2tpcHBlZCBhbiBpbmRleGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdG9ycy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgY29uc3QgcjNTZWxlY3RvcnMgPSBzZWxlY3RvcnMubWFwKHMgPT4gcGFyc2VTZWxlY3RvclRvUjNTZWxlY3RvcihzKSk7XG4gICAgICAgICAgLy8gYHByb2plY3Rpb25EZWZgIG5lZWRzIGJvdGggdGhlIHBhcnNlZCBhbmQgcmF3IHZhbHVlIG9mIHRoZSBzZWxlY3RvcnNcbiAgICAgICAgICBjb25zdCBwYXJzZWQgPSB0aGlzLm91dHB1dEN0eC5jb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKGFzTGl0ZXJhbChyM1NlbGVjdG9ycyksIHRydWUpO1xuICAgICAgICAgIGNvbnN0IHVuUGFyc2VkID0gdGhpcy5vdXRwdXRDdHguY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChhc0xpdGVyYWwoc2VsZWN0b3JzKSwgdHJ1ZSk7XG4gICAgICAgICAgcGFyYW1ldGVycy5wdXNoKHBhcnNlZCwgdW5QYXJzZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbnN0cnVjdGlvbih0aGlzLl9jcmVhdGlvbk1vZGUsIG51bGwsIFIzLnByb2plY3Rpb25EZWYsIC4uLnBhcmFtZXRlcnMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmluZSBhbmQgdXBkYXRlIGFueSB2aWV3IHF1ZXJpZXNcbiAgICBmb3IgKGxldCBxdWVyeSBvZiB0aGlzLnZpZXdRdWVyaWVzKSB7XG4gICAgICAvLyBlLmcuIHIzLlEoMCwgc29tZVByZWRpY2F0ZSwgdHJ1ZSk7XG4gICAgICBjb25zdCBxdWVyeVNsb3QgPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICAgIGNvbnN0IHByZWRpY2F0ZSA9IGdldFF1ZXJ5UHJlZGljYXRlKHF1ZXJ5LCB0aGlzLm91dHB1dEN0eCk7XG4gICAgICBjb25zdCBhcmdzID0gW1xuICAgICAgICAvKiBtZW1vcnlJbmRleCAqLyBvLmxpdGVyYWwocXVlcnlTbG90LCBvLklORkVSUkVEX1RZUEUpLFxuICAgICAgICAvKiBwcmVkaWNhdGUgKi8gcHJlZGljYXRlLFxuICAgICAgICAvKiBkZXNjZW5kICovIG8ubGl0ZXJhbChxdWVyeS5kZXNjZW5kYW50cywgby5JTkZFUlJFRF9UWVBFKVxuICAgICAgXTtcblxuICAgICAgaWYgKHF1ZXJ5LnJlYWQpIHtcbiAgICAgICAgYXJncy5wdXNoKHRoaXMub3V0cHV0Q3R4LmltcG9ydEV4cHIocXVlcnkucmVhZC5pZGVudGlmaWVyICEucmVmZXJlbmNlKSk7XG4gICAgICB9XG4gICAgICB0aGlzLmluc3RydWN0aW9uKHRoaXMuX2NyZWF0aW9uTW9kZSwgbnVsbCwgUjMucXVlcnksIC4uLmFyZ3MpO1xuXG4gICAgICAvLyAocjMucVIodG1wID0gcjMuybVsZCgwKSkgJiYgKGN0eC5zb21lRGlyID0gdG1wKSk7XG4gICAgICBjb25zdCB0ZW1wb3JhcnkgPSB0aGlzLnRlbXAoKTtcbiAgICAgIGNvbnN0IGdldFF1ZXJ5TGlzdCA9IG8uaW1wb3J0RXhwcihSMy5sb2FkKS5jYWxsRm4oW28ubGl0ZXJhbChxdWVyeVNsb3QpXSk7XG4gICAgICBjb25zdCByZWZyZXNoID0gby5pbXBvcnRFeHByKFIzLnF1ZXJ5UmVmcmVzaCkuY2FsbEZuKFt0ZW1wb3Jhcnkuc2V0KGdldFF1ZXJ5TGlzdCldKTtcbiAgICAgIGNvbnN0IHVwZGF0ZURpcmVjdGl2ZSA9IG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKHF1ZXJ5LnByb3BlcnR5TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KHF1ZXJ5LmZpcnN0ID8gdGVtcG9yYXJ5LnByb3AoJ2ZpcnN0JykgOiB0ZW1wb3JhcnkpO1xuICAgICAgdGhpcy5fYmluZGluZ01vZGUucHVzaChyZWZyZXNoLmFuZCh1cGRhdGVEaXJlY3RpdmUpLnRvU3RtdCgpKTtcbiAgICB9XG5cbiAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIG5vZGVzKTtcblxuICAgIGNvbnN0IGNyZWF0aW9uTW9kZSA9IHRoaXMuX2NyZWF0aW9uTW9kZS5sZW5ndGggPiAwID9cbiAgICAgICAgW28uaWZTdG10KFxuICAgICAgICAgICAgby52YXJpYWJsZShSRU5ERVJfRkxBR1MpLmJpdHdpc2VBbmQoby5saXRlcmFsKFJlbmRlckZsYWdzLkNyZWF0ZSksIG51bGwsIGZhbHNlKSxcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZSldIDpcbiAgICAgICAgW107XG5cbiAgICBjb25zdCB1cGRhdGVNb2RlID0gdGhpcy5fYmluZGluZ01vZGUubGVuZ3RoID4gMCA/XG4gICAgICAgIFtvLmlmU3RtdChcbiAgICAgICAgICAgIG8udmFyaWFibGUoUkVOREVSX0ZMQUdTKS5iaXR3aXNlQW5kKG8ubGl0ZXJhbChSZW5kZXJGbGFncy5VcGRhdGUpLCBudWxsLCBmYWxzZSksXG4gICAgICAgICAgICB0aGlzLl9iaW5kaW5nTW9kZSldIDpcbiAgICAgICAgW107XG5cbiAgICAvLyBHZW5lcmF0ZSBtYXBzIG9mIHBsYWNlaG9sZGVyIG5hbWUgdG8gbm9kZSBpbmRleGVzXG4gICAgLy8gVE9ETyh2aWNiKTogVGhpcyBpcyBhIFdJUCwgbm90IGZ1bGx5IHN1cHBvcnRlZCB5ZXRcbiAgICBmb3IgKGNvbnN0IHBoVG9Ob2RlSWR4IG9mIHRoaXMuX3BoVG9Ob2RlSWR4ZXMpIHtcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwaFRvTm9kZUlkeCkubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBzY29wZWROYW1lID0gdGhpcy5iaW5kaW5nU2NvcGUuZnJlc2hSZWZlcmVuY2VOYW1lKCk7XG4gICAgICAgIGNvbnN0IHBoTWFwID0gby52YXJpYWJsZShzY29wZWROYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KG1hcFRvRXhwcmVzc2lvbihwaFRvTm9kZUlkeCwgdHJ1ZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSk7XG5cbiAgICAgICAgdGhpcy5fcHJlZml4LnB1c2gocGhNYXApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvLmZuKFxuICAgICAgICBbbmV3IG8uRm5QYXJhbShSRU5ERVJfRkxBR1MsIG8uTlVNQkVSX1RZUEUpLCBuZXcgby5GblBhcmFtKHRoaXMuY29udGV4dFBhcmFtZXRlciwgbnVsbCldLFxuICAgICAgICBbXG4gICAgICAgICAgLy8gVGVtcG9yYXJ5IHZhcmlhYmxlIGRlY2xhcmF0aW9ucyBmb3IgcXVlcnkgcmVmcmVzaCAoaS5lLiBsZXQgX3Q6IGFueTspXG4gICAgICAgICAgLi4udGhpcy5fcHJlZml4LFxuICAgICAgICAgIC8vIENyZWF0aW5nIG1vZGUgKGkuZS4gaWYgKHJmICYgUmVuZGVyRmxhZ3MuQ3JlYXRlKSB7IC4uLiB9KVxuICAgICAgICAgIC4uLmNyZWF0aW9uTW9kZSxcbiAgICAgICAgICAvLyBUZW1wb3JhcnkgdmFyaWFibGUgZGVjbGFyYXRpb25zIGZvciBsb2NhbCByZWZzIChpLmUuIGNvbnN0IHRtcCA9IGxkKDEpIGFzIGFueSlcbiAgICAgICAgICAuLi50aGlzLl92YXJpYWJsZU1vZGUsXG4gICAgICAgICAgLy8gQmluZGluZyBhbmQgcmVmcmVzaCBtb2RlIChpLmUuIGlmIChyZiAmIFJlbmRlckZsYWdzLlVwZGF0ZSkgey4uLn0pXG4gICAgICAgICAgLi4udXBkYXRlTW9kZSxcbiAgICAgICAgICAvLyBOZXN0ZWQgdGVtcGxhdGVzIChpLmUuIGZ1bmN0aW9uIENvbXBUZW1wbGF0ZSgpIHt9KVxuICAgICAgICAgIC4uLnRoaXMuX3Bvc3RmaXhcbiAgICAgICAgXSxcbiAgICAgICAgby5JTkZFUlJFRF9UWVBFLCBudWxsLCB0aGlzLnRlbXBsYXRlTmFtZSk7XG4gIH1cblxuICAvLyBMb2NhbFJlc29sdmVyXG4gIGdldExvY2FsKG5hbWU6IHN0cmluZyk6IG8uRXhwcmVzc2lvbnxudWxsIHsgcmV0dXJuIHRoaXMuYmluZGluZ1Njb3BlLmdldChuYW1lKTsgfVxuXG4gIC8vIFRlbXBsYXRlQXN0VmlzaXRvclxuICB2aXNpdE5nQ29udGVudChuZ0NvbnRlbnQ6IE5nQ29udGVudEFzdCkge1xuICAgIGNvbnN0IGluZm8gPSB0aGlzLl9jb250ZW50UHJvamVjdGlvbnMuZ2V0KG5nQ29udGVudCkgITtcbiAgICBpbmZvIHx8XG4gICAgICAgIGVycm9yKGBFeHBlY3RlZCAke25nQ29udGVudC5zb3VyY2VTcGFufSB0byBiZSBpbmNsdWRlZCBpbiBjb250ZW50IHByb2plY3Rpb24gY29sbGVjdGlvbmApO1xuICAgIGNvbnN0IHNsb3QgPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gW28ubGl0ZXJhbChzbG90KSwgby5saXRlcmFsKHRoaXMuX3Byb2plY3Rpb25EZWZpbml0aW9uSW5kZXgpXTtcbiAgICBpZiAoaW5mby5pbmRleCAhPT0gMCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8ubGl0ZXJhbChpbmZvLmluZGV4KSk7XG4gICAgfVxuICAgIHRoaXMuaW5zdHJ1Y3Rpb24odGhpcy5fY3JlYXRpb25Nb2RlLCBuZ0NvbnRlbnQuc291cmNlU3BhbiwgUjMucHJvamVjdGlvbiwgLi4ucGFyYW1ldGVycyk7XG4gIH1cblxuICAvLyBUZW1wbGF0ZUFzdFZpc2l0b3JcbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnRBc3QpIHtcbiAgICBjb25zdCBlbGVtZW50SW5kZXggPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICBjb25zdCByZWZlcmVuY2VEYXRhU2xvdHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICAgIGNvbnN0IHdhc0luSTE4blNlY3Rpb24gPSB0aGlzLl9pbkkxOG5TZWN0aW9uO1xuXG4gICAgY29uc3Qgb3V0cHV0QXR0cnM6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGNvbnN0IGF0dHJJMThuTWV0YXM6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGxldCBpMThuTWV0YTogc3RyaW5nID0gJyc7XG5cbiAgICAvLyBFbGVtZW50cyBpbnNpZGUgaTE4biBzZWN0aW9ucyBhcmUgcmVwbGFjZWQgd2l0aCBwbGFjZWhvbGRlcnNcbiAgICAvLyBUT0RPKHZpY2IpOiBuZXN0ZWQgZWxlbWVudHMgYXJlIGEgV0lQIGluIHRoaXMgcGhhc2VcbiAgICBpZiAodGhpcy5faW5JMThuU2VjdGlvbikge1xuICAgICAgY29uc3QgcGhOYW1lID0gZWxlbWVudC5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIXRoaXMuX3BoVG9Ob2RlSWR4ZXNbdGhpcy5faTE4blNlY3Rpb25JbmRleF1bcGhOYW1lXSkge1xuICAgICAgICB0aGlzLl9waFRvTm9kZUlkeGVzW3RoaXMuX2kxOG5TZWN0aW9uSW5kZXhdW3BoTmFtZV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BoVG9Ob2RlSWR4ZXNbdGhpcy5faTE4blNlY3Rpb25JbmRleF1bcGhOYW1lXS5wdXNoKGVsZW1lbnRJbmRleCk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGkxOG4gYXR0cmlidXRlc1xuICAgIGZvciAoY29uc3QgYXR0ciBvZiBlbGVtZW50LmF0dHJzKSB7XG4gICAgICBjb25zdCBuYW1lID0gYXR0ci5uYW1lO1xuICAgICAgY29uc3QgdmFsdWUgPSBhdHRyLnZhbHVlO1xuICAgICAgaWYgKG5hbWUgPT09IEkxOE5fQVRUUikge1xuICAgICAgICBpZiAodGhpcy5faW5JMThuU2VjdGlvbikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYENvdWxkIG5vdCBtYXJrIGFuIGVsZW1lbnQgYXMgdHJhbnNsYXRhYmxlIGluc2lkZSBvZiBhIHRyYW5zbGF0YWJsZSBzZWN0aW9uYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW5JMThuU2VjdGlvbiA9IHRydWU7XG4gICAgICAgIHRoaXMuX2kxOG5TZWN0aW9uSW5kZXgrKztcbiAgICAgICAgdGhpcy5fcGhUb05vZGVJZHhlc1t0aGlzLl9pMThuU2VjdGlvbkluZGV4XSA9IHt9O1xuICAgICAgICBpMThuTWV0YSA9IHZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgoSTE4Tl9BVFRSX1BSRUZJWCkpIHtcbiAgICAgICAgYXR0ckkxOG5NZXRhc1tuYW1lLnNsaWNlKEkxOE5fQVRUUl9QUkVGSVgubGVuZ3RoKV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dEF0dHJzW25hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRWxlbWVudCBjcmVhdGlvbiBtb2RlXG4gICAgY29uc3QgcGFyYW1ldGVyczogby5FeHByZXNzaW9uW10gPSBbXG4gICAgICBvLmxpdGVyYWwoZWxlbWVudEluZGV4KSxcbiAgICAgIG8ubGl0ZXJhbChlbGVtZW50Lm5hbWUpLFxuICAgIF07XG5cbiAgICBlbGVtZW50LmRpcmVjdGl2ZXMuZm9yRWFjaChcbiAgICAgICAgZGlyZWN0aXZlID0+IHRoaXMuZGlyZWN0aXZlcy5hZGQoZGlyZWN0aXZlLmRpcmVjdGl2ZS50eXBlLnJlZmVyZW5jZSkpO1xuXG4gICAgLy8gQWRkIHRoZSBhdHRyaWJ1dGVzXG4gICAgY29uc3QgaTE4bk1lc3NhZ2VzOiBvLlN0YXRlbWVudFtdID0gW107XG4gICAgY29uc3QgYXR0cmlidXRlczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBsZXQgaGFzSTE4bkF0dHIgPSBmYWxzZTtcblxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG91dHB1dEF0dHJzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBvdXRwdXRBdHRyc1tuYW1lXTtcbiAgICAgIGF0dHJpYnV0ZXMucHVzaChvLmxpdGVyYWwobmFtZSkpO1xuICAgICAgaWYgKGF0dHJJMThuTWV0YXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgaGFzSTE4bkF0dHIgPSB0cnVlO1xuICAgICAgICBjb25zdCBtZXRhID0gcGFyc2VJMThuTWV0YShhdHRySTE4bk1ldGFzW25hbWVdKTtcbiAgICAgICAgY29uc3QgdmFyaWFibGUgPSB0aGlzLmNvbnN0YW50UG9vbC5nZXRUcmFuc2xhdGlvbih2YWx1ZSwgbWV0YSk7XG4gICAgICAgIGF0dHJpYnV0ZXMucHVzaCh2YXJpYWJsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyaWJ1dGVzLnB1c2goby5saXRlcmFsKHZhbHVlKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgYXR0ckFyZzogby5FeHByZXNzaW9uID0gby5UWVBFRF9OVUxMX0VYUFI7XG5cbiAgICBpZiAoYXR0cmlidXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICBhdHRyQXJnID0gaGFzSTE4bkF0dHIgPyBnZXRMaXRlcmFsRmFjdG9yeSh0aGlzLm91dHB1dEN0eCwgby5saXRlcmFsQXJyKGF0dHJpYnV0ZXMpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwoby5saXRlcmFsQXJyKGF0dHJpYnV0ZXMpLCB0cnVlKTtcbiAgICB9XG5cbiAgICBwYXJhbWV0ZXJzLnB1c2goYXR0ckFyZyk7XG5cbiAgICBpZiAoZWxlbWVudC5yZWZlcmVuY2VzICYmIGVsZW1lbnQucmVmZXJlbmNlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCByZWZlcmVuY2VzID1cbiAgICAgICAgICBmbGF0dGVuKGVsZW1lbnQucmVmZXJlbmNlcy5tYXAocmVmZXJlbmNlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICAgICAgICAgIHJlZmVyZW5jZURhdGFTbG90cy5zZXQocmVmZXJlbmNlLm5hbWUsIHNsb3QpO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgdGhlIHVwZGF0ZSB0ZW1wb3JhcnkuXG4gICAgICAgICAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSB0aGlzLmJpbmRpbmdTY29wZS5mcmVzaFJlZmVyZW5jZU5hbWUoKTtcbiAgICAgICAgICAgIHRoaXMuX3ZhcmlhYmxlTW9kZS5wdXNoKG8udmFyaWFibGUodmFyaWFibGVOYW1lLCBvLklORkVSUkVEX1RZUEUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoUjMubG9hZCkuY2FsbEZuKFtvLmxpdGVyYWwoc2xvdCldKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChvLklORkVSUkVEX1RZUEUsIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pKTtcbiAgICAgICAgICAgIHRoaXMuYmluZGluZ1Njb3BlLnNldChyZWZlcmVuY2UubmFtZSwgby52YXJpYWJsZSh2YXJpYWJsZU5hbWUpKTtcbiAgICAgICAgICAgIHJldHVybiBbcmVmZXJlbmNlLm5hbWUsIHJlZmVyZW5jZS5vcmlnaW5hbFZhbHVlXTtcbiAgICAgICAgICB9KSkubWFwKHZhbHVlID0+IG8ubGl0ZXJhbCh2YWx1ZSkpO1xuICAgICAgcGFyYW1ldGVycy5wdXNoKFxuICAgICAgICAgIHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWxBcnIocmVmZXJlbmNlcyksIC8qIGZvcmNlU2hhcmVkICovIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8uVFlQRURfTlVMTF9FWFBSKTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSB0aGUgaW5zdHJ1Y3Rpb24gY3JlYXRlIGVsZW1lbnQgaW5zdHJ1Y3Rpb25cbiAgICBpZiAoaTE4bk1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZS5wdXNoKC4uLmkxOG5NZXNzYWdlcyk7XG4gICAgfVxuICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZSwgZWxlbWVudC5zb3VyY2VTcGFuLCBSMy5jcmVhdGVFbGVtZW50LCAuLi50cmltVHJhaWxpbmdOdWxscyhwYXJhbWV0ZXJzKSk7XG5cbiAgICBjb25zdCBpbXBsaWNpdCA9IG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKTtcblxuICAgIC8vIEdlbmVyYXRlIExpc3RlbmVycyAob3V0cHV0cylcbiAgICBlbGVtZW50Lm91dHB1dHMuZm9yRWFjaCgob3V0cHV0QXN0OiBCb3VuZEV2ZW50QXN0KSA9PiB7XG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBgJHt0aGlzLnRlbXBsYXRlTmFtZX1fJHtlbGVtZW50Lm5hbWV9XyR7b3V0cHV0QXN0Lm5hbWV9X2xpc3RlbmVyYDtcbiAgICAgIGNvbnN0IGxvY2FsVmFyczogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgICAgY29uc3QgYmluZGluZ1Njb3BlID1cbiAgICAgICAgICB0aGlzLmJpbmRpbmdTY29wZS5uZXN0ZWRTY29wZSgobGhzVmFyOiBvLlJlYWRWYXJFeHByLCByaHNFeHByZXNzaW9uOiBvLkV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICAgIGxvY2FsVmFycy5wdXNoKFxuICAgICAgICAgICAgICAgIGxoc1Zhci5zZXQocmhzRXhwcmVzc2lvbikudG9EZWNsU3RtdChvLklORkVSUkVEX1RZUEUsIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pKTtcbiAgICAgICAgICB9KTtcbiAgICAgIGNvbnN0IGJpbmRpbmdFeHByID0gY29udmVydEFjdGlvbkJpbmRpbmcoXG4gICAgICAgICAgYmluZGluZ1Njb3BlLCBvLnZhcmlhYmxlKENPTlRFWFRfTkFNRSksIG91dHB1dEFzdC5oYW5kbGVyLCAnYicsXG4gICAgICAgICAgKCkgPT4gZXJyb3IoJ1VuZXhwZWN0ZWQgaW50ZXJwb2xhdGlvbicpKTtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBvLmZuKFxuICAgICAgICAgIFtuZXcgby5GblBhcmFtKCckZXZlbnQnLCBvLkRZTkFNSUNfVFlQRSldLCBbLi4ubG9jYWxWYXJzLCAuLi5iaW5kaW5nRXhwci5yZW5kZXIzU3RtdHNdLFxuICAgICAgICAgIG8uSU5GRVJSRURfVFlQRSwgbnVsbCwgZnVuY3Rpb25OYW1lKTtcbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgdGhpcy5fY3JlYXRpb25Nb2RlLCBvdXRwdXRBc3Quc291cmNlU3BhbiwgUjMubGlzdGVuZXIsIG8ubGl0ZXJhbChvdXRwdXRBc3QubmFtZSksXG4gICAgICAgICAgaGFuZGxlcik7XG4gICAgfSk7XG5cblxuICAgIC8vIEdlbmVyYXRlIGVsZW1lbnQgaW5wdXQgYmluZGluZ3NcbiAgICBmb3IgKGxldCBpbnB1dCBvZiBlbGVtZW50LmlucHV0cykge1xuICAgICAgaWYgKGlucHV0LmlzQW5pbWF0aW9uKSB7XG4gICAgICAgIHRoaXMudW5zdXBwb3J0ZWQoJ2FuaW1hdGlvbnMnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbnZlcnRlZEJpbmRpbmcgPSB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoaW1wbGljaXQsIGlucHV0LnZhbHVlKTtcbiAgICAgIGNvbnN0IGluc3RydWN0aW9uID0gQklORElOR19JTlNUUlVDVElPTl9NQVBbaW5wdXQudHlwZV07XG4gICAgICBpZiAoaW5zdHJ1Y3Rpb24pIHtcbiAgICAgICAgLy8gVE9ETyhjaHVja2opOiBydW50aW1lOiBzZWN1cml0eSBjb250ZXh0P1xuICAgICAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICAgICAgdGhpcy5fYmluZGluZ01vZGUsIGlucHV0LnNvdXJjZVNwYW4sIGluc3RydWN0aW9uLCBvLmxpdGVyYWwoZWxlbWVudEluZGV4KSxcbiAgICAgICAgICAgIG8ubGl0ZXJhbChpbnB1dC5uYW1lKSwgY29udmVydGVkQmluZGluZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVuc3VwcG9ydGVkKGBiaW5kaW5nICR7UHJvcGVydHlCaW5kaW5nVHlwZVtpbnB1dC50eXBlXX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSBkaXJlY3RpdmVzIGlucHV0IGJpbmRpbmdzXG4gICAgdGhpcy5fdmlzaXREaXJlY3RpdmVzKGVsZW1lbnQuZGlyZWN0aXZlcywgaW1wbGljaXQsIGVsZW1lbnRJbmRleCk7XG5cbiAgICAvLyBUcmF2ZXJzZSBlbGVtZW50IGNoaWxkIG5vZGVzXG4gICAgaWYgKHRoaXMuX2luSTE4blNlY3Rpb24gJiYgZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT0gMSAmJlxuICAgICAgICBlbGVtZW50LmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgVGV4dEFzdCkge1xuICAgICAgY29uc3QgdGV4dCA9IGVsZW1lbnQuY2hpbGRyZW5bMF0gYXMgVGV4dEFzdDtcbiAgICAgIHRoaXMudmlzaXRTaW5nbGVJMThuVGV4dENoaWxkKHRleHQsIGkxOG5NZXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGVtcGxhdGVWaXNpdEFsbCh0aGlzLCBlbGVtZW50LmNoaWxkcmVuKTtcbiAgICB9XG5cbiAgICAvLyBGaW5pc2ggZWxlbWVudCBjb25zdHJ1Y3Rpb24gbW9kZS5cbiAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLl9jcmVhdGlvbk1vZGUsIGVsZW1lbnQuZW5kU291cmNlU3BhbiB8fCBlbGVtZW50LnNvdXJjZVNwYW4sIFIzLmVsZW1lbnRFbmQpO1xuXG4gICAgLy8gUmVzdG9yZSB0aGUgc3RhdGUgYmVmb3JlIGV4aXRpbmcgdGhpcyBub2RlXG4gICAgdGhpcy5faW5JMThuU2VjdGlvbiA9IHdhc0luSTE4blNlY3Rpb247XG4gIH1cblxuICBwcml2YXRlIF92aXNpdERpcmVjdGl2ZXMoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sIGltcGxpY2l0OiBvLkV4cHJlc3Npb24sIG5vZGVJbmRleDogbnVtYmVyKSB7XG4gICAgZm9yIChsZXQgZGlyZWN0aXZlIG9mIGRpcmVjdGl2ZXMpIHtcbiAgICAgIC8vIENyZWF0aW9uIG1vZGVcbiAgICAgIC8vIGUuZy4gRCgwLCBUb2RvQ29tcG9uZW50RGVmLm4oKSwgVG9kb0NvbXBvbmVudERlZik7XG4gICAgICBjb25zdCBkaXJlY3RpdmVUeXBlID0gZGlyZWN0aXZlLmRpcmVjdGl2ZS50eXBlLnJlZmVyZW5jZTtcbiAgICAgIGNvbnN0IGtpbmQgPVxuICAgICAgICAgIGRpcmVjdGl2ZS5kaXJlY3RpdmUuaXNDb21wb25lbnQgPyBEZWZpbml0aW9uS2luZC5Db21wb25lbnQgOiBEZWZpbml0aW9uS2luZC5EaXJlY3RpdmU7XG5cbiAgICAgIC8vIE5vdGU6ICpkbyBub3QgY2FjaGUqIGNhbGxzIHRvIHRoaXMuZGlyZWN0aXZlT2YoKSBhcyB0aGUgY29uc3RhbnQgcG9vbCBuZWVkcyB0byBrbm93IGlmIHRoZVxuICAgICAgLy8gbm9kZSBpcyByZWZlcmVuY2VkIG11bHRpcGxlIHRpbWVzIHRvIGtub3cgdGhhdCBpdCBtdXN0IGdlbmVyYXRlIHRoZSByZWZlcmVuY2UgaW50byBhXG4gICAgICAvLyB0ZW1wb3JhcnkuXG5cbiAgICAgIC8vIEJpbmRpbmdzXG4gICAgICBmb3IgKGNvbnN0IGlucHV0IG9mIGRpcmVjdGl2ZS5pbnB1dHMpIHtcbiAgICAgICAgY29uc3QgY29udmVydGVkQmluZGluZyA9IHRoaXMuY29udmVydFByb3BlcnR5QmluZGluZyhpbXBsaWNpdCwgaW5wdXQudmFsdWUpO1xuICAgICAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICAgICAgdGhpcy5fYmluZGluZ01vZGUsIGRpcmVjdGl2ZS5zb3VyY2VTcGFuLCBSMy5lbGVtZW50UHJvcGVydHksIG8ubGl0ZXJhbChub2RlSW5kZXgpLFxuICAgICAgICAgICAgby5saXRlcmFsKGlucHV0LnRlbXBsYXRlTmFtZSksIG8uaW1wb3J0RXhwcihSMy5iaW5kKS5jYWxsRm4oW2NvbnZlcnRlZEJpbmRpbmddKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVGVtcGxhdGVBc3RWaXNpdG9yXG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZSh0ZW1wbGF0ZTogRW1iZWRkZWRUZW1wbGF0ZUFzdCkge1xuICAgIGNvbnN0IHRlbXBsYXRlSW5kZXggPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcblxuICAgIGNvbnN0IHRlbXBsYXRlUmVmID0gdGhpcy5yZWZsZWN0b3IucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKElkZW50aWZpZXJzLlRlbXBsYXRlUmVmKTtcbiAgICBjb25zdCB0ZW1wbGF0ZURpcmVjdGl2ZSA9IHRlbXBsYXRlLmRpcmVjdGl2ZXMuZmluZChcbiAgICAgICAgZGlyZWN0aXZlID0+IGRpcmVjdGl2ZS5kaXJlY3RpdmUudHlwZS5kaURlcHMuc29tZShcbiAgICAgICAgICAgIGRlcGVuZGVuY3kgPT5cbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5LnRva2VuICE9IG51bGwgJiYgKHRva2VuUmVmZXJlbmNlKGRlcGVuZGVuY3kudG9rZW4pID09IHRlbXBsYXRlUmVmKSkpO1xuICAgIGNvbnN0IGNvbnRleHROYW1lID1cbiAgICAgICAgdGhpcy5jb250ZXh0TmFtZSAmJiB0ZW1wbGF0ZURpcmVjdGl2ZSAmJiB0ZW1wbGF0ZURpcmVjdGl2ZS5kaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UubmFtZSA/XG4gICAgICAgIGAke3RoaXMuY29udGV4dE5hbWV9XyR7dGVtcGxhdGVEaXJlY3RpdmUuZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlLm5hbWV9YCA6XG4gICAgICAgIG51bGw7XG4gICAgY29uc3QgdGVtcGxhdGVOYW1lID1cbiAgICAgICAgY29udGV4dE5hbWUgPyBgJHtjb250ZXh0TmFtZX1fVGVtcGxhdGVfJHt0ZW1wbGF0ZUluZGV4fWAgOiBgVGVtcGxhdGVfJHt0ZW1wbGF0ZUluZGV4fWA7XG4gICAgY29uc3QgdGVtcGxhdGVDb250ZXh0ID0gYGN0eCR7dGhpcy5sZXZlbH1gO1xuXG4gICAgY29uc3QgcGFyYW1ldGVyczogby5FeHByZXNzaW9uW10gPSBbby52YXJpYWJsZSh0ZW1wbGF0ZU5hbWUpLCBvLmxpdGVyYWwobnVsbCwgby5JTkZFUlJFRF9UWVBFKV07XG4gICAgY29uc3QgYXR0cmlidXRlTmFtZXM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgdGVtcGxhdGUuZGlyZWN0aXZlcy5mb3JFYWNoKChkaXJlY3RpdmVBc3Q6IERpcmVjdGl2ZUFzdCkgPT4ge1xuICAgICAgdGhpcy5kaXJlY3RpdmVzLmFkZChkaXJlY3RpdmVBc3QuZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlKTtcbiAgICAgIENzc1NlbGVjdG9yLnBhcnNlKGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUuc2VsZWN0b3IgISkuZm9yRWFjaChzZWxlY3RvciA9PiB7XG4gICAgICAgIHNlbGVjdG9yLmF0dHJzLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgLy8gQ29udmVydCAnJyAoZmFsc3kpIHN0cmluZ3MgaW50byBgbnVsbGAuIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2Ugd2Ugd2FudFxuICAgICAgICAgIC8vIHRvIGNvbW11bmljYXRlIHRvIHJ1bnRpbWUgdGhhdCB0aGVzZSBhdHRyaWJ1dGVzIGFyZSBwcmVzZW50IGZvclxuICAgICAgICAgIC8vIHNlbGVjdG9yIG1hdGNoaW5nLCBidXQgc2hvdWxkIG5vdCBhY3R1YWxseSBiZSBhZGRlZCB0byB0aGUgRE9NLlxuICAgICAgICAgIC8vIGF0dHJpYnV0ZU5hbWVzLnB1c2goby5saXRlcmFsKHZhbHVlID8gdmFsdWUgOiBudWxsKSk7XG5cbiAgICAgICAgICAvLyBUT0RPKG1pc2tvKTogbWFrZSB0aGUgYWJvdmUgY29tbWVudCB0cnVlLCBmb3Igbm93IGp1c3Qgd3JpdGUgdG8gRE9NIGJlY2F1c2VcbiAgICAgICAgICAvLyB0aGUgcnVudGltZSBzZWxlY3RvcnMgaGF2ZSBub3QgYmVlbiB1cGRhdGVkLlxuICAgICAgICAgIGF0dHJpYnV0ZU5hbWVzLnB1c2goby5saXRlcmFsKHZhbHVlKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYgKGF0dHJpYnV0ZU5hbWVzLmxlbmd0aCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKFxuICAgICAgICAgIHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWxBcnIoYXR0cmlidXRlTmFtZXMpLCAvKiBmb3JjZWRTaGFyZWQgKi8gdHJ1ZSkpO1xuICAgIH1cblxuICAgIC8vIGUuZy4gQygxLCBDMVRlbXBsYXRlKVxuICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZSwgdGVtcGxhdGUuc291cmNlU3BhbiwgUjMuY29udGFpbmVyQ3JlYXRlLCBvLmxpdGVyYWwodGVtcGxhdGVJbmRleCksXG4gICAgICAgIC4uLnRyaW1UcmFpbGluZ051bGxzKHBhcmFtZXRlcnMpKTtcblxuICAgIC8vIEdlbmVyYXRlIGRpcmVjdGl2ZXNcbiAgICB0aGlzLl92aXNpdERpcmVjdGl2ZXModGVtcGxhdGUuZGlyZWN0aXZlcywgby52YXJpYWJsZShDT05URVhUX05BTUUpLCB0ZW1wbGF0ZUluZGV4KTtcblxuICAgIC8vIENyZWF0ZSB0aGUgdGVtcGxhdGUgZnVuY3Rpb25cbiAgICBjb25zdCB0ZW1wbGF0ZVZpc2l0b3IgPSBuZXcgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcihcbiAgICAgICAgdGhpcy5vdXRwdXRDdHgsIHRoaXMuY29uc3RhbnRQb29sLCB0aGlzLnJlZmxlY3RvciwgdGVtcGxhdGVDb250ZXh0LCB0aGlzLmJpbmRpbmdTY29wZSxcbiAgICAgICAgdGhpcy5sZXZlbCArIDEsIHRoaXMubmdDb250ZW50U2VsZWN0b3JzLCBjb250ZXh0TmFtZSwgdGVtcGxhdGVOYW1lLCB0aGlzLnBpcGVNYXAsIFtdLFxuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMsIHRoaXMucGlwZXMpO1xuICAgIGNvbnN0IHRlbXBsYXRlRnVuY3Rpb25FeHByID1cbiAgICAgICAgdGVtcGxhdGVWaXNpdG9yLmJ1aWxkVGVtcGxhdGVGdW5jdGlvbih0ZW1wbGF0ZS5jaGlsZHJlbiwgdGVtcGxhdGUudmFyaWFibGVzKTtcbiAgICB0aGlzLl9wb3N0Zml4LnB1c2godGVtcGxhdGVGdW5jdGlvbkV4cHIudG9EZWNsU3RtdCh0ZW1wbGF0ZU5hbWUsIG51bGwpKTtcbiAgfVxuXG4gIC8vIFRoZXNlIHNob3VsZCBiZSBoYW5kbGVkIGluIHRoZSB0ZW1wbGF0ZSBvciBlbGVtZW50IGRpcmVjdGx5LlxuICByZWFkb25seSB2aXNpdFJlZmVyZW5jZSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0VmFyaWFibGUgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdEV2ZW50ID0gaW52YWxpZDtcbiAgcmVhZG9ubHkgdmlzaXRFbGVtZW50UHJvcGVydHkgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdEF0dHIgPSBpbnZhbGlkO1xuXG4gIC8vIFRlbXBsYXRlQXN0VmlzaXRvclxuICB2aXNpdEJvdW5kVGV4dCh0ZXh0OiBCb3VuZFRleHRBc3QpIHtcbiAgICBjb25zdCBub2RlSW5kZXggPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcblxuICAgIC8vIENyZWF0aW9uIG1vZGVcbiAgICB0aGlzLmluc3RydWN0aW9uKHRoaXMuX2NyZWF0aW9uTW9kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBvLmxpdGVyYWwobm9kZUluZGV4KSk7XG5cbiAgICB0aGlzLmluc3RydWN0aW9uKFxuICAgICAgICB0aGlzLl9iaW5kaW5nTW9kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0Q3JlYXRlQm91bmQsIG8ubGl0ZXJhbChub2RlSW5kZXgpLFxuICAgICAgICB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoby52YXJpYWJsZShDT05URVhUX05BTUUpLCB0ZXh0LnZhbHVlKSk7XG4gIH1cblxuICAvLyBUZW1wbGF0ZUFzdFZpc2l0b3JcbiAgdmlzaXRUZXh0KHRleHQ6IFRleHRBc3QpIHtcbiAgICAvLyBUZXh0IGlzIGRlZmluZWQgaW4gY3JlYXRpb24gbW9kZSBvbmx5LlxuICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBvLmxpdGVyYWwodGhpcy5hbGxvY2F0ZURhdGFTbG90KCkpLFxuICAgICAgICBvLmxpdGVyYWwodGV4dC52YWx1ZSkpO1xuICB9XG5cbiAgLy8gV2hlbiB0aGUgY29udGVudCBvZiB0aGUgZWxlbWVudCBpcyBhIHNpbmdsZSB0ZXh0IG5vZGUgdGhlIHRyYW5zbGF0aW9uIGNhbiBiZSBpbmxpbmVkOlxuICAvL1xuICAvLyBgPHAgaTE4bj1cImRlc2N8bWVhblwiPnNvbWUgY29udGVudDwvcD5gXG4gIC8vIGNvbXBpbGVzIHRvXG4gIC8vIGBgYFxuICAvLyAvKipcbiAgLy8gKiBAZGVzYyBkZXNjXG4gIC8vICogQG1lYW5pbmcgbWVhblxuICAvLyAqL1xuICAvLyBjb25zdCBNU0dfWFlaID0gZ29vZy5nZXRNc2coJ3NvbWUgY29udGVudCcpO1xuICAvLyBpMC7JtVQoMSwgTVNHX1hZWik7XG4gIC8vIGBgYFxuICB2aXNpdFNpbmdsZUkxOG5UZXh0Q2hpbGQodGV4dDogVGV4dEFzdCwgaTE4bk1ldGE6IHN0cmluZykge1xuICAgIGNvbnN0IG1ldGEgPSBwYXJzZUkxOG5NZXRhKGkxOG5NZXRhKTtcbiAgICBjb25zdCB2YXJpYWJsZSA9IHRoaXMuY29uc3RhbnRQb29sLmdldFRyYW5zbGF0aW9uKHRleHQudmFsdWUsIG1ldGEpO1xuICAgIHRoaXMuaW5zdHJ1Y3Rpb24oXG4gICAgICAgIHRoaXMuX2NyZWF0aW9uTW9kZSwgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBvLmxpdGVyYWwodGhpcy5hbGxvY2F0ZURhdGFTbG90KCkpLCB2YXJpYWJsZSk7XG4gIH1cblxuICAvLyBUaGVzZSBzaG91bGQgYmUgaGFuZGxlZCBpbiB0aGUgdGVtcGxhdGUgb3IgZWxlbWVudCBkaXJlY3RseVxuICByZWFkb25seSB2aXNpdERpcmVjdGl2ZSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0RGlyZWN0aXZlUHJvcGVydHkgPSBpbnZhbGlkO1xuXG4gIHByaXZhdGUgYWxsb2NhdGVEYXRhU2xvdCgpIHsgcmV0dXJuIHRoaXMuX2RhdGFJbmRleCsrOyB9XG4gIHByaXZhdGUgYmluZGluZ0NvbnRleHQoKSB7IHJldHVybiBgJHt0aGlzLl9iaW5kaW5nQ29udGV4dCsrfWA7IH1cblxuICBwcml2YXRlIGluc3RydWN0aW9uKFxuICAgICAgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSwgc3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZSxcbiAgICAgIC4uLnBhcmFtczogby5FeHByZXNzaW9uW10pIHtcbiAgICBzdGF0ZW1lbnRzLnB1c2goby5pbXBvcnRFeHByKHJlZmVyZW5jZSwgbnVsbCwgc3BhbikuY2FsbEZuKHBhcmFtcywgc3BhbikudG9TdG10KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBkZWZpbml0aW9uT2YodHlwZTogYW55LCBraW5kOiBEZWZpbml0aW9uS2luZCk6IG8uRXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RhbnRQb29sLmdldERlZmluaXRpb24odHlwZSwga2luZCwgdGhpcy5vdXRwdXRDdHgpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wKCk6IG8uUmVhZFZhckV4cHIge1xuICAgIGlmICghdGhpcy5fdGVtcG9yYXJ5QWxsb2NhdGVkKSB7XG4gICAgICB0aGlzLl9wcmVmaXgucHVzaChuZXcgby5EZWNsYXJlVmFyU3RtdChURU1QT1JBUllfTkFNRSwgdW5kZWZpbmVkLCBvLkRZTkFNSUNfVFlQRSkpO1xuICAgICAgdGhpcy5fdGVtcG9yYXJ5QWxsb2NhdGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG8udmFyaWFibGUoVEVNUE9SQVJZX05BTUUpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKGltcGxpY2l0OiBvLkV4cHJlc3Npb24sIHZhbHVlOiBBU1QpOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IHBpcGVzQ29udmVydGVkVmFsdWUgPSB2YWx1ZS52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG4gICAgY29uc3QgY29udmVydGVkUHJvcGVydHlCaW5kaW5nID0gY29udmVydFByb3BlcnR5QmluZGluZyhcbiAgICAgICAgdGhpcywgaW1wbGljaXQsIHBpcGVzQ29udmVydGVkVmFsdWUsIHRoaXMuYmluZGluZ0NvbnRleHQoKSwgQmluZGluZ0Zvcm0uVHJ5U2ltcGxlLFxuICAgICAgICBpbnRlcnBvbGF0ZSk7XG4gICAgdGhpcy5fYmluZGluZ01vZGUucHVzaCguLi5jb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcuc3RtdHMpO1xuICAgIHJldHVybiBjb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcuY3VyclZhbEV4cHI7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UXVlcnlQcmVkaWNhdGUocXVlcnk6IENvbXBpbGVRdWVyeU1ldGFkYXRhLCBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQpOiBvLkV4cHJlc3Npb24ge1xuICBpZiAocXVlcnkuc2VsZWN0b3JzLmxlbmd0aCA+IDEgfHwgKHF1ZXJ5LnNlbGVjdG9ycy5sZW5ndGggPT0gMSAmJiBxdWVyeS5zZWxlY3RvcnNbMF0udmFsdWUpKSB7XG4gICAgY29uc3Qgc2VsZWN0b3JzID0gcXVlcnkuc2VsZWN0b3JzLm1hcCh2YWx1ZSA9PiB2YWx1ZS52YWx1ZSBhcyBzdHJpbmcpO1xuICAgIHNlbGVjdG9ycy5zb21lKHZhbHVlID0+ICF2YWx1ZSkgJiYgZXJyb3IoJ0ZvdW5kIGEgdHlwZSBhbW9uZyB0aGUgc3RyaW5nIHNlbGVjdG9ycyBleHBlY3RlZCcpO1xuICAgIHJldHVybiBvdXRwdXRDdHguY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChcbiAgICAgICAgby5saXRlcmFsQXJyKHNlbGVjdG9ycy5tYXAodmFsdWUgPT4gby5saXRlcmFsKHZhbHVlKSkpKTtcbiAgfVxuXG4gIGlmIChxdWVyeS5zZWxlY3RvcnMubGVuZ3RoID09IDEpIHtcbiAgICBjb25zdCBmaXJzdCA9IHF1ZXJ5LnNlbGVjdG9yc1swXTtcbiAgICBpZiAoZmlyc3QuaWRlbnRpZmllcikge1xuICAgICAgcmV0dXJuIG91dHB1dEN0eC5pbXBvcnRFeHByKGZpcnN0LmlkZW50aWZpZXIucmVmZXJlbmNlKTtcbiAgICB9XG4gIH1cblxuICBlcnJvcignVW5leHBlY3RlZCBxdWVyeSBmb3JtJyk7XG4gIHJldHVybiBvLk5VTExfRVhQUjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZhY3RvcnkoXG4gICAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSwgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LCByZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsXG4gICAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSk6IG8uRXhwcmVzc2lvbiB7XG4gIGxldCBhcmdzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gIGNvbnN0IGVsZW1lbnRSZWYgPSByZWZsZWN0b3IucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKElkZW50aWZpZXJzLkVsZW1lbnRSZWYpO1xuICBjb25zdCB0ZW1wbGF0ZVJlZiA9IHJlZmxlY3Rvci5yZXNvbHZlRXh0ZXJuYWxSZWZlcmVuY2UoSWRlbnRpZmllcnMuVGVtcGxhdGVSZWYpO1xuICBjb25zdCB2aWV3Q29udGFpbmVyUmVmID0gcmVmbGVjdG9yLnJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShJZGVudGlmaWVycy5WaWV3Q29udGFpbmVyUmVmKTtcblxuICBmb3IgKGxldCBkZXBlbmRlbmN5IG9mIHR5cGUuZGlEZXBzKSB7XG4gICAgY29uc3QgdG9rZW4gPSBkZXBlbmRlbmN5LnRva2VuO1xuICAgIGlmICh0b2tlbikge1xuICAgICAgY29uc3QgdG9rZW5SZWYgPSB0b2tlblJlZmVyZW5jZSh0b2tlbik7XG4gICAgICBpZiAodG9rZW5SZWYgPT09IGVsZW1lbnRSZWYpIHtcbiAgICAgICAgYXJncy5wdXNoKG8uaW1wb3J0RXhwcihSMy5pbmplY3RFbGVtZW50UmVmKS5jYWxsRm4oW10pKTtcbiAgICAgIH0gZWxzZSBpZiAodG9rZW5SZWYgPT09IHRlbXBsYXRlUmVmKSB7XG4gICAgICAgIGFyZ3MucHVzaChvLmltcG9ydEV4cHIoUjMuaW5qZWN0VGVtcGxhdGVSZWYpLmNhbGxGbihbXSkpO1xuICAgICAgfSBlbHNlIGlmICh0b2tlblJlZiA9PT0gdmlld0NvbnRhaW5lclJlZikge1xuICAgICAgICBhcmdzLnB1c2goby5pbXBvcnRFeHByKFIzLmluamVjdFZpZXdDb250YWluZXJSZWYpLmNhbGxGbihbXSkpO1xuICAgICAgfSBlbHNlIGlmIChkZXBlbmRlbmN5LmlzQXR0cmlidXRlKSB7XG4gICAgICAgIGFyZ3MucHVzaChvLmltcG9ydEV4cHIoUjMuaW5qZWN0QXR0cmlidXRlKS5jYWxsRm4oW28ubGl0ZXJhbChkZXBlbmRlbmN5LnRva2VuICEudmFsdWUpXSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdG9rZW5WYWx1ZSA9XG4gICAgICAgICAgICB0b2tlbi5pZGVudGlmaWVyICE9IG51bGwgPyBvdXRwdXRDdHguaW1wb3J0RXhwcih0b2tlblJlZikgOiBvLmxpdGVyYWwodG9rZW5SZWYpO1xuICAgICAgICBjb25zdCBkaXJlY3RpdmVJbmplY3RBcmdzID0gW3Rva2VuVmFsdWVdO1xuICAgICAgICBjb25zdCBmbGFncyA9IGV4dHJhY3RGbGFncyhkZXBlbmRlbmN5KTtcbiAgICAgICAgaWYgKGZsYWdzICE9IEluamVjdEZsYWdzLkRlZmF1bHQpIHtcbiAgICAgICAgICAvLyBBcHBlbmQgZmxhZyBpbmZvcm1hdGlvbiBpZiBvdGhlciB0aGFuIGRlZmF1bHQuXG4gICAgICAgICAgZGlyZWN0aXZlSW5qZWN0QXJncy5wdXNoKG8ubGl0ZXJhbChmbGFncykpO1xuICAgICAgICB9XG4gICAgICAgIGFyZ3MucHVzaChvLmltcG9ydEV4cHIoUjMuZGlyZWN0aXZlSW5qZWN0KS5jYWxsRm4oZGlyZWN0aXZlSW5qZWN0QXJncykpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB1bnN1cHBvcnRlZCgnZGVwZW5kZW5jeSB3aXRob3V0IGEgdG9rZW4nKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBxdWVyeURlZmluaXRpb25zOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICBmb3IgKGxldCBxdWVyeSBvZiBxdWVyaWVzKSB7XG4gICAgY29uc3QgcHJlZGljYXRlID0gZ2V0UXVlcnlQcmVkaWNhdGUocXVlcnksIG91dHB1dEN0eCk7XG5cbiAgICAvLyBlLmcuIHIzLlEobnVsbCwgc29tZVByZWRpY2F0ZSwgZmFsc2UpIG9yIHIzLlEobnVsbCwgWydkaXYnXSwgZmFsc2UpXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IFtcbiAgICAgIC8qIG1lbW9yeUluZGV4ICovIG8ubGl0ZXJhbChudWxsLCBvLklORkVSUkVEX1RZUEUpLFxuICAgICAgLyogcHJlZGljYXRlICovIHByZWRpY2F0ZSxcbiAgICAgIC8qIGRlc2NlbmQgKi8gby5saXRlcmFsKHF1ZXJ5LmRlc2NlbmRhbnRzKVxuICAgIF07XG5cbiAgICBpZiAocXVlcnkucmVhZCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG91dHB1dEN0eC5pbXBvcnRFeHByKHF1ZXJ5LnJlYWQuaWRlbnRpZmllciAhLnJlZmVyZW5jZSkpO1xuICAgIH1cblxuICAgIHF1ZXJ5RGVmaW5pdGlvbnMucHVzaChvLmltcG9ydEV4cHIoUjMucXVlcnkpLmNhbGxGbihwYXJhbWV0ZXJzKSk7XG4gIH1cblxuICBjb25zdCBjcmVhdGVJbnN0YW5jZSA9IG5ldyBvLkluc3RhbnRpYXRlRXhwcihvdXRwdXRDdHguaW1wb3J0RXhwcih0eXBlLnJlZmVyZW5jZSksIGFyZ3MpO1xuICBjb25zdCByZXN1bHQgPSBxdWVyeURlZmluaXRpb25zLmxlbmd0aCA+IDAgPyBvLmxpdGVyYWxBcnIoW2NyZWF0ZUluc3RhbmNlLCAuLi5xdWVyeURlZmluaXRpb25zXSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVJbnN0YW5jZTtcblxuICByZXR1cm4gby5mbihcbiAgICAgIFtdLCBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KHJlc3VsdCldLCBvLklORkVSUkVEX1RZUEUsIG51bGwsXG4gICAgICB0eXBlLnJlZmVyZW5jZS5uYW1lID8gYCR7dHlwZS5yZWZlcmVuY2UubmFtZX1fRmFjdG9yeWAgOiBudWxsKTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdEZsYWdzKGRlcGVuZGVuY3k6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSk6IEluamVjdEZsYWdzIHtcbiAgbGV0IGZsYWdzID0gSW5qZWN0RmxhZ3MuRGVmYXVsdDtcbiAgaWYgKGRlcGVuZGVuY3kuaXNIb3N0KSB7XG4gICAgZmxhZ3MgfD0gSW5qZWN0RmxhZ3MuSG9zdDtcbiAgfVxuICBpZiAoZGVwZW5kZW5jeS5pc09wdGlvbmFsKSB7XG4gICAgZmxhZ3MgfD0gSW5qZWN0RmxhZ3MuT3B0aW9uYWw7XG4gIH1cbiAgaWYgKGRlcGVuZGVuY3kuaXNTZWxmKSB7XG4gICAgZmxhZ3MgfD0gSW5qZWN0RmxhZ3MuU2VsZjtcbiAgfVxuICBpZiAoZGVwZW5kZW5jeS5pc1NraXBTZWxmKSB7XG4gICAgZmxhZ3MgfD0gSW5qZWN0RmxhZ3MuU2tpcFNlbGY7XG4gIH1cbiAgaWYgKGRlcGVuZGVuY3kuaXNWYWx1ZSkge1xuICAgIHVuc3VwcG9ydGVkKCd2YWx1ZSBkZXBlbmRlbmNpZXMnKTtcbiAgfVxuICByZXR1cm4gZmxhZ3M7XG59XG5cbi8qKlxuICogIFJlbW92ZSB0cmFpbGluZyBudWxsIG5vZGVzIGFzIHRoZXkgYXJlIGltcGxpZWQuXG4gKi9cbmZ1bmN0aW9uIHRyaW1UcmFpbGluZ051bGxzKHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdKTogby5FeHByZXNzaW9uW10ge1xuICB3aGlsZSAoby5pc051bGwocGFyYW1ldGVyc1twYXJhbWV0ZXJzLmxlbmd0aCAtIDFdKSkge1xuICAgIHBhcmFtZXRlcnMucG9wKCk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtZXRlcnM7XG59XG5cbnR5cGUgSG9zdEJpbmRpbmdzID0ge1xuICBba2V5OiBzdHJpbmddOiBzdHJpbmdcbn07XG5cbi8vIFR1cm4gYSBkaXJlY3RpdmUgc2VsZWN0b3IgaW50byBhbiBSMy1jb21wYXRpYmxlIHNlbGVjdG9yIGZvciBkaXJlY3RpdmUgZGVmXG5mdW5jdGlvbiBjcmVhdGVEaXJlY3RpdmVTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIGFzTGl0ZXJhbChwYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKHNlbGVjdG9yKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhvc3RBdHRyaWJ1dGVzQXJyYXkoXG4gICAgZGlyZWN0aXZlTWV0YWRhdGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0KTogby5FeHByZXNzaW9ufG51bGwge1xuICBjb25zdCB2YWx1ZXM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gIGNvbnN0IGF0dHJpYnV0ZXMgPSBkaXJlY3RpdmVNZXRhZGF0YS5ob3N0QXR0cmlidXRlcztcbiAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGF0dHJpYnV0ZXMpKSB7XG4gICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgdmFsdWVzLnB1c2goby5saXRlcmFsKGtleSksIG8ubGl0ZXJhbCh2YWx1ZSkpO1xuICB9XG4gIGlmICh2YWx1ZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBvdXRwdXRDdHguY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChvLmxpdGVyYWxBcnIodmFsdWVzKSk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFJldHVybiBhIGhvc3QgYmluZGluZyBmdW5jdGlvbiBvciBudWxsIGlmIG9uZSBpcyBub3QgbmVjZXNzYXJ5LlxuZnVuY3Rpb24gY3JlYXRlSG9zdEJpbmRpbmdzRnVuY3Rpb24oXG4gICAgZGlyZWN0aXZlTWV0YWRhdGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LFxuICAgIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gIGNvbnN0IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcblxuICBjb25zdCB0ZW1wb3JhcnkgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZGVjbGFyZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKCFkZWNsYXJlZCkge1xuICAgICAgICBzdGF0ZW1lbnRzLnB1c2gobmV3IG8uRGVjbGFyZVZhclN0bXQoVEVNUE9SQVJZX05BTUUsIHVuZGVmaW5lZCwgby5EWU5BTUlDX1RZUEUpKTtcbiAgICAgICAgZGVjbGFyZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG8udmFyaWFibGUoVEVNUE9SQVJZX05BTUUpO1xuICAgIH07XG4gIH0oKTtcblxuICBjb25zdCBob3N0QmluZGluZ1NvdXJjZVNwYW4gPSB0eXBlU291cmNlU3BhbihcbiAgICAgIGRpcmVjdGl2ZU1ldGFkYXRhLmlzQ29tcG9uZW50ID8gJ0NvbXBvbmVudCcgOiAnRGlyZWN0aXZlJywgZGlyZWN0aXZlTWV0YWRhdGEudHlwZSk7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBxdWVyaWVzXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBkaXJlY3RpdmVNZXRhZGF0YS5xdWVyaWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgIGNvbnN0IHF1ZXJ5ID0gZGlyZWN0aXZlTWV0YWRhdGEucXVlcmllc1tpbmRleF07XG5cbiAgICAvLyBlLmcuIHIzLnFSKHRtcCA9IHIzLmxkKGRpckluZGV4KVsxXSkgJiYgKHIzLmxkKGRpckluZGV4KVswXS5zb21lRGlyID0gdG1wKTtcbiAgICBjb25zdCBnZXREaXJlY3RpdmVNZW1vcnkgPSBvLmltcG9ydEV4cHIoUjMubG9hZCkuY2FsbEZuKFtvLnZhcmlhYmxlKCdkaXJJbmRleCcpXSk7XG4gICAgLy8gVGhlIHF1ZXJ5IGxpc3QgaXMgYXQgdGhlIHF1ZXJ5IGluZGV4ICsgMSBiZWNhdXNlIHRoZSBkaXJlY3RpdmUgaXRzZWxmIGlzIGluIHNsb3QgMC5cbiAgICBjb25zdCBnZXRRdWVyeUxpc3QgPSBnZXREaXJlY3RpdmVNZW1vcnkua2V5KG8ubGl0ZXJhbChpbmRleCArIDEpKTtcbiAgICBjb25zdCBhc3NpZ25Ub1RlbXBvcmFyeSA9IHRlbXBvcmFyeSgpLnNldChnZXRRdWVyeUxpc3QpO1xuICAgIGNvbnN0IGNhbGxRdWVyeVJlZnJlc2ggPSBvLmltcG9ydEV4cHIoUjMucXVlcnlSZWZyZXNoKS5jYWxsRm4oW2Fzc2lnblRvVGVtcG9yYXJ5XSk7XG4gICAgY29uc3QgdXBkYXRlRGlyZWN0aXZlID0gZ2V0RGlyZWN0aXZlTWVtb3J5LmtleShvLmxpdGVyYWwoMCwgby5JTkZFUlJFRF9UWVBFKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AocXVlcnkucHJvcGVydHlOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KHF1ZXJ5LmZpcnN0ID8gdGVtcG9yYXJ5KCkucHJvcCgnZmlyc3QnKSA6IHRlbXBvcmFyeSgpKTtcbiAgICBjb25zdCBhbmRFeHByZXNzaW9uID0gY2FsbFF1ZXJ5UmVmcmVzaC5hbmQodXBkYXRlRGlyZWN0aXZlKTtcbiAgICBzdGF0ZW1lbnRzLnB1c2goYW5kRXhwcmVzc2lvbi50b1N0bXQoKSk7XG4gIH1cblxuICBjb25zdCBkaXJlY3RpdmVTdW1tYXJ5ID0gZGlyZWN0aXZlTWV0YWRhdGEudG9TdW1tYXJ5KCk7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBob3N0IHByb3BlcnR5IGJpbmRpbmdzXG4gIGNvbnN0IGJpbmRpbmdzID0gYmluZGluZ1BhcnNlci5jcmVhdGVCb3VuZEhvc3RQcm9wZXJ0aWVzKGRpcmVjdGl2ZVN1bW1hcnksIGhvc3RCaW5kaW5nU291cmNlU3Bhbik7XG4gIGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gby5pbXBvcnRFeHByKFIzLmxvYWQpLmNhbGxGbihbby52YXJpYWJsZSgnZGlySW5kZXgnKV0pO1xuICBpZiAoYmluZGluZ3MpIHtcbiAgICBmb3IgKGNvbnN0IGJpbmRpbmcgb2YgYmluZGluZ3MpIHtcbiAgICAgIGNvbnN0IGJpbmRpbmdFeHByID0gY29udmVydFByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICBudWxsLCBiaW5kaW5nQ29udGV4dCwgYmluZGluZy5leHByZXNzaW9uLCAnYicsIEJpbmRpbmdGb3JtLlRyeVNpbXBsZSxcbiAgICAgICAgICAoKSA9PiBlcnJvcignVW5leHBlY3RlZCBpbnRlcnBvbGF0aW9uJykpO1xuICAgICAgc3RhdGVtZW50cy5wdXNoKC4uLmJpbmRpbmdFeHByLnN0bXRzKTtcbiAgICAgIHN0YXRlbWVudHMucHVzaChvLmltcG9ydEV4cHIoUjMuZWxlbWVudFByb3BlcnR5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FsbEZuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnZhcmlhYmxlKCdlbEluZGV4JyksIG8ubGl0ZXJhbChiaW5kaW5nLm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uaW1wb3J0RXhwcihSMy5iaW5kKS5jYWxsRm4oW2JpbmRpbmdFeHByLmN1cnJWYWxFeHByXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgICB9XG4gIH1cblxuICAvLyBDYWxjdWxhdGUgaG9zdCBldmVudCBiaW5kaW5nc1xuICBjb25zdCBldmVudEJpbmRpbmdzID1cbiAgICAgIGJpbmRpbmdQYXJzZXIuY3JlYXRlRGlyZWN0aXZlSG9zdEV2ZW50QXN0cyhkaXJlY3RpdmVTdW1tYXJ5LCBob3N0QmluZGluZ1NvdXJjZVNwYW4pO1xuICBpZiAoZXZlbnRCaW5kaW5ncykge1xuICAgIGZvciAoY29uc3QgYmluZGluZyBvZiBldmVudEJpbmRpbmdzKSB7XG4gICAgICBjb25zdCBiaW5kaW5nRXhwciA9IGNvbnZlcnRBY3Rpb25CaW5kaW5nKFxuICAgICAgICAgIG51bGwsIGJpbmRpbmdDb250ZXh0LCBiaW5kaW5nLmhhbmRsZXIsICdiJywgKCkgPT4gZXJyb3IoJ1VuZXhwZWN0ZWQgaW50ZXJwb2xhdGlvbicpKTtcbiAgICAgIGNvbnN0IGJpbmRpbmdOYW1lID0gYmluZGluZy5uYW1lICYmIHNhbml0aXplSWRlbnRpZmllcihiaW5kaW5nLm5hbWUpO1xuICAgICAgY29uc3QgdHlwZU5hbWUgPSBpZGVudGlmaWVyTmFtZShkaXJlY3RpdmVNZXRhZGF0YS50eXBlKTtcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9XG4gICAgICAgICAgdHlwZU5hbWUgJiYgYmluZGluZ05hbWUgPyBgJHt0eXBlTmFtZX1fJHtiaW5kaW5nTmFtZX1fSG9zdEJpbmRpbmdIYW5kbGVyYCA6IG51bGw7XG4gICAgICBjb25zdCBoYW5kbGVyID0gby5mbihcbiAgICAgICAgICBbbmV3IG8uRm5QYXJhbSgnJGV2ZW50Jywgby5EWU5BTUlDX1RZUEUpXSxcbiAgICAgICAgICBbLi4uYmluZGluZ0V4cHIuc3RtdHMsIG5ldyBvLlJldHVyblN0YXRlbWVudChiaW5kaW5nRXhwci5hbGxvd0RlZmF1bHQpXSwgby5JTkZFUlJFRF9UWVBFLFxuICAgICAgICAgIG51bGwsIGZ1bmN0aW9uTmFtZSk7XG4gICAgICBzdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgICAgby5pbXBvcnRFeHByKFIzLmxpc3RlbmVyKS5jYWxsRm4oW28ubGl0ZXJhbChiaW5kaW5nLm5hbWUpLCBoYW5kbGVyXSkudG9TdG10KCkpO1xuICAgIH1cbiAgfVxuXG5cbiAgaWYgKHN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHR5cGVOYW1lID0gZGlyZWN0aXZlTWV0YWRhdGEudHlwZS5yZWZlcmVuY2UubmFtZTtcbiAgICByZXR1cm4gby5mbihcbiAgICAgICAgW25ldyBvLkZuUGFyYW0oJ2RpckluZGV4Jywgby5OVU1CRVJfVFlQRSksIG5ldyBvLkZuUGFyYW0oJ2VsSW5kZXgnLCBvLk5VTUJFUl9UWVBFKV0sXG4gICAgICAgIHN0YXRlbWVudHMsIG8uSU5GRVJSRURfVFlQRSwgbnVsbCwgdHlwZU5hbWUgPyBgJHt0eXBlTmFtZX1fSG9zdEJpbmRpbmdzYCA6IG51bGwpO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGNvbmRpdGlvbmFsbHlDcmVhdGVNYXBPYmplY3RMaXRlcmFsKFxuICAgIGtleXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LCBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhrZXlzKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIG1hcFRvRXhwcmVzc2lvbihrZXlzKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuY2xhc3MgVmFsdWVDb252ZXJ0ZXIgZXh0ZW5kcyBBc3RNZW1vcnlFZmZpY2llbnRUcmFuc2Zvcm1lciB7XG4gIHByaXZhdGUgcGlwZVNsb3RzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgcHJpdmF0ZSBhbGxvY2F0ZVNsb3Q6ICgpID0+IG51bWJlcixcbiAgICAgIHByaXZhdGUgZGVmaW5lUGlwZTpcbiAgICAgICAgICAobmFtZTogc3RyaW5nLCBsb2NhbE5hbWU6IHN0cmluZywgc2xvdDogbnVtYmVyLCB2YWx1ZTogby5FeHByZXNzaW9uKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIC8vIEFzdE1lbW9yeUVmZmljaWVudFRyYW5zZm9ybWVyXG4gIHZpc2l0UGlwZShwaXBlOiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICAvLyBBbGxvY2F0ZSBhIHNsb3QgdG8gY3JlYXRlIHRoZSBwaXBlXG4gICAgY29uc3Qgc2xvdCA9IHRoaXMuYWxsb2NhdGVTbG90KCk7XG4gICAgY29uc3Qgc2xvdFBzZXVkb0xvY2FsID0gYFBJUEU6JHtzbG90fWA7XG4gICAgY29uc3QgdGFyZ2V0ID0gbmV3IFByb3BlcnR5UmVhZChwaXBlLnNwYW4sIG5ldyBJbXBsaWNpdFJlY2VpdmVyKHBpcGUuc3BhbiksIHNsb3RQc2V1ZG9Mb2NhbCk7XG4gICAgY29uc3QgYmluZGluZ0lkID0gcGlwZUJpbmRpbmcocGlwZS5hcmdzKTtcbiAgICB0aGlzLmRlZmluZVBpcGUocGlwZS5uYW1lLCBzbG90UHNldWRvTG9jYWwsIHNsb3QsIG8uaW1wb3J0RXhwcihiaW5kaW5nSWQpKTtcbiAgICBjb25zdCB2YWx1ZSA9IHBpcGUuZXhwLnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnZpc2l0QWxsKHBpcGUuYXJncyk7XG5cbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uQ2FsbChcbiAgICAgICAgcGlwZS5zcGFuLCB0YXJnZXQsIFtuZXcgTGl0ZXJhbFByaW1pdGl2ZShwaXBlLnNwYW4sIHNsb3QpLCB2YWx1ZSwgLi4uYXJnc10pO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXJyYXk6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJ1aWx0aW5GdW5jdGlvbkNhbGwoYXJyYXkuc3BhbiwgdGhpcy52aXNpdEFsbChhcnJheS5leHByZXNzaW9ucyksIHZhbHVlcyA9PiB7XG4gICAgICAvLyBJZiB0aGUgbGl0ZXJhbCBoYXMgY2FsY3VsYXRlZCAobm9uLWxpdGVyYWwpIGVsZW1lbnRzIHRyYW5zZm9ybSBpdCBpbnRvXG4gICAgICAvLyBjYWxscyB0byBsaXRlcmFsIGZhY3RvcmllcyB0aGF0IGNvbXBvc2UgdGhlIGxpdGVyYWwgYW5kIHdpbGwgY2FjaGUgaW50ZXJtZWRpYXRlXG4gICAgICAvLyB2YWx1ZXMuIE90aGVyd2lzZSwganVzdCByZXR1cm4gYW4gbGl0ZXJhbCBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB2YWx1ZXMuXG4gICAgICBjb25zdCBsaXRlcmFsID0gby5saXRlcmFsQXJyKHZhbHVlcyk7XG4gICAgICByZXR1cm4gdmFsdWVzLmV2ZXJ5KGEgPT4gYS5pc0NvbnN0YW50KCkpID9cbiAgICAgICAgICB0aGlzLm91dHB1dEN0eC5jb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKGxpdGVyYWwsIHRydWUpIDpcbiAgICAgICAgICBnZXRMaXRlcmFsRmFjdG9yeSh0aGlzLm91dHB1dEN0eCwgbGl0ZXJhbCk7XG4gICAgfSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxNYXAobWFwOiBMaXRlcmFsTWFwLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgQnVpbHRpbkZ1bmN0aW9uQ2FsbChtYXAuc3BhbiwgdGhpcy52aXNpdEFsbChtYXAudmFsdWVzKSwgdmFsdWVzID0+IHtcbiAgICAgIC8vIElmIHRoZSBsaXRlcmFsIGhhcyBjYWxjdWxhdGVkIChub24tbGl0ZXJhbCkgZWxlbWVudHMgIHRyYW5zZm9ybSBpdCBpbnRvXG4gICAgICAvLyBjYWxscyB0byBsaXRlcmFsIGZhY3RvcmllcyB0aGF0IGNvbXBvc2UgdGhlIGxpdGVyYWwgYW5kIHdpbGwgY2FjaGUgaW50ZXJtZWRpYXRlXG4gICAgICAvLyB2YWx1ZXMuIE90aGVyd2lzZSwganVzdCByZXR1cm4gYW4gbGl0ZXJhbCBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB2YWx1ZXMuXG4gICAgICBjb25zdCBsaXRlcmFsID0gby5saXRlcmFsTWFwKHZhbHVlcy5tYXAoXG4gICAgICAgICAgKHZhbHVlLCBpbmRleCkgPT4gKHtrZXk6IG1hcC5rZXlzW2luZGV4XS5rZXksIHZhbHVlLCBxdW90ZWQ6IG1hcC5rZXlzW2luZGV4XS5xdW90ZWR9KSkpO1xuICAgICAgcmV0dXJuIHZhbHVlcy5ldmVyeShhID0+IGEuaXNDb25zdGFudCgpKSA/XG4gICAgICAgICAgdGhpcy5vdXRwdXRDdHguY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChsaXRlcmFsLCB0cnVlKSA6XG4gICAgICAgICAgZ2V0TGl0ZXJhbEZhY3RvcnkodGhpcy5vdXRwdXRDdHgsIGxpdGVyYWwpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGludmFsaWQ8VD4oYXJnOiBvLkV4cHJlc3Npb24gfCBvLlN0YXRlbWVudCB8IFRlbXBsYXRlQXN0KTogbmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgSW52YWxpZCBzdGF0ZTogVmlzaXRvciAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gZG9lc24ndCBoYW5kbGUgJHtvLmNvbnN0cnVjdG9yLm5hbWV9YCk7XG59XG5cbmludGVyZmFjZSBOZ0NvbnRlbnRJbmZvIHtcbiAgaW5kZXg6IG51bWJlcjtcbiAgc2VsZWN0b3I/OiBzdHJpbmc7XG59XG5cbmNsYXNzIENvbnRlbnRQcm9qZWN0aW9uVmlzaXRvciBleHRlbmRzIFJlY3Vyc2l2ZVRlbXBsYXRlQXN0VmlzaXRvciB7XG4gIHByaXZhdGUgaW5kZXggPSAxO1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcHJvamVjdGlvbk1hcDogTWFwPE5nQ29udGVudEFzdCwgTmdDb250ZW50SW5mbz4sXG4gICAgICBwcml2YXRlIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgdmlzaXROZ0NvbnRlbnQobmdDb250ZW50OiBOZ0NvbnRlbnRBc3QpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IHRoaXMubmdDb250ZW50U2VsZWN0b3JzW25nQ29udGVudC5pbmRleF07XG4gICAgaWYgKHNlbGVjdG9yID09IG51bGwpIHtcbiAgICAgIGVycm9yKGBjb3VsZCBub3QgZmluZCBzZWxlY3RvciBmb3IgaW5kZXggJHtuZ0NvbnRlbnQuaW5kZXh9IGluICR7bmdDb250ZW50fWApO1xuICAgIH1cblxuICAgIGlmICghc2VsZWN0b3IgfHwgc2VsZWN0b3IgPT09ICcqJykge1xuICAgICAgdGhpcy5wcm9qZWN0aW9uTWFwLnNldChuZ0NvbnRlbnQsIHtpbmRleDogMH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb2plY3Rpb25NYXAuc2V0KG5nQ29udGVudCwge2luZGV4OiB0aGlzLmluZGV4KyssIHNlbGVjdG9yfSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldENvbnRlbnRQcm9qZWN0aW9uKG5vZGVzOiBUZW1wbGF0ZUFzdFtdLCBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IHByb2plY3RJbmRleE1hcCA9IG5ldyBNYXA8TmdDb250ZW50QXN0LCBOZ0NvbnRlbnRJbmZvPigpO1xuICBjb25zdCB2aXNpdG9yID0gbmV3IENvbnRlbnRQcm9qZWN0aW9uVmlzaXRvcihwcm9qZWN0SW5kZXhNYXAsIG5nQ29udGVudFNlbGVjdG9ycyk7XG4gIHRlbXBsYXRlVmlzaXRBbGwodmlzaXRvciwgbm9kZXMpO1xuICByZXR1cm4gcHJvamVjdEluZGV4TWFwO1xufVxuXG5cbi8qKlxuICogRmxhZ3MgdXNlZCB0byBnZW5lcmF0ZSBSMy1zdHlsZSBDU1MgU2VsZWN0b3JzLiBUaGV5IGFyZSBwYXN0ZWQgZnJvbVxuICogY29yZS9zcmMvcmVuZGVyMy9wcm9qZWN0aW9uLnRzIGJlY2F1c2UgdGhleSBjYW5ub3QgYmUgcmVmZXJlbmNlZCBkaXJlY3RseS5cbiAqL1xuY29uc3QgZW51bSBTZWxlY3RvckZsYWdzIHtcbiAgLyoqIEluZGljYXRlcyB0aGlzIGlzIHRoZSBiZWdpbm5pbmcgb2YgYSBuZXcgbmVnYXRpdmUgc2VsZWN0b3IgKi9cbiAgTk9UID0gMGIwMDAxLFxuXG4gIC8qKiBNb2RlIGZvciBtYXRjaGluZyBhdHRyaWJ1dGVzICovXG4gIEFUVFJJQlVURSA9IDBiMDAxMCxcblxuICAvKiogTW9kZSBmb3IgbWF0Y2hpbmcgdGFnIG5hbWVzICovXG4gIEVMRU1FTlQgPSAwYjAxMDAsXG5cbiAgLyoqIE1vZGUgZm9yIG1hdGNoaW5nIGNsYXNzIG5hbWVzICovXG4gIENMQVNTID0gMGIxMDAwLFxufVxuXG4vLyBUaGVzZSBhcmUgYSBjb3B5IHRoZSBDU1MgdHlwZXMgZnJvbSBjb3JlL3NyYy9yZW5kZXIzL2ludGVyZmFjZXMvcHJvamVjdGlvbi50c1xuLy8gVGhleSBhcmUgZHVwbGljYXRlZCBoZXJlIGFzIHRoZXkgY2Fubm90IGJlIGRpcmVjdGx5IHJlZmVyZW5jZWQgZnJvbSBjb3JlLlxudHlwZSBSM0Nzc1NlbGVjdG9yID0gKHN0cmluZyB8IFNlbGVjdG9yRmxhZ3MpW107XG50eXBlIFIzQ3NzU2VsZWN0b3JMaXN0ID0gUjNDc3NTZWxlY3RvcltdO1xuXG5mdW5jdGlvbiBwYXJzZXJTZWxlY3RvclRvU2ltcGxlU2VsZWN0b3Ioc2VsZWN0b3I6IENzc1NlbGVjdG9yKTogUjNDc3NTZWxlY3RvciB7XG4gIGNvbnN0IGNsYXNzZXMgPSBzZWxlY3Rvci5jbGFzc05hbWVzICYmIHNlbGVjdG9yLmNsYXNzTmFtZXMubGVuZ3RoID9cbiAgICAgIFtTZWxlY3RvckZsYWdzLkNMQVNTLCAuLi5zZWxlY3Rvci5jbGFzc05hbWVzXSA6XG4gICAgICBbXTtcbiAgY29uc3QgZWxlbWVudE5hbWUgPSBzZWxlY3Rvci5lbGVtZW50ICYmIHNlbGVjdG9yLmVsZW1lbnQgIT09ICcqJyA/IHNlbGVjdG9yLmVsZW1lbnQgOiAnJztcbiAgcmV0dXJuIFtlbGVtZW50TmFtZSwgLi4uc2VsZWN0b3IuYXR0cnMsIC4uLmNsYXNzZXNdO1xufVxuXG5mdW5jdGlvbiBwYXJzZXJTZWxlY3RvclRvTmVnYXRpdmVTZWxlY3RvcihzZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBSM0Nzc1NlbGVjdG9yIHtcbiAgY29uc3QgY2xhc3NlcyA9IHNlbGVjdG9yLmNsYXNzTmFtZXMgJiYgc2VsZWN0b3IuY2xhc3NOYW1lcy5sZW5ndGggP1xuICAgICAgW1NlbGVjdG9yRmxhZ3MuQ0xBU1MsIC4uLnNlbGVjdG9yLmNsYXNzTmFtZXNdIDpcbiAgICAgIFtdO1xuXG4gIGlmIChzZWxlY3Rvci5lbGVtZW50KSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIFNlbGVjdG9yRmxhZ3MuTk9UIHwgU2VsZWN0b3JGbGFncy5FTEVNRU5ULCBzZWxlY3Rvci5lbGVtZW50LCAuLi5zZWxlY3Rvci5hdHRycywgLi4uY2xhc3Nlc1xuICAgIF07XG4gIH0gZWxzZSBpZiAoc2VsZWN0b3IuYXR0cnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFtTZWxlY3RvckZsYWdzLk5PVCB8IFNlbGVjdG9yRmxhZ3MuQVRUUklCVVRFLCAuLi5zZWxlY3Rvci5hdHRycywgLi4uY2xhc3Nlc107XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yLmNsYXNzTmFtZXMgJiYgc2VsZWN0b3IuY2xhc3NOYW1lcy5sZW5ndGggP1xuICAgICAgICBbU2VsZWN0b3JGbGFncy5OT1QgfCBTZWxlY3RvckZsYWdzLkNMQVNTLCAuLi5zZWxlY3Rvci5jbGFzc05hbWVzXSA6XG4gICAgICAgIFtdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlclNlbGVjdG9yVG9SM1NlbGVjdG9yKHNlbGVjdG9yOiBDc3NTZWxlY3Rvcik6IFIzQ3NzU2VsZWN0b3Ige1xuICBjb25zdCBwb3NpdGl2ZSA9IHBhcnNlclNlbGVjdG9yVG9TaW1wbGVTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgY29uc3QgbmVnYXRpdmU6IFIzQ3NzU2VsZWN0b3JMaXN0ID0gc2VsZWN0b3Iubm90U2VsZWN0b3JzICYmIHNlbGVjdG9yLm5vdFNlbGVjdG9ycy5sZW5ndGggP1xuICAgICAgc2VsZWN0b3Iubm90U2VsZWN0b3JzLm1hcChub3RTZWxlY3RvciA9PiBwYXJzZXJTZWxlY3RvclRvTmVnYXRpdmVTZWxlY3Rvcihub3RTZWxlY3RvcikpIDpcbiAgICAgIFtdO1xuXG4gIHJldHVybiBwb3NpdGl2ZS5jb25jYXQoLi4ubmVnYXRpdmUpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiBSM0Nzc1NlbGVjdG9yTGlzdCB7XG4gIGNvbnN0IHNlbGVjdG9ycyA9IENzc1NlbGVjdG9yLnBhcnNlKHNlbGVjdG9yKTtcbiAgcmV0dXJuIHNlbGVjdG9ycy5tYXAocGFyc2VyU2VsZWN0b3JUb1IzU2VsZWN0b3IpO1xufVxuXG5mdW5jdGlvbiBhc0xpdGVyYWwodmFsdWU6IGFueSk6IG8uRXhwcmVzc2lvbiB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiBvLmxpdGVyYWxBcnIodmFsdWUubWFwKGFzTGl0ZXJhbCkpO1xuICB9XG4gIHJldHVybiBvLmxpdGVyYWwodmFsdWUsIG8uSU5GRVJSRURfVFlQRSk7XG59XG5cbmZ1bmN0aW9uIG1hcFRvRXhwcmVzc2lvbihtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBxdW90ZWQgPSBmYWxzZSk6IG8uRXhwcmVzc2lvbiB7XG4gIHJldHVybiBvLmxpdGVyYWxNYXAoXG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtYXApLm1hcChrZXkgPT4gKHtrZXksIHF1b3RlZCwgdmFsdWU6IGFzTGl0ZXJhbChtYXBba2V5XSl9KSkpO1xufVxuXG4vLyBQYXJzZSBpMThuIG1ldGFzIGxpa2U6XG4vLyAtIFwiQEBpZFwiLFxuLy8gLSBcImRlc2NyaXB0aW9uW0BAaWRdXCIsXG4vLyAtIFwibWVhbmluZ3xkZXNjcmlwdGlvbltAQGlkXVwiXG5mdW5jdGlvbiBwYXJzZUkxOG5NZXRhKGkxOG4/OiBzdHJpbmcpOiB7ZGVzY3JpcHRpb24/OiBzdHJpbmcsIGlkPzogc3RyaW5nLCBtZWFuaW5nPzogc3RyaW5nfSB7XG4gIGxldCBtZWFuaW5nOiBzdHJpbmd8dW5kZWZpbmVkO1xuICBsZXQgZGVzY3JpcHRpb246IHN0cmluZ3x1bmRlZmluZWQ7XG4gIGxldCBpZDogc3RyaW5nfHVuZGVmaW5lZDtcblxuICBpZiAoaTE4bikge1xuICAgIC8vIFRPRE8odmljYik6IGZpZ3VyZSBvdXQgaG93IHRvIGZvcmNlIGEgbWVzc2FnZSBJRCB3aXRoIGNsb3N1cmUgP1xuICAgIGNvbnN0IGlkSW5kZXggPSBpMThuLmluZGV4T2YoSURfU0VQQVJBVE9SKTtcblxuICAgIGNvbnN0IGRlc2NJbmRleCA9IGkxOG4uaW5kZXhPZihNRUFOSU5HX1NFUEFSQVRPUik7XG4gICAgbGV0IG1lYW5pbmdBbmREZXNjOiBzdHJpbmc7XG4gICAgW21lYW5pbmdBbmREZXNjLCBpZF0gPVxuICAgICAgICAoaWRJbmRleCA+IC0xKSA/IFtpMThuLnNsaWNlKDAsIGlkSW5kZXgpLCBpMThuLnNsaWNlKGlkSW5kZXggKyAyKV0gOiBbaTE4biwgJyddO1xuICAgIFttZWFuaW5nLCBkZXNjcmlwdGlvbl0gPSAoZGVzY0luZGV4ID4gLTEpID9cbiAgICAgICAgW21lYW5pbmdBbmREZXNjLnNsaWNlKDAsIGRlc2NJbmRleCksIG1lYW5pbmdBbmREZXNjLnNsaWNlKGRlc2NJbmRleCArIDEpXSA6XG4gICAgICAgIFsnJywgbWVhbmluZ0FuZERlc2NdO1xuICB9XG5cbiAgcmV0dXJuIHtkZXNjcmlwdGlvbiwgaWQsIG1lYW5pbmd9O1xufVxuIl19