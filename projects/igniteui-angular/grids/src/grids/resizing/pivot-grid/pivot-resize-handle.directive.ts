import {
    Directive,
    ElementRef,
    Input,
    NgZone
} from '@angular/core';
import { ColumnType } from '../../common/grid.interface';
import { PivotRowHeaderGroupType } from '../../pivot-grid/pivot-grid.interface';
import { IgxPivotColumnResizingService } from './pivot-resizing.service'
import { IgxResizeHandleDirective } from '../resize-handle.directive';

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxPivotResizeHandle]',
    standalone: true
})
export class IgxPivotResizeHandleDirective extends IgxResizeHandleDirective {

    /**
     * @hidden
     */
    @Input('igxPivotResizeHandle')
    public set pivotColumn(value: ColumnType) {
        this.column = value;
    }

    public get pivotColumn() {
        return this.column;
    }

    /**
     * @hidden
     */
    @Input('igxPivotResizeHandleHeader')
    public rowHeaderGroup: PivotRowHeaderGroupType;

    constructor(zone: NgZone,
        element: ElementRef,
        public override colResizingService: IgxPivotColumnResizingService) {
        super(zone, element, colResizingService);
    }

    /**
     * @hidden
     */
    public override onDoubleClick() {
        this._dblClick = true;
        this.initResizeService();
        this.rowHeaderGroup.grid.autoSizeRowDimension(this.rowHeaderGroup.parent.rootDimension);
    }

    /**
     * @hidden
     */
    protected override initResizeService(event = null) {
        super.initResizeService(event);
        this.colResizingService.rowHeaderGroup = this.rowHeaderGroup;
    }
}
