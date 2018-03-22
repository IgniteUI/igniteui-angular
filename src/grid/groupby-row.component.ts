import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren
} from "@angular/core";
import { IgxForOfDirective } from "../directives/for-of/for_of.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { autoWire, IGridBus } from "./grid.common";
import { IgxGridComponent } from "./grid.component";
import { IgxGridRowComponent } from "./row.component";
import { IGroupByRecord } from "../data-operations/groupby-record.interface";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-groupby-row",
    templateUrl: "./groupby-row.component.html"
})
export class IgxGridGroupByRowComponent {

    @Input()
    public index: number;

    @Input()
    public gridID: string;

    @Input()
    public groupRow: IGroupByRecord;

    @ViewChild("defaultGroupRow", { read: TemplateRef })
    protected defaultGroupRowTemplate: TemplateRef<any>;

    get template(): TemplateRef<any> {
        return this.defaultGroupRowTemplate;
    }
};