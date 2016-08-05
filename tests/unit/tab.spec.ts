// modeled after https://github.com/angular/angular/blob/cee2318110eeea115e5f6fc5bfc814cbaa7d90d8/modules/angular2/test/common/directives/ng_for_spec.ts
import { it, iit, describe, expect, inject, async, beforeEachProviders, fakeAsync, tick } from '@angular/core/testing';
import { TestComponentBuilder, ComponentFixture } from '@angular/compiler/testing';

import {Component, ViewChild} from '@angular/core';
import * as Infragistics from '../../src/main';

// HammerJS simulator from https://github.com/hammerjs/simulator, manual typings TODO
declare var Simulator: any;

export function main() {
    describe('Infragistics Angular2 Tab Bar', function() {
         it('should initialize ig-tab',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-tab-bar></ig-tab-bar>';
                return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => {                  

                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

         it('should initialize ig-tab',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-tab-bar><ig-tab label="Tab 1">Content of Tab 1</ig-tab><ig-tab label="Tab 2">Content of Tab 2</ig-tab></ig-tab-bar>';
                return tcb.overrideTemplate(TabBarTestComponent, template)
                .createAsync(TabBarTestComponent)
                .then((fixture) => {           
                
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));
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