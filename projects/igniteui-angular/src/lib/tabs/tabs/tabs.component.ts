import { Component, HostBinding } from '@angular/core';
import { IgxTabsBaseNew } from '../tabs-base';
import { IgxTabsDirective } from '../tabs.directive';

@Component({
    selector: 'igx-tabs-new',
    templateUrl: 'tabs.component.html',
    styles: [
        `:host {
            position: relative;
            height: 100%;
        }`
    ],
    providers: [{ provide: IgxTabsBaseNew, useExisting: IgxTabsNewComponent }]
})
export class IgxTabsNewComponent extends IgxTabsDirective {
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

