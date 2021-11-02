import {
    AfterViewInit,
    Component,
    ViewChild,
    ChangeDetectorRef,
    TemplateRef,
    Directive,
    OnDestroy,
    HostBinding
} from '@angular/core';
import { IgxInputDirective } from '../../../directives/input/input.directive';
import { DisplayDensity } from '../../../core/density';
import { IgxForOfDirective } from '../../../directives/for-of/for_of.directive';
import { FilteringExpressionsTree } from '../../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../../data-operations/filtering-expression.interface';
import { GridColumnDataType } from '../../../data-operations/data-util';
import {
    IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand,
    IgxStringFilteringOperand, IgxDateTimeFilteringOperand, IgxTimeFilteringOperand
} from '../../../data-operations/filtering-condition';
import { Subject } from 'rxjs';
import { IgxListComponent } from '../../../list/public_api';
import { IChangeCheckboxEventArgs } from '../../../checkbox/checkbox.component';
import { takeUntil } from 'rxjs/operators';
import { PlatformUtil } from '../../../core/utils';
import { BaseFilteringComponent } from './base-filtering.component';
import { ExpressionUI, FilterListItem } from './common';

@Directive({
    selector: '[igxExcelStyleLoading]'
})
export class IgxExcelStyleLoadingValuesTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

/**
 * A component used for presenting Excel style search UI.
 */
@Component({
    selector: 'igx-excel-style-search',
    templateUrl: './excel-style-search.component.html'
})
export class IgxExcelStyleSearchComponent implements AfterViewInit, OnDestroy {
    private static readonly filterOptimizationThreshold = 2;

    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-excel-filter__menu-main')
    public defaultClass = true;

    /**
     * @hidden @internal
     */
    @ViewChild('input', { read: IgxInputDirective, static: true })
    public searchInput: IgxInputDirective;

