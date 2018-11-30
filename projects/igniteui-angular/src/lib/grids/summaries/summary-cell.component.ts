import { Component, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxColumnComponent } from '../grid';
import { DisplayDensity } from '../../core/density';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-summary-cell',
    templateUrl: './summary-cell.component.html'
})
export class IgxSummaryCellComponent {

    @Input()
    public summaryResults: IgxSummaryResult[];

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public hasSummary = false;

    @Input()
    public density = DisplayDensity.comfortable;

    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = [];
        const classList = {
            'igx-grid-summary--fw': this.column.width !== null,
            'igx-grid-summary--empty': !this.column.hasSummary,
            'igx-grid-summary--compact': this.density === DisplayDensity.compact,
            'igx-grid-summary--cosy': this.density === DisplayDensity.cosy,
            'igx-grid-summary': this.density === DisplayDensity.comfortable,
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

    @HostBinding('attr.aria-describedby')
    public get describeby() {
        return `Summary_${this.column.field}`;
    }

    get columnDatatype() {
        return this.column.dataType;
    }

    get itemHeight() {
        return this.column.grid.defaultRowHeight;
    }

}
