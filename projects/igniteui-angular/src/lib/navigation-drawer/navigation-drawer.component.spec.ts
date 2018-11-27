import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import * as Infragistics from '../../public_api';
import { wait } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';

// HammerJS simulator from https://github.com/hammerjs/simulator, manual typings TODO
declare var Simulator: any;
const oldTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

describe('Navigation Drawer', () => {
    let widthSpyOverride: jasmine.Spy;
    // configureTestSuite();
    beforeEach(async(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        TestBed.configureTestingModule({
            declarations: [
                Infragistics.IgxNavigationCloseDirective,
                Infragistics.IgxNavigationToggleDirective,
                TestComponent,
                TestComponentDIComponent,
                TestComponentPin,
                TestComponentMini
            ],
            imports: [Infragistics.IgxNavigationDrawerModule]
        });

        // Using Window through DI causes AOT error (https://github.com/angular/angular/issues/15640)
        // so for tests just force override the the `getWindowWidth`
        widthSpyOverride = spyOn(Infragistics.IgxNavigationDrawerComponent.prototype as any, 'getWindowWidth')
            .and.returnValue(915 /* chosen at random by fair dice roll*/);
    }));

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = oldTimeout;
    });

    it('should initialize without DI service', async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(TestComponent);
            fixture.detectChanges();
            expect(fixture.componentInstance.viewChild instanceof
                Infragistics.IgxNavigationDrawerComponent).toBeTruthy();
            expect(fixture.componentInstance.viewChild.state).toBeNull();
        });
    }));

    it('should initialize with DI service', async(() => {
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

    it('should initialize with pinThreshold disabled', async(() => {
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

    it('should properly initialize all elements and properties', async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(TestComponentDIComponent);
            fixture.detectChanges();
            const domNavDrawer = fixture.debugElement.query(By.css('igx-nav-drawer')).nativeElement;

            expect(fixture.componentInstance.viewChild.id).toContain('igx-nav-drawer-');
            expect(domNavDrawer.id).toContain('igx-nav-drawer-');
            expect(fixture.componentInstance.viewChild.drawer.classList).toContain('igx-nav-drawer__aside');
            expect(fixture.componentInstance.viewChild.overlay.classList).toContain('igx-nav-drawer__overlay');
            expect(fixture.componentInstance.viewChild.styleDummy.classList).toContain('igx-nav-drawer__style-dummy');
            expect(fixture.componentInstance.viewChild.hasAnimateWidth).toBeFalsy();

            fixture.componentInstance.viewChild.id = 'customNavDrawer';
            fixture.detectChanges();

            expect(fixture.componentInstance.viewChild.id).toBe('customNavDrawer');
            expect(domNavDrawer.id).toBe('customNavDrawer');

        }).catch ((reason) => {
            return Promise.reject(reason);
        });
        }));

    it('should attach events and register to nav service and detach on destroy', async(() => {
        const template = '<igx-nav-drawer id=\'testNav\'></igx-nav-drawer>';
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

            expect(state.get('testNav')).toBeDefined();
            expect(touchManager.getManagerForElement(document) instanceof Hammer.Manager).toBeTruthy();

            fixture.destroy();
            expect(state.get('testNav')).toBeUndefined();
            expect(touchManager.getManagerForElement(document)).toBe(null);

        }).catch ((reason) => {
            return Promise.reject(reason);
        });
        }));

    it('should open and close with API calls', async(() => {
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

    it('async API calls should emit events', async(() => {
        let fixture: ComponentFixture<TestComponentDIComponent>;
        let drawer;

        // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(TestComponentDIComponent);
            fixture.detectChanges();
            drawer = fixture.componentInstance.viewChild;

            spyOn(drawer.closing, 'emit');
            spyOn(drawer.closed, 'emit');
            spyOn(drawer.opening, 'emit');
            spyOn(drawer.opened, 'emit');

            const re = drawer.open(true);
            fixture.detectChanges();
            fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event('transitionend'));
        })
        .then((value) => {
            expect(drawer.opening.emit).toHaveBeenCalled();
            expect(drawer.opened.emit).toHaveBeenCalled();

            const re = drawer.toggle(true);
            fixture.detectChanges();
            fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event('transitionend'));
        })
        .then((value) => {
                expect(drawer.closing.emit).toHaveBeenCalled();
                expect(drawer.closed.emit).toHaveBeenCalled();
                // resolver();
        });
        }));

    it('should properly initialize with min template', async(() => {
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
            expect(fixture.debugElement.query((x) => x.nativeNode.nodeName === 'ASIDE').nativeElement.classList)
                .toContain('igx-nav-drawer__aside--mini');
        }).catch ((reason) => {
            return Promise.reject(reason);
        });
    }));

    it('should update with dynamic min template', async(() => {

        // immediate requestAnimationFrame for testing
        spyOn(window, 'requestAnimationFrame').and.callFake((callback) => callback());
        const template = `<igx-nav-drawer>
                            <ng-template igxDrawer></ng-template>
                            <ng-template *ngIf="miniView" igxDrawerMini></ng-template>
                            </igx-nav-drawer>`;
        TestBed.overrideComponent(TestComponentMini, {
        set: {
            template
        }});
        let fixture;
        let asideElem;

        // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(TestComponentMini);
            fixture.detectChanges();
            asideElem = fixture.debugElement.query(By.css('.igx-nav-drawer__aside'));

            expect(asideElem.styles['width']).toEqual('60px');

            fixture.componentInstance.miniView = false;
            fixture.detectChanges();

            expect(asideElem.styles['width']).toBeFalsy();
            fixture.componentInstance.miniView = true;
            fixture.detectChanges();

            expect(asideElem.styles['width']).toEqual(fixture.componentInstance.viewChild.miniWidth);
        }).catch ((reason) => {
            return Promise.reject(reason);
        });
    }));

    it('should set pin, gestures options', async(() => {
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
            expect(fixture.debugElement.query((x) => x.nativeNode.nodeName === 'ASIDE').nativeElement.classList)
                .toContain('igx-nav-drawer__aside--pinned');

            expect(fixture.componentInstance.viewChild.enableGestures).toBe(false);

            fixture.componentInstance.enableGestures = 'true';
            fixture.detectChanges();
            expect(fixture.componentInstance.viewChild.enableGestures).toBeTruthy();

        }).catch ((reason) => {
            return Promise.reject(reason);
        });
    }));

    it('should stay at 100% parent height when pinned', async(() => {
        const template = `<div>
                            <igx-nav-drawer [pin]="pin" pinThreshold="false" [enableGestures]="enableGestures"></igx-nav-drawer>
                            </div>`;
        TestBed.overrideComponent(TestComponentPin, { set: { template }});
        TestBed.compileComponents()
        .then(() => {
            const fixture = TestBed.createComponent(TestComponentPin);
            const windowHeight = window.innerHeight;
            const aside = fixture.debugElement.query((x) => x.nativeNode.nodeName === 'ASIDE').nativeElement;
            const container = fixture.debugElement.query(By.css('div')).nativeElement;

            fixture.componentInstance.pin = false;
            fixture.detectChanges();
            expect(aside.clientHeight).toEqual(windowHeight);

            fixture.componentInstance.pin = true;
            fixture.detectChanges();
            expect(aside.clientHeight).toEqual(container.clientHeight);

            container.style.height =  `${windowHeight - 50}px`;
            expect(aside.clientHeight).toEqual(windowHeight - 50);

            // unpin :
            fixture.componentInstance.pin = false;
            fixture.detectChanges();
            expect(aside.clientHeight).toEqual(windowHeight);
        });
    }));

    it('should set flex-basis and order when pinned', async(() => {
        const template =  `<igx-nav-drawer [pin]="pin" pinThreshold="false"></igx-nav-drawer>`;
        TestBed.overrideComponent(TestComponentPin, { set: { template }});
        TestBed.compileComponents()
        .then(() => {
            const fixture = TestBed.createComponent(TestComponentPin);
            const drawer = fixture.componentInstance.viewChild;
            drawer.isOpen = true;
            fixture.detectChanges();
            const drawerElem = fixture.debugElement.query((x) => x.nativeNode.nodeName === 'IGX-NAV-DRAWER').nativeElement;

            expect(drawer.pin).toBeTruthy();
            expect(drawerElem.style.flexBasis).toEqual(drawer.width);
            expect(drawerElem.style.order).toEqual('0');

            drawer.width = '345px';
            drawer.position = 'right';
            fixture.detectChanges();
            expect(drawerElem.style.flexBasis).toEqual(drawer.width);
            expect(drawerElem.style.order).toEqual('1');

            fixture.componentInstance.pin = false;
            fixture.detectChanges();
            expect(drawer.pin).toBeFalsy();
            expect(drawerElem.style.flexBasis).toEqual('0px');
            expect(drawerElem.style.order).toEqual('0');
        });
    }));

    it('should toggle on edge swipe gesture', (done) => {
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
                .toEqual(false, 'should ignore swipes too far away from the edge');
            return swipe(document.body, 10, 10, 150, 250, 0);
        })
        .then(() => {
            expect(fixture.componentInstance.viewChild.isOpen).toEqual(true, 'Should accept edge swipe');
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

    it('should toggle on edge pan gesture', (done) => {
        let navDrawer;
        let fixture: ComponentFixture<TestComponentDIComponent>;

        // Using bare minimum of timeouts, jasmine.DEFAULT_TIMEOUT_INTERVAL can be modified only in beforeEach
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(TestComponentDIComponent);
            fixture.detectChanges();
            navDrawer = fixture.componentInstance.viewChild;

            expect(fixture.componentInstance.viewChild.isOpen).toEqual(false);

            const listener = navDrawer.renderer.listen(document.body, 'panmove', () => {

                // mid gesture
                expect(navDrawer.drawer.classList).toContain('panning');
                expect(navDrawer.drawer.style.transform)
                    .toMatch(/translate3d\(-2\d\dpx, 0px, 0px\)/, 'Drawer should be moving with the pan');
                listener();
            });

            return pan(document.body, 10, 10, 150, 20, 0);
        })
        .then(() => {
            expect(navDrawer.isOpen).toEqual(false, 'should ignore too short pan');

            // valid pan
            return pan(document.body, 10, 10, 100, 200, 0);
        }).then(() => {
            expect(navDrawer.isOpen).toEqual(true, 'should open on valid pan');

            // not enough distance, closing
            return pan(document.body, 200, 10, 100, -20, 0);
        }).then(() => {
            expect(navDrawer.isOpen).toEqual(true, 'should remain open on too short pan');

            // close
            return pan(document.body, 250, 10, 100, -200, 0);
        }).then(() => {
            expect(navDrawer.isOpen).toEqual(false, 'should close on valid pan');
            done();
        }).catch ((reason) => {
            done();
        });
        }, 10000);

    it('should update edge zone with mini width', async(() => {
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

    it('should update width from css or property', fakeAsync((done) => {
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
            expect(fixture.componentInstance.viewChild.drawer.style.width).toBe('');
            return fixture.componentInstance.viewChild.open();
        })
        .then(() => {
            expect(fixture.componentInstance.viewChild.drawer.style.width).toBe('');

            fixture.componentInstance.drawerMiniWidth = '80px';
            fixture.componentInstance.drawerWidth = '250px';
            fixture.detectChanges();
            return fixture.whenStable(); // let changes apply in the meantime
        })
        .then(() => {
            expect(fixture.componentInstance.viewChild.drawer.style.width).toBe('250px');
            return fixture.componentInstance.viewChild.close();
        })
        .then(() => {
            tick(1000);
            expect(fixture.componentInstance.viewChild.drawer.style.width).toBe('80px');
            fixture.componentInstance.drawerWidth = '350px';
            fixture.detectChanges();
            return fixture.componentInstance.viewChild.open();
        })
        .then(() => {
            expect(fixture.componentInstance.viewChild.drawer.style.width).toBe('350px');
            done();
        }).catch ((reason) => {
            return Promise.reject(reason);
        });
    }));

    it('should update pin based on window width (pinThreshold)', async (done) => {
        const template = `'<igx-nav-drawer [(pin)]="pin" [pinThreshold]="pinThreshold"></igx-nav-drawer>'`;
        let fixture: ComponentFixture<TestComponentPin>;
        TestBed.overrideComponent(TestComponentPin, {
        set: {
            template
        }});

        // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
        await TestBed.compileComponents();
        fixture = TestBed.createComponent(TestComponentPin);

        // watch for initial pin with 2-way bind expression changed errors
        expect(() => fixture.detectChanges()).not.toThrow();
        await fixture.whenStable();

        // defaults:
        expect(fixture.componentInstance.viewChild.pin).toBe(false, 'Should be initially unpinned');
        expect(fixture.componentInstance.pin).toBe(false, 'Parent component pin should update initially');

        // manual pin override
        fixture.componentInstance.pin = true;
        fixture.detectChanges();
        window.dispatchEvent(new Event('resize'));

        // wait for debounce
        await wait(200);
        expect(fixture.componentInstance.viewChild.pin).toBe(false, `Shouldn't change state on resize if window width is the same`);
        expect(fixture.componentInstance.pin).toBe(true, 'Parent component pin remain on resize if window width is the same');
        fixture.componentInstance.pin = true;
        fixture.detectChanges();

        widthSpyOverride.and.returnValue(fixture.componentInstance.pinThreshold);
        window.dispatchEvent(new Event('resize'));

        // wait for debounce
        await wait(200);
        expect(fixture.componentInstance.viewChild.pin).toBe(true, 'Should pin on window resize over threshold');
        expect(fixture.componentInstance.pin).toBe(true, 'Parent pin update on window resize over threshold');

        widthSpyOverride.and.returnValue(768);
        window.dispatchEvent(new Event('resize'));

        // wait for debounce
        await wait(200);
        expect(fixture.componentInstance.viewChild.pin).toBe(false, 'Should un-pin on window resize below threshold');
        expect(fixture.componentInstance.pin).toBe(false, 'Parent pin update on window resize below threshold');
        fixture.componentInstance.pinThreshold = 500;
        expect(() => fixture.detectChanges()).not.toThrow();
        await fixture.whenStable();
        expect(fixture.componentInstance.viewChild.pin).toBe(true, 'Should re-pin on window resize over threshold');
        expect(fixture.componentInstance.pin).toBe(true, 'Parent pin update on re-pin');
        done();
    });

    it('should get correct window width', (done) => {
        const originalWidth = window.innerWidth;

        // re-enable `getWindowWidth`
        const widthSpy = (widthSpyOverride as jasmine.Spy).and.callThrough();
        expect(widthSpy.call(null)).toEqual(originalWidth);
        (window as any).innerWidth = 0; // not that readonly in Chrome
        expect(widthSpy.call(null)).toEqual(screen.width);
        (window as any).innerWidth = originalWidth;
        done();
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
            Simulator.setType('touch');
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
            Simulator.setType('touch');
            Simulator.gestures.pan(element, swipeOptions, () => {
                resolve();
            });
        });
    }
});

@Component({
    selector: 'igx-test-cmp',
    template: '<igx-nav-drawer></igx-nav-drawer>'
})
class TestComponent {
     @ViewChild(Infragistics.IgxNavigationDrawerComponent) public viewChild: Infragistics.IgxNavigationDrawerComponent;
}

@Component({
    providers: [Infragistics.IgxNavigationService],
    selector: 'igx-test-cmp',
    template: '<igx-nav-drawer></igx-nav-drawer>'
})
class TestComponentDIComponent {
     public drawerMiniWidth: string | number;
     public drawerWidth: string | number;
     @ViewChild(Infragistics.IgxNavigationDrawerComponent) public viewChild: Infragistics.IgxNavigationDrawerComponent;
}

class TestComponentPin extends TestComponentDIComponent {
     public pin = true;
     public enableGestures = '';
     public pinThreshold = 1024;
}

class TestComponentMini extends TestComponentDIComponent {
    public miniView = true;
}
