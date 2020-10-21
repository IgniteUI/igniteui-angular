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
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';
import { FilteringExpressionsTree } from '../../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../../data-operations/filtering-expression.interface';
import { DataType } from '../../../data-operations/data-util';
import {
    IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand, IgxStringFilteringOperand
} from '../../../data-operations/filtering-condition';
import { ExpressionUI } from '../grid-filtering.service';
import { Subject } from 'rxjs';
import { IgxListComponent } from '../../../list/public_api';
import { IChangeCheckboxEventArgs } from '../../../checkbox/checkbox.component';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[igxExcelStyleLoading]'
})
export class IgxExcelStyleLoadingValuesTemplateDirective {
    constructor(public template: TemplateRef<any>) {}
}

/**
 * A component used for presenting Excel style search UI.
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-excel-style-search',
    templateUrl: './excel-style-search.component.html'
})
export class IgxExcelStyleSearchComponent implements AfterViewInit, OnDestroy {
    private static readonly filterOptimizationThreshold = 2;
    private _isLoading;
    private destroy$ = new Subject<boolean>();

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
    @HostBinding('class') class = 'igx-excel-filter__menu-main';

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
    public get valuesLoadingTemplate() {
        if (this.esf.grid.excelStyleLoadingValuesTemplateDirective) {
            return this.esf.grid.excelStyleLoadingValuesTemplateDirective.template;
        } else {
            return this.defaultExcelStyleLoadingValuesTemplate;
        }
    }

    /**
     * @hidden @internal
     */
    get applyButtonDisabled() {
        return this.esf.listData[0] && !this.esf.listData[0].isSelected && !this.esf.listData[0].indeterminate;
    }

    constructor(public cdr: ChangeDetectorRef, public esf: IgxGridExcelStyleFilteringComponent) {
        esf.loadingStart.pipe(takeUntil(this.destroy$)).subscribe(() => {
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
            this.clearInput();
        });
    }

    public ngAfterViewInit() {
        this.refreshSize();
    }

    ngOnDestroy(): void {
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
    }

    /**
     * @hidden @internal
     */
    public onCheckboxChange(eventArgs: IChangeCheckboxEventArgs) {
        const selectedIndex = this.esf.listData.indexOf(eventArgs.checkbox.value);
        if (selectedIndex === 0) {
            this.esf.listData.forEach(element => {
                element.isSelected = eventArgs.checked;
                this.esf.listData[0].indeterminate = false;
            });
        } else {
            eventArgs.checkbox.value.isSelected = eventArgs.checked;
            if (!this.esf.listData.slice(1, this.esf.listData.length).find(el => el.isSelected === false)) {
                this.esf.listData[0].indeterminate = false;
                this.esf.listData[0].isSelected = true;
            } else if (!this.esf.listData.slice(1, this.esf.listData.length).find(el => el.isSelected === true)) {
                this.esf.listData[0].indeterminate = false;
                this.esf.listData[0].isSelected = false;
            } else {
                this.esf.listData[0].indeterminate = true;
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
        if (this.list) {
            return this.list.element.nativeElement.offsetHeight;
        }
    }

    /**
     * @hidden @internal
     */
    public applyFilter() {
        const filterTree = new FilteringExpressionsTree(FilteringLogic.Or, this.esf.column.field);
        const selectedItems = this.esf.listData.slice(1, this.esf.listData.length).filter(el => el.isSelected === true);
        const unselectedItem = this.esf.listData.slice(1, this.esf.listData.length).find(el => el.isSelected === false);

        if (unselectedItem) {
            if (selectedItems.length <= IgxExcelStyleSearchComponent.filterOptimizationThreshold) {
                selectedItems.forEach(element => {
                    let condition = null;
                    if (element.value !== null && element.value !== undefined) {
                        if (this.esf.column.dataType === DataType.Boolean) {
                            condition = this.createCondition(element.value.toString());
                        } else {
                            condition = this.createCondition('equals');
                        }
                    } else {
                        condition = this.createCondition('empty');
                    }
                    filterTree.filteringOperands.push({
                        condition: condition,
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
                    searchVal: new Set(this.esf.column.dataType === DataType.Date ?
                        selectedItems.map(d => new Date(d.value.getFullYear(), d.value.getMonth(), d.value.getDate()).toISOString()) :
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
