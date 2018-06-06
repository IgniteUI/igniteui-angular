import {
    Component,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Input } from '@angular/core';
import { IgxDropDownComponent, ISelectionEventArgs } from './drop-down.component';

/**
 * The `<igx-drop-down-item> is a container intended for row items in
 * a `<igx-drop-down>` container.
 */

export class IgxDropDownItemBase {
    protected _isFocused = false;
    public get itemID() {
        return;
    }

    public itemData: any;

    @HostBinding('class.igx-drop-down__item')
    get itemStyle(): boolean {
        return !this.isHeader;
    }

    /**
     * Gets if the item is the currently selected one in the dropdown
     */
    get isSelected() {
        return this.dropDown.selectedItem === this;
    }

    @HostBinding('attr.aria-selected')
    @HostBinding('class.igx-drop-down__item--selected')
    get selectedStyle(): boolean {
        return this.isSelected;
    }

    /**
     * Sets/gets if the given item is focused
     */
    @HostBinding('class.igx-drop-down__item--focused')
    get isFocused() {
        return this._isFocused;
    }
    set isFocused(value: boolean) {
        if (this.isDisabled || this.isHeader) {
            this._isFocused = false;
            return;
        }

        if (value && !this.dropDown.collapsed) {
            this.elementRef.nativeElement.focus();
        }
        this._isFocused = value;
    }

    /**
     * Sets/gets if the given item is header
     */
    @Input()
    @HostBinding('class.igx-drop-down__header')
    public isHeader = false;

    /**
     * Sets/gets if the given item is disabled
     */
    @Input()
    @HostBinding('class.igx-drop-down__item--disabled')
    public isDisabled = false;

    @HostBinding('attr.tabindex')
    get setTabIndex() {
        const shouldSetTabIndex = this.dropDown.allowItemsFocus && !(this.isDisabled || this.isHeader);
        if (shouldSetTabIndex) {
            return 0;
        } else {
            return null;
        }
    }

    /**
     * Gets item index
     */
    public get index(): number {
        return this.dropDown.items.indexOf(this);
    }

    /**
     * Gets item element height
     */
    public get elementHeight(): number {
        return this.elementRef.nativeElement.clientHeight;
    }

    /**
     * Get item html element
     */
    public get element() {
        return this.elementRef;
    }

    constructor(
        public dropDown: any,
        protected elementRef: ElementRef
    ) { }

    @HostListener('click', ['$event'])
    clicked(event) {
        if (this.isDisabled || this.isHeader) {
            const focusedItem = this.dropDown.items.find((item) => item.isFocused);
            focusedItem.elementRef.nativeElement.focus({ preventScroll: true });
            return;
        }
        this.dropDown.navigateItem(this.index);
        this.dropDown.selectItem(this);
    }

    markItemSelected() {
        this.dropDown.setSelectedItem(this.index);
        this.dropDown.close();
    }
}

@Component({
    selector: 'igx-drop-down-item',
    templateUrl: 'drop-down-item.component.html'
})
export class IgxDropDownItemComponent extends IgxDropDownItemBase {
    constructor(
        @Inject(forwardRef(() => IgxDropDownComponent)) public dropDown: IgxDropDownComponent,
        protected elementRef: ElementRef
    ) {
        super(dropDown, elementRef);
    }
}
