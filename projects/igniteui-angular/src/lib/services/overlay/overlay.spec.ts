import {
    ApplicationRef,
    Component,
    ComponentRef,
    ElementRef,
    HostBinding,
    Inject,
    NgModule,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { fakeAsync, inject, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { scaleInVerTop, scaleOutVerTop } from '../../animations/main';
import { IgxAvatarComponent, IgxAvatarModule } from '../../avatar/avatar.component';
import { IgxCalendarComponent, IgxCalendarModule } from '../../calendar/public_api';
import { IgxCalendarContainerComponent } from '../../date-picker/calendar-container.component';
import { IgxDatePickerComponent, IgxDatePickerModule } from '../../date-picker/date-picker.component';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxOverlayOutletDirective, IgxToggleDirective, IgxToggleModule } from './../../directives/toggle/toggle.directive';
import { IgxOverlayService } from './overlay';
import { ContainerPositionStrategy } from './position';
import { AutoPositionStrategy } from './position/auto-position-strategy';
import { BaseFitPositionStrategy } from './position/base-fit-position-strategy';
import { ConnectedPositioningStrategy } from './position/connected-positioning-strategy';
import { ElasticPositionStrategy } from './position/elastic-position-strategy';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { IPositionStrategy } from './position/IPositionStrategy';
import { AbsoluteScrollStrategy } from './scroll/absolute-scroll-strategy';
import { BlockScrollStrategy } from './scroll/block-scroll-strategy';
import { CloseScrollStrategy } from './scroll/close-scroll-strategy';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import {
    HorizontalAlignment,
    OverlayCancelableEventArgs,
    OverlayEventArgs,
    OverlaySettings,
    Point,
    PositionSettings,
    Util,
    VerticalAlignment
} from './utilities';

const CLASS_OVERLAY_CONTENT = 'igx-overlay__content';
const CLASS_OVERLAY_CONTENT_MODAL = 'igx-overlay__content--modal';
const CLASS_OVERLAY_CONTENT_RELATIVE = 'igx-overlay__content--relative';
const CLASS_OVERLAY_WRAPPER = 'igx-overlay__wrapper';
const CLASS_OVERLAY_WRAPPER_MODAL = 'igx-overlay__wrapper--modal';
const CLASS_OVERLAY_WRAPPER_FLEX = 'igx-overlay__wrapper--flex';
const CLASS_OVERLAY_MAIN = 'igx-overlay';
const CLASS_SCROLLABLE_DIV = 'scrollableDiv';

// Utility function to get all applied to element css from all sources.
const css = (element) => {
    const sheets = document.styleSheets;
    const ret = [];
    element.matches =
        element.matches ||
        element.webkitMatchesSelector ||
        element.mozMatchesSelector ||
        element.msMatchesSelector ||
        element.oMatchesSelector;
    for (const key in sheets) {
        if (sheets.hasOwnProperty(key)) {
            const sheet = sheets[key];
            const rules: any = sheet.rules || sheet.cssRules;

            for (const r in rules) {
                if (element.matches(rules[r].selectorText)) {
                    ret.push(rules[r].cssText);
                }
            }
        }
    }
    return ret;
};

const addScrollDivToElement = (parent) => {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.width = '100px';
    scrollDiv.style.height = '100px';
    scrollDiv.style.top = '10000px';
    scrollDiv.style.left = '10000px';
    scrollDiv.style.position = 'absolute';
    parent.appendChild(scrollDiv);
};

/**
 * Returns the top left location of the shown element
 *
 * @param positionSettings Overlay setting to get location for
 * @param targetRect Rectangle of overlaySettings.target
 * @param wrapperRect Rectangle of shown element
 * @param screenRect Rectangle of the visible area
 * @param elastic Is elastic position strategy, defaults to false
 */
const getOverlayWrapperLocation = (
    positionSettings: PositionSettings,
    targetRect: ClientRect,
    wrapperRect: ClientRect,
    screenRect: ClientRect,
    elastic = false): Point => {
    const location: Point = new Point(0, 0);

    location.x =
        targetRect.left +
        targetRect.width * (1 + positionSettings.horizontalStartPoint) +
        wrapperRect.width * positionSettings.horizontalDirection;
    if (location.x < screenRect.left) {
        if (elastic) {
            let offset = screenRect.left - location.x;
            if (offset > wrapperRect.width - positionSettings.minSize.width) {
                offset = wrapperRect.width - positionSettings.minSize.width;
            }
            location.x += offset;
        } else {
            const flipOffset = wrapperRect.width * (1 + positionSettings.horizontalDirection);
            if (positionSettings.horizontalStartPoint === HorizontalAlignment.Left) {
                location.x = Math.max(0, targetRect.right - flipOffset);
            } else if (positionSettings.horizontalStartPoint === HorizontalAlignment.Center) {
                location.x =
                    Math.max(0, targetRect.left + targetRect.width / 2 - flipOffset);
            } else {
                location.x = Math.max(0, targetRect.left - flipOffset);
            }
        }
    } else if (location.x + wrapperRect.width > screenRect.right && !elastic) {
        const flipOffset = wrapperRect.width * (1 + positionSettings.horizontalDirection);
        if (positionSettings.horizontalStartPoint === HorizontalAlignment.Left) {
            location.x = Math.min(screenRect.right, targetRect.right - flipOffset);
        } else if (positionSettings.horizontalStartPoint === HorizontalAlignment.Center) {
            location.x = Math.min(screenRect.right, targetRect.left + targetRect.width / 2 - flipOffset);
        } else {
            location.x = Math.min(screenRect.right, targetRect.left - flipOffset);
        }
    }

    location.y =
        targetRect.top +
        targetRect.height * (1 + positionSettings.verticalStartPoint) +
        wrapperRect.height * positionSettings.verticalDirection;
    if (location.y < screenRect.top) {
        if (elastic) {
            let offset = screenRect.top - location.y;
            if (offset > wrapperRect.height - positionSettings.minSize.height) {
                offset = wrapperRect.height - positionSettings.minSize.height;
            }
            location.y += offset;
        } else {
            const flipOffset = wrapperRect.height * (1 + positionSettings.verticalDirection);
            if (positionSettings.verticalStartPoint === VerticalAlignment.Top) {
                location.y = Math.max(0, targetRect.bottom - flipOffset);
            } else if (positionSettings.verticalStartPoint === VerticalAlignment.Middle) {
                location.y = Math.max(0, targetRect.top + targetRect.height / 2 - flipOffset);
            } else {
                location.y = Math.max(0, targetRect.top - flipOffset);
            }
        }
    } else if (location.y + wrapperRect.height > screenRect.bottom && !elastic) {
        const flipOffset = wrapperRect.height * (1 + positionSettings.verticalDirection);
        if (positionSettings.verticalStartPoint === VerticalAlignment.Top) {
            location.y = Math.min(screenRect.bottom, targetRect.bottom - flipOffset);
        } else if (positionSettings.verticalStartPoint === VerticalAlignment.Middle) {
            location.y = Math.min(screenRect.bottom, targetRect.top + targetRect.height / 2 - flipOffset);
        } else {
            location.y = Math.min(screenRect.bottom, targetRect.top - flipOffset);
        }
    }
    return location;
};

/**
 * Formats a string according to the given formatters
 *
 * @param inputString String to be formatted
 * @param formatters Each formatter should include regex expressions and replacements to be applied on the inputString
 */
const formatString = (inputString: string, formatters: any[]) => {
    formatters.forEach(formatter => inputString = inputString.replace(formatter.pattern, formatter.replacement));
    return inputString;
};

describe('igxOverlay', () => {
    const formatters = [
        { pattern: /:\s/g, replacement: ':' },
        { pattern: /red;/, replacement: 'red' }
    ];
    beforeEach(waitForAsync(() => {
        UIInteractions.clearOverlay();
    }));

    afterAll(() => {
        UIInteractions.clearOverlay();
    });

    const verifyOverlayMargins = (overlaySettings: OverlaySettings, overlay: IgxOverlayService, fix, expectedMargin) => {
        overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
        tick();
        fix.detectChanges();
        const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
        const overlayContent = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
        const overlayElement = overlayContent.children[0];
        const wrapperMargin = window.getComputedStyle(overlayWrapper, null).getPropertyValue('margin');
        const contentMargin = window.getComputedStyle(overlayContent, null).getPropertyValue('margin');
        const elementMargin = window.getComputedStyle(overlayElement, null).getPropertyValue('margin');
        expect(wrapperMargin).toEqual(expectedMargin);
        expect(contentMargin).toEqual(expectedMargin);
        expect(elementMargin).toEqual(expectedMargin);
        overlay.hideAll();
    };

    describe('Pure Unit Test', () => {
        configureTestSuite();
        let mockElement: any;
        let mockElementRef: any;
        let mockFactoryResolver: any;
        let mockApplicationRef: any;
        let mockInjector: any;
        let mockAnimationBuilder: any;
        let mockDocument: any;
        let mockNgZone: any;
        let mockPlatformUtil: any;
        let overlay: IgxOverlayService;
        beforeEach(() => {
            mockElement = {
                style: { visibility: '', cursor: '', transitionDuration: '' },
                children: [],
                classList: { add: () => { }, remove: () => { } },
                appendChild(element: any) {
                    this.children.push(element);
                },
                removeChild(element: any) {
                    const index = this.children.indexOf(element);
                    if (index !== -1) {
                        this.children.splice(index, 1);
                    }
                },
                addEventListener: () => { },
                removeEventListener: () => { },
                getBoundingClientRect: () => ({ width: 10, height: 10 }),
                insertBefore(newChild: HTMLDivElement, refChild: Node) {
                    let refIndex = this.children.indexOf(refChild);
                    if (refIndex === -1) {
                        refIndex = 0;
                    }
                    this.children.splice(refIndex, 0, newChild);
                },
                contains(element: any) {
                    return this.children.indexOf(element) !== -1;
                }
            };
            mockElement.parent = mockElement;
            mockElement.parentElement = mockElement;
            mockElement.parentNode = mockElement;
            mockElementRef = { nativeElement: mockElement };
            mockFactoryResolver = {
                resolveComponentFactory: () => ({
                    create: () => ({
                                hostView: '',
                                location: mockElementRef,
                                changeDetectorRef: { detectChanges: () => { } },
                                destroy: () => { }
                            })
                    })
            };
            mockApplicationRef = { attachView: () => { }, detachView: () => { } };
            mockInjector = {};
            mockAnimationBuilder = {};
            mockDocument = {
                body: mockElement,
                listeners: { },
                defaultView: mockElement,
                // this is used be able to properly invoke rxjs `fromEvent` operator, which, turns out
                // just adds an event listener to the element and emits accordingly
                dispatchEvent(event: KeyboardEvent) {
                    const type = event.type;
                    if (this.listeners[type]) {
                        this.listeners[type].forEach(listener => {
                            listener(event);
                        });
                    }
                },
                createElement: () => mockElement,
                appendChild: () => { },
                addEventListener(type: string, listener: (this: HTMLElement, ev: MouseEvent) => any) {
                    if (!this.listeners[type]) {
                        this.listeners[type] = [];
                    }
                    this.listeners[type].push(listener);
                },
                removeEventListener(type: string, listener: (this: HTMLElement, ev: MouseEvent) => any) {
                    if (this.listeners[type]) {
                        const index = this.listeners[type].indexOf(listener);
                        if (index !== -1) {
                            this.listeners[type].splice(index, 1);
                        }
                    }
                }
            };
            mockNgZone = {};
            mockPlatformUtil = { isIOS: false };

            overlay = new IgxOverlayService(
                mockFactoryResolver, mockApplicationRef, mockInjector, mockAnimationBuilder, mockDocument, mockNgZone, mockPlatformUtil);
        });

        it('Should set cursor to pointer on iOS', () => {
            mockPlatformUtil.isIOS = true;
            mockDocument.body.style.cursor = 'initialCursorValue';

            const mockOverlaySettings: OverlaySettings = {
                modal: false,
                positionStrategy: new GlobalPositionStrategy({ openAnimation: null, closeAnimation: null })
            };
            let id = overlay.attach(mockElementRef, mockOverlaySettings);

            overlay.show(id);
            expect(mockDocument.body.style.cursor).toEqual('pointer');

            overlay.hide(id);
            overlay.detach(id);
            expect(mockDocument.body.style.cursor).toEqual('initialCursorValue');

            mockPlatformUtil.isIOS = false;
            id = overlay.attach(mockElementRef, mockOverlaySettings);

            overlay.show(id);
            expect(mockDocument.body.style.cursor).toEqual('initialCursorValue');

            overlay.hide(id);
            overlay.detach(id);
            expect(mockDocument.body.style.cursor).toEqual('initialCursorValue');
        });

        it('Should clear listener for escape key when overlay settings have outlet specified', () => {
            const mockOverlaySettings: OverlaySettings = {
                modal: false,
                closeOnEscape: true,
                outlet: mockElement,
                positionStrategy: new GlobalPositionStrategy({ openAnimation: null, closeAnimation: null })
            };
            const id = overlay.attach(mockElementRef, mockOverlaySettings);

            // show the overlay
            overlay.show(id);

            // expect escape listener to be added to document
            expect(mockDocument.listeners['keydown'].length > 0).toBeTruthy();
            const keydownListener = mockDocument.listeners['keydown'][0];

            spyOn(overlay, 'hide').and.callThrough();
            spyOn(mockDocument, 'removeEventListener').and.callThrough();

            mockDocument.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

            // expect hide to have been called
            expect(overlay.hide).toHaveBeenCalledTimes(1);
            expect(mockDocument.removeEventListener).not.toHaveBeenCalled();

            overlay.detach(id);
            expect(mockDocument.removeEventListener).toHaveBeenCalled();

            // the keydown listener is now removed
            expect(mockDocument.removeEventListener).toHaveBeenCalledWith('keydown', keydownListener, undefined);

            // fire event again, expecting hide NOT to be fired again
            mockDocument.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            expect(overlay.hide).toHaveBeenCalledTimes(1);
            expect(mockDocument.listeners['keydown'].length).toBe(0);
        });
    });

    describe('Unit Tests: ', () => {
        configureTestSuite();
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [IgxToggleModule, DynamicModule, NoopAnimationsModule],
                declarations: DIRECTIVE_COMPONENTS
            }).compileComponents();
        }));

        it('OverlayElement should return a div attached to Document\'s body.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();
            const overlayDiv = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv).toHaveClass(CLASS_OVERLAY_MAIN);
        }));

        it('Should attach to setting target or default to body', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const button = fixture.componentInstance.buttonElement;
            const overlay = fixture.componentInstance.overlay;
            fixture.detectChanges();

            let id = overlay.attach(SimpleDynamicComponent, { outlet: button, modal: false });
            overlay.show(id);
            tick();

            let wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement).toBeDefined();
            expect(wrapperElement.parentNode).toBe(button.nativeElement);
            overlay.detach(id);
            tick();

            id = overlay.attach(SimpleDynamicComponent, { modal: false });
            overlay.show(id);
            tick();
            wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement).toBeDefined();
            expect(wrapperElement.parentElement.classList).toContain(CLASS_OVERLAY_MAIN);
            expect(wrapperElement.parentElement.parentElement).toBe(document.body);
            overlay.detach(id);
            tick();

            const outlet = document.createElement('div');
            fixture.debugElement.nativeElement.appendChild(outlet);
            id = overlay.attach(SimpleDynamicComponent, { modal: false, outlet: new IgxOverlayOutletDirective(new ElementRef(outlet)) });
            overlay.show(id);
            tick();
            wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement).toBeDefined();
            expect(wrapperElement.parentNode).toBe(outlet);
        }));

        it('Should show component passed to overlay.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();

            const overlayElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayElement).toBeDefined();
            expect(overlayElement.children.length).toEqual(1);

            const wrapperElement = overlayElement.children[0];
            expect(wrapperElement).toBeDefined();
            expect(wrapperElement).toHaveClass(CLASS_OVERLAY_WRAPPER_MODAL);
            expect(wrapperElement.children[0].localName).toEqual('div');

            const contentElement = wrapperElement.children[0];
            expect(contentElement).toBeDefined();
            expect(contentElement).toHaveClass(CLASS_OVERLAY_CONTENT_MODAL);
        }));

        it('Should hide component and the overlay when Hide() is called.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;

            overlay.show(overlay.attach(SimpleDynamicComponent));
            tick();

            overlay.show(overlay.attach(SimpleDynamicComponent));
            tick();

            let overlayDiv = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(2);
            expect((overlayDiv.children[0] as HTMLElement).style.visibility).toEqual('');
            expect((overlayDiv.children[1] as HTMLElement).style.visibility).toEqual('');

            overlay.hide('0');
            tick();

            overlayDiv = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect((overlayDiv.children[0] as HTMLElement).style.visibility).toEqual('hidden');
            expect((overlayDiv.children[1] as HTMLElement).style.visibility).toEqual('');

            overlay.hide('1');
            tick();

            overlayDiv = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect((overlayDiv.children[0] as HTMLElement).style.visibility).toEqual('hidden');
            expect((overlayDiv.children[1] as HTMLElement).style.visibility).toEqual('hidden');
        }));

        it('Should hide all components and the overlay when HideAll() is called.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlay = fixture.componentInstance.overlay;

            overlay.show(overlay.attach(SimpleDynamicComponent));
            overlay.show(overlay.attach(SimpleDynamicComponent));
            tick();
            fixture.detectChanges();

            let overlayDiv = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(2);
            expect((overlayDiv.children[0] as HTMLElement).style.visibility).toEqual('');
            expect((overlayDiv.children[1] as HTMLElement).style.visibility).toEqual('');

            overlay.hideAll();
            tick();
            overlayDiv = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect((overlayDiv.children[0] as HTMLElement).style.visibility).toEqual('hidden');
            expect((overlayDiv.children[1] as HTMLElement).style.visibility).toEqual('hidden');
        }));

        it('Should show and hide component via directive.', fakeAsync(() => {
            const fixture = TestBed.createComponent(SimpleDynamicWithDirectiveComponent);
            fixture.detectChanges();
            fixture.componentInstance.show();
            tick();

            let overlayDiv = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('div');

            fixture.componentInstance.hide();
            tick();
            overlayDiv = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayDiv).toBeUndefined();
        }));

        it('Should properly emit events.', fakeAsync(() => {
            const fixture = TestBed.createComponent(SimpleRefComponent);
            fixture.detectChanges();
            const overlayInstance = fixture.componentInstance.overlay;
            spyOn(overlayInstance.onClosed, 'emit');
            spyOn(overlayInstance.onClosing, 'emit');
            spyOn(overlayInstance.onOpened, 'emit');
            spyOn(overlayInstance.onAppended, 'emit');
            spyOn(overlayInstance.onOpening, 'emit');
            spyOn(overlayInstance.onAnimation, 'emit');

            const firstCallId = overlayInstance.attach(SimpleDynamicComponent);
            overlayInstance.show(firstCallId);
            tick();

            expect(overlayInstance.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onOpening.emit)
                .toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef) as any, cancel: false });
            const args: OverlayEventArgs = (overlayInstance.onOpening.emit as jasmine.Spy).calls.mostRecent().args[0];
            expect(args.componentRef.instance).toEqual(jasmine.any(SimpleDynamicComponent));
            expect(overlayInstance.onAppended.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onAnimation.emit).toHaveBeenCalledTimes(1);

            tick();
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef) as any });
            overlayInstance.hide(firstCallId);

            tick();
            expect(overlayInstance.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onClosing.emit)
                .toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef) as any, cancel: false, event: undefined });
            expect(overlayInstance.onAnimation.emit).toHaveBeenCalledTimes(2);

            tick();
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onClosed.emit).
                toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef) as any, event: undefined });

            const secondCallId = overlayInstance.attach(fixture.componentInstance.item);
            overlayInstance.show(secondCallId);
            tick();
            expect(overlayInstance.onOpening.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onOpening.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId, cancel: false });
            expect(overlayInstance.onAppended.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onAnimation.emit).toHaveBeenCalledTimes(3);

            tick();
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId });

            overlayInstance.hide(secondCallId);
            tick();
            expect(overlayInstance.onClosing.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onClosing.emit).
                toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId, cancel: false, event: undefined });
            expect(overlayInstance.onAnimation.emit).toHaveBeenCalledTimes(4);

            tick();
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId, event: undefined });
        }));

        it('Should properly set style on position method call - GlobalPosition.', () => {
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

            const mockDirection: string[] = ['flex-start', 'center', 'flex-end'];

            for (let i = 0; i < mockDirection.length; i++) {
                for (let j = 0; j < mockDirection.length; j++) {
                    mockPositioningSettings1.horizontalDirection = HorizontalAlignment[horAl[i]];
                    mockPositioningSettings1.verticalDirection = VerticalAlignment[verAl[j]];
                    const globalStrat1 = new GlobalPositionStrategy(mockPositioningSettings1);
                    globalStrat1.position(mockItem);
                    expect(mockParent.style.justifyContent).toEqual(mockDirection[i]);
                    expect(mockParent.style.alignItems).toEqual(mockDirection[j]);
                }
            }
        });

        it('Should properly set style on position method call - ConnectedPosition.', () => {
            const top = 0;
            const left = 0;
            const width = 200;
            const right = 200;
            const height = 200;
            const bottom = 200;
            const mockElement = document.createElement('div');
            spyOn(mockElement, 'getBoundingClientRect').and.callFake(() => ({
                    left, top, width, height, right, bottom
                } as DOMRect));

            const mockItem = document.createElement('div');
            mockElement.append(mockItem);
            spyOn(mockItem, 'getBoundingClientRect').and.callFake(() => new DOMRect(top, left, width, height));

            const mockPositioningSettings1: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const connectedStrat1 = new ConnectedPositioningStrategy(mockPositioningSettings1);
            connectedStrat1.position(mockItem, { width, height }, null, false, mockItem);
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            connectedStrat1.settings.horizontalStartPoint = HorizontalAlignment.Center;
            connectedStrat1.position(mockItem, { width, height }, null, false, mockItem);
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('100px');

            connectedStrat1.settings.horizontalStartPoint = HorizontalAlignment.Right;
            connectedStrat1.position(mockItem, { width, height }, null, false, mockItem);
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('200px');

            connectedStrat1.settings.verticalStartPoint = VerticalAlignment.Middle;
            connectedStrat1.position(mockItem, { width, height }, null, false, mockItem);
            expect(mockItem.style.top).toEqual('100px');
            expect(mockItem.style.left).toEqual('200px');

            connectedStrat1.settings.verticalStartPoint = VerticalAlignment.Bottom;
            connectedStrat1.position(mockItem, { width, height }, null, false, mockItem);
            expect(mockItem.style.top).toEqual('200px');
            expect(mockItem.style.left).toEqual('200px');

            // If target is Point
            connectedStrat1.position(mockItem, { width, height }, null, false, new Point(0, 0));
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            // If target is not point or html element, should fallback to new Point(0,0)
            connectedStrat1.position(mockItem, { width, height }, null, false, 'g' as any);
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');
        });

        it('Should properly call position method - AutoPosition.', () => {
            spyOn(BaseFitPositionStrategy.prototype, 'position');
            spyOn<any>(ConnectedPositioningStrategy.prototype, 'setStyle');
            const mockDiv = document.createElement('div');
            const autoStrat1 = new AutoPositionStrategy();
            autoStrat1.position(mockDiv, null, document, false);
            expect(BaseFitPositionStrategy.prototype.position).toHaveBeenCalledTimes(1);
            expect(BaseFitPositionStrategy.prototype.position).toHaveBeenCalledWith(mockDiv, null, document, false);

            const autoStrat2 = new AutoPositionStrategy();
            autoStrat2.position(mockDiv, null, document, false);
            expect(BaseFitPositionStrategy.prototype.position).toHaveBeenCalledTimes(2);

            const autoStrat3 = new AutoPositionStrategy();
            autoStrat3.position(mockDiv, null, document, false);
            expect(BaseFitPositionStrategy.prototype.position).toHaveBeenCalledTimes(3);
        });

        it('Should properly call position method - ElasticPosition.', () => {
            spyOn(BaseFitPositionStrategy.prototype, 'position');
            spyOn<any>(ConnectedPositioningStrategy.prototype, 'setStyle');
            const mockDiv = document.createElement('div');
            const autoStrat1 = new ElasticPositionStrategy();

            autoStrat1.position(mockDiv, null, document, false);
            expect(BaseFitPositionStrategy.prototype.position).toHaveBeenCalledTimes(1);
            expect(BaseFitPositionStrategy.prototype.position).toHaveBeenCalledWith(mockDiv, null, document, false);

            const autoStrat2 = new ElasticPositionStrategy();
            autoStrat2.position(mockDiv, null, document, false);
            expect(BaseFitPositionStrategy.prototype.position).toHaveBeenCalledTimes(2);

            const autoStrat3 = new ElasticPositionStrategy();
            autoStrat3.position(mockDiv, null, document, false);
            expect(BaseFitPositionStrategy.prototype.position).toHaveBeenCalledTimes(3);
        });

        it('Should properly call setOffset method', fakeAsync(() => {
            const fixture = TestBed.createComponent(WidthTestOverlayComponent);
            const overlayInstance = fixture.componentInstance.overlay;
            const id = fixture.componentInstance.overlay.attach(SimpleRefComponent);

            overlayInstance.show(id);
            fixture.detectChanges();
            tick();

            overlayInstance.setOffset(id, 40, 40);
            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT_MODAL)[0] as HTMLElement;
            const componentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName('simpleRef')[0] as HTMLElement;
            const contentElementRect = contentElement.getBoundingClientRect();
            const componentElementRect = componentElement.getBoundingClientRect();
            let overlayContentTransform = contentElement.style.transform;
            const firstTransform = 'translate(40px, 40px)';
            const secondTransform = 'translate(30px, 60px)';

            expect(contentElementRect.top).toEqual(componentElementRect.top);
            expect(contentElementRect.left).toEqual(componentElementRect.left);
            expect(overlayContentTransform).toEqual(firstTransform);

            // Set the offset again and verify it is changed correctly
            overlayInstance.setOffset(id, -10, 20);
            fixture.detectChanges();
            tick();
            const contentElementRectNew = contentElement.getBoundingClientRect();
            const componentElementRectNew = componentElement.getBoundingClientRect();
            overlayContentTransform = contentElement.style.transform;

            expect(contentElementRectNew.top).toEqual(componentElementRectNew.top);
            expect(contentElementRectNew.left).toEqual(componentElementRectNew.left);

            expect(contentElementRectNew.top).not.toEqual(contentElementRect.top);
            expect(contentElementRectNew.left).not.toEqual(contentElementRect.left);

            expect(componentElementRectNew.top).not.toEqual(componentElementRect.top);
            expect(componentElementRectNew.left).not.toEqual(componentElementRect.left);
            expect(overlayContentTransform).toEqual(secondTransform);
        }));

        it('#1690 - click on second filter does not close first one.', fakeAsync(() => {
            const fixture = TestBed.createComponent(TwoButtonsComponent);
            const button1 = fixture.nativeElement.getElementsByClassName('buttonOne')[0];
            const button2 = fixture.nativeElement.getElementsByClassName('buttonTwo')[0];

            button1.click();
            tick();

            const overlayDiv = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            const wrapperElement1 = overlayDiv.children[0] as HTMLElement;
            expect(wrapperElement1.style.visibility).toEqual('');

            button2.click();
            tick();
            const wrapperElement2 = overlayDiv.children[1] as HTMLElement;
            expect(wrapperElement1.style.visibility).toEqual('');
            expect(wrapperElement2.style.visibility).toEqual('');
        }));

        it('#1692 - scroll strategy closes overlay when shown component is scrolled.', fakeAsync(() => {
            const fixture = TestBed.createComponent(SimpleDynamicWithDirectiveComponent);
            const overlaySettings: OverlaySettings = { scrollStrategy: new CloseScrollStrategy() };
            fixture.componentInstance.show(overlaySettings);
            tick();

            let overlayElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayElement).toBeDefined();

            const scrollableDiv = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_SCROLLABLE_DIV)[0] as HTMLElement;
            scrollableDiv.scrollTop += 5;
            scrollableDiv.dispatchEvent(new Event('scroll'));
            tick();

            overlayElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayElement).toBeDefined();

            scrollableDiv.scrollTop += 100;
            scrollableDiv.dispatchEvent(new Event('scroll'));
            tick();

            overlayElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayElement).toBeDefined();
            fixture.componentInstance.hide();
        }));

        // TODO: refactor utilities to include all exported methods in a class
        it('#1799 - content div should reposition on window resize.', fakeAsync(() => {
            const rect: ClientRect = {
                bottom: 50,
                height: 0,
                left: 50,
                right: 50,
                top: 50,
                width: 0
            };
            const getPointSpy = spyOn(Util, 'getTargetRect').and.returnValue(rect);
            const fixture = TestBed.createComponent(FlexContainerComponent);
            fixture.detectChanges();
            const overlayInstance = fixture.componentInstance.overlay;
            const buttonElement: HTMLElement = fixture.componentInstance.buttonElement.nativeElement;

            const id = overlayInstance.attach(
                SimpleDynamicComponent,
                { positionStrategy: new ConnectedPositioningStrategy({ target: buttonElement }) });
            overlayInstance.show(id);
            tick();

            let contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT_MODAL)[0] as HTMLElement;
            let contentRect = contentElement.getBoundingClientRect();

            expect(50).toEqual(contentRect.left);
            expect(50).toEqual(contentRect.top);

            rect.left = 200;
            rect.right = 200;
            rect.top = 200;
            rect.bottom = 200;
            getPointSpy.and.callThrough().and.returnValue(rect);
            window.resizeBy(200, 200);
            window.dispatchEvent(new Event('resize'));
            tick();

            contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT_MODAL)[0] as HTMLElement;
            contentRect = contentElement.getBoundingClientRect();
            expect(200).toEqual(contentRect.left);
            expect(200).toEqual(contentRect.top);

            overlayInstance.hide(id);
        }));

        it('#2475 - An error is thrown for IgxOverlay when showing a component' +
            'instance that is not attached to the DOM', fakeAsync(() => {
                const fixture = TestBed.createComponent(SimpleRefComponent);
                fixture.detectChanges();
                const overlay = fixture.componentInstance.overlay;

                // remove SimpleRefComponent HTML element from the DOM tree
                fixture.elementRef.nativeElement.parentElement.removeChild(fixture.elementRef.nativeElement);
                overlay.show(overlay.attach(fixture.elementRef));
                tick();

                const componentElement = fixture.nativeElement as HTMLElement;
                expect(componentElement).toBeDefined();

                const contentElement = componentElement.parentElement;
                expect(contentElement).toBeDefined();
                expect(contentElement).toHaveClass(CLASS_OVERLAY_CONTENT_MODAL);
                expect(contentElement).toHaveClass(CLASS_OVERLAY_CONTENT_RELATIVE);

                const wrapperElement = contentElement.parentElement;
                expect(wrapperElement).toBeDefined();
                expect(wrapperElement).toHaveClass(CLASS_OVERLAY_WRAPPER_MODAL);
                expect(wrapperElement).toHaveClass(CLASS_OVERLAY_WRAPPER_FLEX);

                const overlayElement = wrapperElement.parentElement;
                expect(overlayElement).toBeDefined();
                expect(overlayElement).toHaveClass(CLASS_OVERLAY_MAIN);
            }));

        it('#2486 - filtering dropdown is not correctly positioned', fakeAsync(() => {
            const fixture = TestBed.createComponent(WidthTestOverlayComponent);
            fixture.debugElement.nativeElement.style.transform = 'translatex(100px)';

            fixture.detectChanges();
            tick();

            fixture.componentInstance.overlaySettings.outlet = fixture.componentInstance.elementRef;

            const buttonElement: HTMLElement = fixture.componentInstance.buttonElement.nativeElement;
            buttonElement.click();

            fixture.detectChanges();
            tick();

            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement.getBoundingClientRect().left).toBe(100);
            expect(fixture.componentInstance.customComponent.nativeElement.getBoundingClientRect().left).toBe(400);
        }));

        it('#2798 - Allow canceling of open and close of IgxDropDown through onOpening and onClosing events', fakeAsync(() => {
            const fixture = TestBed.createComponent(SimpleRefComponent);
            fixture.detectChanges();
            const overlayInstance = fixture.componentInstance.overlay;

            overlayInstance.onClosing.subscribe((e: OverlayCancelableEventArgs) => {
                e.cancel = true;
            });

            spyOn(overlayInstance.onClosed, 'emit').and.callThrough();
            spyOn(overlayInstance.onClosing, 'emit').and.callThrough();
            spyOn(overlayInstance.onOpened, 'emit').and.callThrough();
            spyOn(overlayInstance.onOpening, 'emit').and.callThrough();

            const firstCallId = overlayInstance.attach(SimpleDynamicComponent);
            overlayInstance.show(firstCallId);
            tick();

            expect(overlayInstance.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledTimes(1);

            overlayInstance.hide(firstCallId);
            tick();

            expect(overlayInstance.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledTimes(0);

            overlayInstance.onOpening.subscribe((e: OverlayCancelableEventArgs) => {
                e.cancel = true;
            });

            overlayInstance.show(firstCallId);
            tick();

            expect(overlayInstance.onOpening.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledTimes(1);
        }));

        it('#3673 - Should not close dropdown in dropdown', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const button = fixture.componentInstance.buttonElement;
            const overlay = fixture.componentInstance.overlay;
            fixture.detectChanges();

            const overlaySettings: OverlaySettings = {
                target: button.nativeElement,
                positionStrategy: new ConnectedPositioningStrategy(),
                modal: false,
                closeOnOutsideClick: true
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            overlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Right;
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            fixture.detectChanges();
            tick();

            let overlayElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayElement).toBeDefined();
            expect(overlayElement.childElementCount).toEqual(2);
            expect((overlayElement.children[0] as HTMLElement).style.visibility).toEqual('');
            expect((overlayElement.children[1] as HTMLElement).style.visibility).toEqual('');

            (overlay as any)._overlayInfos[0].elementRef.nativeElement.click();
            fixture.detectChanges();
            tick();

            overlayElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayElement.childElementCount).toEqual(2);
            expect((overlayElement.children[0] as HTMLElement).style.visibility).toEqual('');
            expect((overlayElement.children[1] as HTMLElement).style.visibility).toEqual('hidden');
        }));

        it('#3743 - Reposition correctly resized element.', () => {
            const fixture = TestBed.createComponent(TopLeftOffsetComponent);
            fixture.detectChanges();

            const componentElement = document.createElement('div');
            componentElement.setAttribute('style', 'width:100px; height:100px; color:green; border: 1px solid blue;');
            const contentElement = document.createElement('div');
            contentElement.classList.add('contentWrapper');
            contentElement.classList.add('no-height');
            contentElement.setAttribute('style', 'width:100px; position: absolute;');
            contentElement.appendChild(componentElement);
            const wrapperElement = document.createElement('div');
            wrapperElement.setAttribute('style', 'position: fixed; width: 100%; height: 100%; top: 0; left: 0;');
            wrapperElement.appendChild(contentElement);
            document.body.appendChild(wrapperElement);

            const targetElement: HTMLElement = fixture.componentInstance.buttonElement.nativeElement;

            fixture.detectChanges();
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Left,
                verticalDirection: VerticalAlignment.Top,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const strategy = new ConnectedPositioningStrategy(positionSettings);
            strategy.position(contentElement, null, null, true, targetElement);
            fixture.detectChanges();

            const targetRect = targetElement.getBoundingClientRect();
            let contentElementRect = contentElement.getBoundingClientRect();
            expect(targetRect.top).toBe(contentElementRect.bottom);
            expect(targetRect.left).toBe(contentElementRect.right);

            componentElement.setAttribute('style', 'width:100px; height:50px; color:green; border: 1px solid blue;');
            strategy.position(contentElement, null, null, false, targetElement);
            fixture.detectChanges();
            contentElementRect = contentElement.getBoundingClientRect();
            expect(targetRect.top).toBe(contentElementRect.bottom);
            expect(targetRect.left).toBe(contentElementRect.right);

            componentElement.setAttribute('style', 'width:100px; height:500px; color:green; border: 1px solid blue;');
            strategy.position(contentElement, null, null, false, targetElement);
            fixture.detectChanges();
            contentElementRect = contentElement.getBoundingClientRect();
            expect(targetRect.top).toBe(contentElementRect.bottom);
            expect(targetRect.left).toBe(contentElementRect.right);

            document.body.removeChild(wrapperElement);
        });

        it('#3988 - Should use ngModuleRef to create component', inject([ApplicationRef], (appRef: ApplicationRef) => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            fixture.detectChanges();

            spyOn(appRef, 'attachView');
            const mockNativeElement = document.createElement('div');
            const mockComponent = {
                hostView: fixture.componentRef.hostView,
                changeDetectorRef: { detectChanges: () => { } },
                location: { nativeElement: mockNativeElement }
            };
            const factoryMock = jasmine.createSpyObj('factoryMock', {
                create: mockComponent
            });
            const injector = 'testInjector';
            const componentFactoryResolver = jasmine.createSpyObj('componentFactoryResolver', {
                resolveComponentFactory: factoryMock
            });

            const id = overlay.attach(SimpleDynamicComponent, {}, { componentFactoryResolver, injector } as any);
            expect(componentFactoryResolver.resolveComponentFactory).toHaveBeenCalledWith(SimpleDynamicComponent);
            expect(factoryMock.create).toHaveBeenCalledWith(injector);
            expect(appRef.attachView).toHaveBeenCalledWith(fixture.componentRef.hostView);
            expect(overlay.getOverlayById(id).componentRef as any).toBe(mockComponent);
        }));

        it('##6474 - should calculate correctly position', () => {
            const elastic: ElasticPositionStrategy = new ElasticPositionStrategy();
            const targetRect: ClientRect = {
                top: 100,
                bottom: 200,
                height: 100,
                left: 100,
                right: 200,
                width: 100
            };
            const elementRect: ClientRect = {
                top: 0,
                bottom: 300,
                height: 300,
                left: 0,
                right: 300,
                width: 300
            };
            const viewPortRect: ClientRect = {
                top: 1000,
                bottom: 1300,
                height: 300,
                left: 1000,
                right: 1300,
                width: 300
            };
            spyOn<any>(elastic, 'setStyle').and.returnValue({});
            spyOn(Util, 'getViewportRect').and.returnValue(viewPortRect);
            spyOn(Util, 'getTargetRect').and.returnValue(targetRect);

            const mockElement = jasmine.createSpyObj('HTMLElement', ['getBoundingClientRect']);
            spyOn(mockElement, 'getBoundingClientRect').and.returnValue(elementRect);
            mockElement.classList = { add: () => { } };
            mockElement.style = { width: '', height: '' };
            elastic.position(mockElement, null, null, true);

            expect(mockElement.style.width).toBe('200px');
            expect(mockElement.style.height).toBe('100px');
        });

        it('should close overlay on outside click when target is point, #8297', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            fixture.detectChanges();

            const overlaySettings: OverlaySettings = {
                modal: false,
                closeOnOutsideClick: true,
                positionStrategy: new ConnectedPositioningStrategy()
            };

            overlaySettings.target = new Point(10, 10);

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            fixture.detectChanges();

            let wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('');

            document.body.click();
            tick();
            fixture.detectChanges();

            wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('hidden');
        }));

        it('should correctly handle close on outside click in shadow DOM', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageInShadowDomComponent);
            const button = fixture.componentInstance.buttonElement;
            const outlet = fixture.componentInstance.outletElement;
            const overlay = fixture.componentInstance.overlay;
            fixture.detectChanges();

            const overlaySettings: OverlaySettings = {
                modal: false,
                closeOnOutsideClick: true,
                positionStrategy: new ConnectedPositioningStrategy(),
                target: button.nativeElement,
                outlet
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            fixture.detectChanges();

            const shadowRoot = fixture.nativeElement.shadowRoot;
            let wrapperElement = shadowRoot.querySelector(`.${CLASS_OVERLAY_WRAPPER}`) as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('');

            const componentElement = shadowRoot.querySelector('component') as HTMLElement;
            const toggledDiv = componentElement.children[0] as HTMLElement;
            toggledDiv.click();

            tick();
            fixture.detectChanges();

            wrapperElement = shadowRoot.querySelector(`.${CLASS_OVERLAY_WRAPPER}`) as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('');

            document.body.click();
            tick();
            fixture.detectChanges();

            wrapperElement = shadowRoot.querySelector(`.${CLASS_OVERLAY_WRAPPER}`) as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('hidden');
        }));
    });

    describe('Unit Tests - Scroll Strategies: ', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [IgxToggleModule, DynamicModule, NoopAnimationsModule],
                declarations: DIRECTIVE_COMPONENTS
            });
        }));
        afterAll(() => {
            TestBed.resetTestingModule();
        });
        it('Should properly initialize Scroll Strategy - Block.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                position: absolute,
                bottom: 200%;
            }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollStrat = new BlockScrollStrategy();
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
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
            document.dispatchEvent(new Event('scroll'));
            expect(scrollSpy).toHaveBeenCalledTimes(1);

            overlay.hide('0');
            overlay.detach('0');
            tick();
            expect(scrollStrat.detach).toHaveBeenCalledTimes(1);
        }));

        it('Should properly initialize Scroll Strategy - Absolute.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                position: absolute,
                bottom: 200%;
            }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollStrat = new AbsoluteScrollStrategy();
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
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
            document.dispatchEvent(new Event('scroll'));
            expect(scrollSpy).toHaveBeenCalledTimes(1);
            overlay.hide('0');
            overlay.detach('0');
            tick();
            expect(scrollStrat.detach).toHaveBeenCalledTimes(1);
        }));

        it('Should only call reposition once on scroll - Absolute.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                position: absolute,
                bottom: 200%;
            }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollStrat = new AbsoluteScrollStrategy();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrat,
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;
            const scrollSpy = spyOn<any>(scrollStrat, 'onScroll').and.callThrough();
            spyOn(overlay, 'reposition');
            const id = overlay.attach(SimpleDynamicComponent, overlaySettings);
            overlay.show(id);
            tick();

            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            contentElement.children[0].dispatchEvent(new Event('scroll'));
            expect(scrollSpy).toHaveBeenCalledTimes(1);
            expect(overlay.reposition).not.toHaveBeenCalled();

            document.dispatchEvent(new Event('scroll'));
            expect(scrollSpy).toHaveBeenCalledTimes(2);
            expect(overlay.reposition).toHaveBeenCalledTimes(1);
            expect(overlay.reposition).toHaveBeenCalledWith(id);

            overlay.hide(id);
            overlay.detach(id);
        }));

        it('Should properly initialize Scroll Strategy - Close.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                position: absolute,
                bottom: 200%;
            }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const scrollStrat = new CloseScrollStrategy();
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
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
            document.dispatchEvent(new Event('scroll'));

            expect(scrollSpy).toHaveBeenCalledTimes(1);
            overlay.hide('0');
            overlay.detach('0');
            tick();
            expect(scrollStrat.detach).toHaveBeenCalledTimes(1);
        }));
    });

    describe('Integration tests: ', () => {
        configureTestSuite();
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [IgxToggleModule, DynamicModule, NoopAnimationsModule],
                declarations: DIRECTIVE_COMPONENTS
            }).compileComponents();
        }));

        // 1. Positioning Strategies
        // 1.1 Global (show components in the window center - default).
        it('Should correctly render igx-overlay', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlay = fixture.componentInstance.overlay;

            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false,
                target: fixture.componentInstance.buttonElement.nativeElement
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new GlobalPositionStrategy(positionSettings);
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            fixture.detectChanges();
            const overlayElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            const wrapperElement = overlayElement.children[0];
            expect(wrapperElement).toHaveClass(CLASS_OVERLAY_WRAPPER);
        }));

        it('Should cover the whole window 100% width and height.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();

            fixture.detectChanges();
            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;

            const wrapperRect = wrapperElement.getBoundingClientRect();
            expect(wrapperRect.width).toEqual(window.innerWidth);
            expect(wrapperRect.height).toEqual(window.innerHeight);
            expect(wrapperRect.left).toEqual(0);
            expect(wrapperRect.top).toEqual(0);
        }));

        it('Should show the component inside the igx-overlay wrapper as a content last child.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlay = fixture.componentInstance.overlay;

            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            const componentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName('component')[0] as HTMLElement;
            expect(wrapperElement.nodeName).toEqual('DIV');
            expect(contentElement.nodeName).toEqual('DIV');
            expect(componentElement.nodeName).toEqual('COMPONENT');
        }));

        it('Should apply the corresponding inline css to the overlay wrapper div element for each alignment.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlay = fixture.componentInstance.overlay;

            const overlaySettings: OverlaySettings = {
                target: new Point(0, 0),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
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
                    const id = overlay.attach(SimpleDynamicComponent, overlaySettings);
                    overlay.show(id);
                    tick();

                    const wrapperElement = (fixture.nativeElement as HTMLElement)
                        .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
                    expect(wrapperElement.style.justifyContent).toBe(cssStyles[i]);
                    expect(wrapperElement.style.alignItems).toBe(cssStyles[j]);
                    overlay.detach(id);
                    tick();
                }
            }
        }));

        it('Should center the shown component in the igx-overlay (visible window) - default.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlay = fixture.componentInstance.overlay;

            overlay.show(overlay.attach(SimpleDynamicComponent));
            tick();
            const componentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName('component')[0] as HTMLElement;
            const componentRect = componentElement.getBoundingClientRect();
            expect((window.innerWidth - componentRect.width) / 2).toEqual(componentRect.left);
            expect((window.innerHeight - componentRect.height) / 2).toEqual(componentRect.top);
        }));

        it('Should display a new instance of the same component/options exactly on top of the previous one.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlay = fixture.componentInstance.overlay;

            overlay.show(overlay.attach(SimpleDynamicComponent));
            overlay.show(overlay.attach(SimpleDynamicComponent));
            tick();
            const wrapperElements = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL) as HTMLCollectionOf<HTMLElement>;
            const wrapperElement1 = wrapperElements[0];
            const wrapperElement2 = wrapperElements[1];
            const componentElement1 = wrapperElement1.getElementsByTagName('component')[0] as HTMLElement;
            const componentElement2 = wrapperElement2.getElementsByTagName('component')[0] as HTMLElement;
            const componentRect1 = componentElement1.getBoundingClientRect();
            const componentRect2 = componentElement2.getBoundingClientRect();
            expect(componentRect1.left).toEqual(componentRect2.left);
            expect(componentRect1.top).toEqual(componentRect2.top);
            expect(componentRect1.width).toEqual(componentRect2.width);
            expect(componentRect1.height).toEqual(componentRect2.height);
        }));

        it('Should show a component bigger than the visible window as centered.', fakeAsync(() => {

            // overlay div is forced to has width and height equal to 0. This will prevent body
            // to show any scrollbars whatever the size of the component is.
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlay = fixture.componentInstance.overlay;

            overlay.show(overlay.attach(SimpleBigSizeComponent));
            tick();
            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_FLEX)[0] as HTMLElement;
            const componentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName('ng-component')[0] as HTMLElement;
            const componentRect = componentElement.getBoundingClientRect();

            expect(componentRect.left).toBe((wrapperElement.clientWidth - componentRect.width) / 2);
            expect(componentRect.top).toBe((wrapperElement.clientHeight - componentRect.height) / 2);
        }));

        // 1.1.1 Global Css
        it('Should apply the css class on igx-overlay component div wrapper.' +
            'Test defaults: When no positionStrategy is passed use GlobalPositionStrategy with default PositionSettings and css class.',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();
                const overlay = fixture.componentInstance.overlay;

                overlay.show(overlay.attach(SimpleDynamicComponent));
                tick();
                fixture.detectChanges();

                // overlay container IS NOT a child of the debugElement (attached to body, not app-root)
                const wrapperElement = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;

                expect(wrapperElement).toBeTruthy();
                expect(wrapperElement.localName).toEqual('div');
            })
        );

        it('Should apply css class on igx-overlay component inner div wrapper.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            fixture.detectChanges();
            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(contentElement).toBeTruthy();
            expect(contentElement.localName).toEqual('div');
        }));

        // 1.2 ConnectedPositioningStrategy(show components based on a specified position base point, horizontal and vertical alignment)
        it('Should correctly render igx-overlay', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false,
                target: fixture.componentInstance.buttonElement.nativeElement
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new ConnectedPositioningStrategy(positionSettings);
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement).toBeDefined();
            expect(wrapperElement).toHaveClass(CLASS_OVERLAY_WRAPPER);
        }));

        it('Should cover the whole window 100% width and height.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const overlaySettings: OverlaySettings = {
                target: fixture.componentInstance.buttonElement.nativeElement,
                positionStrategy: new ConnectedPositioningStrategy(positionSettings),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement.clientHeight).toEqual(window.innerHeight);
            expect(wrapperElement.clientWidth).toEqual(window.innerWidth);
        }));

        it('It should position the shown component inside the igx-overlay wrapper as a content last child.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            const contentElement = wrapperElement.firstChild;
            const componentElement = contentElement.lastChild.lastChild; // wrapped in 'NG-COMPONENT'
            expect(wrapperElement.nodeName).toEqual('DIV');
            expect(wrapperElement.firstChild.nodeName).toEqual('DIV');
            expect(componentElement.nodeName).toEqual('DIV');
        }));

        it(`Should use StartPoint:Left/Bottom, Direction Right/Bottom and openAnimation: scaleInVerTop,
            closeAnimation: scaleOutVerTop as default options when using a ConnectedPositioningStrategy without passing options.`, () => {
            const strategy = new ConnectedPositioningStrategy();

            const expectedDefaults = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Bottom,
                openAnimation: scaleInVerTop,
                closeAnimation: scaleOutVerTop,
                minSize: { width: 0, height: 0 }
            };

            expect(strategy.settings).toEqual(expectedDefaults);
        });

        // adding more than one component to show in igx-overlay:
        it('Should render the component exactly on top of the previous one when adding a new instance with default settings.', () => {
            const fixture = TestBed.createComponent(TopLeftOffsetComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy()
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            fixture.detectChanges();

            const wrapperElements = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL) as HTMLCollectionOf<HTMLElement>;
            const wrapperElement1 = wrapperElements[0];
            const wrapperElement2 = wrapperElements[1];
            const componentElement1 = wrapperElement1.getElementsByTagName('component')[0] as HTMLElement;
            const componentElement2 = wrapperElement2.getElementsByTagName('component')[0] as HTMLElement;
            const componentRect1 = componentElement1.getBoundingClientRect();
            const componentRect2 = componentElement2.getBoundingClientRect();
            expect(componentRect1.left).toEqual(0);
            expect(componentRect1.left).toEqual(componentRect2.left);
            expect(componentRect1.top).toEqual(0);
            expect(componentRect1.top).toEqual(componentRect2.top);
            expect(componentRect1.width).toEqual(componentRect2.width);
            expect(componentRect1.height).toEqual(componentRect2.height);
        });

        it('Should render the component exactly on top of the previous one when adding a new instance with the same options.', () => {
            const fixture = TestBed.createComponent(TopLeftOffsetComponent);
            const x = 200;
            const y = 300;

            const overlay = fixture.componentInstance.overlay;
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Left,
                verticalDirection: VerticalAlignment.Top,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Bottom,
            };
            const overlaySettings: OverlaySettings = {
                target: new Point(x, y),
                positionStrategy: new ConnectedPositioningStrategy(positionSettings)
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            fixture.detectChanges();

            const wrapperElements = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL) as HTMLCollectionOf<HTMLElement>;
            const wrapperElement1 = wrapperElements[0];
            const wrapperElement2 = wrapperElements[1];
            const componentElement1 = wrapperElement1.getElementsByTagName('component')[0] as HTMLElement;
            const componentElement2 = wrapperElement2.getElementsByTagName('component')[0] as HTMLElement;
            const componentRect1 = componentElement1.getBoundingClientRect();
            const componentRect2 = componentElement2.getBoundingClientRect();
            expect(componentRect1.left).toEqual(x - componentRect1.width);
            expect(componentRect1.left).toEqual(componentRect2.left);
            expect(componentRect1.top).toEqual(y - componentRect1.height);
            expect(componentRect1.top).toEqual(componentRect2.top);
            expect(componentRect1.width).toEqual(componentRect2.width);
            expect(componentRect1.height).toEqual(componentRect2.height);
        });

        it(`Should change the state of the component to closed when reaching threshold and closing scroll strategy is used.`,
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);

                //  add one div far away to the right and to the bottom in order scrollbars to appear on page
                addScrollDivToElement(fixture.nativeElement);

                const scrollStrat = new CloseScrollStrategy();
                fixture.detectChanges();
                const overlaySettings: OverlaySettings = {
                    scrollStrategy: scrollStrat,
                    modal: false,
                    closeOnOutsideClick: false
                };
                const overlay = fixture.componentInstance.overlay;
                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                tick();

                let wrapperElement = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
                expect(wrapperElement.style.visibility).toEqual('');
                expect(document.documentElement.scrollTop).toEqual(0);

                document.documentElement.scrollTop += 9;
                document.dispatchEvent(new Event('scroll'));
                tick();

                expect(document.documentElement.scrollTop).toEqual(9);
                wrapperElement = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
                expect(wrapperElement.style.visibility).toEqual('');

                document.documentElement.scrollTop += 25;
                document.dispatchEvent(new Event('scroll'));
                tick();

                expect(document.documentElement.scrollTop).toEqual(34);
                wrapperElement = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
                expect(wrapperElement.style.visibility).toEqual('hidden');
            }));

        it('Should scroll component with the scrolling container when absolute scroll strategy is used.', fakeAsync(() => {
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
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            expect(document.documentElement.scrollTop).toEqual(0);
            let contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            let overlayChildPosition = contentElement.lastElementChild.getBoundingClientRect();
            expect(overlayChildPosition.y).toEqual(0);
            expect(buttonElement.getBoundingClientRect().y).toEqual(0);

            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);

            document.documentElement.scrollTop += 25;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(25);
            contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            overlayChildPosition = contentElement.lastElementChild.getBoundingClientRect();
            expect(overlayChildPosition.y).toEqual(0);
            expect(buttonElement.getBoundingClientRect().y).toEqual(-25);

            document.documentElement.scrollTop += 500;
            document.dispatchEvent(new Event('scroll'));
            tick();
            contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            overlayChildPosition = contentElement.lastElementChild.getBoundingClientRect();
            expect(overlayChildPosition.y).toEqual(0);
            expect(buttonElement.getBoundingClientRect().y).toEqual(-525);
            expect(document.documentElement.scrollTop).toEqual(525);
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
            scrollStrat.detach();
            document.documentElement.scrollTop = 0;
        }));

        // 1.2.1 Connected Css
        it('Should apply css class on igx-overlay component div wrapper.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            // overlay container IS NOT a child of the debugElement (attached to body, not app-root)
            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement).toBeTruthy();
            expect(wrapperElement.localName).toEqual('div');
        }));

        // 1.2.2 Connected strategy position method
        it('Should position component based on Point only when connected position strategy is used.', () => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            // for a Point(300,300);
            const expectedTopForPoint: number[] = [240, 270, 300];  // top/middle/bottom/
            const expectedLeftForPoint: number[] = [240, 270, 300]; // left/center/right/

            const size = { width: 60, height: 60 };
            const componentElement = document.createElement('div');
            componentElement.setAttribute('style', 'width:60px; height:60px; color:green;');
            const contentElement = document.createElement('div');
            contentElement.setAttribute('style', 'position: absolute; color:gray;');
            contentElement.classList.add('contentWrapper');
            contentElement.appendChild(componentElement);
            const wrapperElement = document.createElement('div');
            wrapperElement.setAttribute('style', 'position: fixed; width: 100%; height: 100%; top: 0; left: 0');
            wrapperElement.appendChild(contentElement);
            document.body.appendChild(wrapperElement);

            const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));

            fixture.detectChanges();
            for (let horizontalDirection = 0; horizontalDirection < horAl.length; horizontalDirection++) {
                for (let verticalDirection = 0; verticalDirection < verAl.length; verticalDirection++) {

                    // start Point is static Top/Left at 300/300
                    const positionSettings2 = {
                        horizontalDirection: HorizontalAlignment[horAl[horizontalDirection]],
                        verticalDirection: VerticalAlignment[verAl[verticalDirection]],
                        element: null,
                        horizontalStartPoint: HorizontalAlignment.Left,
                        verticalStartPoint: VerticalAlignment.Top
                    };

                    const strategy = new ConnectedPositioningStrategy(positionSettings2);
                    strategy.position(contentElement, size, null, false, new Point(300, 300));
                    fixture.detectChanges();

                    const left = expectedLeftForPoint[horizontalDirection];
                    const top = expectedTopForPoint[verticalDirection];
                    const contentElementRect = contentElement.getBoundingClientRect();
                    expect(contentElementRect.left).toBe(left);
                    expect(contentElementRect.top).toBe(top);
                }
            }
            document.body.removeChild(wrapperElement);
        });

        it('Should position component based on element and start point when connected position strategy is used.', () => {
            const fixture = TestBed.createComponent(TopLeftOffsetComponent);
            fixture.detectChanges();

            // for a Point(300,300);
            const expectedTopForPoint: Array<number> = [240, 270, 300];  // top/middle/bottom/
            const expectedLeftForPoint: Array<number> = [240, 270, 300]; // left/center/right/

            const size = { width: 60, height: 60 };
            const componentElement = document.createElement('div');
            componentElement.setAttribute('style', 'width:60px; height:60px; color:green;');
            const contentElement = document.createElement('div');
            contentElement.setAttribute('style', 'color:gray; position: absolute;');
            contentElement.classList.add('contentWrapper');
            contentElement.appendChild(componentElement);
            const wrapperElement = document.createElement('div');
            wrapperElement.setAttribute('style', 'position: fixed; width: 100%; height: 100%; top: 0; left: 0');
            wrapperElement.appendChild(contentElement);
            document.body.appendChild(wrapperElement);

            const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
            const targetEl: HTMLElement = document.getElementsByClassName('300_button')[0] as HTMLElement;

            fixture.detectChanges();

            // loop trough and test all possible combinations (count 81) for StartPoint and Direction.
            for (let horizontalStartPoint = 0; horizontalStartPoint < horAl.length; horizontalStartPoint++) {
                for (let verticalStartPoint = 0; verticalStartPoint < verAl.length; verticalStartPoint++) {
                    for (let horizontalDirection = 0; horizontalDirection < horAl.length; horizontalDirection++) {
                        for (let verticalDirection = 0; verticalDirection < verAl.length; verticalDirection++) {
                            // TODO: add additional check for different start points
                            // start Point is static Top/Left at 300/300
                            const positionSettings = {
                                horizontalDirection: HorizontalAlignment[horAl[horizontalDirection]],
                                verticalDirection: VerticalAlignment[verAl[verticalDirection]],
                                element: null,
                                horizontalStartPoint: HorizontalAlignment[horAl[horizontalStartPoint]],
                                verticalStartPoint: VerticalAlignment[verAl[verticalStartPoint]],
                            };
                            const strategy = new ConnectedPositioningStrategy(positionSettings);
                            strategy.position(contentElement, size, null, false, targetEl);
                            fixture.detectChanges();
                            const left = expectedLeftForPoint[horizontalDirection] + 50 * horizontalStartPoint;
                            const top = expectedTopForPoint[verticalDirection] + 30 * verticalStartPoint;
                            const contentElementRect = contentElement.getBoundingClientRect();
                            expect(contentElementRect.left).toBe(left);
                            expect(contentElementRect.top).toBe(top);
                        }
                    }
                }
            }
            document.body.removeChild(wrapperElement);
        });

        // 1.3 AutoPosition (fit the shown component into the visible window.)
        it('Should correctly render igx-overlay', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;

            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const overlaySettings: OverlaySettings = {
                target: fixture.componentInstance.buttonElement.nativeElement,
                positionStrategy: new AutoPositionStrategy(positionSettings),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            fixture.detectChanges();
            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement).toBeDefined();
            expect(wrapperElement).toHaveClass(CLASS_OVERLAY_WRAPPER);
        }));

        it('Should cover the whole window 100% width and height.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const overlaySettings: OverlaySettings = {
                target: fixture.componentInstance.buttonElement.nativeElement,
                positionStrategy: new AutoPositionStrategy(positionSettings),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            fixture.detectChanges();

            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement.clientHeight).toEqual(window.innerHeight);
            expect(wrapperElement.clientWidth).toEqual(window.innerWidth);
        }));

        it('Should append the shown component inside the igx-overlay as a last child.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const overlaySettings: OverlaySettings = {
                target: fixture.componentInstance.buttonElement.nativeElement,
                positionStrategy: new AutoPositionStrategy(positionSettings),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            fixture.detectChanges();
            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(contentElement.children.length).toEqual(1);

            const componentElement = contentElement.getElementsByTagName('div')[0];
            let overlayStyle = componentElement.getAttribute('style');
            overlayStyle = formatString(overlayStyle, formatters);
            expect(overlayStyle).toEqual('width:100px; height:100px; background-color:red');
        }));

        it('Should show the component inside of the viewport if it would normally be outside of bounds, BOTTOM + RIGHT.', fakeAsync(() => {
            const fixture = TestBed.createComponent(DownRightButtonComponent);
            fixture.detectChanges();

            fixture.componentInstance.positionStrategy = new AutoPositionStrategy();
            const currentElement = fixture.componentInstance;
            const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
            fixture.detectChanges();
            currentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Right;
            currentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Bottom;
            currentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Bottom;
            currentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Right;
            fixture.componentInstance.target = buttonElement;
            buttonElement.click();
            fixture.detectChanges();
            tick();

            fixture.detectChanges();
            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(contentElement.children.length).toEqual(1);

            const componentElement = contentElement.getElementsByTagName('component')[0];
            const buttonLeft = buttonElement.offsetLeft;
            const buttonTop = buttonElement.offsetTop;
            const expectedLeft = buttonLeft - componentElement.clientWidth;
            const expectedTop = buttonTop - componentElement.clientHeight;
            const contentLeft = contentElement.getBoundingClientRect().left;
            const contentTop = contentElement.getBoundingClientRect().top;
            expect(contentTop).toEqual(expectedTop);
            expect(contentLeft).toEqual(expectedLeft);

            const componentDiv = componentElement.getElementsByTagName('div')[0];
            const expectedStyle = 'width:100px; height:100px; background-color:red';
            let overlayStyle = componentDiv.getAttribute('style');
            overlayStyle = formatString(overlayStyle, formatters);
            expect(overlayStyle).toEqual(expectedStyle);
        }));

        it('Should display each shown component based on the options specified if the component fits into the visible window.',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const overlay = fixture.componentInstance.overlay;
                const button = fixture.componentInstance.buttonElement.nativeElement;
                button.style.left = '150px';
                button.style.top = '150px';
                button.style.position = 'relative';

                const hAlignmentArray = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
                const vAlignmentArray = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
                hAlignmentArray.forEach(horizontalStartPoint => {
                    vAlignmentArray.forEach(verticalStartPoint => {
                        hAlignmentArray.forEach(horizontalDirection => {
                            //  do not check Center as we do nothing here
                            if (horizontalDirection === 'Center') {
                                return;
                            }
                            vAlignmentArray.forEach(verticalDirection => {
                                //  do not check Middle as we do nothing here
                                if (verticalDirection === 'Middle') {
                                    return;
                                }
                                const positionSettings: PositionSettings = {};
                                positionSettings.horizontalStartPoint = HorizontalAlignment[horizontalStartPoint];
                                positionSettings.verticalStartPoint = VerticalAlignment[verticalStartPoint];
                                positionSettings.horizontalDirection = HorizontalAlignment[horizontalDirection];
                                positionSettings.verticalDirection = VerticalAlignment[verticalDirection];

                                const overlaySettings: OverlaySettings = {
                                    target: button,
                                    positionStrategy: new AutoPositionStrategy(positionSettings),
                                    modal: false,
                                    closeOnOutsideClick: false
                                };

                                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                                tick();
                                fixture.detectChanges();

                                const targetRect = (overlaySettings.target as HTMLElement).getBoundingClientRect();
                                const componentElement = (fixture.debugElement.nativeElement as HTMLElement)
                                    .parentElement.getElementsByTagName('component')[0];
                                const componentRect = componentElement.getBoundingClientRect();
                                const screenRect: ClientRect = {
                                    left: 0,
                                    top: 0,
                                    right: window.innerWidth,
                                    bottom: window.innerHeight,
                                    width: window.innerWidth,
                                    height: window.innerHeight,
                                };

                                const location = getOverlayWrapperLocation(positionSettings, targetRect, componentRect, screenRect);
                                expect(componentRect.top.toFixed(1)).toEqual(location.y.toFixed(1));
                                expect(componentRect.left.toFixed(1)).toEqual(location.x.toFixed(1));
                                expect(document.body.scrollHeight > document.body.clientHeight).toBeFalsy(); // check scrollbar
                                fixture.componentInstance.overlay.detachAll();
                                tick();
                                fixture.detectChanges();
                            });
                        });
                    });
                });
            }));

        it(`Should reposition the component and render it correctly in the window, even when the rendering options passed
            should result in otherwise a partially hidden component. No scrollbars should appear.`,
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const button = fixture.componentInstance.buttonElement.nativeElement;
                const overlay = fixture.componentInstance.overlay;
                button.style.position = 'relative';
                button.style.width = '50px';
                button.style.height = '50px';
                const buttonLocations = [
                    { left: `0px`, top: `0px` }, // topLeft
                    { left: `${window.innerWidth - 200}px`, top: `0px` }, // topRight
                    { left: `0px`, top: `${window.innerHeight - 200}px` }, // bottomLeft
                    { left: `${window.innerWidth - 200}px`, top: `${window.innerHeight - 200}px` } // bottomRight
                ];
                const hAlignmentArray = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
                const vAlignmentArray = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
                for (const buttonLocation of buttonLocations) {
                    for (const horizontalStartPoint of hAlignmentArray) {
                        for (const verticalStartPoint of vAlignmentArray) {
                            for (const horizontalDirection of hAlignmentArray) {
                                for (const verticalDirection of vAlignmentArray) {

                                    const positionSettings: PositionSettings = {};
                                    button.style.left = buttonLocation.left;
                                    button.style.top = buttonLocation.top;

                                    positionSettings.horizontalStartPoint = HorizontalAlignment[horizontalStartPoint];
                                    positionSettings.verticalStartPoint = VerticalAlignment[verticalStartPoint];
                                    positionSettings.horizontalDirection = HorizontalAlignment[horizontalDirection];
                                    positionSettings.verticalDirection = VerticalAlignment[verticalDirection];

                                    const overlaySettings: OverlaySettings = {
                                        target: button,
                                        positionStrategy: new AutoPositionStrategy(positionSettings),
                                        modal: false,
                                        closeOnOutsideClick: false
                                    };

                                    overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                                    tick();
                                    fixture.detectChanges();

                                    const targetRect = (overlaySettings.target as HTMLElement).getBoundingClientRect();
                                    const contentElement = (fixture.nativeElement as HTMLElement)
                                        .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
                                    const contentRect = contentElement.getBoundingClientRect();
                                    const screenRect: ClientRect = {
                                        left: 0,
                                        top: 0,
                                        right: window.innerWidth,
                                        bottom: window.innerHeight,
                                        width: window.innerWidth,
                                        height: window.innerHeight,
                                    };

                                    const loc = getOverlayWrapperLocation(positionSettings, targetRect, contentRect, screenRect);
                                    expect(contentRect.top.toFixed(1))
                                        .withContext(`YYY HD: ${horizontalDirection}; VD: ${verticalDirection}; ` +
                                            `HSP: ${horizontalStartPoint}; VSP: ${verticalStartPoint}; ` +
                                            `BL: ${buttonLocation.left}; BT: ${buttonLocation.top}; ` +
                                            `STYLE: ${contentElement.getAttribute('style')};`)
                                        .toEqual(loc.y.toFixed(1));
                                    expect(contentRect.left.toFixed(1))
                                        .withContext(`XXX HD: ${horizontalDirection}; VD: ${verticalDirection}; ` +
                                            `HSP: ${horizontalStartPoint}; VSP: ${verticalStartPoint}; ` +
                                            `BL: ${buttonLocation.left}; BT: ${buttonLocation.top}; ` +
                                            `STYLE: ${contentElement.getAttribute('style')};`)
                                        .toEqual(loc.x.toFixed(1));
                                    expect(document.body.scrollHeight > document.body.clientHeight).toBeFalsy(); // check scrollbar
                                    fixture.componentInstance.overlay.detachAll();
                                    tick();
                                    fixture.detectChanges();
                                }
                            }
                        }
                    }
                }
            }));

        it('Should render margins correctly.', fakeAsync(() => {
            const expectedMargin = '0px';
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;

            fixture.detectChanges();
            const button = fixture.componentInstance.buttonElement.nativeElement;
            const hAlignmentArray = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const vAlignmentArray = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));

            hAlignmentArray.forEach(hDirection => {
                vAlignmentArray.forEach(vDirection => {
                    hAlignmentArray.forEach(hAlignment => {
                        vAlignmentArray.forEach(vAlignment => {
                            const positionSettings: PositionSettings = {
                                horizontalDirection: hDirection as any,
                                verticalDirection: vDirection as any,
                                horizontalStartPoint: hAlignment as any,
                                verticalStartPoint: vAlignment as any
                            };
                            const overlaySettings: OverlaySettings = {
                                target: button,
                                positionStrategy: new AutoPositionStrategy(positionSettings),
                                scrollStrategy: new NoOpScrollStrategy(),
                                modal: false,
                                closeOnOutsideClick: false
                            };
                            verifyOverlayMargins(overlaySettings, overlay, fixture, expectedMargin);
                        });
                    });
                });
            });
        }));

        // When adding more than one component to show in igx-overlay:
        it('When the options used to fit the component in the window - adding a new instance of the component with the ' +
            ' same options will render it on top of the previous one.', fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const overlay = fixture.componentInstance.overlay;
                const button = fixture.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    horizontalStartPoint: HorizontalAlignment.Center,
                    verticalStartPoint: VerticalAlignment.Bottom
                };
                const overlaySettings: OverlaySettings = {
                    target: button,
                    positionStrategy: new AutoPositionStrategy(positionSettings),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };
                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                fixture.detectChanges();
                tick();

                const wrapperElements = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER) as HTMLCollectionOf<HTMLElement>;
                const wrapperElement1 = wrapperElements[0];
                const wrapperElement2 = wrapperElements[1];
                const componentElement1 = wrapperElement1.getElementsByTagName('component')[0] as HTMLElement;
                const componentElement2 = wrapperElement2.getElementsByTagName('component')[0] as HTMLElement;
                const componentRect1 = componentElement1.getBoundingClientRect();
                const componentRect2 = componentElement2.getBoundingClientRect();
                const buttonRect = button.getBoundingClientRect();
                expect(componentRect1.left.toFixed(1)).toEqual((buttonRect.left + buttonRect.width / 2).toFixed(1));
                expect(componentRect1.left.toFixed(1)).toEqual(componentRect2.left.toFixed(1));
                expect(componentRect1.top.toFixed(1)).toEqual((buttonRect.top + buttonRect.height).toFixed(1));
                expect(componentRect1.top.toFixed(1)).toEqual(componentRect2.top.toFixed(1));
                expect(componentRect1.width.toFixed(1)).toEqual(componentRect2.width.toFixed(1));
                expect(componentRect1.height.toFixed(1)).toEqual(componentRect2.height.toFixed(1));
            }));

        // When adding more than one component to show in igx-overlay and the options used will not fit the component in the
        // window, so AutoPosition is used.
        it('When adding a new instance of the component with the same options, will render it on top of the previous one.',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const overlay = fixture.componentInstance.overlay;
                const button = fixture.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Left,
                    verticalDirection: VerticalAlignment.Top,
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Top
                };
                const overlaySettings: OverlaySettings = {
                    target: button,
                    positionStrategy: new AutoPositionStrategy(positionSettings),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };
                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                fixture.detectChanges();
                tick();
                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                fixture.detectChanges();
                tick();
                const buttonRect = button.getBoundingClientRect();

                const wrapperElements = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER) as HTMLCollectionOf<HTMLElement>;
                const wrapperElement1 = wrapperElements[0];
                const wrapperElement2 = wrapperElements[1];
                const componentElement1 = wrapperElement1.getElementsByTagName('component')[0] as HTMLElement;
                const componentElement2 = wrapperElement2.getElementsByTagName('component')[0] as HTMLElement;
                const componentRect1 = componentElement1.getBoundingClientRect();
                const componentRect2 = componentElement2.getBoundingClientRect();

                // Will be positioned on the right of the button
                expect(Math.round(componentRect1.left)).toEqual(Math.round(buttonRect.right));
                expect(Math.round(componentRect1.left)).toEqual(Math.round(componentRect2.left)); // Are on the same spot
                expect(Math.round(componentRect1.top)).toEqual(Math.round(componentRect2.top)); // Will have the same top
                expect(Math.round(componentRect1.width)).toEqual(Math.round(componentRect2.width)); // Will have the same width
                expect(Math.round(componentRect1.height)).toEqual(Math.round(componentRect2.height)); // Will have the same height
            }));

        it(`Should persist the component's open state when scrolling, when scrolling and noOP scroll strategy is used
        (expanded DropDown remains expanded).`, fakeAsync(() => {
            // TO DO replace Spies with css class and/or getBoundingClientRect.
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const scrollTolerance = 10;
            const scrollStrategy = new BlockScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: false,
                scrollStrategy,
                positionStrategy: new GlobalPositionStrategy()
            };

            spyOn(scrollStrategy, 'initialize').and.callThrough();
            spyOn(scrollStrategy, 'attach').and.callThrough();
            spyOn(scrollStrategy, 'detach').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            const scrollSpy = spyOn<any>(scrollStrategy, 'onScroll').and.callThrough();

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
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

        it('Should persist the component open state when scrolling and absolute scroll strategy is used.', fakeAsync(() => {
            // TO DO replace Spies with css class and/or getBoundingClientRect.
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const scrollTolerance = 10;
            const scrollStrategy = new AbsoluteScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                closeOnOutsideClick: false,
                modal: false,
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy
            };

            spyOn(scrollStrategy, 'initialize').and.callThrough();
            spyOn(scrollStrategy, 'attach').and.callThrough();
            spyOn(scrollStrategy, 'detach').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            const scrollSpy = spyOn<any>(scrollStrategy, 'onScroll').and.callThrough();

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
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

        // 1.4 ElasticPosition (resize shown component to fit into visible window)
        it('Should correctly render igx-overlay', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;

            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const overlaySettings: OverlaySettings = {
                target: fixture.componentInstance.buttonElement.nativeElement,
                positionStrategy: new ElasticPositionStrategy(positionSettings),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            fixture.detectChanges();
            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement).toBeDefined();
            expect(wrapperElement).toHaveClass(CLASS_OVERLAY_WRAPPER);
        }));

        it('Should cover the whole window 100% width and height.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;

            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const overlaySettings: OverlaySettings = {
                target: fixture.componentInstance.buttonElement.nativeElement,
                positionStrategy: new ElasticPositionStrategy(positionSettings),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            fixture.detectChanges();

            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement.clientHeight).toEqual(window.innerHeight);
            expect(wrapperElement.clientWidth).toEqual(window.innerWidth);
        }));

        it('Should append the shown component inside the igx-overlay as a last child.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;

            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const overlaySettings: OverlaySettings = {
                target: fixture.componentInstance.buttonElement.nativeElement,
                positionStrategy: new ElasticPositionStrategy(positionSettings),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            fixture.detectChanges();
            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;

            expect(contentElement.children.length).toEqual(1);

            const componentElement = contentElement.getElementsByTagName('div')[0];
            let overlayStyle = componentElement.getAttribute('style');
            overlayStyle = formatString(overlayStyle, formatters);
            expect(overlayStyle).toEqual('width:100px; height:100px; background-color:red');
        }));

        it('Should show the component inside of the viewport if it would normally be outside of bounds, BOTTOM + RIGHT.', fakeAsync(() => {
            const fixture = TestBed.createComponent(DownRightButtonComponent);
            fixture.detectChanges();

            fixture.componentInstance.positionStrategy = new ElasticPositionStrategy();
            const component = fixture.componentInstance;
            const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
            component.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Right;
            component.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Bottom;
            component.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Bottom;
            component.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Right;
            fixture.componentInstance.target = buttonElement;
            component.ButtonPositioningSettings.minSize = { width: 80, height: 80 };
            buttonElement.click();
            tick();
            fixture.detectChanges();

            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            const contentRect = contentElement.getBoundingClientRect();
            expect(contentRect.width).toEqual(80);
            expect(contentRect.height).toEqual(80);
            const expectedLeft = buttonElement.offsetLeft + buttonElement.offsetWidth;
            const expectedTop = buttonElement.offsetTop + buttonElement.offsetHeight;
            expect(contentRect.top).toEqual(expectedTop);
            expect(contentRect.left).toEqual(expectedLeft);
        }));

        it('Should display each shown component based on the options specified if the component fits into the visible window.',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const overlay = fixture.componentInstance.overlay;
                const button = fixture.componentInstance.buttonElement.nativeElement;
                button.style.left = '150px';
                button.style.top = '150px';
                button.style.position = 'relative';

                const hAlignmentArray = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
                const vAlignmentArray = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
                hAlignmentArray.forEach(horizontalStartPoint => {
                    vAlignmentArray.forEach(verticalStartPoint => {
                        hAlignmentArray.forEach(horizontalDirection => {
                            vAlignmentArray.forEach(verticalDirection => {
                                const positionSettings: PositionSettings = {};
                                positionSettings.horizontalStartPoint = HorizontalAlignment[horizontalStartPoint];
                                positionSettings.verticalStartPoint = VerticalAlignment[verticalStartPoint];
                                positionSettings.horizontalDirection = HorizontalAlignment[horizontalDirection];
                                positionSettings.verticalDirection = VerticalAlignment[verticalDirection];
                                positionSettings.minSize = { width: 80, height: 80 };

                                const overlaySettings: OverlaySettings = {
                                    target: button,
                                    positionStrategy: new ElasticPositionStrategy(positionSettings),
                                    modal: false,
                                    closeOnOutsideClick: false
                                };

                                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                                tick();
                                fixture.detectChanges();

                                const targetRect = (overlaySettings.target as HTMLElement).getBoundingClientRect() as ClientRect;
                                //  we need original rect of the wrapper element. After it was shown in overlay elastic may
                                //  set width and/or height. To get original rect remove width and height, get the rect and
                                //  restore width and height;
                                const contentElement = (fixture.nativeElement as HTMLElement)
                                    .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
                                const width = contentElement.style.width;
                                contentElement.style.width = '';
                                const height = contentElement.style.height;
                                contentElement.style.height = '';
                                let contentRect = contentElement.getBoundingClientRect() as ClientRect;
                                contentElement.style.width = width;
                                contentElement.style.height = height;
                                const screenRect: ClientRect = {
                                    left: 0,
                                    top: 0,
                                    right: window.innerWidth,
                                    bottom: window.innerHeight,
                                    width: window.innerWidth,
                                    height: window.innerHeight,
                                };

                                const location =
                                    getOverlayWrapperLocation(positionSettings, targetRect, contentRect, screenRect, true);
                                //  now get the wrapper rect as it is after elastic was applied
                                contentRect = contentElement.getBoundingClientRect() as ClientRect;
                                expect(contentRect.top.toFixed(1))
                                    .withContext(`HD: ${horizontalDirection}; HSP: ${horizontalStartPoint};` +
                                        `VD: ${verticalDirection}; VSP: ${verticalStartPoint};` +
                                        `STYLE: ${contentElement.getAttribute('style')};`)
                                    .toEqual(location.y.toFixed(1));
                                expect(contentRect.left.toFixed(1))
                                    .withContext(`HD: ${horizontalDirection}; HSP: ${horizontalStartPoint};` +
                                        `VD: ${verticalDirection}; VSP: ${verticalStartPoint};` +
                                        `STYLE: ${contentElement.getAttribute('style')};`)
                                    .toEqual(location.x.toFixed(1));
                                fixture.componentInstance.overlay.detachAll();
                                tick();
                                fixture.detectChanges();
                            });
                        });
                    });
                });
            }));

        it(`Should reposition the component and render it correctly in the window, even when the rendering options passed
        should result in otherwise a partially hidden component.No scrollbars should appear.`,
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const overlay = fixture.componentInstance.overlay;
                const button = fixture.componentInstance.buttonElement.nativeElement;
                button.style.position = 'relative';
                button.style.width = '50px';
                button.style.height = '50px';
                const buttonLocations = [
                    { left: `0px`, top: `0px` }, // topLeft
                    { left: `${window.innerWidth - button.width} px`, top: `0px` }, // topRight
                    { left: `0px`, top: `${window.innerHeight - button.height} px` }, // bottomLeft
                    { left: `${window.innerWidth - button.width} px`, top: `${window.innerHeight - button.height} px` } // bottomRight
                ];
                const hAlignmentArray = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
                const vAlignmentArray = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
                for (const buttonLocation of buttonLocations) {
                    for (const horizontalStartPoint of hAlignmentArray) {
                        for (const verticalStartPoint of vAlignmentArray) {
                            for (const horizontalDirection of hAlignmentArray) {
                                for (const verticalDirection of vAlignmentArray) {
                                    const positionSettings: PositionSettings = {};
                                    button.style.left = buttonLocation.left;
                                    button.style.top = buttonLocation.top;

                                    positionSettings.horizontalStartPoint = HorizontalAlignment[horizontalStartPoint];
                                    positionSettings.verticalStartPoint = VerticalAlignment[verticalStartPoint];
                                    positionSettings.horizontalDirection = HorizontalAlignment[horizontalDirection];
                                    positionSettings.verticalDirection = VerticalAlignment[verticalDirection];
                                    positionSettings.minSize = { width: 80, height: 80 };

                                    const overlaySettings: OverlaySettings = {
                                        target: button,
                                        positionStrategy: new ElasticPositionStrategy(positionSettings),
                                        modal: false,
                                        closeOnOutsideClick: false
                                    };

                                    overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                                    tick();
                                    fixture.detectChanges();

                                    const targetRect = (overlaySettings.target as HTMLElement).getBoundingClientRect() as ClientRect;
                                    //  we need original rect of the wrapper element. After it was shown in overlay elastic may
                                    //  set width and/or height. To get original rect remove width and height, get the rect and
                                    //  restore width and height;
                                    const contentElement = (fixture.nativeElement as HTMLElement)
                                        .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
                                    const width = contentElement.style.width;
                                    contentElement.style.width = '';
                                    const height = contentElement.style.height;
                                    contentElement.style.height = '';
                                    let contentRect = contentElement.getBoundingClientRect();
                                    contentElement.style.width = width;
                                    contentElement.style.height = height;
                                    const screenRect: ClientRect = {
                                        left: 0,
                                        top: 0,
                                        right: window.innerWidth,
                                        bottom: window.innerHeight,
                                        width: window.innerWidth,
                                        height: window.innerHeight,
                                    };

                                    const loc =
                                        getOverlayWrapperLocation(positionSettings, targetRect, contentRect, screenRect, true);
                                    //  now get the wrapper rect as it is after elastic was applied
                                    contentRect = contentElement.getBoundingClientRect();
                                    expect(contentRect.top.toFixed(1))
                                        .withContext(`HD: ${horizontalDirection}; HSP: ${horizontalStartPoint};` +
                                            `VD: ${verticalDirection}; VSP: ${verticalStartPoint};` +
                                            `STYLE: ${contentElement.getAttribute('style')};`)
                                        .toEqual(loc.y.toFixed(1));
                                    expect(contentRect.left.toFixed(1))
                                        .withContext(`HD: ${horizontalDirection}; HSP: ${horizontalStartPoint};` +
                                            `VD: ${verticalDirection}; VSP: ${verticalStartPoint}` +
                                            `STYLE: ${contentElement.getAttribute('style')};`)
                                        .toEqual(loc.x.toFixed(1));
                                    expect(document.body.scrollHeight > document.body.clientHeight).toBeFalsy(); // check scrollbars
                                    fixture.componentInstance.overlay.detachAll();
                                    tick();
                                    fixture.detectChanges();
                                }
                            }
                        }
                    }
                }
            }));

        it('Should render margins correctly.', fakeAsync(() => {
            const expectedMargin = '0px';
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const button = fixture.componentInstance.buttonElement.nativeElement;
            const hAlignmentArray = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const vAlignmentArray = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));

            hAlignmentArray.forEach(hDirection => {
                vAlignmentArray.forEach(vDirection => {
                    hAlignmentArray.forEach(hAlignment => {
                        vAlignmentArray.forEach(vAlignment => {
                            const positionSettings: PositionSettings = {
                                horizontalDirection: hDirection as any,
                                verticalDirection: vDirection as any,
                                horizontalStartPoint: hAlignment as any,
                                verticalStartPoint: vAlignment as any
                            };
                            const overlaySettings: OverlaySettings = {
                                target: button,
                                positionStrategy: new ElasticPositionStrategy(positionSettings),
                                scrollStrategy: new NoOpScrollStrategy(),
                                modal: false,
                                closeOnOutsideClick: false
                            };
                            verifyOverlayMargins(overlaySettings, overlay, fixture, expectedMargin);
                        });
                    });
                });
            });
        }));

        // When adding more than one component to show in igx-overlay:
        it('When the options used to fit the component in the window - adding a new instance of the component with the ' +
            ' same options will render it on top of the previous one.', fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const overlay = fixture.componentInstance.overlay;
                const button = fixture.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    horizontalStartPoint: HorizontalAlignment.Center,
                    verticalStartPoint: VerticalAlignment.Bottom
                };
                const overlaySettings: OverlaySettings = {
                    target: button,
                    positionStrategy: new ElasticPositionStrategy(positionSettings),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };
                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                fixture.detectChanges();
                tick();

                const buttonRect = button.getBoundingClientRect();
                const wrapperElements = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER) as HTMLCollectionOf<HTMLElement>;
                const wrapperElement1 = wrapperElements[0];
                const wrapperElement2 = wrapperElements[1];
                const componentElement1 = wrapperElement1.getElementsByTagName('component')[0] as HTMLElement;
                const componentElement2 = wrapperElement2.getElementsByTagName('component')[0] as HTMLElement;
                const componentRect1 = componentElement1.getBoundingClientRect();
                const componentRect2 = componentElement2.getBoundingClientRect();
                expect(componentRect1.left.toFixed(1)).toEqual((buttonRect.left + buttonRect.width / 2).toFixed(1));
                expect(componentRect1.left.toFixed(1)).toEqual(componentRect2.left.toFixed(1));
                expect(componentRect1.top.toFixed(1)).toEqual((buttonRect.top + buttonRect.height).toFixed(1));
                expect(componentRect1.top.toFixed(1)).toEqual(componentRect2.top.toFixed(1));
                expect(componentRect1.width.toFixed(1)).toEqual(componentRect2.width.toFixed(1));
                expect(componentRect1.height.toFixed(1)).toEqual(componentRect2.height.toFixed(1));
            }));

        // When adding more than one component to show in igx-overlay and the options used will not fit the component in the
        // window, so element is resized.
        it('When adding a new instance of the component with the same options, will render it on top of the previous one.',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const overlay = fixture.componentInstance.overlay;
                const button = fixture.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Left,
                    verticalDirection: VerticalAlignment.Top,
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Top,
                    minSize: { width: 80, height: 80 }
                };
                const overlaySettings: OverlaySettings = {
                    target: button,
                    positionStrategy: new ElasticPositionStrategy(positionSettings),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };
                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                fixture.detectChanges();
                tick();

                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                fixture.detectChanges();
                tick();

                const buttonRect = button.getBoundingClientRect();

                const wrapperElements = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER) as HTMLCollectionOf<HTMLElement>;
                const wrapperElement1 = wrapperElements[0];
                const wrapperElement2 = wrapperElements[1];
                const componentElement1 = wrapperElement1.getElementsByTagName('component')[0] as HTMLElement;
                const componentElement2 = wrapperElement2.getElementsByTagName('component')[0] as HTMLElement;
                const componentRect1 = componentElement1.getBoundingClientRect();
                const componentRect2 = componentElement2.getBoundingClientRect();
                expect(componentRect1.left).toEqual(buttonRect.left - positionSettings.minSize.width);
                expect(componentRect1.left).toEqual(componentRect2.left);
                expect(componentRect1.top).toEqual(componentRect2.top);
                expect(componentRect1.width).toEqual(componentRect2.width);
                expect(componentRect1.height).toEqual(componentRect2.height);
            }));

        it(`Should persist the component's open state when scrolling, when scrolling and noOP scroll strategy is used
            (expanded DropDown remains expanded).`, fakeAsync(() => {
            // TO DO replace Spies with css class and/or getBoundingClientRect.
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const scrollTolerance = 10;
            const scrollStrategy = new BlockScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: false,
                scrollStrategy,
                positionStrategy: new ElasticPositionStrategy()
            };

            spyOn(scrollStrategy, 'initialize').and.callThrough();
            spyOn(scrollStrategy, 'attach').and.callThrough();
            spyOn(scrollStrategy, 'detach').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            const scrollSpy = spyOn<any>(scrollStrategy, 'onScroll').and.callThrough();

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
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

        it('Should persist the component open state when scrolling and absolute scroll strategy is used.', fakeAsync(() => {
            // TO DO replace Spies with css class and/or getBoundingClientRect.
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const scrollTolerance = 10;
            const scrollStrategy = new AbsoluteScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                closeOnOutsideClick: false,
                modal: false,
                positionStrategy: new ElasticPositionStrategy(),
                scrollStrategy
            };

            spyOn(scrollStrategy, 'initialize').and.callThrough();
            spyOn(scrollStrategy, 'attach').and.callThrough();
            spyOn(scrollStrategy, 'detach').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            const scrollSpy = spyOn<any>(scrollStrategy, 'onScroll').and.callThrough();

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
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

        // 1.5 GlobalContainer.
        it('Should center the shown component in the outlet.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);

            const outlet = fixture.componentInstance.divElement;
            const outletElement = outlet.nativeElement;
            outletElement.style.width = '800px';
            outletElement.style.height = '600px';
            outletElement.style.position = 'fixed';
            outletElement.style.top = '100px';
            outletElement.style.left = '200px';
            outletElement.style.overflow = 'hidden';

            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                outlet,
                positionStrategy: new ContainerPositionStrategy()
            };

            const id = fixture.componentInstance.overlay.attach(SimpleDynamicComponent, overlaySettings);
            fixture.componentInstance.overlay.show(id);
            tick();

            const overlayElement = outletElement.children[0];
            const overlayElementRect = overlayElement.getBoundingClientRect();
            expect(overlayElementRect.width).toEqual(800);
            expect(overlayElementRect.height).toEqual(600);

            const wrapperElement = overlayElement.children[0] as HTMLElement;
            const componentElement = wrapperElement.children[0].children[0];
            const componentRect = componentElement.getBoundingClientRect();

            // left = outletLeft + (outletWidth - componentWidth) / 2
            // left = 200        + (800         - 100           ) / 2
            expect(componentRect.left).toEqual(550);
            // top = outletTop + (outletHeight - componentHeight) / 2
            // top = 100       + (600          - 100            ) / 2
            expect(componentRect.top).toEqual(350);
        }));

        // 3. Interaction
        // 3.1 Modal
        it('Should apply a greyed-out mask layers when is modal.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: true,
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;
            const styles = css(wrapperElement);
            const expectedBackgroundColor = 'background: var(--background-color)';
            const appliedBackgroundStyles = styles[2];
            expect(appliedBackgroundStyles).toContain(expectedBackgroundColor);
        }));

        it('Should allow interaction only for the shown component when is modal.', fakeAsync(() => {
            // Utility handler meant for later detachment
            // TO DO replace Spies with css class and/or getBoundingClientRect.
            const _handler = event => {
                if (event.which === 1) {
                    fixture.detectChanges();
                    tick();
                    expect(button.click).toHaveBeenCalledTimes(0);
                    expect(button.onclick).toHaveBeenCalledTimes(0);
                    document.removeEventListener('click', _handler);
                    dummy.remove();
                }
                return event;
            };

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

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            expect(overlay.show).toHaveBeenCalledTimes(1);
            expect(overlay.hide).toHaveBeenCalledTimes(0);

            button.dispatchEvent(new MouseEvent('click'));
        }));

        it('Should close the component when esc key is pressed.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                closeOnEscape: true,
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            let wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('');

            UIInteractions.triggerKeyDownEvtUponElem('Escape', document);
            tick();

            wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('hidden');
        }));

        it('Should not close the component when esc key is pressed and closeOnEsc is false', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                closeOnEscape: false
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            let wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('');

            UIInteractions.triggerKeyDownEvtUponElem('Escape', document);
            tick();

            wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('');
        }));

        it('Should close the opened overlays consecutively on esc keypress', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            overlay.show(overlay.attach(SimpleDynamicComponent, { closeOnEscape: true }));
            tick();
            overlay.show(overlay.attach(SimpleDynamicComponent, { closeOnEscape: true }));
            tick();

            const overlayElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayElement.children.length).toBe(2);
            expect((overlayElement.children[0] as HTMLElement).style.visibility).toEqual('');
            expect((overlayElement.children[1] as HTMLElement).style.visibility).toEqual('');

            UIInteractions.triggerKeyDownEvtUponElem('Escape', document);
            tick();
            expect((overlayElement.children[0] as HTMLElement).style.visibility).toEqual('');
            expect((overlayElement.children[1] as HTMLElement).style.visibility).toEqual('hidden');

            UIInteractions.triggerKeyDownEvtUponElem('Escape', document);
            tick();
            expect((overlayElement.children[0] as HTMLElement).style.visibility).toEqual('hidden');
            expect((overlayElement.children[1] as HTMLElement).style.visibility).toEqual('hidden');
        }));

        it('Should not close the opened overlays consecutively on esc keypress', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            overlay.show(overlay.attach(SimpleDynamicComponent, { closeOnEscape: true }));
            tick();
            overlay.show(overlay.attach(SimpleDynamicComponent, { closeOnEscape: false }));
            tick();
            overlay.show(overlay.attach(SimpleDynamicComponent, { closeOnEscape: true }));
            tick();

            const overlayElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_MAIN)[0] as HTMLElement;
            expect(overlayElement.children.length).toBe(3);
            expect((overlayElement.children[0] as HTMLElement).style.visibility).toEqual('');
            expect((overlayElement.children[1] as HTMLElement).style.visibility).toEqual('');
            expect((overlayElement.children[2] as HTMLElement).style.visibility).toEqual('');

            UIInteractions.triggerKeyDownEvtUponElem('Escape', document);
            tick();
            expect((overlayElement.children[0] as HTMLElement).style.visibility).toEqual('');
            expect((overlayElement.children[1] as HTMLElement).style.visibility).toEqual('');
            expect((overlayElement.children[2] as HTMLElement).style.visibility).toEqual('hidden');

            UIInteractions.triggerKeyDownEvtUponElem('Escape', document);
            tick();
            expect((overlayElement.children[0] as HTMLElement).style.visibility).toEqual('');
            expect((overlayElement.children[1] as HTMLElement).style.visibility).toEqual('');
            expect((overlayElement.children[2] as HTMLElement).style.visibility).toEqual('hidden');
        }));

        // Test #1883 #1820
        it('It should close the component when esc key is pressed and there were other keys pressed prior to esc.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                closeOnEscape: true,
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();

            let wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('');

            UIInteractions.triggerKeyDownEvtUponElem('Enter', document);
            tick();
            wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('');

            UIInteractions.triggerKeyDownEvtUponElem('a', document);
            tick();
            wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', document);
            tick();
            wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('');

            UIInteractions.triggerKeyDownEvtUponElem('Escape', document);
            tick();
            wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0] as HTMLElement;
            expect(wrapperElement.style.visibility).toEqual('hidden');
        }));

        // 3.2 Non - Modal
        it('Should not apply a greyed-out mask layer when is not modal', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: false
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            tick();
            const styles = css(wrapperElement);
            const expectedBackgroundColor = 'background-color: rgba(0, 0, 0, 0.38)';
            const appliedBackgroundStyles = styles[3];
            expect(appliedBackgroundStyles).not.toContain(expectedBackgroundColor);
        }));

        it('Should not close when esc key is pressed and is not modal (DropDown, Dialog, etc.).', fakeAsync(() => {

            // Utility handler meant for later detachment
            const _handler = event => {
                if (event.key === targetButton) {
                    wrapperElement = (fixture.nativeElement as HTMLElement)
                        .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
                    expect(wrapperElement).toBeTruthy();
                    document.removeEventListener(targetEvent, _handler);
                }
                return event;
            };

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

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            let wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            wrapperElement.addEventListener(targetEvent, _handler);

            expect(wrapperElement).toBeTruthy();
            wrapperElement.dispatchEvent(escEvent);
        }));

        // 4. Css
        it('Should use component initial container\'s properties when is with 100% width and show in overlay element',
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
                const componentElement =(fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName('customList')[0] as HTMLElement;
                expect(componentElement).toBeDefined();
                expect(componentElement.style.width).toEqual('100%');
                expect(componentElement.getBoundingClientRect().width).toEqual(420);
                // content element has no height, so the shown element will calculate its own height by itself
                // expect(overlayChild.style.height).toEqual('100%');
                // expect(overlayChild.getBoundingClientRect().height).toEqual(280);
                fixture.componentInstance.overlay.detachAll();
            }));
    });

    describe('Integration tests - Scroll Strategies: ', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [IgxToggleModule, DynamicModule, NoopAnimationsModule],
                declarations: DIRECTIVE_COMPONENTS
            });
        }));
        // If adding a component near the visible window borders(left,right,up,down)
        // it should be partially hidden and based on scroll strategy:
        it('Should not allow scrolling with scroll strategy is not passed.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
            position: absolute;
            top: 850px;
            left: -30px;
            width: 100px;
            height: 60px;
        } `]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const dummy = document.createElement('div');
            dummy.setAttribute('style',
                'width:60px; height:60px; color:green; position: absolute; top: 3000px; left: 3000px;');
            document.body.appendChild(dummy);

            const target = fixture.componentInstance.buttonElement.nativeElement;
            const overlaySettings: OverlaySettings = {
                target,
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));

            tick();
            const componentElement = (fixture.debugElement.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName('component')[0];
            const componentRect = componentElement.getBoundingClientRect();

            document.documentElement.scrollTop = 100;
            document.documentElement.scrollLeft = 50;
            document.dispatchEvent(new Event('scroll'));
            tick();

            expect(componentRect).toEqual(componentElement.getBoundingClientRect());
            expect(document.documentElement.scrollTop).toEqual(100);
            expect(document.documentElement.scrollLeft).toEqual(50);
            document.body.removeChild(dummy);
        }));

        it('Should retain the component state when scrolling and block scroll strategy is used.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button { position: absolute, bottom: -2000px; } `]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollStrat = new BlockScrollStrategy();
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: scrollStrat,
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;
            const overlayId = overlay.attach(SimpleDynamicComponent, overlaySettings);
            overlay.show(overlayId);
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);

            document.documentElement.scrollTop += 25;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);

            document.documentElement.scrollTop += 1000;
            document.dispatchEvent(new Event('scroll'));
            tick();

            const wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement).toBeDefined();
            expect(wrapperElement.style.visibility).toEqual('');
            expect(document.documentElement.scrollTop).toEqual(0);

            overlay.detach(overlayId);
        }));

        it(`Should show the component, AutoPositionStrategy, inside of the viewport if it would normally be outside of bounds,
            TOP + LEFT.`, fakeAsync(async () => {
            TestBed.overrideComponent(DownRightButtonComponent, {
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
        } `]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(DownRightButtonComponent);
            fixture.detectChanges();

            fixture.componentInstance.positionStrategy = new AutoPositionStrategy();
            UIInteractions.clearOverlay();
            fixture.detectChanges();
            const componentElement = fixture.componentInstance;
            const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
            fixture.detectChanges();
            componentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Left;
            componentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Top;
            componentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Top;
            componentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Left;
            fixture.componentInstance.target = buttonElement;
            buttonElement.click();
            fixture.detectChanges();
            tick();

            fixture.detectChanges();
            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            const expectedStyle = 'width:100px; height:100px; background-color:red';
            let overlayStyle = contentElement.getElementsByTagName('div')[0].getAttribute('style');
            overlayStyle = formatString(overlayStyle, formatters);
            expect(overlayStyle).toEqual(expectedStyle);
            const buttonLeft = buttonElement.offsetLeft;
            const buttonTop = buttonElement.offsetTop;
            const expectedLeft = buttonLeft + buttonElement.clientWidth; // To the right of the button
            const expectedTop = buttonTop + buttonElement.clientHeight; // Bottom of the button
            const contentLeft = contentElement.getBoundingClientRect().left;
            const contentTop = contentElement.getBoundingClientRect().top;
            expect(contentTop).toEqual(expectedTop);
            expect(contentLeft).toEqual(expectedLeft);
        }));

        it(`Should show the component, AutoPositionStrategy, inside of the viewport if it would normally be outside of bounds,
            TOP + RIGHT.`, fakeAsync(async () => {
            TestBed.overrideComponent(DownRightButtonComponent, {
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
        } `]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(DownRightButtonComponent);
            fixture.detectChanges();

            fixture.componentInstance.positionStrategy = new AutoPositionStrategy();
            UIInteractions.clearOverlay();
            fixture.detectChanges();
            const componentElement = fixture.componentInstance;
            const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
            fixture.detectChanges();
            componentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Left;
            componentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Top;
            componentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Top;
            componentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Left;
            fixture.componentInstance.target = buttonElement;
            buttonElement.click();
            fixture.detectChanges();
            tick();

            fixture.detectChanges();
            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            let overlayStyle = contentElement.getElementsByTagName('div')[0].getAttribute('style');
            const expectedStyle = 'width:100px; height:100px; background-color:red';
            overlayStyle = formatString(overlayStyle, formatters);
            expect(overlayStyle).toEqual(expectedStyle);
            const buttonLeft = buttonElement.offsetLeft;
            const buttonTop = buttonElement.offsetTop;
            const expectedRight = buttonLeft; // To the left of the button
            const expectedTop = buttonTop + buttonElement.clientHeight; // Bottom of the button
            const contentRight = contentElement.getBoundingClientRect().right;
            const contentTop = contentElement.getBoundingClientRect().top;
            expect(contentTop).toEqual(expectedTop);
            expect(contentRight).toEqual(expectedRight);
        }));

        it(`Should show the component, AutoPositionStrategy, inside of the viewport if it would normally be outside of bounds,
            TOP + RIGHT.`, fakeAsync(async () => {
            TestBed.overrideComponent(DownRightButtonComponent, {
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
        } `]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(DownRightButtonComponent);
            fixture.detectChanges();

            fixture.componentInstance.positionStrategy = new AutoPositionStrategy();
            UIInteractions.clearOverlay();
            fixture.detectChanges();
            const componentElement = fixture.componentInstance;
            const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
            componentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Right;
            componentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Top;
            componentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Top;
            componentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Right;
            fixture.componentInstance.target = buttonElement;
            buttonElement.click();
            fixture.detectChanges();
            tick();

            fixture.detectChanges();
            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            const expectedStyle = 'width:100px; height:100px; background-color:red';
            let style = contentElement.getElementsByTagName('div')[0].getAttribute('style');
            style = formatString(style, formatters);
            expect(style).toEqual(expectedStyle);
            const expectedRight = buttonElement.offsetLeft;
            const expectedTop = buttonElement.offsetTop + buttonElement.clientHeight;
            const contentElementRect = contentElement.getBoundingClientRect();
            const contentRight = contentElementRect.right;
            const contentTop = contentElementRect.top;
            expect(contentTop).toEqual(expectedTop);
            expect(contentRight).toEqual(expectedRight);
        }));

        it(`Should show the component, AutoPositionStrategy, inside of the viewport if it would normally be outside of bounds,
            BOTTOM + LEFT.`, fakeAsync(async () => {
            TestBed.overrideComponent(DownRightButtonComponent, {
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
        } `]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(DownRightButtonComponent);
            fixture.detectChanges();

            fixture.componentInstance.positionStrategy = new AutoPositionStrategy();
            UIInteractions.clearOverlay();
            fixture.detectChanges();
            const componentElement = fixture.componentInstance;
            const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
            fixture.detectChanges();
            componentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Left;
            componentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Bottom;
            componentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Bottom;
            componentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Left;
            fixture.componentInstance.target = buttonElement;
            buttonElement.click();
            tick();
            fixture.detectChanges();

            fixture.detectChanges();
            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            const expectedStyle = 'width:100px; height:100px; background-color:red';
            let style = contentElement.getElementsByTagName('div')[0].getAttribute('style');
            style = formatString(style, formatters);
            expect(style).toEqual(expectedStyle);
            const buttonLeft = buttonElement.offsetLeft;
            const buttonTop = buttonElement.offsetTop;
            const expectedLeft = buttonLeft + buttonElement.clientWidth; // To the right of the button
            const expectedTop = buttonTop - contentElement.clientHeight; // On top of the button
            const contentLeft = contentElement.getBoundingClientRect().left;
            const contentTop = contentElement.getBoundingClientRect().top;
            expect(contentTop).toEqual(expectedTop);
            expect(contentLeft).toEqual(expectedLeft);
        }));

        it(`Should show the component, ElasticPositionStrategy, inside of the viewport if it would normally be outside of bounds,
            TOP + LEFT.`, fakeAsync(async () => {
            TestBed.overrideComponent(DownRightButtonComponent, {
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
        } `]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(DownRightButtonComponent);
            fixture.detectChanges();

            fixture.componentInstance.positionStrategy = new ElasticPositionStrategy();
            UIInteractions.clearOverlay();
            fixture.detectChanges();
            const componentElement = fixture.componentInstance;
            const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
            componentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Left;
            componentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Top;
            componentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Top;
            componentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Left;
            fixture.componentInstance.target = buttonElement;
            componentElement.ButtonPositioningSettings.minSize = { width: 80, height: 80 };
            buttonElement.click();
            tick();
            fixture.detectChanges();

            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            const expectedRight = buttonElement.offsetLeft;
            const expectedBottom = buttonElement.offsetTop;
            const componentRect = contentElement.getBoundingClientRect();
            expect(componentRect.right).toEqual(expectedRight);
            expect(componentRect.bottom).toEqual(expectedBottom);
        }));

        it(`Should show the component, ElasticPositionStrategy, inside of the viewport if it would normally be outside of bounds,
            TOP + RIGHT.`, fakeAsync(async () => {
            TestBed.overrideComponent(DownRightButtonComponent, {
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
        } `]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(DownRightButtonComponent);
            fixture.detectChanges();

            fixture.componentInstance.positionStrategy = new ElasticPositionStrategy();
            UIInteractions.clearOverlay();
            fixture.detectChanges();
            const componentElement = fixture.componentInstance;
            const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
            fixture.detectChanges();
            componentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Right;
            componentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Top;
            componentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Top;
            componentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Right;
            fixture.componentInstance.target = buttonElement;
            componentElement.ButtonPositioningSettings.minSize = { width: 80, height: 80 };
            buttonElement.click();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            const expectedLeft = buttonElement.offsetLeft + buttonElement.clientWidth;
            const expectedTop = buttonElement.offsetTop - componentElement.ButtonPositioningSettings.minSize.height;
            const componentRect = contentElement.getBoundingClientRect();
            expect(componentRect.left).toEqual(expectedLeft);
            expect(componentRect.top).toEqual(expectedTop);
        }));

        it(`Should show the component, ElasticPositionStrategy, inside of the viewport if it would normally be outside of bounds,
            BOTTOM + LEFT.`, fakeAsync(async () => {
            TestBed.overrideComponent(DownRightButtonComponent, {
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
        } `]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(DownRightButtonComponent);
            fixture.detectChanges();

            fixture.componentInstance.positionStrategy = new ElasticPositionStrategy();
            UIInteractions.clearOverlay();
            fixture.detectChanges();
            const componentElement = fixture.componentInstance;
            const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
            componentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Left;
            componentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Bottom;
            componentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Bottom;
            componentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Left;
            fixture.componentInstance.target = buttonElement;
            componentElement.ButtonPositioningSettings.minSize = { width: 80, height: 80 };
            buttonElement.click();
            tick();
            fixture.detectChanges();

            const contentElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            const expectedRight = buttonElement.offsetLeft;
            const expectedTop = buttonElement.offsetTop + buttonElement.offsetHeight;
            const contentRect = contentElement.getBoundingClientRect();
            expect(contentRect.right).toEqual(expectedRight);
            expect(contentRect.top).toEqual(expectedTop);
        }));

        // 2. Scroll Strategy (test with GlobalPositionStrategy(default))
        // 2.1. Scroll Strategy - None
        it('Should not scroll component, nor the window when none scroll strategy is passed. No scrolling happens.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
            position: absolute;
            top: 120%;
            left: 120%;
        } `]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlaySettings: OverlaySettings = {
                modal: false,
            };
            const overlay = fixture.componentInstance.overlay;
            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            const componentElement = (fixture.debugElement.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName('component')[0];
            const componentRect = componentElement.getBoundingClientRect();

            document.documentElement.scrollTop = 100;
            document.documentElement.scrollLeft = 50;
            document.dispatchEvent(new Event('scroll'));
            tick();

            expect(componentRect).toEqual(componentElement.getBoundingClientRect());
            expect(document.documentElement.scrollTop).toEqual(100);
            expect(document.documentElement.scrollLeft).toEqual(50);
            overlay.hideAll();
        }));

        it(`Should not close the shown component when none scroll strategy is passed.
        (example: expanded DropDown stays expanded during a scrolling attempt.)`,
            fakeAsync(async () => {
                TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [`button {
            position: absolute;
            top: 120%;
            left: 120%;
        } `]
                    }
                });
                await TestBed.compileComponents();
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const overlaySettings: OverlaySettings = {
                    modal: false,
                };
                const overlay = fixture.componentInstance.overlay;

                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                tick();
                const componentElement = (fixture.debugElement.nativeElement as HTMLElement)
                    .parentElement.getElementsByTagName('component')[0];
                const componentRect = componentElement.getBoundingClientRect();

                document.documentElement.scrollTop = 40;
                document.documentElement.scrollLeft = 30;
                document.dispatchEvent(new Event('scroll'));
                tick();

                expect(componentRect).toEqual(componentElement.getBoundingClientRect());
                expect(document.documentElement.scrollTop).toEqual(40);
                expect(document.documentElement.scrollLeft).toEqual(30);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
            }));

        // 2.2 Scroll Strategy - Closing. (Uses a tolerance and closes an expanded component upon scrolling if the tolerance is exceeded.)
        // (example: DropDown or Dialog component collapse/closes after scrolling 10px.)
        it('Should scroll until the set threshold is exceeded, and closing scroll strategy is used.',
            fakeAsync(async () => {
                TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [
                            'button { position: absolute; top: 100%; left: 90% }'
                        ]
                    }
                });
                await TestBed.compileComponents();
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const scrollTolerance = 10;
                const scrollStrategy = new CloseScrollStrategy();
                const overlay = fixture.componentInstance.overlay;
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy,
                    modal: false,
                };

                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                tick();

                document.documentElement.scrollTop = scrollTolerance;
                document.dispatchEvent(new Event('scroll'));
                tick();

                let wrapperElement = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
                expect(wrapperElement).toBeDefined();
                expect(wrapperElement.style.visibility).toEqual('');
                expect(document.documentElement.scrollTop).toEqual(scrollTolerance);

                document.documentElement.scrollTop = scrollTolerance * 2;
                document.dispatchEvent(new Event('scroll'));
                tick();

                wrapperElement = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
                expect(wrapperElement).toBeDefined();
                expect(wrapperElement.style.visibility).toEqual('hidden');
            }));

        it(`Should not change the shown component shown state until it exceeds the scrolling tolerance set,
            and closing scroll strategy is used.`,
            fakeAsync(async () => {
                TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [
                            'button { position: absolute; top: 200%; left: 90% }'
                        ]
                    }
                });
                await TestBed.compileComponents();
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const scrollTolerance = 10;
                const scrollStrategy = new CloseScrollStrategy();
                const overlay = fixture.componentInstance.overlay;
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy,
                    closeOnOutsideClick: false,
                    modal: false,
                };

                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                tick();
                expect(document.documentElement.scrollTop).toEqual(0);

                document.documentElement.scrollTop += scrollTolerance;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
                const wrapperElement = (fixture.nativeElement as HTMLElement)
                    .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
                expect(wrapperElement).toBeDefined();
                expect(wrapperElement.style.visibility).toEqual('');
                fixture.destroy();
            }));

        it(`Should close the shown component shown when it exceeds the scrolling threshold set, and closing scroll strategy is used.
            (an expanded DropDown, Menu, DatePicker, etc.collapses).`, fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top: 100%; left: 90% }'
                    ]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollTolerance = 10;
            const scrollStrategy = new CloseScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy,
                modal: false,
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);

            document.documentElement.scrollTop += scrollTolerance;
            document.dispatchEvent(new Event('scroll'));
            tick();
            let wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement).toBeDefined();
            expect(wrapperElement.style.visibility).toEqual('');
            expect(document.documentElement.scrollTop).toEqual(scrollTolerance);

            document.documentElement.scrollTop += scrollTolerance * 2;
            document.dispatchEvent(new Event('scroll'));
            tick();

            wrapperElement = (fixture.nativeElement as HTMLElement)
                .parentElement.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            expect(wrapperElement).toBeDefined();
            expect(wrapperElement.style.visibility).toEqual('hidden');
        }));

        // 2.3 Scroll Strategy - NoOp.
        it('Should retain the component static and only the background scrolls, when scrolling and noOP scroll strategy is used.',
            fakeAsync(async () => {
                TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [
                            'button { position: absolute; top: 200%; left: 90%; }'
                        ]
                    }
                });
                await TestBed.compileComponents();
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const scrollTolerance = 10;
                const scrollStrategy = new NoOpScrollStrategy();
                const overlay = fixture.componentInstance.overlay;
                const overlaySettings: OverlaySettings = {
                    modal: false,
                    scrollStrategy,
                    positionStrategy: new GlobalPositionStrategy()
                };

                overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
                tick();
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);

                const componentElement = (fixture.debugElement.nativeElement as HTMLElement)
                    .parentElement.getElementsByTagName('component')[0];
                const componentRect = componentElement.getBoundingClientRect();

                document.documentElement.scrollTop += scrollTolerance;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
                expect(componentElement.getBoundingClientRect()).toEqual(componentRect);
            }));

        // 2.4. Scroll Strategy - Absolute.
        it('Should scroll everything except component when scrolling and absolute scroll strategy is used.', fakeAsync(async () => {

            // Should behave as NoOpScrollStrategy
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top:200%; left: 100%; }',
                    ]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollTolerance = 10;
            const scrollStrategy = new NoOpScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                closeOnOutsideClick: false,
                modal: false,
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy
            };

            overlay.show(overlay.attach(SimpleDynamicComponent, overlaySettings));
            tick();
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);

            const componentElement = (fixture.debugElement.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName('component')[0];
            const componentRect = componentElement.getBoundingClientRect();

            document.documentElement.scrollTop += scrollTolerance;
            document.dispatchEvent(new Event('scroll'));
            tick();
            const newElementRect = componentElement.getBoundingClientRect();
            expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
            expect(newElementRect.top).toEqual(componentRect.top);
        }));

        it('Should collapse/close the component when click outside it (DropDown, DatePicker, NavBar etc.)', fakeAsync(async () => {
            // TO DO replace Spies with css class and/or getBoundingClientRect.
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top: 90%; left: 100%; }'
                    ]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: false,
                closeOnOutsideClick: true,
                positionStrategy: new GlobalPositionStrategy()
            };

            spyOn(overlay, 'show').and.callThrough();
            spyOn(overlay.onClosing, 'emit');

            const firstCallId = overlay.attach(SimpleDynamicComponent, overlaySettings);
            overlay.show(firstCallId);
            tick();
            expect(overlay.show).toHaveBeenCalledTimes(1);
            expect(overlay.onClosing.emit).toHaveBeenCalledTimes(0);

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();
            expect(overlay.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(overlay.onClosing.emit)
                .toHaveBeenCalledWith({
                    id: firstCallId, componentRef: jasmine.any(ComponentRef) as any, cancel: false,
                    event: new MouseEvent('click')
                });
        }));

        it('Should remain opened when click is on an element contained in the excludeFromOutsideClick collection', fakeAsync(async () => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const divElement = fixture.componentInstance.divElement.nativeElement as HTMLElement;
            const overlaySettings: OverlaySettings = {
                modal: false,
                closeOnOutsideClick: true,
                positionStrategy: new GlobalPositionStrategy(),
                excludeFromOutsideClick: [divElement]
            };

            spyOn(overlay, 'show').and.callThrough();
            spyOn(overlay.onClosing, 'emit');
            spyOn(overlay.onClosed, 'emit');

            overlay.show(overlay.attach(SimpleDynamicComponent), overlaySettings);
            tick();
            expect(overlay.show).toHaveBeenCalledTimes(1);

            divElement.click();
            tick();

            expect(overlay.onClosing.emit).toHaveBeenCalledTimes(0);
            expect(overlay.onClosed.emit).toHaveBeenCalledTimes(0);

            overlay.hideAll();
            tick();
            expect(overlay.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(overlay.onClosed.emit).toHaveBeenCalledTimes(1);

            overlaySettings.excludeFromOutsideClick = [];
            tick();
            const callId = overlay.attach(SimpleDynamicComponent, overlaySettings);
            overlay.show(callId);
            tick();

            expect(overlay.show).toHaveBeenCalledTimes(2);
            divElement.click();
            tick();

            expect(overlay.onClosing.emit).toHaveBeenCalledTimes(2);
            expect(overlay.onClosed.emit).toHaveBeenCalledTimes(2);
            expect(overlay.onClosing.emit)
                .toHaveBeenCalledWith({
                    id: callId, componentRef: jasmine.any(ComponentRef) as any, cancel: false,
                    event: new MouseEvent('click')
                });
        }));
    });

    describe('Integration tests p3 (IgniteUI components): ', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [IgxToggleModule, DynamicModule, NoopAnimationsModule, IgxComponentsModule],
                declarations: DIRECTIVE_COMPONENTS
            }).compileComponents();
        }));
        it(`Should properly be able to render components that have no initial content(IgxCalendar, IgxAvatar)`, fakeAsync(() => {
            const fixture = TestBed.createComponent(SimpleRefComponent);
            fixture.detectChanges();
            const IGX_CALENDAR_TAG = 'igx-calendar';
            const IGX_AVATAR_TAG = 'igx-avatar';
            const IGX_DATE_PICKER_TAG = 'igx-calendar-container';
            const overlay = fixture.componentInstance.overlay;

            expect((fixture.elementRef.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName(IGX_CALENDAR_TAG).length).toEqual(0);
            expect((fixture.elementRef.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName(IGX_AVATAR_TAG).length).toEqual(0);
            expect((fixture.elementRef.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName(IGX_DATE_PICKER_TAG).length).toEqual(0);

            let overlayId = overlay.attach(IgxCalendarComponent);
            overlay.show(overlayId);
            fixture.detectChanges();
            expect((fixture.elementRef.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName(IGX_CALENDAR_TAG).length).toEqual(1);

            overlay.hide(overlayId);
            overlay.detach(overlayId);
            tick();
            fixture.detectChanges();
            expect((fixture.elementRef.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName(IGX_CALENDAR_TAG).length).toEqual(0);

            overlayId = overlay.attach(IgxAvatarComponent);
            overlay.show(overlayId);
            fixture.detectChanges();
            expect((fixture.elementRef.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName(IGX_AVATAR_TAG).length).toEqual(1);

            overlay.hide(overlayId);
            overlay.detach(overlayId);
            tick();
            fixture.detectChanges();
            expect((fixture.elementRef.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName(IGX_AVATAR_TAG).length).toEqual(0);

            overlayId = overlay.attach(IgxCalendarContainerComponent);
            overlay.show(overlayId);
            fixture.detectChanges();
            expect((fixture.elementRef.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName(IGX_DATE_PICKER_TAG).length).toEqual(1);

            overlay.hide(overlayId);
            overlay.detach(overlayId);
            tick();
            fixture.detectChanges();
            expect((fixture.elementRef.nativeElement as HTMLElement)
                .parentElement.getElementsByTagName(IGX_DATE_PICKER_TAG).length).toEqual(0);
        }));
    });
});

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: `simple - dynamic - component`,
    template: `<div style='width:100px; height: 100px; background-color: red'></div>`
})
export class SimpleDynamicComponent {
    @HostBinding('style.display')
    public hostDisplay = 'block';
    @HostBinding('style.width')
    @HostBinding('style.height')
    public hostDimenstions = '100px';
}

@Component({
    template: `<div #item class="simpleRef" style='position: absolute; width:100px; height: 100px; background-color: red'></div>`
})
export class SimpleRefComponent {
    @ViewChild('item', { static: true })
    public item: ElementRef;

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }
}

@Component({
    template: `<div style='width:3000px; height: 1000px; background-color: red'></div>`
})
export class SimpleBigSizeComponent {
    @HostBinding('style.display')
    public hostDisplay = 'block';
    @HostBinding('style.height')
    public hostHeight = '1000px';
    @HostBinding('style.width')
    public hostWidth = '3000px';
}

@Component({
    template: `
            <div igxToggle>
                <div class='scrollableDiv' *ngIf='visible' style ='position: absolute; width: 200px; height: 200px;
        overflow-y: scroll; background-color: red;'>
                    <p> AAAAA </p>
                    <p> AAAAA </p>
                    <p> AAAAA </p>
                    <p> AAAAA </p>
                    <p> AAAAA </p>
                    <p> AAAAA </p>
                    <p> AAAAA </p>
                    <p> AAAAA </p>
                    <p> AAAAA </p>
                </div>
            </div>`
})
export class SimpleDynamicWithDirectiveComponent {
    @ViewChild(IgxToggleDirective, { static: true })
    private _overlay: IgxToggleDirective;

    public visible = false;

    public get overlay(): IgxToggleDirective {
        return this._overlay;
    }

    public show(overlaySettings?: OverlaySettings) {
        this.visible = true;
        this.overlay.open(overlaySettings);
    }

    public hide() {
        this.visible = false;
        this.overlay.close();
    }
}

@Component({
    template: `
        <button #button (click)='click()' class='button'>Show Overlay</button>
        <div #div></div>
    `,
    styles: [`button {
        position: absolute;
        top: 0;
        left: 0;
        width: 84px;
        height: 84px;
        padding: 0;
        margin: 0;
        border: none;
    }`]
})
export class EmptyPageComponent {
    @ViewChild('button', { static: true }) public buttonElement: ElementRef;
    @ViewChild('div', { static: true }) public divElement: ElementRef;

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    public click() {
        this.overlay.show(this.overlay.attach(SimpleDynamicComponent));
    }
}

@Component({
    template: `
        <button #button>Show Overlay</button>
        <div igxOverlayOutlet #outlet></div>
        `,
    encapsulation: ViewEncapsulation.ShadowDom
})
export class EmptyPageInShadowDomComponent {
    @ViewChild('button', { static: true }) public buttonElement: ElementRef;
    @ViewChild('outlet', { static: true }) public outletElement: ElementRef;

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }
}

