import {Component, ElementRef, forwardRef, HostBinding, HostListener, Inject, Input, OnInit} from "@angular/core";
import {IgxDropDownComponent, ISelectionEventArgs} from "./drop-down.component";

@Component({
    selector: "igx-drop-down-item",
    templateUrl: "drop-down-item.component.html"
})

export class IgxDropDownItemComponent implements OnInit {
    @HostBinding("class.igx-drop-down__item")
    public cssClass = "igx-drop-down__item";

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
            this.element.nativeElement.blur();
            return;
        }

        if (value) {
            this.element.nativeElement.focus();
            this.element.nativeElement.scrollIntoView(true);
        }
        this._isFocused = value;
    }

    @Input()
    @HostBinding("class.igx-drop-down__header")
    public isHeader = false;

    @Input()
    @HostBinding("class.igx-drop-down__item--disabled")
    public isDisabled = false;

    constructor(
        @Inject(forwardRef(() => IgxDropDownComponent)) public dropDown: IgxDropDownComponent,
        private elementRef: ElementRef
    ) {
    }

    @HostListener("click", ["$event"]) clicked(event) {
        if (this.isDisabled || this.isHeader) {
            return;
        }

        const oldSelection = this.dropDown.selectedItem;
        this.dropDown.setSelectedItem(this.index);
        const args: ISelectionEventArgs = { oldSelection, newSelection: this, event };
        this.dropDown.onSelection.emit(args);
        this.dropDown.toggle.close(true);
    }

    @HostListener("keydown.Escape", ["$event"])
    onEscapeKeyDown(event) {
        this.dropDown.toggle.close(true);
    }

    @HostListener("keydown.Space", ["$event"])
    onSpaceKeyDown(event) {
        this.dropDown.changeSelectedItem(true, event);
    }

    @HostListener("keydown.Enter", ["$event"])
    onEnterKeyDown(event) {
        this.dropDown.changeSelectedItem(true, event);
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

    ngOnInit() {
        this.element.nativeElement.tabIndex = 0;
    }

    public get index(): number {
        return this.dropDown.items.toArray().indexOf(this);
    }

    public get elementHeight(): number {
        return this.elementRef.nativeElement.clientHeight;
    }

    public get element() {
        return this.elementRef;
    }
}
