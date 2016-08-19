/// <reference path="../../typings/globals/jasmine/index.d.ts" />
/// <reference path="../../typings/globals/es6-shim/index.d.ts" />

import { inject, async, fakeAsync, tick, TestComponentBuilder, ComponentFixture } from '@angular/core/testing';

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
                 expect(fixture.debugElement.children[0].componentInstance instanceof Infragistics.NavigationDrawer).toBeTruthy();
                 expect(fixture.debugElement.children[0].componentInstance.state).toBeNull();
               });
         })));

         it('should initialize with DI service',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    let navDrawer: Infragistics.NavigationDrawer = fixture.componentInstance.viewChild;

                    //http://stackoverflow.com/a/36444489
                    //expect(fixture.componentInstance.viewChild).toBeUndefined(); // commented after RC4 was released
                    fixture.detectChanges();

                    expect(navDrawer).toBeDefined();
                    expect(navDrawer instanceof Infragistics.NavigationDrawer).toBeTruthy();
                    expect(navDrawer.state instanceof Infragistics.NavigationService).toBeTruthy();
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
                    let navDrawer: Infragistics.NavigationDrawer = fixture.componentInstance.viewChild;

                    fixture.detectChanges();

                    expect(navDrawer.drawer.classList).toContain("ig-nav-drawer");
                    expect(navDrawer.overlay.classList).toContain("ig-nav-drawer-overlay");
                    expect(navDrawer.styleDummy.classList).toContain("style-dummy");
                    expect(navDrawer.hasAnimateWidth).toBeFalsy();

                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
         })));

        // TODO: another appraoch to get document managers should be used. The commented approach causes the following error:
        // Argument of type 'Document' is not assignable to parameter of type 'HTMLElement'.
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
                    //expect(touchManager.getManagerForElement(document) instanceof Hammer.Manager).toBeTruthy();

                    fixture.destroy();
                    expect(state.get("testNav")).toBeUndefined();
                    //expect(touchManager.getManagerForElement(document)).toBe(null);

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

        it('should properly initialize with min template',
            async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
                var template = '<ig-nav-drawer><ig-drawer-content></ig-drawer-content><ig-drawer-mini-content></ig-drawer-mini-content></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    fixture.detectChanges();

                    expect(fixture.componentInstance.viewChild.hasAnimateWidth).toBeTruthy();
                    expect(fixture.debugElement.query((x) => { return x.nativeNode.nodeName === "ASIDE";}).nativeElement.classList).toContain("mini");
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
                    var navDrawer = fixture.componentInstance.viewChild;

                    fixture.detectChanges();

                    expect(navDrawer.pin).toBeTruthy();
                    expect(fixture.debugElement.query((x) => { return x.nativeNode.nodeName === "ASIDE";}).nativeElement.classList).toContain("pinned");

                    expect(navDrawer.enableGestures).toBe(false);

                    fixture.componentInstance.enableGestures = "true";
                    fixture.detectChanges();
                    expect(navDrawer.enableGestures).toBeTruthy();

                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
        })));

        // TODO: Cannot use private methods in unit tests. swipe is a private method
         /*
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
                    var navDrawer: Infragistics.NavigationDrawer = fixture.componentInstance.viewChild;

                    fixture.detectChanges();
                    expect(navDrawer.isOpen).toEqual(false);
                    //https://github.com/hammerjs/hammer.js/issues/779

                    //Simulator.gestures.swipe(fixture.debugElement.children[0].nativeElement, { duration: 300, deltaX: 400, deltaY: 0 }, function() {
                    //     expect(fixture.componentInstance.viewChild.isOpen).toEqual(true);
                    //     resolver();
                    //});

                    // can't get simulator to toggle the handlers

                    navDrawer.swipe(<HammerInput>{ pointerType: "touch", deltaX: 20, center: { x: 80, y: 10 }, distance: 10 });
                    expect(navDrawer.isOpen).toEqual(false, "should ignore swipes too far away from the edge");


                    navDrawer.swipe(<HammerInput>{ pointerType: "touch", deltaX: 20, center: {x: 10, y: 10}, distance: 10});
                    expect(navDrawer.isOpen).toEqual(true);

                    navDrawer.swipe(<HammerInput>{ pointerType: "touch", deltaX: -20, center: {x: 80, y: 10}, distance: 10});
                    expect(navDrawer.isOpen).toEqual(false);

                    resolver();

                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
                return result;
         })));
        */

        // TODO: Cannot use private methods in unit tests. panStart and panEnd are private methods
         /*it('should toggle on edge pan gesture',
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
                    let hammerInput;
                    fixture.detectChanges();
                    let navDrawer = fixture.componentInstance.viewChild;
                    expect(navDrawer.isOpen).toEqual(false);

                    // not from edge
                    hammerInput = <HammerInput>{ pointerType: "touch", deltaX: 20, center: { x: 80, y: 10 }, distance: 10 };
                    navDrawer.panstart(hammerInput);
                    navDrawer.panEnd(hammerInput);
                    expect(navDrawer.isOpen).toEqual(false, "should ignore pan too far away from the edge");

                    // not enough distance
                    hammerInput = <HammerInput>{ pointerType: "touch", deltaX: 20, center: { x: 10, y: 10 }, distance: 10 };
                    navDrawer.panstart(hammerInput);
                    expect(navDrawer.drawer.classList).toContain("panning");
                    navDrawer.pan(hammerInput);

                    // must wait for raf to test for pan position
                    window.requestAnimationFrame(() => {
                        expect(navDrawer.drawer.style.transform).toBe("translate3d(-280px, 0px, 0px)");
                        navDrawer.panEnd(<HammerInput>{ pointerType: "touch", deltaX: 20, center: { x: 10, y: 10 }, distance: 10 });
                        expect(navDrawer.isOpen).toEqual(false, "should ignore too short pan");

                        //valid pan
                        hammerInput = <HammerInput>{ pointerType: "touch", deltaX: 200, center: { x: 10, y: 10 }, distance: 200 };
                        navDrawer.panstart(hammerInput);
                        navDrawer.panEnd(hammerInput);
                        expect(navDrawer.isOpen).toEqual(true);

                        // not enough distance, closing
                        hammerInput = <HammerInput>{ pointerType: "touch", deltaX: -100, center: { x: 200, y: 10 }, distance: 100 };
                        navDrawer.panstart(hammerInput);
                        navDrawer.panEnd(hammerInput);
                        expect(navDrawer.isOpen).toEqual(true, "should ignore too short pan");

                        // close
                        hammerInput = <HammerInput>{ pointerType: "touch", deltaX: -200, center: { x: 250, y: 10 }, distance: 200 };
                        navDrawer.panstart(hammerInput);
                        navDrawer.panEnd(hammerInput);
                        expect(navDrawer.isOpen).toEqual(false);

                        resolver();
                    });

                }).catch (reason => {
                    console.log(reason);
                    return Promise.reject(reason);
                });
                return result;
         })));*/

        it('should update edge zone with mini width',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
              var template = '<ig-nav-drawer [miniWidth]="drawerMiniWidth" ><ig-drawer-content></ig-drawer-content><ig-drawer-mini-content></ig-drawer-mini-content></ig-nav-drawer>';
                return tcb.overrideTemplate(TestComponentDI, template)
                .createAsync(TestComponentDI)
                .then((fixture) => {
                    let navDrawer: Infragistics.NavigationDrawer = fixture.componentInstance.viewChild;

                    fixture.detectChanges();                    

                    fixture.componentInstance.drawerMiniWidth = 60;
                    fixture.detectChanges();
                    expect(navDrawer.maxEdgeZone).toBe(66);

                    fixture.componentInstance.drawerMiniWidth = 80;
                    fixture.detectChanges();
                    expect(navDrawer.maxEdgeZone).toBe(fixture.componentInstance.drawerMiniWidth * 1.1);

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
                    let navDrawer: Infragistics.NavigationDrawer = fixture.componentInstance.viewChild;

                    fixture.detectChanges();
                    expect(navDrawer.expectedWidth).toBe(300);
                    expect(navDrawer.expectedMiniWidth).toBe(60);

                    fixture.componentInstance.drawerMiniWidth = 80;
                    fixture.componentInstance.drawerWidth = "250px";
                    fixture.detectChanges();
                    expect(navDrawer.expectedWidth).toBe(250);
                    expect(navDrawer.expectedMiniWidth).toBe(80);

                    navDrawer.open();
                    fixture.componentInstance.drawerWidth = "350px";
                    fixture.detectChanges();
                    window.requestAnimationFrame(() => {
                        expect(navDrawer.drawer.style.width).toBe("350px");
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
     drawerWidth: string;
     @ViewChild(Infragistics.NavigationDrawer) public viewChild: Infragistics.NavigationDrawer;
}

class TestComponentPin extends TestComponentDI {
     pin: boolean = true;
     enableGestures: string = "";
}