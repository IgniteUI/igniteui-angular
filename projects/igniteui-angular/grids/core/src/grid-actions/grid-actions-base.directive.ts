import { IgxGridActionButtonComponent } from './grid-action-button.component';
import { Directive, Input, AfterViewInit, ChangeDetectorRef, QueryList, ViewChildren, IterableDiffers, booleanAttribute, inject } from '@angular/core';
import { IgxIconService } from 'igniteui-angular/icon';
import { IgxRowDirective } from '../row.directive';
import { IgxActionStripToken } from 'igniteui-angular/core';

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
    protected iconService = inject(IgxIconService);
    protected differs = inject(IterableDiffers);
    private _cdr = inject(ChangeDetectorRef);
    private _strip!: IgxActionStripToken;

    /** @hidden @internal **/
    @ViewChildren(IgxGridActionButtonComponent)
    public buttons!: QueryList<IgxGridActionButtonComponent>;

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

    /**
     * The Action Strip this component renders its actions in.
     *
     * Assigned by the strip itself once it picks the component up in its content query, which
     * happens outside of change detection. The template reads the strip's `context` through
     * `isRowContext`, so this view has to be marked, both to render the actions for the current
     * context and so that the first refresh subscribes it to the strip's `context` signal.
     *
     * @hidden @internal
     **/
    public set strip(value: IgxActionStripToken) {
        this._strip = value;
        this._cdr.markForCheck();
    }

    public get strip(): IgxActionStripToken {
        return this._strip;
    }

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
    protected isRow(context: any): context is IgxRowDirective {
        return context && context instanceof IgxRowDirective;
    }
}
