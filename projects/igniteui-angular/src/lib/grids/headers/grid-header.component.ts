import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { GridColumnDataType } from '../../data-operations/data-util';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { GridBaseAPIService } from '../api.service';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { Subject } from 'rxjs';
import { GridType } from '../common/grid.interface';
import { GridSelectionMode } from '../common/enums';
import { DisplayDensity } from '../../core/displayDensity';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-header',
    templateUrl: 'grid-header.component.html'
})
export class IgxGridHeaderComponent implements DoCheck, OnDestroy {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public density: DisplayDensity;

    /**
     * @hidden
     */
    @ViewChild('defaultESFHeaderIconTemplate', { read: TemplateRef, static: true })
    protected defaultESFHeaderIconTemplate: TemplateRef<any>;

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

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-th--cosy')
    public get cosyStyle() {
        return this.density === 'cosy';
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-th--compact')
    public get compactStyle() {
        return this.density === 'compact';
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

    @HostBinding('style.height.rem')
    public get height() {
        if (!this.grid.hasColumnGroups) {
            return null;
        }

        return (this.grid.maxLevelHeaderDepth + 1 - this.column.level) * this.grid.defaultRowHeight / this.grid._baseFontSize;
    }

    /**
     * @hidden
     */
    public get esfIconTemplate() {
        return this.grid.excelStyleHeaderIconTemplate || this.defaultESFHeaderIconTemplate;
    }

    public get sorted() {
        return this.sortDirection !== SortingDirection.None;
    }

    public get filterIconClassName() {
        return this.column.filteringExpressionsTree ? 'igx-excel-filter__icon--filtered' : 'igx-excel-filter__icon';
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
    private _destroy$ = new Subject<boolean>();

    constructor(
        public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
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

    public ngDoCheck() {
        this.getSortDirection();
        this.cdr.markForCheck();
    }

    public ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
        this.grid.filteringService.hideExcelFiltering();
    }


    public onFilteringIconClick(event) {
        event.stopPropagation();
        this.grid.filteringService.toggleFilterDropdown(this.nativeElement, this.column);
    }

    public get grid(): any {
        return this.gridAPI.grid;
    }

    public onSortingIconClick(event) {
        event.stopPropagation();
        this.triggerSort();
    }

    protected getSortDirection() {
        const expr = this.gridAPI.grid.sortingExpressions.find((x) => x.fieldName === this.column.field);
        this.sortDirection = expr ? expr.dir : SortingDirection.None;
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
