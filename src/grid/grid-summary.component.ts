import { AfterContentInit, ChangeDetectionStrategy, Component, DoCheck, HostBinding, HostListener, Input, OnInit } from "@angular/core";
import { Observable} from "rxjs/observable";
import { DataType } from "../data-operations/data-util";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryOperand, IgxSummaryResult } from "./grid-summary";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-summary",
    templateUrl: "./grid-summary.component.html"
})
export class IgxGridSummaryComponent implements OnInit, AfterContentInit {

    summaries: any[];
    summariesCache = [];

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    @Input()
    public isActive = false;

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

    constructor(private gridAPI: IgxGridAPIService) { }

    public ngOnInit() {
    }

    public max() {
        if (this.column.dataType === DataType.Number) {
            return this.gridAPI.max(this.gridID, this.column.field);
        }
    }

    ngAfterContentInit() {

    }

    get resolveSummaries(): any[] {
        if (this.summariesCache.length === 0) {
            this.summariesCache = this.column.summaries.operate(this.gridAPI.get(this.gridID).data.map((rec) => rec[this.column.field]));
            console.log("Called:", this.summariesCache);
        }
        this.gridAPI.get(this.gridID).onEditDone.subscribe((x) => {
            console.log(x);
            this.summariesCache = this.column.summaries.operate(this.gridAPI.get(this.gridID).data.map((rec) => rec[this.column.field]));
            // console.log(this.gridAPI.get(this.gridID).data);
        });
        console.table("Cache:", this.summariesCache);
        return this.summariesCache;
    }

}
