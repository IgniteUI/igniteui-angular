"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
var source_map_1 = require("source-map");
/**
 * Return a new RegExp object every time we want one because the
 * RegExp object has internal state that we don't want to persist
 * between different logical uses.
 */
function getInlineSourceMapRegex() {
    return new RegExp('^//# sourceMappingURL=data:application/json;base64,(.*)$', 'mg');
}
function containsInlineSourceMap(source) {
    return getInlineSourceMapCount(source) > 0;
}
exports.containsInlineSourceMap = containsInlineSourceMap;
function getInlineSourceMapCount(source) {
    var match = source.match(getInlineSourceMapRegex());
    return match ? match.length : 0;
}
exports.getInlineSourceMapCount = getInlineSourceMapCount;
function extractInlineSourceMap(source) {
    var inlineSourceMapRegex = getInlineSourceMapRegex();
    var previousResult = null;
    var result = null;
    // We want to extract the last source map in the source file
    // since that's probably the most recent one added.  We keep
    // matching against the source until we don't get a result,
    // then we use the previous result.
    do {
        previousResult = result;
        result = inlineSourceMapRegex.exec(source);
    } while (result !== null);
    var base64EncodedMap = previousResult[1];
    return Buffer.from(base64EncodedMap, 'base64').toString('utf8');
}
exports.extractInlineSourceMap = extractInlineSourceMap;
function removeInlineSourceMap(source) {
    return source.replace(getInlineSourceMapRegex(), '');
}
exports.removeInlineSourceMap = removeInlineSourceMap;
/**
 * Sets the source map inline in the file.  If there's an existing inline source
 * map, it clobbers it.
 */
function setInlineSourceMap(source, sourceMap) {
    var encodedSourceMap = Buffer.from(sourceMap, 'utf8').toString('base64');
    if (containsInlineSourceMap(source)) {
        return source.replace(getInlineSourceMapRegex(), "//# sourceMappingURL=data:application/json;base64," + encodedSourceMap);
    }
    else {
        return source + "\n//# sourceMappingURL=data:application/json;base64," + encodedSourceMap;
    }
}
exports.setInlineSourceMap = setInlineSourceMap;
function parseSourceMap(text, fileName, sourceName) {
    var rawSourceMap = JSON.parse(text);
    if (sourceName) {
        rawSourceMap.sources = [sourceName];
    }
    if (fileName) {
        rawSourceMap.file = fileName;
    }
    return rawSourceMap;
}
exports.parseSourceMap = parseSourceMap;
function sourceMapConsumerToGenerator(sourceMapConsumer) {
    return source_map_1.SourceMapGenerator.fromSourceMap(sourceMapConsumer);
}
exports.sourceMapConsumerToGenerator = sourceMapConsumerToGenerator;
/**
 * Tsc identifies source files by their relative path to the output file.  Since
 * there's no easy way to identify these relative paths when tsickle generates its
 * own source maps, we patch them with the file name from the tsc source maps
 * before composing them.
 */
function sourceMapGeneratorToConsumer(sourceMapGenerator, fileName, sourceName) {
    var rawSourceMap = sourceMapGenerator.toJSON();
    if (sourceName) {
        rawSourceMap.sources = [sourceName];
    }
    if (fileName) {
        rawSourceMap.file = fileName;
    }
    return new source_map_1.SourceMapConsumer(rawSourceMap);
}
exports.sourceMapGeneratorToConsumer = sourceMapGeneratorToConsumer;
function sourceMapTextToConsumer(sourceMapText) {
    // the SourceMapConsumer constructor returns a BasicSourceMapConsumer or an
    // IndexedSourceMapConsumer depending on if you pass in a RawSourceMap or a
    // RawIndexMap or the string json of either.  In this case we're passing in
    // the string for a RawSourceMap, so we always get a BasicSourceMapConsumer
    return new source_map_1.SourceMapConsumer(sourceMapText);
}
exports.sourceMapTextToConsumer = sourceMapTextToConsumer;
function sourceMapTextToGenerator(sourceMapText) {
    return source_map_1.SourceMapGenerator.fromSourceMap(sourceMapTextToConsumer(sourceMapText));
}
exports.sourceMapTextToGenerator = sourceMapTextToGenerator;
exports.NOOP_SOURCE_MAPPER = {
    // tslint:disable-next-line:no-empty
    addMapping: function () { }
};
var DefaultSourceMapper = (function () {
    function DefaultSourceMapper(fileName) {
        this.fileName = fileName;
        /** The source map that's generated while rewriting this file. */
        this.sourceMap = new source_map_1.SourceMapGenerator();
        this.sourceMap.addMapping({
            // tsc's source maps use 1-indexed lines, 0-indexed columns
            original: { line: 1, column: 0 },
            generated: { line: 1, column: 0 },
            source: this.fileName,
        });
    }
    DefaultSourceMapper.prototype.addMapping = function (node, original, generated, length) {
        if (length > 0) {
            this.sourceMap.addMapping({
                // tsc's source maps use 1-indexed lines, 0-indexed columns
                original: { line: original.line + 1, column: original.column },
                generated: { line: generated.line + 1, column: generated.column },
                source: this.fileName,
            });
        }
    };
    return DefaultSourceMapper;
}());
exports.DefaultSourceMapper = DefaultSourceMapper;

//# sourceMappingURL=source_map_utils.js.map
