import { DOCUMENT, DatePipe, DecimalPipe } from '@angular/common';
import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    Inject,
    Injectable,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    Pipe,
    PipeTransform,
    Renderer2,
    TemplateRef,
    LOCALE_ID,
    AfterViewInit,
    HostListener,
    ViewContainerRef
} from '@angular/core';
import { animationFrameScheduler, fromEvent, interval, Subject, Subscription } from 'rxjs';
import { map, switchMap, takeUntil, throttle, debounceTime } from 'rxjs/operators';
import { IgxColumnComponent } from './column.component';
import { IgxDragDirective, IgxDropDirective } from '../directives/drag-drop/drag-drop.directive';
import { IgxGridForOfDirective } from '../directives/for-of/for_of.directive';
import { ConnectedPositioningStrategy } from '../services';
import { VerticalAlignment, PositionSettings } from '../services/overlay/utilities';
import { scaleInVerBottom, scaleInVerTop } from '../animations/main';
import { KEYS } from '../core/utils';
import { IgxColumnResizingService } from './grid-column-resizing.service';
import { IgxForOfSyncService } from '../directives/for-of/for_of.sync.service';

const DEFAULT_DATE_FORMAT = 'mediumDate';
const DEBOUNCE_TIME = 200;

/**
 * @hidden
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
                    debounceTime(DEBOUNCE_TIME),
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
                debounceTime(DEBOUNCE_TIME),
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


/**
 * @hidden
 */
@Directive({
    selector: '[igxResizer]'
})
export class IgxColumnResizerDirective implements OnInit, OnDestroy {

    @Input()
    public restrictHResizeMin: number = Number.MIN_SAFE_INTEGER;

    @Input()
    public restrictHResizeMax: number = Number.MAX_SAFE_INTEGER;

    @Output()
    public resizeEnd = new Subject<any>();

    @Output()
    public resizeStart = new Subject<any>();

    @Output()
    public resize = new Subject<any>();

    private _left;
    private _destroy = new Subject<boolean>();

    constructor(public element: ElementRef, @Inject(DOCUMENT) public document, public zone: NgZone) {

        this.resizeStart.pipe(
            map((event) => event.clientX),
            takeUntil(this._destroy),
            switchMap((offset) => this.resize.pipe(
                map((event) => event.clientX - offset),
                takeUntil(this.resizeEnd),
                takeUntil(this._destroy)
            ))
        ).subscribe((pos) => {

            const left = this._left + pos;

            const min = this._left - this.restrictHResizeMin;
            const max = this._left + this.restrictHResizeMax;

            this.left = left < min ? min : left;

            if (left > max) {
                this.left = max;
            }
        });

    }

    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView, 'mousemove').pipe(
                throttle(() => interval(0, animationFrameScheduler)),
                takeUntil(this._destroy)
            ).subscribe((res) => this.onMousemove(res));

            fromEvent(this.document.defaultView, 'mouseup').pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onMouseup(res));
        });
    }

    ngOnDestroy() {
        this._destroy.next(true);
        this._destroy.complete();
    }

    public set left(val) {
        requestAnimationFrame(() => this.element.nativeElement.style.left = val + 'px');
    }

    public set top(val) {
        requestAnimationFrame(() => this.element.nativeElement.style.top = val + 'px');
    }

    onMouseup(event) {
        this.resizeEnd.next(event);
        this.resizeEnd.complete();
    }

    onMousedown(event) {
        event.preventDefault();
        const parent = this.element.nativeElement.parentElement.parentElement;

        this.left = this._left = event.clientX - parent.getBoundingClientRect().left;
        this.top = event.target.getBoundingClientRect().top - parent.getBoundingClientRect().top;

        this.resizeStart.next(event);
    }

    onMousemove(event) {
        event.preventDefault();
        this.resize.next(event);
    }
}

@Directive({
    selector: '[igxFilterCellTemplate]'
})
export class IgxFilterCellTemplateDirective {
    constructor(public template: TemplateRef<any>) {}
}

@Directive({
    selector: '[igxCell]'
})
export class IgxCellTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxHeader]'
})
export class IgxCellHeaderTemplateDirective {

    constructor(public template: TemplateRef<any>) { }

}
/**
 * @hidden
 */
@Directive({
    selector: '[igxFooter]'
})
export class IgxCellFooterTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxCellEditor]'
})
export class IgxCellEditorTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

/**
 * @hidden
 */
@Injectable({
    providedIn: 'root',
})
export class IgxColumnMovingService {
    private _icon: any;
    private _column: IgxColumnComponent;

    public cancelDrop: boolean;
    public isColumnMoving: boolean;

