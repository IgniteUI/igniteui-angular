import {
    Component,
    ElementRef,
    Inject,
    NgModule,
    ViewChild,
    ComponentRef
} from '@angular/core';
import { async as asyncWrapper, TestBed, fakeAsync, tick, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxOverlayService } from './overlay';
import { IgxToggleDirective, IgxToggleModule } from './../../directives/toggle/toggle.directive';
import { AutoPositionStrategy } from './position/auto-position-strategy';
import { ConnectedPositioningStrategy } from './position/connected-positioning-strategy';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import {
    PositionSettings,
    HorizontalAlignment,
    VerticalAlignment,
    OverlaySettings,
    Point,
    OverlayEventArgs
} from './utilities';
import * as utilities from './utilities';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import { BlockScrollStrategy } from './scroll/block-scroll-strategy';
import { AbsoluteScrollStrategy } from './scroll/absolute-scroll-strategy';
import { CloseScrollStrategy } from './scroll/close-scroll-strategy';
import { scaleInVerTop, scaleOutVerTop } from 'projects/igniteui-angular/src/lib/animations/main';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

const CLASS_OVERLAY_CONTENT = 'igx-overlay__content';
const CLASS_OVERLAY_CONTENT_MODAL = 'igx-overlay__content--modal';
const CLASS_OVERLAY_WRAPPER = 'igx-overlay__wrapper';
const CLASS_OVERLAY_WRAPPER_MODAL = 'igx-overlay__wrapper--modal';
const CLASS_OVERLAY_MAIN = 'igx-overlay';

// Utility function to get all applied to element css from all sources.
function css(element) {
    const sheets = document.styleSheets, ret = [];
    element.matches = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector
        || element.msMatchesSelector || element.oMatchesSelector;
        for (const key in sheets) {
            if (sheets.hasOwnProperty(key)) {
            const sheet = <CSSStyleSheet>sheets[key];
            const rules: any = sheet.rules || sheet.cssRules;

            for (const r in rules) {
                if (element.matches(rules[r].selectorText)) {
                    ret.push(rules[r].cssText);
                }
            }
        }
    }
    return ret;
}

function addScrollDivToElement(parent) {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.width = '100px';
    scrollDiv.style.height = '100px';
    scrollDiv.style.top = '10000px';
    scrollDiv.style.left = '10000px';
    scrollDiv.style.position = 'absolute';
    parent.appendChild(scrollDiv);

}

