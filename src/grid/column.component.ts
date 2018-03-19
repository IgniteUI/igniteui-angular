import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Input,
    QueryList,
    TemplateRef
} from "@angular/core";
import { DataType } from "../data-operations/data-util";
import { STRING_FILTERS } from "../data-operations/filtering-condition";
import { IgxGridAPIService } from "./api.service";
import {
    IgxCellEditorTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective
} from "./grid.common";
import { IgxGridComponent } from "./grid.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-column",
    template: ``
})
export class IgxColumnComponent implements AfterContentInit {

    @Input()
    public field: string;

    @Input()
    public header = "";

    @Input()
    public sortable = false;

    @Input()
    public editable = false;

    @Input()
    public filterable = false;

    @Input()
    get hidden(): boolean {
        return this._hidden;
    }

    set hidden(value: boolean) {
        this._hidden = value;
        if (this.isColumnGroup) {
            this.children.forEach((child) => child.hidden = value);
        }
        this.check();
    }

    @Input()
    public movable = false;

    @Input()
    public width: string;

    @Input()
    public headerClasses = "";

    @Input()
    public cellClasses = "";

    @Input()
    get index(): number {
        return this._index;
    }

    set index(value: number) {
        this._index = value;
        this.check();
    }

    @Input()
    public formatter: (value: any) => any;

    @Input()
    public filteringCondition: (target: any, searchVal: any, ignoreCase?: boolean) =>
        boolean = STRING_FILTERS.contains;

    @Input()
    public filteringIgnoreCase = true;

    @Input()
    public sortingIgnoreCase = true;

    @Input()
    public dataType: DataType = DataType.String;

    get gridID(): string {
        return this._gridID;
    }

    set gridID(value: string) {
        this._gridID = value;
        if (this.isColumnGroup) {
            this.children.forEach((child) => child.gridID = value);
        }
    }

    get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    get bodyTemplate(): TemplateRef<any> {
        return this._bodyTemplate;
    }

    set bodyTemplate(template: TemplateRef<any>) {
        this._bodyTemplate = template;
        this.grid.markForCheck();
    }

    get headerTemplate(): TemplateRef<any> {
        return this._headerTemplate;
    }

    set headerTemplate(template: TemplateRef<any>) {
        this._headerTemplate = template;
        this.grid.markForCheck();
    }

    get footerTemplate(): TemplateRef<any> {
        return this._headerTemplate;
    }

    set footerTemplate(template: TemplateRef<any>) {
        this._footerTemplate = template;
        this.grid.markForCheck();
    }

    get inlineEditorTemplate(): TemplateRef<any> {
        return this._inlineEditorTemplate;
    }

    set inlineEditorTemplate(template: TemplateRef<any>) {
        this._inlineEditorTemplate = template;
        this.grid.markForCheck();
    }

    get children(): IgxColumnComponent[] {
        if (this.childColumns) {
            return this.childColumns.toArray();
        }
        return [];
    }

    get descendants() {
        if (!this.isColumnGroup) {
            return [this];
        }
        const result = [];
        this.children.forEach((col) => result.push(col.descendants));
        return flatten(result);
    }

    get isColumnGroup() {
        return this.children.length > 0;
    }

    get parent(): IgxColumnComponent | null {
        return this._parent;
    }

    protected _bodyTemplate: TemplateRef<any>;
    protected _headerTemplate: TemplateRef<any>;
    protected _footerTemplate: TemplateRef<any>;
    protected _inlineEditorTemplate: TemplateRef<any>;
    protected _gridID: string;
    protected _parent = null;
    protected _hidden = false;
    protected _index: number;

    @ContentChild(IgxCellTemplateDirective, { read: IgxCellTemplateDirective })
    protected cellTemplate: IgxCellTemplateDirective;

    @ContentChild(IgxCellHeaderTemplateDirective, { read: IgxCellHeaderTemplateDirective })
    protected headTemplate: IgxCellHeaderTemplateDirective;

    @ContentChild(IgxCellFooterTemplateDirective, { read: IgxCellFooterTemplateDirective })
    protected footTemplate: IgxCellFooterTemplateDirective;

    @ContentChild(IgxCellEditorTemplateDirective, { read: IgxCellEditorTemplateDirective })
    protected editorTemplate: IgxCellEditorTemplateDirective;

    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent })
    protected childColumns: QueryList<IgxColumnComponent>;

    constructor(public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef) {}

    public ngAfterContentInit(): void {
        if (this.cellTemplate) {
            this._bodyTemplate = this.cellTemplate.template;
        }
        if (this.headTemplate) {
            this._headerTemplate = this.headTemplate.template;
        }
        if (this.footTemplate) {
            this._footerTemplate = this.footTemplate.template;
        }
        if (this.editorTemplate) {
            this._inlineEditorTemplate = this.editorTemplate.template;
        }

        this.childColumns.reset(this.childColumns.toArray().slice(1));
        this.setParentWidth();
    }

    protected check() {
        if (this.gridID) {
            this.grid.markForCheck();
        }
    }

    protected setParentWidth() {
        if (this.childColumns.length > 0) {
            this.childColumns.forEach((child) => child._parent = this);
            this.width = `${this.childColumns.reduce((acc, current) => acc + parseFloat(current.width) , 0)}px`;
        }
    }
}

export function flatten(arr) {
    return arr.reduce((flat, toFlatten) => {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
      }, []);
}
