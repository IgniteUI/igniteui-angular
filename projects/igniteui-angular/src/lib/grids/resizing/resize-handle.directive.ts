import {
    AfterViewInit,
    Directive,
    ElementRef,
    Input,
    NgZone,
    HostListener,
    inject,
    DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import type { ColumnType } from '../common/grid.interface';
import { IgxColumnResizingService } from './resizing.service';


/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxResizeHandle]',
    standalone: true
})
export class IgxResizeHandleDirective implements AfterViewInit {
    private _ref: ElementRef<HTMLElement> = inject(ElementRef);
    private destroyRef = inject(DestroyRef);
    protected zone = inject(NgZone);
    protected colResizingService = inject(IgxColumnResizingService);

    private readonly DEBOUNCE_TIME = 200;

    protected get element() {
        return this._ref.nativeElement;
    }

    /**
     * @hidden
     */
    @Input('igxResizeHandle')
    public column: ColumnType;




    /**
     * @hidden
     */
    @HostListener('dblclick')
    public onDoubleClick() {
        this.initResizeService();
        this.colResizingService.autosizeColumnOnDblClick();
    }



    /**
     * @hidden
     */
    public ngAfterViewInit() {
        if (!this.column.columnGroup && this.column.resizable) {
            this.zone.runOutsideAngular(() => {
                fromEvent<PointerEvent>(this.element, 'pointerdown').pipe(
                    takeUntilDestroyed(this.destroyRef),
                    filter((event) => event.button === 0)
                ).subscribe((event) => this.onPointerDown(event));

                fromEvent(this.element, 'pointerup').pipe(
                    takeUntilDestroyed(this.destroyRef),
                    debounceTime(this.DEBOUNCE_TIME),
                ).subscribe((event: PointerEvent) => this.onPointerUp(event));
            });
        }
    }

    protected onPointerDown(event: PointerEvent) {
        this.element.setPointerCapture(event.pointerId);
        this._onResizeAreaMouseDown(event);
        this.column.grid.resizeLine.resizer.onPointerDown(event);
    }

    protected onPointerUp(event: PointerEvent) {
        this.element.releasePointerCapture(event.pointerId);
        this.colResizingService.isColumnResizing = false;
        this.colResizingService.showResizer = false;
        this.column.grid.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    private _onResizeAreaMouseDown(event?: PointerEvent) {
        this.initResizeService(event);

        this.colResizingService.showResizer = true;
        this.column.grid.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    protected initResizeService(event?: PointerEvent) {
        this.colResizingService.column = this.column;

        if (event) {
            this.colResizingService.isColumnResizing = true;
            this.colResizingService.startResizePos = event.clientX;
        }
    }
}
