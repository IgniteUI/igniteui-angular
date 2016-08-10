// modeled after https://github.com/angular/angular/blob/cee2318110eeea115e5f6fc5bfc814cbaa7d90d8/modules/angular2/test/common/directives/ng_for_spec.ts
import { it, iit, describe, expect, inject, async, beforeEachProviders, fakeAsync, tick } from '@angular/core/testing';
import { TestComponentBuilder, ComponentFixture } from '@angular/compiler/testing';

import {Component, ViewChild} from '@angular/core';
import * as Infragistics from '../../src/main';

// HammerJS simulator from https://github.com/hammerjs/simulator, manual typings TODO
declare var Simulator: any;

export function main() {
    describe('Infragistics Angular2 Tab Bar', function() { 
         it('should initialize ig-tab-bar and ig-tabs',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-tab-bar><ig-tab></ig-tab><ig-tab></ig-tab></ig-tab-bar>';
                return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => {
                    var tabBar = fixture.componentInstance.viewChild,
                        tabs = tabBar.tabs;                 

                    expect(tabBar).toBeDefined();
                    expect(tabBar instanceof Infragistics.TabBar).toBeTruthy();
                    expect(tabs.length).toBe(2);
                    fixture.detectChanges();

                    expect(tabs instanceof Array).toBeTruthy();
                    expect(tabs[0] instanceof Infragistics.Tab).toBeTruthy();
                    expect(tabs[1] instanceof Infragistics.Tab).toBeTruthy();
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

         it('should initialize default values of properties',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
                var template = '<ig-tab-bar><ig-tab></ig-tab><ig-tab></ig-tab></ig-tab-bar>';
                return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => { 
                    var tabBar = fixture.componentInstance.viewChild;
                    expect(tabBar.alignment).toBe("top"); 
                    expect(tabBar.selectedIndex).toBeUndefined();       
                    expect(tabBar.tabs[0].isDisabled).toBeFalsy();
                    expect(tabBar.tabs[1].isDisabled).toBeFalsy();

                    fixture.detectChanges();
                    expect(tabBar.selectedIndex).toBe(0);
                    expect(tabBar.selectedTab).toBe(tabBar.tabs[0]);
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

        it('should initialize set/get properties',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-tab-bar><ig-tab label="Tab 1" icon="icon1"></ig-tab><ig-tab label="Tab 2" icon="icon2"></ig-tab></ig-tab-bar>';
                return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => { 
                    var tabBar = fixture.componentInstance.viewChild,
                        tabs = tabBar.tabs;

                    let checkTabProperties = (tabIndex) => { 
                        expect(tabs[tabIndex].label).toBe("Tab " + (tabIndex + 1));
                        expect(tabs[tabIndex].icon).toBe("icon" + (tabIndex + 1));
                        expect(tabs[tabIndex].icon).toBe("icon" + (tabIndex + 1));
                    }; 

                    fixture.detectChanges();

                    checkTabProperties(0);
                    checkTabProperties(1);                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

        it('should select/deselect tabs',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-tab-bar><ig-tab></ig-tab><ig-tab></ig-tab></ig-tab-bar>';
                return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => { 
                    var tabBar = fixture.componentInstance.viewChild,
                        tabs = tabBar.tabs,
                        tab1 = tabs[0],
                        tab2 = tabs[1];

                    expect(tabBar.selectedIndex).toBeUndefined();  

                    fixture.detectChanges();
                    expect(tabBar.selectedIndex).toBe(0);  
                    expect(tabBar.selectedTab).toBe(tab1);

                    tab2.select();

                    fixture.detectChanges();
                    expect(tabBar.selectedIndex).toBe(1);
                    expect(tabBar.selectedTab).toBe(tab2);

                    tabBar.select(0);

                    fixture.detectChanges();
                    expect(tabBar.selectedIndex).toBe(0);
                    expect(tabBar.selectedTab).toBe(tab1);

                    // selected index is out of the range
                    tabBar.select(3);

                    fixture.detectChanges();
                    expect(tabBar.selectedIndex).toBe(0);
                    expect(tabBar.selectedTab).toBe(tab1);

                    // select disabled tab
                    tab2.isDisabled = true;
                    tabBar.select(1);

                    fixture.detectChanges();
                    expect(tabBar.selectedIndex).toBe(0);
                    expect(tabBar.selectedTab).toBe(tab1);

                    // deselected index is out of the range
                    tabBar.deselect(3);

                    fixture.detectChanges();
                    expect(tabBar.selectedIndex).toBe(0);
                    expect(tabBar.selectedTab).toBe(tab1);

                    tab1.deselect();

                    fixture.detectChanges();
                    expect(tabBar.selectedIndex).toBeFalsy();
                    expect(tabBar.selectedTab).toBeFalsy();
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

        it('should remove tab',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
                var template = '<ig-tab-bar><ig-tab></ig-tab><ig-tab></ig-tab><ig-tab></ig-tab><ig-tab></ig-tab></ig-tab-bar>';
                return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => { 
                    var tabBar = fixture.componentInstance.viewChild, 
                    tabs = tabBar.tabs,
                    lastTab;

                    expect(tabs.length).toBe(4);

                    // remove tab outside the range
                    tabBar.remove(5);

                    fixture.detectChanges();
                    expect(tabs.length).toBe(4);

                    lastTab = tabs[tabs.length - 1];
                    tabBar.remove(lastTab.index);

                    fixture.detectChanges();
                    expect(tabs.length).toBe(3);
                    expect(tabs.indexOf(lastTab)).toBe(-1); // the tab is removed and is not part of the tab array

                    tabBar.remove(0);

                    fixture.detectChanges();
                    expect(tabs.length).toBe(2);
                    expect(tabs[0].index).toBe(0);
                    expect(tabs[1].index).toBe(1);

                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

        it('should calculate height and marginTop on top alignment',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
                var template = '<div #wrapperDiv><ig-tab-bar><ig-tab label="Tab 1">Content of Tab 1</ig-tab><ig-tab label="Tab 2">Content of Tab 2</ig-tab></ig-tab-bar></div>';
                return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => { 
                    var tabBar = fixture.componentInstance.viewChild,
                        tab1 = tabBar.tabs[0],
                        tab2 = tabBar.tabs[1],
                        testWrapperHeight = 600;

                    fixture.componentInstance.wrapperDiv.nativeElement.style.height = testWrapperHeight + "px";
                    fixture.componentInstance.wrapperDiv.nativeElement.style.position = "relative";

                    expect(tabBar.alignment).toBe("top");
                    expect(tab1.marginTop).toBeFalsy();
                    expect(tab2.marginTop).toBeFalsy();
                    expect(tab1.height).toBeFalsy();
                    expect(tab2.height).toBeFalsy();

                    fixture.detectChanges();
                    expect(tabBar.alignment).toBe("top");
                    expect(tab1.marginTop).toBe(tabBar.tabListHeight + "px");
                    expect(tab2.marginTop).toBe(tabBar.tabListHeight + "px");
                    expect(tab1.height).toBe(testWrapperHeight - tabBar.tabListHeight + "px");
                    expect(tab2.height).toBe(testWrapperHeight - tabBar.tabListHeight + "px");

                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

        it('should calculate height and marginTop on bottom alignment',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
                var template = '<div #wrapperDiv><ig-tab-bar alignment="bottom"><ig-tab label="Tab 1">Content of Tab 1</ig-tab><ig-tab label="Tab 2">Content of Tab 2</ig-tab></ig-tab-bar></div>';
                return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => { 
                    var tabBar = fixture.componentInstance.viewChild,
                        tab1 = tabBar.tabs[0],
                        tab2 = tabBar.tabs[1],
                        testWrapperHeight = 600;

                    fixture.componentInstance.wrapperDiv.nativeElement.style.height = testWrapperHeight + "px";
                    fixture.componentInstance.wrapperDiv.nativeElement.style.position = "relative";

                    expect(tabBar.alignment).toBe("top");
                    expect(tab1.marginTop).toBeFalsy();
                    expect(tab2.marginTop).toBeFalsy();
                    expect(tab1.height).toBeFalsy();
                    expect(tab2.height).toBeFalsy();

                    fixture.detectChanges();
                    expect(tabBar.alignment).toBe("bottom");
                    expect(tab1.marginTop).toBe("0px");
                    expect(tab2.marginTop).toBe("0px");
                    expect(tab1.height).toBe(testWrapperHeight - tabBar.tabListHeight + "px");
                    expect(tab2.height).toBe(testWrapperHeight - tabBar.tabListHeight + "px");
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));
         // end of tests
    });
}

@Component({
    selector: 'test-cmp',
    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
    directives: [
        Infragistics.TabBar,
        Infragistics.Tab
    ]
})
class TabBarTestComponent {
     @ViewChild(Infragistics.TabBar) public viewChild: Infragistics.TabBar;
     @ViewChild("wrapperDiv") public wrapperDiv: HTMLElement;
}

@Component({
    selector: 'test-cmp', 
    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
    directives: [Infragistics.Tab]
})
class TabTestComponent {
     @ViewChild(Infragistics.TabBar) public viewChild: Infragistics.Tab;
}

//class TestComponentPin extends TestComponentDI {
     //pin: boolean = true;
     //enableGestures: string = "";
//}