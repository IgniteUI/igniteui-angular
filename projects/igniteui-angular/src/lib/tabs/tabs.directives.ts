import {
    Directive,
    Host,
    HostBinding,
    TemplateRef
} from '@angular/core';
import { IgxTabsBase } from './tabs.common';

enum ButtonStyle {
    VISIBLE = 'visible',
    HIDDEN = 'hidden',
    NOT_DISPLAYED = 'not_displayed'
}

@Directive({
    selector: '[igxRightButtonStyle]'
})

export class IgxRightButtonStyleDirective {
    constructor(public tabs: IgxTabsBase) {
    }

    private getRightButtonStyle() {
        const viewPortWidth = this.tabs.viewPort.nativeElement.offsetWidth;
        const itemsContainerWidth = this.tabs.itemsContainer.nativeElement.offsetWidth;
        const headerContainerWidth = this.tabs.headerContainer.nativeElement.offsetWidth;
        const offset = this.tabs.offset;
        const total = offset + viewPortWidth;

        if (itemsContainerWidth <= headerContainerWidth && offset === 0) {
            return ButtonStyle.NOT_DISPLAYED;
        }

        if (itemsContainerWidth > total) {
            return ButtonStyle.VISIBLE;
        } else {
            return ButtonStyle.HIDDEN;
        }
    }

    @HostBinding('class.igx-tabs__header-button')
    get visibleCSS(): boolean {
        return (this.getRightButtonStyle() === ButtonStyle.VISIBLE) ? true : false;
    }

    @HostBinding('class.igx-tabs__header-button--hidden')
    get hiddenCSS(): boolean {
        return (this.getRightButtonStyle() === ButtonStyle.HIDDEN) ? true : false;
    }

    @HostBinding('class.igx-tabs__header-button--none')
    get notDisplayedCSS(): boolean {
        return (this.getRightButtonStyle() === ButtonStyle.NOT_DISPLAYED) ? true : false;
    }
}

@Directive({
    selector: '[igxLeftButtonStyle]'
})

export class IgxLeftButtonStyleDirective {
    constructor(public tabs: IgxTabsBase) {
    }

    private getLeftButtonStyle() {
        const itemsContainerWidth = this.tabs.itemsContainer.nativeElement.offsetWidth;
        const headerContainerWidth = this.tabs.headerContainer.nativeElement.offsetWidth;
        const offset = this.tabs.offset;

        if (offset === 0) {
            if (itemsContainerWidth <= headerContainerWidth) {
                return ButtonStyle.NOT_DISPLAYED;
            }
            return ButtonStyle.HIDDEN;
        } else {
            return ButtonStyle.VISIBLE;
        }
    }

    @HostBinding('class.igx-tabs__header-button')
    get visibleCSS(): boolean {
        return (this.getLeftButtonStyle() === ButtonStyle.VISIBLE) ? true : false;
    }

    @HostBinding('class.igx-tabs__header-button--hidden')
    get hiddenCSS(): boolean {
        return (this.getLeftButtonStyle() === ButtonStyle.HIDDEN) ? true : false;
    }

    @HostBinding('class.igx-tabs__header-button--none')
    get notDisplayedCSS(): boolean {
        return (this.getLeftButtonStyle() === ButtonStyle.NOT_DISPLAYED) ? true : false;
    }
}

@Directive({
    selector: '[igxTab]'
})
export class IgxTabItemTemplateDirective {

    constructor(public template: TemplateRef<any>) {
    }
}
