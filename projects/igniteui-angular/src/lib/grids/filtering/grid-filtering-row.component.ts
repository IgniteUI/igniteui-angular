import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    TemplateRef,
    ViewChild,
    ViewChildren,
    QueryList,
    ElementRef,
    HostBinding,
    HostListener,
    ChangeDetectionStrategy
} from '@angular/core';
import { Subject } from 'rxjs';
import { DataType } from '../../data-operations/data-util';
import { IgxColumnComponent } from '../column.component';
import { IgxDropDownComponent, ISelectionEventArgs } from '../../drop-down/drop-down.component';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { HorizontalAlignment, VerticalAlignment, OverlaySettings } from '../../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../../services/overlay/position/connected-positioning-strategy';
import { IChipSelectEventArgs, IBaseChipEventArgs, IgxChipsAreaComponent, IgxChipComponent } from '../../chips';
import { ExpressionUI } from './grid-filtering.service';
import { IgxDropDownItemComponent } from '../../drop-down/drop-down-item.component';
import { IgxFilteringService } from './grid-filtering.service';
import { KEYS } from '../../core/utils';
import { AbsoluteScrollStrategy } from '../../services/overlay/scroll';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-filtering-row',
    templateUrl: './grid-filtering-row.component.html'
})
export class IgxGridFilteringRowComponent implements AfterViewInit {

