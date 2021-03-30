import { QueryList } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { BottomTabBarTestComponent,
        TabBarRoutingTestComponent,
        TabBarTabsOnlyModeTestComponent,
        TabBarTestComponent,
        BottomNavRoutingGuardTestComponent,
        BottomNavTestHtmlAttributesComponent } from '../../test-utils/bottom-nav-components.spec';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxBottomNavModule } from './bottom-nav.module';
import { IgxBottomNavContentComponent } from './bottom-nav-content.component';
import { IgxBottomNavComponent, IgxBottomNavItemComponent } from './public_api';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxIconModule } from '../../icon/public_api';
import { RoutingTestGuard } from '../../test-utils/routing-test-guard.spec';
import { RoutingView1Component,
    RoutingView2Component,
    RoutingView3Component,
    RoutingView4Component,
    RoutingView5Component,
    RoutingViewComponentsModule } from '../../test-utils/routing-view-components.spec';

fdescribe('IgxBottomNav', () => {
    configureTestSuite();

    const tabItemNormalCssClass = 'igx-bottom-nav__menu-item';
    const tabItemSelectedCssClass = 'igx-bottom-nav__menu-item--selected';

    beforeAll(waitForAsync(() => {
        const testRoutes = [
            { path: 'view1', component: RoutingView1Component, canActivate: [RoutingTestGuard] },
            { path: 'view2', component: RoutingView2Component, canActivate: [RoutingTestGuard] },
            { path: 'view3', component: RoutingView3Component, canActivate: [RoutingTestGuard] },
            { path: 'view4', component: RoutingView4Component, canActivate: [RoutingTestGuard] },
            { path: 'view5', component: RoutingView5Component, canActivate: [RoutingTestGuard] },
        ];

        TestBed.configureTestingModule({
            declarations: [TabBarTestComponent, BottomTabBarTestComponent, TabBarRoutingTestComponent,
                TabBarTabsOnlyModeTestComponent, BottomNavRoutingGuardTestComponent, BottomNavTestHtmlAttributesComponent],
            imports: [IgxBottomNavModule, BrowserAnimationsModule, IgxIconModule, RoutingViewComponentsModule,
                RouterTestingModule.withRoutes(testRoutes)],
            providers: [RoutingTestGuard]
        }).compileComponents();
    }));

    describe('Html Attributes', () => {
        let fixture;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(BottomNavTestHtmlAttributesComponent);
            fixture.detectChanges();
        }));

        it('should set the correct attributes on the html elements', () => {
            const igxBottomNavs = document.querySelectorAll('igx-bottom-nav');
            expect(igxBottomNavs.length).toBe(2);

            igxBottomNavs.forEach((bottomNav, i) => {
                const tabHeaders = bottomNav.querySelectorAll('igx-bottom-nav-header');
                const tabPanels = bottomNav.querySelectorAll('igx-bottom-nav-content');
                expect(tabHeaders.length).toBe(3);
                expect(tabPanels.length).toBe(3);

                for (let itemIndex = 0; itemIndex < 3; itemIndex++) {
                    const headerId = `igx-bottom-nav-header-${itemIndex + 3 * i}`;
                    const panelId = `igx-bottom-nav-content-${itemIndex + 3 * i}`;

                    expect(tabHeaders[itemIndex].id).toEqual(headerId);
                    expect(tabPanels[itemIndex].id).toEqual(panelId);

                    expect(tabHeaders[itemIndex].getAttribute('aria-controls')).toEqual(panelId);
                    expect(tabPanels[itemIndex].getAttribute('aria-labelledby')).toEqual(headerId);
                }
            });
        });
    });

    describe('Component with Panels Definitions', () => {
        let fixture;
        let bottomNav;
        let tabItems: IgxBottomNavItemComponent[];

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabBarTestComponent);
            fixture.detectChanges();

            bottomNav = fixture.componentInstance.bottomNav;
            tabItems = bottomNav.items.toArray();
        }));

        it('should initialize igx-bottom-nav, igx-bottom-nav-content and igx-bottom-nav-item', () => {
            const panels: IgxBottomNavContentComponent[] = bottomNav.panels.toArray();

            expect(bottomNav).toBeDefined();
            expect(bottomNav instanceof IgxBottomNavComponent).toBeTruthy();
            expect(bottomNav.panels instanceof QueryList).toBeTruthy();
            expect(bottomNav.panels.length).toBe(3);

            for (let i = 0; i < bottomNav.panels.length; i++) {
                expect(panels[i] instanceof IgxBottomNavContentComponent).toBeTruthy();
                expect(panels[i].tab).toBe(tabItems[i]);
            }

            expect(bottomNav.items instanceof QueryList).toBeTruthy();
            expect(bottomNav.items.length).toBe(3);

            for (let i = 0; i < bottomNav.items.length; i++) {
                expect(tabItems[i] instanceof IgxBottomNavItemComponent).toBeTruthy();
                expect(tabItems[i].panelComponent).toBe(panels[i]);
            }
        });

        it('should initialize default values of properties', () => {
            expect(bottomNav.selectedIndex).toBe(0);
            expect(bottomNav.selectedItem).toBe(tabItems[0]);

            expect(tabItems[0].disabled).toBeFalsy();
            expect(tabItems[1].disabled).toBeFalsy();
        });

        it('should initialize set/get properties', () => {
            const icons = ['library_music', 'video_library', 'library_books'];

            const tabHeaderElements = tabItems.map(item => item.headerComponent.nativeElement);

            for (let i = 0; i < tabHeaderElements.length; i++) {
                expect(tabHeaderElements[i].firstElementChild.localName).toBe('igx-icon');
                expect(tabHeaderElements[i].firstElementChild.textContent).toBe(icons[i]);
                expect(tabHeaderElements[i].lastElementChild.localName).toBe('span');
                expect(tabHeaderElements[i].lastElementChild.textContent).toBe('Tab ' + (i + 1));
            }
        });

        it('should select/deselect tabs', fakeAsync(() => {
            expect(bottomNav.selectedIndex).toBe(0);
            const tab1: IgxBottomNavItemComponent = tabItems[0];
            const tab2: IgxBottomNavItemComponent = tabItems[1];

            tab2.selected = true;
            tick(100);
            fixture.detectChanges();

            expect(bottomNav.selectedIndex).toBe(1);
            expect(bottomNav.selectedItem).toBe(tab2);
            expect(tab2.selected).toBeTruthy();
            expect(tab1.selected).toBeFalsy();

            tab1.selected = true;
            tick(100);
            fixture.detectChanges();

            expect(bottomNav.selectedIndex).toBe(0);
            expect(bottomNav.selectedItem).toBe(tab1);
            expect(tab1.selected).toBeTruthy();
            expect(tab2.selected).toBeFalsy();

            // select disabled tab
            tab2.disabled = true;
            tab2.selected = true;
            tick(100);
            fixture.detectChanges();

            expect(bottomNav.selectedIndex).toBe(1);
            expect(bottomNav.selectedItem).toBe(tab2);
            expect(tab2.selected).toBeTruthy();
            expect(tab1.selected).toBeFalsy();
        }));

    });

    describe('Routing Navigation Tests', () => {
        let router;
        let location;
        let fixture;
        let bottomNav;
        let tabItems;
        let headers;

        beforeEach(waitForAsync(() => {
            router = TestBed.inject(Router);
            location = TestBed.inject(Location);
        }));

        describe('', () => {
            beforeEach(waitForAsync(() => {
                fixture = TestBed.createComponent(TabBarRoutingTestComponent);
                fixture.detectChanges();
                bottomNav = fixture.componentInstance.bottomNav;
                tabItems = bottomNav.items.toArray();
                headers = tabItems.map(item => item.headerComponent.nativeElement);
            }));

            it('should navigate to the correct URL when clicking on tab buttons', fakeAsync(() => {
                fixture.ngZone.run(() => router.initialNavigation());
                tick();
                expect(location.path()).toBe('/');

                fixture.ngZone.run(() => UIInteractions.simulateClickAndSelectEvent(headers[2]));
                tick();
                expect(location.path()).toBe('/view3');

                fixture.ngZone.run(() => UIInteractions.simulateClickAndSelectEvent(headers[1]));
                tick();
                expect(location.path()).toBe('/view2');

                fixture.ngZone.run(() => UIInteractions.simulateClickAndSelectEvent(headers[0]));
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
                expect(tabItems[2].selected).toBe(true);
                expect(tabItems[0].selected).toBe(false);
                expect(tabItems[1].selected).toBe(false);

                fixture.ngZone.run(() => router.navigate(['/view2']));
                tick();
                expect(location.path()).toBe('/view2');
                fixture.detectChanges();
                expect(bottomNav.selectedIndex).toBe(1);
                expect(tabItems[1].selected).toBe(true);
                expect(tabItems[0].selected).toBe(false);
                expect(tabItems[2].selected).toBe(false);

                fixture.ngZone.run(() => router.navigate(['/view1']));
                tick();
                expect(location.path()).toBe('/view1');
                fixture.detectChanges();
                expect(bottomNav.selectedIndex).toBe(0);
                expect(tabItems[0].selected).toBe(true);
                expect(tabItems[1].selected).toBe(false);
                expect(tabItems[2].selected).toBe(false);
            }));
        });

        describe('', () => {
            it('should not navigate to an URL blocked by activate guard', fakeAsync(() => {
                fixture = TestBed.createComponent(BottomNavRoutingGuardTestComponent);
                fixture.detectChanges();

                bottomNav = fixture.componentInstance.bottomNav;
                tabItems = bottomNav.items.toArray();
                headers = tabItems.map(item => item.headerComponent.nativeElement);

                fixture.ngZone.run(() => router.initialNavigation());
                tick();
                expect(location.path()).toBe('/');

                fixture.ngZone.run(() => UIInteractions.simulateClickAndSelectEvent(headers[0]));
                tick();
                expect(location.path()).toBe('/view1');
                fixture.detectChanges();
                expect(bottomNav.selectedIndex).toBe(0);
                expect(tabItems[0].selected).toBe(true);
                expect(tabItems[1].selected).toBe(false);

                fixture.ngZone.run(() => {
                    UIInteractions.simulateClickAndSelectEvent(headers[1]);
                });
                tick();
                expect(location.path()).toBe('/view1');
                fixture.detectChanges();
                expect(bottomNav.selectedIndex).toBe(0);
                expect(tabItems[0].selected).toBe(true);
                expect(tabItems[1].selected).toBe(false);
            }));
        });
    });

    describe('Tabs-only Mode Tests', () => {
        let fixture;
        let bottomNav;
        let tabItems;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(TabBarTabsOnlyModeTestComponent);
            bottomNav = fixture.componentInstance.bottomNav;
            fixture.detectChanges();
            tabItems = bottomNav.items.toArray();
        }));

        it('should retain the correct initial selection status', () => {
            const headers = tabItems.map(item => item.headerComponent.nativeElement);
            expect(tabItems[0].selected).toBe(false);
            expect(headers[0].classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(tabItems[1].selected).toBe(true);
            expect(headers[1].classList.contains(tabItemSelectedCssClass)).toBe(true);

            expect(tabItems[2].selected).toBe(false);
            expect(headers[2].classList.contains(tabItemNormalCssClass)).toBe(true);
        });
    });

    describe('Events', () => {
        let fixture;
        let bottomNav;
        let tabItems;
        let headers;
        let itemChangeSpy;
        let indexChangeSpy;
        let indexChangingSpy;

        describe('', () => {
            beforeEach(waitForAsync(() => {
                fixture = TestBed.createComponent(TabBarTestComponent);
                fixture.detectChanges();
                bottomNav = fixture.componentInstance.bottomNav;
                tabItems = bottomNav.items.toArray();
                headers = tabItems.map(item => item.headerComponent.nativeElement);
                itemChangeSpy = spyOn(bottomNav.selectedItemChange, 'emit').and.callThrough();
                indexChangeSpy = spyOn(bottomNav.selectedIndexChange, 'emit').and.callThrough();
                indexChangingSpy = spyOn(bottomNav.selectedIndexChanging, 'emit').and.callThrough();
            }));

            it('Validate the fired events on clicking tab headers.', fakeAsync(() => {
                tick(100);

                headers[1].dispatchEvent(new Event('click', { bubbles: true }));
                tick(200);
                fixture.detectChanges();
                expect(bottomNav.selectedIndex).toBe(1);

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: bottomNav,
                    cancel: false,
                    oldIndex: 0,
                    newIndex: 1
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(1);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: bottomNav,
                    oldItem: tabItems[0],
                    newItem: tabItems[1]
                });
            }));

            it('Cancel selectedIndexChanging event.', fakeAsync(() => {
                tick(100);
                bottomNav.selectedIndexChanging.pipe().subscribe((e) => e.cancel = true);
                fixture.detectChanges();

                headers[1].dispatchEvent(new Event('click', { bubbles: true }));
                tick(200);
                fixture.detectChanges();
                expect(bottomNav.selectedIndex).toBe(0);

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: bottomNav,
                    cancel: true,
                    oldIndex: 0,
                    newIndex: 1
                });
                expect(itemChangeSpy).not.toHaveBeenCalled();
                expect(indexChangeSpy).not.toHaveBeenCalled();
            }));
        });

        describe('& Routing', () => {
            let router;
            let location;
            const KEY_ENTER_EVENT = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            beforeEach(waitForAsync(() => {
                router = TestBed.inject(Router);
                location = TestBed.inject(Location);
                fixture = TestBed.createComponent(TabBarRoutingTestComponent);
                fixture.detectChanges();
                bottomNav = fixture.componentInstance.bottomNav;
                tabItems = bottomNav.items.toArray();
                headers = tabItems.map(item => item.headerComponent.nativeElement);
                itemChangeSpy = spyOn(bottomNav.selectedItemChange, 'emit');
                indexChangeSpy = spyOn(bottomNav.selectedIndexChange, 'emit');
                indexChangingSpy = spyOn(bottomNav.selectedIndexChanging, 'emit');
            }));

            it('Validate the events are not fired on clicking tab headers before pressing enter/space key.', fakeAsync(() => {
                fixture.ngZone.run(() => router.initialNavigation());
                tick();
                expect(location.path()).toBe('/');

                fixture.ngZone.run(() => {
                    UIInteractions.simulateClickAndSelectEvent(headers[1]);
                });
                tick();
                expect(location.path()).toBe('/view2');
                expect(bottomNav.selectedIndex).toBe(-1);

                expect(indexChangingSpy).not.toHaveBeenCalled();
                expect(indexChangeSpy).not.toHaveBeenCalled();
                expect(itemChangeSpy).not.toHaveBeenCalled();

                headers[1].dispatchEvent(KEY_ENTER_EVENT);
                tick(200);
                fixture.detectChanges();

                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: bottomNav,
                    oldItem: undefined,
                    newItem: tabItems[1]
                });
                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: bottomNav,
                    cancel: false,
                    oldIndex: -1,
                    newIndex: 1
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(1);
            }));
        });
    });
});
