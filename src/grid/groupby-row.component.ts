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
import { take } from "rxjs/operators";
import { IgxBadgeComponent } from "../badge/badge.component";
import { IgxSelectionAPIService } from "../core/selection";
import { IGroupByRecord } from "../data-operations/groupby-record.interface";
import { IgxForOfDirective } from "../directives/for-of/for_of.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { autoWire, IGridBus } from "./grid.common";
import { IgxGridComponent } from "./grid.component";
import { IgxGridRowComponent } from "./row.component";

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
                private selectionAPI: IgxSelectionAPIService,
                public element: ElementRef,
                public cdr: ChangeDetectorRef) { }

    protected defaultCssClass = "igx-grid__tr--group";

    protected isFocused = false;

    get focused(): boolean {
        return this.isFocused;
    }
    @Input()
    public index: number;

    @Input()
    public gridID: string;

    @Input()
    public groupRow: IGroupByRecord;

    @ViewChild("groupContent")
    public groupContent: ElementRef;

    @HostBinding("attr.aria-expanded")
    get expanded(): boolean {
        return this.grid.isExpandedGroup(this.groupRow);
    }

    public tabindex = 0;

    @HostBinding("attr.aria-describedby")
    get describedBy(): string {
        return this.gridID + "_" + this.groupRow.expression.fieldName;
    }

    @HostBinding("style.padding-left")
    get padding(): string {
        return this.groupRow.level * this.grid.groupByIndentation + "px";
    }
    @HostBinding("class")
    get styleClasses(): string {
        return `${this.defaultCssClass}`;
    }

    @HostListener("keydown.enter")
    @HostListener("keydown.space")
    @autoWire(true)
    public toggle() {
        this.grid.toggleGroup(this.groupRow);
    }

    get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    @HostListener("keydown.arrowdown", ["$event"])
    public onKeydownArrowDown(event) {
        const colIndex = this._getSelectedColIndex() || this._getPrevSelectedColIndex();
        const visibleColumnIndex = colIndex ? this.grid.columnList.toArray()[colIndex].visibleIndex : 0;
        event.preventDefault();
        const rowIndex = this.index + 1;
        this.grid.navigateDown(rowIndex, visibleColumnIndex);
    }

    @HostListener("keydown.arrowup", ["$event"])
    public onKeydownArrowUp(event) {
        const colIndex = this._getSelectedColIndex() || this._getPrevSelectedColIndex();
        const visibleColumnIndex = colIndex ? this.grid.columnList.toArray()[colIndex].visibleIndex : 0;
        event.preventDefault();
        if (this.index === 0) {
            return;
        }
        const rowIndex = this.index - 1;
        this.grid.navigateUp(rowIndex, visibleColumnIndex);
    }

    public onFocus() {
        this.isFocused = true;
    }

    public onBlur() {
        this.isFocused = false;
    }

    private _getSelectedColIndex() {
        const selection = this.selectionAPI.get_selection(this.gridID + "-cells");
        if (selection && selection.length > 0) {
             return selection[0].columnID;
        }
    }

    private _getPrevSelectedColIndex() {
        const selection = this.selectionAPI.get_prev_selection(this.gridID + "-cells");
        if (selection && selection.length > 0) {
            return selection[0].columnID;
        }
    }
}
