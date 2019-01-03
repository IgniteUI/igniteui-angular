import {
    Input, HostBinding, HostListener, ElementRef, OnInit,
    QueryList, ViewChild, Output, EventEmitter, ChangeDetectorRef
} from '@angular/core';

import { CancelableEventArgs } from '../core/utils';
import { OverlaySettings } from '../services';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { Navigate } from './drop-down.common';
import { IDropDownItem, IDropDownList } from './drop-down-utils';
import { DropDownActionKeys } from './drop-down-navigation.directive';

let NEXT_ID = 0;

/** @hidden TODO: refactor */
export abstract class IgxDropDownBase implements IDropDownList, OnInit {
    protected _width;
    protected _height;
    protected _focusedItem: any = null;
    protected _id = `igx-drop-down-${NEXT_ID++}`;
    protected children: QueryList<IDropDownItem>;

    /**
     * @hidden
     * @internal
     */
    public disableTransitions = false;

    @ViewChild(IgxToggleDirective)
    protected toggleDirective: IgxToggleDirective;

    /**
     * Get dropdown's html element of it scroll container
     */
    protected get scrollContainer() {
        return this.toggleDirective.element;
    }

    /**
     * Emitted before the dropdown is opened
     *
     * ```html
     * <igx-drop-down (onOpening)='handleOpening()'></igx-drop-down>
     * ```
     */
    @Output()
    public onOpening = new EventEmitter<CancelableEventArgs>();

    /**
     * Emitted after the dropdown is opened
     *
     * ```html
     * <igx-drop-down (onOpened)='handleOpened()'></igx-drop-down>
     * ```
     */
    @Output()
    public onOpened = new EventEmitter<void>();

    /**
     * Emitted before the dropdown is closed
     *
     * ```html
     * <igx-drop-down (onClosing)='handleClosing()'></igx-drop-down>
     * ```
     */
    @Output()
    public onClosing = new EventEmitter<CancelableEventArgs>();

    /**
     * Emitted after the dropdown is closed
     *
     * ```html
     * <igx-drop-down (onClosed)='handleClosed()'></igx-drop-down>
     * ```
     */
    @Output()
    public onClosed = new EventEmitter<void>();
    /**
     *  Gets the width of the drop down
     *
     * ```typescript
     * // get
     * let myDropDownCurrentWidth = this.dropdown.width;
     * ```
     */
    @Input()
    get width() {
        return this._width;
    }
    /**
     * Sets the width of the drop down
     *
     * ```html
     * <!--set-->
     * <igx-drop-down [width]='160px'></igx-drop-down>
     * ```
     */
    set width(value) {
        this._width = value;
        this.toggleDirective.element.style.width = value;
    }

    /**
     * Gets the height of the drop down
     *
     * ```typescript
     * // get
     * let myDropDownCurrentHeight = this.dropdown.height;
     * ```
     */
    @Input()
    get height() {
        return this._height;
    }
    /**
     * Sets the height of the drop down
     *
     * ```html
     * <!--set-->
     * <igx-drop-down [height]='400px'></igx-drop-down>
     * ```
     */
    set height(value) {
        this._height = value;
        this.toggleDirective.element.style.height = value;
    }

    /**
     * Gets the drop down's id
     *
     * ```typescript
     * // get
     * let myDropDownCurrentId = this.dropdown.id;
     * ```
     */
    @Input()
    get id(): string {
        return this._id;
    }
    /**
     * Sets the drop down's id
     *
     * ```html
     * <!--set-->
     * <igx-drop-down [id]='newDropDownId'></igx-drop-down>
     * ```
     */
    set id(value: string) {
        this._id = value;
    }

    /**
     * Gets/Sets the drop down's container max height.
     *
     * ```typescript
     * // get
     * let maxHeight = this.dropdown.maxHeight;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-drop-down [maxHeight]='200px'></igx-drop-down>
     * ```
     */
    @Input()
    @HostBinding('style.maxHeight')
    public maxHeight = null;

    /**
     * Gets if the dropdown is collapsed
     *
     * ```typescript
     * let isCollapsed = this.dropdown.collapsed;
     * ```
     */
    public get collapsed(): boolean {
        return this.toggleDirective.collapsed;
    }

    @HostBinding('class.igx-drop-down')
    cssClass = 'igx-drop-down';

    /**
     * Get all non-header items
     *
     * ```typescript
     * let myDropDownItems = this.dropdown.items;
     * ```
     */
    public get items(): IDropDownItem[] {
        const items: IDropDownItem[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }

        return items;
    }

