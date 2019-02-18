import {
    ChangeDetectorRef,
    Component,
    Input,
    ViewChild,
    AfterViewInit,
    ElementRef,
    HostBinding,
    ChangeDetectionStrategy,
    TemplateRef,
    Directive,
} from '@angular/core';
import { useAnimation } from '@angular/animations';
import { IgxColumnComponent } from '../../grid';
import { IgxDropDownComponent, ISelectionEventArgs } from '../../../drop-down';
import {
    HorizontalAlignment,
    VerticalAlignment,
    ConnectedPositioningStrategy,
    CloseScrollStrategy,
    OverlaySettings
} from '../../../services';
import { IgxFilteringService, ExpressionUI } from '../grid-filtering.service';
import { IgxToggleDirective } from '../../../directives/toggle/toggle.directive';
import { 
    IFilteringOperation,
    IgxStringFilteringOperand,
    IgxNumberFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxDateFilteringOperand
} from '../../../data-operations/filtering-condition';
import { FilteringExpressionsTree } from '../../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../../data-operations/filtering-expression.interface';
import { cloneArray } from '../../../core/utils';
import { DataType } from '../../../data-operations/data-util';
import { fadeIn, fadeOut } from '../../../animations/main';
import { IgxExcelStyleSearchComponent } from './excel-style-search.component';
import { IgxExcelStyleCustomDialogComponent } from './excel-style-custom-dialog.component';
import { Subscription } from 'rxjs';
import { IgxExcelStyleSortingComponent } from './excel-style-sorting.component';

/**
 *@hidden
 */
export class FilterListItem {
    public value: string;
    public label: string;
    public isSelected: boolean;
    public indeterminate: boolean;
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
export class IgxGridExcelStyleFilteringComponent implements AfterViewInit {

    private _column: IgxColumnComponent;
    private isMainMenuOpened = false;
    private shouldOpenSubMenu = true;
    private shouldOpenMainMenu = true;
    private originalColumnData = new Array<FilterListItem>();

    public listData = new Array<FilterListItem>();
    public uniqueValues = [];

    private _mainMenuPositionSettings = {
        verticalStartPoint: VerticalAlignment.Bottom,
        openAnimation: useAnimation(fadeIn, {
            params: {
                duration: '250ms'
            }
        }),
        closeAnimation: useAnimation(fadeOut, {
            params: {
                duration: '200ms'
            }
        })
    };

    private _subMenuPositionSettings = {
        verticalStartPoint: VerticalAlignment.Top
    };

