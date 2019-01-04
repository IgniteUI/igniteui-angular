import { DOCUMENT, DatePipe, DecimalPipe } from '@angular/common';
import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    HostListener,
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
    LOCALE_ID
} from '@angular/core';
import { animationFrameScheduler, fromEvent, interval, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil, throttle } from 'rxjs/operators';
import { IgxColumnComponent } from './column.component';
import { IgxDragDirective, IgxDropDirective } from '../directives/dragdrop/dragdrop.directive';
import { IgxGridForOfDirective } from '../directives/for-of/for_of.directive';
import { ConnectedPositioningStrategy } from '../services';
import { getPointFromPositionsSettings, VerticalAlignment, PositionSettings } from '../services/overlay/utilities';
import { scaleInVerBottom, scaleInVerTop } from '../animations/main';

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

    @Input()
    public resizeEndTimeout = 0;

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

            this.left = left < this.restrictHResizeMin ? this.restrictHResizeMin + 'px' : left + 'px';

            if (left > this.restrictHResizeMax) {
                this.left = this.restrictHResizeMax + 'px';
            } else if (left > this.restrictHResizeMin) {
                this.left = left + 'px';
            }
        });

    }

    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView, 'mousedown').pipe(takeUntil(this._destroy))
                .subscribe((res) => this.onMousedown(res));

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
        this._destroy.unsubscribe();
    }

    public set left(val) {
        requestAnimationFrame(() => this.element.nativeElement.style.left = val);
    }

    onMouseup(event) {
        setTimeout(() => {
            this.resizeEnd.next(event);
            this.resizeEnd.complete();
        }, this.resizeEndTimeout);
    }

    onMousedown(event) {
        this.resizeStart.next(event);
        event.preventDefault();

        const elStyle = this.document.defaultView.getComputedStyle(this.element.nativeElement);
        this._left = Number.isNaN(parseInt(elStyle.left, 10)) ? 0 : parseInt(elStyle.left, 10);
    }

    onMousemove(event) {
        this.resize.next(event);
        event.preventDefault();
    }
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

    public selection: {
        column: IgxColumnComponent,
        rowID: any
    };

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
export class IgxColumnMovingDragDirective extends IgxDragDirective {

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

    private _column: IgxColumnComponent;
    private _ghostImageClass = 'igx-grid__drag-ghost-image';
    private _dragGhostImgIconClass = 'igx-grid__drag-ghost-image-icon';
    private _dragGhostImgIconGroupClass = 'igx-grid__drag-ghost-image-icon-group';

    @HostListener('document:keydown.escape', ['$event'])
    public onEscape(event) {
        this.cms.cancelDrop = true;
        this.onPointerUp(event);
    }

    constructor(
        _element: ElementRef,
        _zone: NgZone,
        _renderer: Renderer2,
        _cdr: ChangeDetectorRef,
        private cms: IgxColumnMovingService,
    ) {
        super(_cdr, _element, _zone, _renderer);
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

        const currSelection = this.column.grid.selection.first_item(this.column.gridID + '-cell');
        if (currSelection) {
            this.cms.selection = {
                column: this.column.grid.columnList.toArray()[currSelection.columnID],
                rowID: currSelection.rowID
            };
        }

        const args = {
            source: this.column
        };
        this.column.grid.onColumnMovingStart.emit(args);
    }

