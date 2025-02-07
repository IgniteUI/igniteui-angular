import {
    AfterViewInit,
    Component,
    ViewChild,
    ChangeDetectorRef,
    TemplateRef,
    Directive,
    OnDestroy,
    HostBinding,
    Input
} from '@angular/core';
import { IgxInputDirective } from '../../../directives/input/input.directive';
import { IgxForOfDirective } from '../../../directives/for-of/for_of.directive';
import { FilteringExpressionsTree } from '../../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../../data-operations/filtering-expression.interface';
import { GridColumnDataType } from '../../../data-operations/data-util';
import {
    IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand,
    IgxStringFilteringOperand, IgxDateTimeFilteringOperand, IgxTimeFilteringOperand
} from '../../../data-operations/filtering-condition';
import { Subject } from 'rxjs';
import { IChangeCheckboxEventArgs, IgxCheckboxComponent } from '../../../checkbox/public_api';
import { takeUntil } from 'rxjs/operators';
import { cloneHierarchicalArray, PlatformUtil } from '../../../core/utils';
import { BaseFilteringComponent } from './base-filtering.component';
import { ActiveElement, ExpressionUI, FilterListItem } from './common';
import { IgxButtonDirective } from '../../../directives/button/button.directive';
import { IgxCircularProgressBarComponent } from '../../../progressbar/progressbar.component';
import { IgxTreeNodeComponent } from '../../../tree/tree-node/tree-node.component';
import { IgxTreeComponent } from '../../../tree/tree.component';
import { IgxDataLoadingTemplateDirective, IgxEmptyListTemplateDirective } from '../../../list/list.common';
import { IgxListItemComponent } from '../../../list/list-item.component';
import { IgxListComponent } from '../../../list/list.component';
import { IgxSuffixDirective } from '../../../directives/suffix/suffix.directive';
import { NgIf, NgTemplateOutlet, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxPrefixDirective } from '../../../directives/prefix/prefix.directive';
import { IgxIconComponent } from '../../../icon/icon.component';
import { IgxInputGroupComponent } from '../../../input-group/input-group.component';
import { ITreeNodeSelectionEvent } from '../../../tree/common';
import { Navigate } from '../../../drop-down/drop-down.common';
import { Size } from '../../common/enums';
@Directive({
    selector: '[igxExcelStyleLoading]',
    standalone: true
})
export class IgxExcelStyleLoadingValuesTemplateDirective {
    public static ngTemplateContextGuard(_dir: IgxExcelStyleLoadingValuesTemplateDirective,
        ctx: unknown): ctx is undefined {
        return true
    }
    constructor(public template: TemplateRef<undefined>) { }
}

let NEXT_ID = 0;
/**
 * A component used for presenting Excel style search UI.
 */
