import { Component, NgModule, AfterViewInit, Renderer, ViewChild, ViewChildren, QueryList, ElementRef } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { RouterModule, Router } from '@angular/router';

@Component({
    selector: "tabbar-sample",
    moduleId: module.id,
    templateUrl: 'sample.component.html',
    styleUrls: ['sample.component.css', '../app.samples.css']
})
export class TabBarSampleComponent {
    @ViewChildren('tabbarEl') tabbar: QueryList<ElementRef>;

    private contacts: Array<Object> = [
        { key: "1", text: "Terrance Orta", phone: "770-504-2217" ,avatar: "../demos/app/avatar/images/1.jpg", favorite: true, link: "#" },
        { key: "2", text: "Richard Mahoney", phone: "423-676-2869", avatar: "../demos/app/avatar/images/2.jpg", favorite: false, link: "#" },
        { key: "3", text: "Donna Price", phone: "859-496-2817", avatar: "../demos/app/avatar/images/3.jpg", favorite: false, link: "#" },
        { key: "4", text: "Lisa Landers", phone: "901-747-3428", avatar: "../demos/app/avatar/images/4.jpg", favorite: false, link: "#" },
        { key: "5", text: "Dorothy H. Spencer", phone: "573-394-9254", avatar: "../demos/app/avatar/images/12.jpg", favorite: true, link: "#" },
        { key: "6", text: "Stephanie May", phone: "323-668-1482", avatar: "../demos/app/avatar/images/13.jpg", favorite: false, link: "#" },
        { key: "7", text: "Marianne Taylor", phone: "401-661-3742", avatar: "../demos/app/avatar/images/14.jpg", favorite: false, link: "#" }
    ];

    options: Object = {};

    constructor(private router: Router, private renderer: Renderer) { }

    route(event) {
        if (event.panel.index == 2) {
            this.router.navigate(['/tabbar', { outlets: { 'tabPanelOutlet': ['tabbarInnerPath'] } }]);
        }
    }

    ngAfterViewInit() {
        this.tabbar.map(e => {
            menubar = e.nativeElement.querySelector('.igx-tab-bar__menu');
            this.renderer.setElementStyle(menubar, 'position', 'absolute');
        });
    }
}

@Component({
    selector: "custom-content",
    moduleId: module.id,
    templateUrl: 'template.html'
})

export class CustomContentComponent {

}
