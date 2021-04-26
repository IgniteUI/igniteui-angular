import { Component, forwardRef, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { IgxRowDirective } from '../row.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-row',
    templateUrl: './grid-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxGridRowComponent) }]
})
export class IgxGridRowComponent extends IgxRowDirective<IgxGridComponent> {

    @HostBinding('class.igx-grid__tr--mrl')
    public get hasColumnLayouts(): boolean {
        return this.grid.hasColumnLayouts;
    }

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
