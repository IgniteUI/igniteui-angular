import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule } from "../../src/list/list";
import { FilterModule, FilterOptions } from '../../src/list/filter';

@Component({
    selector: "list-sample",
    template: `
        <input [(ngModel)]="search1" />
        <ig-list>
            <ig-list-header>Data Source Filtered List</ig-list-header>
            <ig-list-item *ngFor="let item of navItems | filter: fo: search1" [options]="options">
                {{item.text}}
            </ig-list-item>
        </ig-list>
        <br>
        <input [(ngModel)]="search2" />
        <ig-list [filter]="search2" (filtered)="filteredHandler($event)" (filtering)="filteringHandler($event)">
            <ig-list-header>Declarative Fitered List</ig-list-header>
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
    search1: string;
    search2: string;

    private navItems: Array<Object> = [
            { key:"1", text: "Nav1", link: "#" },
            { key:"2", text: "Nav2", link: "#" },
            { key:"3", text: "Nav3", link: "#" },
            { key:"4", text: "Nav4", link: "#" }
        ];

    get fo() {
        var _fo = new FilterOptions();
        _fo.key = "text";
        return _fo;
    }
    
    private filteringHandler = function(args) {
        args.cancel = true;
        console.log(args);
    }

    private filteredHandler = function(args) {
        console.log(args);
    }

 }
