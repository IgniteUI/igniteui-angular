import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnInit,
    ViewChild
} from '@angular/core';
import { DataType } from '../data-operations/data-util';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { RestrictDrag } from '../directives/dragdrop/dragdrop.directive';
import { IgxGridAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IgxColumnMovingService } from './grid.common';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-header',
    templateUrl: './grid-header.component.html'
})
export class IgxGridHeaderComponent implements OnInit, DoCheck, AfterViewInit {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    @HostBinding('class')
    get styleClasses() {
        return `igx-grid__th ${this.column.headerClasses}`;
    }

    @HostBinding('style.min-width')
    @HostBinding('style.flex-basis')
    @HostBinding('class.igx-grid__th--fw')
    get width() {
        return this.column.width;
    }

    @HostBinding('class.asc')
    get ascending() {
        return this.sortDirection === SortingDirection.Asc;
    }

    @HostBinding('class.desc')
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

    @HostBinding('class.igx-grid__th--number')
    get columnType() {
        return this.column.dataType === DataType.Number;
    }

    @HostBinding('class.igx-grid__th--sorted')
    get sorted() {
        return this.sortDirection !== SortingDirection.None;
    }

    @HostBinding('class.igx-grid__drag-col-header')
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
    public tabindex = 0;

    @HostBinding('attr.id')
    get headerID() {
        return `${this.gridID}_${this.column.field}`;
    }

    @ViewChild('resizeArea')
    public resizeArea: ElementRef;

    public resizeCursor = null;
    public showResizer = false;
    public resizerHeight;
    public dragDirection: RestrictDrag = RestrictDrag.HORIZONTALLY;
    public resizeEndTimeout = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? 200 : 0;

    protected sortDirection = SortingDirection.None;
    private _startResizePos;
    private _pinnedMaxWidth;

    constructor(
        public gridAPI: IgxGridAPIService,
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        public zone: NgZone,
        private cms: IgxColumnMovingService
    ) { }

    public ngOnInit() {
        this.cdr.markForCheck();
    }

    public ngDoCheck() {
        this.getSortDirection();
        this.cdr.markForCheck();
    }

    ngAfterViewInit() {
        this.zone.runOutsideAngular(() => {
            this.resizeArea.nativeElement.addEventListener('mouseover', this.onResizeAreaMouseOver.bind(this));
            this.resizeArea.nativeElement.addEventListener('mousedown', this.onResizeAreaMouseDown.bind(this));
        });
    }

    @HostListener('click', ['$event'])
    public onClick(event) {
        if (!this.column.grid.isColumnResizing) {
            event.stopPropagation();
            if (this.column.sortable) {
                const grid = this.gridAPI.get(this.gridID);
                const editableCell = this.gridAPI.get_cell_inEditMode(this.gridID);
                if (editableCell) {
                    this.gridAPI.escape_editMode(this.gridID, editableCell.cellID);
                }
                const groupingExpr = grid.groupingExpressions.find((expr) => expr.fieldName === this.column.field);
                const sortDir = groupingExpr ?
                    this.sortDirection + 1 > SortingDirection.Desc ? SortingDirection.Asc  : SortingDirection.Desc
                    : this.sortDirection + 1 > SortingDirection.Desc ? SortingDirection.None : this.sortDirection + 1;
                this.sortDirection = sortDir;
                this.gridAPI.sort(this.gridID, this.column.field, this.sortDirection, this.column.sortingIgnoreCase);
                grid.onSortingDone.emit({
                    dir: this.sortDirection,
                    fieldName: this.column.field,
                    ignoreCase: this.column.sortingIgnoreCase
                });
            }
        }
    }

    get restrictResizeMin(): number {
        const actualMinWidth = parseFloat(this.column.minWidth);
        const defaultMinWidth  = parseFloat(this.column.defaultMinWidth);

        let minWidth = Number.isNaN(actualMinWidth) || actualMinWidth < defaultMinWidth ? defaultMinWidth : actualMinWidth;
        minWidth = minWidth < parseFloat(this.column.width) ? minWidth : parseFloat(this.column.width);

        return minWidth - this.elementRef.nativeElement.getBoundingClientRect().width;
    }

    get restrictResizeMax(): number {
        const actualWidth = this.elementRef.nativeElement.getBoundingClientRect().width;

        if (this.column.pinned) {
            const pinnedMaxWidth = this._pinnedMaxWidth = this.grid.calcPinnedContainerMaxWidth - this.grid.pinnedWidth + actualWidth;

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

    @HostBinding('class.igx-grid__th--pinned')
    get isPinned() {
        return this.column.pinned;
    }

    @HostBinding('class.igx-grid__th--pinned-last')
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

    public onResizeAreaMouseOver() {
        if (this.column.resizable) {
            this.resizeCursor = 'col-resize';
            this.cdr.detectChanges();
        }
    }

    public onResizeAreaMouseDown(event) {
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

    public onResizeAreaDblClick() {
        if (this.column.resizable) {
            const currentColWidth = this.elementRef.nativeElement.getBoundingClientRect().width;

            const range = this.column.grid.document.createRange();
            const valToPxls = (referenceNode) => {
                range.selectNodeContents(referenceNode);
                return range.getBoundingClientRect().width;
            };

            const largest = new Map<number, number>();

            let cellsContentWidths = [];
            if (this.column.cells[0].nativeElement.children.length > 0) {
                this.column.cells.forEach((cell) => {
                    cellsContentWidths.push(Math.max(...Array.from(cell.nativeElement.children).map((child) => valToPxls(child))));
                });
            } else {
                cellsContentWidths = this.column.cells.map((cell) => valToPxls(cell.nativeElement));
            }

            const ind = cellsContentWidths.indexOf(Math.max(...cellsContentWidths));
            const cellStyle = this.grid.document.defaultView.getComputedStyle(this.column.cells[ind].nativeElement);
            let cellPadding = parseFloat(cellStyle.paddingLeft) + parseFloat(cellStyle.paddingRight);
            if (this.isLastPinned) {
                cellPadding += parseFloat(cellStyle.borderRightWidth);
            }
            largest.set(Math.max(...cellsContentWidths), cellPadding);

            let headerCell;
            if (this.column.headerTemplate && this.elementRef.nativeElement.children[0].children.length > 0) {
                headerCell =  Math.max(...Array.from(this.elementRef.nativeElement.children[0].children)
                .map((child) => valToPxls(child)));
            } else {
                headerCell = valToPxls(this.elementRef.nativeElement.children[0]);
            }
            if (this.column.sortable || this.column.filterable) {
                headerCell += this.elementRef.nativeElement.children[1].getBoundingClientRect().width;
            }

            const headerStyle = this.grid.document.defaultView.getComputedStyle(this.elementRef.nativeElement);
            const headerPadding = parseFloat(headerStyle.paddingLeft) + parseFloat(headerStyle.paddingRight) +
                parseFloat(headerStyle.borderRightWidth);
            largest.set(headerCell, headerPadding);

            const largestCell = Math.max(...Array.from(largest.keys()));
            const largestCellPadding = largest.get(largestCell);
            const size = Math.ceil(largestCell + largestCellPadding) + 'px';

            if (this.column.pinned) {
                const newPinnedWidth = this.grid.pinnedWidth - currentColWidth + parseFloat(size);

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
