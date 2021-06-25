import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    NgZone,
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
import { IgxGridExcelStyleFilteringComponent } from '../filtering/excel-style/grid.excel-style-filtering.component';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-header',
    templateUrl: './grid-header.component.html'
})
export class IgxGridHeaderComponent implements DoCheck, OnDestroy {
    @HostBinding('attr.role')
    public hostRole = 'columnheader';

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

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

    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = [
            'igx-grid__th--fw',
            this.column.headerClasses
        ];

        const classList = {
            'igx-grid__th': !this.column.columnGroup,
            asc: this.ascending,
            desc: this.descending,
            'igx-grid__th--number': this.column.dataType === GridColumnDataType.Number,
            'igx-grid__th--sortable': this.column.sortable,
            'igx-grid__th--selectable': this.selectable,
            'igx-grid__th--filtrable': this.column.filterable && this.grid.filteringService.isFilterRowVisible,
            'igx-grid__th--sorted': this.sorted,
            'igx-grid__th--selected': this.selected
        };

        for (const klass of Object.keys(classList)) {
            if (classList[klass]) {
                defaultClasses.push(klass);
            }
        }
        return defaultClasses.join(' ');
    }

    @HostBinding('style.height.rem')
    get height() {
        if (this.grid.hasColumnGroups) {
            return (this.grid.maxLevelHeaderDepth + 1 - this.column.level) * this.grid.defaultRowHeight / this.grid._baseFontSize;
        }
        return null;
    }

    /**
     * @hidden
     */
    public get esfIconTemplate() {
        return this.grid.excelStyleHeaderIconTemplate || this.defaultESFHeaderIconTemplate;
    }

    get ascending() {
        return this.sortDirection === SortingDirection.Asc;
    }

    get descending() {
        return this.sortDirection === SortingDirection.Desc;
    }

    get sortingIcon(): string {
        if (this.sortDirection !== SortingDirection.None) {
            // arrow_downward and arrow_upward
            // are material icons ligature strings
            return this.sortDirection === SortingDirection.Asc ? 'arrow_upward' : 'arrow_downward';
        }
        return 'arrow_upward';
    }

    get sorted() {
        return this.sortDirection !== SortingDirection.None;
    }

    get filterIconClassName() {
        return this.column.filteringExpressionsTree ? 'igx-excel-filter__icon--filtered' : 'igx-excel-filter__icon';
    }

    get selectable() {
        return this.grid.columnSelection !== GridSelectionMode.none &&
            this.column.applySelectableClass &&
            !this.column.selected &&
            !this.grid.filteringService.isFilterRowVisible;
    }

    get selected() {
        return this.column.selected
            && (!this.grid.filteringService.isFilterRowVisible || this.grid.filteringService.filteredColumn !== this.column);
    }

    get columnTitle() {
        return this.column.title || this.column.header || this.column.field;
    }

    protected sortDirection = SortingDirection.None;

    private _destroy$ = new Subject<boolean>();

    constructor(
        public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        public colResizingService: IgxColumnResizingService,
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        public zone: NgZone
    ) { }

    @HostListener('click', ['$event'])
    public onClick(event) {
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

    ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
        this.grid.filteringService.hideExcelFiltering();
    }


    public onFilteringIconClick(event) {
        event.stopPropagation();
        this.grid.filteringService.toggleFilterDropdown(this.elementRef.nativeElement, this.column);
    }

    get grid(): any {
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
        this.cdr.markForCheck();
    }
}
