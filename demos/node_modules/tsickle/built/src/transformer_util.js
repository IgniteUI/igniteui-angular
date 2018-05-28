"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var tsickle = require("./tsickle");
/**
 * Adjusts the given CustomTransformers with additional transformers
 * to fix bugs in TypeScript.
 */
function createCustomTransformers(given) {
    if (!given.after && !given.before) {
        return given;
    }
    var before = given.before || [];
    before.unshift(addFileContexts);
    before.push(prepareNodesBeforeTypeScriptTransform);
    var after = given.after || [];
    after.unshift(emitMissingSyntheticCommentsAfterTypescriptTransform);
    return { before: before, after: after };
}
exports.createCustomTransformers = createCustomTransformers;
/**
 * Transform that adds the FileContext to the TransformationContext.
 */
function addFileContexts(context) {
    return function (sourceFile) {
        context.fileContext = new FileContext(sourceFile);
        return sourceFile;
    };
}
function assertFileContext(context, sourceFile) {
    if (!context.fileContext) {
        throw new Error("Illegal State: FileContext not initialized. " +
            "Did you forget to add the \"firstTransform\" as first transformer? " +
            ("File: " + sourceFile.fileName));
    }
    if (context.fileContext.file.fileName !== sourceFile.fileName) {
        throw new Error("Illegal State: File of the FileContext does not match. File: " + sourceFile.fileName);
    }
    return context.fileContext;
}
/**
 * A context that stores information per file to e.g. allow communication
 * between transformers.
 * There is one ts.TransformationContext per emit,
 * but files are handled sequentially by all transformers. Thefore we can
 * store file related information on a property on the ts.TransformationContext,
 * given that we reset it in the first transformer.
 */
var FileContext = (function () {
    function FileContext(file) {
        this.file = file;
        /**
         * Stores the parent node for all processed nodes.
         * This is needed for nodes from the parse tree that are used
         * in a synthetic node as must not modify these, even though they
         * have a new parent now.
         */
        this.syntheticNodeParents = new Map();
        this.importOrReexportDeclarations = [];
        this.lastCommentEnd = -1;
    }
    return FileContext;
}());
/**
 * Transform that needs to be executed right before TypeScript's transform.
 *
 * This prepares the node tree to workaround some bugs in the TypeScript emitter.
 */
function prepareNodesBeforeTypeScriptTransform(context) {
    return function (sourceFile) {
        var fileCtx = assertFileContext(context, sourceFile);
        var nodePath = [];
        visitNode(sourceFile);
        return sourceFile;
        function visitNode(node) {
            var startNode = node;
            var parent = nodePath[nodePath.length - 1];
            if (node.flags & ts.NodeFlags.Synthesized) {
                // Set `parent` for synthetic nodes as well,
                // as otherwise the TS emit will crash for decorators.
                // Note: don't update the `parent` of original nodes, as:
                // 1) we don't want to change them at all
                // 2) TS emit becomes errorneous in some cases if we add a synthetic parent.
                // see https://github.com/Microsoft/TypeScript/issues/17384
                node.parent = parent;
            }
            fileCtx.syntheticNodeParents.set(node, parent);
            var originalNode = ts.getOriginalNode(node);
            // Needed so that e.g. `module { ... }` prints the variable statement
            // before the closure.
            // See https://github.com/Microsoft/TypeScript/issues/17596
            // tslint:disable-next-line:no-any as `symbol` is @internal in typescript.
            node.symbol = originalNode.symbol;
            if (originalNode && node.kind === ts.SyntaxKind.ExportDeclaration) {
                var originalEd = originalNode;
                var ed = node;
                if (!!originalEd.exportClause !== !!ed.exportClause) {
                    // Tsickle changes `export * ...` into named exports.
                    // In this case, don't set the original node for the ExportDeclaration
                    // as otherwise TypeScript does not emit the exports.
                    // See https://github.com/Microsoft/TypeScript/issues/17597
                    ts.setOriginalNode(node, undefined);
                }
            }
            if (node.kind === ts.SyntaxKind.ImportDeclaration ||
                node.kind === ts.SyntaxKind.ExportDeclaration) {
                var ied = node;
                if (ied.moduleSpecifier) {
                    fileCtx.importOrReexportDeclarations.push(ied);
                }
            }
            // recurse
            nodePath.push(node);
            node.forEachChild(visitNode);
            nodePath.pop();
        }
    };
}
/**
 * Transform that needs to be executed after TypeScript's transform.
 *
 * This fixes places where the TypeScript transformer does not
 * emit synthetic comments.
 *
 * See https://github.com/Microsoft/TypeScript/issues/17594
 */
