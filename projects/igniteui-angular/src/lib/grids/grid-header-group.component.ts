import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    ViewChild,
    QueryList,
    ViewChildren,
    forwardRef
} from '@angular/core';
import { IgxColumnComponent } from './column.component';
import { IgxFilteringService } from './filtering/grid-filtering.service';
import { GridBaseAPIService } from './api.service';
import { IgxGridBaseComponent } from './grid-base.component';
import { IgxColumnResizingService } from './grid-column-resizing.service';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxGridFilteringCellComponent } from './filtering/grid-filtering-cell.component';
import { isIE } from '../core/utils';


/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-grid-header-group',
    templateUrl: './grid-header-group.component.html'
})
export class IgxGridHeaderGroupComponent {

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
        const colWidth = this.column.width;
        const isNotPxInIE = isIE() && colWidth && typeof colWidth === 'string' && colWidth.indexOf('px') === -1;

        // a hack for fixing issue #2917, to be revised if ussue #1951 is ever fixed
        if (isNotPxInIE && this.grid.pinnedColumns.length > 0) {
            const firstContentCell = this.column.cells[0];
            if (firstContentCell) {
                return firstContentCell.nativeElement.getBoundingClientRect().width + 'px';
            }
        }

        return colWidth;
    }

    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = [
            'igx-grid__thead-item'
        ];

        const classList = {
            'igx-grid__th--pinned': this.isPinned,
            'igx-grid__th--pinned-last': this.isLastPinned,
            'igx-grid__drag-col-header': this.isHeaderDragged
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

    get isLastPinned() {
        const pinnedCols = this.grid.pinnedColumns;
        if (pinnedCols.length === 0) {
            return false;
        } else {
            return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
        }
    }

    get isPinned() {
        return this.column.pinned;
    }

    get isHeaderDragged() {
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

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
                public colReszingService: IgxColumnResizingService,
                public filteringService: IgxFilteringService) { }

    public onResizeAreaMouseOver() {
        if (this.column.resizable) {
            this.colReszingService.column = this.column;
            this.colReszingService.resizeCursor = 'col-resize';
        }
    }

    public onResizeAreaMouseDown(event) {
        if (event.button === 0 && this.column.resizable) {
            this.colReszingService.showResizer = true;
            this.colReszingService.isColumnResizing = true;
            this.colReszingService.resizerHeight = this.column.grid.calcResizerHeight;
            this.colReszingService.startResizePos = event.clientX;
        } else {
            this.colReszingService.resizeCursor = null;
        }
    }
}
