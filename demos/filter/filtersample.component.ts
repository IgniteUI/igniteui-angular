import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule, List } from "zero-blocks/main";
import { FilterModule, FilterOptions } from "zero-blocks/main";
import { IgRippleModule } from "zero-blocks/main";

@Component({
    templateUrl: 'demos/filter/filtersample.component.html'
})

export class FilterSampleComponent {
    @ViewChild("checkbox") checkbox: any;
    @ViewChild("declarativeList") declarativeList: any;

    search1: string;
    search2: string;

    private navItems: Array<Object> = [
            { key:"1", text: "List Item One", link: "#" },
            { key:"2", text: "List Item Two", link: "#" },
            { key:"3", text: "List Item Three", link: "#" },
            { key:"4", text: "List Item Four", link: "#" }
        ];

    get fo1() {
        var _fo = new FilterOptions();
        _fo.key = "text";
        _fo.inputValue = this.search1;
        return _fo;
    }

    get fo2() {
        var _fo = new FilterOptions();

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

    private filteringHandler = function(args) {
        args.cancel = !this.checkbox.checked;
        console.log(args);
    }

    private filteredHandler = function(args) {
        console.log(args);
    }

 }
