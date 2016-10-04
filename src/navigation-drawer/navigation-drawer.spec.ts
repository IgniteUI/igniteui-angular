import {
  async,
  fakeAsync,
  tick,
  TestBed,
  ComponentFixture,
} from '@angular/core/testing';

import { Component, ViewChild, DebugElement } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as Infragistics from '../../src/main';


// HammerJS simulator from https://github.com/hammerjs/simulator, manual typings TODO
declare var Simulator: any;
var oldTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

    describe('Navigation Drawer', function() {
        beforeEach(async(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
            TestBed.configureTestingModule({
                imports: [Infragistics.NavigationDrawerModule],
                declarations: [
                    Infragistics.NavigationClose,
                    Infragistics.NavigationToggle,
                    TestComponent,
                    TestComponentDI, 
                    TestComponentPin]
            });
        }));

        afterEach(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = oldTimeout;
        });

        it('should initialize without DI service', async(() => {
            var template = '<ig-nav-drawer></ig-nav-drawer>';
            TestBed.overrideComponent(TestComponent, {
            set: {
                template: template
            }});
            // compile after overrides https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                let fixture = TestBed.createComponent(TestComponent);
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild instanceof Infragistics.NavigationDrawer).toBeTruthy();
                expect(fixture.componentInstance.viewChild.state).toBeNull();
            });
         }));
         
         it('should initialize with DI service', async(() => {
            var template = '<ig-nav-drawer></ig-nav-drawer>';
            TestBed.overrideComponent(TestComponentDI, {
            set: {
                template: template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                let fixture = TestBed.createComponent(TestComponentDI);
                fixture.detectChanges();
                    
                expect(fixture.componentInstance.viewChild).toBeDefined();
                expect(fixture.componentInstance.viewChild instanceof Infragistics.NavigationDrawer).toBeTruthy();
                expect(fixture.componentInstance.viewChild.state instanceof Infragistics.NavigationService).toBeTruthy();
            });
        }));
         
        it('should properly initialize all elements and properties', async(() => {
            var template = '<ig-nav-drawer></ig-nav-drawer>';
            TestBed.overrideComponent(TestComponentDI, {
            set: {
                template: template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                let fixture = TestBed.createComponent(TestComponentDI);
                fixture.detectChanges();
                    
                expect(fixture.componentInstance.viewChild.drawer.classList).toContain("ig-nav-drawer");
                expect(fixture.componentInstance.viewChild.overlay.classList).toContain("ig-nav-drawer-overlay");
                expect(fixture.componentInstance.viewChild.styleDummy.classList).toContain("style-dummy");
                expect(fixture.componentInstance.viewChild.hasAnimateWidth).toBeFalsy();
                    
            }).catch (reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
         }));
         
        it('should attach events and register to nav service and detach on destroy', async(() => {
            var template = '<ig-nav-drawer id="testNav"></ig-nav-drawer>';
            TestBed.overrideComponent(TestComponentDI, {
            set: {
                template: template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                let fixture = TestBed.createComponent(TestComponentDI);
                fixture.detectChanges();
                var state:Infragistics.NavigationService = fixture.componentInstance.viewChild.state,
                    touchManager = fixture.componentInstance.viewChild.touchManager;

                expect(state.get("testNav")).toBeDefined();
                expect(touchManager.getManagerForElement(document) instanceof Hammer.Manager).toBeTruthy();
                
                fixture.destroy();
                expect(state.get("testNav")).toBeUndefined();
                expect(touchManager.getManagerForElement(document)).toBe(null);
                    
            }).catch (reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
         }));
                  
        it('should open and close with API calls', async(() => {
            var template = '<ig-nav-drawer></ig-nav-drawer>';
            TestBed.overrideComponent(TestComponentDI, {
            set: {
                template: template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                let fixture = TestBed.createComponent(TestComponentDI);
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
         
        it('async API calls should resolve Promise and emit events', async(() => {
              var template = '<ig-nav-drawer></ig-nav-drawer>',
                   fixture: ComponentFixture<TestComponentDI>,
                   resolver, drawer,
                   result = new Promise<any>( resolve => {
                        resolver = (value?: any) => {
                            resolve(value);
                        };
                    } );
                TestBed.overrideComponent(TestComponentDI, {
                set: {
                    template: template
                }});
                // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
                TestBed.compileComponents().then(() => {
                    fixture = TestBed.createComponent(TestComponentDI);
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
         }));
         
        it('should properly initialize with min template', async(() => {
            var template = '<ig-nav-drawer><div class="ig-drawer-content"></div><div class="ig-drawer-mini-content"></div></ig-nav-drawer>';
            TestBed.overrideComponent(TestComponentDI, {
            set: {
                template: template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                let fixture = TestBed.createComponent(TestComponentDI);
                fixture.detectChanges();
                    
            expect(fixture.componentInstance.viewChild.hasAnimateWidth).toBeTruthy();
                expect(fixture.debugElement.query((x) => { return x.nativeNode.nodeName === "ASIDE";}).nativeElement.classList).toContain("mini");
            }).catch (reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
        }));

        it('should set pin, gestures options', async(() => {
            var template =  '<ig-nav-drawer [pin]="pin" [enableGestures]="enableGestures"></ig-nav-drawer>';
            TestBed.overrideComponent(TestComponentPin, {
            set: {
                template: template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                let fixture = TestBed.createComponent(TestComponentPin);
                fixture.detectChanges();
                    
                expect(fixture.componentInstance.viewChild.pin).toBeTruthy();
                expect(fixture.debugElement.query((x) => { return x.nativeNode.nodeName === "ASIDE";}).nativeElement.classList).toContain("pinned");
                
                expect(fixture.componentInstance.viewChild.enableGestures).toBe(false);
                
                fixture.componentInstance.enableGestures = "true";
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.enableGestures).toBeTruthy();
                
            }).catch (reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
        }));
        
        it('should toggle on edge swipe gesture', done => {
            var template = '<ig-nav-drawer></ig-nav-drawer>',
                fixture: ComponentFixture<TestComponentDI>,
                resolver, drawer,
                result = new Promise<any>( resolve => {
                    resolver = (value?: any) => {
                        resolve(value);
                    };
                } );
            TestBed.overrideComponent(TestComponentDI, {
            set: {
                template: template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(TestComponentDI);
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.isOpen).toEqual(false);
                
                //timeouts are +50 on the gesture to allow the swipe to be detected and triggered after the touches:

                Simulator.gestures.swipe(document.body, { pos: [80, 10], duration: 100, deltaX: 250, deltaY: 0 });
                return Observable.timer(150).toPromise();
            })
            .then(function() {
                expect(fixture.componentInstance.viewChild.isOpen).toEqual(false, "should ignore swipes too far away from the edge");
                Simulator.gestures.swipe(document.body, { pos: [10, 10], duration: 150, deltaX: 250, deltaY: 0 });
                return Observable.timer(200).toPromise();
            })
            .then(function() {
                expect(fixture.componentInstance.viewChild.isOpen).toEqual(true);
                Simulator.gestures.swipe(document.body, { pos: [180, 10], duration: 150, deltaX: -180, deltaY: 0 });
                return Observable.timer(200).toPromise();
            })
            .then(function() {
                expect(fixture.componentInstance.viewChild.isOpen).toEqual(false);
                done();
            })
            .catch (reason => {
                console.log(reason);
                done();
            });
         });

         it('should toggle on edge pan gesture', done => {
            let navDrawer;
            var template = '<ig-nav-drawer></ig-nav-drawer>',
                fixture: ComponentFixture<TestComponentDI>;
            TestBed.overrideComponent(TestComponentDI, {
            set: {
                template: template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            // Using bare minimum of timeouts, jasmine.DEFAULT_TIMEOUT_INTERVAL can be modified only in beforeEach
            TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(TestComponentDI);
                fixture.detectChanges();
                navDrawer = fixture.componentInstance.viewChild;

                expect(fixture.componentInstance.viewChild.isOpen).toEqual(false);

                // not enough distance,  150 seems to be the minimum for hammer to register a pan event midpoint
                Simulator.gestures.pan(document.body, { pos: [10, 10], duration: 150, deltaX: 20, deltaY: 0 });
                return Observable.timer(100).toPromise();
            })
            .then(function() {
                //mid gesture:
                expect(navDrawer.drawer.classList).toContain("panning");
                expect(navDrawer.drawer.style.transform).toMatch(/translate3d\(-2\d\dpx, 0px, 0px\)/, "Drawer should be moving with the pan");
                return Observable.timer(50).toPromise();
            }).then(function() {
                expect(navDrawer.isOpen).toEqual(false, "should ignore too short pan");
                //valid pan
                Simulator.gestures.pan(document.body, { pos: [10, 10], duration: 100, deltaX: 200, deltaY: 0 });
                return Observable.timer(100).toPromise();
            }).then(function() {
                expect(navDrawer.isOpen).toEqual(true, "should open on valid pan");
                // not enough distance, closing
                Simulator.gestures.pan(document.body, { pos: [200, 10], duration: 100, deltaX: -100, deltaY: 0 });
                return Observable.timer(100).toPromise();
            }).then(function() {
                expect(navDrawer.isOpen).toEqual(true, "should remain open on too short pan");
                // close
                Simulator.gestures.pan(document.body, { pos: [250, 10], duration: 100, deltaX: -200, deltaY: 0 });
                return Observable.timer(100).toPromise();
            }).then(function() {
                expect(navDrawer.isOpen).toEqual(false, "should close on valid pan");
                done();
            }).catch (reason => {
                console.log(reason);
                done();
            });
         });
         
        it('should update edge zone with mini width', async(() => {
            var template = '<ig-nav-drawer [miniWidth]="drawerMiniWidth" ><div class="ig-drawer-content"></div><div class="ig-drawer-mini-content"></div></ig-nav-drawer>',
                fixture: ComponentFixture<TestComponentDI>;
            TestBed.overrideComponent(TestComponentDI, {
            set: {
                template: template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(TestComponentDI);
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
         
        it('should update width from css or property', done => {
            var template = `<ig-nav-drawer [miniWidth]="drawerMiniWidth" [width]="drawerWidth">
                                    <div class="ig-drawer-content"></div>
                                    <div class="ig-drawer-mini-content"></div>
                            </ig-nav-drawer>`,
                fixture: ComponentFixture<TestComponentDI>;
            TestBed.overrideComponent(TestComponentDI, {
            set: {
                template: template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(TestComponentDI);
                fixture.detectChanges();
                
                // defaults:
                expect(fixture.componentInstance.viewChild.drawer.style.width).toBe("");
                return fixture.componentInstance.viewChild.open();
            })
            .then(function () {
                expect(fixture.componentInstance.viewChild.drawer.style.width).toBe("");
                
                fixture.componentInstance.drawerMiniWidth = "80px";
                fixture.componentInstance.drawerWidth = "250px";
                fixture.detectChanges();
                return fixture.whenStable(); // let changes apply in the meantime
            })
            .then(function () { 
                expect(fixture.componentInstance.viewChild.drawer.style.width).toBe("250px");
                return fixture.componentInstance.viewChild.close();
            })
            .then(function () {
                expect(fixture.componentInstance.viewChild.drawer.style.width).toBe("80px");
                fixture.componentInstance.drawerWidth = "350px";
                fixture.detectChanges();
                return fixture.componentInstance.viewChild.open();
            })
            .then(function () {
                expect(fixture.componentInstance.viewChild.drawer.style.width).toBe("350px");
                done();
            }).catch (reason => {
                console.log(reason);
                return Promise.reject(reason);
            });
         });
    });


@Component({
    selector: 'test-cmp',
    template: '<div></div>',
})
class TestComponent {
     @ViewChild(Infragistics.NavigationDrawer) public viewChild: Infragistics.NavigationDrawer;
}

@Component({
    selector: 'test-cmp', 
    template: '<div></div>',
    providers: [Infragistics.NavigationService]
})
class TestComponentDI {
     drawerMiniWidth: string|number;
     drawerWidth: string|number;
     @ViewChild(Infragistics.NavigationDrawer) public viewChild: Infragistics.NavigationDrawer;
}

class TestComponentPin extends TestComponentDI {
     pin: boolean = true;
     enableGestures: string = "";
}