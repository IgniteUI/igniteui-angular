import {
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
import { resolveNestedPath, parseDate, uniqueDates, PlatformUtil, formatDate, formatCurrency } from '../../../core/utils';
import { GridColumnDataType } from '../../../data-operations/data-util';
import { Subscription } from 'rxjs';
import { DisplayDensity } from '../../../core/density';
import { GridSelectionMode } from '../../common/enums';
import { FormattedValuesFilteringStrategy } from '../../../data-operations/filtering-strategy';
import { TreeGridFormattedValuesFilteringStrategy } from '../../tree-grid/tree-grid.filtering.strategy';
import { formatNumber, formatPercent, getLocaleCurrencyCode } from '@angular/common';
import { BaseFilteringComponent } from './base-filtering.component';
import { ExpressionUI, FilterListItem, generateExpressionsList } from './common';
import { ColumnType, GridType, IGX_GRID_BASE } from '../../common/grid.interface';
import { IgxOverlayService } from '../../../services/overlay/overlay';
import { SortingDirection } from '../../../data-operations/sorting-strategy';


@Directive({
    selector: 'igx-excel-style-column-operations,[igxExcelStyleColumnOperations]'
})
export class IgxExcelStyleColumnOperationsTemplateDirective { }

@Directive({
    selector: 'igx-excel-style-filter-operations,[igxExcelStyleFilterOperations]'
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
    providers: [{ provide: BaseFilteringComponent, useExisting: forwardRef(() => IgxGridExcelStyleFilteringComponent)}],
    selector: 'igx-grid-excel-style-filtering',
    templateUrl: './grid.excel-style-filtering.component.html'
})
export class IgxGridExcelStyleFilteringComponent extends BaseFilteringComponent implements OnDestroy {

    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-excel-filter')
    public defaultClass = true;

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
     * An @Input property that sets the column.
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
            this.subscriptions.add(this.grid.onDensityChanged.subscribe(() => this.detectChanges()));
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
    public uniqueValues = [];
    /**
     * @hidden @internal
     */
    public overlayService: IgxOverlayService;
    /**
     * @hidden @internal
     */
    public overlayComponentId: string;

    private _minHeight;

    /**
     * Gets the minimum height.
     */
    @Input()
    public get minHeight(): string {
        if (this._minHeight || this._minHeight === 0) {
            return this._minHeight;
        }

        if (!this.inline) {
            let minHeight = 645;
            switch (this.displayDensity) {
                case DisplayDensity.cosy: minHeight = 465; break;
                case DisplayDensity.compact: minHeight = 330; break;
                default: break;
            }
            return `${minHeight}px`;
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
     */
    @Input()
    @HostBinding('style.max-height')
    public get maxHeight(): string {
        if (this._maxHeight) {
            return this._maxHeight;
        }

        if (!this.inline) {
            let maxHeight = 775;
            switch (this.displayDensity) {
                case DisplayDensity.cosy: maxHeight = 565; break;
                case DisplayDensity.compact: maxHeight = 405; break;
                default: break;
            }
            return `${maxHeight}px`;
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

    /**
     * @hidden @internal
     */
    public get displayDensity() {
        return this.grid?.displayDensity;
    }

    constructor(
        protected cdr: ChangeDetectorRef,
        public element: ElementRef<HTMLElement>,
        protected platform: PlatformUtil,
        @Host() @Optional() @Inject(IGX_GRID_BASE) protected gridAPI?: GridType) {
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
        this._originalDisplay = document.defaultView.getComputedStyle(this.element.nativeElement).display;
        this.element.nativeElement.style.display = 'none';
    }

    /**
     * @hidden @internal
     */
    public detectChanges() {
        this.cdr.detectChanges();
    }

    /**
     * @hidden @internal
     */
    public isTreeGrid() {
        return this.grid.records !== undefined;
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

    private areExpressionsValuesInTheList() {
        if (this.column.dataType === GridColumnDataType.Boolean) {
            return true;
        }

        if (this.filterValues.size === 1) {
            const firstValue = this.filterValues.values().next().value;

            if (!firstValue && firstValue !== 0) {
                return true;
            }
        }

        for (const expression of this.uniqueValues) {
            const value = this.getExpressionValue(expression);
            if (this.filterValues.has(value)) {
                return true;
            }
        }

        return false;
    }

    private populateColumnData() {
        if (this.grid.uniqueColumnValuesStrategy) {
            this.cdr.detectChanges();
            this.renderColumnValuesRemotely();
        } else {
            this.renderColumnValuesFromData();
        }
    }

    private renderColumnValuesRemotely() {
        this.loadingStart.emit();
        const expressionsTree: FilteringExpressionsTree = this.getColumnFilterExpressionsTree();

        const prevColumn = this.column;
        this.grid.uniqueColumnValuesStrategy(this.column, expressionsTree, (colVals: any[]) => {
            if (!this.column || this.column !== prevColumn) {
                return;
            }

            const columnValues = (this.column.dataType === GridColumnDataType.Date) ?
                colVals.map(value => {
                    const label = this.getFilterItemLabel(value);
                    return { label, value };
                }) : colVals;

            this.renderValues(columnValues);
            this.loadingEnd.emit();
        });
    }

    private shouldFormatValues() {
        return this.column.formatter &&
            (this.grid.filterStrategy instanceof FormattedValuesFilteringStrategy ||
                this.grid.filterStrategy instanceof TreeGridFormattedValuesFilteringStrategy) &&
            this.grid.filterStrategy.shouldApplyFormatter(this.column.field);
    }

    private processedData: any[];

    private renderColumnValuesFromData() {
        const expressionsTree = this.getColumnFilterExpressionsTree();
        // TODO: Check why we access the API service through the column ??
        // const data = this.column.gridAPI.filterDataByExpressions(expressionsTree);
        const data = this.grid.gridAPI.filterDataByExpressions(expressionsTree);
        this.processedData = [];

        const shouldFormatValues = this.shouldFormatValues();
        const columnField = this.column.field;
        let columnValues;
        
        if (this.grid.childDataKey !== undefined) {
            // TODO: add check for DATE
            columnValues = data.map(record => {
                if (this.processedData.indexOf(record) < 0) {
                    let value = resolveNestedPath(record, columnField);
                    if (shouldFormatValues) {
                        value = this.column.formatter(value, record);
                    }
                    const childrenValues = this.getChildrenColumnValues(record, columnField)
                    return { value, childrenValues };
                }
            });

            columnValues = columnValues.filter(function(el) {
                return el !== undefined
            });
        } else {
            columnValues = (this.column.dataType === GridColumnDataType.Date) ?
                data.map(record => {
                    const value = (resolveNestedPath(record, columnField));
                    const label = this.getFilterItemLabel(value, true, record);
                    return { label, value };
                }) : data.map(record => {
                    const value = resolveNestedPath(record, columnField);
                    return shouldFormatValues ? this.column.formatter(value, record) : value;
                });
        }

        this.renderValues(columnValues);
    }

    private getChildrenColumnValues(record: any, columnField: string) {
        this.processedData.push(record);
        let childrenValues = [];
        const children = record[this.grid.childDataKey];
        if (children) {
            children.forEach(child => {
                if (this.processedData.indexOf(child) < 0) {
                    let value = resolveNestedPath(child, columnField);
                    // if (shouldFormatValues) {
                    //     value = this.column.formatter(value, record);
                    // }
                    childrenValues.push({ value, childrenValues: this.getChildrenColumnValues(child, columnField) });
                }
            });
        } else {
            // TODO: uniqueValues
        }

        return childrenValues;
    }

    private renderValues(columnValues: any[]) {
        if (this.grid.childDataKey !== undefined) {
            this.uniqueValues = columnValues;
        } else {
            this.uniqueValues = this.generateUniqueValues(columnValues);
        }

        this.filterValues = this.generateFilterValues(this.column.dataType === GridColumnDataType.Date || this.column.dataType === GridColumnDataType.DateTime);
        this.generateListData();
    }

    private generateUniqueValues(columnValues: any[]) {
        let uniqueValues;

        if (this.column.dataType === GridColumnDataType.String && this.column.filteringIgnoreCase) {
            const filteredUniqueValues = columnValues.map(s => s?.toString().toLowerCase())
                .reduce((map, val, i) => map.get(val) ? map : map.set(val, columnValues[i]), new Map());
            uniqueValues = Array.from(filteredUniqueValues.values());
        } else if (this.column.dataType === GridColumnDataType.DateTime) {
            uniqueValues = Array.from(new Set(columnValues.map(v => v?.toLocaleString())));
            uniqueValues.forEach((d, i) => uniqueValues[i] = d ? new Date(d) : d);
        } else if (this.column.dataType === GridColumnDataType.Time) {
            uniqueValues = Array.from(new Set(columnValues.map(v => {
                if (v) {
                    v = new Date(v);
                    return new Date().setHours(v.getHours(), v.getMinutes(), v.getSeconds());
                } else {
                    return v;
                }
            })));
            uniqueValues.forEach((d, i) => uniqueValues[i] = d ? new Date(d) : d);
        } else {
            uniqueValues = this.column.dataType === GridColumnDataType.Date ?
                uniqueDates(columnValues) : Array.from(new Set(columnValues));
        }

        return uniqueValues;
    }

    private generateFilterValues(isDateColumn: boolean = false) {
        let filterValues;

        if (isDateColumn) {
            filterValues = new Set<any>(this.expressionsList.reduce((arr, e) => {
                if (e.expression.condition.name === 'in') {
                    return [...arr, ...Array.from((e.expression.searchVal as Set<any>).values()).map(v =>
                        new Date(v).toISOString())];
                }
                return [...arr, ...[e.expression.searchVal ? e.expression.searchVal.toISOString() : e.expression.searchVal]];
            }, []));
        } else if (this.column.dataType === GridColumnDataType.Time) {
            filterValues = new Set<any>(this.expressionsList.reduce((arr, e) => {
                if (e.expression.condition.name === 'in') {
                    return [...arr, ...Array.from((e.expression.searchVal as Set<any>).values()).map(v =>
                        typeof v === 'string' ? v : new Date(v).toLocaleTimeString())];
                }
                return [...arr, ...[e.expression.searchVal ? e.expression.searchVal.toLocaleTimeString() : e.expression.searchVal]];
            }, []));
        } else {
            filterValues = new Set<any>(this.expressionsList.reduce((arr, e) => {
                if (e.expression.condition.name === 'in') {
                    return [...arr, ...Array.from((e.expression.searchVal as Set<any>).values())];
                }
                return [...arr, ...[e.expression.searchVal]];
            }, []));
        }

        return filterValues;
    }

    private generateListData() {
        this.listData = new Array<FilterListItem>();
        const shouldUpdateSelection = this.areExpressionsSelectable() && this.areExpressionsValuesInTheList();

        if (this.column.dataType === GridColumnDataType.Boolean) {
            this.addBooleanItems();
        } else {
            this.addItems(shouldUpdateSelection);
        }

        this.listData = this.column.sortStrategy.sort(this.listData, 'value', SortingDirection.Asc, this.column.sortingIgnoreCase,
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

        if (this.containsNullOrEmpty) {
            this.addBlanksItem(shouldUpdateSelection);
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
                    break;
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
            const filterListItem = new FilterListItem();
            if (element !== undefined && element !== null && element !== '') {
                if (this.column.filteringExpressionsTree) {
                    if (element === true && this.expressionsList.find(exp => exp.expression.condition.name === 'true')) {
                        filterListItem.isSelected = true;
                        filterListItem.isFiltered = true;
                        this.selectAllIndeterminate = true;
                    } else if (element === false && this.expressionsList.find(exp => exp.expression.condition.name === 'false')) {
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
                filterListItem.value = element;
                filterListItem.label = element ?
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
        this.containsNullOrEmpty = false;
        this.selectAllIndeterminate = false;
        this.listData = this.generateFilterListItems(this.uniqueValues, shouldUpdateSelection);
        this.containsNullOrEmpty = this.uniqueValues.length > this.listData.length;
    }

    private generateFilterListItems(values: any[], shouldUpdateSelection: boolean) {
        let filterListItems = [];
        const applyFormatter = !this.shouldFormatValues();
        values?.forEach(element => {
            const hasValue = (element !== undefined && element !== null && element !== ''
                && this.column.dataType !== GridColumnDataType.Date)
                || !!(element && element.label);

            if (hasValue) {
                const filterListItem = new FilterListItem();
                filterListItem.isSelected = true;
                filterListItem.isFiltered = true;

                if (this.column.filteringExpressionsTree) {
                    filterListItem.isSelected = false;
                    filterListItem.isFiltered = false;

                    if (shouldUpdateSelection) {
                        const value = this.getExpressionValue(element);
                        if (this.filterValues.has(value)) {
                            filterListItem.isSelected = true;
                            filterListItem.isFiltered = true;
                        }
                        this.selectAllIndeterminate = true;
                    } else {
                        this.selectAllSelected = false;
                    }
                }
                filterListItem.value = this.getFilterItemValue(element);
                filterListItem.label = this.getFilterItemLabel(element, applyFormatter);
                filterListItem.indeterminate = false;
                filterListItem.children = this.generateFilterListItems(element.childrenValues, shouldUpdateSelection);
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

    private addBlanksItem(shouldUpdateSelection) {
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
        this.listData.unshift(blanks);
    }

    private getFilterItemLabel(element: any, applyFormatter: boolean = true, data?: any) {
        if (this.grid.childDataKey !== undefined) {
            element = element.value;
        }

        if (element?.label) {
            return element.label;
        }

        if (this.column.formatter) {
            if (applyFormatter) {
                return this.column.formatter(element, data);
            }
            return element;
        }

        const { display, format, digitsInfo, currencyCode, timezone } = this.column.pipeArgs;
        const locale = this.grid.locale;

        switch (this.column.dataType) {
            case GridColumnDataType.Date:
            case GridColumnDataType.DateTime:
            case GridColumnDataType.Time:
                return formatDate(element, format, locale, timezone);
            case GridColumnDataType.Currency:
                return formatCurrency(element, currencyCode || getLocaleCurrencyCode(locale), display, digitsInfo, locale);
            case GridColumnDataType.Number:
                return formatNumber(element, locale, digitsInfo);
            case GridColumnDataType.Percent:
                return formatPercent(element, locale, digitsInfo);
            default:
                return element;
        }
    }

    private getFilterItemValue(element: any) {
        if (this.grid.childDataKey !== undefined) {
            element = element.value;
        }

        if (this.column.dataType === GridColumnDataType.Date) {
            element = parseDate(element.value);
        }

        return element;
    }

    private getExpressionValue(element: any): string {
        let value;
        if (this.column.dataType === GridColumnDataType.Date) {
            value = element && element.value ? new Date(element.value).toISOString() : element.value;
        } else if (this.column.dataType === GridColumnDataType.DateTime) {
            value = element ? new Date(element).toISOString() : element;
        } else if (this.column.dataType === GridColumnDataType.Time) {
            value = element ? new Date(element).toLocaleTimeString() : element;
        } else {
            value = element;
        }
        return value;
    }
}
