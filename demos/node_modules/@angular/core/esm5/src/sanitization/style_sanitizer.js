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
var VALUES = '[-,."\'%_!# a-zA-Z0-9]+';
var TRANSFORMATION_FNS = '(?:matrix|translate|scale|rotate|skew|perspective)(?:X|Y|3d)?';
var COLOR_FNS = '(?:rgb|hsl)a?';
var GRADIENTS = '(?:repeating-)?(?:linear|radial)-gradient';
var CSS3_FNS = '(?:calc|attr)';
var FN_ARGS = '\\([-0-9.%, #a-zA-Z]+\\)';
var SAFE_STYLE_VALUE = new RegExp("^(" + VALUES + "|" +
    ("(?:" + TRANSFORMATION_FNS + "|" + COLOR_FNS + "|" + GRADIENTS + "|" + CSS3_FNS + ")") +
    (FN_ARGS + ")$"), 'g');
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
var URL_RE = /^url\(([^)]+)\)$/;
/**
 * Checks that quotes (" and ') are properly balanced inside a string. Assumes
 * that neither escape (\) nor any other character that could result in
 * breaking out of a string parsing context are allowed;
 * see http://www.w3.org/TR/css3-syntax/#string-token-diagram.
 *
 * This code was taken from the Closure sanitization library.
 */
