import { Directive, HostListener, Input, NgModule } from '@angular/core';
import {IgxNavigationService} from './nav.service';

/**
 * Directive that can toggle targets through provided NavigationService.
 *
 * Usage:
 * ```
 * <button igxNavToggle="ID"> Toggle </button>
 * ```
 * Where the `ID` matches the ID of compatible `IToggleView` component.
 */
@Directive({ selector: '[igxNavToggle]' })
export class IgxNavigationToggleDirective {
    public state: IgxNavigationService;

    @Input('igxNavToggle') private target;

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
 * <button igxNavClose="ID"> Close </button>
 * ```
 * Where the `ID` matches the ID of compatible `IToggleView` component.
 */
@Directive({ selector: '[igxNavClose]' })
export class IgxNavigationCloseDirective {
    public state: IgxNavigationService;

    @Input('igxNavClose') private target;

    constructor(nav: IgxNavigationService) {
        this.state = nav;
    }

    @HostListener('click')
    public closeNavigationDrawer() {
        this.state.close(this.target, true);
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxNavigationCloseDirective, IgxNavigationToggleDirective],
    exports: [IgxNavigationCloseDirective, IgxNavigationToggleDirective],
    providers: [IgxNavigationService]
})
export class IgxNavigationModule {}
