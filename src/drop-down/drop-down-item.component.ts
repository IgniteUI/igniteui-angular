import { Component, ElementRef, forwardRef, HostBinding, HostListener, Inject, Input } from "@angular/core";
import { IgxDropDownComponent, ISelectionEventArgs } from "./drop-down.component";

@Component({
    selector: "igx-drop-down-item",
    templateUrl: "drop-down-item.component.html"
})

export class IgxDropDownItemComponent {
    @HostBinding("class.igx-drop-down__item")
    get itemStyle(): boolean {
        return !this.isHeader;
    }

    private _isFocused = false;

    get isSelected() {
        return this.dropDown.selectedItem === this;
    }

    @HostBinding("attr.aria-selected")
    @HostBinding("class.igx-drop-down__item--selected")
    get selectedStyle(): boolean {
        return this.isSelected;
    }

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

    @Input()
    @HostBinding("class.igx-drop-down__header")
    public isHeader = false;

    @Input()
    @HostBinding("class.igx-drop-down__item--disabled")
    public isDisabled = false;

    @HostBinding("attr.tabindex")
    get setTabIndex() {
        const shouldSetTabIndex = this.dropDown.allowItemsFocus && !(this.isDisabled || this.isHeader);
        if (shouldSetTabIndex) {
            return 0;
        } else {
            return null;
        }
    }

    constructor(
        @Inject(forwardRef(() => IgxDropDownComponent)) public dropDown: IgxDropDownComponent,
        private elementRef: ElementRef
    ) { }

    @HostListener("click", ["$event"]) clicked(event) {
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

    public get index(): number {
        return this.dropDown.items.indexOf(this);
    }

    public get elementHeight(): number {
        return this.elementRef.nativeElement.clientHeight;
    }

    public get element() {
        return this.elementRef;
    }
}