    get column(): IgxColumnComponent {
        return this._column;
    }
    set column(val: IgxColumnComponent) {
        if (val) {
            this._column = val;
        }
    }

    get icon(): any {
        return this._icon;
    }
    set icon(val: any) {
        if (val) {
            this._icon = val;
        }
    }
}

/**
 * @hidden
 */
export enum DropPosition {
    BeforeDropTarget,
    AfterDropTarget,
    None
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxColumnMovingDrag]'
})
export class IgxColumnMovingDragDirective extends IgxDragDirective implements OnDestroy {

    @Input('igxColumnMovingDrag')
    set data(val) {
        this._column = val;
    }

    get column() {
        return this._column;
    }

    get draggable(): boolean {
        return this.column && (this.column.movable || (this.column.groupable && !this.column.columnGroup));
    }

    public get icon(): HTMLElement {
        return this.cms.icon;
    }

    private subscription$: Subscription;
    private _column: IgxColumnComponent;
    private _ghostImageClass = 'igx-grid__drag-ghost-image';
    private dragGhostImgIconClass = 'igx-grid__drag-ghost-image-icon';
    private dragGhostImgIconGroupClass = 'igx-grid__drag-ghost-image-icon-group';

    constructor(
        _element: ElementRef,
        _viewContainer: ViewContainerRef,
        _zone: NgZone,
        _renderer: Renderer2,
        _cdr: ChangeDetectorRef,
        private cms: IgxColumnMovingService,
    ) {
        super(_cdr, _element, _viewContainer, _zone, _renderer);
    }

    public ngOnDestroy() {
        this._unsubscribe();
    }

    public onEscape(event) {
        this.cms.cancelDrop = true;
        this.onPointerUp(event);
    }

    public onPointerDown(event) {
        if (!this.draggable || event.target.getAttribute('draggable') === 'false') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        this._removeOnDestroy = false;
        this.cms.column = this.column;
        this.ghostImageClass = this._ghostImageClass;

        super.onPointerDown(event);

        this.cms.isColumnMoving = true;
        this.column.grid.cdr.detectChanges();

        const args = {
            source: this.column
        };
        this.column.grid.onColumnMovingStart.emit(args);

        this.subscription$ = fromEvent(this.column.grid.document.defaultView, 'keydown').subscribe((ev: KeyboardEvent) => {
            if (ev.key === KEYS.ESCAPE || ev.key === KEYS.ESCAPE_IE) {
                this.onEscape(ev);
            }
        });
    }

    public onPointerMove(event) {
        event.preventDefault();
        super.onPointerMove(event);

        if (this._dragStarted && this.dragGhost && !this.column.grid.draggedColumn) {
            this.column.grid.draggedColumn = this.column;
            this.column.grid.cdr.detectChanges();
        }

        if (this.cms.isColumnMoving) {
            const args = {
                source: this.column,
                cancel: false
            };
            this.column.grid.onColumnMoving.emit(args);

            if (args.cancel) {
                this.onEscape(event);
            }
        }
    }

    public onPointerUp(event) {
        // Run it explicitly inside the zone because sometimes onPointerUp executes after the code below.
        this.zone.run(() => {
            super.onPointerUp(event);

            this.cms.isColumnMoving = false;
            this.column.grid.draggedColumn = null;
            this.column.grid.cdr.detectChanges();
        });

        this._unsubscribe();
    }

    protected createDragGhost(event) {
        super.createDragGhost(event);

        let pageX, pageY;
        if (this.pointerEventsEnabled || !this.touchEventsEnabled) {
            pageX = event.pageX;
            pageY = event.pageY;
        } else {
            pageX = event.touches[0].pageX;
            pageY = event.touches[0].pageY;
        }

        this.dragGhost.style.height = null;
        this.dragGhost.style.minWidth = null;
        this.dragGhost.style.flexBasis = null;
        this.dragGhost.style.position = null;

        const icon = document.createElement('i');
        const text = document.createTextNode('block');
        icon.appendChild(text);

        icon.classList.add('material-icons');
        this.cms.icon = icon;

        const hostElemLeft = this.dragGhostHost ? this.dragGhostHost.getBoundingClientRect().left : 0;
        const hostElemTop = this.dragGhostHost ? this.dragGhostHost.getBoundingClientRect().top : 0;

        if (!this.column.columnGroup) {
            this.renderer.addClass(icon, this.dragGhostImgIconClass);

            this.dragGhost.insertBefore(icon, this.dragGhost.firstElementChild);

            this.ghostLeft = this._ghostStartX = pageX - ((this.dragGhost.getBoundingClientRect().width / 3) * 2) - hostElemLeft;
            this.ghostTop = this._ghostStartY = pageY - ((this.dragGhost.getBoundingClientRect().height / 3) * 2) - hostElemTop;
        } else {
            this.dragGhost.insertBefore(icon, this.dragGhost.childNodes[0]);

            this.renderer.addClass(icon, this.dragGhostImgIconGroupClass);
            this.dragGhost.children[0].style.paddingLeft = '0px';

            this.ghostLeft = this._ghostStartX = pageX - ((this.dragGhost.getBoundingClientRect().width / 3) * 2) - hostElemLeft;
            this.ghostTop = this._ghostStartY = pageY - ((this.dragGhost.getBoundingClientRect().height / 3) * 2) - hostElemTop;
        }
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
    selector: '[igxColumnMovingDrop]'
})
export class IgxColumnMovingDropDirective extends IgxDropDirective implements OnDestroy {
    @Input('igxColumnMovingDrop')
    set data(val: any) {
        if (val instanceof IgxColumnComponent) {
            this._column = val;
        }

        if (val instanceof IgxGridForOfDirective) {
            this._hVirtDir = val;
        }
    }

