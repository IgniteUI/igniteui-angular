
import { Directive, ElementRef, HostBinding, HostListener, inject } from '@angular/core';
import { PlatformUtil } from '../core/utils';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabHeaderBase, IgxTabsBase } from './tabs.base';

@Directive()
export abstract class IgxTabHeaderDirective implements IgxTabHeaderBase {
    /** @hidden */
    protected tabs = inject(IgxTabsBase);
    /** @hidden */
    public tab = inject(IgxTabItemDirective);
    /** @hidden */
    private elementRef = inject(ElementRef<HTMLElement>);
    /** @hidden */
    protected platform = inject(PlatformUtil);

    /** @hidden */
    @HostBinding('attr.role')
    public role = 'tab';    

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
        if (this.tab.panelComponent) {
            this.tabs.selectTab(this.tab, true);
        }
    }

    /** @hidden */
    public get nativeElement() {
        return this.elementRef.nativeElement;
    }
}
