import { Component, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { IgxRowDirective } from '../row.directive';

/* blazorIndirectRender */
/* blazorElement */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-row',
    templateUrl: './grid-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxGridRowComponent) }]
})
export class IgxGridRowComponent extends IgxRowDirective {

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
