import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { GridColumnDataType } from '../../data-operations/data-util';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { Subject } from 'rxjs';
import { ColumnType, GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { GridSelectionMode } from '../common/enums';
import { SortingDirection } from '../../data-operations/sorting-strategy';
import { SortingIndexPipe } from './pipes';
import { NgTemplateOutlet, NgIf, NgClass } from '@angular/common';
import { IgxIconComponent } from '../../icon/icon.component';
import { ExpressionsTreeUtil } from '../../data-operations/expressions-tree-util';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-header',
    templateUrl: 'grid-header.component.html',
    imports: [IgxIconComponent, NgTemplateOutlet, NgIf, NgClass, SortingIndexPipe]
})
export class IgxGridHeaderComponent implements DoCheck, OnDestroy {

    @Input()
    public column: ColumnType;

    /**
     * @hidden
     */
    @ViewChild('defaultESFHeaderIconTemplate', { read: TemplateRef, static: true })
    protected defaultESFHeaderIconTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultSortHeaderIconTemplate', { read: TemplateRef, static: true })
    protected defaultSortHeaderIconTemplate;

    /**
     * @hidden
     */
    @ViewChild('sortIconContainer', { read: ElementRef })
    protected sortIconContainer: ElementRef;

    /**
     * Returns the `aria-selected` of the header.
     */
    @HostBinding('attr.aria-selected')
    public get ariaSelected(): boolean {
        return this.column.selected;
    }

    @HostBinding('class.igx-grid-th')
    public get columnGroupStyle() {
        return !this.column.columnGroup;
    }

    @HostBinding('class.asc')
    public get sortAscendingStyle() {
        return this.sortDirection === SortingDirection.Asc;
    }

    @HostBinding('class.desc')
    public get sortDescendingStyle() {
        return this.sortDirection === SortingDirection.Desc;
    }

    @HostBinding('class.igx-grid-th--number')
    public get numberStyle() {
        return this.column.dataType === GridColumnDataType.Number;
    }

    @HostBinding('class.igx-grid-th--sortable')
    public get sortableStyle() {
        return this.column.sortable;
    }

    @HostBinding('class.igx-grid-th--selectable')
    public get selectableStyle() {
        return this.selectable;
    }

    @HostBinding('class.igx-grid-th--filtrable')
    public get filterableStyle() {
        return this.column.filterable && this.grid.filteringService.isFilterRowVisible;
    }

    @HostBinding('class.igx-grid-th--sorted')
    public get sortedStyle() {
        return this.sorted;
    }

    @HostBinding('class.igx-grid-th--selected')
    public get selectedStyle() {
        return this.selected;
    }

    /**
     * @hidden
     */
    public get esfIconTemplate() {
        return this.grid.excelStyleHeaderIconTemplate || this.defaultESFHeaderIconTemplate;
    }

    /**
     * @hidden
     */
    public get sortIconTemplate() {
        if (this.sortDirection === SortingDirection.None && this.grid.sortHeaderIconTemplate) {
            return this.grid.sortHeaderIconTemplate;
        } else if (this.sortDirection === SortingDirection.Asc && this.grid.sortAscendingHeaderIconTemplate) {
            return this.grid.sortAscendingHeaderIconTemplate;
        } else if (this.sortDirection === SortingDirection.Desc && this.grid.sortDescendingHeaderIconTemplate) {
            return this.grid.sortDescendingHeaderIconTemplate;
        } else {
            return this.defaultSortHeaderIconTemplate;
        }
    }
    /**
     * @hidden
     */
    public get disabled() {
        const groupArea = this.grid.groupArea || this.grid.treeGroupArea;
        if (groupArea?.expressions && groupArea.expressions.length && groupArea.expressions.map(g => g.fieldName).includes(this.column.field)) {
            return true;
        }
        return false;
    }

    public get sorted() {
        return this.sortDirection !== SortingDirection.None;
    }

    public get filterIconClassName() {
        return this.column.filteringExpressionsTree || this.isAdvancedFilterApplied() ? 'igx-excel-filter__icon--filtered' : 'igx-excel-filter__icon';
    }

