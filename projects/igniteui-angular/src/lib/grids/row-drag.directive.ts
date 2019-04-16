import { Directive, Input, OnDestroy, NgModule, Output, EventEmitter } from '@angular/core';
import { IgxDragDirective } from '../directives/dragdrop/dragdrop.directive';
import { IRowDragStartEventArgs } from './grid-base.component';
import { KEYS } from '../core/utils';
import { fromEvent, Subscription } from 'rxjs';

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowDrag]'
})
export class IgxRowDragDirective extends IgxDragDirective implements OnDestroy {
    private _row;
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

        this.row.grid.onDragStart.emit(args);

        this.subscription$ = fromEvent(this.row.grid.document.defaultView, 'keydown').subscribe((ev: KeyboardEvent) => {
            if (ev.key === KEYS.ESCAPE || ev.key === KEYS.ESCAPE_IE) {
                this.onPointerUp(event);
            }
        });
    }

    protected createDragGhost(event) {
        super.createDragGhost(event);
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
