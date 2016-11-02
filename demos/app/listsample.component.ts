import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule, List } from "../../src/list/list";
import { FilterModule, FilterOptions } from '../../src/directives/filter';
import { IgRippleModule } from '../../src/directives/ripple';

@Component({
    selector: "list-sample",
    styles: [
        '.wrapper { width:33%; display:inline-block; float: left; padding: 10px; height: 600px; border: 1px solid lightgray; overflow: auto;}'
    ],
    template: `
        <div class="wrapper">            
            <h4>Data Source Filtered List</h4>
            <div class="ig-form-group">
                <input class="ig-form-group__input--search" placeholder="Search List" [(ngModel)]="search1" />
                <label igLabel>
                    <i class="material-icons">search</i>
                </label>
                <span class="ig-form-group__clear--hidden">
                    <i class="material-icons">clear</i>
                </span>
            </div>
            <ig-list>
                <ig-list-item igRipple="pink" igRippleTarget=".ig-list__item" *ngFor="let item of navItems | filter: fo1">
                    {{item.text}}
                </ig-list-item>
            </ig-list>        
        </div>
        <div class="wrapper">
            <h4>Declarative Fitered List</h4>
            <ig-checkbox [checked]="true" #checkbox>Perform filtering</ig-checkbox>   
            <div class="ig-form-group">
                <input class="ig-form-group__input--search" placeholder="Search List" [(ngModel)]="search2" />
                <label igLabel>
                    <i class="material-icons">search</i>
                </label>
                <span class="ig-form-group__clear--hidden">
                    <i class="material-icons">clear</i>
                </span>
            </div>
            <ig-list #declarativeList [filter]="fo2" (filtering)="filteringHandler($event)" (filtered)="filteredHandler($event)">
                <ig-list-header>Mildly Sweet</ig-list-header>
                <ig-list-item [options]="{}">Red Delicious</ig-list-item>
                <ig-list-item>Ambrosia</ig-list-item>
                <ig-list-item>Rome</ig-list-item>
                <ig-list-header>Sweet</ig-list-header>
                <ig-list-item>Golden Delicious</ig-list-item>
                <ig-list-item>Cosmic Crisp</ig-list-item>
                <ig-list-item>Pinova</ig-list-item>
            </ig-list>
        </div>
        <div class="wrapper">
            <h4>Non-header List with options</h4>
            <ig-list>
            <ig-list-item *ngFor="let navItem of navItems; let index = index" [options]="options">
                <div>
                    {{navItem.text}}
                </div>
            </ig-list-item>
            </ig-list>
        </div>`
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
