import { Component, ElementRef, ViewChild } from "@angular/core";
import { IgxDialog, IgxDialogModule } from "../../../src/dialog/dialog.component";
import { IgxFilterModule, IgxFilterOptions } from "../../../src/directives/filter.directive";
import { IgxRippleModule } from "../../../src/directives/ripple.directive";
import { IgxInput } from "../../../src/input/input.directive";
import { IgxList, IgxListItem, IgxListModule, IgxListPanState } from "../../../src/list/list.component";

@Component({
    moduleId: module.id,
    selector: "list-sample",
    styleUrls: ["../app.samples.css", "./sample.component.css"],
    templateUrl: "./sample.component.html"
})
export class ListSampleComponent {
    @ViewChild("checkbox") public checkbox: any;
    @ViewChild("declarativeList") public declarativeList: any;
    @ViewChild("addFruitDialog") public addFruitDialog: IgxDialog;

    public fruitsSearch: string;
    public search1: string;
    public search2: string;
    public options: object = {};
    public fruitsFilteredItemsCount = undefined;

    private navItems: object[] = [{
        avatar: "../demos/app/avatar/images/1.jpg",
        favorite: true,
        key: "1",
        link: "#",
        phone: "770-504-2217",
        text: "Terrance Orta"
    }, {
        avatar: "../demos/app/avatar/images/2.jpg",
        favorite: false,
        key: "2",
        link: "#",
        phone: "423-676-2869",
        text: "Richard Mahoney"
    }, {
        avatar: "../demos/app/avatar/images/3.jpg",
        favorite: false,
        key: "3",
        link: "#",
        phone: "859-496-2817",
        text: "Donna Price"
    }, {
        avatar: "../demos/app/avatar/images/4.jpg",
        favorite: false,
        key: "4",
        link: "#",
        phone: "901-747-3428",
        text: "Lisa Landers"
    }, {
        avatar: "../demos/app/avatar/images/12.jpg",
        favorite: true,
        key: "5",
        link: "#",
        phone: "573-394-9254",
        text: "Dorothy H. Spencer"
    }, {
        avatar: "../demos/app/avatar/images/13.jpg",
        favorite: false,
        key: "6",
        link: "#",
        phone: "323-668-1482",
        text: "Stephanie May"
    }, {
        avatar: "../demos/app/avatar/images/14.jpg",
        favorite: false,
        key: "7",
        link: "#",
        phone: "401-661-3742",
        text: "Marianne Taylor"
    }, {
        avatar: "../demos/app/avatar/images/15.jpg",
        favorite: true,
        key: "8",
        link: "#",
        phone: "662-374-2920",
        text: "Tammie Alvarez"
    }, {
        avatar: "../demos/app/avatar/images/16.jpg",
        favorite: true,
        key: "9",
        link: "#",
        phone: "240-455-2267",
        text: "Charlotte Flores"
    }, {
        avatar: "../demos/app/avatar/images/17.jpg",
        favorite: false,
        key: "10",
        link: "#",
        phone: "724-742-0979",
        text: "Ward Riley"
    }];

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

        _fo.get_value = (item: any) => {
            return item.element.nativeElement.textContent.trim();
        };

        _fo.metConditionFn = (item: any) => {
            item.hidden = false;
        };

        _fo.overdueConditionFn = (item: any) => {
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

    private filteredHandler = (args) => { };

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
    public id: number;
    public name: string;
}
