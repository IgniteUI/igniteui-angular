import { Directive, Input, OnDestroy, NgModule, Output, EventEmitter } from '@angular/core';
import { IgxDragDirective } from '../directives/dragdrop/dragdrop.directive';
import { IRowDragEndEventArgs, IRowDragStartEventArgs } from './grid-base.component';
import { KEYS } from '../core/utils';
import { fromEvent, Subscription } from 'rxjs';
import { IgxRowComponent, IgxGridBaseComponent, IGridDataBindable } from './grid';

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

        this.subscription$ = fromEvent(this.row.grid.document.defaultView, 'keydown').subscribe((ev: KeyboardEvent) => {
            if (ev.key === KEYS.ESCAPE || ev.key === KEYS.ESCAPE_IE) {
                this.onPointerUp(event);
            }
        });
    }

    public onPointerUp(event) {
        // Run it explicitly inside the zone because sometimes onPointerUp executes after the code below.
        this.zone.run(() => {
            this._clicked = false;
            super.onPointerUp(event);

            const args: IRowDragEndEventArgs = {
                source: this.row,
                cancel: false
            };
            this.row.grid.onRowDragEnd.emit(args);
            this._dragGhost.parentNode.removeChild(this._dragGhost);
            this._dragGhost = null;
        });

        this._unsubscribe();
    }


    protected createDragGhost(event) {
        super.createDragGhost(event, this._row.nativeElement);
    }

    private _unsubscribe() {
        if (this.subscription$) {
            this.subscription$.unsubscribe();
            this.subscription$ = null;
        }
    }
}

@NgModule({
    declarations: [IgxRowDragDirective],
    entryComponents: [],
    exports: [IgxRowDragDirective],
    imports: []
})

export class IgxRowDragModule {
}
