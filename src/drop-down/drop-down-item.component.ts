import {
    Component,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Input } from "@angular/core";
import { IgxDropDownComponent, ISelectionEventArgs } from "./drop-down.component";

/**
 * The `<igx-drop-down-item> is a container intended for row items in
 * a `<igx-drop-down>` container.
 */
@Component({
    selector: "igx-drop-down-item",
    templateUrl: "drop-down-item.component.html"
})

export class IgxDropDownItemComponent {
    private _isFocused = false;

    @HostBinding("class.igx-drop-down__item")
    get itemStyle(): boolean {
        return !this.isHeader;
    }

    /**
     * Gets if the given item is selected
     */
    get isSelected() {
        return this.dropDown.selectedItem === this;
    }

    @HostBinding("attr.aria-selected")
    @HostBinding("class.igx-drop-down__item--selected")
    get selectedStyle(): boolean {
        return this.isSelected;
    }

    /**
     * Sets/gets if the given item is focused
     */
    @HostBinding("class.igx-drop-down__item--focused")
    get isFocused() {
        return this._isFocused;
    }
    set isFocused(value: boolean) {
        if (this.isDisabled || this.isHeader) {
            this._isFocused = false;
            return;
        }

        if (value && !this.dropDown.toggleDirective.collapsed) {
            this.elementRef.nativeElement.focus();
        }
        this._isFocused = value;
    }

    /**
     * Sets/gets if the given item is header
     */
    @Input()
    @HostBinding("class.igx-drop-down__header")
    public isHeader = false;


    /**
     * Sets/gets if the given item is disabled
     */
    @Input()
    @HostBinding("class.igx-drop-down__item--disabled")
    public isDisabled = false;

    @HostBinding("attr.tabindex")
    get setTabIndex() {
        const shouldSetTabIndex = this.dropDown.allowItemsFocus && !(this.isDisabled || this.isHeader);
        console.log(shouldSetTabIndex);
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
        @Inject(forwardRef(() => IgxDropDownComponent)) public dropDown: IgxDropDownComponent,
        private elementRef: ElementRef
    ) { }

    @HostListener("click", ["$event"])
    clicked(event) {
        if (this.isDisabled || this.isHeader) {
            const focusedItem = this.dropDown.items.find((item) => item.isFocused);
            focusedItem.elementRef.nativeElement.focus({ preventScroll: true });
            return;
        }

        this.dropDown.setSelectedItem(this.index);
        this.dropDown.toggleDirective.close(true);
    }

    @HostListener("keydown.Escape", ["$event"])
    onEscapeKeyDown(event) {
        this.dropDown.toggleDirective.close(true);
    }

    @HostListener("keydown.Space", ["$event"])
    onSpaceKeyDown(event) {
        this.dropDown.setSelectedItem(this.index);
        this.dropDown.toggleDirective.close(true);
    }

    @HostListener("keydown.Enter", ["$event"])
    onEnterKeyDown(event) {
        this.dropDown.setSelectedItem(this.index);
        this.dropDown.toggleDirective.close(true);
    }

    @HostListener("keydown.ArrowDown", ["$event"])
    onArrowDownKeyDown(event) {
        this.dropDown.focusNext();
        event.stopPropagation();
        event.preventDefault();
    }

    @HostListener("keydown.ArrowUp", ["$event"])
    onArrowUpKeyDown(event) {
        this.dropDown.focusPrev();
        event.stopPropagation();
        event.preventDefault();
    }

    @HostListener("keydown.End", ["$event"])
    onEndKeyDown(event) {
        this.dropDown.focusLast();
        event.stopPropagation();
        event.preventDefault();
    }

    @HostListener("keydown.Home", ["$event"])
    onHomeKeyDown(event) {
        this.dropDown.focusFirst();
        event.stopPropagation();
        event.preventDefault();
    }
}
