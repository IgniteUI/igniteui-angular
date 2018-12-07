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
    OnInit
} from '@angular/core';
import { DataType } from '../data-operations/data-util';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { GridBaseAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { IgxGridBaseComponent } from './grid-base.component';
import { IgxFilteringService } from './filtering/grid-filtering.service';
import { IgxColumnResizingService } from './grid-column-resizing.service';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-header',
    templateUrl: './grid-header.component.html'
})
export class IgxGridHeaderComponent implements DoCheck {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = [
            'igx-grid__th--fw',
            this.column.headerClasses
        ];

        const classList = {
            'igx-grid__th': !this.column.columnGroup,
            'asc': this.ascending,
            'desc': this.descending,
            'igx-grid__th--number': this.column.dataType === DataType.Number,
            'igx-grid__th--sorted': this.sorted
        };

        Object.entries(classList).forEach(([klass, value]) => {
            if (value) {
                defaultClasses.push(klass);
            }
        });
        return defaultClasses.join(' ');
    }

    @HostBinding('style.height.px')
    get height() {
        if (this.grid.hasColumnGroups) {
            return (this.grid.maxLevelHeaderDepth + 1 - this.column.level) * this.grid.defaultRowHeight;
        }
        return null;
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
        return 'none';
    }

    get sorted() {
        return this.sortDirection !== SortingDirection.None;
    }

    get dragged() {
        return this.column === this.column.grid.draggedColumn;
    }

    @HostBinding('attr.role')
    public hostRole = 'columnheader';

    @HostBinding('attr.tabindex')
    public tabindex = -1;

    @HostBinding('attr.id')
    get headerID() {
        return `${this.gridID}_${this.column.field}`;
    }

    protected sortDirection = SortingDirection.None;

    constructor(
        public gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
        public colResizingService: IgxColumnResizingService,
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        public zone: NgZone,
        public filteringService: IgxFilteringService
    ) { }


    public ngDoCheck() {
        this.getSortDirection();
        this.cdr.markForCheck();
    }

    @HostListener('click', ['$event'])
    public onClick(event) {
        if (!this.colResizingService.isColumnResizing) {
            event.stopPropagation();
            if (this.grid.filteringService.isFilterRowVisible) {
                if (this.column.filterable && !this.column.columnGroup &&
                    !this.grid.filteringService.isFilterComplex(this.column.field)) {
                    this.grid.filteringService.filteredColumn = this.column;
                }
            } else if (this.column.sortable) {
                const groupingExpr = this.grid.groupingExpressions ?
                    this.grid.groupingExpressions.find((expr) => expr.fieldName === this.column.field) : null;
                const sortDir = groupingExpr ?
                    this.sortDirection + 1 > SortingDirection.Desc ? SortingDirection.Asc : SortingDirection.Desc
                    : this.sortDirection + 1 > SortingDirection.Desc ? SortingDirection.None : this.sortDirection + 1;
                this.sortDirection = sortDir;
                this.grid.sort({ fieldName: this.column.field, dir: this.sortDirection, ignoreCase: this.column.sortingIgnoreCase,
                    strategy: this.column.sortStrategy });
                this.grid.onSortingDone.emit({
                    dir: this.sortDirection,
                    fieldName: this.column.field,
                    ignoreCase: this.column.sortingIgnoreCase,
                    strategy: this.column.sortStrategy
                });
            }
        }
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    protected getSortDirection() {
        const expr = this.gridAPI.get(this.gridID).sortingExpressions.find((x) => x.fieldName === this.column.field);
        this.sortDirection = expr ? expr.dir : SortingDirection.None;
    }
}
