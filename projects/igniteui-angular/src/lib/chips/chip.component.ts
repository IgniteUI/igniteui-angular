import {
    Component,
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    Inject,
    NgModule,
    Output,
    Provider,
    ViewChild,
    OnInit,
    AfterContentInit,
    AfterViewInit,
    Renderer2
} from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxDragDirective } from '../directives/dragdrop/dragdrop.directive';
import { DisplayDensity } from '../core/utils';

@Component({
    selector: 'igx-chip',
    templateUrl: 'chip.component.html',
    styles: [
        `:host {
            display: flex;
            align-items: center;
            position: relative;
            transition-property: top, left;
            touch-action: none;
        }
        .item-selected {
            background: lightblue;
        }
        `
    ]
})
export class IgxChipComponent implements AfterViewInit {

    @Input()
    public id;

    @Input()
    public draggable = false;

    @Input()
    public removable = false;

    @Input()
    public selectable = false;

    @HostBinding('attr.class')
    get hostClass(): string {
        switch (this._displayDensity) {
            case DisplayDensity.cosy:
                return 'igx-chip--cosy';
            case DisplayDensity.compact:
                return 'igx-chip--compact';
            default:
                return 'igx-chip';
        }
    }

    @Input()
    public get displayDensity(): DisplayDensity | string {
        return this._displayDensity;
    }

    public set displayDensity(val: DisplayDensity | string) {
        switch (val) {
            case 'compact':
                this._displayDensity = DisplayDensity.compact;
                break;
            case 'cosy':
                this._displayDensity = DisplayDensity.cosy;
                break;
            case 'comfortable':
            default:
                this._displayDensity = DisplayDensity.comfortable;
        }
    }

    @Input()
    public set color(newColor) {
        this.chipArea.nativeElement.style.backgroundColor = newColor;
    }

    public get color() {
        return this.chipArea.nativeElement.style.backgroundColor;
    }

    @Output()
    public onMoveStart = new EventEmitter<any>();

    @Output()
    public onMoveEnd = new EventEmitter<any>();

    @Output()
    public onRemove = new EventEmitter<any>();

    @Output()
    public onClick = new EventEmitter<any>();

    @Output()
    public onSelection = new EventEmitter<any>();

    @Output()
    public onKeyDown = new EventEmitter<any>();

    @Output()
    public onDragEnter = new EventEmitter<any>();

    @ViewChild('chipArea', { read: ElementRef })
    public chipArea: ElementRef;

    @ViewChild('chipArea', { read: IgxDragDirective })
    public dragDir: IgxDragDirective;

    @ViewChild('removeBtn', { read: ElementRef })
    public removeBtn: ElementRef;

    public get selected() {
        return this._selected;
    }

    public set selected(newValue: boolean) {
        const onSelectArgs = {
            owner: this,
            nextStatus: false,
            cancel: false
        };
        if (newValue && this.selectable && !this._selected) {
            onSelectArgs.nextStatus = true;
            this.onSelection.emit(onSelectArgs);

            if (!onSelectArgs.cancel) {
                this.renderer.addClass(this.chipArea.nativeElement, this._selectedItemClass);
                this._selected = newValue;
            }
        } else if (!newValue && this._selected) {
            this.onSelection.emit(onSelectArgs);

            if (!onSelectArgs.cancel) {
                this.renderer.removeClass(this.chipArea.nativeElement, this._selectedItemClass);
                this._selected = newValue;
            }
        }
    }

    public get isLastChip() {
        return !this.elementRef.nativeElement.nextElementSibling;
    }

    public chipTabindex = 0;
    public removeBtnTabindex = 0;
    public areaMovingPerforming = false;

    private _displayDensity = DisplayDensity.comfortable;
    private _selected = false;
    private _dragging = false;
    private _selectedItemClass = 'item-selected';

    constructor(public cdr: ChangeDetectorRef, public elementRef: ElementRef, private renderer: Renderer2) { }

    ngAfterViewInit() {
        this.chipArea.nativeElement.addEventListener('keydown', (args) => {
            this.onChipKeyDown(args);
        });
        if (this.removable) {
            this.removeBtn.nativeElement.addEventListener('keydown', (args) => {
                this.onRemoveBtnKeyDown(args);
            });
        }
    }

    public onChipKeyDown(event) {
        const keyDownArgs = {
            owner: this,
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            code: event.code,
            cancel: false
        };

        this.onKeyDown.emit(keyDownArgs);
        if (keyDownArgs.cancel) {
            return;
        }

        if (event.code === 'Delete') {
            this.onRemove.emit({
                owner: this
            });
        }

        if (event.code === 'Space' && this.selectable) {
            this.selected = !this.selected;
        }

        if (event.code !== 'Tab') {
            event.preventDefault();
        }
    }

    public onRemoveBtnKeyDown(event) {
        if (event.code === 'Space' || event.code === 'Enter') {
            this.onRemove.emit({
                owner: this
            });

            event.preventDefault();
        }
    }

    public onChipRemove() {
        this.onRemove.emit({
            owner: this
        });
    }

    // -----------------------------
    // Start chip igxDrag behaviour
    public onChipDragStart(event) {
        this.onMoveStart.emit({
            owner: this
        });
        event.cancel = !this.draggable;
        this._dragging = true;
    }

    public onChipDragEnd(event) {
        this.dragDir.dropFinished();
        this._dragging = false;
    }

    public onChipMoveEnd(event) {
        // moveEnd is triggered after return animation has finished. This happen when we drag and release the chip.
        this.onMoveEnd.emit({
            owner: this
        });

        if (this.selected) {
            this.chipArea.nativeElement.focus();
        }
    }

    public onChipDragClicked() {
        const clickEventArgs = {
            owner: this
        };
        this.onClick.emit(clickEventArgs);
    }
    // End chip igxDrag behaviour

    // -----------------------------
    // Start chip igxDrop behaviour
    public onChipDragEnterHandler(event) {
        if (this.dragDir === event.drag) {
            return;
        }

        const eventArgs = {
            targetChip: this,
            dragChip: event.dragData.chip,
            detail: event
        };
        this.onDragEnter.emit(eventArgs);
    }

    public onChipDrop(event) {
        // Cancel the default drop logic
        event.cancel = true;
    }
    // End chip igxDrop behaviour
}
