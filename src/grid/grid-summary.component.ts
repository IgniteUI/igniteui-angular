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
            this.subscriptionOnEdit$ = this.gridAPI.get(this.gridID).onEditDone.subscribe(this.clearCache.bind(this));
            this.subscriptionOnAdd$ = this.gridAPI.get(this.gridID).onRowAdded.subscribe(this.clearCache.bind(this));
            this.subscriptionOnDelete$ = this.gridAPI.get(this.gridID).onRowDeleted.subscribe(this.clearCache.bind(this));
        }
    }

    @autoWire(true)
    clearCache(ev) {
        this.summaryCacheMap.delete(this.column.field);
    }

    get resolveSummaries(): any[] {
        if (!this.summaryCacheMap.get(this.column.field)) {
            this.summaryCacheMap.set(this.column.field,
                this.column.summaries.operate(this.gridAPI.get(this.gridID).data.map((rec) => rec[this.column.field])));
        }
        return this.summaryCacheMap.get(this.column.field);
    }

}