describe('igxOverlay', () => {
    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [IgxToggleModule, DynamicModule, NoopAnimationsModule],
            declarations: DIRECTIVE_COMPONENTS
        }).compileComponents();
        UIInteractions.clearOverlay();
    });

    afterAll(() => {
        UIInteractions.clearOverlay();
    });

    describe('Unit Tests: ', () => {

        it('OverlayElement should return a div attached to Document\'s body', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.classList.contains('igx-overlay')).toBeTruthy();
        }));

        it('Should show component passed to overlay', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(1);
            const wrapperDiv = overlayDiv.children[0];
            expect(wrapperDiv).toBeDefined();
            expect(wrapperDiv.classList.contains(CLASS_OVERLAY_WRAPPER_MODAL)).toBeTruthy();
            expect(wrapperDiv.children[0].localName).toEqual('div');

            const contentDiv = wrapperDiv.children[0];
            expect(contentDiv).toBeDefined();
            expect(contentDiv.classList.contains(CLASS_OVERLAY_CONTENT_MODAL)).toBeTruthy();
        }));

        it('Hide() should hide component and overlay', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            let overlayDiv: Element;

            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            tick();

            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            tick();

            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(2);
            expect(overlayDiv.children[0].localName).toEqual('div');
            expect(overlayDiv.children[1].localName).toEqual('div');

            fixture.componentInstance.overlay.hide('0');
            tick();

            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(Array.from(overlayDiv.classList).indexOf(CLASS_OVERLAY_MAIN) > -1).toBeTruthy();
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('div');

            fixture.componentInstance.overlay.hide('1');
            tick();

            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeUndefined();
        }));

        it('HideAll() should hide all components and overlay', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            let overlayDiv: Element;
            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            tick();
            fixture.detectChanges();
            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(2);
            expect(overlayDiv.children[0].localName).toEqual('div');
            expect(overlayDiv.children[1].localName).toEqual('div');

            fixture.componentInstance.overlay.hideAll();
            tick();
            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeUndefined();
        }));

        it('Should show and hide component via directive', fakeAsync(() => {
            const fixture = TestBed.createComponent(SimpleDynamicWithDirectiveComponent);
            fixture.detectChanges();
            let overlayDiv: Element;
            fixture.componentInstance.show();
            tick();
            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('div');

            fixture.componentInstance.hide();
            tick();
            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeUndefined();
        }));

        it('OVERLAY SERVICE should properly emit events', fakeAsync(() => {
            const fix = TestBed.createComponent(SimpleRefComponent);
            fix.detectChanges();
            const overlayInstance = fix.componentInstance.overlay;
            spyOn(overlayInstance.onClosed, 'emit');
            spyOn(overlayInstance.onClosing, 'emit');
            spyOn(overlayInstance.onOpened, 'emit');
            spyOn(overlayInstance.onOpening, 'emit');

            const firstCallId = overlayInstance.show(SimpleDynamicComponent);
            tick();

            expect(overlayInstance.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onOpening.emit).toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef) });
            const args: OverlayEventArgs = (overlayInstance.onOpening.emit as jasmine.Spy).calls.mostRecent().args[0];
            expect(args.componentRef.instance).toEqual(jasmine.any(SimpleDynamicComponent));

            tick();
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef) });
            overlayInstance.hide(firstCallId);

            tick();
            expect(overlayInstance.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onClosing.emit).toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef) });

            tick();
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef) });

            const secondCallId = overlayInstance.show(fix.componentInstance.item);
            tick();
            expect(overlayInstance.onOpening.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onOpening.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId });

            tick();
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId });

            overlayInstance.hide(secondCallId);
            tick();
            expect(overlayInstance.onClosing.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onClosing.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId });

            tick();
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId });
        }));

        it('should properly emit events', fakeAsync(() => {
            const fix = TestBed.createComponent(SimpleDynamicWithDirectiveComponent);
            fix.detectChanges();
            spyOn(fix.componentInstance.overlay.onClosing, 'emit');
            spyOn(fix.componentInstance.overlay.onClosed, 'emit');
            spyOn(fix.componentInstance.overlay.onOpening, 'emit');
            spyOn(fix.componentInstance.overlay.onOpened, 'emit');

            fix.componentInstance.show();
            expect(fix.componentInstance.overlay.onOpening.emit).toHaveBeenCalled();
            tick();
            expect(fix.componentInstance.overlay.onOpened.emit).toHaveBeenCalled();

            fix.componentInstance.hide();
            expect(fix.componentInstance.overlay.onClosing.emit).toHaveBeenCalled();
            tick();
            expect(fix.componentInstance.overlay.onClosed.emit).toHaveBeenCalled();
        }));

        it('Should properly call position method - GlobalPosition', () => {
            const mockParent = document.createElement('div');
            const mockItem = document.createElement('div');
            mockParent.appendChild(mockItem);

            const mockPositioningSettings1: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: mockItem
            };

            const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));

            const mockHorDirection: string[] = ['flex-start', 'center', 'flex-end'];
            const mockVerDirection: string[] = ['flex-start', 'center', 'flex-end'];

            for (let i = 0; i < mockHorDirection.length; i++) {
                for (let j = 0; j < mockVerDirection.length; j++) {
                    mockPositioningSettings1.horizontalDirection = HorizontalAlignment[horAl[i]];
                    mockPositioningSettings1.verticalDirection = VerticalAlignment[verAl[j]];
                    const globalStrat1 = new GlobalPositionStrategy(mockPositioningSettings1);
                    globalStrat1.position(mockItem);
                    expect(mockParent.style.justifyContent).toEqual(mockHorDirection[i]);
                    expect(mockParent.style.alignItems).toEqual(mockVerDirection[j]);
                }
            }
        });

        it('Should properly call position method - ConnectedPosition', () => {
            const mockParent = jasmine.createSpyObj('parentElement', ['style', 'lastElementChild']);
            const mockItem = document.createElement('div');
            let width = 200;
            let height = 0;
            let right = 0;
            let bottom = 0;
            spyOn(mockItem, 'getBoundingClientRect').and.callFake(() => {
                return {
                    width, height, right, bottom
                };
            });
            spyOn<any>(mockItem, 'parentElement').and.returnValue(mockParent);
            const mockPositioningSettings1: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: mockItem,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const connectedStrat1 = new ConnectedPositioningStrategy(mockPositioningSettings1);
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('-200px');

            connectedStrat1.settings.horizontalStartPoint = HorizontalAlignment.Center;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('-100px');

            connectedStrat1.settings.horizontalStartPoint = HorizontalAlignment.Right;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            right = 0;
            bottom = 0;
            width = 0;
            height = 200;
            connectedStrat1.settings.verticalStartPoint = VerticalAlignment.Top;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('-200px');
            expect(mockItem.style.left).toEqual('0px');

            connectedStrat1.settings.verticalStartPoint = VerticalAlignment.Middle;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('-100px');
            expect(mockItem.style.left).toEqual('0px');

            connectedStrat1.settings.verticalStartPoint = VerticalAlignment.Bottom;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            right = 0;
            bottom = 0;
            width = 0;
            height = 0;
            connectedStrat1.settings.verticalDirection = VerticalAlignment.Top;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('-200px');
            expect(mockItem.style.left).toEqual('0px');

            connectedStrat1.settings.verticalDirection = VerticalAlignment.Middle;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('-100px');
            expect(mockItem.style.left).toEqual('0px');

            connectedStrat1.settings.verticalDirection = VerticalAlignment.Bottom;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            right = 0;
            bottom = 0;
            width = 0;
            height = 0;
            connectedStrat1.settings.horizontalDirection = HorizontalAlignment.Left;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('-200px');

            connectedStrat1.settings.horizontalDirection = HorizontalAlignment.Center;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('-100px');

            connectedStrat1.settings.horizontalDirection = HorizontalAlignment.Right;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            // If target is Point
            connectedStrat1.settings.target = new Point(0, 0);
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            // If target is not point or html element, should fallback to new Point(0,0)
            connectedStrat1.settings.target = <any>'g';
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');
        });

        it('Should properly call position method - AutoPosition', () => {
            const mockParent = jasmine.createSpyObj('parentElement', ['style', 'lastElementChild']);
            const mockItem = { parentElement: mockParent, clientHeight: 0, clientWidth: 0 } as HTMLElement;
            spyOn<any>(mockItem, 'parentElement').and.returnValue(mockParent);
            const mockPositioningSettings1: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: mockItem,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const autoStrat1 = new AutoPositionStrategy(mockPositioningSettings1);
            spyOn(autoStrat1, 'getViewPort').and.returnValue(jasmine.createSpyObj('obj', ['left', 'top', 'right', 'bottom']));
            spyOn(ConnectedPositioningStrategy.prototype, 'position');

            autoStrat1.position(mockItem.parentElement, null, null, true);
            expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledTimes(2);
            expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledWith(mockItem.parentElement, null);
            expect(autoStrat1.getViewPort).toHaveBeenCalledWith(null);
            expect(autoStrat1.getViewPort).toHaveBeenCalledTimes(1);

            const mockPositioningSettings2: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Left,
                verticalDirection: VerticalAlignment.Top,
                target: mockItem,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const autoStrat2 = new AutoPositionStrategy(mockPositioningSettings2);
            spyOn(autoStrat2, 'getViewPort').and.returnValue(jasmine.createSpyObj('obj', ['left', 'top', 'right', 'bottom']));

            autoStrat2.position(mockItem.parentElement, null, null, true);
            expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledTimes(4);
            expect(autoStrat2.getViewPort).toHaveBeenCalledWith(null);
            expect(autoStrat2.getViewPort).toHaveBeenCalledTimes(1);

            const mockPositioningSettings3: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Center,
                verticalDirection: VerticalAlignment.Middle,
                target: mockItem,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const autoStrat3 = new AutoPositionStrategy(mockPositioningSettings3);
            spyOn(autoStrat3, 'getViewPort').and.returnValue(jasmine.createSpyObj('obj', ['left', 'top', 'right', 'bottom']));

            autoStrat3.position(mockItem.parentElement, null, null);
            expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledTimes(5);
            expect(autoStrat3.getViewPort).toHaveBeenCalledTimes(0);
        });

        it('Should properly call AutoPosition getViewPort', () => {
            const autoStrat1 = new AutoPositionStrategy();
            const docSpy = {
                documentElement: {
                    getBoundingClientRect: () => {
                        return {
                            top: 1920,
                            left: 768
                        };
                    }
                }
            };
            spyOn(document, 'documentElement').and.returnValue(1);
            expect(autoStrat1.getViewPort(docSpy)).toEqual({
                top: -1920,
                left: -768,
                bottom: -1920 + window.innerHeight,
                right: -768 + + window.innerWidth,
                height: window.innerHeight,
                width: window.innerWidth
            });
        });

        it('Should properly initialize Scroll Strategy - Block', fakeAsync(() => {
            const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                position: absolute,
                bottom: 200%;
            }`]
                }
            }).createComponent(EmptyPageComponent);
            const scrollStrat = new BlockScrollStrategy();
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrat,
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;
            spyOn(scrollStrat, 'initialize').and.callThrough();
            spyOn(scrollStrat, 'attach').and.callThrough();
            spyOn(scrollStrat, 'detach').and.callThrough();
            const scrollSpy = spyOn<any>(scrollStrat, 'onScroll').and.callThrough();
            const wheelSpy = spyOn<any>(scrollStrat, 'onWheel').and.callThrough();
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
            document.dispatchEvent(new Event('scroll'));

            expect(scrollSpy).toHaveBeenCalledTimes(1);

            document.dispatchEvent(new Event('wheel'));
            expect(wheelSpy).toHaveBeenCalledTimes(1);
            overlay.hide('0');
            tick();
            expect(scrollStrat.detach).toHaveBeenCalledTimes(1);
        }));

        it('Should properly initialize Scroll Strategy - Absolute', fakeAsync(() => {
            const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                position: absolute,
                bottom: 200%;
            }`]
                }
            }).createComponent(EmptyPageComponent);
            const scrollStrat = new AbsoluteScrollStrategy();
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrat,
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;
            spyOn(scrollStrat, 'initialize').and.callThrough();
            spyOn(scrollStrat, 'attach').and.callThrough();
            spyOn(scrollStrat, 'detach').and.callThrough();
            const scrollSpy = spyOn<any>(scrollStrat, 'onScroll').and.callThrough();
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
            document.dispatchEvent(new Event('scroll'));
            expect(scrollSpy).toHaveBeenCalledTimes(1);
            overlay.hide('0');
            tick();
            expect(scrollStrat.detach).toHaveBeenCalledTimes(1);
        }));

        it('Should properly initialize Scroll Strategy - Close', fakeAsync(() => {
            const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                position: absolute,
                bottom: 200%;
            }`]
                }
            }).createComponent(EmptyPageComponent);
            const scrollStrat = new CloseScrollStrategy();
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrat,
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;
            spyOn(scrollStrat, 'initialize').and.callThrough();
            spyOn(scrollStrat, 'attach').and.callThrough();
            spyOn(scrollStrat, 'detach').and.callThrough();
            const scrollSpy = spyOn<any>(scrollStrat, 'onScroll').and.callThrough();
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
            document.dispatchEvent(new Event('scroll'));

            expect(scrollSpy).toHaveBeenCalledTimes(1);
            overlay.hide('0');
            tick();
            expect(scrollStrat.detach).toHaveBeenCalledTimes(1);
        }));

        xit('Should properly call position method - DEFAULT', () => {

        });

        it('fix for #1690 - click on second filter does not close first one', fakeAsync(() => {
            const fixture = TestBed.createComponent(TwoButtonsComponent);
            const button1 = fixture.nativeElement.getElementsByClassName('buttonOne')[0];
            const button2 = fixture.nativeElement.getElementsByClassName('buttonTwo')[0];

            button1.click();
            tick();

            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const wrapper = overlayDiv.children[0];
            expect(wrapper.classList).toContain(CLASS_OVERLAY_WRAPPER);

            button2.click();
            tick();
            expect(overlayDiv.children.length).toBe(1);
        }));

        it('fix for #1692 - scroll strategy closes overlay when shown component is scrolled', fakeAsync(() => {
            const fixture = TestBed.createComponent(SimpleDynamicWithDirectiveComponent);
            const overlaySettings: OverlaySettings = { scrollStrategy: new CloseScrollStrategy() };
            fixture.componentInstance.show(overlaySettings);
            tick();

            let overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();

            const scrollableDiv = document.getElementsByClassName('scrollableDiv')[0];
            scrollableDiv.scrollTop += 5;
            scrollableDiv.dispatchEvent(new Event('scroll'));
            tick();

            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();

            scrollableDiv.scrollTop += 100;
            scrollableDiv.dispatchEvent(new Event('scroll'));
            tick();

            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            fixture.componentInstance.hide();
        }));

        it('fix for #1799 - content div should reposition on window resize', fakeAsync(() => {
            let point: Point = new Point(50, 50);
            const getPointSpy = spyOn(utilities, 'getPointFromPositionsSettings').and.returnValue(point);
            const fix = TestBed.createComponent(FlexContainerComponent);
            fix.detectChanges();
            const overlayInstance = fix.componentInstance.overlay;
            const buttonElement: HTMLElement = fix.componentInstance.buttonElement.nativeElement;

            const id = overlayInstance.show(
                SimpleDynamicComponent,
                { positionStrategy: new ConnectedPositioningStrategy({ target: buttonElement }) });
            tick();

            let contentRect = document.getElementsByClassName(CLASS_OVERLAY_CONTENT_MODAL)[0].getBoundingClientRect();

            expect(50).toEqual(contentRect.left);
            expect(50).toEqual(contentRect.top);

            point = new Point(200, 200);
            getPointSpy.and.callThrough().and.returnValue(point);
            window.resizeBy(200, 200);
            window.dispatchEvent(new Event('resize'));
            tick();

            contentRect = document.getElementsByClassName(CLASS_OVERLAY_CONTENT_MODAL)[0].getBoundingClientRect();
            expect(200).toEqual(contentRect.left);
            expect(200).toEqual(contentRect.top);

            overlayInstance.hide(id);
        }));
    });

    describe('Integration tests: ', () => {
        // 1. Positioning Strategies
        // 1.1 Global (show components in the window center - default).
        it('igx-overlay is rendered on top of all other views/components (any previously existing html on the page) etc.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: fixture.componentInstance.buttonElement.nativeElement,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new GlobalPositionStrategy(positionSettings);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            fixture.detectChanges();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const wrapper = overlayDiv.children[0];
            expect(wrapper.classList).toContain(CLASS_OVERLAY_WRAPPER);
        }));

        it('igx-overlay covers the whole window 100% width and height', () => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            fixture.componentInstance.buttonElement.nativeElement.click();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
                const overlayWrapper = overlayDiv.children[0];
                const overlayRect = overlayWrapper.getBoundingClientRect();
                const windowRect = document.body.getBoundingClientRect();
                expect(overlayRect.width).toEqual(windowRect.width);
                expect(overlayRect.height).toEqual(windowRect.height);
                expect(overlayRect.left).toEqual(windowRect.left);
                expect(overlayRect.top).toEqual(windowRect.top);
            });
        });

        it('The shown component is inside the igx-overlay wrapper as a content last child.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const overlayWrapper = overlayDiv.children[0];
            const content = overlayWrapper.firstChild;
            const componentEl = content.lastChild;

            expect(overlayWrapper.localName).toEqual('div');
            expect(overlayWrapper.firstChild.localName).toEqual('div');
            expect(componentEl.localName === 'div').toBeTruthy();
        }));

        it('The overlay wrapper div element, has the corresponding inline css applied for each alignment ', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                target: new Point(0, 0),
                horizontalDirection: HorizontalAlignment.Left,
                verticalDirection: VerticalAlignment.Top,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };

            const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
            const cssStyles: Array<string> = ['flex-start', 'center', 'flex-end'];

            for (let i = 0; i < horAl.length; i++) {
                positionSettings.horizontalDirection = HorizontalAlignment[horAl[i]];
                for (let j = 0; j < verAl.length; j++) {
                    positionSettings.verticalDirection = VerticalAlignment[verAl[j]];
                    overlaySettings.positionStrategy = new GlobalPositionStrategy(positionSettings);
                    fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();

                    const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
                    const overlayWrapper = overlayDiv.children[i * 3 + j] as HTMLDivElement;
                    expect(overlayWrapper.style.justifyContent).toBe(cssStyles[i]);
                    expect(overlayWrapper.style.alignItems).toBe(cssStyles[j]);
                }
            }
        }));

        it('The shown component is in the center of igx-overlay (visible window) - default.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const overlayWrapper = overlayDiv.children[0] as HTMLElement;
            const componentEl = overlayWrapper.children[0].children[0];
            const wrapperRect = overlayWrapper.getBoundingClientRect();
            const componentRect = componentEl.getBoundingClientRect();
            expect(wrapperRect.width / 2 - componentRect.width / 2).toEqual(componentRect.left);
            expect(wrapperRect.height / 2 - componentRect.height / 2).toEqual(componentRect.top);
            expect(componentRect.left).toEqual(componentRect.right - componentRect.width);
            expect(componentRect.top).toEqual(componentRect.bottom - componentRect.height);
        }));

        it('should display a new instance of the same component/options exactly on top of the previous one.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const overlayWrapper_1 = overlayDiv.children[0];
            const componentEl_1 = overlayWrapper_1.children[0].children[0];
            const overlayWrapper_2 = overlayDiv.children[1];
            const componentEl_2 = overlayWrapper_2.children[0].children[0];
            const componentRect_1 = componentEl_1.getBoundingClientRect();
            const componentRect_2 = componentEl_2.getBoundingClientRect();
            expect(componentRect_1.left).toEqual(componentRect_2.left);
            expect(componentRect_1.top).toEqual(componentRect_2.top);
            expect(componentRect_1.width).toEqual(componentRect_2.width);
            expect(componentRect_1.height).toEqual(componentRect_2.height);
        }));
        // WIP
        xit('should show a component bigger than the visible window as centered and scrollbars should not appear', fakeAsync(() => {
            // overlay div is forced to has width and height equal to 0. This will prevent body
            // to show any scrollbars whatever the size of the component is.
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            let hasScrollbar = document.body.scrollHeight > document.body.clientHeight;
            expect(hasScrollbar).toBeFalsy();
            fixture.componentInstance.overlay.show(SimpleBigSizeComponent);
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const overlayWrapper = overlayDiv.children[0];
            const componentEl = overlayWrapper.children[0].children[0];
            const wrapperRect = overlayWrapper.getBoundingClientRect();
            const componentRect = componentEl.getBoundingClientRect();
            // display:flex parent will keep the content container within the wrapper in width (x, left = 0, right = width)
            expect(componentRect.left).toBe(0);
            expect(wrapperRect.width).toEqual(wrapperRect.right);
            expect(componentRect.top).toBeLessThan(0);
            expect(wrapperRect.height / 2).toEqual(componentRect.top + componentRect.height / 2);
            hasScrollbar = document.body.scrollHeight > document.body.clientHeight;
            expect(hasScrollbar).toBeTruthy();
        }));
        // 1.1.1 Global Css
        it('css class should be applied on igx-overlay component div wrapper.' +
            'Test defaults: When no positionStrategy is passed use GlobalPositionStrategy with default PositionSettings and css class',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();
                fixture.componentInstance.overlay.show(SimpleDynamicComponent);
                tick();
                fixture.detectChanges();
                // overlay container IS NOT a child of the debugElement (attached to body, not app-root)
                const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
                expect(overlayWrapper).toBeTruthy();
                expect(overlayWrapper.localName).toEqual('div');
            })
        );

        it('css class should be applied on igx-overlay component inner div wrapper', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            fixture.detectChanges();
            const content = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            expect(content).toBeTruthy();
            expect(content.localName).toEqual('div');
        }));

        // 1.2 ConnectedPositioningStrategy(show components based on a specified position base point, horizontal and vertical alignment)
        it('igx-overlay is rendered on top of all other views/components (any previously existing html on the page) etc.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: fixture.componentInstance.buttonElement.nativeElement,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new ConnectedPositioningStrategy(positionSettings);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const wrapper = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(wrapper).toBeDefined();
            expect(wrapper.classList).toContain(CLASS_OVERLAY_MAIN);
        }));

        it('igx-overlay covers the whole window 100% width and height', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: fixture.componentInstance.buttonElement.nativeElement,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new ConnectedPositioningStrategy(positionSettings);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            const body = document.getElementsByTagName('body')[0];
            expect(wrapper.clientHeight).toEqual(body.clientHeight);
            expect(wrapper.clientWidth).toEqual(body.clientWidth);
        }));

        it('The shown component is inside the igx-overlay wrapper as a content last child.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlaySettings.positionStrategy = new ConnectedPositioningStrategy();

            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            const content = overlayWrapper.firstChild;
            const componentEl = content.lastChild;
            expect(overlayWrapper.localName).toEqual('div');
            expect(overlayWrapper.firstChild.localName).toEqual('div');
            expect(componentEl.localName === 'div').toBeTruthy();
        }));

        it('If using a ConnectedPositioningStrategy without passing other but target element options, the omitted options default to:' +
            'StartPoint:Left/Bottom, Direction Right/Bottom and openAnimation: scaleInVerTop, closeAnimation: scaleOutVerTop', () => {
                const fixture = TestBed.createComponent(TopLeftOffsetComponent);

                const targetEl: HTMLElement = <HTMLElement>document.getElementsByClassName('300_button')[0];
                const positionSettings2 = {
                    target: targetEl
                };

                const strategy = new ConnectedPositioningStrategy(positionSettings2);

                const expectedDefaults = {
                    target: targetEl,
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Bottom,
                    openAnimation: scaleInVerTop,
                    closeAnimation: scaleOutVerTop
                };

                expect(strategy.settings).toEqual(expectedDefaults);
            });

        it('If using a ConnectedPositioningStrategy without passing options, the omitted options default to: target: new Point(0, 0),' +
            'StartPoint:Left/Bottom, Direction Right/Bottom and openAnimation: scaleInVerTop, closeAnimation: scaleOutVerTop', () => {
                const fixture = TestBed.createComponent(TopLeftOffsetComponent);
                const strategy = new ConnectedPositioningStrategy();

                const expectedDefaults = {
                    target: new Point(0, 0),
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Bottom,
                    openAnimation: scaleInVerTop,
                    closeAnimation: scaleOutVerTop
                };

                expect(strategy.settings).toEqual(expectedDefaults);
            });

        // adding more than one component to show in igx-overlay:
        it('When adding a new instance of component with default settings, it is rendered exactly on top of the previous one', () => {
            const fixture = TestBed.createComponent(TopLeftOffsetComponent);
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy()
            };
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fixture.detectChanges();

            const overlayWrapper_1 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
            const componentEl_1 = overlayWrapper_1.children[0].children[0];
            const overlayWrapper_2 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[1];
            const componentEl_2 = overlayWrapper_2.children[0].children[0];
            const componentRect_1 = componentEl_1.getBoundingClientRect();
            const componentRect_2 = componentEl_2.getBoundingClientRect();
            expect(componentRect_1.left).toEqual(0);
            expect(componentRect_1.left).toEqual(componentRect_2.left);
            expect(componentRect_1.top).toEqual(0);
            expect(componentRect_1.top).toEqual(componentRect_2.top);
            expect(componentRect_1.width).toEqual(componentRect_2.width);
            expect(componentRect_1.height).toEqual(componentRect_2.height);
        });

        it('When adding a new instance of component with the same options, it is rendered exactly on top of the previous one', () => {
            const fixture = TestBed.createComponent(TopLeftOffsetComponent);
            const x = 200;
            const y = 300;
            const positionSettings: PositionSettings = {
                target: new Point(x, y),
                horizontalDirection: HorizontalAlignment.Left,
                verticalDirection: VerticalAlignment.Top,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Bottom,
            };
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(positionSettings)
            };
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fixture.detectChanges();

            const overlayWrapper_1 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
            const componentEl_1 = overlayWrapper_1.children[0].children[0];
            const overlayWrapper_2 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[1];
            const componentEl_2 = overlayWrapper_2.children[0].children[0];
            const componentRect_1 = componentEl_1.getBoundingClientRect();
            const componentRect_2 = componentEl_2.getBoundingClientRect();
            expect(componentRect_1.left).toEqual(x - componentRect_1.width);
            expect(componentRect_1.left).toEqual(componentRect_2.left);
            expect(componentRect_1.top).toEqual(y - componentRect_1.height);
            expect(componentRect_1.top).toEqual(componentRect_2.top);
            expect(componentRect_1.width).toEqual(componentRect_2.width);
            expect(componentRect_1.height).toEqual(componentRect_2.height);
        });

        // If adding a component near the visible window borders(left,right,up,down)
        // it should be partially hidden and based on scroll strategy:
        it('Scroll Strategy None: no scrolling possible.', fakeAsync(() => {
            const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                        position: absolute;
                        top: 850px;
                        left: -30px;
                        width: 100px;
                        height: 60px;
                    }`]
                }
            }).createComponent(EmptyPageComponent);

            const dummy = document.createElement('div');
            dummy.setAttribute('style',
                'width:60px; height:60px; color:green; position: absolute; top: 3000px; left: 3000px;');
            document.body.appendChild(dummy);

            const targetEl: HTMLElement = <HTMLElement>document.getElementsByClassName('button')[0];
            const positionSettings2 = {
                target: targetEl
            };

            const noScroll = new NoOpScrollStrategy();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(positionSettings2),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;
            spyOn(noScroll, 'initialize').and.callThrough();
            spyOn(noScroll, 'attach').and.callThrough();
            spyOn(noScroll, 'detach').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            const strategy = new ConnectedPositioningStrategy();

            tick();
            const contentWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            const element = contentWrapper.firstChild as HTMLElement;
            const elementRect = element.getBoundingClientRect();

            expect(noScroll.initialize).toHaveBeenCalledTimes(0);
            expect(noScroll.attach).toHaveBeenCalledTimes(0);
            expect(noScroll.detach).toHaveBeenCalledTimes(0);
            document.documentElement.scrollTop = 100;
            document.documentElement.scrollLeft = 50;
            document.dispatchEvent(new Event('scroll'));
            tick();

            expect(elementRect).toEqual(element.getBoundingClientRect());
            expect(document.documentElement.scrollTop).toEqual(100);
            expect(document.documentElement.scrollLeft).toEqual(50);
            document.body.removeChild(dummy);
        }));

        it('closingScrollStrategy: no scrolling possible. The component changes ' +
            'state to closed when reaching the threshold (example: expanded DropDown collapses).', fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);

                //  add one div far away to the right and to the bottom in order scrollbars to appear on page
                addScrollDivToElement(fixture.nativeElement);

                const scrollStrat = new CloseScrollStrategy();
                fixture.detectChanges();
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy: scrollStrat,
                    modal: false,
                    closeOnOutsideClick: false
                };
                const overlay = fixture.componentInstance.overlay;
                spyOn(scrollStrat, 'initialize').and.callThrough();
                spyOn(scrollStrat, 'attach').and.callThrough();
                spyOn(scrollStrat, 'detach').and.callThrough();
                spyOn(overlay, 'hide').and.callThrough();
                const scrollSpy = spyOn<any>(scrollStrat, 'onScroll').and.callThrough();
                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();

                const wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
                expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
                expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
                expect(document.documentElement.scrollTop).toEqual(0);
                document.documentElement.scrollTop += 9;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(scrollSpy).toHaveBeenCalledTimes(1);
                expect(document.documentElement.scrollTop).toEqual(9);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
                document.documentElement.scrollTop += 25;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(scrollSpy).toHaveBeenCalledTimes(2);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(0);
                expect(scrollStrat.detach).toHaveBeenCalledTimes(1);
                expect(overlay.hide).toHaveBeenCalledTimes(1);
            }));

        // TODO:  Should test with ConnectedPositioningStrategy
        xit('Scroll Strategy Block: it should be partially hidden. When scrolling, the component stays static. ' +
            'Component state remains the same (example: expanded DropDown remains expanded).', fakeAsync(() => {
                const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [`button {
                    position: absolute,
                    bottom: -2000px;
                }`]
                    }
                }).createComponent(EmptyPageComponent);
                const scrollStrat = new BlockScrollStrategy();
                fixture.detectChanges();
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy: scrollStrat,
                    modal: false,
                    closeOnOutsideClick: false
                };
                const overlay = fixture.componentInstance.overlay;
                spyOn(scrollStrat, 'initialize').and.callThrough();
                spyOn(scrollStrat, 'attach').and.callThrough();
                spyOn(scrollStrat, 'detach').and.callThrough();
                const scrollSpy = spyOn<any>(scrollStrat, 'onScroll').and.callThrough();
                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();

                const wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
                expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
                expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
                expect(document.documentElement.scrollTop).toEqual(0);
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(scrollSpy).toHaveBeenCalledTimes(1);
                expect(document.documentElement.scrollTop).toEqual(0);

                document.documentElement.scrollTop += 25;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(scrollSpy).toHaveBeenCalledTimes(2);
                expect(document.documentElement.scrollTop).toEqual(0);

                document.documentElement.scrollTop += 1000;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(scrollSpy).toHaveBeenCalledTimes(3);
                expect(document.documentElement.scrollTop).toEqual(0);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
                scrollStrat.detach();
            }));

        it('Scroll Strategy Absolute: can scroll it into view. Component persists state. ' +
            '(example: expanded DropDown remains expanded)', fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);

                //  add one div far away to the right and to the bottom in order scrollbars to appear on page
                addScrollDivToElement(fixture.nativeElement);
                const scrollStrat = new AbsoluteScrollStrategy();
                fixture.detectChanges();
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new ConnectedPositioningStrategy(),
                    scrollStrategy: scrollStrat,
                    modal: false,
                    closeOnOutsideClick: false
                };
                const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
                const overlay = fixture.componentInstance.overlay;
                spyOn(scrollStrat, 'initialize').and.callThrough();
                spyOn(scrollStrat, 'attach').and.callThrough();
                spyOn(scrollStrat, 'detach').and.callThrough();
                const scrollSpy = spyOn<any>(scrollStrat, 'onScroll').and.callThrough();
                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();

                const wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
                expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
                expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
                expect(document.documentElement.scrollTop).toEqual(0);
                let overlayElement = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
                let overlayChildPosition: DOMRect = overlayElement.lastElementChild.getBoundingClientRect() as DOMRect;
                expect(overlayChildPosition.y).toEqual(0);
                expect(buttonElement.getBoundingClientRect().y).toEqual(0);
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(scrollSpy).toHaveBeenCalledTimes(1);
                expect(document.documentElement.scrollTop).toEqual(0);

                document.documentElement.scrollTop += 25;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(scrollSpy).toHaveBeenCalledTimes(2);
                expect(document.documentElement.scrollTop).toEqual(25);
                overlayElement = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
                overlayChildPosition = overlayElement.lastElementChild.getBoundingClientRect() as DOMRect;
                expect(overlayChildPosition.y).toEqual(0);
                expect(buttonElement.getBoundingClientRect().y).toEqual(-25);

                document.documentElement.scrollTop += 500;
                document.dispatchEvent(new Event('scroll'));
                tick();
                overlayElement = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
                overlayChildPosition = overlayElement.lastElementChild.getBoundingClientRect() as DOMRect;
                expect(overlayChildPosition.y).toEqual(0);
                expect(buttonElement.getBoundingClientRect().y).toEqual(-525);
                expect(scrollSpy).toHaveBeenCalledTimes(3);
                expect(document.documentElement.scrollTop).toEqual(525);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
                scrollStrat.detach();
                document.documentElement.scrollTop = 0;
            }));
        // 1.2.1 Connected Css
        it('css class should be applied on igx-overlay component div wrapper', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };

            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            // overlay container IS NOT a child of the debugElement (attached to body, not app-root)
            const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            expect(overlayWrapper).toBeTruthy();
            expect(overlayWrapper.localName).toEqual('div');
        }));

        // 1.2.2 Connected strategy position method
        it('Connected strategy position method. Position component based on Point only', () => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            // for a Point(300,300);
            const expectedTopForPoint: Array<string> = ['240px', '270px', '300px'];  // top/middle/bottom/
            const expectedLeftForPoint: Array<string> = ['240px', '270px', '300px']; // left/center/right/

            const size = { width: 60, height: 60 };
            const compElement = document.createElement('div');
            compElement.setAttribute('style', 'width:60px; height:60px; color:green; border: 1px solid blue;');
            const contentWrapper = document.createElement('div');
            contentWrapper.setAttribute('style', 'width:80px; height:80px; color:gray;');
            contentWrapper.classList.add('contentWrapper');
            contentWrapper.appendChild(compElement);
            document.body.appendChild(contentWrapper);

            const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));

            fixture.detectChanges();
            for (let i = 0; i < horAl.length; i++) {
                for (let j = 0; j < verAl.length; j++) {
                    // start Point is static Top/Left at 300/300
                    const positionSettings2 = {
                        target: new Point(300, 300),
                        horizontalDirection: HorizontalAlignment[horAl[i]],
                        verticalDirection: VerticalAlignment[verAl[j]],
                        element: null,
                        horizontalStartPoint: HorizontalAlignment.Left,
                        verticalStartPoint: VerticalAlignment.Top
                    };

                    const strategy = new ConnectedPositioningStrategy(positionSettings2);
                    strategy.position(contentWrapper, size);
                    fixture.detectChanges();
                    expect(contentWrapper.style.top).toBe(expectedTopForPoint[j]);
                    expect(contentWrapper.style.left).toBe(expectedLeftForPoint[i]);
                }
            }
            document.body.removeChild(contentWrapper);
        });

        it('Connected strategy position method. Position component based on Element', () => {
            const fixture = TestBed.createComponent(TopLeftOffsetComponent);
            fixture.detectChanges();
            // for a Point(300,300);
            const expectedTopForPoint: Array<number> = [240, 270, 300];  // top/middle/bottom/
            const expectedLeftForPoint: Array<number> = [240, 270, 300]; // left/center/right/
            const expectedTopStartingPoint: Array<number> = [300, 330, 360]; // top/middle/bottom/
            const expectedLeftStartingPoint: Array<number> = [300, 350, 400]; // left/center/right/

            const size = { width: 60, height: 60 };
            const compElement = document.createElement('div');
            compElement.setAttribute('style', 'width:60px; height:60px; color:green; border: 1px solid blue;');
            const contentWrapper = document.createElement('div');
            contentWrapper.setAttribute('style', 'width:80px; height:80px; color:gray;');
            contentWrapper.classList.add('contentWrapper');
            contentWrapper.appendChild(compElement);
            document.body.appendChild(contentWrapper);

            const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
            const targetEl: HTMLElement = <HTMLElement>document.getElementsByClassName('300_button')[0];

            fixture.detectChanges();
            // loop trough and test all possible combinations (count 81) for StartPoint and Direction.
            for (let lsp = 0; lsp < horAl.length; lsp++) {
                for (let tsp = 0; tsp < verAl.length; tsp++) {
                    for (let i = 0; i < horAl.length; i++) {
                        for (let j = 0; j < verAl.length; j++) {
                            // start Point is static Top/Left at 300/300
                            const positionSettings2 = {
                                target: targetEl,
                                horizontalDirection: HorizontalAlignment[horAl[i]],
                                verticalDirection: VerticalAlignment[verAl[j]],
                                element: null,
                                horizontalStartPoint: HorizontalAlignment[horAl[lsp]],
                                verticalStartPoint: VerticalAlignment[verAl[tsp]],
                            };
                            const strategy = new ConnectedPositioningStrategy(positionSettings2);
                            strategy.position(contentWrapper, size);
                            fixture.detectChanges();
                            expect(contentWrapper.style.top).toBe((expectedTopForPoint[j] + 30 * tsp) + 'px');
                            expect(contentWrapper.style.left).toBe((expectedLeftForPoint[i] + 50 * lsp) + 'px');
                        }
                    }
                }
            }
            document.body.removeChild(contentWrapper);
        });

        // 1.3 AutoPosition (fit the shown component into the visible window.)
        it('igx-overlay is rendered on top of all other views/components (any previously existing html on the page) etc.', () => {
            const fix = TestBed.createComponent(EmptyPageComponent);
            fix.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };

            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: fix.componentInstance.buttonElement.nativeElement,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
            fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fix.whenStable().then(() => {
                fix.detectChanges();
                const wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                expect(wrapper).toBeDefined();
                expect(wrapper.classList).toContain(CLASS_OVERLAY_WRAPPER);
            });
        });

        it('igx-overlay covers the whole window 100% width and height', () => {
            const fix = TestBed.createComponent(EmptyPageComponent);
            fix.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: fix.componentInstance.buttonElement.nativeElement,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
            fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fix.whenStable().then(() => {
                fix.detectChanges();
                const wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                const body = document.getElementsByTagName('body')[0];
                expect(wrapper.clientHeight).toEqual(body.clientHeight);
                expect(wrapper.clientWidth).toEqual(body.clientWidth);
            });
        });

        it('The shown component is inside the igx-overlay as a last child.', () => {
            const fix = TestBed.createComponent(EmptyPageComponent);
            fix.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: fix.componentInstance.buttonElement.nativeElement,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
            fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fix.whenStable().then(() => {
                fix.detectChanges();
                const wrappers = document.getElementsByClassName(CLASS_OVERLAY_CONTENT);
                const wrapperContent = wrappers[wrappers.length - 1];
                expect(wrapperContent.children.length).toEqual(1);
                expect(wrapperContent.lastElementChild.getAttribute('style'))
                    .toEqual('position: absolute; width:100px; height: 100px; background-color: red');
            });
        });

        it('Should show the component inside of the viewport if it would normally be outside of bounds, BOTTOM + RIGHT', () => {
            // WIP
            const fix = TestBed.createComponent(DownRightButtonComponent);
            fix.detectChanges();
            const currentElement = fix.componentInstance;
            const buttonElement = fix.componentInstance.buttonElement.nativeElement;
            fix.detectChanges();
            currentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Right;
            currentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Bottom;
            currentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Bottom;
            currentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Right;
            currentElement.ButtonPositioningSettings.target = buttonElement;
            buttonElement.click();
            fix.detectChanges();
            fix.whenStable().then(() => {
                fix.detectChanges();
                const wrappers = document.getElementsByClassName(CLASS_OVERLAY_CONTENT);
                const wrapperContent = wrappers[wrappers.length - 1] as HTMLElement;
                const expectedStyle = 'position: absolute; width:100px; height: 100px; background-color: red';
                expect(wrapperContent.lastElementChild.getAttribute('style')).toEqual(expectedStyle);
                const buttonLeft = buttonElement.offsetLeft;
                const buttonTop = buttonElement.offsetTop;
                const expectedLeft = buttonLeft - wrapperContent.lastElementChild.clientWidth;
                const expectedTop = buttonTop - wrapperContent.lastElementChild.clientHeight;
                const wrapperLeft = wrapperContent.offsetLeft;
                const wrapperTop = wrapperContent.offsetTop;
                expect(wrapperTop).toEqual(expectedTop);
                expect(wrapperLeft).toEqual(expectedLeft);
            });
        });

        it('Should show the component inside of the viewport if it would normally be outside of bounds, TOP + LEFT', () => {
            const fix = TestBed.overrideComponent(DownRightButtonComponent, {
                set: {
                    styles: [`button {
                position: absolute;
                top: 16px;
                left: 16px;
                width: 84px;
                height: 84px;
                padding: 0px;
                margin: 0px;
                border: 0px;
            }`]
                }
            }).createComponent(DownRightButtonComponent);
            UIInteractions.clearOverlay();
            fix.detectChanges();
            const currentElement = fix.componentInstance;
            const buttonElement = fix.componentInstance.buttonElement.nativeElement;
            fix.detectChanges();
            currentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Left;
            currentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Top;
            currentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Top;
            currentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Left;
            currentElement.ButtonPositioningSettings.target = buttonElement;
            buttonElement.click();
            fix.detectChanges();
            fix.whenStable().then(() => {
                fix.detectChanges();
                const wrappers = document.getElementsByClassName(CLASS_OVERLAY_CONTENT);
                const wrapperContent = wrappers[wrappers.length - 1] as HTMLElement;
                // expect(wrapperContent.children.length).toEqual(1);
                const expectedStyle = 'position: absolute; width:100px; height: 100px; background-color: red';
                expect(wrapperContent.lastElementChild.getAttribute('style')).toEqual(expectedStyle);
                const buttonLeft = buttonElement.offsetLeft;
                const buttonTop = buttonElement.offsetTop;
                const expectedLeft = buttonLeft + buttonElement.clientWidth; // To the right of the button
                const expectedTop = buttonTop + buttonElement.clientHeight; // Bottom of the button
                const wrapperLeft = wrapperContent.offsetLeft;
                const wrapperTop = wrapperContent.offsetTop;
                expect(wrapperTop).toEqual(expectedTop);
                expect(wrapperLeft).toEqual(expectedLeft);
            });
        });

        it('Should show the component inside of the viewport if it would normally be outside of bounds, TOP + RIGHT', () => {
            const fix = TestBed.overrideComponent(DownRightButtonComponent, {
                set: {
                    styles: [`button {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 84px;
                height: 84px;
                padding: 0px;
                margin: 0px;
                border: 0px;
            }`]
                }
            }).createComponent(DownRightButtonComponent);
            UIInteractions.clearOverlay();
            fix.detectChanges();
            const currentElement = fix.componentInstance;
            const buttonElement = fix.componentInstance.buttonElement.nativeElement;
            fix.detectChanges();
            currentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Right;
            currentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Top;
            currentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Top;
            currentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Right;
            currentElement.ButtonPositioningSettings.target = buttonElement;
            buttonElement.click();
            fix.detectChanges();
            fix.whenStable().then(() => {
                fix.detectChanges();
                const wrappers = document.getElementsByClassName(CLASS_OVERLAY_CONTENT);
                const wrapperContent = wrappers[wrappers.length - 1] as HTMLElement;
                const expectedStyle = 'position: absolute; width:100px; height: 100px; background-color: red';
                expect(wrapperContent.lastElementChild.getAttribute('style')).toEqual(expectedStyle);
                const buttonLeft = buttonElement.offsetLeft;
                const buttonTop = buttonElement.offsetTop;
                const expectedLeft = buttonLeft - wrapperContent.lastElementChild.clientWidth; // To the left of the button
                const expectedTop = buttonTop + buttonElement.clientHeight; // Bottom of the button
                const wrapperLeft = wrapperContent.offsetLeft;
                const wrapperTop = wrapperContent.offsetTop;
                expect(wrapperTop).toEqual(expectedTop);
                expect(wrapperLeft).toEqual(expectedLeft);
            });
        });

        it('Should show the component inside of the viewport if it would normally be outside of bounds, BOTTOM + LEFT', () => {
            const fix = TestBed.overrideComponent(DownRightButtonComponent, {
                set: {
                    styles: [`button {
                position: absolute;
                bottom: 16px;
                left: 16px;
                width: 84px;
                height: 84px;
                padding: 0px;
                margin: 0px;
                border: 0px;
            }`]
                }
            }).createComponent(DownRightButtonComponent);
            UIInteractions.clearOverlay();
            fix.detectChanges();
            const currentElement = fix.componentInstance;
            const buttonElement = fix.componentInstance.buttonElement.nativeElement;
            fix.detectChanges();
            currentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Left;
            currentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Bottom;
            currentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Bottom;
            currentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Left;
            currentElement.ButtonPositioningSettings.target = buttonElement;
            buttonElement.click();
            fix.detectChanges();
            fix.whenStable().then(() => {
                fix.detectChanges();
                const wrappers = document.getElementsByClassName(CLASS_OVERLAY_CONTENT);
                const wrapperContent = wrappers[wrappers.length - 1] as HTMLElement;
                const expectedStyle = 'position: absolute; width:100px; height: 100px; background-color: red';
                expect(wrapperContent.lastElementChild.getAttribute('style')).toEqual(expectedStyle);
                const buttonLeft = buttonElement.offsetLeft;
                const buttonTop = buttonElement.offsetTop;
                const expectedLeft = buttonLeft + buttonElement.clientWidth; // To the right of the button
                const expectedTop = buttonTop - wrapperContent.lastElementChild.clientHeight; // On top of the button
                const wrapperLeft = wrapperContent.offsetLeft;
                const wrapperTop = wrapperContent.offsetTop;
                expect(wrapperTop).toEqual(expectedTop);
                expect(wrapperLeft).toEqual(expectedLeft);
            });
        });
        // WIP
        xit('igx-overlay displays each shown component based on the options specified if the component fits into the visible window.',
            fakeAsync(() => {
                let buttonRect: ClientRect;
                let overlayWrapper: Element;
                let wrapperRect: ClientRect;
                const fix = TestBed.createComponent(EmptyPageComponent);
                fix.detectChanges();
                const button = fix.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    target: button,
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Top
                };
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new AutoPositionStrategy(positionSettings),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };
                // HA = Right HSP = Left VSP = Top
                fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    buttonRect = button.getBoundingClientRect();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top);
                    expect(wrapperRect.left).toEqual(buttonRect.left);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Right HSP = Center VSP = Top
                    positionSettings.horizontalStartPoint = HorizontalAlignment.Center;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top);
                    expect(wrapperRect.left).toEqual(buttonRect.left + buttonRect.width / 2);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Right HSP = Right VSP = Top
                    positionSettings.horizontalStartPoint = HorizontalAlignment.Right;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top);
                    expect(wrapperRect.left).toEqual(buttonRect.right);
                    expect(wrapperRect.right).toEqual(buttonRect.right + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Right HSP = Right VSP = Middle
                    positionSettings.verticalStartPoint = VerticalAlignment.Middle;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top + buttonRect.height / 2);
                    expect(wrapperRect.left).toEqual(buttonRect.right);
                    expect(wrapperRect.right).toEqual(buttonRect.right + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Right HSP = Right VSP = Bottom
                    positionSettings.verticalStartPoint = VerticalAlignment.Bottom;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.bottom);
                    expect(wrapperRect.left).toEqual(buttonRect.right);
                    expect(wrapperRect.right).toEqual(buttonRect.right + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Right HSP = Center VSP = Bottom
                    positionSettings.horizontalStartPoint = HorizontalAlignment.Center;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.bottom);
                    expect(wrapperRect.left).toEqual(buttonRect.left + buttonRect.width / 2);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Right HSP = Left VSP = Bottom
                    positionSettings.horizontalStartPoint = HorizontalAlignment.Left;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top + buttonRect.height);
                    expect(wrapperRect.left).toEqual(buttonRect.left);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Right HSP = Left VSP = Middle
                    positionSettings.verticalStartPoint = VerticalAlignment.Middle;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top + buttonRect.height / 2);
                    expect(wrapperRect.left).toEqual(buttonRect.left);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Right HSP = Center VSP = Middle
                    positionSettings.horizontalStartPoint = HorizontalAlignment.Center;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top + buttonRect.height / 2);
                    expect(wrapperRect.left).toEqual(buttonRect.left + buttonRect.width / 2);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Left HSP = Left VSP = Right
                    positionSettings.horizontalDirection = HorizontalAlignment.Left;
                    positionSettings.horizontalStartPoint = HorizontalAlignment.Right;
                    positionSettings.verticalStartPoint = VerticalAlignment.Top;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top);
                    expect(wrapperRect.left).toEqual(buttonRect.right - wrapperRect.width);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Left HSP = Left VSP = Middle
                    positionSettings.verticalStartPoint = VerticalAlignment.Middle;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top + buttonRect.height / 2);
                    expect(wrapperRect.left).toEqual(buttonRect.right - wrapperRect.width);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Left HSP = Left VSP = Bottom
                    positionSettings.verticalStartPoint = VerticalAlignment.Bottom;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top + buttonRect.height);
                    expect(wrapperRect.left).toEqual(buttonRect.right - wrapperRect.width);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                });
            }));
        // WIP
        xit('The component is repositioned and rendered correctly in the window, even when the rendering options passed ' +
            ' should result in otherwise a partially hidden component. No scrollbars should appear.', fakeAsync(() => {
                let buttonRect: ClientRect;
                let overlayWrapper: Element;
                let wrapperRect: ClientRect;
                const fix = TestBed.createComponent(EmptyPageComponent);
                fix.detectChanges();
                const button = fix.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Left,
                    verticalDirection: VerticalAlignment.Bottom,
                    target: button,
                    horizontalStartPoint: HorizontalAlignment.Center,
                    verticalStartPoint: VerticalAlignment.Middle
                };
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new AutoPositionStrategy(positionSettings),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };
                // HA = Right HSP = Center VSP = Middle
                fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    buttonRect = button.getBoundingClientRect();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top + buttonRect.height / 2);
                    expect(wrapperRect.left).toEqual(buttonRect.right);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Right HSP = Center VSP = Top
                    positionSettings.verticalStartPoint = VerticalAlignment.Top;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.top);
                    expect(wrapperRect.left).toEqual(buttonRect.right);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
                    fix.componentInstance.overlay.hideAll();

                    // HA = Right HSP = Center VSP = Bottom
                    positionSettings.verticalStartPoint = VerticalAlignment.Bottom;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    wrapperRect = overlayWrapper.getBoundingClientRect();
                    expect(wrapperRect.top).toEqual(buttonRect.bottom);
                    expect(wrapperRect.left).toEqual(buttonRect.right);
                    expect(wrapperRect.right).toEqual(wrapperRect.left + wrapperRect.width);
                    expect(wrapperRect.bottom).toEqual(wrapperRect.top + wrapperRect.height);
            });
        }));

        xit('igx-overlay margins should be rendered correctly', () => {
            // TO DO
        });

        // When adding more than one component to show in igx-overlay:
        it('When the options used to fit the component in the window - adding a new instance of the component with the ' +
            ' same options will render it on top of the previous one.', () => {
                const fix = TestBed.createComponent(EmptyPageComponent);
                fix.detectChanges();
                const button = fix.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    target: button,
                    horizontalStartPoint: HorizontalAlignment.Center,
                    verticalStartPoint: VerticalAlignment.Bottom
                };
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new AutoPositionStrategy(positionSettings),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };
                fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                fix.detectChanges();
                fix.whenStable().then(() => {
                    const buttonRect = button.getBoundingClientRect();
                    const overlayWrapper_1 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                    const componentEl_1 = overlayWrapper_1.children[0].children[0];
                    const overlayWrapper_2 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[1];
                    const componentEl_2 = overlayWrapper_2.children[0].children[0];
                    const componentRect_1 = componentEl_1.getBoundingClientRect();
                    const componentRect_2 = componentEl_2.getBoundingClientRect();
                    expect(componentRect_1.left).toEqual(buttonRect.left + buttonRect.width / 2);
                    expect(componentRect_1.left).toEqual(componentRect_2.left);
                    expect(componentRect_1.top).toEqual(buttonRect.top + buttonRect.height);
                    expect(componentRect_1.top).toEqual(componentRect_2.top);
                    expect(componentRect_1.width).toEqual(componentRect_2.width);
                    expect(componentRect_1.height).toEqual(componentRect_2.height);
                });
            });

        // When adding more than one component to show in igx-overlay and the options used will not fit the component in the
        // window, so AutoPosition is used.
        it('Adding a new instance of the component with the same options, will render it on top of the previous one.', fakeAsync(() => {
            const fix = TestBed.createComponent(EmptyPageComponent);
            fix.detectChanges();
            // const offset = 16;
            const button = fix.componentInstance.buttonElement.nativeElement;
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Left,
                verticalDirection: VerticalAlignment.Top,
                target: button,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const overlaySettings: OverlaySettings = {
                positionStrategy: new AutoPositionStrategy(positionSettings),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const buttonRect = button.getBoundingClientRect();
            const overlayWrapper_1 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            const componentEl_1 = overlayWrapper_1.children[0].children[0];
            const overlayWrapper_2 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[1];
            const componentEl_2 = overlayWrapper_2.children[0].children[0];
            const componentRect_1 = componentEl_1.getBoundingClientRect();
            const componentRect_2 = componentEl_2.getBoundingClientRect();
            expect(componentRect_1.left).toEqual(buttonRect.right); // Will be positioned on the right of the button
            expect(componentRect_1.left).toEqual(componentRect_2.left); // Are on the same spot
            // expect(componentRect_1.top).toEqual(buttonRect.top - componentEl_1.clientHeight); // Will be positioned on top of button
            expect(componentRect_1.top).toEqual(componentRect_2.top); // Will have the same top
            expect(componentRect_1.width).toEqual(componentRect_2.width); // Will have the same width
            expect(componentRect_1.height).toEqual(componentRect_2.height); // Will have the same height
        }));

        // 2. Scroll Strategy (test with GlobalPositionStrategy(default))
        // 2.1. Scroll Strategy - None
        it('The component does not scroll with the window. No scrolling happens.', fakeAsync(() => {
            const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                        position: absolute;
                        top: 120%;
                        left:120%;
                    }`]
                }
            }).createComponent(EmptyPageComponent);

            const noScroll = new NoOpScrollStrategy();
            const overlaySettings: OverlaySettings = {
                modal: false,
            };
            const overlay = fixture.componentInstance.overlay;
            spyOn(noScroll, 'initialize').and.callThrough();
            spyOn(noScroll, 'attach').and.callThrough();
            spyOn(noScroll, 'detach').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);

            tick();
            const contentWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            const element = contentWrapper.firstChild as HTMLElement;
            const elementRect = element.getBoundingClientRect();

            expect(noScroll.initialize).toHaveBeenCalledTimes(0);
            expect(noScroll.attach).toHaveBeenCalledTimes(0);
            expect(noScroll.detach).toHaveBeenCalledTimes(0);
            document.documentElement.scrollTop = 100;
            document.documentElement.scrollLeft = 50;
            document.dispatchEvent(new Event('scroll'));
            tick();

            expect(elementRect).toEqual(element.getBoundingClientRect());
            expect(document.documentElement.scrollTop).toEqual(100);
            expect(document.documentElement.scrollLeft).toEqual(50);
            overlay.hideAll();
        }));

        it('The component shown in igx-overlay does not close.(example: expanded DropDown stays expanded during a scrolling attempt.)',
            fakeAsync(() => {
                const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [`button {
                            position: absolute;
                            top: 98%;
                            left:98%;
                        }`]
                    }
                }).createComponent(EmptyPageComponent);

                const noScroll = new NoOpScrollStrategy();
                const overlaySettings: OverlaySettings = {
                    modal: false,
                };
                const overlay = fixture.componentInstance.overlay;
                spyOn(noScroll, 'initialize').and.callThrough();
                spyOn(noScroll, 'attach').and.callThrough();
                spyOn(noScroll, 'detach').and.callThrough();

                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                const contentWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                const element = contentWrapper.firstChild as HTMLElement;
                const elementRect = element.getBoundingClientRect();

                expect(noScroll.initialize).toHaveBeenCalledTimes(0);
                expect(noScroll.attach).toHaveBeenCalledTimes(0);
                expect(noScroll.detach).toHaveBeenCalledTimes(0);
                document.documentElement.scrollTop = 40;
                document.documentElement.scrollLeft = 30;
                document.dispatchEvent(new Event('scroll'));
                tick();

                expect(elementRect).toEqual(element.getBoundingClientRect());
                expect(document.documentElement.scrollTop).toEqual(40);
                expect(document.documentElement.scrollLeft).toEqual(30);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
            })
        );

        // 2.2 Scroll Strategy - Closing. (Uses a tolerance and closes an expanded component upon scrolling if the tolerance is exceeded.)
        // (example: DropDown or Dialog component collapse/closes after scrolling 10px.)
        it('Until the set tolerance is exceeded scrolling is possible.',
            fakeAsync(() => {
                const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [
                            'button { position: absolute; top: 100%; left: 90% }'
                        ]
                    }
                }).createComponent(EmptyPageComponent);

                const scrollTolerance = 10;
                const scrollStrategy = new CloseScrollStrategy();
                const overlay = fixture.componentInstance.overlay;
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy: scrollStrategy,
                    modal: false
                };

                spyOn(scrollStrategy, 'initialize').and.callThrough();
                spyOn(scrollStrategy, 'attach').and.callThrough();
                spyOn(scrollStrategy, 'detach').and.callThrough();
                spyOn(overlay, 'show').and.callThrough();
                spyOn(overlay, 'hide').and.callThrough();

                const scrollSpy = spyOn<any>(scrollStrategy, 'onScroll').and.callThrough();

                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                expect(scrollStrategy.initialize).toHaveBeenCalledTimes(1);
                expect(scrollStrategy.attach).toHaveBeenCalledTimes(1);
                expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
                expect(overlay.show).toHaveBeenCalledTimes(1);
                expect(overlay.hide).toHaveBeenCalledTimes(0);

                document.documentElement.scrollTop = scrollTolerance;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
                expect(scrollSpy).toHaveBeenCalledTimes(1);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
                expect(overlay.hide).toHaveBeenCalledTimes(0);
                expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);

                document.documentElement.scrollTop = scrollTolerance * 2;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(scrollSpy).toHaveBeenCalledTimes(2);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(0);
                expect(overlay.hide).toHaveBeenCalledTimes(1);
                expect(scrollStrategy.detach).toHaveBeenCalledTimes(1);
            }));

        it('The component shown in igx-overlay does not change its state until it exceeds the scrolling tolerance set.',
            fakeAsync(() => {
                const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [
                            'button { position: absolute; top: 200%; left: 90% }'
                        ]
                    }
                }).createComponent(EmptyPageComponent);
                const scrollTolerance = 10;
                const scrollStrategy = new CloseScrollStrategy();
                const overlay = fixture.componentInstance.overlay;
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy: scrollStrategy,
                    closeOnOutsideClick: false,
                    modal: false
                };
                spyOn(scrollStrategy, 'initialize').and.callThrough();
                spyOn(scrollStrategy, 'attach').and.callThrough();
                spyOn(scrollStrategy, 'detach').and.callThrough();
                spyOn(overlay, 'hide').and.callThrough();

                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                expect(scrollStrategy.attach).toHaveBeenCalledTimes(1);
                expect(scrollStrategy.initialize).toHaveBeenCalledTimes(1);
                expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
                expect(document.documentElement.scrollTop).toEqual(0);

                document.documentElement.scrollTop += scrollTolerance;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
                expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
                expect(overlay.hide).toHaveBeenCalledTimes(0);

                fixture.destroy();
            }));

        it('The component shown in igx-overlay changes its state when it exceeds the scrolling tolerance set ' +
            '(an expanded DropDown, Menu, DatePicker, etc. collapses).', fakeAsync(() => {
                const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [
                            'button { position: absolute; top: 100%; left: 90% }'
                        ]
                    }
                }).createComponent(EmptyPageComponent);
                const scrollTolerance = 10;
                const scrollStrategy = new CloseScrollStrategy();
                const overlay = fixture.componentInstance.overlay;
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy: scrollStrategy,
                    modal: false
                };

                spyOn(scrollStrategy, 'initialize').and.callThrough();
                spyOn(scrollStrategy, 'attach').and.callThrough();
                spyOn(scrollStrategy, 'detach').and.callThrough();
                spyOn(overlay, 'show').and.callThrough();
                spyOn(overlay, 'hide').and.callThrough();

                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                expect(overlay.show).toHaveBeenCalledTimes(1);
                expect(overlay.hide).toHaveBeenCalledTimes(0);
                expect(scrollStrategy.attach).toHaveBeenCalledTimes(1);
                expect(scrollStrategy.initialize).toHaveBeenCalledTimes(1);
                expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
                expect(document.documentElement.scrollTop).toEqual(0);

                document.documentElement.scrollTop += scrollTolerance;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
                expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
                expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
                expect(overlay.hide).toHaveBeenCalledTimes(0);

                document.documentElement.scrollTop += scrollTolerance * 2;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(0);
                expect(scrollStrategy.detach).toHaveBeenCalledTimes(1);
                expect(overlay.hide).toHaveBeenCalledTimes(1);
            }));

        // 2.3 Scroll Strategy - NoOp.
        it('When scrolling, the component stays static and only the background scrolls', fakeAsync(() => {
            const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top: 200%; left: 90%; }'
                    ]
                }
            }).createComponent(EmptyPageComponent);
            const scrollTolerance = 10;
            const scrollStrategy = new NoOpScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: false,
                scrollStrategy: scrollStrategy,
                positionStrategy: new GlobalPositionStrategy()
            };

            spyOn(scrollStrategy, 'initialize').and.callThrough();
            spyOn(scrollStrategy, 'attach').and.callThrough();
            spyOn(scrollStrategy, 'detach').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
            expect(scrollStrategy.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrategy.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);

            const contentWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            const element = contentWrapper.firstChild as HTMLElement;
            const elementRect = element.getBoundingClientRect();

            document.documentElement.scrollTop += scrollTolerance;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
            expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
            expect(overlay.hide).toHaveBeenCalledTimes(0);
            expect(element.getBoundingClientRect()).toEqual(elementRect);
        }));

        it('Component persists open state (expanded DropDown remains expanded)', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const scrollTolerance = 10;
            const scrollStrategy = new BlockScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: false,
                scrollStrategy: scrollStrategy,
                positionStrategy: new GlobalPositionStrategy()
            };

            spyOn(scrollStrategy, 'initialize').and.callThrough();
            spyOn(scrollStrategy, 'attach').and.callThrough();
            spyOn(scrollStrategy, 'detach').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            const scrollSpy = spyOn<any>(scrollStrategy, 'onScroll').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(scrollStrategy.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrategy.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
            expect(overlay.hide).toHaveBeenCalledTimes(0);
            document.documentElement.scrollTop += scrollTolerance;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(scrollSpy).toHaveBeenCalledTimes(1);
            expect(overlay.hide).toHaveBeenCalledTimes(0);
            expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
        }));

        // 2.4. Scroll Strategy - Absolute.
        it('Scrolls everything except component.', fakeAsync(() => {
            // Should behave as NoOpScrollStrategy
            const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top:200%; left: 100%; }',
                    ]
                }
            }).createComponent(EmptyPageComponent);
            const scrollTolerance = 10;
            const scrollStrategy = new NoOpScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                closeOnOutsideClick: false,
                modal: false,
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: scrollStrategy
            };

            spyOn(scrollStrategy, 'initialize').and.callThrough();
            spyOn(scrollStrategy, 'attach').and.callThrough();
            spyOn(scrollStrategy, 'detach').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
            expect(scrollStrategy.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrategy.attach).toHaveBeenCalledTimes(1);

            const contentWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            const element = contentWrapper.firstChild as HTMLElement;
            const elementRect = element.getBoundingClientRect() as DOMRect;

            document.documentElement.scrollTop += scrollTolerance;
            document.dispatchEvent(new Event('scroll'));
            tick();
            const newElementRect = element.getBoundingClientRect() as DOMRect;
            expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
            expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
            expect(overlay.hide).toHaveBeenCalledTimes(0);
            expect(newElementRect.top).toEqual(elementRect.top);
        }));

        it('Components persist open state.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const scrollTolerance = 10;
            const scrollStrategy = new AbsoluteScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                closeOnOutsideClick: false,
                modal: false,
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrategy
            };

            spyOn(scrollStrategy, 'initialize').and.callThrough();
            spyOn(scrollStrategy, 'attach').and.callThrough();
            spyOn(scrollStrategy, 'detach').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            const scrollSpy = spyOn<any>(scrollStrategy, 'onScroll').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(scrollStrategy.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrategy.attach).toHaveBeenCalledTimes(1);

            document.documentElement.scrollTop += scrollTolerance;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(scrollSpy).toHaveBeenCalledTimes(1);
            expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
            expect(overlay.hide).toHaveBeenCalledTimes(0);
        }));

        // 3. Interaction
        // 3.1 Modal
        it('igx-overlay applies a greyed-out mask layers', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlaySettings: OverlaySettings = {
                modal: true,
            };

            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
            tick();
            const styles = css(overlayWrapper);
            const expectedBackgroundColor = 'background-color: rgba(0, 0, 0, 0.38)';
            const appliedBackgroundStyles = styles[3];
            expect(appliedBackgroundStyles).toContain(expectedBackgroundColor);
        }));

        it('Interaction is allowed only for the shown modal dialog component', fakeAsync(() => {
            // Utility handler meant for later detachment
            function _handler(event) {
                if (event.which === 1) {
                    fixture.detectChanges();
                    tick();
                    expect(button.click).toHaveBeenCalledTimes(0);
                    expect(button.onclick).toHaveBeenCalledTimes(0);
                    document.removeEventListener('click', _handler);
                    dummy.remove();
                }

                return event;
            }
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: true,
                closeOnOutsideClick: false,
                positionStrategy: new GlobalPositionStrategy()
            };
            const dummy = document.createElement('button');
            dummy.setAttribute('id', 'dummyButton');
            document.body.appendChild(dummy);
            const button = document.getElementById('dummyButton');

            button.addEventListener('click', _handler);

            spyOn(button, 'click').and.callThrough();
            spyOn(button, 'onclick').and.callThrough();
            spyOn(overlay, 'show').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(overlay.show).toHaveBeenCalledTimes(1);
            expect(overlay.hide).toHaveBeenCalledTimes(0);

            button.dispatchEvent(new MouseEvent('click'));
        }));

        it('Esc key closes the dialog.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                 modal: true,
                 positionStrategy: new GlobalPositionStrategy()
            };

            const targetButton = 'Escape';
            const escEvent = new KeyboardEvent('keydown', {
                key: targetButton
            });

            spyOn(overlay, 'show').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            let overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
            overlayWrapper.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.key === targetButton) {
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
                    expect(overlayWrapper).toBeFalsy();
                    expect(overlay.hide).toHaveBeenCalledTimes(1);
                }
            });
            tick();
            expect(overlayWrapper).toBeTruthy();
            expect(overlay.show).toHaveBeenCalledTimes(1);
            expect(overlay.hide).toHaveBeenCalledTimes(0);

            overlayWrapper.dispatchEvent(escEvent);
            tick();
        }));

        // Test fix for #1883 #1820
        it('Esc key closes the dialog in case there are other keys pressed prior to Esc.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                 modal: true,
                 positionStrategy: new GlobalPositionStrategy()
            };

            const escEvent = new KeyboardEvent('keydown', {
                key: 'Escape'
            });
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter'
            });
            const arrowUpEvent = new KeyboardEvent('keydown', {
                key: 'ArrowUp'
            });
            const aEvent = new KeyboardEvent('keydown', {
                key: 'a'
            });

            spyOn(overlay, 'show').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            let overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
            overlayWrapper.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
                    expect(overlayWrapper).toBeFalsy();
                    expect(overlay.hide).toHaveBeenCalledTimes(1);
                }
            });
            tick();
            expect(overlay.show).toHaveBeenCalledTimes(1);
            expect(overlay.hide).toHaveBeenCalledTimes(0);
            expect(overlayWrapper).toBeTruthy();

            overlayWrapper.dispatchEvent(enterEvent);
            overlayWrapper.dispatchEvent(aEvent);
            overlayWrapper.dispatchEvent(arrowUpEvent);
            overlayWrapper.dispatchEvent(escEvent);
        }));

        xit('Enter selects', () => {
            // Not TO DO
        });

        it('Clicking outside the dialog does not close it', fakeAsync(() => {
            const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top: 90%; left: 100%; }'
                    ]
                }
             }).createComponent(EmptyPageComponent);
             const overlay = fixture.componentInstance.overlay;
             const overlaySettings: OverlaySettings = {
                modal: true,
                closeOnOutsideClick: true,
                positionStrategy: new GlobalPositionStrategy()
             };

             spyOn(overlay, 'show').and.callThrough();
             spyOn(overlay, 'hide').and.callThrough();

             overlay.show(SimpleDynamicComponent, overlaySettings);
             tick();
             expect(overlay.show).toHaveBeenCalledTimes(1);
             expect(overlay.hide).toHaveBeenCalledTimes(0);

             fixture.componentInstance.buttonElement.nativeElement.click();
             tick();
             expect(overlay.hide).toHaveBeenCalledTimes(0);
        }));

        // 3.2 Non - Modal
        it('igx-overlay does not apply a greyed-out mask layer', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlaySettings: OverlaySettings = {
                modal: false,
            };

            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            tick();
            const styles = css(overlayWrapper);
            const expectedBackgroundColor = 'background-color: rgba(0, 0, 0, 0.38)';
            const appliedBackgroundStyles = styles[3];
            expect(appliedBackgroundStyles).not.toContain(expectedBackgroundColor);
        }));

        xit('Tab allows changing focus to other components/elements on the window which are not shown via the igx-overlay', () => {
            // Not TO DO
        });

        it('Clicking outside the component collapses/closes (DropDown, DatePicker, NavBar etc.)', fakeAsync(() => {
            const fixture = TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top: 90%; left: 100%; }'
                    ]
                }
            }).createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: false,
                closeOnOutsideClick: true,
                positionStrategy: new GlobalPositionStrategy()
            };

            spyOn(overlay, 'show').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(overlay.show).toHaveBeenCalledTimes(1);
            expect(overlay.hide).toHaveBeenCalledTimes(0);

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();
            expect(overlay.hide).toHaveBeenCalledTimes(1);
        }));

        it('Escape - does not close (DropDown, Dialog, etc.).', fakeAsync(() => {
            // Utility handler meant for later detachment
            function _handler(event) {
                if (event.key === targetButton) {
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                    expect(overlayWrapper).toBeTruthy();
                    expect(overlay.hide).toHaveBeenCalledTimes(0);
                    document.removeEventListener(targetEvent, _handler);
                }

                return event;
            }

            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: false,
                positionStrategy: new GlobalPositionStrategy()
            };
            const targetEvent = 'keydown';
            const targetButton = 'Escape';
            const escEvent = new KeyboardEvent(targetEvent, {
                key: targetButton
            });

            spyOn(overlay, 'show').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            let overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            overlayWrapper.addEventListener(targetEvent, _handler);

            expect(overlayWrapper).toBeTruthy();
            expect(overlay.show).toHaveBeenCalledTimes(1);
            expect(overlay.hide).toHaveBeenCalledTimes(0);

            overlayWrapper.dispatchEvent(escEvent);
        }));

        // 4. Css
        xit('Css should not leak: From igx-overlay to the inner components (greyed out modal).', () => {
            // TO DO
        });

        xit('Css should not leak: From shown components to igx-overlay.', () => {
            // TO DO
        });

        it('Components with 100% width/height should use their initial container\'s properties when placed inside of the overlay element',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(WidthTestOverlayComponent);
                fixture.detectChanges();
                expect(fixture.componentInstance.customComponent).toBeDefined();
                expect(fixture.componentInstance.customComponent.nativeElement.style.width).toEqual('100%');
                expect(fixture.componentInstance.customComponent.nativeElement.getBoundingClientRect().width).toEqual(420);
                expect(fixture.componentInstance.customComponent.nativeElement.style.height).toEqual('100%');
                expect(fixture.componentInstance.customComponent.nativeElement.getBoundingClientRect().height).toEqual(280);
                fixture.componentInstance.buttonElement.nativeElement.click();
                tick();
                const overlayContent = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
                const overlayChild = overlayContent.lastElementChild as HTMLElement;
                expect(overlayChild).toBeDefined();
                expect(overlayChild.style.width).toEqual('100%');
                expect(overlayChild.getBoundingClientRect().width).toEqual(420);
                expect(overlayChild.style.height).toEqual('100%');
                expect(overlayChild.getBoundingClientRect().height).toEqual(280);
                fixture.componentInstance.overlay.hideAll();
            }));
    });
});
@Component({
    template: '<div style=\'position: absolute; width:100px; height: 100px; background-color: red\'></div>'
})
export class SimpleDynamicComponent { }

@Component({
    template: '<div #item style=\'position: absolute; width:100px; height: 100px; background-color: red\'></div>'
})
export class SimpleRefComponent {
    @ViewChild('item')
    public item: ElementRef;

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }
}

@Component({
    template: '<div style=\'position: absolute; width:3000px; height: 1000px; background-color: red\'></div>'
})
export class SimpleBigSizeComponent { }

@Component({
    template: `
        <div igxToggle>
            <div class='scrollableDiv' *ngIf='visible' style=\'position: absolute; width: 200px; height: 200px;
                    overflow-y:scroll; background-color: red\'>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
            </div>
        </div>`
})
export class SimpleDynamicWithDirectiveComponent {
    public visible = false;

    @ViewChild(IgxToggleDirective)
    private _overlay: IgxToggleDirective;

    public get overlay(): IgxToggleDirective {
        return this._overlay;
    }

    show(overlaySettings?: OverlaySettings) {
        this.visible = true;
        this.overlay.open(overlaySettings);
    }

    hide() {
        this.visible = false;
        this.overlay.close();
    }
}

@Component({
    template: `<button #button (click)=\'click($event)\' class='button'>Show Overlay</button>`
})
export class EmptyPageComponent {
    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;

    click(event) {
        this.overlay.show(SimpleDynamicComponent);
    }
}

@Component({
    template: `<button #button (click)=\'click($event)\'>Show Overlay</button>`,
    styles: [`button {
        position: absolute;
        bottom: 0px;
        right: 0px;
        width: 84px;
        height: 84px;
        padding: 0px;
        margin: 0px;
        border: 0px;
    }`]
})
export class DownRightButtonComponent {
    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;

    public ButtonPositioningSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        target: null,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Top
    };
    click(event) {
        const positionStrategy = new AutoPositionStrategy(this.ButtonPositioningSettings);
        this.overlay.show(SimpleDynamicComponent, {
            positionStrategy: positionStrategy,
            scrollStrategy: new NoOpScrollStrategy(),
            modal: false,
            closeOnOutsideClick: false
        });
    }
}
@Component({
    template: `<button class='300_button' #button (click)=\'click($event)\'>Show Overlay</button>`,
    styles: [`button {
        position: absolute;
        top: 300px;
        left: 300px;
        width: 100px;
        height: 60px;
        border: 0px;
    }`]
})
export class TopLeftOffsetComponent {

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;
    click(event) {
        const positionStrategy = new ConnectedPositioningStrategy();
        this.overlay.show(SimpleDynamicComponent);
    }
}

