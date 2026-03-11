import { Directive } from '@angular/core';
import { ConnectedPositioningStrategy } from 'igniteui-angular/core';
import { VerticalAlignment, PositionSettings, Point, Util } from 'igniteui-angular/core';
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
    private io: IntersectionObserver | null = null;

    public override position(contentElement: HTMLElement, _size: { width: number; height: number }, document?: Document, initialCall?: boolean,
        target?: Point | HTMLElement): void {
        this.internalPosition(contentElement, _size, document, initialCall, target);
        // Use the IntersectionObserverHelper to manage position updates when the target moves
        this.io?.disconnect();
        const targetElement: HTMLElement = target as HTMLElement; // current grid.row
        this.io = Util.setupIntersectionObserver(
            targetElement,
            document,
            () => this.internalPosition(contentElement, { width: targetElement.clientWidth, height: targetElement.clientHeight }, document, false, targetElement)
        );
    }

    private internalPosition(contentElement: HTMLElement, _size: { width: number; height: number }, document?: Document, initialCall?: boolean,
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
    }

    /**
     * Cleans up the IntersectionObserver and stored references
     */
    public dispose(): void {
        this.io?.disconnect();
        this.io = null;
    }
}
