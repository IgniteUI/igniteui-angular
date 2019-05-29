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
import { IgxDropDownItemComponent, IgxDropDownComponent } from '../../../drop-down/index';
import { IgxInputGroupComponent, IgxInputDirective } from '../../../input-group/index';
import { DataType } from '../../../data-operations/data-util';
import { IFilteringOperation } from '../../../data-operations/filtering-condition';
import { OverlaySettings, ConnectedPositioningStrategy, CloseScrollStrategy } from '../../../services/index';
import { KEYS } from '../../../core/utils';
import { FilteringLogic } from '../../../data-operations/filtering-expression.interface';
import { DisplayDensity } from '../../../core/density';

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

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public expressionUI: ExpressionUI;

    @Input()
    public expressionsList: Array<ExpressionUI>;

    @Input()
    public grid: any;

    @Input()
    public displayDensity: DisplayDensity;

    @Output()
    public onExpressionRemoved = new EventEmitter<ExpressionUI>();

    @Output()
    public onLogicOperatorChanged = new EventEmitter<ILogicOperatorChangedArgs>();

    @ViewChild('inputGroupConditions', { read: IgxInputGroupComponent, static: true })
    protected inputGroupConditions: IgxInputGroupComponent;

    @ViewChild('inputValues', { read: IgxInputDirective, static: true })
    protected inputValuesDirective: IgxInputDirective;

    @ViewChild('dropdownConditions', { read: IgxDropDownComponent, static: true })
    protected dropdownConditions: IgxDropDownComponent;

    @ViewChild('logicOperatorButtonGroup', { read: IgxButtonGroupComponent, static: false })
    protected logicOperatorButtonGroup: IgxButtonGroupComponent;

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

    get type() {
        switch (this.column.dataType) {
            case DataType.Number:
                return 'number';
            default:
                return 'text';
        }
    }

    constructor(public cdr: ChangeDetectorRef) {}

    ngAfterViewInit(): void {
        this._dropDownOverlaySettings.outlet = this.column.grid.outletDirective;
        this._dropDownOverlaySettings.positionStrategy.settings.target = this.inputGroupConditions.element.nativeElement;
    }

    public focus() {
        // use requestAnimationFrame to focus the values input because when initializing the component
        // datepicker's input group is not yet fully initialized
        requestAnimationFrame(() => this.inputValuesElement.focus());
    }

    public isConditionSelected(conditionName: string): boolean {
        return this.expressionUI.expression.condition && this.expressionUI.expression.condition.name === conditionName;
    }

    public getConditionName(condition: IFilteringOperation) {
        return condition ? this.translateCondition(condition.name) : null;
    }

    public getInputWidth() {
        return this.inputGroupConditions.element.nativeElement.offsetWidth + 'px';
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

    public toggleCustomDialogDropDown() {
        this.dropdownConditions.toggle(this._dropDownOverlaySettings);
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

    public onValuesInput(eventArgs) {
        this.expressionUI.expression.searchVal = this.transformValue(eventArgs.target.value);
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

    public onLogicOperatorKeyDown(eventArgs, buttonIndex: number) {
        if (eventArgs.key === KEYS.ENTER) {
            this.logicOperatorButtonGroup.selectButton(buttonIndex);
            this.onLogicOperatorChanged.emit({
                target: this.expressionUI,
                newValue: buttonIndex as FilteringLogic
            });
        }
    }

    public onRemoveButtonClick() {
        this.onExpressionRemoved.emit(this.expressionUI);
    }

    public onInputConditionsKeyDown(eventArgs) {
        if (eventArgs.altKey && (eventArgs.key === KEYS.DOWN_ARROW || eventArgs.key === KEYS.DOWN_ARROW_IE)) {
            this.toggleCustomDialogDropDown();
        }

        if (eventArgs.key === KEYS.TAB && eventArgs.shiftKey && this.expressionsList[0] === this.expressionUI) {
            eventArgs.preventDefault();
        }

        event.stopPropagation();
    }

    private transformValue(value): any {
        if (this.column.dataType === DataType.Number) {
            value = parseFloat(value);
        } else if (this.column.dataType === DataType.Boolean) {
            value = Boolean(value);
        }

        return value;
    }
}