function hasBalancedQuotes(value) {
    var outsideSingle = true;
    var outsideDouble = true;
    for (var i = 0; i < value.length; i++) {
        var c = value.charAt(i);
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
 */
export function _sanitizeStyle(value) {
    value = String(value).trim(); // Make sure it's actually a string.
    if (!value)
        return '';
    // Single url(...) values are supported, but only for URLs that sanitize cleanly. See above for
    // reasoning behind this.
    var urlMatch = value.match(URL_RE);
    if ((urlMatch && _sanitizeUrl(urlMatch[1]) === urlMatch[1]) ||
        value.match(SAFE_STYLE_VALUE) && hasBalancedQuotes(value)) {
        return value; // Safe style values.
    }
    if (isDevMode()) {
        console.warn("WARNING: sanitizing unsafe style value " + value + " (see http://g.co/ng/security#xss).");
    }
    return 'unsafe';
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfc2FuaXRpemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvc2FuaXRpemF0aW9uL3N0eWxlX3Nhbml0aXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBUUEsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FBaUI3QyxJQUFNLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQztBQUN6QyxJQUFNLGtCQUFrQixHQUFHLCtEQUErRCxDQUFDO0FBQzNGLElBQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQztBQUNsQyxJQUFNLFNBQVMsR0FBRywyQ0FBMkMsQ0FBQztBQUM5RCxJQUFNLFFBQVEsR0FBRyxlQUFlLENBQUM7QUFDakMsSUFBTSxPQUFPLEdBQUcsMEJBQTBCLENBQUM7QUFDM0MsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FDL0IsT0FBSyxNQUFNLE1BQUc7S0FDVixRQUFNLGtCQUFrQixTQUFJLFNBQVMsU0FBSSxTQUFTLFNBQUksUUFBUSxNQUFHLENBQUE7S0FDOUQsT0FBTyxPQUFJLENBQUEsRUFDbEIsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQlQsSUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUM7Ozs7Ozs7OztBQVVsQywyQkFBMkIsS0FBYTtJQUN0QyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFDekIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLElBQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLGFBQWEsR0FBRyxDQUFDLGFBQWEsQ0FBQztTQUNoQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDdEMsYUFBYSxHQUFHLENBQUMsYUFBYSxDQUFDO1NBQ2hDO0tBQ0Y7SUFDRCxNQUFNLENBQUMsYUFBYSxJQUFJLGFBQWEsQ0FBQztDQUN2Qzs7Ozs7QUFNRCxNQUFNLHlCQUF5QixLQUFhO0lBQzFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDOzs7SUFJdEIsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELEtBQUssQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUQsTUFBTSxDQUFDLEtBQUssQ0FBQztLQUNkO0lBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQ1IsNENBQTBDLEtBQUssd0NBQXFDLENBQUMsQ0FBQztLQUMzRjtJQUVELE1BQU0sQ0FBQyxRQUFRLENBQUM7Q0FDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNEZXZNb2RlfSBmcm9tICcuLi9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtfc2FuaXRpemVVcmx9IGZyb20gJy4vdXJsX3Nhbml0aXplcic7XG5cblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gZm9yIHNhZmUgc3R5bGUgdmFsdWVzLlxuICpcbiAqIFF1b3RlcyAoXCIgYW5kICcpIGFyZSBhbGxvd2VkLCBidXQgYSBjaGVjayBtdXN0IGJlIGRvbmUgZWxzZXdoZXJlIHRvIGVuc3VyZSB0aGV5J3JlIGJhbGFuY2VkLlxuICpcbiAqICcsJyBhbGxvd3MgbXVsdGlwbGUgdmFsdWVzIHRvIGJlIGFzc2lnbmVkIHRvIHRoZSBzYW1lIHByb3BlcnR5IChlLmcuIGJhY2tncm91bmQtYXR0YWNobWVudCBvclxuICogZm9udC1mYW1pbHkpIGFuZCBoZW5jZSBjb3VsZCBhbGxvdyBtdWx0aXBsZSB2YWx1ZXMgdG8gZ2V0IGluamVjdGVkLCBidXQgdGhhdCBzaG91bGQgcG9zZSBubyByaXNrXG4gKiBvZiBYU1MuXG4gKlxuICogVGhlIGZ1bmN0aW9uIGV4cHJlc3Npb24gY2hlY2tzIG9ubHkgZm9yIFhTUyBzYWZldHksIG5vdCBmb3IgQ1NTIHZhbGlkaXR5LlxuICpcbiAqIFRoaXMgcmVndWxhciBleHByZXNzaW9uIHdhcyB0YWtlbiBmcm9tIHRoZSBDbG9zdXJlIHNhbml0aXphdGlvbiBsaWJyYXJ5LCBhbmQgYXVnbWVudGVkIGZvclxuICogdHJhbnNmb3JtYXRpb24gdmFsdWVzLlxuICovXG5jb25zdCBWQUxVRVMgPSAnWy0sLlwiXFwnJV8hIyBhLXpBLVowLTldKyc7XG5jb25zdCBUUkFOU0ZPUk1BVElPTl9GTlMgPSAnKD86bWF0cml4fHRyYW5zbGF0ZXxzY2FsZXxyb3RhdGV8c2tld3xwZXJzcGVjdGl2ZSkoPzpYfFl8M2QpPyc7XG5jb25zdCBDT0xPUl9GTlMgPSAnKD86cmdifGhzbClhPyc7XG5jb25zdCBHUkFESUVOVFMgPSAnKD86cmVwZWF0aW5nLSk/KD86bGluZWFyfHJhZGlhbCktZ3JhZGllbnQnO1xuY29uc3QgQ1NTM19GTlMgPSAnKD86Y2FsY3xhdHRyKSc7XG5jb25zdCBGTl9BUkdTID0gJ1xcXFwoWy0wLTkuJSwgI2EtekEtWl0rXFxcXCknO1xuY29uc3QgU0FGRV9TVFlMRV9WQUxVRSA9IG5ldyBSZWdFeHAoXG4gICAgYF4oJHtWQUxVRVN9fGAgK1xuICAgICAgICBgKD86JHtUUkFOU0ZPUk1BVElPTl9GTlN9fCR7Q09MT1JfRk5TfXwke0dSQURJRU5UU318JHtDU1MzX0ZOU30pYCArXG4gICAgICAgIGAke0ZOX0FSR1N9KSRgLFxuICAgICdnJyk7XG5cbi8qKlxuICogTWF0Y2hlcyBhIGB1cmwoLi4uKWAgdmFsdWUgd2l0aCBhbiBhcmJpdHJhcnkgYXJndW1lbnQgYXMgbG9uZyBhcyBpdCBkb2VzXG4gKiBub3QgY29udGFpbiBwYXJlbnRoZXNlcy5cbiAqXG4gKiBUaGUgVVJMIHZhbHVlIHN0aWxsIG5lZWRzIHRvIGJlIHNhbml0aXplZCBzZXBhcmF0ZWx5LlxuICpcbiAqIGB1cmwoLi4uKWAgdmFsdWVzIGFyZSBhIHZlcnkgY29tbW9uIHVzZSBjYXNlLCBlLmcuIGZvciBgYmFja2dyb3VuZC1pbWFnZWAuIFdpdGggY2FyZWZ1bGx5IGNyYWZ0ZWRcbiAqIENTUyBzdHlsZSBydWxlcywgaXQgaXMgcG9zc2libGUgdG8gY29uc3RydWN0IGFuIGluZm9ybWF0aW9uIGxlYWsgd2l0aCBgdXJsYCB2YWx1ZXMgaW4gQ1NTLCBlLmcuXG4gKiBieSBvYnNlcnZpbmcgd2hldGhlciBzY3JvbGwgYmFycyBhcmUgZGlzcGxheWVkLCBvciBjaGFyYWN0ZXIgcmFuZ2VzIHVzZWQgYnkgYSBmb250IGZhY2VcbiAqIGRlZmluaXRpb24uXG4gKlxuICogQW5ndWxhciBvbmx5IGFsbG93cyBiaW5kaW5nIENTUyB2YWx1ZXMgKGFzIG9wcG9zZWQgdG8gZW50aXJlIENTUyBydWxlcyksIHNvIGl0IGlzIHVubGlrZWx5IHRoYXRcbiAqIGJpbmRpbmcgYSBVUkwgdmFsdWUgd2l0aG91dCBmdXJ0aGVyIGNvb3BlcmF0aW9uIGZyb20gdGhlIHBhZ2Ugd2lsbCBjYXVzZSBhbiBpbmZvcm1hdGlvbiBsZWFrLCBhbmRcbiAqIGlmIHNvLCBpdCBpcyBqdXN0IGEgbGVhaywgbm90IGEgZnVsbCBibG93biBYU1MgdnVsbmVyYWJpbGl0eS5cbiAqXG4gKiBHaXZlbiB0aGUgY29tbW9uIHVzZSBjYXNlLCBsb3cgbGlrZWxpaG9vZCBvZiBhdHRhY2sgdmVjdG9yLCBhbmQgbG93IGltcGFjdCBvZiBhbiBhdHRhY2ssIHRoaXNcbiAqIGNvZGUgaXMgcGVybWlzc2l2ZSBhbmQgYWxsb3dzIFVSTHMgdGhhdCBzYW5pdGl6ZSBvdGhlcndpc2UuXG4gKi9cbmNvbnN0IFVSTF9SRSA9IC9edXJsXFwoKFteKV0rKVxcKSQvO1xuXG4vKipcbiAqIENoZWNrcyB0aGF0IHF1b3RlcyAoXCIgYW5kICcpIGFyZSBwcm9wZXJseSBiYWxhbmNlZCBpbnNpZGUgYSBzdHJpbmcuIEFzc3VtZXNcbiAqIHRoYXQgbmVpdGhlciBlc2NhcGUgKFxcKSBub3IgYW55IG90aGVyIGNoYXJhY3RlciB0aGF0IGNvdWxkIHJlc3VsdCBpblxuICogYnJlYWtpbmcgb3V0IG9mIGEgc3RyaW5nIHBhcnNpbmcgY29udGV4dCBhcmUgYWxsb3dlZDtcbiAqIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLXN5bnRheC8jc3RyaW5nLXRva2VuLWRpYWdyYW0uXG4gKlxuICogVGhpcyBjb2RlIHdhcyB0YWtlbiBmcm9tIHRoZSBDbG9zdXJlIHNhbml0aXphdGlvbiBsaWJyYXJ5LlxuICovXG5mdW5jdGlvbiBoYXNCYWxhbmNlZFF1b3Rlcyh2YWx1ZTogc3RyaW5nKSB7XG4gIGxldCBvdXRzaWRlU2luZ2xlID0gdHJ1ZTtcbiAgbGV0IG91dHNpZGVEb3VibGUgPSB0cnVlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYyA9IHZhbHVlLmNoYXJBdChpKTtcbiAgICBpZiAoYyA9PT0gJ1xcJycgJiYgb3V0c2lkZURvdWJsZSkge1xuICAgICAgb3V0c2lkZVNpbmdsZSA9ICFvdXRzaWRlU2luZ2xlO1xuICAgIH0gZWxzZSBpZiAoYyA9PT0gJ1wiJyAmJiBvdXRzaWRlU2luZ2xlKSB7XG4gICAgICBvdXRzaWRlRG91YmxlID0gIW91dHNpZGVEb3VibGU7XG4gICAgfVxuICB9XG4gIHJldHVybiBvdXRzaWRlU2luZ2xlICYmIG91dHNpZGVEb3VibGU7XG59XG5cbi8qKlxuICogU2FuaXRpemVzIHRoZSBnaXZlbiB1bnRydXN0ZWQgQ1NTIHN0eWxlIHByb3BlcnR5IHZhbHVlIChpLmUuIG5vdCBhbiBlbnRpcmUgb2JqZWN0LCBqdXN0IGEgc2luZ2xlXG4gKiB2YWx1ZSkgYW5kIHJldHVybnMgYSB2YWx1ZSB0aGF0IGlzIHNhZmUgdG8gdXNlIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9zYW5pdGl6ZVN0eWxlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSkudHJpbSgpOyAgLy8gTWFrZSBzdXJlIGl0J3MgYWN0dWFsbHkgYSBzdHJpbmcuXG4gIGlmICghdmFsdWUpIHJldHVybiAnJztcblxuICAvLyBTaW5nbGUgdXJsKC4uLikgdmFsdWVzIGFyZSBzdXBwb3J0ZWQsIGJ1dCBvbmx5IGZvciBVUkxzIHRoYXQgc2FuaXRpemUgY2xlYW5seS4gU2VlIGFib3ZlIGZvclxuICAvLyByZWFzb25pbmcgYmVoaW5kIHRoaXMuXG4gIGNvbnN0IHVybE1hdGNoID0gdmFsdWUubWF0Y2goVVJMX1JFKTtcbiAgaWYgKCh1cmxNYXRjaCAmJiBfc2FuaXRpemVVcmwodXJsTWF0Y2hbMV0pID09PSB1cmxNYXRjaFsxXSkgfHxcbiAgICAgIHZhbHVlLm1hdGNoKFNBRkVfU1RZTEVfVkFMVUUpICYmIGhhc0JhbGFuY2VkUXVvdGVzKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTsgIC8vIFNhZmUgc3R5bGUgdmFsdWVzLlxuICB9XG5cbiAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgICBgV0FSTklORzogc2FuaXRpemluZyB1bnNhZmUgc3R5bGUgdmFsdWUgJHt2YWx1ZX0gKHNlZSBodHRwOi8vZy5jby9uZy9zZWN1cml0eSN4c3MpLmApO1xuICB9XG5cbiAgcmV0dXJuICd1bnNhZmUnO1xufVxuIl19