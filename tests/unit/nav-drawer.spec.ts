// modeled after https://github.com/angular/angular/blob/cee2318110eeea115e5f6fc5bfc814cbaa7d90d8/modules/angular2/test/common/directives/ng_for_spec.ts
import { it, iit, describe, expect, inject, injectAsync, beforeEachProviders, fakeAsync, tick, TestComponentBuilder, ComponentFixture} from 'angular2/testing';
import {Component, ViewChild} from 'angular2/core';
import * as Infragistics from '../../src/main';

export function main() {
    describe('Infragistics Angular2 Navigation Drawer', function() {
        it('should initialize without DI service',
         injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           var template = '<ig-nav-drawer></ig-nav-drawer>';
           return tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture: ComponentFixture) => {
                 expect(fixture.debugElement.children[0].componentInstance).toBeAnInstanceOf(Infragistics.NavigationDrawer);
               });
         }));
         
         it('should initialize with DI service',
           injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture: ComponentFixture) => {
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
         }));
    });
}

@Component({
    selector: 'test-cmp',
    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
    directives: [Infragistics.NavigationDrawer]
})
class TestComponent {
     @ViewChild(Infragistics.NavigationDrawer) public viewChild: Infragistics.NavigationDrawer;
}

@Component({
    selector: 'test-cmp', 
    template: '<div></div>', //"Component 'TestComponent' must have either 'template' or 'templateUrl' set."
    providers: [Infragistics.NavigationService],
    directives: [Infragistics.NavigationDrawer]
})
class TestComponentDI {
     @ViewChild(Infragistics.NavigationDrawer) public viewChild: Infragistics.NavigationDrawer;
}