import { QueryList } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabsComponent } from './tabs.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
// import { TabsRoutingViewComponentsModule,
//     TabsRoutingView1Component,
//     TabsRoutingView2Component,
//     TabsRoutingView3Component,
//     TabsRoutingView4Component,
//     TabsRoutingView5Component } from './tabs-routing-view-components.spec';
import { TabRoutingTestGuard } from './tab-routing-test-guard.spec';
import { TabsDisabledTestComponent, TabsRoutingDisabledTestComponent, TabsRoutingGuardTestComponent, TabsRoutingTestComponent,
    TabsTabsOnlyModeTest1Component, TabsTabsOnlyModeTest2Component, TabsTest2Component, TabsTestBug4420Component, TabsTestComponent,
    TabsTestCustomStylesComponent, TabsTestHtmlAttributesComponent, TabsTestSelectedTabComponent,
    TemplatedTabsTestComponent } from '../../test-utils/tabs-components.spec';
import { IgxTabsModule } from './tabs.module';
import { configureTestSuite } from '../../test-utils/configure-suite';
// import { IgxTabHeaderComponent } from './tab-header.component';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxTabPanelComponent } from './tab-panel.component';
import { TabsRoutingViewComponentsModule,
        TabsRoutingView1Component,
        TabsRoutingView2Component,
        TabsRoutingView3Component,
        TabsRoutingView4Component,
        TabsRoutingView5Component } from './tabs-routing-view-components.spec';
import { IgxButtonModule } from '../../directives/button/button.directive';
import { IgxDropDownModule } from '../../drop-down/public_api';
import { IgxToggleModule } from '../../directives/toggle/toggle.directive';

const KEY_RIGHT_EVENT = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
const KEY_LEFT_EVENT = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
const KEY_HOME_EVENT = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
const KEY_END_EVENT = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
const KEY_ENTER_EVENT = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
const KEY_SPACE_EVENT = new KeyboardEvent('keydown', { key: 'Spacebar', bubbles: true });

