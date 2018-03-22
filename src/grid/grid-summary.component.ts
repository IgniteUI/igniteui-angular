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

    summaryStyle: Map<string, string> = new Map<string, string>();
    fieldName: string;

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    get dataType(): DataType {
        return this.column.dataType;
    }

    @HostBinding("style.min-width")
    @HostBinding("style.flex-basis")
    @HostBinding("class.igx-grid-summary-wrapper")
    get width() {
        return this.column.width;
    }

    protected subscriptionOnEdit$;
    protected subscriptionOnAdd$;
    protected subscriptionOnDelete$;
    private itemClass = "igx-grid-summary-item";
    private hiddenItemClass = "igx-grid-summary-item--inactive";
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

    public summaryClass(functionKey: string) {
        const summaryKey = this.column.field + "_" + functionKey;
        if (this.summaryStyle.has(summaryKey)) {
            return this.summaryStyle.get(summaryKey);
        } else {
            this.summaryStyle.set(summaryKey, this.itemClass);
            return this.summaryStyle.get(summaryKey);
        }
    }

    @autoWire()
    public changeSummaryClass(functionKey: string) {
        const summaryKey = this.column.field + "_" + functionKey;
        switch (this.summaryStyle.get(summaryKey)) {
            case this.itemClass: this.summaryStyle.set(summaryKey, this.hiddenItemClass);  break;
            case this.hiddenItemClass: this.summaryStyle.set(summaryKey, this.itemClass); break;
        }
    }
}
