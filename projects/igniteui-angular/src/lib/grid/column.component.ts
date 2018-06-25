import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Input,
    QueryList,
    TemplateRef,
    forwardRef,
    AfterViewInit
} from '@angular/core';
import { DataType } from '../data-operations/data-util';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { IgxGridAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryOperand, IgxSummaryResult } from './grid-summary';
import { IgxGridRowComponent } from './row.component';
import {
    IgxCellEditorTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective
} from './grid.common';
import { IgxGridComponent } from './grid.component';
import { IFilteringExpressionsTree, IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand,
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
    public groupable = false;

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
            const cellInEditMode = this.gridAPI.get_cell_inEditMode(this.gridID);
            if (cellInEditMode) {
                if (cellInEditMode.cell.column.field === this.field) {
                    this.gridAPI.escape_editMode(this.gridID, cellInEditMode.cellID);
                }
            }
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

    get index(): number {
        return this.grid.columns.indexOf(this);
    }

    @Input()
    public formatter: (value: any) => any;

    @Input()
    public filteringIgnoreCase = true;

    @Input()
    public sortingIgnoreCase = true;

    @Input()
    public dataType: DataType = DataType.String;

    @Input()
    public get pinned(): boolean {
        return this._pinned;
    }

    public set pinned(value: boolean) {
        if (this._pinned !== value) {
            if (this.grid && this.width && !isNaN(parseInt(this.width, 10))) {
                value ? this._pinColumn() : this._unpinColumn();
                return;
            }
            /* No grid/width available at initialization. `initPinning` in the grid
               will re-init the group (if present)
            */
            this._pinned = value;
        }
    }

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
        return this.grid.rowList.filter((row) => row instanceof IgxGridRowComponent)
            .map((row) => row.cells.filter((cell) => cell.columnIndex === this.index))
                .reduce((a, b) => a.concat(b), []);
    }

    get visibleIndex(): number {
        const grid = this.gridAPI.get(this.gridID);
        let vIndex = -1;

        if (this.columnGroup) {
            return vIndex;
        }

        if (!this.pinned) {
            const indexInCollection = grid.unpinnedColumns.indexOf(this);
            vIndex = indexInCollection === -1 ? -1 : grid.pinnedColumns.length + indexInCollection;
        } else {
            vIndex = grid.pinnedColumns.indexOf(this);
        }
        return vIndex;
    }

    get columnGroup() {
        return false;
    }

    get allChildren(): IgxColumnComponent[] {
        return [];
    }

    get level() {
        let ptr = this.parent;
        let lvl = 0;

        while (ptr) {
            lvl++;
            ptr = ptr.parent;
        }
        return lvl;
    }

    parent = null;
    children;

    protected _unpinnedIndex;
    protected _pinned = false;
    protected _bodyTemplate: TemplateRef<any>;
    protected _headerTemplate: TemplateRef<any>;
    protected _footerTemplate: TemplateRef<any>;
    protected _inlineEditorTemplate: TemplateRef<any>;
    protected _summaries = null;
    protected _filters = null;
    protected _hidden = false;
    protected _index: number;
    protected _disableHiding = false;

    protected _defaultMinWidth = '88';

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

    public updateHighlights(oldIndex: number, newIndex: number) {
        const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.grid.id);

        if (activeInfo && activeInfo.columnIndex === oldIndex) {
            IgxTextHighlightDirective.setActiveHighlight(this.grid.id,
                newIndex,
                activeInfo.rowIndex,
                activeInfo.index,
                activeInfo.page);

            this.grid.refreshSearch(true);
        }
    }

    public _pinColumn(index?) {
        // TODO: Probably should the return type of the old functions
        // should be moved as a event parameter.

        if (this.parent && !this.parent.pinned) {
            this.topLevelParent.pinned = true;
            return;
        }

        const grid = (this.grid as any);
        const width = parseInt(this.width, 10);

        if (grid.getUnpinnedWidth(true) - width < grid.unpinnedAreaMinWidth) {
            return false;
        }

        this._pinned = true;
        const oldIndex = this.visibleIndex;
        this._unpinnedIndex = grid._unpinnedColumns.indexOf(this);
        index = index !== undefined ? index : grid._pinnedColumns.length;
        const args = { column: this, insertAtIndex: index };
        grid.onColumnPinning.emit(args);

        if (grid._pinnedColumns.indexOf(this) === -1) {
            grid._pinnedColumns.splice(args.insertAtIndex, 0, this);

            if (grid._unpinnedColumns.indexOf(this) !== -1) {
                grid._unpinnedColumns.splice(grid._unpinnedColumns.indexOf(this), 1);
            }
        }

        if (this.columnGroup) {
            this.children.forEach(child => child.pinned = true);
        }
        grid.reinitPinStates();

        grid.markForCheck();
        const newIndex = this.visibleIndex;
        this.updateHighlights(oldIndex, newIndex);
    }

    public _unpinColumn(index?) {
        if (this.parent && this.parent.pinned) {
            this.topLevelParent.pinned = false;
            return;
        }

        const grid = (this.grid as any);
        const oldIndex = this.visibleIndex;
        index = index !== undefined ? index : this._unpinnedIndex;
        this._pinned = false;

        grid._unpinnedColumns.splice(index, 0, this);
        if (grid._pinnedColumns.indexOf(this) !== -1) {
            grid._pinnedColumns.splice(grid._pinnedColumns.indexOf(this), 1);
        }

        if (this.columnGroup) {
            this.children.forEach(child => child.pinned = false);
        }
        grid.reinitPinStates();

        grid.markForCheck();
        const newIndex = this.visibleIndex;
        this.updateHighlights(oldIndex, newIndex);
    }

    get topLevelParent() {
        let parent = this.parent;
        while (parent && parent.parent) {
            parent = parent.parent;
        }
        return parent;
    }

    protected check() {
        if (this.grid) {
            this.grid.markForCheck();
        }
    }

}


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: IgxColumnComponent, useExisting: forwardRef(() => IgxColumnGroupComponent)}],
    selector: 'igx-column-group',
    template: ``
})
export class IgxColumnGroupComponent extends IgxColumnComponent implements AfterContentInit {

    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent })
    children = new QueryList<IgxColumnComponent>();

    @Input()
    public get summaries(): any {
        return this._summaries;
    }

    public set summaries(classRef: any) {}

    @Input()
    public searchable = true;

    @Input()
    public get filters(): any {
        return this._filters;
    }
    public set filters(classRef: any) {}

    get defaultMinWidth(): string {
        return this._defaultMinWidth;
    }

    get bodyTemplate(): TemplateRef<any> {
        return this._bodyTemplate;
    }

    set bodyTemplate(template: TemplateRef<any>) {}

    get headerTemplate(): TemplateRef<any> {
        return this._headerTemplate;
    }

    set headerTemplate(template: TemplateRef<any>) {}

    get footerTemplate(): TemplateRef<any> {
        return this._headerTemplate;
    }

    set footerTemplate(template: TemplateRef<any>) {}

    get inlineEditorTemplate(): TemplateRef<any> {
        return this._inlineEditorTemplate;
    }

    set inlineEditorTemplate(template: TemplateRef<any>) {}

    get cells(): IgxGridCellComponent[] {
        return [];
    }

    @Input()
    get hidden() {
        return this.allChildren.every(c => c.hidden);
    }

    set hidden(value: boolean) {
        this._hidden = value;
        this.children.forEach(child => child.hidden = value);
    }

    ngAfterContentInit() {
        /*
            @ContentChildren with descendants still returns the `parent`
            component in the query list.
        */
        this.children.reset(this.children.toArray().slice(1));
        this.children.forEach(child => {
            child.parent = this;
        });
    }

    get allChildren(): IgxColumnComponent[] {
        return flatten(this.children.toArray());
    }

    get columnGroup() {
        return true;
    }

    get width() {
        let isChildrenWidthInPercent = false;
        const width = `${this.children.reduce((acc, val) => {
            if (val.hidden) {
                return acc;
            }

            if (val.width && val.width.indexOf('%') !== -1) {
                isChildrenWidthInPercent = true;
            }

            return acc + parseInt(val.width, 10);
        }, 0)}`;
        return isChildrenWidthInPercent ? width + '%' : width;
    }

    set width(val) {}
}



function flatten(arr: any[]) {
    let result = [];

    arr.forEach(el => {
        result.push(el);
        if (el.children) {
            result = result.concat(flatten(el.children.toArray()));
        }
    });
    return result;
}
