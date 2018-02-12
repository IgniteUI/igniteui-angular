import { Directive, HostListener, Input, NgModule } from "@angular/core";
import {IgxNavigationService} from "./nav-service";

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
export class IgxNavigationToggle {
    public state: IgxNavigationService;

    @Input("igxNavToggle") private target;

    constructor(nav: IgxNavigationService) {
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
export class IgxNavigationClose {
    public state: IgxNavigationService;

    @Input("igxNavClose") private target;

    constructor(nav: IgxNavigationService) {
        this.state = nav;
    }

    @HostListener("click")
    public closeNavigationDrawer() {
        this.state.close(this.target, true);
    }
}

@NgModule({
    declarations: [IgxNavigationClose, IgxNavigationToggle],
    exports: [IgxNavigationClose, IgxNavigationToggle],
    providers: [IgxNavigationService]
})
export class IgxNavigationDirectives {}