    /**
     * Get dropdown html element
     *
     * ```typescript
     * let myDropDownElement = this.dropdown.element;
     * ```
     */
    public get element() {
        return this.elementRef.nativeElement;
    }

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef) { }

    /**
 * Opens the dropdown
 *
 * ```typescript
 * this.dropdown.open();
 * ```
 */
    open(overlaySettings?: OverlaySettings) {
        this.toggleDirective.open(overlaySettings);
    }

    /**
     * Closes the dropdown
     *
     * ```typescript
     * this.dropdown.close();
     * ```
     */
    close() {
        this.toggleDirective.close();
    }

    /**
     * Toggles the dropdown
     *
     * ```typescript
     * this.dropdown.toggle();
     * ```
     */
    toggle(overlaySettings?: OverlaySettings) {
        if (this.toggleDirective.collapsed) {
            this.open(overlaySettings);
        } else {
            this.close();
        }
    }

    /**
     * Keydown Handler
     */
    public handleKeyDown(key: DropDownActionKeys) {
        return;
    }

    /**
     * @hidden
     */
    public get focusedItem(): IDropDownItem {
        return this._focusedItem;
    }

    /**
     * @hidden
     */
    public set focusedItem(item: IDropDownItem) {
        this._focusedItem = item;
    }

    /**
     * @hidden
     */
    protected navigate(direction: Navigate, currentIndex?: number) {
        let index = -1;
        if (this._focusedItem) {
            index = currentIndex ? currentIndex : this._focusedItem.index;
        }
        const newIndex = this.getNearestSiblingFocusableItemIndex(index, direction);
        this.navigateItem(newIndex, direction);
    }

    protected getNearestSiblingFocusableItemIndex(startIndex: number, direction: Navigate): number {
        let index = startIndex;
        const items = this.items;
        while (items[index + direction] && items[index + direction].disabled) {
            index += direction;
        }

        index += direction;
        if (index >= 0 && index < items.length) {
            return index;
        } else {
            return -1;
        }
    }

    /**
     * @hidden
     * @internal
     */
    public navigateItem(newIndex: number, direction?: Navigate) {
        if (newIndex !== -1) {
            const oldItem = this._focusedItem;
            const newItem = this.items[newIndex];
            if (oldItem) {
                oldItem.isFocused = false;
            }
            this._focusedItem = newItem;
            this.scrollToHiddenItem(newItem);
            this._focusedItem.isFocused = true;
        }
    }

    /**
     * @hidden
     */
    onToggleClosing(e: CancelableEventArgs) {
        const eventArgs = { cancel: false };
        this.onClosing.emit(eventArgs);
        e.cancel = eventArgs.cancel;
    }

    /**
     * @hidden
     */
    onToggleClosed() {
        if (this._focusedItem) {
            this._focusedItem.isFocused = false;
        }

        this.onClosed.emit();
    }

    /**
     * @hidden
     */
    navigateFirst() {
        this.navigate(Navigate.Down, -1);
    }

    /**
     * @hidden
     */
    navigateLast() {
        this.navigate(Navigate.Up, this.items.length);
    }

    /**
     * @hidden
     */
    navigateNext() {
        this.navigate(Navigate.Down);
    }

    /**
     * @hidden
     */
    navigatePrev() {
        this.navigate(Navigate.Up);
    }

    /**
     * @hidden
     */
    ngOnInit() {
        this.toggleDirective.id = this.id;
    }


    /**
     * @hidden
     */
    onToggleOpening(e: CancelableEventArgs) {
        const eventArgs = { cancel: false };
        this.onOpening.emit(eventArgs);
        e.cancel = eventArgs.cancel;
        if (eventArgs.cancel) {
            return;
        }
    }

    /**
     * @hidden
     */
    onToggleOpened() {
        this.onOpened.emit();
    }

    protected scrollToHiddenItem(newItem: IDropDownItem) {
        const elementRect = newItem.element.nativeElement.getBoundingClientRect();
        const parentRect = this.scrollContainer.getBoundingClientRect();
        if (parentRect.top > elementRect.top) {
            this.scrollContainer.scrollTop -= (parentRect.top - elementRect.top);
        }

        if (parentRect.bottom < elementRect.bottom) {
            this.scrollContainer.scrollTop += (elementRect.bottom - parentRect.bottom);
        }
    }
}
