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
                 expect(fixture.debugElement.children[0].componentInstance.state).toBeNull();
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
         
        it('should properly initialize all elements and properties',
           injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture: ComponentFixture) => {
                    fixture.detectChanges();
                    
                    expect(fixture.componentInstance.viewChild.drawer).toHaveCssClass("ig-nav-drawer");
                    expect(fixture.componentInstance.viewChild.overlay).toHaveCssClass("ig-nav-drawer-overlay");
                    expect(fixture.componentInstance.viewChild.styleDummy).toHaveCssClass("style-dummy");
                    expect(fixture.componentInstance.viewChild.animateWidth).toBeFalsy();
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         }));
                  
        it('should open and close with API calls',
           injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture: ComponentFixture) => {
                    fixture.detectChanges();
                    let drawer: Infragistics.NavigationDrawer = fixture.componentInstance.viewChild;
                    expect(drawer.isOpen).toBeFalsy();
                    
                    drawer.open();
                    expect(drawer.isOpen).toBeTruthy();
                    drawer.open(); // should do nothing
                    expect(drawer.isOpen).toBeTruthy();
                    
                    drawer.close();
                    expect(drawer.isOpen).toBeFalsy();
                    drawer.close(); // should do nothing
                    expect(drawer.isOpen).toBeFalsy();
                    
                    drawer.toggle();
                    expect(drawer.isOpen).toBeTruthy();
                    drawer.toggle();
                    expect(drawer.isOpen).toBeFalsy();
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         }));
         
        it('should async API calls should resolve Promise and emit events',
           injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture: ComponentFixture) => {
                    fixture.detectChanges();
                    let drawer: Infragistics.NavigationDrawer = fixture.componentInstance.viewChild;
                    
                    spyOn(drawer.closing, "emit");
                    spyOn(drawer.closed, "emit");
                    spyOn(drawer.opening, "emit");
                    spyOn(drawer.opened, "emit");
                                        
                    drawer.open(true).then(() => {
                        expect(drawer.opened.emit).toHaveBeenCalledWith('opened');
                    }, (error) => {
                        return Promise.reject(error);
                    });
                    expect(drawer.opening.emit).toHaveBeenCalledWith('opening');
                    
                    drawer.toggle(true).then(() => {
                        expect(drawer.closed.emit).toHaveBeenCalledWith('closed');
                    });
                    expect(drawer.closing.emit).toHaveBeenCalledWith('closing');
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         }));
         
        it('should properly initialize with min temaplte',
            injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
                var template = '<ig-nav-drawer><ig-drawer-content></ig-drawer-content><ig-drawer-mini-content></ig-drawer-mini-content></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture: ComponentFixture) => {
                    fixture.detectChanges();
                    
                    expect(fixture.componentInstance.viewChild.animateWidth).toBeTruthy();
                    expect(fixture.debugElement.query((x) => { return x.nativeNode.nodeName === "ASIDE";}).nativeElement).toHaveCssClass("mini");
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
        }));
         
         
        it('should update edge zone with mini width',
           injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer [miniWidth]="drawerMiniWidth" ><ig-drawer-content></ig-drawer-content><ig-drawer-mini-content></ig-drawer-mini-content></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture: ComponentFixture) => {
                    fixture.detectChanges();
                    let drawer: Infragistics.NavigationDrawer = fixture.componentInstance.viewChild;
                    
                    fixture.componentInstance.drawerMiniWidth = 60;
                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild.maxEdgeZone).toBe(66);
                    
                    fixture.componentInstance.drawerMiniWidth = 80;
                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild.maxEdgeZone).toBe(fixture.componentInstance.drawerMiniWidth * 1.1);
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         }));
         
        it('should update width from css or property',
           injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer [miniWidth]="drawerMiniWidth" [width]="drawerWidth"><ig-drawer-content></ig-drawer-content><ig-drawer-mini-content></ig-drawer-mini-content></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                //.overrideDirective(TestComponentDI, Infragistics.NavigationDrawer, TestDrawer)
                .createAsync(TestComponentDI)
                .then((fixture: ComponentFixture) => {
                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild.getExpectedWidth()).toBe(300);
                    expect(fixture.componentInstance.viewChild.getExpectedWidth(true)).toBe(60);
                    
                    fixture.componentInstance.drawerMiniWidth = 80;
                    fixture.componentInstance.drawerWidth = 250;
                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild.getExpectedWidth()).toBe(250);
                    expect(fixture.componentInstance.viewChild.getExpectedWidth(true)).toBe(80);
                    
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
     drawerMiniWidth: number;
     drawerWidth: number;
     @ViewChild(Infragistics.NavigationDrawer) public viewChild: Infragistics.NavigationDrawer;
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