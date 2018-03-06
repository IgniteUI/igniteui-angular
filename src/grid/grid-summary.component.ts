import { ChangeDetectionStrategy, Component, DoCheck, HostBinding, HostListener, Input } from "@angular/core";
import { DataType } from "../data-operations/data-util";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-summary",
    templateUrl: "./grid-summary.component.html"
})
export class IgxGridSummaryComponent {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    get dataType(): DataType {
        return this.column.dataType;
    }

    @HostBinding("style.min-width")
    @HostBinding("style.flex-basis")
    @HostBinding("class.igx-grid__th--fw")
    get width() {
        return this.column.width;
    }

    constructor(private gridAPI: IgxGridAPIService) { }

    public min() {
        if (this.column.dataType === DataType.Number) {
            return this.gridAPI.min(this.gridID, this.column);
        } else {
            return "-";
        }
    }
}
