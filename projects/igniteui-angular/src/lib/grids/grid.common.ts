import { Directive } from '@angular/core';
import { ConnectedPositioningStrategy } from '../services/public_api';
import { VerticalAlignment, PositionSettings, Point } from '../services/overlay/utilities';
import { scaleInVerBottom, scaleInVerTop } from '../animations/main';
import { IgxForOfSyncService } from '../directives/for-of/for_of.sync.service';
import { ColumnPinningPosition, RowPinningPosition } from './common/enums';


@Directive({
    selector: '[igxGridBody]',
    providers: [IgxForOfSyncService]
})
export class IgxGridBodyDirective {}


/**
 * @hidden
 */
export interface RowEditPositionSettings extends PositionSettings {
    container?: HTMLElement;
}

/**
 * An interface describing settings for row/column pinning position.
 */
export interface IPinningConfig {
    columns?: ColumnPinningPosition;
    rows?: RowPinningPosition;
}

/**
 * @hidden
 */
export class RowEditPositionStrategy extends ConnectedPositioningStrategy {
    public isTop = false;
    public isTopInitialPosition = null;
    public settings: RowEditPositionSettings;
    public position(contentElement: HTMLElement, size: { width: number; height: number }, document?: Document, initialCall?: boolean,
            target?: Point | HTMLElement): void {
        const container = this.settings.container; // grid.tbody
        const targetElement: HTMLElement = target as HTMLElement || this.settings.target as HTMLElement; // current grid.row

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
}