    private _mainMenuOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._mainMenuPositionSettings),
        scrollStrategy: new CloseScrollStrategy()
    };

    private _subMenuOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._subMenuPositionSettings),
        scrollStrategy: new CloseScrollStrategy()
    };

    @HostBinding('class.igx-excel-filter')
    className = 'igx-excel-filter';

    get iconClassName() {
        return this._column.filteringExpressionsTree ? 'igx-excel-filter__icon__filtered' : 'igx-excel-filter__icon';
    }

    @Input()
    get column(): IgxColumnComponent {
        return this._column;
    }

    set column(val) {
        if (val) {
            this._column = val;
            this.customDialog.expressionsList = this.filteringService.getExpressions(this._column.field);
        }
    }

    constructor(private cdr: ChangeDetectorRef, public filteringService: IgxFilteringService) {
    }

    protected chunkLoaded = new Subscription();
    protected columnMoving = new Subscription();

    ngAfterViewInit(): void {
        this._mainMenuOverlaySettings.outlet = this.column.grid.outletDirective;
        this._subMenuOverlaySettings.outlet = this.column.grid.outletDirective;

        this.chunkLoaded = this.filteringService.grid.headerContainer.onChunkPreload.subscribe(() => {
            this.mainDropdown.close();
        });

        this.columnMoving = this.filteringService.grid.onColumnMoving.subscribe(() => {
            this.mainDropdown.close();
        });
    }

    get conditions() {
        return this.column.filters.conditionList();
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
        return this.filteringService.grid.resourceStrings[`igx_grid_filter_${this.getCondition(value).name}`] || value;
    }

    public onPin() {
        this.column.pinned = !this.column.pinned;
        this.mainDropdown.close();
    }

    public onHide() {
        this.column.hidden = true;
        this.mainDropdown.close();
    }

    public onIconClick(eventArgs) {
        if (this.shouldOpenMainMenu) {
            const headerTarget = this.column.headerCell.elementRef.nativeElement;

            const gridRect = this.filteringService.grid.nativeElement.getBoundingClientRect();
            const headerRect = headerTarget.getBoundingClientRect();

            let x = headerRect.left;
            let x1 = gridRect.left + gridRect.width;
            x += window.pageXOffset;
            x1 += window.pageXOffset;
            if (Math.abs(x - x1) < 300) {
                this._mainMenuOverlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Left;
                this._mainMenuOverlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Right;
            } else {
                this._mainMenuOverlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Right;
                this._mainMenuOverlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Left;
            }

            this._mainMenuOverlaySettings.positionStrategy.settings.target = headerTarget;
            this.mainDropdown.open(this._mainMenuOverlaySettings);
            this.shouldOpenMainMenu = false;
        }
    }

    public onTextFilterClick(eventArgs) {
        if (this.shouldOpenSubMenu) {
            this._subMenuOverlaySettings.positionStrategy.settings.target = eventArgs.target;

            const gridRect = this.filteringService.grid.nativeElement.getBoundingClientRect();
            const dropdownRect = this.mainDropdown.element.getBoundingClientRect();

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

    public onSubMenuClosed() {
        requestAnimationFrame(() => {
            this.shouldOpenSubMenu = true;
        });
    }

    public onSubMenuSelection(eventArgs: ISelectionEventArgs) {
        this.customDialog.selectedOperator = eventArgs.newSelection.value ? eventArgs.newSelection.value : 'equals';
        eventArgs.cancel = true;
        this.mainDropdown.close();
        this.subMenu.close();
        this.customDialog.open();
    }

    public closeDialog() {
        this.listData = cloneArray(this.originalColumnData, true);
        this.originalColumnData = [];
        this.mainDropdown.close();
    }

    public onDropDownClosed() {
        this.excelStyleSearch.searchValue = null;
        requestAnimationFrame(() => {
            this.shouldOpenMainMenu = true;
        });
    }

    public populateColumnData() {
        this.uniqueValues = Array.from(new Set(this.filteringService.grid.data.map(record => record[this.column.field])));
        this.listData = new Array<FilterListItem>();

        let containsNullOrEmpty = false;

        this.uniqueValues.forEach(element => {
            if (element) {
                const filterListItem =  new FilterListItem();
                filterListItem.isSelected = true;
                filterListItem.value = element;
                filterListItem.label = element;
                filterListItem.indeterminate = false;
                this.listData.push(filterListItem);
            } else {
                containsNullOrEmpty = true;
            }
        });

        if (containsNullOrEmpty) {
            const blanks =  new FilterListItem();
            blanks.isSelected = true;
            blanks.value = null;
            blanks.label = '(Blanks)';
            blanks.indeterminate = false;
            this.listData.unshift(blanks);
        }

        const selectAll =  new FilterListItem();
        selectAll.isSelected = true;
        selectAll.value = 'Select All';
        selectAll.label = 'Select All';
        selectAll.indeterminate = false;
        this.listData.unshift(selectAll);

        this.cdr.detectChanges();
    }

    public onDropDownOpening() {
        this.isMainMenuOpened = true;
        this.populateColumnData();
        this.originalColumnData = cloneArray(this.listData, true);

        const se = this.column.grid.sortingExpressions.find(expr => expr.fieldName === this.column.field);
        if (se) {
            this.excelStyleSorting.selectButton(se.dir);
        }
    }

    get sortingTemplate() {
        if (this.filteringService.grid.excelStyleSortingTemplateDirective) {
            return this.filteringService.grid.excelStyleSortingTemplateDirective.template;
        } else {
            return this.defaultExcelStyleSortingTemplate;
        }
    }

    get movingTemplate() {
        if (this.filteringService.grid.excelStyleMovingTemplateDirective) {
            return this.filteringService.grid.excelStyleMovingTemplateDirective.template;
        } else {
            return this.defaultExcelStyleMovingTemplate;
        }
    }

    get pinningTemplate() {
        if (this.filteringService.grid.excelStylePinningTemplateDirective) {
            return this.filteringService.grid.excelStylePinningTemplateDirective.template;
        } else {
            return this.defaultExcelStylePinningTemplate;
        }
    }

    get hidingTemplate() {
        if (this.filteringService.grid.excelStyleHidingTemplateDirective) {
            return this.filteringService.grid.excelStyleHidingTemplateDirective.template;
        } else {
            return this.defaultExcelStyleHidingTemplate;
        }
    }

    public getIconName(exp: ExpressionUI): string {
        if (this.column.dataType === DataType.Boolean && exp.expression.condition === null) {
            return this.getCondition(this.conditions[0]).iconName;
        } else if (!exp.expression.condition) {
            return 'filter_list';
        } else {
            return exp.expression.condition.iconName;
        }
    }

    public applyFilter() {
        const filterTree = new FilteringExpressionsTree(FilteringLogic.Or, this.column.field);
        const selectedItems = this.listData.filter(el => el.value !== 'Select All' && el.isSelected === true);
        const unselectedItems = this.listData.find(el => el.value !== 'Select All' && el.isSelected === false);

        if (unselectedItems) {
            if (selectedItems.length === 0) {
                //TODO
                this.filteringService.grid.filter(this.column.field, null, filterTree);
            } else {
                selectedItems.forEach(element => {
                    filterTree.filteringOperands.push({
                        condition: this.createCondition('equals'),
                        fieldName: this.column.field,
                        ignoreCase: this.column.filteringIgnoreCase,
                        searchVal: element.value
                    });
                });
                this.filteringService.grid.filter(this.column.field, null, filterTree);
            }
        } else {
            this.filteringService.grid.clearFilter(this.column.field);
        }

        this.originalColumnData = [];
        this.mainDropdown.close();
    }

    private createCondition(conditionName: string) {
        switch (this.column.dataType) {
            case DataType.String:
                return IgxStringFilteringOperand.instance().condition(conditionName);
            case DataType.Boolean:
                return IgxBooleanFilteringOperand.instance().condition(conditionName);
            case DataType.Number:
                return IgxNumberFilteringOperand.instance().condition(conditionName);
            case DataType.Date:
                return IgxDateFilteringOperand.instance().condition(conditionName);
        }
    }

    @ViewChild('dropdown', { read: IgxToggleDirective })
    public mainDropdown: IgxToggleDirective;

    @ViewChild('subMenu', { read: IgxDropDownComponent })
    public subMenu: IgxDropDownComponent;

    @ViewChild('customDialog', { read: IgxExcelStyleCustomDialogComponent })
    public customDialog: IgxExcelStyleCustomDialogComponent;

    @ViewChild('input', { read: ElementRef })
    protected input: ElementRef;

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
}
