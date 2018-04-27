import { AfterViewInit,
        Component,
        ElementRef,
        NgModule,
        QueryList,
        Renderer2,
        ViewChild,
        ViewChildren } from "@angular/core";
import { Router, RouterModule } from "@angular/router";

@Component({
    selector: "tabbar-sample",
    styleUrls: ["sample.component.css", "../app.samples.css"],
    templateUrl: "sample.component.html"
})
export class TabBarSampleComponent implements AfterViewInit {
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
    }, {
        avatar: "/images/avatar/12.jpg",
        favorite: true,
        key: "5",
        link: "#",
        phone: "573-394-9254",
        text: "Dorothy H. Spencer"
    }, {
        avatar: "/images/avatar/13.jpg",
        favorite: false,
        key: "6",
        link: "#",
        phone: "323-668-1482",
        text: "Stephanie May"
    }, {
        avatar: "/images/avatar/14.jpg",
        favorite: false,
        key: "7",
        link: "#",
        phone: "401-661-3742",
        text: "Marianne Taylor"
    }];

    constructor(private router: Router, private renderer: Renderer2) { }

    public route(event) {
        if (event.panel.index === 2) {
            this.router.navigate(["/tabbar", { outlets: { tabPanelOutlet: ["tabbarInnerPath"] } }]);
        }
    }

    public ngAfterViewInit() {
        this.tabbar.map((e) => {
            menubar = e.nativeElement.querySelector(".igx-bottom-nav__menu");
            this.renderer.setStyle(menubar, "position", "absolute");
        });
    }
}

@Component({
    selector: "custom-content",
    templateUrl: "template.html"
})

export class CustomContentComponent {

}
