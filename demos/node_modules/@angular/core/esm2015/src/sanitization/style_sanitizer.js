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
import { isDevMode } from '../application_ref';
import { _sanitizeUrl } from './url_sanitizer';
/**
 * Regular expression for safe style values.
 *
 * Quotes (" and ') are allowed, but a check must be done elsewhere to ensure they're balanced.
 *
 * ',' allows multiple values to be assigned to the same property (e.g. background-attachment or
 * font-family) and hence could allow multiple values to get injected, but that should pose no risk
 * of XSS.
 *
 * The function expression checks only for XSS safety, not for CSS validity.
 *
 * This regular expression was taken from the Closure sanitization library, and augmented for
 * transformation values.
 */
const /** @type {?} */ VALUES = '[-,."\'%_!# a-zA-Z0-9]+';
const /** @type {?} */ TRANSFORMATION_FNS = '(?:matrix|translate|scale|rotate|skew|perspective)(?:X|Y|3d)?';
const /** @type {?} */ COLOR_FNS = '(?:rgb|hsl)a?';
const /** @type {?} */ GRADIENTS = '(?:repeating-)?(?:linear|radial)-gradient';
const /** @type {?} */ CSS3_FNS = '(?:calc|attr)';
const /** @type {?} */ FN_ARGS = '\\([-0-9.%, #a-zA-Z]+\\)';
const /** @type {?} */ SAFE_STYLE_VALUE = new RegExp(`^(${VALUES}|` +
    `(?:${TRANSFORMATION_FNS}|${COLOR_FNS}|${GRADIENTS}|${CSS3_FNS})` +
    `${FN_ARGS})$`, 'g');
/**
 * Matches a `url(...)` value with an arbitrary argument as long as it does
 * not contain parentheses.
 *
 * The URL value still needs to be sanitized separately.
 *
 * `url(...)` values are a very common use case, e.g. for `background-image`. With carefully crafted
 * CSS style rules, it is possible to construct an information leak with `url` values in CSS, e.g.
 * by observing whether scroll bars are displayed, or character ranges used by a font face
 * definition.
 *
 * Angular only allows binding CSS values (as opposed to entire CSS rules), so it is unlikely that
 * binding a URL value without further cooperation from the page will cause an information leak, and
 * if so, it is just a leak, not a full blown XSS vulnerability.
 *
 * Given the common use case, low likelihood of attack vector, and low impact of an attack, this
 * code is permissive and allows URLs that sanitize otherwise.
 */
const /** @type {?} */ URL_RE = /^url\(([^)]+)\)$/;
/**
 * Checks that quotes (" and ') are properly balanced inside a string. Assumes
 * that neither escape (\) nor any other character that could result in
 * breaking out of a string parsing context are allowed;
 * see http://www.w3.org/TR/css3-syntax/#string-token-diagram.
 *
 * This code was taken from the Closure sanitization library.
 * @param {?} value
 * @return {?}
 */
function hasBalancedQuotes(value) {
    let /** @type {?} */ outsideSingle = true;
    let /** @type {?} */ outsideDouble = true;
    for (let /** @type {?} */ i = 0; i < value.length; i++) {
        const /** @type {?} */ c = value.charAt(i);
        if (c === '\'' && outsideDouble) {
            outsideSingle = !outsideSingle;
        }
        else if (c === '"' && outsideSingle) {
            outsideDouble = !outsideDouble;
        }
    }
    return outsideSingle && outsideDouble;
}
/**
 * Sanitizes the given untrusted CSS style property value (i.e. not an entire object, just a single
 * value) and returns a value that is safe to use in a browser environment.
 * @param {?} value
 * @return {?}
 */
