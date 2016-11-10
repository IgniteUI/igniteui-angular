import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule, List } from "../../../src/list/list";
import { FilterModule, FilterOptions } from '../../../src/directives/filter';
import { IgRippleModule } from '../../../src/directives/ripple';

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

    search1: string;
    search2: string;
    options: Object = {};

    private navItems: Array<Object> = [
            { key:"1", text: "<h1>Hi world</h1>This is some very long string <br> hello world", link: "#" },
            { key:"2", text: "Nav2", link: "#" },
            { key:"3", text: "Nav3", link: "#" },
            { key:"4", text: "Nav4", link: "#" }
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