@Component({
    selector: 'igx-excel-style-search',
    templateUrl: './excel-style-search.component.html',
    imports: [IgxInputGroupComponent, IgxIconComponent, IgxPrefixDirective, FormsModule, IgxInputDirective, NgIf, IgxSuffixDirective, IgxListComponent, IgxForOfDirective, IgxListItemComponent, IgxCheckboxComponent, IgxDataLoadingTemplateDirective, NgTemplateOutlet, IgxEmptyListTemplateDirective, IgxTreeComponent, NgFor, IgxTreeNodeComponent, IgxCircularProgressBarComponent, IgxButtonDirective]
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

    @ViewChild('cancelButton', {read: IgxButtonDirective, static: true })
    protected cancelButton: IgxButtonDirective;

    /**
     * @hidden @internal
     */
    @ViewChild('list', { read: IgxListComponent, static: false })
    public list: IgxListComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('selectAllCheckbox', { read: IgxCheckboxComponent, static: false })
    public selectAllCheckbox: IgxCheckboxComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('addToCurrentFilterCheckbox', { read: IgxCheckboxComponent, static: false })
    public addToCurrentFilterCheckbox: IgxCheckboxComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('tree', { read: IgxTreeComponent, static: false })
    public tree: IgxTreeComponent;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxForOfDirective)
    protected virtDir: IgxForOfDirective<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultExcelStyleLoadingValuesTemplate', { read: TemplateRef })
    protected defaultExcelStyleLoadingValuesTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    public get selectAllItem(): FilterListItem {
        if (!this._selectAllItem) {
            const selectAllItem = {
                isSelected: false,
                isFiltered: false,
                indeterminate: false,
                isSpecial: true,
                isBlanks: false,
                value: this.esf.grid.resourceStrings.igx_grid_excel_select_all,
                label: this.esf.grid.resourceStrings.igx_grid_excel_select_all
            };

            this._selectAllItem = selectAllItem;
        }

        return this._selectAllItem;
    }

    /**
     * @hidden @internal
     */
    public get addToCurrentFilterItem(): FilterListItem {
        if (!this._addToCurrentFilterItem) {
            const addToCurrentFilterItem = {
                isSelected: false,
                isFiltered: false,
                indeterminate: false,
                isSpecial: true,
                isBlanks: false,
                value: this.esf.grid.resourceStrings.igx_grid_excel_add_to_filter,
                label: this.esf.grid.resourceStrings.igx_grid_excel_add_to_filter
            };

            this._addToCurrentFilterItem = addToCurrentFilterItem;
        }

        return this._addToCurrentFilterItem;
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
    public matchesCount: number;

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

    protected activeDescendant = '';

    private _id = `igx-excel-style-search-${NEXT_ID++}`;
    private _isLoading;
    private _addToCurrentFilterItem: FilterListItem;
    private _selectAllItem: FilterListItem;
    private _hierarchicalSelectedItems: FilterListItem[];
    private _focusedItem: ActiveElement = null;
    private destroy$ = new Subject<boolean>();

    constructor(public cdr: ChangeDetectorRef, public esf: BaseFilteringComponent, protected platform: PlatformUtil) {
        esf.loadingStart.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.displayedListData = [];
            this.isLoading = true;
        });
        esf.loadingEnd.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.refreshSize();
            this.isLoading = false;
        });
        esf.initialized.pipe(takeUntil(this.destroy$)).subscribe(() => {
            requestAnimationFrame(() => {
                this.refreshSize();
                this.searchInput.nativeElement.focus();
            });
        });
        esf.columnChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.virtDir?.resetScrollPosition();

            if (this.virtDir) {
                this.virtDir.state.startIndex = 0;
            }
        });

        esf.listDataLoaded.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this._selectAllItem = this.esf.listData[0];
            if (this.isHierarchical() && this.esf.listData[0].isSpecial) {
                this.esf.listData.splice(0, 1);
            }

            if (this.searchValue) {
                this.clearInput();
            } else {
                this.filterListData();
            }

            this.cdr.detectChanges();
            requestAnimationFrame(() => {
                this.refreshSize();
                this.searchInput.nativeElement.focus();
            });
        });
    }

    public ngAfterViewInit() {
        requestAnimationFrame(this.refreshSize);
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden @internal
     */
    public refreshSize = () => {
        if (this.virtDir) {
            this.virtDir.igxForContainerSize = this.containerSize;
            this.virtDir.igxForItemSize = this.itemSize;
            this.virtDir.recalcUpdateSizes();
            this.cdr.detectChanges();
        }
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
        const selectedIndex = this.displayedListData.indexOf(eventArgs.owner.value);
        const selectAllBtn = this.displayedListData[0];

        if (selectedIndex === 0) {
            this.displayedListData.forEach(element => {
                if (element === this.addToCurrentFilterItem) {
                    return;
                }
                element.isSelected = eventArgs.checked;
            });

            selectAllBtn.indeterminate = false;
        } else {
            eventArgs.owner.value.isSelected = eventArgs.checked;
            const indexToStartSlicing = this.displayedListData.indexOf(this.addToCurrentFilterItem) > -1 ? 2 : 1;

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
    }

    /**
     * @hidden @internal
     */
    public onSelectAllCheckboxChange(eventArgs: IChangeCheckboxEventArgs) {
        this._selectAllItem.isSelected = eventArgs.checked;
        this._selectAllItem.indeterminate = false;
        const treeNodes = this.tree.nodes;
        treeNodes.forEach(node => (node.data as FilterListItem).isSelected = eventArgs.checked);
    }

    /**
     * @hidden @internal
     */
    public onNodeSelectionChange(eventArgs: ITreeNodeSelectionEvent) {
        eventArgs.added.forEach(node => {
            (node.data as FilterListItem).isSelected = true;
        });
        eventArgs.removed.forEach(node => {
            (node.data as FilterListItem).isSelected = false;
        });

        this._hierarchicalSelectedItems = eventArgs.newSelection.map(item => item.data as FilterListItem);
        const selectAllBtn = this.selectAllItem;
        if (this._hierarchicalSelectedItems.length === 0) {
            selectAllBtn.indeterminate = false;
            selectAllBtn.isSelected = false;
        } else if (this._hierarchicalSelectedItems.length === this.tree.nodes.length) {
            selectAllBtn.indeterminate = false;
            selectAllBtn.isSelected = true;
        } else {
            selectAllBtn.indeterminate = true;
            selectAllBtn.isSelected = false;
        }
    }

    /**
     * @hidden @internal
     */
    public get itemSize() {
        let itemSize = '40px';
        const esf = this.esf as any;
        switch (esf.size) {
            case Size.Medium: itemSize = '32px'; break;
            case Size.Small: itemSize = '24px'; break;
            default: break;
        }
        return itemSize;
    }

    /**
     * @hidden @internal
     */
    public get containerSize() {
        if (this.esf.listData.length) {
            return this.list?.element.nativeElement.offsetHeight;
        }

        // GE Nov 1st, 2021 #10355 Return a numeric value, so the chunk size is calculated properly.
        // If we skip this branch, on applying the filter the _calculateChunkSize() method off the ForOfDirective receives
        // an igxForContainerSize = undefined, thus assigns the chunkSize to the igxForOf.length which leads to performance issues.
        return 0;
    }

    @HostBinding('attr.id')
    @Input()
    protected get id(): string {
        return this._id;
    }
    protected set id(value: string) {
        this._id = value;
    }

    protected getItemId(index: number): string {
        return `${this.id}-item-${index}`;
    }

    protected setActiveDescendant() : void  {
        this.activeDescendant = this.focusedItem?.id || '';
    }

    protected get focusedItem(): ActiveElement {
        return this._focusedItem;
    }

    protected set focusedItem(val: ActiveElement) {
        this._focusedItem = val;
    }

    /**
     * @hidden @internal
     */
    public get applyButtonDisabled(): boolean {
        return (this._selectAllItem && !this._selectAllItem.isSelected && !this._selectAllItem.indeterminate) ||
            (this.displayedListData && this.displayedListData.length === 0);
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

        let selectAllBtn;
        if (this._selectAllItem) {
            selectAllBtn = this._selectAllItem;
        } else {
            selectAllBtn = this.esf.listData[0];
        }

        if (!this.searchValue) {
            let anyFiltered = this.esf.listData.some(i => i.isFiltered);
            let anyUnfiltered = this.esf.listData.some(i => !i.isFiltered);
            selectAllBtn.indeterminate = anyFiltered && anyUnfiltered;
            if (this.isHierarchical() && this.tree) {
                this._hierarchicalSelectedItems = this.tree.nodes.map(n => n.data as FilterListItem).filter(item => item.isFiltered);
            }

            this.esf.listData.forEach(i => i.isSelected = i.isFiltered);
            if (this.displayedListData !== this.esf.listData) {
                this.displayedListData = this.esf.listData;
                if (this.isHierarchical()) {
                    this.cdr.detectChanges();
                    this.tree.nodes.forEach(n => {
                        const item = n.data as FilterListItem;
                        n.selected = item.isSelected || item.isFiltered;
                        anyFiltered = anyFiltered || n.selected;
                        anyUnfiltered = anyUnfiltered || !n.selected;
                    });
                    selectAllBtn.indeterminate = anyFiltered && anyUnfiltered;
                }
            }
            selectAllBtn.label = this.esf.grid.resourceStrings.igx_grid_excel_select_all;
            this.matchesCount = this.displayedListData.length - 1;
            this.cdr.detectChanges();

            return;
        }

        const searchVal = this.searchValue.toLowerCase();
        if (this.isHierarchical()) {
            this._hierarchicalSelectedItems = [];
            this.esf.listData.forEach(i => i.isSelected = false);
            const matchedData = cloneHierarchicalArray(this.esf.listData, 'children');
            this.displayedListData = this.hierarchicalSelectMatches(matchedData, searchVal);
            this.cdr.detectChanges();
            this.tree.nodes.forEach(n => {
                n.selected = true;
                if ((n.data as FilterListItem).label.toString().toLowerCase().indexOf(searchVal) > -1) {
                    this.expandAllParentNodes(n);
                }
            });
        } else {
            this.displayedListData = this.esf.listData.filter((it, i) => (i === 0 && it.isSpecial) ||
                (it.label !== null && it.label !== undefined) &&
                !it.isBlanks &&
                it.label.toString().toLowerCase().indexOf(searchVal) > -1);

            this.esf.listData.forEach(i => i.isSelected = false);
            this.displayedListData.forEach(i => i.isSelected = true);
            this.displayedListData.splice(1, 0, this.addToCurrentFilterItem);
            if (this.displayedListData.length === 2) {
                this.displayedListData = [];
            }
        }

        if (this.displayedListData.length > 2) {
            this.matchesCount = this.displayedListData.length - 2;
        } else {
            this.matchesCount = 0;
        }

        selectAllBtn.indeterminate = false;
        selectAllBtn.isSelected = true;
        selectAllBtn.label = this.esf.grid.resourceStrings.igx_grid_excel_select_all_search_results;
        this.cdr.detectChanges();
    }

    /**
     * @hidden @internal
     */
    public applyFilter() {
        const filterTree = new FilteringExpressionsTree(FilteringLogic.Or, this.esf.column.field);

        let selectedItems = [];
        if (this.isHierarchical()) {
            if (this.addToCurrentFilterCheckbox && this.addToCurrentFilterCheckbox.checked) {
                this.addFilteredToSelectedItems(this.esf.listData);
            }

            selectedItems = this._hierarchicalSelectedItems;
        } else {
            const item = this.displayedListData[1];
            const addToCurrentFilterOptionVisible = item === this.addToCurrentFilterItem;
            selectedItems = addToCurrentFilterOptionVisible && item.isSelected ?
                this.esf.listData.slice(1, this.esf.listData.length).filter(el => el.isSelected || el.isFiltered) :
                this.esf.listData.slice(1, this.esf.listData.length).filter(el => el.isSelected);
        }

        let unselectedItem;
        if (this.isHierarchical()) {
            unselectedItem = this.esf.listData.find(el => el.isSelected === false);
        } else {
            unselectedItem = this.esf.listData.slice(1, this.esf.listData.length).find(el => el.isSelected === false);
        }

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
                    searchVal: new Set(
                        this.esf.column.dataType === GridColumnDataType.Date ?
                            selectedItems.map(d => d.value.toDateString()) :
                        this.esf.column.dataType === GridColumnDataType.DateTime ?
                            selectedItems.map(d => d.value.toISOString()) :
                        this.esf.column.dataType === GridColumnDataType.Time ?
                            selectedItems.map(e => e.value.toLocaleTimeString()) :
                            selectedItems.map(e => e.value)
                    )
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
            const grid = this.esf.grid;
            const col = this.esf.column;
            grid.filteringService.filterInternal(col.field, filterTree);
            this.esf.expressionsList = new Array<ExpressionUI>();
            grid.filteringService.generateExpressionsList(col.filteringExpressionsTree,
                grid.filteringLogic, this.esf.expressionsList);
        } else {
            this.esf.grid.filteringService.clearFilter(this.esf.column.field);
        }

        this.esf.closeDropdown();
    }

    protected handleKeyDown(event: KeyboardEvent) {
        if (event) {
            const key = event.key.toLowerCase();
            const navKeys = ['space', 'spacebar', ' ',
            'arrowup', 'up', 'arrowdown', 'down', 'home', 'end'];
                if (navKeys.indexOf(key) === -1) { // If key has appropriate function in DD
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
            switch (key) {
                case 'arrowup':
                case 'up':
                    this.onArrowUpKeyDown();
                    break;
                case 'arrowdown':
                case 'down':
                    this.onArrowDownKeyDown();
                    break;
                case 'home':
                    this.onHomeKeyDown();
                    break;
                case 'end':
                    this.onEndKeyDown();
                    break;
                case 'space':
                case 'spacebar':
                case ' ':
                    this.onActionKeyDown();
                    break;
                default:
                    return;
            }
        }
    }

    protected onFocus() {
        const firstIndexInView = this.virtDir.state.startIndex;
        if (this.virtDir.igxForOf.length > 0) {
            this.focusedItem = {
                id: this.getItemId(firstIndexInView),
                index: firstIndexInView,
                checked: this.virtDir.igxForOf[firstIndexInView].isSelected
            };
        }
        this.setActiveDescendant();
    }

    protected onFocusOut() {
        this.focusedItem = null;
        this.setActiveDescendant();
    }

    /**
     * @hidden @internal
     */
    public isHierarchical() {
        return this.esf.isHierarchical;
    }

    /**
     * @hidden @internal
     */
    public isTreeEmpty() {
        return this.esf.isHierarchical && this.displayedListData.length === 0;
    }

    private hierarchicalSelectMatches(data: FilterListItem[], searchVal: string) {
        data.forEach(element => {
            element.indeterminate = false;
            element.isSelected = false;
            const node = this.tree.nodes.filter(n => (n.data as FilterListItem).label === element.label)[0];
            if (node) {
                node.expanded = false;
            }

            if (element.label.toString().toLowerCase().indexOf(searchVal) > -1) {
                element.isSelected = true;
                this.hierarchicalSelectAllChildren(element);
                this._hierarchicalSelectedItems.push(element);
            } else if (element.children.length > 0) {
                element.children = this.hierarchicalSelectMatches(element.children, searchVal);
                if (element.children.length > 0) {
                    element.isSelected = true;
                    if (node) {
                        node.expanded = true;
                    }
                }
            }
        });

        return data.filter(element => element.isSelected === true);
    }

    private hierarchicalSelectAllChildren(element: FilterListItem) {
        element.children.forEach(child => {
            child.indeterminate = false;
            child.isSelected = true;
            this._hierarchicalSelectedItems.push(child);
            if (child.children) {
                this.hierarchicalSelectAllChildren(child);
            }
        })
    }

    private expandAllParentNodes(node: any) {
        if (node.parentNode) {
            node.parentNode.expanded = true;
            this.expandAllParentNodes(node.parentNode);
        }
    }

    private addFilteredToSelectedItems(records: FilterListItem[]) {
        records.forEach(record => {
            if (record.children) {
                this.addFilteredToSelectedItems(record.children);
            }

            if (record.isFiltered && this._hierarchicalSelectedItems.indexOf(record) < 0) {
                this._hierarchicalSelectedItems.push(record);
            }
        })
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

    private onArrowUpKeyDown() {
        if (this.focusedItem && this.focusedItem.index === 0 && this.virtDir.state.startIndex === 0) {
            // on ArrowUp the focus stays on the same element if it is the first focused
            return;
        } else {
            this.navigateItem(this.focusedItem ? this.focusedItem.index - 1 : 0);
        }
        this.setActiveDescendant();
    }

    private onArrowDownKeyDown() {
        const lastIndex = this.virtDir.igxForOf.length - 1;
        if (this.focusedItem && this.focusedItem.index === lastIndex) {
            // on ArrowDown the focus stays on the same element if it is the last focused
            return;
        } else {
            this.navigateItem(this.focusedItem ? this.focusedItem.index + 1 : 0);
        }
        this.setActiveDescendant();
    }

    private onHomeKeyDown() {
        this.navigateItem(0);
        this.setActiveDescendant();
    }

    private onEndKeyDown() {
        this.navigateItem(this.virtDir.igxForOf.length - 1);
        this.setActiveDescendant();
    }

    private onActionKeyDown() {
        const dataItem = this.displayedListData[this.focusedItem.index];
        const args: IChangeCheckboxEventArgs = {
            checked: !dataItem.isSelected,
            owner: {
                value: dataItem
            }
        }
        this.onCheckboxChange(args);
    }

    private navigateItem(index: number) {
        if (index === -1 || index >= this.virtDir.igxForOf.length) {
            return;
        }
        const direction = index > (this.focusedItem ? this.focusedItem.index : -1) ? Navigate.Down : Navigate.Up;
        const scrollRequired = this.isIndexOutOfBounds(index, direction);
        this.focusedItem = {
           id: this.getItemId(index),
           index: index,
           checked: this.virtDir.igxForOf[index].isSelected
        };
        if (scrollRequired) {
            this.virtDir.scrollTo(index);
        }
    }

    private isIndexOutOfBounds(index: number, direction: Navigate) {
        const virtState = this.virtDir.state;
        const currentPosition = this.virtDir.getScroll().scrollTop;
        const itemPosition = this.virtDir.getScrollForIndex(index, direction === Navigate.Down);
        const indexOutOfChunk = index < virtState.startIndex || index > virtState.chunkSize + virtState.startIndex;
        const scrollNeeded = direction === Navigate.Down ? currentPosition < itemPosition : currentPosition > itemPosition;
        const subRequired = indexOutOfChunk || scrollNeeded;
        return subRequired;
    }
}
