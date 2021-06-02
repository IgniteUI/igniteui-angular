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
import { IgxColumnComponent } from '../columns/column.component';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxGridFilteringCellComponent } from '../filtering/base/grid-filtering-cell.component';
import { GridType } from '../common/grid.interface';
import { GridSelectionMode } from '../common/enums';
import { PlatformUtil } from '../../core/utils';

const Z_INDEX = 9999;

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-header-group',
    templateUrl: './grid-header-group.component.html'
})
export class IgxGridHeaderGroupComponent implements DoCheck {

    @HostBinding('style.-ms-grid-row-span')
    public get gridRowSpan(): number {
        return this.column.gridRowSpan;
    }

    @HostBinding('style.-ms-grid-column-span')
    public get gridColumnSpan(): number {
        return this.column.gridColumnSpan;
    }


    @HostBinding('style.grid-row-end')
    public get rowEnd(): number {
        return this.column.rowEnd;
    }

    @HostBinding('style.grid-column-end')
    public get colEnd(): number {
        return this.column.colEnd;
    }

    @HostBinding('style.-ms-grid-row')
    @HostBinding('style.grid-row-start')
    public get rowStart(): number {
        return this.column.rowStart;
    }

    @HostBinding('style.-ms-grid-column')
    @HostBinding('style.grid-column-start')
    public get colStart(): number {
        return this.column.colStart;
    }

    @HostBinding('attr.id')
    public get headerID() {
        return `${this.grid.id}_-1_${this.column.level}_${this.column.visibleIndex}`;
    }

    /**
     * Gets the column of the header group.
     *
     * @memberof IgxGridHeaderGroupComponent
     */
    @Input()
    public column: IgxColumnComponent;

    @HostBinding('class.igx-grid-th--active')
    public get active() {
        const node = this.grid.navigation.activeNode;
        return node && !this.column.columnGroup ?
            node.row === -1 && node.column === this.column.visibleIndex && node.level === this.column.level : false;
    }

    public get activeGroup() {
        const node = this.grid.navigation.activeNode;
        return node ? node.row === -1 && node.column === this.column.visibleIndex && node.level === this.column.level : false;
    }

    /**
     * @hidden
     */
    @ViewChild(IgxGridHeaderComponent)
    public header: IgxGridHeaderComponent;

    /**
     * @hidden
     */
    @ViewChild(IgxGridFilteringCellComponent)
    public filter: IgxGridFilteringCellComponent;

    /**
     * @hidden
     */
    @ViewChildren(forwardRef(() => IgxGridHeaderGroupComponent), { read: IgxGridHeaderGroupComponent })
    public children: QueryList<IgxGridHeaderGroupComponent>;

    /**
     * Gets the width of the header group.
     *
     * @memberof IgxGridHeaderGroupComponent
     */
    public get width() {
        return this.grid.getHeaderGroupWidth(this.column);
    }

    @HostBinding('class.igx-grid-thead__item')
    public defaultCss = true;

    constructor(private cdr: ChangeDetectorRef,
        public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        private ref: ElementRef<HTMLElement>,
        public colResizingService: IgxColumnResizingService,
        public filteringService: IgxFilteringService,
        protected platform: PlatformUtil) { }

    @HostBinding('class.igx-grid-th--pinned')
    public get pinnedCss() {
        return this.isPinned;
    }

    @HostBinding('class.igx-grid-th--pinned-last')
    public get pinnedLastCss() {
        return this.isLastPinned;
    }

    @HostBinding('class.igx-grid-th--pinned-first')
    public get pinnedFirstCSS() {
        return this.isFirstPinned;
    }

    @HostBinding('class.igx-grid__drag-col-header')
    public get headerDragCss() {
        return this.isHeaderDragged;
    }

    @HostBinding('class.igx-grid-th--filtering')
    public get filteringCss() {
        return this.isFiltered;
    }

    /**
     * @hidden
     */
    @HostBinding('style.z-index')
    public get zIndex() {
        if (!this.column.pinned) {
            return null;
        }
        return Z_INDEX - this.grid.pinnedColumns.indexOf(this.column);
    }

    /**
     * Gets the grid of the header group.
     *
     * @memberof IgxGridHeaderGroupComponent
     */
    public get grid(): any {
        return this.gridAPI.grid;
    }

    /**
     * Gets whether the header group belongs to a column that is filtered.
     *
     * @memberof IgxGridHeaderGroupComponent
     */
    public get isFiltered(): boolean {
        return this.filteringService.filteredColumn === this.column;
    }

    /**
     * Gets whether the header group is stored in the last column in the pinned area.
     *
     * @memberof IgxGridHeaderGroupComponent
     */
    public get isLastPinned(): boolean {
        return !this.grid.hasColumnLayouts ? this.column.isLastPinned : false;
    }

