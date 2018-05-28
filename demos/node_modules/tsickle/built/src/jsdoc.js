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
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
/**
 * A list of all JSDoc tags allowed by the Closure compiler.
 * The public Closure docs don't list all the tags it allows; this list comes
 * from the compiler source itself.
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/Annotation.java
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/ParserConfig.properties
 */
var JSDOC_TAGS_WHITELIST = new Set([
    'abstract', 'argument',
    'author', 'consistentIdGenerator',
    'const', 'constant',
    'constructor', 'copyright',
    'define', 'deprecated',
    'desc', 'dict',
    'disposes', 'enhance',
    'enhanceable', 'enum',
    'export', 'expose',
    'extends', 'externs',
    'fileoverview', 'final',
    'hassoydelcall', 'hassoydeltemplate',
    'hidden', 'id',
    'idGenerator', 'ignore',
    'implements', 'implicitCast',
    'inheritDoc', 'interface',
    'jaggerInject', 'jaggerModule',
    'jaggerProvide', 'jaggerProvidePromise',
    'lends', 'license',
    'link', 'meaning',
    'modifies', 'modName',
    'mods', 'ngInject',
    'noalias', 'nocollapse',
    'nocompile', 'nosideeffects',
    'override', 'owner',
    'package', 'param',
    'pintomodule', 'polymerBehavior',
    'preserve', 'preserveTry',
    'private', 'protected',
    'public', 'record',
    'requirecss', 'requires',
    'return', 'returns',
    'see', 'stableIdGenerator',
    'struct', 'suppress',
    'template', 'this',
    'throws', 'type',
    'typedef', 'unrestricted',
    'version', 'wizaction',
    'wizmodule',
]);
/**
 * A list of JSDoc @tags that are never allowed in TypeScript source. These are Closure tags that
 * can be expressed in the TypeScript surface syntax. As tsickle's emit will mangle type names,
 * these will cause Closure Compiler issues and should not be used.
 */
var JSDOC_TAGS_BLACKLIST = new Set([
    'augments', 'class', 'constructs', 'constructor', 'enum', 'extends', 'field',
    'function', 'implements', 'interface', 'lends', 'namespace', 'private', 'public',
    'record', 'static', 'template', 'this', 'type', 'typedef',
]);
/**
 * A list of JSDoc @tags that might include a {type} after them. Only banned when a type is passed.
 * Note that this does not include tags that carry a non-type system type, e.g. \@suppress.
 */
var JSDOC_TAGS_WITH_TYPES = new Set([
    'const',
    'export',
    'param',
    'return',
]);
/**
 * parse parses JSDoc out of a comment string.
 * Returns null if comment is not JSDoc.
 */
