"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var transformer_util_1 = require("./transformer_util");
/**
 * @fileoverview Creates a TypeScript transformer that parses code into a new `ts.SourceFile`,
 * marks the nodes as synthetic and where possible maps the new nodes back to the original nodes
 * via sourcemap information.
 */
function createTransformerFromSourceMap(operator) {
    return function (context) { return function (sourceFile) {
        var sourceMapper = new NodeSourceMapper();
        var newFile = ts.createSourceFile(sourceFile.fileName, operator(sourceFile, sourceMapper), ts.ScriptTarget.Latest, true);
        var mappedFile = visitNode(newFile);
        return transformer_util_1.updateSourceFileNode(sourceFile, mappedFile.statements);
        function visitNode(node) {
            return transformer_util_1.visitNodeWithSynthesizedComments(context, newFile, node, visitNodeImpl);
        }
        function visitNodeImpl(node) {
            if (node.flags & ts.NodeFlags.Synthesized) {
                return node;
            }
            var originalNode = sourceMapper.getOriginalNode(node);
            // Use the originalNode for:
            // - literals: as e.g. typescript does not support synthetic regex literals
            // - identifiers: as they don't have children and behave well
            //    regarding comment synthesization
            // - types: as they are not emited anyways
            //          and it leads to errors with `extends` cases.
            if (originalNode &&
                (isLiteralKind(node.kind) || node.kind === ts.SyntaxKind.Identifier ||
                    transformer_util_1.isTypeNodeKind(node.kind) || node.kind === ts.SyntaxKind.IndexSignature)) {
                return originalNode;
            }
            node = transformer_util_1.visitEachChildIgnoringTypes(node, visitNode, context);
            node.flags |= ts.NodeFlags.Synthesized;
            node.parent = undefined;
            ts.setTextRange(node, originalNode ? originalNode : { pos: -1, end: -1 });
            ts.setOriginalNode(node, originalNode);
            // Loop over all nested ts.NodeArrays /
            // ts.Nodes that were not visited and set their
            // text range to -1 to not emit their whitespace.
            // Sadly, TypeScript does not have an API for this...
            // tslint:disable-next-line:no-any To read all properties
            var nodeAny = node;
            // tslint:disable-next-line:no-any To read all properties
            var originalNodeAny = originalNode;
            for (var prop in nodeAny) {
                if (nodeAny.hasOwnProperty(prop)) {
                    // tslint:disable-next-line:no-any
                    var value = nodeAny[prop];
                    if (isNodeArray(value)) {
                        // reset the pos/end of all NodeArrays so that we don't emit comments
                        // from them.
                        ts.setTextRange(value, { pos: -1, end: -1 });
                    }
                    else if (isToken(value) && !(value.flags & ts.NodeFlags.Synthesized) &&
                        value.getSourceFile() !== sourceFile) {
                        // Use the original TextRange for all non visited tokens (e.g. the
                        // `BinaryExpression.operatorToken`) to preserve the formatting
                        var textRange = originalNode ? originalNodeAny[prop] : { pos: -1, end: -1 };
                        ts.setTextRange(value, textRange);
                    }
                }
            }
            return node;
        }
    }; };
}
exports.createTransformerFromSourceMap = createTransformerFromSourceMap;
/**
 * Implementation of the `SourceMapper` that stores and retrieves mappings
 * to original nodes.
 */
var NodeSourceMapper = (function () {
    function NodeSourceMapper() {
        this.originalNodeByGeneratedRange = new Map();
        this.genStartPositions = new Map();
    }
    NodeSourceMapper.prototype.addFullNodeRange = function (node, genStartPos) {
        var _this = this;
        this.originalNodeByGeneratedRange.set(this.nodeCacheKey(node.kind, genStartPos, genStartPos + (node.getEnd() - node.getStart())), node);
        node.forEachChild(function (child) { return _this.addFullNodeRange(child, genStartPos + (child.getStart() - node.getStart())); });
    };
    NodeSourceMapper.prototype.addMapping = function (originalNode, original, generated, length) {
        var _this = this;
        var originalStartPos = original.position;
        var genStartPos = generated.position;
        if (originalStartPos >= originalNode.getFullStart() &&
            originalStartPos <= originalNode.getStart()) {
            // always use the node.getStart() for the index,
            // as comments and whitespaces might differ between the original and transformed code.
            var diffToStart = originalNode.getStart() - originalStartPos;
            originalStartPos += diffToStart;
            genStartPos += diffToStart;
            length -= diffToStart;
            this.genStartPositions.set(originalNode, genStartPos);
        }
        if (originalStartPos + length === originalNode.getEnd()) {
            this.originalNodeByGeneratedRange.set(this.nodeCacheKey(originalNode.kind, this.genStartPositions.get(originalNode), genStartPos + length), originalNode);
        }
        originalNode.forEachChild(function (child) {
            if (child.getStart() >= originalStartPos && child.getEnd() <= originalStartPos + length) {
                _this.addFullNodeRange(child, genStartPos + (child.getStart() - originalStartPos));
            }
        });
    };
    NodeSourceMapper.prototype.getOriginalNode = function (node) {
        return this.originalNodeByGeneratedRange.get(this.nodeCacheKey(node.kind, node.getStart(), node.getEnd()));
    };
    NodeSourceMapper.prototype.nodeCacheKey = function (kind, start, end) {
        return kind + "#" + start + "#" + end;
    };
    return NodeSourceMapper;
}());
// tslint:disable-next-line:no-any
function isNodeArray(value) {
    var anyValue = value;
    return Array.isArray(value) && anyValue.pos !== undefined && anyValue.end !== undefined;
}
// tslint:disable-next-line:no-any
function isToken(value) {
    return value != null && typeof value === 'object' && value.kind >= ts.SyntaxKind.FirstToken &&
        value.kind <= ts.SyntaxKind.LastToken;
}
// Copied from TypeScript
function isLiteralKind(kind) {
    return ts.SyntaxKind.FirstLiteralToken <= kind && kind <= ts.SyntaxKind.LastLiteralToken;
}

//# sourceMappingURL=transformer_sourcemap.js.map
