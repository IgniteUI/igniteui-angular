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
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ColumnType } from '../common/grid.interface';
import { IgxColumnResizingService } from './resizing.service';


/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxResizeHandle]',
    standalone: true
})
export class IgxResizeHandleDirective implements AfterViewInit, OnDestroy {

    /**
     * @hidden
     */
    @Input('igxResizeHandle')
    public column: ColumnType;

    /**
     * @hidden
     */
    protected _dblClick = false;

    /**
     * @hidden
     */
    private destroy$ = new Subject<boolean>();

    private readonly DEBOUNCE_TIME = 200;

    constructor(protected zone: NgZone,
        protected element: ElementRef,
        public colResizingService: IgxColumnResizingService) { }

    /**
     * @hidden
     */
    @HostListener('dblclick')
    public onDoubleClick() {
        this._dblClick = true;
        this.initResizeService();
        this.colResizingService.autosizeColumnOnDblClick();
    }

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
    private _onResizeAreaMouseDown(event) {
        this.initResizeService(event);

        this.colResizingService.showResizer = true;
        this.column.grid.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    protected initResizeService(event = null) {
        this.colResizingService.column = this.column;

        if (event) {
            this.colResizingService.isColumnResizing = true;
            this.colResizingService.startResizePos = event.clientX;
        }
    }
}
