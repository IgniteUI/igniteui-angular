import {Directive, HostListener, Input} from "@angular/core";
import {NavigationService} from "./nav-service";

// TODO: (style) NavToggleDirective, igNavToggle selector ?
@Directive({ selector: "[igxNavToggle]" })
export class NavigationToggle {
    public state: NavigationService;

    @Input("igxNavToggle") private target;

    constructor(nav: NavigationService) {
        this.state = nav;
    }

    @HostListener("click")
    public toggleNavigationDrawer() {
        this.state.toggle(this.target, true);
    }
}

// TODO: (style) NavCloseDirective, igNavClose selector ?
@Directive({ selector: "[igxNavClose]" })
export class NavigationClose {
    public state: NavigationService;

    @Input("igxNavClose") private target;

    constructor(nav: NavigationService) {
        this.state = nav;
    }

    @HostListener("click")
    public closeNavigationDrawer() {
        this.state.close(this.target, true);
    }
}
