import { Component, Input, HostBinding } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxColumnComponent } from '../grid';

@Component({
    selector: 'igx-grid-summary-cell',
    templateUrl: './summary-cell.component.html'
})
export class IgxSummaryCellComponent {

    @Input()
    public summaryResults: IgxSummaryResult[];

    @Input()
    public column: IgxColumnComponent;

    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = [];
        const classList = {
            'igx-grid-summary--fw': this.column.width !== null,
            'igx-grid-summary--empty': !this.column.hasSummary,
            'igx-grid-summary--compact': this.grid.isCompact(),
            'igx-grid-summary--cosy': this.grid.isCosy(),
            'igx-grid-summary': this.grid.isComfortable(),
            'igx-grid-summary--pinned': this.column.pinned,
            'igx-grid-summary--pinned-last': this.column.isLastPinned
        };
        Object.entries(classList).forEach(([className, value]) => {
            if (value) {
                defaultClasses.push(className);
            }
        });
        return defaultClasses.join(' ');
    }

    @Input()
    @HostBinding('attr.data-rowIndex')
    public rowIndex: number;

    @HostBinding('attr.data-visibleIndex')
    get visibleColumnIndex(): number {
        return this.column.visibleIndex;
    }

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    get columnDatatype() {
        return this.column.dataType;
    }

    get itemHeight() {
        return this.column.grid.defaultRowHeight;
    }

    get grid() {
        return this.column.grid;
    }
}
