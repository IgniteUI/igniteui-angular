import { Directive, Input, OnDestroy, NgModule } from '@angular/core';
import { IgxDragDirective } from '../directives/dragdrop/dragdrop.directive';
import { IRowDragEndEventArgs, IRowDragStartEventArgs } from './grid-base.component';
import { KEYS } from '../core/utils';
import { fromEvent, Subscription } from 'rxjs';
import { IgxRowComponent, IgxGridBaseComponent, IGridDataBindable } from './grid';


const ghostBackgroundClass = 'igx-grid__tr--ghost';
const draggedRowClass = 'igx-grid__tr--drag';

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowDrag]'
})
export class IgxRowDragDirective extends IgxDragDirective implements OnDestroy {
    private row: IgxRowComponent<IgxGridBaseComponent & IGridDataBindable>;
    private subscription$: Subscription;
    public startDrag(event) {
        this.onPointerDown(event);
    }

    @Input('igxRowDrag')
    set data(val) {
        this.row = val;
    }

    get data() {
        return this.row;
    }

    public onPointerDown(event) {
        event.preventDefault();
        super.onPointerDown(event);

        const args: IRowDragStartEventArgs = {
            owner: this,
            dragData: this.row,
            cancel: false
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
        super.onPointerUp(event);
        this.row.dragging = false;
        this.row.grid.rowDragging = false;

        const args: IRowDragEndEventArgs = {
            owner: this,
            dragData: this.row
        };
        this.zone.run(() => {
            this.row.grid.onRowDragEnd.emit(args);
        });
        this._unsubscribe();
    }

    protected createDragGhost(event) {
        super.createDragGhost(event, this.row.nativeElement);

        const gridWidth = this.row.grid.nativeElement.style.width;

        this._dragGhost.style.overflow = 'hidden';
        this._dragGhost.style.width = gridWidth;
        this.renderer.removeClass(this._dragGhost, this.row.grid.oddRowCSS);
        this.renderer.removeClass(this._dragGhost, this.row.grid.evenRowCSS);
        this.renderer.removeClass(this._dragGhost, draggedRowClass);
        this.renderer.addClass(this._dragGhost, ghostBackgroundClass);
    }

    private _unsubscribe() {
        if (this.subscription$) {
            this.subscription$.unsubscribe();
            this.subscription$ = null;
        }
    }

    /**
     * @hidden
     */
    ngOnInit() {
        this.animateOnRelease = true;
        super.ngOnInit();
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
