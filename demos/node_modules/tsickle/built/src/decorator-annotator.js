"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var decorators_1 = require("./decorators");
var rewriter_1 = require("./rewriter");
var type_translator_1 = require("./type-translator");
var util_1 = require("./util");
// DecoratorClassVisitor rewrites a single "class Foo {...}" declaration.
// It's its own object because we collect decorators on the class and the ctor
// separately for each class we encounter.
var DecoratorClassVisitor = (function () {
    function DecoratorClassVisitor(typeChecker, rewriter, classDecl, importedNames) {
        this.typeChecker = typeChecker;
        this.rewriter = rewriter;
        this.classDecl = classDecl;
        this.importedNames = importedNames;
        if (classDecl.decorators) {
            var toLower = this.decoratorsToLower(classDecl);
            if (toLower.length > 0)
                this.decorators = toLower;
        }
    }
    /**
     * Determines whether the given decorator should be re-written as an annotation.
     */
    DecoratorClassVisitor.prototype.shouldLower = function (decorator) {
        try {
            for (var _a = __values(decorators_1.getDecoratorDeclarations(decorator, this.typeChecker)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var d = _b.value;
                // Switch to the TS JSDoc parser in the future to avoid false positives here.
                // For example using '@Annotation' in a true comment.
                // However, a new TS API would be needed, track at
                // https://github.com/Microsoft/TypeScript/issues/7393.
                var commentNode = d;
                // Not handling PropertyAccess expressions here, because they are
                // filtered earlier.
                if (commentNode.kind === ts.SyntaxKind.VariableDeclaration) {
                    if (!commentNode.parent)
                        continue;
                    commentNode = commentNode.parent;
                }
                // Go up one more level to VariableDeclarationStatement, where usually
                // the comment lives. If the declaration has an 'export', the
                // VDList.getFullText will not contain the comment.
                if (commentNode.kind === ts.SyntaxKind.VariableDeclarationList) {
                    if (!commentNode.parent)
                        continue;
                    commentNode = commentNode.parent;
                }
                var range = ts.getLeadingCommentRanges(commentNode.getFullText(), 0);
                if (!range)
                    continue;
                try {
                    for (var range_1 = __values(range), range_1_1 = range_1.next(); !range_1_1.done; range_1_1 = range_1.next()) {
                        var _c = range_1_1.value, pos = _c.pos, end = _c.end;
                        var jsDocText = commentNode.getFullText().substring(pos, end);
                        if (jsDocText.includes('@Annotation'))
                            return true;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (range_1_1 && !range_1_1.done && (_d = range_1.return)) _d.call(range_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return false;
        var e_2, _e, e_1, _d;
    };
    DecoratorClassVisitor.prototype.decoratorsToLower = function (n) {
        var _this = this;
        if (n.decorators) {
            return n.decorators.filter(function (d) { return _this.shouldLower(d); });
        }
        return [];
    };
    /**
     * gatherConstructor grabs the parameter list and decorators off the class
     * constructor, and emits nothing.
     */
    DecoratorClassVisitor.prototype.gatherConstructor = function (ctor) {
        var ctorParameters = [];
        var hasDecoratedParam = false;
        try {
            for (var _a = __values(ctor.parameters), _b = _a.next(); !_b.done; _b = _a.next()) {
                var param = _b.value;
                var ctorParam = { type: null, decorators: null };
                if (param.decorators) {
                    ctorParam.decorators = this.decoratorsToLower(param);
                    hasDecoratedParam = hasDecoratedParam || ctorParam.decorators.length > 0;
                }
                if (param.type) {
                    // param has a type provided, e.g. "foo: Bar".
                    // Verify that "Bar" is a value (e.g. a constructor) and not just a type.
                    var sym = this.typeChecker.getTypeAtLocation(param.type).getSymbol();
                    if (sym && (sym.flags & ts.SymbolFlags.Value)) {
                        ctorParam.type = param.type;
                    }
                }
                ctorParameters.push(ctorParam);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // Use the ctor parameter metadata only if the class or the ctor was decorated.
        if (this.decorators || hasDecoratedParam) {
            this.ctorParameters = ctorParameters;
        }
        var e_3, _c;
    };
    /**
     * gatherMethod grabs the decorators off a class method and emits nothing.
     */
    DecoratorClassVisitor.prototype.gatherMethodOrProperty = function (method) {
        if (!method.decorators)
            return;
        if (!method.name || method.name.kind !== ts.SyntaxKind.Identifier) {
            // Method has a weird name, e.g.
            //   [Symbol.foo]() {...}
            this.rewriter.error(method, 'cannot process decorators on strangely named method');
            return;
        }
        var name = method.name.text;
        var decorators = this.decoratorsToLower(method);
        if (decorators.length === 0)
            return;
        if (!this.propDecorators)
            this.propDecorators = new Map();
        this.propDecorators.set(name, decorators);
    };
    /**
     * For lowering decorators, we need to refer to constructor types.
     * So we start with the identifiers that represent these types.
     * However, TypeScript does not allow us to emit them in a value position
     * as it associated different symbol information with it.
     *
     * This method looks for the place where the value that is associated to
     * the type is defined and returns that identifier instead.
     *
     * This might be simplified when https://github.com/Microsoft/TypeScript/issues/17516 is solved.
     */
    DecoratorClassVisitor.prototype.getValueIdentifierForType = function (typeSymbol, typeNode) {
        var valueDeclaration = typeSymbol.valueDeclaration;
        if (!valueDeclaration)
            return null;
        var valueName = valueDeclaration.name;
        if (!valueName || valueName.kind !== ts.SyntaxKind.Identifier) {
            return null;
        }
        if (valueName.getSourceFile() === this.rewriter.file) {
            return valueName;
        }
        // Need to look at the first identifier only
        // to ignore generics.
        var firstIdentifierInType = firstIdentifierInSubtree(typeNode);
        if (firstIdentifierInType) {
            try {
                for (var _a = __values(this.importedNames), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var _c = _b.value, name_1 = _c.name, declarationNames = _c.declarationNames;
                    if (firstIdentifierInType.text === name_1.text &&
                        declarationNames.some(function (d) { return d === valueName; })) {
                        return name_1;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        return null;
        var e_4, _d;
    };
    DecoratorClassVisitor.prototype.beforeProcessNode = function (node) {
        switch (node.kind) {
            case ts.SyntaxKind.Constructor:
                this.gatherConstructor(node);
                break;
            case ts.SyntaxKind.PropertyDeclaration:
            case ts.SyntaxKind.SetAccessor:
            case ts.SyntaxKind.GetAccessor:
            case ts.SyntaxKind.MethodDeclaration:
                this.gatherMethodOrProperty(node);
                break;
            default:
        }
    };
    DecoratorClassVisitor.prototype.maybeProcessDecorator = function (node, start) {
        if (this.shouldLower(node)) {
            // Return true to signal that this node should not be emitted,
            // but still emit the whitespace *before* the node.
            if (!start) {
                start = node.getFullStart();
            }
            this.rewriter.writeRange(node, start, node.getStart());
            return true;
        }
        return false;
    };
    DecoratorClassVisitor.prototype.foundDecorators = function () {
        return !!(this.decorators || this.ctorParameters || this.propDecorators);
    };
    /**
     * emits the types for the various gathered metadata to be used
     * in the tsickle type annotations helper.
     */
    DecoratorClassVisitor.prototype.emitMetadataTypeAnnotationsHelpers = function () {
        if (!this.classDecl.name)
            return;
        var className = rewriter_1.getIdentifierText(this.classDecl.name);
        if (this.decorators) {
            this.rewriter.emit("/** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */\n");
            this.rewriter.emit(className + ".decorators;\n");
        }
        if (this.decorators || this.ctorParameters) {
            this.rewriter.emit("/**\n");
            this.rewriter.emit(" * @nocollapse\n");
            this.rewriter.emit(" * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}\n");
            this.rewriter.emit(" */\n");
            this.rewriter.emit(className + ".ctorParameters;\n");
        }
        if (this.propDecorators) {
            this.rewriter.emit("/** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */\n");
            this.rewriter.emit(className + ".propDecorators;\n");
        }
    };
    /**
     * emitMetadata emits the various gathered metadata, as static fields.
     */
    DecoratorClassVisitor.prototype.emitMetadataAsStaticProperties = function () {
        var decoratorInvocations = '{type: Function, args?: any[]}[]';
        if (this.decorators) {
            this.rewriter.emit("static decorators: " + decoratorInvocations + " = [\n");
            try {
                for (var _a = __values(this.decorators), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var annotation = _b.value;
                    this.emitDecorator(annotation);
                    this.rewriter.emit(',\n');
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_5) throw e_5.error; }
            }
            this.rewriter.emit('];\n');
        }
        if (this.decorators || this.ctorParameters) {
            this.rewriter.emit("/** @nocollapse */\n");
            // ctorParameters may contain forward references in the type: field, so wrap in a function
            // closure
            this.rewriter.emit("static ctorParameters: () => ({type: any, decorators?: " + decoratorInvocations +
                "}|null)[] = () => [\n");
            try {
                for (var _d = __values(this.ctorParameters || []), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var param = _e.value;
                    if (!param.type && !param.decorators) {
                        this.rewriter.emit('null,\n');
                        continue;
                    }
                    this.rewriter.emit("{type: ");
                    if (!param.type) {
                        this.rewriter.emit("undefined");
                    }
                    else {
                        // For transformer mode, tsickle must emit not only the string referring to the type,
                        // but also create a source mapping, so that TypeScript can later recognize that the
                        // symbol is used in a value position, so that TypeScript emits an import for the
                        // symbol.
                        // The code below and in getValueIdentifierForType finds the value node corresponding to
                        // the type and emits that symbol if possible. This causes a source mapping to the value,
                        // which then allows later transformers in the pipeline to do the correct module
                        // rewriting. Note that we cannot use param.type as the emit node directly (not even just
                        // for mapping), because that is marked as a type use of the node, not a value use, so it
                        // doesn't get updated as an export.
                        var sym = this.typeChecker.getTypeAtLocation(param.type).getSymbol();
                        var emitNode = this.getValueIdentifierForType(sym, param.type);
                        if (emitNode) {
                            this.rewriter.writeRange(emitNode, emitNode.getStart(), emitNode.getEnd());
                        }
                        else {
                            var typeStr = new type_translator_1.TypeTranslator(this.typeChecker, param.type)
                                .symbolToString(sym, /* useFqn */ true);
                            this.rewriter.emit(typeStr);
                        }
                    }
                    this.rewriter.emit(", ");
                    if (param.decorators) {
                        this.rewriter.emit('decorators: [');
                        try {
                            for (var _f = __values(param.decorators), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var decorator = _g.value;
                                this.emitDecorator(decorator);
                                this.rewriter.emit(', ');
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_h = _f.return)) _h.call(_f);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                        this.rewriter.emit(']');
                    }
                    this.rewriter.emit('},\n');
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_j = _d.return)) _j.call(_d);
                }
                finally { if (e_7) throw e_7.error; }
            }
            this.rewriter.emit("];\n");
        }
        if (this.propDecorators) {
            this.rewriter.emit("static propDecorators: {[key: string]: " + decoratorInvocations + "} = {\n");
            try {
                for (var _k = __values(util_1.toArray(this.propDecorators.keys())), _l = _k.next(); !_l.done; _l = _k.next()) {
                    var name_2 = _l.value;
                    this.rewriter.emit("\"" + name_2 + "\": [");
                    try {
                        for (var _m = __values(this.propDecorators.get(name_2)), _o = _m.next(); !_o.done; _o = _m.next()) {
                            var decorator = _o.value;
                            this.emitDecorator(decorator);
                            this.rewriter.emit(',');
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (_o && !_o.done && (_p = _m.return)) _p.call(_m);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                    this.rewriter.emit('],\n');
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_l && !_l.done && (_q = _k.return)) _q.call(_k);
                }
                finally { if (e_9) throw e_9.error; }
            }
            this.rewriter.emit('};\n');
        }
        var e_5, _c, e_7, _j, e_6, _h, e_9, _q, e_8, _p;
    };
    DecoratorClassVisitor.prototype.emitDecorator = function (decorator) {
        this.rewriter.emit('{ type: ');
        var expr = decorator.expression;
        switch (expr.kind) {
            case ts.SyntaxKind.Identifier:
                // The decorator was a plain @Foo.
                this.rewriter.visit(expr);
                break;
            case ts.SyntaxKind.CallExpression:
                // The decorator was a call, like @Foo(bar).
                var call = expr;
                this.rewriter.visit(call.expression);
                if (call.arguments.length) {
                    this.rewriter.emit(', args: [');
                    try {
                        for (var _a = __values(call.arguments), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var arg = _b.value;
                            this.rewriter.writeNodeFrom(arg, arg.getStart());
                            this.rewriter.emit(', ');
                        }
                    }
                    catch (e_10_1) { e_10 = { error: e_10_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_10) throw e_10.error; }
                    }
                    this.rewriter.emit(']');
                }
                break;
            default:
                this.rewriter.errorUnimplementedKind(expr, 'gathering metadata');
                this.rewriter.emit('undefined');
        }
        this.rewriter.emit(' }');
        var e_10, _c;
    };
    return DecoratorClassVisitor;
}());
exports.DecoratorClassVisitor = DecoratorClassVisitor;
var DecoratorRewriter = (function (_super) {
    __extends(DecoratorRewriter, _super);
    function DecoratorRewriter(typeChecker, sourceFile, sourceMapper) {
        var _this = _super.call(this, sourceFile, sourceMapper) || this;
        _this.typeChecker = typeChecker;
        _this.importedNames = [];
        return _this;
    }
    DecoratorRewriter.prototype.process = function () {
        this.visit(this.file);
        return this.getOutput();
    };
    DecoratorRewriter.prototype.maybeProcess = function (node) {
        if (this.currentDecoratorConverter) {
            this.currentDecoratorConverter.beforeProcessNode(node);
        }
        switch (node.kind) {
            case ts.SyntaxKind.ImportDeclaration:
                (_a = this.importedNames).push.apply(_a, __spread(collectImportedNames(this.typeChecker, node)));
                return false;
            case ts.SyntaxKind.Decorator:
                return this.currentDecoratorConverter &&
                    this.currentDecoratorConverter.maybeProcessDecorator(node);
            case ts.SyntaxKind.ClassDeclaration:
                var oldDecoratorConverter = this.currentDecoratorConverter;
                this.currentDecoratorConverter = new DecoratorClassVisitor(this.typeChecker, this, node, this.importedNames);
                this.writeLeadingTrivia(node);
                visitClassContentIncludingDecorators(node, this, this.currentDecoratorConverter);
                this.currentDecoratorConverter = oldDecoratorConverter;
                return true;
            default:
                return false;
        }
        var _a;
    };
    return DecoratorRewriter;
}(rewriter_1.Rewriter));
/**
 * Returns the first identifier in the node tree starting at node
 * in a depth first order.
 *
 * @param node The node to start with
 * @return The first identifier if one was found.
 */
function firstIdentifierInSubtree(node) {
    if (node.kind === ts.SyntaxKind.Identifier) {
        return node;
    }
    return ts.forEachChild(node, firstIdentifierInSubtree);
}
/**
 * Collect the Identifiers used as named bindings in the given import declaration
 * with their Symbol.
 * This is needed later on to find an identifier that represents the value
 * of an imported type identifier.
 */
function collectImportedNames(typeChecker, decl) {
    var importedNames = [];
    var importClause = decl.importClause;
    if (!importClause) {
        return importedNames;
    }
    var names = [];
    if (importClause.name) {
        names.push(importClause.name);
    }
    if (importClause.namedBindings &&
        importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
        var namedImports = importClause.namedBindings;
        names.push.apply(names, __spread(namedImports.elements.map(function (e) { return e.name; })));
    }
    try {
        for (var names_1 = __values(names), names_1_1 = names_1.next(); !names_1_1.done; names_1_1 = names_1.next()) {
            var name_3 = names_1_1.value;
            var symbol = typeChecker.getSymbolAtLocation(name_3);
            if (symbol.flags & ts.SymbolFlags.Alias) {
                symbol = typeChecker.getAliasedSymbol(symbol);
            }
            var declarationNames = [];
            if (symbol.declarations) {
                try {
                    for (var _a = __values(symbol.declarations), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var d = _b.value;
                        var decl_1 = d;
                        if (decl_1.name && decl_1.name.kind === ts.SyntaxKind.Identifier) {
                            declarationNames.push(decl_1.name);
                        }
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
            }
            if (symbol.declarations) {
                importedNames.push({ name: name_3, declarationNames: declarationNames });
            }
        }
    }
    catch (e_12_1) { e_12 = { error: e_12_1 }; }
    finally {
        try {
            if (names_1_1 && !names_1_1.done && (_d = names_1.return)) _d.call(names_1);
        }
        finally { if (e_12) throw e_12.error; }
    }
    return importedNames;
    var e_12, _d, e_11, _c;
}
exports.collectImportedNames = collectImportedNames;
function visitClassContentIncludingDecorators(classDecl, rewriter, decoratorVisitor) {
    if (rewriter.file.text[classDecl.getEnd() - 1] !== '}') {
        rewriter.error(classDecl, 'unexpected class terminator');
        return;
    }
    rewriter.writeNodeFrom(classDecl, classDecl.getStart(), classDecl.getEnd() - 1);
    // At this point, we've emitted up through the final child of the class, so all that
    // remains is the trailing whitespace and closing curly brace.
    // The final character owned by the class node should always be a '}',
    // or we somehow got the AST wrong and should report an error.
    // (Any whitespace or semicolon following the '}' will be part of the next Node.)
    if (decoratorVisitor) {
        decoratorVisitor.emitMetadataAsStaticProperties();
    }
    rewriter.writeRange(classDecl, classDecl.getEnd() - 1, classDecl.getEnd());
}
exports.visitClassContentIncludingDecorators = visitClassContentIncludingDecorators;
function convertDecorators(typeChecker, sourceFile, sourceMapper) {
    return new DecoratorRewriter(typeChecker, sourceFile, sourceMapper).process();
}
exports.convertDecorators = convertDecorators;

//# sourceMappingURL=decorator-annotator.js.map
