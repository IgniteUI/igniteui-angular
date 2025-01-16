import { Directive, OnDestroy, Input, ElementRef, ViewContainerRef, NgZone, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { IgxDragDirective } from '../../directives/drag-drop/drag-drop.directive';
import { Subscription, fromEvent, takeUntil } from 'rxjs';
import { PlatformUtil } from '../../core/utils';
import { IgxColumnMovingService } from './moving.service';
import { ColumnType } from '../common/grid.interface';

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxColumnMovingDrag]',
    standalone: true
})
export class IgxColumnMovingDragDirective extends IgxDragDirective implements OnDestroy {

    @Input('igxColumnMovingDrag')
    public column: ColumnType;

    public get draggable(): boolean {
        return this.column && (this.column.grid.moving || (this.column.groupable && !this.column.columnGroup));
    }

    public get icon(): HTMLElement {
        return this.cms.icon;
    }

    private subscription$: Subscription;
    private _ghostClass = 'igx-grid__drag-ghost-image';
    private ghostImgIconClass = 'igx-grid__drag-ghost-image-icon';
    private ghostImgIconGroupClass = 'igx-grid__drag-ghost-image-icon-group';
    private columnSelectedClass = 'igx-grid-th--selected';

    constructor(
        element: ElementRef<HTMLElement>,
        viewContainer: ViewContainerRef,
        zone: NgZone,
        renderer: Renderer2,
        cdr: ChangeDetectorRef,
        private cms: IgxColumnMovingService,
        _platformUtil: PlatformUtil,
    ) {
        super(cdr, element, viewContainer, zone, renderer, _platformUtil);
        this.ghostClass = this._ghostClass;
    }

    public override ngOnDestroy() {
        this._unsubscribe();
        super.ngOnDestroy();
    }

    public onEscape(event: Event) {
        this.cms.cancelDrop = true;
        this.onPointerUp(event);
    }

    public override onPointerDown(event: Event) {
        if (!this.draggable || (event.target as HTMLElement).getAttribute('draggable') === 'false') {
            return;
        }

        super.onPointerDown(event);
    }

    public override onPointerMove(event: Event) {
        if (this._clicked && !this._dragStarted) {
            this._removeOnDestroy = false;
            this.cms.column = this.column;
            this.column.grid.cdr.detectChanges();

            const movingStartArgs = {
                source: this.column
            };
            this.column.grid.columnMovingStart.emit(movingStartArgs);
            this.subscription$ = fromEvent(this.column.grid.document.defaultView, 'keydown').pipe(takeUntil(this._destroy)).subscribe((ev: KeyboardEvent) => {
                if (ev.key === this.platformUtil.KEYMAP.ESCAPE) {
                    this.onEscape(ev);
                }
            });
        }

        super.onPointerMove(event);
        if (this._dragStarted && this.ghostElement && !this.cms.column) {
            this.cms.column = this.column;
            this.column.grid.cdr.detectChanges();
        }

        if (this.cms.column) {
            const args = {
                source: this.column,
                cancel: false
            };
            this.column.grid.columnMoving.emit(args);

            if (args.cancel) {
                this.onEscape(event);
            }
        }
    }

    public override onPointerUp(event: Event) {
        // Run it explicitly inside the zone because sometimes onPointerUp executes after the code below.
        this.zone.run(() => {
            super.onPointerUp(event);
            this.cms.column = null;
            this.column.grid.cdr.detectChanges();
        });

        this._unsubscribe();
    }

    protected override createGhost(pageX: number, pageY: number) {
        super.createGhost(pageX, pageY);

        this.ghostElement.style.height = null;
        this.ghostElement.style.minWidth = null;
        this.ghostElement.style.flexBasis = null;
        this.ghostElement.style.position = null;

        this.ghostElement.classList.remove(this.columnSelectedClass);

        const icon = this.column?.grid.document.createElement('i');
        const text = this.column?.grid.document.createTextNode('block');
        icon.appendChild(text);

        icon.classList.add('material-icons');
        this.cms.icon = icon;

        if (!this.column.columnGroup) {
            icon.classList.add(this.ghostImgIconClass);

            this.ghostElement.insertBefore(icon, this.ghostElement.firstElementChild);

            this.ghostLeft = this._ghostStartX = pageX - ((this.ghostElement.getBoundingClientRect().width / 3) * 2);
            this.ghostTop = this._ghostStartY = pageY - ((this.ghostElement.getBoundingClientRect().height / 3) * 2);
        } else {
            this.ghostElement.insertBefore(icon, this.ghostElement.childNodes[0]);

            icon.classList.add(this.ghostImgIconGroupClass);
            this.ghostElement.children[0].style.paddingLeft = '0px';

            this.ghostLeft = this._ghostStartX = pageX - ((this.ghostElement.getBoundingClientRect().width / 3) * 2);
            this.ghostTop = this._ghostStartY = pageY - ((this.ghostElement.getBoundingClientRect().height / 3) * 2);
        }
    }

    private _unsubscribe() {
        if (this.subscription$) {
            this.subscription$.unsubscribe();
            this.subscription$ = null;
        }
    }
}
