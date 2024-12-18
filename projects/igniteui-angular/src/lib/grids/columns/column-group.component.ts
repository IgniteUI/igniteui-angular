import {
    AfterContentInit,
    Component,
    ContentChildren,
    ChangeDetectionStrategy,
    Input,
    forwardRef,
    QueryList,
    TemplateRef,
    booleanAttribute
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { IgxColumnComponent } from './column.component';
import { flatten } from '../../core/utils';
import { CellType, ColumnType, IgxColumnTemplateContext } from '../common/grid.interface';

/* blazorElement */
/* omitModule */
/* wcElementTag: igc-column-group */
/* additionalIdentifier: Children.Field */
/* jsonAPIManageCollectionInMarkup */
/* blazorIndirectRender */
/**
 * **Ignite UI for Angular Column Group**
 *
 * @igxParent IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxColumnGroupComponent, IgxRowIslandComponent
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: IgxColumnComponent, useExisting: forwardRef(() => IgxColumnGroupComponent) }],
    selector: 'igx-column-group',
    template: `@if (platform.isElements) {
        <div #sink style="display: none;">
            <ng-content select="igx-column,igc-column,igx-column-group,igc-column-group"></ng-content>
        </div>
    }`,
    standalone: true
})
export class IgxColumnGroupComponent extends IgxColumnComponent implements AfterContentInit {

    /* blazorInclude */
    /* contentChildren */
    /* blazorTreatAsCollection */
    /* blazorCollectionName: ColumnCollection */
    /* blazorCollectionItemName: Column */
    /* alternateType: HTMLCollection */
    /**
     * @deprecated in version 18.1.0. Use the `childColumns` property instead.
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent,  })
    public override children = new QueryList<IgxColumnComponent>();

    /**
     * Set if the column group is collapsible.
     * Default value is `false`
     * ```html
     *  <igx-column-group [collapsible] = "true"></igx-column-group>
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    @Input({ transform: booleanAttribute })
    public override set collapsible(value: boolean) {
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
    public override get collapsible() {
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
     *
     * @memberof IgxColumnGroupComponent
     */
    @Input({ transform: booleanAttribute })
    public override set expanded(value: boolean) {
        this._expanded = value;
        this.expandedChange.emit(this._expanded);
        if (!this.collapsible) {
            return;
        }
        if (!this.hidden && this.children) {
            this.setExpandCollapseState();
        }
    }
    public override get expanded() {
        return this._expanded;
    }

    /**
     * Gets the column group `summaries`.
     * ```typescript
     * let columnGroupSummaries = this.columnGroup.summaries;
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public override get summaries(): any {
        return this._summaries;
    }

     /* blazorSuppress */
    /**
     * Sets the column group `summaries`.
     * ```typescript
     * this.columnGroup.summaries = IgxNumberSummaryOperand;
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    public override set summaries(classRef: any) { }

     /* blazorSuppress */
    /**
     * Sets/gets whether the column group is `searchable`.
     * Default value is `true`.
     * ```typescript
     * let isSearchable =  this.columnGroup.searchable;
     * ```
     * ```html
     *  <igx-column-group [searchable] = "false"></igx-column-group>
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    @Input({ transform: booleanAttribute })
    public override searchable = true;
    /**
     * Gets the column group `filters`.
     * ```typescript
     * let columnGroupFilters = this.columnGroup.filters;
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public override get filters(): any {
        return this._filters;
    }

     /* blazorSuppress */
    /**
     * Sets the column group `filters`.
     * ```typescript
     * this.columnGroup.filters = IgxStringFilteringOperand;
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    public override set filters(classRef: any) { }

    /**
     * Returns if the column group is selectable
     * ```typescript
     * let columnGroupSelectable = this.columnGroup.selectable;
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    public override get selectable(): boolean {
        return this.children && this.children.some(child => child.selectable);
    }

    /**
     * @hidden
     */
    public override set selectable(value: boolean) { }

    /**
     * @hidden
     */
    public override get bodyTemplate(): TemplateRef<any> {
        return this._bodyTemplate;
    }
    /**
     * @hidden
     */
    public override set bodyTemplate(template: TemplateRef<any>) { }

    /**
     * Allows you to define a custom template for expand/collapse indicator
     *
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public override collapsibleIndicatorTemplate: TemplateRef<IgxColumnTemplateContext>;

    /**
     * @hidden
     */
    public override get inlineEditorTemplate(): TemplateRef<any> {
        return this._inlineEditorTemplate;
    }
    /**
     * @hidden
     */
    public override set inlineEditorTemplate(template: TemplateRef<any>) { }
    /**
     * @hidden @internal
     */
    public override get cells(): CellType[] {
        return [];
    }
    /**
     * Gets whether the column group is hidden.
     * ```typescript
     * let isHidden = this.columnGroup.hidden;
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    @Input({ transform: booleanAttribute })
    public override get hidden() {
        return this.allChildren.every(c => c.hidden);
    }

    /* blazorSuppress */
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
     *
     * @memberof IgxColumnGroupComponent
     */
    public override set hidden(value: boolean) {
        this._hidden = value;
        this.hiddenChange.emit(this._hidden);
        if (this._hidden || !this.collapsible) {
            this.children.forEach(child => child.hidden = this._hidden);
        } else {
            this.children.forEach(c => {
                if (c.visibleWhenCollapsed === undefined) {
                    c.hidden = false; return;
                }
                c.hidden = this.expanded ? c.visibleWhenCollapsed : !c.visibleWhenCollapsed;
            });
        }
    }

    /**
     * Returns if the column group is selected.
     * ```typescript
     * let isSelected = this.columnGroup.selected;
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    public override get selected(): boolean {
        const selectableChildren = this.allChildren.filter(c => !c.columnGroup && c.selectable && !c.hidden);
        return selectableChildren.length > 0 && selectableChildren.every(c => c.selected);
    }

     /* blazorSuppress */
    /**
     * Select/deselect the column group.
     * ```typescript
     * this.columnGroup.selected = true;
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    public override set selected(value: boolean) {
        if (this.selectable) {
            this.children.forEach(c => {
                c.selected = value;
            });
        }
    }

    /**
     * @hidden
     */
    public override ngAfterContentInit() {
        /*
            @ContentChildren with descendants still returns the `parent`
            component in the query list.
        */
        if (this.headTemplate && this.headTemplate.length) {
            this._headerTemplate = this.headTemplate.toArray()[0].template;
        }
        if (this.collapseIndicatorTemplate) {
            this.collapsibleIndicatorTemplate = this.collapseIndicatorTemplate.template;
        }
        // currently only ivy fixes the issue, we have to slice only if the first child is group
        if (this.children.first === this) {
            this.children.reset(this.children.toArray().slice(1));
        }
        this.children.forEach(child => {
            child.parent = this;
            if (this.pinned) {
                child.pinned = this.pinned;
            }
            if (this._hidden) {
                child.hidden = this._hidden;
            }
        });
        if (this.collapsible) {
            this.setExpandCollapseState();
        }

        this.children.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe((change: QueryList<IgxColumnComponent>) => {
                let shouldReinitPinning = false;
                change.forEach(x => {
                    x.parent = this;
                    if (this.pinned && x.pinned !== this.pinned) {
                        shouldReinitPinning = true;
                        x.pinned = this.pinned;
                    }
                });
                if (this.collapsible) {
                    this.setExpandCollapseState();
                }
                if (shouldReinitPinning) {
                    (this.grid as any).initPinning();
                }
            });

    }

    /**
     * A list containing all the child columns under this column (if any).
     * Empty without children or if this column is not Group or Layout.
     */
    public override get childColumns(): ColumnType[] {
        return this.children.toArray();
    }

    /** @hidden @internal **/
    public override get allChildren(): IgxColumnComponent[] {
        return flatten(this.children.toArray());
    }
    /**
     * Returns a boolean indicating if the column is a `ColumnGroup`.
     * ```typescript
     * let isColumnGroup =  this.columnGroup.columnGroup
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    public override get columnGroup() {
        return true;
    }
    /**
     * Returns a boolean indicating if the column is a `ColumnLayout` for multi-row layout.
     * ```typescript
     * let columnGroup =  this.column.columnGroup;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public override get columnLayout() {
        return false;
    }
    /**
     * Gets the width of the column group.
     * ```typescript
     * let columnGroupWidth = this.columnGroup.width;
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    public override get width() {
        const width = `${this.children.reduce((acc, val) => {
            if (val.hidden) {
                return acc;
            }
            return acc + parseFloat(val.calcWidth);
        }, 0)}`;
        return width + 'px';
    }

     /* blazorSuppress */
    public override set width(val) { }

    /** @hidden @internal **/
    public override get resolvedWidth() {
        return this.width;
    }

    /**
     * @hidden
     */
    public override get applySelectableClass(): boolean {
        return this._applySelectableClass;
    }

    /**
     * @hidden
     */
    public override set applySelectableClass(value: boolean) {
        if (this.selectable) {
            this._applySelectableClass = value;
            this.children.forEach(c => {
                c.applySelectableClass = value;
            });
        }
    }

    /**
     * @hidden
     * Calculates the number of visible columns, based on indexes of first and last visible columns.
     */
    public override calcChildren(): number {
        const visibleChildren = this.allChildren.filter(c => c.visibleIndex > -1);
        const fi = visibleChildren[0].visibleIndex;
        const li = visibleChildren[visibleChildren.length - 1].visibleIndex;
        return li - fi + 1;
    }
}
