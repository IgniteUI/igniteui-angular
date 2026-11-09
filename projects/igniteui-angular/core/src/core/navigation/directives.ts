import { Directive, HostListener, Input, inject } from '@angular/core';
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
    /**
     * The ID of the target registered in the navigation service, which is toggled on click.
     *
     * @example
     * ```html
     * <button type="button" igxNavToggle="navDrawer">Toggle</button>
     * ```
     */
    @Input('igxNavToggle') public target: any;

    public state: IgxNavigationService;

    constructor() {
        const nav = inject(IgxNavigationService);

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
    /**
     * The ID of the target registered in the navigation service, which is closed on click.
     *
     * @example
     * ```html
     * <button type="button" igxNavClose="navDrawer">Close</button>
     * ```
     */
    @Input('igxNavClose') public target: any;

    public state: IgxNavigationService;

    constructor() {
        const nav = inject(IgxNavigationService);

        this.state = nav;
    }

    @HostListener('click')
    public closeNavigationDrawer() {
        this.state.close(this.target, true);
    }
}
