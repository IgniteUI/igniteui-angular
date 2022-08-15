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
    SimpleChanges,
    Inject,
    ContentChildren,
    ViewChildren,
    QueryList,
    AfterContentInit,
    AfterViewInit
} from '@angular/core';
import { formatPercent } from '@angular/common';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { formatCurrency, formatDate, PlatformUtil } from '../core/utils';
import { IgxGridSelectionService } from './selection/selection.service';
import { HammerGesturesManager } from '../core/touch';
import { GridSelectionMode } from './common/enums';
import { CellType, ColumnType, GridType, IGX_GRID_BASE, RowType, Validity } from './common/grid.interface';
import { getCurrencySymbol, getLocaleCurrencyCode } from '@angular/common';
import { GridColumnDataType } from '../data-operations/data-util';
import { IgxRowDirective } from './row.directive';
import { ISearchInfo } from './common/events';
import { IgxGridCell } from './grid-public-cell';
import { ISelectionNode } from './common/types';
import { IgxTooltipDirective } from '../directives/tooltip';
import { AutoPositionStrategy, HorizontalAlignment, VerticalAlignment } from '../services/public_api';
import { IgxIconComponent } from '../icon/icon.component';
import { first } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

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
export class IgxGridCellComponent implements OnInit, OnChanges, OnDestroy, CellType, AfterViewInit {
    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid__td--new')
    public get isEmptyAddRowCell() {
        return this.intRow.addRowUI && (this.value === undefined || this.value === null);
    }

    @ViewChildren('error', {read: IgxTooltipDirective})
    public errorTooltip: QueryList<IgxTooltipDirective>;

    @ViewChild('errorIcon', { read: IgxIconComponent, static: false })
    public errorIcon: IgxIconComponent;

    /**
     * Gets the column of the cell.
     * ```typescript
     *  let cellColumn = this.cell.column;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public column: ColumnType;


    public get formGroup() : FormGroup {
        const isRowEdit = this.grid.crudService.rowEditing;
        const editRow = isRowEdit ? this.grid.crudService.row : this.grid.crudService.cell?.row;
        const id = isRowEdit ? editRow?.id : editRow?.id.rowID;
        if (editRow && id === this.intRow.key) {
            return editRow.rowFormGroup;
        } else {
            return this.validity?.formGroup;
        }
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    public intRow: IgxRowDirective;

    /**
     * Gets the row of the cell.
     * ```typescript
     * let cellRow = this.cell.row;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public get row(): RowType {
        return this.grid.createRow(this.intRow.index);
    }

    /**
     * Gets the data of the row of the cell.
     * ```typescript
     * let rowData = this.cell.rowData;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public rowData: any;

    /**
     * @hidden
     * @internal
     */
    @Input()
    public columnData: any;

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
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public cellTemplate: TemplateRef<any>;

    @Input()
    public cellValidationErrorTemplate: TemplateRef<any>;

    @Input()
    public pinnedIndicator: TemplateRef<any>;

