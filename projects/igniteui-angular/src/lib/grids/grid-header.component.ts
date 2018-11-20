import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnInit,
    ViewChild,
    QueryList,
    ViewChildren,
    OnDestroy
} from '@angular/core';
import { DataType } from '../data-operations/data-util';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { RestrictDrag } from '../directives/dragdrop/dragdrop.directive';
import { GridBaseAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { IgxColumnMovingService } from './grid.common';
import { isFirefox } from '../core/utils';
import { IgxGridBaseComponent } from './grid-base.component';
import { IgxFilteringService } from './filtering/grid-filtering.service';
import { IgxGridComponent } from './grid';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-header',
    templateUrl: './grid-header.component.html'
})
export class IgxGridHeaderComponent implements OnInit, DoCheck, AfterViewInit, OnDestroy {

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
            'igx-grid__th--sorted': this.sorted,
            'igx-grid__drag-col-header': this.dragged,
            'igx-grid__th--pinned-last': this.isLastPinned,
            'igx-grid__th--filtering': this.filteringService.filteredColumn === this.column
        };

        Object.entries(classList).forEach(([klass, value]) => {
            if (value) {
                defaultClasses.push(klass);
            }
        });
        return defaultClasses.join(' ');
    }


    @HostBinding('style.min-width')
    @HostBinding('style.max-width')
    @HostBinding('style.flex-basis')
    get width() {
        // HACK - think of a better solution
        const colWidth = this.column.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;

        if (isPercentageWidth) {
            const firstContentCell = this.column.cells[0];
            if (firstContentCell) {
                return firstContentCell.nativeElement.getBoundingClientRect().width + 'px';
            }
        } else {
            return this.column.width;
        }
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

    @HostBinding('style.z-index')
    get zIndex() {
        if (!this.column.pinned) {
            return null;
        }
        return 9999 - this.grid.pinnedColumns.indexOf(this.column);
    }

    @HostBinding('attr.role')
    public hostRole = 'columnheader';

    @HostBinding('attr.tabindex')
    public tabindex = -1;

    @HostBinding('attr.id')
    get headerID() {
        return `${this.gridID}_${this.column.field}`;
    }

    @ViewChild('resizeArea')
    public resizeArea: ElementRef;

    @ViewChildren(IgxGridHeaderComponent, { read: IgxGridHeaderComponent })
    public children: QueryList<IgxGridHeaderComponent>;

    public resizeCursor = null;
    public showResizer = false;
    public resizerHeight;
    public dragDirection: RestrictDrag = RestrictDrag.HORIZONTALLY;
    public resizeEndTimeout = isFirefox() ? 200 : 0;

    protected sortDirection = SortingDirection.None;

    private _startResizePos;
    private _pinnedMaxWidth;

    constructor(
        public gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        public zone: NgZone,
        private cms: IgxColumnMovingService,
        public filteringService: IgxFilteringService
    ) { }

    public ngOnInit() {
        this.column.columnGroup ? this.zone.runTask(() => this.cdr.markForCheck()) :
            this.cdr.markForCheck();
    }

    public ngDoCheck() {
        this.getSortDirection();
        this.cdr.markForCheck();
    }

    ngAfterViewInit() {
        if (!this.column.columnGroup) {
            this.zone.runOutsideAngular(() => {
                this.resizeArea.nativeElement.addEventListener('mouseover', this.onResizeAreaMouseOver.bind(this));
                this.resizeArea.nativeElement.addEventListener('mousedown', this.onResizeAreaMouseDown.bind(this));
                this.resizeArea.nativeElement.addEventListener('dblclick', this.onResizeAreaDblClick.bind(this));
            });
        }
    }

    ngOnDestroy() {
        if (!this.column.columnGroup) {
            this.zone.runOutsideAngular(() => {
                this.resizeArea.nativeElement.removeEventListener('mouseover', this.onResizeAreaMouseOver);
                this.resizeArea.nativeElement.removeEventListener('mousedown', this.onResizeAreaMouseDown);
                this.resizeArea.nativeElement.removeEventListener('dblclick', this.onResizeAreaDblClick);
            });
        }
    }

    @HostListener('click', ['$event'])
    public onClick(event) {
        if (!this.column.grid.isColumnResizing) {
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

    get restrictResizeMin(): number {
        const actualMinWidth = parseFloat(this.column.minWidth);
        const defaultMinWidth = parseFloat(this.column.defaultMinWidth);

        let minWidth = Number.isNaN(actualMinWidth) || actualMinWidth < defaultMinWidth ? defaultMinWidth : actualMinWidth;
        minWidth = minWidth < parseFloat(this.column.width) ? minWidth : parseFloat(this.column.width);

        return minWidth - this.elementRef.nativeElement.getBoundingClientRect().width;
    }

    get restrictResizeMax(): number {
        const actualWidth = this.elementRef.nativeElement.getBoundingClientRect().width;

        if (this.column.pinned) {
            const pinnedMaxWidth = this._pinnedMaxWidth =
                this.grid.calcPinnedContainerMaxWidth - this.grid.getPinnedWidth(true) + actualWidth;

            if (this.column.maxWidth && parseFloat(this.column.maxWidth) < pinnedMaxWidth) {
                this._pinnedMaxWidth = this.column.maxWidth;

                return parseFloat(this.column.maxWidth) - actualWidth;
            } else {
                return pinnedMaxWidth - actualWidth;
            }
        } else {
            if (this.column.maxWidth) {
                return parseFloat(this.column.maxWidth) - actualWidth;
            } else {
                return Number.MAX_SAFE_INTEGER;
            }
        }
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    get isPinned() {
        return this.column.pinned;
    }

    get isLastPinned() {
        const pinnedCols = this.grid.pinnedColumns;
        if (pinnedCols.length === 0) {
            return false;
        } else {
            return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
        }
    }

    protected getSortDirection() {
        const expr = this.gridAPI.get(this.gridID).sortingExpressions.find((x) => x.fieldName === this.column.field);
        this.sortDirection = expr ? expr.dir : SortingDirection.None;
    }

    private onResizeAreaMouseOver() {
        if (this.column.resizable) {
            this.resizeCursor = 'col-resize';
            this.cdr.detectChanges();
        }
    }

    private onResizeAreaMouseDown(event) {
        if (event.button === 0 && this.column.resizable) {
            this.showResizer = true;
            this.column.grid.isColumnResizing = true;
            this.resizerHeight = this.grid.calcResizerHeight;
            this._startResizePos = event.clientX;
        } else {
            this.resizeCursor = null;
        }
        this.cdr.detectChanges();
    }

    private onResizeAreaDblClick() {
        if (this.column.resizable) {
            const currentColWidth = this.elementRef.nativeElement.getBoundingClientRect().width;

            const size = this.column.getLargestCellWidth();

            if (this.column.pinned) {
                const newPinnedWidth = this.grid.getPinnedWidth(true) - currentColWidth + parseFloat(size);

                if (newPinnedWidth <= this.grid.calcPinnedContainerMaxWidth) {
                    this.column.width = size;
                }
            } else if (this.column.maxWidth && (parseFloat(size) > parseFloat(this.column.maxWidth))) {
                this.column.width = parseFloat(this.column.maxWidth) + 'px';
            } else if (parseFloat(size) < parseFloat(this.column.defaultMinWidth)) {
                this.column.width = this.column.defaultMinWidth + 'px';
            } else {
                this.column.width = size;
            }

            this.grid.markForCheck();
            this.grid.reflow();
            this.grid.onColumnResized.emit({ column: this.column, prevWidth: currentColWidth.toString(), newWidth: this.column.width });
        }
    }

    public onResize(event) {
        this.column.grid.isColumnResizing = false;

        this.showResizer = false;
        const diff = event.clientX - this._startResizePos;

        if (this.column.resizable) {
            let currentColWidth = parseFloat(this.column.width);

            const actualMinWidth = parseFloat(this.column.minWidth);
            const defaultMinWidth = parseFloat(this.column.defaultMinWidth);

            let colMinWidth = Number.isNaN(actualMinWidth) || actualMinWidth < defaultMinWidth ? defaultMinWidth : actualMinWidth;
            const colMaxWidth = this.column.pinned ? parseFloat(this._pinnedMaxWidth) : parseFloat(this.column.maxWidth);

            const actualWidth = this.elementRef.nativeElement.getBoundingClientRect().width;

            currentColWidth = Number.isNaN(currentColWidth) || (currentColWidth < actualWidth) ? actualWidth : currentColWidth;
            colMinWidth = colMinWidth < currentColWidth ? colMinWidth : currentColWidth;

            if (currentColWidth + diff < colMinWidth) {
                this.column.width = colMinWidth + 'px';
            } else if (colMaxWidth && (currentColWidth + diff > colMaxWidth)) {
                this.column.width = colMaxWidth + 'px';
            } else {
                this.column.width = (currentColWidth + diff) + 'px';
            }

            this.grid.markForCheck();
            this.grid.reflow();

            if (currentColWidth !== parseFloat(this.column.width)) {
                this.grid.onColumnResized.emit({ column: this.column, prevWidth: currentColWidth.toString(), newWidth: this.column.width });
            }
        }
    }
}
