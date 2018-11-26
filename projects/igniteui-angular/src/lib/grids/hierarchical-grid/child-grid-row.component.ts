import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnInit,
    ViewChild,
    AfterViewInit,
    SimpleChanges
} from '@angular/core';
import { IgxSelectionAPIService } from '../../core/selection';
import { GridBaseAPIService } from '.././api.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxHierarchicalGridAPIService } from './hierarchical-grid-api.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-child-grid-row',
    templateUrl: './child-grid-row.component.html'
})
export class IgxChildGridRowComponent implements AfterViewInit, OnInit {


        /**
     * Returns whether the row is expanded.
     * ```typescript
     * const RowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    public expanded = false;

    @Input()
    layout;

    /**
     * @hidden
     */
    public get childData() {
        return this.rowData.childGridData || this.hGrid.data;
    }

    /**
     * @hidden
     */
    // public get layout() {
    //     const layout = (this.gridAPI as IgxHierarchicalGridAPIService).getLayout(`igx-row-island-` + this.rowData.key);
    //    return layout;
    // }
     /**
     * @hidden
     */
    @Input()
    public parentGridID: string;

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

    @ViewChild('hgrid')
    private hGrid: IgxHierarchicalGridComponent;

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
    get parentGrid(): IgxHierarchicalGridComponent {
        return this.gridAPI.get(this.parentGridID);
    }


    get level() {
        return this.layout.level;
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
                public cdr: ChangeDetectorRef) {
                }


    /**
     * @hidden
     */
    notGroups(arr) {
        return arr.filter(c => !c.columnGroup);
    }

    private _handleLayoutChanges(changes: SimpleChanges) {
        for (const change in changes) {
            if (changes.hasOwnProperty(change)) {
                this.hGrid[change] = changes[change].currentValue;
            }
        }
    }

    ngOnInit() {
        this.layout.onLayoutChange.subscribe((ch) => {
            this._handleLayoutChanges(ch);
        });
        const changes = this.layout.initialChanges;
        this._handleLayoutChanges(changes);

    }
    ngAfterViewInit() {
        this.hGrid.childLayoutList = this.layout.children;
        if (this.layout.childColumns.length > 0 && !this.hGrid.autoGenerate) {
            this.hGrid.columnList.reset(this.layout.childColumns.toArray());
        }
        const columns = this.hGrid.columnList.toArray();
        columns.forEach((c) => c.gridAPI = this.hGrid.hgridAPI);
        const layouts = this.hGrid.childLayoutList.toArray();
        layouts.forEach((l) => this.hGrid.hgridAPI.registerLayout(l));
        this.hGrid.reflow();
        this.parentGrid.hgridAPI.registerChildGrid(this.rowData.rowID, this.layout.id, this.hGrid);
    }
}