    /**
     * Sets/gets the cell value.
     * ```typescript
     * this.cell.value = "Cell Value";
     * ```
     * ```typescript
     * let cellValue = this.cell.value;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public value: any;

    /**
     * Gets the cell formatter.
     * ```typescript
     * let cellForamatter = this.cell.formatter;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public formatter: (value: any, rowData?: any, columnData?: any) => any;

    /**
     * Gets the cell template context object.
     * ```typescript
     *  let context = this.cell.context();
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get context(): any {
        const ctx = {
            $implicit: this.value,
            additionalTemplateContext: this.column.additionalTemplateContext,
        };
        /* Turns the `cell` property from the template context object into lazy-evaluated one.
         * Otherwise on each detection cycle the cell template is recreating N cell instances where
         * N = number of visible cells in the grid, leading to massive performance degradation in large grids.
         */
        Object.defineProperty(ctx, 'cell', {
            get: () => this.getCellType(true)
        });
        return ctx;
    }

    /**
     * Gets the cell template.
     * ```typescript
     * let template = this.cell.template;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get template(): TemplateRef<any> {
        if (this.editMode) {
            const inlineEditorTemplate = this.column.inlineEditorTemplate;
            return inlineEditorTemplate ? inlineEditorTemplate : this.inlineEditorTemplate;
        }
        if (this.cellTemplate) {
            return this.cellTemplate;
        }
        if (this.grid.rowEditable && this.intRow.addRowUI) {
            return this.addRowCellTemplate;
        }
        return this.defaultCellTemplate;
    }

    /**
     * Gets the pinned indicator template.
     * ```typescript
     * let template = this.cell.pinnedIndicatorTemplate;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get pinnedIndicatorTemplate() {
        if (this.pinnedIndicator) {
            return this.pinnedIndicator;
        }
        return this.defaultPinnedIndicator;
    }

    /**
     * Gets the `id` of the grid in which the cell is stored.
     * ```typescript
     * let gridId = this.cell.gridID;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get gridID(): any {
        return this.intRow.gridID;
    }


    /**
     * Gets the `index` of the row where the cell is stored.
     * ```typescript
     * let rowIndex = this.cell.rowIndex;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.data-rowIndex')
    public get rowIndex(): number {
        return this.intRow.index;
    }

    /**
     * Gets the `index` of the cell column.
     * ```typescript
     * let columnIndex = this.cell.columnIndex;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get columnIndex(): number {
        return this.column.index;
    }

    /**
     * Returns the column visible index.
     * ```typescript
     * let visibleColumnIndex = this.cell.visibleColumnIndex;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.data-visibleIndex')
    @Input()
    public get visibleColumnIndex() {
        return this.column.columnLayoutChild ? this.column.visibleIndex : this._vIndex;
    }

    public set visibleColumnIndex(val) {
        this._vIndex = val;
    }

    /**
     * Gets the ID of the cell.
     * ```typescript
     * let cellID = this.cell.cellID;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get cellID() {
        const primaryKey = this.grid.primaryKey;
        const rowID = primaryKey ? this.rowData[primaryKey] : this.rowData;
        return { rowID, columnID: this.columnIndex, rowIndex: this.rowIndex };
    }

    @HostBinding('attr.id')
    public get attrCellID() {
        return `${this.intRow.gridID}_${this.rowIndex}_${this.visibleColumnIndex}`;
    }

    @HostBinding('attr.title')
    public get title() {
        if (this.editMode || this.cellTemplate || this.errorShowing) {
            return '';
        }

        if (this.formatter) {
            return this.formatter(this.value, this.rowData, this.columnData);
        }

        const args = this.column.pipeArgs;
        const locale = this.grid.locale;

        switch (this.column.dataType) {
            case GridColumnDataType.Percent:
                return formatPercent(this.value, locale, args.digitsInfo);
            case GridColumnDataType.Currency:
                return formatCurrency(this.value, this.currencyCode, args.display, args.digitsInfo, locale);
            case GridColumnDataType.Date:
            case GridColumnDataType.DateTime:
            case GridColumnDataType.Time:
                return formatDate(this.value, args.format, locale, args.timezone);
        }
        return this.value;
    }

    @HostBinding('class.igx-grid__td--bool-true')
    public get booleanClass() {
        return this.column.dataType === 'boolean' && this.value;
    }

    /**
     * Returns a reference to the nativeElement of the cell.
     * ```typescript
     * let cellNativeElement = this.cell.nativeElement;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get nativeElement(): HTMLElement {
        return this.element.nativeElement;
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    public get cellSelectionMode() {
        return this._cellSelection;
    }

    public set cellSelectionMode(value) {
        if (this._cellSelection === value) {
            return;
        }
        this.zone.runOutsideAngular(() => {
            if (value === GridSelectionMode.multiple) {
                this.addPointerListeners(value);
            } else {
                this.removePointerListeners(this._cellSelection);
            }
        });
        this._cellSelection = value;
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    public set lastSearchInfo(value: ISearchInfo) {
        this._lastSearchInfo = value;
        this.highlightText(this._lastSearchInfo.searchText, this._lastSearchInfo.caseSensitive, this._lastSearchInfo.exactMatch);
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    @HostBinding('class.igx-grid__td--pinned-last')
    public lastPinned = false;

    /**
     * @hidden
     * @internal
     */
    @Input()
    @HostBinding('class.igx-grid__td--pinned-first')
    public firstPinned = false;

    /**
     * Returns whether the cell is in edit mode.
     */
    @Input()
    @HostBinding('class.igx-grid__td--editing')
    public editMode = false;

    /**
     * Sets/get the `role` property of the cell.
     * Default value is `"gridcell"`.
     * ```typescript
     * this.cell.role = 'grid-cell';
     * ```
     * ```typescript
     * let cellRole = this.cell.role;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.role')
    public role = 'gridcell';

    /**
     * Gets whether the cell is editable.
     * ```typescript
     * let isCellReadonly = this.cell.readonly;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('attr.aria-readonly')
    public get readonly(): boolean {
        return !this.editable;
    }
    /** @hidden @internal */
    @HostBinding('attr.aria-describedby')
    public get describeBy() {
        let id = this.grid.id + '_' + this.column.field;
        if (this.isInvalid) {
            id += '_' + this.row.index + '_error';
        }
        return id;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid__td--invalid')
    @HostBinding('attr.aria-invalid')
    public get isInvalid() {
        const isRowEdit = this.grid.crudService.rowEditing;
        if (isRowEdit && this.row.inEditMode || this.editMode) {
            return this.formGroup?.get(this.column?.field)?.invalid;
        } else {
           return !!this.validity ? !this.validity.valid : false;
        }
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid__td--valid')
    public get isValidAfterEdit() {
        const formControl = this.formGroup?.get(this.column?.field);
        return this.editMode && formControl && !formControl.invalid && formControl.dirty;
    }

    private get validity() {
        const state = this.grid.transactions.getState(this.intRow.key);
        if (state && state.validity && state.validity.some(x => x.valid === false)) {
           return state.validity.find(x => x.field === this.column.field);
        }
    }

    public get gridRowSpan(): number {
        return this.column.gridRowSpan;
    }

    public get gridColumnSpan(): number {
        return this.column.gridColumnSpan;
    }

    public get rowEnd(): number {
        return this.column.rowEnd;
    }

    public get colEnd(): number {
        return this.column.colEnd;
    }

    public get rowStart(): number {
        return this.column.rowStart;
    }

    public get colStart(): number {
        return this.column.colStart;
    }

    /**
     * Gets the width of the cell.
     * ```typescript
     * let cellWidth = this.cell.width;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public width = '';

    /**
     * @hidden
     */
    @Input()
    @HostBinding('class.igx-grid__td--active')
    public active = false;

    @HostBinding('attr.aria-selected')
    public get ariaSelected() {
        return this.selected || this.column.selected || this.intRow.selected;
    }

    /**
     * Gets whether the cell is selected.
     * ```typescript
     * let isSelected = this.cell.selected;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('class.igx-grid__td--selected')
    public get selected() {
        return this.selectionService.selected(this.selectionNode);
    }

    /**
     * Selects/deselects the cell.
     * ```typescript
     * this.cell.selected = true.
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public set selected(val: boolean) {
        const node = this.selectionNode;
        if (val) {
            this.selectionService.add(node);
        } else {
            this.selectionService.remove(node);
        }
        this.grid.notifyChanges();
    }

    /**
     * Gets whether the cell column is selected.
     * ```typescript
     * let isCellColumnSelected = this.cell.columnSelected;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @HostBinding('class.igx-grid__td--column-selected')
    public get columnSelected() {
        return this.selectionService.isColumnSelected(this.column.field);
    }

    /**
     * Sets the current edit value while a cell is in edit mode.
     * Only for cell editing mode.
     * ```typescript
     * this.cell.editValue = value;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public set editValue(value) {
        if (this.grid.crudService.cellInEditMode) {
            this.grid.crudService.cell.editValue = value;
        }
    }

    /**
     * Gets the current edit value while a cell is in edit mode.
     * Only for cell editing mode.
     * ```typescript
     * let editValue = this.cell.editValue;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    public get editValue() {
        if (this.grid.crudService.cellInEditMode) {
            return this.grid.crudService.cell.editValue;
        }
    }

    /**
     * Returns whether the cell is editable.
     */
    public get editable(): boolean {
        return this.column.editable && !this.intRow.disabled;
    }

    /**
     * @hidden
     */
    @Input()
    @HostBinding('class.igx-grid__td--row-pinned-first')
    public displayPinnedChip = false;


    @ViewChild('defaultCell', { read: TemplateRef, static: true })
    protected defaultCellTemplate: TemplateRef<any>;

    @ViewChild('defaultPinnedIndicator', { read: TemplateRef, static: true })
    protected defaultPinnedIndicator: TemplateRef<any>;

    @ViewChild('inlineEditor', { read: TemplateRef, static: true })
    protected inlineEditorTemplate: TemplateRef<any>;

    @ViewChild('addRowCell', { read: TemplateRef, static: true })
    protected addRowCellTemplate: TemplateRef<any>;

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

    /**
     * Sets/gets the highlight class of the cell.
     * Default value is `"igx-highlight"`.
     * ```typescript
     * let highlightClass = this.cell.highlightClass;
     * ```
     * ```typescript
     * this.cell.highlightClass = 'igx-cell-highlight';
     * ```
     *
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
     *
     * @memberof IgxGridCellComponent
     */
    public activeHighlightClass = 'igx-highlight__active';

    /** @hidden @internal */
    public get step(): number {
        const digitsInfo = this.column.pipeArgs.digitsInfo;
        if (!digitsInfo) {
            return 1;
        }
        const step = +digitsInfo.substr(digitsInfo.indexOf('.') + 1, 1);
        return 1 / (Math.pow(10, step));
    }

    /** @hidden @internal */
    public get currencyCode(): string {
        return this.column.pipeArgs.currencyCode ?
            this.column.pipeArgs.currencyCode : getLocaleCurrencyCode(this.grid.locale);
    }

    /** @hidden @internal */
    public get currencyCodeSymbol(): string {
        return getCurrencySymbol(this.currencyCode, 'wide', this.grid.locale);
    }

    protected _lastSearchInfo: ISearchInfo;
    private _highlight: IgxTextHighlightDirective;
    private _cellSelection = GridSelectionMode.multiple;
    private _vIndex = -1;

    constructor(
        protected selectionService: IgxGridSelectionService,
        @Inject(IGX_GRID_BASE) public grid: GridType,
        public cdr: ChangeDetectorRef,
        private element: ElementRef<HTMLElement>,
        protected zone: NgZone,
        private touchManager: HammerGesturesManager,
        protected platformUtil: PlatformUtil
    ) { }

    /**
     * @hidden
     * @internal
     */
    @HostListener('dblclick', ['$event'])
    public onDoubleClick = (event: MouseEvent) => {
        if (event.type === 'doubletap') {
            // prevent double-tap to zoom on iOS
            event.preventDefault();
        }
        if (this.editable && !this.editMode && !this.intRow.deleted && !this.grid.crudService.rowEditingBlocked) {
            this.grid.crudService.enterEditMode(this, event as Event);
        }

        this.grid.doubleClick.emit({
            cell: this.getCellType(),
            event
        });
    };

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        this.grid.cellClick.emit({
            cell: this.getCellType(),
            event
        });
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('contextmenu', ['$event'])
    public onContextMenu(event: MouseEvent) {
        this.grid.contextMenu.emit({
            cell: this.getCellType(),
            event
        });
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnInit() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.addEventListener('pointerdown', this.pointerdown);
            this.addPointerListeners(this.cellSelectionMode);
        });
        if (this.platformUtil.isIOS) {
            this.touchManager.addEventListener(this.nativeElement, 'doubletap', this.onDoubleClick, {
                cssProps: {} /* don't disable user-select, etc */
            } as HammerOptions);
        }
     
    }

    public ngAfterViewInit() {
        this.errorTooltip.changes.subscribe(() => {
            if (this.errorTooltip.length > 0 && this.active) {
                // error ocurred
                this.cdr.detectChanges();
                this.openErrorTooltip();
            }
            this.grid.validationStatusChange.emit(
                {
                    formGroup: this.formGroup,
                    value: this.editValue,
                    state: this.errorTooltip.length > 0 ? Validity.Invalid : Validity.Valid
                }
            );
        });
    }

    /**
     * @hidden
     * @internal
     */
    public errorShowing = false;

    private openErrorTooltip() {
        const tooltip = this.errorTooltip.toArray()[0];
        tooltip.open(
            {
                target: this.errorIcon.el.nativeElement,
                closeOnOutsideClick: true,
                excludeFromOutsideClick: [ this.nativeElement ],
                closeOnEscape: false,
                outlet: this.grid.outlet,
                modal: false,
                positionStrategy: new AutoPositionStrategy({
                    horizontalStartPoint: HorizontalAlignment.Center,
                    horizontalDirection: HorizontalAlignment.Center
                })
            }
        );
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy() {
        this.zone.runOutsideAngular(() => {
            this.nativeElement.removeEventListener('pointerdown', this.pointerdown);
            this.removePointerListeners(this.cellSelectionMode);
        });
        this.touchManager.destroy();
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
    public setEditMode(value: boolean): void {
        if (this.intRow.deleted) {
            return;
        }
        if (this.editable && value) {
            if (this.grid.crudService.cellInEditMode) {
                this.grid.gridAPI.update_cell(this.grid.crudService.cell);
                this.grid.crudService.endCellEdit();
            }
            this.grid.crudService.enterEditMode(this);
        } else {
            this.grid.crudService.endCellEdit();
        }
        this.grid.notifyChanges();
    }

    /**
     * Sets new value to the cell.
     * ```typescript
     * this.cell.update('New Value');
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    // TODO: Refactor
    public update(val: any) {
        if (this.intRow.deleted) {
            return;
        }

        let cell = this.grid.crudService.cell;
        if (!cell) {
            cell = this.grid.crudService.createCell(this);
        }
        cell.editValue = val;
        this.grid.gridAPI.update_cell(cell);
        this.grid.crudService.endCellEdit();
        this.cdr.markForCheck();
    }

    /**
     *
     * @hidden
     * @internal
     */
    public pointerdown = (event: PointerEvent) => {
        if (this.cellSelectionMode !== GridSelectionMode.multiple) {
            this.activate(event);
            return;
        }
        if (!this.platformUtil.isLeftClick(event)) {
            event.preventDefault();
            this.grid.navigation.setActiveNode({ rowIndex: this.rowIndex, colIndex: this.visibleColumnIndex });
            this.selectionService.addKeyboardRange();
            this.selectionService.initKeyboardState();
            this.selectionService.primaryButton = false;
            // Ensure RMB Click on edited cell does not end cell editing
            if (!this.selected) {
                this.grid.crudService.updateCell(true, event);
            }
            return;
        }
        this.selectionService.pointerDown(this.selectionNode, event.shiftKey, event.ctrlKey);
        this.activate(event);
    };

    /**
     *
     * @hidden
     * @internal
     */
    public pointerenter = (event: PointerEvent) => {
        const isHierarchicalGrid = this.grid.nativeElement.tagName.toLowerCase() === 'igx-hierarchical-grid';
        if (isHierarchicalGrid && (!this.grid.navigation?.activeNode?.gridID || this.grid.navigation.activeNode.gridID !== this.gridID)) {
            return;
        }
        const dragMode = this.selectionService.pointerEnter(this.selectionNode, event);
        if (dragMode) {
            this.grid.cdr.detectChanges();
        }
    };

    /**
     * @hidden
     * @internal
     */
    public focusout = () => {
       this.closeErrorTooltip();
    }

    private closeErrorTooltip() {
        const tooltip = this.errorTooltip.toArray()[0];
        if (tooltip) {
            tooltip.close();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public pointerup = (event: PointerEvent) => {
        const isHierarchicalGrid = this.grid.nativeElement.tagName.toLowerCase() === 'igx-hierarchical-grid';
        if (!this.platformUtil.isLeftClick(event) || (isHierarchicalGrid && (!this.grid.navigation?.activeNode?.gridID ||
            this.grid.navigation.activeNode.gridID !== this.gridID))) {
            return;
        }
        if (this.selectionService.pointerUp(this.selectionNode, this.grid.rangeSelected)) {
            this.grid.cdr.detectChanges();
        }
    };

    /**
     * @hidden
     * @internal
     */
    public activate(event: FocusEvent | KeyboardEvent) {
        const node = this.selectionNode;
        const shouldEmitSelection = !this.selectionService.isActiveNode(node);

        if (this.selectionService.primaryButton) {
            const currentActive = this.selectionService.activeElement;
            this.selectionService.activeElement = node;
            const cancel = this._updateCRUDStatus(event);
            if (cancel) {
                this.selectionService.activeElement = currentActive;
                return;
            }

            const activeElement = this.selectionService.activeElement;
            const row = activeElement ? this.grid.gridAPI.get_row_by_index(activeElement.row) : null;
            if (this.grid.crudService.rowEditingBlocked && row && this.intRow.key !== row.key) {
                return;
            }

        } else {
            this.selectionService.activeElement = null;
            if (this.grid.crudService.cellInEditMode && !this.editMode) {
                this.grid.crudService.updateCell(true, event);
            }
        }

        this.grid.navigation.setActiveNode({ row: this.rowIndex, column: this.visibleColumnIndex });


        if (this.isInvalid) {
            this.openErrorTooltip();
            this.grid.activeNodeChange.pipe(first()).subscribe(() => {
                this.closeErrorTooltip();
            });
        }
        this.selectionService.primaryButton = true;
        if (this.cellSelectionMode === GridSelectionMode.multiple && this.selectionService.activeElement) {
            this.selectionService.add(this.selectionService.activeElement, false); // pointer events handle range generation
            this.selectionService.keyboardStateOnFocus(node, this.grid.rangeSelected, this.nativeElement);
        }
        if (this.grid.isCellSelectable && shouldEmitSelection) {
            this.grid.selected.emit({ cell: this.getCellType(), event });
        }
    }

    /**
     * If the provided string matches the text in the cell, the text gets highlighted.
     * ```typescript
     * this.cell.highlightText('Cell Value', true);
     * ```
     *
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
     *
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
        return this.platformUtil.getNodeSizeViaRange(range, this.nativeElement);
    }

    /**
     * @hidden
     * @internal
     */
    public get searchMetadata() {
        const meta = new Map<string, any>();
        meta.set('pinned', this.grid.isRecordPinnedByViewIndex(this.intRow.index));
        return meta;
    }

    /**
     * @hidden
     * @internal
     */
    private _updateCRUDStatus(event?: Event) {
        if (this.editMode) {
            return;
        }

        let editableArgs;
        const crud = this.grid.crudService;
        const editableCell = this.grid.crudService.cell;
        const editMode = !!(crud.row || crud.cell);

        if (this.editable && editMode && !this.intRow.deleted) {
            if (editableCell) {
                this.grid.tbody.nativeElement.focus({ preventScroll: true });
                editableArgs = this.grid.crudService.updateCell(false, event);

                /* This check is related with the following issue #6517:
                 * when edit cell that belongs to a column which is sorted and press tab,
                 * the next cell in edit mode is with wrong value /its context is not updated/;
                 * So we reapply sorting before the next cell enters edit mode.
                 * Also we need to keep the notifyChanges below, because of the current
                 * change detection cycle when we have editing with enabled transactions
                 */
                if (this.grid.sortingExpressions.length && this.grid.sortingExpressions.indexOf(editableCell.column.field)) {
                    this.grid.cdr.detectChanges();
                }

                if (editableArgs && editableArgs.cancel) {
                    return true;
                }

                crud.exitCellEdit(event);
            }
            this.grid.tbody.nativeElement.focus({ preventScroll: true });
            this.grid.notifyChanges();
            crud.enterEditMode(this, event);
            return false;
        }

        if (editableCell && crud.sameRow(this.cellID.rowID)) {
            this.grid.crudService.updateCell(true, event);
        } else if (editMode && !crud.sameRow(this.cellID.rowID)) {
            this.grid.crudService.endEdit(true, event);
        }
    }

    private addPointerListeners(selection) {
        if (selection !== GridSelectionMode.multiple) {
            return;
        }
        this.nativeElement.addEventListener('pointerenter', this.pointerenter);
        this.nativeElement.addEventListener('pointerup', this.pointerup);
        this.nativeElement.addEventListener('focusout', this.focusout);
    }

    private removePointerListeners(selection) {
        if (selection !== GridSelectionMode.multiple) {
            return;
        }
        this.nativeElement.removeEventListener('pointerenter', this.pointerenter);
        this.nativeElement.removeEventListener('pointerup', this.pointerup);
        this.nativeElement.removeEventListener('focusout', this.focusout);
    }

    private getCellType(useRow?: boolean): CellType {
        const rowID = useRow ? this.grid.createRow(this.intRow.index, this.intRow.data) : this.intRow.index;
        return new IgxGridCell(this.grid, rowID, this.column.field);
    }
}
