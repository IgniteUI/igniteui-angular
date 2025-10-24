import { Directive, Input, OnDestroy, ElementRef, Renderer2, NgZone } from '@angular/core';
import { DropPosition, IgxColumnMovingService } from './moving.service';
import { Subject, interval, animationFrameScheduler } from 'rxjs';
import { IgxColumnMovingDragDirective } from './moving.drag.directive';
import { takeUntil } from 'rxjs/operators';
import { IgxDropDirective } from '../../directives/drag-drop/drag-drop.directive';
import { IgxForOfDirective, IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { ColumnType } from '../common/grid.interface';
// import { IgxGridHeaderGroupComponent } from '../headers/grid-header-group.component';


@Directive({
    selector: '[igxColumnMovingDrop]',
    standalone: true
})
export class IgxColumnMovingDropDirective extends IgxDropDirective implements OnDestroy {

    @Input('igxColumnMovingDrop')
    public override set data(val: ColumnType | IgxForOfDirective<ColumnType, ColumnType[]>) {
        if (val instanceof IgxGridForOfDirective) {
            this._displayContainer = val;
        } else {
            this._column = val as ColumnType;
        }

    }

    public get column() {
        return this._column;
    }

    public get isDropTarget(): boolean {
        return this.column && this.column.grid.moving &&
            ((!this.column.pinned && this.cms.column?.disablePinning) || !this.cms.column?.disablePinning);
    }

    public get horizontalScroll() {
        if (this._displayContainer) {
            return this._displayContainer;
        }
    }

    public get nativeElement() {
        return this.ref.nativeElement;
    }

    private _dropPos: DropPosition;
    private _dropIndicator = null;
    private _lastDropIndicator = null;
    private _column: ColumnType;
    private _displayContainer: IgxGridForOfDirective<ColumnType, ColumnType[]>;
    private _dragLeave = new Subject<boolean>();
    private _dropIndicatorClass = 'igx-grid-th__drop-indicator--active';

    constructor(
        private ref: ElementRef<HTMLElement>,
        private renderer: Renderer2,
        private _: NgZone,
        private cms: IgxColumnMovingService
    ) {
        super(ref, renderer, _);
    }

    public override ngOnDestroy() {
        this._dragLeave.next(true);
        this._dragLeave.complete();
        super.ngOnDestroy();
    }

    public override onDragOver(event) {
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

            const clientRect = this.nativeElement.getBoundingClientRect();
            const pos = clientRect.left + clientRect.width / 2;

            const parent = this.nativeElement.parentElement;
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

    public override onDragEnter(event) {
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

            this.cms.icon.innerText = 'save_alt';
        } else {
            this.cms.icon.innerText = 'block';
        }

        if (this.horizontalScroll) {
            this.cms.icon.innerText = event.target.id === 'right' ? 'arrow_forward' : 'arrow_back';

            interval(0, animationFrameScheduler).pipe(takeUntil(this._dragLeave)).subscribe(() => {
                if (event.target.id === 'right') {
                    this.horizontalScroll.scrollPosition += 10;
                } else {
                    this.horizontalScroll.scrollPosition -= 10;
                }
            });
        }
    }

    public override onDragLeave(event) {
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

    public override onDragDrop(event) {
        event.preventDefault();
        const drag = event.detail.owner;
        if (this.cms.cancelDrop || !(drag instanceof IgxColumnMovingDragDirective)) {
            this.cms.cancelDrop = false;
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

            this.cms.column = null;
            this.column.grid.cdr.detectChanges();
        }
    }
}