    get column(): IgxColumnComponent {
        return this._column;
    }

    get isDropTarget(): boolean {
        return this._column && this._column.grid.hasMovableColumns && this.cms.column.movable &&
            ((!this._column.pinned && this.cms.column.disablePinning) || !this.cms.column.disablePinning);
    }

    get horizontalScroll(): any {
        if (this._hVirtDir) {
            return this._hVirtDir;
        }
    }

    private _dropPos: DropPosition;
    private _dropIndicator: any = null;
    private _lastDropIndicator: any = null;
    private _column: IgxColumnComponent;
    private _hVirtDir: IgxGridForOfDirective<any>;
    private _dragLeave = new Subject<boolean>();
    private _dropIndicatorClass = 'igx-grid__th-drop-indicator--active';

    constructor(private elementRef: ElementRef, private renderer: Renderer2, private zone: NgZone, private cms: IgxColumnMovingService) {
        super(elementRef, renderer, zone);
    }

    public ngOnDestroy() {
        this._dragLeave.next(true);
        this._dragLeave.complete();
    }

    public onDragOver(event) {
        const drag = event.detail.owner;
        if (!(drag instanceof IgxColumnMovingDragDirective)) {
            return;
        }

        if (this.isDropTarget &&
            this.cms.column !== this.column &&
            this.cms.column.level === this.column.level &&
            this.cms.column.parent === this.column.parent) {

            if (this._lastDropIndicator) {
                this.renderer.removeClass(this._dropIndicator, this._dropIndicatorClass);
            }

            const clientRect = this.elementRef.nativeElement.getBoundingClientRect();
            const pos = clientRect.left + clientRect.width / 2;

            const parent = this.elementRef.nativeElement.parentElement;
            if (event.detail.pageX < pos) {
                this._dropPos = DropPosition.BeforeDropTarget;
                this._lastDropIndicator = this._dropIndicator = parent.firstElementChild;
            } else {
                this._dropPos = DropPosition.AfterDropTarget;
                this._lastDropIndicator = this._dropIndicator = parent.lastElementChild;
            }

            if (this.cms.icon.innerText !== 'block') {
                this.renderer.addClass(this._dropIndicator, this._dropIndicatorClass);
            }
        }
    }

    public onDragEnter(event) {
        const drag = event.detail.owner;
        if (!(drag instanceof IgxColumnMovingDragDirective)) {
            return;
        }

        if (this.column && this.cms.column.grid.id !== this.column.grid.id) {
            this.cms.icon.innerText = 'block';
            return;
        }

        if (this.isDropTarget &&
            this.cms.column !== this.column &&
            this.cms.column.level === this.column.level &&
            this.cms.column.parent === this.column.parent) {

                if (!this.column.pinned || (this.column.pinned && this.cms.column.pinned)) {
                    this.cms.icon.innerText = 'swap_horiz';
                }

                if (!this.cms.column.pinned && this.column.pinned) {
                    const nextPinnedWidth = this.column.grid.getPinnedWidth(true) + parseFloat(this.cms.column.width);

                    if (nextPinnedWidth <= this.column.grid.calcPinnedContainerMaxWidth) {
                        this.cms.icon.innerText = 'lock';
                    } else {
                        this.cms.icon.innerText = 'block';
                    }
                }
            } else {
                this.cms.icon.innerText = 'block';
            }

            if (this.horizontalScroll) {
                this.cms.icon.innerText = event.target.id === 'right' ? 'arrow_forward' : 'arrow_back';

                interval(100).pipe(takeUntil(this._dragLeave)).subscribe(() => {
                    this.cms.column.grid.wheelHandler();
                    event.target.id === 'right' ? this.horizontalScroll.getHorizontalScroll().scrollLeft += 15 :
                        this.horizontalScroll.getHorizontalScroll().scrollLeft -= 15;
                });
            }
    }

