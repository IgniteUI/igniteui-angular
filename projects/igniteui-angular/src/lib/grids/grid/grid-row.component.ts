import { Component, forwardRef, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { IgxRowDirective } from '../row.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-row',
    templateUrl: './grid-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxGridRowComponent) }]
})
export class IgxGridRowComponent extends IgxRowDirective<IgxGridComponent> {

    @HostBinding('class.igx-grid__tr--mrl')
    get hasColumnLayouts(): boolean {
        return this.grid.hasColumnLayouts;
    }

    getContext(col, row) {
        return {
            $implicit: col,
            row
        };
    }

    get mrlRightPinnedOffset(): string {
        return !this.grid.isPinningToStart ?
            - this.grid.pinnedWidth - this.grid.headerFeaturesWidth + 'px' :
            null;
    }

    getContextMRL(pinnedCols, row) {
        return {
            $implicit: pinnedCols,
            row
        };
    }
}
