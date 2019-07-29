import {
    ChangeDetectorRef,
    Component,
    ViewChild,
    HostBinding,
    ChangeDetectionStrategy,
    TemplateRef,
    Directive,
    OnDestroy,
    AfterViewInit,
    ElementRef
} from '@angular/core';
import {
    HorizontalAlignment,
    VerticalAlignment,
    ConnectedPositioningStrategy,
    OverlaySettings,
    IgxOverlayService,
    AbsoluteScrollStrategy
} from '../../../services/index';
import { IgxFilteringService, ExpressionUI } from '../grid-filtering.service';
import { IgxToggleDirective } from '../../../directives/toggle/toggle.directive';
import {
    IFilteringOperation,
    IgxStringFilteringOperand,
    IgxNumberFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxDateFilteringOperand
} from '../../../data-operations/filtering-condition';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../../data-operations/filtering-expressions-tree';
import { FilteringLogic, IFilteringExpression } from '../../../data-operations/filtering-expression.interface';
import { cloneArray, KEYS } from '../../../core/utils';
import { DataType, DataUtil } from '../../../data-operations/data-util';
import { IgxExcelStyleSearchComponent } from './excel-style-search.component';
import { IgxExcelStyleCustomDialogComponent } from './excel-style-custom-dialog.component';
import { Subscription, Subject } from 'rxjs';
import { IgxExcelStyleSortingComponent } from './excel-style-sorting.component';
import { takeUntil } from 'rxjs/operators';
import { ISelectionEventArgs, IgxDropDownComponent } from '../../../drop-down';
import { IgxColumnComponent } from '../../column.component';

/**
 *@hidden
 */
export class FilterListItem {
    public value: any;
    public label: any;
    public isSelected: boolean;
    public indeterminate: boolean;
    public isSpecial = false;
}

@Directive({
    selector: '[igxExcelStyleSortingTemplate]'
})
export class IgxExcelStyleSortingTemplateDirective {
    constructor(public template: TemplateRef<any>) {}
}

@Directive({
    selector: '[igxExcelStyleMovingTemplate]'
})
export class IgxExcelStyleMovingTemplateDirective {
    constructor(public template: TemplateRef<any>) {}
}

@Directive({
    selector: '[igxExcelStyleHidingTemplate]'
})
export class IgxExcelStyleHidingTemplateDirective {
    constructor(public template: TemplateRef<any>) {}
}

@Directive({
    selector: '[igxExcelStylePinningTemplate]'
})
export class IgxExcelStylePinningTemplateDirective {
    constructor(public template: TemplateRef<any>) {}
}

/**
 * @hidden
 */
 @Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-excel-style-filtering',
    templateUrl: './grid.excel-style-filtering.component.html'
})
export class IgxGridExcelStyleFilteringComponent implements OnDestroy, AfterViewInit {
    private static readonly filterOptimizationThreshold = 2;

    private shouldOpenSubMenu = true;
    private expressionsList = new Array<ExpressionUI>();
    private destroy$ = new Subject<boolean>();
    private containsNullOrEmpty = false;
    private selectAllSelected = true;
    private selectAllIndeterminate = false;
    private filterValues = new Set<any>();

    protected columnMoving = new Subscription();

    public column: IgxColumnComponent;
    public filteringService: IgxFilteringService;
    public listData = new Array<FilterListItem>();
    public uniqueValues = [];
    public overlayService: IgxOverlayService;
    public overlayComponentId: string;

    private _subMenuPositionSettings = {
        verticalStartPoint: VerticalAlignment.Top
    };

