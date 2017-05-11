import { Component, ElementRef, ViewChild } from "@angular/core";
import { IgxDialog, IgxDialogModule } from "../../../src/dialog/dialog.component";
import { IgxFilterModule, IgxFilterOptions } from "../../../src/directives/filter.directive";
import { IgxRippleModule } from "../../../src/directives/ripple.directive";
import { IgxInput } from "../../../src/input/input.directive";
import { IgxList, IgxListItem, IgxListModule, IgxListPanState } from "../../../src/list/list.component";

@Component({
    selector: "list-sample",
    moduleId: module.id,
    templateUrl: "./sample.component.html",
    styleUrls: ["../app.samples.css", "./sample.component.css"]
})
export class ListSampleComponent {
    @ViewChild("checkbox") checkbox: any;
    @ViewChild("declarativeList") declarativeList: any;
    @ViewChild("addFruitDialog") addFruitDialog: IgxDialog;

    fruitsSearch: string;
    search1: string;
    search2: string;
    options: Object = {};
    fruitsFilteredItemsCount = undefined;

    private navItems: Object[] = [
        { key: "1", text: "Terrance Orta", phone: "770-504-2217" , avatar: "../demos/app/avatar/images/1.jpg", favorite: true, link: "#" },
        { key: "2", text: "Richard Mahoney", phone: "423-676-2869", avatar: "../demos/app/avatar/images/2.jpg", favorite: false, link: "#" },
        { key: "3", text: "Donna Price", phone: "859-496-2817", avatar: "../demos/app/avatar/images/3.jpg", favorite: false, link: "#" },
        { key: "4", text: "Lisa Landers", phone: "901-747-3428", avatar: "../demos/app/avatar/images/4.jpg", favorite: false, link: "#" },
        { key: "5", text: "Dorothy H. Spencer", phone: "573-394-9254", avatar: "../demos/app/avatar/images/12.jpg", favorite: true, link: "#" },
        { key: "6", text: "Stephanie May", phone: "323-668-1482", avatar: "../demos/app/avatar/images/13.jpg", favorite: false, link: "#" },
        { key: "7", text: "Marianne Taylor", phone: "401-661-3742", avatar: "../demos/app/avatar/images/14.jpg", favorite: false, link: "#" },
        { key: "8", text: "Tammie Alvarez", phone: "662-374-2920", avatar: "../demos/app/avatar/images/15.jpg", favorite: true, link: "#" },
        { key: "9", text: "Charlotte Flores", phone: "240-455-2267", avatar: "../demos/app/avatar/images/16.jpg", favorite: true, link: "#" },
        { key: "10", text: "Ward Riley", phone: "724-742-0979", avatar: "../demos/app/avatar/images/17.jpg", favorite: false, link: "#" }
    ];

    private fruits: Fruit[] = [];

    get fo1() {
        const _fo = new IgxFilterOptions();
        _fo.key = "text";
        _fo.inputValue = this.search1;
        return _fo;
    }

    get fo2() {
        const _fo = new IgxFilterOptions();

        _fo.items = this.declarativeList.items;
        _fo.inputValue = this.search2;

        _fo.get_value = function(item: any) {
            return item.element.nativeElement.textContent.trim();
        };

        _fo.metConditionFn = function(item: any) {
            item.hidden = false;
        };

        _fo.overdueConditionFn = function(item: any) {
            item.hidden = true;
        };

        return _fo;
    }

    get fruitsFilterOptions() {
        const fruitsFilterOpts = new IgxFilterOptions();
        fruitsFilterOpts.items = this.fruits;
        fruitsFilterOpts.key = "name";
        fruitsFilterOpts.inputValue = this.fruitsSearch;
        return fruitsFilterOpts;
    }

    private filteringHandler = function(args) {
        args.cancel = !this.checkbox.checked;
    };

    private filteredHandler = function(args) {
    };

    private onLeftPan(args) {
        console.log("Left pan fired.");
        console.log(args);
    }

    private onRightPan(args) {
        console.log("Right pan fired.");
        console.log(args);
    }

    private onPanStateChange(args) {
        console.log("Pan state fired.");
        console.log(args);
    }

    private onAddFruitButtonClicked(fruitName) {
        this.fruits.push({ id: this.fruits.length, name: fruitName });
        this.addFruitDialog.close();
    }

    private deleteFruit(fruitId) {
        let fruitIndex = -1;
        for (let i = 0; i < this.fruits.length; i++) {
            if (fruitId === this.fruits[i].id) {
                fruitIndex = i;
                break;
            }
        }

        this.fruits.splice(fruitIndex, 1);
    }

    private fruitsFiltered(args) {
        this.fruitsFilteredItemsCount = args.filteredItems.length;
    }
}

export class Fruit {
    id: number;
    name: string;
}