    private _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Bottom
    };

    private _conditionsOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    private _operatorsOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    private chipsAreaWidth: number;
    private chipAreaScrollOffset = 0;
    private _column = null;

    public showArrows: boolean;
    public expression: IFilteringExpression;
    public expressionsList: Array<ExpressionUI>;

    @Input()
    get column(): IgxColumnComponent {
        return this._column;
    }

    set column(val) {
        if (val) {
            this._column = val;

            this.expressionsList = this.filteringService.getExpressions(this._column.field);

            this.resetExpression();

            this.chipAreaScrollOffset = 0;
            this.transform(this.chipAreaScrollOffset);
        }
    }

    @Input()
    get value(): any {
        return this.expression ? this.expression.searchVal : null;
    }

    set value(val) {
        if (!val && val !== 0) {
            this.expression.searchVal = null;
        } else {
            this.expression.searchVal = this.transformValue(val);
            if (this.expressionsList.find(item => item.expression === this.expression) === undefined) {
                this.addExpression(true);
            }
        }

        this.filter();
    }

    get locale() {
        return window.navigator.language;
    }

    @ViewChild('defaultFilterUI', { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild('defaultDateUI', { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild('input', { read: ElementRef })
    protected input: ElementRef;

    @ViewChild('inputGroupConditions', { read: IgxDropDownComponent })
    protected dropDownConditions: IgxDropDownComponent;

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent })
    protected chipsArea: IgxChipsAreaComponent;

    @ViewChildren('operators', { read: IgxDropDownComponent })
    protected dropDownOperators: QueryList<IgxDropDownComponent>;

    @ViewChild('inputGroupPrefix', { read: ElementRef })
    protected inputGroupPrefix: ElementRef;

    @ViewChild('container')
    protected container: ElementRef;

    @ViewChild('operand')
    protected operand: ElementRef;

    @ViewChild('closeButton')
    protected closeButton: ElementRef;

    @HostBinding('class.igx-grid__filtering-row')
    public cssClass = 'igx-grid__filtering-row';

    constructor(public filteringService: IgxFilteringService, public element: ElementRef, public cdr: ChangeDetectorRef) {}

    ngAfterViewInit() {
        this._conditionsOverlaySettings.outlet = this.column.grid.outletDirective;
        this._operatorsOverlaySettings.outlet = this.column.grid.outletDirective;

        if (this.column.dataType === DataType.Date) {
            // TODO: revise usage of cdr.detectChanges() here
            this.cdr.detectChanges();
        }

        this.input.nativeElement.focus();
    }

    @HostListener('keydown.shift.tab', ['$event'])
    @HostListener('keydown.tab', ['$event'])
    public onTabKeydown(event) {
        event.stopPropagation();
        if (document.activeElement === this.closeButton.nativeElement && !event.shiftKey) {
            event.preventDefault();
        }
    }

    @HostListener('keydown.esc', ['$event'])
    public onEscKeydown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.close();
    }

    get disabled(): boolean {
        return !(this.column.filteringExpressionsTree && this.column.filteringExpressionsTree.filteringOperands.length > 0);
    }

    get template(): TemplateRef<any> {
        if (this.column.dataType === DataType.Date) {
            return this.defaultDateUI;
        }

        return this.defaultFilterUI;
    }

    get type() {
        switch (this.column.dataType) {
            case DataType.String:
            case DataType.Boolean:
                return 'text';
            case DataType.Number:
                return 'number';
        }
    }

    get conditions(): any {
        return this.column.filters.conditionList();
    }

    get isUnaryCondition(): boolean {
        if (this.expression.condition) {
            return this.expression.condition.isUnary;
        } else {
            return true;
        }
    }

    get placeholder(): string {
        if (this.expression.condition && this.expression.condition.isUnary) {
            return this.filteringService.getChipLabel(this.expression);
        } else if (this.column.dataType === DataType.Date) {
            return this.filteringService.grid.resourceStrings.igx_grid_filter_row_date_placeholder;
        } else if (this.column.dataType === DataType.Boolean) {
            return this.filteringService.grid.resourceStrings.igx_grid_filter_row_boolean_placeholder;
        } else {
            return this.filteringService.grid.resourceStrings.igx_grid_filter_row_placeholder;
        }
    }

    /**
     * Event handler for keydown on the input group's prefix.
     */
    public onPrefixKeyDown(event: KeyboardEvent) {
        if ((event.key === KEYS.ENTER || event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE) &&
            this.dropDownConditions.collapsed) {
            this._conditionsOverlaySettings.positionStrategy.settings.target = this.inputGroupPrefix.nativeElement;
            this.dropDownConditions.toggle(this._conditionsOverlaySettings);
            event.stopImmediatePropagation();
        } else if (event.key === KEYS.TAB && event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /**
     * Event handler for keydown on the input.
     */
    public onInputKeyDown(event: KeyboardEvent) {
        if (this.column.dataType === DataType.Boolean) {
            if ((event.key === KEYS.ENTER || event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE) &&
            this.dropDownConditions.collapsed) {
                this.toggleConditionsDropDown(this.inputGroupPrefix.nativeElement);
                event.stopPropagation();
                return;
            } else if ((event.key === KEYS.ESCAPE || event.key === KEYS.ESCAPE_IE) && !this.dropDownConditions.collapsed) {
                this.toggleConditionsDropDown(this.inputGroupPrefix.nativeElement);
                event.stopPropagation();
                return;
            }
        }

        if (event.key === KEYS.ENTER) {
            this.chipsArea.chipsList.filter(chip => chip.selected = false);

            let indexToDeselect = -1;
            for (let index = 0; index < this.expressionsList.length; index++) {
                const expression = this.expressionsList[index].expression;
                if (expression.searchVal === null && !expression.condition.isUnary) {
                    indexToDeselect = index;
                }
            }

            if (indexToDeselect !== -1) {
                this.removeExpression(indexToDeselect, this.expression);
            }

            this.resetExpression();
            this.scrollChipsWhenAddingExpression();
        } else if (event.altKey && (event.key === KEYS.DOWN_ARROW || event.key === KEYS.DOWN_ARROW_IE)) {
            this.input.nativeElement.blur();
            this.inputGroupPrefix.nativeElement.focus();
            this.toggleConditionsDropDown(this.inputGroupPrefix.nativeElement);
        } else if (event.key === KEYS.ESCAPE || event.key === KEYS.ESCAPE_IE) {
            event.preventDefault();
            this.close();
        }
        event.stopPropagation();
    }

    /**
     * Event handler for input click event.
     */
    public onInputClick() {
        if (this.column.dataType === DataType.Boolean) {
            this.toggleConditionsDropDown(this.inputGroupPrefix.nativeElement);
        }
    }

    /**
     * Event handler for datepicker's close.
     */
    public datePickerClose() {
        this.input.nativeElement.focus();
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

    /**
     * Returns the icon name of the current condition.
     */
    public getIconName(): string {
        if (this.column.dataType === DataType.Boolean && this.expression.condition === null) {
            return this.getCondition(this.conditions[0]).iconName;
        } else {
            return this.expression.condition.iconName;
        }
    }

    /**
     * Returns whether a given condition is selected in dropdown.
     */
    public isConditionSelected(conditionName: string): boolean {
        if (this.expression.condition) {
            return this.expression.condition.name === conditionName;
        } else {
            return false;
        }
    }

    /**
     * Clears the current filtering.
     */
    public clearFiltering() {
        this.filteringService.clearFilter(this.column.field);
        this.resetExpression();
        if (this.input) {
            this.input.nativeElement.focus();
        }
        this.cdr.detectChanges();

        this.chipAreaScrollOffset = 0;
        this.transform(this.chipAreaScrollOffset);
    }

    /**
     * Clears the value of the input.
     */
    public clearInput() {
        this.value = null;
    }

    /**
     * Event handler for keydown on clear button.
     */
    public onClearKeyDown(eventArgs: KeyboardEvent) {
        if (eventArgs.key === KEYS.ENTER) {
            eventArgs.preventDefault();
            this.clearInput();
        }
    }

    /**
     * Closes the filtering edit row.
     */
    public close() {
        if (this.expressionsList.length === 1 &&
            this.expressionsList[0].expression.searchVal === null &&
            this.expressionsList[0].expression.condition.isUnary === false) {
            this.filteringService.getExpressions(this.column.field).pop();
        } else {
            this.expressionsList.forEach((item) => {
                if (item.expression.searchVal === null && !item.expression.condition.isUnary) {
                    this.filteringService.removeExpression(this.column.field, this.expressionsList.indexOf(item));
                }
            });
        }

        this.filteringService.updateFilteringCell(this.column);
        this.filteringService.focusFilterCellChip(this.column, true);

        this.filteringService.isFilterRowVisible = false;
        this.filteringService.filteredColumn = null;
        this.filteringService.selectedExpression = null;
        this.cdr.detectChanges();

        this.chipAreaScrollOffset = 0;
        this.transform(this.chipAreaScrollOffset);
    }

    /*
    * Opens date-picker if condition is not unary
    */
    public openDatePicker(openDialog: Function) {
        if (!this.expression.condition.isUnary) {
            openDialog();
        }
    }

    /**
     * Opens the conditions dropdown.
     */
    public toggleConditionsDropDown(target: any) {
        this._conditionsOverlaySettings.positionStrategy.settings.target = target;
        this.dropDownConditions.toggle(this._conditionsOverlaySettings);
    }

    /**
     * Opens the logic operators dropdown.
     */
    public toggleOperatorsDropDown(eventArgs, index) {
        this._operatorsOverlaySettings.positionStrategy.settings.target = eventArgs.target.parentElement;
        this.dropDownOperators.toArray()[index].toggle(this._operatorsOverlaySettings);
    }

    /**
     * Event handler for change event in conditions dropdown.
     */
    public onConditionsChanged(eventArgs) {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expression.condition = this.getCondition(value);
        if (this.expression.condition.isUnary) {
            // update grid's filtering on the next cycle to ensure the drop-down is closed
            // if the drop-down is not closed this event handler will be invoked multiple times
            requestAnimationFrame(() => this.unaryConditionChangedCallback());
        } else {
            requestAnimationFrame(() => this.conditionChangedCallback());
        }

        if (this.input) {
            this.input.nativeElement.focus();
        }
    }

    /**
     *  Event handler for chip selected event.
     */
    public onChipSelected(eventArgs: IChipSelectEventArgs, expression: IFilteringExpression) {
        if (eventArgs.selected) {
            if (this.chipsArea.chipsList) {
                this.chipsArea.chipsList.forEach((chip) => {
                    if (chip !== eventArgs.owner) {
                        chip.selected = false;
                    }
                });
            }
            this.expression = expression;

            if (this.input) {
                this.input.nativeElement.focus();
            }
        } else if (this.expression === expression) {
            this.resetExpression();
        }
    }

    /**
     * Event handler for chip keydown event.
     */
    public onChipKeyDown(eventArgs: KeyboardEvent, chip: IgxChipComponent) {
        if (eventArgs.key === KEYS.ENTER) {
            eventArgs.preventDefault();
            chip.selected = !chip.selected;
        }
    }

    /**
     * Scrolls the first chip into view if the tab key is pressed on the left arrow.
     */
    public onLeftArrowKeyDown(event) {
        if (event.key === KEYS.TAB) {
            this.chipAreaScrollOffset = 0;
            this.transform(this.chipAreaScrollOffset);
        }
    }

    /**
     * Event handler for chip removed event.
     */
    public onChipRemoved(eventArgs: IBaseChipEventArgs, item: ExpressionUI) {
        const indexToRemove = this.expressionsList.indexOf(item);
        this.removeExpression(indexToRemove, item.expression);

        this.scrollChipsOnRemove();
    }

    /**
     * Event handler for logic operator changed event.
     */
    public onLogicOperatorChanged(eventArgs: ISelectionEventArgs, expression: ExpressionUI) {
        if (eventArgs.oldSelection) {
            expression.afterOperator = (eventArgs.newSelection as IgxDropDownItemComponent).value;
            this.expressionsList[this.expressionsList.indexOf(expression) + 1].beforeOperator = expression.afterOperator;

            // update grid's filtering on the next cycle to ensure the drop-down is closed
            // if the drop-down is not closed this event handler will be invoked multiple times
            requestAnimationFrame(() => this.filter());
        }
    }

    /**
     * Scrolls the chips into the chip area when left or right arrows are pressed.
     */
    public scrollChipsOnArrowPress(arrowPosition: string) {
        let count = 0;
        const chipAraeChildren = this.chipsArea.element.nativeElement.children;
        const containerRect = this.container.nativeElement.getBoundingClientRect();

        if (arrowPosition === 'right') {
            for (let index = 0; index < chipAraeChildren.length; index++) {
                if (Math.ceil(chipAraeChildren[index].getBoundingClientRect().right) < Math.ceil(containerRect.right)) {
                    count++;
                }
            }

            if (count < chipAraeChildren.length) {
                this.chipAreaScrollOffset -= Math.ceil(chipAraeChildren[count].getBoundingClientRect().right) -
                    Math.ceil(containerRect.right) + 1;
                this.transform(this.chipAreaScrollOffset);
            }
        }

        if (arrowPosition === 'left') {
            for (let index = 0; index < chipAraeChildren.length; index++) {
                if (Math.ceil(chipAraeChildren[index].getBoundingClientRect().left) < Math.ceil(containerRect.left)) {
                    count++;
                }
            }

            if (count > 0) {
                this.chipAreaScrollOffset += Math.ceil(containerRect.left) -
                    Math.ceil(chipAraeChildren[count - 1].getBoundingClientRect().left) + 1;
                this.transform(this.chipAreaScrollOffset);
            }
        }
    }

    private showHideArrowButtons() {
        requestAnimationFrame(() => {
            const containerWidth = this.container.nativeElement.getBoundingClientRect().width;
            this.chipsAreaWidth = this.chipsArea.element.nativeElement.getBoundingClientRect().width;

            this.showArrows = this.chipsAreaWidth >= containerWidth;

            // TODO: revise the cdr.detectChanges() usage here
            this.cdr.detectChanges();
        });
    }

    private transformValue(value): any {
        if (this.column.dataType === DataType.Number) {
            value = parseFloat(value);
        } else if (this.column.dataType === DataType.Boolean) {
            value = Boolean(value);
        }

        return value;
    }

    private addExpression(isSelected: boolean) {
        const exprUI = new ExpressionUI();
        exprUI.expression = this.expression;
        exprUI.beforeOperator = this.expressionsList.length > 0 ? FilteringLogic.And : null;
        exprUI.isSelected = isSelected;

        this.expressionsList.push(exprUI);

        const length = this.expressionsList.length;
        if (this.expressionsList[length - 2]) {
            this.expressionsList[length - 2].afterOperator = this.expressionsList[length - 1].beforeOperator;
        }

        this.showHideArrowButtons();
    }

    private removeExpression(indexToRemove: number, expression: IFilteringExpression) {
        if (indexToRemove === 0 && this.expressionsList.length === 1) {
            this.clearFiltering();
            return;
        }

        this.filteringService.removeExpression(this.column.field, indexToRemove);

        this.filter();

        if (this.expression === expression) {
            this.resetExpression();
        }

        this.showHideArrowButtons();
    }

    private resetExpression() {
        this.expression = {
            fieldName: this.column.field,
            condition: null,
            searchVal: null,
            ignoreCase: this.column.filteringIgnoreCase
        };

        if (this.column.dataType !== DataType.Boolean) {
            this.expression.condition = this.getCondition(this.conditions[0]);
        }

        if (this.column.dataType === DataType.Date && this.input) {
            this.input.nativeElement.value = null;
        }

        this.showHideArrowButtons();
    }

    private scrollChipsWhenAddingExpression() {
        const chipAraeChildren = this.chipsArea.element.nativeElement.children;
        if (!chipAraeChildren || chipAraeChildren.length === 0) {
            return;
        }

        const containerRectRight = Math.ceil(this.container.nativeElement.getBoundingClientRect().right);

        const lastChipRectRight = Math.ceil(chipAraeChildren[chipAraeChildren.length - 1].getBoundingClientRect().right);
        if (lastChipRectRight >= containerRectRight) {
            this.chipAreaScrollOffset -= lastChipRectRight - containerRectRight;
            this.transform(this.chipAreaScrollOffset);
        }
    }

    private transform(offset: number) {
        requestAnimationFrame(() => {
            this.chipsArea.element.nativeElement.style.transform = `translate(${offset}px)`;
        });
    }

    private scrollChipsOnRemove() {
        let count = 0;
        const chipAraeChildren = this.chipsArea.element.nativeElement.children;
        const containerRect = this.container.nativeElement.getBoundingClientRect();

        for (let index = 0; index < chipAraeChildren.length; index++) {
            if (Math.ceil(chipAraeChildren[index].getBoundingClientRect().left) < Math.ceil(containerRect.left)) {
                count++;
            }
        }

        if (count <= 2) {
            this.chipAreaScrollOffset = 0;
        } else {
            const dif = chipAraeChildren[count].id === 'chip' ? count - 2 : count - 1;
            this.chipAreaScrollOffset += Math.ceil(containerRect.left) - Math.ceil(chipAraeChildren[dif].getBoundingClientRect().left) + 1;
        }

        this.transform(this.chipAreaScrollOffset);
    }

    private conditionChangedCallback() {
        if (!!this.expression.searchVal || this.expression.searchVal === 0) {
            this.filter();
        } else if (this.value) {
            this.value = null;
        }
    }

    private unaryConditionChangedCallback() {
        if (this.value) {
            this.value = null;
        }
        if (this.expressionsList.find(item => item.expression === this.expression) === undefined) {
            this.addExpression(true);
        }
        this.filter();
    }

    private filter() {
        this.filteringService.filter(this.column.field);
    }
}
