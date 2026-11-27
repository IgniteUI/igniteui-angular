import { PositionSettings, Util } from '../utilities';
import { GlobalPositionStrategy } from './global-position-strategy';

/**
 * Positions the element inside the containing outlet based on the directions passed in trough PositionSettings.
 * These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection
 */
export class ContainerPositionStrategy extends GlobalPositionStrategy {
    // DISCUSS(#17765): `vkombov/fix-17986` (#17986) removes this observer and the top-layer wrapper for
    // Container overlays. The #16988 guard and `applyLayout()` below then become unnecessary; this file
    // conflicts with that branch.
    private io: IntersectionObserver | null = null;
    private _disposed = false;
    constructor(settings?: PositionSettings) {
        super(settings);
    }

    /**
     * Position the element based on the PositionStrategy implementing this interface.
     */
    public override position(contentElement: HTMLElement): void {
        // Set up intersection observer
        this.io?.disconnect();
        this._disposed = false;
        const containerElement = contentElement.parentElement!.parentElement;
        if (!containerElement) {
            super.position(contentElement);
            return;
        }
        this.io = Util.setupIntersectionObserver(
            containerElement,
            contentElement.ownerDocument,
            () => {
                if (!this._disposed && contentElement.parentElement) {
                    this.updatePosition(contentElement, containerElement);
                }
            }
        );
        this.internalPosition(contentElement, containerElement);
    }

    /**
     * Disposes the observer and cleans up references.
     */
    public dispose(): void {
        this._disposed = true;
        this.io?.disconnect();
        this.io = null;
    }

    /**
     * @hidden @internal
     * Applies the classes and flex alignment that place the content inside the wrapper,
     * without sizing the wrapper. Used by the native anchoring engine, which sizes the wrapper with CSS.
     *
     * @param contentElement The overlay content element.
     */
    public applyLayout(contentElement: HTMLElement): void {
        contentElement.classList.add('igx-overlay__content--relative');
        contentElement.parentElement!.classList.add('igx-overlay__wrapper--flex-container');
        this.setPosition(contentElement);
    }

    private internalPosition(contentElement: HTMLElement, container: HTMLElement): void {
        this.applyLayout(contentElement);
        this.updatePosition(contentElement, container);
    }

    private updatePosition(contentElement: HTMLElement, container: HTMLElement): void {
        if (!container || !contentElement.parentElement)
            return;

        // TODO: consider using new anchor() CSS function when it becomes more widely
        // supported: https://caniuse.com/mdn-css_properties_anchor
        const containerRect = container.getBoundingClientRect();
        contentElement.parentElement!.style.width = `${containerRect.width}px`;
        contentElement.parentElement!.style.height = `${containerRect.height}px`;
        contentElement.parentElement!.style.top = `${containerRect.top}px`;
        contentElement.parentElement!.style.left = `${containerRect.left}px`;
    }
}
