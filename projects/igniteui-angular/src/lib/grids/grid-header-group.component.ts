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
    DoCheck
} from '@angular/core';
import { IgxColumnComponent } from './column.component';
import { IgxFilteringService } from './filtering/grid-filtering.service';
import { GridBaseAPIService } from './api.service';
import { IgxGridBaseComponent } from './grid-base.component';
import { IgxColumnResizingService } from './grid-column-resizing.service';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxGridFilteringCellComponent } from './filtering/grid-filtering-cell.component';

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

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    @ViewChild(IgxGridHeaderComponent)
    public headerCell: IgxGridHeaderComponent;

    @ViewChild(IgxGridFilteringCellComponent)
    public filterCell: IgxGridFilteringCellComponent;

    @ViewChildren(forwardRef(() => IgxGridHeaderGroupComponent), { read: IgxGridHeaderGroupComponent })
    public children: QueryList<IgxGridHeaderGroupComponent>;

    @HostBinding('style.min-width')
    @HostBinding('style.flex-basis')
    get width() {
        return this.column.width;
    }

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

        Object.entries(classList).forEach(([klass, value]) => {
            if (value) {
                defaultClasses.push(klass);
            }
        });
        return defaultClasses.join(' ');
    }

    @HostBinding('style.z-index')
    get zIndex() {
        if (!this.column.pinned) {
            return null;
        }
        return 9999 - this.grid.pinnedColumns.indexOf(this.column);
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    get isFiltered(): boolean {
        return this.filteringService.filteredColumn === this.column;
    }

    get isLastPinned(): boolean {
        const pinnedCols = this.grid.pinnedColumns;

        if (pinnedCols.length === 0) {
            return false;
        }

        return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
    }

    get isPinned(): boolean {
        return this.column.pinned;
    }

    get isHeaderDragged(): boolean {
        return this.grid.draggedColumn ===  this.column;
    }

    get hasLastPinnedChildColumn(): boolean {
        const pinnedCols = this.grid.pinnedColumns;
        if (this.column.allChildren) {
            return this.column.allChildren.some((child) => {
                return pinnedCols.length > 0 && pinnedCols.indexOf(child) === pinnedCols.length - 1;
            });
        }
    }

    public ngDoCheck() {
        if (this.column.columnGroup) {
            this.cdr.markForCheck();
        }
    }

    constructor(private cdr: ChangeDetectorRef,
                public gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
                public colReszingService: IgxColumnResizingService,
                public filteringService: IgxFilteringService) { }

    public onResizeAreaMouseOver() {
        if (this.column.resizable) {
            this.colReszingService.resizeCursor = 'col-resize';
        }
    }

    public onResizeAreaMouseDown(event) {
        if (event.button === 0 && this.column.resizable) {
            this.colReszingService.column = this.column;
            this.colReszingService.showResizer = true;
            this.colReszingService.isColumnResizing = true;
            this.colReszingService.resizerHeight = this.column.grid.calcResizerHeight;
            this.colReszingService.startResizePos = event.clientX;
        } else {
            this.colReszingService.resizeCursor = null;
        }
    }

    public autosizeColumnOnDblClick(event) {
        if (event.button === 0 && this.column.resizable) {
            this.colReszingService.column = this.column;
            this.colReszingService.autosizeColumnOnDblClick();
         }
    }
}
