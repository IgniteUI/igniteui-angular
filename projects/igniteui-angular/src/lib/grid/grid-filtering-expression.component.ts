import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    Output,
    TemplateRef,
    ViewChild,
    AfterViewInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { DataType } from '../data-operations/data-util';
import { IgxGridAPIService } from './api.service';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IFilteringOperation } from '../data-operations/filtering-condition';


/**
 *@hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-filter-expression',
    templateUrl: './grid-filtering-expression.component.html'
})
export class IgxGridFilterExpressionComponent implements OnDestroy, AfterViewInit {

    @Input()
    get column() {
        return this._column;
    }

    set column(val) {
        this._column = val;

        this.expression.fieldName = val.field;
        this.expression.ignoreCase = val.filteringIgnoreCase;
        this.expression.condition = this.getCondition(this.conditions[0]);
    }

    @Input()
    get value() {
        return this.expression ? this.expression.searchVal : null;
    }

    set value(val) {
        if (!val && val !== 0) {
            this.expression.searchVal = null;
        } else {
            this.expression.searchVal = this.transformValue(val);
        }

        this.onExpressionChanged.emit();
    }

    @Input()
    public name;

    @Output()
    public onExpressionChanged = new EventEmitter();

    @ViewChild('defaultFilterUI', { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild('defaultDateUI', { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild('select', { read: ElementRef })
    protected select: ElementRef;

    @ViewChild('input', { read: ElementRef })
    protected input: ElementRef;

    @HostBinding('attr.class')
    public cssClass = 'igx-filtering__expression';

    private _column: any;
    public expression: IFilteringExpression;
    protected conditionChanged = new Subject();
    protected unaryConditionChanged = new Subject();

    constructor(public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef) {
        this.unaryConditionChanged.subscribe(() => this.unaryConditionChangedCallback());
        this.conditionChanged.subscribe(() => this.conditionChangedCallback());

        this.expression = {
            fieldName: null,
            condition: null,
            searchVal: null,
            ignoreCase: null
        };
    }

    public ngAfterViewInit() {
        if (this.name === 'secondExpr') {
            const expr = this.gridAPI.get(this.gridID).filteringExpressionsTree.find(this.column.field);
            if (expr && (expr as FilteringExpressionsTree).filteringOperands[1]) {
                this.expression.searchVal = ((expr as FilteringExpressionsTree).filteringOperands[1] as IFilteringExpression).searchVal;
                this.expression.condition = ((expr as FilteringExpressionsTree).filteringOperands[1] as IFilteringExpression).condition;
            } else {
                this.expression.searchVal = null;
                this.expression.condition = this.getCondition(this.conditions[0]);
            }
            this.cdr.detectChanges();
        }
    }

    public ngOnDestroy() {
        this.conditionChanged.unsubscribe();
        this.unaryConditionChanged.unsubscribe();
    }

    get template() {
        switch (this.column.dataType) {
            case DataType.String:
            case DataType.Number:
                return this.defaultFilterUI;
            case DataType.Date:
                return this.defaultDateUI;
            case DataType.Boolean:
                return null;
        }
    }

    public conditionChangedCallback(): void {
        if (!!this.expression.searchVal || this.expression.searchVal === 0) {
            this.onExpressionChanged.emit();
        }
    }

    public unaryConditionChangedCallback(): void {
        this.onExpressionChanged.emit();
    }

    public isActive(value): boolean {
        if (this.expression && this.expression.condition && this.expression.condition.name === value) {
            return true;
        } else {
            return false;
        }
    }

    get gridID(): string {
        return this.column.gridID;
    }

    get unaryCondition(): boolean {
        return this.isUnaryCondition();
    }

    public isUnaryCondition(): boolean {
        return this.expression && this.expression.condition && this.expression.condition.isUnary;
    }

    get conditions() {
        return this.column.filters.instance().conditionList();
    }

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.instance().condition(value);
    }

    protected transformValue(value) {
        if (this.column.dataType === DataType.Number) {
            value = parseFloat(value);
        } else if (this.column.dataType === DataType.Boolean) {
            value = Boolean(value);
        }

        return value;
    }

    public selectionChanged(value): void {
        this.focusInput();
        this.expression.condition = this.getCondition(value);
        if (this.unaryCondition) {
            this.unaryConditionChanged.next(value);
        } else {
            this.conditionChanged.next(value);
        }
    }

    public focusInput(): void {
        if (this.input) {
            this.input.nativeElement.focus();
        }
    }

    public clearFiltering(resetCondition: boolean): void {
        this.expression.condition = resetCondition ? undefined : this.expression.condition;
        this.expression.searchVal = null;
        if (!resetCondition) {
            this.onExpressionChanged.emit();
        }
        this.cdr.detectChanges();
    }

    public clearInput(): void {
        this.clearFiltering(false);
    }

    public onDatePickerValueChanged(value): void {
        this.expression.condition = this.getCondition(this.select.nativeElement.value);
        this.value = value;
    }
}
