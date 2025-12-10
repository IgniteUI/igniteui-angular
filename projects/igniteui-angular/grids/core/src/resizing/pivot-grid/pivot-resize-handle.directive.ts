import {
    Directive,
    inject,
    Input} from '@angular/core';
import { IgxPivotColumnResizingService } from './pivot-resizing.service'
import { IgxResizeHandleDirective } from '../resize-handle.directive';
import { ColumnType } from 'igniteui-angular/core';
import { PivotRowHeaderGroupType } from '../../pivot-grid.interface';

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxPivotResizeHandle]',
    standalone: true
})
export class IgxPivotResizeHandleDirective extends IgxResizeHandleDirective {
    public override colResizingService = inject(IgxPivotColumnResizingService);


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
