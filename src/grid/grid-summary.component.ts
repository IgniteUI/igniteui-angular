import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, DoCheck, HostBinding, HostListener, Input, OnDestroy, OnInit } from "@angular/core";
import { Observable} from "rxjs/observable";
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

    summaries: any[];
    summariesCache = [];

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    get dataType(): DataType {
        return this.column.dataType;
    }

    @HostBinding("class")
    get styleClasses(): string {
        return `igx-grid__td ${this.column.summaryClasses}`;
    }

    @HostBinding("style.min-width")
    @HostBinding("style.flex-basis")
    @HostBinding("class.igx-grid__td--fw")
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
        console.log(ev);
        this.summariesCache = [];
    }

    get resolveSummaries(): any[] {
        if (this.summariesCache.length === 0) {
            this.summariesCache = this.column.summaries.operate(this.gridAPI.get(this.gridID).data.map((rec) => rec[this.column.field]));
        }
        return this.summariesCache;
    }

}
