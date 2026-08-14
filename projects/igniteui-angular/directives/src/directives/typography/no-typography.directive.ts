import { Directive } from '@angular/core';

/**
 * @hidden @internal
 *
 * Opts the host element - and its entire subtree - out of the library's global
 * native h1-h6/p typography default (see core/src/core/styles/typography/_typography.scss).
 *
 * Compose it with `hostDirectives: [IgxNoTypographyDirective]` on any directive or component
 * whose class is styled with `type-style()` and can end up applied to (or wrapping) a native
 * heading/paragraph element supplied by a consumer, so that override reliably wins instead of
 * losing to the (unlayered) global default.
 */
@Directive({
    selector: '[igxNoTypography]',
    standalone: true,
    host: {
        'data-no-typography': ''
    }
})
export class IgxNoTypographyDirective { }
