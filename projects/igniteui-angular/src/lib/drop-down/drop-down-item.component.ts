import {
    Component,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Input
} from '@angular/core';
import { IgxDropDownComponent, ISelectionEventArgs } from './drop-down.component';

/**
 * The `<igx-drop-down-item> is a container intended for row items in
 * a `<igx-drop-down>` container.
 */

export class IgxDropDownItemBase {
    /**
     * @hidden
     */
    protected _isFocused = false;

    /**
     * Gets the selected item's id.
     *
     * ```typescript
     *  let selectedItem = this.dropdown.selectedItem() as IgxDropDownItemBase;
     *  let itemId = selectedItem.itemID;
     * ```
     */
    public get itemID() {
        return;
    }

    /**
     * @hidden
     */
    public itemData: any;

    /**
     * @hidden
     */
    @HostBinding('class.igx-drop-down__item')
    get itemStyle(): boolean {
        return !this.isHeader;
    }

    /**
     * Gets if the item is the currently selected one in the dropdown
     *
     * ```typescript
     *  let mySelectedItem = this.dropdown.selectedItem() as IgxDropDownBase;
     *  let isMyItemSelected = mySelectedItem.isSelected(); // true
     * ```
     */
    get isSelected() {
        return this.dropDown.selectedItem === this;
    }

    /**
     * @hidden
     */
    @HostBinding('attr.aria-selected')
    @HostBinding('class.igx-drop-down__item--selected')
    get selectedStyle(): boolean {
        return this.isSelected;
    }

    /**
     * Sets/gets if the given item is focused
     *
     * ```typescript
     *  // get
     *  let selectedItem = this.dropdown.selectedItem() as IgxDropDownItemBase;
     *  let itemIsFocused = selectedItem.isFocused;
     * ```
     */
    @HostBinding('class.igx-drop-down__item--focused')
    get isFocused() {
        return this._isFocused;
    }
    /**
     * ```html
     *  <!--set-->
     *  <igx-drop-down-item *ngFor="let item of items" isFocused={{item.isFocused}}>
     *      <div>
     *          {{item.field}}
     *      </div>
     *  </igx-drop-down-item>
     * ```
     */
    set isFocused(value: boolean) {
        if (this.disabled || this.isHeader) {
            this._isFocused = false;
            return;
        }

        if (value && !this.dropDown.collapsed) {
            this.elementRef.nativeElement.focus({ preventScroll: true });
        }
        this._isFocused = value;
    }

    /**
     * Sets/gets if the given item is header
     *
     * ```typescript
     *  // get
     *  let selecteItem = this.dropdown.selectdItem() as IgxDropDownItemBase;
     *  let itemIsHeader = selectedItem.isHeader;
     * ```
     *
     * ```html
     *  <!--set-->
     *  <igx-drop-down-item *ngFor="let item of items" isHeader={{item.header}}>
     *      <div>
     *          {{item.field}}
     *      </div>
        </igx-drop-down-item>
     * ```
     */
    @Input()
    @HostBinding('class.igx-drop-down__header')
    public isHeader = false;

    /**
     * Sets/gets if the given item is disabled
     *
     * ```typescript
     *  // get
     *  let selectedItem = this.dropdown.selectedItem() as IgxDropDownItemBase;
     *  let isItemDisabled = selectedItem.disabled;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-drop-down-item *ngFor="let item of items" disabled={{item.disabled}}>
     *      <div>
     *          {{item.field}}
     *      </div>
     * </igx-drop-down-item>
     * ```
     */
    @Input()
    @HostBinding('class.igx-drop-down__item--disabled')
    public disabled = false;


    /**
     * @hidden
     */
    @HostBinding('attr.tabindex')
    get setTabIndex() {
        const shouldSetTabIndex = this.dropDown.allowItemsFocus && !(this.disabled || this.isHeader);
        if (shouldSetTabIndex) {
        } else {
            return null;
        }
    }

    /**
     * Gets item index
     *
     * ```typescript
     *  let currentItemIndex = (<IgxDropDownItemBase>this.dropdown.selectedItem()).index;
     * ```
     */
    public get index(): number {
        return this.dropDown.items.indexOf(this);
    }

    /**
     * Gets item element height
     *
     * ```typescript
     *  let myElementHeight = this.dropdown.elementHeight;
     * ```
     */
    public get elementHeight(): number {
        return this.elementRef.nativeElement.clientHeight;
    }

    /**
     * Get item html element
     *
     * ```typescript
     *  let myItemHtmlElement = this.dropdown.element;
     * ```
     */
    public get element() {
        return this.elementRef;
    }

    constructor(
        public dropDown: any,
        protected elementRef: ElementRef
    ) { }

    /**
     * @hidden
     */
    @HostListener('click', ['$event'])
    clicked(event) {
        if (this.disabled || this.isHeader) {
            const focusedItem = this.dropDown.items.find((item) => item.isFocused);
            focusedItem.elementRef.nativeElement.focus({ preventScroll: true });
            return;
        }
        this.dropDown.navigateItem(this.index);
        this.dropDown.selectItem(this);
    }

    /**
     * @hidden
     */
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
