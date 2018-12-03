import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, DoCheck, HostBinding, Input
} from '@angular/core';
import { DataType } from '../data-operations/data-util';
import { GridBaseAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { IgxGridBaseComponent } from './grid-base.component';
import { IgxSummaryResult } from './grid-summary';
/**
 *@hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-summary',
    templateUrl: './grid-summary.component.html'
})
export class IgxGridSummaryComponent implements DoCheck {

    fieldName: string;

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    @HostBinding('class.igx-grid-summary--fw')
    get widthPersistenceClass(): boolean {
        return this.column.width !== null;
    }

    @HostBinding('class.igx-grid-summary--pinned')
    get isPinned() {
        return this.column.pinned;
    }

    @HostBinding('class.igx-grid-summary--pinned-last')
    get isLastPinned() {
        const pinnedCols = this.gridAPI.get(this.gridID).pinnedColumns;
        if (pinnedCols.length === 0) {
            return false;
        } else {
            return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
        }
    }

    @HostBinding('class.igx-grid-summary--empty')
    get emptyClass(): boolean {
        return !this.column.hasSummary;
    }

    @HostBinding('style.min-width')
    @HostBinding('style.flex-basis')
    get width() {
        return this.column.width;
    }

    @HostBinding('class.igx-grid-summary--compact')
    get compactCSS() {
        return this.gridAPI.get(this.gridID).isCompact();
    }

    @HostBinding('class.igx-grid-summary--cosy')
    get cosyCSS() {
        return this.gridAPI.get(this.gridID).isCosy();
    }

    @HostBinding('class.igx-grid-summary')
    get defaultCSS() {
        return this.gridAPI.get(this.gridID).isComfortable();
    }

    get dataType(): DataType {
        return this.column.dataType;
    }
    public summaryItemHeight;
    public itemClass = 'igx-grid-summary__item';

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseComponent>, public cdr: ChangeDetectorRef) { }

    ngDoCheck() {
        this.summaryItemHeight = this.gridAPI.get(this.gridID).defaultRowHeight;
        this.cdr.detectChanges();
    }

    public translateSummary(summary: IgxSummaryResult): string {
        return this.gridAPI.get(this.gridID).resourceStrings[`igx_grid_summary_${summary.key}`] || summary.label;
    }

    get resolveSummaries(): any[] {
        if (this.fieldName) {
            const field = this.fieldName;
            this.fieldName = null;
            this.gridAPI.set_summary_by_column_name(this.gridID, field);
            if (this.column.field === field) {
                return this.gridAPI.get_summaries(this.gridID).get(field);
            } else {
                return this.gridAPI.get_summaries(this.gridID).get(this.column.field);
            }
        } else {
            this.gridAPI.set_summary_by_column_name(this.gridID, this.column.field);
            return this.gridAPI.get_summaries(this.gridID).get(this.column.field);
        }
    }
}
