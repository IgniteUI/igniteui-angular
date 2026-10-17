import type { Mock } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ElementRef, Renderer2, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { By } from '@angular/platform-browser';
import { wait } from '../../../test-utils/ui-interactions.spec';
import { IgxNavigationDrawerComponent } from './navigation-drawer.component';
import { IgxNavigationService } from 'igniteui-angular/core';
import { IgxNavDrawerItemDirective, IgxNavDrawerMiniTemplateDirective, IgxNavDrawerTemplateDirective } from './navigation-drawer.directives';
import { IgxNavbarComponent } from 'igniteui-angular/navbar';
import { IgxFlexDirective, IgxLayoutDirective } from 'igniteui-angular/directives';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Navigation Drawer', () => {
    let widthSpyOverride: any;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TestComponentPinComponent,
                TestComponentMiniComponent,
                TestComponent,
                TestComponentDIComponent
            ],
            providers: [
                IgxNavigationDrawerComponent,
                { provide: ElementRef, useValue: null },
                Renderer2
            ]
        }).compileComponents();

        // Using Window through DI causes AOT error (https://github.com/angular/angular/issues/15640)
        // so for tests just force override the the `getWindowWidth`
        widthSpyOverride = vi.spyOn(IgxNavigationDrawerComponent.prototype as any, 'getWindowWidth').mockReturnValue(915 /* chosen at random by fair dice roll*/);
    });

    it('should initialize without DI service', async () => {
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance.navDrawer instanceof
            IgxNavigationDrawerComponent).toBeTruthy();
        expect(fixture.componentInstance.navDrawer.state).not.toBeNull();
    });

    it('should initialize with DI service', async () => {
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.navDrawer).toBeDefined();
        expect(fixture.componentInstance.navDrawer instanceof
            IgxNavigationDrawerComponent).toBeTruthy();
        expect(fixture.componentInstance.navDrawer.state instanceof IgxNavigationService)
            .toBeTruthy();
    });

    it('should initialize with pinThreshold disabled', async () => {
        const template = `<igx-nav-drawer [pinThreshold]="0"></igx-nav-drawer>`;
        TestBed.overrideComponent(TestComponent, { set: { template } });
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.navDrawer).toBeDefined();
        expect(fixture.componentInstance.navDrawer instanceof
            IgxNavigationDrawerComponent).toBeTruthy();
        expect(() => fixture.destroy()).not.toThrow();
    });

    it('should properly initialize all elements and properties', async () => {
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();
        const domNavDrawer = fixture.debugElement.query(By.css('igx-nav-drawer')).nativeElement;

        expect(fixture.componentInstance.navDrawer.id).toContain('igx-nav-drawer-');
        expect(domNavDrawer.id).toContain('igx-nav-drawer-');
        expect(fixture.componentInstance.navDrawer.drawer.classList).toContain('igx-nav-drawer__aside');
        expect(fixture.componentInstance.navDrawer.overlay.classList).toContain('igx-nav-drawer__overlay');
        expect(fixture.componentInstance.navDrawer.styleDummy.classList).toContain('igx-nav-drawer__style-dummy');
        expect(fixture.componentInstance.navDrawer.hasAnimateWidth).toBeFalsy();

        expect(fixture.componentInstance.navDrawer.drawer.getAttribute('popover')).toBe('manual');
        expect(fixture.componentInstance.navDrawer.overlay.getAttribute('popover')).toBe('manual');

        fixture.componentInstance.navDrawer.id = 'customNavDrawer';
        fixture.detectChanges();

        expect(fixture.componentInstance.navDrawer.id).toBe('customNavDrawer');
        expect(domNavDrawer.id).toBe('customNavDrawer');
    });

    it('should attach events and register to nav service and detach on destroy', async () => {
        const template = '<igx-nav-drawer id=\'testNav\'></igx-nav-drawer>';
        TestBed.overrideComponent(TestComponentDIComponent, {
            set: {
                template
            }
        });

        // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();
        const state: IgxNavigationService = fixture.componentInstance.navDrawer.state;

        expect(state.get('testNav')).toBeDefined();

        fixture.destroy();
        expect(state.get('testNav')).toBeUndefined();
    });

    it('should open and close with API calls', async () => {
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();
        const drawer: IgxNavigationDrawerComponent = fixture.componentInstance.navDrawer;
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
    });

    it('async API calls should emit events', async () => {
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();
        const drawer = fixture.componentInstance.navDrawer;

        vi.spyOn(drawer.closing, 'emit');
        vi.spyOn(drawer.closed, 'emit');
        vi.spyOn(drawer.opening, 'emit');
        vi.spyOn(drawer.opened, 'emit');

        drawer.open();
        fixture.detectChanges();
        fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event('transitionend'));

        expect(drawer.opening.emit).toHaveBeenCalled();
        expect(drawer.opened.emit).toHaveBeenCalled();

        drawer.toggle();
        fixture.detectChanges();
        fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event('transitionend'));

        expect(drawer.closing.emit).toHaveBeenCalled();
        expect(drawer.closed.emit).toHaveBeenCalled();
    });

    it('should properly initialize with min template', async () => {
        const template = `<igx-nav-drawer>
                            <ng-template igxDrawer></ng-template>
                            <ng-template igxDrawerMini></ng-template>
                            </igx-nav-drawer>`;
        TestBed.overrideComponent(TestComponentDIComponent, {
            set: {
                template,
                imports: [IgxNavigationDrawerComponent, IgxNavDrawerTemplateDirective, IgxNavDrawerMiniTemplateDirective]
            }
        });

        // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.navDrawer.hasAnimateWidth).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-nav-drawer__aside')).nativeElement.classList)
            .toContain('igx-nav-drawer__aside--mini');
        expect(fixture.componentInstance.navDrawer.drawer.getAttribute('popover')).toBe('manual');
    });

    it('should update with dynamic min template', async () => {

        // immediate requestAnimationFrame for testing
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
            callback(0);
            return 0;
        });
        const template = `<igx-nav-drawer [miniWidth]="'56px'">
                            <ng-template igxDrawer></ng-template>
                            @if (miniView) { <ng-template igxDrawerMini></ng-template> }
                            </igx-nav-drawer>`;
        TestBed.overrideComponent(TestComponentMiniComponent, {
            set: {
                template,
                imports: [IgxNavigationDrawerComponent, IgxNavDrawerTemplateDirective, IgxNavDrawerMiniTemplateDirective]
            }
        });

        // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentMiniComponent);
        fixture.detectChanges();
        const asideElem = fixture.debugElement.query(By.css('.igx-nav-drawer__aside--mini'));
        const cssProp = getComputedStyle(asideElem.nativeElement).getPropertyValue('--ig-nav-drawer-size--mini');

        expect(cssProp).toEqual('56px');

        fixture.componentInstance.miniView = false;
        fixture.detectChanges();

        expect(asideElem.styles['width']).toBeFalsy();
        fixture.componentInstance.miniView = true;
        fixture.detectChanges();

        expect(cssProp).toEqual(fixture.componentInstance.navDrawer.miniWidth);
    });

    it('should set pin, gestures options', async () => {
        const template = `<igx-nav-drawer [pin]="pin" pinThreshold="false" [enableGestures]="enableGestures">
                            </igx-nav-drawer>`;
        TestBed.overrideComponent(TestComponentPinComponent, {
            set: {
                template,
                imports: [IgxNavigationDrawerComponent, IgxNavDrawerTemplateDirective, IgxNavDrawerMiniTemplateDirective]
            }
        });

        // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentPinComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.navDrawer.pin).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-nav-drawer__aside')).nativeElement.classList)
            .toContain('igx-nav-drawer__aside--pinned');
        expect(fixture.componentInstance.navDrawer.drawer.getAttribute('popover')).toBeNull();
        expect(fixture.componentInstance.navDrawer.overlay.getAttribute('popover')).toBeNull();

        expect(fixture.componentInstance.navDrawer.enableGestures).toBe(false);

        fixture.componentInstance.enableGestures = true;
        fixture.detectChanges();
        expect(fixture.componentInstance.navDrawer.enableGestures).toBeTruthy();
    });

    it('should stay at 100% parent height when pinned', async () => {
        const template = `<div style="height: 100%; position: relative;">
                            <igx-nav-drawer
                                [isOpen]="true"
                                [pin]="pin"
                                pinThreshold="false"
                                [enableGestures]="enableGestures">
                            </igx-nav-drawer>
                          </div>`;

        TestBed.overrideComponent(TestComponentPinComponent, { set: { template } });
        await TestBed.compileComponents();
        document.body.style.overflow = 'hidden';
        const fixture = TestBed.createComponent(TestComponentPinComponent);
        fixture.detectChanges();
        const windowHeight = window.innerHeight;
        const container = fixture.debugElement.query(By.css('div')).nativeElement;
        const navdrawer = fixture.debugElement.query(By.css('igx-nav-drawer > .igx-nav-drawer__aside')).nativeElement;

        fixture.componentInstance.pin = false;
        fixture.detectChanges();
        expect(navdrawer.clientHeight).toEqual(windowHeight);
        expect(navdrawer.getAttribute('popover')).toBe('manual');

        fixture.componentInstance.pin = true;
        fixture.detectChanges();
        expect(navdrawer.clientHeight).toEqual(container.clientHeight);
        expect(navdrawer.getAttribute('popover')).toBeNull();

        container.style.height = `${windowHeight - 50}px`;
        fixture.detectChanges();
        expect(navdrawer.clientHeight).toEqual(windowHeight - 50);

        // unpin :
        fixture.componentInstance.pin = false;
        fixture.detectChanges();
        expect(navdrawer.clientHeight).toEqual(windowHeight);
        expect(navdrawer.getAttribute('popover')).toBe('manual');
    });

    it('should set flex-basis and order when pinned', async () => {
        const template = `<igx-nav-drawer [pin]="pin" pinThreshold="false"></igx-nav-drawer>`;
        TestBed.overrideComponent(TestComponentPinComponent, { set: { template } });
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentPinComponent);
        const drawer = fixture.componentInstance.navDrawer;
        drawer.isOpen = true;
        fixture.detectChanges();
        const drawerElem = fixture.debugElement.query(By.directive(IgxNavigationDrawerComponent)).nativeElement;
        let flexBasis = getComputedStyle(drawerElem).getPropertyValue('flex-basis').trim();

        expect(drawer.pin).toBeTruthy();
        expect(flexBasis).toEqual('240px');
        expect(drawerElem.style.order).toEqual('0');

        drawer.width = '345px';
        drawer.position = 'right';
        fixture.detectChanges();

        // Adjusting for transition duration
        await wait(350);
        flexBasis = getComputedStyle(drawerElem).getPropertyValue('flex-basis').trim();

        expect(flexBasis).toEqual('345px');
        expect(drawerElem.style.order).toEqual('1');

        fixture.componentInstance.pin = false;
        fixture.detectChanges();
        expect(drawer.pin).toBeFalsy();

        // Adjusting for transition duration
        await wait(350);
        flexBasis = getComputedStyle(drawerElem).getPropertyValue('flex-basis').trim();

        expect(flexBasis).toEqual('0px');
        expect(drawerElem.style.order).toEqual('0');
    });

    it('should toggle on edge swipe gesture', async () => {
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance.navDrawer.isOpen).toEqual(false);

        await swipe(document.body, 80, 10, 100, 250, 0);
        expect(fixture.componentInstance.navDrawer.isOpen, 'should ignore swipes too far away from the edge').toEqual(false);

        await swipe(document.body, 10, 10, 150, 250, 0);
        expect(fixture.componentInstance.navDrawer.isOpen, 'Should accept edge swipe').toEqual(true);

        await swipe(document.body, 180, 10, 150, -180, 0);
        expect(fixture.componentInstance.navDrawer.isOpen).toEqual(false);
    });

    it('should toggle on edge pan gesture', async () => {
        // immediate requestAnimationFrame so setXSize applies the transform synchronously for mid-gesture assertions
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
            callback(0); return 0;
        });

        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();
        const navDrawer = fixture.componentInstance.navDrawer;
        navDrawer.width = '280px';
        navDrawer.miniWidth = '68px';
        fixture.detectChanges();

        expect(navDrawer.isOpen).toEqual(false);

        let midGestureChecked = false;
        let midGestureClasses: string[] = [];
        let midGestureTransform = '';
        const listener = (navDrawer as any).renderer.listen(document, 'pointermove', () => {
            // mid gesture (document listener runs after the drawer's own pan handler)
            midGestureClasses = Array.from(navDrawer.drawer.classList);
            midGestureTransform = navDrawer.drawer.style.transform;
            midGestureChecked = true;
            listener();
        });

        await pan(document.body, 10, 10, 150, 20, 0);
        expect(midGestureChecked).toBe(true);
        expect(midGestureClasses).toContain('igx-nav-drawer__aside--panning');
        expect(midGestureTransform, 'Drawer should be moving with the pan').toMatch(/translate3d\(-2\d\dpx, 0px, 0px\)/);
        expect(navDrawer.isOpen, 'should ignore too short pan').toEqual(false);

        // valid pan
        await pan(document.body, 10, 10, 100, 200, 0);
        expect(navDrawer.isOpen, 'should open on valid pan').toEqual(true);

        // not enough distance, closing
        await pan(document.body, 200, 10, 100, -20, 0);
        expect(navDrawer.isOpen, 'should remain open on too short pan').toEqual(true);

        // close
        await pan(document.body, 250, 10, 100, -200, 0);
        expect(navDrawer.isOpen, 'should close on valid pan').toEqual(false);
    });

    it('should preserve a tap that starts inside the edge gesture zone', async () => {
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();
        const navDrawer = fixture.componentInstance.navDrawer;

        dispatchTouchPointerEvent(document.body, 'pointerdown', 10, 10);
        dispatchTouchPointerEvent(document.body, 'pointermove', 13, 10);
        const touchMove = new TouchEvent('touchmove', { bubbles: true, cancelable: true });
        document.body.dispatchEvent(touchMove);

        expect((navDrawer as any)._panning).toBe(false);
        expect(navDrawer.drawer.classList).not.toContain('panning');
        expect(touchMove.defaultPrevented).toBe(false);

        dispatchTouchPointerEvent(document.body, 'pointerup', 13, 10);
        fixture.destroy();
    });

    it('should update edge zone with mini width', async () => {
        const template = `<igx-nav-drawer [miniWidth]="drawerMiniWidth">
                            <ng-template igxDrawer></ng-template>
                            <ng-template igxDrawerMini></ng-template>
                            </igx-nav-drawer>`;
        TestBed.overrideComponent(TestComponentDIComponent, {
            set: {
                template,
                imports: [IgxNavigationDrawerComponent, IgxNavDrawerTemplateDirective, IgxNavDrawerMiniTemplateDirective]
            }
        });

        // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();

        fixture.componentInstance.drawerMiniWidth = 68;
        fixture.detectChanges();
        expect(fixture.componentInstance.navDrawer.maxEdgeZone)
            .toBe(fixture.componentInstance.drawerMiniWidth * 1.1);

        fixture.componentInstance.drawerMiniWidth = 80;
        fixture.detectChanges();
        expect(fixture.componentInstance.navDrawer.maxEdgeZone)
            .toBe(fixture.componentInstance.drawerMiniWidth * 1.1);
    });

    it('should update width from css or property', async () => {
        const template = `<igx-nav-drawer [miniWidth]="drawerMiniWidth" [width]="drawerWidth">
                            <ng-template igxDrawer></ng-template>
                            <ng-template igxDrawerMini></ng-template>
                        </igx-nav-drawer>`;
        TestBed.overrideComponent(TestComponentDIComponent, {
            set: {
                template,
                imports: [IgxNavigationDrawerComponent, IgxNavDrawerTemplateDirective, IgxNavDrawerMiniTemplateDirective]
            }
        });

        // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
        await TestBed.compileComponents();
        const fixture: ComponentFixture<TestComponentDIComponent> = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();

        // const comp: DebugElement = fixture.debugElement.query(By.component(IgxNavbarComponent));
        const asideElem = fixture.debugElement.query(By.css('igx-nav-drawer > .igx-nav-drawer__aside')).nativeElement;

        const computedStyle = window.getComputedStyle(asideElem);
        let asideWidth = computedStyle.getPropertyValue('width');

        // Default sizes:
        // Mini default:
        expect(asideWidth).toBe('56px');

        fixture.componentInstance.navDrawer.open();
        fixture.detectChanges();

        await wait(350);
        asideWidth = computedStyle.getPropertyValue('width');

        // Standard default:
        expect(asideWidth).toBe('240px');

        // Not pinned and open: popover should be shown
        expect(asideElem.matches(':popover-open')).toBeTruthy();

        // Change sizes:
        fixture.componentInstance.drawerMiniWidth = '80px';
        fixture.componentInstance.drawerWidth = '250px';

        fixture.detectChanges();

        await wait(350);
        asideWidth = computedStyle.getPropertyValue('width');

        expect(asideWidth).toBe('250px');

        fixture.componentInstance.navDrawer.close();
        fixture.detectChanges();

        await wait(350);
        asideWidth = computedStyle.getPropertyValue('width');

        expect(asideWidth).toBe('80px');

        fixture.componentInstance.drawerWidth = '350px';
        fixture.componentInstance.navDrawer.open();
        fixture.detectChanges();

        await wait(350);
        asideWidth = computedStyle.getPropertyValue('width');

        expect(asideWidth).toBe('350px');
    });

    it('should update pin based on window width (pinThreshold)', async () => {
        const template = `'<igx-nav-drawer [(pin)]="pin" [pinThreshold]="pinThreshold"></igx-nav-drawer>'`;
        TestBed.overrideComponent(TestComponentPinComponent, {
            set: {
                template
            }
        });

        // compile after overrides, not in before each: https://github.com/angular/angular/issues/10712
        await TestBed.compileComponents();
        const fixture: ComponentFixture<TestComponentPinComponent> = TestBed.createComponent(TestComponentPinComponent);

        // watch for initial pin with 2-way bind expression changed errors
        expect(() => fixture.detectChanges()).not.toThrow();
        await fixture.whenStable();

        // defaults:
        expect(fixture.componentInstance.navDrawer.pin, 'Should be initially unpinned').toBe(false);
        expect(fixture.componentInstance.pin, 'Parent component pin should update initially').toBe(false);

        // manual pin override
        fixture.componentInstance.pin = true;
        fixture.detectChanges();
        window.dispatchEvent(new Event('resize'));

        // wait for debounce
        await wait(200);
        expect(fixture.componentInstance.navDrawer.pin, `Shouldn't change state on resize if window width is the same`).toBe(false);
        expect(fixture.componentInstance.pin, 'Parent component pin remain on resize if window width is the same').toBe(true);
        fixture.componentInstance.pin = true;
        fixture.detectChanges();

        widthSpyOverride.mockReturnValue(fixture.componentInstance.pinThreshold);
        window.dispatchEvent(new Event('resize'));

        // wait for debounce
        await wait(200);
        expect(fixture.componentInstance.navDrawer.pin, 'Should pin on window resize over threshold').toBe(true);
        expect(fixture.componentInstance.pin, 'Parent pin update on window resize over threshold').toBe(true);

        widthSpyOverride.mockReturnValue(768);
        window.dispatchEvent(new Event('resize'));

        // wait for debounce
        await wait(200);
        expect(fixture.componentInstance.navDrawer.pin, 'Should un-pin on window resize below threshold').toBe(false);
        expect(fixture.componentInstance.pin, 'Parent pin update on window resize below threshold').toBe(false);
        fixture.componentInstance.pinThreshold = 500;
        expect(() => fixture.detectChanges()).not.toThrow();
        await fixture.whenStable();
        expect(fixture.componentInstance.navDrawer.pin, 'Should re-pin on window resize over threshold').toBe(true);
        expect(fixture.componentInstance.pin, 'Parent pin update on re-pin').toBe(true);
    });

    it('should get correct window width', async () => {
        const originalWidth = window.innerWidth;
        const drawer = TestBed.inject(IgxNavigationDrawerComponent);

        // re-enable `getWindowWidth`
        (widthSpyOverride as Mock).mockRestore();
        const getWindowWidth = (IgxNavigationDrawerComponent.prototype as any).getWindowWidth;
        let width = getWindowWidth.call(drawer);
        expect(width).toEqual(originalWidth);

        (window as any).innerWidth = 0; // not that readonly in Chrome
        width = getWindowWidth.call(drawer);
        expect(width).toEqual(screen.width);
        (window as any).innerWidth = originalWidth;
        ;
    });

    it('should retain classes added in markup, fix for #6508', () => {
        const fix = TestBed.createComponent(TestComponent);
        fix.detectChanges();

        expect(fix.componentInstance.navDrawer.element.classList.contains('markupClass')).toBeTruthy();
        expect(fix.componentInstance.navDrawer.element.classList.contains('igx-nav-drawer')).toBeTruthy();
    });

    it('should maintain size when mini pinned has `fixed` position', async () => {
        const fix = TestBed.createComponent(TestFixedMiniComponent);
        fix.detectChanges();

        fix.componentInstance.navDrawer.pin = true;
        fix.detectChanges();

        // Account for transition duration
        await wait(350);

        const drawerEl = fix.debugElement.query(By.directive(IgxNavigationDrawerComponent)).nativeElement;
        const navbarEl = fix.debugElement.query(By.directive(IgxNavbarComponent)).nativeElement;

        let flexBasis = getComputedStyle(drawerEl).width;

        // Mini variant pinned by default
        expect(parseInt(flexBasis)).toBeGreaterThan(0);
        expect(navbarEl.offsetLeft).toEqual(parseInt(flexBasis));

        fix.componentInstance.navDrawer.toggle();
        fix.detectChanges();

        // Account for transition duration
        await wait(350);

        flexBasis = getComputedStyle(drawerEl).getPropertyValue('flex-basis');

        expect(flexBasis).toEqual('240px');
        expect(navbarEl.offsetLeft).toEqual(parseInt(flexBasis));
    });

    it('should not hide popover during closing animation', async () => {
        const template = `<igx-nav-drawer pinThreshold="false"></igx-nav-drawer>`;
        TestBed.overrideComponent(TestComponentDIComponent, {
            set: { template }
        });
        await TestBed.compileComponents();
        const fixture = TestBed.createComponent(TestComponentDIComponent);
        fixture.detectChanges();
        const drawer = fixture.componentInstance.navDrawer;

        drawer.open();
        fixture.detectChanges();
        await wait(50);

        // Begin close - _closingAnimation should prevent immediate popover hide
        drawer.close();
        fixture.detectChanges();
        await wait(50);

        // The drawer popover should still be showing during the closing animation
        expect(drawer.isOpen).toBeFalsy();
        expect(drawer.drawer.matches(':popover-open')).toBeTruthy();

        // Complete the transition
        fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event('transitionend'));
        fixture.detectChanges();
        await wait(50);

        expect(drawer.drawer.matches(':popover-open')).toBeFalsy();
    });

    describe('direct gesture handler unit tests (mocked gesture input)', () => {
        let fixture: ComponentFixture<TestComponentDIComponent>;
        let navDrawer: IgxNavigationDrawerComponent;

        const makeGestureInput = (overrides: Partial<{
            deltaX: number; deltaY: number; pointerType: string;
            center: { x: number; y: number }; distance: number;
        }> = {}): any => ({
            deltaX: 0, deltaY: 0, pointerType: 'touch',
            center: { x: 0, y: 0 }, distance: 0,
            preventDefault: () => {},
            ...overrides
        });

        beforeEach(async () => {
            await TestBed.compileComponents();
            fixture = TestBed.createComponent(TestComponentDIComponent);
            fixture.detectChanges();
            navDrawer = fixture.componentInstance.navDrawer;
            navDrawer.width = '280px';
            navDrawer.miniWidth = '68px';
            fixture.detectChanges();
        });

        it('swipe: should toggle drawer on a valid swipe', () => {
            expect(navDrawer.isOpen).toBe(false);
            // simulate a swipe from the left edge
            (navDrawer as any).swipe(makeGestureInput({ deltaX: 250, center: { x: 200, y: 10 }, distance: 250 }));
            expect(navDrawer.isOpen).toBe(true);
        });

        it('swipe: should return early when enableGestures is false', () => {
            navDrawer.enableGestures = false;
            const spy = vi.spyOn(navDrawer as any, 'toggle');
            (navDrawer as any).swipe(makeGestureInput({ deltaX: 250, center: { x: 10, y: 10 }, distance: 250 }));
            expect(spy).not.toHaveBeenCalled();
        });

        it('swipe: should return early when pointerType is not touch', () => {
            const spy = vi.spyOn(navDrawer as any, 'toggle');
            (navDrawer as any).swipe(makeGestureInput({ pointerType: 'mouse', deltaX: 250, center: { x: 10, y: 10 }, distance: 250 }));
            expect(spy).not.toHaveBeenCalled();
        });

        it('swipe: should close an open drawer', () => {
            navDrawer.open();
            fixture.detectChanges();
            expect(navDrawer.isOpen).toBe(true);
            // negative deltaX triggers isOpen && deltaX < 0 → toggle (close)
            (navDrawer as any).swipe(makeGestureInput({ deltaX: -200, center: { x: 200, y: 10 }, distance: 200 }));
            expect(navDrawer.isOpen).toBe(false);
        });

        it('canStartPan: should qualify only edge touches while closed', () => {
            expect((navDrawer as any).canStartPan(makeGestureInput({ center: { x: 30, y: 10 } }))).toBe(true);
            expect((navDrawer as any).canStartPan(makeGestureInput({ center: { x: 100, y: 10 } }))).toBe(false);
        });

        it('canStartPan: should qualify touches anywhere while open', () => {
            navDrawer.open();
            fixture.detectChanges();

            expect((navDrawer as any).canStartPan(makeGestureInput({ center: { x: 100, y: 10 } }))).toBe(true);
        });

        it('panStart: should initialize panning after gesture recognition', () => {
            expect((navDrawer as any)._panning).toBe(false);
            (navDrawer as any).panStart(makeGestureInput({ deltaX: 0, center: { x: 30, y: 10 }, distance: 0 }));
            expect((navDrawer as any)._panning).toBe(true);
        });

        it('panStart: should not set _panning when gestures disabled', () => {
            navDrawer.enableGestures = false;
            (navDrawer as any).panStart(makeGestureInput({ deltaX: 0, center: { x: 10, y: 10 }, distance: 0 }));
            expect((navDrawer as any)._panning).toBe(false);
        });

        it('panStart: should not set _panning when pin is true', () => {
            navDrawer.pin = true;
            fixture.detectChanges();
            (navDrawer as any).panStart(makeGestureInput({ deltaX: 0, center: { x: 10, y: 10 }, distance: 0 }));
            expect((navDrawer as any)._panning).toBe(false);
            navDrawer.pin = false;
        });

        it('pan: should update drawer position while panning open', () => {
            // Set up panning state
            (navDrawer as any)._panning = true;
            (navDrawer as any)._panStartWidth = 0;
            (navDrawer as any)._panLimit = 280;
            const setXSpy = vi.spyOn(navDrawer as any, 'setXSize');
            // opening pan: not open, positive deltaX, visibleWidth < panLimit
            (navDrawer as any).pan(makeGestureInput({ deltaX: 100, center: { x: 100, y: 10 }, distance: 100 }));
            expect(setXSpy).toHaveBeenCalled();
        });

        it('pan: should return early when _panning is false', () => {
            (navDrawer as any)._panning = false;
            const setXSpy = vi.spyOn(navDrawer as any, 'setXSize');
            (navDrawer as any).pan(makeGestureInput({ deltaX: 200 }));
            expect(setXSpy).not.toHaveBeenCalled();
        });

        it('panEnd: should open the drawer when pan passed 50% threshold', () => {
            (navDrawer as any)._panning = true;
            (navDrawer as any)._panStartWidth = 0;
            (navDrawer as any)._panLimit = 280;
            // visibleWidth = 0 + 200 = 200 ≥ 280/2 → open
            (navDrawer as any).panEnd(makeGestureInput({ deltaX: 200 }));
            expect(navDrawer.isOpen).toBe(true);
        });

        it('panEnd: should close the drawer when pan passed 50% threshold', () => {
            navDrawer.open();
            fixture.detectChanges();
            (navDrawer as any)._panning = true;
            (navDrawer as any)._panStartWidth = 280;
            (navDrawer as any)._panLimit = 0;
            // visibleWidth = 280 + (-200) = 80 ≤ 280/2 → close
            (navDrawer as any).panEnd(makeGestureInput({ deltaX: -200 }));
            expect(navDrawer.isOpen).toBe(false);
        });

        it('panEnd: should not act when _panning is false', () => {
            (navDrawer as any)._panning = false;
            const openSpy = vi.spyOn(navDrawer, 'open');
            const closeSpy = vi.spyOn(navDrawer, 'close');
            (navDrawer as any).panEnd(makeGestureInput({ deltaX: 200 }));
            expect(openSpy).not.toHaveBeenCalled();
            expect(closeSpy).not.toHaveBeenCalled();
        });

        it('resetPan: should clear panning state', () => {
            navDrawer.open();
            fixture.detectChanges();
            (navDrawer as any)._panning = true;
            (navDrawer as any).renderer.addClass(navDrawer.overlay, 'igx-nav-drawer__overlay--panning');
            (navDrawer as any).renderer.addClass(navDrawer.drawer, 'igx-nav-drawer__aside--panning');
            (navDrawer as any).resetPan();
            expect((navDrawer as any)._panning).toBe(false);
            expect(navDrawer.overlay.classList).not.toContain('igx-nav-drawer__overlay--panning');
            expect(navDrawer.drawer.classList).not.toContain('igx-nav-drawer__aside--panning');
        });
    });

    const dispatchTouchPointerEvent = (element, type, clientX, clientY) => {
        element.dispatchEvent(new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            pointerId: 1,
            pointerType: 'touch',
            clientX,
            clientY
        }));
    };

    const withMockedNow = (values: number[], callback: () => void) => {
        const originalNow = Date.now;
        let callIndex = 0;
        (Date as any).now = () => values[Math.min(callIndex++, values.length - 1)];
        try {
            callback();
        } finally {
            (Date as any).now = originalNow;
        }
    };

    const swipe = (element, posX, posY, duration, deltaX, deltaY) => new Promise<void>(resolve => {
        withMockedNow([0, duration], () => {
            dispatchTouchPointerEvent(element, 'pointerdown', posX, posY);
            dispatchTouchPointerEvent(element, 'pointermove', posX + deltaX, posY + deltaY);
            dispatchTouchPointerEvent(element, 'pointerup', posX + deltaX, posY + deltaY);
        });
        resolve();
    });

    const pan = (element, posX, posY, duration, deltaX, deltaY) => new Promise<void>(resolve => {
        withMockedNow([0, Math.max(duration, 1000)], () => {
            dispatchTouchPointerEvent(element, 'pointerdown', posX, posY);
            dispatchTouchPointerEvent(element, 'pointermove', posX + deltaX, posY + deltaY);
            dispatchTouchPointerEvent(element, 'pointerup', posX + deltaX, posY + deltaY);
        });
        resolve();
    });
});

