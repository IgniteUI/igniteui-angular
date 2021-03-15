import { AnimationBuilder } from '@angular/animations';
import { AfterViewInit, ContentChildren, Directive, EventEmitter, HostBinding, Input, Output, QueryList } from '@angular/core';
import { Direction, IgxCarouselComponentBase } from '../carousel/carousel-base';
import { IBaseEventArgs } from '../core/utils';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabPanelBase, IgxTabsBase } from './tabs.base';

export interface ITabsBaseEventArgs extends IBaseEventArgs {
    readonly owner: IgxTabsDirective;
}

export interface ITabsSelectedIndexChangingEventArgs extends ITabsBaseEventArgs {
    cancel: boolean;
    readonly oldIndex: number;
    newIndex: number;
}

export interface ITabsSelectedItemChangeEventArgs extends ITabsBaseEventArgs {
    readonly oldItem: IgxTabItemDirective;
    readonly newItem: IgxTabItemDirective;
}

/**
 * @hidden
 */
let NEXT_TAB_ID = 0;

@Directive()
export abstract class IgxTabsDirective extends IgxCarouselComponentBase implements IgxTabsBase, AfterViewInit {

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'tablist';

    @Input()
    public get selectedIndex(): number {
        return this._selectedIndex;
    }

    public set selectedIndex(value: number) {
        if (this._selectedIndex !== value) {
            let newIndex = value;
            const oldIndex = this._selectedIndex;
            const args: ITabsSelectedIndexChangingEventArgs = {
                owner: this,
                cancel: false,
                oldIndex,
                newIndex
            };
            this.selectedIndexChanging.emit(args);

            if (!args.cancel) {
                newIndex = args.newIndex;
                this._selectedIndex = newIndex;
                this.selectedIndexChange.emit(this._selectedIndex);
            }

            this.updateSelectedTabs(oldIndex);

            if (this._selectedIndex !== oldIndex) {
                if (this.items) {
                    const tabs = this.items.toArray();
                    this.selectedItemChange.emit({
                        owner: this,
                        newItem: newIndex >= 0 && newIndex < tabs.length ? tabs[newIndex] : null,
                        oldItem: oldIndex >= 0 && oldIndex < tabs.length ? tabs[oldIndex] : null
                    });
                }
            }
        }
    }

    @Input()
    public get disableAnimation() {
        return this._disableAnimation;
    }

    public set disableAnimation(value: boolean) {
        this._disableAnimation = value;
    }

    @Output()
    public selectedIndexChange = new EventEmitter<number>();

    @Output()
    public selectedIndexChanging = new EventEmitter<ITabsSelectedIndexChangingEventArgs>();

    @Output()
    public selectedItemChange = new EventEmitter<ITabsSelectedItemChangeEventArgs>();

    @ContentChildren(IgxTabItemDirective)
    public items: QueryList<IgxTabItemDirective>;

    public get selectedItem(): IgxTabItemDirective {
        return this.items && this.selectedIndex >= 0 && this.selectedIndex < this.items.length ?
            this.items.toArray()[this.selectedIndex] : null;
    }

    /** @hidden */
    @ContentChildren(IgxTabPanelBase, { descendants: true })
    public panels: QueryList<IgxTabPanelBase>;

    protected _disableAnimation = false;
    protected currentSlide: IgxTabItemDirective;
    protected previousSlide: IgxTabItemDirective;
    protected componentName: string;

    private _selectedIndex = -1;

    /** @hidden */
    constructor(builder: AnimationBuilder) {
        super(builder);
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        if (this._selectedIndex === -1) {
            const hasSelectedTab = this.items.some((tab, i) => {
                if (tab.selected) {
                    this._selectedIndex = i;
                }
                return tab.selected;
            });

            if (!hasSelectedTab && this.hasPanels) {
                this._selectedIndex = 0;
            }
        }

        // Use promise to avoid expression changed after check error
        Promise.resolve().then(() => {
            this.updateSelectedTabs(null);
        });

        this.setAttributes(this.componentName);
    }

    /** @hidden */
    public selectTab(tab: IgxTabItemDirective, selected: boolean): void {
        if (!this.items) {
            return;
        }

        const tabs = this.items.toArray();

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

    protected scrollTabHeaderIntoView() {
    }

    private setAttributes(igxName: string) {
        this.items.forEach(item => {
            this.setHeaderAttribute(item, 'aria-selected', item.selected ? 'true' : 'false');
            this.setHeaderAttribute(item, 'aria-label', `${igxName}-tabitem-${NEXT_TAB_ID}`);
            this.setHeaderAttribute(item, 'aria-controls', `${igxName}-tabpanel-${NEXT_TAB_ID}`);
            this.setPanelAttribute(item, 'aria-labelledby', `${igxName}-tabitem-${NEXT_TAB_ID++}`);
        });
    }

    private setHeaderAttribute(item: IgxTabItemDirective, attrName: string, value: string) {
        item.headerComponent.nativeElement.setAttribute(attrName, value);
    }

    private setPanelAttribute(item: IgxTabItemDirective, attrName: string, value: string) {
        item.panelComponent.nativeElement.setAttribute(attrName, value);
    }

    private get hasPanels() {
        return this.panels && this.panels.length;
    }

    private updateSelectedTabs(oldSelectedIndex: number) {
        if (!this.items) {
            return;
        }

        const tabs = this.items.toArray();

        if (this.items) {
            // First select the new tab
            if (this._selectedIndex >= 0 && this._selectedIndex < tabs.length) {
                tabs[this._selectedIndex].selected = true;
            }
            // Then unselect the other tabs
            this.items.forEach((tab, i) => {
                if (i !== this._selectedIndex) {
                    tab.selected = false;
                }
            });
        }

        if (this._selectedIndex !== oldSelectedIndex) {
            this.scrollTabHeaderIntoView();
            this.triggerPanelAnimations(oldSelectedIndex);

            if (this._selectedIndex >= 0) {
                const itemsArray = this.items.toArray();
                itemsArray.forEach(i => {
                    this.setHeaderAttribute(i, 'aria-selected', 'false');
                    this.setHeaderAttribute(i, 'tabindex', '-1');
                });
                this.setHeaderAttribute(itemsArray[this._selectedIndex], 'aria-selected', 'true');
                this.setHeaderAttribute(itemsArray[this._selectedIndex], 'tabindex', '0');

            }
        }
    }

    private triggerPanelAnimations(oldSelectedIndex: number) {
        if (this.disableAnimation) {
            return;
        }

        if (this.hasPanels && this._selectedIndex >= 0) {
            const slide = this.items.toArray()[this._selectedIndex];
            slide.direction = this._selectedIndex > oldSelectedIndex ? Direction.NEXT : Direction.PREV;

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
