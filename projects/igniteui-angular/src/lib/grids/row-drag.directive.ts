import { Directive, Input, OnDestroy, NgModule, Output, EventEmitter } from '@angular/core';
import { IgxDragDirective } from '../directives/dragdrop/dragdrop.directive';
import { IRowDragStartEventArgs } from './grid-base.component';

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowDrag]'
})
export class IgxRowDragDirective extends IgxDragDirective implements OnDestroy {
    private _row;

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
