import { Component, QueryList, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IgxBottomNavComponent,
         IgxBottomNavModule,
         IgxTabComponent,
         IgxTabPanelComponent } from './tabbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from '../test-utils/configure-suite';
import { BottomNavRoutingViewComponentsModule,
    BottomNavRoutingView1Component,
    BottomNavRoutingView2Component,
    BottomNavRoutingView3Component,
    BottomNavRoutingView4Component,
    BottomNavRoutingView5Component} from './routing-view-components.spec';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { BottomNavRoutingTestGuard } from './bottom-nav-routing-test-guard.spec';

describe('IgxBottomNav', () => {
    configureTestSuite();

    const tabItemNormalCssClass = 'igx-bottom-nav__menu-item';
    const tabItemSelectedCssClass = 'igx-bottom-nav__menu-item--selected';

    beforeAll(waitForAsync(() => {
        const testRoutes = [
            { path: 'view1', component: BottomNavRoutingView1Component, canActivate: [BottomNavRoutingTestGuard] },
            { path: 'view2', component: BottomNavRoutingView2Component, canActivate: [BottomNavRoutingTestGuard] },
            { path: 'view3', component: BottomNavRoutingView3Component, canActivate: [BottomNavRoutingTestGuard] },
            { path: 'view4', component: BottomNavRoutingView4Component, canActivate: [BottomNavRoutingTestGuard] },
            { path: 'view5', component: BottomNavRoutingView5Component, canActivate: [BottomNavRoutingTestGuard] },
        ];

        TestBed.configureTestingModule({
            declarations: [TabBarTestComponent, BottomTabBarTestComponent, TemplatedTabBarTestComponent, TabBarRoutingTestComponent,
                TabBarTabsOnlyModeTestComponent, BottomNavRoutingGuardTestComponent, BottomNavTestHtmlAttributesComponent],
            imports: [IgxBottomNavModule, BottomNavRoutingViewComponentsModule, RouterTestingModule.withRoutes(testRoutes)],
            providers: [BottomNavRoutingTestGuard]
        }).compileComponents();
    }));

    describe('Html Attributes', () => {
        let fixture;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(BottomNavTestHtmlAttributesComponent);
        }));

        it('should set the correct attributes on the html elements', () => {
            fixture.detectChanges();

            const igxBottomNavs = document.querySelectorAll('igx-bottom-nav');
            expect(igxBottomNavs.length).toBe(2);

            const startIndex = parseInt(igxBottomNavs[0].id.replace('igx-bottom-nav-', ''), 10);
            for (let tabIndex = startIndex; tabIndex < startIndex + 2; tabIndex++) {
                const tab = igxBottomNavs[tabIndex - startIndex];
                expect(tab.id).toEqual(`igx-bottom-nav-${tabIndex}`);

                const headers = tab.querySelectorAll('igx-tab');
                const contents = tab.querySelectorAll('igx-tab-panel');
                expect(headers.length).toBe(3);
                expect(contents.length).toBe(3);

                for (let itemIndex = 0; itemIndex < 3; itemIndex++) {
                    const headerId = `igx-tab-${tabIndex}-${itemIndex}`;
                    const contentId = `igx-tab-panel-${tabIndex}-${itemIndex}`;

                    expect(headers[itemIndex].id).toEqual(headerId);
                    expect(headers[itemIndex].getAttribute('aria-controls')).toEqual(contentId);

                    expect(contents[itemIndex].id).toEqual(contentId);
                    expect(contents[itemIndex].getAttribute('aria-labelledby')).toEqual(headerId);
                }
            }
        });
    });

    describe('Component with Panels Definitions', () => {
        let fixture;
        let tabbar;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabBarTestComponent);
            tabbar = fixture.componentInstance.tabbar;
        }));

        it('should initialize igx-bottom-nav, igx-tab-panel and igx-tab', () => {
            fixture.detectChanges();
            const panels: IgxTabPanelComponent[] = tabbar.panels.toArray();
            const tabs: IgxTabComponent[] = tabbar.tabs.toArray();

            expect(tabbar).toBeDefined();
            expect(tabbar.id).toContain('igx-bottom-nav-');
            expect(tabbar instanceof IgxBottomNavComponent).toBeTruthy();
            expect(tabbar.panels instanceof QueryList).toBeTruthy();
            expect(tabbar.panels.length).toBe(3);

            for (let i = 0; i < tabbar.panels.length; i++) {
                expect(panels[i] instanceof IgxTabPanelComponent).toBeTruthy();
                expect(panels[i].relatedTab).toBe(tabs[i]);
            }

            expect(tabbar.tabs instanceof QueryList).toBeTruthy();
            expect(tabbar.tabs.length).toBe(3);

            for (let i = 0; i < tabbar.tabs.length; i++) {
                expect(tabs[i] instanceof IgxTabComponent).toBeTruthy();
                expect(tabs[i].relatedPanel).toBe(panels[i]);
            }
        });

        it('should initialize default values of properties', () => {
            expect(tabbar.selectedIndex).toBe(-1);
            expect(tabbar.selectedTab).toBeUndefined();

            fixture.componentInstance.tabSelectedHandler = () => {
                expect(tabbar.selectedIndex).toBe(0);
                expect(tabbar.selectedTab).toBe(tabs[0]);
            };

            fixture.detectChanges();

            const tabs = tabbar.tabs.toArray();
            expect(tabs[0].disabled).toBeFalsy();
            expect(tabs[1].disabled).toBeFalsy();
        });

        it('should initialize set/get properties', () => {
            const icons = ['library_music', 'video_library', 'library_books'];

            fixture.detectChanges();
            const tabs = tabbar.tabs.toArray();
            const panels = tabbar.panels.toArray();

            for (let i = 0; i < tabs.length; i++) {
                expect(panels[i].label).toBe('Tab ' + (i + 1));
                expect(panels[i].icon).toBe(icons[i]);
            }
        });

        it('should set/get properties on panels through tabs', () => {
            const iconValues = ['library_music', 'video_library', 'library_books'];
            const labelValues = ['Tab1', 'Tab2', 'Tab3'];
            const disabledValues = [true, false, true];

            fixture.detectChanges();
            const tabs = tabbar.tabs.toArray();
            const panels = tabbar.panels.toArray();

            for (let i = 0; i < tabs.length; i++) {
                tabs[i].icon = iconValues[i];
                tabs[i].label = labelValues[i];
                tabs[i].disabled = disabledValues[i];
                fixture.detectChanges();
                expect(panels[i].icon).toBe(iconValues[i]);
                expect(panels[i].label).toBe(labelValues[i]);
                expect(panels[i].disabled).toBe(disabledValues[i]);
            }
        });

        it('should set/get selection on panels through tabs', () => {
            fixture.detectChanges();
            const tabs = tabbar.tabs.toArray();
            const panels = tabbar.panels.toArray();

            tabs[0].isSelected = true;
            expect(panels[0].isSelected).toBe(true);
            expect(panels[1].isSelected).toBe(false);
            expect(panels[2].isSelected).toBe(false);

            tabs[1].isSelected = true;
            fixture.detectChanges();
            expect(panels[0].isSelected).toBe(false);
            expect(panels[1].isSelected).toBe(true);
            expect(panels[2].isSelected).toBe(false);

            tabs[2].isSelected = true;
            fixture.detectChanges();
            expect(panels[0].isSelected).toBe(false);
            expect(panels[1].isSelected).toBe(false);
            expect(panels[2].isSelected).toBe(true);
        });

        it('should select/deselect tabs', () => {
            expect(tabbar.selectedIndex).toBe(-1);
            fixture.componentInstance.tabSelectedHandler = () => {
                expect(tabbar.selectedIndex).toBe(0);
                expect(tabbar.selectedTab).toBe(tab1);
            };

            fixture.detectChanges();
            const tabs = tabbar.tabs.toArray();
            const tab1: IgxTabComponent = tabs[0];
            const tab2: IgxTabComponent = tabs[1];

            fixture.componentInstance.tabSelectedHandler = () => { };

            tab2.select();
            fixture.detectChanges();

            expect(tabbar.selectedIndex).toBe(1);
            expect(tabbar.selectedTab).toBe(tab2);
            expect(tabbar.selectedIndex).toBe(1);
            expect(tab2.isSelected).toBeTruthy();
            expect(tab1.isSelected).toBeFalsy();

            tab1.select();
            fixture.detectChanges();

            expect(tabbar.selectedIndex).toBe(0);
            expect(tabbar.selectedTab).toBe(tab1);
            expect(tab1.isSelected).toBeTruthy();
            expect(tab2.isSelected).toBeFalsy();

            // select disabled tab
            tab2.relatedPanel.disabled = true;
            tab2.select();
            fixture.detectChanges();

            expect(tabbar.selectedIndex).toBe(0);
            expect(tabbar.selectedTab).toBe(tab1);
            expect(tab1.isSelected).toBeTruthy();
            expect(tab2.isSelected).toBeFalsy();
        });

    });

    describe('Component with Custom Template', () => {
        let fixture;
        let tabbar;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TemplatedTabBarTestComponent);
            tabbar = fixture.componentInstance.tabbar;
        }));

        it('should initialize igx-tab custom template', () => {
            fixture.detectChanges();
            expect(tabbar.tabs.length).toBe(3);
            tabbar.tabs.forEach((tab) => expect(tab.relatedPanel.customTabTemplate).toBeDefined());
        });

    });

    describe('Routing Navigation Tests', () => {
        let router;
        let location;
        let fixture;
        let bottomNav;
        let theTabs;

        beforeEach(waitForAsync(() => {
            router = TestBed.inject(Router);
            location = TestBed.inject(Location);
            fixture = TestBed.createComponent(TabBarRoutingTestComponent);
            bottomNav = fixture.componentInstance.bottomNavComp;
            fixture.detectChanges();
            theTabs = bottomNav.contentTabs.toArray();
        }));

        it('should navigate to the correct URL when clicking on tab buttons', fakeAsync(() => {
            fixture.ngZone.run(() => router.initialNavigation());
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => UIInteractions.simulateClickAndSelectEvent(theTabs[2].elementRef()));
            tick();
            expect(location.path()).toBe('/view3');

            fixture.ngZone.run(() => UIInteractions.simulateClickAndSelectEvent(theTabs[1].elementRef()));
            tick();
            expect(location.path()).toBe('/view2');

            fixture.ngZone.run(() => UIInteractions.simulateClickAndSelectEvent(theTabs[0].elementRef()));
            tick();
            expect(location.path()).toBe('/view1');
        }));

        it('should select the correct tab button/panel when navigating an URL', fakeAsync(() => {
            fixture.ngZone.run(() => router.initialNavigation());
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => router.navigate(['/view3']));
            tick();
            expect(location.path()).toBe('/view3');
            fixture.detectChanges();
            expect(bottomNav.selectedIndex).toBe(2);
            expect(theTabs[2].isSelected).toBe(true);
            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[1].isSelected).toBe(false);

            fixture.ngZone.run(() => router.navigate(['/view2']));
            tick();
            expect(location.path()).toBe('/view2');
            fixture.detectChanges();
            expect(bottomNav.selectedIndex).toBe(1);
            expect(theTabs[1].isSelected).toBe(true);
            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[2].isSelected).toBe(false);

            fixture.ngZone.run(() => router.navigate(['/view1']));
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(bottomNav.selectedIndex).toBe(0);
            expect(theTabs[0].isSelected).toBe(true);
            expect(theTabs[1].isSelected).toBe(false);
            expect(theTabs[2].isSelected).toBe(false);
        }));

        it('should not navigate to an URL blocked by activate guard', fakeAsync(() => {
            fixture = TestBed.createComponent(BottomNavRoutingGuardTestComponent);
            bottomNav = fixture.componentInstance.bottomNavComp;
            fixture.detectChanges();
            theTabs = bottomNav.contentTabs.toArray();

            fixture.ngZone.run(() => router.initialNavigation());
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => UIInteractions.simulateClickAndSelectEvent(theTabs[0].elementRef()));
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(bottomNav.selectedIndex).toBe(0);
            expect(theTabs[0].isSelected).toBe(true);
            expect(theTabs[1].isSelected).toBe(false);

            fixture.ngZone.run(() => {
                UIInteractions.simulateClickAndSelectEvent(theTabs[1].elementRef());
            });
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(bottomNav.selectedIndex).toBe(0);
            expect(theTabs[0].isSelected).toBe(true);
            expect(theTabs[1].isSelected).toBe(false);
        }));

    });

    describe('Tabs-only Mode Tests', () => {
        let fixture;
        let bottomNav;
        let theTabs;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabBarTabsOnlyModeTestComponent);
            bottomNav = fixture.componentInstance.bottomNavComp;
            fixture.detectChanges();
            theTabs = bottomNav.contentTabs.toArray();
        }));

        it('should retain the correct initial selection status', () => {
            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[0].elementRef().nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(theTabs[1].isSelected).toBe(true);
            expect(theTabs[1].elementRef().nativeElement.classList.contains(tabItemSelectedCssClass)).toBe(true);

            expect(theTabs[2].isSelected).toBe(false);
            expect(theTabs[2].elementRef().nativeElement.classList.contains(tabItemNormalCssClass)).toBe(true);
        });
    });
});

