import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DataType } from '../data-operations/data-util';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxGridAPIService } from './api.service';
import { IFilteringOperation } from '../../public_api';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-filter',
    templateUrl: './grid-filtering.component.html'
})
export class IgxGridFilterComponent implements OnInit, OnDestroy, DoCheck {

    @Input()
    public column;

    get value() {
        return this._value;
    }

    set value(val) {
        // filtering needs to be cleared if value is null, undefined or empty string
        if (!val && val !== 0) {
            this.clearFiltering(false);
            return;
        }
        this._value = this.transformValue(val);
        this.filter();
    }

    get dataType(): DataType {
        return this.column.dataType;
    }

    get conditions() {
        return this.column.filters.instance().conditionList();
    }

    get template() {
        switch (this.dataType) {
            case DataType.String:
            case DataType.Number:
                return this.defaultFilterUI;
            case DataType.Date:
                return this.defaultDateUI;
            case DataType.Boolean:
                return null;
        }
    }

    get filterCSS(): string {
        if (this.dialogShowing) {
            return 'igx-filtering__toggle--active';
        }
        if (this.filteringExpression()) {
            return 'igx-filtering__toggle--filtered';
        }
        return 'igx-filtering__toggle';
    }

    get gridID(): string {
        return this.column.gridID;
    }

    @HostBinding('class')
    get styleClasses() {
        return `igx-filtering`;
    }

    public booleanFilterAll = 'All';
    public dialogShowing = false;
    public dialogPosition = 'igx-filtering__options--to-right';

    protected UNARY_CONDITIONS = [
        'true', 'false', 'null', 'notNull', 'empty', 'notEmpty',
        'yesterday', 'today', 'thisMonth', 'lastMonth', 'nextMonth',
        'thisYear', 'lastYear', 'nextYear'
    ];
    protected _value;
    protected _filterCondition;
    protected filterChanged = new Subject();
    protected conditionChanged = new Subject();
    protected unaryConditionChanged = new Subject();
    protected chunkLoaded = new Subscription();
    private MINIMUM_VIABLE_SIZE = 240;

    @ViewChild('defaultFilterUI', { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild('defaultDateUI', { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective})
    protected toggleDirective: IgxToggleDirective;

    @ViewChild('select', { read: ElementRef})
    protected select: ElementRef;

    constructor(private zone: NgZone, public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef, private elementRef: ElementRef) {
        this.filterChanged.pipe(
            debounceTime(250)
        ).subscribe((value) => this.value = value);
        // when condition is unary
        this.unaryConditionChanged.subscribe((value) => this.filter());
        // when condition is NOT unary
        this.conditionChanged.subscribe((value) => this.conditionChangedCallback());
    }

    public ngOnInit() {
        this.chunkLoaded = this.gridAPI.get(this.gridID).headerContainer.onChunkPreload.subscribe(() => {
            if (!this.toggleDirective.collapsed) {
                this.toggleDirective.collapsed = true;
                this.refresh();
            }
        });
    }

    public ngDoCheck() {
        this.cdr.markForCheck();
    }

    public ngOnDestroy() {
        this.filterChanged.unsubscribe();
        this.conditionChanged.unsubscribe();
        this.unaryConditionChanged.unsubscribe();
        this.chunkLoaded.unsubscribe();
    }

    public conditionChangedCallback() {
        if (!!this._value || this._value === 0) {
            this.filter();
        }
    }

    public refresh() {
        this.dialogShowing = !this.dialogShowing;
        if (this.dialogShowing) {
            this.column.filteringCondition = this.getCondition(this.select.nativeElement.value);
        }
        this.cdr.detectChanges();
    }

    public isActive(value): boolean {
        return this._filterCondition === value;
    }

    get unaryCondition(): boolean {
        for (const each of this.UNARY_CONDITIONS) {
            if (this._filterCondition && this._filterCondition === each) {
                return true;
            }
        }
        return false;
    }
    public filter(): void {
        const grid = this.gridAPI.get(this.gridID);
        this.column.filteringCondition = this.getCondition(this.select.nativeElement.value);
        this.gridAPI.filter(
            this.column.gridID, this.column.field,
            this._value, this.column.filteringCondition, this.column.filteringIgnoreCase);
        grid.onFilteringDone.emit({
            fieldName: this.column.field,
            condition: this.column.filteringCondition,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: this._value
        });
    }
    public clearFiltering(resetCondition: boolean): void {
        const grid = this.gridAPI.get(this.gridID);
        const filterValue = this._value;
        this._value = null;
        this._filterCondition = resetCondition ? undefined : this._filterCondition;
        this.gridAPI.clear_filter(this.gridID, this.column.field);
        grid.clearSummaryCache();
        // XXX - Temp fix for (#1183, #1177) (Should be deleted)
        if (this.dataType === DataType.Date) {
            this.cdr.detectChanges();
        }

        grid.onFilteringDone.emit({
            fieldName: this.column.field,
            condition: this.column.filteringCondition,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: filterValue
        });
    }

    public selectionChanged(value): void {
        if (value === this.booleanFilterAll) {
            this.clearFiltering(true);
            return;
        }
        this._filterCondition = value;
        this.column.filteringCondition = this.getCondition(value);
        if (this.unaryCondition) {
            this.unaryConditionChanged.next(value);
        } else {
            this.conditionChanged.next(value);
        }
    }

    public onInputChanged(val): void {
        this.filterChanged.next(val);
    }

    public clearInput(): void {
        this.clearFiltering(false);
    }

    public get disabled() {
        // if filtering is applied, reset button should be active
        if (this.gridAPI.get(this.gridID).filteringExpressions.length > 0) {
            return false;
        }
        return true;
    }

    public onMouseDown() {
        requestAnimationFrame(() => {
            const grid = this.gridAPI.get(this.gridID);
            const gridRect = grid.nativeElement.getBoundingClientRect();
            const dropdownRect = this.elementRef.nativeElement.getBoundingClientRect();

            let x = dropdownRect.left;
            let x1 = gridRect.left + gridRect.width;
            x += window.pageXOffset;
            x1 += window.pageXOffset;
            if (Math.abs(x - x1) < this.MINIMUM_VIABLE_SIZE) {
                this.dialogPosition = 'igx-filtering__options--to-left';
            }
        });
    }

    // XXX - Temp fix for (#1183, #1177) (Should be deleted)
    onDatePickerClick() {
        this.zone.run(() => {});
    }

    @HostListener('click', ['$event'])
    public onClick(event) {
        event.stopPropagation();
    }

    protected getCondition(value: string): IFilteringOperation {
        return this.column.filters.instance().condition(value);
    }

    protected transformValue(value) {
        if (this.dataType === DataType.Number) {
            value = parseFloat(value);
        } else if (this.dataType === DataType.Boolean) {
            value = Boolean(value);
        }

        return value;
    }

    protected filteringExpression(): boolean {
        const expr = this.gridAPI.get(this.gridID)
            .filteringExpressions.find((x) => x.fieldName === this.column.field);

        if (expr) {
            this._value = expr.searchVal;
            this._filterCondition = expr.condition.name;

            if (!this.unaryCondition && !this._value && this._value !== 0) {
                return false;
            }
            return true;
        } else {
            this._value = null;
            this._filterCondition = undefined;
        }
    }
}
