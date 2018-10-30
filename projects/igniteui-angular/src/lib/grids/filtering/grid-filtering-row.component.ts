import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    TemplateRef,
    ViewChild,
    OnDestroy,
    ViewChildren,
    QueryList,
    ElementRef,
    HostBinding,
    HostListener
} from '@angular/core';
import { Subject } from 'rxjs';
import { DataType } from '../../data-operations/data-util';
import { IgxColumnComponent } from '../column.component';
import { IgxDropDownComponent, ISelectionEventArgs } from '../../drop-down/drop-down.component';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { HorizontalAlignment, VerticalAlignment } from '../../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../../services/overlay/position/connected-positioning-strategy';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IChipSelectEventArgs, IBaseChipEventArgs, IgxChipsAreaComponent, IgxChipComponent } from '../../chips';
import { ExpressionUI } from './grid-filtering.service';
import { IgxDropDownItemComponent } from '../../drop-down/drop-down-item.component';
import { IgxGridFilterConditionPipe } from '../grid-common.pipes';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { IgxFilteringService } from './grid-filtering.service';
import { KEYS } from '../../core/utils';
import { AbsoluteScrollStrategy } from '../../services/overlay/scroll';

/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-grid-filtering-row',
    templateUrl: './grid-filtering-row.component.html'
})
export class IgxGridFilteringRowComponent implements AfterViewInit, OnDestroy {

    @Input()
    get column(): IgxColumnComponent {
        return this._column;
    }

    set column(val) {
        if (val) {
            this._column = val;

            this.expressionsList = this.filteringService.getExpressions(this._column.field);

            this.resetExpression();

            this.offset = 0;
            this.transform(this.offset);
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

    private _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Bottom
    };

    private _conditionsOverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    private _operatorsOverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    private rootExpressionsTree: FilteringExpressionsTree;
    private filterPipe = new IgxGridFilterConditionPipe();
    private titlecasePipe = new TitleCasePipe();
    private datePipe = new DatePipe(this.locale);
    private chipsAreaWidth: number;
    private offset: number = 0;
    private conditionChanged = new Subject();
    private unaryConditionChanged = new Subject();
    private _column = null;
    private conditionsDropDownClosed = new Subject();

    public showArrows: boolean;
    public expression: IFilteringExpression;
    public expressionsList: Array<ExpressionUI>;

    @HostBinding('class.igx-grid__filtering-row')
    public cssClass = 'igx-grid__filtering-row';

    constructor(private filteringService: IgxFilteringService, public element: ElementRef, public cdr: ChangeDetectorRef) {
        this.unaryConditionChanged.subscribe(() => this.unaryConditionChangedCallback());
        this.conditionChanged.subscribe(() => this.conditionChangedCallback());
    }

    ngAfterViewInit() {
        if (this.column.dataType === DataType.Date) {
            this.cdr.detectChanges();
        }

            this._conditionsOverlaySettings.positionStrategy.settings.target = this.inputGroupPrefix.nativeElement;
        this.input.nativeElement.focus();
        }

    ngOnDestroy() {
        this.conditionChanged.unsubscribe();
        this.unaryConditionChanged.unsubscribe();
        this.conditionsDropDownClosed.unsubscribe();
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
        return this.column.filters.instance().conditionList();
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
            return this.titlecasePipe.transform(this.filterPipe.transform(this.expression.condition.name));
        } else {
            return 'Add filter value';
        }
    }

