
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    Renderer2
} from '@angular/core';

import {
    IgxListPanState,
    IListChild
} from './list.common';

import { HammerGesturesManager } from '../core/touch';
import { IgxListComponent } from './list.component';

// ====================== ITEM ================================
// The `<igx-item>` component is a container intended for row items in
// a `<igx-list>` container.
@Component({
    providers: [HammerGesturesManager],
    selector: 'igx-list-item',
    templateUrl: 'list-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IgxListItemComponent implements IListChild {
    /**
     *@hidden
     */
    private _panState: IgxListPanState = IgxListPanState.NONE;
    /**
     *@hidden
     */
    private _FRACTION_OF_WIDTH_TO_TRIGGER_GRIP = 0.5; // as a fraction of the item width
    /**
     *@hidden
     */
    private _currentLeft = 0;

    constructor(
        @Inject(forwardRef(() => IgxListComponent))
        public list: IgxListComponent,
        private elementRef: ElementRef,
        private _renderer: Renderer2) {
    }
    /**
     * Sets/gets whether the `list item` is a header.
     * ```html
     * <igx-list-item [isHeader] = "true">Header</igx-list-item>
     * ```
     * ```typescript
     * let isHeader =  this.listItem.isHeader;
     * ```
     * @memberof IgxListItemComponent
     */
    @Input()
    public isHeader: boolean;
    /**
     * Sets/gets whether the `list item` is hidden.
     * By default the `hidden` value is `false`.
     * ```html
     * <igx-list-item [hidden] = "true">Hidden Item</igx-list-item>
     * ```
     * ```typescript
     * let isHidden =  this.listItem.hidden;
     * ```
     * @memberof IgxListItemComponent
     */
    @Input()
    public hidden = false;
    /**
     * Gets the `role` attribute of the `list item`.
     * ```typescript
     * let itemRole =  this.listItem.role;
     * ```
     * @memberof IgxListItemComponent
     */
    @HostBinding('attr.role')
    public get role() {
        return this.isHeader ? 'separator' : 'listitem';
    }
    /**
     * Sets/gets the `aria-label` attribute of the `list item`.
     * ```typescript
     * this.listItem.ariaLabel = "Item1";
     * ```
     * ```typescript
     * let itemAriaLabel = this.listItem.ariaLabel;
     * ```
     * @memberof IgxListItemComponent
     */
    @HostBinding('attr.aria-label')
    public ariaLabel: string;
    /**
     * Gets the `touch-action` style of the `list item`.
     * ```typescript
     * let touchAction = this.listItem.touchAction;
     * ```
     */
    @HostBinding('style.touch-action')
    public touchAction = 'pan-y';
    /**
     * Indicates whether `list item` should have header style.
     * ```typescript
     * let headerStyle =  this.listItem.headerStyle;
     * ```
     * @memberof IgxListItemComponent
     */
    @HostBinding('class.igx-list__header')
    get headerStyle(): boolean {
        return this.isHeader;
    }
    /**
     * Applies the inner style of the `list item` if the item is not counted as header.
     * ```typescript
     * let innerStyle =  this.listItem.innerStyle;
     * ```
     * @memberof IgxListItemComponent
     */
    @HostBinding('class.igx-list__item')
    get innerStyle(): boolean {
        return !this.isHeader;
    }
    /**
     * Returns string value which describes the display mode of the `list item`.
     * ```typescript
     * let isHidden = this.listItem.display;
     * ```
     * @memberof IgxListItemComponent
     */
    @HostBinding('style.display')
    get display(): string {
        return this.hidden ? 'none' : '';
    }
    /**
     *@hidden
     */
    @HostListener('click', ['$event'])
    clicked(evt) {
        this.list.onItemClicked.emit({ item: this, event: evt });
    }
    /**
     *@hidden
     */
    @HostListener('panstart', ['$event'])
    panStart(ev) {
        if (!this.isTrue(this.list.allowLeftPanning) && !this.isTrue(this.list.allowRightPanning)) {
            return;
        }

        this._currentLeft = this.left;
    }
    /**
     *@hidden
     */
    @HostListener('panmove', ['$event'])
    panMove(ev) {
        if (!this.isTrue(this.list.allowLeftPanning) && !this.isTrue(this.list.allowRightPanning)) {
            return;
        }

        const isPanningToLeft = ev.deltaX < 0;

        if (isPanningToLeft && this.isTrue(this.list.allowLeftPanning)) {
            this.left = Math.max(this.maxLeft, ev.deltaX);
        } else if (!isPanningToLeft && this.isTrue(this.list.allowRightPanning)) {
            this.left = Math.min(this.maxRight, ev.deltaX);
        }
    }
    /**
     *@hidden
     */
    @HostListener('panend', ['$event'])
    panEnd(ev) {
        if (!this.isTrue(this.list.allowLeftPanning) && !this.isTrue(this.list.allowRightPanning)) {
            return;
        }

        const oldPanState = this._panState;

        this.performMagneticGrip();

        if (oldPanState !== this._panState) {
            this.list.onPanStateChange.emit({ oldState: oldPanState, newState: this._panState, item: this });
            if (this._panState === IgxListPanState.LEFT) {
                this.list.onLeftPan.emit(this);
            } else if (this._panState === IgxListPanState.RIGHT) {
                this.list.onRightPan.emit(this);
            }
        }
    }
    /**
     * Gets the `panState` of a `list item`.
     * ```typescript
     * let itemPanState =  this.listItem.panState;
     * ```
     * @memberof IgxListItemComponent
     */
    public get panState(): IgxListPanState {
        return this._panState;
    }
    /**
     * Gets the `index` of a `list item`.
     * ```typescript
     * let itemIndex =  this.listItem.index;
     * ```
     * @memberof IgxListItemComponent
     */
    public get index(): number {
        return this.list.children.toArray().indexOf(this);
    }
    /**
     * Returns an element reference to the list item.
     * ```typescript
     * let listItemElement =  this.listItem.element.
     * ```
     * @memberof IgxListItemComponent
     */
    public get element() {
        return this.elementRef.nativeElement;
    }
    /**
     * Gets the width of a `list item`.
     * ```typescript
     * let itemWidth = this.listItem.width;
     * ```
     * @memberof IgxListItemComponent
     */
    public get width() {
        if (this.element) {
            return this.element.offsetWidth;
        }
    }
    /**
     * Gets the maximum left position of the `list item`.
     * ```typescript
     * let maxLeft = this.listItem.maxLeft;
     * ```
     * @memberof IgxListItemComponent
     */
    public get maxLeft() {
        return -this.width;
    }
    /**
     * Gets the maximum right position of the `list item`.
     * ```typescript
     * let maxRight = this.listItem.maxRight;
     * ```
     * @memberof IgxListItemComponent
     */
    public get maxRight() {
        return this.width;
    }
    /**
     *@hidden
     */
    private get left() {
        return this.element.offsetLeft;
    }
    /**
     *@hidden
     */
    private set left(value: number) {
        let val = value + '';

        if (val.indexOf('px') === -1) {
            val += 'px';
        }
        this.element.style.left = val;
    }
    /**
     *@hidden
     */
    private performMagneticGrip() {
        const widthTriggeringGrip = this.width * this._FRACTION_OF_WIDTH_TO_TRIGGER_GRIP;

        if (this.left > 0) {
            if (this.left > widthTriggeringGrip) {
                this.left = this.maxRight;
                this._panState = IgxListPanState.RIGHT;
            } else {
                this.left = 0;
                this._panState = IgxListPanState.NONE;
            }
        } else {
            if (-this.left > widthTriggeringGrip) {
                this.left = this.maxLeft;
                this._panState = IgxListPanState.LEFT;
            } else {
                this.left = 0;
                this._panState = IgxListPanState.NONE;
            }
        }
    }
    /**
     *@hidden
     */
    private isTrue(value: boolean): boolean {
        if (typeof (value) === 'boolean') {
            return value;
        } else {
            return value === 'true';
        }
    }
}
