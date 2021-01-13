import { IgxGridActionButtonComponent } from './grid-action-button.component';
import { Directive, Input, AfterViewInit, QueryList, ViewChildren, IterableDiffers } from '@angular/core';
import { IgxActionStripComponent } from '../action-strip.component';
import { IgxRowDirective } from '../../grids/row.directive';
import { IgxIconService } from '../../icon/icon.service';

@Directive({
    selector: '[igxGridActionsBase]'
})
export class IgxGridActionsBaseDirective implements AfterViewInit {
    @ViewChildren(IgxGridActionButtonComponent)
    public buttons: QueryList<IgxGridActionButtonComponent>;

    /**
     * Gets/Sets if the action buttons will be rendered as menu items. When in menu, items will be rendered with text label.
     *
     * @example
     * ```html
     *  <igx-grid-pinning-actions [asMenuItems]='true'></igx-grid-pinning-actions>
     *  <igx-grid-editing-actions [asMenuItems]='true'></igx-grid-editing-actions>
     * ```
     */
    @Input()
    asMenuItems = false;

    public strip: IgxActionStripComponent;

    /**
     * @hidden
     * @internal
     */
    get grid() {
        return this.strip.context.grid;
    }

    /**
     * Getter to be used in template
     *
     * @hidden
     * @internal
     */
    get isRowContext(): boolean {
        return this.isRow(this.strip.context) && !this.strip.context.inEditMode;
    }

    constructor(protected iconService: IgxIconService,
                protected differs: IterableDiffers) { }

    /**
     * @hidden
     * @internal
     */
    ngAfterViewInit() {
        if (this.asMenuItems) {
                this.buttons.changes.subscribe((change: QueryList<IgxGridActionButtonComponent>) => {
                        this.strip.cdr.detectChanges();
                });
        }
    }

    /**
     * Check if the param is a row from a grid
     *
     * @hidden
     * @internal
     * @param context
     */
    protected isRow(context): context is IgxRowDirective<any> {
        return context && context instanceof IgxRowDirective;
    }
}
