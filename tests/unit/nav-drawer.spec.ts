// modeled after https://github.com/angular/angular/blob/cee2318110eeea115e5f6fc5bfc814cbaa7d90d8/modules/angular2/test/common/directives/ng_for_spec.ts
//import { expect } from "@angular/platform-browser/testing";
/// <reference path="../../typings/globals/jasmine/index.d.ts" />
import { it, iit, describe, inject, async, beforeEachProviders, fakeAsync, tick, TestComponentBuilder, ComponentFixture } from '@angular/core/testing';

//import { TestComponentBuilder, ComponentFixture } from '@angular/compiler/testing';

import {Component, ViewChild} from '@angular/core';
import * as Infragistics from '../../src/main';

// HammerJS simulator from https://github.com/hammerjs/simulator, manual typings TODO
declare var Simulator: any;

export function main() {
    describe('Infragistics Angular2 Navigation Drawer', function() {
        it('should initialize without DI service',
         async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           var template = '<ig-nav-drawer></ig-nav-drawer>';
           return tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture ) => {
                 //expect(fixture.debugElement.children[0].componentInstance).toBeAnInstanceOf(Infragistics.NavigationDrawer);
                 expect(fixture.debugElement.children[0].componentInstance.state).toBeNull();
               });
         })));
         
         it('should initialize with DI service',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    //http://stackoverflow.com/a/36444489
                    //expect(fixture.componentInstance.viewChild).toBeUndefined();
                    fixture.detectChanges();
                    
                    expect(fixture.componentInstance.viewChild).toBeDefined();
                    //expect(fixture.componentInstance.viewChild).toBeAnInstanceOf(Infragistics.NavigationDrawer);
                    //expect(fixture.componentInstance.viewChild.state).toBeAnInstanceOf(Infragistics.NavigationService);
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));
         
        it('should properly initialize all elements and properties',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    fixture.detectChanges();
                    
                    //expect(fixture.componentInstance.viewChild.drawer).toHaveCssClass("ig-nav-drawer");
                    //expect(fixture.componentInstance.viewChild.overlay).toHaveCssClass("ig-nav-drawer-overlay");
                    //expect(fixture.componentInstance.viewChild.styleDummy).toHaveCssClass("style-dummy");
                    expect(fixture.componentInstance.viewChild.animateWidth).toBeFalsy();
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));
         
        it('should attach events and register to nav service and detach on destroy',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer id="testNav" ></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    fixture.detectChanges();
                    var state:Infragistics.NavigationService = fixture.componentInstance.viewChild.state,
                        touchManager = fixture.componentInstance.viewChild.touchManager;

                    expect(state.get("testNav")).toBeDefined();
                    //expect(touchManager.getManagerForElement(document)).toBeAnInstanceOf(Hammer.Manager);
                    
                    fixture.destroy();
                    expect(state.get("testNav")).toBeUndefined();
                    expect(touchManager.getManagerForElement(document)).toBe(null);
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));
                  
        it('should open and close with API calls',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
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
        })));
         
        it('async API calls should resolve Promise and emit events',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>',
                   fixture: ComponentFixture<any>,
                   resolver, drawer,
                   result = new Promise<any>( resolve => {
                        resolver = (value?: any) => {
                            resolve(value);
                        };
                    } );
                tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then(function (compFixture) {
                    fixture = compFixture;
                    fixture.detectChanges();
                    drawer = fixture.componentInstance.viewChild;
                    
                    spyOn(drawer.closing, "emit");
                    spyOn(drawer.closed, "emit");
                    spyOn(drawer.opening, "emit");
                    spyOn(drawer.opened, "emit");
                    
                    var re = drawer.open(true);
                    fixture.detectChanges();
                    fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event('transitionend'));
                    return re;
                })
                .then(function (value) {
                    expect(value).toBe('opened');
                    expect(drawer.opening.emit).toHaveBeenCalledWith('opening');
                    expect(drawer.opened.emit).toHaveBeenCalledWith('opened');
                    
                    var re = drawer.toggle(true);
                    fixture.detectChanges();
                    fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event('transitionend'));
                    return re;
                })
                .then(function (value) {
                     expect(value).toBe('closed');
                    expect(drawer.closing.emit).toHaveBeenCalledWith('closing');
                    expect(drawer.closed.emit).toHaveBeenCalledWith('closed');
                    resolver();
            }).catch(function (reason) {
                console.log(reason);
                return Promise.reject(reason);
            });
            
            // to be resolved at the end of the promise chain
            return result;
         })));
         
        it('should properly initialize with min temaplte',
            async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
                var template = '<ig-nav-drawer><ig-drawer-content></ig-drawer-content><ig-drawer-mini-content></ig-drawer-mini-content></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    fixture.detectChanges();
                    
                    expect(fixture.componentInstance.viewChild.animateWidth).toBeTruthy();
                    //expect(fixture.debugElement.query((x) => { return x.nativeNode.nodeName === "ASIDE";}).nativeElement).toHaveCssClass("mini");
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
        })));
        
        it('should set pin, gestures options',
            async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
                var template = '<ig-nav-drawer [pin]="pin" [enableGestures]="enableGestures"></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentPin, template)
                .createAsync(TestComponentPin)
                .then((fixture) => {
                    fixture.detectChanges();
                    
                    expect(fixture.componentInstance.viewChild.pin).toBe(true);
                    //expect(fixture.debugElement.query((x) => { return x.nativeNode.nodeName === "ASIDE";}).nativeElement).toHaveCssClass("pinned");
                    
                    expect(fixture.componentInstance.viewChild.enableGestures).toBe(false);
                    
                    fixture.componentInstance.enableGestures = "true";
                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild.enableGestures).toBe(true);
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
        })));
        
        it('should toggle on edge swipe gesture',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>', resolver,
                result = new Promise<any>( resolve => {
                    resolver = (value?: any) => {
                        resolve(value);
                    };
                } );
                tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild.isOpen).toEqual(false);
                    //https://github.com/hammerjs/hammer.js/issues/779
                    
                    /*Simulator.gestures.swipe(fixture.debugElement.children[0].nativeElement, { duration: 300, deltaX: 400, deltaY: 0 }, function() {                        
                         expect(fixture.componentInstance.viewChild.isOpen).toEqual(true);
                         resolver();
                    });*/
                    
                    // can't get simulator to toggle the handlers
                    
                    fixture.componentInstance.viewChild.swipe({ pointerType: "touch", deltaX: 20, center: { x: 80, y: 10 }, distance: 10 });
                    expect(fixture.componentInstance.viewChild.isOpen).toEqual(false, "should ignore swipes too far away from the edge");
                    
                    
                    fixture.componentInstance.viewChild.swipe({ pointerType: "touch", deltaX: 20, center: {x: 10, y: 10}, distance: 10});
                    expect(fixture.componentInstance.viewChild.isOpen).toEqual(true);
                    
                    fixture.componentInstance.viewChild.swipe({ pointerType: "touch", deltaX: -20, center: {x: 80, y: 10}, distance: 10});
                    expect(fixture.componentInstance.viewChild.isOpen).toEqual(false);
                    
                    resolver();
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
                return result;
         })));
         
         it('should toggle on edge pan gesture',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>', resolver,
                result = new Promise<any>( resolve => {
                    resolver = (value?: any) => {
                        resolve(value);
                    };
                } );
                tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    fixture.detectChanges();
                    let navDrawer = fixture.componentInstance.viewChild;
                    expect(navDrawer.isOpen).toEqual(false);
                    
                    // not from edge
                    navDrawer.panstart({ pointerType: "touch", deltaX: 20, center: { x: 80, y: 10 }, distance: 10 });
                    navDrawer.panEnd({ pointerType: "touch", deltaX: 20, center: { x: 80, y: 10 }, distance: 10 });
                    expect(navDrawer.isOpen).toEqual(false, "should ignore pan too far away from the edge");
                    
                    // not enough distance
                    navDrawer.panstart({ pointerType: "touch", deltaX: 20, center: { x: 10, y: 10 }, distance: 10 });
                    //expect(navDrawer.drawer).toHaveCssClass("panning");
                    navDrawer.pan({ pointerType: "touch", deltaX: 20, center: { x: 10, y: 10 }, distance: 10 });
                    
                    // must wait for raf to test for pan position
                    window.requestAnimationFrame(() => {
                        //expect(navDrawer.drawer).toHaveCssStyle({transform: "translate3d(-280px, 0px, 0px)"});
                        navDrawer.panEnd({ pointerType: "touch", deltaX: 20, center: { x: 10, y: 10 }, distance: 10 });
                        expect(navDrawer.isOpen).toEqual(false, "should ignore too short pan");
                        
                        //valid pan
                        navDrawer.panstart({ pointerType: "touch", deltaX: 200, center: { x: 10, y: 10 }, distance: 200 });
                        navDrawer.panEnd({ pointerType: "touch", deltaX: 200, center: { x: 10, y: 10 }, distance: 200 });
                        expect(navDrawer.isOpen).toEqual(true);
                        
                        // not enough distance, closing
                        navDrawer.panstart({ pointerType: "touch", deltaX: -100, center: { x: 200, y: 10 }, distance: 100 });
                        navDrawer.panEnd({ pointerType: "touch", deltaX: -100, center: { x: 200, y: 10 }, distance: 100 });
                        expect(navDrawer.isOpen).toEqual(true, "should ignore too short pan");
                        
                        // close
                        navDrawer.panstart({ pointerType: "touch", deltaX: -200, center: { x: 250, y: 10 }, distance: 200 });
                        navDrawer.panEnd({ pointerType: "touch", deltaX: -200, center: { x: 250, y: 10 }, distance: 200 });
                        expect(navDrawer.isOpen).toEqual(false);
                        
                        resolver();
                    });                   
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
                return result;
         })));
         
        it('should update edge zone with mini width',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer [miniWidth]="drawerMiniWidth" ><ig-drawer-content></ig-drawer-content><ig-drawer-mini-content></ig-drawer-mini-content></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
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
         })));
         
        it('should update width from css or property',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = `<ig-nav-drawer [miniWidth]="drawerMiniWidth" [width]="drawerWidth">
                                    <ig-drawer-content></ig-drawer-content>
                                    <ig-drawer-mini-content></ig-drawer-mini-content>
                            </ig-nav-drawer>`,
                resolver, result = new Promise<any>( resolve => {
                    resolver = (value?: any) => {
                        resolve(value);
                    };
                } );
                tcb.overrideTemplate(TestComponentDI, template)
                //.overrideDirective(TestComponentDI, Infragistics.NavigationDrawer, TestDrawer)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild.getExpectedWidth()).toBe(300);
                    expect(fixture.componentInstance.viewChild.getExpectedWidth(true)).toBe(60);
                    
                    fixture.componentInstance.drawerMiniWidth = "80px";
                    fixture.componentInstance.drawerWidth = "250px";
                    fixture.detectChanges();
                    expect(fixture.componentInstance.viewChild.getExpectedWidth()).toBe(250);
                    expect(fixture.componentInstance.viewChild.getExpectedWidth(true)).toBe(80);
                    
                    fixture.componentInstance.viewChild.open();
                    fixture.componentInstance.drawerWidth = "350px";
                    fixture.detectChanges();
                    window.requestAnimationFrame(() => {        
                        //expect(fixture.componentInstance.viewChild.drawer).toHaveCssStyle({width: "350px"});
                        resolver();
                    });
                    
                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
                return result;
         })));
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

class TestComponentPin extends TestComponentDI {
     pin: boolean = true;
     enableGestures: string = "";
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