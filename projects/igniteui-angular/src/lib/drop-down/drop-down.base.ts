import {
    Input, HostBinding, ElementRef, QueryList, Output, EventEmitter, ChangeDetectorRef
} from '@angular/core';

import { Navigate, ISelectionEventArgs } from './drop-down.common';
import { IDropDownList } from './drop-down.common';
import { DropDownActionKey } from './drop-down-navigation.directive';
import { IgxDropDownItemBase } from './drop-down-item.base';

let NEXT_ID = 0;

/**
 * An abstract class, defining a drop-down component, with:
 * Properties for display styles and classes
 * A collection items of type `IgxDropDownItemBase`
 * Properties and methods for navigating (highlighting/focusing) items from the collection
 * Properties and methods for selecting items from the collection
 */
export abstract class IgxDropDownBase implements IDropDownList {
    protected _width;
    protected _height;
    protected _focusedItem: any = null;
    protected _id = `igx-drop-down-${NEXT_ID++}`;
    protected children: QueryList<IgxDropDownItemBase>;

    /**
     * Get dropdown's html element of it scroll container
     */
    protected get scrollContainer() {
        return this.element;
    }

    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-drop-down (onSelection)='handleSelection()'></igx-drop-down>
     * ```
     */
    @Output()
    public onSelection = new EventEmitter<ISelectionEventArgs>();

    /**
     *  Gets/Sets the width of the drop down
     *
     * ```typescript
     * // get
     * let myDropDownCurrentWidth = this.dropdown.width;
     * ```
     * ```html
     * <!--set-->
     * <igx-drop-down [width]='160px'></igx-drop-down>
     * ```
     */
    @Input()
    public width: string;

    /**
     * Gets/Sets the height of the drop down
     *
     * ```typescript
     * // get
     * let myDropDownCurrentHeight = this.dropdown.height;
     * ```
     * ```html
     * <!--set-->
     * <igx-drop-down [height]='400px'></igx-drop-down>
     * ```
     */
    @Input()
    public height: string;

    /**
     * Gets/Sets the drop down's id
     *
     * ```typescript
     * // get
     * let myDropDownCurrentId = this.dropdown.id;
     * ```
     * ```html
     * <!--set-->
     * <igx-drop-down [id]='newDropDownId'></igx-drop-down>
     * ```
     */
    @Input()
    public id: string;

    /**
     * Gets/Sets the drop down's container max height.
     *
     * ```typescript
     * // get
     * let maxHeight = this.dropdown.maxHeight;
     * ```
     * ```html
     * <!--set-->
     * <igx-drop-down [maxHeight]='200px'></igx-drop-down>
     * ```
     */
    @Input()
    @HostBinding('style.maxHeight')
    public maxHeight = null;

    /**
     * @hidden
     */
    @HostBinding('class.igx-drop-down')
    public cssClass = true;

    /**
     * Get all non-header items
     *
     * ```typescript
     * let myDropDownItems = this.dropdown.items;
     * ```
     */
    public get items(): IgxDropDownItemBase[] {
        const items: IgxDropDownItemBase[] = [];
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
     * Get all header items
     *
     * ```typescript
     * let myDropDownHeaderItems = this.dropdown.headers;
     * ```
     */
    public get headers(): IgxDropDownItemBase[] {
        const headers: IgxDropDownItemBase[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (child.isHeader) {
                    headers.push(child);
                }
            }
        }

        return headers;
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

    /**
     * Gets if the dropdown is collapsed
     */
    public get collapsed(): boolean {
        return false;
    }

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef) { }

    /** Keydown Handler */
    public onItemActionKey(key: DropDownActionKey, event?: Event) {
        switch (key) {
            case DropDownActionKey.ENTER:
            case DropDownActionKey.SPACE:
                this.selectItem(this.focusedItem, event);
                break;
            case DropDownActionKey.ESCAPE:
        }
    }

    /**
     * Emits onSelection with the target item & event
     * @hidden
     * @param newSelection the item selected
     * @param event the event that triggered the call
     */
    public selectItem(newSelection?: IgxDropDownItemBase, event?: Event) {
        this.onSelection.emit({
            newSelection,
            oldSelection: null,
            cancel: false
        });
    }

    /**
     * @hidden
     */
    public get focusedItem(): IgxDropDownItemBase {
        return this._focusedItem;
    }

    /**
     * @hidden
     */
    public set focusedItem(item: IgxDropDownItemBase) {
        this._focusedItem = item;
    }

    /**
     * @hidden
     */
    protected navigate(direction: Navigate, currentIndex?: number) {
        let index = -1;
        if (this._focusedItem) {
            index = currentIndex ? currentIndex : this._focusedItem.itemIndex;
        }
        const newIndex = this.getNearestSiblingFocusableItemIndex(index, direction);
        this.navigateItem(newIndex);
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
     * Navigates to the item on the specified index
     * @param newIndex number - the index of the item in the `items` collection
     */
    public navigateItem(newIndex: number) {
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
    public navigateFirst() {
        this.navigate(Navigate.Down, -1);
    }

    /**
     * @hidden
     */
    public navigateLast() {
        this.navigate(Navigate.Up, this.items.length);
    }

    /**
     * @hidden
     */
    public navigateNext() {
        this.navigate(Navigate.Down);
    }

    /**
     * @hidden
     */
    public navigatePrev() {
        this.navigate(Navigate.Up);
    }

    protected scrollToHiddenItem(newItem: IgxDropDownItemBase) {
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
