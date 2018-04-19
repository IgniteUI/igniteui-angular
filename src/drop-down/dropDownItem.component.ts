import { Component, ElementRef, forwardRef, HostBinding, HostListener, Inject, Input, OnInit } from "@angular/core";
import { IgxDropDownComponent } from "./dropDown.component";

@Component({
    selector: "igx-drop-down-item",
    templateUrl: "dropDownItem.component.html",
    styleUrls: ["dropDownItem.component.css"]
})
export class IgxDropDownItemComponent implements OnInit {
    get isSelected() {
        return this.dropDown.selectedItem === this;
    }

    @Input() set isSelected(value: boolean) {
        if (this.isSelected === value) {
            return;
        }

        this.dropDown.selectedItem = value ? this : null;
    }

    @HostBinding("class.selected")
    get selectedStyle(): boolean {
        return this.isSelected;
    }

    constructor(
        @Inject(forwardRef(() => IgxDropDownComponent)) public dropDown: IgxDropDownComponent,
        private elementRef: ElementRef
    ) { }

    ngOnInit() {

    }

    @HostListener("click", ["$event"]) clicked(event) {
        this.dropDown.itemClicked.emit(this);
        this.dropDown.selectedItem = this;
        this.dropDown.toggleDropDown();
    }

    public get index(): number {
        return this.dropDown.items.toArray().indexOf(this);
    }

    public get elementHeight(): number {
        return this.elementRef.nativeElement.clientHeight;
    }
}
