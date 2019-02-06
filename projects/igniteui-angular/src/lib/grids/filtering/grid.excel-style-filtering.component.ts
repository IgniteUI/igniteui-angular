import {
    ChangeDetectorRef,
    Component,
    Input,
    ViewChild,
    AfterViewInit,
    ElementRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import { IgxColumnComponent } from '../grid';
import { IgxDropDownComponent, IgxDropDownItemComponent, ISelectionEventArgs } from '../../drop-down';
import { HorizontalAlignment, VerticalAlignment, ConnectedPositioningStrategy, CloseScrollStrategy, OverlaySettings } from '../../services';
import { IgxButtonGroupComponent } from '../../buttonGroup/buttonGroup.component';
import { IgxFilteringService, ExpressionUI } from './grid-filtering.service';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { IFilteringOperation, IgxStringFilteringOperand, IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { IChangeCheckboxEventArgs } from '../../checkbox/checkbox.component';
import { IgxFilterOptions } from '../../directives/filter/filter.directive';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { cloneArray } from '../../core/utils';
import { DataType } from '../../data-operations/data-util';
import { IgxInputGroupComponent } from '../../input-group';

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
    private originalItems = [];
    private selectedOperator = null;

    public uniqueItems = [];
    public searchValue: string;
    public expressionsList = new Array<ExpressionUI>();

    private _positionSettings = {
        verticalStartPoint: VerticalAlignment.Bottom
    };

    private _subMenuPositionSettings = {
        verticalStartPoint: VerticalAlignment.Top
    };
    
    private _overlaySettings: OverlaySettings = {
      closeOnOutsideClick: true,
      modal: false,
      positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
      scrollStrategy: new CloseScrollStrategy()
    };

    private _subMenuoverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._subMenuPositionSettings),
        scrollStrategy: new CloseScrollStrategy()
      };

    @Input()
    get column(): IgxColumnComponent {
        return this._column;
    }

    set column(val) {
        if (val) {
            this._column = val;
            this.expressionsList = this.filteringService.getExpressions(this._column.field);
        }
    }

    constructor(public cdr: ChangeDetectorRef, public filteringService: IgxFilteringService) {
    }

    ngAfterViewInit(): void {
        this._overlaySettings.outlet = this.column.grid.outletDirective;
        this._subMenuoverlaySettings.outlet = this.column.grid.outletDirective;
        this.populateUniqueValues();
    }

    get canMoveLeft() {
        return !this.column.movable || this.column.visibleIndex === 0;
    }

    get canMoveRigth() {
        return !this.column.movable || this.column.visibleIndex === this.filteringService.grid.columns.length - 1;
    }

    get conditions() {
        return this.column.filters.conditionList().filter(c => c != 'empty' && c !== 'notEmpty' && c != 'null' && c !== 'notNull');
    }

    get filterOptions() {
        const fo = new IgxFilterOptions();
        fo.key = 'value';
        fo.inputValue = this.searchValue;
        return fo;
    }
    
    private populateUniqueValues() {
        if (!this.uniqueItems.find(el => el.value === 'Select All')) {
            this.uniqueItems.push({
                value: 'Select All',
                isSelected: true,
                indeterminate: false
            });
        }
        this.filteringService.grid.data.forEach(element => {
            if (!this.uniqueItems.find(el => el.value === element[this.column.field])) {
                this.uniqueItems.push({
                    value: element[this.column.field],
                    isSelected: true,
                    indeterminate: false
                });
            }
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
        return this.filteringService.grid.resourceStrings[`igx_grid_filter_${this.getCondition(value).name}`] || value;
    }

    public onCheckboxChange(eventArgs: IChangeCheckboxEventArgs) {
        if (eventArgs.checkbox.value.value === 'Select All') {
            this.uniqueItems.forEach(element => {
                element.isSelected = eventArgs.checked;
                this.uniqueItems[0].indeterminate = false;
            });
        } else {
            eventArgs.checkbox.value.isSelected = eventArgs.checked;
            if (!this.uniqueItems.filter(el => el.value !== 'Select All').find(el => el.isSelected === false)) {
                this.uniqueItems[0].indeterminate = false;
                this.uniqueItems[0].isSelected = true;
            } else if (!this.uniqueItems.filter(el => el.value !=='Select All').find(el => el.isSelected === true)) {
                this.uniqueItems[0].indeterminate = false;
                this.uniqueItems[0].isSelected = false;
            } else {
                this.uniqueItems[0].indeterminate = true;
            }
        }
    }

    public onItemKeyDown(eventArgs: KeyboardEvent) {
        //eventArgs.target.parentElement.children[1].focus();
    }

    public clearInput() {
        this.searchValue = null;
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
            this._overlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Left;
            this._overlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Right;
        } else {
            this._overlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Right;
            this._overlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Left;
        }

        this._overlaySettings.positionStrategy.settings.target = headerTarget;
        this.dropdown.toggle(this._overlaySettings);

        const se = this.column.grid.sortingExpressions.find(expr=>expr.fieldName === this.column.field);
        if(se) {
            if(se.dir === 1) {
                this.sortButtonGroup.selectButton(0);
            } else {
                this.sortButtonGroup.selectButton(1);
            }
        }
    }

    public onSortButtonClicked(sortDirection) {
        if (this.sortButtonGroup.selectedIndexes.length === 0) {
            this.filteringService.grid.clearSort(this.column.field);
        } else {
            this.filteringService.grid.sort({ fieldName: this.column.field, dir: sortDirection, ignoreCase: true });
        }
    }

    public onMouseEnter(eventArgs) {
        this.isMouseOverMoreFilters = true;
        if (!this.isSubMenuOpened) {
            this._subMenuoverlaySettings.positionStrategy.settings.target = eventArgs.target;

            const gridRect = this.filteringService.grid.nativeElement.getBoundingClientRect();
            const dropdownRect = this.dropdown.element.getBoundingClientRect();

            let x = dropdownRect.left + dropdownRect.width;
            let x1 = gridRect.left + gridRect.width;
            x += window.pageXOffset;
            x1 += window.pageXOffset;
            if (Math.abs(x - x1) < 200) {
                this._subMenuoverlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Left;
                this._subMenuoverlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Left;
            } else {
                this._subMenuoverlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Right;
                this._subMenuoverlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Right;
            }

            this.subMenu.open(this._subMenuoverlaySettings);
            this.isSubMenuOpened = true;
        }
    }

    public onMouseLeave() {
        this.isMouseOverMoreFilters = false;
        requestAnimationFrame(()=>{
            if (!this.isMouseOverSubMenu) {
                this.subMenu.close();
            }
        });
    }

    public onMenuMouseEnter(eventArgs) {
        requestAnimationFrame(()=>{
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
        this.selectedOperator = eventArgs.newSelection.value;
        eventArgs.cancel = true;
        this.dropdown.close();
        this.subMenu.close();
        this.customMenu.open(this._overlaySettings);
    }

    public closeDialog() {
        this.uniqueItems = cloneArray(this.originalItems, true);
        this.originalItems = [];
        this.dropdown.close();
    }

    public onDropDownClosing() {
        this.searchValue = null;
    }

    public onDropDownOpening() {
        this.originalItems = cloneArray(this.uniqueItems, true);
    }

    private createInitialExpressionUIElement(){
        this.expressionsList = [];
        const firstExprUI = new ExpressionUI();
        firstExprUI.expression = {
            condition: IgxStringFilteringOperand.instance().condition(this.selectedOperator),
            fieldName: this.column.field,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: null
        };
        firstExprUI.afterOperator = FilteringLogic.And;

        this.expressionsList.push(firstExprUI);

        const secondExprUI = new ExpressionUI();
        secondExprUI.expression = {
            condition: null,
            fieldName: this.column.field,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: null
        };

        secondExprUI.beforeOperator = FilteringLogic.And;

        this.expressionsList.push(secondExprUI);
    }

    public onCustomMenuOpening() {
        if (!this.column.filteringExpressionsTree) {
            this.createInitialExpressionUIElement();
        } else {
            //TODO
            // check fitlers and populate expressionsList
        }
    }

    public toggleCustomMenuDropDown(input: IgxInputGroupComponent, targetDropDown: IgxDropDownComponent) {
        this._overlaySettings.positionStrategy.settings.target = input.element.nativeElement;
        targetDropDown.toggle(this._overlaySettings)
    }

    public getIconName(exp: ExpressionUI): string {
        if (this.column.dataType === DataType.Boolean && exp.expression.condition === null) {
            return this.getCondition(this.conditions[0]).iconName;
        } else if (!exp.expression.condition) {
            return 'filter_list';
        }else {
            return exp.expression.condition.iconName;
        }
    }

    public getConditionName(condition: IFilteringOperation) {
        return condition ? condition.name : null;
    }

    public isConditionSelected(conditionName: string, exp: ExpressionUI): boolean {
        if (exp.expression.condition) {
            return exp.expression.condition.name === conditionName;
        } else {
            return false;
        }
    }

    public onConditionsChanged(eventArgs: any, exp: ExpressionUI, inputValues: any) {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        exp.expression.condition = this.getCondition(value);

        inputValues.focus();
    }

    public isValueSelected(value: string, exp: ExpressionUI): boolean {
        if (exp.expression.searchVal) {
            return exp.expression.searchVal === value;
        } else {
            return false;
        }
    }

    public onValuesChanged(eventArgs: any, exp: ExpressionUI, inputValues: any) {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        exp.expression.searchVal = value;

        inputValues.focus();
    }

    public onDropdownValuesOpening(targetDropdown: IgxDropDownComponent, inputValues: any) {
        targetDropdown.items.forEach(dropdownItem => {
            if(dropdownItem.value === inputValues.value) {
                dropdownItem.isSelected = true;
                targetDropdown.setSelectedItem(dropdownItem.index);
            } else {
                dropdownItem.isSelected = false;
            }
        });
    }

    public onLogicOperatorButtonClicked(eventArgs, buttonGroup: IgxButtonGroupComponent, buttonIndex: number, exp: ExpressionUI) {
        if (buttonGroup.selectedButtons.length === 0) {
            eventArgs.stopPropagation();
            buttonGroup.selectButton(buttonIndex);
        } else {
            exp.afterOperator = buttonIndex;
            this.expressionsList[this.expressionsList.indexOf(exp) + 1].beforeOperator = exp.afterOperator;
        }
    }

    public applyFilter() {
        const filterTree = new FilteringExpressionsTree(FilteringLogic.Or, this.column.field);
        const selectedItems = this.uniqueItems.filter(el => el.value !== 'Select All' && el.isSelected === true);
        const unselectedItems = this.uniqueItems.find(el => el.value !== 'Select All' && el.isSelected === false);

        if (unselectedItems) {
            if (selectedItems.length === 0) {
                //TODO
                this.filteringService.grid.filter(this.column.field, null, filterTree);
            } else {
                selectedItems.forEach(element => {
                    filterTree.filteringOperands.push({
                        condition: IgxStringFilteringOperand.instance().condition("equals"),
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

        this.originalItems = [];
        this.dropdown.close();
    }

    public onMoveButtonClicked(moveDirection) {
        const index = this.column.visibleIndex;
        this.filteringService.grid.moveColumn(this.column, this.filteringService.grid.columns[index + moveDirection]);
        this.dropdown.close();
    }

    public onClearButtonClick() {
        this.filteringService.grid.clearFilter(this.column.field);
        this.createInitialExpressionUIElement();
        this.cdr.detectChanges();
    }

    public onCancelButtonClick() {
        this.customMenu.close();
    }

    public onApplyButtonClick() {
        //TODO
        // remove bad expression UIs
        this.filteringService.filter(this.column.field, this.expressionsList);
        this.customMenu.close();
    }

    public onAddButtonClick() {
        const exprUI = new ExpressionUI();
        exprUI.expression = {
            condition: null,
            fieldName: this.column.field,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: null
        };

        if (this.expressionsList.length === 0) {
            exprUI.afterOperator = FilteringLogic.And;
        } else {
            exprUI.beforeOperator = this.expressionsList[this.expressionsList.length - 1].afterOperator;
        }

        this.expressionsList.push(exprUI);
    }

    public onPin() {
        this.column.pinned = !this.column.pinned;
        this.dropdown.close();
    }

    public onHide() {
        this.column.hidden = true;
        this.dropdown.close();
    }

    public onRemoveButtonClick(exp: ExpressionUI) {
        const indexToRemove = this.expressionsList.indexOf(exp);

        if (indexToRemove === 0 && this.expressionsList.length === 1) {
            this.expressionsList.splice(indexToRemove, 1);
            return;
        }

        if (indexToRemove === 0 && this.expressionsList.length > 1) {
            this.expressionsList[1].beforeOperator = null;
        } else if (indexToRemove === this.expressionsList.length - 1 ) {
            this.expressionsList[indexToRemove - 1].afterOperator = null;
        } else {
            this.expressionsList[indexToRemove - 1].afterOperator = this.expressionsList[indexToRemove + 1].beforeOperator;
            this.expressionsList[0].beforeOperator = null;
            this.expressionsList[this.expressionsList.length - 1].afterOperator = null;
        }

        this.expressionsList.splice(indexToRemove, 1);
    }

    @ViewChild('dropdown', { read: IgxToggleDirective }) 
    public dropdown: IgxToggleDirective;

    @ViewChild('subMenu', { read: IgxDropDownComponent }) 
    public subMenu: IgxDropDownComponent;

    @ViewChild('customMenu', { read: IgxToggleDirective }) 
    public customMenu: IgxToggleDirective;

    @ViewChild('sortButtonGroup', { read: IgxButtonGroupComponent }) 
    public sortButtonGroup: IgxButtonGroupComponent;

    @ViewChild('ascButton', { read: ElementRef }) 
    public ascButton: ElementRef;

    @ViewChild('descButtonGroup', { read: ElementRef }) 
    public descButton: ElementRef;

    @ViewChild('input', { read: ElementRef })
    protected input: ElementRef;
    
}