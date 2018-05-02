import { Component, OnInit, ViewChild } from "@angular/core";
import { IgxDropDownComponent } from "../../lib/main";
@Component({
    // tslint:disable-next-line:component-selector
    selector: "drop-down-sample",
    templateUrl: "./sample.component.html"
})
export class DropDownSampleComponent implements OnInit {
    private width = "160px";
    @ViewChild(IgxDropDownComponent) public igxDropDown: IgxDropDownComponent;

    itemsCount = 50;
    items: any[] = [];

    ngOnInit() {
        this.igxDropDown.allowItemsFocus = true;
    }

    constructor() {
        for (let i = 0; i < this.itemsCount; i += 1) {
            const item = { field: "Item " + i };
            if (i % 7 === 1 || i > 30) {
                item["disabled"] = true;
                item.field += " I am Disabled!";
            }

            if (i % 6 === 1) {
                item["header"] = true;
                item.field += "I am Header!";
            }
            this.items.push(item);
        }
    }

    public toggleDropDown() {
        // tslint:disable-next-line:no-debugger
        debugger;
        this.igxDropDown.toggleDropDown();
    }

    onSelection(ev) {
        console.log(ev);
    }
}
