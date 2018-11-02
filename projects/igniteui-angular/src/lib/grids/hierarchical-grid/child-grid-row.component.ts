import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Input
} from '@angular/core';
import { IgxSelectionAPIService } from '../../core/selection';
import { GridBaseAPIService } from '.././api.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-child-grid-row',
    templateUrl: './child-grid-row.component.html'
})
export class IgxChildGridRowComponent {


        /**
     * Returns whether the row is expanded.
     * ```typescript
     * const RowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    public expanded = false;

    /**
     * @hidden
     */
    public get childData() {
        // figure out how to extract the key from child layout
        return this.rowData.childGridData;
    }


    /**
     *  The data passed to the row component.
     *
     * ```typescript
     * // get the row data for the first selected row
     * let selectedRowData = this.grid.selectedRows[0].rowData;
     * ```
     */
    @Input()
    public rowData: any = [];

    @Input()
    public layoutKey: any;

    /**
     * The index of the row.
     *
     * ```typescript
     * // get the index of the second selected row
     * let selectedRowIndex = this.grid.selectedRows[1].index;
     * ```
     */
    @Input()
    public index: number;

    /**
     * @hidden
     */
    @Input()
    public gridID: string;

    /**
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'row';

    /**
     * Get a reference to the grid that contains the selected row.
     *
     * ```typescript
     * handleRowSelection(event) {
     *  // the grid on which the onRowSelectionChange event was triggered
     *  const grid = event.row.grid;
     * }
     * ```
     *
     * ```html
     *  <igx-grid
     *    [data]="data"
     *    (onRowSelectionChange)="handleRowSelection($event)">
     *  </igx-grid>
     * ```
     */
    get grid(): IgxHierarchicalGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    /**
     * The native DOM element representing the row. Could be null in certain environments.
     *
     * ```typescript
     * // get the nativeElement of the second selected row
     * let selectedRowNativeElement = this.grid.selectedRows[1].nativeElement;
     * ```
     */
    get nativeElement() {
        return this.element.nativeElement;
    }

    constructor(public gridAPI: GridBaseAPIService<IgxHierarchicalGridComponent>,
                private selectionAPI: IgxSelectionAPIService,
                public element: ElementRef,
                public cdr: ChangeDetectorRef) { }


    /**
     * @hidden
     */
    notGroups(arr) {
        return arr.filter(c => !c.columnGroup);
    }
}
