import { DOCUMENT, DestroyRef, ElementRef, Injectable, NgZone, PLATFORM_ID, inject, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getTabbableElements, isTabbable } from '../tabbable';
import { tabKey } from './keys';

/**
 * The configuration of an {@link IgxSingleTabStopService}.
 *
 * @hidden @internal
 */
export interface IgxSingleTabStopOptions {
    /**
     * The element that the focus moves to when Tab or Shift+Tab enters the
     * host, such as the active item. Without one, the focus stays where the
     * key lands.
     */
    tabStop: () => HTMLElement | null | undefined;
    /** Whether the service handles the Tab key. Defaults to always. */
    when?: () => boolean;
}

/**
 * Makes the host a single stop of the Tab sequence, whatever its content.
 *
 * @remarks
 * Tab and Shift+Tab from anywhere in the host leave it: the service moves the
 * focus to the last tabbable element of the host, or the first one, and lets
 * the browser move it on from there. It never changes the `tabindex` of the
 * content, so the controls inside the host keep their own, and it leaves a
 * Tab that an inner element handled.
 *
 * When Tab or Shift+Tab moves the focus into the host from outside, the
 * service moves it on to the tab stop. A focus from a click, from the app or
 * from assistive technology stays where it is.
 *
 * List it in the `providers` of the component or directive and call
 * {@link configure} once. The host manages the `tabindex` of its tab stop.
 *
 * @hidden @internal
 */
@Injectable()
export class IgxSingleTabStopService {
    private readonly _host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly _document = inject(DOCUMENT);
    private readonly _zone = inject(NgZone);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    private _options?: IgxSingleTabStopOptions;
    /** Whether the current focus change comes from a Tab key press. */
    private _tabbing = false;

    /**
     * Configures the tab stop and starts handling the Tab key. Call it once.
     *
     * @param options - The element that the focus moves to when it enters the host.
     * @returns The service, for chaining.
     *
     * @example
     * ```typescript
     * inject(IgxSingleTabStopService).configure({ tabStop: () => this.activeItem?.element });
     * ```
     */
    public configure(options: IgxSingleTabStopOptions): this {
        if (this._options) {
            if (isDevMode()) {
                throw new Error('IgxSingleTabStopService: configure() was already called for this element.');
            }
            return this;
        }
        this._options = options;

        if (this._isBrowser) {
            const controller = new AbortController();
            const { signal } = controller;
            this._zone.runOutsideAngular(() => {
                this._host.addEventListener('keydown', this._onKeydown, { signal });
                this._host.addEventListener('focusin', this._onFocusIn, { signal });
                // Capture sees the key before the focus moves, also from outside the host.
                this._document.addEventListener('keydown', this._onDocumentKeydown, { capture: true, signal });
            });
            this._destroyRef.onDestroy(() => controller.abort());
        }

        return this;
    }

    private readonly _onDocumentKeydown = (event: KeyboardEvent): void => {
        if (event.key === tabKey) {
            this._tabbing = true;
            // The focus moves in the same task as the key press.
            setTimeout(() => (this._tabbing = false));
        }
    };

    private readonly _onKeydown = (event: KeyboardEvent): void => {
        if (event.key !== tabKey || event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey
            || this._options!.when?.() === false) {
            return;
        }

        const target = event.shiftKey ? this._firstStop() : getTabbableElements(this._host).at(-1);
        const active = (this._host.getRootNode() as Document | ShadowRoot).activeElement;

        // The browser moves the focus on from there, out of the host.
        if (target && target !== active) {
            target.focus({ preventScroll: true });
        }
    };

    private readonly _onFocusIn = (event: FocusEvent): void => {
        const from = event.relatedTarget as Node | null;
        if (!this._tabbing || (from && this._host.contains(from)) || this._options!.when?.() === false) {
            return;
        }

        const tabStop = this._options!.tabStop();
        if (tabStop && tabStop !== event.composedPath()[0]) {
            tabStop.focus();
        }
    };

    /** The element that Shift+Tab leaves from: the host when it is in the tab order, else its first tabbable element. */
    private _firstStop(): HTMLElement | undefined {
        return isTabbable(this._host) ? this._host : getTabbableElements(this._host)[0];
    }
}
