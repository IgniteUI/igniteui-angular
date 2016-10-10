import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TabBar, Tab, TabBarModule } from './tab';
import { Component, ViewChild, ContentChildren } from '@angular/core';

describe("List", function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TabBarModule],
            declarations: [TabBarTestComponent]
        })
            .compileComponents();
    }));

    it('should initialize ig-tab-bar and ig-tabs', () => {
        let fixture = TestBed.createComponent(TabBarTestComponent),
            tabbar = fixture.componentInstance.tabbar;

        fixture.detectChanges();
        expect(tabbar).toBeDefined();
        expect(tabbar instanceof TabBar).toBeTruthy();
        expect(tabbar.tabs instanceof Array).toBeTruthy();
        expect(tabbar.tabs.length).toBe(3);

        for (let i = 0; i < tabbar.tabs.length; i++) {
            expect(tabbar.tabs[i] instanceof Tab).toBeTruthy();
        }
    });

});

//         it('should initialize default values of properties',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//                var template = '<ig-tab-bar><ig-tab></ig-tab><ig-tab></ig-tab></ig-tab-bar>';
//                return tcb.overrideTemplate(TabBarTestComponent, template)
//                .createAsync(TabBarTestComponent)
//                .then((fixture) => {
//                    var tabBar = fixture.componentInstance.viewChild;
//                    expect(tabBar.alignment).toBe("top");
//                    expect(tabBar.selectedIndex).toBeUndefined();
//                    expect(tabBar.tabs[0].isDisabled).toBeFalsy();
//                    expect(tabBar.tabs[1].isDisabled).toBeFalsy();
//                    fixture.detectChanges();
//                    expect(tabBar.selectedIndex).toBe(0);
//                    expect(tabBar.selectedTab).toBe(tabBar.tabs[0]);
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));
//        it('should initialize set/get properties',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//              var template = '<ig-tab-bar><ig-tab label="Tab 1" icon="icon1"></ig-tab><ig-tab label="Tab 2" icon="icon2"></ig-tab></ig-tab-bar>';
//                return tcb.overrideTemplate(TabBarTestComponent, template)
//                .createAsync(TabBarTestComponent)
//                .then((fixture) => {
//                    var tabBar = fixture.componentInstance.viewChild,
//                        tabs = tabBar.tabs;
//                    let checkTabProperties = (tabIndex) => {
//                        expect(tabs[tabIndex].label).toBe("Tab " + (tabIndex + 1));
//                        expect(tabs[tabIndex].icon).toBe("icon" + (tabIndex + 1));
//                        expect(tabs[tabIndex].icon).toBe("icon" + (tabIndex + 1));
//                    };
//                    fixture.detectChanges();
//                    checkTabProperties(0);
//                    checkTabProperties(1);
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));
//        it('should select/deselect tabs',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//              var template = '<ig-tab-bar><ig-tab></ig-tab><ig-tab></ig-tab></ig-tab-bar>';
//                return tcb.overrideTemplate(TabBarTestComponent, template)
//                .createAsync(TabBarTestComponent)
//                .then((fixture) => {
//                    var tabBar = fixture.componentInstance.viewChild,
//                        tabs = tabBar.tabs,
//                        tab1 = tabs[0],
//                        tab2 = tabs[1];
//                    expect(tabBar.selectedIndex).toBeUndefined();
//                    fixture.detectChanges();
//                    expect(tabBar.selectedIndex).toBe(0);
//                    expect(tabBar.selectedTab).toBe(tab1);
//                    tab2.select();
//                    fixture.detectChanges();
//                    expect(tabBar.selectedIndex).toBe(1);
//                    expect(tabBar.selectedTab).toBe(tab2);
//                    tabBar.select(0);
//                    fixture.detectChanges();
//                    expect(tabBar.selectedIndex).toBe(0);
//                    expect(tabBar.selectedTab).toBe(tab1);
//                    // selected index is out of the range
//                    tabBar.select(3);
//                    fixture.detectChanges();
//                    expect(tabBar.selectedIndex).toBe(0);
//                    expect(tabBar.selectedTab).toBe(tab1);
//                    // select disabled tab
//                    tab2.isDisabled = true;
//                    tabBar.select(1);
//                    fixture.detectChanges();
//                    expect(tabBar.selectedIndex).toBe(0);
//                    expect(tabBar.selectedTab).toBe(tab1);
//                    // deselected index is out of the range
//                    tabBar.deselect(3);
//                    fixture.detectChanges();
//                    expect(tabBar.selectedIndex).toBe(0);
//                    expect(tabBar.selectedTab).toBe(tab1);
//                    tab1.deselect();
//                    fixture.detectChanges();
//                    expect(tabBar.selectedIndex).toBeFalsy();
//                    expect(tabBar.selectedTab).toBeFalsy();

