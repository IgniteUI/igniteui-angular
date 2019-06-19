import { Component, QueryList, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IgxBottomNavComponent,
         IgxBottomNavModule,
         IgxTabComponent,
         IgxTabPanelComponent } from './tabbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from '../test-utils/configure-suite';
import { BottomNavRoutingViewComponentsModule,
    BottomNavRoutingView1Component,
    BottomNavRoutingView2Component,
    BottomNavRoutingView3Component } from './routing-view-components.spec';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

describe('TabBar', () => {
    configureTestSuite();
    beforeEach(async(() => {

        const testRoutes = [
            { path: 'view1', component: BottomNavRoutingView1Component },
            { path: 'view2', component: BottomNavRoutingView2Component },
            { path: 'view3', component: BottomNavRoutingView3Component }
        ];

        TestBed.configureTestingModule({
            declarations: [TabBarTestComponent, BottomTabBarTestComponent, TemplatedTabBarTestComponent, TabBarRoutingTestComponent,
                TabBarTabsOnlyModeTestComponent],
            imports: [IgxBottomNavModule, BottomNavRoutingViewComponentsModule, RouterTestingModule.withRoutes(testRoutes)]
        })
            .compileComponents();
    }));

    it('should initialize igx-bottom-nav, igx-tab-panel and igx-tab', () => {
        const fixture = TestBed.createComponent(TabBarTestComponent);
        const tabbar = fixture.componentInstance.tabbar;
        let panels: IgxTabPanelComponent[];
        let tabs: IgxTabComponent[];

        fixture.detectChanges();

        panels = tabbar.panels.toArray();
        tabs = tabbar.tabs.toArray();

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
        const fixture = TestBed.createComponent(TabBarTestComponent);
        const tabbar = fixture.componentInstance.tabbar;
        let tabs;

        expect(tabbar.selectedIndex).toBe(-1);
        expect(tabbar.selectedTab).toBeUndefined();

        fixture.componentInstance.tabSelectedHandler = () => {
            expect(tabbar.selectedIndex).toBe(0);
            expect(tabbar.selectedTab).toBe(tabs[0]);
        };

        fixture.detectChanges();

        tabs = tabbar.tabs.toArray();
        expect(tabs[0].disabled).toBeFalsy();
        expect(tabs[1].disabled).toBeFalsy();
    });

    it('should initialize set/get properties', () => {
        const fixture = TestBed.createComponent(TabBarTestComponent);
        const tabbar = fixture.componentInstance.tabbar;
        const icons = ['library_music', 'video_library', 'library_books'];
        let tabs;
        let panels;

        fixture.detectChanges();

        tabs = tabbar.tabs.toArray();
        panels = tabbar.panels.toArray();

        for (let i = 0; i < tabs.length; i++) {
            expect(panels[i].label).toBe('Tab ' + (i + 1));
            expect(panels[i].icon).toBe(icons[i]);
        }
    });

    it('should select/deselect tabs', () => {
        const fixture = TestBed.createComponent(TabBarTestComponent);
        const tabbar = fixture.componentInstance.tabbar;
        let tabs;
        let tab1: IgxTabComponent;
        let tab2: IgxTabComponent;

        expect(tabbar.selectedIndex).toBe(-1);
        fixture.componentInstance.tabSelectedHandler = () => {
            expect(tabbar.selectedIndex).toBe(0);
            expect(tabbar.selectedTab).toBe(tab1);
        };

        fixture.detectChanges();
        tabs = tabbar.tabs.toArray();
        tab1 = tabs[0];
        tab2 = tabs[1];

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

    it('should initialize igx-tab custom template', () => {
        const fixture = TestBed.createComponent(TemplatedTabBarTestComponent);
        const tabbar = fixture.componentInstance.tabbar;

        fixture.detectChanges();

        const tabs: IgxTabComponent[] = tabbar.tabs.toArray();

        expect(tabbar.tabs.length).toBe(3);

        tabbar.tabs.forEach((tab) => expect(tab.relatedPanel.customTabTemplate).toBeDefined());
    });

    describe('Routing Navigation Tests', () => {
        configureTestSuite();

        let router;
        let location;
        let fixture;
        let bottomNav;
        let theTabs;

        beforeEach(async(() => {
            router = TestBed.get(Router);
            location = TestBed.get(Location);
            fixture = TestBed.createComponent(TabBarRoutingTestComponent);
            bottomNav = fixture.componentInstance.bottomNavComp;
            fixture.detectChanges();
            theTabs = bottomNav.contentTabs.toArray();
        }));

        it('should navigate to the correct URL when clicking on tab buttons', fakeAsync(() => {
            fixture.ngZone.run(() => { router.initialNavigation(); });
            tick();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => { theTabs[2].elementRef().nativeElement.dispatchEvent(new Event('click')); });
            tick();
            expect(location.path()).toBe('/view3');

            fixture.ngZone.run(() => { theTabs[1].elementRef().nativeElement.dispatchEvent(new Event('click')); });
            tick();
            expect(location.path()).toBe('/view2');

            fixture.ngZone.run(() => { theTabs[0].elementRef().nativeElement.dispatchEvent(new Event('click')); });
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
            expect(bottomNav.selectedIndex).toBe(2);
            expect(theTabs[2].isSelected).toBe(true);

            fixture.ngZone.run(() => { router.navigate(['/view2']); });
            tick();
            expect(location.path()).toBe('/view2');
            fixture.detectChanges();
            expect(bottomNav.selectedIndex).toBe(1);
            expect(theTabs[1].isSelected).toBe(true);

            fixture.ngZone.run(() => { router.navigate(['/view1']); });
            tick();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(bottomNav.selectedIndex).toBe(0);
            expect(theTabs[0].isSelected).toBe(true);
        }));

    });

    describe('Tabs-only Mode Tests', () => {
        configureTestSuite();

        let fixture;
        let bottomNav;
        let theTabs;

        beforeEach(async(() => {
            fixture = TestBed.createComponent(TabBarTabsOnlyModeTestComponent);
            bottomNav = fixture.componentInstance.bottomNavComp;
            fixture.detectChanges();
            theTabs = bottomNav.contentTabs.toArray();
        }));

        it('should retain the correct initial selection status', () => {
            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[0].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item')).toBe(true);

            expect(theTabs[1].isSelected).toBe(true);
            expect(theTabs[1].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item--selected')).toBe(true);

            expect(theTabs[2].isSelected).toBe(false);
            expect(theTabs[2].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item')).toBe(true);
        });

        it('should have the correct selection set even when no active link is present on the tabs', () => {
            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[0].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item')).toBe(true);
            expect(theTabs[1].isSelected).toBe(true);
            expect(theTabs[1].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item--selected')).toBe(true);
            expect(theTabs[2].isSelected).toBe(false);
            expect(theTabs[2].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item')).toBe(true);

            theTabs[0].elementRef().nativeElement.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(theTabs[0].isSelected).toBe(true);
            expect(theTabs[0].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item--selected')).toBe(true);
            expect(theTabs[1].isSelected).toBe(false);
            expect(theTabs[1].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item')).toBe(true);
            expect(theTabs[2].isSelected).toBe(false);
            expect(theTabs[2].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item')).toBe(true);

            theTabs[2].elementRef().nativeElement.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(theTabs[0].isSelected).toBe(false);
            expect(theTabs[0].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item')).toBe(true);
            expect(theTabs[1].isSelected).toBe(false);
            expect(theTabs[1].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item')).toBe(true);
            expect(theTabs[2].isSelected).toBe(true);
            expect(theTabs[2].elementRef().nativeElement.classList.contains('igx-bottom-nav__menu-item--selected')).toBe(true);
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

    public tabSelectedHandler(args) {
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
                <igx-tab label="Tab 1" routerLink="/view1" routerLinkActive #rla1="routerLinkActive" [isSelected]="rla1.isActive">
                </igx-tab>
                <igx-tab label="Tab 2" routerLink="/view2" routerLinkActive #rla2="routerLinkActive" [isSelected]="rla2.isActive">
                </igx-tab>
                <igx-tab label="Tab 3" routerLink="/view3" routerLinkActive #rla3="routerLinkActive" [isSelected]="rla3.isActive">
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
                <igx-tab label="Tab 1">
                </igx-tab>
                <igx-tab label="Tab 2" [isSelected]="true">
                </igx-tab>
                <igx-tab label="Tab 3">
                </igx-tab>
            </igx-bottom-nav>
        </div>
    `
})
class TabBarTabsOnlyModeTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true })
    public bottomNavComp: IgxBottomNavComponent;
}
