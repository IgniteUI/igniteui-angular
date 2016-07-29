import {Component, ViewChild} from '@angular/core';
import * as Infragistics from '../../../src/main';

@Component({
    selector: 'sample-app',
    styleUrls: ["app/main.css"],
    templateUrl: "app/main.html",
    directives: [
        Infragistics.Header,
        Infragistics.Item,
        Infragistics.List
    ]
})

export class AppComponent {
    navItems: Array<Object> = [
            { text: "Nav1", link: "#" }, 
            { text: "Nav2", link: "#" }, 
            { text: "Nav3", link: "#" }, 
            { text: "Nav4", link: "#" }
        ];
}