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

    itemsCount = 50;
    items: any[] = [
        // { field: "Cables" },
        // { field: "Switches", disabled: true },
        // { field: "Switches", disabled: true },
        // { field: "Batteries", disabled: true }
    ];

    constructor() {
        for (let i = 0; i < this.itemsCount; i += 1) {
            const item = { field: "Item " + i };
            if (i % 3 === 1 || i % 4 === 1) {
                item["disabled"] = true;
                item.field += " I am Disabled!";
            }

            if (i % 5 === 1) {
                item["header"] = true;
                item.field += "I am Header!";
            }
            this.items.push(item);
        }
    }

    public toggleDropDown() {
        this.igxDropDown.toggleDropDown();
    }

    onSelection(ev) {
        console.log(ev);
    }
}