function emitMissingSyntheticCommentsAfterTypescriptTransform(context) {
    return function (sourceFile) {
        var fileContext = assertFileContext(context, sourceFile);
        var nodePath = [];
        visitNode(sourceFile);
        context.fileContext = undefined;
        return sourceFile;
        function visitNode(node) {
            if (node.kind === ts.SyntaxKind.Identifier) {
                var parent1 = fileContext.syntheticNodeParents.get(node);
                var parent2 = parent1 && fileContext.syntheticNodeParents.get(parent1);
                var parent3 = parent2 && fileContext.syntheticNodeParents.get(parent2);
                if (parent1 && parent1.kind === ts.SyntaxKind.PropertyDeclaration) {
                    // TypeScript ignores synthetic comments on (static) property declarations
                    // with initializers.
                    // find the parent ExpressionStatement like MyClass.foo = ...
                    var expressionStmt = lastNodeWith(nodePath, function (node) { return node.kind === ts.SyntaxKind.ExpressionStatement; });
                    if (expressionStmt) {
                        ts.setSyntheticLeadingComments(expressionStmt, ts.getSyntheticLeadingComments(parent1) || []);
                    }
                }
                else if (parent3 && parent3.kind === ts.SyntaxKind.VariableStatement &&
                    tsickle.hasModifierFlag(parent3, ts.ModifierFlags.Export)) {
                    // TypeScript ignores synthetic comments on exported variables.
                    // find the parent ExpressionStatement like exports.foo = ...
                    var expressionStmt = lastNodeWith(nodePath, function (node) { return node.kind === ts.SyntaxKind.ExpressionStatement; });
                    if (expressionStmt) {
                        ts.setSyntheticLeadingComments(expressionStmt, ts.getSyntheticLeadingComments(parent3) || []);
                    }
                }
            }
            // TypeScript ignores synthetic comments on reexport / import statements.
            var moduleName = extractModuleNameFromRequireVariableStatement(node);
            if (moduleName && fileContext.importOrReexportDeclarations) {
                // Locate the original import/export declaration via the
                // text range.
                var importOrReexportDeclaration = fileContext.importOrReexportDeclarations.find(function (ied) { return ied.pos === node.pos; });
                if (importOrReexportDeclaration) {
                    ts.setSyntheticLeadingComments(node, ts.getSyntheticLeadingComments(importOrReexportDeclaration) || []);
                }
                // Need to clear the textRange for ImportDeclaration / ExportDeclaration as
                // otherwise TypeScript would emit the original comments even if we set the
                // ts.EmitFlag.NoComments. (see also resetNodeTextRangeToPreventDuplicateComments below)
                ts.setSourceMapRange(node, { pos: node.pos, end: node.end });
                ts.setTextRange(node, { pos: -1, end: -1 });
            }
            nodePath.push(node);
            node.forEachChild(visitNode);
            nodePath.pop();
        }
    };
}
function extractModuleNameFromRequireVariableStatement(node) {
    if (node.kind !== ts.SyntaxKind.VariableStatement) {
        return null;
    }
    var varStmt = node;
    var decls = varStmt.declarationList.declarations;
    var init;
    if (decls.length !== 1 || !(init = decls[0].initializer) ||
        init.kind !== ts.SyntaxKind.CallExpression) {
        return null;
    }
    var callExpr = init;
    if (callExpr.expression.kind !== ts.SyntaxKind.Identifier ||
        callExpr.expression.text !== 'require' ||
        callExpr.arguments.length !== 1) {
        return null;
    }
    var moduleExpr = callExpr.arguments[0];
    if (moduleExpr.kind !== ts.SyntaxKind.StringLiteral) {
        return null;
    }
    return moduleExpr.text;
}
function lastNodeWith(nodes, predicate) {
    for (var i = nodes.length - 1; i >= 0; i--) {
        var node = nodes[i];
        if (predicate(node)) {
            return node;
        }
    }
    return null;
}
/**
 * Convert comment text ranges before and after a node
 * into ts.SynthesizedComments for the node and prevent the
 * comment text ranges to be emitted, to allow
 * changing these comments.
 *
 * This function takes a visitor to be able to do some
 * state management after the caller is done changing a node.
 */
