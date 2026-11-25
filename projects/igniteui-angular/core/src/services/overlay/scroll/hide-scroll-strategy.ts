import { AbsoluteScrollStrategy } from './absolute-scroll-strategy';

/**
 * Hides the overlay content while its anchor element is scrolled out of view and shows it again
 * when the anchor returns. The overlay stays open. Under the script engine it also repositions
 * the content on scroll, like `AbsoluteScrollStrategy`.
 *
 * The anchor element is the overlay target, or the container for `ContainerPositionStrategy`.
 * Without an anchor element (a `Point` target, `GlobalPositionStrategy`) it behaves as `AbsoluteScrollStrategy`.
 *
 * @param scrollContainer Optional element whose scroll events reposition the content under the script engine.
 *
 * @example
 * ```typescript
 * const settings: OverlaySettings = {
 *     target: button,
 *     positionStrategy: new AutoPositionStrategy(),
 *     scrollStrategy: new HideScrollStrategy()
 * };
 * ```
 */
// DISCUSS(#17765): Container behavior depends on #17986. Once Container overlays render inside their
// container (not in the top layer), `position-visibility` no longer applies to the wrapper (H8) and the
// container already clips them. Decide whether Hide does anything for Container then.
export class HideScrollStrategy extends AbsoluteScrollStrategy {
    private _observer: IntersectionObserver | null = null;
    private _content: HTMLElement | null = null;

    constructor(scrollContainer?: HTMLElement) {
        super(scrollContainer);
    }

    /**
     * @hidden @internal
     * Called by the overlay service after it positions the content in `show()`.
     *
     * @param anchor The element whose visibility controls the content, or `null`.
     * @param content The overlay content element.
     * @param useObserver `false` when the browser hides the content through `position-visibility`.
     */
    public _onShown(anchor: HTMLElement | null, content: HTMLElement, useObserver: boolean): void {
        this._onHidden();
        const Observer = content.ownerDocument.defaultView?.IntersectionObserver;
        if (!anchor || !useObserver || !Observer) {
            return;
        }
        this._content = content;
        this._observer = new Observer(entries => {
            content.style.visibility = entries[entries.length - 1].isIntersecting ? '' : 'hidden';
        }, { threshold: 0 });
        this._observer.observe(anchor);
    }

    /**
     * @hidden @internal
     * Called by the overlay service when the overlay closes, and by `detach()`.
     */
    public _onHidden(): void {
        this._observer?.disconnect();
        this._observer = null;
        if (this._content) {
            this._content.style.visibility = '';
            this._content = null;
        }
    }

    /**
     * Detaches the strategy.
     *
     * @example
     * ```typescript
     * settings.scrollStrategy.detach();
     * ```
     */
    public override detach(): void {
        this._onHidden();
        super.detach();
    }
}
