// modeled after https://github.com/angular/angular/blob/cee2318110eeea115e5f6fc5bfc814cbaa7d90d8/modules/angular2/test/common/directives/ng_for_spec.ts
import { it, iit, describe, expect, inject, injectAsync, beforeEachProviders, fakeAsync, tick, TestComponentBuilder} from 'angular2/testing';
import {Component, ViewChild} from 'angular2/core';
import * as Infragistics from '../../src/main';

export function main() {
    describe('Infragistics Angular2 Navigation Drawer', function() {
        it('should initialize without DI service',
         inject([TestComponentBuilder], (tcb: TestComponentBuilder, async) => {
           var template = '<div><ig-nav-drawer></ig-nav-drawer></div>';
           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 expect(fixture.debugElement.componentInstance.viewChild).toBeAnInstanceOf(Infragistics.NavigationDrawer);
                 async.done();
               });
         }));
         
         it('should initialize with DI service',
           inject([TestComponentBuilder], (tcb: TestComponentBuilder, async) => {
            var template = '<div><ig-nav-drawer></ig-nav-drawer></div>';
            tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    expect(fixture.debugElement.componentInstance.viewChild).toBeAnInstanceOf(Infragistics.NavigationDrawer);
                    expect(fixture.debugElement.componentInstance.viewChild.state).toBeAnInstanceOf(Infragistics.NavigationService);
                    async.done();
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