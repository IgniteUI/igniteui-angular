import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Host,
    HostBinding,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Output,
    TemplateRef,
    ViewChild,
    ViewRef
} from '@angular/core';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../../data-operations/filtering-expressions-tree';
import { PlatformUtil, formatDate, formatCurrency } from '../../../core/utils';
import { GridColumnDataType } from '../../../data-operations/data-util';
import { Subscription } from 'rxjs';
import { GridSelectionMode } from '../../common/enums';
import { IgxFilterItem } from '../../../data-operations/filtering-strategy';
import { formatNumber, formatPercent, getLocaleCurrencyCode, NgIf, NgClass, DOCUMENT } from '@angular/common';
import { BaseFilteringComponent } from './base-filtering.component';
import { ExpressionUI, FilterListItem, generateExpressionsList } from './common';
import { ColumnType, GridType, IGX_GRID_BASE } from '../../common/grid.interface';
import { IgxOverlayService } from '../../../services/overlay/overlay';
import { SortingDirection } from '../../../data-operations/sorting-strategy';
import { IgxExcelStyleSearchComponent } from './excel-style-search.component';
import { IgxExcelStyleConditionalFilterComponent } from './excel-style-conditional-filter.component';
import { IgxExcelStyleClearFiltersComponent } from './excel-style-clear-filters.component';
import { IgxExcelStyleSelectingComponent } from './excel-style-selecting.component';
import { IgxExcelStyleHidingComponent } from './excel-style-hiding.component';
import { IgxExcelStylePinningComponent } from './excel-style-pinning.component';
import { IgxExcelStyleMovingComponent } from './excel-style-moving.component';
import { IgxExcelStyleSortingComponent } from './excel-style-sorting.component';
import { IgxExcelStyleHeaderComponent } from './excel-style-header.component';

@Directive({
    selector: 'igx-excel-style-column-operations,[igxExcelStyleColumnOperations]',
    standalone: true
})
export class IgxExcelStyleColumnOperationsTemplateDirective { }

@Directive({
    selector: 'igx-excel-style-filter-operations,[igxExcelStyleFilterOperations]',
    standalone: true
})
export class IgxExcelStyleFilterOperationsTemplateDirective { }