@Component({
    template: `
    <div>
        <button class='buttonOne' (click)=\'clickOne($event)\'>Show first Overlay</button>
    </div>
    <div (click)=\'divClick($event)\'>
        <button class='buttonTwo' (click)=\'clickTwo($event)\'>Show second Overlay</button>
    </div>`
})
export class TwoButtonsComponent {
    private _setting: OverlaySettings = { modal: false };

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    clickOne() {
        this.overlay.show(SimpleDynamicComponent, this._setting);
    }

    clickTwo() {
        this.overlay.show(SimpleDynamicComponent, this._setting);
    }

    divClick(ev: Event) {
        ev.stopPropagation();
    }
}

@Component({
    template: `<div style="width: 420px; height: 280px;">
    <button class='300_button' igxToggle #button (click)=\'click($event)\'>Show Overlay</button>
        <div #myCustomComponent class="customList" style="width: 100%; height: 100%;">
            Some Content
        </div>
    <div>`,
    styles: [`button {
        position: absolute;
        top: 300px;
        left: 300px;
        width: 100px;
        height: 60px;
        border: 0px;
    }`]
})
export class WidthTestOverlayComponent {

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;
    @ViewChild('myCustomComponent') customComponent: ElementRef;
    click(event) {
        const overlaySettings: OverlaySettings = {
            positionStrategy: new ConnectedPositioningStrategy(),
            scrollStrategy: new NoOpScrollStrategy(),
            closeOnOutsideClick: true,
            modal: false
        };

        overlaySettings.positionStrategy.settings.target = this.buttonElement.nativeElement;
        this.overlay.show(this.customComponent, overlaySettings);
    }
}

