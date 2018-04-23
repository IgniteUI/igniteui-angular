import { Component, ViewChild } from "@angular/core";
import { IgxDropDownComponent } from "../../lib/main";
@Component({
    // tslint:disable-next-line:component-selector
    selector: "drop-down-sample",
    templateUrl: "./sample.component.html"
})
export class DropDownSampleComponent {
    private width = "160px";
    @ViewChild(IgxDropDownComponent) public igxDropDown: IgxDropDownComponent;

    itemsCount = 10;
    items: any[] = [
        { field: "Cables" },
        { field: "Switches", disabled: true },
        { field: "Batteries" }
    ];

    constructor() {
        //for (let i = 0; i < this.itemsCount; i += 1) {
        //    this.items.push("Item " + i);
        //}
    }

    public toggleDropDown() {
        this.igxDropDown.toggleDropDown();
    }

    itemClicked(ev) {
    }

    onSelection(ev) {
    }
}
