import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IgxRowDirective } from '../row.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-row',
    templateUrl: './grid-row.component.html'
})
export class IgxGridRowComponent extends IgxRowDirective<any> {

    public getContext(col, row) {
        return {
            $implicit: col,
            row
        };
    }

    public get mrlRightPinnedOffset(): string {
        return !this.grid.isPinningToStart ?
            - this.grid.pinnedWidth - this.grid.headerFeaturesWidth + 'px' :
            null;
    }

    public getContextMRL(pinnedCols, row) {
        return {
            $implicit: pinnedCols,
            row
        };
    }
}
