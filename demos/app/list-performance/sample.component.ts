import { Component, ElementRef, ViewChild } from "@angular/core";
import {
    IgxDialog,
    IgxDialogModule,
    IgxFilterModule,
    IgxFilterOptions,
    IgxInput,
    IgxList,
    IgxListItem,
    IgxListModule,
    IgxListPanState,
    IgxRippleModule
} from "../../lib/main";

@Component({
    selector: "list-sample",
    styleUrls: ["../app.samples.css", "./sample.component.css"],
    templateUrl: "./sample.component.html"
})
export class ListPerformanceSampleComponent {

    public data: any[];
	public options: any = {};
	constructor(){
		this.data = [];
		for(let i = 0; i < 100000; i++){
			this.data.push({ name: "Name "+ i, index: i });
		}

	}
}