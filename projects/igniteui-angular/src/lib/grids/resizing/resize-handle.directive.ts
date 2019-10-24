import {
    AfterViewInit,
    Directive,
    ElementRef,
    Input,
    NgZone,
    HostListener,
    OnDestroy
} from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, takeUntil} from 'rxjs/operators';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxColumnResizingService } from './resizing.service';


/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxResizeHandle]'
})
export class IgxResizeHandleDirective implements AfterViewInit, OnDestroy {

    /**
     * @hidden
     */
    @Input('igxResizeHandle')
    public column: IgxColumnComponent;

    /**
     * @hidden
     */
    private _dblClick = false;

    /**
     * @hidden
     */
    private destroy$ = new Subject<boolean>();

    private readonly DEBOUNCE_TIME = 200;

    constructor(private zone: NgZone,
               private element: ElementRef,
               public colResizingService: IgxColumnResizingService) { }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        if (!this.column.columnGroup && this.column.resizable) {
            this.zone.runOutsideAngular(() => {
                fromEvent(this.element.nativeElement, 'mousedown').pipe(
                    debounceTime(this.DEBOUNCE_TIME),
                    takeUntil(this.destroy$)
                ).subscribe((event: MouseEvent) => {

                    if (this._dblClick) {
                        this._dblClick = false;
                        return;
                    }

                    if (event.button === 0) {
                        this._onResizeAreaMouseDown(event);
                        this.column.grid.resizeLine.resizer.onMousedown(event);
                    }
                });
            });

            fromEvent(this.element.nativeElement, 'mouseup').pipe(
                debounceTime(this.DEBOUNCE_TIME),
                takeUntil(this.destroy$)
            ).subscribe(() => {
                this.colResizingService.isColumnResizing = false;
                this.colResizingService.showResizer = false;
                this.column.grid.cdr.detectChanges();
            });
        }
    }

    /**
     * @hidden
     */
    @HostListener('mouseover')
    public onMouseOver() {
        this.colResizingService.resizeCursor = 'col-resize';
    }

    /**
     * @hidden
     */
    @HostListener('dblclick')
    public onDoubleClick() {
        this._dblClick = true;
        this.colResizingService.column = this.column;
        this.colResizingService.autosizeColumnOnDblClick();
    }

    /**
     * @hidden
     */
    private _onResizeAreaMouseDown(event) {
        this.colResizingService.column = this.column;
        this.colResizingService.isColumnResizing = true;
        this.colResizingService.startResizePos = event.clientX;

        this.colResizingService.showResizer = true;
        this.column.grid.cdr.detectChanges();
    }
}

