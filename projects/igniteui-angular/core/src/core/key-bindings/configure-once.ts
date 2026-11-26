import { isDevMode } from '@angular/core';

/**
 * Whether a service may apply its configuration: only the first `configure()` call does. A second call throws in
 * dev mode and is ignored otherwise.
 *
 * @param configured - Whether the service was configured already.
 * @param service - The name of the service, for the error.
 * @param hint - Extra text for the error.
 * @returns `true` for the first call.
 *
 * @example
 * ```typescript
 * if (!canConfigure(!!this._options, 'IgxRovingFocusService')) {
 *     return this;
 * }
 * ```
 *
 * @hidden @internal
 */
export function canConfigure(configured: boolean, service: string, hint = ''): boolean {
    if (configured && isDevMode()) {
        throw new Error(`${service}: configure() was already called for this element.${hint}`);
    }
    return !configured;
}