/**
 * A component used for presenting Excel style filtering UI for a specific column.
 * It is used internally in the Grid, but could also be hosted in a container outside of it.
 *
 * Example:
 * ```html
 * <igx-grid-excel-style-filtering
 *     [column]="grid1.columns[0]">
 * </igx-grid-excel-style-filtering>
 * ```
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: BaseFilteringComponent, useExisting: forwardRef(() => IgxGridExcelStyleFilteringComponent) }],
    selector: 'igx-grid-excel-style-filtering',
    templateUrl: './excel-style-filtering.component.html',
    imports: [IgxExcelStyleHeaderComponent, NgIf, IgxExcelStyleSortingComponent, IgxExcelStyleMovingComponent, IgxExcelStylePinningComponent, IgxExcelStyleHidingComponent, IgxExcelStyleSelectingComponent, IgxExcelStyleClearFiltersComponent, IgxExcelStyleConditionalFilterComponent, IgxExcelStyleSearchComponent, NgClass]
})
export class IgxGridExcelStyleFilteringComponent extends BaseFilteringComponent implements AfterViewInit, OnDestroy {

    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-excel-filter')
    public defaultClass = true;

    @HostBinding('class.igx-excel-filter__sizing')
    protected get shouldApplySizes(): boolean {
        return !(this._minHeight || this._maxHeight);
    }

    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-excel-filter--inline')
    public inline = true;

    /**
     * @hidden @internal
     */
    @Output()
    public loadingStart = new EventEmitter();

    /**
     * @hidden @internal
     */
    @Output()
    public loadingEnd = new EventEmitter();

    /**
     * @hidden @internal
     */
    @Output()
    public initialized = new EventEmitter();

    /**
     * @hidden @internal
     */
    @Output()
    public sortingChanged = new EventEmitter();

    /**
     * @hidden @internal
     */
    @Output()
    public columnChange = new EventEmitter<ColumnType>();

    /**
     * @hidden @internal
     */
    @Output()
    public listDataLoaded = new EventEmitter();

    @ViewChild('mainDropdown', { read: ElementRef })
    public mainDropdown: ElementRef<HTMLElement>;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxExcelStyleColumnOperationsTemplateDirective, { read: IgxExcelStyleColumnOperationsTemplateDirective })
    public excelColumnOperationsDirective: IgxExcelStyleColumnOperationsTemplateDirective;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxExcelStyleFilterOperationsTemplateDirective, { read: IgxExcelStyleFilterOperationsTemplateDirective })
    public excelFilterOperationsDirective: IgxExcelStyleFilterOperationsTemplateDirective;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultExcelColumnOperations', { read: TemplateRef, static: true })
    protected defaultExcelColumnOperations: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultExcelFilterOperations', { read: TemplateRef, static: true })
    protected defaultExcelFilterOperations: TemplateRef<any>;

    /**
     * Sets the column.
     */
    @Input()
    public set column(value: ColumnType) {
        this._column = value;
        this.listData = new Array<FilterListItem>();
        this.columnChange.emit(this._column);

        this.subscriptions?.unsubscribe();

        if (this._column) {
            this.grid.filteringService.registerSVGIcons();
            this.init();
            this.sortingChanged.emit();

            this.subscriptions = this.grid.columnPin.subscribe(() => {
                requestAnimationFrame(() => {
                    if (!(this.cdr as ViewRef).destroyed) {
                        this.cdr.detectChanges();
                    }
                });
            });

            this.subscriptions.add(this.grid.columnVisibilityChanged.subscribe(() => this.detectChanges()));
            this.subscriptions.add(this.grid.sortingExpressionsChange.subscribe(() => this.sortingChanged.emit()));
            this.subscriptions.add(this.grid.filteringExpressionsTreeChange.subscribe(() => this.init()));
            this.subscriptions.add(this.grid.columnMovingEnd.subscribe(() => this.cdr.markForCheck()));
        }
    }

    /**
     * Returns the current column.
     */
    public get column(): ColumnType {
        return this._column;
    }

    /**
     * @hidden @internal
     */
    public expressionsList = new Array<ExpressionUI>();
    /**
     * @hidden @internal
     */
    public listData = new Array<FilterListItem>();
    /**
     * @hidden @internal
     */
    public uniqueValues: IgxFilterItem[] = [];
    /**
     * @hidden @internal
     */
    public overlayService: IgxOverlayService;
    /**
     * @hidden @internal
     */
    public overlayComponentId: string;
    /**
     * @hidden @internal
     */
    public isHierarchical = false;

    private _minHeight;

    /**
     * Gets the minimum height.
     *
     * Setting value in template:
     * ```ts
     * [minHeight]="'<number><unit (px|rem|etc..)>'"
     * ```
     *
     * Example for setting a value:
     * ```ts
     * [minHeight]="'700px'"
     * ```
     */
    @Input()
    public get minHeight(): string {
        if (this._minHeight || this._minHeight === 0) {
            return this._minHeight;
        }
    }

    /**
     * Sets the minimum height.
     */
    public set minHeight(value: string) {
        this._minHeight = value;
    }


    private _maxHeight: string;
    private containsNullOrEmpty = false;
    private selectAllSelected = true;
    private selectAllIndeterminate = false;
    private filterValues = new Set<any>();
    private _column: ColumnType;
    private subscriptions: Subscription;
    private _originalDisplay: string;

    /**
     * Gets the maximum height.
     *
     * Setting value in template:
     * ```ts
     * [maxHeight]="'<number><unit (px|rem|etc..)>'"
     * ```
     *
     * Example for setting a value:
     * ```ts
     * [maxHeight]="'700px'"
     * ```
     */
    @Input()
    @HostBinding('style.max-height')
    public get maxHeight(): string {
        if (this._maxHeight) {
            return this._maxHeight;
        }
    }

    /**
     * Sets the maximum height.
     */
    public set maxHeight(value: string) {
        this._maxHeight = value;
    }

    /**
     * @hidden @internal
     */
    public get grid(): GridType {
        return this.column?.grid ?? this.gridAPI;
    }

    constructor(
        cdr: ChangeDetectorRef,
        element: ElementRef<HTMLElement>,
        platform: PlatformUtil,
        @Inject(DOCUMENT)
        private document: any,
        @Host() @Optional() @Inject(IGX_GRID_BASE) protected gridAPI?: GridType,
    ) {
        super(cdr, element, platform);
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy(): void {
        this.subscriptions?.unsubscribe();
        delete this.overlayComponentId;
    }

    /**
     * @hidden @internal
     */
    public ngAfterViewInit(): void {
        this.computedStyles = this.document.defaultView.getComputedStyle(this.element.nativeElement);
    }


    /**
     * @hidden @internal
     */
    public initialize(column: ColumnType, overlayService: IgxOverlayService) {
        this.inline = false;
        this.column = column;
        this.overlayService = overlayService;
        if (this._originalDisplay) {
            this.element.nativeElement.style.display = this._originalDisplay;
        }

        this.initialized.emit();
        this.subscriptions.add(this.grid.columnMoving.subscribe(() => this.closeDropdown()));
    }

    /**
     * @hidden @internal
     */
    public onPin() {
        this.closeDropdown();
        this.column.pinned = !this.column.pinned;
    }

    /**
     * @hidden @internal
     */
    public onSelect() {
        if (!this.column.selected) {
            this.grid.selectionService.selectColumn(this.column.field, this.grid.columnSelection === GridSelectionMode.single);
        } else {
            this.grid.selectionService.deselectColumn(this.column.field);
        }
        this.grid.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public columnSelectable() {
        return this.grid?.columnSelection !== GridSelectionMode.none && this.column?.selectable;
    }

    /**
     * @hidden @internal
     */
    public onHideToggle() {
        this.column.toggleVisibility();
        this.closeDropdown();
    }

    /**
     * @hidden @internal
     */
    public cancel() {
        if (!this.overlayComponentId) {
            this.init();
        }
        this.closeDropdown();
    }

    /**
     * @hidden @internal
     */
    public closeDropdown() {
        if (this.overlayComponentId) {
            this.overlayService.hide(this.overlayComponentId);
            this.overlayComponentId = null;
        }
    }

    /**
     * @hidden @internal
     */
    public onKeyDown(eventArgs: KeyboardEvent) {
        if (this.platform.isFilteringKeyCombo(eventArgs)) {
            eventArgs.preventDefault();
            this.closeDropdown();
        }
        eventArgs.stopPropagation();
    }

    /**
     * @hidden @internal
     */
    public hide() {
        this._originalDisplay = this.computedStyles.display;
        this.element.nativeElement.style.display = 'none';
    }

    /**
     * @hidden @internal
     */
    public detectChanges() {
        this.cdr.detectChanges();
    }

    protected computedStyles;

    protected get size(): string {
        return this.computedStyles?.getPropertyValue('--component-size');
    }

    private init() {
        this.expressionsList = new Array<ExpressionUI>();
        generateExpressionsList(this.column.filteringExpressionsTree, this.grid.filteringLogic, this.expressionsList);
        this.populateColumnData();
    }

    private areExpressionsSelectable() {
        if (this.expressionsList.length === 1 &&
            (this.expressionsList[0].expression.condition.name === 'equals' ||
                this.expressionsList[0].expression.condition.name === 'at' ||
                this.expressionsList[0].expression.condition.name === 'true' ||
                this.expressionsList[0].expression.condition.name === 'false' ||
                this.expressionsList[0].expression.condition.name === 'empty' ||
                this.expressionsList[0].expression.condition.name === 'in')) {
            return true;
        }

        const selectableExpressionsCount = this.expressionsList.filter(exp =>
            (exp.beforeOperator === 1 || exp.afterOperator === 1) &&
            (exp.expression.condition.name === 'equals' ||
                exp.expression.condition.name === 'at' ||
                exp.expression.condition.name === 'true' ||
                exp.expression.condition.name === 'false' ||
                exp.expression.condition.name === 'empty' ||
                exp.expression.condition.name === 'in')).length;

        return selectableExpressionsCount === this.expressionsList.length;
    }

    private populateColumnData() {
        this.cdr.detectChanges();

        if (this.grid.uniqueColumnValuesStrategy) {
            this.renderColumnValuesRemotely();
        } else {
            this.renderColumnValuesFromData();
        }
    }

    private renderColumnValuesRemotely() {
        this.loadingStart.emit();
        const expressionsTree: FilteringExpressionsTree = this.getColumnFilterExpressionsTree();

        const prevColumn = this.column;
        this.grid.uniqueColumnValuesStrategy(this.column, expressionsTree, (values: any[]) => {
            if (!this.column || this.column !== prevColumn) {
                return;
            }

            const items = values.map(v => ({
                value: v
            }));

            this.uniqueValues = this.column.sortStrategy.sort(items, 'value', SortingDirection.Asc, this.column.sortingIgnoreCase,
                (obj, key) => {
                    let resolvedValue = obj[key];
                    if (this.column.dataType === GridColumnDataType.Time) {
                        resolvedValue = new Date().setHours(
                            resolvedValue.getHours(),
                            resolvedValue.getMinutes(),
                            resolvedValue.getSeconds(),
                            resolvedValue.getMilliseconds());
                    }

                    return resolvedValue;
                });

            this.renderValues();
            this.loadingEnd.emit();
        });
    }

    private renderColumnValuesFromData() {
        this.loadingStart.emit();

        const expressionsTree = this.getColumnFilterExpressionsTree();
        const promise = this.grid.filterStrategy.getFilterItems(this.column, expressionsTree);
        promise.then((items) => {
            this.isHierarchical = items.length > 0 && items.some(i => i.children && i.children.length > 0);
            this.uniqueValues = items;
            this.renderValues();
            this.loadingEnd.emit();
            this.sortingChanged.emit();
        });
    }

    private renderValues() {
        this.filterValues = this.generateFilterValues();
        this.generateListData();
        this.expressionsList.forEach(expr => {
            if (this.column.dataType === GridColumnDataType.String && this.column.filteringIgnoreCase
                && expr.expression.searchVal && expr.expression.searchVal instanceof Set) {
                this.modifyExpression(expr);
            }
        });
    }

    private generateFilterValues() {
        const formatValue = (value: any): any => {
            if (!value) return value;

            switch (this.column.dataType) {
                case GridColumnDataType.Date:
                    return new Date(value).toDateString();
                case GridColumnDataType.DateTime:
                    return new Date(value).toISOString();
                case GridColumnDataType.Time:
                    return typeof value === 'string' ? value : new Date(value).toLocaleTimeString();
                default:
                    return value;
            }
        };

        const processExpression = (arr: any[], e: any): any[] => {
            if (e.expression.condition.name === 'in') {
                return [...arr, ...Array.from((e.expression.searchVal as Set<any>).values()).map(v => formatValue(v))];
            }
            return [...arr, formatValue(e.expression.searchVal)];
        };

        const filterValues = new Set<any>(this.expressionsList.reduce(processExpression, []));

        return filterValues;
    }

    private modifyExpression(expr: ExpressionUI) {
        const lowerCaseFilterValues = new Set(Array.from(expr.expression.searchVal).map((value: string) => value.toLowerCase()));

        this.grid.data.forEach(item => {
            if (lowerCaseFilterValues.has(item[this.column.field]?.toLowerCase())) {
                expr.expression.searchVal.add(item[this.column.field]);
            }
        });
    }

    private generateListData() {
        this.listData = new Array<FilterListItem>();
        const shouldUpdateSelection = this.areExpressionsSelectable();

        if (this.column.dataType === GridColumnDataType.Boolean) {
            this.addBooleanItems();
        } else {
            this.addItems(shouldUpdateSelection);
        }

        if (!this.isHierarchical && this.containsNullOrEmpty) {
            const blanksItem = this.generateBlanksItem(shouldUpdateSelection);
            this.listData.unshift(blanksItem);
        }

        if (this.listData.length > 0) {
            this.addSelectAllItem();
        }

        if (!(this.cdr as any).destroyed) {
            this.cdr.detectChanges();
        }

        this.listDataLoaded.emit();
    }

    private getColumnFilterExpressionsTree() {
        const gridExpressionsTree: IFilteringExpressionsTree = this.grid.filteringExpressionsTree;
        const expressionsTree = new FilteringExpressionsTree(gridExpressionsTree.operator, gridExpressionsTree.fieldName);

        for (const operand of gridExpressionsTree.filteringOperands) {
            if (operand instanceof FilteringExpressionsTree) {
                const columnExprTree = operand as FilteringExpressionsTree;
                if (columnExprTree.fieldName === this.column.field) {
                    continue;
                }
            }
            expressionsTree.filteringOperands.push(operand);
        }

        return expressionsTree;
    }

    private addBooleanItems() {
        this.selectAllSelected = true;
        this.selectAllIndeterminate = false;
        this.uniqueValues.forEach(element => {
            const value = element.value;
            const filterListItem = new FilterListItem();
            if (value !== undefined && value !== null && value !== '') {
                if (this.column.filteringExpressionsTree) {
                    if (value === true && this.expressionsList.find(exp => exp.expression.condition.name === 'true')) {
                        filterListItem.isSelected = true;
                        filterListItem.isFiltered = true;
                        this.selectAllIndeterminate = true;
                    } else if (value === false && this.expressionsList.find(exp => exp.expression.condition.name === 'false')) {
                        filterListItem.isSelected = true;
                        filterListItem.isFiltered = true;
                        this.selectAllIndeterminate = true;
                    } else {
                        filterListItem.isSelected = false;
                        filterListItem.isFiltered = false;
                    }
                } else {
                    filterListItem.isSelected = true;
                    filterListItem.isFiltered = true;
                }
                filterListItem.value = value;
                filterListItem.label = value ?
                    this.grid.resourceStrings.igx_grid_filter_true :
                    this.grid.resourceStrings.igx_grid_filter_false;
                filterListItem.indeterminate = false;
                this.listData.push(filterListItem);
            } else {
                this.containsNullOrEmpty = true;
            }
        });
    }

    private addItems(shouldUpdateSelection: boolean) {
        this.selectAllSelected = true;
        this.selectAllIndeterminate = false;
        this.containsNullOrEmpty = false;
        this.listData = this.generateFilterListItems(this.uniqueValues, shouldUpdateSelection);
        this.containsNullOrEmpty = this.uniqueValues.length > this.listData.length;
    }

    private generateFilterListItems(values: IgxFilterItem[], shouldUpdateSelection: boolean, parent?: FilterListItem) {
        const filterListItems = [];
        values?.forEach(element => {
            const value = element.value;
            const hasValue = value !== undefined && value !== null && value !== '';

            if (hasValue) {
                const filterListItem = new FilterListItem();
                filterListItem.parent = parent;
                filterListItem.value = value;
                filterListItem.label = element.label !== undefined ?
                    element.label :
                    this.getFilterItemLabel(value);
                filterListItem.indeterminate = false;
                filterListItem.isSelected = true;
                filterListItem.isFiltered = true;

                if (this.column.filteringExpressionsTree) {
                    filterListItem.isSelected = false;
                    filterListItem.isFiltered = false;

                    if (shouldUpdateSelection) {
                        const exprValue = this.getExpressionValue(value);
                        if (this.filterValues.has(exprValue)) {
                            filterListItem.isSelected = true;
                            filterListItem.isFiltered = true;
                        }
                        this.selectAllIndeterminate = true;
                    } else {
                        this.selectAllSelected = false;
                    }
                }

                filterListItem.children = this.generateFilterListItems(element.children ?? element.value?.children, shouldUpdateSelection, filterListItem);
                filterListItems.push(filterListItem);
            }
        });

        return filterListItems;
    }

    private addSelectAllItem() {
        const selectAll = new FilterListItem();
        selectAll.isSelected = this.selectAllSelected;
        selectAll.value = this.grid.resourceStrings.igx_grid_excel_select_all;
        selectAll.label = this.grid.resourceStrings.igx_grid_excel_select_all;
        selectAll.indeterminate = this.selectAllIndeterminate;
        selectAll.isSpecial = true;
        selectAll.isFiltered = this.selectAllSelected;
        this.listData.unshift(selectAll);
    }

    private generateBlanksItem(shouldUpdateSelection) {
        const blanks = new FilterListItem();
        if (this.column.filteringExpressionsTree) {
            if (shouldUpdateSelection) {
                if (this.filterValues.has(null)) {
                    blanks.isSelected = true;
                    blanks.isFiltered = true;
                } else {
                    blanks.isSelected = false;
                    blanks.isFiltered = false;
                }
            }
        } else {
            blanks.isSelected = true;
            blanks.isFiltered = true;
        }
        blanks.value = null;
        blanks.label = this.grid.resourceStrings.igx_grid_excel_blanks;
        blanks.indeterminate = false;
        blanks.isSpecial = true;
        blanks.isBlanks = true;

        return blanks;
    }

    private getFilterItemLabel(value: any, applyFormatter = true, data?: any) {
        if (this.column.formatter) {
            if (applyFormatter) {
                return this.column.formatter(value, data);
            }
            return value;
        }

        const { display, format, digitsInfo, currencyCode, timezone } = this.column.pipeArgs;
        const locale = this.grid.locale;

        switch (this.column.dataType) {
            case GridColumnDataType.Date:
            case GridColumnDataType.DateTime:
            case GridColumnDataType.Time:
                return formatDate(value, format, locale, timezone);
            case GridColumnDataType.Currency:
                return formatCurrency(value, currencyCode || getLocaleCurrencyCode(locale), display, digitsInfo, locale);
            case GridColumnDataType.Number:
                return formatNumber(value, locale, digitsInfo);
            case GridColumnDataType.Percent:
                return formatPercent(value, locale, digitsInfo);
            default:
                return value;
        }
    }

    private getExpressionValue(value: any): string {
        if (this.column.dataType === GridColumnDataType.Date) {
            value = value ? new Date(value).toDateString() : value;
        } else if (this.column.dataType === GridColumnDataType.DateTime) {
            value = value ? new Date(value).toISOString() : value;
        } else if (this.column.dataType === GridColumnDataType.Time) {
            value = value ? new Date(value).toLocaleTimeString() : value;
        }

        return value;
    }
}
