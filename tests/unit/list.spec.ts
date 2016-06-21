// modeled after https://github.com/angular/angular/blob/cee2318110eeea115e5f6fc5bfc814cbaa7d90d8/modules/angular2/test/common/directives/ng_for_spec.ts
import { it, iit, describe, expect, inject, async, beforeEachProviders, fakeAsync, tick } from '@angular/core/testing';
import { TestComponentBuilder, ComponentFixture } from '@angular/compiler/testing';

import {Component, ViewChild} from '@angular/core';
import * as Infragistics from '../../src/main';

// HammerJS simulator from https://github.com/hammerjs/simulator, manual typings TODO
declare var Simulator: any;

export function main() {
    describe('Infragistics Angular2 List', function() {
         /*it('should initialize without DI service',
         async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           var template = '<ig-tab-bar></ig-tab-bar>';
           return tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture ) => {
                 expect(fixture.debugElement.children[0].componentInstance).toBeAnInstanceOf(Infragistics.TabBar);
                 expect(fixture.debugElement.children[0].componentInstance.state).toBeNull();
               });
         })));*/


         /*it('should initialize with DI service',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    //http://stackoverflow.com/a/36444489
                    expect(fixture.componentInstance.viewChild).toBeUndefined();
                    fixture.detectChanges();
                    
                    expect(fixture.componentInstance.viewChild).toBeDefined();
                    expect(fixture.componentInstance.viewChild).toBeAnInstanceOf(Infragistics.NavigationDrawer);
                    expect(fixture.componentInstance.viewChild.state).toBeAnInstanceOf(Infragistics.NavigationService);
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));*/

         it('should initialize with DI service',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-list></ig-list>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    expect(fixture.componentInstance.viewChild).toBeUndefined();
                    fixture.detectChanges();
                    
                    expect(fixture.componentInstance.viewChild).toBeDefined();
                    expect(fixture.componentInstance.viewChild).toBeAnInstanceOf(Infragistics.List);
                    //expect(fixture.componentInstance.viewChild.state).toBeAnInstanceOf(Infragistics.NavigationService);
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
    directives: [Infragistics.List]
})
class TestComponent {
     @ViewChild(Infragistics.List) public viewChild: Infragistics.List;
}

@Component({
    selector: 'test-cmp', 
    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
    //providers: [Infragistics.NavigationService],
    directives: [Infragistics.List]
})
class TestComponentDI {
     //drawerMiniWidth: number;
     //drawerWidth: number;
     @ViewChild(Infragistics.List) public viewChild: Infragistics.List;
}

class TestComponentPin extends TestComponentDI {
     //pin: boolean = true;
     //enableGestures: string = "";
}

// import {ElementRef, Optional, Inject, Renderer} from 'angular2/core';
// import { HammerGesturesManager } from '../../src/core/touch';
// class TestDrawer extends Infragistics.NavigationDrawer {
//     constructor(
//         @Inject(ElementRef) elementRef: ElementRef,
//         @Optional() state: Infragistics.NavigationService,
//         protected renderer:Renderer,
//         touchManager: HammerGesturesManager) 
//     {
//         super(elementRef, state, null, renderer, touchManager);
//     }
//     public getExpectedWidth (mini?: boolean) : number {
//         return super.getExpectedWidth(mini);
//     };
// }