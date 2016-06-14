import {Directive, HostListener, Input} from '@angular/core';
import {NavigationService} from './nav-service';

// TODO: (style) NavToggleDirective, igNavToggle selector ?
@Directive({ selector: '[ig-nav-toggle]' })
export class NavigationToggle {
    state: NavigationService;
    
    @Input("ig-nav-toggle") private target;

    constructor(nav: NavigationService) {
        this.state = nav;
    }
    
    @HostListener('click') toggleNavigationDrawer () {
        this.state.toggle(this.target, true);
    }
}

// TODO: (style) NavCloseDirective, igNavClose selector ?
@Directive({ selector: '[ig-nav-close]' })
export class NavigationClose {
    state: NavigationService;
    
    @Input("ig-nav-close") private target;
    
    constructor(nav: NavigationService) {
        this.state = nav;
    }
    
    @HostListener('click') closeNavigationDrawer () {
        this.state.close(this.target, true);
    }
}