import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, DoCheck, HostBinding, HostListener, Input, OnDestroy, OnInit } from "@angular/core";
import { DataType } from "../data-operations/data-util";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryOperand, IgxSummaryResult } from "./grid-summary";
import { autoWire, IGridBus } from "./grid.common";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-summary",
    templateUrl: "./grid-summary.component.html"
})
export class IgxGridSummaryComponent implements IGridBus, OnInit, OnDestroy, DoCheck, AfterContentInit {

    fieldName: string;

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    get dataType(): DataType {
        return this.column.dataType;
    }

    @HostBinding("class.igx-grid-summary--pinned")
    get isPinned() {
        return this.column.pinned;
    }

    @HostBinding("class.igx-grid-summary--pinned-last")
    get isLastPinned() {
        const pinnedCols = this.gridAPI.get(this.gridID).pinnedColumns;
        if (pinnedCols.length === 0) {
            return false;
        } else {
            return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
        }
    }

    @HostBinding("class.igx-grid-summary--empty")
    get emptyClass(): boolean {
        return !this.column.hasSummary;
    }

    @HostBinding("class.igx-grid-summary")
    get defaultClass(): boolean {
        return this.column.hasSummary;
    }

    @HostBinding("style.min-width")
    @HostBinding("style.flex-basis")
    get width() {
        return this.column.width;
    }

    protected subscriptionOnEdit$;
    protected subscriptionOnAdd$;
    protected subscriptionOnDelete$;
    protected subscriptionOnFilter$;
    private itemClass = "igx-grid-summary__item";
    private hiddenItemClass = "igx-grid-summary__item--inactive";
    private summaryResultClass = "igx-grid-summary-item__result--left-align";
    private numberSummaryResultClass = "igx-grid-summary-item__result";

    constructor(public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef) { }

    @autoWire(true)
    public ngOnInit() {
    }

    public ngOnDestroy() {
        if (this.subscriptionOnEdit$) {
            this.subscriptionOnEdit$.unsubscribe();
        }
        if (this.subscriptionOnAdd$) {
            this.subscriptionOnAdd$.unsubscribe();
        }
        if (this.subscriptionOnDelete$) {
            this.subscriptionOnDelete$.unsubscribe();
        }
        if (this.subscriptionOnFilter$) {
            this.subscriptionOnFilter$.unsubscribe();
        }
    }

    ngDoCheck() {
        this.cdr.detectChanges();
    }

    ngAfterContentInit() {
        if (this.column.hasSummary) {
            this.subscriptionOnEdit$ = this.gridAPI.get(this.gridID).onEditDone.subscribe((editCell) => {
                if (editCell.cell) {
                    this.fieldName = editCell.cell.column.field;
                    this.clearCache(editCell.cell.column.field);
                } else {
                    this.clearAll();
                }
            });
            this.subscriptionOnFilter$ = this.gridAPI.get(this.gridID).onFilteringDone.subscribe((data) => {
                this.fieldName = data.fieldName;
                this.clearAll();
            });
            this.subscriptionOnAdd$ = this.gridAPI.get(this.gridID).onRowAdded.subscribe(() => this.clearAll());
            this.subscriptionOnDelete$ = this.gridAPI.get(this.gridID).onRowDeleted.subscribe(() => this.clearAll());
        }
    }

    @autoWire(true)
    clearCache(field) {
        this.gridAPI.remove_summary(this.gridID, field);
    }

    @autoWire(true)
    clearAll() {
        this.gridAPI.remove_summary(this.gridID);
        this.gridAPI.get(this.gridID).markForCheck();
        this.cdr.detectChanges();
    }

    get resolveSummaries(): any[] {
        if (this.fieldName) {
            const field = this.fieldName;
            this.fieldName = null;
            this.gridAPI.set_summary_by_column_name(this.gridID, field);
            if (this.column.field === field) {
                return this.gridAPI.get_summaries(this.gridID).get(field);
            } else {
                return this.gridAPI.get_summaries(this.gridID).get(this.column.field);
            }
        } else {
            this.gridAPI.set_summary_by_column_name(this.gridID, this.column.field);
            return this.gridAPI.get_summaries(this.gridID).get(this.column.field);
        }
    }

    public summaryValueClass(result: any): string {
        if (typeof result === "number") {
            return this.numberSummaryResultClass;
        } else {
            return this.summaryResultClass;
        }
    }

    public summaryClass() {
        return this.itemClass;
    }
}
