import { Component, HostBinding } from '@angular/core';
import { IgxTabsBase } from '../tabs.base';
import { IgxTabsDirective } from '../tabs.directive';

@Component({
    selector: 'igx-tabs',
    templateUrl: 'tabs.component.html',
    styles: [
        `:host {
            position: relative;
            height: 100%;
        }`
    ],
    providers: [{ provide: IgxTabsBase, useExisting: IgxTabsComponent }]
})
export class IgxTabsComponent extends IgxTabsDirective {
    /** @hidden */
    @HostBinding('attr.class')
    public get cssClass() {
        const defaultStyle = `igx-tabs`;
        // const fixedStyle = `igx-tabs--fixed`;
        const iconStyle = `igx-tabs--icons`;
        const iconFound =  true;// TODO this.tabs.some((tab) => !!tab.icon && !!tab.label);
        let css: string = defaultStyle;
        // switch (IgxTabsType[this.type.toUpperCase()]) {
        //     case IgxTabsType.FIXED: {
        //         css = fixedStyle;
        //         break;
        //     }
        //     default: {
        //         css = defaultStyle;
        //         break;
        //     }
        // }

        // Layout fix for items with icons
        if (iconFound !== undefined) {
            css = `${css} ${iconStyle}`;
        }

        return `${css}`;
    }
}

