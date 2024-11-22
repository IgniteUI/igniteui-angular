import {
    Component,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ViewChild
} from '@angular/core';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';
import { GridColumnDataType, DataUtil } from '../../../data-operations/data-util';
import { IFilteringOperation } from '../../../data-operations/filtering-condition';
import { IBaseEventArgs, PlatformUtil } from '../../../core/utils';
import { FilteringLogic } from '../../../data-operations/filtering-expression.interface';
import { IgxSelectComponent } from '../../../select/select.component';
import { IgxOverlayOutletDirective } from '../../../directives/toggle/toggle.directive';
import { ExpressionUI } from './common';
import { ColumnType } from '../../common/grid.interface';
import { OverlaySettings } from '../../../services/overlay/utilities';
import { AbsoluteScrollStrategy } from '../../../services/overlay/scroll/absolute-scroll-strategy';
import { ConnectedPositioningStrategy } from '../../../services/overlay/position/connected-positioning-strategy';
import { IgxButtonDirective } from '../../../directives/button/button.directive';
import { IgxInputDirective } from '../../../directives/input/input.directive';
import { IgxInputGroupComponent } from '../../../input-group/input-group.component';
import { IgxSelectItemComponent } from '../../../select/select-item.component';
import { IgxIconComponent } from '../../../icon/icon.component';
import { NgIf, NgFor } from '@angular/common';
import { IgxPrefixDirective } from '../../../directives/prefix/prefix.directive';
import { IgxIconButtonDirective } from '../../../directives/button/icon-button.directive';

/**
 * @hidden
 */
export interface ILogicOperatorChangedArgs extends IBaseEventArgs {
    target: ExpressionUI;
    newValue: FilteringLogic;
}

/**
 * @hidden
 */
@Component({
    selector: 'igx-excel-style-default-expression',
    templateUrl: './excel-style-default-expression.component.html',
    imports: [IgxSelectComponent, IgxPrefixDirective, NgIf, IgxIconComponent, NgFor, IgxSelectItemComponent, IgxInputGroupComponent, IgxInputDirective, IgxButtonDirective, IgxButtonGroupComponent, IgxOverlayOutletDirective, IgxIconButtonDirective]
})
export class IgxExcelStyleDefaultExpressionComponent implements AfterViewInit {
    @Input()
    public column: ColumnType;

    @Input()
    public expressionUI: ExpressionUI;

    @Input()
    public expressionsList: Array<ExpressionUI>;

    @Input()
    public grid: any;

    @Output()
    public expressionRemoved = new EventEmitter<ExpressionUI>();

    @Output()
    public logicOperatorChanged = new EventEmitter<ILogicOperatorChangedArgs>();

    @ViewChild('overlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    public overlayOutlet: IgxOverlayOutletDirective;

    @ViewChild('dropdownConditions', { read: IgxSelectComponent, static: true })
    protected dropdownConditions: IgxSelectComponent;

    @ViewChild('logicOperatorButtonGroup', { read: IgxButtonGroupComponent })
    protected logicOperatorButtonGroup: IgxButtonGroupComponent;

    @ViewChild('inputValues', { read: IgxInputDirective, static: true })
    protected inputValuesDirective: IgxInputDirective;

    public dropDownOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    public get isLast(): boolean {
        return this.expressionsList[this.expressionsList.length - 1] === this.expressionUI;
    }

    public get isSingle(): boolean {
        return this.expressionsList.length === 1;
    }

    public get conditionsPlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_condition_placeholder'];
    }

    public get inputValuePlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_row_placeholder'];
    }

    public get type() {
        switch (this.column.dataType) {
            case GridColumnDataType.Number:
            case GridColumnDataType.Currency:
            case GridColumnDataType.Percent:
                return 'number';
            default:
                return 'text';
        }
    }

    constructor(public cdr: ChangeDetectorRef, protected platform: PlatformUtil) { }

    public get conditions() {
        return this.column.filters.conditionList();
    }

    protected get inputValuesElement() {
        return this.inputValuesDirective.nativeElement;
    }

    public ngAfterViewInit(): void {
        this.dropDownOverlaySettings.outlet = this.overlayOutlet;
        this.dropDownOverlaySettings.target = this.dropdownConditions.inputGroup.element.nativeElement;
        this.dropDownOverlaySettings.excludeFromOutsideClick = [this.dropdownConditions.inputGroup.element.nativeElement as HTMLElement];
        this.dropDownOverlaySettings.positionStrategy = new ConnectedPositioningStrategy();
    }

    public focus() {
        // use requestAnimationFrame to focus the values input because when initializing the component
        // datepicker's input group is not yet fully initialized
        requestAnimationFrame(() => this.inputValuesElement.focus());
    }

    public translateCondition(value: string): string {
        return this.grid.resourceStrings[`igx_grid_filter_${this.getCondition(value).name}`] || value;
    }

    public getIconName(): string {
        if (this.column.dataType === GridColumnDataType.Boolean && this.expressionUI.expression.condition === null) {
            return this.getCondition(this.conditions[0]).iconName;
        } else if (!this.expressionUI.expression.condition) {
            return 'filter_list';
        } else {
            return this.expressionUI.expression.condition.iconName;
        }
    }

    public isConditionSelected(conditionName: string): boolean {
        return this.expressionUI.expression.condition && this.expressionUI.expression.condition.name === conditionName;
    }

    public onConditionsChanged(eventArgs: any) {
        const value = (eventArgs.newSelection as IgxSelectComponent).value;
        this.expressionUI.expression.condition = this.getCondition(value);

        this.focus();
    }

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.condition(value);
    }

    public getConditionFriendlyName(name: string): string {
        return this.grid.resourceStrings[`igx_grid_filter_${name}`] || name;
    }

    public onValuesInput(eventArgs) {
        this.expressionUI.expression.searchVal = DataUtil.parseValue(this.column.dataType, eventArgs.target.value);
    }

    public onLogicOperatorButtonClicked(eventArgs, buttonIndex: number) {
        if (this.logicOperatorButtonGroup.selectedButtons.length === 0) {
            eventArgs.stopPropagation();
            this.logicOperatorButtonGroup.selectButton(buttonIndex);
        } else {
            this.logicOperatorChanged.emit({
                target: this.expressionUI,
                newValue: buttonIndex as FilteringLogic
            });
        }
    }

    public onLogicOperatorKeyDown(eventArgs: KeyboardEvent, buttonIndex: number) {
        if (eventArgs.key === this.platform.KEYMAP.ENTER) {
            this.logicOperatorButtonGroup.selectButton(buttonIndex);
            this.logicOperatorChanged.emit({
                target: this.expressionUI,
                newValue: buttonIndex as FilteringLogic
            });
        }
    }

    public onRemoveButtonClick() {
        this.expressionRemoved.emit(this.expressionUI);
    }

    public onOutletPointerDown(event) {
        event.preventDefault();
    }
}
