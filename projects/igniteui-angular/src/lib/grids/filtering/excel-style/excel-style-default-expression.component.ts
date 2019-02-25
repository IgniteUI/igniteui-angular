import {
    Component,
    ChangeDetectionStrategy,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ViewChild
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { ExpressionUI } from '../grid-filtering.service';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';
import { IgxDropDownComponent, IgxDropDownItemComponent } from '../../../drop-down';
import { IgxInputGroupComponent, IgxInputDirective } from '../../../input-group';
import { DataType } from '../../../data-operations/data-util';
import { IFilteringOperation } from '../../../data-operations/filtering-condition';
import { OverlaySettings, ConnectedPositioningStrategy, CloseScrollStrategy } from '../../../services';
import { KEYS } from '../../../core/utils';
import { FilteringLogic } from '../../../data-operations/filtering-expression.interface';
import { IgxGridBaseComponent } from '../../grid';

/**
 * @hidden
 */
export interface ILogicOperatorChangedArgs {
    target: ExpressionUI;
    newValue: FilteringLogic;
}

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

    private _isDropdownValuesOpening = false;
    private _isDropdownOpened = false;
    private _valuesData: any[];

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public columnData: any[];

    @Input()
    public expressionUI: ExpressionUI;

    @Input()
    public expressionsList: Array<ExpressionUI>;

    @Input()
    public grid: IgxGridBaseComponent;

    @Output()
    public onExpressionRemoved = new EventEmitter<ExpressionUI>();

    @Output()
    public onLogicOperatorChanged = new EventEmitter<ILogicOperatorChangedArgs>();

    @ViewChild('inputGroupValues', { read: IgxInputGroupComponent })
    private inputGroupValues: IgxInputGroupComponent;

    @ViewChild('inputValues', { read: IgxInputDirective })
    private inputValuesDirective: IgxInputDirective;

    @ViewChild('dropdownValues', { read: IgxDropDownComponent })
    private dropdownValues: IgxDropDownComponent;

    @ViewChild('logicOperatorButtonGroup', { read: IgxButtonGroupComponent })
    private logicOperatorButtonGroup: IgxButtonGroupComponent;

    protected get inputValuesElement() {
        return this.inputValuesDirective;
    }

    get isLast(): boolean {
        return this.expressionsList[this.expressionsList.length - 1] === this.expressionUI;
    }

    get isSingle(): boolean {
        return this.expressionsList.length === 1;
    }

    get inputConditionsPlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_condition_placeholder'];
    }

    get inputValuePlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_row_placeholder'];
    }

    get valuesData(): any[] {
        if (!this._valuesData) {
            this._valuesData = this.columnData.filter(x => x !== null && x !== undefined && x !== '');
        }

        return this._valuesData;
    }

    constructor(public cdr: ChangeDetectorRef) {}

    ngAfterViewInit(): void {
        this._dropDownOverlaySettings.outlet = this.column.grid.outletDirective;
    }

    public focus() {
        // use requestAnimationFrame to focus the values input because when initializing the component
        // datepicker's input group is not yet fully initialized
        requestAnimationFrame(() => this.inputValuesElement.focus());
    }

    public onValuesChanged(eventArgs: any) {
        if (!this._isDropdownValuesOpening) {
            const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
            this.expressionUI.expression.searchVal = value;

            this.focus();
        }
    }

    public onDropdownValuesOpening() {
        this._isDropdownValuesOpening = true;

        const newSelection = this.dropdownValues.items.find(value => value.value === this.expressionUI.expression.searchVal) || null;
        if (this.dropdownValues.selectedItem !== newSelection) {
            this.dropdownValues.selectItem(newSelection);
        }
    }

    public onDropdownValuesOpened() {
        this._isDropdownValuesOpening = false;
    }

    public isConditionSelected(conditionName: string): boolean {
        return this.expressionUI.expression.condition && this.expressionUI.expression.condition.name === conditionName;
    }

    public getConditionName(condition: IFilteringOperation) {
        return condition ? condition.name : null;
    }

    public getInputWidth(parent: any) {
        return parent ? parent.element.nativeElement.offsetWidth + 'px': null;
    }

    get conditions() {
        return this.column.filters.conditionList();
    }

    public translateCondition(value: string): string {
        return this.grid.resourceStrings[`igx_grid_filter_${this.getCondition(value).name}`] || value;
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

    public onDropdownClosed() {
        this._isDropdownOpened = false;
    }

    public toggleCustomDialogDropDown(input: IgxInputGroupComponent, targetDropDown: IgxDropDownComponent) {
        if (!this._isDropdownOpened) {
            this._dropDownOverlaySettings.positionStrategy.settings.target = input.element.nativeElement;
            targetDropDown.toggle(this._dropDownOverlaySettings);
            this._isDropdownOpened = true;
        }
    }

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.condition(value);
    }

    public onConditionsChanged(eventArgs: any) {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expressionUI.expression.condition = this.getCondition(value);

        this.focus();
    }

    public isValueSelected(value: string): boolean {
        if (this.expressionUI.expression.searchVal) {
            return this.expressionUI.expression.searchVal === value;
        } else {
            return false;
        }
    }

    public onLogicOperatorButtonClicked(eventArgs, buttonIndex: number) {
        if (this.logicOperatorButtonGroup.selectedButtons.length === 0) {
            eventArgs.stopPropagation();
            this.logicOperatorButtonGroup.selectButton(buttonIndex);
        } else {
            this.onLogicOperatorChanged.emit({
                target: this.expressionUI,
                newValue: buttonIndex as FilteringLogic
            });
        }
    }

    public onRemoveButtonClick() {
        this.onExpressionRemoved.emit(this.expressionUI);
    }

    public onInputValuesKeydown(event: KeyboardEvent) {
        if (event.altKey && (event.key === KEYS.DOWN_ARROW || event.key === KEYS.DOWN_ARROW_IE)) {
            this.toggleCustomDialogDropDown(this.inputGroupValues, this.dropdownValues);
        }

        event.stopPropagation();
    }

    public onInputKeyDown(eventArgs) {
        if (eventArgs.key === KEYS.TAB && eventArgs.shiftKey && this.expressionsList[0] === this.expressionUI) {
            eventArgs.stopPropagation();
            eventArgs.preventDefault();
        }
    }
}