    /**
     * Gets whether the header group is stored in the first column of the right pinned area.
     */
    public get isFirstPinned(): boolean {
        return !this.grid.hasColumnLayouts ? this.column.isFirstPinned : false;
    }

    @HostBinding('style.display')
    public get groupDisplayStyle(): string {
        return this.grid.hasColumnLayouts && this.column.children && !this.platform.isIE ? 'flex' : '';
    }

    /**
     * Gets whether the header group is stored in a pinned column.
     *
     * @memberof IgxGridHeaderGroupComponent
     */
    public get isPinned(): boolean {
        return this.column.pinned;
    }

    /**
     * Gets whether the header group belongs to a column that is moved.
     *
     * @memberof IgxGridHeaderGroupComponent
     */
    public get isHeaderDragged(): boolean {
        return this.grid.columnInDrag === this.column;
    }

    /**
     * @hidden
     */
    public get hasLastPinnedChildColumn(): boolean {
        return this.column.allChildren.some(child => child.isLastPinned);
    }

    /**
     * @hidden
     */
    public get hasFirstPinnedChildColumn(): boolean {
        return this.column.allChildren.some(child => child.isFirstPinned);
    }

    /**
     * @hidden
     */
    public get selectable() {
        const selectableChildren = this.column.allChildren.filter(c => !c.hidden && c.selectable && !c.columnGroup);
        return this.grid.columnSelection !== GridSelectionMode.none &&
            this.column.applySelectableClass
            && !this.selected && selectableChildren.length > 0
            && !this.grid.filteringService.isFilterRowVisible;
    }

    /**
     * @hidden
     */
    public get selected() {
        return this.column.selected;
    }

    /**
     * @hidden
     */
    public get height() {
        return this.nativeElement.getBoundingClientRect().height;
    }

    /**
     * @hidden
     */
    public get title() {
        return this.column.title || this.column.header;
    }

    public get nativeElement() {
        return this.ref.nativeElement;
    }

    /**
     * @hidden
     */
    @HostListener('mousedown', ['$event'])
    public onMouseDown(event: MouseEvent): void {
        // hack for preventing text selection in IE and Edge while dragging the resize element
        event.preventDefault();
    }

    /**
     * @hidden
     */
    public groupClicked(event: MouseEvent): void {
        const columnsToSelect = this.column.allChildren.filter(c => !c.hidden && c.selectable && !c.columnGroup).map(c => c.field);
        if (this.grid.columnSelection !== GridSelectionMode.none
            && columnsToSelect.length > 0 && !this.grid.filteringService.isFilterRowVisible) {
            const clearSelection = this.grid.columnSelection === GridSelectionMode.single || !event.ctrlKey;
            const rangeSelection = this.grid.columnSelection === GridSelectionMode.multiple && event.shiftKey;
            if (!this.selected) {
                this.grid.selectionService.selectColumns(columnsToSelect, clearSelection, rangeSelection, event);
            } else {
                const selectedFields = this.grid.selectionService.getSelectedColumns();
                if ((selectedFields.length === columnsToSelect.length) && selectedFields.every(el => columnsToSelect.includes(el))
                    || !clearSelection) {
                    this.grid.selectionService.deselectColumns(columnsToSelect, event);
                } else {
                    this.grid.selectionService.selectColumns(columnsToSelect, clearSelection, rangeSelection, event);
                }
            }
        }
    }

    /**
     * @hidden @internal
     */
    public toggleExpandState(event: MouseEvent): void {
        event.stopPropagation();
        this.column.expanded = !this.column.expanded;
    }

    /**
     * @hidden @internal
     */
    public pointerdown(event: PointerEvent): void {
        event.stopPropagation();
        this.activate();
        this.grid.theadRow.nativeElement.focus();
    }

    /*
     * This method is necessary due to some specifics related with implementation of column moving
     * @hidden
     */
    public activate() {
        this.grid.navigation.setActiveNode(this.activeNode);
        this.grid.theadRow.nativeElement.focus();
    }

    public ngDoCheck() {
        this.cdr.markForCheck();
    }
    /**
     * @hidden
     */
    public onPinterEnter() {
        this.column.applySelectableClass = true;
    }

    /**
     * @hidden
     */
    public onPointerLeave() {
        this.column.applySelectableClass = false;
    }

    private get activeNode() {
        return {
            row: -1, column: this.column.visibleIndex, level: this.column.level,
            mchCache: { level: this.column.level, visibleIndex: this.column.visibleIndex },
            layout: this.column.columnLayoutChild ? {
                rowStart: this.column.rowStart,
                colStart: this.column.colStart,
                rowEnd: this.column.rowEnd,
                colEnd: this.column.colEnd,
                columnVisibleIndex: this.column.visibleIndex
            } : null
        };
    }
}
