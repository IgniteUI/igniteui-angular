/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const /** @type {?} */ b64 = require('base64-js');
const /** @type {?} */ SourceMapConsumer = require('source-map').SourceMapConsumer;
/**
 * @record
 */
export function SourceLocation() { }
function SourceLocation_tsickle_Closure_declarations() {
    /** @type {?} */
    SourceLocation.prototype.line;
    /** @type {?} */
    SourceLocation.prototype.column;
    /** @type {?} */
    SourceLocation.prototype.source;
}
/**
 * @param {?} sourceMap
 * @param {?} genPosition
 * @return {?}
 */
export function originalPositionFor(sourceMap, genPosition) {
    const /** @type {?} */ smc = new SourceMapConsumer(sourceMap);
    // Note: We don't return the original object as it also contains a `name` property
    // which is always null and we don't want to include that in our assertions...
    const { line, column, source } = smc.originalPositionFor(genPosition);
    return { line, column, source };
}
/**
 * @param {?} source
 * @return {?}
 */
export function extractSourceMap(source) {
    let /** @type {?} */ idx = source.lastIndexOf('\n//#');
    if (idx == -1)
        return null;
    const /** @type {?} */ smComment = source.slice(idx).trim();
    const /** @type {?} */ smB64 = smComment.split('sourceMappingURL=data:application/json;base64,')[1];
    return smB64 ? JSON.parse(decodeB64String(smB64)) : null;
}
/**
 * @param {?} s
 * @return {?}
 */
function decodeB64String(s) {
    return b64.toByteArray(s).reduce((s, c) => s + String.fromCharCode(c), '');
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX21hcF91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvdGVzdGluZy9zcmMvb3V0cHV0L3NvdXJjZV9tYXBfdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVNBLHVCQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDakMsdUJBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLGlCQUFpQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRbEUsTUFBTSw4QkFDRixTQUFvQixFQUNwQixXQUF5RDtJQUMzRCx1QkFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7O0lBRzdDLE1BQU0sRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxHQUFHLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNwRSxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDO0NBQy9COzs7OztBQUVELE1BQU0sMkJBQTJCLE1BQWM7SUFDN0MscUJBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUMzQix1QkFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMzQyx1QkFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25GLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztDQUMxRDs7Ozs7QUFFRCx5QkFBeUIsQ0FBUztJQUNoQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUM1RiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTb3VyY2VNYXB9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmNvbnN0IGI2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpO1xuY29uc3QgU291cmNlTWFwQ29uc3VtZXIgPSByZXF1aXJlKCdzb3VyY2UtbWFwJykuU291cmNlTWFwQ29uc3VtZXI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU291cmNlTG9jYXRpb24ge1xuICBsaW5lOiBudW1iZXI7XG4gIGNvbHVtbjogbnVtYmVyO1xuICBzb3VyY2U6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yaWdpbmFsUG9zaXRpb25Gb3IoXG4gICAgc291cmNlTWFwOiBTb3VyY2VNYXAsXG4gICAgZ2VuUG9zaXRpb246IHtsaW5lOiBudW1iZXIgfCBudWxsLCBjb2x1bW46IG51bWJlciB8IG51bGx9KTogU291cmNlTG9jYXRpb24ge1xuICBjb25zdCBzbWMgPSBuZXcgU291cmNlTWFwQ29uc3VtZXIoc291cmNlTWFwKTtcbiAgLy8gTm90ZTogV2UgZG9uJ3QgcmV0dXJuIHRoZSBvcmlnaW5hbCBvYmplY3QgYXMgaXQgYWxzbyBjb250YWlucyBhIGBuYW1lYCBwcm9wZXJ0eVxuICAvLyB3aGljaCBpcyBhbHdheXMgbnVsbCBhbmQgd2UgZG9uJ3Qgd2FudCB0byBpbmNsdWRlIHRoYXQgaW4gb3VyIGFzc2VydGlvbnMuLi5cbiAgY29uc3Qge2xpbmUsIGNvbHVtbiwgc291cmNlfSA9IHNtYy5vcmlnaW5hbFBvc2l0aW9uRm9yKGdlblBvc2l0aW9uKTtcbiAgcmV0dXJuIHtsaW5lLCBjb2x1bW4sIHNvdXJjZX07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0U291cmNlTWFwKHNvdXJjZTogc3RyaW5nKTogU291cmNlTWFwfG51bGwge1xuICBsZXQgaWR4ID0gc291cmNlLmxhc3RJbmRleE9mKCdcXG4vLyMnKTtcbiAgaWYgKGlkeCA9PSAtMSkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IHNtQ29tbWVudCA9IHNvdXJjZS5zbGljZShpZHgpLnRyaW0oKTtcbiAgY29uc3Qgc21CNjQgPSBzbUNvbW1lbnQuc3BsaXQoJ3NvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCwnKVsxXTtcbiAgcmV0dXJuIHNtQjY0ID8gSlNPTi5wYXJzZShkZWNvZGVCNjRTdHJpbmcoc21CNjQpKSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIGRlY29kZUI2NFN0cmluZyhzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYjY0LnRvQnl0ZUFycmF5KHMpLnJlZHVjZSgoczogc3RyaW5nLCBjOiBudW1iZXIpID0+IHMgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpLCAnJyk7XG59Il19