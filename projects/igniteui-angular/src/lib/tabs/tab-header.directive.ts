
import { Directive, ElementRef, HostBinding, HostListener, Optional, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlatformUtil } from '../core/utils';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabHeaderBase, IgxTabsBase } from './tabs.base';

@Directive()
export abstract class IgxTabHeaderDirective implements IgxTabHeaderBase {

    /** @hidden */
    @HostBinding('attr.role')
    public role = 'tab';

    /** @hidden */
    constructor(
        protected tabs: IgxTabsBase,
        public tab: IgxTabItemDirective,
        private elementRef: ElementRef<HTMLElement>,
        protected platform: PlatformUtil
    ) { 
        // Inject RouterLink directive if present
        this.routerLink = inject(RouterLink, { optional: true });
    }

    /** @hidden */
    private routerLink?: RouterLink;

    /** @hidden */
    @HostBinding('attr.tabindex')
    public get tabIndex() {
        return this.tab.selected ? 0 : -1;
    }

    /** @hidden */
    @HostBinding('attr.aria-selected')
    public get ariaSelected() {
        return this.tab.selected;
    }

    /** @hidden */
    @HostBinding('attr.aria-disabled')
    public get ariaDisabled() {
        return this.tab.disabled;
    }

    /** @hidden */
    @HostListener('click')
    public onClick() {
        // For routing tabs, let the RouterLink handle navigation and don't select the tab immediately
        // For other tabs (content tabs or action tabs), allow immediate selection
        if (!this.routerLink) {
            this.tabs.selectTab(this.tab, true);
        }
    }

    /** @hidden */
    public get nativeElement() {
        return this.elementRef.nativeElement;
    }
}
