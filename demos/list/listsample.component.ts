import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule, List } from "../../src/list/list";
import { FilterModule, FilterOptions } from '../../src/directives/filter';
import { IgRippleModule } from '../../src/directives/ripple';

@Component({
    selector: "list-sample",
    template: `
    <div id="phoneContainer" class="phone">
        <div id="mobileDiv" class="screen">
            <div>
                <span class="componentTitle">List</span><br>
                <span class="componentDesc">A component that displays filtered items retrieved from a data source.</span><br>           
                    <div class="ig-form-group">
                        <input class="ig-form-group__input--search" placeholder="Search List" [(ngModel)]="search1" />
                    </div>
                    <ig-list>
                        <ig-list-item igRipple="pink" igRippleTarget=".ig-list__item" *ngFor="let item of navItems | filter: fo1">
                            {{item.text}}
                        </ig-list-item>
                    </ig-list>     
            </div>
        </div>
    </div>`
})
export class ListSampleComponent {
    @ViewChild("checkbox") checkbox: any;
    @ViewChild("declarativeList") declarativeList: any;

    search1: string;
    search2: string;

    private navItems: Array<Object> = [
            { key:"1", text: "Nav1", link: "#" },
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