@Component({
    selector: 'igx-test-cmp',
    template: '<igx-nav-drawer class="markupClass"></igx-nav-drawer>',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxNavigationDrawerComponent]
})
class TestComponent {
    @ViewChild(IgxNavigationDrawerComponent, { static: true })
    public navDrawer: IgxNavigationDrawerComponent;
}

@Component({
    providers: [IgxNavigationService],
    selector: 'igx-test-cmp-di',
    template: '<igx-nav-drawer></igx-nav-drawer>',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxNavigationDrawerComponent]
})
class TestComponentDIComponent {
    @ViewChild(IgxNavigationDrawerComponent, { static: true })
    public navDrawer: IgxNavigationDrawerComponent;
    public drawerMiniWidth: string | number;
    public drawerWidth: string | number;
}

@Component({
    selector: 'igx-test-cmp-pin',
    providers: [IgxNavigationService],
    template: '<igx-nav-drawer></igx-nav-drawer>',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxNavigationDrawerComponent]
})
class TestComponentPinComponent extends TestComponentDIComponent {
    public pin = true;
    public enableGestures = false;
    public pinThreshold = 1024;
}

@Component({
    selector: 'igx-test-cmp-mini',
    providers: [IgxNavigationService],
    template: '<igx-nav-drawer></igx-nav-drawer>',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxNavigationDrawerComponent]
})
class TestComponentMiniComponent extends TestComponentDIComponent {
    public miniView = true;
}

@Component({
    selector: 'igx-test-fixed-mini',
    providers: [IgxNavigationService],
    imports: [
        IgxNavigationDrawerComponent,
        IgxNavDrawerTemplateDirective,
        IgxNavDrawerMiniTemplateDirective,
        IgxNavDrawerItemDirective,
        IgxNavbarComponent,
        IgxFlexDirective,
        IgxLayoutDirective
    ],
    styles: `
        .igx-nav-drawer__aside--pinned {
            position: fixed;
        }
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
    <div igxLayout>
      <igx-nav-drawer #nav>
        <ng-template igxDrawer>
          <span igxDrawerItem>Item</span>
        </ng-template>

        @if (nav.pin) {
          <ng-template igxDrawerMini>
              <nav>
                  <span igxDrawerItem>Item</span>
              </nav>
          </ng-template>
        }
      </igx-nav-drawer>

      <div igxFlex igxLayout igxLayoutDir="columns">
        <igx-navbar title="Navbar" actionButtonIcon="menu" (action)="nav.toggle()">
        </igx-navbar>
        <div class="main"></div>
      </div>
    </div>
    `
})
class TestFixedMiniComponent extends TestComponentDIComponent {
}
