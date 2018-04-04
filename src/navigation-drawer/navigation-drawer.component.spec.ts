import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from "@angular/core/testing";

import { Component, DebugElement, ViewChild } from "@angular/core";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs/Observable";
import * as Infragistics from "../../src/main";

// HammerJS simulator from https://github.com/hammerjs/simulator, manual typings TODO
declare var Simulator: any;
const oldTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

describe("Navigation Drawer", () => {
        beforeEach(async(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
            TestBed.configureTestingModule({
                declarations: [
                    Infragistics.IgxNavigationCloseDirective,
                    Infragistics.IgxNavigationToggleDirective,
                    TestComponent,
                    TestComponentDIComponent,
                    TestComponentPin],
                imports: [Infragistics.IgxNavigationDrawerModule]
            });
        }));

        afterEach(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = oldTimeout;
        });

        it("should initialize without DI service", async(() => {
            TestBed.compileComponents().then(() => {
                const fixture = TestBed.createComponent(TestComponent);
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild instanceof
                    Infragistics.IgxNavigationDrawerComponent).toBeTruthy();
                expect(fixture.componentInstance.viewChild.state).toBeNull();
            });
        }));

        it("should initialize with DI service", async(() => {
            TestBed.compileComponents().then(() => {
                const fixture = TestBed.createComponent(TestComponentDIComponent);
                fixture.detectChanges();

                expect(fixture.componentInstance.viewChild).toBeDefined();
                expect(fixture.componentInstance.viewChild instanceof
                    Infragistics.IgxNavigationDrawerComponent).toBeTruthy();
                expect(fixture.componentInstance.viewChild.state instanceof Infragistics.IgxNavigationService)
                    .toBeTruthy();
            });
        }));

        it("should initialize with pinThreshold disabled", async(() => {
            const template = `<igx-nav-drawer [pinThreshold]="0"></igx-nav-drawer>`;
            TestBed.overrideComponent(TestComponent, { set: { template } });
            TestBed.compileComponents().then(() => {
                const fixture = TestBed.createComponent(TestComponent);
                fixture.detectChanges();

                expect(fixture.componentInstance.viewChild).toBeDefined();
                expect(fixture.componentInstance.viewChild instanceof
                    Infragistics.IgxNavigationDrawerComponent).toBeTruthy();
                expect(() => fixture.destroy()).not.toThrow();
            });
        }));

        it("should properly initialize all elements and properties", async(() => {
            TestBed.compileComponents().then(() => {
                const fixture = TestBed.createComponent(TestComponentDIComponent);
                fixture.detectChanges();

                expect(fixture.componentInstance.viewChild.drawer.classList).toContain("igx-nav-drawer__aside");
                expect(fixture.componentInstance.viewChild.overlay.classList).toContain("igx-nav-drawer__overlay");
                expect(fixture.componentInstance.viewChild.styleDummy.classList).toContain("igx-nav-drawer__style-dummy");
                expect(fixture.componentInstance.viewChild.hasAnimateWidth).toBeFalsy();

            }).catch ((reason) => {
                return Promise.reject(reason);
            });
         }));

        it("should attach events and register to nav service and detach on destroy", async(() => {
            const template = "<igx-nav-drawer id='testNav'></igx-nav-drawer>";
            TestBed.overrideComponent(TestComponentDIComponent, {
            set: {
                template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                const fixture = TestBed.createComponent(TestComponentDIComponent);
                fixture.detectChanges();
                const state: Infragistics.IgxNavigationService = fixture.componentInstance.viewChild.state;
                const touchManager = fixture.componentInstance.viewChild.touchManager;

                expect(state.get("testNav")).toBeDefined();
                expect(touchManager.getManagerForElement(document) instanceof Hammer.Manager).toBeTruthy();

                fixture.destroy();
                expect(state.get("testNav")).toBeUndefined();
                expect(touchManager.getManagerForElement(document)).toBe(null);

            }).catch ((reason) => {
                return Promise.reject(reason);
            });
         }));

        it("should open and close with API calls", async(() => {
            TestBed.compileComponents().then(() => {
                const fixture = TestBed.createComponent(TestComponentDIComponent);
                fixture.detectChanges();
                const drawer: Infragistics.IgxNavigationDrawerComponent = fixture.componentInstance.viewChild;
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

            }).catch ((reason) => {
                return Promise.reject(reason);
            });
        }));

        it("async API calls should emit events", async(() => {
            let fixture: ComponentFixture<TestComponentDIComponent>;
            let drawer;
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(TestComponentDIComponent);
                fixture.detectChanges();
                drawer = fixture.componentInstance.viewChild;

                spyOn(drawer.closing, "emit");
                spyOn(drawer.closed, "emit");
                spyOn(drawer.opening, "emit");
                spyOn(drawer.opened, "emit");

                const re = drawer.open(true);
                fixture.detectChanges();
                fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event("transitionend"));
            })
            .then((value) => {
                expect(drawer.opening.emit).toHaveBeenCalled();
                expect(drawer.opened.emit).toHaveBeenCalled();

                const re = drawer.toggle(true);
                fixture.detectChanges();
                fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event("transitionend"));
            })
            .then((value) => {
                    expect(drawer.closing.emit).toHaveBeenCalled();
                    expect(drawer.closed.emit).toHaveBeenCalled();
                    // resolver();
            });
         }));

        it("should properly initialize with min template", async(() => {
            const template = `<igx-nav-drawer>
                                <ng-template igxDrawer></ng-template>
                                <ng-template igxDrawerMini></ng-template>
                              </igx-nav-drawer>`;
            TestBed.overrideComponent(TestComponentDIComponent, {
            set: {
                template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                const fixture = TestBed.createComponent(TestComponentDIComponent);
                fixture.detectChanges();

                expect(fixture.componentInstance.viewChild.hasAnimateWidth).toBeTruthy();
                expect(fixture.debugElement.query((x) => x.nativeNode.nodeName === "ASIDE").nativeElement.classList)
                    .toContain("igx-nav-drawer__aside--mini");
            }).catch ((reason) => {
                return Promise.reject(reason);
            });
        }));

        it("should set pin, gestures options", async(() => {
            const template =  `<igx-nav-drawer [pin]="pin" pinThreshold="false" [enableGestures]="enableGestures">
                               </igx-nav-drawer>`;
            TestBed.overrideComponent(TestComponentPin, {
            set: {
                template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                const fixture = TestBed.createComponent(TestComponentPin);
                fixture.detectChanges();

                expect(fixture.componentInstance.viewChild.pin).toBeTruthy();
                expect(fixture.debugElement.query((x) => x.nativeNode.nodeName === "ASIDE").nativeElement.classList)
                    .toContain("igx-nav-drawer__aside--pinned");

                expect(fixture.componentInstance.viewChild.enableGestures).toBe(false);

                fixture.componentInstance.enableGestures = "true";
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.enableGestures).toBeTruthy();

            }).catch ((reason) => {
                return Promise.reject(reason);
            });
        }));

        it("should toggle on edge swipe gesture", (done) => {
            let fixture: ComponentFixture<TestComponentDIComponent>;

            TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(TestComponentDIComponent);
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.isOpen).toEqual(false);

                // timeouts are +50 on the gesture to allow the swipe to be detected and triggered after the touches:
                return swipe(document.body, 80, 10, 100, 250, 0);
            })
            .then(() => {
                expect(fixture.componentInstance.viewChild.isOpen)
                    .toEqual(false, "should ignore swipes too far away from the edge");
                return swipe(document.body, 10, 10, 150, 250, 0);
            })
            .then(() => {
                expect(fixture.componentInstance.viewChild.isOpen).toEqual(true, "Should accept edge swipe");
                return swipe(document.body, 180, 10, 150, -180, 0);
            })
            .then(() => {
                expect(fixture.componentInstance.viewChild.isOpen).toEqual(false);
                done();
            })
            .catch ((reason) => {
                done();
            });
         }, 10000);

        it("should toggle on edge pan gesture", (done) => {
            let navDrawer;
            let fixture: ComponentFixture<TestComponentDIComponent>;

            // Using bare minimum of timeouts, jasmine.DEFAULT_TIMEOUT_INTERVAL can be modified only in beforeEach
            TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(TestComponentDIComponent);
                fixture.detectChanges();
                navDrawer = fixture.componentInstance.viewChild;

                expect(fixture.componentInstance.viewChild.isOpen).toEqual(false);

                const listener = navDrawer.renderer.listen(document.body, "panmove", () => {
                    // mid gesture
                    expect(navDrawer.drawer.classList).toContain("panning");
                    expect(navDrawer.drawer.style.transform)
                        .toMatch(/translate3d\(-2\d\dpx, 0px, 0px\)/, "Drawer should be moving with the pan");
                    listener();
                });

                return pan(document.body, 10, 10, 150, 20, 0);
            })
            .then(() => {
                expect(navDrawer.isOpen).toEqual(false, "should ignore too short pan");
                // valid pan
                return pan(document.body, 10, 10, 100, 200, 0);
            }).then(() => {
                expect(navDrawer.isOpen).toEqual(true, "should open on valid pan");
                // not enough distance, closing
                return pan(document.body, 200, 10, 100, -20, 0);
            }).then(() => {
                expect(navDrawer.isOpen).toEqual(true, "should remain open on too short pan");
                // close
                return pan(document.body, 250, 10, 100, -200, 0);
            }).then(() => {
                expect(navDrawer.isOpen).toEqual(false, "should close on valid pan");
                done();
            }).catch ((reason) => {
                done();
            });
         }, 10000);

        it("should update edge zone with mini width", async(() => {
            const template = `<igx-nav-drawer [miniWidth]="drawerMiniWidth">
                                <ng-template igxDrawer></ng-template>
                                <ng-template igxDrawerMini></ng-template>
                              </igx-nav-drawer>`;
            let fixture: ComponentFixture<TestComponentDIComponent>;
            TestBed.overrideComponent(TestComponentDIComponent, {
            set: {
                template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(TestComponentDIComponent);
                fixture.detectChanges();
                const drawer: Infragistics.IgxNavigationDrawerComponent = fixture.componentInstance.viewChild;

                fixture.componentInstance.drawerMiniWidth = 60;
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.maxEdgeZone).toBe(66);

                fixture.componentInstance.drawerMiniWidth = 80;
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.maxEdgeZone)
                    .toBe(fixture.componentInstance.drawerMiniWidth * 1.1);

                }).catch ((reason) => {
                    return Promise.reject(reason);
                });
         }));

        it("should update width from css or property", fakeAsync((done) => {
            const template = `<igx-nav-drawer [miniWidth]="drawerMiniWidth" [width]="drawerWidth">
                                <ng-template igxDrawer></ng-template>
                                <ng-template igxDrawerMini></ng-template>
                            </igx-nav-drawer>`;
            let fixture: ComponentFixture<TestComponentDIComponent>;
            TestBed.overrideComponent(TestComponentDIComponent, {
            set: {
                template
            }});
            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(TestComponentDIComponent);
                fixture.detectChanges();
                // const comp: DebugElement = fixture.debugElement.query(By.component(IgxNavbarComponent));

                // defaults:
                expect(fixture.componentInstance.viewChild.drawer.style.width).toBe("");
                return fixture.componentInstance.viewChild.open();
            })
            .then(() => {
                expect(fixture.componentInstance.viewChild.drawer.style.width).toBe("");

                fixture.componentInstance.drawerMiniWidth = "80px";
                fixture.componentInstance.drawerWidth = "250px";
                fixture.detectChanges();
                return fixture.whenStable(); // let changes apply in the meantime
            })
            .then(() => {
                expect(fixture.componentInstance.viewChild.drawer.style.width).toBe("250px");
                return fixture.componentInstance.viewChild.close();
            })
            .then(() => {
                tick(1000);
                expect(fixture.componentInstance.viewChild.drawer.style.width).toBe("80px");
                fixture.componentInstance.drawerWidth = "350px";
                fixture.detectChanges();
                return fixture.componentInstance.viewChild.open();
            })
            .then(() => {
                expect(fixture.componentInstance.viewChild.drawer.style.width).toBe("350px");
                done();
            }).catch ((reason) => {
                return Promise.reject(reason);
            });
        }));

        it("should update pin based on window width (pinThreshold)", (done) => {
            const template = `'<igx-nav-drawer [(pin)]="pin" [pinThreshold]="pinThreshold"></igx-nav-drawer>'`;
            const originalWidth = window.innerWidth;
            let fixture: ComponentFixture<TestComponentPin>;
            // Using Window through DI causes AOT error (https://github.com/angular/angular/issues/15640)
            // so for tests just force override the the `getWindowWidth`
            const widthSpyOverride = spyOn(Infragistics.IgxNavigationDrawerComponent.prototype as any, "getWindowWidth")
                .and.returnValue(915);

            TestBed.overrideComponent(TestComponentPin, {
            set: {
                template
            }});

            // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
            TestBed.compileComponents().then(() => {
                fixture = TestBed.createComponent(TestComponentPin);
                expect(() => fixture.detectChanges()).toThrow();

                // defaults:
                expect(fixture.componentInstance.viewChild.pin).toBe(false, "Should be initially unpinned");
                expect(fixture.componentInstance.pin).toBe(false, "Parent component pin should remain false");

                widthSpyOverride.and.returnValue(fixture.componentInstance.pinThreshold);
                window.dispatchEvent(new Event("resize"));
                // wait for debounce
                return new Promise((resolve) => {
                    setTimeout(() => { resolve(); }, 200);
                });
            })
            .then(() => {
                expect(fixture.componentInstance.viewChild.pin).toBe(true, "Should pin on window resize over threshold");
                expect(fixture.componentInstance.pin).toBe(true, "Parent pin update on window resize over threshold");

                widthSpyOverride.and.returnValue(768);
                window.dispatchEvent(new Event("resize"));
                // wait for debounce
                return new Promise((resolve) => {
                    setTimeout(() => { resolve(); }, 200);
                });
            })
            .then(() => {
                expect(fixture.componentInstance.viewChild.pin).toBe(false, "Should un-pin on window resize below threshold");
                expect(fixture.componentInstance.pin).toBe(false, "Parent pin update on window resize below threshold");
                fixture.componentInstance.pinThreshold = 500;
                expect(() => fixture.detectChanges()).toThrow();
                expect(fixture.componentInstance.viewChild.pin).toBe(true, "Should re-pin on window resize over threshold");
                expect(fixture.componentInstance.pin).toBe(true, "Parent pin update on re-pin");
                done();
            }).catch ((reason) => {
                return Promise.reject(reason);
            });
        });

        function swipe(element, posX, posY, duration, deltaX, deltaY) {
            const swipeOptions = {
                deltaX,
                deltaY,
                duration,
                pos: [posX, posY]
            };

            return new Promise((resolve, reject) => {
                // force touch (https://github.com/hammerjs/hammer.js/issues/1065)
                Simulator.setType("touch");
                Simulator.gestures.swipe(element, swipeOptions, () => {
                    resolve();
                });
            });
        }

        function pan(element, posX, posY, duration, deltaX, deltaY) {
            const swipeOptions = {
                deltaX,
                deltaY,
                duration,
                pos: [posX, posY]
            };

            return new Promise((resolve, reject) => {
                // force touch (https://github.com/hammerjs/hammer.js/issues/1065)
                Simulator.setType("touch");
                Simulator.gestures.pan(element, swipeOptions, () => {
                    resolve();
                });
            });
        }
    });

@Component({
    selector: "igx-test-cmp",
    template: "<igx-nav-drawer></igx-nav-drawer>"
})
class TestComponent {
     @ViewChild(Infragistics.IgxNavigationDrawerComponent) public viewChild: Infragistics.IgxNavigationDrawerComponent;
}

@Component({
    providers: [Infragistics.IgxNavigationService],
    selector: "igx-test-cmp",
    template: "<igx-nav-drawer></igx-nav-drawer>"
})
class TestComponentDIComponent {
     public drawerMiniWidth: string | number;
     public drawerWidth: string | number;
     @ViewChild(Infragistics.IgxNavigationDrawerComponent) public viewChild: Infragistics.IgxNavigationDrawerComponent;
}

class TestComponentPin extends TestComponentDIComponent {
     public pin = true;
     public enableGestures = "";
     public pinThreshold = 1024;
}
