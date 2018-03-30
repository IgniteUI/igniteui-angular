import {
    AfterContentInit,
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
/**
 * **Ignite UI for Angular Column** - [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html#columns-configuration)  
 * The Ignite UI Column is used within an `igx-grid` element to define what data the column will show. Features such as sorting,
 * filtering & editing are enabled at the column level.  You can also provide a template containing custom content inside
 * the column using `ng-template` which will be used for all cells within the column.
 */
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

    @Input()
    public pinned = false;

    public gridID: string;

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

    get visibleIndex(): number {
        const grid = this.gridAPI.get(this.gridID);
        let vIndex = -1;
        if (!this.pinned) {
            const indexInCollection = grid.unpinnedColumns.indexOf(this);
            vIndex = indexInCollection === -1 ? -1 : grid.pinnedColumns.length + indexInCollection;
        } else {
            vIndex = grid.pinnedColumns.indexOf(this);
        }
        return vIndex;
    }

    protected _bodyTemplate: TemplateRef<any>;
    protected _headerTemplate: TemplateRef<any>;
    protected _footerTemplate: TemplateRef<any>;
    protected _inlineEditorTemplate: TemplateRef<any>;
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

    constructor(public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef) { }

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
    }

    public pin() {
        this.gridAPI.get(this.gridID).pinColumn(this.field);
    }
    public unpin() {
        this.gridAPI.get(this.gridID).unpinColumn(this.field);
    }
    protected check() {
        if (this.gridID) {
            this.grid.markForCheck();
        }
    }
}
