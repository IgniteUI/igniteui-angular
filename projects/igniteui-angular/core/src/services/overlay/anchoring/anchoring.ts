import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

/**
 * Selects how `IgxOverlayService` positions overlays.
 *
 * - `'auto'` - native CSS anchor positioning where the browser supports it, script positioning elsewhere.
 * - `'script'` - script positioning for every overlay, as before 22.4.
 */
export type OverlayAnchoringMode = 'auto' | 'script';

/** @hidden @internal */
export const IGX_OVERLAY_ANCHORING = new InjectionToken<OverlayAnchoringMode>('IGX_OVERLAY_ANCHORING');

/**
 * Configures how `IgxOverlayService` positions overlays.
 *
 * With `'auto'` (the default), overlays that use `ConnectedPositioningStrategy`, `AutoPositionStrategy`
 * or `ContainerPositionStrategy` are positioned with native CSS anchor positioning where the browser
 * supports it. With `'script'`, every overlay is positioned by script, as before 22.4.
 *
 * Takes effect only in the root environment injector (`bootstrapApplication` / `appConfig.providers`).
 * In the providers of a lazy route it has no effect, because the root `IgxOverlayService` already exists.
 *
 * @param mode `'auto'` or `'script'`.
 * @returns Environment providers to add to the application providers.
 *
 * @example
 * ```typescript
 * bootstrapApplication(AppComponent, {
 *     providers: [provideOverlayAnchoring('script')]
 * });
 * ```
 */
export function provideOverlayAnchoring(mode: OverlayAnchoringMode): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: IGX_OVERLAY_ANCHORING, useValue: mode }]);
}

/**
 * @hidden @internal
 * Whether the window supports every CSS anchor positioning feature the native engine writes.
 */
export function supportsNativeAnchoring(win: (Window & typeof globalThis) | null | undefined): boolean {
    const css = win?.CSS;
    if (typeof css?.supports !== 'function') {
        return false;
    }
    return css.supports('anchor-name', '--igx-probe')
        && css.supports('position-anchor', '--igx-probe')
        && css.supports('position-area', 'bottom span-right')
        && css.supports('position-try-fallbacks', 'flip-block, flip-inline')
        && css.supports('top', 'anchor(top)')
        && css.supports('justify-self', 'anchor-center')
        // Connected overlays rely on `unsafe` overflow alignment so that they never shift.
        // DISCUSS(#17765): verified in Chromium only. If Firefox 147+ or Safari 26 lack `unsafe anchor-center`,
        // this probe turns off the whole native engine there, not only Connected. Alternative: probe it
        // separately and let Connected fall back to plain alignment (content could then shift).
        && css.supports('justify-self', 'unsafe anchor-center');
}

/** @hidden @internal The `position-visibility` value that hides content while its anchor is clipped. */
export type AnchorVisibleKeyword = 'anchor-visible' | 'anchors-visible';

/**
 * @hidden @internal
 * The `position-visibility` keyword the window supports for hiding content with a clipped anchor, or `null`.
 * The CSSWG renamed `anchors-visible` to `anchor-visible` (Chrome 157+, Safari 27+); the plural is a legacy
 * alias that browsers serialize to the new name, and the only spelling older browsers know.
 */
export function anchorVisibleKeyword(win: (Window & typeof globalThis) | null | undefined): AnchorVisibleKeyword | null {
    const css = win?.CSS;
    if (typeof css?.supports !== 'function') {
        return null;
    }
    if (css.supports('position-visibility', 'anchor-visible')) {
        return 'anchor-visible';
    }
    return css.supports('position-visibility', 'anchors-visible') ? 'anchors-visible' : null;
}
