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
        define("@angular/compiler/src/output/source_map", ["require", "exports", "@angular/compiler/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require("@angular/compiler/src/util");
    // https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit
    var VERSION = 3;
    var JS_B64_PREFIX = '# sourceMappingURL=data:application/json;base64,';
    var SourceMapGenerator = /** @class */ (function () {
        function SourceMapGenerator(file) {
            if (file === void 0) { file = null; }
            this.file = file;
            this.sourcesContent = new Map();
            this.lines = [];
            this.lastCol0 = 0;
            this.hasMappings = false;
        }
        // The content is `null` when the content is expected to be loaded using the URL
        SourceMapGenerator.prototype.addSource = function (url, content) {
            if (content === void 0) { content = null; }
            if (!this.sourcesContent.has(url)) {
                this.sourcesContent.set(url, content);
            }
            return this;
        };
        SourceMapGenerator.prototype.addLine = function () {
            this.lines.push([]);
            this.lastCol0 = 0;
            return this;
        };
        SourceMapGenerator.prototype.addMapping = function (col0, sourceUrl, sourceLine0, sourceCol0) {
            if (!this.currentLine) {
                throw new Error("A line must be added before mappings can be added");
            }
            if (sourceUrl != null && !this.sourcesContent.has(sourceUrl)) {
                throw new Error("Unknown source file \"" + sourceUrl + "\"");
            }
            if (col0 == null) {
                throw new Error("The column in the generated code must be provided");
            }
            if (col0 < this.lastCol0) {
                throw new Error("Mapping should be added in output order");
            }
            if (sourceUrl && (sourceLine0 == null || sourceCol0 == null)) {
                throw new Error("The source location must be provided when a source url is provided");
            }
            this.hasMappings = true;
            this.lastCol0 = col0;
            this.currentLine.push({ col0: col0, sourceUrl: sourceUrl, sourceLine0: sourceLine0, sourceCol0: sourceCol0 });
            return this;
        };
        Object.defineProperty(SourceMapGenerator.prototype, "currentLine", {
            get: function () { return this.lines.slice(-1)[0]; },
            enumerable: true,
            configurable: true
        });
        SourceMapGenerator.prototype.toJSON = function () {
            var _this = this;
            if (!this.hasMappings) {
                return null;
            }
            var sourcesIndex = new Map();
            var sources = [];
            var sourcesContent = [];
            Array.from(this.sourcesContent.keys()).forEach(function (url, i) {
                sourcesIndex.set(url, i);
                sources.push(url);
                sourcesContent.push(_this.sourcesContent.get(url) || null);
            });
            var mappings = '';
            var lastCol0 = 0;
            var lastSourceIndex = 0;
            var lastSourceLine0 = 0;
            var lastSourceCol0 = 0;
            this.lines.forEach(function (segments) {
                lastCol0 = 0;
                mappings += segments
                    .map(function (segment) {
                    // zero-based starting column of the line in the generated code
                    var segAsStr = toBase64VLQ(segment.col0 - lastCol0);
                    lastCol0 = segment.col0;
                    if (segment.sourceUrl != null) {
                        // zero-based index into the “sources” list
                        segAsStr +=
                            toBase64VLQ(sourcesIndex.get(segment.sourceUrl) - lastSourceIndex);
                        lastSourceIndex = sourcesIndex.get(segment.sourceUrl);
                        // the zero-based starting line in the original source
                        segAsStr += toBase64VLQ(segment.sourceLine0 - lastSourceLine0);
                        lastSourceLine0 = segment.sourceLine0;
                        // the zero-based starting column in the original source
                        segAsStr += toBase64VLQ(segment.sourceCol0 - lastSourceCol0);
                        lastSourceCol0 = segment.sourceCol0;
                    }
                    return segAsStr;
                })
                    .join(',');
                mappings += ';';
            });
            mappings = mappings.slice(0, -1);
            return {
                'file': this.file || '',
                'version': VERSION,
                'sourceRoot': '',
                'sources': sources,
                'sourcesContent': sourcesContent,
                'mappings': mappings,
            };
        };
        SourceMapGenerator.prototype.toJsComment = function () {
            return this.hasMappings ? '//' + JS_B64_PREFIX + toBase64String(JSON.stringify(this, null, 0)) :
                '';
        };
        return SourceMapGenerator;
    }());
    exports.SourceMapGenerator = SourceMapGenerator;
    function toBase64String(value) {
        var b64 = '';
        value = util_1.utf8Encode(value);
        for (var i = 0; i < value.length;) {
            var i1 = value.charCodeAt(i++);
            var i2 = value.charCodeAt(i++);
            var i3 = value.charCodeAt(i++);
            b64 += toBase64Digit(i1 >> 2);
            b64 += toBase64Digit(((i1 & 3) << 4) | (isNaN(i2) ? 0 : i2 >> 4));
            b64 += isNaN(i2) ? '=' : toBase64Digit(((i2 & 15) << 2) | (i3 >> 6));
            b64 += isNaN(i2) || isNaN(i3) ? '=' : toBase64Digit(i3 & 63);
        }
        return b64;
    }
    exports.toBase64String = toBase64String;
    function toBase64VLQ(value) {
        value = value < 0 ? ((-value) << 1) + 1 : value << 1;
        var out = '';
        do {
            var digit = value & 31;
            value = value >> 5;
            if (value > 0) {
                digit = digit | 32;
            }
            out += toBase64Digit(digit);
        } while (value > 0);
        return out;
    }
    var B64_DIGITS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    function toBase64Digit(value) {
        if (value < 0 || value >= 64) {
            throw new Error("Can only encode value in the range [0, 63]");
        }
        return B64_DIGITS[value];
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX21hcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9vdXRwdXQvc291cmNlX21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILG1EQUFtQztJQUVuQyx1RkFBdUY7SUFDdkYsSUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBRWxCLElBQU0sYUFBYSxHQUFHLGtEQUFrRCxDQUFDO0lBa0J6RTtRQU1FLDRCQUFvQixJQUF3QjtZQUF4QixxQkFBQSxFQUFBLFdBQXdCO1lBQXhCLFNBQUksR0FBSixJQUFJLENBQW9CO1lBTHBDLG1CQUFjLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDckQsVUFBSyxHQUFnQixFQUFFLENBQUM7WUFDeEIsYUFBUSxHQUFXLENBQUMsQ0FBQztZQUNyQixnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUVtQixDQUFDO1FBRWhELGdGQUFnRjtRQUNoRixzQ0FBUyxHQUFULFVBQVUsR0FBVyxFQUFFLE9BQTJCO1lBQTNCLHdCQUFBLEVBQUEsY0FBMkI7WUFDaEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxvQ0FBTyxHQUFQO1lBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCx1Q0FBVSxHQUFWLFVBQVcsSUFBWSxF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LElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt1dGY4RW5jb2RlfSBmcm9tICcuLi91dGlsJztcblxuLy8gaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xVTFSR0FlaFF3UnlwVVRvdkYxS1JscGlPRnplMGItXzJnYzZmQUgwS1kway9lZGl0XG5jb25zdCBWRVJTSU9OID0gMztcblxuY29uc3QgSlNfQjY0X1BSRUZJWCA9ICcjIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCwnO1xuXG50eXBlIFNlZ21lbnQgPSB7XG4gIGNvbDA6IG51bWJlcixcbiAgc291cmNlVXJsPzogc3RyaW5nLFxuICBzb3VyY2VMaW5lMD86IG51bWJlcixcbiAgc291cmNlQ29sMD86IG51bWJlcixcbn07XG5cbmV4cG9ydCB0eXBlIFNvdXJjZU1hcCA9IHtcbiAgdmVyc2lvbjogbnVtYmVyLFxuICBmaWxlPzogc3RyaW5nLFxuICBzb3VyY2VSb290OiBzdHJpbmcsXG4gIHNvdXJjZXM6IHN0cmluZ1tdLFxuICBzb3VyY2VzQ29udGVudDogKHN0cmluZyB8IG51bGwpW10sXG4gIG1hcHBpbmdzOiBzdHJpbmcsXG59O1xuXG5leHBvcnQgY2xhc3MgU291cmNlTWFwR2VuZXJhdG9yIHtcbiAgcHJpdmF0ZSBzb3VyY2VzQ29udGVudDogTWFwPHN0cmluZywgc3RyaW5nfG51bGw+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIGxpbmVzOiBTZWdtZW50W11bXSA9IFtdO1xuICBwcml2YXRlIGxhc3RDb2wwOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGhhc01hcHBpbmdzID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmaWxlOiBzdHJpbmd8bnVsbCA9IG51bGwpIHt9XG5cbiAgLy8gVGhlIGNvbnRlbnQgaXMgYG51bGxgIHdoZW4gdGhlIGNvbnRlbnQgaXMgZXhwZWN0ZWQgdG8gYmUgbG9hZGVkIHVzaW5nIHRoZSBVUkxcbiAgYWRkU291cmNlKHVybDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmd8bnVsbCA9IG51bGwpOiB0aGlzIHtcbiAgICBpZiAoIXRoaXMuc291cmNlc0NvbnRlbnQuaGFzKHVybCkpIHtcbiAgICAgIHRoaXMuc291cmNlc0NvbnRlbnQuc2V0KHVybCwgY29udGVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkTGluZSgpOiB0aGlzIHtcbiAgICB0aGlzLmxpbmVzLnB1c2goW10pO1xuICAgIHRoaXMubGFzdENvbDAgPSAwO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkTWFwcGluZyhjb2wwOiBudW1iZXIsIHNvdXJjZVVybD86IHN0cmluZywgc291cmNlTGluZTA/OiBudW1iZXIsIHNvdXJjZUNvbDA/OiBudW1iZXIpOiB0aGlzIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudExpbmUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQSBsaW5lIG11c3QgYmUgYWRkZWQgYmVmb3JlIG1hcHBpbmdzIGNhbiBiZSBhZGRlZGApO1xuICAgIH1cbiAgICBpZiAoc291cmNlVXJsICE9IG51bGwgJiYgIXRoaXMuc291cmNlc0NvbnRlbnQuaGFzKHNvdXJjZVVybCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzb3VyY2UgZmlsZSBcIiR7c291cmNlVXJsfVwiYCk7XG4gICAgfVxuICAgIGlmIChjb2wwID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGNvbHVtbiBpbiB0aGUgZ2VuZXJhdGVkIGNvZGUgbXVzdCBiZSBwcm92aWRlZGApO1xuICAgIH1cbiAgICBpZiAoY29sMCA8IHRoaXMubGFzdENvbDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTWFwcGluZyBzaG91bGQgYmUgYWRkZWQgaW4gb3V0cHV0IG9yZGVyYCk7XG4gICAgfVxuICAgIGlmIChzb3VyY2VVcmwgJiYgKHNvdXJjZUxpbmUwID09IG51bGwgfHwgc291cmNlQ29sMCA9PSBudWxsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgc291cmNlIGxvY2F0aW9uIG11c3QgYmUgcHJvdmlkZWQgd2hlbiBhIHNvdXJjZSB1cmwgaXMgcHJvdmlkZWRgKTtcbiAgICB9XG5cbiAgICB0aGlzLmhhc01hcHBpbmdzID0gdHJ1ZTtcbiAgICB0aGlzLmxhc3RDb2wwID0gY29sMDtcbiAgICB0aGlzLmN1cnJlbnRMaW5lLnB1c2goe2NvbDAsIHNvdXJjZVVybCwgc291cmNlTGluZTAsIHNvdXJjZUNvbDB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGN1cnJlbnRMaW5lKCk6IFNlZ21lbnRbXXxudWxsIHsgcmV0dXJuIHRoaXMubGluZXMuc2xpY2UoLTEpWzBdOyB9XG5cbiAgdG9KU09OKCk6IFNvdXJjZU1hcHxudWxsIHtcbiAgICBpZiAoIXRoaXMuaGFzTWFwcGluZ3MpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZXNJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gICAgY29uc3Qgc291cmNlczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBzb3VyY2VzQ29udGVudDogKHN0cmluZyB8IG51bGwpW10gPSBbXTtcblxuICAgIEFycmF5LmZyb20odGhpcy5zb3VyY2VzQ29udGVudC5rZXlzKCkpLmZvckVhY2goKHVybDogc3RyaW5nLCBpOiBudW1iZXIpID0+IHtcbiAgICAgIHNvdXJjZXNJbmRleC5zZXQodXJsLCBpKTtcbiAgICAgIHNvdXJjZXMucHVzaCh1cmwpO1xuICAgICAgc291cmNlc0NvbnRlbnQucHVzaCh0aGlzLnNvdXJjZXNDb250ZW50LmdldCh1cmwpIHx8IG51bGwpO1xuICAgIH0pO1xuXG4gICAgbGV0IG1hcHBpbmdzOiBzdHJpbmcgPSAnJztcbiAgICBsZXQgbGFzdENvbDA6IG51bWJlciA9IDA7XG4gICAgbGV0IGxhc3RTb3VyY2VJbmRleDogbnVtYmVyID0gMDtcbiAgICBsZXQgbGFzdFNvdXJjZUxpbmUwOiBudW1iZXIgPSAwO1xuICAgIGxldCBsYXN0U291cmNlQ29sMDogbnVtYmVyID0gMDtcblxuICAgIHRoaXMubGluZXMuZm9yRWFjaChzZWdtZW50cyA9PiB7XG4gICAgICBsYXN0Q29sMCA9IDA7XG5cbiAgICAgIG1hcHBpbmdzICs9IHNlZ21lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgLm1hcChzZWdtZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHplcm8tYmFzZWQgc3RhcnRpbmcgY29sdW1uIG9mIHRoZSBsaW5lIGluIHRoZSBnZW5lcmF0ZWQgY29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlZ0FzU3RyID0gdG9CYXNlNjRWTFEoc2VnbWVudC5jb2wwIC0gbGFzdENvbDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbDAgPSBzZWdtZW50LmNvbDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWdtZW50LnNvdXJjZVVybCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHplcm8tYmFzZWQgaW5kZXggaW50byB0aGUg4oCcc291cmNlc+KAnSBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNlZ0FzU3RyICs9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b0Jhc2U2NFZMUShzb3VyY2VzSW5kZXguZ2V0KHNlZ21lbnQuc291cmNlVXJsKSAhIC0gbGFzdFNvdXJjZUluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNvdXJjZUluZGV4ID0gc291cmNlc0luZGV4LmdldChzZWdtZW50LnNvdXJjZVVybCkgITtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHplcm8tYmFzZWQgc3RhcnRpbmcgbGluZSBpbiB0aGUgb3JpZ2luYWwgc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNlZ0FzU3RyICs9IHRvQmFzZTY0VkxRKHNlZ21lbnQuc291cmNlTGluZTAgISAtIGxhc3RTb3VyY2VMaW5lMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTb3VyY2VMaW5lMCA9IHNlZ21lbnQuc291cmNlTGluZTAgITtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHplcm8tYmFzZWQgc3RhcnRpbmcgY29sdW1uIGluIHRoZSBvcmlnaW5hbCBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2VnQXNTdHIgKz0gdG9CYXNlNjRWTFEoc2VnbWVudC5zb3VyY2VDb2wwICEgLSBsYXN0U291cmNlQ29sMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTb3VyY2VDb2wwID0gc2VnbWVudC5zb3VyY2VDb2wwICE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWdBc1N0cjtcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcsJyk7XG4gICAgICBtYXBwaW5ncyArPSAnOyc7XG4gICAgfSk7XG5cbiAgICBtYXBwaW5ncyA9IG1hcHBpbmdzLnNsaWNlKDAsIC0xKTtcblxuICAgIHJldHVybiB7XG4gICAgICAnZmlsZSc6IHRoaXMuZmlsZSB8fCAnJyxcbiAgICAgICd2ZXJzaW9uJzogVkVSU0lPTixcbiAgICAgICdzb3VyY2VSb290JzogJycsXG4gICAgICAnc291cmNlcyc6IHNvdXJjZXMsXG4gICAgICAnc291cmNlc0NvbnRlbnQnOiBzb3VyY2VzQ29udGVudCxcbiAgICAgICdtYXBwaW5ncyc6IG1hcHBpbmdzLFxuICAgIH07XG4gIH1cblxuICB0b0pzQ29tbWVudCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmhhc01hcHBpbmdzID8gJy8vJyArIEpTX0I2NF9QUkVGSVggKyB0b0Jhc2U2NFN0cmluZyhKU09OLnN0cmluZ2lmeSh0aGlzLCBudWxsLCAwKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyc7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvQmFzZTY0U3RyaW5nKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgYjY0ID0gJyc7XG4gIHZhbHVlID0gdXRmOEVuY29kZSh2YWx1ZSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOykge1xuICAgIGNvbnN0IGkxID0gdmFsdWUuY2hhckNvZGVBdChpKyspO1xuICAgIGNvbnN0IGkyID0gdmFsdWUuY2hhckNvZGVBdChpKyspO1xuICAgIGNvbnN0IGkzID0gdmFsdWUuY2hhckNvZGVBdChpKyspO1xuICAgIGI2NCArPSB0b0Jhc2U2NERpZ2l0KGkxID4+IDIpO1xuICAgIGI2NCArPSB0b0Jhc2U2NERpZ2l0KCgoaTEgJiAzKSA8PCA0KSB8IChpc05hTihpMikgPyAwIDogaTIgPj4gNCkpO1xuICAgIGI2NCArPSBpc05hTihpMikgPyAnPScgOiB0b0Jhc2U2NERpZ2l0KCgoaTIgJiAxNSkgPDwgMikgfCAoaTMgPj4gNikpO1xuICAgIGI2NCArPSBpc05hTihpMikgfHwgaXNOYU4oaTMpID8gJz0nIDogdG9CYXNlNjREaWdpdChpMyAmIDYzKTtcbiAgfVxuXG4gIHJldHVybiBiNjQ7XG59XG5cbmZ1bmN0aW9uIHRvQmFzZTY0VkxRKHZhbHVlOiBudW1iZXIpOiBzdHJpbmcge1xuICB2YWx1ZSA9IHZhbHVlIDwgMCA/ICgoLXZhbHVlKSA8PCAxKSArIDEgOiB2YWx1ZSA8PCAxO1xuXG4gIGxldCBvdXQgPSAnJztcbiAgZG8ge1xuICAgIGxldCBkaWdpdCA9IHZhbHVlICYgMzE7XG4gICAgdmFsdWUgPSB2YWx1ZSA+PiA1O1xuICAgIGlmICh2YWx1ZSA+IDApIHtcbiAgICAgIGRpZ2l0ID0gZGlnaXQgfCAzMjtcbiAgICB9XG4gICAgb3V0ICs9IHRvQmFzZTY0RGlnaXQoZGlnaXQpO1xuICB9IHdoaWxlICh2YWx1ZSA+IDApO1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbmNvbnN0IEI2NF9ESUdJVFMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbmZ1bmN0aW9uIHRvQmFzZTY0RGlnaXQodmFsdWU6IG51bWJlcik6IHN0cmluZyB7XG4gIGlmICh2YWx1ZSA8IDAgfHwgdmFsdWUgPj0gNjQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBvbmx5IGVuY29kZSB2YWx1ZSBpbiB0aGUgcmFuZ2UgWzAsIDYzXWApO1xuICB9XG5cbiAgcmV0dXJuIEI2NF9ESUdJVFNbdmFsdWVdO1xufVxuIl19