@Component({
    template: `
        <div #wrapperDiv>
            <igx-bottom-nav (onTabSelected)="tabSelectedHandler($event)">
                <igx-tab-panel label="Tab 1" icon="library_music">
                    <h1>Tab 1 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tab-panel>
                <igx-tab-panel label="Tab 2" icon="video_library">
                    <h1>Tab 2 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tab-panel>
                <igx-tab-panel label="Tab 3" icon="library_books">
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
                </igx-tab-panel>
            </igx-bottom-nav>
        </div>`
})
class TabBarTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true }) public tabbar: IgxBottomNavComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;

    public tabSelectedHandler() {
    }
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-bottom-nav alignment="bottom">
                <igx-tab-panel label="Tab 1" icon="library_music">
                    <h1>Tab 1 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tab-panel>
                <igx-tab-panel label="Tab 2" icon="video_library">
                    <h1>Tab 2 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tab-panel>
                <igx-tab-panel label="Tab 3" icon="library_books">
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
                </igx-tab-panel>
            </igx-bottom-nav>
        </div>`
})
class BottomTabBarTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true }) public tabbar: IgxBottomNavComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
}

@Component({
    template: `
        <div #wrapperDiv>

        <igx-bottom-nav>
            <igx-tab-panel label="dede">
                <ng-template igxTab>
                    <div>T1</div>
                 </ng-template>
                 <h1>Tab 1 Content</h1>
              </igx-tab-panel>
            <igx-tab-panel label="Tab 2">
                <ng-template igxTab>
                    <div>T2</div>
                </ng-template>
                <h1>Tab 2 Content</h1>
            </igx-tab-panel>
            <igx-tab-panel label="Tab 3">
                <ng-template igxTab>
                    <div>T3</div>
                </ng-template>
                <h1>Tab 3 Content</h1>
            </igx-tab-panel>
        </igx-bottom-nav>
        </div>`
})
class TemplatedTabBarTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true }) public tabbar: IgxBottomNavComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
}

@Component({
    template: `
        <div #wrapperDiv>
            <div>
                <router-outlet></router-outlet>
            </div>
            <igx-bottom-nav>
                <igx-tab label="Tab 1" icon="library_music"
                    routerLink="/view1" routerLinkActive #rla1="routerLinkActive" [isSelected]="rla1.isActive">
                </igx-tab>
                <igx-tab label="Tab 2" icon="video_library"
                    routerLink="/view2" routerLinkActive #rla2="routerLinkActive" [isSelected]="rla2.isActive">
                </igx-tab>
                <igx-tab label="Tab 3" icon="library_books"
                    routerLink="/view3" routerLinkActive #rla3="routerLinkActive" [isSelected]="rla3.isActive">
                </igx-tab>
            </igx-bottom-nav>
        </div>
    `
})
class TabBarRoutingTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true })
    public bottomNavComp: IgxBottomNavComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-bottom-nav>
                <igx-tab label="Tab 1" icon="library_music">
                </igx-tab>
                <igx-tab label="Tab 2" icon="video_library" [isSelected]="true">
                </igx-tab>
                <igx-tab label="Tab 3" icon="library_books">
                </igx-tab>
            </igx-bottom-nav>
        </div>
    `
})
class TabBarTabsOnlyModeTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true })
    public bottomNavComp: IgxBottomNavComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <div>
                <router-outlet></router-outlet>
            </div>
            <igx-bottom-nav>
                <igx-tab label="Tab 1" icon="library_music"
                    routerLink="/view1" routerLinkActive #rla1="routerLinkActive" [isSelected]="rla1.isActive">
                </igx-tab>
                <igx-tab label="Tab 5" icon="library_books"
                    routerLink="/view5" routerLinkActive #rlaX="routerLinkActive" [isSelected]="rlaX.isActive">
                </igx-tab>
            </igx-bottom-nav>
        </div>
    `
})
class BottomNavRoutingGuardTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true })
    public bottomNavComp: IgxBottomNavComponent;
}

@Component({
    template: `
        <div>
            <div>
                <igx-bottom-nav>
                    <igx-tab-panel label="Tab 1">
                        <div>Content 1</div>
                    </igx-tab-panel>
                    <igx-tab-panel label="Tab 2">
                        <div>Content 2</div>
                    </igx-tab-panel>
                    <igx-tab-panel label="Tab 3">
                        <div>Content 3</div>
                    </igx-tab-panel>
                </igx-bottom-nav>
            </div>
            <div>
                <igx-bottom-nav>
                    <igx-tab-panel label="Tab 4">
                        <div>Content 4</div>
                    </igx-tab-panel>
                    <igx-tab-panel label="Tab 5">
                        <div>Content 5</div>
                    </igx-tab-panel>
                    <igx-tab-panel label="Tab 6">
                        <div>Content 6</div>
                    </igx-tab-panel>
                </igx-bottom-nav>
            </div>
        </div>
        `
})
class BottomNavTestHtmlAttributesComponent {
    @ViewChild(IgxBottomNavComponent, { static: true }) public tabbar: IgxBottomNavComponent;
}
