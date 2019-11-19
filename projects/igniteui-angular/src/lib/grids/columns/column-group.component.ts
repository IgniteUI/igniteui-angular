import {
    AfterContentInit,
    Component,
    ContentChildren,
    ChangeDetectionStrategy,
    Input,
    forwardRef,
    QueryList,
    TemplateRef,
    Output,
    EventEmitter
} from '@angular/core';

import { IgxColumnComponent } from './column.component';
import { IgxGridCellComponent } from '../cell.component';
import { flatten } from '../../core/utils';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: IgxColumnComponent, useExisting: forwardRef(() => IgxColumnGroupComponent) }],
    selector: 'igx-column-group',
    template: ``
})
export class IgxColumnGroupComponent extends IgxColumnComponent implements AfterContentInit {

    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent })
    children = new QueryList<IgxColumnComponent>();

    /**
     * Set if the column group is collapsible.
     * Default value is `false`
     * ```html
     *  <igx-column-group [collapsible] = "true"></igx-column-group>
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public set collapsible(value: boolean) {
        this._collapsible = value;
        this.collapsibleChange.emit(this._collapsible);
        if (this.children && !this.hidden) {
            if (this._collapsible) {
                this.setExpandCollapseState();
            } else {
                this.children.forEach(child => child.hidden = false);
            }
        }
    }
    public get collapsible() {
        return this._collapsible && this.checkCollapsibleState();
    }

    /**
     * Set whether the group is expanded or collapsed initially.
     * Applied only if the collapsible property is set to `true`
     * Default value is `true`
     * ```html
     *  const state = false
     *  <igx-column-group [(expand)] = "state"></igx-column-group>
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public set expanded(value: boolean) {
        if (!this.collapsible) { return; }
        this._expanded = value;
        this.expandedChange.emit(this._expanded);
        if (!this.hidden && this.children) {
            this.setExpandCollapseState();
        }
    }
    public get expanded() {
        return this._expanded;
    }

    /**
     * Gets the column group `summaries`.
     * ```typescript
     * let columnGroupSummaries = this.columnGroup.summaries;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public get summaries(): any {
        return this._summaries;
    }
    /**
     * Sets the column group `summaries`.
     * ```typescript
     * this.columnGroup.summaries = IgxNumberSummaryOperand;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    public set summaries(classRef: any) { }
    /**
     * Sets/gets whether the column group is `searchable`.
     * Default value is `true`.
     * ```typescript
     * let isSearchable =  this.columnGroup.searchable;
     * ```
     * ```html
     *  <igx-column-group [searchable] = "false"></igx-column-group>
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public searchable = true;
    /**
     * Gets the column group `filters`.
     * ```typescript
     * let columnGroupFilters = this.columnGroup.filters;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public get filters(): any {
        return this._filters;
    }
    /**
     * Sets the column group `filters`.
     * ```typescript
     * this.columnGroup.filters = IgxStringFilteringOperand;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    public set filters(classRef: any) { }

    /**
     * Returns a reference to the body template.
     * ```typescript
     * let bodyTemplate = this.columnGroup.bodyTemplate;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get bodyTemplate(): TemplateRef<any> {
        return this._bodyTemplate;
    }
    /**
     * @hidden
     */
    set bodyTemplate(template: TemplateRef<any>) { }

    /**
     * Allows you to define a custom template for expand/collapse indicator
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    get collapsibleIndicatorTemplate(): TemplateRef<any> {
        return this._collapseIndicatorTemplate;
    }
    set collapsibleIndicatorTemplate(template: TemplateRef<any>) {
        this._collapseIndicatorTemplate = template;
    }

    /**
     * Returns a reference to the inline editor template.
     * ```typescript
     * let inlineEditorTemplate = this.columnGroup.inlineEditorTemplate;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get inlineEditorTemplate(): TemplateRef<any> {
        return this._inlineEditorTemplate;
    }
    /**
     * @hidden
     */
    set inlineEditorTemplate(template: TemplateRef<any>) { }
    /**
     * Gets the column group cells.
     * ```typescript
     * let columnCells = this.columnGroup.cells;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get cells(): IgxGridCellComponent[] {
        return [];
    }
    /**
     * Gets whether the column group is hidden.
     * ```typescript
     * let isHidden = this.columnGroup.hidden;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    get hidden() {
        return this.allChildren.every(c => c.hidden);
    }
    /**
     * Sets the column group hidden property.
     * ```html
     * <igx-column [hidden] = "true"></igx-column>
     * ```
     *
     * Two-way data binding
     * ```html
     * <igx-column [(hidden)] = "model.columns[0].isHidden"></igx-column>
     * ```
     * @memberof IgxColumnGroupComponent
     */
    set hidden(value: boolean) {
        this._hidden = value;
        this.hiddenChange.emit(this._hidden);
        if (this._hidden || !this.collapsible) {
            this.children.forEach(child => child.hidden = this._hidden);
        } else {
            this.children.forEach(c =>  {
                if (c.visibleWhenCollapsed === undefined) {c.hidden = false; return; }
                c.hidden = this.expanded ? c.visibleWhenCollapsed : !c.visibleWhenCollapsed;
            });
        }
    }

    /**
     *@hidden
     */
    @Output()
    public hiddenChange = new EventEmitter<boolean>();

    /**
     *@hidden
     */
    ngAfterContentInit() {
        /*
            @ContentChildren with descendants still returns the `parent`
            component in the query list.
        */
        if (this.headTemplate && this.headTemplate.length) {
            this._headerTemplate = this.headTemplate.toArray()[0].template;
        }
        if (this.collapseIndicatorTemplate) {
            this._collapseIndicatorTemplate = this.collapseIndicatorTemplate.template;
        }
        // currently only ivy fixes the issue, we have to slice only if the first child is group
        if (this.children.first === this) {
            this.children.reset(this.children.toArray().slice(1));
        }
        this.children.forEach(child => {
            child.parent = this;
        });
        if (this.collapsible) {
            this.setExpandCollapseState();
        }
    }

    /**
     * Returns the children columns collection.
     * ```typescript
     * let columns =  this.columnGroup.allChildren;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get allChildren(): IgxColumnComponent[] {
        return flatten(this.children.toArray());
    }
    /**
     * Returns a boolean indicating if the column is a `ColumnGroup`.
     * ```typescript
     * let isColumnGroup =  this.columnGroup.columnGroup
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get columnGroup() {
        return true;
    }
    /**
     * Returns a boolean indicating if the column is a `ColumnLayout` for multi-row layout.
     * ```typescript
     * let columnGroup =  this.column.columnGroup;
     * ```
     * @memberof IgxColumnComponent
     */
    get columnLayout() {
        return false;
    }
    /**
     * Gets the width of the column group.
     * ```typescript
     * let columnGroupWidth = this.columnGroup.width;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get width() {
        let isChildrenWidthInPercent = false, width;
        width = `${this.children.reduce((acc, val) => {
            if (val.hidden) {
                return acc;
            }
            if (typeof val.width === 'string' && val.width.indexOf('%') !== -1) {
                isChildrenWidthInPercent = true;
                return acc + parseInt(val.width, 10);
            }
            return acc + parseInt(val.calcWidth, 10);
        }, 0)}`;
        return isChildrenWidthInPercent ? width + '%' : width + 'px';
    }

    set width(val) { }

    // constructor(public gridAPI: GridBaseAPIService<IgxGridBaseDirective & IGridDataBindable>, public cdr: ChangeDetectorRef) {
    //     // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
    //     super(gridAPI, cdr);
    // }
}