    public onPrefixKeyDown(event: KeyboardEvent) {
        if ((event.key === KEYS.ENTER || event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE) &&
            this.dropDownConditions.collapsed) {
            this.dropDownConditions.toggle(this._conditionsOverlaySettings);
            event.stopImmediatePropagation();
        } else if (event.key === KEYS.TAB && event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    public onInputKeyDown(event: KeyboardEvent) {
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
        } else if (event.key === KEYS.DOWN_ARROW) {
            this.input.nativeElement.blur();
            this.inputGroupPrefix.nativeElement.focus();
            this.toggleConditionsDropDown();
        }
    }

    /**
     * @hidden
     */
    public datePickerClose() {
        this.input.nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener('keydown', ['$event'])
    public onKeydown(event) {
        if (event.key === KEYS.TAB) {
            event.stopPropagation();
            if (document.activeElement === this.closeButton.nativeElement && !event.shiftKey) {
                event.preventDefault();
            }
        }
    }

    private showHideArrowButtons() {
        requestAnimationFrame(() => {
            const containerWidth = this.container.nativeElement.getBoundingClientRect().width;
            this.chipsAreaWidth = this.chipsArea.element.nativeElement.getBoundingClientRect().width;

            this.showArrows = this.chipsAreaWidth >= containerWidth;
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

    public conditionChangedCallback() {
        if (!!this.expression.searchVal || this.expression.searchVal === 0) {
            this.filter();
        } else if (this.value) {
            this.value = null;
        }
    }

    public unaryConditionChangedCallback() {
        if (this.value) {
            this.value = null;
        }
        if (this.expressionsList.find(item => item.expression === this.expression) === undefined) {
            this.addExpression(true);
        }
        this.filter();
    }

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.instance().condition(value);
    }

    public getIconName(): string {
        if (this.column.dataType === DataType.Boolean && this.expression.searchVal === null) {
            return this.getCondition(this.conditions[0]).iconName;
        } else {
            return this.expression.condition.iconName;
        }
    }

    public isConditionSelected(conditionName: string): boolean {
        if (this.expression.condition) {
            return this.expression.condition.name === conditionName;
        } else {
            return false;
        }
    }

    public getOperator(operator: FilteringLogic): string {
        return FilteringLogic[operator];
    }

    public getChipLabel(expression: IFilteringExpression): any {
        if (expression.condition.isUnary) {
            return this.titlecasePipe.transform(this.filterPipe.transform(expression.condition.name));
        } else if (expression.searchVal instanceof Date) {
            return this.datePipe.transform(expression.searchVal);
        } else {
            return expression.searchVal;
        }
    }

    public clearFiltering() {
        this.filteringService.clearFilter(this.column.field);
        this.resetExpression();
        this.cdr.detectChanges();

        this.offset = 0;
        this.transform(this.offset);
    }

    public clearInput() {
        this.value = null;
    }

    public onClearKeyDown(eventArgs: KeyboardEvent) {
        if (eventArgs.key === KEYS.ENTER) {
            eventArgs.preventDefault();
            this.clearInput();
        }
    }

    public close() {
        if (this.expressionsList.length === 1 &&
            this.expressionsList[0].expression.searchVal === null &&
            this.expressionsList[0].expression.condition.isUnary === false) {
            this.filteringService.clearFilter(this.column.field);
        } else {
            this.expressionsList.forEach((item) => {
                if (item.expression.searchVal === null && !item.expression.condition.isUnary) {
                    this.filteringService.removeExpression(this.column.field, this.expressionsList.indexOf(item));
                }
            });
        }

        this.filteringService.isFilterRowVisible = false;
        this.filteringService.filteredColumn = null;
        this.filteringService.selectedExpression = null;
        this.cdr.detectChanges();

        this.offset = 0;
        this.transform(this.offset);
    }

    public toggleConditionsDropDown() {
        this.dropDownConditions.toggle(this._conditionsOverlaySettings);
    }

    public toggleOperatorsDropDown(eventArgs, index) {
        this._operatorsOverlaySettings.positionStrategy.settings.target = eventArgs.target;
        this.dropDownOperators.toArray()[index].toggle(this._operatorsOverlaySettings);
    }

    public filter() {
        this.rootExpressionsTree = this.filteringService.createSimpleFilteringTree(this.column.field);

        this.filteringService.filter(this.column.field, this.rootExpressionsTree);
    }

    public onConditionsChanged(eventArgs) {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expression.condition = this.getCondition(value);
        if (this.expression.condition.isUnary) {
            this.unaryConditionChanged.next(value);
        } else {
            this.conditionChanged.next(value);
        }

        if (this.input) {
            this.input.nativeElement.focus();
        }
    }

    public onChipSelected(eventArgs: IChipSelectEventArgs, expression: IFilteringExpression) {
        if (eventArgs.selected) {
            if (this.chipsArea.chipsList) {
                this.chipsArea.chipsList.forEach((chip) => {
                    if(chip !== eventArgs.owner) {
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

    public onChipKeyDown(eventArgs: KeyboardEvent, chip: IgxChipComponent) {
        if (eventArgs.key === KEYS.ENTER) {
            eventArgs.preventDefault();
            chip.selected = !chip.selected;
        }
    }

    public scrollChipsIntoView(event) {
        if (event.keyCode === KEYS.TAB) {
            this.offset = 0;
            this.transform(this.offset);
        }
    }

    public onChipRemoved(eventArgs: IBaseChipEventArgs, item: ExpressionUI) {
        const indexToRemove = this.expressionsList.indexOf(item);
        this.removeExpression(indexToRemove, item.expression);

        this.scrollChipsOnRemove();
    }

    public onLogicOperatorChanged(eventArgs: ISelectionEventArgs, expression: ExpressionUI) {
        if (eventArgs.oldSelection) {
            expression.afterOperator = (eventArgs.newSelection as IgxDropDownItemComponent).value;
            this.expressionsList[this.expressionsList.indexOf(expression) + 1].beforeOperator = expression.afterOperator;
            this.filter();
        }
    }

    private scrollChipsWhenAddingExpression() {
        const chipAraeChildren = this.chipsArea.element.nativeElement.children;
        if (!chipAraeChildren || chipAraeChildren.length === 0) {
            return;
        }

        const containerRectRight = Math.ceil(this.container.nativeElement.getBoundingClientRect().right);

        const lastChipRectRight = Math.ceil(chipAraeChildren[chipAraeChildren.length - 1].getBoundingClientRect().right);
        if (lastChipRectRight >= containerRectRight) {
            this.offset -= lastChipRectRight - containerRectRight;
            this.transform(this.offset);
        }
    }

    public scrollChipsOnArrowPress(event) {
        let count = 0;
        const chipAraeChildren = this.chipsArea.element.nativeElement.children;
        const containerRect = this.container.nativeElement.getBoundingClientRect();

        if (event === 'right') {
            for (let index = 0; index < chipAraeChildren.length; index++) {
                if (Math.ceil(chipAraeChildren[index].getBoundingClientRect().right) < Math.ceil(containerRect.right)) {
                    count++;
                }
            }

            if (count < chipAraeChildren.length) {
                this.offset -= Math.ceil(chipAraeChildren[count].getBoundingClientRect().right) - Math.ceil(containerRect.right) + 1;
                this.transform(this.offset);
            }
        }

        if (event === 'left') {
            for (let index = 0; index < chipAraeChildren.length; index++) {
                if (Math.ceil(chipAraeChildren[index].getBoundingClientRect().left) < Math.ceil(containerRect.left)) {
                    count++;
                }
            }

            if (count > 0) {
                this.offset += Math.ceil(containerRect.left) - Math.ceil(chipAraeChildren[count - 1].getBoundingClientRect().left) + 1;
                this.transform(this.offset);
            }
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
            this.offset = 0;
        } else {
            let dif = chipAraeChildren[count].id === 'chip' ? count - 2 : count - 1;
            this.offset += Math.ceil(containerRect.left) - Math.ceil(chipAraeChildren[dif].getBoundingClientRect().left) + 1;
        }

        this.transform(this.offset);
    }
}
