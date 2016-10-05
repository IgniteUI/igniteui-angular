import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule } from "../../src/list/list";
import { FilterModule, FilterOptions } from '../../src/directives/filter';

@Component({
    selector: "list-sample",
    template: `
        <input [(ngModel)]="search1" />
        <h4>Data Source Filtered List</h4>
        <ig-list>
            <ig-list-item *ngFor="let item of navItems | filter: fo1: search1">
                {{item.text}}
            </ig-list-item>
        </ig-list>        
        <h4>Declarative Fitered List</h4>
        <ig-checkbox [checked]="true" #checkbox>Perform filtering</ig-checkbox>   
        <input [(ngModel)]="search2" />
        <ig-list [filter]="search2" (filtering)="filteringHandler($event)" (filtered)="filteredHandler($event)" [filterOptions]="fo2">
            <ig-list-header>Mildly Sweet</ig-list-header>
            <ig-list-item>Red Delicious</ig-list-item>
            <ig-list-item>Ambrosia</ig-list-item>
            <ig-list-item>Rome</ig-list-item>
            <ig-list-header>Sweet</ig-list-header>
            <ig-list-item>Golden Delicious</ig-list-item>
            <ig-list-item>Cosmic Crisp</ig-list-item>
            <ig-list-item>Pinova</ig-list-item>
        </ig-list>
        <h3>Non-header List</h3>
        <ig-list>
        <ig-list-item *ngFor="let navItem of navItems; let index = index">
            {{navItem.text}}
        </ig-list-item>
        </ig-list>
    `
})
export class ListSampleComponent {
    @ViewChild("checkbox") checkbox: any;

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
        return _fo;
    }

    get fo2() {
        var fo = new FilterOptions();

        fo.get_value = function (item: any) {
            return item.element.nativeElement.textContent.trim();
        };

         fo.metConditionFn = function (item: any) {
             item.hidden = false;
         };

         fo.overdueConditionFn = function (item: any) {
             item.hidden = true;
         };    

        return fo;
    }

    private filteringHandler = function(args) {
        args.cancel = !this.checkbox.checked;
        console.log(args);
    }

    private filteredHandler = function(args) {
        console.log(args);
    }

 }
