import { Component, AfterViewInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpressionUI } from './common';
import { AbsoluteScrollStrategy, ColumnType, ConnectedPositioningStrategy, DataUtil, FilteringLogic, GridColumnDataType, IBaseEventArgs, IFilteringOperation, IgxOverlayOutletDirective, OverlaySettings, PlatformUtil } from 'igniteui-angular/core';
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';
import { IgxInputDirective, IgxInputGroupComponent, IgxPrefixDirective } from 'igniteui-angular/input-group';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxButtonDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IgxButtonGroupComponent } from 'igniteui-angular/button-group';

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
    imports: [FormsModule, IgxSelectComponent, IgxPrefixDirective, IgxIconComponent, IgxSelectItemComponent, IgxInputGroupComponent, IgxInputDirective, IgxButtonDirective, IgxButtonGroupComponent, IgxOverlayOutletDirective, IgxIconButtonDirective]
})
export class IgxExcelStyleDefaultExpressionComponent implements AfterViewInit {
    public cdr = inject(ChangeDetectorRef);
    protected platform = inject(PlatformUtil);

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
        this.expressionUI.expression.conditionName = value;

        this.focus();
    }

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.condition(value);
    }

    public getConditionFriendlyName(name: string): string {
        return this.grid.resourceStrings[`igx_grid_filter_${name}`] || name;
    }

    public updateSearchValueOnBlur(eventArgs) {
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
