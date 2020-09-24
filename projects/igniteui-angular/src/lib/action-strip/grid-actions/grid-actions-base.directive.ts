import { IgxGridActionButtonComponent } from './grid-action-button.component';
import { Directive, Inject, Input, AfterViewInit, QueryList, TemplateRef, ViewChildren, OnInit, IterableDiffers, IterableChangeRecord } from '@angular/core';
import { IgxActionStripComponent } from '../action-strip.component';
import { IgxRowDirective } from '../../grids/public_api';
import { IgxGridIconService } from '../../grids/common/grid-icon.service';

@Directive({
    selector: '[igxGridActionsBase]'
})
export class IgxGridActionsBaseDirective implements AfterViewInit, OnInit {
    constructor(
        @Inject(IgxActionStripComponent) protected strip: IgxActionStripComponent,
        protected iconService: IgxGridIconService,
        protected differs: IterableDiffers) { }
    private actionButtonsDiffer;
    @ViewChildren(IgxGridActionButtonComponent) public buttons: QueryList<IgxGridActionButtonComponent>;

    /**
     * Gets/Sets if the action buttons will be rendered as menu items. When in menu, items will be rendered with text label.
     * @example
     * ```html
     *  <igx-grid-pinning-actions [asMenuItems]='true'></igx-grid-pinning-actions>
     *  <igx-grid-editing-actions [asMenuItems]='true'></igx-grid-editing-actions>
     * ```
     */
    @Input()
    asMenuItems = false;

    /**
     * @hidden
     * @internal
     */
    ngOnInit() {
        this.actionButtonsDiffer = this.differs.find([]).create(null);
    }

    /**
     * @hidden
     * @internal
     */
    ngAfterViewInit() {
        if (this.asMenuItems) {
            this.buttons.changes.subscribe((change: QueryList<IgxGridActionButtonComponent>) => {
                const diff = this.actionButtonsDiffer.diff(change);
                if (diff) {
                    diff.forEachAddedItem((record: IterableChangeRecord<IgxGridActionButtonComponent>) => {
                        this.strip.menuItems.push(record.item);
                    });
                    diff.forEachRemovedItem((record: IterableChangeRecord<IgxGridActionButtonComponent>) => {
                        const index = this.strip.menuItems.indexOf(record.item);
                        this.strip.menuItems.splice(index, 1);
                    });
                }
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
