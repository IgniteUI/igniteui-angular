import { Directive, ElementRef, Renderer2, NgZone, HostBinding, TemplateRef } from '@angular/core';
import { IgxDropDirective } from '../../directives/drag-drop/drag-drop.directive';
import { IgxColumnMovingDragDirective } from '../moving/moving.drag.directive';
import { IgxGroupByAreaDirective } from '../grouping/group-by-area.directive';
import { ColumnType } from '../common/grid.interface';

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

    constructor(
        private groupArea: IgxGroupByAreaDirective,
        private elementRef: ElementRef<HTMLElement>,
        renderer: Renderer2,
        zone: NgZone) {
        super(elementRef, renderer, zone);
    }

    public onDragEnter(event) {
        const drag: IgxColumnMovingDragDirective = event.detail.owner;
        const column: ColumnType = drag.column;
        if (!this.columnBelongsToGrid(column)) {
            return;
        }

        const isGrouped = this.groupArea.expressions
            ? this.groupArea.expressions.findIndex((item) => item.fieldName === column.field) !== -1
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
        const column: ColumnType = drag.column;
        if (!this.columnBelongsToGrid(column)) {
            return;
        }
        event.detail.owner.icon.innerText = 'block';
        this.hovered = false;
    }

    private closestParentByAttr(elem, attr) {
        return elem.hasAttribute(attr) ?
            elem :
            this.closestParentByAttr(elem.parentElement, attr);
    }

    private columnBelongsToGrid(column: ColumnType) {
        const elem = this.elementRef.nativeElement;
        const closestGridID = this.closestParentByAttr(elem, 'igxGroupAreaDrop').getAttribute('gridId');
        if (!column) {
            return false;
        } else {
            const grid = column.grid;
            if (!grid || grid.id !== closestGridID) {
                return false;
            }
            return true;
        }
    }
}
