import {
    Directive,
    ElementRef,
    HostBinding,
    NgZone,
    Renderer2,
    TemplateRef
} from '@angular/core';
import { IgxColumnComponent } from '../grid-common/column.component';
import { IgxDropDirective } from '../directives/dragdrop/dragdrop.directive';
import { IgxColumnMovingDragDirective } from '../grid-common/common/grid-common.misc';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxGridAPIService } from './grid-api.service';
import { IGridBaseComponent } from '../grid-common/common/grid-interfaces';
import { GridBaseAPIService } from '../grid-common/api.service';

/**
 * @hidden
 */
@Directive({
    selector: '[igxGroupByRow]'
})
export class IgxGroupByRowTemplateDirective {

    constructor(public template: TemplateRef<any>) { }

}

/**
 * @hidden
 */
@Directive({
    selector: '[igxGroupAreaDrop]'
})
export class IgxGroupAreaDropDirective extends IgxDropDirective {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IGridBaseComponent>, elementRef: ElementRef, renderer: Renderer2, _zone: NgZone) {
        super(elementRef, renderer, _zone);
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }

    @HostBinding('class.igx-drop-area--hover')
    public hovered = false;


    public onDragEnter(event) {
        const drag: IgxColumnMovingDragDirective = event.detail.owner;
        const column: IgxColumnComponent = drag.column;
        const grid = this.gridAPI.get(column.gridID);
        const isGrouped = grid.groupingExpressions.findIndex((item) => item.fieldName === column.field) !== -1;
        if (column.groupable && !isGrouped) {
            drag.icon.innerText = 'group_work';
            this.hovered = true;
        } else {
            drag.icon.innerText = 'block';
            this.hovered = false;
        }
    }

    public onDragLeave(event) {
        event.detail.owner.icon.innerText = 'block';
        this.hovered = false;
    }

    public onDragDrop(event) {
        const drag: IgxColumnMovingDragDirective = event.detail.owner;
        if (drag instanceof IgxColumnMovingDragDirective) {
            const column: IgxColumnComponent = drag.column;
            const grid = this.gridAPI.get(column.gridID);
            const isGrouped = grid.groupingExpressions.findIndex((item) => item.fieldName === column.field) !== -1;
            if (column.groupable && !isGrouped) {
                grid.groupBy({ fieldName: column.field, dir: SortingDirection.Asc, ignoreCase: column.sortingIgnoreCase });
            }
        }
    }
}
