import { Directive, ElementRef, Renderer2, NgZone, HostBinding, TemplateRef } from '@angular/core';
import { IgxDropDirective } from '../../directives/drag-drop/drag-drop.directive';
import { IgxColumnMovingDragDirective } from '../moving/moving.drag.directive';
import { IgxGroupByAreaDirective } from '../grouping/group-by-area.directive';
import { ColumnType, IgxGridHeaderTemplateContext, IgxGridRowTemplateContext, IgxGridTemplateContext } from '../common/grid.interface';

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
    public static ngTemplateContextGuard(_directive: IgxRowExpandedIndicatorDirective,
            context: unknown): context is IgxGridRowTemplateContext { 
        return true
    };
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowCollapsedIndicator]'
})
export class IgxRowCollapsedIndicatorDirective {
    public static ngTemplateContextGuard(_directive: IgxRowCollapsedIndicatorDirective,
        context: unknown): context is IgxGridRowTemplateContext { 
        return true
    };
}


/**
 * @hidden
 */
@Directive({
    selector: '[igxHeaderExpandedIndicator]'
})
export class IgxHeaderExpandIndicatorDirective {
    public static ngTemplateContextGuard(_directive: IgxHeaderExpandIndicatorDirective,
        context: unknown): context is IgxGridTemplateContext { 
        return true
    };
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxHeaderCollapsedIndicator]'
})
export class IgxHeaderCollapseIndicatorDirective {
    public static ngTemplateContextGuard(_directive: IgxHeaderCollapseIndicatorDirective,
        context: unknown): context is IgxGridTemplateContext { 
        return true
    };
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxExcelStyleHeaderIcon]'
})
export class IgxExcelStyleHeaderIconDirective {
    public static ngTemplateContextGuard(_directive: IgxExcelStyleHeaderIconDirective,
        context: unknown): context is IgxGridHeaderTemplateContext { 
        return true
    };
}

/**
 * @hidden
 */
 @Directive({
    selector: '[igxSortHeaderIcon]'
})
export class IgxSortHeaderIconDirective {
    public static ngTemplateContextGuard(_directive: IgxSortHeaderIconDirective,
        context: unknown): context is IgxGridHeaderTemplateContext { 
        return true
    };
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxSortAscendingHeaderIcon]'
})
export class IgxSortAscendingHeaderIconDirective {
    public static ngTemplateContextGuard(_directive: IgxSortAscendingHeaderIconDirective,
        context: unknown): context is IgxGridHeaderTemplateContext { 
        return true
    };
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxSortDescendingHeaderIcon]'
})
export class IgxSortDescendingHeaderIconDirective {
    public static ngTemplateContextGuard(_directive: IgxSortDescendingHeaderIconDirective,
        context: unknown): context is IgxGridHeaderTemplateContext { 
        return true
    };
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
