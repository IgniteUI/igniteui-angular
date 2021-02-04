import { AnimationBuilder } from '@angular/animations';
import { AfterViewInit, ContentChildren, Directive, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { Direction, IgxCarouselComponentBase } from '../carousel/carousel-base';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabPanelNewBase, IgxTabsBaseNew } from './tabs-base';

@Directive()
export abstract class IgxTabsDirective extends IgxCarouselComponentBase implements IgxTabsBaseNew, AfterViewInit {

    @Input()
    public get selectedIndex(): number {
        return this._selectedIndex;
    }

    public set selectedIndex(value: number) {
        if (this._selectedIndex !== value) {
            const oldValue = this._selectedIndex;
            this._selectedIndex = value;
            this.updateSelectedTabs(oldValue);
            this.selectedIndexChange.emit(this._selectedIndex);
        }
    }

    @Output()
    public selectedIndexChange = new EventEmitter<number>();

    /** @hidden */
    @ContentChildren(IgxTabItemDirective)
    public tabs: QueryList<IgxTabItemDirective>;

    /** @hidden */
    @ContentChildren(IgxTabPanelNewBase, { descendants: true })
    public panels: QueryList<IgxTabPanelNewBase>;

    protected currentSlide: IgxTabItemDirective;
    protected previousSlide: IgxTabItemDirective;

    private _selectedIndex = 0;

    /** @hidden */
    constructor(builder: AnimationBuilder) {
        super(builder);
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        if (this._selectedIndex === -1) {
            this.tabs.some((tab, i) => {
                if (tab.selected) {
                    this._selectedIndex = i;
                }
                return tab.selected;
            });
        }

        // Use promise to avoid expression changed after check error
        Promise.resolve().then(() => {
            this.updateSelectedTabs(-1);
        });
    }

    /** @hidden */
    public selectTab(tab: IgxTabItemDirective, selected: boolean): void {
        if (!this.tabs) {
            return;
        }

        const tabs = this.tabs.toArray();

        if (selected) {
            const index = tabs.indexOf(tab);
            this.selectedIndex = index;
        } else {
            if (tabs.every(t => !t.selected)) {
                this.selectedIndex = -1;
            }
        }
    }

    protected getPreviousElement(): HTMLElement {
        return this.previousSlide.panelComponent.nativeElement;
    }

    protected getCurrentElement(): HTMLElement {
        return this.currentSlide.panelComponent.nativeElement;
    }

    private updateSelectedTabs(oldValue: number) {
        if (!this.tabs) {
            return;
        }

        const tabs = this.tabs.toArray();

        if (this.tabs) {
            // First select the new tab
            if (this._selectedIndex >= 0 && this._selectedIndex < tabs.length) {
                tabs[this._selectedIndex].selected = true;
            }
            // Then unselect the other tabs
            this.tabs.forEach((tab, i) => {
                if (i !== this._selectedIndex) {
                    tab.selected = false;
                }
            });
        }

        this.triggerPanelAnimations(oldValue);
    }

    private triggerPanelAnimations(oldValue: number) {
        if (this.panels && this.panels.length && this._selectedIndex >= 0) {
            const slide = this.tabs.toArray()[this._selectedIndex];
            slide.direction = this._selectedIndex > oldValue ? Direction.NEXT : Direction.PREV;

            if (this.currentSlide) {
                if (this.previousSlide && this.previousSlide.previous) {
                    this.previousSlide.previous = false;
                }
                this.currentSlide.direction = slide.direction;

                this.previousSlide = this.currentSlide;
                this.currentSlide = slide;
                this.triggerAnimations();
            } else {
                this.currentSlide = slide;
            }
        }
    }
}
