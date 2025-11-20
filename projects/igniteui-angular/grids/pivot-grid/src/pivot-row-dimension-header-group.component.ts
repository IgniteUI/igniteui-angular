import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Inject, Input, NgZone, ViewChild } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';

import {
    IGX_GRID_BASE,
    IgxColumnComponent,
    IgxColumnMovingDragDirective,
    IgxColumnMovingDropDirective,
    IgxFilteringService,
    IgxGridHeaderGroupComponent,
    IgxHeaderGroupStylePipe,
    IgxPivotColumnResizingService,
    IgxPivotResizeHandleDirective,
    IMultiRowLayoutNode,
    IPivotDimension,
    PivotGridType,
    PivotRowHeaderGroupType
} from 'igniteui-angular/grids/core';
import { IgxPivotRowDimensionHeaderComponent } from './pivot-row-dimension-header.component';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { PlatformUtil } from 'igniteui-angular/core';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row-dimension-header-group',
    templateUrl: './pivot-row-dimension-header-group.component.html',
    imports: [IgxIconComponent, IgxPivotRowDimensionHeaderComponent, NgClass, NgStyle, IgxColumnMovingDragDirective, IgxColumnMovingDropDirective, IgxPivotResizeHandleDirective, IgxHeaderGroupStylePipe]
})
export class IgxPivotRowDimensionHeaderGroupComponent extends IgxGridHeaderGroupComponent implements PivotRowHeaderGroupType {
    public override grid = inject<PivotGridType>(IGX_GRID_BASE);
    public override colResizingService = inject(IgxPivotColumnResizingService);
    protected zone = inject(NgZone);

    /**
     * @hidden
     */
    @HostBinding('style.user-select')
    public userSelect = 'none';

    /**
     * @hidden
     */
    public get role(): string {
        return 'rowheader';
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


    protected getHeaderWidthFromDimension() {
        if (this.grid.hasHorizontalLayout) {
            return this.parent.width === -1 ? 'fit-content' : this.width;
        }
        return this.grid.rowDimensionWidth(this.parent.rootDimension);
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