function visitNodeWithSynthesizedComments(context, sourceFile, node, visitor) {
    if (node.flags & ts.NodeFlags.Synthesized) {
        return visitor(node);
    }
    if (node.kind === ts.SyntaxKind.Block) {
        var block_1 = node;
        node = visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, block_1.statements, function (node, stmts) { return visitor(ts.updateBlock(block_1, stmts)); });
    }
    else if (node.kind === ts.SyntaxKind.SourceFile) {
        node = visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, sourceFile.statements, function (node, stmts) { return visitor(updateSourceFileNode(sourceFile, stmts)); });
    }
    else {
        var fileContext = assertFileContext(context, sourceFile);
        var leadingLastCommentEnd = synthesizeLeadingComments(sourceFile, node, fileContext.lastCommentEnd);
        var trailingLastCommentEnd = synthesizeTrailingComments(sourceFile, node);
        if (leadingLastCommentEnd !== -1) {
            fileContext.lastCommentEnd = leadingLastCommentEnd;
        }
        node = visitor(node);
        if (trailingLastCommentEnd !== -1) {
            fileContext.lastCommentEnd = trailingLastCommentEnd;
        }
    }
    return resetNodeTextRangeToPreventDuplicateComments(node);
}
exports.visitNodeWithSynthesizedComments = visitNodeWithSynthesizedComments;
/**
 * Reset the text range for some special nodes as otherwise TypeScript
 * would always emit the original comments for them.
 * See https://github.com/Microsoft/TypeScript/issues/17594
 *
 * @param node
 */
function resetNodeTextRangeToPreventDuplicateComments(node) {
    ts.setEmitFlags(node, (ts.getEmitFlags(node) || 0) | ts.EmitFlags.NoComments);
    // See also addSyntheticCommentsAfterTsTransformer.
    // Note: Don't reset the textRange for ts.ExportDeclaration / ts.ImportDeclaration
    // until after the TypeScript transformer as we need the source location
    // to map the generated `require` calls back to the original
    // ts.ExportDeclaration / ts.ImportDeclaration nodes.
    var allowTextRange = node.kind !== ts.SyntaxKind.ClassDeclaration &&
        node.kind !== ts.SyntaxKind.VariableDeclaration &&
        !(node.kind === ts.SyntaxKind.VariableStatement &&
            tsickle.hasModifierFlag(node, ts.ModifierFlags.Export));
    if (node.kind === ts.SyntaxKind.PropertyDeclaration) {
        allowTextRange = false;
        var pd = node;
        // TODO(tbosch): Using pd.initializer! as the typescript typings before 2.4.0
        // are incorrect. Remove this once we upgrade to TypeScript 2.4.0.
        node = ts.updateProperty(pd, pd.decorators, pd.modifiers, resetTextRange(pd.name), pd.type, pd.initializer);
    }
    if (!allowTextRange) {
        node = resetTextRange(node);
    }
    return node;
    function resetTextRange(node) {
        if (!(node.flags & ts.NodeFlags.Synthesized)) {
            // need to clone as we don't want to modify source nodes,
            // as the parsed SourceFiles could be cached!
            node = ts.getMutableClone(node);
        }
        var textRange = { pos: node.pos, end: node.end };
        ts.setSourceMapRange(node, textRange);
        ts.setTextRange(node, { pos: -1, end: -1 });
        return node;
    }
}
/**
 * Reads in the leading comment text ranges of the given node,
 * converts them into `ts.SyntheticComment`s and stores them on the node.
 *
 * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
 *
 * @param lastCommentEnd The end of the last comment
 * @return The end of the last found comment, -1 if no comment was found.
 */
