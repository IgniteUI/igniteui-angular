import { Component, OnInit, ViewChild } from "@angular/core";
import { IgxDropDownComponent } from "../../lib/main";
@Component({
    // tslint:disable-next-line:component-selector
    selector: "drop-down-sample",
    templateUrl: "./sample.component.html",
    styleUrls: ["sample.component.css"]
})
export class DropDownSampleComponent implements OnInit {
    private width = "160px";
    @ViewChild(IgxDropDownComponent) public igxDropDown: IgxDropDownComponent;

    itemsCount = 50;
    items: any[] = [];

    ngOnInit() {
    }

    constructor() {
        for (let i = 0; i < this.itemsCount; i += 1) {
            const item = { field: "Item " + i };
            if (i % 7 === 4 || i > 49) {
                item["disabled"] = true;
                item.field = "Disabled" + i;
            } else if (i % 6 === 5) {
                item["header"] = true;
                item.field = "Header" + i;
            }
            this.items.push(item);
        }
    }

    public toggleDropDown() {
        this.igxDropDown.toggle();
    }

    onSelection(ev) {
    }
}
