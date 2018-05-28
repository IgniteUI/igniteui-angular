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
var source_map_utils_1 = require("./source_map_utils");
/**
 * A Rewriter manages iterating through a ts.SourceFile, copying input
 * to output while letting the subclass potentially alter some nodes
 * along the way by implementing maybeProcess().
 */
var Rewriter = (function () {
    function Rewriter(file, sourceMapper) {
        if (sourceMapper === void 0) { sourceMapper = source_map_utils_1.NOOP_SOURCE_MAPPER; }
        this.file = file;
        this.sourceMapper = sourceMapper;
        this.output = [];
        /** Errors found while examining the code. */
        this.diagnostics = [];
        /** Current position in the output. */
        this.position = { line: 0, column: 0, position: 0 };
        /**
         * The current level of recursion through TypeScript Nodes.  Used in formatting internal debug
         * print statements.
         */
        this.indent = 0;
        /**
         * Skip emitting any code before the given offset. E.g. used to avoid emitting @fileoverview
         * comments twice.
         */
        this.skipCommentsUpToOffset = -1;
    }
    Rewriter.prototype.getOutput = function () {
        if (this.indent !== 0) {
            throw new Error('visit() failed to track nesting');
        }
        return {
            output: this.output.join(''),
            diagnostics: this.diagnostics,
        };
    };
    /**
     * visit traverses a Node, recursively writing all nodes not handled by this.maybeProcess.
     */
    Rewriter.prototype.visit = function (node) {
        // this.logWithIndent('node: ' + ts.SyntaxKind[node.kind]);
        this.indent++;
        try {
            if (!this.maybeProcess(node)) {
                this.writeNode(node);
            }
        }
        catch (e) {
            if (!e.message)
                e.message = 'Unhandled error in tsickle';
            e.message += "\n at " + ts.SyntaxKind[node.kind] + " in " + this.file.fileName + ":";
            var _a = this.file.getLineAndCharacterOfPosition(node.getStart()), line = _a.line, character = _a.character;
            e.message += line + 1 + ":" + (character + 1);
            throw e;
        }
        this.indent--;
    };
    /**
     * maybeProcess lets subclasses optionally processes a node.
     *
     * @return True if the node has been handled and doesn't need to be traversed;
     *    false to have the node written and its children recursively visited.
     */
    Rewriter.prototype.maybeProcess = function (node) {
        return false;
    };
    /** writeNode writes a ts.Node, calling this.visit() on its children. */
    Rewriter.prototype.writeNode = function (node, skipComments, newLineIfCommentsStripped) {
        if (skipComments === void 0) { skipComments = false; }
        if (newLineIfCommentsStripped === void 0) { newLineIfCommentsStripped = true; }
        var pos = node.getFullStart();
        if (skipComments) {
            // To skip comments, we skip all whitespace/comments preceding
            // the node.  But if there was anything skipped we should emit
            // a newline in its place so that the node remains separated
            // from the previous node.  TODO: don't skip anything here if
            // there wasn't any comment.
            if (newLineIfCommentsStripped && node.getFullStart() < node.getStart()) {
                this.emit('\n');
            }
            pos = node.getStart();
        }
        this.writeNodeFrom(node, pos);
    };
    Rewriter.prototype.writeNodeFrom = function (node, pos, end) {
        var _this = this;
        if (end === void 0) { end = node.getEnd(); }
        if (end <= this.skipCommentsUpToOffset) {
            return;
        }
        var oldSkipCommentsUpToOffset = this.skipCommentsUpToOffset;
        this.skipCommentsUpToOffset = Math.max(this.skipCommentsUpToOffset, pos);
        ts.forEachChild(node, function (child) {
            _this.writeRange(node, pos, child.getFullStart());
            _this.visit(child);
            pos = child.getEnd();
        });
        this.writeRange(node, pos, end);
        this.skipCommentsUpToOffset = oldSkipCommentsUpToOffset;
    };
    Rewriter.prototype.writeLeadingTrivia = function (node) {
        this.writeRange(node, node.getFullStart(), node.getStart());
    };
    Rewriter.prototype.addSourceMapping = function (node) {
        this.writeRange(node, node.getEnd(), node.getEnd());
    };
    /**
     * Write a span of the input file as expressed by absolute offsets.
     * These offsets are found in attributes like node.getFullStart() and
     * node.getEnd().
     */
    Rewriter.prototype.writeRange = function (node, from, to) {
        var fullStart = node.getFullStart();
        var textStart = node.getStart();
        if (from >= fullStart && from < textStart) {
            from = Math.max(from, this.skipCommentsUpToOffset);
        }
        // Add a source mapping. writeRange(from, to) always corresponds to
        // original source code, so add a mapping at the current location that
        // points back to the location at `from`. The additional code generated
        // by tsickle will then be considered part of the last mapped code
        // section preceding it. That's arguably incorrect (e.g. for the fake
        // methods defining properties), but is good enough for stack traces.
        var pos = this.file.getLineAndCharacterOfPosition(from);
        this.sourceMapper.addMapping(node, { line: pos.line, column: pos.character, position: from }, this.position, to - from);
        // getSourceFile().getText() is wrong here because it has the text of
        // the SourceFile node of the AST, which doesn't contain the comments
        // preceding that node.  Semantically these ranges are just offsets
        // into the original source file text, so slice from that.
        var text = this.file.text.slice(from, to);
        if (text) {
            this.emit(text);
        }
    };
    Rewriter.prototype.emit = function (str) {
        this.output.push(str);
        try {
            for (var str_1 = __values(str), str_1_1 = str_1.next(); !str_1_1.done; str_1_1 = str_1.next()) {
                var c = str_1_1.value;
                this.position.column++;
                if (c === '\n') {
                    this.position.line++;
                    this.position.column = 0;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (str_1_1 && !str_1_1.done && (_a = str_1.return)) _a.call(str_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.position.position += str.length;
        var e_1, _a;
    };
    /** Removes comment metacharacters from a string, to make it safe to embed in a comment. */
    Rewriter.prototype.escapeForComment = function (str) {
        return str.replace(/\/\*/g, '__').replace(/\*\//g, '__');
    };
    /* tslint:disable: no-unused-variable */
    Rewriter.prototype.logWithIndent = function (message) {
        /* tslint:enable: no-unused-variable */
        var prefix = new Array(this.indent + 1).join('| ');
        console.log(prefix + message);
    };
    /**
     * Produces a compiler error that references the Node's kind.  This is useful for the "else"
     * branch of code that is attempting to handle all possible input Node types, to ensure all cases
     * covered.
     */
    Rewriter.prototype.errorUnimplementedKind = function (node, where) {
        this.error(node, ts.SyntaxKind[node.kind] + " not implemented in " + where);
    };
    Rewriter.prototype.error = function (node, messageText) {
        this.diagnostics.push({
            file: this.file,
            start: node.getStart(),
            length: node.getEnd() - node.getStart(),
            messageText: messageText,
            category: ts.DiagnosticCategory.Error,
            code: 0,
        });
    };
    return Rewriter;
}());
exports.Rewriter = Rewriter;
/** Returns the string contents of a ts.Identifier. */
function getIdentifierText(identifier) {
    // NOTE: the 'text' property on an Identifier may be escaped if it starts
    // with '__', so just use getText().
    return identifier.getText();
}
exports.getIdentifierText = getIdentifierText;
/**
 * Converts an escaped TypeScript name into the original source name.
 * Prefer getIdentifierText() instead if possible.
 */
function unescapeName(name) {
    // See the private function unescapeIdentifier in TypeScript's utilities.ts.
    if (name.match(/^___/))
        return name.substr(1);
    return name;
}
exports.unescapeName = unescapeName;

//# sourceMappingURL=rewriter.js.map
