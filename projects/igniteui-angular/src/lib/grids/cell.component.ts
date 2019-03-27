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
import { getNodeSizeViaRange, ROW_COLLAPSE_KEYS, ROW_EXPAND_KEYS, SUPPORTED_KEYS, NAVIGATION_KEYS } from '../core/utils';
import { State } from '../services/index';
import { IgxGridBaseComponent, IGridEditEventArgs, IGridDataBindable } from './grid-base.component';
import { IgxGridSelectionService, ISelectionNode, IgxGridCRUDService } from '../core/grid-selection';

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
    templateUrl: './cell.component.html'
})
export class IgxGridCellComponent implements OnInit, OnChanges, OnDestroy {

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
    visibleColumnIndex = -1;

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

     // TODO: Deprecate
    /**
     * @deprecated
     */
    get inEditMode(): boolean {
        return this.editMode;
    }

    set inEditMode(value: boolean) {
        if (this.row.deleted) {
            return;
        }
        if (this.editable && value) {
            this.gridAPI.submit_value();
            this.crudService.begin(this);
        } else {
            this.gridAPI.escape_editMode();
        }
        this.grid.cdr.markForCheck();
    }

    @Input()
    @HostBinding('class.igx-grid__td--pinned-last')
    lastPinned = false;

    /**
     * @hidden
     * @internal
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

    get editable(): boolean {
        return this.column.editable;
    }

    public isInCompositionMode = false;

    @HostBinding('class.igx-grid__td--active')
    public focused = false;


    constructor(
        protected selectionService: IgxGridSelectionService,
        protected crudService: IgxGridCRUDService,
        public gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
        public selection: IgxSelectionAPIService,
        public cdr: ChangeDetectorRef,
        private element: ElementRef,
        protected zone: NgZone) { }


    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.addEventListener('pointerdown', this.pointerdown);
            this.nativeElement.addEventListener('pointerenter', this.pointerenter);
            this.nativeElement.addEventListener('pointerup', this.pointerup);
        });
    }

    ngOnDestroy() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.removeEventListener('pointerdown', this.pointerdown);
            this.nativeElement.removeEventListener('pointerenter', this.pointerenter);
            this.nativeElement.removeEventListener('pointerup', this.pointerup);
        });
    }

    _updateCRUDStatus() {
        if (this.editable && this.crudService.inEditMode && !this.row.deleted) {
            this.gridAPI.update_cell(this.crudService.cell, this.crudService.cell.editValue);
            this.crudService.end();
            this.grid.cdr.markForCheck();
            this.crudService.begin(this);
        } else if (this.crudService.inEditMode) {
            this.grid.endEdit(true);
        }
    }

    /**
     * @hidden
     * @internal
     */
    public _updateCellSelectionStatus() {
        if (this.editMode) {
            return;
        }

        const node = this.selectionNode;

        this._updateCRUDStatus();
        this.selectionService.keyboardStateOnFocus(node, this.grid.onRangeSelection);
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
     *@hidden
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
        this.selectionService.pointerDown(this.selectionNode,
            event.shiftKey, event.ctrlKey);
    }

    /**
     *
     * @hidden
     * @internal
     */
    pointerenter = (event: PointerEvent) => {
        const dragMode = this.selectionService.pointerEnter(this.selectionNode, event.buttons === 1);
        if (dragMode) {
            this.grid.cdr.detectChanges();
        }
    }

    /**
     * @hidden
     * @internal
     */
    pointerup = () => {
        if (this.selectionService.pointerUp(this.selectionNode, this.grid.onRangeSelection)) {
            this.grid.cdr.detectChanges();
        }
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('dblclick', ['$event'])
    public onDoubleClick(event: MouseEvent) {
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
        this.focused = true;
        this.row.focused = true;
        this._updateCellSelectionStatus();
        this.grid.onSelection.emit({ cell: this, event });
        this.selectionService.activeElement = this.selectionNode;
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

        this.selectionService.keyboardStateOnKeydown(node, shift, shift && key === 'tab');


        if (key === 'tab') {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.editMode) {
            event.stopPropagation();
            if (NAVIGATION_KEYS.has(key)) {
                if (this.column.inlineEditorTemplate) { return; }
                if (['date', 'boolean'].includes(this.column.dataType)) { return; }
                // event.preventDefault();
                return;
            }
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
                    this.grid.navigation.onKeydownHome(node.row);
                    break;
                }
                this.grid.navigation.onKeydownArrowLeft(this.nativeElement, node.row, node.column);
                break;
            case 'arrowright':
            case 'right':
                if (ctrl) {
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
        if (this.editMode) {
            const v = this.crudService.cell;
            const args = {
                cellID: v.id,
                rowID: v.id.rowID,
                oldValue: v.value,
                newValue: v.editValue,
                cancel: false
            } as IGridEditEventArgs;
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
