import {
    Component,
    ElementRef,
    Inject,
    NgModule,
    ViewChild
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { IgxOverlayService } from './overlay';

fdescribe('igxOverlay', () => {
    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                DynamicModule
            ],
            declarations: [
                EmptyPageComponent
            ],
            providers: [IgxOverlayService]
        }).compileComponents();
    });
    it('Unit - OverlayElement should return a div attached to Document\'s body', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();

        fixture.componentInstance.buttonElement.nativeElement.click();
        fixture.whenStable().then(() => {
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('block');
            expect(overlayDiv.classList.contains('overlay')).toBeTruthy();
            fixture.componentInstance.overlay.hideAll();
        });
    });
    it('Unit - Should show component passed to overlay',  () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();

        fixture.componentInstance.buttonElement.nativeElement.click();
        fixture.whenStable().then(() => {
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('block');
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('ng-component');

            fixture.componentInstance.overlay.hideAll();
        });
    });
    fit('Unit - Hide() should hide component and overlay',  () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();

        fixture.componentInstance.overlay.show(SimpleDynamicComponent);
        fixture.componentInstance.overlay.show(SimpleDynamicComponent);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('block');
            expect(overlayDiv.children.length).toEqual(2);
            expect(overlayDiv.children[0].localName).toEqual('ng-component');
            expect(overlayDiv.children[1].localName).toEqual('ng-component');

            fixture.componentInstance.overlay.hide(1);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('block');
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('ng-component');

            fixture.componentInstance.overlay.hide(0);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('none');
            expect(overlayDiv.children.length).toEqual(0);
        });
    });
    fit('Unit - HideAll() should hide all components and overlay',  () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();
        fixture.componentInstance.overlay.show(SimpleDynamicComponent);
        fixture.componentInstance.overlay.show(SimpleDynamicComponent);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('block');
            expect(overlayDiv.children.length).toEqual(2);
            expect(overlayDiv.children[0].localName).toEqual('ng-component');
            expect(overlayDiv.children[1].localName).toEqual('ng-component');

            fixture.componentInstance.overlay.hideAll();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('none');
            expect(overlayDiv.children.length).toEqual(0);
        });
    });

// 1. Positioning Strategies
    // 1.1 Center (show components in the window center).
    xit('igx-overlay is rendered on top of all other views/components (any previously existing html on the page) etc.', () => {
        // TO DO
    });

    xit('igx-overlay covers the whole window 100% width and height', () => {
        // TO DO
    });

    xit('The shown component is inside the igx-overlay as a last child.', () => {
        // TO DO
    });

    xit('The shown component is in the center of igx-overlay (visible window).', () => {
        // TO DO
    });

    xit('When adding a new instance of a component with the same options, it is rendered exactly on top of the previous one.', () => {
        // TO DO
    });
    // adding more than one component to show in igx-overlay:
    xit('When adding a component near the window borders(left,right,up,down), it should be rendered in the igx-overlay center', () => {
        // TO DO
    });

    xit('If the shown component is bigger than the visible window, than it should be centered and scrollbars should appear.', () => {
        // TO DO
    });

    // 1.2 ConnectedPositioningStrategy(show components based on a specified position base point, horizontal and vertical alignment)
    xit('igx-overlay is rendered on top of all other views/components (any previously existing html on the page) etc.', () => {
        // TO DO
    });

    xit('igx-overlay covers the whole window 100% width and height.', () => {
        // TO DO
    });

    xit('The shown component is inside the igx-overlay as a last child.', () => {
        // TO DO
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

    // 1.3 AutoPosition (fit the shown component into the visible window.)
    xit('igx-overlay is rendered on top of all other views/components (any previously existing html on the page) etc.', () => {
        // TO DO
    });

    xit('igx-overlay covers the whole window 100% width and height', () => {
        // TO DO
    });

    xit('The shown component is inside the igx-overlay as a last child.', () => {
        // TO DO
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
    template: '<button #button (click)=\'click($event)\'>Show Overlay</button>'
})
export class EmptyPageComponent {
    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;

    click(event) {
        this.overlay.show(SimpleDynamicComponent);
    }
}

@Component({
    template: '<div style=\'position: absolute; width:100px; height: 100px; background-color: red\'></div>'
})
export class SimpleDynamicComponent { }

const TEST_COMPONENTS = [
    SimpleDynamicComponent
];

@NgModule({
    imports: [BrowserModule],
    declarations: [TEST_COMPONENTS],
    exports: [TEST_COMPONENTS],
    // bootstrap: [TEST_COMPONENTS],
    entryComponents: [TEST_COMPONENTS]
})
export class DynamicModule { }
