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
import { getNodeSizeViaRange, KEYS } from '../core/utils';
import { State } from '../services/index';
import { IgxGridBaseComponent, IGridEditEventArgs } from './grid-base.component';
import { DataType } from '../data-operations/data-util';
import { IgxGridSelectionService, ISelectionNode } from '../core/grid-selection';

const NAVIGATION_KEYS = new Set(['down', 'up', 'left', 'right', 'arrowdown', 'arrowup', 'arrowleft', 'arrowright',
                                'home', 'end', 'space', 'spacebar', ' ']);
const SUPPORTED_KEYS = new Set([...Array.from(NAVIGATION_KEYS), 'tab', 'enter', 'f2', 'escape', 'esc']);

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
export class IgxGridCellComponent implements OnInit {

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
    get nativeElement(): HTMLElement {
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
        return editableCell ? this.cellID.rowID === editableCell.cellID.rowID &&
                              this.cellID.columnID === editableCell.cellID.columnID : false;
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
            this.focused = true;
            this.gridAPI.set_cell_inEditMode(this.gridID, this);
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
        return this.column.getCellWidth();
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

    private _highlight: IgxTextHighlightDirective;

    @ViewChild(IgxTextHighlightDirective, { read: IgxTextHighlightDirective })
    protected set highlight(value: IgxTextHighlightDirective) {
        this._highlight = value;

        if (this._highlight && this.grid.lastSearchInfo.searchText) {
            this._highlight.highlight(this.grid.lastSearchInfo.searchText,
                this.grid.lastSearchInfo.caseSensitive,
                this.grid.lastSearchInfo.exactMatch);
            this._highlight.activateIfNecessary();
        }
    }

    protected get highlight() {
        return this._highlight;
    }

    protected get selectionNode(): ISelectionNode {
        return { row: this.rowIndex, column: this.visibleColumnIndex };
    }

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
        if (this.gridAPI.get_cell_inEditMode(this.gridID)) {
            return this.gridAPI.get_cell_inEditMode(this.gridID).cell.editValue;
        }
    }

    public isInCompositionMode = false;
    public focused = false;
    protected isSelected = false;
    private cellSelectionID: string;
    private prevCellSelectionID: string;
    private previousCellEditMode = false;

    constructor(
        protected gridSelection: IgxGridSelectionService,
        public gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
        public selection: IgxSelectionAPIService,
        public cdr: ChangeDetectorRef,
        private element: ElementRef) { }

    /**
     * @hidden
     * @internal
     */
    public _updateCellSelectionStatus(fireFocus = true, event) {
        const selection = this.gridSelection;
        const pointerState = this.gridSelection.pointerState;
        const keyboardState = selection.keyboardState;
        const node = this.selectionNode;

        // TODO: Refactor this. We won't need the `_clear/saveCellSelection` methods in their current form.
        if (fireFocus) {
            this.nativeElement.focus();
        }
        if (!this.inEditMode && this.gridAPI.get_edit_row_state(this.gridID)) {
            // If there is a row being edited & this cell did not enter edit mode (!editable, row.deleted)
            this.grid.endEdit(true);
        }

        keyboardState.lastPassedNode = node;
        if (keyboardState.shift) {
            selection.dragSelect(node, keyboardState);
            this.grid.onSelection.emit({ cell: this, event });
            this.grid.onRangeSelection.emit(this.gridSelection.generateRange(node, keyboardState));
            return;
        }
        if (!pointerState.ctrl && !pointerState.shift && !selection.dragMode) {
            selection.clear();
            selection.add(node);
        }

        this._clearCellSelection();
        // // this._saveCellSelection();
        const hasFilteredResults = this.grid.filteredData ? this.grid.filteredData.length > 0 : true;
        if (hasFilteredResults) {
            if (this.column.editable && this.previousCellEditMode && hasFilteredResults) {
                this.inEditMode = true;
            }
            if (!this.inEditMode && this.gridAPI.get_edit_row_state(this.gridID)) {
                // If there is a row being edited & this cell did not enter edit mode (!editable, row.deleted)
                this.grid.endEdit(true);
            }
        //     this.selected = true;
        //     if (fireFocus) {
        //         this.nativeElement.focus();
        //     } else {
        //         if (!this.focused) {
        //             this.focused = this.nativeElement === document.activeElement;
        //         }
        //     }
            this.grid.onSelection.emit({ cell: this, event });
        }
    }