@Component({
    template: `<button #button (click)='click()'>Show Overlay</button>`,
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
    @ViewChild('button', { static: true }) public buttonElement: ElementRef;

    public positionStrategy: IPositionStrategy;

    public ButtonPositioningSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Top
    };

    public target: Point | HTMLElement = null;

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    public click() {
        this.positionStrategy.settings = this.ButtonPositioningSettings;
        this.overlay.show(this.overlay.attach(SimpleDynamicComponent, {
            target: this.target,
            positionStrategy: this.positionStrategy,
            scrollStrategy: new NoOpScrollStrategy(),
            modal: false,
            closeOnOutsideClick: false
        }));
    }
}

@Component({
    template: `<button class='300_button' #button (click)='click()'>Show Overlay</button>`,
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

    @ViewChild('button', { static: true }) public buttonElement: ElementRef;

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    public click() {
        this.overlay.show(this.overlay.attach(SimpleDynamicComponent));
    }
}

@Component({
    template: `
    <div>
        <button class='buttonOne' (click)='clickOne($event)'>Show first Overlay</button>
    </div>
    <div (click)='divClick($event)'>
        <button class='buttonTwo' (click)='clickTwo($event)'>Show second Overlay</button>
    </div>`
})
export class TwoButtonsComponent {
    public settings: OverlaySettings = { modal: false };

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    public clickOne() {
        this.overlay.show(this.overlay.attach(SimpleDynamicComponent), this.settings);
    }

    public clickTwo() {
        this.overlay.show(this.overlay.attach(SimpleDynamicComponent), this.settings);
    }

    public divClick(ev: Event) {
        ev.stopPropagation();
    }
}

@Component({
    template: `
    <div style="width: 420px; height: 280px;">
        <button class='300_button' igxToggle #button (click)='click($event)'>Show Overlay</button>
        <div #myCustomComponent class="customList" style="width: 100%; height: 100%;">
            Some Content
        </div>
    </div>`,
    styles: [`button {
        position: absolute;
        top: 300px;
        left: 300px;
        width: 100px;
        height: 60px;
        border: 0;
    }`]
})
export class WidthTestOverlayComponent {

    @ViewChild('button', { static: true }) public buttonElement: ElementRef;
    @ViewChild('myCustomComponent', { static: true }) public customComponent: ElementRef;
    public overlaySettings: OverlaySettings = {};

    constructor(
        @Inject(IgxOverlayService) public overlay: IgxOverlayService,
        public elementRef: ElementRef
    ) { }

    public click() {
        this.overlaySettings.positionStrategy = new ConnectedPositioningStrategy();
        this.overlaySettings.scrollStrategy = new NoOpScrollStrategy();
        this.overlaySettings.closeOnOutsideClick = true;
        this.overlaySettings.modal = false;

        this.overlaySettings.positionStrategy.settings.target = this.buttonElement.nativeElement;
        this.overlay.show(this.overlay.attach(this.customComponent, this.overlaySettings));
    }
}

@Component({
    template: `
    <div igxToggle>
        <div class='scrollableDiv' *ngIf='visible' style='width:200px; height:200px; overflow-y:scroll;'>
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
    @ViewChild(IgxToggleDirective, { static: true })
    private _toggle: IgxToggleDirective;

    public visible = false;

    public get toggle(): IgxToggleDirective {
        return this._toggle;
    }

    public show() {
        this.visible = true;
        const settings: OverlaySettings = { scrollStrategy: new CloseScrollStrategy() };
        this.toggle.open(settings);
    }

    public hide() {
        this.toggle.close();
        this.visible = false;
    }
}

@Component({
    template: `
    <div style='display:flex; width:100%; height:500px; justify-content:center;'>
        <button #button style='display:inline-flex; width:150px; height:30px;' (click)='click()' class='button'>
            Show Overlay
        </button>
    </div>
    `
})
export class FlexContainerComponent {
    @ViewChild('button', { static: true }) public buttonElement: ElementRef;
    public overlaySettings: OverlaySettings = {};

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    public click() {
        this.overlay.show(this.overlay.attach(SimpleDynamicComponent), this.overlaySettings);
    }
}

const DYNAMIC_COMPONENTS = [
    EmptyPageComponent,
    SimpleRefComponent,
    EmptyPageInShadowDomComponent,
    SimpleDynamicComponent,
    SimpleBigSizeComponent,
    DownRightButtonComponent,
    TopLeftOffsetComponent,
    TwoButtonsComponent,
    WidthTestOverlayComponent,
    ScrollableComponent,
    FlexContainerComponent
];

const IgniteUIComponents = [
    IgxCalendarComponent,
    IgxAvatarComponent,
    IgxDatePickerComponent
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

@NgModule({
    imports: [IgxCalendarModule, IgxAvatarModule, IgxDatePickerModule],
    entryComponents: IgniteUIComponents
})
export class IgxComponentsModule {
}
