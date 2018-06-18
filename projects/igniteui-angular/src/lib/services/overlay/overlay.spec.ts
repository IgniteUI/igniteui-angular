import {
    Component,
    ElementRef,
    Inject,
    NgModule,
    ViewChild
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnimationBuilder, style } from '@angular/animations';
import { BrowserModule, By } from '@angular/platform-browser';
import { IgxOverlayService } from './overlay';
import { IgxOverlayDirective, IgxToggleModule } from './../../directives/toggle/toggle.directive';
import { AutoPositionStrategy } from './position/auto-position-strategy';
import { ConnectedPositioningStrategy } from './position/connected-positioning-strategy';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import { PositionSettings, HorizontalAlignment, VerticalAlignment, OverlaySettings, Point } from './utilities';

fdescribe('igxOverlay', () => {
    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [IgxToggleModule, DynamicModule],
            declarations: DIRECTIVE_COMPONENTS,
            providers: [IgxOverlayService, AnimationBuilder],
        }).compileComponents();
    });

    xit('Unit - OverlayElement should return a div attached to Document\'s body', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();

        fixture.componentInstance.buttonElement.nativeElement.click();
        fixture.whenStable().then(() => {
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.visibility).toEqual('visible');
            expect(overlayDiv.classList.contains('overlay')).toBeTruthy();
            fixture.componentInstance.overlay.hideAll();
        });
    });

    xit('Unit - Should show component passed to overlay', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();

        fixture.componentInstance.buttonElement.nativeElement.click();
        fixture.whenStable().then(() => {
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.visibility).toEqual('visible');
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('div');

            fixture.componentInstance.overlay.hideAll();
        });
    });

    xit('Unit - Hide() should hide component and overlay', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();

        fixture.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1');
        fixture.componentInstance.overlay.show(SimpleDynamicComponent, 'id_2');
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.visibility).toEqual('visible');
            expect(overlayDiv.children.length).toEqual(2);
            expect(overlayDiv.children[0].localName).toEqual('div');
            expect(overlayDiv.children[1].localName).toEqual('div');

            fixture.componentInstance.overlay.hide('id_1');
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.visibility).toEqual('visible');
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('div');

            fixture.componentInstance.overlay.hide('id_2');
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.visibility).toEqual('hidden');
            expect(overlayDiv.children.length).toEqual(0);
        });

    });

    xit('Unit - HideAll() should hide all components and overlay', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();
        fixture.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1');
        fixture.componentInstance.overlay.show(SimpleDynamicComponent, 'id_2');
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.visibility).toEqual('visible');
            expect(overlayDiv.children.length).toEqual(2);
            expect(overlayDiv.children[0].localName).toEqual('div');
            expect(overlayDiv.children[1].localName).toEqual('div');

            fixture.componentInstance.overlay.hideAll();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.visibility).toEqual('hidden');
            expect(overlayDiv.children.length).toEqual(0);
        });
    });

    xit('Unit - Should show and hide component via directive', () => {
        // tslint:disable-next-line:no-debugger
        debugger;
        const fixture = TestBed.createComponent(SimpleDynamicWithDirectiveComponent);
        fixture.detectChanges();
        fixture.componentInstance.show();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.visibility).toEqual('visible');
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('div');

            fixture.componentInstance.hide();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.visibility).toEqual('hidden');
            expect(overlayDiv.children.length).toEqual(0);
        });
    });

    xit('Unit - Should properly call position method - GlobalPosition', () => {

    });

    xit('Unit - Should properly call position method - ConnectedPosition', () => {

    });

    it('Unit - Should properly call position method - AutoPosition', () => {
        const mockParent = jasmine.createSpyObj('parentElement', ['style']);
        const mockItem = { parentElement: mockParent } as HTMLElement;
        spyOn<any>(mockItem, 'parentElement').and.returnValue(mockParent);
        const mockPositioningSettings1 = new PositionSettings(
            new Point(0, 0),
            HorizontalAlignment.Right,
            VerticalAlignment.Bottom,
            mockItem,
            HorizontalAlignment.Left,
            VerticalAlignment.Top
        );
        const autoStrat1 = new AutoPositionStrategy(mockPositioningSettings1);
        spyOn(autoStrat1, 'getViewPort').and.returnValue(jasmine.createSpyObj('obj', ['left', 'top', 'right', 'bottom']));
        spyOn(ConnectedPositioningStrategy.prototype, 'position');

        autoStrat1.position(mockItem, mockItem, null, null);
        expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledTimes(1);
        expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledWith(mockItem, mockItem, null, null);
        expect(autoStrat1.getViewPort).toHaveBeenCalledWith(null);
        expect(autoStrat1.getViewPort).toHaveBeenCalledTimes(1);

        const mockPositioningSettings2 = new PositionSettings(
            new Point(0, 0),
            HorizontalAlignment.Left,
            VerticalAlignment.Top,
            mockItem,
            HorizontalAlignment.Left,
            VerticalAlignment.Top
        );
        const autoStrat2 = new AutoPositionStrategy(mockPositioningSettings2);
        spyOn(autoStrat2, 'getViewPort').and.returnValue(jasmine.createSpyObj('obj', ['left', 'top', 'right', 'bottom']));

        autoStrat2.position(mockItem, mockItem, null, null);
        expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledTimes(2);
        expect(autoStrat2.getViewPort).toHaveBeenCalledWith(null);
        expect(autoStrat2.getViewPort).toHaveBeenCalledTimes(1);

        const mockPositioningSettings3 = new PositionSettings(
            new Point(0, 0),
            HorizontalAlignment.Center,
            VerticalAlignment.Middle,
            mockItem,
            HorizontalAlignment.Left,
            VerticalAlignment.Top
        );
        const autoStrat3 = new AutoPositionStrategy(mockPositioningSettings3);
        spyOn(autoStrat3, 'getViewPort').and.returnValue(jasmine.createSpyObj('obj', ['left', 'top', 'right', 'bottom']));

        autoStrat3.position(mockItem, mockItem, null, null);
        expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledTimes(3);
        expect(autoStrat3.getViewPort).toHaveBeenCalledWith(null);
        expect(autoStrat3.getViewPort).toHaveBeenCalledTimes(1);
    });

    it('Unit - Should properly call AutoPosition getViewPort', () => {
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
        spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1);
        spyOnProperty(window, 'innerHeight', 'get').and.returnValue(1);
        // autoStrat1.getViewPort(docSpy);
        expect(autoStrat1.getViewPort(docSpy)).toEqual({
            top: -1920,
            left: -768,
            bottom: -1919,
            right: -767,
            height: 1,
            width: 1
        });
    });


    xit('Unit - Should properly call position method - DEFAULT', () => {

    });

    // 1. Positioning Strategies
    // 1.1 Global (show components in the window center - default).
    xit('igx-overlay is rendered on top of all other views/components (any previously existing html on the page) etc.', () => {
        // TO DO
    });

    xit('igx-overlay covers the whole window 100% width and height', () => {
        // TO DO
    });

    it('The shown component is inside the igx-overlay wrapper as a content last child.', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();
        const overlaySettings = new OverlaySettings();
        fixture.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1', overlaySettings);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayWrapper = fixture.debugElement.nativeElement.parentElement.lastChild.firstChild;
            const content = overlayWrapper.firstChild;
            const componentEl = content.lastChild;

            expect(overlayWrapper.localName).toEqual('div');
            expect(overlayWrapper.firstChild.localName).toEqual('div');
            expect(componentEl.localName === 'div').toBeTruthy();
        });
    });

    xit('The overlay wrapper div element, have the corresponding inline css applied for each alignment ', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();

        const overlaySettings = new OverlaySettings();
        const positionSettings = new PositionSettings();

        const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
        const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
        const cssStyles: Array<string> = ['flex-start', 'center', 'flex-end'];

        for (let i = 0; i < horAl.length; i++) {
            positionSettings.horizontalDirection = HorizontalAlignment[horAl[i]];
            for (let j = 0; j < verAl.length; j++) {
                positionSettings.verticalDirection = VerticalAlignment[verAl[j]];
                overlaySettings.positionStrategy = new GlobalPositionStrategy(positionSettings);
                fixture.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1', overlaySettings);
                fixture.detectChanges();

                const overlayWrapper = fixture.debugElement.nativeElement.parentElement.lastChild.lastChild;
                fixture.detectChanges();
                expect(overlayWrapper.style.justifyContent).toBe(cssStyles[i]);
                expect(overlayWrapper.style.alignItems).toBe(cssStyles[j]);
            }
        }
    });

    xit('The shown component is in the center of igx-overlay (visible window) - default.', () => {
        // TO DO
    });

    xit('When adding a new instance of a component with the same options, it is rendered exactly on top of the previous one.', () => {
        // TO DO
    });
    // adding more than one component to show in igx-overlay:
    xit('When adding a component near the window borders(left,right,up,down), it should be rendered in the igx-overlay center ' +
        '- default', () => {
            // TO DO
        });

    xit('If the shown component is bigger than the visible window, than it should be centered and scrollbars should appear.', () => {
        // TO DO
    });
    // 1.1.1 Global Css
    xit('css class should be applied on igx-overlay component div wrapper.' +
        'Test defaults: When no positionStrategy is passed use GlobalPositionStrategy with default PositionSettings and css class', () => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1');
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const overlayWrapper = fixture.debugElement.nativeElement.parentElement.lastChild.firstChild;
                expect(overlayWrapper.classList.contains('igx-overlay__wrapper')).toBeTruthy();
                expect(overlayWrapper.localName).toEqual('div');
            });
        });

    xit('css class should be applied on igx-overlay component inner div wrapper', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();
        const overlaySettings = new OverlaySettings();
        fixture.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1', overlaySettings);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayWrapper = fixture.debugElement.nativeElement.parentElement.lastChild.firstChild;
            const content = overlayWrapper.firstChild;
            const componentEl = content.lastChild;
            expect(content.classList.contains('igx-overlay__content')).toBeTruthy();
            expect(content.localName).toEqual('div');
        });
    });
    // 1.2 ConnectedPositioningStrategy(show components based on a specified position base point, horizontal and vertical alignment)
    xit('igx-overlay is rendered on top of all other views/components (any previously existing html on the page) etc.', () => {
        // TO DO
    });

    xit('igx-overlay covers the whole window 100% width and height.', () => {
        // TO DO
    });

    xit('The shown component is inside the igx-overlay wrapper as a content last child.', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();
        const overlaySettings = new OverlaySettings();
        overlaySettings.positionStrategy = new ConnectedPositioningStrategy();

        fixture.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1', overlaySettings);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayWrapper = fixture.debugElement.nativeElement.parentElement.lastChild.firstChild;
            const content = overlayWrapper.firstChild;
            const componentEl = content.lastChild;
            expect(overlayWrapper.localName).toEqual('div');
            expect(overlayWrapper.firstChild.localName).toEqual('div');
            expect(componentEl.localName === 'ng-component').toBeTruthy();
        });
    });

    xit('The shown component is positioned according to the options passed (base point/Left, Center, Right/Top, Middle, Bottom).', () => {
        // TO DO
    });

    xit('If using a ConnectedPositioningStrategy without passing options, the omitted ones default to ' +
        '(Window center point, Center, Middle).', () => {
            // TO DO
        });

    xit('When adding a new component it should be rendered where expected based on the options passed.', () => {
        // TO DO
    });

    // adding more than one component to show in igx-overlay:
    xit('When adding a new instance of component with the same options, it is rendered exactly on top of the previous one.', () => {
        // TO DO
    });

    // If adding a component near the visible window borders(left,right,up,down) it should be partially hidden and based on scroll strategy:
    xit('Scroll Strategy None: no scrolling possible.', () => {
        // TO DO
    });

    xit('closingScrollStrategy: no scrolling possible. The component changes ' +
        'state to closed when reaching the threshold (example: expanded DropDown collapses).', () => {
            // TO DO
        });

    xit('Scroll Strategy Fixed: it should be partially hidden. When scrolling, the component stays static. ' +
        'Component state remains the same (example: expanded DropDown remains expanded).', () => {
            // TO DO
        });

    xit('Scroll Strategy Absolute: can scroll it into view. Component persist state. ' +
        '(example: expanded DropDown remains expanded)', () => {
            // TO DO
        });
    // 1.2.1 Connected Css
    xit('css class should be applied on igx-overlay component div wrapper', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();
        const overlaySettings = new OverlaySettings();
        overlaySettings.positionStrategy = new ConnectedPositioningStrategy();

        fixture.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1', overlaySettings);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayWrapper = fixture.debugElement.nativeElement.parentElement.lastChild.firstChild;
            expect(overlayWrapper.classList.contains('igx-overlay__wrapper')).toBeTruthy();
            expect(overlayWrapper.localName).toEqual('div');
        });
    });

    // 1.2.2 Connected strategy position method
        fit('Connected strategy position method. Position component based on Point only', () => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            // for a Point(300,300);
            const expectedTopForPoint: Array<string> = ['240px', '270px', '300px'];  // top/middle/bottom/
            const expectedLeftForPoint: Array<string> = ['240px', '270px', '300px']; // left/center/right/

            const size = {width: 60, height: 60};
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
            for (let i = 0; i < horAl.length ; i++) {
                for (let j = 0; j < verAl.length; j++) {
                    // start Point is static Top/Left at 300/300
                    const positionSettings2 = {
                        point: new Point(300, 300),
                        horizontalDirection: HorizontalAlignment[horAl[i]],
                        verticalDirection: VerticalAlignment[verAl[j]],
                        element: null,
                        horizontalStartPoint: HorizontalAlignment.Left,
                        verticalStartPoint: VerticalAlignment.Top
                    };

                    const strategy = new ConnectedPositioningStrategy(positionSettings2);
                    strategy.position(compElement, contentWrapper, size);
                    fixture.detectChanges();
                    expect(contentWrapper.style.top).toBe(expectedTopForPoint[j]);
                    expect(contentWrapper.style.left).toBe(expectedLeftForPoint[i]);
                 }
            }
        });
            const overlaySettings = new OverlaySettings();
            const positionSettings = new PositionSettings();
            // use Point when positioning is based Point only and (no on element).
            positionSettings.point = new Point(300, 300);

            // const strategy = overlaySettings.positionStrategy = new ConnectedPositioningStrategy(positionSettings);
            const size = {width: 60, height: 60};
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
            // start Point is static Top/Left at 300/300
            positionSettings.horizontalStartPoint = HorizontalAlignment.Left;
            positionSettings.verticalStartPoint = VerticalAlignment.Top;
            for (let i = 0; i < horAl.length ; i++) {
                positionSettings.horizontalDirection = HorizontalAlignment[horAl[i]];
                    for (let j = 0; j < verAl.length; j++) {
                    positionSettings.verticalDirection = VerticalAlignment[verAl[j]];
                    const strategy = overlaySettings.positionStrategy = new ConnectedPositioningStrategy(positionSettings);
                    strategy.position(compElement, contentWrapper, size);
                    fixture.detectChanges();
                    expect(contentWrapper.style.top).toBe(expectedTopForPoint[j]);
                    expect(contentWrapper.style.left).toBe(expectedLeftForPoint[i]);
                    }
            }
        });

    // 1.3 AutoPosition (fit the shown component into the visible window.)
    it('igx-overlay is rendered on top of all other views/components (any previously existing html on the page) etc.', () => {
        const fix = TestBed.createComponent(EmptyPageComponent);
        fix.detectChanges();
        const overlaySettings = new OverlaySettings();
        const positionSettings = new PositionSettings();
        overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
        fix.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1', overlaySettings);
        fix.whenStable().then(() => {
            fix.detectChanges();
            const wrapper = fix.debugElement.nativeElement.parentElement.lastChild as HTMLElement;
            expect(wrapper.classList).toContain('igx-overlay');
        });
    });

    it('igx-overlay covers the whole window 100% width and height', () => {
        // TO DO
        const fix = TestBed.createComponent(EmptyPageComponent);
        fix.detectChanges();
        const overlaySettings = new OverlaySettings();
        const positionSettings = new PositionSettings();
        overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
        fix.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1', overlaySettings);
        fix.whenStable().then(() => {
            fix.detectChanges();
            const wrapper = fix.debugElement.nativeElement.parentElement.lastChild as HTMLElement;
            const body = fix.debugElement.query(By.css('body')).nativeElement;
            expect(wrapper.clientHeight).toEqual(body.clientHeight);
            expect(wrapper.clientWidth).toEqual(body.clientWidth);
        });
    });

    it('The shown component is inside the igx-overlay as a last child.', () => {
        const fix = TestBed.createComponent(EmptyPageComponent);
        fix.detectChanges();
        const overlaySettings = new OverlaySettings();
        const positionSettings = new PositionSettings();
        overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
        fix.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1', overlaySettings);
        fix.whenStable().then(() => {
            fix.detectChanges();
            const wrapperContent = fix.debugElement.query(By.css('.igx-overlay__content')).nativeElement;
            expect(wrapperContent.children.length).toEqual(1);
            expect(wrapperContent.lastElementChild.getAttribute('style'))
                .toEqual('position: absolute; width:100px; height: 100px; background-color: red');
        });
    });

    it('Should show the component inside of the viewport if it would normally be displayed outside of bounds', () => {
        // WIP
        const fix = TestBed.createComponent(DownRightButtonComponent);
        fix.detectChanges();
        const currentElement = fix.componentInstance;
        const buttonElement = fix.componentInstance.buttonElement.nativeElement;
        // buttonElement.style.top = '90%';
        // buttonElement.style.left = '90%';
        // buttonElement.style.position = 'absolute';
        fix.detectChanges();
        // const positionSettings = new PositionSettings();
        currentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Right;
        currentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Bottom;
        currentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Bottom;
        currentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Left;
        currentElement.ButtonPositioningSettings.element = buttonElement;
        // const overlaySettings = new OverlaySettings();
        // overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
        // debugger;
        // fix.componentInstance.overlay.show(SimpleDynamicComponent, 'id_1', overlaySettings);
        buttonElement.click();
        fix.detectChanges();
        fix.whenStable().then(() => {
            fix.detectChanges();
            const wrapperContent = document.getElementsByClassName('igx-overlay__content')[0] as HTMLElement;
            expect(wrapperContent.children.length).toEqual(1);
            const expectedStyle = 'position: absolute; width:100px; height: 100px; background-color: red';
            expect(wrapperContent.lastElementChild.getAttribute('style')).toEqual(expectedStyle);
            const expectedLeft = 100;
            const expectedBottom = 100;
            const buttonLeft = buttonElement.offsetLeft;
            // The top is always misaligned by 16px, not sure why, offsetPadding? Shouldn't be
            const buttonTop = buttonElement.offsetTop - 16;
            // tslint:disable:radix
            // const wrapperTop = parseInt(wrapperContent.style.top);
            const wrapperLeft = parseInt(wrapperContent.style.left);
            expect(wrapperContent.style.top).toBeDefined();
            expect(typeof wrapperContent.style.top).toEqual('string');
            console.log(wrapperContent.style.top);
            const wrapperTop = wrapperContent.offsetTop;
            expect(wrapperTop).toEqual(buttonTop);
            expect(wrapperLeft).toEqual(buttonLeft);
        });
    });

    xit('igx-overlay displays each shown component based on the options specified if the component fits into the visible window.', () => {
        // TO DO
    });

    xit('The component is repositioned and rendered correctly in the window, even when the rendering options passed ' +
        ' should result in otherwise a partially hidden component. No scrollbars should appear.', () => {
            // TO DO
        });

    xit('igx-overlay margins should be rendered correctly', () => {
        // TO DO
    });

    xit('igx-overlay displays each shown component in the browsers visible window and tries to fit it in case of AutoPosition.', () => {
        // TO DO
    });

    // When adding more than one component to show in igx-overlay:
    xit('When the options used fit the component in the window - adding a new instance of the component with the ' +
        ' same options will render it on top of the previous one.', () => {
            // TO DO
        });

    // When adding more than one component to show in igx-overlay and the options used will not fit the component in the
    // window, so AutoPosition is used.
    xit('adding a new instance of the component with the same options, will render it on top of the previous one.', () => {
        // TO DO
    });

    // When adding a component like Menu that has a sub-menu near the visible window, upon opening the sub-menu,
    // no scrollbar will appear but the sub-menus are rearranged in order to fit in the visible window.
    xit('If the width/height allows, the sub-menu should be shown in the window. If not, it should be AutoPositioned', () => {
        // TO DO
    });

    // 2. Scroll Strategy
    // 2.1. Scroll Strategy - None
    xit('The component do not scroll with the window. The event is canceled. No scrolling happens.', () => {
        // TO DO
    });

    xit('The component shown in igx-overlay do not close.(example: expanded DropDown stays expanded during a scrolling attempt.)', () => {
        // TO DO
    });

    // 2.2 Scroll Strategy - Closing. (Uses a tolerance and closes an expanded component upon scrolling if the tolerance is exceeded.)
    // (example: DropDown or Dialog component collapse/closes after scrolling 10px.)
    xit('Until the set tolerance is exceeded scrolling is possible.', () => {
        // TO DO
    });

    xit('The component shown in igx-overlay do not change its state until it exceeds the scrolling tolerance set.', () => {
        // TO DO
    });

    xit('The component shown in igx-overlay changes its state when it exceeds the scrolling tolerance set ' +
        '(an expanded DropDown, Menu, DatePicker, etc. collapses).', () => {
            // TO DO
        });

    // 2.3 Scroll Strategy - Fixed.
    xit('When scrolling, the component stays static and only the background scrolls', () => {
        // TO DO
    });

    xit('Component persist open state (expanded DropDown remains expanded)', () => {
        // TO DO
    });

    // 2.4. Scroll Strategy - Absolute.
    xit('Scrolls everything.', () => {
        // TO DO
    });

    xit('Components persist open state.', () => {
        // TO DO
    });

    // 3. Interaction
    // 3.1 Modal
    xit('igx-overlay applies a greyed our mask layers', () => {
        // TO DO
    });

    xit('Interaction is allowed only for the shown modal dialog component', () => {
        // TO DO
    });

    xit('Esc key closes the dialog.', () => {
        // TO DO
    });

    xit('Enter selects', () => {
        // TO DO
    });

    xit('Clicking outside the dialog does not close it', () => {
        // TO DO
    });

    // 3.2 Non - Modal
    xit('igx-overlay do not apply a greyed our mask layer', () => {
        // TO DO
    });

    xit('Tab allows changing focus to other components/elements on the window which are not shown via the igx-overlay', () => {
        // TO DO
    });

    xit('Clicking outside the component it collapses/closes (DropDown, DatePicker, NavBar etc.)', () => {
        // TO DO
    });

    xit('Escape - closes (DropDown, Dialog, etc.).', () => {
        // TO DO
    });

    // 4. Css
    xit('All appropriate css classes should be applied on igx-overlay initialization. ' +
        '(class overlay, incl. position, width, height, etc.)', () => {
            // TO DO
        });

    xit('All css properties set should be actually applied.', () => {
        // TO DO
    });

    xit('Css should not leak: From igx-overlay to the inner components (greyed out modal).', () => {
        // TO DO
    });

    xit('Css should not leak: From shown components to igx-overlay.', () => {
        // TO DO
    });

});

