import { Component, ViewChild, ElementRef } from "@angular/core";
import { IgxListModule, IgxList, IgxListItem, IgxListPanState } from "../../../src/list/list.component";
import { IgxFilterModule, IgxFilterOptions } from '../../../src/directives/filter.directive';
import { IgxRippleModule } from '../../../src/directives/ripple.directive';
import { IgxInput } from '../../../src/input/input.directive';
import { IgxDialogModule, IgxDialog } from '../../../src/dialog/dialog.component';

@Component({
    selector: "list-sample",
    moduleId: module.id,
    styles: [
        '.wrapper { width:33%; display:inline-block; float: left; padding: 10px; height: 600px; border: 1px solid lightgray; overflow: auto;}'
    ],
    templateUrl: './sample.component.html'
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

    private navItems: Array<Object> = [
            { key:"1", text: "Nav1", link: "#" },
            { key:"2", text: "Nav2", link: "#" },
            { key:"3", text: "Nav3", link: "#" },
            { key:"4", text: "Nav4", link: "#" },
            { key:"5", text: "Nav5", link: "#" },
            { key:"6", text: "Nav6", link: "#" },
            { key:"7", text: "Nav7", link: "#" },
            { key:"8", text: "Nav8", link: "#" },
            { key:"9", text: "Nav9", link: "#" },
            { key:"10", text: "Nav10", link: "#" },
            { key:"11", text: "Nav11", link: "#" },
            { key:"12", text: "Nav12", link: "#" },
            { key:"13", text: "Nav13", link: "#" },
            { key:"14", text: "Nav14", link: "#" },
            { key:"15", text: "Nav15", link: "#" }
        ];

    private fruits: Array<Fruit> = [];

    get fo1() {
        var _fo = new IgxFilterOptions();
        _fo.key = "text";
        _fo.inputValue = this.search1;
        return _fo;
    }

    get fo2() {
        var _fo = new IgxFilterOptions();

        _fo.items = this.declarativeList.items;
        _fo.inputValue = this.search2;

        _fo.get_value = function (item: any) {
            return item.element.nativeElement.textContent.trim();
        };

        _fo.metConditionFn = function (item: any) {
             item.hidden = false;
         };

        _fo.overdueConditionFn = function (item: any) {
             item.hidden = true;
         };

        return _fo;
    }

    get fruitsFilterOptions() {
        var fruitsFilterOpts = new IgxFilterOptions();
        fruitsFilterOpts.items = this.fruits;
        fruitsFilterOpts.key = "name";
        fruitsFilterOpts.inputValue = this.fruitsSearch;
        return fruitsFilterOpts;
    }

    private filteringHandler = function(args) {
        args.cancel = !this.checkbox.checked;
    }

    private filteredHandler = function(args) {
    }

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
        this.fruits.push( {id: this.fruits.length, name: fruitName} );
        this.addFruitDialog.close();
    }

    private deleteFruit(fruitId) {
        let fruitIndex = -1;
        for (var i = 0; i < this.fruits.length; i++) {
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