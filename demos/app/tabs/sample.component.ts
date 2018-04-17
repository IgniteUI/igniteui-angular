import {
    AfterViewInit,
    Component,
    ElementRef,
    NgModule,
    QueryList,
    Renderer2,
    ViewChild,
    ViewChildren
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";

@Component({
    selector: "tabs-sample",
    styleUrls: ["sample.component.css", "../app.samples.css"],
    templateUrl: "sample.component.html"
})
export class TabsSampleComponent implements AfterViewInit {
    @ViewChildren("tabbarEl") public tabbar: QueryList<ElementRef>;

    public options: object = {};

    private contacts: object[] = [{
        avatar: "/images/avatar/1.jpg",
        favorite: true,
        key: "1",
        link: "#",
        phone: "770-504-2217",
        text: "Terrance Orta"
    }, {
        avatar: "/images/avatar/2.jpg",
        favorite: false,
        key: "2",
        link: "#",
        phone: "423-676-2869",
        text: "Richard Mahoney"
    }, {
        avatar: "/images/avatar/3.jpg",
        favorite: false,
        key: "3",
        link: "#",
        phone: "859-496-2817",
        text: "Donna Price"
    }, {
        avatar: "/images/avatar/4.jpg",
        favorite: false,
        key: "4",
        link: "#",
        phone: "901-747-3428",
        text: "Lisa Landers"
    }];

    constructor(private router: Router, private renderer: Renderer2) { }

    public route(event) {
        if (event.panel.index === 2) {
            this.router.navigate(["/tabs", { outlets: { tabPanelOutlet: ["tabbarInnerPath"] } }]);
        }
    }

    public ngAfterViewInit() {
    }
}

@Component({
    selector: "custom-content",
    templateUrl: "template.html"
})

export class CustomContentComponent {

}
