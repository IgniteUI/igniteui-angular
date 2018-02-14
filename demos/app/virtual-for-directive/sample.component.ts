import { Component, ElementRef, ViewChild } from "@angular/core";
import {
    IgxDialogModule,
    IgxFilterModule,
    IgxFilterOptions,
    IgxListModule,
    IgxListPanState,
    IgxRippleModule,
    IgxForOfDirective
} from "../../lib/main";
@Component({
    selector: "virt-for-sample",
    styleUrls: ["../app.samples.css", "./sample.component.css"],
    templateUrl: "./sample.component.html"
})
export class VirtualForSampleComponent {
    public search1: string;
    public data: any[] = [];
	public options: any = {};
    
    @ViewChild("virtDirVertical", { read: IgxForOfDirective })
    public virtDirVertical: IgxForOfDirective<any>;
        
    @ViewChild("virtDirHorizontal", { read: IgxForOfDirective })
    public virtDirHorizontal: IgxForOfDirective<any>;

    public ngOnInit(): void {
        let data = [{
            key: 1,
            avatar: "images/avatar/1.jpg",
            favorite: true, 
            link: "#",
            phone: "770-504-2217",
            text: "Terrance Orta",
            width: 100
            }, {
            key: 2,
            avatar: "images/avatar/2.jpg",
            favorite: false,           
            link: "#",
            phone: "423-676-2869",
            text: "Richard Mahoney",
            width: 200
        }, {
             key: 3,
            avatar: "images/avatar/3.jpg",
            favorite: false,           
            link: "#",
            phone: "859-496-2817",
            text: "Donna Price",
             width: 300
        }, {
            key: 4,
            avatar: "images/avatar/4.jpg",
            favorite: false,            
            link: "#",
            phone: "901-747-3428",
            text: "Lisa Landers",
            width: 200
        }, {
             key: 5,
            avatar: "images/avatar/12.jpg",
            favorite: true,           
            link: "#",
            phone: "573-394-9254",
            text: "Dorothy H. Spencer",
            width: 200
        }, {
             key: 6,
            avatar: "images/avatar/13.jpg",
            favorite: false,           
            link: "#",
            phone: "323-668-1482",
            text: "Stephanie May",
            width: 100
        }, {
            key: 7,
            avatar: "images/avatar/14.jpg",
            favorite: false,            
            link: "#",
            phone: "401-661-3742",
            text: "Marianne Taylor",
            width: 100
        }, {
            key: 8,
            avatar: "images/avatar/15.jpg",
            favorite: true,           
            link: "#",
            phone: "662-374-2920",
            text: "Tammie Alvarez",
            width: 300
        }, {
            key: 9,
            avatar: "images/avatar/16.jpg",
            favorite: true,           
            link: "#",
            phone: "240-455-2267",
            text: "Charlotte Flores",
            width: 200
        }, {
            key: 10,
            avatar: "images/avatar/17.jpg",
            favorite: false,            
            link: "#",
            phone: "724-742-0979",
            text: "Ward Riley",
            width: 100
        }];
	for(let i = 10; i < 100000; i++) {
        var obj = Object.assign({}, data[i % 10]);
        obj["key"] = i;
        data.push(obj);
	}
    this.data = data;
}

scrNextRow(){
    this.virtDirVertical.scrollNext();
}
scrPrevRow(){
    this.virtDirVertical.scrollPrev();
}
scrNextCol(){
    this.virtDirHorizontal.scrollNext();
}
scrPrevCol(){
    this.virtDirHorizontal.scrollPrev();
}

}