function synthesizeLeadingComments(sourceFile, node, lastCommentEnd) {
    var parent = node.parent;
    var sharesStartWithParent = parent && parent.kind !== ts.SyntaxKind.Block &&
        parent.kind !== ts.SyntaxKind.SourceFile && parent.getFullStart() === node.getFullStart();
    if (sharesStartWithParent || lastCommentEnd >= node.getStart()) {
        return -1;
    }
    var adjustedNodeFullStart = Math.max(lastCommentEnd, node.getFullStart());
    var leadingComments = getAllLeadingCommentRanges(sourceFile, adjustedNodeFullStart, node.getStart());
    if (leadingComments && leadingComments.length) {
        ts.setSyntheticLeadingComments(node, synthesizeCommentRanges(sourceFile, leadingComments));
        return node.getStart();
    }
    return -1;
}
/**
 * Reads in the trailing comment text ranges of the given node,
 * converts them into `ts.SyntheticComment`s and stores them on the node.
 *
 * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
 *
 * @return The end of the last found comment, -1 if no comment was found.
 */
function synthesizeTrailingComments(sourceFile, node) {
    var parent = node.parent;
    var sharesEndWithParent = parent && parent.kind !== ts.SyntaxKind.Block &&
        parent.kind !== ts.SyntaxKind.SourceFile && parent.getEnd() === node.getEnd();
    if (sharesEndWithParent) {
        return -1;
    }
    var trailingComments = ts.getTrailingCommentRanges(sourceFile.text, node.getEnd());
    if (trailingComments && trailingComments.length) {
        ts.setSyntheticTrailingComments(node, synthesizeCommentRanges(sourceFile, trailingComments));
        return trailingComments[trailingComments.length - 1].end;
    }
    return -1;
}
/**
 * Convert leading/trailing detached comment ranges of statement arrays
 * (e.g. the statements of a ts.SourceFile or ts.Block) into
 * `ts.NonEmittedStatement`s with `ts.SynthesizedComment`s and
 * prepends / appends them to the given statement array.
 * This is needed to allow changing these comments.
 *
 * This function takes a visitor to be able to do some
 * state management after the caller is done changing a node.
 */
function visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, statements, visitor) {
    var leading = synthesizeDetachedLeadingComments(sourceFile, node, statements);
    var trailing = synthesizeDetachedTrailingComments(sourceFile, node, statements);
    if (leading.commentStmt || trailing.commentStmt) {
        statements = ts.setTextRange(ts.createNodeArray(statements), { pos: -1, end: -1 });
        if (leading.commentStmt) {
            statements.unshift(leading.commentStmt);
        }
        if (trailing.commentStmt) {
            statements.push(trailing.commentStmt);
        }
        var fileContext = assertFileContext(context, sourceFile);
        if (leading.lastCommentEnd !== -1) {
            fileContext.lastCommentEnd = leading.lastCommentEnd;
        }
        node = visitor(node, statements);
        if (trailing.lastCommentEnd !== -1) {
            fileContext.lastCommentEnd = trailing.lastCommentEnd;
        }
        return node;
    }
    return visitor(node, statements);
}
/**
 * Convert leading detached comment ranges of statement arrays
 * (e.g. the statements of a ts.SourceFile or ts.Block) into a
 * `ts.NonEmittedStatement` with `ts.SynthesizedComment`s.
 *
 * A Detached leading comment is the first comment in a SourceFile / Block
 * that is separated with a newline from the first statement.
 *
 * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
 */
function synthesizeDetachedLeadingComments(sourceFile, node, statements) {
    var triviaEnd = statements.end;
    if (statements.length) {
        triviaEnd = statements[0].getStart();
    }
    var detachedComments = getDetachedLeadingCommentRanges(sourceFile, statements.pos, triviaEnd);
    if (!detachedComments.length) {
        return { commentStmt: null, lastCommentEnd: -1 };
    }
    var lastCommentEnd = detachedComments[detachedComments.length - 1].end;
    var commentStmt = createNotEmittedStatement(sourceFile);
    ts.setEmitFlags(commentStmt, ts.EmitFlags.CustomPrologue);
    ts.setSyntheticTrailingComments(commentStmt, synthesizeCommentRanges(sourceFile, detachedComments));
    return { commentStmt: commentStmt, lastCommentEnd: lastCommentEnd };
}
/**
 * Convert trailing detached comment ranges of statement arrays
 * (e.g. the statements of a ts.SourceFile or ts.Block) into a
 * `ts.NonEmittedStatement` with `ts.SynthesizedComment`s.
 *
 * A Detached trailing comment are all comments after the first newline
 * the follows the last statement in a SourceFile / Block.
 *
 * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
 */
