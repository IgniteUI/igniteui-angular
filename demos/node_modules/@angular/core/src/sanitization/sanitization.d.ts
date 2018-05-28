/**
 * A branded trusted string used with sanitization.
 *
 * See: {@link TrustedHtmlString}, {@link TrustedResourceUrlString}, {@link TrustedScriptString},
 * {@link TrustedStyleString}, {@link TrustedUrlString}
 */
export interface TrustedString extends String {
    '__SANITIZER_TRUSTED_BRAND__': 'Html' | 'Style' | 'Script' | 'Url' | 'ResourceUrl';
}
/**
 * A branded trusted string used with sanitization of `html` strings.
 *
 * See: {@link bypassSanitizationTrustHtml} and {@link htmlSanitizer}.
 */
export interface TrustedHtmlString extends TrustedString {
    '__SANITIZER_TRUSTED_BRAND__': 'Html';
}
/**
 * A branded trusted string used with sanitization of `style` strings.
 *
 * See: {@link bypassSanitizationTrustStyle} and {@link styleSanitizer}.
 */
export interface TrustedStyleString extends TrustedString {
    '__SANITIZER_TRUSTED_BRAND__': 'Style';
}
/**
 * A branded trusted string used with sanitization of `url` strings.
 *
 * See: {@link bypassSanitizationTrustScript} and {@link scriptSanitizer}.
 */
export interface TrustedScriptString extends TrustedString {
    '__SANITIZER_TRUSTED_BRAND__': 'Script';
}
/**
 * A branded trusted string used with sanitization of `url` strings.
 *
 * See: {@link bypassSanitizationTrustUrl} and {@link urlSanitizer}.
 */
export interface TrustedUrlString extends TrustedString {
    '__SANITIZER_TRUSTED_BRAND__': 'Url';
}
/**
 * A branded trusted string used with sanitization of `resourceUrl` strings.
 *
 * See: {@link bypassSanitizationTrustResourceUrl} and {@link resourceUrlSanitizer}.
 */
export interface TrustedResourceUrlString extends TrustedString {
    '__SANITIZER_TRUSTED_BRAND__': 'ResourceUrl';
}
/**
 * An `html` sanitizer which converts untrusted `html` **string** into trusted string by removing
 * dangerous content.
 *
 * This method parses the `html` and locates potentially dangerous content (such as urls and
 * javascript) and removes it.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustHtml}.
 *
 * @param unsafeHtml untrusted `html`, typically from the user.
 * @returns `html` string which is safe to display to user, because all of the dangerous javascript
 * and urls have been removed.
 */
export declare function sanitizeHtml(unsafeHtml: any): string;
/**
 * A `style` sanitizer which converts untrusted `style` **string** into trusted string by removing
 * dangerous content.
 *
 * This method parses the `style` and locates potentially dangerous content (such as urls and
 * javascript) and removes it.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustStyle}.
 *
 * @param unsafeStyle untrusted `style`, typically from the user.
 * @returns `style` string which is safe to bind to the `style` properties, because all of the
 * dangerous javascript and urls have been removed.
 */
export declare function sanitizeStyle(unsafeStyle: any): string;
/**
 * A `url` sanitizer which converts untrusted `url` **string** into trusted string by removing
 * dangerous
 * content.
 *
 * This method parses the `url` and locates potentially dangerous content (such as javascript) and
 * removes it.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustUrl}.
 *
 * @param unsafeUrl untrusted `url`, typically from the user.
 * @returns `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * all of the dangerous javascript has been removed.
 */
export declare function sanitizeUrl(unsafeUrl: any): string;
/**
 * A `url` sanitizer which only lets trusted `url`s through.
 *
 * This passes only `url`s marked trusted by calling {@link bypassSanitizationTrustResourceUrl}.
 *
 * @param unsafeResourceUrl untrusted `url`, typically from the user.
 * @returns `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * only trusted `url`s have been allowed to pass.
 */
export declare function sanitizeResourceUrl(unsafeResourceUrl: any): string;
/**
 * A `script` sanitizer which only lets trusted javascript through.
 *
 * This passes only `script`s marked trusted by calling {@link bypassSanitizationTrustScript}.
 *
 * @param unsafeScript untrusted `script`, typically from the user.
 * @returns `url` string which is safe to bind to the `<script>` element such as `<img src>`,
 * because only trusted `scripts`s have been allowed to pass.
 */
export declare function sanitizeScript(unsafeScript: any): string;
/**
 * Mark `html` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link htmlSanitizer} to be trusted implicitly.
 *
 * @param trustedHtml `html` string which needs to be implicitly trusted.
 * @returns a `html` `String` which has been branded to be implicitly trusted.
 */
export declare function bypassSanitizationTrustHtml(trustedHtml: string): TrustedHtmlString;
/**
 * Mark `style` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link styleSanitizer} to be trusted implicitly.
 *
 * @param trustedStyle `style` string which needs to be implicitly trusted.
 * @returns a `style` `String` which has been branded to be implicitly trusted.
 */
export declare function bypassSanitizationTrustStyle(trustedStyle: string): TrustedStyleString;
/**
 * Mark `script` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link scriptSanitizer} to be trusted implicitly.
 *
 * @param trustedScript `script` string which needs to be implicitly trusted.
 * @returns a `script` `String` which has been branded to be implicitly trusted.
 */
export declare function bypassSanitizationTrustScript(trustedScript: string): TrustedScriptString;
/**
 * Mark `url` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link urlSanitizer} to be trusted implicitly.
 *
 * @param trustedUrl `url` string which needs to be implicitly trusted.
 * @returns a `url` `String` which has been branded to be implicitly trusted.
 */
export declare function bypassSanitizationTrustUrl(trustedUrl: string): TrustedUrlString;
/**
 * Mark `url` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link resourceUrlSanitizer} to be trusted implicitly.
 *
 * @param trustedResourceUrl `url` string which needs to be implicitly trusted.
 * @returns a `url` `String` which has been branded to be implicitly trusted.
 */
export declare function bypassSanitizationTrustResourceUrl(trustedResourceUrl: string): TrustedResourceUrlString;
