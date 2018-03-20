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
export class IgxGridSummaryComponent implements IGridBus, OnInit, OnDestroy, AfterContentInit {

    summaryCacheMap: Map<string, any[]> = new Map<string, any[]>();
    summaryStyle: Map<string, string> = new Map<string, string>();

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

    ngAfterContentInit() {
        if (this.column.hasSummary) {
            this.subscriptionOnEdit$ = this.gridAPI.get(this.gridID).onEditDone.subscribe(() => this.clearCache());
            this.subscriptionOnAdd$ = this.gridAPI.get(this.gridID).onRowAdded.subscribe(() => this.clearCache());
            this.subscriptionOnDelete$ = this.gridAPI.get(this.gridID).onRowDeleted.subscribe(() => this.clearCache());
        }
    }

    @autoWire(true)
    clearCache() {
        this.summaryCacheMap.delete(this.column.field);
    }

    get resolveSummaries(): any[] {
        if (!this.summaryCacheMap.get(this.column.field)) {
            this.summaryCacheMap.set(this.column.field,
                this.column.summaries.operate(this.gridAPI.get(this.gridID).data.map((rec) => rec[this.column.field])));
        }
        return this.summaryCacheMap.get(this.column.field);
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