    public onDragLeave(event) {
        const drag = event.detail.owner;
        if (!(drag instanceof IgxColumnMovingDragDirective)) {
            return;
        }

        this.cms.icon.innerText = 'block';

        if (this._dropIndicator) {
            this.renderer.removeClass(this._dropIndicator, this._dropIndicatorClass);
        }

        if (this.horizontalScroll) {
            this._dragLeave.next(true);
        }
    }

    public onDragDrop(event) {
        event.preventDefault();
        const drag = event.detail.owner;
        if (!(drag instanceof IgxColumnMovingDragDirective)) {
            return;
        }

        if (this.column && (this.cms.column.grid.id !== this.column.grid.id)) {
            return;
        }

        if (this.horizontalScroll) {
            this._dragLeave.next(true);
        }

        if (this.isDropTarget) {
            const args = {
                source: this.cms.column,
                target: this.column
            };

            let nextPinnedWidth;
            if (this.column.pinned && !this.cms.column.pinned) {
                nextPinnedWidth = this.column.grid.getPinnedWidth(true) + parseFloat(this.cms.column.width);
            }

            if ((nextPinnedWidth && nextPinnedWidth > this.column.grid.calcPinnedContainerMaxWidth) ||
                this.column.level !== this.cms.column.level ||
                this.column.parent !== this.cms.column.parent ||
                this.cms.cancelDrop) {
                    this.cms.cancelDrop = false;
                    this.column.grid.onColumnMovingEnd.emit(args);
                    return;
            }

            this.column.grid.moveColumn(this.cms.column, this.column, this._dropPos);

            this.column.grid.draggedColumn = null;
            this.column.grid.cdr.detectChanges();
        }
    }
}
@Directive({
    selector: '[igxGridBody]',
    providers: [IgxForOfSyncService]
})
export class IgxGridBodyDirective {}

/**
 *@hidden
 */
@Pipe({
    name: 'igxdate'
})
export class IgxDatePipeComponent extends DatePipe implements PipeTransform {
    constructor(@Inject(LOCALE_ID) locale: string) {
        // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
        super(locale);
    }
    transform(value: any, locale: string): string {
        if (value && value instanceof Date) {
            if (locale) {
                return super.transform(value, DEFAULT_DATE_FORMAT, undefined, locale);
            } else {
                return super.transform(value);
            }
        } else {
            return value;
        }
    }
}
/**
 *@hidden
 */
@Pipe({
    name: 'igxdecimal'
})
export class IgxDecimalPipeComponent extends DecimalPipe implements PipeTransform {
    constructor(@Inject(LOCALE_ID) locale: string) {
        // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
        super(locale);
    }
    transform(value: any, locale: string): string {
        if (value && typeof value === 'number') {
            if (locale) {
                return super.transform(value, undefined, locale);
            } else {
                return super.transform(value);
            }
        } else {
            return value;
        }
    }
}

/**
 * @hidden
 */
export interface ContainerPositionSettings extends PositionSettings {
    container?: HTMLElement;
}

/**
 * @hidden
 */
export class ContainerPositioningStrategy extends ConnectedPositioningStrategy {
    isTop = false;
    isTopInitialPosition = null;
    public settings: ContainerPositionSettings;
    position(contentElement: HTMLElement, size: { width: number, height: number }, document?: Document, initialCall?: boolean): void {
        const container = this.settings.container; // grid.tbody
        const target = <HTMLElement>this.settings.target; // current grid.row

        // Position of the overlay depends on the available space in the grid.
        // If the bottom space is not enough then the the row overlay will show at the top of the row.
        // Once shown, either top or bottom, then this position stays until the overlay is closed (isTopInitialPosition property),
        // which means that when scrolling then overlay may hide, while the row is still visible (UX requirement).
        this.isTop = this.isTopInitialPosition !== null ?
            this.isTopInitialPosition :
            container.getBoundingClientRect().bottom <
                target.getBoundingClientRect().bottom + contentElement.getBoundingClientRect().height;

        // Set width of the row editing overlay to equal row width, otherwise it fits 100% of the grid.
        contentElement.style.width = target.clientWidth + 'px';
        this.settings.verticalStartPoint = this.settings.verticalDirection = this.isTop ? VerticalAlignment.Top : VerticalAlignment.Bottom;
        this.settings.openAnimation = this.isTop ? scaleInVerBottom : scaleInVerTop;

        super.position(contentElement, { width: target.clientWidth, height: target.clientHeight }, document, initialCall);
    }
}
