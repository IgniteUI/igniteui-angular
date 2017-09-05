import {Directive, HostListener, Input} from "@angular/core";
import {NavigationService} from "./nav-service";

/**
 * Directive that can toggle targets through provided NavigationService.
 *
 * Usage:
 * ```
 * <button igxNavToggle="ID"> Toggle </button>
 * ```
 * Where the `ID` matches the ID of compatible `IToggleView` component.
 */
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

/**
 * Directive that can close targets through provided NavigationService.
 *
 * Usage:
 * ```
 * <button igxNavClose="ID"> Close </button>
 * ```
 * Where the `ID` matches the ID of compatible `IToggleView` component.
 */
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
