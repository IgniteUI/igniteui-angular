import {
    Directive, Input, HostBinding,
} from '@angular/core';
import { ConnectedPositioningStrategy } from '../services';
import { VerticalAlignment, PositionSettings } from '../services/overlay/utilities';
import { scaleInVerBottom, scaleInVerTop } from '../animations/main';
import { IgxForOfSyncService } from '../directives/for-of/for_of.sync.service';
import { ColumnType } from './common/column.interface';


@Directive({
    selector: '[igxGridBody]',
    providers: [IgxForOfSyncService]
})
export class IgxGridBodyDirective {}


@Directive({
    selector: '[igxGridMRLBlockStyle]'
})
export class IgxGridMRLBlockStyleDirective {

    @Input('igxGridMRLBlockStyle')
    column: ColumnType;

    @HostBinding('style.z-index')
    get zIndex() {
        return this.column.pinned ? 1 : null;
    }

    @HostBinding('class.igx-grid__td--pinned-last')
    get lastPinned() {
        return this.column.hasLastPinnedChildColumn;
    }

    @HostBinding('style.grid-template-rows')
    get templateRows() {
        return this.column.getGridTemplate(true, false);
    }

    @HostBinding('style.grid-template-columns')
    get templateColumns() {
        return this.column.getGridTemplate(false, false);
    }

    @HostBinding('style.-ms-grid-rows')
    get msTemplateRows() {
        return this.column.getGridTemplate(true, true);
    }

    @HostBinding('style.-ms-grid-columns')
    get msTemplateColumns() {
        return this.column.getGridTemplate(false, true);
    }
}

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
    isTop = false;
    isTopInitialPosition = null;
    public settings: RowEditPositionSettings;
    position(contentElement: HTMLElement, size: { width: number, height: number }, document?: Document, initialCall?: boolean): void {
        const container = this.settings.container; // grid.tbody
        const target = <HTMLElement>this.settings.target; // current grid.row

        // Position of the overlay depends on the available space in the grid.
        // If the bottom space is not enough then the the row overlay will show at the top of the row.
        // Once shown, either top or bottom, then this position stays until the overlay is closed (isTopInitialPosition property),
        // which means that when scrolling then overlay may hide, while the row is still visible (UX requirement).
        this.isTop = this.isTopInitialPosition !== null ?
            this.isTopInitialPosition :
            container.getBoundingClientRect().bottom <
                target.getBoundingClientRect().bottom + contentElement.getBoundingClientRect().height;

        // Set width of the row editing overlay to equal row width, otherwise it fits 100% of the grid.
        contentElement.style.width = target.clientWidth + 'px';
        this.settings.verticalStartPoint = this.settings.verticalDirection = this.isTop ? VerticalAlignment.Top : VerticalAlignment.Bottom;
        this.settings.openAnimation = this.isTop ? scaleInVerBottom : scaleInVerTop;

        super.position(contentElement, { width: target.clientWidth, height: target.clientHeight }, document, initialCall);
    }
}
