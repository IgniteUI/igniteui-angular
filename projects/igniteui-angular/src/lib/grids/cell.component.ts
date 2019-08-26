import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    TemplateRef,
    ViewChild,
    NgZone,
    OnInit,
    OnDestroy,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { GridBaseAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { getNodeSizeViaRange, ROW_COLLAPSE_KEYS, ROW_EXPAND_KEYS, SUPPORTED_KEYS, NAVIGATION_KEYS, isIE, isLeftClick } from '../core/utils';
import { State } from '../services/index';
import { IgxGridBaseComponent, IGridEditEventArgs, IGridDataBindable } from './grid-base.component';
import { IgxGridSelectionService, ISelectionNode, IgxGridCRUDService } from '../core/grid-selection';
import { DeprecateProperty } from '../core/deprecateDecorators';
import { HammerGesturesManager } from '../core/touch';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-cell',
    templateUrl: './cell.component.html',
    providers: [HammerGesturesManager]
})
export class IgxGridCellComponent implements OnInit, OnChanges, OnDestroy {
    private _vIndex = -1;

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
     * Gets the data of the row of the cell.
     * ```typescript
     * let rowData = this.cell.rowData;
     * ```
     * @memberof IgxGridCellComponent
     */
    @Input()
    public rowData: any;

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
    @Input()
    formatter: (value: any) => any;

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
        if (this.editMode) {
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
        return this.gridAPI.grid;
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
    @Input()
    get visibleColumnIndex() {
        return this.column.columnLayoutChild ? this.column.visibleIndex : this._vIndex;
    }

    set visibleColumnIndex(val) {
        this._vIndex = val;
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
        const rowID = primaryKey ? this.rowData[primaryKey] : this.rowData;
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
     * @deprecated
     * Use `cell.editMode` as a getter and
     * `cell.setEditMode(true | false)` to start/exit edit mode.
     *
     * Gets/sets whether the cell is in edit mode.
     * ```typescript
     * let isCellInEditMode = this.cell.inEditMode;
     * ```
     * @memberof IgxGridCellComponent
     */
    @DeprecateProperty(`'inEditMode' is deprecated\nUse 'editMode' to get the current state and 'setEditMode(boolean)' as a setter`)
    get inEditMode(): boolean {
        return this.editMode;
    }

    set inEditMode(value: boolean) {
        this.setEditMode(value);
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    @HostBinding('class.igx-grid__td--pinned-last')
    lastPinned = false;

    /**
     * Returns whether the cell is in edit mode.
     */
    @Input()
    @HostBinding('class.igx-grid__td--editing')
    editMode = false;

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

    @HostBinding('style.-ms-grid-row-span')
    get gridRowSpan(): number {
        return this.column.gridRowSpan;
    }

    @HostBinding('style.-ms-grid-column-span')
    get gridColumnSpan(): number {
        return this.column.gridColumnSpan;
    }


    @HostBinding('style.grid-row-end')
    get rowEnd(): number {
        return this.column.rowEnd;
    }

    @HostBinding('style.grid-column-end')
    get colEnd(): number {
        return this.column.colEnd;
    }

    @HostBinding('style.-ms-grid-row')
    @HostBinding('style.grid-row-start')
    get rowStart(): number {
        return this.column.rowStart;
    }

    @HostBinding('style.-ms-grid-column')
    @HostBinding('style.grid-column-start')
    get colStart(): number {
        return this.column.colStart;
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
     * Gets the width of the cell.
     * ```typescript
     * let cellWidth = this.cell.width;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('style.min-width')
    @HostBinding('style.max-width')
    @HostBinding('style.flex-basis')
    @Input()
    width = '';

    /**
     * Gets whether the cell is selected.
     * ```typescript
     * let isSelected = this.cell.selected;
     * ```
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.aria-selected')
    @HostBinding('class.igx-grid__td--selected')
    get selected() {
        return this.isCellSelected();
    }

    /**
     * Selects/deselects the cell.
     * ```typescript
     * this.cell.selected = true.
     * ```
     * @memberof IgxGridCellComponent
     */
    set selected(val: boolean) {
        const node = this.selectionNode;
        val ? this.selectionService.add(node) : this.selectionService.remove(node);
    }

    @HostBinding('class.igx-grid__td--edited')
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

    /**
     * Sets the current edit value while a cell is in edit mode.
     * Only for cell editing mode.
     * ```typescript
     * this.cell.editValue = value;
     * ```
     * @memberof IgxGridCellComponent
     */
    public set editValue(value) {
        if (this.crudService.inEditMode) {
            this.crudService.cell.editValue = value;
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
        if (this.crudService.inEditMode) {
            return this.crudService.cell.editValue;
        }
    }

    /**
     * Returns whether the cell is editable.
     */
    get editable(): boolean {
        return this.column.editable;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid__td--active')
    public focused = false;

    @ViewChild('defaultCell', { read: TemplateRef, static: true })
    protected defaultCellTemplate: TemplateRef<any>;

    @ViewChild('inlineEditor', { read: TemplateRef, static: true })
    protected inlineEditorTemplate: TemplateRef<any>;

    @ViewChild(IgxTextHighlightDirective, { read: IgxTextHighlightDirective, static: false })
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
        return {
            row: this.rowIndex,
            column: this.column.columnLayoutChild ? this.column.parent.visibleIndex : this.visibleColumnIndex,
            layout: this.column.columnLayoutChild ? {
                rowStart: this.column.rowStart,
                colStart: this.column.colStart,
                rowEnd: this.column.rowEnd,
                colEnd: this.column.colEnd,
                columnVisibleIndex: this.visibleColumnIndex
            } : null
            };
    }

    protected isInCompositionMode = false;
    protected compositionStartHandler;
    protected compositionEndHandler;
    private _highlight: IgxTextHighlightDirective;


    constructor(
        protected selectionService: IgxGridSelectionService,
        protected crudService: IgxGridCRUDService,
        public gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
        public selection: IgxSelectionAPIService,
        public cdr: ChangeDetectorRef,
        private element: ElementRef,
        protected zone: NgZone,
        private touchManager: HammerGesturesManager) { }


    /**
     * @hidden
     * @internal
     */
    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.addEventListener('pointerdown', this.pointerdown);
            this.nativeElement.addEventListener('pointerenter', this.pointerenter);
            this.nativeElement.addEventListener('pointerup', this.pointerup);

            // IE 11 workarounds
            if (isIE()) {
                this.compositionStartHandler = () => this.isInCompositionMode = true;
                this.compositionEndHandler = () => this.isInCompositionMode = false;
                // Hitting Enter with IME submits and exits from edit mode instead of first closing the IME dialog
                this.nativeElement.addEventListener('compositionstart', this.compositionStartHandler);
                this.nativeElement.addEventListener('compositionend', this.compositionEndHandler);
            }
        });
        this.touchManager.addEventListener(this.nativeElement, 'doubletap', this.onDoubleClick, {
            cssProps: { } /* don't disable user-select, etc */
        } as HammerOptions);
    }

    /**
     * @hidden
     * @internal
     */
    ngOnDestroy() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.removeEventListener('pointerdown', this.pointerdown);
            this.nativeElement.removeEventListener('pointerenter', this.pointerenter);
            this.nativeElement.removeEventListener('pointerup', this.pointerup);

            if (isIE()) {
                this.nativeElement.removeEventListener('compositionstart', this.compositionStartHandler);
                this.nativeElement.removeEventListener('compositionend', this.compositionEndHandler);
            }
        });
        this.touchManager.destroy();
    }

    /**
     * @hidden
     * @internal
     */
    _updateCRUDStatus() {
        if (this.editMode) {
            return;
        }

        const crud = this.crudService;
        const editableCell = this.crudService.cell;
        const editMode = !!(crud.row || crud.cell);

        if (this.editable && editMode && !this.row.deleted) {
            if (editableCell) {
                this.gridAPI.update_cell(editableCell, editableCell.editValue);
            }
            crud.end();
            this.grid.notifyChanges();
            crud.begin(this);
            return;
        }

        if (editableCell && crud.sameRow(this.cellID.rowID)) {
            this.gridAPI.submit_value();
        } else if (editMode && !crud.sameRow(this.cellID.rowID)) {
            this.grid.endEdit(true);
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
        return this.selectionService.selected(this.selectionNode);
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.value && !changes.value.firstChange) {
            if (this.highlight) {
                this.highlight.lastSearchInfo.searchedText = this.grid.lastSearchInfo.searchText;
                this.highlight.lastSearchInfo.caseSensitive = this.grid.lastSearchInfo.caseSensitive;
                this.highlight.lastSearchInfo.exactMatch = this.grid.lastSearchInfo.exactMatch;
            }
        }
    }

    /**
     * Starts/ends edit mode for the cell.
     *
     * ```typescript
     * cell.setEditMode(true);
     * ```
     */
    setEditMode(value: boolean): void {
        if (this.row.deleted) {
            return;
        }
        if (this.editable && value) {
            this.gridAPI.submit_value();
            this.crudService.begin(this);
        } else {
            this.gridAPI.escape_editMode();
        }
        this.grid.notifyChanges();
    }

    /**
     * Sets new value to the cell.
     * ```typescript
     * this.cell.update('New Value');
     * ```
     * @memberof IgxGridCellComponent
     */
    // TODO: Refactor
    public update(val: any) {
        if (this.row.deleted) {
            return;
        }
        const cell = this.crudService.createCell(this);
        const args = this.gridAPI.update_cell(cell, val);
        if (this.crudService.cell && this.crudService.sameCell(cell)) {
            if (args.cancel) {
                return;
            }
            this.gridAPI.escape_editMode();
        }
        this.cdr.markForCheck();
    }

    /**
     *
     * @hidden
     * @internal
     */
    pointerdown = (event: PointerEvent) => {
        if (!isLeftClick(event)) {
            this.selectionService.addKeyboardRange();
            this.selectionService.initKeyboardState();
            this.selectionService.primaryButton = false;
            return;
        }
        this.selectionService.pointerDown(this.selectionNode, event.shiftKey, event.ctrlKey);
    }

    /**
     *
     * @hidden
     * @internal
     */
    pointerenter = (event: PointerEvent) => {
        const dragMode = this.selectionService.pointerEnter(this.selectionNode, event);
        if (dragMode) {
            this.grid.cdr.detectChanges();
        }
    }

    /**
     * @hidden
     * @internal
     */
    pointerup = (event: PointerEvent) => {
        if (this.grid.hasColumnLayouts) {
            this.grid.navigation.setStartNavigationCell(this.colStart, this.rowStart, null);
        }
        if (!isLeftClick(event)) { return; }
        if (this.selectionService.pointerUp(this.selectionNode, this.grid.onRangeSelection)) {
            this.grid.cdr.detectChanges();
        }
        this._updateCRUDStatus();
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('dblclick', ['$event'])
    public onDoubleClick = (event: MouseEvent | HammerInput) => {
        if (event.type === 'doubletap') {
            // prevent double-tap to zoom on iOS
            (event as HammerInput).preventDefault();
        }
        if (this.editable && !this.editMode && !this.row.deleted) {
            this.crudService.begin(this);
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
        if (this.focused) {
            return;
        }

        const node = this.selectionNode;
        const mrl = this.grid.hasColumnLayouts;
        this.focused = true;
        this.row.focused = true;

        if (!this.selectionService.isActiveNode(node, mrl)) {
            this.grid.onSelection.emit({ cell: this, event });
        }

        if (this.selectionService.primaryButton) {
            this._updateCRUDStatus();
            this.selectionService.activeElement = node;
        } else {
            this.selectionService.activeElement = null;
            if (this.crudService.inEditMode && !this.editMode) {
                this.gridAPI.submit_value();
            }
        }

        this.selectionService.primaryButton = true;
        this.selectionService.keyboardStateOnFocus(node, this.grid.onRangeSelection, this.nativeElement);
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

    protected handleAlt(key: string, event: KeyboardEvent) {
        if (this.row.nativeElement.tagName.toLowerCase() === 'igx-tree-grid-row' && this.isToggleKey(key)) {
            const collapse = (this.row as any).expanded && ROW_COLLAPSE_KEYS.has(key);
            const expand = !(this.row as any).expanded && ROW_EXPAND_KEYS.has(key);
            if (collapse) {
                (this.gridAPI as any).trigger_row_expansion_toggle(this.row.treeRow, !this.row.expanded, event, this.visibleColumnIndex);
            } else if (expand) {
                (this.gridAPI as any).trigger_row_expansion_toggle(this.row.treeRow, !this.row.expanded, event, this.visibleColumnIndex);
            }
        }
    }

    protected handleTab(shift: boolean) {
        if (shift) {
            this.grid.navigation.performShiftTabKey(this.row.nativeElement, this.selectionNode);
        } else {
            this.grid.navigation.performTab(this.row.nativeElement, this.selectionNode);
        }
    }

    protected handleEnd(ctrl: boolean) {
        if (ctrl) {
            this.grid.navigation.goToLastCell();
        } else {
            this.grid.navigation.onKeydownEnd(this.rowIndex, false, this.rowStart);
        }
    }

    protected handleHome(ctrl: boolean) {
        if (ctrl) {
            this.grid.navigation.goToFirstCell();
        } else {
            this.grid.navigation.onKeydownHome(this.rowIndex, false, this.rowStart);
        }
    }

    // TODO: Refactor
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
        event.stopPropagation();

        const keydownArgs = { targetType: 'dataCell', target: this, event: event, cancel: false };
        this.grid.onGridKeydown.emit(keydownArgs);
        if (keydownArgs.cancel) {
            this.selectionService.clear();
            this.selectionService.keyboardState.active = true;
            return;
        }

        if (event.altKey) {
            event.preventDefault();
            this.handleAlt(key, event);
            return;
        }

        this.selectionService.keyboardStateOnKeydown(node, shift, shift && key === 'tab');


        if (key === 'tab') {
            event.preventDefault();
        }

        if (this.editMode) {
            if (NAVIGATION_KEYS.has(key)) {
                if (this.column.inlineEditorTemplate) { return; }
                if (['date', 'boolean'].indexOf(this.column.dataType) > -1) { return; }
                return;
            }
        }

        if (NAVIGATION_KEYS.has(key)) {
            event.preventDefault();
        }

        // TODO: to be deleted when onFocusChange event is removed #4054
        const args = { cell: this, groupRow: null, event: event, cancel: false };
        this.grid._onFocusChange.emit(args);
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
                    this.grid.navigation.onKeydownHome(node.row, false, this.rowStart);
                    break;
                }
                this.grid.navigation.onKeydownArrowLeft(this.nativeElement, this.selectionNode);
                break;
            case 'arrowright':
            case 'right':
                if (ctrl) {
                    this.grid.navigation.onKeydownEnd(node.row, false, this.rowStart);
                    break;
                }
                this.grid.navigation.onKeydownArrowRight(this.nativeElement, this.selectionNode);
                break;
            case 'arrowup':
            case 'up':
                if (ctrl) {
                    this.grid.navigation.navigateTop(this.visibleColumnIndex);
                    break;
                }
                this.grid.navigation.navigateUp(this.row.nativeElement, this.selectionNode);
                break;
            case 'arrowdown':
            case 'down':
                if (ctrl) {
                    this.grid.navigation.navigateBottom(this.visibleColumnIndex);
                    break;
                }
                this.grid.navigation.navigateDown(this.row.nativeElement, this.selectionNode);
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
        if (this.column.editable && !this.row.deleted) {
            if (this.editMode) {
                this.grid.endEdit(true);
                this.nativeElement.focus();
            } else {
                this.crudService.begin(this);
            }
        }
    }

    /**
     * @hidden
     * @internal
     */
    public onKeydownExitEditMode() {
        if (this.isInCompositionMode) {
            return;
        }

        if (this.editMode) {
            const args = this.crudService.cell.createEditEventArgs();
            this.grid.onCellEditCancel.emit(args);
            if (args.cancel) {
                return;
            }
            this.grid.endEdit(false);
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
    public calculateSizeToFit(range: any): number {
        return Math.max(...Array.from(this.nativeElement.children)
            .map((child) => getNodeSizeViaRange(range, child)));
    }

    private isToggleKey(key: string): boolean {
        return ROW_COLLAPSE_KEYS.has(key) || ROW_EXPAND_KEYS.has(key);
    }
}