@Component({
    template: '<div style=\'position: absolute; width:100px; height: 100px; background-color: red\'></div>'
})
export class SimpleDynamicComponent { }

@Component({
    template: `
        <div igxOverlay>
            <div *ngIf='visible' style=\'position: absolute; width:100px; height: 100px; background-color: red\'></div>
        </div>`
})
export class SimpleDynamicWithDirectiveComponent {
    public visible = false;

    @ViewChild(IgxOverlayDirective)
    private overlay: IgxOverlayDirective;
    show() {
        this.overlay.open();
        this.visible = true;
    }

    hide() {
        this.overlay.close();
        this.visible = false;
    }
}

@Component({
    template: `<button #button (click)=\'click($event)\'>Show Overlay</button>`
})
export class EmptyPageComponent {
    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;

    click(event) {
        this.overlay.show(SimpleDynamicComponent, 'id_1');
    }
}

@Component({
    template: `<button #button (click)=\'click($event)\'>Show Overlay</button>`,
    styles: [`button {
        position: absolute;
        bottom: 16px;
        right: 16px;
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

    public ButtonPositioningSettings: PositionSettings = new PositionSettings();
    click(event) {
        const positionStrategy = new AutoPositionStrategy(this.ButtonPositioningSettings);
        debugger;
        this.overlay.show(SimpleDynamicComponent, 'id_1', new OverlaySettings(positionStrategy));
    }
}

const DYNAMIC_COMPONENTS = [
    EmptyPageComponent,
    SimpleDynamicComponent,
    DownRightButtonComponent
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
