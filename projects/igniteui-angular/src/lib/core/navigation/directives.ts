import { Directive, HostListener, Input } from '@angular/core';
import { IgxNavigationService } from './nav.service';

/**
 * Directive that can toggle targets through provided NavigationService.
 *
 * Usage:
 * ```
 * <button type="button" igxNavToggle="ID">Toggle</button>
 * ```
 * Where the `ID` matches the ID of compatible `IToggleView` component.
 */
@Directive({
    selector: '[igxNavToggle]',
    standalone: true
})
export class IgxNavigationToggleDirective {
    @Input('igxNavToggle') private target;

    public state: IgxNavigationService;

    constructor(nav: IgxNavigationService) {
        this.state = nav;
    }

    @HostListener('click')
    public toggleNavigationDrawer() {
        this.state.toggle(this.target, true);
    }
}

/**
 * Directive that can close targets through provided NavigationService.
 *
 * Usage:
 * ```
 * <button type="button" igxNavClose="ID">Close</button>
 * ```
 * Where the `ID` matches the ID of compatible `IToggleView` component.
 */
@Directive({
    selector: '[igxNavClose]',
    standalone: true
})
export class IgxNavigationCloseDirective {
    @Input('igxNavClose') private target;

    public state: IgxNavigationService;

    constructor(nav: IgxNavigationService) {
        this.state = nav;
    }

    @HostListener('click')
    public closeNavigationDrawer() {
        this.state.close(this.target, true);
    }
}
