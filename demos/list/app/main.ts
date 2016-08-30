import { Component, ViewChild } from '@angular/core';
import * as Infragistics from '../../../src/main';
import { FilterOptions } from '../../../src/list/filter-pipe';

@Component({
    selector: 'sample-app',
    styleUrls: ["app/main.css"],
    templateUrl: "app/main.html",
    directives: [
        Infragistics.ListHeader,
        Infragistics.ListItem,
        Infragistics.List,
        //Infragistics.ListItemOption
    ]
})

export class AppComponent {
    private navItems: Array<Object> = [
            { key:"1", text: "Nav1", link: "#" }, 
            { key:"2", text: "Nav2", link: "#" }, 
            { key:"3", text: "Nav3", link: "#" }, 
            { key:"4", text: "Nav4", link: "#" }
        ];

    get filterOptions() {
        let fo = new FilterOptions();
        fo.matchFn = (filteringValue: string, inputValue: string) => { return filteringValue.indexOf(inputValue.toLowerCase()) > -1; }; // "contains" behavior
        fo.formatter = (text: string) => { return text.toLowerCase(); };

        return fo;
    }    

    filteringHandler(args) {
        //args.cancel = true;
        console.log(args);
    }

    filteredHandler(args) {
        console.log(args);
    }

    /*var options: Array<HTMLElement> = [
        new ListItemOption("<div></div>");
        new ListItemOption();
        new ListItemOption();
        new ListItemOption();
    ];*/
}