    private _subMenuOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._subMenuPositionSettings),
        scrollStrategy: new AbsoluteScrollStrategy()
    };

    @HostBinding('class.igx-excel-filter')
    className = 'igx-excel-filter';

    @ViewChild('dropdown', { read: ElementRef })
    public mainDropdown: ElementRef;

    @ViewChild('subMenu', { read: IgxDropDownComponent })
    public subMenu: IgxDropDownComponent;

    @ViewChild('customDialog', { read: IgxExcelStyleCustomDialogComponent })
    public customDialog: IgxExcelStyleCustomDialogComponent;

    @ViewChild('excelStyleSearch', { read: IgxExcelStyleSearchComponent })
    protected excelStyleSearch: IgxExcelStyleSearchComponent;

    @ViewChild('excelStyleSorting', { read: IgxExcelStyleSortingComponent })
    protected excelStyleSorting: IgxExcelStyleSortingComponent;

    @ViewChild('defaultExcelStyleSortingTemplate', { read: TemplateRef })
    protected defaultExcelStyleSortingTemplate: TemplateRef<any>;

    @ViewChild('defaultExcelStyleHidingTemplate', { read: TemplateRef })
    protected defaultExcelStyleHidingTemplate: TemplateRef<any>;

    @ViewChild('defaultExcelStyleMovingTemplate', { read: TemplateRef })
    protected defaultExcelStyleMovingTemplate: TemplateRef<any>;

    @ViewChild('defaultExcelStylePinningTemplate', { read: TemplateRef })
    protected defaultExcelStylePinningTemplate: TemplateRef<any>;

    get grid(): any {
        return this.filteringService.grid;
    }

    get conditions() {
        return this.column.filters.conditionList();
    }

    get subMenuText() {
        switch (this.column.dataType) {
            case DataType.Boolean:
                return this.grid.resourceStrings.igx_grid_excel_boolean_filter;
            case DataType.Number:
                return this.grid.resourceStrings.igx_grid_excel_number_filter;
            case DataType.Date:
                return this.grid.resourceStrings.igx_grid_excel_date_filter;
            default:
                return this.grid.resourceStrings.igx_grid_excel_text_filter;
        }
    }

    constructor(public cdr: ChangeDetectorRef) {}

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    ngAfterViewInit(): void {
        this.expressionsList = new Array<ExpressionUI>();
        this.filteringService.generateExpressionsList(this.column.filteringExpressionsTree, this.grid.filteringLogic, this.expressionsList);
        if (this.expressionsList && this.expressionsList.length &&
            this.expressionsList[0].expression.condition.name !== 'in') {
            this.customDialog.expressionsList = this.expressionsList;
        }
        this.populateColumnData();

        if (this.excelStyleSorting) {
            const se = this.grid.sortingExpressions.find(expr => expr.fieldName === this.column.field);
            if (se) {
                this.excelStyleSorting.selectButton(se.dir);
            }
        }

        requestAnimationFrame(() => {
            this.excelStyleSearch.searchInput.nativeElement.focus();
        });
    }

    public clearFilterClass() {
        if (this.column.filteringExpressionsTree) {
            return 'igx-excel-filter__actions-clear';
        }

        return 'igx-excel-filter__actions-clear--disabled';
    }

    public initialize(column: IgxColumnComponent, filteringService: IgxFilteringService, overlayService: IgxOverlayService,
        overlayComponentId: string) {
        this.column = column;
        this.filteringService = filteringService;
        this.overlayService = overlayService;
        this.overlayComponentId = overlayComponentId;

        this._subMenuOverlaySettings.outlet = this.grid.outlet;

        this.columnMoving = this.grid.onColumnMoving.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.closeDropdown();
        });
    }

    /**
     * Returns the filtering operation condition for a given value.
     */
    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.condition(value);
    }

    /**
     * Returns the translated condition name for a given value.
     */
    public translateCondition(value: string): string {
        return this.grid.resourceStrings[`igx_grid_filter_${this.getCondition(value).name}`] || value;
    }

    public onPin() {
        this.column.pinned = !this.column.pinned;
        this.closeDropdown();
    }

    public onHide() {
        this.column.hidden = true;
        this.grid.onColumnVisibilityChanged.emit({ column: this.column, newValue: true });
        this.closeDropdown();
    }

    public onTextFilterClick(eventArgs) {
        if (this.shouldOpenSubMenu) {
            this._subMenuOverlaySettings.positionStrategy.settings.target = eventArgs.currentTarget;

            const gridRect = this.grid.nativeElement.getBoundingClientRect();
            const dropdownRect = this.mainDropdown.nativeElement.getBoundingClientRect();

            let x = dropdownRect.left + dropdownRect.width;
            let x1 = gridRect.left + gridRect.width;
            x += window.pageXOffset;
            x1 += window.pageXOffset;
            if (Math.abs(x - x1) < 200) {
                this._subMenuOverlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Left;
                this._subMenuOverlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Left;
            } else {
                this._subMenuOverlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Right;
                this._subMenuOverlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Right;
            }

            this.subMenu.open(this._subMenuOverlaySettings);
            this.shouldOpenSubMenu = false;
        }
    }

    public onTextFilterKeyDown(eventArgs) {
        if (eventArgs.key === KEYS.ENTER) {
            this.onTextFilterClick(eventArgs);
        }
    }

    public onSubMenuClosed() {
        requestAnimationFrame(() => {
            this.shouldOpenSubMenu = true;
        });
    }

    public onSubMenuSelection(eventArgs: ISelectionEventArgs) {
        this.customDialog.selectedOperator = eventArgs.newSelection.value;
        eventArgs.cancel = true;
        this.mainDropdown.nativeElement.style.display = 'none';
        this.subMenu.close();
        this.customDialog.open();
    }

    private areExpressionsSelectable () {
        if (this.expressionsList.length === 1 &&
            (this.expressionsList[0].expression.condition.name === 'equals' ||
             this.expressionsList[0].expression.condition.name === 'true' ||
             this.expressionsList[0].expression.condition.name === 'false' ||
             this.expressionsList[0].expression.condition.name === 'empty' ||
             this.expressionsList[0].expression.condition.name === 'in')) {
            return true;
        }

        const selectableExpressionsCount = this.expressionsList.filter(exp =>
            (exp.beforeOperator === 1 || exp.afterOperator === 1) &&
            (exp.expression.condition.name === 'equals' ||
             exp.expression.condition.name === 'true' ||
             exp.expression.condition.name === 'false' ||
             exp.expression.condition.name === 'empty' ||
             exp.expression.condition.name === 'in')).length;

        return selectableExpressionsCount === this.expressionsList.length;
    }

    private areExpressionsValuesInTheList() {
        if (this.column.dataType === DataType.Boolean) {
            return true;
        }

        if (this.filterValues.size === 1) {
            const firstValue = this.filterValues.values().next().value;

            if (!firstValue && firstValue !== 0) {
                return true;
            }
        }

        for (let index = 0; index < this.uniqueValues.length; index++) {
            if (this.filterValues.has(this.uniqueValues[index])) {
                return true;
            }
        }

        return false;
    }

    public populateColumnData() {
        let data = this.column.gridAPI.get_all_data(this.grid.id);
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

        if (expressionsTree.filteringOperands.length) {
            const state = { expressionsTree: expressionsTree };
            data = DataUtil.filter(cloneArray(data), state);
        }

        if (this.column.dataType === DataType.Date) {
            this.uniqueValues = Array.from(new Set(data.map(record =>
                record[this.column.field] ? record[this.column.field].toDateString() : record[this.column.field])));
            this.filterValues = new Set<any>(this.expressionsList.reduce((arr, e) => {
                if (e.expression.condition.name === 'in') {
                    return [ ...arr, ...Array.from((e.expression.searchVal as Set<any>).values()).map(v =>
                        new Date(v).toDateString()) ];
                }
                return [ ...arr, ...[e.expression.searchVal ? e.expression.searchVal.toDateString() : e.expression.searchVal] ];
            }, []));
        } else {
            this.uniqueValues = Array.from(new Set(data.map(record => record[this.column.field])));
            this.filterValues = new Set<any>(this.expressionsList.reduce((arr, e) => {
                if (e.expression.condition.name === 'in') {
                    return [ ...arr, ...Array.from((e.expression.searchVal as Set<any>).values()) ];
                }
                return [ ...arr, ...[e.expression.searchVal] ];
            }, []));
        }
        this.listData = new Array<FilterListItem>();

        const shouldUpdateSelection = this.areExpressionsSelectable() && this.areExpressionsValuesInTheList();

        if (this.column.dataType === DataType.Boolean) {
            this.addBooleanItems();
        } else {
            this.addItems(shouldUpdateSelection);
        }

        this.listData.sort((a, b) => this.sortData(a, b));

        if (this.column.dataType === DataType.Date) {
            this.uniqueValues = this.uniqueValues.map(value => new Date(value));
        }

        if (this.containsNullOrEmpty) {
            this.addBlanksItem(shouldUpdateSelection);
        }

        this.addSelectAllItem();

        this.cdr.detectChanges();
    }

    private addBooleanItems() {
        this.selectAllSelected = true;
        this.selectAllIndeterminate = false;
        this.uniqueValues.forEach(element => {
            const filterListItem = new FilterListItem();
            if (element !== undefined && element !== null && element !== '') {
                if (this.column.filteringExpressionsTree) {
                    if (element === true && this.expressionsList.find(exp => exp.expression.condition.name === 'true' )) {
                        filterListItem.isSelected = true;
                        this.selectAllIndeterminate = true;
                    } else if (element === false && this.expressionsList.find(exp => exp.expression.condition.name === 'false' )) {
                            filterListItem.isSelected = true;
                            this.selectAllIndeterminate = true;
                    } else {
                        filterListItem.isSelected = false;
                    }
                } else {
                    filterListItem.isSelected = true;
                }
                filterListItem.value = element;
                filterListItem.label = element;
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
        this.uniqueValues.forEach(element => {
            if (element !== undefined && element !== null && element !== '') {
                const filterListItem = new FilterListItem();
                if (this.column.filteringExpressionsTree) {
                    if (shouldUpdateSelection) {
                        if (this.filterValues.has(element)) {
                            filterListItem.isSelected = true;
                        } else {
                            filterListItem.isSelected = false;
                        }
                        this.selectAllIndeterminate = true;
                    } else {
                        filterListItem.isSelected = false;
                        this.selectAllSelected = false;
                    }
                } else {
                    filterListItem.isSelected = true;
                }
                if (this.column.dataType === DataType.Date) {
                    filterListItem.value = new Date(element);
                    filterListItem.label = new Date(element);
                } else {
                    filterListItem.value = element;
                    filterListItem.label = element;
                }
                filterListItem.indeterminate = false;
                this.listData.push(filterListItem);
            } else {
                this.containsNullOrEmpty = true;
            }
        });
    }

    private addSelectAllItem() {
        const selectAll =  new FilterListItem();
        selectAll.isSelected = this.selectAllSelected;
        selectAll.value = this.grid.resourceStrings.igx_grid_excel_select_all;
        selectAll.label = this.grid.resourceStrings.igx_grid_excel_select_all;
        selectAll.indeterminate = this.selectAllIndeterminate;
        selectAll.isSpecial = true;
        this.listData.unshift(selectAll);
    }

    private addBlanksItem(shouldUpdateSelection) {
        const blanks =  new FilterListItem();
        if (this.column.filteringExpressionsTree) {
            if (shouldUpdateSelection) {
                if (this.filterValues.has(null)) {
                    blanks.isSelected = true;
                } else {
                    blanks.isSelected = false;
                }
            }
        } else {
            blanks.isSelected = true;
        }
        blanks.value = null;
        blanks.label = this.grid.resourceStrings.igx_grid_excel_blanks;
        blanks.indeterminate = false;
        blanks.isSpecial = true;
        this.listData.unshift(blanks);
    }

    private sortData(a: FilterListItem, b: FilterListItem) {
        let valueA = a.value;
        let valueB = b.value;
        if (typeof(a) === DataType.String) {
            valueA = a.value.toUpperCase();
            valueB = b.value.toUpperCase();
        }
        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }
    }

    // TODO: sort members by access modifier

    get sortingTemplate() {
        if (this.grid.excelStyleSortingTemplateDirective) {
            return this.grid.excelStyleSortingTemplateDirective.template;
        } else {
            return this.defaultExcelStyleSortingTemplate;
        }
    }

    get movingTemplate() {
        if (this.grid.excelStyleMovingTemplateDirective) {
            return this.grid.excelStyleMovingTemplateDirective.template;
        } else {
            return this.defaultExcelStyleMovingTemplate;
        }
    }

    get pinningTemplate() {
        if (this.grid.excelStylePinningTemplateDirective) {
            return this.grid.excelStylePinningTemplateDirective.template;
        } else {
            return this.defaultExcelStylePinningTemplate;
        }
    }

    get hidingTemplate() {
        if (this.grid.excelStyleHidingTemplateDirective) {
            return this.grid.excelStyleHidingTemplateDirective.template;
        } else {
            return this.defaultExcelStyleHidingTemplate;
        }
    }

    get applyButtonDisabled() {
        return  (!this.excelStyleSearch.filteredData || this.excelStyleSearch.filteredData.length === 0) ||
                (this.listData[0] && !this.listData[0].isSelected && !this.listData[0].indeterminate);
    }

    public applyFilter() {
        const filterTree = new FilteringExpressionsTree(FilteringLogic.Or, this.column.field);
        const selectedItems = this.listData.slice(1, this.listData.length).filter(el => el.isSelected === true);
        const unselectedItem = this.listData.slice(1, this.listData.length).find(el => el.isSelected === false);

        if (unselectedItem) {
            if (selectedItems.length <= IgxGridExcelStyleFilteringComponent.filterOptimizationThreshold) {
                selectedItems.forEach(element => {
                    let condition = null;
                    if (element.value !== null && element.value !== undefined) {
                        if (this.column.dataType === DataType.Boolean) {
                            condition = this.createCondition(element.value.toString());
                        } else {
                            condition = this.createCondition('equals');
                        }
                    } else {
                        condition = this.createCondition('empty');
                    }
                    filterTree.filteringOperands.push({
                        condition: condition,
                        fieldName: this.column.field,
                        ignoreCase: this.column.filteringIgnoreCase,
                        searchVal: element.value
                    });
                });
            } else {
                const blanksItemIndex = selectedItems.findIndex(e => e.value === null || e.value === undefined);
                let blanksItem: any;
                if (blanksItemIndex >= 0) {
                    blanksItem = selectedItems[blanksItemIndex];
                    selectedItems.splice(blanksItemIndex, 1);
                }

                filterTree.filteringOperands.push({
                    condition: this.createCondition('in'),
                    fieldName: this.column.field,
                    ignoreCase: this.column.filteringIgnoreCase,
                    searchVal: new Set(this.column.dataType === DataType.Date ?
                        selectedItems.map(d => new Date(d.value.getFullYear(), d.value.getMonth(), d.value.getDate()).toISOString()) :
                        selectedItems.map(e => e.value))
                });

                if (blanksItem) {
                    filterTree.filteringOperands.push({
                        condition: this.createCondition('empty'),
                        fieldName: this.column.field,
                        ignoreCase: this.column.filteringIgnoreCase,
                        searchVal: blanksItem.value
                    });
                }
            }

            this.expressionsList = new Array<ExpressionUI>();
            this.filteringService.filterInternal(this.column.field, filterTree);
        } else {
            this.filteringService.clearFilter(this.column.field);
        }

        this.closeDropdown();
    }

    public closeDropdown() {
        if (this.overlayComponentId) {
            this.overlayService.hide(this.overlayComponentId);
            this.overlayComponentId = null;
        }
    }

    public onKeyDown(eventArgs) {
        if (eventArgs.key === KEYS.ESCAPE || eventArgs.key === KEYS.ESCAPE_IE) {
            this.closeDropdown();
        }
        eventArgs.stopPropagation();
    }

    public clearFilter() {
        this.filteringService.clearFilter(this.column.field);
        this.populateColumnData();
    }

    public onClearFilterKeyDown(eventArgs) {
        if (eventArgs.key === KEYS.ENTER) {
            this.clearFilter();
        }
    }

    public showCustomFilterItem(): boolean {
        const exprTree = this.column.filteringExpressionsTree;
        return exprTree && exprTree.filteringOperands && exprTree.filteringOperands.length &&
            !((exprTree.filteringOperands[0] as IFilteringExpression).condition &&
            (exprTree.filteringOperands[0] as IFilteringExpression).condition.name === 'in');
    }

    private createCondition(conditionName: string) {
        switch (this.column.dataType) {
            case DataType.Boolean:
                return IgxBooleanFilteringOperand.instance().condition(conditionName);
            case DataType.Number:
                return IgxNumberFilteringOperand.instance().condition(conditionName);
            case DataType.Date:
                return IgxDateFilteringOperand.instance().condition(conditionName);
            default:
                return IgxStringFilteringOperand.instance().condition(conditionName);
        }
    }
}
