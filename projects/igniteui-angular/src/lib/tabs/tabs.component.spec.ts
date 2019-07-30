import { Component, QueryList, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabsGroupComponent } from './tabs-group.component';
import { IgxTabsComponent, IgxTabsModule } from './tabs.component';

import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxDropDownModule } from '../drop-down';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TabsRoutingViewComponentsModule,
    TabsRoutingView1Component,
    TabsRoutingView2Component,
    TabsRoutingView3Component } from './tabs-routing-view-components.spec';

describe('IgxTabs', () => {
    configureTestSuite();

    const tabItemNormalCssClass = 'igx-tabs__header-menu-item';
    const tabItemSelectedCssClass = 'igx-tabs__header-menu-item--selected';

    beforeEach(async(() => {

        const testRoutes = [
            { path: 'view1', component: TabsRoutingView1Component },
            { path: 'view2', component: TabsRoutingView2Component },
            { path: 'view3', component: TabsRoutingView3Component }
        ];

        TestBed.configureTestingModule({
            declarations: [TabsTestComponent, TabsTest2Component, TemplatedTabsTestComponent,
                TabsTestSelectedTabComponent, TabsTestCustomStylesComponent, TabsTestBug4420Component, TabsRoutingTestComponent,
                TabsTabsOnlyModeTest1Component, TabsTabsOnlyModeTest2Component],
            imports: [IgxTabsModule, IgxButtonModule, IgxDropDownModule, IgxToggleModule, BrowserAnimationsModule,
                TabsRoutingViewComponentsModule, RouterTestingModule.withRoutes(testRoutes)]
        }).compileComponents();
    }));

    describe('IgxTabs Component with static Panels Definitions', () => {
        let fixture;
        let tabs;

        beforeEach(async(() => {
            fixture = TestBed.createComponent(TabsTestComponent);
            tabs = fixture.componentInstance.tabs;
        }));

        it('should initialize igx-tabs, igx-tabs-group and igx-tab-item', fakeAsync(() => {
            let groups: IgxTabsGroupComponent[];
            let tabsItems: IgxTabItemComponent[];

            tick(100);
            fixture.detectChanges();

            groups = tabs.groups.toArray();
            tabsItems = tabs.tabs.toArray();

            expect(tabs).toBeDefined();
            expect(tabs instanceof IgxTabsComponent).toBeTruthy();
            expect(tabs.groups instanceof QueryList).toBeTruthy();
            expect(tabs.groups.length).toBe(3);

            for (let i = 0; i < tabs.groups.length; i++) {
                expect(groups[i] instanceof IgxTabsGroupComponent).toBeTruthy();
                expect(groups[i].relatedTab).toBe(tabsItems[i]);
            }

            expect(tabs.tabs instanceof QueryList).toBeTruthy();
            expect(tabs.tabs.length).toBe(3);

            for (let i = 0; i < tabs.tabs.length; i++) {
                expect(tabsItems[i] instanceof IgxTabItemComponent).toBeTruthy();
                expect(tabsItems[i].relatedGroup).toBe(groups[i]);
            }
            tick();
        }));

        it('should initialize default values of properties', fakeAsync(() => {
            let tabItems;

            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);

            fixture.componentInstance.tabSelectedHandler = () => {
                expect(tabs.selectedIndex).toBe(0);
                expect(tabs.selectedTabItem).toBe(tabItems[0]);
            };

            tick(100);
            fixture.detectChanges();

            tabItems = tabs.tabs.toArray();
            expect(tabItems[0].disabled).toBe(false);
            expect(tabItems[1].disabled).toBe(false);
        }));

        it('should initialize set/get properties', fakeAsync(() => {
            const icons = ['library_music', 'video_library', 'library_books'];

            tick(100);
            fixture.detectChanges();

            const tabItems = tabs.tabs.toArray();
            const groups = tabs.groups.toArray();

            for (let i = 0; i < tabItems.length; i++) {
                expect(groups[i].label).toBe('Tab ' + (i + 1));
                expect(groups[i].icon).toBe(icons[i]);
            }
            tick();
        }));

        it('should set/get properties on panels through tabs', () => {
            const iconValues = ['library_music', 'video_library', 'library_books'];
            const labelValues = ['Tab1', 'Tab2', 'Tab3'];
            const disabledValues = [true, false, true];

            fixture.detectChanges();

            const tabItems = tabs.tabs.toArray();
            const groups = tabs.groups.toArray();

            for (let i = 0; i < tabItems.length; i++) {
                tabItems[i].icon = iconValues[i];
                tabItems[i].label = labelValues[i];
                tabItems[i].disabled = disabledValues[i];
                fixture.detectChanges();
                expect(groups[i].icon).toBe(iconValues[i]);
                expect(groups[i].label).toBe(labelValues[i]);
                expect(groups[i].disabled).toBe(disabledValues[i]);
            }
        });

        it('should set/get selection on panels through tabs', () => {
            fixture.detectChanges();

            const tabItems = tabs.tabs.toArray();
            const groups = tabs.groups.toArray();

            tabItems[0].isSelected = true;
            expect(groups[0].isSelected).toBe(true);
            expect(groups[1].isSelected).toBe(false);
            expect(groups[2].isSelected).toBe(false);

            tabItems[1].isSelected = true;
            fixture.detectChanges();
            expect(groups[0].isSelected).toBe(false);
            expect(groups[1].isSelected).toBe(true);
            expect(groups[2].isSelected).toBe(false);

            tabItems[2].isSelected = true;
            fixture.detectChanges();
            expect(groups[0].isSelected).toBe(false);
            expect(groups[1].isSelected).toBe(false);
            expect(groups[2].isSelected).toBe(true);
        });

        it('should select/deselect tabs', fakeAsync(() => {
            fixture.detectChanges();

            let tabItems;
            let tab1: IgxTabItemComponent;
            let tab2: IgxTabItemComponent;

            expect(tabs.selectedIndex).toBe(0);
            fixture.componentInstance.tabSelectedHandler = () => {
                expect(tabs.selectedIndex).toBe(0);
                expect(tabs.selectedTabItem).toBe(tab1);
            };

            tick(100);
            fixture.detectChanges();
            tabItems = tabs.tabs.toArray();
            tab1 = tabItems[0];
            tab2 = tabItems[1];

            fixture.componentInstance.tabSelectedHandler = () => { };

            tab2.select();
            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(1);
            expect(tabs.selectedTabItem).toBe(tab2);
            expect(tab2.isSelected).toBeTruthy();
            expect(tab1.isSelected).toBeFalsy();

            tab1.select();
            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedTabItem).toBe(tab1);
            expect(tab1.isSelected).toBeTruthy();
            expect(tab2.isSelected).toBeFalsy();

            // select disabled tab
            tab2.relatedGroup.disabled = true;
            tick(100);
            fixture.detectChanges();

            tab2.select();
            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedTabItem).toBe(tab1);
            expect(tab1.isSelected).toBeTruthy();
            expect(tab2.isSelected).toBeFalsy();
        }));

        it('should select next/previous tab when pressing right/left arrow', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            tabs.tabs.toArray()[0].nativeTabItem.nativeElement.focus();
            let args = { key: 'ArrowRight', bubbles: true };
            tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            tabs.tabs.toArray()[1].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            args = { key: 'ArrowLeft', bubbles: true };
            tabs.tabs.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);
        }));

        it('should select first/last tab when pressing home/end button', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            tabs.tabs.toArray()[0].nativeTabItem.nativeElement.focus();

            let args = { key: 'End', bubbles: true };
            tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            args = { key: 'Home', bubbles: true };
            tabs.tabs.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);
        }));

        it('should scroll tab area when clicking left/right scroll buttons', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            fixture.componentInstance.wrapperDiv.nativeElement.style.width = '200px';
            tick(100);
            fixture.detectChanges();

            const rightScrollButton = tabs.headerContainer.nativeElement.children[2];
            window.dispatchEvent(new Event('resize'));
            rightScrollButton.dispatchEvent(new Event('click', { bubbles: true }));

            tick(100);
            fixture.detectChanges();
            expect(tabs.offset).toBeGreaterThan(0);

            tabs.scrollLeft(null);

            tick(100);
            fixture.detectChanges();
            expect(tabs.offset).toBe(0);
        }));

        it('should select tab on click', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            fixture.componentInstance.wrapperDiv.nativeElement.style.width = '400px';
            tick(100);
            fixture.detectChanges();

            tabs.tabs.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);
        }));

    });

    describe('IgxTabs Component with Custom Template', () => {
        let fixture;
        let tabs;

        beforeEach(async(() => {
            fixture = TestBed.createComponent(TemplatedTabsTestComponent);
            tabs = fixture.componentInstance.tabs;
        }));

        it('should initialize igx-tab custom template', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();
            expect(tabs.tabs.length).toBe(3);
            tabs.tabs.forEach((tabItem) => expect(tabItem.relatedGroup.customTabTemplate).toBeDefined());
            tick();
        }));

        it('should change selection in runtime using selectedIndex', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            const tabsItems = tabs.tabs.toArray();
            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedTabItem).toBe(tabsItems[0]);

            tabs.selectedIndex = 2;
            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedTabItem).toBe(tabsItems[2]);
            expect(tabs.selectedTabItem.relatedGroup.label).toBe('Tab 3');
        }));

    });

    describe('IgxTabs Miscellaneous Tests', () => {

        it('check select selection when tabs collection is modified', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabsTest2Component);
            const tabs = fixture.componentInstance.tabs;
            fixture.detectChanges();

            let tabItems;
            let tab1: IgxTabItemComponent;
            let tab3: IgxTabItemComponent;

            tick(100);
            fixture.detectChanges();

            tabItems = tabs.tabs.toArray();
            tab1 = tabItems[0];
            tab3 = tabItems[2];

            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedTabItem.index).toBe(tab1.index);

            fixture.componentInstance.tabSelectedHandler = () => { };

            tab3.select();

            tick(200);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(2);
            expect(tabs.selectedTabItem).toBe(tab3);
            expect(tab3.isSelected).toBeTruthy();

            fixture.componentInstance.resetCollectionFourTabs();
            fixture.detectChanges();
            tick(200);
            expect(tabs.selectedIndex).toBe(2);

            fixture.componentInstance.resetCollectionOneTab();
            tick(100);
            fixture.detectChanges();

            tick(100);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            fixture.componentInstance.resetCollectionTwoTabs();
            tick(100);
            fixture.detectChanges();

            tick(100);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            fixture.componentInstance.resetToEmptyCollection();
            tick(100);
            fixture.detectChanges();

            tick(100);
            fixture.detectChanges();
            expect(tabs.groups.length).toBe(0);
            expect(tabs.selectedTabItem).toBe(undefined);
        }));

        it('should select third tab by default', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabsTestSelectedTabComponent);
            const tabs = fixture.componentInstance.tabs;

            tick(100);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            tick(100);
            fixture.detectChanges();
            expect(tabs.groups.toArray()[2].isSelected).toBeTruthy();

            tick(100);
            fixture.detectChanges();
            expect(tabs.selectedIndicator.nativeElement.style.transform).toBe('translate(180px)');
        }));

        it('should apply custom css style to tabs and tabs groups', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabsTestCustomStylesComponent);
            tick(100);
            fixture.detectChanges();

            const tabsDomElement = document.getElementsByClassName('igx-tabs')[0];
            expect(tabsDomElement.classList.length).toEqual(2);
            expect(tabsDomElement.classList.contains('tabsClass')).toBeTruthy();

            const tabsGroupsDomElement = document.getElementsByClassName('igx-tabs__group');

            expect(tabsGroupsDomElement.length).toEqual(2);
            expect(tabsGroupsDomElement[0].classList.length).toBe(2);
            expect(tabsGroupsDomElement[0].classList.contains('groupClass')).toBeTruthy();

            expect(tabsGroupsDomElement[1].classList.length).toBe(1);
            expect(tabsGroupsDomElement[1].classList.contains('groupClass')).toBeFalsy();
        }));

        it('tabs in drop down, bug #4420 - check selection indicator width', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabsTestBug4420Component);
            const dom = fixture.debugElement;
            const tabs = fixture.componentInstance.tabs;
            tick(50);
            fixture.detectChanges();

            const button = dom.query(By.css('.igx-button--flat'));
            UIInteractions.clickElement(button);
            tick(50);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(1);
            const selectedGroup = document.getElementsByClassName('igx-tabs__group')[1] as HTMLElement;
            expect(selectedGroup.innerText.trim()).toEqual('Tab content 2');
            const indicator = dom.query(By.css('.igx-tabs__header-menu-item-indicator'));
            expect(indicator.nativeElement.style.width).toBe('90px');
        }));

    });

    describe('Routing Navigation Tests', () => {
        let router;
        let location;
        let fixture;
        let tabsComp;
        let theTabs;

        beforeEach(async(() => {
            router = TestBed.get(Router);
            location = TestBed.get(Location);
            fixture = TestBed.createComponent(TabsRoutingTestComponent);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            theTabs = tabsComp.contentTabs.toArray();
        }));

        it('should navigate to the correct URL when clicking on tab buttons', fakeAsync(() => {
            fixture.ngZone.run(() => { router.initialNavigation(); });
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => { UIInteractions.clickElement(theTabs[2].nativeTabItem); });
            tick();
            expect(location.path()).toBe('/view3');

            fixture.ngZone.run(() => { UIInteractions.clickElement(theTabs[1].nativeTabItem); });
            tick();
            expect(location.path()).toBe('/view2');

            fixture.ngZone.run(() => { UIInteractions.clickElement(theTabs[0].nativeTabItem); });
            tick();
            expect(location.path()).toBe('/view1');
        }));

        it('should select the correct tab button/panel when navigating an URL', fakeAsync(() => {
            fixture.ngZone.run(() => { router.initialNavigation(); });
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => { router.navigate(['/view3']); });
            tick();
            expect(location.path()).toBe('/view3');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(theTabs[2].isSelected).toBe(true);
            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[1].isSelected).toBe(false);

            fixture.ngZone.run(() => { router.navigate(['/view2']); });
            tick();
            expect(location.path()).toBe('/view2');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(1);
            expect(theTabs[1].isSelected).toBe(true);
            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[2].isSelected).toBe(false);

            fixture.ngZone.run(() => { router.navigate(['/view1']); });
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(theTabs[0].isSelected).toBe(true);
            expect(theTabs[1].isSelected).toBe(false);
            expect(theTabs[2].isSelected).toBe(false);
        }));

    });

    describe('Tabs-only Mode With Initial Selection Set on TabItems Tests', () => {
        let router;
        let fixture;
        let tabsComp;
        let theTabs;

        beforeEach(async(() => {
            router = TestBed.get(Router);
            fixture = TestBed.createComponent(TabsTabsOnlyModeTest1Component);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            theTabs = tabsComp.tabs.toArray();
        }));

        it('should retain the correct initial selection set by the isSelected property', () => {
            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[0].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(theTabs[1].isSelected).toBe(true);
            expect(theTabs[1].nativeTabItem.nativeElement.classList.contains(tabItemSelectedCssClass)).toBe(true);

            expect(theTabs[2].isSelected).toBe(false);
            expect(theTabs[2].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);
        });

        it('should clear old selection and assign new selection after clicking on a tab item with an initial selection', () => {
            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[0].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(theTabs[1].isSelected).toBe(true);
            expect(theTabs[1].nativeTabItem.nativeElement.classList.contains(tabItemSelectedCssClass)).toBe(true);

            expect(theTabs[2].isSelected).toBe(false);
            expect(theTabs[2].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            UIInteractions.clickElement(theTabs[2].nativeTabItem);
            fixture.detectChanges();

            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[0].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(theTabs[1].isSelected).toBe(false);
            expect(theTabs[1].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(theTabs[2].isSelected).toBe(true);
            expect(theTabs[2].nativeTabItem.nativeElement.classList.contains(tabItemSelectedCssClass)).toBe(true);
        });

        it('should hide the selection indicator when no tab item is selected', () => {
            expect(tabsComp.selectedIndicator.nativeElement.style.visibility).toBe('visible');
            theTabs[1].isSelected = false;
            fixture.detectChanges();
            expect(tabsComp.selectedIndicator.nativeElement.style.visibility).toBe('hidden');
        });

    });

    describe('Tabs-only Mode With Initial Selection Set on Tabs Component Tests', () => {
        let fixture;
        let tabsComp;
        let theTabs;

        beforeEach(async(() => {
            fixture = TestBed.createComponent(TabsTabsOnlyModeTest2Component);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            theTabs = tabsComp.tabs.toArray();
        }));

        it('should retain the correct initial selection set by the selectedIndex property', () => {
            fixture.detectChanges();

            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[0].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(theTabs[1].isSelected).toBe(false);
            expect(theTabs[1].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(theTabs[2].isSelected).toBe(true);
            expect(theTabs[2].nativeTabItem.nativeElement.classList.contains(tabItemSelectedCssClass)).toBe(true);
        });

    });

});

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs (onTabSelected)="tabSelectedHandler($event)">
                <igx-tabs-group label="Tab 1" icon="library_music">
                    <h1>Tab 1 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tabs-group>
                <igx-tabs-group label="Tab 2" icon="video_library">
                    <h1>Tab 2 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tabs-group>
                <igx-tabs-group label="Tab 3" icon="library_books">
                    <h1>Tab 3 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Vivamus vitae malesuada odio. Praesent ante lectus, porta a eleifend vel, sodales eu nisl.
                        Vivamus sit amet purus eu lectus cursus rhoncus quis non ex.
                        Cras ac nulla sed arcu finibus volutpat.
                        Vivamus risus ipsum, pharetra a augue nec, euismod fringilla odio.
                        Integer id velit rutrum, accumsan ante a, semper nunc.
                        Phasellus ultrices tincidunt imperdiet. Nullam vulputate mauris diam.
                         Nullam elementum, libero vel varius fermentum, lorem ex bibendum nulla,
                         pretium lacinia erat nibh vel massa.
                        In hendrerit, sapien ac mollis iaculis, dolor tellus malesuada sem,
                        a accumsan lectus nisl facilisis leo.
                        Curabitur consequat sit amet nulla at consequat. Duis volutpat tristique luctus.
                    </p>
                </igx-tabs-group>
            </igx-tabs>
        </div>`
})
class TabsTestComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;

    public tabSelectedHandler(args) {
    }
}

@Component({
    template: `
        <div #wrapperDiv style="display: flex;">
            <igx-tabs (onTabSelected)="tabSelectedHandler($event)">
                <igx-tabs-group *ngFor="let tab of collection" [label]="tab.name"></igx-tabs-group>
            </igx-tabs>
        </div>`
})
class TabsTest2Component {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
    public collection: any[];

    public tabSelectedHandler(args) {
    }

    public constructor() {
        this.resetCollectionThreeTabs();
    }
    public resetCollectionOneTab() {
        this.collection =
            [
                { name: 'Tab 3' }
            ];
    }
    public resetCollectionTwoTabs() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 3' }
            ];
    }
    public resetCollectionThreeTabs() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 2' },
                { name: 'Tab 3' }
            ];
    }
    public resetCollectionFourTabs() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 2' },
                { name: 'Tab 3' },
                { name: 'Tab 4' }
            ];
    }
    public resetToEmptyCollection() {
        this.collection = [];
    }
}

@Component({
    template: `
        <div #wrapperDiv>
        <igx-tabs tabsType="fixed">
            <igx-tabs-group label="Tab111111111111111111111111">
                <ng-template igxTab>
                    <div>T1</div>
                 </ng-template>
                 <h1>Tab 1 Content</h1>
              </igx-tabs-group>
            <igx-tabs-group label="Tab 2">
                <ng-template igxTab>
                    <div>T2</div>
                </ng-template>
                <h1>Tab 2 Content</h1>
            </igx-tabs-group>
            <igx-tabs-group label="Tab 3">
                <ng-template igxTab>
                    <div>T3</div>
                </ng-template>
                <h1>Tab 3 Content</h1>
            </igx-tabs-group>
        </igx-tabs>
        </div>`
})
class TemplatedTabsTestComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
}

@Component({
    template: `
        <div>
            <igx-tabs [selectedIndex]="2">
                <igx-tabs-group *ngFor="let tab of collection" [label]="tab.name"></igx-tabs-group>
            </igx-tabs>
        </div>`
})
class TabsTestSelectedTabComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    public collection: any[];

    public constructor() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 2' },
                { name: 'Tab 3' },
                { name: 'Tab 4' }
            ];
    }
}

@Component({
    template:
        `
        <igx-tabs class="tabsClass">
            <igx-tabs-group class="groupClass" label="Tab1">
                Content 1
            </igx-tabs-group>
            <igx-tabs-group label="Tab2">
                Content 2
            </igx-tabs-group>
        </igx-tabs>
        `
})
class TabsTestCustomStylesComponent {
}

@Component({
    template:
        `
        <button igxButton="flat" [igxToggleAction]="userProfile">
            Click
        </button>
        <igx-drop-down #userProfile>
            <div>
                <igx-tabs selectedIndex="1">
                    <igx-tabs-group label="tab1">
                        Tab content 1
                    </igx-tabs-group>
                    <igx-tabs-group label="tab2">
                        Tab content 2
                    </igx-tabs-group>
                </igx-tabs>
            </div>
        </igx-drop-down>
        `
})
class TabsTestBug4420Component {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs>
                <igx-tab-item label="Tab 1" routerLink="/view1" routerLinkActive #rla1="routerLinkActive" [isSelected]="rla1.isActive">
                </igx-tab-item>
                <igx-tab-item label="Tab 2" routerLink="/view2" routerLinkActive #rla2="routerLinkActive" [isSelected]="rla2.isActive">
                </igx-tab-item>
                <igx-tab-item label="Tab 3" routerLink="/view3" routerLinkActive #rla3="routerLinkActive" [isSelected]="rla3.isActive">
                </igx-tab-item>
            </igx-tabs>
            <div>
                <router-outlet></router-outlet>
            </div>
        </div>
    `
})
class TabsRoutingTestComponent {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs>
                <igx-tab-item label="Tab 1">
                </igx-tab-item>
                <igx-tab-item label="Tab 2" [isSelected]="true">
                </igx-tab-item>
                <igx-tab-item label="Tab 3">
                </igx-tab-item>
            </igx-tabs>
        </div>
    `
})
class TabsTabsOnlyModeTest1Component {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs selectedIndex="2">
                <igx-tab-item label="Tab 1">
                </igx-tab-item>
                <igx-tab-item label="Tab 2">
                </igx-tab-item>
                <igx-tab-item label="Tab 3">
                </igx-tab-item>
            </igx-tabs>
        </div>
    `
})
class TabsTabsOnlyModeTest2Component {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}
