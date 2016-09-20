import { Component } from "@angular/core";
import { ListModule } from "../../src/list/list";
// import { FilterOptions } from "../../src/list/filter-pipe";


@Component({
    selector: "list-sample",
    template: `
        <input id="searchbox" />
        <ig-list searchInputId="searchbox" (filtered)="filteredHandler($event)" (filtering)="filteringHandler($event)" [filterOptions]="filterOptions">
            <ig-list-header>Filtered List</ig-list-header>
            <ig-list-item *ngFor="let navItem of navItems; let index = index" [filteringValue]="navItem.key" [options]="options">
            {{navItem.text}}
            </ig-list-item>
        </ig-list>

        <ig-list >
        <ig-list-header>Href List</ig-list-header>
        <ig-list-item [href]="'http://google.com/'">Google</ig-list-item>
        <ig-list-item [href]="'http://youtube.com/'">YouTube</ig-list-item>
        <ig-list-item [href]="'http://facebook.com/'">Facebook</ig-list-item>
        </ig-list>

        <ig-list>
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

    private navItems: Array<Object> = [
            { key:"1", text: "Nav1", link: "#" },
            { key:"2", text: "Nav2", link: "#" },
            { key:"3", text: "Nav3", link: "#" },
            { key:"4", text: "Nav4", link: "#" }
        ];

    // get filterOptions() {
    //     let fo = new FilterOptions();
    //     return fo;
    // }

    filteringHandler(args) {
        //args.cancel = true;
        console.log(args);
    }

    filteredHandler(args) {
        console.log(args);
    }

 }
