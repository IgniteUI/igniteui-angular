import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    DoCheck,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxGridForOfDirective } from '../directives/for-of/for_of.directive';
import { IgxGridAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { first } from 'rxjs/operators';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-row',
    templateUrl: './row.component.html'
})
export class IgxGridRowComponent implements DoCheck {

    /**
     *  The data passed to the row component.
     *
     * ```typescript
     * // get the row data for the first selected row
     * let selectedRowData = this.grid.selectedRows[0].rowData;
     * ```
     */
    @Input()
    public rowData: any;

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
    @ViewChild('igxDirRef', { read: IgxGridForOfDirective })
    public virtDirRow: IgxGridForOfDirective<any>;

    /**
     * @hidden
     */
    @ViewChild(forwardRef(() => IgxCheckboxComponent), {read: IgxCheckboxComponent})
    public checkboxElement: IgxCheckboxComponent;

    /**
     * The rendered cells in the row component.
     *
     * ```typescript
     * // get the cells of the third selected row
     * let selectedRowCells = this.grid.selectedRows[2].cells;
     * ```
     */
    @ViewChildren(forwardRef(() => IgxGridCellComponent), { read: IgxGridCellComponent })
    public cells: QueryList<IgxGridCellComponent>;

    /**
     * @hidden
     */
    @HostBinding('style.min-height.px')
    get rowHeight() {
        const rowOffsetH = this.element.nativeElement.offsetHeight - this.element.nativeElement.clientHeight;
        return this.grid.rowHeight - rowOffsetH;
    }

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'row';

    @HostBinding('attr.data-rowIndex')
    get dataRowIndex() {
        return this.index;
    }

    /**
     * @hidden
     */
    @HostBinding('class')
    get styleClasses(): string {
        const indexClass = this.index % 2 ? this.grid.evenRowCSS : this.grid.oddRowCSS;
        const selectedClass = this.isSelected ? 'igx-grid__tr--selected' : '';
        return `${this.defaultCssClass} ${indexClass} ${selectedClass}`;
    }


    /**
     * @hidden
     */
    get focused(): boolean {
        return this.isFocused;
    }

    /**
     * @hidden
     */
    set focused(val: boolean) {
        this.isFocused = val;
    }

    /**
     * @hidden
     */
    get columns(): IgxColumnComponent[] {
        return this.grid.visibleColumns;
    }

    /**
     * @hidden
     */
    get pinnedColumns(): IgxColumnComponent[] {
        return this.grid.pinnedColumns;
    }

    /**
     * @hidden
     */
    get unpinnedColumns(): IgxColumnComponent[] {
        return this.grid.unpinnedColumns;
    }

    /**
     * @hidden
     */
    public get rowSelectable() {
        return this.grid.rowSelectable;
    }

    /**
     * @hidden
     */
    @HostBinding('attr.aria-selected')
    public isSelected: boolean;

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
    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    /**
     * @hidden
     */
    public get rowID() {
        // A row in the grid is identified either by:
        // primaryKey data value,
        // or if the primaryKey is omitted, then the whole rowData is used instead.
        const primaryKey = this.grid.primaryKey;
        return primaryKey ? this.rowData[primaryKey] : this.rowData;
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

    /**
     * @hidden
     */
    protected defaultCssClass = 'igx-grid__tr';

    /**
     * @hidden
     */
    protected _rowSelection = false;

    /**
     * @hidden
     */
    protected isFocused = false;

    constructor(public gridAPI: IgxGridAPIService,
                private selection: IgxSelectionAPIService,
                public element: ElementRef,
                public cdr: ChangeDetectorRef) { }

    @HostListener('keydown', ['$event'])
    public onKeydown(event) {
        if (this.rowSelectable && event.key.toLowerCase() === 'tab') {
            event.preventDefault();
            event.stopPropagation();
            const shift = event.shiftKey;
            if (shift) {
                this.grid.navigation.navigateUp(this.nativeElement, this.index,
                    this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex);
            } else {
                this.grid.navigation.onKeydownHome(this.index);
            }
        }
    }

    /**
     * @hidden
     */
    public onCheckboxClick(event) {
        const newSelection = (event.checked) ?
                            this.selection.add_item(this.gridID, this.rowID) :
                            this.selection.delete_item(this.gridID, this.rowID);
        this.grid.triggerRowSelectionChange(newSelection, this, event);
    }

    /**
     * Updates the specified row object and the data source record with the passed value.
     * This method emits `onEditDone` event.
     *
     * ```typescript
     * // update the second selected row's value
     * let newValue = "Apple";
     * this.grid.selectedRows[1].update(newValue);
     * ```
     */
    public update(value: any) {
        const editableCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (editableCell && editableCell.cellID.rowID === this.rowID) {
            this.gridAPI.escape_editMode(this.gridID, editableCell.cellID);
        }
        this.gridAPI.update_row(value, this.gridID, this.rowID);
        this.cdr.markForCheck();
        this.grid.refreshSearch();
    }

    /**
     * Removes the specified row from the grid's data source.
     * This method emits `onRowDeleted` event.
     *
     * ```typescript
     * // delete the third selected row from the grid
     * this.grid.selectedRows[2].delete();
     * ```
     */
    public delete() {
        const editableCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (editableCell && editableCell.cellID.rowID === this.rowID) {
            this.gridAPI.escape_editMode(this.gridID, editableCell.cellID);
        }
        const index = this.grid.data.indexOf(this.rowData);
        this.grid.onRowDeleted.emit({ data: this.rowData });
        this.grid.data.splice(index, 1);
        if (this.grid.rowSelectable === true && this.isSelected) {
            this.grid.deselectRows([this.rowID]);
        } else {
            this.grid.checkHeaderCheckboxStatus();
        }
        (this.grid as any)._pipeTrigger++;
        this.cdr.markForCheck();
        this.grid.refreshSearch();

        if (this.grid.data.length % this.grid.perPage === 0 && this.grid.isLastPage && this.grid.page !== 0) {
            this.grid.page--;
        }
    }

    /**
     * @hidden
     */
    get rowCheckboxAriaLabel() {
        return this.grid.primaryKey ?
            this.isSelected ? 'Deselect row with key ' + this.rowID : 'Select row with key ' + this.rowID :
            this.isSelected ? 'Deselect row' : 'Select row';
    }

    /**
     * @hidden
     */
    public ngDoCheck() {
        this.isSelected = this.rowSelectable ?
            this.grid.allRowsSelected ? true : this.selection.is_item_selected(this.gridID, this.rowID) :
            this.selection.is_item_selected(this.gridID, this.rowID);
        this.cdr.markForCheck();
        if (this.checkboxElement) {
            this.checkboxElement.checked = this.isSelected;
        }
    }

    /**
     * @hidden
     */
    notGroups(arr) {
        return arr.filter(c => !c.columnGroup);
    }
}
