import { Directive, ElementRef, Renderer2, NgZone, HostBinding, TemplateRef } from '@angular/core';
import { IgxDropDirective } from '../../directives/drag-drop/drag-drop.directive';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxGridComponent } from './grid.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxColumnMovingDragDirective } from '../moving/moving.drag.directive';

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
    selector: '[igxGridDetail]'
})
export class IgxGridDetailTemplateDirective {
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowExpandedIndicator]'
})
export class IgxRowExpandedIndicatorDirective {
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowCollapsedIndicator]'
})
export class IgxRowCollapsedIndicatorDirective {
}


/**
 * @hidden
 */
@Directive({
    selector: '[igxHeaderExpandedIndicator]'
})
export class IgxHeaderExpandIndicatorDirective {
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxHeaderCollapsedIndicator]'
})
export class IgxHeaderCollapseIndicatorDirective {
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxExcelStyleHeaderIcon]'
})
export class IgxExcelStyleHeaderIconDirective {
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxGroupAreaDrop]'
})
export class IgxGroupAreaDropDirective extends IgxDropDirective {

    @HostBinding('class.igx-drop-area--hover')
    public hovered = false;

    constructor(private elementRef: ElementRef, private renderer: Renderer2, private zone: NgZone) {
        super(elementRef, renderer, zone);
    }

    public onDragEnter(event) {
        const drag: IgxColumnMovingDragDirective = event.detail.owner;
        const column: IgxColumnComponent = drag.column;
        if (!this.columnBelongsToGrid(column)) {
            return;
        }
        const grid = column.grid as IgxGridComponent;
        const isGrouped = grid.groupingExpressions
            ? grid.groupingExpressions.findIndex((item) => item.fieldName === column.field) !== -1
            : false;
        if (column.groupable && !isGrouped && !column.columnGroup && !!column.field) {
            drag.icon.innerText = 'group_work';
            this.hovered = true;
        } else {
            drag.icon.innerText = 'block';
            this.hovered = false;
        }
    }

    public onDragLeave(event) {
        const drag: IgxColumnMovingDragDirective = event.detail.owner;
        const column: IgxColumnComponent = drag.column;
        if (!this.columnBelongsToGrid(column)) {
            return;
        }
        event.detail.owner.icon.innerText = 'block';
        this.hovered = false;
    }

    public onDragDrop(event) {
        const drag: IgxColumnMovingDragDirective = event.detail.owner;
        if (drag instanceof IgxColumnMovingDragDirective) {
            const column: IgxColumnComponent = drag.column;
            if (!this.columnBelongsToGrid(column)) {
                return;
            }

            const grid = column.grid as IgxGridComponent;
            if (grid.groupingExpressions) {
                const isGrouped = grid.groupingExpressions.findIndex((item) => item.fieldName === column.field) !== -1
                if (column.groupable && !isGrouped && !column.columnGroup && !!column.field) {
                    grid.groupBy({ fieldName: column.field, dir: SortingDirection.Asc, ignoreCase: column.sortingIgnoreCase,
                        strategy: column.sortStrategy, groupingComparer: column.groupingComparer });
                }
            }
        }
    }

    private closestParentByAttr(elem, attr) {
        return elem.hasAttribute(attr) ?
            elem :
            this.closestParentByAttr(elem.parentElement, attr);
    }

    private columnBelongsToGrid(column) {
        const elem = this.elementRef.nativeElement;
        const closestGridID = this.closestParentByAttr(elem, 'igxGroupAreaDrop').getAttribute('gridId');
        if (!column) {
            return false;
        } else {
            const grid = column.grid as IgxGridComponent;
            if (!grid || grid.id !== closestGridID) {
                return false;
            }
            return true;
        }
    }
}