fdescribe('IgxTabs', () => {
    configureTestSuite();

    const tabItemNormalCssClass = 'igx-tabs__header-menu-item';
    const tabItemSelectedCssClass = 'igx-tabs__header-menu-item--selected';

    beforeAll(waitForAsync(() => {
        const testRoutes = [
            { path: 'view1', component: TabsRoutingView1Component, canActivate: [TabRoutingTestGuard] },
            { path: 'view2', component: TabsRoutingView2Component, canActivate: [TabRoutingTestGuard] },
            { path: 'view3', component: TabsRoutingView3Component, canActivate: [TabRoutingTestGuard] },
            { path: 'view4', component: TabsRoutingView4Component, canActivate: [TabRoutingTestGuard] },
            { path: 'view5', component: TabsRoutingView5Component, canActivate: [TabRoutingTestGuard] }
        ];

        TestBed.configureTestingModule({
            declarations: [TabsTestHtmlAttributesComponent, TabsTestComponent, TabsTest2Component, TemplatedTabsTestComponent,
                TabsRoutingDisabledTestComponent, TabsTestSelectedTabComponent, TabsTestCustomStylesComponent, TabsTestBug4420Component,
                TabsRoutingTestComponent, TabsTabsOnlyModeTest1Component, TabsTabsOnlyModeTest2Component, TabsDisabledTestComponent,
                TabsRoutingGuardTestComponent],
            imports: [IgxTabsModule, BrowserAnimationsModule,
                IgxButtonModule, IgxDropDownModule, IgxToggleModule,
                TabsRoutingViewComponentsModule, RouterTestingModule.withRoutes(testRoutes)],
            providers: [TabRoutingTestGuard]
        }).compileComponents();
    }));

    describe('IgxTabs Html Attributes', () => {
        let fixture;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabsTestHtmlAttributesComponent);
        }));

        it('should set the correct attributes on the html elements', fakeAsync(() => {
            fixture.detectChanges();

            const igxTabs = document.querySelectorAll('igx-tabs');
            expect(igxTabs.length).toBe(2);

            const startTabsIndex = parseInt(igxTabs[0].id.replace('igx-tabs-', ''), 10);
            for (let tabIndex = startTabsIndex; tabIndex < startTabsIndex + 2; tabIndex++) {
                const tab = igxTabs[tabIndex - startTabsIndex];
                expect(tab.id).toEqual(`igx-tabs-${tabIndex}`);

                const tabHeaders = tab.querySelectorAll('igx-tab-item');
                const tabContents = tab.querySelectorAll('igx-tabs-group');
                expect(tabHeaders.length).toBe(3);
                expect(tabContents.length).toBe(3);

                for (let itemIndex = 0; itemIndex < 3; itemIndex++) {
                    const headerId = `igx-tab-item-${tabIndex}-${itemIndex}`;
                    const contentId = `igx-tabs-group-${tabIndex}-${itemIndex}`;

                    expect(tabHeaders[itemIndex].id).toEqual(headerId);
                    expect(tabHeaders[itemIndex].getAttribute('aria-controls')).toEqual(contentId);

                    expect(tabContents[itemIndex].id).toEqual(contentId);
                    expect(tabContents[itemIndex].getAttribute('aria-labelledby')).toEqual(headerId);
                }
            }
        }));
    });

    describe('IgxTabs Component with static Panels Definitions', () => {
        let fixture;
        let tabs;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabsTestComponent);
            tabs = fixture.componentInstance.tabs;
        }));

        it('should initialize igx-tabs, igx-tabs-group and igx-tab-item', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            const panels: IgxTabPanelComponent[] = tabs.panels.toArray();
            const tabsItems: IgxTabItemComponent[] = tabs.items.toArray();

            expect(tabs).toBeDefined();
            expect(tabs instanceof IgxTabsComponent).toBeTruthy();
            expect(tabs.panels instanceof QueryList).toBeTruthy();
            expect(tabs.panels.length).toBe(3);

            for (let i = 0; i < tabs.panels.length; i++) {
                expect(panels[i] instanceof IgxTabItemComponent).toBeTruthy();
                expect(panels[i].tab).toBe(tabsItems[i]);
            }

            expect(tabs.tabs instanceof QueryList).toBeTruthy();
            expect(tabs.items.length).toBe(3);

            for (let i = 0; i < tabs.items.length; i++) {
                expect(tabsItems[i] instanceof IgxTabItemComponent).toBeTruthy();
                expect(tabsItems[i].panelComponent).toBe(panels[i]);
            }
            tick();
        }));

        it('should initialize default values of properties', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);

            fixture.componentInstance.tabSelectedHandler = () => {
                expect(tabs.selectedIndex).toBe(0);
                expect(tabs.selectedItem).toBe(tabItems[0]);
            };

            tick(100);
            fixture.detectChanges();

            const tabItems = tabs.items.toArray();
            expect(tabItems[0].disabled).toBe(false);
            expect(tabItems[1].disabled).toBe(false);
        }));

        it('should initialize set/get properties', fakeAsync(() => {
            const icons = ['library_music', 'video_library', 'library_books'];

            tick(100);
            fixture.detectChanges();

            const tabItems = tabs.items.toArray();
            const groups = tabs.panels.toArray();

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

            const tabItems = tabs.items.toArray();
            const groups = tabs.panels.toArray();

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

            const tabItems = tabs.items.toArray();
            const groups = tabs.panels.toArray();

            tabItems[0].selected = true;
            expect(groups[0].selected).toBe(true);
            expect(groups[1].selected).toBe(false);
            expect(groups[2].selected).toBe(false);

            tabItems[1].selected = true;
            fixture.detectChanges();
            expect(groups[0].selected).toBe(false);
            expect(groups[1].selected).toBe(true);
            expect(groups[2].selected).toBe(false);

            tabItems[2].selected = true;
            fixture.detectChanges();
            expect(groups[0].selected).toBe(false);
            expect(groups[1].selected).toBe(false);
            expect(groups[2].selected).toBe(true);
        });

        it('should select/deselect tabs', fakeAsync(() => {
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);
            fixture.componentInstance.tabSelectedHandler = () => {
                expect(tabs.selectedIndex).toBe(0);
                expect(tabs.selectedItem).toBe(tab1);
            };

            tick(100);
            fixture.detectChanges();
            const tabItems = tabs.items.toArray();
            const tab1: IgxTabItemComponent = tabItems[0];
            const tab2: IgxTabItemComponent = tabItems[1];

            fixture.componentInstance.tabSelectedHandler = () => { };

            // tab2.select();
            tab2.selected = true;

            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(1);
            expect(tabs.selectedItem).toBe(tab2);
            expect(tab2.selected).toBeTruthy();
            expect(tab1.selected).toBeFalsy();

            // tab1.select();
            tab1.selected = true;

            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedItem).toBe(tab1);
            expect(tab1.selected).toBeTruthy();
            expect(tab2.selected).toBeFalsy();

            // select disabled tab
            // tab2.relatedGroup.disabled = true;

            tick(100);
            fixture.detectChanges();

            // tab2.select();
            tab2.selected = true;

            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedItem).toBe(tab1);
            expect(tab1.selected).toBeTruthy();
            expect(tab2.selected).toBeFalsy();
        }));

        it('should select next/previous tab when pressing right/left arrow', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            tabs.items.toArray()[0].nativeTabItem.nativeElement.focus();
            tabs.items.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            tabs.items.toArray()[1].nativeTabItem.nativeElement.dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            tabs.items.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            tabs.items.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            tabs.items.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);
        }));

        it('should select first/last tab when pressing home/end button', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            tabs.items.toArray()[0].nativeTabItem.nativeElement.focus();
            tabs.items.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(KEY_END_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            tabs.items.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(KEY_HOME_EVENT);
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

            tabs.items.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            tabs.items.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);
        }));

        it('should not select disabled tabs when navigating with left/right/home/end', fakeAsync(() => {
            fixture = TestBed.createComponent(TabsDisabledTestComponent);
            tabs = fixture.componentInstance.tabs;
            tick(100);
            fixture.detectChanges();

            tabs.items.toArray()[1].nativeTabItem.nativeElement.click();
            tabs.items.toArray()[1].nativeTabItem.nativeElement.dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(3);

            tabs.items.toArray()[3].nativeTabItem.nativeElement.dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            tabs.items.toArray()[1].nativeTabItem.nativeElement.dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(3);

            tabs.items.toArray()[3].nativeTabItem.nativeElement.dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            tabs.items.toArray()[1].nativeTabItem.nativeElement.dispatchEvent(KEY_END_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(3);

            tabs.items.toArray()[3].nativeTabItem.nativeElement.dispatchEvent(KEY_HOME_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);
        }));
    });

    describe('IgxTabs Component with Custom Template', () => {
        let fixture;
        let tabs;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TemplatedTabsTestComponent);
            tabs = fixture.componentInstance.tabs;
        }));

        it('should initialize igx-tab custom template', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();
            expect(tabs.items.length).toBe(3);
            tabs.items.forEach((tabItem) => expect(tabItem.relatedGroup.customTabTemplate).toBeDefined());
            tick();
        }));

        it('should change selection in runtime using selectedIndex', fakeAsync(() => {
            tick(100);
            fixture.detectChanges();

            const tabsItems = tabs.items.toArray();
            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedItem).toBe(tabsItems[0]);

            tabs.selectedIndex = 2;
            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedItem).toBe(tabsItems[2]);
            expect(tabs.selectedItem.relatedGroup.label).toBe('Tab 3');
        }));

    });

    describe('IgxTabs Miscellaneous Tests', () => {

        it('check select selection when tabs collection is modified', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabsTest2Component);
            const tabs = fixture.componentInstance.tabs;
            fixture.detectChanges();

            tick(100);
            fixture.detectChanges();

            const tabItems = tabs.items.toArray();
            // const tab1: IgxTabItemComponent = tabItems[0];
            const tab3: IgxTabItemComponent = tabItems[2];

            tick(100);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);
            // expect(tabs.selectedItem).toBe(tab1.index);

            fixture.componentInstance.tabSelectedHandler = () => { };

            // tab3.select();
            tab3.selected = true;

            tick(200);
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(2);
            expect(tabs.selectedItem).toBe(tab3);
            expect(tab3.selected).toBeTruthy();

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
            expect(tabs.panels.length).toBe(0);
            expect(tabs.selectedItem).toBe(undefined);
        }));

        it('should select third tab by default', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabsTestSelectedTabComponent);
            const tabs = fixture.componentInstance.tabs;

            tick(100);
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            tick(100);
            fixture.detectChanges();
            expect(tabs.items.toArray()[2].selected).toBeTruthy();

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
            UIInteractions.simulateClickAndSelectEvent(button);
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

        beforeEach(waitForAsync(() => {
            router = TestBed.inject(Router);
            location = TestBed.inject(Location);
            fixture = TestBed.createComponent(TabsRoutingTestComponent);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            theTabs = tabsComp.contentTabs.toArray();
        }));

        it('should navigate to the correct URL when clicking on tab buttons', fakeAsync(() => {
            fixture.ngZone.run(() => {
 router.initialNavigation();
});
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => {
 UIInteractions.simulateClickAndSelectEvent(theTabs[2].nativeTabItem);
});
            tick();
            expect(location.path()).toBe('/view3');

            fixture.ngZone.run(() => {
 UIInteractions.simulateClickAndSelectEvent(theTabs[1].nativeTabItem);
});
            tick();
            expect(location.path()).toBe('/view2');

            fixture.ngZone.run(() => {
 UIInteractions.simulateClickAndSelectEvent(theTabs[0].nativeTabItem);
});
            tick();
            expect(location.path()).toBe('/view1');
        }));

        it('should select the correct tab button/panel when navigating an URL', fakeAsync(() => {
            fixture.ngZone.run(() => {
 router.initialNavigation();
});
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => {
 router.navigate(['/view3']);
});
            tick();
            expect(location.path()).toBe('/view3');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(theTabs[2].selected).toBe(true);
            expect(theTabs[0].selected).toBe(false);
            expect(theTabs[1].selected).toBe(false);

            fixture.ngZone.run(() => {
 router.navigate(['/view2']);
});
            tick();
            expect(location.path()).toBe('/view2');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(1);
            expect(theTabs[1].selected).toBe(true);
            expect(theTabs[0].selected).toBe(false);
            expect(theTabs[2].selected).toBe(false);

            fixture.ngZone.run(() => {
 router.navigate(['/view1']);
});
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(theTabs[0].selected).toBe(true);
            expect(theTabs[1].selected).toBe(false);
            expect(theTabs[2].selected).toBe(false);
        }));

        it('should focus next/previous tab when pressing right/left arrow', fakeAsync(() => {
            theTabs[0].nativeTabItem.nativeElement.click();
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            theTabs[0].nativeTabItem.nativeElement.dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(theTabs[1].nativeTabItem.nativeElement);

            theTabs[1].nativeTabItem.nativeElement.dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(theTabs[2].nativeTabItem.nativeElement);

            theTabs[2].nativeTabItem.nativeElement.dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(theTabs[0].nativeTabItem.nativeElement);

            theTabs[0].nativeTabItem.nativeElement.dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(theTabs[2].nativeTabItem.nativeElement);

            theTabs[2].nativeTabItem.nativeElement.dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(theTabs[1].nativeTabItem.nativeElement);
        }));

        it('should focus first/last tab when pressing home/end button', fakeAsync(() => {
            theTabs[0].nativeTabItem.nativeElement.click();
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            theTabs[0].nativeTabItem.nativeElement.dispatchEvent(KEY_END_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(theTabs[2].nativeTabItem.nativeElement);

            theTabs[2].nativeTabItem.nativeElement.dispatchEvent(KEY_HOME_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(theTabs[0].nativeTabItem.nativeElement);
        }));

        it('should select focused tabs on enter/space', fakeAsync(() => {
            theTabs[0].nativeTabItem.nativeElement.click();
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            theTabs[0].nativeTabItem.nativeElement.dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(theTabs[2].nativeTabItem.nativeElement);

            theTabs[2].nativeTabItem.nativeElement.dispatchEvent(KEY_ENTER_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(document.activeElement).toBe(theTabs[2].nativeTabItem.nativeElement);

            theTabs[2].nativeTabItem.nativeElement.dispatchEvent(KEY_HOME_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(document.activeElement).toBe(theTabs[0].nativeTabItem.nativeElement);

            theTabs[0].nativeTabItem.nativeElement.dispatchEvent(KEY_SPACE_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(theTabs[0].nativeTabItem.nativeElement);
        }));

        it('should not focus disabled tabs when navigating with keyboard', fakeAsync(() => {
            fixture = TestBed.createComponent(TabsRoutingDisabledTestComponent);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            theTabs = tabsComp.contentTabs.toArray();

            theTabs[1].nativeTabItem.nativeElement.click();
            tick(200);
            fixture.detectChanges();

            theTabs[1].nativeTabItem.nativeElement.dispatchEvent(KEY_RIGHT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(document.activeElement).toBe(theTabs[3].nativeTabItem.nativeElement);

            theTabs[3].nativeTabItem.nativeElement.dispatchEvent(KEY_HOME_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(document.activeElement).toBe(theTabs[1].nativeTabItem.nativeElement);

            theTabs[1].nativeTabItem.nativeElement.dispatchEvent(KEY_LEFT_EVENT);
            tick(200);
            fixture.detectChanges();
            expect(document.activeElement).toBe(theTabs[3].nativeTabItem.nativeElement);
        }));

        it('should not navigate to an URL blocked by activate guard', fakeAsync(() => {
            fixture = TestBed.createComponent(TabsRoutingGuardTestComponent);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            theTabs = tabsComp.contentTabs.toArray();

            fixture.ngZone.run(() => {
 router.initialNavigation();
});
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => {
 UIInteractions.simulateClickAndSelectEvent(theTabs[0].nativeTabItem);
});
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(theTabs[0].selected).toBe(true);
            expect(theTabs[1].selected).toBe(false);

            fixture.ngZone.run(() => {
 UIInteractions.simulateClickAndSelectEvent(theTabs[1].nativeTabItem);
});
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(theTabs[0].selected).toBe(true);
            expect(theTabs[1].selected).toBe(false);
        }));

    });

    describe('Tabs-only Mode With Initial Selection Set on TabItems Tests', () => {
        let fixture;
        let tabsComp;
        let theTabs;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabsTabsOnlyModeTest1Component);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            theTabs = tabsComp.tabs.toArray();
        }));

        it('should retain the correct initial selection set by the isSelected property', () => {
            expect(theTabs[0].selected).toBe(false);
            expect(theTabs[0].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(theTabs[1].selected).toBe(true);
            expect(theTabs[1].nativeTabItem.nativeElement.classList.contains(tabItemSelectedCssClass)).toBe(true);

            expect(theTabs[2].selected).toBe(false);
            expect(theTabs[2].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);
        });

        it('should hide the selection indicator when no tab item is selected', () => {
            expect(tabsComp.selectedIndicator.nativeElement.style.visibility).toBe('visible');
            theTabs[1].selected = false;
            fixture.detectChanges();
            expect(tabsComp.selectedIndicator.nativeElement.style.visibility).toBe('hidden');
        });
    });

    describe('Tabs-only Mode With Initial Selection Set on Tabs Component Tests', () => {
        let fixture;
        let tabsComp;
        let theTabs;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabsTabsOnlyModeTest2Component);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            theTabs = tabsComp.tabs.toArray();
        }));

        it('should retain the correct initial selection set by the selectedIndex property', () => {
            fixture.detectChanges();

            expect(theTabs[0].selected).toBe(false);
            expect(theTabs[0].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(theTabs[1].selected).toBe(false);
            expect(theTabs[1].nativeTabItem.nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(theTabs[2].selected).toBe(true);
            expect(theTabs[2].nativeTabItem.nativeElement.classList.contains(tabItemSelectedCssClass)).toBe(true);
        });

    });

});