function synthesizeDetachedTrailingComments(sourceFile, node, statements) {
    var trailingCommentStart = statements.end;
    if (statements.length) {
        var lastStmt = statements[statements.length - 1];
        var lastStmtTrailingComments = ts.getTrailingCommentRanges(sourceFile.text, lastStmt.end);
        if (lastStmtTrailingComments && lastStmtTrailingComments.length) {
            trailingCommentStart = lastStmtTrailingComments[lastStmtTrailingComments.length - 1].end;
        }
    }
    var detachedComments = getAllLeadingCommentRanges(sourceFile, trailingCommentStart, node.end);
    if (!detachedComments || !detachedComments.length) {
        return { commentStmt: null, lastCommentEnd: -1 };
    }
    var lastCommentEnd = detachedComments[detachedComments.length - 1].end;
    var commentStmt = createNotEmittedStatement(sourceFile);
    ts.setEmitFlags(commentStmt, ts.EmitFlags.CustomPrologue);
    ts.setSyntheticLeadingComments(commentStmt, synthesizeCommentRanges(sourceFile, detachedComments));
    return { commentStmt: commentStmt, lastCommentEnd: lastCommentEnd };
}
/**
 * Calculates the the detached leading comment ranges in an area of a SourceFile.
 * @param sourceFile The source file
 * @param start Where to start scanning
 * @param end Where to end scanning
 */
