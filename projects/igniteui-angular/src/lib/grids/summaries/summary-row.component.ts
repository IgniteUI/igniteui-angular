import { Component, Input, ViewChild, ElementRef, HostBinding } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxSummaryResult } from './grid-summary';
import { IgxGridBaseComponent } from '../grid-base.component';
import { IgxColumnComponent } from '../column.component';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';

@Component({
    selector: 'igx-grid-summary-row',
    templateUrl: './summary-row.component.html'
})
export class IgxSummaryRowComponent {

    @Input()
    public summaries: Map<string, IgxSummaryResult[]>;

    @Input()
    public gridID;

    @Input()
    public index: number;

    @HostBinding('attr.data-rowIndex')
    get dataRowIndex() {
        return this.index;
    }

    /**
     * @hidden
     */
    @ViewChild('igxDirRef', { read: IgxGridForOfDirective })
    public virtDirRow: IgxGridForOfDirective<any>;

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
                public element: ElementRef) {}

    public get grid() {
        return this.gridAPI.get(this.gridID);
    }
    public get nativeElement() {
        return this.element.nativeElement;
    }

    public getColumnSummaries(columnName) {
        if (!this.summaries.get(columnName)) {
            return [];
        }
        return this.summaries.get(columnName);

    }
    /**
     * @hidden
     */
    public notGroups(columns) {
        return columns.filter(c => !c.columnGroup);
    }
    /**
     * @hidden
     */
    public get pinnedColumns(): IgxColumnComponent[] {
        return this.grid.pinnedColumns;
    }

    /**
     * @hidden
     */
    public get unpinnedColumns(): IgxColumnComponent[] {
        return this.grid.unpinnedColumns;
    }
}
