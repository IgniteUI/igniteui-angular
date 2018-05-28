"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
// toArray is a temporary function to help in the use of
// ES6 maps and sets when running on node 4, which doesn't
// support Iterators completely.
var ts = require("typescript");
function toArray(iterator) {
    var array = [];
    while (true) {
        var ir = iterator.next();
        if (ir.done) {
            break;
        }
        array.push(ir.value);
    }
    return array;
}
exports.toArray = toArray;
/**
 * Constructs a new ts.CompilerHost that overlays sources in substituteSource
 * over another ts.CompilerHost.
 *
 * @param substituteSource A map of source file name -> overlay source text.
 */
function createSourceReplacingCompilerHost(substituteSource, delegate) {
    return {
        getSourceFile: getSourceFile,
        getCancellationToken: delegate.getCancellationToken,
        getDefaultLibFileName: delegate.getDefaultLibFileName,
        writeFile: delegate.writeFile,
        getCurrentDirectory: delegate.getCurrentDirectory,
        getCanonicalFileName: delegate.getCanonicalFileName,
        useCaseSensitiveFileNames: delegate.useCaseSensitiveFileNames,
        getNewLine: delegate.getNewLine,
        fileExists: delegate.fileExists,
        readFile: delegate.readFile,
        directoryExists: delegate.directoryExists,
        getDirectories: delegate.getDirectories,
    };
    function getSourceFile(fileName, languageVersion, onError) {
        var path = ts.sys.resolvePath(fileName);
        var sourceText = substituteSource.get(path);
        if (sourceText !== undefined) {
            return ts.createSourceFile(fileName, sourceText, languageVersion);
        }
        return delegate.getSourceFile(path, languageVersion, onError);
    }
}
exports.createSourceReplacingCompilerHost = createSourceReplacingCompilerHost;
/**
 * Returns the input string with line endings normalized to '\n'.
 */
function normalizeLineEndings(input) {
    return input.replace(/\r\n/g, '\n');
}
exports.normalizeLineEndings = normalizeLineEndings;

//# sourceMappingURL=util.js.map
