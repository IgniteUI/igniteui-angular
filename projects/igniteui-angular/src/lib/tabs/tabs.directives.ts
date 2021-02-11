import {
    Directive,
    HostBinding,
    TemplateRef
} from '@angular/core';
import { IgxTabsBase } from './tabs.common';

enum TabScrollButtonStyle {
    Visible = 'visible',
    Hidden = 'hidden',
    NotDisplayed = 'not_displayed'
}

@Directive({
    selector: '[igxRightButtonStyle]'
})

export class IgxRightButtonStyleDirective {
    constructor(public tabs: IgxTabsBase) {
    }

    @HostBinding('class.igx-tabs__header-button')
    public get visibleCSS(): boolean {
        return (this.getRightButtonStyle() === TabScrollButtonStyle.Visible) ? true : false;
    }

    @HostBinding('class.igx-tabs__header-button--hidden')
    public get hiddenCSS(): boolean {
        return (this.getRightButtonStyle() === TabScrollButtonStyle.Hidden) ? true : false;
    }

    @HostBinding('class.igx-tabs__header-button--none')
    public get notDisplayedCSS(): boolean {
        return (this.getRightButtonStyle() === TabScrollButtonStyle.NotDisplayed) ? true : false;
    }

    private getRightButtonStyle(): string {
        const viewPortWidth = this.tabs.viewPort.nativeElement.offsetWidth;

        // We use this hacky way to get the width of the itemsContainer,
        // because there is inconsistency in IE we cannot use offsetWidth or scrollOffset.
        const itemsContainerChildrenCount = this.tabs.itemsContainer.nativeElement.children.length;
        let itemsContainerWidth = 0;
        if (itemsContainerChildrenCount > 1) {
            const lastTab = this.tabs.itemsContainer.nativeElement.children[itemsContainerChildrenCount - 2];
            itemsContainerWidth = lastTab.offsetLeft + lastTab.offsetWidth;
        }
        const headerContainerWidth = this.tabs.headerContainer.nativeElement.offsetWidth;
        const offset = this.tabs.offset;
        const total = offset + viewPortWidth;

        // Fix for IE 11, a difference is accumulated from the widths calculations.
        if (itemsContainerWidth - headerContainerWidth <= 1 && offset === 0) {
            return TabScrollButtonStyle.NotDisplayed;
        }

        if (itemsContainerWidth > total) {
            return TabScrollButtonStyle.Visible;
        } else {
            return TabScrollButtonStyle.Hidden;
        }
    }
}

@Directive({
    selector: '[igxLeftButtonStyle]'
})

export class IgxLeftButtonStyleDirective {
    constructor(public tabs: IgxTabsBase) {
    }

    @HostBinding('class.igx-tabs__header-button')
    public get visibleCSS(): boolean {
        return (this.getLeftButtonStyle() === TabScrollButtonStyle.Visible) ? true : false;
    }

    @HostBinding('class.igx-tabs__header-button--hidden')
    public get hiddenCSS(): boolean {
        return (this.getLeftButtonStyle() === TabScrollButtonStyle.Hidden) ? true : false;
    }

    @HostBinding('class.igx-tabs__header-button--none')
    public get notDisplayedCSS(): boolean {
        return (this.getLeftButtonStyle() === TabScrollButtonStyle.NotDisplayed) ? true : false;
    }

    private getLeftButtonStyle(): string {
        // We use this hacky way to get the width of the itemsContainer,
        // because there is inconsistency in IE we cannot use offsetWidth or scrollOffset.
        const itemsContainerChildrenCount = this.tabs.itemsContainer.nativeElement.children.length;
        let itemsContainerWidth = 0;
        if (itemsContainerChildrenCount > 1) {
            const lastTab = this.tabs.itemsContainer.nativeElement.children[itemsContainerChildrenCount - 2];
            itemsContainerWidth = lastTab.offsetLeft + lastTab.offsetWidth;
        }
        const headerContainerWidth = this.tabs.headerContainer.nativeElement.offsetWidth;
        const offset = this.tabs.offset;
        if (offset === 0) {
            // Fix for IE 11, a difference is accumulated from the widths calculations.
            if (itemsContainerWidth - headerContainerWidth <= 1) {
                return TabScrollButtonStyle.NotDisplayed;
            }
            return TabScrollButtonStyle.Hidden;
        } else {
            return TabScrollButtonStyle.Visible;
        }
    }
}

@Directive({
    selector: '[igxTab]'
})
export class IgxTabItemTemplateDirective {

    constructor(public template: TemplateRef<any>) {
    }
}
