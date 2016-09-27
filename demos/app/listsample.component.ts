import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule } from "../../src/list/list";
import { FilterOptions } from '../../src/list/filter-pipe';

@Component({
    selector: "list-sample",
    template: `
        <input #filterInput1 (input)="inputHandler1($event)" />
        <ig-list (filtered)="filteredHandler($event)" (filtering)="filteringHandler($event)">
            <ig-list-header>Data Source Filtered List</ig-list-header>
            <ig-list-item *ngFor="let item of navItems | filter: fo: filteringValue" [options]="options">
                {{item.text}}
            </ig-list-item>
        </ig-list>
        <input #filterInput2 (input)="inputHandler2($event)" />
        <ig-list>
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
    @ViewChild('filterInput1') filterInput: ElementRef;

    private fo = new FilterOptions();
    private filteringValue = "";

    private navItems: Array<Object> = [
            { key:"1", text: "Nav1", link: "#" },
            { key:"2", text: "Nav2", link: "#" },
            { key:"3", text: "Nav3", link: "#" },
            { key:"4", text: "Nav4", link: "#" }
        ];

    public inputHandler1 = function (args) {        
        this.fo.items = this.navItems;
        this.fo.key = "text";        
        this.filteringValue = args.target.value;
    }.bind(this);

    private filteringHandler = function(args) {
        args.cancel = true;
        console.log(args);
    }

    private filteredHandler = function(args) {
        console.log(args);
    }

 }