@Component({
    template: `
    <div igxToggle>
        <div class='scrollableDiv' *ngIf='visible' style=\'width:200px; height:200px; overflow-y:scroll;\'>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
        </div>
    </div>`
})
export class ScrollableComponent {
    public visible = false;

    @ViewChild(IgxToggleDirective)
    private _toggle: IgxToggleDirective;

    public get toggle(): IgxToggleDirective {
        return this._toggle;
    }

    show() {
        this.visible = true;
        const settings: OverlaySettings = { scrollStrategy: new CloseScrollStrategy() };
        this.toggle.open(settings);
    }

    hide() {
        this.toggle.close();
        this.visible = false;
    }

}

@Component({
    template: `
    <div style=\'display:flex; width:100%; height:500px; justify-content:center;\'>
        <button #button style=\'display:inline-flex; width:150px; height:30px;\' (click)=\'click($event)\' class=\'button\'>
            Show Overlay
        </button>
    </div>
    `
})
export class FlexContainerComponent {
    public overlaySettings: OverlaySettings = {};
    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;
    click(event) {
        this.overlay.show(SimpleDynamicComponent, this.overlaySettings);
    }
}

const DYNAMIC_COMPONENTS = [
    EmptyPageComponent,
    SimpleRefComponent,
    SimpleDynamicComponent,
    SimpleBigSizeComponent,
    DownRightButtonComponent,
    TopLeftOffsetComponent,
    TwoButtonsComponent,
    WidthTestOverlayComponent,
    ScrollableComponent,
    FlexContainerComponent
];

const DIRECTIVE_COMPONENTS = [
    SimpleDynamicWithDirectiveComponent
];

@NgModule({
    imports: [BrowserModule],
    declarations: [DYNAMIC_COMPONENTS],
    exports: [DYNAMIC_COMPONENTS],
    entryComponents: [DYNAMIC_COMPONENTS]
})
export class DynamicModule { }
