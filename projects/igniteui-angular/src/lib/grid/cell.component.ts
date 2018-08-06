import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { take } from 'rxjs/operators';
import { IgxSelectionAPIService } from '../core/selection';
import { KEYCODES } from '../core/utils';
import { DataType } from '../data-operations/data-util';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { IgxGridAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';

/**
 * Providing reference to `IgxGridCellComponent`:
 * ```typescript
 * @ViewChild('grid', { read: IgxGridComponent })
 *  public grid: IgxGridComponent;
 * ```
 * ```typescript
 *  let column = this.grid.columnList.first;
 * ```
 * ```typescript
 *  let cell = column.cells[0];
 * ```
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    preserveWhitespaces: false,
    selector: 'igx-grid-cell',
    templateUrl: './cell.component.html'
})
export class IgxGridCellComponent implements OnInit, OnDestroy, AfterViewInit {

    /**
     * Gets the column of the cell.
     * ```typescript
     *  let cellColumn = this.cell.column;
     * ```
     * @memberof IgxGridCellComponent
     */
    @Input()
    public column: IgxColumnComponent;

    /**
     * Gets the row of the cell.
     * ```typescript
     * let cellRow = this.cell.row;
     * ```
     * @memberof IgxGridCellComponent
     */
    @Input()
    public row: any;

    /**
     * Sets/gets the template of the cell.
     * ```html
     * <ng-template #cellTemplate igxCell let-value>
     *   <div style="font-style: oblique; color:blueviolet; background:red">
     *       <span>{{value}}</span>
     *   </div>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild('cellTemplate',{read: TemplateRef})
     * cellTemplate: TemplateRef<any>;
     * ```
     * ```typescript
     * this.cell.cellTemplate = this.cellTemplate;
     * ```
     * ```typescript
     * let template =  this.cell.cellTemplate;
     * ```
     * @memberof IgxGridCellComponent
     */
    @Input()
    public cellTemplate: TemplateRef<any>;

    /**
     * Sets/gets the cell value.
     * ```typescript
     * this.cell.value = "Cell Value";
     * ```
     * ```typescript
     * let cellValue = this.cell.value;
     * ```
     * @memberof IgxGridCellComponent
     */
    @Input()
    public value: any;

    private get isFirstCell(): boolean {
        return this.columnIndex === 0 || (this.isPinned && this.visibleColumnIndex === 0);
    }

    private get isLastCell(): boolean {
        return this.columnIndex === this.grid.columns.length - 1;
    }

    /**
     * Sets/gets the highlight class of the cell.
     * Default value is `"igx-highlight"`.
     * ```typescript
     * let highlightClass = this.cell.highlightClass;
     * ```
     * ```typescript
     * this.cell.highlightClass = 'igx-cell-highlight';
     * ```
     * @memberof IgxGridCellComponent
     */
    public highlightClass = 'igx-highlight';

    /**
     * Sets/gets the active highlight class class of the cell.
     * Default value is `"igx-highlight__active"`.
     * ```typescript
     * let activeHighlightClass = this.cell.activeHighlightClass;
     * ```
     * ```typescript
     * this.cell.activeHighlightClass = 'igx-cell-highlight_active';
     * ```
     * @memberof IgxGridCellComponent
     */
    public activeHighlightClass = 'igx-highlight__active';

    /**
     * Gets the cell formatter.
     * ```typescript
     * let cellForamatter = this.cell.formatter;
     * ```
     * @memberof IgxGridCellComponent
     */
    get formatter(): (value: any) => any {
        return this.column.formatter;
    }

    /**
     * Gets the cell template context object.
     * ```typescript
     * let context = this.cell.context();
     * ```
     * @memberof IgxGridCellComponent
     */
    get context(): any {
        return {
            $implicit: this.value,
            cell: this
        };
    }

    /**
     * Gets the cell template.
     * ```typescript
     * let template = this.cell.template;
     * ```
     * @memberof IgxGridCellComponent
     */
    get template(): TemplateRef<any> {
        if (this.inEditMode) {
            const inlineEditorTemplate = this.column.inlineEditorTemplate;
            return inlineEditorTemplate ? inlineEditorTemplate : this.inlineEditorTemplate;
        }
        if (this.cellTemplate) {
            return this.cellTemplate;
        }
        return this.defaultCellTemplate;
    }

    /**
     * Gets the `id` of the grid in which the cell is stored.
     * ```typescript
     * let gridId = this.cell.gridID;
     * ```
     * @memberof IgxGridCellComponent
     */
    get gridID(): any {
        return this.row.gridID;
    }

    /**
     * Gets the grid of the cell.
     * ```typescript
     * let grid = this.cell.grid;
     * ```
     * @memberof IgxGridCellComponent
     */
    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    /**
     * Gets the `index` of the row where the cell is stored.
     * ```typescript
     * let rowIndex = this.cell.rowIndex;
     * ```
     * @memberof IgxGridCellComponent
     */
    get rowIndex(): number {
        return this.row.index;
    }

    /**
     * Gets the `index` of the cell column.
     * ```typescript
     * let columnIndex = this.cell.columnIndex;
     * ```
     * @memberof IgxGridCellComponent
     */
    get columnIndex(): number {
        return this.column.index;
    }

    /**
     * Gets the visible `index` of the in which the cell is stored.
     * ```typescript
     * let visibleColumnIndex = this.cell.visibleColumnIndex;
     * ```
     * @memberof IgxGridCellComponent
     */
    get visibleColumnIndex(): number {
        return this.column.visibleIndex;
    }

    /**
     * Gets the `index` of the unpinned column in which the cell is stored.
     * ```typescript
     * let unpinnedColumnIndex = this.cell.ununpinnedColumnIndex;
     * ```
     * @memberof IgxGridCellComponent
     */
    get unpinnedColumnIndex(): number {
        return this.grid.unpinnedColumns.filter(c => !c.columnGroup).indexOf(this.column);
    }

    /**
     * Gets the ID of the cell.
     * ```typescript
     * let cellID = this.cell.cellID;
     * ```
     * @memberof IgxGridCellComponent
     */
    public get cellID() {
        const primaryKey = this.grid.primaryKey;
        const rowID = primaryKey ? this.row.rowData[primaryKey] : this.row.rowData;
        return { rowID, columnID: this.columnIndex, rowIndex: this.rowIndex };
    }

    /**
     * Returns a reference to the nativeElement of the cell.
     * ```typescript
     * let cellNativeElement = this.cell.nativeElement;
     * ```
     * @memberof IgxGridCellComponent
     */
    get nativeElement(): any {
        return this.element.nativeElement;
    }

    /**
     * Gets whether the cell is in edit mode.
     * ```typescript
     * let isCellInEditMode = this.cell.inEditMode;
     * ```
     * @memberof IgxGridCellComponent
     */
    get inEditMode(): boolean {
        const editableCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (editableCell) {
            return this.cellID.rowID === editableCell.cellID.rowID &&
                this.cellID.columnID === editableCell.cellID.columnID;
        } else {
            return false;
        }
    }

    /**
     * Enables/disables the edit mode of the cell
     * ```typescript
     * this.cell.inEditMode = true;
     * ```
     * @memberof IgxGridCellComponent
     */
    set inEditMode(value: boolean) {
        if (this.column.editable && value) {
            this.editValue = this.value;
            this.gridAPI.set_cell_inEditMode(this.gridID, this, value);
        } else {
            this.gridAPI.escape_editMode(this.gridID, this.cellID);
        }

        this.cdr.detectChanges();
    }

    /**
     * Sets/get the `tabindex` property of the cell.
     * Default value is `0`.
     * ```typescript
     * this.cell.tabindex = 1;
     * ```
     * ```typescript
     * let cellTabIndex = this.cell.tabindex;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * Sets/get the `role` property of the cell.
     * Default value is `"gridcell"`.
     * ```typescript
     * this.cell.role = 'grid-cell';
     * ```
     * ```typescript
     * let cellRole = this.cell.role;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.role')
    public role = 'gridcell';

    /**
     * Gets whether the cell is editable.
     * ```typescript
     * let isCellReadonly = this.cell.readonly;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.aria-readonly')
    get readonly(): boolean {
        return !this.column.editable;
    }

    /**
     * Gets whether the cell is in edit mode.
     * If `true`, the `"igx_grid__cell--edit"` class is added to the cell.
     * ```typescript
     * let cellInEditMode = this.cell.cellInEditMode;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('class.igx_grid__cell--edit')
    get cellInEditMode() {
        return this.inEditMode;
    }

    /**
     * Returns a string containing the grid `id` and the column `field` concatenated by "_".
     * ```typescript
     * let describedBy = this.cell.describedBy;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.aria-describedby')
    get describedby(): string {
        return `${this.row.gridID}_${this.column.field}`;
    }

    /**
     * Gets the style classes of the cell.
     * ```typescript
     * let cellStyleClasses = this.cell.styleClasses.
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = [
            'igx-grid__td igx-grid__td--fw',
            this.column.cellClasses
        ];

        const classList = {
            'igx_grid__cell--edit': this.inEditMode,
            'igx-grid__td--number': this.column.dataType === DataType.Number,
            'igx-grid__td--editing': this.inEditMode,
            'igx-grid__th--pinned': this.column.pinned,
            'igx-grid__th--pinned-last': this.isLastPinned,
            'igx-grid__td--selected': this.selected
        };

        Object.entries(classList).forEach(([klass, value]) => {
            if (value) {
                defaultClasses.push(klass);
            }
        });
        return defaultClasses.join(' ');
    }

    /**
     * Gets the width of the cell.
     * ```typescript
     * let cellWidth = this.cell.width;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('style.min-width')
    @HostBinding('style.flex-basis')
    get width() {
        const hasVerticalScroll = !this.grid.verticalScrollContainer.dc.instance.notVirtual;
        const colWidth = this.column.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;

        if (colWidth && !isPercentageWidth) {
            let cellWidth = this.isLastUnpinned && hasVerticalScroll ?
                parseInt(colWidth, 10) - 18 + '' : colWidth;

            if (typeof cellWidth !== 'string' || cellWidth.endsWith('px') === false) {
                cellWidth += 'px';
            }

            return cellWidth;
        } else {
            return colWidth;
        }
    }

    /**
     * When `true`, the `"igx-grid__td--editing"` class is applied to the cell.
     * ```typescript
     * let cellInEditMode = this.cell.editModeCSS();
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('class.igx-grid__td--editing')
    get editModeCSS() {
        return this.inEditMode;
    }

    /**
     * Gets whether the cell is focused.
     * ```typescript
     * let isFocused = this.cell.focused;
     * ```
     * @memberof IgxGridCellComponent
     */
    get focused(): boolean {
        return this.isFocused;
    }

    /**
     * Enables/disables the focused state of the cell.
     * ```typescript
     * this.cell.focused = true;
     * ```
     * @memberof IgxGridCellComponent
     */
    set focused(val: boolean) {
        this.isFocused = val;
    }

    /**
     * Gets whether the cell is stored in a pinned column.
     * ```typescript
     * let isPinned = this.cell.isPinned;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('class.igx-grid__th--pinned')
    get isPinned() {
        return this.column.pinned;
    }

    /**
     * Gets whether the cell is stored in the last column in the pinned area.
     * ```typescript
     * let isLastPinned = this.cell.isLastPinned;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('class.igx-grid__th--pinned-last')
    get isLastPinned() {
        const pinnedCols = this.grid.pinnedColumns;
        return pinnedCols[pinnedCols.length - 1] === this.column;
    }

    /**
     * Gets whether the cell is stored in the last column in the unpinned area.
     * ```typescript
     * let isLastUnpinned = this.cell.isLastUnpinned;
     * ```
     * @memberof IgxGridCellComponent
     */
    get isLastUnpinned() {
        const unpinnedColumns = this.grid.unpinnedColumns;
        return unpinnedColumns[unpinnedColumns.length - 1] === this.column;
    }

    /**
     * Gets whether the cell is selected.
     * ```typescript
     * let isSelected = this.cell.selected;
     * ```
     * @memberof IgxGridCellComponent
     */
    get selected() {
        return this.isSelected = this.isCellSelected();
    }

    /**
     * Selects/deselects the cell.
     * ```typescript
     * this.cell.selected = true.
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.aria-selected')
    set selected(val: boolean) {
        this.isSelected = val;
    }

    @ViewChild('defaultCell', { read: TemplateRef })
    protected defaultCellTemplate: TemplateRef<any>;

    @ViewChild('inlineEditor', { read: TemplateRef })
    protected inlineEditorTemplate: TemplateRef<any>;

    @ViewChild(IgxTextHighlightDirective, { read: IgxTextHighlightDirective })
    private highlight: IgxTextHighlightDirective;

    /**
     * @hidden
     */
    public editValue;
    protected isFocused = false;
    protected isSelected = false;
    protected chunkLoadedHor;
    protected chunkLoadedVer;
    private cellSelectionID: string;
    private previousCellEditMode = false;
    private updateCell = true;

    constructor(
        public gridAPI: IgxGridAPIService,
        public selectionApi: IgxSelectionAPIService,
        public cdr: ChangeDetectorRef,
        private element: ElementRef) { }

    /**
     *@hidden
     */
    public _updateCellSelectionStatus() {
        this._clearCellSelection();
        this.selectionApi.set_selection(this.cellSelectionID, this.selectionApi.select_item(this.cellSelectionID, this.cellID));
        if (this.column.editable && this.previousCellEditMode) {
            this.inEditMode = true;
        }
        this.cdr.detectChanges();
    }

    private _clearCellSelection() {
        const cell = this._getLastSelectedCell();
        if (cell) {
            cell.selected = false;
            cell.focused = false;
        }
        const editCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (editCell && this.updateCell) {
            if (editCell.cell.column.field === this.gridAPI.get(this.gridID).primaryKey) {
                if (editCell.cellID.rowIndex === this.cellID.rowIndex && editCell.cellID.columnID === this.cellID.columnID) {
                    this.previousCellEditMode = false;
                } else {
                    this.previousCellEditMode = true;
                }
            } else {
                this.previousCellEditMode = true;
            }
            this.gridAPI.submit_value(this.gridID);
            this.cdr.markForCheck();
        } else {
            this.previousCellEditMode = false;
        }
        this.selectionApi.set_selection(this.cellSelectionID, []);
    }

    private _getLastSelectedCell() {
        const selection = this.selectionApi.get_selection(this.cellSelectionID);
        if (selection && selection.length > 0) {
            const cellID = selection[0];
            return this.gridAPI.get_cell_by_index(this.gridID, cellID.rowIndex, cellID.columnID);
        }
    }

    /**
     * Gets whether the cell is selected.
     * ```typescript
     * let isCellSelected = thid.cell.isCellSelected();
     * ```
     * @memberof IgxGridCellComponent
     */
    public isCellSelected() {
        const selection = this.selectionApi.get_selection(this.cellSelectionID);
        if (selection && selection.length > 0) {
            const selectedCellID = selection[0];
            return this.cellID.rowID === selectedCellID.rowID &&
                this.cellID.columnID === selectedCellID.columnID;
        }
        return false;
    }

    /**
     *@hidden
     */
    public ngOnInit() {
        this.cellSelectionID = this.gridID + '-cells';
        this.chunkLoadedHor = this.row.virtDirRow.onChunkLoad.subscribe(
            () => {
                if (!this.selected) {
                    this.nativeElement.blur();
                }
                this.cdr.markForCheck();
            });
        this.chunkLoadedVer = this.grid.verticalScrollContainer.onChunkLoad.subscribe(
            () => {
                if (!this.selected) {
                    this.nativeElement.blur();
                }
                this.cdr.markForCheck();
            });
    }

    /**
     * Sets new value to the cell.
     * ```typescript
     * this.cell.update('New Value');
     * ```
     * @memberof IgxGridCellComponent
     */
    public update(val: any) {
        const rowSelector = this.cellID.rowID;
        const editableCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (editableCell && editableCell.cellID.rowID === this.cellID.rowID
            && editableCell.cellID.columnID === this.cellID.columnID) {
            this.gridAPI.escape_editMode(this.gridID, editableCell.cellID);
        }
        this.gridAPI.update_cell(this.gridID, rowSelector, this.cellID.columnID, val);
        this.cdr.markForCheck();
        this.gridAPI.get(this.gridID).refreshSearch();
    }

    /**
     *@hidden
     */
    public ngOnDestroy() {
        if (this.chunkLoadedHor) {
            this.chunkLoadedHor.unsubscribe();
        }
        if (this.chunkLoadedVer) {
            this.chunkLoadedVer.unsubscribe();
        }
    }

    /**
     *@hidden
     */
    public ngAfterViewInit() {
        if (this.highlight && this.grid.lastSearchInfo.searchText) {
            this.highlight.highlight(this.grid.lastSearchInfo.searchText, this.grid.lastSearchInfo.caseSensitive);
            this.highlight.activateIfNecessary();
        }
    }

    /**
     *@hidden
     */
    focusCell() {
        this.updateCell = false;
        this.nativeElement.focus();
    }

    /**
     *@hidden
     */
    @HostListener('dblclick', ['$event'])
    public onDoubleClick(event) {
        if (this.column.editable) {
            this.focused = true;
            this.inEditMode = true;
        }

        this.grid.onDoubleClick.emit({
            cell: this,
            event
        });
    }

    /**
     *@hidden
     */
    @HostListener('click', ['$event'])
    public onClick(event) {
        this.grid.onCellClick.emit({
            cell: this,
            event
        });
    }

    /**
     *@hidden
     */
    @HostListener('contextmenu', ['$event'])
    public onContextMenu(event) {
        this.grid.onContextMenu.emit({
            cell: this,
            event
        });
    }

    /**
     *@hidden
     */
    @HostListener('focus', ['$event'])
    public onFocus(event) {
        this.isFocused = true;
        this.selected = true;
        const elementClassList = event.srcElement ? event.srcElement.classList : [];
        const classList = (event.composedPath && event.composedPath().length > 0) ?
            event.composedPath()[0].classList : elementClassList;

        if (this.gridAPI.get_cell_inEditMode(this.gridID) && classList.length > 0 && event.relatedTarget) {
            const targetEditMode = classList.toLocaleString().indexOf('igx-grid__td--editing') !== -1;
            if (targetEditMode) {
                if (classList.length > 0 && event.relatedTarget.classList.length > 0) {
                    if ((event.relatedTarget.classList.toLocaleString().indexOf('igx-checkbox__input') !== -1 ||
                        event.relatedTarget.classList.toLocaleString().indexOf('igx-calendar') !== -1)
                        && classList[0] === 'igx-grid__td') {
                        this.updateCell = false;
                    }
                }
            }
        }
        this._updateCellSelectionStatus();
        this.row.focused = true;
        this.grid.onSelection.emit({
            cell: this,
            event
        });
    }

    /**
     *@hidden
     */
    @HostListener('blur', ['$event'])
    public onBlur(event) {
        this.updateCell = true;
        this.isFocused = false;
        this.row.focused = false;
    }

    /**
     *@hidden
     */
    @HostListener('keydown.shift.tab', ['$event'])
    public onShiftTabKey(event) {
        if (this.isFirstCell) {
            this.selectionApi.set_selection(this.cellSelectionID, []);
            this.grid.markForCheck();
            return;
        } else {
            this.onKeydownArrowLeft(event);
        }
    }

    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event) {
        if (this.inEditMode) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        const rowIndex = this.rowIndex;
        const columnIndex = this.visibleColumnIndex - 1;

        if (columnIndex >= 0) {
            const target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, columnIndex);
            const targetUnpinnedIndex = this.unpinnedColumnIndex - 1;
            const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
            let bVirtSubscribe = true;

            if (!horVirtScroll && !target) {
                return;
            }

            if (target) {
                const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
                const targetEndLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;
                if (!target.isPinned && targetEndLeftOffset < 0) {
                    // Target cell is not pinned and is partialy visible (left part is cut). Scroll so it is fully visible and then focus.
                    horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex);
                } else {
                    // Target cell is fully visible. Just focus it.
                    target.nativeElement.focus();
                    bVirtSubscribe = false;
                }
            } else {
                if (!this.column.pinned) {
                    this.row.virtDirRow.scrollPrev();
                } else {
                    this.row.virtDirRow.scrollTo(this.grid.unpinnedColumns.filter(c => !c.columnGroup).length - 1);
                }
            }

            /**
             * Determine if we need to subscribe, otherwise if we use navigation and don't scroll, it will bind n-times times.
             * If we scroll the virtual container above, we need to subscribe to onChunkLoad.
             * We do this because it takes time to detect change in scrollLeft of an element
             */
            if (bVirtSubscribe) {
                this.grid._focusNextCell(this.rowIndex, columnIndex, 'left');
            }
        }
    }

    /**
     *@hidden
     */
    @HostListener('keydown.control.arrowleft')
    public onKeydownCtrlArrowLeft() {
        if (this.inEditMode) {
            return;
        }

        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex, this.row.cells.first.visibleColumnIndex);
        const columnIndex = target.visibleColumnIndex;
        if (target) {
            const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            const targetEndLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;

            if (!target.isPinned && targetEndLeftOffset < 0) {
                // Target cell is not pinned and is partialy visible (left part is cut). Scroll so it is fully visible and then focus.
                const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
                horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(target.unpinnedColumnIndex);

                this.grid._focusNextCell(this.rowIndex, columnIndex, 'left');
            } else {
                target.nativeElement.focus();
            }
        }
    }

    /**
     *@hidden
     */
    @HostListener('keydown.tab', ['$event'])
    public onTabKey(event) {
        if (this.isLastCell) {
            this.selectionApi.set_selection(this.cellSelectionID, []);
            this.grid.markForCheck();
            return;
        } else {
            this.onKeydownArrowRight(event);
        }
    }

    @HostListener('keydown.arrowright', ['$event'])
    public onKeydownArrowRight(event) {
        if (this.inEditMode) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        const visibleColumns = this.grid.visibleColumns.filter(c => !c.columnGroup);
        const rowIndex = this.rowIndex;
        const columnIndex = this.visibleColumnIndex + 1;

        if (columnIndex > -1 && columnIndex <= visibleColumns.length - 1) {
            const target = this.gridAPI.get_cell_by_visible_index(this.gridID, rowIndex, columnIndex);
            const targetUnpinnedIndex = this.unpinnedColumnIndex + 1;
            const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
            const verticalVirtScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            const verticalVirtScrollWidth = verticalVirtScroll &&
                verticalVirtScroll.offsetHeight < verticalVirtScroll.children[0].offsetHeight ?
                this.grid.verticalScrollContainer.getVerticalScroll().offsetWidth :
                0;

            // We take into consideration the vertical scroll width sinse it is not calculated in the container inside the row
            const virtContainerSize = parseInt(this.row.virtDirRow.igxForContainerSize, 10) - verticalVirtScrollWidth;
            let bVirtSubscribe = true;

            if (!horVirtScroll && !target) {
                return;
            }

            if (target) {
                const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
                const targetStartLeftOffset = target.nativeElement.offsetLeft + containerLeftOffset;
                const targetEndLeftOffset = target.nativeElement.offsetLeft +
                    parseInt(visibleColumns[columnIndex].width, 10) +
                    containerLeftOffset;
                if (!target.isPinned && targetEndLeftOffset > virtContainerSize) {
                    // Target cell is partially visible (right part of it is cut). Scroll to it so it is fully visible then focus.
                    const oldScrollLeft = horVirtScroll.scrollLeft;
                    const targetScrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex + 1) - virtContainerSize;
                    horVirtScroll.scrollLeft = targetScrollLeft;

                    if (oldScrollLeft === horVirtScroll.scrollLeft && oldScrollLeft !== targetScrollLeft) {
                        // There is nowhere to scroll more. Don't subscribe since there won't be triggered event.
                        target.nativeElement.focus();
                        bVirtSubscribe = false;
                    }
                } else if (!target.isPinned && targetStartLeftOffset < 0) {
                    // Target cell is partially visible (left part of it is cut). Happens when going from pinned to unpinned area.
                    horVirtScroll.scrollLeft = 0;
                } else {
                    // Target cell is fully visible. Just focus it.
                    target.nativeElement.focus();
                    bVirtSubscribe = false;
                }
            } else {
                horVirtScroll.scrollLeft = this.row.virtDirRow.getColumnScrollLeft(targetUnpinnedIndex + 1) - virtContainerSize;
            }

            /**
             * Determine if we need to subscribe, otherwise if we use navigation and don't scroll, it will bind n-times.
             * If we scroll the virtual container above, we need to subscribe to onChunkLoad.
             * We do this because it takes time to detect change in scrollLeft of an element
             */
            if (bVirtSubscribe) {
                this.grid._focusNextCell(this.rowIndex, columnIndex, 'right');
            }
        }
    }

    /**
     *@hidden
     */
    @HostListener('keydown.control.arrowright')
    public onKeydownCtrlArrowRight() {
        if (this.inEditMode) {
            return;
        }

        const target = this.gridAPI.get_cell_by_visible_index(this.gridID, this.rowIndex, this.row.cells.last.visibleColumnIndex);
        const columnIndex = target.visibleColumnIndex;
        if (target) {
            const containerLeftOffset = parseInt(this.row.virtDirRow.dc.instance._viewContainer.element.nativeElement.style.left, 10);
            const targetEndLeftOffset = target.nativeElement.offsetLeft + parseInt(target.column.width, 10) + containerLeftOffset;
            const verticalVirtScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            const verticalVirtScrollWidth = verticalVirtScroll &&
                verticalVirtScroll.offsetHeight < verticalVirtScroll.children[0].offsetHeight ?
                this.grid.verticalScrollContainer.getVerticalScroll().offsetWidth :
                0;

            // We take into consideration the vertical scroll width sinse it is not calculated in the container inside the row
            const virtContainerSize = parseInt(this.row.virtDirRow.igxForContainerSize, 10) - verticalVirtScrollWidth;
            if (targetEndLeftOffset > virtContainerSize) {
                // Target cell is partially visible (right part of it is cut). Scroll to it so it is fully visible then focus.
                const horVirtScroll = this.grid.parentVirtDir.getHorizontalScroll();
                const oldScrollLeft = horVirtScroll.scrollLeft;
                const targetScrollLeft = this.row.virtDirRow.getColumnScrollLeft(target.unpinnedColumnIndex + 1) - virtContainerSize;
                horVirtScroll.scrollLeft = targetScrollLeft;

                if (oldScrollLeft === horVirtScroll.scrollLeft && oldScrollLeft !== targetScrollLeft) {
                    // There is nowhere to scroll more. Don't subscribe since there won't be triggered event.
                    target.nativeElement.focus();
                } else {
                    this.grid._focusNextCell(this.rowIndex, columnIndex, 'right');
                }
            } else {
                target.nativeElement.focus();
            }
        }
    }

    /**
     *@hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event) {
        if (this.inEditMode || this.rowIndex === 0) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        const lastCell = this._getLastSelectedCell();
        const rowIndex = lastCell ? lastCell.rowIndex - 1 : this.grid.rowList.last.index;
        this._clearCellSelection();
        this.grid.navigateUp(rowIndex, this.visibleColumnIndex);
    }

    /**
     *@hidden
     */
    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event) {
        const virtDir = this.grid.verticalScrollContainer;
        const count = virtDir.totalItemCount || virtDir.igxForOf.length;
        if (this.inEditMode || this.rowIndex + 1 === count) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        const lastCell = this._getLastSelectedCell();
        const rowIndex = lastCell ? lastCell.rowIndex + 1 : this.grid.rowList.first.index;
        this._clearCellSelection();
        this.grid.navigateDown(rowIndex, this.visibleColumnIndex);
    }

    /**
     *@hidden
     */
    @HostListener('keydown.enter')
    @HostListener('keydown.f2')
    public onKeydownEnterEditMode() {
        if (this.column.editable) {
            if (this.inEditMode) {
                this.gridAPI.submit_value(this.gridID);
            } else {
                this.focused = true;
                this.inEditMode = true;
            }
            this.nativeElement.focus();
        }
    }

    /**
     *@hidden
     */
    @HostListener('keydown.escape')
    public onKeydownExitEditMode() {
        this.inEditMode = false;
        this.nativeElement.focus();
    }

    /**
     * If the provided string matches the text in the cell, the text gets highlighted.
     * ```typescript
     * this.cell.highlightText('Cell Value', true);
     * ```
     * @memberof IgxGridCellComponent
     */
    public highlightText(text: string, caseSensitive?: boolean): number {
        return this.highlight && this.column.searchable ? this.highlight.highlight(text, caseSensitive) : 0;
    }

    /**
     * Clears the highlight of the text in the cell.
     * ```typescript
     * this.cell.clearHighLight();
     * ```
     * @memberof IgxGridCellComponent
     */
    public clearHighlight() {
        if (this.highlight && this.column.searchable) {
            this.highlight.clearHighlight();
        }
    }
}