    public onPointerMove(event) {
        event.preventDefault();
        super.onPointerMove(event);

        if (this._dragStarted && this._dragGhost && !this.column.grid.draggedColumn) {
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
    }

    protected createDragGhost(event) {
        const index = this.column.grid.hasMovableColumns ? 1 : 0;

        super.createDragGhost(event, this.element.nativeElement.children[index]);

        let pageX, pageY;
        if (this.pointerEventsEnabled || !this.touchEventsEnabled) {
            pageX = event.pageX;
            pageY = event.pageY;
        } else {
            pageX = event.touches[0].pageX;
            pageY = event.touches[0].pageY;
        }

        this._dragGhost.style.height = null;
        this._dragGhost.style.minWidth = null;
        this._dragGhost.style.flexBasis = null;
        this._dragGhost.style.position = null;

        const icon = document.createElement('i');
        const text = document.createTextNode('block');
        icon.appendChild(text);

        icon.classList.add('material-icons');
        this.cms.icon = icon;

        if (!this.column.columnGroup) {
            this.renderer.addClass(icon, this._dragGhostImgIconClass);

            this._dragGhost.insertBefore(icon, this._dragGhost.firstElementChild);

            this.left = this._dragStartX = pageX - ((this._dragGhost.getBoundingClientRect().width / 3) * 2);
            this.top = this._dragStartY = pageY - ((this._dragGhost.getBoundingClientRect().height / 3) * 2);
        } else {
            this._dragGhost.insertBefore(icon, this._dragGhost.childNodes[0]);

            this.renderer.addClass(icon, this._dragGhostImgIconGroupClass);
            this._dragGhost.children[0].style.paddingLeft = '0px';

            this.left = this._dragStartX = pageX - ((this._dragGhost.getBoundingClientRect().width / 3) * 2);
            this.top = this._dragStartY = pageY - ((this._dragGhost.getBoundingClientRect().height / 3) * 2);
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
        return this._column && this._column.grid.hasMovableColumns && this.cms.column.movable;
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
        if (this.isDropTarget &&
            this.cms.column !== this.column &&
            this.cms.column.level === this.column.level &&
            this.cms.column.parent === this.column.parent) {

            if (this._lastDropIndicator) {
                this.renderer.removeClass(this._dropIndicator, this._dropIndicatorClass);
            }

            const clientRect = this.elementRef.nativeElement.getBoundingClientRect();
            const pos = clientRect.left + clientRect.width / 2;

            if (event.detail.pageX < pos) {
                this._dropPos = DropPosition.BeforeDropTarget;
                this._lastDropIndicator = this._dropIndicator = this.elementRef.nativeElement.firstElementChild;
            } else {
                this._dropPos = DropPosition.AfterDropTarget;
                this._lastDropIndicator = this._dropIndicator = this.elementRef.nativeElement.lastElementChild;
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

                interval(100).pipe(takeUntil(this._dragLeave)).subscribe((val) => {
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

            if (this.cms.selection && this.cms.selection.column) {
                this.column.grid.selection.set(this.column.gridID + '-cell', new Set([{
                    rowID: this.cms.selection.rowID,
                    columnID: this.column.grid.columnList.toArray().indexOf(this.cms.selection.column)
                }]));

                const cell = this.column.grid.getCellByKey(this.cms.selection.rowID, this.cms.selection.column.field);

                if (cell) {
                    cell.nativeElement.focus();
                }
            }

            this.column.grid.draggedColumn = null;
            this.column.grid.cdr.detectChanges();
        }
    }
}

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
    transform(value: any): string {
        if (value && value instanceof Date) {
            return super.transform(value);
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
    transform(value: any): string {
        if (value && typeof value === 'number') {
            return super.transform(value);
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
        super.position(contentElement, { width: target.clientWidth, height: target.clientHeight }, document, initialCall);

        // Position of the overlay depends on the available space in the grid.
        // If the bottom space is not enough then the the row overlay will show at the top of the row.
        // Once shown, either top or bottom, then this position stays until the overlay is closed (isTopInitialPosition property),
        // which means that when scrolling then overlay may hide, while the row is still visible (UX requirement).
        this.isTop = this.isTopInitialPosition !== null ?
            this.isTopInitialPosition :
            container.clientHeight <
            target.offsetTop + target.getBoundingClientRect().height + contentElement.getBoundingClientRect().height;
        this.settings.verticalStartPoint = this.isTop ? VerticalAlignment.Top : VerticalAlignment.Bottom;
        this.settings.openAnimation = this.isTop ? scaleInVerBottom : scaleInVerTop;
        const startPoint = getPointFromPositionsSettings(this.settings, contentElement.parentElement);
        contentElement.style.top = startPoint.y + (this.isTop ? VerticalAlignment.Top : VerticalAlignment.Bottom) * size.height + 'px';
        contentElement.style.width = target.clientWidth + 'px';
    }
}
