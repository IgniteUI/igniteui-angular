import { Directive, Input, OnDestroy, ElementRef, Renderer2, NgZone } from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';
import { DropPosition, IgxColumnMovingService } from './moving.service';
import { Subject, interval } from 'rxjs';
import { IgxColumnMovingDragDirective } from './moving.drag.directive';
import { takeUntil } from 'rxjs/operators';
import { IgxDropDirective } from '../../directives/drag-drop/drag-drop.directive';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';


@Directive({
    selector: '[igxColumnMovingDrop]'
})
export class IgxColumnMovingDropDirective extends IgxDropDirective implements OnDestroy {

    @Input('igxColumnMovingDrop')
    public set data(val: any) {
        if (val instanceof IgxColumnComponent) {
            this._column = val;
        }

        if (val instanceof IgxGridForOfDirective) {
            this._hVirtDir = val;
        }
    }

    public get column(): IgxColumnComponent {
        return this._column;
    }

    public get isDropTarget(): boolean {
        return this._column && this._column.grid.hasMovableColumns && this.cms.column.movable &&
            ((!this._column.pinned && this.cms.column.disablePinning) || !this.cms.column.disablePinning);
    }

    public get horizontalScroll(): any {
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

                this.cms.icon.innerText = 'lock';
            } else {
                this.cms.icon.innerText = 'block';
            }

            if (this.horizontalScroll) {
                this.cms.icon.innerText = event.target.id === 'right' ? 'arrow_forward' : 'arrow_back';

                interval(100).pipe(takeUntil(this._dragLeave)).subscribe(() => {
                    if (event.target.id === 'right') {
                        this.horizontalScroll.scrollPosition += 15;
                    } else {
                        this.horizontalScroll.scrollPosition -= 15;
                    }
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
            this.column.grid.moveColumn(this.cms.column, this.column, this._dropPos);

            this.column.grid.draggedColumn = null;
            this.column.grid.cdr.detectChanges();
        }
    }
}
