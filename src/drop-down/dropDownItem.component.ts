import { Component, ElementRef, forwardRef, HostBinding, HostListener, Inject, Input, OnInit } from "@angular/core";
import { IgxDropDownComponent, ISelectionEventArgs } from "./dropDown.component";

@Component({
    selector: "igx-drop-down-item",
    templateUrl: "dropDownItem.component.html",
    styles: [
        ":host { display: block; }",
        ":host.selected { background-color: #1A73E8; }",
        ":host.focused { border: 1px solid #8bb8f4; }"
    ]
})
export class IgxDropDownItemComponent implements OnInit {
    get isSelected() {
        return this.dropDown.selectedItem === this;
    }

    @Input() set isSelected(value: boolean) {
        if (this.isSelected === value) {
            return;
        }

        const oldSelection = this.dropDown.selectedItem;
        this.dropDown.selectedItem = value ? this : null;
        const args: ISelectionEventArgs = { oldSelection, newSelection: this.dropDown.selectedItem };
        this.dropDown.onSelection.emit(args);
    }

    @HostBinding("class.selected")
    get selectedStyle(): boolean {
        return this.isSelected;
    }

    @HostBinding("class.focused")
    public isFocused = false;

    constructor(
        @Inject(forwardRef(() => IgxDropDownComponent)) public dropDown: IgxDropDownComponent,
        private elementRef: ElementRef
    ) { }

    @HostListener("click", ["$event"]) clicked(event) {
        this.dropDown.itemClicked.emit(this);
        const oldSelection = this.dropDown.selectedItem;
        this.dropDown.selectedItem = this;
        this.dropDown._initialSelectionChanged = true;
        const args: ISelectionEventArgs = { oldSelection, newSelection: this.dropDown.selectedItem, event };
        this.dropDown.onSelection.emit(args);
        this.dropDown.close();
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
