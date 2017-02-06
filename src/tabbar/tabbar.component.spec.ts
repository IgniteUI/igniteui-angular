import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTabBar, IgxTabPanel, IgxTab, IgxTabBarModule } from './tabbar.component';
import { Component, ViewChild, ContentChildren, QueryList } from '@angular/core';

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
            panels, tabs;

        fixture.detectChanges();

        panels = tabbar.panels.toArray();
        tabs = tabbar.tabs.toArray(); 

        expect(tabbar).toBeDefined();
        expect(tabbar instanceof IgxTabBar).toBeTruthy();
        expect(tabbar.panels instanceof QueryList).toBeTruthy();
        expect(tabbar.panels.length).toBe(3);

        for (let i = 0; i < tabbar.panels.length; i++) {
            expect(panels[i] instanceof IgxTabPanel).toBeTruthy();
        }

        expect(tabbar.tabs instanceof QueryList).toBeTruthy();
        expect(tabbar.tabs.length).toBe(3);

        for (let i = 0; i < tabbar.tabs.length; i++) {
            expect(tabs[i] instanceof IgxTab).toBeTruthy();
        }
    });

    it('should initialize default values of properties', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            tabs;

        expect(tabbar.alignment).toBe("top");
        expect(tabbar.selectedIndex).toBe(-1);
        expect(tabbar.selectedTab).toBeUndefined();

        fixture.detectChanges();

        tabs = tabbar.tabs.toArray();
        expect(tabs[0].isDisabled).toBeFalsy();
        expect(tabs[1].isDisabled).toBeFalsy();        
        
        setTimeout(function () {
            expect(tabbar.selectedIndex).toBe(0);
            expect(tabbar.selectedTab).toBe(tabs[0]);
        }, 0);
        
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

        fixture.detectChanges();
        tabs = tabbar.tabs.toArray();
        tab1 = tabs[0];
        tab2 = tabs[1];

        setTimeout(function () {
            expect(tabbar.selectedIndex).toBe(0);
            expect(tabbar.selectedTab).toBe(tab1);
        }, 0);
        
        tab2.select();

        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(1);
        expect(tabbar.selectedTab).toBe(tab2);
        tab1.select();

        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(0);
        expect(tabbar.selectedTab).toBe(tab1);

        // select disabled tab
        tab2.relatedPanel.isDisabled = true;
        tab2.select();

        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(0);
        expect(tabbar.selectedTab).toBe(tab1);

        //tab1.deselect();

        //fixture.detectChanges();
        //// Cannot deselect the only selected tab without provideing other selection, so the last selected tab will remain selected
        //expect(tabbar.selectedIndex).toBe(0);
        //expect(tabbar.selectedTab).toBe(tab1);
    });

    //it('should remove tab', () => {
    //    let fixture = TestBed.createComponent(TabBarTestComponent),
    //        tabbar = fixture.componentInstance.tabbar,
    //        tabs = tabbar.tabPanels,
    //        lastTab;

    //    expect(tabs.length).toBe(3);
    //    // remove tab outside the range
    //    tabbar.remove(5);

    //    fixture.detectChanges();
    //    expect(tabs.length).toBe(3);
    //    lastTab = tabs[tabs.length - 1];
    //    tabbar.remove(lastTab.index);

    //    fixture.detectChanges();
    //    expect(tabs.length).toBe(2);
    //    expect(tabs.indexOf(lastTab)).toBe(-1); // the tab is removed and is not part of the tab array
    //    tabbar.remove(0);

    //    fixture.detectChanges();
    //    expect(tabs.length).toBe(1);
    //    expect(tabs[0].index).toBe(0);
    //});

    it('should calculate height and marginTop on top alignment', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            wrapper = fixture.componentInstance.wrapperDiv,
            panels, panel1, panel2,
            testWrapperHeight = 600;

        wrapper.nativeElement.style.height = testWrapperHeight + "px";
        wrapper.nativeElement.style.position = "relative";
        expect(tabbar.alignment).toBe("top");

        fixture.detectChanges();

        panels = tabbar.panels.toArray();
        panel1 = panels[0];
        panel2 = panels[1];

        expect(tabbar.alignment).toBe("top");
        //expect(panel1.marginTop).toBe(tabbar.tabListHeight + "px");
        //expect(panel2.marginTop).toBe(tabbar.tabListHeight + "px");
        //expect(tab1.height).toBe(testWrapperHeight - tabbar.tabListHeight + "px");
        //expect(tab2.height).toBe(testWrapperHeight - tabbar.tabListHeight + "px");
    });

    it('should calculate height and marginTop on bottom alignment', () => {
        let fixture = TestBed.createComponent(BottomTabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            wrapper = fixture.componentInstance.wrapperDiv,
            panels, panel1, panel2,
            testWrapperHeight = 600;

        wrapper.nativeElement.style.height = testWrapperHeight + "px";
        wrapper.nativeElement.style.position = "relative";
        expect(tabbar.alignment).toBe("top");

        fixture.detectChanges();

        panels = tabbar.panels.toArray();
        panel1 = panels[0];
        panel2 = panels[1];

        expect(tabbar.alignment).toBe("bottom");
        expect(panel1.marginTop).toBe(0);
        expect(panel2.marginTop).toBe(0);
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