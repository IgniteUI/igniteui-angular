import { Directive } from '@angular/core';
import { ConnectedPositioningStrategy } from 'igniteui-angular/core';
import { VerticalAlignment, PositionSettings, Point } from 'igniteui-angular/core';
import { IgxForOfSyncService } from 'igniteui-angular/directives';
import { scaleInVerBottom, scaleInVerTop } from 'igniteui-angular/animations';


@Directive({
    selector: '[igxGridBody]',
    providers: [IgxForOfSyncService],
    standalone: true
})
export class IgxGridBodyDirective { }


/**
 * @hidden
 */
export interface RowEditPositionSettings extends PositionSettings {
    container?: HTMLElement;
}

/**
 * @hidden
 */
export class RowEditPositionStrategy extends ConnectedPositioningStrategy {
    public isTop = false;
    public isTopInitialPosition = null;
    public override settings: RowEditPositionSettings;
    private intersectionObserver: IntersectionObserver | null = null;
    private previousRect: DOMRect | null = null;
    private contentElement: HTMLElement | null = null;
    private sizeConfig: { width: number; height: number } | null = null;
    private targetElement: HTMLElement | null = null;
    private document: Document | null = null;
    private updateFrameId: number | null = null;

    public override position(contentElement: HTMLElement, _size: { width: number; height: number }, document?: Document, initialCall?: boolean,
        target?: Point | HTMLElement): void {
        const container = this.settings.container; // grid.tbody
        const targetElement: HTMLElement = target as HTMLElement; // current grid.row

        // Position of the overlay depends on the available space in the grid.
        // If the bottom space is not enough then the the row overlay will show at the top of the row.
        // Once shown, either top or bottom, then this position stays until the overlay is closed (isTopInitialPosition property),
        // which means that when scrolling then overlay may hide, while the row is still visible (UX requirement).
        this.isTop = this.isTopInitialPosition !== null ?
            this.isTopInitialPosition :
            container.getBoundingClientRect().bottom <
            targetElement.getBoundingClientRect().bottom + contentElement.getBoundingClientRect().height;

        // Set width of the row editing overlay to equal row width, otherwise it fits 100% of the grid.
        contentElement.style.width = targetElement.clientWidth + 'px';
        this.settings.verticalStartPoint = this.settings.verticalDirection = this.isTop ? VerticalAlignment.Top : VerticalAlignment.Bottom;
        this.settings.openAnimation = this.isTop ? scaleInVerBottom : scaleInVerTop;

        super.position(contentElement, { width: targetElement.clientWidth, height: targetElement.clientHeight },
            document, initialCall, targetElement);

        this.setupIntersectionObserver(contentElement, { width: targetElement.clientWidth, height: targetElement.clientHeight }, document, targetElement);
    }

    private setupIntersectionObserver(contentElement: HTMLElement, sizeConfig: { width: number; height: number }, doc?: Document, target?: HTMLElement): void {
        if (!target || !doc || !(target instanceof HTMLElement))
            return;

        // Store references for repositioning
        this.contentElement = contentElement;
        this.sizeConfig = sizeConfig;
        this.targetElement = target;
        this.document = doc;

        // Only set up observer once - don't recreate it on every position() call
        if (this.intersectionObserver) {
            return;
        }

        // Store initial position
        this.previousRect = target.getBoundingClientRect();

        // Set up IntersectionObserver to trigger position checks
        // Use rootMargin to detect when element enters/exits observable area
        this.intersectionObserver = new IntersectionObserver(
            (_entries) => {
                // When IntersectionObserver detects visibility change, start continuous polling
                this.startPositionUpdateLoop();
            },
            {
                root: null,
                rootMargin: '0px', // Expand detection area to catch layout shifts
                threshold: [1] // Detect when element becomes partially or fully visible
            }
        );

        this.intersectionObserver.observe(target);
    }

    private startPositionUpdateLoop(): void {
        // Clear any existing frame
        if (this.updateFrameId !== null) {
            return;
        }

        const checkAndUpdate = () => {
            if (!this.targetElement || !this.contentElement || !this.document || !this.sizeConfig) {
                this.updateFrameId = null;
                return;
            }

            // Check if target has actually moved
            const currentRect = this.targetElement.getBoundingClientRect();
            if (this.previousRect &&
                (currentRect.top !== this.previousRect.top ||
                    currentRect.left !== this.previousRect.left ||
                    currentRect.width !== this.previousRect.width ||
                    currentRect.height !== this.previousRect.height)) {
                // Element has moved - update stored position and reposition the overlay
                this.previousRect = currentRect;
                this.position(
                    this.contentElement,
                    this.sizeConfig,
                    this.document,
                    false,
                    this.targetElement
                );
            }

            // Continue polling while element is visible
            this.updateFrameId = requestAnimationFrame(checkAndUpdate);
        };

        this.updateFrameId = requestAnimationFrame(checkAndUpdate);
    }

    /**
     * Cleans up the IntersectionObserver and stored references
     */
    public dispose(): void {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }

        if (this.updateFrameId !== null) {
            cancelAnimationFrame(this.updateFrameId);
            this.updateFrameId = null;
        }

        this.contentElement = null;
        this.sizeConfig = null;
        this.targetElement = null;
        this.document = null;
    }
}
