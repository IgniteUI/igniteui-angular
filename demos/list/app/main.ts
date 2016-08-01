import {Component, ViewChild} from '@angular/core';
import * as Infragistics from '../../../src/main';

@Component({
    selector: 'sample-app',
    styleUrls: ["app/main.css"],
    templateUrl: "app/main.html",
    directives: [
        Infragistics.Header,
        Infragistics.Item,
        Infragistics.List,
        //Infragistics.ListItemOption
    ]
})

export class AppComponent {
    private navItems: Array<Object> = [
            { text: "Nav1", link: "#" }, 
            { text: "Nav2", link: "#" }, 
            { text: "Nav3", link: "#" }, 
            { text: "Nav4", link: "#" }
        ];

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