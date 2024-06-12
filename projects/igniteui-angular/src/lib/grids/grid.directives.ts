import { Directive, ElementRef, Renderer2, NgZone, HostBinding, TemplateRef } from '@angular/core';
import { IgxDropDirective } from '../directives/drag-drop/drag-drop.directive';
import { IgxColumnMovingDragDirective } from './moving/moving.drag.directive';
import { IgxGroupByAreaDirective } from './grouping/group-by-area.directive';
import {
    ColumnType,
    IgxGridMasterDetailContext,
    IgxGroupByRowTemplateContext,
    IgxGridHeaderTemplateContext,
    IgxGridRowTemplateContext,
    IgxGridTemplateContext
} from './common/grid.interface';

/**
 * @hidden
 */
@Directive({
    selector: '[igxGroupByRow]',
    standalone: true
})
export class IgxGroupByRowTemplateDirective {
    public static ngTemplateContextGuard(_dir: IgxGroupByRowTemplateDirective,
        ctx: unknown): ctx is IgxGroupByRowTemplateContext {
        return true
    }

    constructor(public template: TemplateRef<IgxGroupByRowTemplateContext>) { }

}

/**
 * @hidden
 */
@Directive({
    selector: '[igxGridDetail]',
    standalone: true
})
export class IgxGridDetailTemplateDirective {
    public static ngTemplateContextGuard(_dir: IgxGridDetailTemplateDirective,
        ctx: unknown): ctx is IgxGridMasterDetailContext {
        return true
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowExpandedIndicator]',
    standalone: true
})
export class IgxRowExpandedIndicatorDirective {
    public static ngTemplateContextGuard(_directive: IgxRowExpandedIndicatorDirective,
            context: unknown): context is IgxGridRowTemplateContext {
        return true
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowCollapsedIndicator]',
    standalone: true
})
export class IgxRowCollapsedIndicatorDirective {
    public static ngTemplateContextGuard(_directive: IgxRowCollapsedIndicatorDirective,
        context: unknown): context is IgxGridRowTemplateContext {
        return true
    }
}


/**
 * @hidden
 */
@Directive({
    selector: '[igxHeaderExpandedIndicator]',
    standalone: true
})
export class IgxHeaderExpandedIndicatorDirective {
    public static ngTemplateContextGuard(_directive: IgxHeaderExpandedIndicatorDirective,
        context: unknown): context is IgxGridTemplateContext {
        return true
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxHeaderCollapsedIndicator]',
    standalone: true
})
export class IgxHeaderCollapsedIndicatorDirective {
    public static ngTemplateContextGuard(_directive: IgxHeaderCollapsedIndicatorDirective,
        context: unknown): context is IgxGridTemplateContext {
        return true
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxExcelStyleHeaderIcon]',
    standalone: true
})
export class IgxExcelStyleHeaderIconDirective {
    public static ngTemplateContextGuard(_directive: IgxExcelStyleHeaderIconDirective,
        context: unknown): context is IgxGridHeaderTemplateContext {
        return true
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxSortHeaderIcon]',
    standalone: true
})
export class IgxSortHeaderIconDirective {
    public static ngTemplateContextGuard(_directive: IgxSortHeaderIconDirective,
        context: unknown): context is IgxGridHeaderTemplateContext {
        return true
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxSortAscendingHeaderIcon]',
    standalone: true
})
export class IgxSortAscendingHeaderIconDirective {
    public static ngTemplateContextGuard(_directive: IgxSortAscendingHeaderIconDirective,
        context: unknown): context is IgxGridHeaderTemplateContext {
        return true
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxSortDescendingHeaderIcon]',
    standalone: true
})
export class IgxSortDescendingHeaderIconDirective {
    public static ngTemplateContextGuard(_directive: IgxSortDescendingHeaderIconDirective,
        context: unknown): context is IgxGridHeaderTemplateContext {
        return true
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxGroupAreaDrop]',
    standalone: true
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

    public override onDragEnter(event) {
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

    public override onDragLeave(event) {
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
