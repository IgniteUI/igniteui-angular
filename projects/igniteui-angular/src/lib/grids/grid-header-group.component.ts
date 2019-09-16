import {
    Component,
    HostBinding,
    Input,
    ViewChild,
    QueryList,
    ViewChildren,
    forwardRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    DoCheck,
    ElementRef,
    HostListener
} from '@angular/core';
import { IgxColumnComponent } from './columns/column.component';
import { IgxFilteringService } from './filtering/grid-filtering.service';
import { GridBaseAPIService } from './api.service';
import { IgxGridBaseComponent } from './grid-base.component';
import { IgxColumnResizingService } from './resizing/resizing.service';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxGridFilteringCellComponent } from './filtering/grid-filtering-cell.component';
import { isIE } from '../core/utils';
import { GridType } from './common/grid.interface';

const Z_INDEX = 9999;

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-header-group',
    templateUrl: './grid-header-group.component.html'
})
export class IgxGridHeaderGroupComponent implements DoCheck {

    @HostBinding('style.-ms-grid-row-span')
    get gridRowSpan(): number {
        return this.column.gridRowSpan;
    }

    @HostBinding('style.-ms-grid-column-span')
    get gridColumnSpan(): number {
        return this.column.gridColumnSpan;
    }


    @HostBinding('style.grid-row-end')
    get rowEnd(): number {
        return this.column.rowEnd;
    }

    @HostBinding('style.grid-column-end')
    get colEnd(): number {
        return this.column.colEnd;
    }

    @HostBinding('style.-ms-grid-row')
    @HostBinding('style.grid-row-start')
    get rowStart(): number {
        return this.column.rowStart;
    }

    @HostBinding('style.-ms-grid-column')
    @HostBinding('style.grid-column-start')
    get colStart(): number {
        return this.column.colStart;
    }


    /**
     * Gets the column of the header group.
     * @memberof IgxGridHeaderGroupComponent
     */
    @Input()
    public column: IgxColumnComponent;

    /**
     * Gets the `id` of the grid in which the header group is stored.
     * @memberof IgxGridHeaderGroupComponent
     */
    @Input()
    public gridID: string;

    /**
     * @hidden
     */
    @ViewChild(IgxGridHeaderComponent, { static: false })
    public headerCell: IgxGridHeaderComponent;

    /**
     * @hidden
     */
    @ViewChild(IgxGridFilteringCellComponent, { static: false })
    public filterCell: IgxGridFilteringCellComponent;

    /**
     * @hidden
     */
    @ViewChildren(forwardRef(() => IgxGridHeaderGroupComponent), { read: IgxGridHeaderGroupComponent })
    public children: QueryList<IgxGridHeaderGroupComponent>;

    /**
     * Gets the width of the header group.
     * @memberof IgxGridHeaderGroupComponent
     */
    @HostBinding('style.min-width')
    @HostBinding('style.flex-basis')
    get width() {
        return this.grid.getHeaderGroupWidth(this.column);
    }

    /**
     * Gets the style classes of the header group.
     * @memberof IgxGridHeaderGroupComponent
     */
    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = [
            'igx-grid__thead-item',
            this.column.headerGroupClasses
        ];

        const classList = {
            'igx-grid__th--pinned': this.isPinned,
            'igx-grid__th--pinned-last': this.isLastPinned,
            'igx-grid__drag-col-header': this.isHeaderDragged,
            'igx-grid__th--filtering': this.isFiltered
        };

        for (const className of Object.keys(classList)) {
            if (classList[className]) {
                defaultClasses.push(className);
            }
        }
        return defaultClasses.join(' ');
    }

    /**
     * @hidden
     */
    @HostBinding('style.z-index')
    get zIndex() {
        if (!this.column.pinned) {
            return null;
        }
        return Z_INDEX - this.grid.pinnedColumns.indexOf(this.column);
    }

    /**
     * Gets the grid of the header group.
     * @memberof IgxGridHeaderGroupComponent
     */
    get grid(): any {
        return this.gridAPI.grid;
    }

    /**
     * Gets whether the header group belongs to a column that is filtered.
     * @memberof IgxGridHeaderGroupComponent
     */
    get isFiltered(): boolean {
        return this.filteringService.filteredColumn === this.column;
    }

    /**
     * Gets whether the header group is stored in the last column in the pinned area.
     * @memberof IgxGridHeaderGroupComponent
     */
    get isLastPinned(): boolean {
        return !this.grid.hasColumnLayouts ? this.column.isLastPinned : false;
    }

    @HostBinding('style.display')
    get groupDisplayStyle(): string {
        return this.grid.hasColumnLayouts && this.column.children && !isIE() ? 'flex' : '';
    }

    /**
     * Gets whether the header group is stored in a pinned column.
     * @memberof IgxGridHeaderGroupComponent
     */
    get isPinned(): boolean {
        return this.column.pinned;
    }

    /**
     * Gets whether the header group belongs to a column that is moved.
     * @memberof IgxGridHeaderGroupComponent
     */
    get isHeaderDragged(): boolean {
        return this.grid.draggedColumn ===  this.column;
    }

    /**
     * @hidden
     */
    get hasLastPinnedChildColumn(): boolean {
        return this.column.allChildren.some(child => child.isLastPinned);
    }

    /**
     * @hidden
     */
    get height() {
        return this.element.nativeElement.getBoundingClientRect().height;
    }

    /**
     * @hidden
     */
    @HostListener('mousedown', ['$event'])
    public onMouseDown(event): void {
        // hack for preventing text selection in IE and Edge while dragging the resizer
        event.preventDefault();
    }

    public ngDoCheck() {
        this.cdr.markForCheck();
    }

    constructor(private cdr: ChangeDetectorRef,
                public gridAPI: GridBaseAPIService<IgxGridBaseComponent & GridType>,
                public element: ElementRef,
                public colResizingService: IgxColumnResizingService,
                public filteringService: IgxFilteringService) { }
}
