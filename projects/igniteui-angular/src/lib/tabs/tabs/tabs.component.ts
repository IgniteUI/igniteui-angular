import { Component, ElementRef, HostBinding, Input, ViewChild } from '@angular/core';
import { mkenum } from '../../core/utils';
import { IgxTabsBase } from '../tabs.base';
import { IgxTabsDirective } from '../tabs.directive';


export const IgxTabsHeaderSizing = mkenum({
    fixed: 'fluid',
    contentfit: 'contentfit'
});
export type IgxTabsHeaderSizing = (typeof IgxTabsHeaderSizing)[keyof typeof IgxTabsHeaderSizing];

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

    @Input()
    public headerSizing: string | IgxTabsHeaderSizing = 'contentfit';

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
    @HostBinding('class.igx-tabs')
    public defaultClass = true;

    /** @hidden */
    @HostBinding('class.igx-tabs--icons')
    // TODO this.tabs.some((tab) => !!tab.icon && !!tab.label);
    public iconsClass = true;

    /** @hidden */
    @HostBinding('class.igx-tabs--fixed')
    public get fluidSizingClass() {
        return this.headerSizing === 'fluid';
    }

    /**  @hidden */
     public offset = 0;

    /** @hidden */
    public scrollLeft() {
        this.scroll(false);
    }

    /** @hidden */
    public scrollRight() {
        this.scroll(true);
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

