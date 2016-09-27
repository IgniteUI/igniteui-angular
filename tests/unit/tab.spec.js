// modeled after https://github.com/angular/angular/blob/cee2318110eeea115e5f6fc5bfc814cbaa7d90d8/modules/angular2/test/common/directives/ng_for_spec.ts
/// <reference path="../../typings/globals/jasmine/index.d.ts" />
/// <reference path="../../typings/globals/es6-shim/index.d.ts" />
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const testing_1 = require('@angular/core/testing');
const testing_2 = require('@angular/core/testing');
const core_1 = require('@angular/core');
const Infragistics = require('../../src/main');
function main() {
    describe('Infragistics Angular2 Tab Bar', function () {
        it('should initialize ig-tab-bar and ig-tabs', testing_1.async(testing_1.inject([testing_2.TestComponentBuilder], (tcb) => {
            var template = '<ig-tab-bar><ig-tab></ig-tab><ig-tab></ig-tab></ig-tab-bar>';
            return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => {
                var tabBar = fixture.componentInstance.viewChild, tabs = tabBar.tabs;
                expect(tabBar).toBeDefined();
                expect(tabBar instanceof Infragistics.TabBar).toBeTruthy();
                expect(tabs.length).toBe(2);
                fixture.detectChanges();
                expect(tabs instanceof Array).toBeTruthy();
                expect(tabs[0] instanceof Infragistics.Tab).toBeTruthy();
                expect(tabs[1] instanceof Infragistics.Tab).toBeTruthy();
            }).catch(reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
        })));
        it('should initialize default values of properties', testing_1.async(testing_1.inject([testing_2.TestComponentBuilder], (tcb) => {
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
            }).catch(reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
        })));
        it('should initialize set/get properties', testing_1.async(testing_1.inject([testing_2.TestComponentBuilder], (tcb) => {
            var template = '<ig-tab-bar><ig-tab label="Tab 1" icon="icon1"></ig-tab><ig-tab label="Tab 2" icon="icon2"></ig-tab></ig-tab-bar>';
            return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => {
                var tabBar = fixture.componentInstance.viewChild, tabs = tabBar.tabs;
                let checkTabProperties = (tabIndex) => {
                    expect(tabs[tabIndex].label).toBe("Tab " + (tabIndex + 1));
                    expect(tabs[tabIndex].icon).toBe("icon" + (tabIndex + 1));
                    expect(tabs[tabIndex].icon).toBe("icon" + (tabIndex + 1));
                };
                fixture.detectChanges();
                checkTabProperties(0);
                checkTabProperties(1);
            }).catch(reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
        })));
        it('should select/deselect tabs', testing_1.async(testing_1.inject([testing_2.TestComponentBuilder], (tcb) => {
            var template = '<ig-tab-bar><ig-tab></ig-tab><ig-tab></ig-tab></ig-tab-bar>';
            return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => {
                var tabBar = fixture.componentInstance.viewChild, tabs = tabBar.tabs, tab1 = tabs[0], tab2 = tabs[1];
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
            }).catch(reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
        })));
        it('should remove tab', testing_1.async(testing_1.inject([testing_2.TestComponentBuilder], (tcb) => {
            var template = '<ig-tab-bar><ig-tab></ig-tab><ig-tab></ig-tab><ig-tab></ig-tab><ig-tab></ig-tab></ig-tab-bar>';
            return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => {
                var tabBar = fixture.componentInstance.viewChild, tabs = tabBar.tabs, lastTab;
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
            }).catch(reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
        })));
        it('should calculate height and marginTop on top alignment', testing_1.async(testing_1.inject([testing_2.TestComponentBuilder], (tcb) => {
            var template = '<div #wrapperDiv><ig-tab-bar><ig-tab label="Tab 1">Content of Tab 1</ig-tab><ig-tab label="Tab 2">Content of Tab 2</ig-tab></ig-tab-bar></div>';
            return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => {
                var tabBar = fixture.componentInstance.viewChild, tab1 = tabBar.tabs[0], tab2 = tabBar.tabs[1], testWrapperHeight = 600;
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
            }).catch(reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
        })));
        it('should calculate height and marginTop on bottom alignment', testing_1.async(testing_1.inject([testing_2.TestComponentBuilder], (tcb) => {
            var template = '<div #wrapperDiv><ig-tab-bar alignment="bottom"><ig-tab label="Tab 1">Content of Tab 1</ig-tab><ig-tab label="Tab 2">Content of Tab 2</ig-tab></ig-tab-bar></div>';
            return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => {
                var tabBar = fixture.componentInstance.viewChild, tab1 = tabBar.tabs[0], tab2 = tabBar.tabs[1], testWrapperHeight = 600;
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
            }).catch(reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
        })));
        // end of tests
    });
}
exports.main = main;
let TabBarTestComponent = class TabBarTestComponent {
};
__decorate([
    core_1.ViewChild(Infragistics.TabBar), 
    __metadata('design:type', Infragistics.TabBar)
], TabBarTestComponent.prototype, "viewChild", void 0);
__decorate([
    core_1.ViewChild("wrapperDiv"), 
    __metadata('design:type', Object)
], TabBarTestComponent.prototype, "wrapperDiv", void 0);
TabBarTestComponent = __decorate([
    core_1.Component({
        selector: 'test-cmp',
        template: '<div></div>',
        directives: [
            Infragistics.TabBar,
            Infragistics.Tab
        ]
    }), 
    __metadata('design:paramtypes', [])
], TabBarTestComponent);
let TabTestComponent = class TabTestComponent {
};
__decorate([
    core_1.ViewChild(Infragistics.TabBar), 
    __metadata('design:type', Infragistics.Tab)
], TabTestComponent.prototype, "viewChild", void 0);
TabTestComponent = __decorate([
    core_1.Component({
        selector: 'test-cmp',
        template: '<div></div>',
        directives: [Infragistics.Tab]
    }), 
    __metadata('design:paramtypes', [])
], TabTestComponent);
//class TestComponentPin extends TestComponentDI {
//pin: boolean = true;
//enableGestures: string = "";
//} 

//# sourceMappingURL=tab.spec.js.map
