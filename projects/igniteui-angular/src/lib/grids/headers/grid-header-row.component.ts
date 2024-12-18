import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    Input,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    booleanAttribute
} from '@angular/core';
import { flatten } from '../../core/utils';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { ColumnType, GridType, IgxHeadSelectorTemplateContext } from '../common/grid.interface';
import { IgxGridFilteringCellComponent } from '../filtering/base/grid-filtering-cell.component';
import { IgxGridFilteringRowComponent } from '../filtering/base/grid-filtering-row.component';
import { IgxGridHeaderGroupComponent } from './grid-header-group.component';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxHeaderGroupWidthPipe, IgxHeaderGroupStylePipe } from './pipes';
import { IgxGridTopLevelColumns } from '../common/pipes';
import { IgxCheckboxComponent } from '../../checkbox/checkbox.component';
import { IgxColumnMovingDropDirective } from '../moving/moving.drop.directive';
import { NgIf, NgTemplateOutlet, NgClass, NgFor, NgStyle } from '@angular/common';

/**
 *
 * For all intents & purposes treat this component as what a <thead> usually is in the default <table> element.
 *
 * This container holds the grid header elements and their behavior/interactions.
 *
 * @hidden @internal
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-header-row',
    templateUrl: './grid-header-row.component.html',
    imports: [NgIf, IgxColumnMovingDropDirective, NgTemplateOutlet, NgClass, NgFor, IgxGridHeaderGroupComponent, NgStyle, IgxGridForOfDirective, IgxGridFilteringRowComponent, IgxCheckboxComponent, IgxGridTopLevelColumns, IgxHeaderGroupWidthPipe, IgxHeaderGroupStylePipe]
})
export class IgxGridHeaderRowComponent implements DoCheck {

    /** The grid component containing this element. */
    @Input()
    public grid: GridType;

    /** Pinned columns of the grid. */
    @Input()
    public pinnedColumnCollection: ColumnType[] = [];

    /** Unpinned columns of the grid. */
    @Input()
    public unpinnedColumnCollection: ColumnType[] = [];

    @Input()
    public activeDescendant: string;

    @Input({ transform: booleanAttribute })
    public hasMRL: boolean;

    @Input()
    public width: number;

    /**
     * Header groups inside the header row.
     *
     * @remarks
     * Note: These are only the top level header groups in case there are multi-column headers
     * or a specific column layout. If you want to get the flattened collection use the `groups`
     * property below.
     *
     * @hidden @internal
     * */
    @ViewChildren(IgxGridHeaderGroupComponent)
    public _groups: QueryList<IgxGridHeaderGroupComponent>;

    /**
     * The flattened header groups collection.
     *
     * @hidden @internal
     */
    public get groups(): IgxGridHeaderGroupComponent[] {
        return flatten(this._groups?.toArray() ?? []);
    }

    /** Header components in the header row. */
    public get headers(): IgxGridHeaderComponent[] {
        return this.groups.map(group => group.header);
    }

    /** Filtering cell components in the header row. */
    public get filters(): IgxGridFilteringCellComponent[] {
        return this.groups.map(group => group.filter);
    }

    /** The virtualized part of the header row containing the unpinned header groups. */
    @ViewChild('headerVirtualContainer', { read: IgxGridForOfDirective, static: true })
    public headerContainer: IgxGridForOfDirective<ColumnType, ColumnType[]>;

    public get headerForOf() {
        return this.headerContainer;
    }

    @ViewChild('headerDragContainer')
    public headerDragContainer: ElementRef<HTMLElement>;

    @ViewChild('headerSelectorContainer')
    public headerSelectorContainer: ElementRef<HTMLElement>;

    @ViewChild('headerGroupContainer')
    public headerGroupContainer: ElementRef<HTMLElement>;

    @ViewChild('headSelectorBaseTemplate')
    public headSelectorBaseTemplate: TemplateRef<IgxHeadSelectorTemplateContext>;

    @ViewChild(IgxGridFilteringRowComponent)
    public filterRow: IgxGridFilteringRowComponent;

    /**
     * Expand/collapse all child grids area in a hierarchical grid.
     * `undefined` in the base and tree grids.
     *
     * @internal @hidden
     */
    @ViewChild('headerHierarchyExpander')
    public headerHierarchyExpander: ElementRef<HTMLElement>;

    public get navigation() {
        return this.grid.navigation;
    }

    public get nativeElement() {
        return this.ref.nativeElement;
    }

    /**
     * Returns whether the current grid instance is a hierarchical grid.
     * as only hierarchical grids have the `isHierarchicalRecord` method.
     *
     * @hidden @internal
     */
    public get isHierarchicalGrid() {
        return !!this.grid.isHierarchicalRecord;
    }

    public get indentationCSSClasses() {
        return `igx-grid__header-indentation igx-grid__row-indentation--level-${this.grid.groupingExpressions.length}`;
    }

    public get rowSelectorsContext(): IgxHeadSelectorTemplateContext {
        const ctx = {
            $implicit: {
                selectedCount: this.grid.selectionService.filteredSelectedRowIds.length as number,
                totalCount: this.grid.totalRowsCountAfterFilter as number
            }
        } as IgxHeadSelectorTemplateContext;

        if (this.isHierarchicalGrid) {
            ctx.$implicit.selectAll = () => this.grid.selectAllRows();
            ctx.$implicit.deselectAll = () => this.grid.deselectAllRows();
        }

        return ctx;
    }

    constructor(
        protected ref: ElementRef<HTMLElement>,
        protected cdr: ChangeDetectorRef
    ) { }

    /**
     * This hook exists as a workaround for the unfortunate fact
     * that when we have pinned columns in the grid, the unpinned columns headers
     * are affected by a delayed change detection cycle after a horizontal scroll :(
     * Thus, we tell the parent grid change detector to check us at each cycle.
     *
     * @hidden @internal
     */
    public ngDoCheck() {
        this.cdr.markForCheck();
    }

    /**
     * @hidden @internal
     */
    public scroll(event: Event) {
        this.grid.preventHeaderScroll(event);
    }

    public headerRowSelection(event: MouseEvent) {
        if (!this.grid.isMultiRowSelectionEnabled) {
            return;
        }

        if (this.grid.selectionService.areAllRowSelected()) {
            this.grid.selectionService.clearRowSelection(event);
        } else {
            this.grid.selectionService.selectAllRows(event);
        }
    }
}
