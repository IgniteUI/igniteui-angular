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

/**
 *@hidden
 */
export class FilterListItem {
    public value: string;
    public isSelected: boolean;
    public indeterminate: boolean;
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
    private isMouseOverSubMenu = false;
    private isMouseOverMoreFilters = false;
    private isSubMenuOpened = false;
    private isMainMenuOpened = false;
    private columnData = [];
    private originalColumnData = [];

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

    @Input()
    get column(): IgxColumnComponent {
        return this._column;
    }

    set column(val) {
        if (val && !this.isMainMenuOpened) {
            this._column = val;
            this.customDialog.expressionsList = this.filteringService.getExpressions(this._column.field);
        }
    }

    constructor(private cdr: ChangeDetectorRef, public filteringService: IgxFilteringService) {}

    ngAfterViewInit(): void {
        this._mainMenuOverlaySettings.outlet = this.column.grid.outletDirective;
        this._subMenuOverlaySettings.outlet = this.column.grid.outletDirective;
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

    public onIconClick(eventArgs) {
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
        this.mainDropdown.toggle(this._mainMenuOverlaySettings);
    }

    public onMouseEnter(eventArgs) {
        this.isMouseOverMoreFilters = true;
        if (!this.isSubMenuOpened) {
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
            this.isSubMenuOpened = true;
        }
    }

    public onMouseLeave() {
        this.isMouseOverMoreFilters = false;
        requestAnimationFrame(() => {
            if (!this.isMouseOverSubMenu) {
                this.subMenu.close();
            }
        });
    }

    public onMenuMouseEnter(eventArgs) {
        requestAnimationFrame(() => {
            if (this.isSubMenuOpened && !this.isMouseOverMoreFilters) {
                this.subMenu.close();
            }
        });
    }

    public onSubMenuMouseEnter() {
        this.isMouseOverSubMenu = true;
    }

    public onSubMenuMouseLeave() {
        this.isMouseOverSubMenu = false;
    }

    public onSubMenuClosed() {
        this.isSubMenuOpened = false;
    }

    public onSubMenuSelection(eventArgs: ISelectionEventArgs) {
        this.customDialog.selectedOperator = eventArgs.newSelection.value ? eventArgs.newSelection.value : 'equals';
        eventArgs.cancel = true;
        this.mainDropdown.close();
        this.subMenu.close();
        this.customDialog.open();
    }

    public closeDialog() {
        this.columnData = cloneArray(this.originalColumnData, true);
        this.originalColumnData = [];
        this.mainDropdown.close();
    }

    public onDropDownClosing() {
        this.isMainMenuOpened = false
        this.excelStyleSearch.searchValue = null;
    }

    public populateColumnData() {
        const data = Array.from(new Set(this.filteringService.grid.data.map(record => record[this.column.field])));
        this.columnData = [];
        data.forEach(element => {
            const filterListItem =  new FilterListItem();
            filterListItem.isSelected = true;
            filterListItem.value = element;
            filterListItem.indeterminate = false;
            this.columnData.push(filterListItem);
        });

        // this.columnData = []
        // if (!this.columnData.find(el => el.value === 'Select All')) {
        //     this.columnData.push({
        //         value: 'Select All',
        //         isSelected: true,
        //         indeterminate: false
        //     });
        // }

        // //TODO
        // // logic for 'BLANKS' item
        // this.filteringService.grid.data.forEach(element => {
        //     if (!this.columnData.find(el => el.value === element[this.column.field])) {
        //         this.columnData.push({
        //             value: element[this.column.field],
        //             isSelected: true,
        //             indeterminate: false
        //         });
        //     }
        // });
        this.cdr.detectChanges();
    }

    public onDropDownOpening() {
        this.isMainMenuOpened = true;
        this.populateColumnData();
        this.originalColumnData = cloneArray(this.columnData, true);
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
        const selectedItems = this.columnData.filter(el => el.value !== 'Select All' && el.isSelected === true);
        const unselectedItems = this.columnData.find(el => el.value !== 'Select All' && el.isSelected === false);

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

}
