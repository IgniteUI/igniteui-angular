import {
    Component,
    ChangeDetectionStrategy,
    AfterViewInit,
    ViewChild,
    Input
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxFilteringService, ExpressionUI } from '../grid-filtering.service';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';
import { IgxDropDownComponent, IgxDropDownItemComponent } from '../../../drop-down';
import { IgxInputGroupComponent } from '../../../input-group';
import { DataType } from '../../../data-operations/data-util';
import { IFilteringOperation } from '../../../data-operations/filtering-condition';
import { OverlaySettings, ConnectedPositioningStrategy, CloseScrollStrategy } from '../../../services';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-default-expression',
    templateUrl: './excel-style-default-expression.component.html'
})
export class IgxExcelStyleDefaultExpressionComponent implements AfterViewInit {

    private _dropDownOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(),
        scrollStrategy: new CloseScrollStrategy()
    };

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public columnData: any[];

    @Input()
    public expressionUI: ExpressionUI;

    @Input()
    public expressionsList: Array<ExpressionUI>;

    @Input()
    public isLast: Boolean;

    constructor(public filteringService: IgxFilteringService) {}

    ngAfterViewInit(): void {
        this._dropDownOverlaySettings.outlet = this.column.grid.outletDirective;
    }

    public onValuesChanged(eventArgs: any, inputValues: any) {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expressionUI.expression.searchVal = value;

        inputValues.focus();
    }

    public onDropdownValuesOpening(targetDropdown: IgxDropDownComponent, inputValues: any) {
        targetDropdown.items.forEach(dropdownItem => {
            if (dropdownItem.value === inputValues.value) {
                dropdownItem.isSelected = true;
                targetDropdown.setSelectedItem(dropdownItem.index);
            } else {
                dropdownItem.isSelected = false;
            }
        });
    }

    public isConditionSelected(conditionName: string): boolean {
        if (this.expressionUI.expression.condition) {
            return this.expressionUI.expression.condition.name === conditionName;
        } else {
            return false;
        }
    }

    public getConditionName(condition: IFilteringOperation) {
        return condition ? condition.name : null;
    }

    public getInputWidth(input) {
        return input ? input.element.nativeElement.offsetWidth + 'px': null;
    }

    //DUPLICATE

    get conditions() {
        return this.column.filters.conditionList();
    }

    public translateCondition(value: string): string {
        return this.filteringService.grid.resourceStrings[`igx_grid_filter_${this.getCondition(value).name}`] || value;
    }

    public getIconName(): string {
        if (this.column.dataType === DataType.Boolean && this.expressionUI.expression.condition === null) {
            return this.getCondition(this.conditions[0]).iconName;
        } else if (!this.expressionUI.expression.condition) {
            return 'filter_list';
        } else {
            return this.expressionUI.expression.condition.iconName;
        }
    }

    public toggleCustomDialogDropDown(input: IgxInputGroupComponent, targetDropDown: IgxDropDownComponent) {
        this._dropDownOverlaySettings.positionStrategy.settings.target = input.element.nativeElement;
        targetDropDown.toggle(this._dropDownOverlaySettings);
    }

    //DUPLICATE

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.condition(value);
    }

    public onConditionsChanged(eventArgs: any, inputValues: any) {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expressionUI.expression.condition = this.getCondition(value);

        requestAnimationFrame(() => { inputValues.focus();});
    }

    public isValueSelected(value: string): boolean {
        if (this.expressionUI.expression.searchVal) {
            return this.expressionUI.expression.searchVal === value;
        } else {
            return false;
        }
    }

    public onLogicOperatorButtonClicked(eventArgs, buttonGroup: IgxButtonGroupComponent, buttonIndex: number) {
        if (buttonGroup.selectedButtons.length === 0) {
            eventArgs.stopPropagation();
            buttonGroup.selectButton(buttonIndex);
        } else {
            this.expressionUI.afterOperator = buttonIndex;
            this.expressionsList[this.expressionsList.indexOf(this.expressionUI) + 1].beforeOperator = this.expressionUI.afterOperator;
        }
    }

    public onRemoveButtonClick() {
        const indexToRemove = this.expressionsList.indexOf(this.expressionUI);

        if (indexToRemove === 0 && this.expressionsList.length > 1) {
            this.expressionsList[1].beforeOperator = null;
        } else if (indexToRemove === this.expressionsList.length - 1) {
            this.expressionsList[indexToRemove - 1].afterOperator = null;
        } else {
            this.expressionsList[indexToRemove - 1].afterOperator = this.expressionsList[indexToRemove + 1].beforeOperator;
            this.expressionsList[0].beforeOperator = null;
            this.expressionsList[this.expressionsList.length - 1].afterOperator = null;
        }

        this.expressionsList.splice(indexToRemove, 1);
    }
}