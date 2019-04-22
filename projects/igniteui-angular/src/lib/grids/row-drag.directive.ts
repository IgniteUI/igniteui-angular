import { Directive, Input, OnDestroy, NgModule, Output, EventEmitter } from '@angular/core';
import { IgxDragDirective, IgxDragCustomEventDetails } from '../directives/dragdrop/dragdrop.directive';
import { IRowDragEndEventArgs, IRowDragStartEventArgs } from './grid-base.component';
import { KEYS } from '../core/utils';
import { fromEvent, Subscription } from 'rxjs';
import { IgxRowComponent, IgxGridBaseComponent, IGridDataBindable } from './grid';

const ghostBackgrounClass = 'igx-grid__tr--ghost';
const draggedRowClass = 'igx-grid__tr--drag';

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowDrag]'
})
export class IgxRowDragDirective extends IgxDragDirective implements OnDestroy {
    private _row: IgxRowComponent<IgxGridBaseComponent & IGridDataBindable>;
    private subscription$: Subscription;

    @Input('igxRowDrag')
    set data(val) {
        this._row = val;
    }

    get row() {
        return this._row;
    }

    public onPointerDown(event) {
        event.preventDefault();
        super.onPointerDown(event);

        const args: IRowDragStartEventArgs = {
            source: this.row
        };

        this.row.grid.onRowDragStart.emit(args);
        this.row.dragging = true;
        this.row.grid.rowDragging = true;

        this.subscription$ = fromEvent(this.row.grid.document.defaultView, 'keydown').subscribe((ev: KeyboardEvent) => {
            if (ev.key === KEYS.ESCAPE || ev.key === KEYS.ESCAPE_IE) {
                this.onPointerUp(event);
            }
        });
    }

    public onPointerUp(event) {
        // Run it explicitly inside the zone because sometimes onPointerUp executes after the code below.
        this.zone.run(() => {
            const isOnDroppadble = this._lastDropArea;
            super.onPointerUp(event);
            this.row.dragging = false;
            this.row.grid.rowDragging = false;

            if (isOnDroppadble) {
                const args: IRowDragEndEventArgs = {
                    source: this.row,
                    cancel: false
                };
                this.row.grid.onRowDragEnd.emit(args);
            } else {
                this.row.grid.cdr.detectChanges();
            }
        });

        this._unsubscribe();
    }


    protected createDragGhost(event) {
        super.createDragGhost(event, this._row.nativeElement);

        const gridWidth = this.row.grid.nativeElement.style.width;

        this._dragGhost.style.overflow = 'hidden';
        this._dragGhost.style.width = gridWidth;
        this.renderer.removeClass(this._dragGhost, this.row.grid.oddRowCSS);
        this.renderer.removeClass(this._dragGhost, this.row.grid.evenRowCSS);
        this.renderer.removeClass(this._dragGhost, draggedRowClass);
        this.renderer.addClass(this._dragGhost, ghostBackgrounClass);
    }

    protected dispatchDropEvent(pageX: number, pageY: number) {

        // TODO: This should be investigated if it is needed
        const eventArgs: IgxDragCustomEventDetails = {
            startX: this._startX,
            startY: this._startY,
            pageX: pageX,
            pageY: pageY,
            owner: this
        };
        this.dispatchEvent(this._lastDropArea, 'igxDragLeave', eventArgs);
        this._lastDropArea = null;
    }

    private _unsubscribe() {
        if (this.subscription$) {
            this.subscription$.unsubscribe();
            this.subscription$ = null;
        }
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxDragIndicatorIcon]'
})

export class IgxDragIndicatorIconDirective {
}

@NgModule({
    declarations: [IgxRowDragDirective, IgxDragIndicatorIconDirective],
    entryComponents: [],
    exports: [IgxRowDragDirective, IgxDragIndicatorIconDirective],
    imports: []
})

export class IgxRowDragModule {
}
