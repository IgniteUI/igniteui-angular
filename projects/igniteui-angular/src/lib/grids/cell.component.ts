import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { GridBaseAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { isNavigationKey, getNodeSizeViaRange, KEYS } from '../core/utils';
import { State } from '../services/index';
import { IgxGridBaseComponent, IGridEditEventArgs } from './grid-base.component';
import { first } from 'rxjs/operators';
import { DataType } from '../data-operations/data-util';
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
export class IgxGridCellComponent implements OnInit, AfterViewInit {

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
     *  let context = this.cell.context();
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
    @HostBinding('attr.data-rowIndex')
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
    @HostBinding('attr.data-visibleIndex')
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
        if (this.row.deleted) {
            return;
        }
        if (this.column.editable && value) {
            this.gridAPI.set_cell_inEditMode(this.gridID, this);
            if (this.highlight && this.grid.lastSearchInfo.searchText) {
                this.highlight.observe();
            }
            this.editValue = this.value;
        } else {
            this.gridAPI.escape_editMode(this.gridID, this.cellID);
        }
        this.cdr.detectChanges();
        this.grid.cdr.markForCheck();
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
 * @hidden
 */
    @HostBinding('style.min-height.px')
    get minHeight() {
        return this.grid ? this.grid.rowHeight : 32;
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
        return this.resolveStyleClasses();
    }

    /**
     * Gets the width of the cell.
     * ```typescript
     * let cellWidth = this.cell.width;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('style.min-width')
    @HostBinding('style.max-width')
    @HostBinding('style.flex-basis')
    get width() {
        const hasVerticalScroll = !this.grid.verticalScrollContainer.dc.instance.notVirtual;
        const colWidth = this.column.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;

        if (colWidth && !isPercentageWidth) {
            let cellWidth = this.isLastUnpinned && hasVerticalScroll &&
            (this.grid.unpinnedWidth - this.grid.totalWidth < 0) ?
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
     * Gets whether the cell is stored in a pinned column.
     * ```typescript
     * let isPinned = this.cell.isPinned;
     * ```
     * @memberof IgxGridCellComponent
     */
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

    get dirty() {
        if (this.grid.rowEditable) {
            const rowCurrentState = this.grid.transactions.getAggregatedValue(this.row.rowID, false);
            if (rowCurrentState) {
                return rowCurrentState[this.column.field] !== undefined && rowCurrentState[this.column.field] !== null;
            }
        } else {
            const rowTransaction: State = this.grid.transactions.getState(this.row.rowID);
            return rowTransaction && rowTransaction.value && rowTransaction.value[this.column.field];
        }

        return false;
    }
    @ViewChild('defaultCell', { read: TemplateRef })
    protected defaultCellTemplate: TemplateRef<any>;

    @ViewChild('inlineEditor', { read: TemplateRef })
    protected inlineEditorTemplate: TemplateRef<any>;

    @ViewChild(IgxTextHighlightDirective, { read: IgxTextHighlightDirective })
    private highlight: IgxTextHighlightDirective;

    /**
     * Sets the current edit value while a cell is in edit mode.
     * Only for cell editing mode.
     * ```typescript
     * let isLastPinned = this.cell.isLastPinned;
     * ```
     * @memberof IgxGridCellComponent
     */
    public set editValue(value) {
        if (this.gridAPI.get_cell_inEditMode(this.gridID)) {
            this.gridAPI.get_cell_inEditMode(this.gridID).cell.editValue = value;
        }
    }

    /**
     * Gets the current edit value while a cell is in edit mode.
     * Only for cell editing mode.
     * ```typescript
     * let editValue = this.cell.editValue;
     * ```
     * @memberof IgxGridCellComponent
     */
    public get editValue() {
        return this.gridAPI.get_cell_inEditMode(this.gridID).cell.editValue;
    }
    public focused = false;
    protected isSelected = false;
    private cellSelectionID: string;
    private prevCellSelectionID: string;
    private previousCellEditMode = false;

    constructor(
        public gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
        public selection: IgxSelectionAPIService,
        public cdr: ChangeDetectorRef,
        private element: ElementRef) { }

    public _updateCellSelectionStatus(fireFocus = true, event) {
        if (this.selected) {
            return;
        }
        this._clearCellSelection();
        this._saveCellSelection();
        const hasFilteredResults = this.grid.filteredData ? this.grid.filteredData.length > 0 : true;
        if (hasFilteredResults) {
            if (this.column.editable && this.previousCellEditMode && hasFilteredResults) {
                this.inEditMode = true;
            }
            if (!this.inEditMode && this.gridAPI.get_edit_row_state(this.gridID)) {
                // If there is a row being edited & this cell did not enter edit mode (!editable, row.deleted)
                this.grid.endEdit(true);
            }
            this.selected = true;
            if (fireFocus) {
                this.nativeElement.focus();
            }
            this.grid.onSelection.emit({ cell: this, event });
        }
    }

    private _clearCellSelection() {
        const cell = this._getLastSelectedCell();
        if (cell) {
            cell.selected = false;
            cell.focused = false;
        }
        const editCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (editCell) {
            if (editCell.cell.column.field === this.grid.primaryKey) {
                if (editCell.cellID.rowIndex === this.cellID.rowIndex && editCell.cellID.columnID === this.cellID.columnID) {
                    this.previousCellEditMode = false;
                } else {
                    this.previousCellEditMode = true;
                    this.gridAPI.submit_value(this.gridID);
                }
            } else {
                this.previousCellEditMode = true;
                this.gridAPI.submit_value(this.gridID);
            }
        } else {
            this.previousCellEditMode = false;
        }
        this._saveCellSelection(this.selection.get_empty());
    }

    private _saveCellSelection(newSelection?: Set<any>) {
        const sel = this.selection.get(this.cellSelectionID);
        if (sel && sel.size > 0) {
            this.selection.set(this.prevCellSelectionID, sel);
        }
        if (!newSelection) {
            newSelection = this.selection.add_item(this.cellSelectionID, this.cellID);
        }
        this.selection.set(this.cellSelectionID, newSelection);
    }

    private _getLastSelectedCell() {
        const cellID = this.selection.first_item(this.cellSelectionID);
        if (cellID) {
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
        const selectedCellID = this.selection.first_item(this.cellSelectionID);
        if (selectedCellID) {
            return this.cellID.rowID === selectedCellID.rowID &&
                this.cellID.columnID === selectedCellID.columnID;
        }
        return false;
    }

    /**
     *@hidden
     */
    public ngOnInit() {
        this.cellSelectionID = `${this.gridID}-cell`;
        this.prevCellSelectionID = `${this.gridID}-prev-cell`;
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
        const gridEditState = this.gridAPI.create_grid_edit_args(this.gridID, rowSelector, this.cellID.columnID, val);
        this.gridAPI.update_cell(this.gridID, rowSelector, this.cellID.columnID, val, gridEditState);
        if (editableCell && editableCell.cellID.rowID === this.cellID.rowID
            && editableCell.cellID.columnID === this.cellID.columnID) {
            if (gridEditState.args.cancel) {
                return;
            }
            this.gridAPI.escape_editMode(this.gridID, editableCell.cellID);
        }
        this.cdr.markForCheck();
        this.grid.refreshSearch();
    }


    /**
     *@hidden
     */
    public ngAfterViewInit() {
        if (this.highlight && this.grid.lastSearchInfo.searchText) {
            this.highlight.highlight(this.grid.lastSearchInfo.searchText,
                this.grid.lastSearchInfo.caseSensitive,
                this.grid.lastSearchInfo.exactMatch);
            this.highlight.activateIfNecessary();
        }
    }

    /**
     *@hidden
     */
    @HostListener('dblclick', ['$event'])
    public onDoubleClick(event) {
        if (this.column.editable) {
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
        this.focused = true;
        this.row.focused = true;
        if (!this.selected) {
            this._updateCellSelectionStatus(false, event);
        }
    }

    /**
     *@hidden
     */
    @HostListener('blur', ['$event'])
    public onBlur(event) {
        this.focused = false;
        this.row.focused = false;
    }

    @HostListener('keydown', ['$event'])
    dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.isKeySupportedInCell(key)) {
            return;
        }
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;

        if (key === 'tab') {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.gridAPI.get_cell_inEditMode(this.gridID)) {
            event.stopPropagation();
        }

        if (this.inEditMode && isNavigationKey(key)) {
            const editCell = this.gridAPI.get_cell_inEditMode(this.gridID);
            const column = this.gridAPI.get(this.gridID).columns[editCell.cellID.columnID];

            if (column.inlineEditorTemplate === undefined && (
                (column.dataType === DataType.Boolean && (key !== KEYS.SPACE && key !== KEYS.SPACE_IE))
                || column.dataType === DataType.Date)) {
                event.preventDefault();
            }
            return;
        }

        if (isNavigationKey(key)) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (event.altKey) {
            if (this.row.nativeElement.tagName.toLowerCase() === 'igx-tree-grid-row' && this.isToggleKey(key)) {
                const collapse = (this.row as any).expanded && (key === 'left' || key === 'arrowleft');
                const expand = !(this.row as any).expanded && (key === 'right' || key === 'arrowright');
                if (collapse) {
                    (this.gridAPI as any).trigger_row_expansion_toggle(
                        this.gridID, this.row.treeRow, !this.row.expanded, event, this.visibleColumnIndex);
                } else if (expand) {
                    (this.gridAPI as any).trigger_row_expansion_toggle(
                        this.gridID, this.row.treeRow, !this.row.expanded, event, this.visibleColumnIndex);
                }
                return;
            }
        }

        const args = { cell: this, groupRow: null, event: event, cancel: false };
        this.grid.onFocusChange.emit(args);
        if (args.cancel) {
            return;
        }
        switch (key) {
            case 'tab':
                if (shift) {
                    this.grid.navigation.performShiftTabKey(this.row.nativeElement, this.rowIndex, this.visibleColumnIndex);
                    break;
                }
                this.grid.navigation.performTab(this.row.nativeElement, this.rowIndex, this.visibleColumnIndex);
                break;
            case 'home':
            case 'arrowleft':
            case 'left':
                if (ctrl && key === 'home') {
                    this.grid.navigation.goToFirstCell();
                    return;
                }
                if (ctrl || key === 'home') {
                    this.grid.navigation.onKeydownHome(this.rowIndex);
                    break;
                }
                this.grid.navigation.onKeydownArrowLeft(this.nativeElement, this.rowIndex, this.visibleColumnIndex);
                break;
            case 'end':
            case 'arrowright':
            case 'right':
                if (ctrl && key === 'end') {
                    this.grid.navigation.goToLastCell();
                    return;
                }
                if (ctrl || key === 'end') {
                    this.grid.navigation.onKeydownEnd(this.rowIndex);
                    break;
                }
                this.grid.navigation.onKeydownArrowRight(this.nativeElement, this.rowIndex, this.visibleColumnIndex);
                break;
            case 'arrowup':
            case 'up':
                if (ctrl) {
                    this.grid.navigation.navigateTop(this.visibleColumnIndex);
                    break;
                }
                this.grid.navigation.navigateUp(this.row.nativeElement, this.rowIndex, this.visibleColumnIndex);
                break;
            case 'arrowdown':
            case 'down':
                if (ctrl) {
                    this.grid.navigation.navigateBottom(this.visibleColumnIndex);
                    break;
                }
                this.grid.navigation.navigateDown(this.row.nativeElement, this.rowIndex, this.visibleColumnIndex);
                break;
            case 'enter':
            case 'f2':
                this.onKeydownEnterEditMode(event);
                break;
            case 'escape':
            case 'esc':
                this.onKeydownExitEditMode(event);
                break;
            case ' ':
            case 'spacebar':
            case 'space':
                if (this.row.rowSelectable) {
                    this.row.checkboxElement.toggle();
                }
                break;
            default:
                return;
        }
    }

    public onKeydownEnterEditMode(event) {
        if (this.column.editable) {
            if (this.inEditMode) {
                this.grid.endEdit(true);
                this.inEditMode = false;
                this.nativeElement.focus();
            } else {
                this.inEditMode = true;
            }
        }
    }

    public onKeydownExitEditMode(event) {
        if (this.column.editable) {
            const editableCell = this;
            const args: IGridEditEventArgs = {
                cellID: editableCell.cellID,
                rowID: editableCell.cellID.rowID,
                oldValue: editableCell.value,
                newValue: editableCell.editValue,
                cancel: false
            };
            this.grid.onCellEditCancel.emit(args);
            if (args.cancel) {
                return;
            }
            this.grid.endEdit(false);
            this.inEditMode = false;
            this.nativeElement.focus();
        }
    }

    /**
     * If the provided string matches the text in the cell, the text gets highlighted.
     * ```typescript
     * this.cell.highlightText('Cell Value', true);
     * ```
     * @memberof IgxGridCellComponent
     */
    public highlightText(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return this.highlight && this.column.searchable ? this.highlight.highlight(text, caseSensitive, exactMatch) : 0;
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
    private isKeySupportedInCell(key) {
        return isNavigationKey(key) || key === 'tab' || key === 'enter' || key === 'f2' || key === 'escape' || key === 'esc';

    }

    /**
     * @hidden
     */
    protected resolveStyleClasses(): string {
        const defaultClasses = ['igx-grid__td igx-grid__td--fw'];

        if (this.column.cellClasses) {
            Object.entries(this.column.cellClasses).forEach(([name, cb]) => {
                const value = typeof cb === 'function' ? (cb as any)(this.row.rowData, this.column.field) : cb;
                if (value) {
                    defaultClasses.push(name);
                }
            }, this);
        }

        const classList = {
            'igx_grid__cell--edit': this.inEditMode,
            'igx-grid__td--number': this.gridAPI.should_apply_number_style(this.column),
            'igx-grid__td--editing': this.inEditMode,
            'igx-grid__td--pinned': this.column.pinned,
            'igx-grid__td--pinned-last': this.isLastPinned,
            'igx-grid__td--selected': this.selected,
            'igx-grid__td--edited': this.dirty
        };

        Object.entries(classList).forEach(([klass, value]) => {
            if (value) {
                defaultClasses.push(klass);
            }
        });
        return defaultClasses.join(' ');
    }

    /**
     * @hidden
     */
    public calculateSizeToFit(range: any): number {
        return Math.max(...Array.from(this.nativeElement.children)
            .map((child) => getNodeSizeViaRange(range, child)));
    }

    private isToggleKey(key) {
        return ['left', 'right', 'arrowleft', 'arrowright'].indexOf(key.toLowerCase()) !== -1;
    }
}
