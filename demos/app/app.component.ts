import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import "rxjs/add/operator/filter";
import { IgxNavigationDrawerComponent, IgxNavigationDrawerModule } from "../lib/main";
import "../style/igniteui-theme.scss";

@Component({
    selector: "sample-app",
    styleUrls: ["app.component.css"],
    templateUrl: "app.component.html"
})
export class AppComponent {
    @ViewChild("navdrawer") public navdrawer: IgxNavigationDrawerComponent;

    public drawerState = {
        enableGestures: true,
        open: true,
        pin: false,
        pinThreshold: 768,
        position: "left",
        width: "300px",
        miniWidth: "80px",
        miniVariant: false
    };

    public componentLinks = [
        {
            link: "/avatar",
            icon: "account_circle",
            name: "Avatar"
        },
        {
            link: "/badge",
            icon: "error",
            name: "Badge"
        },
        {
            link: "/buttonGroup",
            icon: "group_work",
            name: "Button Group"
        },
        {
            link: "/calendar",
            icon: "event",
            name: "Calendar"
        },
        {
            link: "/card",
            icon: "home",
            name: "Card"
        },
        {
            link: "/carousel",
            icon: "view_carousel",
            name: "Carousel"
        },
        {
            link: "/datePicker",
            icon: "date_range",
            name: "DatePicker"
        },
        {
            link: "/timePicker",
            icon: "date_range",
            name: "TimePicker"
        },
        {
            link: "/grid",
            icon: "view_column",
            name: "Grid"
        },
        {
            link: "/gridPerformance",
            icon: "view_column",
            name: "Grid Performance"
        },
        {
            link: "/dialog",
            icon: "all_out",
            name: "Dialog"
        },
        {
            link: "/inputs",
            icon: "web",
            name: "Forms"
        },
        {
            link: "/icon",
            icon: "android",
            name: "Icon"
        },
        {
            link: "/list",
            icon: "list",
            name: "List"
        },
        {
            link: "/listPerformance",
            icon: "list",
            name: "List Performance"
        },
        {
            link: "/navbar",
            icon: "arrow_back",
            name: "Navbar"
        },
        {
            link: "/navdrawer",
            icon: "menu",
            name: "Navdrawer"
        },
        {
            link: "/progressbar",
            icon: "poll",
            name: "Progress Indicators"
        },
        {
            link: "/slider",
            icon: "linear_scale",
            name: "Slider"
        },
        {
            link: "/snackbar",
            icon: "feedback",
            name: "Snackbar"
        },
        {
            link: "/tabbar",
            icon: "tab",
            name: "Tabbar"
        },
        {
            link: "/toast",
            icon: "android",
            name: "Toast"
        }
    ];

    public directiveLinks = [
        {
            link: "/buttons",
            icon: "radio_button_unchecked",
            name: "Buttons"
        },
        {
            link: "/layout",
            icon: "view_quilt",
            name: "Layout"
        },
        {
            link: "/ripple",
            icon: "wifi_tethering",
            name: "Ripple"
        },
        {
            link: "/virtualForDirective",
            icon: "view_column",
            name: "Virtual-For Directive"
        },
        {
            link: "/mask",
            icon: "view_column",
            name: "Mask Directive"
        }
    ];

    public styleLinks = [
        {
            link: "/colors",
            icon: "color_lens",
            name: "Colors"
        },
        {
            link: "/typography",
            icon: "font_download",
            name: "Typography"
        },
        {
            link: "/shadows",
            icon: "layers",
            name: "Shadows"
        }
    ];

    constructor(private router: Router) { }
    public ngOnInit(): void {
        this.router.events
            .filter((x) => x instanceof NavigationStart)
            .subscribe((event: NavigationStart) => {
                if (event.url !== "/" && !this.drawerState.pin) {
                    // Close drawer when a sample is selected
                    this.navdrawer.close();
                }
            });
    }
}