    public get selectable() {
        return this.grid.columnSelection !== GridSelectionMode.none &&
            this.column.applySelectableClass &&
            !this.column.selected &&
            !this.grid.filteringService.isFilterRowVisible;
    }

    public get selected() {
        return this.column.selected
            && (!this.grid.filteringService.isFilterRowVisible || this.grid.filteringService.filteredColumn !== this.column);
    }

    public get title() {
        return this.column.title || this.column.header || this.column.field;
    }

    public get nativeElement() {
        return this.ref.nativeElement;
    }

    public sortDirection = SortingDirection.None;
    protected _destroy$ = new Subject<boolean>();

    constructor(
        @Inject(IGX_GRID_BASE) public grid: GridType,
        public colResizingService: IgxColumnResizingService,
        public cdr: ChangeDetectorRef,
        private ref: ElementRef<HTMLElement>
    ) { }

    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        if (!this.colResizingService.isColumnResizing) {

            if (this.grid.filteringService.isFilterRowVisible) {
                if (this.column.filterCellTemplate) {
                    this.grid.filteringRow.close();
                    return;
                }

                if (this.column.filterable && !this.column.columnGroup &&
                    !this.grid.filteringService.isFilterComplex(this.column.field)) {
                    this.grid.filteringService.filteredColumn = this.column;
                }
            } else if (this.grid.columnSelection !== GridSelectionMode.none && this.column.selectable) {
                const clearSelection = this.grid.columnSelection === GridSelectionMode.single || !event.ctrlKey;
                const rangeSelection = this.grid.columnSelection === GridSelectionMode.multiple && event.shiftKey;

                if (!this.column.selected || (this.grid.selectionService.getSelectedColumns().length > 1 && clearSelection)) {
                    this.grid.selectionService.selectColumn(this.column.field, clearSelection, rangeSelection, event);
                } else {
                    this.grid.selectionService.deselectColumn(this.column.field, event);
                }
            }
        }
        this.grid.theadRow.nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener('pointerenter')
    public onPinterEnter() {
        this.column.applySelectableClass = true;
    }

    /**
     * @hidden
     */
    @HostListener('pointerleave')
    public onPointerLeave() {
        this.column.applySelectableClass = false;
    }

    /**
     * @hidden @internal
     */
    public ngDoCheck() {
        this.getSortDirection();
        this.cdr.markForCheck();
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
    }

    /**
     * @hidden @internal
     */
    public onPointerDownIndicator(event) {
        // Stop propagation of pointer events to now allow column dragging using the header indicators.
        event.stopPropagation();
    }

    /**
     * @hidden @internal
     */
    public onFilteringIconClick(event) {
        event.stopPropagation();
        this.grid.filteringService.toggleFilterDropdown(this.nativeElement, this.column);
    }

    /**
     * @hidden @internal
     */
    public onSortingIconClick(event) {
        event.stopPropagation();
        this.triggerSort();
    }

    protected getSortDirection() {
        const expr = this.grid.sortingExpressions.find((x) => x.fieldName === this.column.field);
        this.sortDirection = expr ? expr.dir : SortingDirection.None;
    }

    protected isAdvancedFilterApplied() {
        if(!this.grid.advancedFilteringExpressionsTree) {
            return false;
        }
        return !!ExpressionsTreeUtil.find(this.grid.advancedFilteringExpressionsTree, this.column.field);
    }

    private triggerSort() {
        const groupingExpr = this.grid.groupingExpressions ?
            this.grid.groupingExpressions.find((expr) => expr.fieldName === this.column.field) :
            this.grid.groupArea?.expressions ? this.grid.groupArea?.expressions.find((expr) => expr.fieldName === this.column.field) : null;
        const sortDir = groupingExpr ?
            this.sortDirection + 1 > SortingDirection.Desc ? SortingDirection.Asc : SortingDirection.Desc
            : this.sortDirection + 1 > SortingDirection.Desc ? SortingDirection.None : this.sortDirection + 1;
        this.sortDirection = sortDir;
        this.grid.sort({
            fieldName: this.column.field, dir: this.sortDirection, ignoreCase: this.column.sortingIgnoreCase,
            strategy: this.column.sortStrategy
        });
    }
}