    /**
     * @hidden @internal
     */
    @ViewChild('list', { read: IgxListComponent, static: true })
    public list: IgxListComponent;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxForOfDirective, { static: true })
    protected virtDir: IgxForOfDirective<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultExcelStyleLoadingValuesTemplate', { read: TemplateRef })
    protected defaultExcelStyleLoadingValuesTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    public get addToCurrentFilter(): FilterListItem {
        if (!this._addToCurrentFilter) {
            const addToCurrentFilterItem = {
                isSelected: false,
                isFiltered: false,
                indeterminate: false,
                isSpecial: true,
                isBlanks: false,
                value: this.esf.grid.resourceStrings.igx_grid_excel_add_to_filter,
                label: this.esf.grid.resourceStrings.igx_grid_excel_add_to_filter
            };

            this._addToCurrentFilter = addToCurrentFilterItem;
        }

        return this._addToCurrentFilter;
    }

    /**
     * @hidden @internal
     */
    public get isLoading() {
        return this._isLoading;
    }

    /**
     * @hidden @internal
     */
    public set isLoading(value: boolean) {
        this._isLoading = value;
        if (!(this.cdr as any).destroyed) {
            this.cdr.detectChanges();
        }
    }

    /**
     * @hidden @internal
     */
    public searchValue: any;

    /**
     * @hidden @internal
     */
    public displayedListData: FilterListItem[] = [];

    /**
     * @hidden @internal
     */
    public get valuesLoadingTemplate() {
        if (this.esf.grid?.excelStyleLoadingValuesTemplateDirective) {
            return this.esf.grid.excelStyleLoadingValuesTemplateDirective.template;
        } else {
            return this.defaultExcelStyleLoadingValuesTemplate;
        }
    }

    private _isLoading;
    private _addToCurrentFilter: FilterListItem;
    private destroy$ = new Subject<boolean>();

    constructor(public cdr: ChangeDetectorRef, public esf: BaseFilteringComponent, protected platform: PlatformUtil) {
        esf.loadingStart.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.displayedListData = [];
            this.isLoading = true;
        });
        esf.loadingEnd.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.isLoading = false;
            this.refreshSize();
        });
        esf.initialized.pipe(takeUntil(this.destroy$)).subscribe(() => {
            requestAnimationFrame(() => {
                this.searchInput.nativeElement.focus();
            });
        });
        esf.columnChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.virtDir.resetScrollPosition();
        });

        esf.listDataLoaded.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.searchValue) {
                this.clearInput();
            } else {
                this.filterListData();
            }

            this.cdr.detectChanges();
        });
    }

    public ngAfterViewInit() {
        this.refreshSize();
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden @internal
     */
    public refreshSize() {
        requestAnimationFrame(() => {
            this.virtDir?.recalcUpdateSizes();
        });
    }

    /**
     * @hidden @internal
     */
    public clearInput() {
        this.searchValue = null;
        this.filterListData();
    }

    /**
     * @hidden @internal
     */
    public onCheckboxChange(eventArgs: IChangeCheckboxEventArgs) {
        const selectedIndex = this.displayedListData.indexOf(eventArgs.checkbox.value);
        const selectAllBtn = this.displayedListData[0];

        if (selectedIndex === 0) {
            this.displayedListData.forEach(element => {
                if (element === this.addToCurrentFilter) {
                    return;
                }
                element.isSelected = eventArgs.checked;
            });

            selectAllBtn.indeterminate = false;
        } else {
            eventArgs.checkbox.value.isSelected = eventArgs.checked;
            const indexToStartSlicing = this.displayedListData.indexOf(this.addToCurrentFilter) > -1 ? 2 : 1;

            const slicedArray =
                this.displayedListData.slice(indexToStartSlicing, this.displayedListData.length);

            if (!slicedArray.find(el => el.isSelected === false)) {
                selectAllBtn.indeterminate = false;
                selectAllBtn.isSelected = true;
            } else if (!slicedArray.find(el => el.isSelected === true)) {
                selectAllBtn.indeterminate = false;
                selectAllBtn.isSelected = false;
            } else {
                selectAllBtn.indeterminate = true;
            }
        }
        eventArgs.checkbox.nativeCheckbox.nativeElement.blur();
    }

    /**
     * @hidden @internal
     */
    public get itemSize() {
        let itemSize = '40px';
        switch (this.esf.displayDensity) {
            case DisplayDensity.cosy: itemSize = '32px'; break;
            case DisplayDensity.compact: itemSize = '24px'; break;
            default: break;
        }
        return itemSize;
    }

    /**
     * @hidden @internal
     */
    public get containerSize() {
        if (this.list && this.esf.listData.length) {
            return this.list.element.nativeElement.offsetHeight;
        }

        // GE Nov 1st, 2021 #10355 Return a numeric value, so the chunk size is calculated properly.
        // If we skip this branch, on applying the filter the _calculateChunkSize() method off the ForOfDirective receives
        // an igxForContainerSize = undefined, thus assigns the chunkSize to the igxForOf.length which leads to performance issues.
        return 0;
    }

    /**
     * @hidden @internal
     */
    public get applyButtonDisabled(): boolean {
        return this.esf.listData[0] && !this.esf.listData[0].isSelected && !this.esf.listData[0].indeterminate ||
            this.displayedListData && this.displayedListData.length === 0;
    }

    /**
     * @hidden @internal
     */
    public onInputKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case this.platform.KEYMAP.ENTER:
                event.preventDefault();
                this.applyFilter();

                return;
            case this.platform.KEYMAP.ESCAPE:
                if (this.searchValue) {
                    event.stopPropagation();
                    this.clearInput();
                }

                return;
        }
    }

    /**
     * @hidden @internal
     */
    public filterListData(): void {
        if (this.esf.column?.dataType === GridColumnDataType.Number ||
            this.esf.column?.dataType === GridColumnDataType.Currency ||
            this.esf.column?.dataType === GridColumnDataType.Percent) {
            this.rejectNonNumericalEntries();
        }

        if (!this.esf.listData || !this.esf.listData.length) {
            this.displayedListData = [];

            return;
        }

        const searchAllBtn = this.esf.listData[0];

        if (!this.searchValue) {
            const anyFiltered = this.esf.listData.some(i => i.isFiltered);
            const anyUnfiltered = this.esf.listData.some(i => !i.isFiltered);

            if (anyFiltered && anyUnfiltered) {
                searchAllBtn.indeterminate = true;
            }

            this.esf.listData.forEach(i => i.isSelected = i.isFiltered);
            this.displayedListData = this.esf.listData;
            searchAllBtn.label = this.esf.grid.resourceStrings.igx_grid_excel_select_all;

            return;
        }

        const searchVal = this.searchValue.toLowerCase();
        this.displayedListData = this.esf.listData.filter((it, i) => (i === 0 && it.isSpecial) ||
            (it.label !== null && it.label !== undefined) &&
            !it.isBlanks &&
            it.label.toString().toLowerCase().indexOf(searchVal) > -1);

        this.esf.listData.forEach(i => i.isSelected = false);
        this.displayedListData.forEach(i => i.isSelected = true);

        this.displayedListData.splice(1, 0, this.addToCurrentFilter);

        searchAllBtn.indeterminate = false;
        searchAllBtn.label = this.esf.grid.resourceStrings.igx_grid_excel_select_all_search_results;

        if (this.displayedListData.length === 2) {
            this.displayedListData = [];
        }
    }

    /**
     * @hidden @internal
     */
    public applyFilter() {
        const filterTree = new FilteringExpressionsTree(FilteringLogic.Or, this.esf.column.field);

        const item = this.displayedListData[1];
        const addToCurrentFilterOptionVisible = item === this.addToCurrentFilter;

        const selectedItems = addToCurrentFilterOptionVisible && item.isSelected ?
            this.esf.listData.slice(1, this.esf.listData.length).filter(el => el.isSelected || el.isFiltered) :
            this.esf.listData.slice(1, this.esf.listData.length).filter(el => el.isSelected);

        const unselectedItem = this.esf.listData.slice(1, this.esf.listData.length).find(el => el.isSelected === false);

        if (unselectedItem) {
            if (selectedItems.length <= IgxExcelStyleSearchComponent.filterOptimizationThreshold) {
                selectedItems.forEach(element => {
                    let condition = null;
                    if (element.value !== null && element.value !== undefined) {
                        if (this.esf.column.dataType === GridColumnDataType.Boolean) {
                            condition = this.createCondition(element.value.toString());
                        } else {
                            const filterCondition = this.esf.column.dataType === GridColumnDataType.Time ? 'at' : 'equals';
                            condition = this.createCondition(filterCondition);
                        }
                    } else {
                        condition = this.createCondition('empty');
                    }
                    filterTree.filteringOperands.push({
                        condition,
                        fieldName: this.esf.column.field,
                        ignoreCase: this.esf.column.filteringIgnoreCase,
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
                    fieldName: this.esf.column.field,
                    ignoreCase: this.esf.column.filteringIgnoreCase,
                    searchVal: new Set(this.esf.column.dataType === GridColumnDataType.Date ||
                        this.esf.column.dataType === GridColumnDataType.DateTime ?
                        selectedItems.map(d => d.value.toISOString()) : this.esf.column.dataType === GridColumnDataType.Time ?
                            selectedItems.map(e => e.value.toLocaleTimeString()) :
                            selectedItems.map(e => e.value))
                });

                if (blanksItem) {
                    filterTree.filteringOperands.push({
                        condition: this.createCondition('empty'),
                        fieldName: this.esf.column.field,
                        ignoreCase: this.esf.column.filteringIgnoreCase,
                        searchVal: blanksItem.value
                    });
                }
            }

            this.esf.grid.filteringService.filterInternal(this.esf.column.field, filterTree);
            this.esf.expressionsList = new Array<ExpressionUI>();
            this.esf.grid.filteringService.generateExpressionsList(this.esf.column.filteringExpressionsTree,
                this.esf.grid.filteringLogic, this.esf.expressionsList);
        } else {
            this.esf.grid.filteringService.clearFilter(this.esf.column.field);
        }

        this.esf.closeDropdown();
    }

    private createCondition(conditionName: string) {
        switch (this.esf.column.dataType) {
            case GridColumnDataType.Boolean:
                return IgxBooleanFilteringOperand.instance().condition(conditionName);
            case GridColumnDataType.Number:
            case GridColumnDataType.Currency:
            case GridColumnDataType.Percent:
                return IgxNumberFilteringOperand.instance().condition(conditionName);
            case GridColumnDataType.Date:
                return IgxDateFilteringOperand.instance().condition(conditionName);
            case GridColumnDataType.Time:
                return IgxTimeFilteringOperand.instance().condition(conditionName);
            case GridColumnDataType.DateTime:
                return IgxDateTimeFilteringOperand.instance().condition(conditionName);
            default:
                return IgxStringFilteringOperand.instance().condition(conditionName);
        }
    }

    /**
     * @hidden @internal
     */
     private rejectNonNumericalEntries(): void {
        const regExp = /[^0-9\.,eE\-]/g;
        if (this.searchValue && regExp.test(this.searchValue)) {
            this.searchInput.value = this.searchValue.replace(regExp, '');
            this.searchValue = this.searchInput.value;
        }
    }
}
