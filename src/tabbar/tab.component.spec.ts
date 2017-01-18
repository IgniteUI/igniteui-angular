import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTabBar, IgxTabPanel, IgxTabBarModule } from './tab.component';
import { Component, ViewChild, ContentChildren } from '@angular/core';

describe("List", function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [IgxTabBarModule],
            declarations: [TabBarTestComponent, BottomTabBarTestComponent]
        })
            .compileComponents();
    }));

    it('should initialize igx-tab-bar and igx-tabs', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar;

        expect(tabbar).toBeDefined();
        expect(tabbar instanceof IgxTabBar).toBeTruthy();
        expect(tabbar.tabbarContainers instanceof Array).toBeTruthy();
        expect(tabbar.tabbarContainers.length).toBe(3);

        for (let i = 0; i < tabbar.tabbarContainers.length; i++) {
            expect(tabbar.tabbarContainers[i] instanceof IgxTabPanel).toBeTruthy();
        }
    });

    it('should initialize default values of properties', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar;

        expect(tabbar.alignment).toBe("top");
        expect(tabbar.selectedIndex).toBeUndefined();
        expect(tabbar.tabbarContainers[0].isDisabled).toBeFalsy();
        expect(tabbar.tabbarContainers[1].isDisabled).toBeFalsy();
        fixture.detectChanges();
        expect(tabbar.selectedIndex).toBe(0);
        expect(tabbar.selectedTab).toBe(tabbar.tabbarContainers[0]);
    });

    it('should initialize set/get properties', () => {
        let checkTabProperties,
            fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            tabs = tabbar.tabbarContainers;

        fixture.detectChanges();
        checkTabProperties = (tabIndex) => {
            expect(tabs[tabIndex].label).toBe("Tab " + (tabIndex + 1));
            //expect(tabs[tabIndex].icon).toBe("icon" + (tabIndex + 1));
            //expect(tabs[tabIndex].icon).toBe("icon" + (tabIndex + 1));
        };

        checkTabProperties(0);
        checkTabProperties(1);
    });

    it('should select/deselect tabs', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar,
            tabs = tabbar.tabbarContainers,
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
            tabs = tabbar.tabbarContainers,
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
            tab1 = tabbar.tabbarContainers[0],
            tab2 = tabbar.tabbarContainers[1],
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
            tab1 = tabbar.tabbarContainers[0],
            tab2 = tabbar.tabbarContainers[1],
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
                <igx-tab label="Tab 1" icon="library_music">
                    <h1>Tab 1 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tab>
                <igx-tab label="Tab 2" icon="video_library">
                    <h1>Tab 2 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tab>
                <igx-tab label="Tab 3" icon="library_books">
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
                </igx-tab>
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
                <igx-tab label="Tab 1" icon="library_music">
                    <h1>Tab 1 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tab>
                <igx-tab label="Tab 2" icon="video_library">
                    <h1>Tab 2 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tab>
                <igx-tab label="Tab 3" icon="library_books">
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
                </igx-tab>
            </igx-tab-bar>
        </div>`
})
class BottomTabBarTestComponent {
    @ViewChild(IgxTabBar) tabbar: IgxTabBar;
    @ViewChild("wrapperDiv") wrapperDiv: any;
}