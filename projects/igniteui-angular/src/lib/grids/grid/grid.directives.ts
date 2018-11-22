import { Directive, ElementRef, Renderer2, NgZone, HostBinding, TemplateRef } from '@angular/core';
import { IgxDropDirective } from '../../directives/dragdrop/dragdrop.directive';
import { IgxColumnMovingDragDirective } from '../grid.common';
import { IgxColumnComponent } from '../column.component';
import { IgxGridComponent } from './grid.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';

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

    constructor(private elementRef: ElementRef, private renderer: Renderer2, private zone: NgZone) {
        super(elementRef, renderer, zone);
    }

    @HostBinding('class.igx-drop-area--hover')
    public hovered = false;


    public onDragEnter(event) {
        const drag: IgxColumnMovingDragDirective = event.detail.owner;
        const column: IgxColumnComponent = drag.column;
        const grid = <IgxGridComponent>column.grid;
        const isGrouped = grid.groupingExpressions.findIndex((item) => item.fieldName === column.field) !== -1;
        if (column.groupable && !isGrouped && !column.columnGroup) {
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
            const grid = <IgxGridComponent>column.grid;
            const isGrouped = grid.groupingExpressions.findIndex((item) => item.fieldName === column.field) !== -1;
            if (column.groupable && !isGrouped && !column.columnGroup) {
                grid.groupBy({ fieldName: column.field, dir: SortingDirection.Asc, ignoreCase: column.sortingIgnoreCase,
                    strategy: column.sortStrategy });
            }
        }
    }
}