// TODO(martinprobst): representing JSDoc as a list of tags is too simplistic. We need functionality
// such as merging (below), de-duplicating certain tags (@deprecated), and special treatment for
// others (e.g. @suppress). We should introduce a proper model class with a more suitable data
// strucure (e.g. a Map<TagName, Values[]>).
function parse(comment) {
    // Make sure we have proper line endings before parsing on Windows.
    comment = util_1.normalizeLineEndings(comment);
    // TODO(evanm): this is a pile of hacky regexes for now, because we
    // would rather use the better TypeScript implementation of JSDoc
    // parsing.  https://github.com/Microsoft/TypeScript/issues/7393
    var match = comment.match(/^\/\*\*([\s\S]*?)\*\/$/);
    if (!match)
        return null;
    comment = match[1].trim();
    // Strip all the " * " bits from the front of each line.
    comment = comment.replace(/^\s*\*? ?/gm, '');
    var lines = comment.split('\n');
    var tags = [];
    var warnings = [];
    try {
        for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
            var line = lines_1_1.value;
            match = line.match(/^@(\S+) *(.*)/);
            if (match) {
                var _a = __read(match, 3), _ = _a[0], tagName = _a[1], text = _a[2];
                if (tagName === 'returns') {
                    // A synonym for 'return'.
                    tagName = 'return';
                }
                var type = void 0;
                if (JSDOC_TAGS_BLACKLIST.has(tagName)) {
                    warnings.push("@" + tagName + " annotations are redundant with TypeScript equivalents");
                    continue; // Drop the tag so Closure won't process it.
                }
                else if (JSDOC_TAGS_WITH_TYPES.has(tagName) && text[0] === '{') {
                    warnings.push("the type annotation on @" + tagName + " is redundant with its TypeScript type, " +
                        "remove the {...} part");
                    continue;
                }
                else if (tagName === 'suppress') {
                    var suppressMatch = text.match(/^\{(.*)\}(.*)$/);
                    if (!suppressMatch) {
                        warnings.push("malformed @suppress tag: \"" + text + "\"");
                    }
                    else {
                        _b = __read(suppressMatch, 3), type = _b[1], text = _b[2];
                    }
                }
                else if (tagName === 'dict') {
                    warnings.push('use index signatures (`[k: string]: type`) instead of @dict');
                    continue;
                }
                // Grab the parameter name from @param tags.
                var parameterName = void 0;
                if (tagName === 'param') {
                    match = text.match(/^(\S+) ?(.*)/);
                    if (match)
                        _c = __read(match, 3), _ = _c[0], parameterName = _c[1], text = _c[2];
                }
                var tag = { tagName: tagName };
                if (parameterName)
                    tag.parameterName = parameterName;
                if (text)
                    tag.text = text;
                if (type)
                    tag.type = type;
                tags.push(tag);
            }
            else {
                // Text without a preceding @tag on it is either the plain text
                // documentation or a continuation of a previous tag.
                if (tags.length === 0) {
                    tags.push({ tagName: '', text: line });
                }
                else {
                    var lastTag = tags[tags.length - 1];
                    lastTag.text = (lastTag.text || '') + '\n' + line;
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (lines_1_1 && !lines_1_1.done && (_d = lines_1.return)) _d.call(lines_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (warnings.length > 0) {
        return { tags: tags, warnings: warnings };
    }
    return { tags: tags };
    var e_1, _d, _b, _c;
}
exports.parse = parse;
/**
 * Serializes a Tag into a string usable in a comment.
 * Returns a string like " @foo {bar} baz" (note the whitespace).
 */
function tagToString(tag, escapeExtraTags) {
    if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
    var out = '';
    if (tag.tagName) {
        if (!JSDOC_TAGS_WHITELIST.has(tag.tagName) || escapeExtraTags.has(tag.tagName)) {
            // Escape tags we don't understand.  This is a subtle
            // compromise between multiple issues.
            // 1) If we pass through these non-Closure tags, the user will
            //    get a warning from Closure, and the point of tsickle is
            //    to insulate the user from Closure.
            // 2) The output of tsickle is for Closure but also may be read
            //    by humans, for example non-TypeScript users of Angular.
            // 3) Finally, we don't want to warn because users should be
            //    free to add whichever JSDoc they feel like.  If the user
            //    wants help ensuring they didn't typo a tag, that is the
            //    responsibility of a linter.
            out += " \\@" + tag.tagName;
        }
        else {
            out += " @" + tag.tagName;
        }
    }
    if (tag.type) {
        out += ' {';
        if (tag.restParam) {
            out += '...';
        }
        out += tag.type;
        if (tag.optional) {
            out += '=';
        }
        out += '}';
    }
    if (tag.parameterName) {
        out += ' ' + tag.parameterName;
    }
    if (tag.text) {
        out += ' ' + tag.text.replace(/@/g, '\\@');
    }
    return out;
}
/** Tags that must only occur onces in a comment (filtered below). */
var SINGLETON_TAGS = new Set(['deprecated']);
/** Serializes a Comment out to a string usable in source code. */
function toString(tags, escapeExtraTags) {
    if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
    if (tags.length === 0)
        return '';
    if (tags.length === 1) {
        var tag = tags[0];
        if ((tag.tagName === 'type' || tag.tagName === 'nocollapse') &&
            (!tag.text || !tag.text.match('\n'))) {
            // Special-case one-liner "type" and "nocollapse" tags to fit on one line, e.g.
            //   /** @type {foo} */
            return '/**' + tagToString(tag, escapeExtraTags) + ' */\n';
        }
        // Otherwise, fall through to the multi-line output.
    }
    var out = '';
    out += '/**\n';
    var emitted = new Set();
    try {
        for (var tags_1 = __values(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
            var tag = tags_1_1.value;
            if (emitted.has(tag.tagName) && SINGLETON_TAGS.has(tag.tagName)) {
                continue;
            }
            emitted.add(tag.tagName);
            out += ' *';
            // If the tagToString is multi-line, insert " * " prefixes on subsequent lines.
            out += tagToString(tag, escapeExtraTags).split('\n').join('\n * ');
            out += '\n';
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (tags_1_1 && !tags_1_1.done && (_a = tags_1.return)) _a.call(tags_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    out += ' */\n';
    return out;
    var e_2, _a;
}
exports.toString = toString;
/** Merges multiple tags (of the same tagName type) into a single unified tag. */
function merge(tags) {
    var tagNames = new Set();
    var parameterNames = new Set();
    var types = new Set();
    var texts = new Set();
    // If any of the tags are optional/rest, then the merged output is optional/rest.
    var optional = false;
    var restParam = false;
    try {
        for (var tags_2 = __values(tags), tags_2_1 = tags_2.next(); !tags_2_1.done; tags_2_1 = tags_2.next()) {
            var tag_1 = tags_2_1.value;
            if (tag_1.tagName)
                tagNames.add(tag_1.tagName);
            if (tag_1.parameterName)
                parameterNames.add(tag_1.parameterName);
            if (tag_1.type)
                types.add(tag_1.type);
            if (tag_1.text)
                texts.add(tag_1.text);
            if (tag_1.optional)
                optional = true;
            if (tag_1.restParam)
                restParam = true;
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (tags_2_1 && !tags_2_1.done && (_a = tags_2.return)) _a.call(tags_2);
        }
        finally { if (e_3) throw e_3.error; }
    }
    if (tagNames.size !== 1) {
        throw new Error("cannot merge differing tags: " + JSON.stringify(tags));
    }
    var tagName = tagNames.values().next().value;
    var parameterName = parameterNames.size > 0 ? Array.from(parameterNames).join('_or_') : undefined;
    var type = types.size > 0 ? Array.from(types).join('|') : undefined;
    var text = texts.size > 0 ? Array.from(texts).join(' / ') : undefined;
    var tag = { tagName: tagName, parameterName: parameterName, type: type, text: text };
    if (optional)
        tag.optional = true;
    if (restParam)
        tag.restParam = true;
    return tag;
    var e_3, _a;
}
exports.merge = merge;

//# sourceMappingURL=jsdoc.js.map
