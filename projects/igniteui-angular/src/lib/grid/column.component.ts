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
} from '@angular/core';
import { DataType } from '../data-operations/data-util';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { IgxGridAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryOperand, IgxSummaryResult } from './grid-summary';
import { IgxGridSummaryComponent } from './grid-summary.component';
import {
    IgxCellEditorTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective
} from './grid.common';
import { IgxGridComponent } from './grid.component';
import { IFilteringOperation, IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand,
    IgxStringFilteringOperand } from '../../public_api';
/**
 * **Ignite UI for Angular Column** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html#columns-configuration)
 *
 * The Ignite UI Column is used within an `igx-grid` element to define what data the column will show. Features such as sorting,
 * filtering & editing are enabled at the column level.  You can also provide a template containing custom content inside
 * the column using `ng-template` which will be used for all cells within the column.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-column',
    template: ``
})
export class IgxColumnComponent implements AfterContentInit {

    @Input()
    public field: string;

    @Input()
    public header = '';

    @Input()
    public sortable = false;

    @Input()
    public editable = false;

    @Input()
    public filterable = false;

    @Input()
    public resizable = false;

    @Input()
    public hasSummary = false;

    @Input()
    get hidden(): boolean {
        return this._hidden;
    }

    set hidden(value: boolean) {
        if (this._hidden !== value) {
            this._hidden = value;
            this.check();

            if (this.grid) {
                const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.grid.id);
                const oldIndex = activeInfo.columnIndex;

                if (this.grid.lastSearchInfo.searchText) {
                    if (this.index <= oldIndex) {
                        const newIndex = this.hidden ? oldIndex - 1 : oldIndex + 1;
                        this.updateHighlights(oldIndex, newIndex);
                    } else if (oldIndex === -1 && !this.hidden) {
                        this.grid.refreshSearch();
                    }
                }
            }
        }
    }

    @Input()
    get disableHiding(): boolean {
        return this._disableHiding;
    }

    set disableHiding(value: boolean) {
        if (this._disableHiding !== value) {
            this._disableHiding = value;
            this.check();
        }
    }

    @Input()
    public movable = false;

    @Input()
    public width: string;

    @Input()
    public maxWidth: string;

    @Input()
    public minWidth = this.defaultMinWidth;

    @Input()
    public headerClasses = '';

    @Input()
    public cellClasses = '';

    @Input()
    get index(): number {
        return this._index;
    }

    set index(value: number) {
        if (this._index !== value) {
            this._index = value;
            this.check();
        }
    }

    @Input()
    public formatter: (value: any) => any;

    @Input()
    public filteringCondition: IFilteringOperation;

    @Input()
    public filteringIgnoreCase = true;

    @Input()
    public sortingIgnoreCase = true;

    @Input()
    public dataType: DataType = DataType.String;

    @Input()
    public pinned = false;

    public gridID: string;

    @Input()
    public get summaries(): any {
        return this._summaries;
    }

    public set summaries(classRef: any) {
        this._summaries = new classRef();
    }

    @Input()
    public searchable = true;

    @Input()
    public get filters(): any {
        return this._filters;
    }
    public set filters(classRef: any) {
        this._filters = classRef;
    }

    get defaultMinWidth(): string {
        return this._defaultMinWidth;
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

    get cells(): IgxGridCellComponent[] {
        return this.grid.rowList.map((row) => row.cells.filter((cell) => cell.columnIndex === this.index))
        .reduce((a, b) => a.concat(b), []);
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
    protected _summaries = null;
    protected _filters = null;
    protected _hidden = false;
    protected _index: number;
    protected _disableHiding = false;

    private _defaultMinWidth = '88';

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
        if (!this.summaries) {
            switch (this.dataType) {
                case DataType.String:
                case DataType.Boolean:
                    this.summaries = IgxSummaryOperand;
                    break;
                case DataType.Number:
                    this.summaries = IgxNumberSummaryOperand;
                    break;
                case DataType.Date:
                    this.summaries = IgxDateSummaryOperand;
                    break;
            }
        }
        if (!this.filters) {
            switch (this.dataType) {
                case DataType.Boolean:
                    this.filters = IgxBooleanFilteringOperand;
                    break;
                case DataType.Number:
                    this.filters = IgxNumberFilteringOperand;
                    break;
                case DataType.Date:
                    this.filters = IgxDateFilteringOperand;
                    break;
                case DataType.String:
                default:
                    this.filters = IgxStringFilteringOperand;
                    break;
            }
        }
    }

    public pin(): boolean {
        return this.gridAPI.get(this.gridID).pinColumn(this.field);
    }

    public unpin(): boolean {
        return this.gridAPI.get(this.gridID).unpinColumn(this.field);
    }

    public updateHighlights(oldIndex: number, newIndex: number) {
        const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.grid.id);

        if (activeInfo.columnIndex === oldIndex) {
            IgxTextHighlightDirective.setActiveHighlight(this.grid.id,
                newIndex,
                activeInfo.rowIndex,
                activeInfo.index,
                activeInfo.page);

            this.grid.refreshSearch(true);
        }
    }

    protected check() {
        if (this.grid) {
            this.grid.markForCheck();
        }
    }
}
