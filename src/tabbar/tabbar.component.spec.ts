import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTabBar, IgxTabPanel, IgxTab, IgxTabBarModule } from './tabbar.component';
import { Component, ViewChild, ContentChildren } from '@angular/core';

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
            tabbar = fixture.componentInstance.tabbar;

        expect(tabbar).toBeDefined();
        expect(tabbar instanceof IgxTabBar).toBeTruthy();
        expect(tabbar.tabPanels instanceof Array).toBeTruthy();
        expect(tabbar.tabPanels.length).toBe(3);

        for (let i = 0; i < tabbar.tabPanels.length; i++) {
            expect(tabbar.tabPanels[i] instanceof IgxTabPanel).toBeTruthy();
        }

        expect(tabbar.tabs instanceof Array).toBeTruthy();
        expect(tabbar.tabs.length).toBe(3);

        for (let i = 0; i < tabbar.tabs.length; i++) {
            expect(tabbar.tabs[i] instanceof IgxTab).toBeTruthy();
        }
    });

    it('should initialize default values of properties', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar;

        expect(tabbar.alignment).toBe("top");
        expect(tabbar.selectedIndex).toBeUndefined();
        expect(tabbar.tabs[0].isDisabled).toBeFalsy();
        expect(tabbar.tabs[1].isDisabled).toBeFalsy();
        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(0);
        expect(tabbar.selectedTab).toBe(tabbar.tabs[0]);
    });

    it('should initialize set/get properties', () => {
        let checkTabProperties,
            fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            tabs = tabbar.tabs,
            panels = tabbar.tabPanels,
            icons = ["library_music", "video_library", "library_books"];

        for (let i = 0; i < tabs.length; i++) {
            expect(tabs[i].label).toBeUndefined();
            expect(tabs[i].icon).toBeUndefined();

            expect(panels[i].label).toBeUndefined();
            expect(panels[i].icon).toBeUndefined();
        }

        fixture.detectChanges();

        for (let i = 0; i < tabs.length; i++) {
            expect(tabs[i].label).toBe("Tab " + (i + 1));
            expect(tabs[i].icon).toBe(icons[i]);

            // The panels should not be able to provide those properties - they are tab's properties
            expect(panels[i].label).toBeUndefined();
            expect(panels[i].icon).toBeUndefined();
        }
    });

    it('should select/deselect tabs', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            tabs = tabbar.tabs,
            tab1 = tabs[0],
            tab2 = tabs[1];

        expect(tabbar.selectedIndex).toBeUndefined();

        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(0);
        expect(tabbar.selectedTab).toBe(tab1);
        tab2.select();

        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(1);
        expect(tabbar.selectedTab).toBe(tab2);
        tabbar.select(0);

        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(0);
        expect(tabbar.selectedTab).toBe(tab1);

        // selected index is out of the range
        tabbar.select(3);
        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(0);
        expect(tabbar.selectedTab).toBe(tab1);

        // select disabled tab
        tab2.isDisabled = true;
        tabbar.select(1);

        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(0);
        expect(tabbar.selectedTab).toBe(tab1);

        // deselected index is out of the range
        tabbar.deselect(3);

        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(0);
        expect(tabbar.selectedTab).toBe(tab1);
        tab1.deselect();

        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBeFalsy();
        expect(tabbar.selectedTab).toBeFalsy();
    });

    it('should remove tab', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            tabs = tabbar.tabPanels,
            lastTab;

        expect(tabs.length).toBe(3);
        // remove tab outside the range
        tabbar.remove(5);

        fixture.detectChanges();
        expect(tabs.length).toBe(3);
        lastTab = tabs[tabs.length - 1];
        tabbar.remove(lastTab.index);

        fixture.detectChanges();
        expect(tabs.length).toBe(2);
        expect(tabs.indexOf(lastTab)).toBe(-1); // the tab is removed and is not part of the tab array
        tabbar.remove(0);

        fixture.detectChanges();
        expect(tabs.length).toBe(1);
        expect(tabs[0].index).toBe(0);
    });

    it('should calculate height and marginTop on top alignment', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            wrapper = fixture.componentInstance.wrapperDiv,
            tab1 = tabbar.tabPanels[0],
            tab2 = tabbar.tabPanels[1],
            testWrapperHeight = 600;

        wrapper.nativeElement.style.height = testWrapperHeight + "px";
        wrapper.nativeElement.style.position = "relative";
        expect(tabbar.alignment).toBe("top");
        expect(tab1.marginTop).toBeFalsy();
        expect(tab2.marginTop).toBeFalsy();
        expect(tab1.height).toBeFalsy();
        expect(tab2.height).toBeFalsy();

        fixture.detectChanges();
        expect(tabbar.alignment).toBe("top");
        expect(tab1.marginTop).toBe(tabbar.tabListHeight + "px");
        expect(tab2.marginTop).toBe(tabbar.tabListHeight + "px");
        //expect(tab1.height).toBe(testWrapperHeight - tabbar.tabListHeight + "px");
        //expect(tab2.height).toBe(testWrapperHeight - tabbar.tabListHeight + "px");
    });

    it('should calculate height and marginTop on bottom alignment', () => {
        let fixture = TestBed.createComponent(BottomTabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            wrapper = fixture.componentInstance.wrapperDiv,
            tab1 = tabbar.tabPanels[0],
            tab2 = tabbar.tabPanels[1],
            testWrapperHeight = 600;

        wrapper.nativeElement.style.height = testWrapperHeight + "px";
        wrapper.nativeElement.style.position = "relative";
        expect(tabbar.alignment).toBe("top");
        expect(tab1.marginTop).toBeFalsy();
        expect(tab2.marginTop).toBeFalsy();
        expect(tab1.height).toBeFalsy();
        expect(tab2.height).toBeFalsy();

        fixture.detectChanges();
        expect(tabbar.alignment).toBe("bottom");
        expect(tab1.marginTop).toBe("0px");
        expect(tab2.marginTop).toBe("0px");
        //expect(tab1.height).toBe(testWrapperHeight - tabbar.tabListHeight + "px");
        //expect(tab2.height).toBe(testWrapperHeight - tabbar.tabListHeight + "px");
    });
});

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tab-bar>
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