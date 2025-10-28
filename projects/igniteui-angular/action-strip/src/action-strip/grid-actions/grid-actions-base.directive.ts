import { IgxGridActionButtonComponent } from './grid-action-button.component';
import { Directive, Input, AfterViewInit, QueryList, ViewChildren, IterableDiffers, booleanAttribute } from '@angular/core';
import { IgxActionStripComponent } from '../action-strip.component';
import { IgxIconService } from 'igniteui-angular/icon';

// Stub interface to avoid circular dependency with grids
// The actual IgxRowDirective is imported at runtime
interface IgxRowDirectiveStub {
    grid?: any;
    inEditMode?: boolean;
}

/* blazorElement */
/* contentParent: ActionStrip */
/* wcElementTag: igc-grid-action-base-directive */
/* jsonAPIManageCollectionInMarkup */
/* blazorIndirectRender */
@Directive({
    selector: '[igxGridActionsBase]',
    standalone: true
})
export class IgxGridActionsBaseDirective implements AfterViewInit {
    /** @hidden @internal **/
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
    @Input({ transform: booleanAttribute })
    public asMenuItems = false;

    /** @hidden @internal **/
    public strip: IgxActionStripComponent;

    /**
     * @hidden
     * @internal
     */
    public get grid() {
        return this.strip.context.grid;
    }

    /**
     * Getter to be used in template
     *
     * @hidden
     * @internal
     */
    public get isRowContext(): boolean {
        return this.isRow(this.strip?.context) && !this.strip.context.inEditMode;
    }

    constructor(protected iconService: IgxIconService,
        protected differs: IterableDiffers) { }

    /**
     * @hidden
     * @internal
     */
    public ngAfterViewInit() {
        if (this.asMenuItems) {
            this.buttons.changes.subscribe(() => {
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
    protected isRow(context): context is IgxRowDirectiveStub {
        // Check if context has grid property and constructor name contains 'Row'
        // This avoids importing IgxRowDirective directly which would create circular dependency
        return context && context.grid && context.constructor.name.includes('Row');
    }
}