export function _sanitizeStyle(value) {
    value = String(value).trim(); // Make sure it's actually a string.
    if (!value)
        return '';
    // Single url(...) values are supported, but only for URLs that sanitize cleanly. See above for
    // reasoning behind this.
    const /** @type {?} */ urlMatch = value.match(URL_RE);
    if ((urlMatch && _sanitizeUrl(urlMatch[1]) === urlMatch[1]) ||
        value.match(SAFE_STYLE_VALUE) && hasBalancedQuotes(value)) {
        return value; // Safe style values.
    }
    if (isDevMode()) {
        console.warn(`WARNING: sanitizing unsafe style value ${value} (see http://g.co/ng/security#xss).`);
    }
    return 'unsafe';
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfc2FuaXRpemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvc2FuaXRpemF0aW9uL3N0eWxlX3Nhbml0aXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQWlCN0MsdUJBQU0sTUFBTSxHQUFHLHlCQUF5QixDQUFDO0FBQ3pDLHVCQUFNLGtCQUFrQixHQUFHLCtEQUErRCxDQUFDO0FBQzNGLHVCQUFNLFNBQVMsR0FBRyxlQUFlLENBQUM7QUFDbEMsdUJBQU0sU0FBUyxHQUFHLDJDQUEyQyxDQUFDO0FBQzlELHVCQUFNLFFBQVEsR0FBRyxlQUFlLENBQUM7QUFDakMsdUJBQU0sT0FBTyxHQUFHLDBCQUEwQixDQUFDO0FBQzNDLHVCQUFNLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUMvQixLQUFLLE1BQU0sR0FBRztJQUNWLE1BQU0sa0JBQWtCLElBQUksU0FBUyxJQUFJLFNBQVMsSUFBSSxRQUFRLEdBQUc7SUFDakUsR0FBRyxPQUFPLElBQUksRUFDbEIsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQlQsdUJBQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDOzs7Ozs7Ozs7OztBQVVsQywyQkFBMkIsS0FBYTtJQUN0QyxxQkFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLHFCQUFJLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFDekIsR0FBRyxDQUFDLENBQUMscUJBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLHVCQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNoQyxhQUFhLEdBQUcsQ0FBQyxhQUFhLENBQUM7U0FDaEM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLGFBQWEsR0FBRyxDQUFDLGFBQWEsQ0FBQztTQUNoQztLQUNGO0lBQ0QsTUFBTSxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUM7Q0FDdkM7Ozs7Ozs7QUFNRCxNQUFNLHlCQUF5QixLQUFhO0lBQzFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDOzs7SUFJdEIsdUJBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RCxLQUFLLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlELE1BQU0sQ0FBQyxLQUFLLENBQUM7S0FDZDtJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQixPQUFPLENBQUMsSUFBSSxDQUNSLDBDQUEwQyxLQUFLLHFDQUFxQyxDQUFDLENBQUM7S0FDM0Y7SUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDO0NBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2lzRGV2TW9kZX0gZnJvbSAnLi4vYXBwbGljYXRpb25fcmVmJztcbmltcG9ydCB7X3Nhbml0aXplVXJsfSBmcm9tICcuL3VybF9zYW5pdGl6ZXInO1xuXG5cbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIGZvciBzYWZlIHN0eWxlIHZhbHVlcy5cbiAqXG4gKiBRdW90ZXMgKFwiIGFuZCAnKSBhcmUgYWxsb3dlZCwgYnV0IGEgY2hlY2sgbXVzdCBiZSBkb25lIGVsc2V3aGVyZSB0byBlbnN1cmUgdGhleSdyZSBiYWxhbmNlZC5cbiAqXG4gKiAnLCcgYWxsb3dzIG11bHRpcGxlIHZhbHVlcyB0byBiZSBhc3NpZ25lZCB0byB0aGUgc2FtZSBwcm9wZXJ0eSAoZS5nLiBiYWNrZ3JvdW5kLWF0dGFjaG1lbnQgb3JcbiAqIGZvbnQtZmFtaWx5KSBhbmQgaGVuY2UgY291bGQgYWxsb3cgbXVsdGlwbGUgdmFsdWVzIHRvIGdldCBpbmplY3RlZCwgYnV0IHRoYXQgc2hvdWxkIHBvc2Ugbm8gcmlza1xuICogb2YgWFNTLlxuICpcbiAqIFRoZSBmdW5jdGlvbiBleHByZXNzaW9uIGNoZWNrcyBvbmx5IGZvciBYU1Mgc2FmZXR5LCBub3QgZm9yIENTUyB2YWxpZGl0eS5cbiAqXG4gKiBUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiB3YXMgdGFrZW4gZnJvbSB0aGUgQ2xvc3VyZSBzYW5pdGl6YXRpb24gbGlicmFyeSwgYW5kIGF1Z21lbnRlZCBmb3JcbiAqIHRyYW5zZm9ybWF0aW9uIHZhbHVlcy5cbiAqL1xuY29uc3QgVkFMVUVTID0gJ1stLC5cIlxcJyVfISMgYS16QS1aMC05XSsnO1xuY29uc3QgVFJBTlNGT1JNQVRJT05fRk5TID0gJyg/Om1hdHJpeHx0cmFuc2xhdGV8c2NhbGV8cm90YXRlfHNrZXd8cGVyc3BlY3RpdmUpKD86WHxZfDNkKT8nO1xuY29uc3QgQ09MT1JfRk5TID0gJyg/OnJnYnxoc2wpYT8nO1xuY29uc3QgR1JBRElFTlRTID0gJyg/OnJlcGVhdGluZy0pPyg/OmxpbmVhcnxyYWRpYWwpLWdyYWRpZW50JztcbmNvbnN0IENTUzNfRk5TID0gJyg/OmNhbGN8YXR0ciknO1xuY29uc3QgRk5fQVJHUyA9ICdcXFxcKFstMC05LiUsICNhLXpBLVpdK1xcXFwpJztcbmNvbnN0IFNBRkVfU1RZTEVfVkFMVUUgPSBuZXcgUmVnRXhwKFxuICAgIGBeKCR7VkFMVUVTfXxgICtcbiAgICAgICAgYCg/OiR7VFJBTlNGT1JNQVRJT05fRk5TfXwke0NPTE9SX0ZOU318JHtHUkFESUVOVFN9fCR7Q1NTM19GTlN9KWAgK1xuICAgICAgICBgJHtGTl9BUkdTfSkkYCxcbiAgICAnZycpO1xuXG4vKipcbiAqIE1hdGNoZXMgYSBgdXJsKC4uLilgIHZhbHVlIHdpdGggYW4gYXJiaXRyYXJ5IGFyZ3VtZW50IGFzIGxvbmcgYXMgaXQgZG9lc1xuICogbm90IGNvbnRhaW4gcGFyZW50aGVzZXMuXG4gKlxuICogVGhlIFVSTCB2YWx1ZSBzdGlsbCBuZWVkcyB0byBiZSBzYW5pdGl6ZWQgc2VwYXJhdGVseS5cbiAqXG4gKiBgdXJsKC4uLilgIHZhbHVlcyBhcmUgYSB2ZXJ5IGNvbW1vbiB1c2UgY2FzZSwgZS5nLiBmb3IgYGJhY2tncm91bmQtaW1hZ2VgLiBXaXRoIGNhcmVmdWxseSBjcmFmdGVkXG4gKiBDU1Mgc3R5bGUgcnVsZXMsIGl0IGlzIHBvc3NpYmxlIHRvIGNvbnN0cnVjdCBhbiBpbmZvcm1hdGlvbiBsZWFrIHdpdGggYHVybGAgdmFsdWVzIGluIENTUywgZS5nLlxuICogYnkgb2JzZXJ2aW5nIHdoZXRoZXIgc2Nyb2xsIGJhcnMgYXJlIGRpc3BsYXllZCwgb3IgY2hhcmFjdGVyIHJhbmdlcyB1c2VkIGJ5IGEgZm9udCBmYWNlXG4gKiBkZWZpbml0aW9uLlxuICpcbiAqIEFuZ3VsYXIgb25seSBhbGxvd3MgYmluZGluZyBDU1MgdmFsdWVzIChhcyBvcHBvc2VkIHRvIGVudGlyZSBDU1MgcnVsZXMpLCBzbyBpdCBpcyB1bmxpa2VseSB0aGF0XG4gKiBiaW5kaW5nIGEgVVJMIHZhbHVlIHdpdGhvdXQgZnVydGhlciBjb29wZXJhdGlvbiBmcm9tIHRoZSBwYWdlIHdpbGwgY2F1c2UgYW4gaW5mb3JtYXRpb24gbGVhaywgYW5kXG4gKiBpZiBzbywgaXQgaXMganVzdCBhIGxlYWssIG5vdCBhIGZ1bGwgYmxvd24gWFNTIHZ1bG5lcmFiaWxpdHkuXG4gKlxuICogR2l2ZW4gdGhlIGNvbW1vbiB1c2UgY2FzZSwgbG93IGxpa2VsaWhvb2Qgb2YgYXR0YWNrIHZlY3RvciwgYW5kIGxvdyBpbXBhY3Qgb2YgYW4gYXR0YWNrLCB0aGlzXG4gKiBjb2RlIGlzIHBlcm1pc3NpdmUgYW5kIGFsbG93cyBVUkxzIHRoYXQgc2FuaXRpemUgb3RoZXJ3aXNlLlxuICovXG5jb25zdCBVUkxfUkUgPSAvXnVybFxcKChbXildKylcXCkkLztcblxuLyoqXG4gKiBDaGVja3MgdGhhdCBxdW90ZXMgKFwiIGFuZCAnKSBhcmUgcHJvcGVybHkgYmFsYW5jZWQgaW5zaWRlIGEgc3RyaW5nLiBBc3N1bWVzXG4gKiB0aGF0IG5laXRoZXIgZXNjYXBlIChcXCkgbm9yIGFueSBvdGhlciBjaGFyYWN0ZXIgdGhhdCBjb3VsZCByZXN1bHQgaW5cbiAqIGJyZWFraW5nIG91dCBvZiBhIHN0cmluZyBwYXJzaW5nIGNvbnRleHQgYXJlIGFsbG93ZWQ7XG4gKiBzZWUgaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1zeW50YXgvI3N0cmluZy10b2tlbi1kaWFncmFtLlxuICpcbiAqIFRoaXMgY29kZSB3YXMgdGFrZW4gZnJvbSB0aGUgQ2xvc3VyZSBzYW5pdGl6YXRpb24gbGlicmFyeS5cbiAqL1xuZnVuY3Rpb24gaGFzQmFsYW5jZWRRdW90ZXModmFsdWU6IHN0cmluZykge1xuICBsZXQgb3V0c2lkZVNpbmdsZSA9IHRydWU7XG4gIGxldCBvdXRzaWRlRG91YmxlID0gdHJ1ZTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGMgPSB2YWx1ZS5jaGFyQXQoaSk7XG4gICAgaWYgKGMgPT09ICdcXCcnICYmIG91dHNpZGVEb3VibGUpIHtcbiAgICAgIG91dHNpZGVTaW5nbGUgPSAhb3V0c2lkZVNpbmdsZTtcbiAgICB9IGVsc2UgaWYgKGMgPT09ICdcIicgJiYgb3V0c2lkZVNpbmdsZSkge1xuICAgICAgb3V0c2lkZURvdWJsZSA9ICFvdXRzaWRlRG91YmxlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0c2lkZVNpbmdsZSAmJiBvdXRzaWRlRG91YmxlO1xufVxuXG4vKipcbiAqIFNhbml0aXplcyB0aGUgZ2l2ZW4gdW50cnVzdGVkIENTUyBzdHlsZSBwcm9wZXJ0eSB2YWx1ZSAoaS5lLiBub3QgYW4gZW50aXJlIG9iamVjdCwganVzdCBhIHNpbmdsZVxuICogdmFsdWUpIGFuZCByZXR1cm5zIGEgdmFsdWUgdGhhdCBpcyBzYWZlIHRvIHVzZSBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfc2FuaXRpemVTdHlsZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsdWUgPSBTdHJpbmcodmFsdWUpLnRyaW0oKTsgIC8vIE1ha2Ugc3VyZSBpdCdzIGFjdHVhbGx5IGEgc3RyaW5nLlxuICBpZiAoIXZhbHVlKSByZXR1cm4gJyc7XG5cbiAgLy8gU2luZ2xlIHVybCguLi4pIHZhbHVlcyBhcmUgc3VwcG9ydGVkLCBidXQgb25seSBmb3IgVVJMcyB0aGF0IHNhbml0aXplIGNsZWFubHkuIFNlZSBhYm92ZSBmb3JcbiAgLy8gcmVhc29uaW5nIGJlaGluZCB0aGlzLlxuICBjb25zdCB1cmxNYXRjaCA9IHZhbHVlLm1hdGNoKFVSTF9SRSk7XG4gIGlmICgodXJsTWF0Y2ggJiYgX3Nhbml0aXplVXJsKHVybE1hdGNoWzFdKSA9PT0gdXJsTWF0Y2hbMV0pIHx8XG4gICAgICB2YWx1ZS5tYXRjaChTQUZFX1NUWUxFX1ZBTFVFKSAmJiBoYXNCYWxhbmNlZFF1b3Rlcyh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7ICAvLyBTYWZlIHN0eWxlIHZhbHVlcy5cbiAgfVxuXG4gIGlmIChpc0Rldk1vZGUoKSkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYFdBUk5JTkc6IHNhbml0aXppbmcgdW5zYWZlIHN0eWxlIHZhbHVlICR7dmFsdWV9IChzZWUgaHR0cDovL2cuY28vbmcvc2VjdXJpdHkjeHNzKS5gKTtcbiAgfVxuXG4gIHJldHVybiAndW5zYWZlJztcbn1cbiJdfQ==