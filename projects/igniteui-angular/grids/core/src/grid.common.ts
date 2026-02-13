import { Directive } from '@angular/core';
import { ConnectedPositioningStrategy, Util } from 'igniteui-angular/core';
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

        this.setupIntersectionObserver(contentElement, { width: targetElement.clientWidth, height: targetElement.clientHeight }, document, initialCall, targetElement);
    }

    private previousRect: DOMRect | null = null;

    private setupIntersectionObserver(contentElement: HTMLElement, _size: { width: number; height: number }, document?: Document, initialCall?: boolean,
        target?: Point | HTMLElement): void {
        // Clean up existing observer
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        if (!target || !document) {
            return;
        }

        const targetRect = (target as HTMLElement).getBoundingClientRect();
        console.log('Target Rect:', targetRect);
        const viewPortRect = Util.getViewportRect(document);
        const rootMarin = {
            top: -Math.floor(targetRect.top),
            bottom: -Math.floor(viewPortRect.height -targetRect.bottom),
            left: -Math.floor(targetRect.left),
            right: -Math.floor(viewPortRect.width - targetRect.right),
        };
        console.log('Root Margin:', rootMarin);

        // Create new IntersectionObserver to detect position changes
        this.intersectionObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                const rect = entry.boundingClientRect;
                // const rect = entry.target.getBoundingClientRect();
                if (this.previousRect) {
                    if (rect.top !== this.previousRect.top ||
                        rect.left !== this.previousRect.left ||
                        rect.width !== this.previousRect.width ||
                        rect.height !== this.previousRect.height) {
                        this.position(
                            contentElement,
                            { width: _size.width, height: _size.height },
                            document,
                            false,
                            target
                        );
                    }
                }
                this.previousRect = rect;
            }
        }, {
            root: null, // Observe relative to the viewport
            rootMargin: `${rootMarin.top}px ${rootMarin.right}px ${rootMarin.bottom}px ${rootMarin.left}px`,
            threshold: 1
        });

        this.intersectionObserver.observe(target as HTMLElement);
    }

    /**
     * Cleans up the IntersectionObserver and stored references
     */
    public dispose(): void {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }
        this.previousRect = null;
    }
}
