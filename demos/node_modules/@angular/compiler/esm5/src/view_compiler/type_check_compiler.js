/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { StaticSymbol } from '../aot/static_symbol';
import { BindingForm, EventHandlerVars, convertActionBinding, convertPropertyBinding, convertPropertyBindingBuiltins } from '../compiler_util/expression_converter';
import * as o from '../output/output_ast';
import { templateVisitAll } from '../template_parser/template_ast';
/**
 * Generates code that is used to type check templates.
 */
var TypeCheckCompiler = /** @class */ (function () {
    function TypeCheckCompiler(options, reflector) {
        this.options = options;
        this.reflector = reflector;
    }
    /**
     * Important notes:
     * - This must not produce new `import` statements, but only refer to types outside
     *   of the file via the variables provided via externalReferenceVars.
     *   This allows Typescript to reuse the old program's structure as no imports have changed.
     * - This must not produce any exports, as this would pollute the .d.ts file
     *   and also violate the point above.
     */
    TypeCheckCompiler.prototype.compileComponent = function (componentId, component, template, usedPipes, externalReferenceVars, ctx) {
        var _this = this;
        var pipes = new Map();
        usedPipes.forEach(function (p) { return pipes.set(p.name, p.type.reference); });
        var embeddedViewCount = 0;
        var viewBuilderFactory = function (parent, guards) {
            var embeddedViewIndex = embeddedViewCount++;
            return new ViewBuilder(_this.options, _this.reflector, externalReferenceVars, parent, component.type.reference, component.isHost, embeddedViewIndex, pipes, guards, ctx, viewBuilderFactory);
        };
        var visitor = viewBuilderFactory(null, []);
        visitor.visitAll([], template);
        return visitor.build(componentId);
    };
    return TypeCheckCompiler;
}());
export { TypeCheckCompiler };
var DYNAMIC_VAR_NAME = '_any';
var TypeCheckLocalResolver = /** @class */ (function () {
    function TypeCheckLocalResolver() {
    }
    TypeCheckLocalResolver.prototype.getLocal = function (name) {
        if (name === EventHandlerVars.event.name) {
            // References to the event should not be type-checked.
            // TODO(chuckj): determine a better type for the event.
            return o.variable(DYNAMIC_VAR_NAME);
        }
        return null;
    };
    return TypeCheckLocalResolver;
}());
var defaultResolver = new TypeCheckLocalResolver();
var ViewBuilder = /** @class */ (function () {
    function ViewBuilder(options, reflector, externalReferenceVars, parent, component, isHostComponent, embeddedViewIndex, pipes, guards, ctx, viewBuilderFactory) {
        this.options = options;
        this.reflector = reflector;
        this.externalReferenceVars = externalReferenceVars;
        this.parent = parent;
        this.component = component;
        this.isHostComponent = isHostComponent;
        this.embeddedViewIndex = embeddedViewIndex;
        this.pipes = pipes;
        this.guards = guards;
        this.ctx = ctx;
        this.viewBuilderFactory = viewBuilderFactory;
        this.refOutputVars = new Map();
        this.variables = [];
        this.children = [];
        this.updates = [];
        this.actions = [];
    }
    ViewBuilder.prototype.getOutputVar = function (type) {
        var varName;
        if (type === this.component && this.isHostComponent) {
            varName = DYNAMIC_VAR_NAME;
        }
        else if (type instanceof StaticSymbol) {
            varName = this.externalReferenceVars.get(type);
        }
        else {
            varName = DYNAMIC_VAR_NAME;
        }
        if (!varName) {
            throw new Error("Illegal State: referring to a type without a variable " + JSON.stringify(type));
        }
        return varName;
    };
    ViewBuilder.prototype.getTypeGuardExpressions = function (ast) {
        var result = tslib_1.__spread(this.guards);
        try {
            for (var _a = tslib_1.__values(ast.directives), _b = _a.next(); !_b.done; _b = _a.next()) {
                var directive = _b.value;
                try {
                    for (var _c = tslib_1.__values(directive.inputs), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var input = _d.value;
                        var guard = directive.directive.guards[input.directiveName];
                        if (guard) {
                            var useIf = guard === 'UseIf';
                            result.push({
                                guard: guard,
                                useIf: useIf,
                                expression: { context: this.component, value: input.value }
                            });
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return result;
        var e_2, _f, e_1, _e;
    };
    ViewBuilder.prototype.visitAll = function (variables, astNodes) {
        this.variables = variables;
        templateVisitAll(this, astNodes);
    };
    ViewBuilder.prototype.build = function (componentId, targetStatements) {
        var _this = this;
        if (targetStatements === void 0) { targetStatements = []; }
        this.children.forEach(function (child) { return child.build(componentId, targetStatements); });
        var viewStmts = [o.variable(DYNAMIC_VAR_NAME).set(o.NULL_EXPR).toDeclStmt(o.DYNAMIC_TYPE)];
        var bindingCount = 0;
        this.updates.forEach(function (expression) {
            var _a = _this.preprocessUpdateExpression(expression), sourceSpan = _a.sourceSpan, context = _a.context, value = _a.value;
            var bindingId = "" + bindingCount++;
            var nameResolver = context === _this.component ? _this : defaultResolver;
            var _b = convertPropertyBinding(nameResolver, o.variable(_this.getOutputVar(context)), value, bindingId, BindingForm.General), stmts = _b.stmts, currValExpr = _b.currValExpr;
            stmts.push(new o.ExpressionStatement(currValExpr));
            viewStmts.push.apply(viewStmts, tslib_1.__spread(stmts.map(function (stmt) { return o.applySourceSpanToStatementIfNeeded(stmt, sourceSpan); })));
        });
        this.actions.forEach(function (_a) {
            var sourceSpan = _a.sourceSpan, context = _a.context, value = _a.value;
            var bindingId = "" + bindingCount++;
            var nameResolver = context === _this.component ? _this : defaultResolver;
            var stmts = convertActionBinding(nameResolver, o.variable(_this.getOutputVar(context)), value, bindingId).stmts;
            viewStmts.push.apply(viewStmts, tslib_1.__spread(stmts.map(function (stmt) { return o.applySourceSpanToStatementIfNeeded(stmt, sourceSpan); })));
        });
        if (this.guards.length) {
            var guardExpression = undefined;
            try {
                for (var _a = tslib_1.__values(this.guards), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var guard = _b.value;
                    var _c = this.preprocessUpdateExpression(guard.expression), context = _c.context, value = _c.value;
                    var bindingId = "" + bindingCount++;
                    var nameResolver = context === this.component ? this : defaultResolver;
                    // We only support support simple expressions and ignore others as they
                    // are unlikely to affect type narrowing.
                    var _d = convertPropertyBinding(nameResolver, o.variable(this.getOutputVar(context)), value, bindingId, BindingForm.TrySimple), stmts = _d.stmts, currValExpr = _d.currValExpr;
                    if (stmts.length == 0) {
                        var guardClause = guard.useIf ? currValExpr : this.ctx.importExpr(guard.guard).callFn([currValExpr]);
                        guardExpression = guardExpression ? guardExpression.and(guardClause) : guardClause;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                }
                finally { if (e_3) throw e_3.error; }
            }
            if (guardExpression) {
                viewStmts = [new o.IfStmt(guardExpression, viewStmts)];
            }
        }
        var viewName = "_View_" + componentId + "_" + this.embeddedViewIndex;
        var viewFactory = new o.DeclareFunctionStmt(viewName, [], viewStmts);
        targetStatements.push(viewFactory);
        return targetStatements;
        var e_3, _e;
    };
    ViewBuilder.prototype.visitBoundText = function (ast, context) {
        var _this = this;
        var astWithSource = ast.value;
        var inter = astWithSource.ast;
        inter.expressions.forEach(function (expr) {
            return _this.updates.push({ context: _this.component, value: expr, sourceSpan: ast.sourceSpan });
        });
    };
    ViewBuilder.prototype.visitEmbeddedTemplate = function (ast, context) {
        this.visitElementOrTemplate(ast);
        // Note: The old view compiler used to use an `any` type
        // for the context in any embedded view.
        // We keep this behaivor behind a flag for now.
        if (this.options.fullTemplateTypeCheck) {
            // Find any applicable type guards. For example, NgIf has a type guard on ngIf
            // (see NgIf.ngIfTypeGuard) that can be used to indicate that a template is only
            // stamped out if ngIf is truthy so any bindings in the template can assume that,
            // if a nullable type is used for ngIf, that expression is not null or undefined.
            var guards = this.getTypeGuardExpressions(ast);
            var childVisitor = this.viewBuilderFactory(this, guards);
            this.children.push(childVisitor);
            childVisitor.visitAll(ast.variables, ast.children);
        }
    };
    ViewBuilder.prototype.visitElement = function (ast, context) {
        var _this = this;
        this.visitElementOrTemplate(ast);
        var inputDefs = [];
        var updateRendererExpressions = [];
        var outputDefs = [];
        ast.inputs.forEach(function (inputAst) {
            _this.updates.push({ context: _this.component, value: inputAst.value, sourceSpan: inputAst.sourceSpan });
        });
        templateVisitAll(this, ast.children);
    };
    ViewBuilder.prototype.visitElementOrTemplate = function (ast) {
        var _this = this;
        ast.directives.forEach(function (dirAst) { _this.visitDirective(dirAst); });
        ast.references.forEach(function (ref) {
            var outputVarType = null;
            // Note: The old view compiler used to use an `any` type
            // for directives exposed via `exportAs`.
            // We keep this behaivor behind a flag for now.
            if (ref.value && ref.value.identifier && _this.options.fullTemplateTypeCheck) {
                outputVarType = ref.value.identifier.reference;
            }
            else {
                outputVarType = o.BuiltinTypeName.Dynamic;
            }
            _this.refOutputVars.set(ref.name, outputVarType);
        });
        ast.outputs.forEach(function (outputAst) {
            _this.actions.push({ context: _this.component, value: outputAst.handler, sourceSpan: outputAst.sourceSpan });
        });
    };
    ViewBuilder.prototype.visitDirective = function (dirAst) {
        var _this = this;
        var dirType = dirAst.directive.type.reference;
        dirAst.inputs.forEach(function (input) { return _this.updates.push({ context: _this.component, value: input.value, sourceSpan: input.sourceSpan }); });
        // Note: The old view compiler used to use an `any` type
        // for expressions in host properties / events.
        // We keep this behaivor behind a flag for now.
        if (this.options.fullTemplateTypeCheck) {
            dirAst.hostProperties.forEach(function (inputAst) { return _this.updates.push({ context: dirType, value: inputAst.value, sourceSpan: inputAst.sourceSpan }); });
            dirAst.hostEvents.forEach(function (hostEventAst) { return _this.actions.push({
                context: dirType,
                value: hostEventAst.handler,
                sourceSpan: hostEventAst.sourceSpan
            }); });
        }
    };
    ViewBuilder.prototype.getLocal = function (name) {
        if (name == EventHandlerVars.event.name) {
            return o.variable(this.getOutputVar(o.BuiltinTypeName.Dynamic));
        }
        for (var currBuilder = this; currBuilder; currBuilder = currBuilder.parent) {
            var outputVarType = void 0;
            // check references
            outputVarType = currBuilder.refOutputVars.get(name);
            if (outputVarType == null) {
                // check variables
                var varAst = currBuilder.variables.find(function (varAst) { return varAst.name === name; });
                if (varAst) {
                    outputVarType = o.BuiltinTypeName.Dynamic;
                }
            }
            if (outputVarType != null) {
                return o.variable(this.getOutputVar(outputVarType));
            }
        }
        return null;
    };
    ViewBuilder.prototype.pipeOutputVar = function (name) {
        var pipe = this.pipes.get(name);
        if (!pipe) {
            throw new Error("Illegal State: Could not find pipe " + name + " in template of " + this.component);
        }
        return this.getOutputVar(pipe);
    };
    ViewBuilder.prototype.preprocessUpdateExpression = function (expression) {
        var _this = this;
        return {
            sourceSpan: expression.sourceSpan,
            context: expression.context,
            value: convertPropertyBindingBuiltins({
                createLiteralArrayConverter: function (argCount) { return function (args) {
                    var arr = o.literalArr(args);
                    // Note: The old view compiler used to use an `any` type
                    // for arrays.
                    return _this.options.fullTemplateTypeCheck ? arr : arr.cast(o.DYNAMIC_TYPE);
                }; },
                createLiteralMapConverter: function (keys) { return function (values) {
                    var entries = keys.map(function (k, i) { return ({
                        key: k.key,
                        value: values[i],
                        quoted: k.quoted,
                    }); });
                    var map = o.literalMap(entries);
                    // Note: The old view compiler used to use an `any` type
                    // for maps.
                    return _this.options.fullTemplateTypeCheck ? map : map.cast(o.DYNAMIC_TYPE);
                }; },
                createPipeConverter: function (name, argCount) { return function (args) {
                    // Note: The old view compiler used to use an `any` type
                    // for pipes.
                    var pipeExpr = _this.options.fullTemplateTypeCheck ?
                        o.variable(_this.pipeOutputVar(name)) :
                        o.variable(_this.getOutputVar(o.BuiltinTypeName.Dynamic));
                    return pipeExpr.callMethod('transform', args);
                }; },
            }, expression.value)
        };
    };
    ViewBuilder.prototype.visitNgContent = function (ast, context) { };
    ViewBuilder.prototype.visitText = function (ast, context) { };
    ViewBuilder.prototype.visitDirectiveProperty = function (ast, context) { };
    ViewBuilder.prototype.visitReference = function (ast, context) { };
    ViewBuilder.prototype.visitVariable = function (ast, context) { };
    ViewBuilder.prototype.visitEvent = function (ast, context) { };
    ViewBuilder.prototype.visitElementProperty = function (ast, context) { };
    ViewBuilder.prototype.visitAttr = function (ast, context) { };
    return ViewBuilder;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9jaGVja19jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy92aWV3X2NvbXBpbGVyL3R5cGVfY2hlY2tfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUlILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUVsRCxPQUFPLEVBQUMsV0FBVyxFQUFvQixnQkFBZ0IsRUFBaUIsb0JBQW9CLEVBQUUsc0JBQXNCLEVBQUUsOEJBQThCLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUduTSxPQUFPLEtBQUssQ0FBQyxNQUFNLHNCQUFzQixDQUFDO0FBRzFDLE9BQU8sRUFBNFIsZ0JBQWdCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUk1Vjs7R0FFRztBQUNIO0lBQ0UsMkJBQW9CLE9BQTJCLEVBQVUsU0FBMEI7UUFBL0QsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFpQjtJQUFHLENBQUM7SUFFdkY7Ozs7Ozs7T0FPRztJQUNILDRDQUFnQixHQUFoQixVQUNJLFdBQW1CLEVBQUUsU0FBbUMsRUFBRSxRQUF1QixFQUNqRixTQUErQixFQUFFLHFCQUFnRCxFQUNqRixHQUFrQjtRQUh0QixpQkFtQkM7UUFmQyxJQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztRQUM5QyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQW5DLENBQW1DLENBQUMsQ0FBQztRQUM1RCxJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFNLGtCQUFrQixHQUNwQixVQUFDLE1BQTBCLEVBQUUs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ZSxHQUFpQixFQUFFLE9BQVksSUFBUSxDQUFDO0lBQ3ZELG1DQUFhLEdBQWIsVUFBYyxHQUFnQixFQUFFLE9BQVksSUFBUSxDQUFDO0lBQ3JELGdDQUFVLEdBQVYsVUFBVyxHQUFrQixFQUFFLE9BQVksSUFBUSxDQUFDO0lBQ3BELDBDQUFvQixHQUFwQixVQUFxQixHQUE0QixFQUFFLE9BQVksSUFBUSxDQUFDO0lBQ3hFLCtCQUFTLEdBQVQsVUFBVSxHQUFZLEVBQUUsT0FBWSxJQUFRLENBQUM7SUFDL0Msa0JBQUM7QUFBRCxDQUFDLEFBN1FELElBNlFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FvdENvbXBpbGVyT3B0aW9uc30gZnJvbSAnLi4vYW90L2NvbXBpbGVyX29wdGlvbnMnO1xuaW1wb3J0IHtTdGF0aWNSZWZsZWN0b3J9IGZyb20gJy4uL2FvdC9zdGF0aWNfcmVmbGVjdG9yJztcbmltcG9ydCB7U3RhdGljU3ltYm9sfSBmcm9tICcuLi9hb3Qvc3RhdGljX3N5bWJvbCc7XG5pbXBvcnQge0NvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSwgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlUGlwZVN1bW1hcnl9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtCaW5kaW5nRm9ybSwgQnVpbHRpbkNvbnZlcnRlciwgRXZlbnRIYW5kbGVyVmFycywgTG9jYWxSZXNvbHZlciwgY29udmVydEFjdGlvbkJpbmRpbmcsIGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcsIGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmdCdWlsdGluc30gZnJvbSAnLi4vY29tcGlsZXJfdXRpbC9leHByZXNzaW9uX2NvbnZlcnRlcic7XG5pbXBvcnQge0FTVCwgQVNUV2l0aFNvdXJjZSwgSW50ZXJwb2xhdGlvbn0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnN9IGZyb20gJy4uL2lkZW50aWZpZXJzJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtjb252ZXJ0VmFsdWVUb091dHB1dEFzdH0gZnJvbSAnLi4vb3V0cHV0L3ZhbHVlX3V0aWwnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtBdHRyQXN0LCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgQm91bmRFdmVudEFzdCwgQm91bmRUZXh0QXN0LCBEaXJlY3RpdmVBc3QsIEVsZW1lbnRBc3QsIEVtYmVkZGVkVGVtcGxhdGVBc3QsIE5nQ29udGVudEFzdCwgUHJvcGVydHlCaW5kaW5nVHlwZSwgUHJvdmlkZXJBc3QsIFByb3ZpZGVyQXN0VHlwZSwgUXVlcnlNYXRjaCwgUmVmZXJlbmNlQXN0LCBUZW1wbGF0ZUFzdCwgVGVtcGxhdGVBc3RWaXNpdG9yLCBUZXh0QXN0LCBWYXJpYWJsZUFzdCwgdGVtcGxhdGVWaXNpdEFsbH0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge091dHB1dENvbnRleHR9IGZyb20gJy4uL3V0aWwnO1xuXG5cbi8qKlxuICogR2VuZXJhdGVzIGNvZGUgdGhhdCBpcyB1c2VkIHRvIHR5cGUgY2hlY2sgdGVtcGxhdGVzLlxuICovXG5leHBvcnQgY2xhc3MgVHlwZUNoZWNrQ29tcGlsZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9wdGlvbnM6IEFvdENvbXBpbGVyT3B0aW9ucywgcHJpdmF0ZSByZWZsZWN0b3I6IFN0YXRpY1JlZmxlY3Rvcikge31cblxuICAvKipcbiAgICogSW1wb3J0YW50IG5vdGVzOlxuICAgKiAtIFRoaXMgbXVzdCBub3QgcHJvZHVjZSBuZXcgYGltcG9ydGAgc3RhdGVtZW50cywgYnV0IG9ubHkgcmVmZXIgdG8gdHlwZXMgb3V0c2lkZVxuICAgKiAgIG9mIHRoZSBmaWxlIHZpYSB0aGUgdmFyaWFibGVzIHByb3ZpZGVkIHZpYSBleHRlcm5hbFJlZmVyZW5jZVZhcnMuXG4gICAqICAgVGhpcyBhbGxvd3MgVHlwZXNjcmlwdCB0byByZXVzZSB0aGUgb2xkIHByb2dyYW0ncyBzdHJ1Y3R1cmUgYXMgbm8gaW1wb3J0cyBoYXZlIGNoYW5nZWQuXG4gICAqIC0gVGhpcyBtdXN0IG5vdCBwcm9kdWNlIGFueSBleHBvcnRzLCBhcyB0aGlzIHdvdWxkIHBvbGx1dGUgdGhlIC5kLnRzIGZpbGVcbiAgICogICBhbmQgYWxzbyB2aW9sYXRlIHRoZSBwb2ludCBhYm92ZS5cbiAgICovXG4gIGNvbXBpbGVDb21wb25lbnQoXG4gICAgICBjb21wb25lbnRJZDogc3RyaW5nLCBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgdGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sXG4gICAgICB1c2VkUGlwZXM6IENvbXBpbGVQaXBlU3VtbWFyeVtdLCBleHRlcm5hbFJlZmVyZW5jZVZhcnM6IE1hcDxTdGF0aWNTeW1ib2wsIHN0cmluZz4sXG4gICAgICBjdHg6IE91dHB1dENvbnRleHQpOiBvLlN0YXRlbWVudFtdIHtcbiAgICBjb25zdCBwaXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBTdGF0aWNTeW1ib2w+KCk7XG4gICAgdXNlZFBpcGVzLmZvckVhY2gocCA9PiBwaXBlcy5zZXQocC5uYW1lLCBwLnR5cGUucmVmZXJlbmNlKSk7XG4gICAgbGV0IGVtYmVkZGVkVmlld0NvdW50ID0gMDtcbiAgICBjb25zdCB2aWV3QnVpbGRlckZhY3RvcnkgPVxuICAgICAgICAocGFyZW50OiBWaWV3QnVpbGRlciB8IG51bGwsIGd1YXJkczogR3VhcmRFeHByZXNzaW9uW10pOiBWaWV3QnVpbGRlciA9PiB7XG4gICAgICAgICAgY29uc3QgZW1iZWRkZWRWaWV3SW5kZXggPSBlbWJlZGRlZFZpZXdDb3VudCsrO1xuICAgICAgICAgIHJldHVybiBuZXcgVmlld0J1aWxkZXIoXG4gICAgICAgICAgICAgIHRoaXMub3B0aW9ucywgdGhpcy5yZWZsZWN0b3IsIGV4dGVybmFsUmVmZXJlbmNlVmFycywgcGFyZW50LCBjb21wb25lbnQudHlwZS5yZWZlcmVuY2UsXG4gICAgICAgICAgICAgIGNvbXBvbmVudC5pc0hvc3QsIGVtYmVkZGVkVmlld0luZGV4LCBwaXBlcywgZ3VhcmRzLCBjdHgsIHZpZXdCdWlsZGVyRmFjdG9yeSk7XG4gICAgICAgIH07XG5cbiAgICBjb25zdCB2aXNpdG9yID0gdmlld0J1aWxkZXJGYWN0b3J5KG51bGwsIFtdKTtcbiAgICB2aXNpdG9yLnZpc2l0QWxsKFtdLCB0ZW1wbGF0ZSk7XG5cbiAgICByZXR1cm4gdmlzaXRvci5idWlsZChjb21wb25lbnRJZCk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIEd1YXJkRXhwcmVzc2lvbiB7XG4gIGd1YXJkOiBTdGF0aWNTeW1ib2w7XG4gIHVzZUlmOiBib29sZWFuO1xuICBleHByZXNzaW9uOiBFeHByZXNzaW9uO1xufVxuXG5pbnRlcmZhY2UgVmlld0J1aWxkZXJGYWN0b3J5IHtcbiAgKHBhcmVudDogVmlld0J1aWxkZXIsIGd1YXJkczogR3VhcmRFeHByZXNzaW9uW10pOiBWaWV3QnVpbGRlcjtcbn1cblxuLy8gTm90ZTogVGhpcyBpcyB1c2VkIGFzIGtleSBpbiBNYXAgYW5kIHNob3VsZCB0aGVyZWZvcmUgYmVcbi8vIHVuaXF1ZSBwZXIgdmFsdWUuXG50eXBlIE91dHB1dFZhclR5cGUgPSBvLkJ1aWx0aW5UeXBlTmFtZSB8IFN0YXRpY1N5bWJvbDtcblxuaW50ZXJmYWNlIEV4cHJlc3Npb24ge1xuICBjb250ZXh0OiBPdXRwdXRWYXJUeXBlO1xuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW47XG4gIHZhbHVlOiBBU1Q7XG59XG5cbmNvbnN0IERZTkFNSUNfVkFSX05BTUUgPSAnX2FueSc7XG5cbmNsYXNzIFR5cGVDaGVja0xvY2FsUmVzb2x2ZXIgaW1wbGVtZW50cyBMb2NhbFJlc29sdmVyIHtcbiAgZ2V0TG9jYWwobmFtZTogc3RyaW5nKTogby5FeHByZXNzaW9ufG51bGwge1xuICAgIGlmIChuYW1lID09PSBFdmVudEhhbmRsZXJWYXJzLmV2ZW50Lm5hbWUpIHtcbiAgICAgIC8vIFJlZmVyZW5jZXMgdG8gdGhlIGV2ZW50IHNob3VsZCBub3QgYmUgdHlwZS1jaGVja2VkLlxuICAgICAgLy8gVE9ETyhjaHVja2opOiBkZXRlcm1pbmUgYSBiZXR0ZXIgdHlwZSBmb3IgdGhlIGV2ZW50LlxuICAgICAgcmV0dXJuIG8udmFyaWFibGUoRFlOQU1JQ19WQVJfTkFNRSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmNvbnN0IGRlZmF1bHRSZXNvbHZlciA9IG5ldyBUeXBlQ2hlY2tMb2NhbFJlc29sdmVyKCk7XG5cbmNsYXNzIFZpZXdCdWlsZGVyIGltcGxlbWVudHMgVGVtcGxhdGVBc3RWaXNpdG9yLCBMb2NhbFJlc29sdmVyIHtcbiAgcHJpdmF0ZSByZWZPdXRwdXRWYXJzID0gbmV3IE1hcDxzdHJpbmcsIE91dHB1dFZhclR5cGU+KCk7XG4gIHByaXZhdGUgdmFyaWFibGVzOiBWYXJpYWJsZUFzdFtdID0gW107XG4gIHByaXZhdGUgY2hpbGRyZW46IFZpZXdCdWlsZGVyW10gPSBbXTtcbiAgcHJpdmF0ZSB1cGRhdGVzOiBFeHByZXNzaW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBhY3Rpb25zOiBFeHByZXNzaW9uW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgb3B0aW9uczogQW90Q29tcGlsZXJPcHRpb25zLCBwcml2YXRlIHJlZmxlY3RvcjogU3RhdGljUmVmbGVjdG9yLFxuICAgICAgcHJpdmF0ZSBleHRlcm5hbFJlZmVyZW5jZVZhcnM6IE1hcDxTdGF0aWNTeW1ib2wsIHN0cmluZz4sIHByaXZhdGUgcGFyZW50OiBWaWV3QnVpbGRlcnxudWxsLFxuICAgICAgcHJpdmF0ZSBjb21wb25lbnQ6IFN0YXRpY1N5bWJvbCwgcHJpdmF0ZSBpc0hvc3RDb21wb25lbnQ6IGJvb2xlYW4sXG4gICAgICBwcml2YXRlIGVtYmVkZGVkVmlld0luZGV4OiBudW1iZXIsIHByaXZhdGUgcGlwZXM6IE1hcDxzdHJpbmcsIFN0YXRpY1N5bWJvbD4sXG4gICAgICBwcml2YXRlIGd1YXJkczogR3VhcmRFeHByZXNzaW9uW10sIHByaXZhdGUgY3R4OiBPdXRwdXRDb250ZXh0LFxuICAgICAgcHJpdmF0ZSB2aWV3QnVpbGRlckZhY3Rvcnk6IFZpZXdCdWlsZGVyRmFjdG9yeSkge31cblxuICBwcml2YXRlIGdldE91dHB1dFZhcih0eXBlOiBvLkJ1aWx0aW5UeXBlTmFtZXxTdGF0aWNTeW1ib2wpOiBzdHJpbmcge1xuICAgIGxldCB2YXJOYW1lOiBzdHJpbmd8dW5kZWZpbmVkO1xuICAgIGlmICh0eXBlID09PSB0aGlzLmNvbXBvbmVudCAmJiB0aGlzLmlzSG9zdENvbXBvbmVudCkge1xuICAgICAgdmFyTmFtZSA9IERZTkFNSUNfVkFSX05BTUU7XG4gICAgfSBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICB2YXJOYW1lID0gdGhpcy5leHRlcm5hbFJlZmVyZW5jZVZhcnMuZ2V0KHR5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXJOYW1lID0gRFlOQU1JQ19WQVJfTkFNRTtcbiAgICB9XG4gICAgaWYgKCF2YXJOYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYElsbGVnYWwgU3RhdGU6IHJlZmVycmluZyB0byBhIHR5cGUgd2l0aG91dCBhIHZhcmlhYmxlICR7SlNPTi5zdHJpbmdpZnkodHlwZSl9YCk7XG4gICAgfVxuICAgIHJldHVybiB2YXJOYW1lO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUeXBlR3VhcmRFeHByZXNzaW9ucyhhc3Q6IEVtYmVkZGVkVGVtcGxhdGVBc3QpOiBHdWFyZEV4cHJlc3Npb25bXSB7XG4gICAgY29uc3QgcmVzdWx0ID0gWy4uLnRoaXMuZ3VhcmRzXTtcbiAgICBmb3IgKGxldCBkaXJlY3RpdmUgb2YgYXN0LmRpcmVjdGl2ZXMpIHtcbiAgICAgIGZvciAobGV0IGlucHV0IG9mIGRpcmVjdGl2ZS5pbnB1dHMpIHtcbiAgICAgICAgY29uc3QgZ3VhcmQgPSBkaXJlY3RpdmUuZGlyZWN0aXZlLmd1YXJkc1tpbnB1dC5kaXJlY3RpdmVOYW1lXTtcbiAgICAgICAgaWYgKGd1YXJkKSB7XG4gICAgICAgICAgY29uc3QgdXNlSWYgPSBndWFyZCA9PT0gJ1VzZUlmJztcbiAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICBndWFyZCxcbiAgICAgICAgICAgIHVzZUlmLFxuICAgICAgICAgICAgZXhwcmVzc2lvbjoge2NvbnRleHQ6IHRoaXMuY29tcG9uZW50LCB2YWx1ZTogaW5wdXQudmFsdWV9IGFzIEV4cHJlc3Npb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmlzaXRBbGwodmFyaWFibGVzOiBWYXJpYWJsZUFzdFtdLCBhc3ROb2RlczogVGVtcGxhdGVBc3RbXSkge1xuICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgIHRlbXBsYXRlVmlzaXRBbGwodGhpcywgYXN0Tm9kZXMpO1xuICB9XG5cbiAgYnVpbGQoY29tcG9uZW50SWQ6IHN0cmluZywgdGFyZ2V0U3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSA9IFtdKTogby5TdGF0ZW1lbnRbXSB7XG4gICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4gY2hpbGQuYnVpbGQoY29tcG9uZW50SWQsIHRhcmdldFN0YXRlbWVudHMpKTtcbiAgICBsZXQgdmlld1N0bXRzOiBvLlN0YXRlbWVudFtdID1cbiAgICAgICAgW28udmFyaWFibGUoRFlOQU1JQ19WQVJfTkFNRSkuc2V0KG8uTlVMTF9FWFBSKS50b0RlY2xTdG10KG8uRFlOQU1JQ19UWVBFKV07XG4gICAgbGV0IGJpbmRpbmdDb3VudCA9IDA7XG4gICAgdGhpcy51cGRhdGVzLmZvckVhY2goKGV4cHJlc3Npb24pID0+IHtcbiAgICAgIGNvbnN0IHtzb3VyY2VTcGFuLCBjb250ZXh0LCB2YWx1ZX0gPSB0aGlzLnByZXByb2Nlc3NVcGRhdGVFeHByZXNzaW9uKGV4cHJlc3Npb24pO1xuICAgICAgY29uc3QgYmluZGluZ0lkID0gYCR7YmluZGluZ0NvdW50Kyt9YDtcbiAgICAgIGNvbnN0IG5hbWVSZXNvbHZlciA9IGNvbnRleHQgPT09IHRoaXMuY29tcG9uZW50ID8gdGhpcyA6IGRlZmF1bHRSZXNvbHZlcjtcbiAgICAgIGNvbnN0IHtzdG10cywgY3VyclZhbEV4cHJ9ID0gY29udmVydFByb3BlcnR5QmluZGluZyhcbiAgICAgICAgICBuYW1lUmVzb2x2ZXIsIG8udmFyaWFibGUodGhpcy5nZXRPdXRwdXRWYXIoY29udGV4dCkpLCB2YWx1ZSwgYmluZGluZ0lkLFxuICAgICAgICAgIEJpbmRpbmdGb3JtLkdlbmVyYWwpO1xuICAgICAgc3RtdHMucHVzaChuZXcgby5FeHByZXNzaW9uU3RhdGVtZW50KGN1cnJWYWxFeHByKSk7XG4gICAgICB2aWV3U3RtdHMucHVzaCguLi5zdG10cy5tYXAoXG4gICAgICAgICAgKHN0bXQ6IG8uU3RhdGVtZW50KSA9PiBvLmFwcGx5U291cmNlU3BhblRvU3RhdGVtZW50SWZOZWVkZWQoc3RtdCwgc291cmNlU3BhbikpKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYWN0aW9ucy5mb3JFYWNoKCh7c291cmNlU3BhbiwgY29udGV4dCwgdmFsdWV9KSA9PiB7XG4gICAgICBjb25zdCBiaW5kaW5nSWQgPSBgJHtiaW5kaW5nQ291bnQrK31gO1xuICAgICAgY29uc3QgbmFtZVJlc29sdmVyID0gY29udGV4dCA9PT0gdGhpcy5jb21wb25lbnQgPyB0aGlzIDogZGVmYXVsdFJlc29sdmVyO1xuICAgICAgY29uc3Qge3N0bXRzfSA9IGNvbnZlcnRBY3Rpb25CaW5kaW5nKFxuICAgICAgICAgIG5hbWVSZXNvbHZlciwgby52YXJpYWJsZSh0aGlzLmdldE91dHB1dFZhcihjb250ZXh0KSksIHZhbHVlLCBiaW5kaW5nSWQpO1xuICAgICAgdmlld1N0bXRzLnB1c2goLi4uc3RtdHMubWFwKFxuICAgICAgICAgIChzdG10OiBvLlN0YXRlbWVudCkgPT4gby5hcHBseVNvdXJjZVNwYW5Ub1N0YXRlbWVudElmTmVlZGVkKHN0bXQsIHNvdXJjZVNwYW4pKSk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5ndWFyZHMubGVuZ3RoKSB7XG4gICAgICBsZXQgZ3VhcmRFeHByZXNzaW9uOiBvLkV4cHJlc3Npb258dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgZm9yIChjb25zdCBndWFyZCBvZiB0aGlzLmd1YXJkcykge1xuICAgICAgICBjb25zdCB7Y29udGV4dCwgdmFsdWV9ID0gdGhpcy5wcmVwcm9jZXNzVXBkYXRlRXhwcmVzc2lvbihndWFyZC5leHByZXNzaW9uKTtcbiAgICAgICAgY29uc3QgYmluZGluZ0lkID0gYCR7YmluZGluZ0NvdW50Kyt9YDtcbiAgICAgICAgY29uc3QgbmFtZVJlc29sdmVyID0gY29udGV4dCA9PT0gdGhpcy5jb21wb25lbnQgPyB0aGlzIDogZGVmYXVsdFJlc29sdmVyO1xuICAgICAgICAvLyBXZSBvbmx5IHN1cHBvcnQgc3VwcG9ydCBzaW1wbGUgZXhwcmVzc2lvbnMgYW5kIGlnbm9yZSBvdGhlcnMgYXMgdGhleVxuICAgICAgICAvLyBhcmUgdW5saWtlbHkgdG8gYWZmZWN0IHR5cGUgbmFycm93aW5nLlxuICAgICAgICBjb25zdCB7c3RtdHMsIGN1cnJWYWxFeHByfSA9IGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICAgICAgICBuYW1lUmVzb2x2ZXIsIG8udmFyaWFibGUodGhpcy5nZXRPdXRwdXRWYXIoY29udGV4dCkpLCB2YWx1ZSwgYmluZGluZ0lkLFxuICAgICAgICAgICAgQmluZGluZ0Zvcm0uVHJ5U2ltcGxlKTtcbiAgICAgICAgaWYgKHN0bXRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgY29uc3QgZ3VhcmRDbGF1c2UgPVxuICAgICAgICAgICAgICBndWFyZC51c2VJZiA/IGN1cnJWYWxFeHByIDogdGhpcy5jdHguaW1wb3J0RXhwcihndWFyZC5ndWFyZCkuY2FsbEZuKFtjdXJyVmFsRXhwcl0pO1xuICAgICAgICAgIGd1YXJkRXhwcmVzc2lvbiA9IGd1YXJkRXhwcmVzc2lvbiA/IGd1YXJkRXhwcmVzc2lvbi5hbmQoZ3VhcmRDbGF1c2UpIDogZ3VhcmRDbGF1c2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChndWFyZEV4cHJlc3Npb24pIHtcbiAgICAgICAgdmlld1N0bXRzID0gW25ldyBvLklmU3RtdChndWFyZEV4cHJlc3Npb24sIHZpZXdTdG10cyldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHZpZXdOYW1lID0gYF9WaWV3XyR7Y29tcG9uZW50SWR9XyR7dGhpcy5lbWJlZGRlZFZpZXdJbmRleH1gO1xuICAgIGNvbnN0IHZpZXdGYWN0b3J5ID0gbmV3IG8uRGVjbGFyZUZ1bmN0aW9uU3RtdCh2aWV3TmFtZSwgW10sIHZpZXdTdG10cyk7XG4gICAgdGFyZ2V0U3RhdGVtZW50cy5wdXNoKHZpZXdGYWN0b3J5KTtcbiAgICByZXR1cm4gdGFyZ2V0U3RhdGVtZW50cztcbiAgfVxuXG4gIHZpc2l0Qm91bmRUZXh0KGFzdDogQm91bmRUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGNvbnN0IGFzdFdpdGhTb3VyY2UgPSA8QVNUV2l0aFNvdXJjZT5hc3QudmFsdWU7XG4gICAgY29uc3QgaW50ZXIgPSA8SW50ZXJwb2xhdGlvbj5hc3RXaXRoU291cmNlLmFzdDtcblxuICAgIGludGVyLmV4cHJlc3Npb25zLmZvckVhY2goXG4gICAgICAgIChleHByKSA9PlxuICAgICAgICAgICAgdGhpcy51cGRhdGVzLnB1c2goe2NvbnRleHQ6IHRoaXMuY29tcG9uZW50LCB2YWx1ZTogZXhwciwgc291cmNlU3BhbjogYXN0LnNvdXJjZVNwYW59KSk7XG4gIH1cblxuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBFbWJlZGRlZFRlbXBsYXRlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmlzaXRFbGVtZW50T3JUZW1wbGF0ZShhc3QpO1xuICAgIC8vIE5vdGU6IFRoZSBvbGQgdmlldyBjb21waWxlciB1c2VkIHRvIHVzZSBhbiBgYW55YCB0eXBlXG4gICAgLy8gZm9yIHRoZSBjb250ZXh0IGluIGFueSBlbWJlZGRlZCB2aWV3LlxuICAgIC8vIFdlIGtlZXAgdGhpcyBiZWhhaXZvciBiZWhpbmQgYSBmbGFnIGZvciBub3cuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5mdWxsVGVtcGxhdGVUeXBlQ2hlY2spIHtcbiAgICAgIC8vIEZpbmQgYW55IGFwcGxpY2FibGUgdHlwZSBndWFyZHMuIEZvciBleGFtcGxlLCBOZ0lmIGhhcyBhIHR5cGUgZ3VhcmQgb24gbmdJZlxuICAgICAgLy8gKHNlZSBOZ0lmLm5nSWZUeXBlR3VhcmQpIHRoYXQgY2FuIGJlIHVzZWQgdG8gaW5kaWNhdGUgdGhhdCBhIHRlbXBsYXRlIGlzIG9ubHlcbiAgICAgIC8vIHN0YW1wZWQgb3V0IGlmIG5nSWYgaXMgdHJ1dGh5IHNvIGFueSBiaW5kaW5ncyBpbiB0aGUgdGVtcGxhdGUgY2FuIGFzc3VtZSB0aGF0LFxuICAgICAgLy8gaWYgYSBudWxsYWJsZSB0eXBlIGlzIHVzZWQgZm9yIG5nSWYsIHRoYXQgZXhwcmVzc2lvbiBpcyBub3QgbnVsbCBvciB1bmRlZmluZWQuXG4gICAgICBjb25zdCBndWFyZHMgPSB0aGlzLmdldFR5cGVHdWFyZEV4cHJlc3Npb25zKGFzdCk7XG4gICAgICBjb25zdCBjaGlsZFZpc2l0b3IgPSB0aGlzLnZpZXdCdWlsZGVyRmFjdG9yeSh0aGlzLCBndWFyZHMpO1xuICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKGNoaWxkVmlzaXRvcik7XG4gICAgICBjaGlsZFZpc2l0b3IudmlzaXRBbGwoYXN0LnZhcmlhYmxlcywgYXN0LmNoaWxkcmVuKTtcbiAgICB9XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoYXN0OiBFbGVtZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmlzaXRFbGVtZW50T3JUZW1wbGF0ZShhc3QpO1xuXG4gICAgbGV0IGlucHV0RGVmczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBsZXQgdXBkYXRlUmVuZGVyZXJFeHByZXNzaW9uczogRXhwcmVzc2lvbltdID0gW107XG4gICAgbGV0IG91dHB1dERlZnM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgYXN0LmlucHV0cy5mb3JFYWNoKChpbnB1dEFzdCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVzLnB1c2goXG4gICAgICAgICAge2NvbnRleHQ6IHRoaXMuY29tcG9uZW50LCB2YWx1ZTogaW5wdXRBc3QudmFsdWUsIHNvdXJjZVNwYW46IGlucHV0QXN0LnNvdXJjZVNwYW59KTtcbiAgICB9KTtcblxuICAgIHRlbXBsYXRlVmlzaXRBbGwodGhpcywgYXN0LmNoaWxkcmVuKTtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRFbGVtZW50T3JUZW1wbGF0ZShhc3Q6IHtcbiAgICBvdXRwdXRzOiBCb3VuZEV2ZW50QXN0W10sXG4gICAgZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sXG4gICAgcmVmZXJlbmNlczogUmVmZXJlbmNlQXN0W10sXG4gIH0pIHtcbiAgICBhc3QuZGlyZWN0aXZlcy5mb3JFYWNoKChkaXJBc3QpID0+IHsgdGhpcy52aXNpdERpcmVjdGl2ZShkaXJBc3QpOyB9KTtcblxuICAgIGFzdC5yZWZlcmVuY2VzLmZvckVhY2goKHJlZikgPT4ge1xuICAgICAgbGV0IG91dHB1dFZhclR5cGU6IE91dHB1dFZhclR5cGUgPSBudWxsICE7XG4gICAgICAvLyBOb3RlOiBUaGUgb2xkIHZpZXcgY29tcGlsZXIgdXNlZCB0byB1c2UgYW4gYGFueWAgdHlwZVxuICAgICAgLy8gZm9yIGRpcmVjdGl2ZXMgZXhwb3NlZCB2aWEgYGV4cG9ydEFzYC5cbiAgICAgIC8vIFdlIGtlZXAgdGhpcyBiZWhhaXZvciBiZWhpbmQgYSBmbGFnIGZvciBub3cuXG4gICAgICBpZiAocmVmLnZhbHVlICYmIHJlZi52YWx1ZS5pZGVudGlmaWVyICYmIHRoaXMub3B0aW9ucy5mdWxsVGVtcGxhdGVUeXBlQ2hlY2spIHtcbiAgICAgICAgb3V0cHV0VmFyVHlwZSA9IHJlZi52YWx1ZS5pZGVudGlmaWVyLnJlZmVyZW5jZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dFZhclR5cGUgPSBvLkJ1aWx0aW5UeXBlTmFtZS5EeW5hbWljO1xuICAgICAgfVxuICAgICAgdGhpcy5yZWZPdXRwdXRWYXJzLnNldChyZWYubmFtZSwgb3V0cHV0VmFyVHlwZSk7XG4gICAgfSk7XG4gICAgYXN0Lm91dHB1dHMuZm9yRWFjaCgob3V0cHV0QXN0KSA9PiB7XG4gICAgICB0aGlzLmFjdGlvbnMucHVzaChcbiAgICAgICAgICB7Y29udGV4dDogdGhpcy5jb21wb25lbnQsIHZhbHVlOiBvdXRwdXRBc3QuaGFuZGxlciwgc291cmNlU3Bhbjogb3V0cHV0QXN0LnNvdXJjZVNwYW59KTtcbiAgICB9KTtcbiAgfVxuXG4gIHZpc2l0RGlyZWN0aXZlKGRpckFzdDogRGlyZWN0aXZlQXN0KSB7XG4gICAgY29uc3QgZGlyVHlwZSA9IGRpckFzdC5kaXJlY3RpdmUudHlwZS5yZWZlcmVuY2U7XG4gICAgZGlyQXN0LmlucHV0cy5mb3JFYWNoKFxuICAgICAgICAoaW5wdXQpID0+IHRoaXMudXBkYXRlcy5wdXNoKFxuICAgICAgICAgICAge2NvbnRleHQ6IHRoaXMuY29tcG9uZW50LCB2YWx1ZTogaW5wdXQudmFsdWUsIHNvdXJjZVNwYW46IGlucHV0LnNvdXJjZVNwYW59KSk7XG4gICAgLy8gTm90ZTogVGhlIG9sZCB2aWV3IGNvbXBpbGVyIHVzZWQgdG8gdXNlIGFuIGBhbnlgIHR5cGVcbiAgICAvLyBmb3IgZXhwcmVzc2lvbnMgaW4gaG9zdCBwcm9wZXJ0aWVzIC8gZXZlbnRzLlxuICAgIC8vIFdlIGtlZXAgdGhpcyBiZWhhaXZvciBiZWhpbmQgYSBmbGFnIGZvciBub3cuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5mdWxsVGVtcGxhdGVUeXBlQ2hlY2spIHtcbiAgICAgIGRpckFzdC5ob3N0UHJvcGVydGllcy5mb3JFYWNoKFxuICAgICAgICAgIChpbnB1dEFzdCkgPT4gdGhpcy51cGRhdGVzLnB1c2goXG4gICAgICAgICAgICAgIHtjb250ZXh0OiBkaXJUeXBlLCB2YWx1ZTogaW5wdXRBc3QudmFsdWUsIHNvdXJjZVNwYW46IGlucHV0QXN0LnNvdXJjZVNwYW59KSk7XG4gICAgICBkaXJBc3QuaG9zdEV2ZW50cy5mb3JFYWNoKChob3N0RXZlbnRBc3QpID0+IHRoaXMuYWN0aW9ucy5wdXNoKHtcbiAgICAgICAgY29udGV4dDogZGlyVHlwZSxcbiAgICAgICAgdmFsdWU6IGhvc3RFdmVudEFzdC5oYW5kbGVyLFxuICAgICAgICBzb3VyY2VTcGFuOiBob3N0RXZlbnRBc3Quc291cmNlU3BhblxuICAgICAgfSkpO1xuICAgIH1cbiAgfVxuXG4gIGdldExvY2FsKG5hbWU6IHN0cmluZyk6IG8uRXhwcmVzc2lvbnxudWxsIHtcbiAgICBpZiAobmFtZSA9PSBFdmVudEhhbmRsZXJWYXJzLmV2ZW50Lm5hbWUpIHtcbiAgICAgIHJldHVybiBvLnZhcmlhYmxlKHRoaXMuZ2V0T3V0cHV0VmFyKG8uQnVpbHRpblR5cGVOYW1lLkR5bmFtaWMpKTtcbiAgICB9XG4gICAgZm9yIChsZXQgY3VyckJ1aWxkZXI6IFZpZXdCdWlsZGVyfG51bGwgPSB0aGlzOyBjdXJyQnVpbGRlcjsgY3VyckJ1aWxkZXIgPSBjdXJyQnVpbGRlci5wYXJlbnQpIHtcbiAgICAgIGxldCBvdXRwdXRWYXJUeXBlOiBPdXRwdXRWYXJUeXBlfHVuZGVmaW5lZDtcbiAgICAgIC8vIGNoZWNrIHJlZmVyZW5jZXNcbiAgICAgIG91dHB1dFZhclR5cGUgPSBjdXJyQnVpbGRlci5yZWZPdXRwdXRWYXJzLmdldChuYW1lKTtcbiAgICAgIGlmIChvdXRwdXRWYXJUeXBlID09IG51bGwpIHtcbiAgICAgICAgLy8gY2hlY2sgdmFyaWFibGVzXG4gICAgICAgIGNvbnN0IHZhckFzdCA9IGN1cnJCdWlsZGVyLnZhcmlhYmxlcy5maW5kKCh2YXJBc3QpID0+IHZhckFzdC5uYW1lID09PSBuYW1lKTtcbiAgICAgICAgaWYgKHZhckFzdCkge1xuICAgICAgICAgIG91dHB1dFZhclR5cGUgPSBvLkJ1aWx0aW5UeXBlTmFtZS5EeW5hbWljO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAob3V0cHV0VmFyVHlwZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBvLnZhcmlhYmxlKHRoaXMuZ2V0T3V0cHV0VmFyKG91dHB1dFZhclR5cGUpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIHBpcGVPdXRwdXRWYXIobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBwaXBlID0gdGhpcy5waXBlcy5nZXQobmFtZSk7XG4gICAgaWYgKCFwaXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYElsbGVnYWwgU3RhdGU6IENvdWxkIG5vdCBmaW5kIHBpcGUgJHtuYW1lfSBpbiB0ZW1wbGF0ZSBvZiAke3RoaXMuY29tcG9uZW50fWApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRPdXRwdXRWYXIocGlwZSk7XG4gIH1cblxuICBwcml2YXRlIHByZXByb2Nlc3NVcGRhdGVFeHByZXNzaW9uKGV4cHJlc3Npb246IEV4cHJlc3Npb24pOiBFeHByZXNzaW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgc291cmNlU3BhbjogZXhwcmVzc2lvbi5zb3VyY2VTcGFuLFxuICAgICAgY29udGV4dDogZXhwcmVzc2lvbi5jb250ZXh0LFxuICAgICAgdmFsdWU6IGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmdCdWlsdGlucyhcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjcmVhdGVMaXRlcmFsQXJyYXlDb252ZXJ0ZXI6IChhcmdDb3VudDogbnVtYmVyKSA9PiAoYXJnczogby5FeHByZXNzaW9uW10pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgYXJyID0gby5saXRlcmFsQXJyKGFyZ3MpO1xuICAgICAgICAgICAgICAvLyBOb3RlOiBUaGUgb2xkIHZpZXcgY29tcGlsZXIgdXNlZCB0byB1c2UgYW4gYGFueWAgdHlwZVxuICAgICAgICAgICAgICAvLyBmb3IgYXJyYXlzLlxuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmZ1bGxUZW1wbGF0ZVR5cGVDaGVjayA/IGFyciA6IGFyci5jYXN0KG8uRFlOQU1JQ19UWVBFKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjcmVhdGVMaXRlcmFsTWFwQ29udmVydGVyOlxuICAgICAgICAgICAgICAgIChrZXlzOiB7a2V5OiBzdHJpbmcsIHF1b3RlZDogYm9vbGVhbn1bXSkgPT4gKHZhbHVlczogby5FeHByZXNzaW9uW10pID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBrZXlzLm1hcCgoaywgaSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogay5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVvdGVkOiBrLnF1b3RlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBvLmxpdGVyYWxNYXAoZW50cmllcyk7XG4gICAgICAgICAgICAgICAgICAvLyBOb3RlOiBUaGUgb2xkIHZpZXcgY29tcGlsZXIgdXNlZCB0byB1c2UgYW4gYGFueWAgdHlwZVxuICAgICAgICAgICAgICAgICAgLy8gZm9yIG1hcHMuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmZ1bGxUZW1wbGF0ZVR5cGVDaGVjayA/IG1hcCA6IG1hcC5jYXN0KG8uRFlOQU1JQ19UWVBFKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgY3JlYXRlUGlwZUNvbnZlcnRlcjogKG5hbWU6IHN0cmluZywgYXJnQ291bnQ6IG51bWJlcikgPT4gKGFyZ3M6IG8uRXhwcmVzc2lvbltdKSA9PiB7XG4gICAgICAgICAgICAgIC8vIE5vdGU6IFRoZSBvbGQgdmlldyBjb21waWxlciB1c2VkIHRvIHVzZSBhbiBgYW55YCB0eXBlXG4gICAgICAgICAgICAgIC8vIGZvciBwaXBlcy5cbiAgICAgICAgICAgICAgY29uc3QgcGlwZUV4cHIgPSB0aGlzLm9wdGlvbnMuZnVsbFRlbXBsYXRlVHlwZUNoZWNrID9cbiAgICAgICAgICAgICAgICAgIG8udmFyaWFibGUodGhpcy5waXBlT3V0cHV0VmFyKG5hbWUpKSA6XG4gICAgICAgICAgICAgICAgICBvLnZhcmlhYmxlKHRoaXMuZ2V0T3V0cHV0VmFyKG8uQnVpbHRpblR5cGVOYW1lLkR5bmFtaWMpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHBpcGVFeHByLmNhbGxNZXRob2QoJ3RyYW5zZm9ybScsIGFyZ3MpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGV4cHJlc3Npb24udmFsdWUpXG4gICAgfTtcbiAgfVxuXG4gIHZpc2l0TmdDb250ZW50KGFzdDogTmdDb250ZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRUZXh0KGFzdDogVGV4dEFzdCwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0RGlyZWN0aXZlUHJvcGVydHkoYXN0OiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRSZWZlcmVuY2UoYXN0OiBSZWZlcmVuY2VBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdFZhcmlhYmxlKGFzdDogVmFyaWFibGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdEV2ZW50KGFzdDogQm91bmRFdmVudEFzdCwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdEF0dHIoYXN0OiBBdHRyQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbn1cbiJdfQ==