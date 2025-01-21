import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Inject, Input, NgZone, ViewChild } from '@angular/core';
import { PlatformUtil } from '../../core/utils';
import { IgxColumnComponent } from '../columns/column.component';
import { IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxGridHeaderGroupComponent } from '../headers/grid-header-group.component';
import { IgxPivotColumnResizingService } from '../resizing/pivot-grid/pivot-resizing.service';
import { IPivotDimension, PivotRowHeaderGroupType } from './pivot-grid.interface';
import { IgxPivotRowDimensionHeaderComponent } from './pivot-row-dimension-header.component';
import { IgxHeaderGroupStylePipe } from '../headers/pipes';
import { IgxPivotResizeHandleDirective } from '../resizing/pivot-grid/pivot-resize-handle.directive';
import { IgxColumnMovingDropDirective } from '../moving/moving.drop.directive';
import { IgxColumnMovingDragDirective } from '../moving/moving.drag.directive';
import { NgIf, NgClass, NgStyle } from '@angular/common';
import { IgxIconComponent } from '../../icon/icon.component';
import { IMultiRowLayoutNode } from '../common/types';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row-dimension-header-group',
    templateUrl: './pivot-row-dimension-header-group.component.html',
    imports: [IgxIconComponent, NgIf, IgxPivotRowDimensionHeaderComponent, NgClass, NgStyle, IgxColumnMovingDragDirective, IgxColumnMovingDropDirective, IgxPivotResizeHandleDirective, IgxHeaderGroupStylePipe]
})
export class IgxPivotRowDimensionHeaderGroupComponent extends IgxGridHeaderGroupComponent implements PivotRowHeaderGroupType {

    /**
     * @hidden
     */
    @HostBinding('style.user-select')
    public userSelect = 'none';

    constructor(private cdRef: ChangeDetectorRef,
        @Inject(IGX_GRID_BASE) public override grid: PivotGridType,
        private elementRef: ElementRef<HTMLElement>,
        public override colResizingService: IgxPivotColumnResizingService,
        filteringService: IgxFilteringService,
        platform: PlatformUtil,
        protected zone: NgZone) {
        super(cdRef, grid, elementRef, colResizingService, filteringService, platform);
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    public rowIndex: number;

    /**
     * @hidden
     * @internal
     */
    @Input()
    public colIndex: number;


    /**
     * @hidden
     * @internal
     */
    @Input()
    public layout: IMultiRowLayoutNode;

    /**
    * @hidden
    * @internal
    */
    @Input()
    public parent: any;

    @ViewChild(IgxPivotRowDimensionHeaderComponent)
    public override header: IgxPivotRowDimensionHeaderComponent;

    @HostBinding('attr.id')
    public override get headerID() {
        return `${this.grid.id}_-2_${this.rowIndex}_${this.visibleIndex}`;
    }

    @HostBinding('attr.title')
    public override get title() {
        return this.column.header;
    }

    /**
     * @hidden @internal
     */
    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        if (this.grid.rowSelection === 'none') {
            return;
        }
        event?.stopPropagation();
        const key = this.parent.getRowDimensionKey(this.column as IgxColumnComponent);
        if (this.grid.selectionService.isRowSelected(key)) {
            this.grid.selectionService.deselectRow(key, event);
        } else {
            this.grid.selectionService.selectRowById(key, true, event);
        }

        this.zone.run(() => {});
    }

    /**
     * @hidden
     * @internal
     */
    public get visibleIndex(): number {
        if (this.grid.hasHorizontalLayout) {
            return this.colIndex;
        }

        const field = this.column.field;
        const rows = this.grid.rowDimensions;
        const rootDimension = this.findRootDimension(field);
        return rows.indexOf(rootDimension);
    }

    @HostBinding('class.igx-grid-th--active')
    public override get active() {
        const nav = this.grid.navigation;
        const node = nav.activeNode;
        return node && !this.column.columnGroup ?
            nav.isRowHeaderActive &&
            node.row === this.rowIndex &&
            node.column === this.visibleIndex :
            false;
    }

    protected override get activeNode() {
        this.grid.navigation.isRowHeaderActive = true;
        this.grid.navigation.isRowDimensionHeaderActive = false;
        return {
            row: this.rowIndex, column: this.visibleIndex, level: null,
            mchCache: null,
            layout: this.layout || null
        };
    }

    private findRootDimension(field: string): IPivotDimension {
        const rows = this.grid.rowDimensions;
        let tempRow;
        let result = null;
        rows.forEach(row => {
            tempRow = row;
            do {
                if (tempRow.memberName === field) {
                    result = row;
                }
                tempRow = tempRow.childLevel;
            } while (tempRow)
        });
        return result;
    }


    public override activate() {
        this.grid.navigation.isRowHeader = true;
        this.grid.navigation.setActiveNode(this.activeNode);
    }

    /**
     * @hidden @internal
     */
    public override pointerdown(_event: PointerEvent): void {
        this.activate();
    }

    /**
     * @hidden @internal
     */
    public override onMouseDown(_event: MouseEvent): void {
        this.activate();
    }

    public override get selectable(): boolean {
        return false;
    }
}