// Note: This code is based on compiler/comments.ts in TypeScript
function getDetachedLeadingCommentRanges(sourceFile, start, end) {
    var leadingComments = getAllLeadingCommentRanges(sourceFile, start, end);
    if (!leadingComments || !leadingComments.length) {
        return [];
    }
    var detachedComments = [];
    var lastComment = undefined;
    try {
        for (var leadingComments_1 = __values(leadingComments), leadingComments_1_1 = leadingComments_1.next(); !leadingComments_1_1.done; leadingComments_1_1 = leadingComments_1.next()) {
            var comment = leadingComments_1_1.value;
            if (lastComment) {
                var lastCommentLine = getLineOfPos(sourceFile, lastComment.end);
                var commentLine = getLineOfPos(sourceFile, comment.pos);
                if (commentLine >= lastCommentLine + 2) {
                    // There was a blank line between the last comment and this comment.  This
                    // comment is not part of the copyright comments.  Return what we have so
                    // far.
                    break;
                }
            }
            detachedComments.push(comment);
            lastComment = comment;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (leadingComments_1_1 && !leadingComments_1_1.done && (_a = leadingComments_1.return)) _a.call(leadingComments_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (detachedComments.length) {
        // All comments look like they could have been part of the copyright header.  Make
        // sure there is at least one blank line between it and the node.  If not, it's not
        // a copyright header.
        var lastCommentLine = getLineOfPos(sourceFile, detachedComments[detachedComments.length - 1].end);
        var nodeLine = getLineOfPos(sourceFile, end);
        if (nodeLine >= lastCommentLine + 2) {
            // Valid detachedComments
            return detachedComments;
        }
    }
    return [];
    var e_1, _a;
}
function getLineOfPos(sourceFile, pos) {
    return ts.getLineAndCharacterOfPosition(sourceFile, pos).line;
}
/**
 * Converts `ts.CommentRange`s into `ts.SynthesizedComment`s
 * @param sourceFile
 * @param parsedComments
 */
function synthesizeCommentRanges(sourceFile, parsedComments) {
    var synthesizedComments = [];
    parsedComments.forEach(function (_a, commentIdx) {
        var kind = _a.kind, pos = _a.pos, end = _a.end, hasTrailingNewLine = _a.hasTrailingNewLine;
        var commentText = sourceFile.text.substring(pos, end).trim();
        if (kind === ts.SyntaxKind.MultiLineCommentTrivia) {
            commentText = commentText.replace(/(^\/\*)|(\*\/$)/g, '');
        }
        else if (kind === ts.SyntaxKind.SingleLineCommentTrivia) {
            if (commentText.startsWith('///')) {
                // tripple-slash comments are typescript specific, ignore them in the output.
                return;
            }
            commentText = commentText.replace(/(^\/\/)/g, '');
        }
        synthesizedComments.push({ kind: kind, text: commentText, hasTrailingNewLine: hasTrailingNewLine, pos: -1, end: -1 });
    });
    return synthesizedComments;
}
/**
 * Creates a non emitted statement that can be used to store synthesized comments.
 */
function createNotEmittedStatement(sourceFile) {
    var stmt = ts.createNotEmittedStatement(sourceFile);
    ts.setOriginalNode(stmt, undefined);
    ts.setTextRange(stmt, { pos: 0, end: 0 });
    return stmt;
}
/**
 * Returns the leading comment ranges in the source file that start at the given position.
 * This is the same as `ts.getLeadingCommentRanges`, except that it does not skip
 * comments before the first newline in the range.
 *
 * @param sourceFile
 * @param start Where to start scanning
 * @param end Where to end scanning
 */
function getAllLeadingCommentRanges(sourceFile, start, end) {
    // exeute ts.getLeadingCommentRanges with pos = 0 so that it does not skip
    // comments until the first newline.
    var commentRanges = ts.getLeadingCommentRanges(sourceFile.text.substring(start, end), 0) || [];
    return commentRanges.map(function (cr) { return ({
        hasTrailingNewLine: cr.hasTrailingNewLine,
        kind: cr.kind,
        pos: cr.pos + start,
        end: cr.end + start
    }); });
}
/**
 * This is a version of `ts.updateSourceFileNode` that works
 * well with property decorators.
 * See https://github.com/Microsoft/TypeScript/issues/17384
 *
 * @param sf
 * @param statements
 */
function updateSourceFileNode(sf, statements) {
    if (statements === sf.statements) {
        return sf;
    }
    // Note: Need to clone the original file (and not use `ts.updateSourceFileNode`)
    // as otherwise TS fails when resolving types for decorators.
    sf = ts.getMutableClone(sf);
    sf.statements = statements;
    return sf;
}
exports.updateSourceFileNode = updateSourceFileNode;
/**
 * This is a version of `ts.visitEachChild` that does not visit children of types,
 * as this leads to errors in TypeScript < 2.4.0 and as types are not emitted anyways.
 */
function visitEachChildIgnoringTypes(node, visitor, context) {
    if (isTypeNodeKind(node.kind) || node.kind === ts.SyntaxKind.IndexSignature) {
        return node;
    }
    return ts.visitEachChild(node, visitor, context);
}
exports.visitEachChildIgnoringTypes = visitEachChildIgnoringTypes;
// Copied from TypeScript
function isTypeNodeKind(kind) {
    return (kind >= ts.SyntaxKind.FirstTypeNode && kind <= ts.SyntaxKind.LastTypeNode) ||
        kind === ts.SyntaxKind.AnyKeyword || kind === ts.SyntaxKind.NumberKeyword ||
        kind === ts.SyntaxKind.ObjectKeyword || kind === ts.SyntaxKind.BooleanKeyword ||
        kind === ts.SyntaxKind.StringKeyword || kind === ts.SyntaxKind.SymbolKeyword ||
        kind === ts.SyntaxKind.ThisKeyword || kind === ts.SyntaxKind.VoidKeyword ||
        kind === ts.SyntaxKind.UndefinedKeyword || kind === ts.SyntaxKind.NullKeyword ||
        kind === ts.SyntaxKind.NeverKeyword || kind === ts.SyntaxKind.ExpressionWithTypeArguments;
}
exports.isTypeNodeKind = isTypeNodeKind;

//# sourceMappingURL=transformer_util.js.map
