import { takeUntil } from 'rxjs/operators';
import { IgxGridActionButtonComponent } from './grid-action-button.component';
import { Directive, Inject, Input, AfterViewInit, QueryList, ViewChildren,
     OnInit, IterableDiffers, IterableChangeRecord, OnDestroy } from '@angular/core';
import { IgxActionStripComponent } from '../action-strip.component';
import { IgxRowDirective } from '../../grids/public_api';
import { IgxIconService } from '../../icon/icon.service';
import { Subject } from 'rxjs';

@Directive({
    selector: '[igxGridActionsBase]'
})
export class IgxGridActionsBaseDirective implements AfterViewInit, OnInit, OnDestroy {
    constructor(
        @Inject(IgxActionStripComponent) protected strip: IgxActionStripComponent,
        protected iconService: IgxIconService,
        protected differs: IterableDiffers) { }

    private actionButtonsDiffer;
    protected destroy$ = new Subject<boolean>();

    @ViewChildren(IgxGridActionButtonComponent)
    public buttons: QueryList<IgxGridActionButtonComponent>;

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
    get grid() {
        return this.strip.context.grid;
    }

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
                    this.strip.cdr.detectChanges();
                }
            });

            // on drop-down selection, trigger click action on related button.
            this.strip.menu.onSelection.pipe(takeUntil(this.destroy$)).subscribe(($event) => {
               const newSelection = ($event.newSelection as any).elementRef.nativeElement;
               const button = this.buttons.find(x => newSelection.contains(x.container.nativeElement));
               if (button) {
                    button.onActionClick.emit();
               }
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
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
