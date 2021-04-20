import { Directive, DoCheck, ElementRef, NgZone, Renderer2 } from '@angular/core';
import { IgxTabsComponent } from './tabs.component';

@Directive({
    selector: 'igx-tab-header-label,[igxTabHeaderLabel]'
})
export class IgxTabHeaderLabelDirective { }

@Directive({
    selector: 'igx-tab-header-icon,[igxTabHeaderIcon]'
})
export class IgxTabHeaderIconDirective { }

/** @hidden */
enum TabScrollButtonStyle {
    Visible = 'visible',
    Hidden = 'hidden',
    NotDisplayed = 'not_displayed'
}

const getTabItemsContainerWidth = (tabs: IgxTabsComponent) => {
    // We use this hacky way to get the width of the itemsContainer,
    // because there is inconsistency in IE we cannot use offsetWidth or scrollOffset.
    const itemsContainerChildrenCount = tabs.itemsContainer.nativeElement.children.length;
    let itemsContainerWidth = 0;
    if (itemsContainerChildrenCount > 1) {
        const lastTab = tabs.itemsContainer.nativeElement.children[itemsContainerChildrenCount - 2] as HTMLElement;
        itemsContainerWidth = lastTab.offsetLeft + lastTab.offsetWidth;
    }

    return itemsContainerWidth;
};

/** @hidden */
@Directive({
    selector: '[igxRightButtonStyle]'
})
export class IgxRightButtonStyleDirective implements DoCheck {

    private _visibleCss = 'igx-tabs__header-button';
    private _hiddenCss = 'igx-tabs__header-button--hidden';
    private _notDisplayedCss = 'igx-tabs__header-button--none';
    private _tabScrollButtonStyle: string;

    constructor(public tabs: IgxTabsComponent, private element: ElementRef, public renderer: Renderer2, private ngZone: NgZone) {
    }

    public ngDoCheck(): void {
        this.ngZone.runOutsideAngular(() => {
            Promise.resolve().then(() => {
            const rightButtonStyle = this.getRightButtonStyle();

            if (rightButtonStyle === TabScrollButtonStyle.Hidden
                && this._tabScrollButtonStyle !== TabScrollButtonStyle.Hidden) {
                    this._tabScrollButtonStyle = TabScrollButtonStyle.Hidden;
                    this.ngZone.run(() => {
                        this.renderer.removeClass(this.element.nativeElement, this._visibleCss);
                        this.renderer.removeClass(this.element.nativeElement, this._notDisplayedCss);
                        this.renderer.addClass(this.element.nativeElement, this._hiddenCss);
                    });
                }
            if (rightButtonStyle === TabScrollButtonStyle.NotDisplayed
                && this._tabScrollButtonStyle !== TabScrollButtonStyle.NotDisplayed) {
                    this._tabScrollButtonStyle = TabScrollButtonStyle.NotDisplayed;
                    this.ngZone.run(() => {
                        this.renderer.removeClass(this.element.nativeElement, this._visibleCss);
                        this.renderer.removeClass(this.element.nativeElement, this._hiddenCss);
                        this.renderer.addClass(this.element.nativeElement, this._notDisplayedCss);
                    });
                }
            if (rightButtonStyle === TabScrollButtonStyle.Visible
                && this._tabScrollButtonStyle !== TabScrollButtonStyle.Visible) {
                    this._tabScrollButtonStyle = TabScrollButtonStyle.Visible;
                    this.ngZone.run(() => {
                        this.renderer.removeClass(this.element.nativeElement, this._notDisplayedCss);
                        this.renderer.removeClass(this.element.nativeElement, this._hiddenCss);
                        this.renderer.addClass(this.element.nativeElement, this._visibleCss);
                    });
                }
            });
        });
    }

    private getRightButtonStyle(): string {
        const viewPortWidth = this.tabs.viewPort.nativeElement.offsetWidth;
        const itemsContainerWidth = getTabItemsContainerWidth(this.tabs);
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
export class IgxLeftButtonStyleDirective implements DoCheck {
    private _visibleCss = 'igx-tabs__header-button';
    private _hiddenCss = 'igx-tabs__header-button--hidden';
    private _notDisplayedCss = 'igx-tabs__header-button--none';
    private _tabScrollButtonStyle: string;

    constructor(public tabs: IgxTabsComponent, private element: ElementRef, public renderer: Renderer2, private ngZone: NgZone) {
    }

    public ngDoCheck(): void {
        this.ngZone.runOutsideAngular(() => {
            Promise.resolve().then(() => {
            const leftButtonStyle = this.getLeftButtonStyle();

            if (leftButtonStyle === TabScrollButtonStyle.Hidden
                && this._tabScrollButtonStyle !== TabScrollButtonStyle.Hidden) {
                    this._tabScrollButtonStyle = TabScrollButtonStyle.Hidden;
                    this.ngZone.run(() => {
                        this.renderer.removeClass(this.element.nativeElement, this._visibleCss);
                        this.renderer.removeClass(this.element.nativeElement, this._notDisplayedCss);
                        this.renderer.addClass(this.element.nativeElement, this._hiddenCss);
                    });
                }
            if (leftButtonStyle === TabScrollButtonStyle.NotDisplayed
                && this._tabScrollButtonStyle !== TabScrollButtonStyle.NotDisplayed) {
                    this._tabScrollButtonStyle = TabScrollButtonStyle.NotDisplayed;
                    this.ngZone.run(() => {
                        this.renderer.removeClass(this.element.nativeElement, this._visibleCss);
                        this.renderer.removeClass(this.element.nativeElement, this._hiddenCss);
                        this.renderer.addClass(this.element.nativeElement, this._notDisplayedCss);
                    });
                }
            if (leftButtonStyle === TabScrollButtonStyle.Visible
                && this._tabScrollButtonStyle !== TabScrollButtonStyle.Visible) {
                    this._tabScrollButtonStyle = TabScrollButtonStyle.Visible;
                    this.ngZone.run(() => {
                        this.renderer.removeClass(this.element.nativeElement, this._notDisplayedCss);
                        this.renderer.removeClass(this.element.nativeElement, this._hiddenCss);
                        this.renderer.addClass(this.element.nativeElement, this._visibleCss);
                    });
                }
            });
        });
    }

    private getLeftButtonStyle(): string {
        const itemsContainerWidth = getTabItemsContainerWidth(this.tabs);
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
