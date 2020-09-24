import { Directive, Inject, Input, AfterViewInit, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { IgxActionStripComponent } from '../action-strip.component';
import { IgxRowDirective } from '../../grids/public_api';
import { IgxGridIconService } from '../../grids/common/grid-icon.service';

@Directive({
    selector: '[igxGridActionsBase]'
})
export class IgxGridActionsBaseDirective implements AfterViewInit {
    constructor(@Inject(IgxActionStripComponent) protected strip: IgxActionStripComponent, protected iconService: IgxGridIconService) { }

    @ViewChildren('button') public buttons: QueryList<TemplateRef<any>>;

    @Input()
    asMenuItems = true;

    /**
     * @hidden
     * @internal
     */
    ngAfterViewInit() {
        if (this.asMenuItems) {
            this.buttons.forEach(button => {
                this.strip.menuItems.push({ templateRef: button });
            });
        }
    }

    /**
     * Getter to be used in template
     * @hidden
     * @internal
     */
    get isRowContext(): boolean {
        return this.isRow(this.strip.context);
    }

    /**
     * Check if the param is a row from a grid
     * @hidden
     * @internal
     * @param context
     */
    protected isRow(context): context is IgxRowDirective<any> {
        return context && context instanceof IgxRowDirective;
    }
}
