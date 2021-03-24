import { Component, ElementRef, HostBinding, Input, ViewChild } from '@angular/core';
import { mkenum } from '../../core/utils';
import { IgxTabsBase } from '../tabs.base';
import { IgxTabsDirective } from '../tabs.directive';

export const IgxTabsAlignment = mkenum({
    start: 'start',
    end: 'end',
    center: 'center',
    justify: 'justify'
});
export type IgxTabsAlignment = (typeof IgxTabsAlignment)[keyof typeof IgxTabsAlignment];

/** @hidden */
let NEXT_TAB_ID = 0;

@Component({
    selector: 'igx-tabs',
    templateUrl: 'tabs.component.html',
    providers: [{ provide: IgxTabsBase, useExisting: IgxTabsComponent }]
})
export class IgxTabsComponent extends IgxTabsDirective {

    @Input()
    public tabAlignment: string | IgxTabsAlignment = 'start';

    /** @hidden */
    @ViewChild('headerContainer', { static: true })
    public headerContainer: ElementRef;

    /** @hidden */
    @ViewChild('viewPort', { static: true })
    public viewPort: ElementRef;

    /** @hidden */
    @ViewChild('itemsContainer', { static: true })
    public itemsContainer: ElementRef;

    /** @hidden */
    @ViewChild('selectedIndicator')
    public selectedIndicator: ElementRef;

    /** @hidden */
    @HostBinding('class.igx-tabs')
    public defaultClass = true;

    /** @hidden */
    @HostBinding('class.igx-tabs--icons')
    // TODO this.tabs.some((tab) => !!tab.icon && !!tab.label);
    public iconsClass = true;

    /** @hidden */
    @HostBinding('class.igx-tabs--justify')
    public get justifyAlignmentClass() {
        return this.tabAlignment === 'justify';
    }

    /** @hidden */
    @HostBinding('class.igx-tabs--start')
    public get startAlignmentClass() {
        return this.tabAlignment === 'start';
    }

    /** @hidden */
    @HostBinding('class.igx-tabs--end')
    public get endAlignmentClass() {
        return this.tabAlignment === 'end';
    }

    /** @hidden */
    @HostBinding('class.igx-tabs--center')
    public get centerAlignmentClass() {
        return this.tabAlignment === 'center';
    }

    /**  @hidden */
     public offset = 0;

    /** @hidden */
    protected componentName = 'igx-tabs';

    /** @hidden */
    public scrollLeft() {
        this.scroll(false);
    }

    /** @hidden */
    public scrollRight() {
        this.scroll(true);
    }

    /** @hidden */
    public realignSelectedIndicator() {
        if (this.selectedIndex >=0 && this.selectedIndex < this.items.length) {
            const tabItems = this.items.toArray();
            const header = tabItems[this.selectedIndex].headerComponent.nativeElement;
            this.alignSelectedIndicator(header, 0);
        }
    }

    /** @hidden */
    protected scrollTabHeaderIntoView() {
        if (this.selectedIndex >= 0) {
            const tabItems = this.items.toArray();
            const tabHeaderNativeElement = tabItems[this.selectedIndex].headerComponent.nativeElement;

            // Scroll left if there is need
            if (tabHeaderNativeElement.offsetLeft < this.offset) {
                this.scrollElement(tabHeaderNativeElement, false);
            }

            // Scroll right if there is need
            const viewPortOffsetWidth = this.viewPort.nativeElement.offsetWidth;
            const delta = (tabHeaderNativeElement.offsetLeft + tabHeaderNativeElement.offsetWidth) - (viewPortOffsetWidth + this.offset);

            // Fix for IE 11, a difference is accumulated from the widths calculations
            if (delta > 1) {
                this.scrollElement(tabHeaderNativeElement, true);
            }

            this.alignSelectedIndicator(tabHeaderNativeElement);
        } else {
            this.hideSelectedIndicator();
        }
    }

    /** @hidden */
    protected getNextTabId() {
        return NEXT_TAB_ID++;
    }

    private alignSelectedIndicator(element: HTMLElement, duration = 0.3): void {
        if (this.selectedIndicator) {
            this.selectedIndicator.nativeElement.style.visibility = 'visible';
            this.selectedIndicator.nativeElement.style.transitionDuration = duration > 0 ? `${duration}s` : 'initial';
            this.selectedIndicator.nativeElement.style.width = `${element.offsetWidth}px`;
            this.selectedIndicator.nativeElement.style.transform = `translate(${element.offsetLeft}px)`;
        }
    }

    private hideSelectedIndicator(): void {
        if (this.selectedIndicator) {
            this.selectedIndicator.nativeElement.style.visibility = 'hidden';
        }
    }

    private scroll(scrollRight: boolean): void {
        const tabsArray = this.items.toArray();
        for (const tab of tabsArray) {
            const element = tab.headerComponent.nativeElement;
            if (scrollRight) {
                if (element.offsetWidth + element.offsetLeft > this.viewPort.nativeElement.offsetWidth + this.offset) {
                    this.scrollElement(element, scrollRight);
                    break;
                }
            } else {
                if (element.offsetWidth + element.offsetLeft >= this.offset) {
                    this.scrollElement(element, scrollRight);
                    break;
                }
            }
        }
    }

    private scrollElement(element: any, scrollRight: boolean): void {
        const viewPortWidth = this.viewPort.nativeElement.offsetWidth;

        this.offset = (scrollRight) ? element.offsetWidth + element.offsetLeft - viewPortWidth : element.offsetLeft;
        this.itemsContainer.nativeElement.style.transform = `translate(${-this.offset}px)`;
    }
}