    // TODO: Refactor this.
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

    // TODO: Refactor. Probably up for deletion
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

    // TODO: Refactor
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
        return this.gridSelection.selected(this.selectionNode);
    }

    /**
     * @hidden
     * @internal
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
    }

    /**
     *
     * @hidden
     * @internal
     */
    @HostListener('pointerdown', ['$event.ctrlKey', '$event.shiftKey'])
    pointerdown(ctrlKey: boolean, shiftKey: boolean) {
        const selectionService = this.gridSelection;
        const pointerState = selectionService.pointerState;
        const node = this.selectionNode;

        pointerState.ctrl = ctrlKey;
        pointerState.shift = shiftKey;
        selectionService.initKeyboardState();

        if (shiftKey) {
            if (!pointerState.node) {
                pointerState.node = node;
            }
            selectionService.pointerDownShiftKey(node);
            this.clearTextSelection();
            return;
        }

        pointerState.node = node;
    }

    /**
     *
     * @hidden
     * @internal
     */
    @HostListener('pointerenter', ['$event.buttons'])
    pointerenter(buttons: number) {
        const selection = this.gridSelection;

        selection.dragMode = buttons === 1 ? true : false;
        if (!selection.dragMode) {
            return;
        }
        this.clearTextSelection();
        selection.dragSelect(this.selectionNode, selection.pointerState);
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('pointerup')
    pointerup() {
        const node = this.selectionNode;
        if (this.gridSelection.dragMode) {
            this.grid.onRangeSelection.emit(this.gridSelection.generateRange(node, this.gridSelection.pointerState));
            this.gridSelection.addRangeMeta(node, this.gridSelection.pointerState);
            this.gridSelection.dragMode = false;
            return;
        }
        if (this.gridSelection.pointerState.shift) {
            this.clearTextSelection();
            this.grid.onRangeSelection.emit(this.gridSelection.generateRange(node, this.gridSelection.pointerState));
            this.gridSelection.addRangeMeta(node, this.gridSelection.pointerState);
            return;
        }
        if (!this.gridSelection.pointerState.ctrl) {
            this.gridSelection.clear();
        }
        this.gridSelection.add(node);
    }

    /**
     * @hidden
     * @internal
     */
    clearTextSelection() {
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
        }
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('dblclick', ['$event'])
    public onDoubleClick(event: MouseEvent) {
        if (this.column.editable) {
            this.inEditMode = true;
        }

        this.grid.onDoubleClick.emit({
            cell: this,
            event
        });
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        this.grid.onCellClick.emit({
            cell: this,
            event
        });
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('contextmenu', ['$event'])
    public onContextMenu(event: MouseEvent) {
        this.grid.onContextMenu.emit({
            cell: this,
            event
        });
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('focus', ['$event'])
    public onFocus(event: FocusEvent) {
        this.focused = true;
        this.row.focused = true;
        this._updateCellSelectionStatus(false, event);
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('blur')
    public onBlur() {
        this.focused = false;
        this.row.focused = false;
    }

    protected handleAlt(key: string) {
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
        }
    }

    protected handleTab(shift: boolean) {
        if (shift) {
            this.grid.navigation.performShiftTabKey(this.row.nativeElement, this.rowIndex, this.visibleColumnIndex);
        } else {
            this.grid.navigation.performTab(this.row.nativeElement, this.rowIndex, this.visibleColumnIndex);
        }
    }

    protected handleEnd(ctrl: boolean) {
        this.nativeElement.blur();
        if (ctrl) {
            this.grid.navigation.goToLastCell();
        } else {
            this.grid.navigation.onKeydownEnd(this.rowIndex);
        }
    }

    protected handleHome(ctrl: boolean) {
        this.nativeElement.blur();
        if (ctrl) {
            this.grid.navigation.goToFirstCell();
        } else {
            this.grid.navigation.onKeydownHome(this.rowIndex);
        }
    }

    /**
     *
     * @hidden
     * @internal
     */
    @HostListener('keydown', ['$event'])
    dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;
        const node = this.selectionNode;

        if (!SUPPORTED_KEYS.has(key)) {
            return;
        }

        this.gridSelection.keyboardDownShiftKey(node, shift, shift && key === 'tab');
        if (!this.gridSelection.keyboardState.lastPassedNode) {
            this.gridSelection.clear();
        }
        this.gridSelection.keyboardState.lastPassedNode = node;


        if (key === 'tab') {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.gridAPI.get_cell_inEditMode(this.gridID)) {
            event.stopPropagation();
        }

        if (this.inEditMode && NAVIGATION_KEYS.has(key)) {
            const editCell = this.gridAPI.get_cell_inEditMode(this.gridID);
            const column = this.gridAPI.get(this.gridID).columns[editCell.cellID.columnID];

            if (column.inlineEditorTemplate === undefined && (
                (column.dataType === DataType.Boolean && (key !== KEYS.SPACE && key !== KEYS.SPACE_IE))
                || column.dataType === DataType.Date)) {
                event.preventDefault();
            }
            return;
        }

        if (NAVIGATION_KEYS.has(key)) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (event.altKey) {
            this.handleAlt(key);
            return;
        }

        const args = { cell: this, groupRow: null, event: event, cancel: false };

        this.grid.onFocusChange.emit(args);

        if (args.cancel) {
            return;
        }

        switch (key) {
            case 'tab':
                this.handleTab(shift);
                break;
            case 'end':
                this.handleEnd(ctrl);
                break;
            case 'home':
                this.handleHome(ctrl);
                break;
            case 'arrowleft':
            case 'left':
                if (ctrl) {
                    // TODO: ???
                    // this.nativeElement.blur();
                    this.grid.navigation.onKeydownHome(node.row);
                    break;
                }
                this.grid.navigation.onKeydownArrowLeft(this.nativeElement, node.row, node.column);
                break;
            case 'arrowright':
            case 'right':
                if (ctrl) {
                    // TODO: ???
                    // this.nativeElement.blur();
                    this.grid.navigation.onKeydownEnd(node.row);
                    break;
                }
                this.grid.navigation.onKeydownArrowRight(this.nativeElement, node.row, node.column);
                break;
            case 'arrowup':
            case 'up':
                if (ctrl) {
                    this.grid.navigation.navigateTop(node.column);
                    break;
                }
                this.grid.navigation.navigateUp(this.row.nativeElement, node.row, node.column);
                break;
            case 'arrowdown':
            case 'down':
                if (ctrl) {
                    this.grid.navigation.navigateBottom(node.column);
                    break;
                }
                this.grid.navigation.navigateDown(this.row.nativeElement, node.row, node.column);
                break;
            case 'enter':
            case 'f2':
                this.onKeydownEnterEditMode();
                break;
            case 'escape':
            case 'esc':
                this.onKeydownExitEditMode();
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

    /**
     * @hidden
     * @internal
     */
    public onKeydownEnterEditMode() {
        if (this.isInCompositionMode) {
            return;
        }
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

    /**
     * @hidden
     * @internal
     */
    public onKeydownExitEditMode() {
        const editableCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (this.column.editable && editableCell) {
            const args: IGridEditEventArgs = {
                cellID: editableCell.cellID,
                rowID: editableCell.cellID.rowID,
                oldValue: editableCell.cell.value,
                newValue: editableCell.cell.editValue,
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

    /**
     * @hidden
     * @internal
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
            'igx-grid__td--active': this.focused,
            'igx-grid__td--number':  this.column.dataType === DataType.Number,
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
     * @internal
     */
    public calculateSizeToFit(range: any): number {
        return Math.max(...Array.from(this.nativeElement.children)
            .map((child) => getNodeSizeViaRange(range, child)));
    }

    private isToggleKey(key: string) {
        return ['left', 'right', 'arrowleft', 'arrowright'].indexOf(key.toLowerCase()) !== -1;
    }
}
