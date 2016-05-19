import {Component, ViewChild} from 'angular2/core';
import * as Infragistics from '../../../src/main';

@Component({
    selector: 'sample-app',
    styleUrls: ["app/main.css"],
    templateUrl: "app/main.html",
    directives: [
        Infragistics.Button,
        Infragistics.Icon,
        Infragistics.Header,
        Infragistics.Item,
        Infragistics.List,
        Infragistics.TabBar
    ]
})

export class AppComponent {
    tabItems: Array<Object> = [
        { text: "Nav1", link: "#" },
        { text: "Nav2", link: "#" },
        { text: "Nav3", link: "#" },
        { text: "Nav4", link: "#" }
      ];
}