//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));
//        it('should remove tab',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//                var template = '<ig-tab-bar><ig-tab></ig-tab><ig-tab></ig-tab><ig-tab></ig-tab><ig-tab></ig-tab></ig-tab-bar>';
//                return tcb.overrideTemplate(TabBarTestComponent, template)
//                .createAsync(TabBarTestComponent)
//                .then((fixture) => {
//                    var tabBar = fixture.componentInstance.viewChild,
//                    tabs = tabBar.tabs,
//                    lastTab;
//                    expect(tabs.length).toBe(4);
//                    // remove tab outside the range
//                    tabBar.remove(5);
//                    fixture.detectChanges();
//                    expect(tabs.length).toBe(4);
//                    lastTab = tabs[tabs.length - 1];
//                    tabBar.remove(lastTab.index);
//                    fixture.detectChanges();
//                    expect(tabs.length).toBe(3);
//                    expect(tabs.indexOf(lastTab)).toBe(-1); // the tab is removed and is not part of the tab array
//                    tabBar.remove(0);
//                    fixture.detectChanges();
//                    expect(tabs.length).toBe(2);
//                    expect(tabs[0].index).toBe(0);
//                    expect(tabs[1].index).toBe(1);
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));
//        it('should calculate height and marginTop on top alignment',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//                var template = '<div #wrapperDiv><ig-tab-bar><ig-tab label="Tab 1">Content of Tab 1</ig-tab><ig-tab label="Tab 2">Content of Tab 2</ig-tab></ig-tab-bar></div>';
//                return tcb.overrideTemplate(TabBarTestComponent, template)
//                .createAsync(TabBarTestComponent)
//                .then((fixture) => {
//                    var tabBar = fixture.componentInstance.viewChild,
//                        tab1 = tabBar.tabs[0],
//                        tab2 = tabBar.tabs[1],
//                        testWrapperHeight = 600;
//                    fixture.componentInstance.wrapperDiv.nativeElement.style.height = testWrapperHeight + "px";
//                    fixture.componentInstance.wrapperDiv.nativeElement.style.position = "relative";
//                    expect(tabBar.alignment).toBe("top");
//                    expect(tab1.marginTop).toBeFalsy();
//                    expect(tab2.marginTop).toBeFalsy();
//                    expect(tab1.height).toBeFalsy();
//                    expect(tab2.height).toBeFalsy();
//                    fixture.detectChanges();
//                    expect(tabBar.alignment).toBe("top");
//                    expect(tab1.marginTop).toBe(tabBar.tabListHeight + "px");
//                    expect(tab2.marginTop).toBe(tabBar.tabListHeight + "px");
//                    expect(tab1.height).toBe(testWrapperHeight - tabBar.tabListHeight + "px");
//                    expect(tab2.height).toBe(testWrapperHeight - tabBar.tabListHeight + "px");
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));
//        it('should calculate height and marginTop on bottom alignment',
//           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
//                var template = '<div #wrapperDiv><ig-tab-bar alignment="bottom"><ig-tab label="Tab 1">Content of Tab 1</ig-tab><ig-tab label="Tab 2">Content of Tab 2</ig-tab></ig-tab-bar></div>';
//                return tcb.overrideTemplate(TabBarTestComponent, template)
//                .createAsync(TabBarTestComponent)
//                .then((fixture) => {
//                    var tabBar = fixture.componentInstance.viewChild,
//                        tab1 = tabBar.tabs[0],
//                        tab2 = tabBar.tabs[1],
//                        testWrapperHeight = 600;
//                    fixture.componentInstance.wrapperDiv.nativeElement.style.height = testWrapperHeight + "px";
//                    fixture.componentInstance.wrapperDiv.nativeElement.style.position = "relative";
//                    expect(tabBar.alignment).toBe("top");
//                    expect(tab1.marginTop).toBeFalsy();
//                    expect(tab2.marginTop).toBeFalsy();
//                    expect(tab1.height).toBeFalsy();
//                    expect(tab2.height).toBeFalsy();
//                    fixture.detectChanges();
//                    expect(tabBar.alignment).toBe("bottom");
//                    expect(tab1.marginTop).toBe("0px");
//                    expect(tab2.marginTop).toBe("0px");
//                    expect(tab1.height).toBe(testWrapperHeight - tabBar.tabListHeight + "px");
//                    expect(tab2.height).toBe(testWrapperHeight - tabBar.tabListHeight + "px");
//                }).catch (reason => {
//                    console.log(reason);
//                    return Promise.reject(reason);
//                });
//         })));
//         // end of tests
//    });
@Component({
    template: `<ig-tab-bar alignment="bottom">
                <ig-tab label="Tab 1" icon="library_music">
                    <h1>Tab 1 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </ig-tab>
                <ig-tab label="Tab 2" icon="video_library">
                    <h1>Tab 2 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </ig-tab>
                <ig-tab label="Tab 3" icon="library_books">
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
                </ig-tab>
            </ig-tab-bar>`
})
class TabBarTestComponent {
    @ViewChild(TabBar) tabbar: TabBar;    
}