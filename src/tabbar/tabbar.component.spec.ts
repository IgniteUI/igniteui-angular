import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTabBar, IgxTabPanel, IgxTab, IgxTabBarModule } from './tabbar.component';
import { Component, ViewChild, ContentChildren, QueryList, AfterViewChecked, AfterContentChecked } from '@angular/core';

describe("TabBar", function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [IgxTabBarModule],
            declarations: [TabBarTestComponent, BottomTabBarTestComponent]
        })
            .compileComponents();
    }));

    it('should initialize igx-tab-bar, igx-tab-panel and igx-tab', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            panels: IgxTabPanel[], tabs: IgxTab[];

        fixture.detectChanges();

        panels = tabbar.panels.toArray();
        tabs = tabbar.tabs.toArray(); 

        expect(tabbar).toBeDefined();
        expect(tabbar instanceof IgxTabBar).toBeTruthy();
        expect(tabbar.panels instanceof QueryList).toBeTruthy();
        expect(tabbar.panels.length).toBe(3);

        for (let i = 0; i < tabbar.panels.length; i++) {
            expect(panels[i] instanceof IgxTabPanel).toBeTruthy();
            expect(panels[i].relatedTab).toBe(tabs[i]);
        }

        expect(tabbar.tabs instanceof QueryList).toBeTruthy();
        expect(tabbar.tabs.length).toBe(3);

        for (let i = 0; i < tabbar.tabs.length; i++) {
            expect(tabs[i] instanceof IgxTab).toBeTruthy();
            expect(tabs[i].relatedPanel).toBe(panels[i]);
        }
    });

    it('should initialize default values of properties', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            tabs;

        expect(tabbar.selectedIndex).toBe(-1);
        expect(tabbar.selectedTab).toBeUndefined();

        fixture.componentInstance.tabSelectedHandler = function () {
            expect(tabbar.selectedIndex).toBe(0);
            expect(tabbar.selectedTab).toBe(tabs[0]);
        }

        fixture.detectChanges();

        tabs = tabbar.tabs.toArray();
        expect(tabs[0].isDisabled).toBeFalsy();
        expect(tabs[1].isDisabled).toBeFalsy();
    });

    it('should initialize set/get properties', () => {
        let checkTabProperties,
            fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            tabs, panels,
            icons = ["library_music", "video_library", "library_books"];

        fixture.detectChanges();

        tabs = tabbar.tabs.toArray();
        panels = tabbar.panels.toArray();

        for (let i = 0; i < tabs.length; i++) {
            expect(panels[i].label).toBe("Tab " + (i + 1));
            expect(panels[i].icon).toBe(icons[i]);
        }
    });

    it('should select/deselect tabs', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            tabs, tab1: IgxTab, tab2: IgxTab;

        expect(tabbar.selectedIndex).toBe(-1);
        fixture.componentInstance.tabSelectedHandler = function () {
            expect(tabbar.selectedIndex).toBe(0);
            expect(tabbar.selectedTab).toBe(tab1);
        }

        fixture.detectChanges();
        tabs = tabbar.tabs.toArray();
        tab1 = tabs[0];
        tab2 = tabs[1];

        fixture.componentInstance.tabSelectedHandler = function () { };
        
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
        tab2.relatedPanel.isDisabled = true;
        tab2.select();
        fixture.detectChanges();

        expect(tabbar.selectedIndex).toBe(0);
        expect(tabbar.selectedTab).toBe(tab1);
        expect(tab1.isSelected).toBeTruthy();
        expect(tab2.isSelected).toBeFalsy();
    });
});

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tab-bar (onTabSelected)="tabSelectedHandler($event)">
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
                        Vivamus sit amet purus eu lectus cursus rhoncus quis non ex. Cras ac nulla sed arcu finibus volutpat.
                        Vivamus risus ipsum, pharetra a augue nec, euismod fringilla odio. Integer id velit rutrum, accumsan ante a, semper nunc.
                        Phasellus ultrices tincidunt imperdiet. Nullam vulputate mauris diam.
                         Nullam elementum, libero vel varius fermentum, lorem ex bibendum nulla, pretium lacinia erat nibh vel massa.
                        In hendrerit, sapien ac mollis iaculis, dolor tellus malesuada sem, a accumsan lectus nisl facilisis leo.
                        Curabitur consequat sit amet nulla at consequat. Duis volutpat tristique luctus.
                    </p>
                </igx-tab-panel>
            </igx-tab-bar>
        </div>`
})
class TabBarTestComponent {
    @ViewChild(IgxTabBar) tabbar: IgxTabBar;
    @ViewChild("wrapperDiv") wrapperDiv: any;

    tabSelectedHandler(args) {
    }
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tab-bar alignment="bottom">
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
                        Vivamus sit amet purus eu lectus cursus rhoncus quis non ex. Cras ac nulla sed arcu finibus volutpat.
                        Vivamus risus ipsum, pharetra a augue nec, euismod fringilla odio. Integer id velit rutrum, accumsan ante a, semper nunc.
                        Phasellus ultrices tincidunt imperdiet. Nullam vulputate mauris diam.
                         Nullam elementum, libero vel varius fermentum, lorem ex bibendum nulla, pretium lacinia erat nibh vel massa.
                        In hendrerit, sapien ac mollis iaculis, dolor tellus malesuada sem, a accumsan lectus nisl facilisis leo.
                        Curabitur consequat sit amet nulla at consequat. Duis volutpat tristique luctus.
                    </p>
                </igx-tab-panel>
            </igx-tab-bar>
        </div>`
})
class BottomTabBarTestComponent {
    @ViewChild(IgxTabBar) tabbar: IgxTabBar;
    @ViewChild("wrapperDiv") wrapperDiv: any;
}