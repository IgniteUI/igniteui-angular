import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule, List } from "../../src/list/list";

@Component({
    selector: "list-sample",
    templateUrl: 'demos/list/listsample.component.html'
})

export class ListSampleComponent {
    @ViewChild("checkbox") checkbox: any;
    @ViewChild("declarativeList") declarativeList: any;

    private navItems: Array<Object> = [
            { key:"1", text: "Nav1", link: "#" },
            { key:"2", text: "Nav2", link: "#" },
            { key:"3", text: "Nav3", link: "#" },
            { key:"4", text: "Nav4", link: "#" }
        ];
 }
