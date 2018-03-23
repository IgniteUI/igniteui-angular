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
    templateUrl: "./groupby-row.component.html",
    styles: [ `:host { 
        display: flex;
        background: inherit;
        outline-style: none;
        height: 50px;
    }`]
})
export class IgxGridGroupByRowComponent {

    constructor(public gridAPI: IgxGridAPIService,
        private element: ElementRef,
        public cdr: ChangeDetectorRef) {}

    @Input()
    public index: number;

    @Input()
    public gridID: string;

    @Input()
    public groupRow: IGroupByRecord;

    get expanded(): boolean {
        return this.grid.isExpandedGroup(this.groupRow);
    }

    @HostBinding("style.padding-left")
    get padding(): string {
        return this.groupRow.level * 100 + "px";
    }

    @autoWire(true)
    public toggle() {
        this.grid.toggleGroup(this.groupRow);
    }

    get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridID);
    }
};