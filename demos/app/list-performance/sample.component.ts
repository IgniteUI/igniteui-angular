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
    public search1: string;
    public data: any[] = [];
	public options: any = {};
public ngOnInit(): void {
    let data = [{
            key: 1,
            avatar: "images/avatar/1.jpg",
            favorite: true,            
            link: "#",
            phone: "770-504-2217",
            text: "Terrance Orta"
            }, {
            key: 2,
            avatar: "images/avatar/2.jpg",
            favorite: false,           
            link: "#",
            phone: "423-676-2869",
            text: "Richard Mahoney"
        }, {
             key: 3,
            avatar: "images/avatar/3.jpg",
            favorite: false,           
            link: "#",
            phone: "859-496-2817",
            text: "Donna Price"
        }, {
            key: 4,
            avatar: "images/avatar/4.jpg",
            favorite: false,            
            link: "#",
            phone: "901-747-3428",
            text: "Lisa Landers"
        }, {
             key: 5,
            avatar: "images/avatar/12.jpg",
            favorite: true,           
            link: "#",
            phone: "573-394-9254",
            text: "Dorothy H. Spencer"
        }, {
             key: 6,
            avatar: "images/avatar/13.jpg",
            favorite: false,           
            link: "#",
            phone: "323-668-1482",
            text: "Stephanie May"
        }, {
            key: 7,
            avatar: "images/avatar/14.jpg",
            favorite: false,            
            link: "#",
            phone: "401-661-3742",
            text: "Marianne Taylor"
        }, {
            key: 8,
            avatar: "images/avatar/15.jpg",
            favorite: true,           
            link: "#",
            phone: "662-374-2920",
            text: "Tammie Alvarez"
        }, {
            key: 9,
            avatar: "images/avatar/16.jpg",
            favorite: true,           
            link: "#",
            phone: "240-455-2267",
            text: "Charlotte Flores"
        }, {
            key: 10,
            avatar: "images/avatar/17.jpg",
            favorite: false,            
            link: "#",
            phone: "724-742-0979",
            text: "Ward Riley"
        }];
	for(let i = 10; i < 100000; i++) {
        var obj = Object.assign({}, data[i % 10]);
        obj["key"] = i;
        data.push(obj);
	}
    this.data = data;
}
    get fo1() {
        const _fo = new IgxFilterOptions();
        _fo.key = "text";
        _fo.inputValue = this.search1;
        return _fo;
    }
}