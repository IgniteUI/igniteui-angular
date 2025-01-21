import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, Input, NgZone, ViewChild } from '@angular/core';
import { PlatformUtil } from '../../core/utils';
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
import { SortingDirection } from '../../data-operations/sorting-strategy';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row-header-group',
    templateUrl: './pivot-row-dimension-header-group.component.html',
    imports: [IgxIconComponent, NgIf, IgxPivotRowDimensionHeaderComponent, NgClass, NgStyle, IgxColumnMovingDragDirective, IgxColumnMovingDropDirective, IgxPivotResizeHandleDirective, IgxHeaderGroupStylePipe]
})
export class IgxPivotRowHeaderGroupComponent extends IgxGridHeaderGroupComponent implements PivotRowHeaderGroupType {

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

    @Input()
    public set dimWidth(value: number) {
        this.column.width = value + 'px';
    }
    public get dimWidth() {
        return parseFloat(this.column.width);
    }

    public get parent() {
        return this;
    };

    @Input()
    public rootDimension: IPivotDimension;

    @ViewChild(IgxPivotRowDimensionHeaderComponent)
    public override header: IgxPivotRowDimensionHeaderComponent;

    @HostBinding('attr.id')
    public override get headerID() {
        return `${this.grid.id}_-2_${this.rootDimension.memberName}_${this.visibleIndex}`;
    }

    @HostBinding('attr.title')
    public override get title() {
        return this.rootDimension.displayName;
    }

    /**
     * @hidden
     * @internal
     */
    public get visibleIndex(): number {
        const rows = this.grid.visibleRowDimensions;
        return rows.indexOf(this.rootDimension);
    }

    @HostBinding('class.igx-grid-th--active')
    public override get active() {
        const nav = this.grid.navigation;
        const node = nav.activeNode;
        return node && !this.column.columnGroup ?
            nav.isRowDimensionHeaderActive &&
            node.row === this.rowIndex &&
            node.column === this.visibleIndex :
            false;
    }

    @HostBinding('class.asc')
    public get sortAscendingStyle() {
        return this.rootDimension.sortDirection === SortingDirection.Asc;
    }

    @HostBinding('class.desc')
    public get sortDescendingStyle() {
        return this.rootDimension.sortDirection === SortingDirection.Desc;
    }

    @HostBinding('class.igx-grid-th--sortable')
    public get sortableStyle() {
        return true;
    }

    @HostBinding('class.igx-grid-th--sorted')
    public get sortedStyle() {
        return this.rootDimension.sortDirection !== undefined && this.rootDimension.sortDirection !== SortingDirection.None;
    }

    protected override get activeNode() {
        this.grid.navigation.isRowDimensionHeaderActive = true;
        this.grid.navigation.isRowHeaderActive = false;
        return {
            row: this.rowIndex, column: this.visibleIndex, level: null,
            mchCache: {
                level: 0,
                visibleIndex:  this.visibleIndex
            },
            layout: null
        };
    }

    public override activate() {
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
