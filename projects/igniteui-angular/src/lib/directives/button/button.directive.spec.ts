import { Component, ViewChild } from '@angular/core';
import {
    async,
    TestBed
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxButtonDirective } from './button.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxIconComponent, IgxIconService } from '../../icon';
import { DisplayDensity } from '../../core/density';

const FLAT_RAISED_OUTLINED_BUTTON_COMPACT = 'igx-button--compact';
const FLAT_RAISED_OUTLINED_BUTTON_COSY = 'igx-button--cosy';
const FAB_BUTTON_COMPACT = 'igx-button--fab-compact';
const FAB_BUTTON_COSY = 'igx-button--fab-cosy';

describe('IgxButton', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitButtonComponent,
                ButtonWithAttribsComponent,
                ButtonsWithDisplayDensityComponent,
                IgxButtonDirective,
                IgxIconComponent
            ],
            providers: [IgxIconService]
        })
            .compileComponents();
    }));

    it('Initializes a button', () => {
        const fixture = TestBed.createComponent(InitButtonComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('span.igx-button--flat'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('i.material-icons'))).toBeTruthy();
    });

    it('Button with properties', () => {
        const fixture = TestBed.createComponent(ButtonWithAttribsComponent);
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.css('span')).nativeElement;

        expect(button).toBeTruthy();
        expect(button.classList.contains('igx-button--raised')).toBe(true);
        expect(button.classList.contains('igx-button--disabled')).toBe(true);

        fixture.componentInstance.disabled = false;
        fixture.detectChanges();

        expect(button.classList.contains('igx-button--disabled')).toBe(false);
        expect(button.style.color).toEqual('white');
        expect(button.style.background).toEqual('black');

        fixture.componentInstance.foreground = 'yellow';
        fixture.componentInstance.background = 'green';
        fixture.detectChanges();

        expect(button.style.color).toEqual('yellow');
        expect(button.style.background).toEqual('green');
    });

    it('Should apply display density to respective buttons correctly', () => {
        const fixture = TestBed.createComponent(ButtonsWithDisplayDensityComponent);
        fixture.detectChanges();

        // Get flat button
        const flatButton = fixture.componentInstance.flatButton;
        const flatButtonDOM = fixture.debugElement.query(By.css('.flatBtn'));
        // Get raised button
        const raisedButton = fixture.componentInstance.raisedButton;
        const raisedButtonDOM = fixture.debugElement.query(By.css('.raisedBtn'));
        // Get outlined button
        const outlinedButton = fixture.componentInstance.outlinedButton;
        const outlinedButtonDOM = fixture.debugElement.query(By.css('.outlinedBtn'));
        // Get fab button
        const fabButton = fixture.componentInstance.fabButton;
        const fabButtonDOM = fixture.debugElement.query(By.css('.fabBtn'));
        // Get icon button
        const iconButton = fixture.componentInstance.iconButton;
        const iconButtonDOM = fixture.debugElement.query(By.css('.iconBtn'));

        verifyDisplayDensity(flatButton, flatButtonDOM, 'flat', DisplayDensity.comfortable);
        verifyDisplayDensity(raisedButton, raisedButtonDOM, 'raised', DisplayDensity.comfortable);
        verifyDisplayDensity(outlinedButton, outlinedButtonDOM, 'outlined', DisplayDensity.comfortable);
        verifyDisplayDensity(fabButton, fabButtonDOM, 'fab', DisplayDensity.comfortable);
        verifyDisplayDensity(iconButton, iconButtonDOM, 'icon', DisplayDensity.comfortable);

        fixture.componentInstance.density = DisplayDensity.compact;
        fixture.detectChanges();

        verifyDisplayDensity(flatButton, flatButtonDOM, 'flat', DisplayDensity.compact);
        verifyDisplayDensity(raisedButton, raisedButtonDOM, 'raised', DisplayDensity.compact);
        verifyDisplayDensity(outlinedButton, outlinedButtonDOM, 'outlined', DisplayDensity.compact);
        verifyDisplayDensity(fabButton, fabButtonDOM, 'fab', DisplayDensity.compact);
        verifyDisplayDensity(iconButton, iconButtonDOM, 'icon', DisplayDensity.compact);

        fixture.componentInstance.density = DisplayDensity.cosy;
        fixture.detectChanges();

        verifyDisplayDensity(flatButton, flatButtonDOM, 'flat', DisplayDensity.cosy);
        verifyDisplayDensity(raisedButton, raisedButtonDOM, 'raised', DisplayDensity.cosy);
        verifyDisplayDensity(outlinedButton, outlinedButtonDOM, 'outlined', DisplayDensity.cosy);
        verifyDisplayDensity(fabButton, fabButtonDOM, 'fab', DisplayDensity.cosy);
        verifyDisplayDensity(iconButton, iconButtonDOM, 'icon', DisplayDensity.cosy);
    });

    it('Should set the correct CSS class on the element using the "type" input', () => {
        const fixture = TestBed.createComponent(InitButtonComponent);
        fixture.detectChanges();
        const theButton = fixture.componentInstance.button;
        const theButtonNativeEl = theButton.nativeElement;

        theButton.type = 'raised';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList).toEqual('igx-button--raised');

        theButton.type = 'outlined';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList).toEqual('igx-button--outlined');

        theButton.type = 'fab';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList).toEqual('igx-button--fab');

        theButton.type = 'icon';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList).toEqual('igx-button--icon');

        theButton.type = 'flat';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList).toEqual('igx-button--flat');
    });
});

@Component({
    template:
        `<span igxButton="flat" igx-ripple="white">
        <i class="material-icons">add</i>
    </span>`
})
class InitButtonComponent {
    @ViewChild(IgxButtonDirective, { read: IgxButtonDirective })
    button: IgxButtonDirective;
}

@Component({
    template:
        `<span igxButton="raised"
        [igxButtonColor]="foreground"
        [igxButtonBackground]="background"
        [disabled]="disabled">Test</span>`
})
class ButtonWithAttribsComponent {
    public disabled = true;
    public foreground = 'white';
    public background = 'black';
}

@Component({
    template:
        `
    <button #flat class="flatBtn" igxButton="flat" [displayDensity]="density">Flat</button>
    <button #raised class="raisedBtn" igxButton="raised" [displayDensity]="density">Raised</button>
    <button #outlined class="outlinedBtn" igxButton="outlined" [displayDensity]="density">Outlined</button>
    <button #fab class="fabBtn" igxButton="fab" [displayDensity]="density">
        <igx-icon fontSet="material">favorite</igx-icon>
    </button>
    <button #icon class="iconBtn" igxButton="icon" [displayDensity]="density">
        <igx-icon fontSet="material">search</igx-icon>
    </button>
    `
})
class ButtonsWithDisplayDensityComponent {
    public density: DisplayDensity = DisplayDensity.comfortable;

    @ViewChild('flat', { read: IgxButtonDirective, static: true }) flatButton: IgxButtonDirective;
    @ViewChild('raised', { read: IgxButtonDirective, static: true }) raisedButton: IgxButtonDirective;
    @ViewChild('outlined', { read: IgxButtonDirective, static: true }) outlinedButton: IgxButtonDirective;
    @ViewChild('fab', { read: IgxButtonDirective, static: true }) fabButton: IgxButtonDirective;
    @ViewChild('icon', { read: IgxButtonDirective, static: true }) iconButton: IgxButtonDirective;
}

/**
 * Verifies the display density of the igxButton based on its type.
*/
function verifyDisplayDensity(buttonDirective, buttonDebugEl, buttonType, expectedDisplayDensity: DisplayDensity) {
    let expectedButtonDensityClass = '';

    switch (expectedDisplayDensity) {
        case DisplayDensity.compact: {
            if (buttonType === 'flat' || buttonType === 'raised' || buttonType === 'outlined') {
                expectedButtonDensityClass = FLAT_RAISED_OUTLINED_BUTTON_COMPACT;
            } else if (buttonType === 'fab') {
                expectedButtonDensityClass = FAB_BUTTON_COMPACT;
            }
        } break;
        case DisplayDensity.cosy: {
            if (buttonType === 'flat' || buttonType === 'raised' || buttonType === 'outlined') {
                expectedButtonDensityClass = FLAT_RAISED_OUTLINED_BUTTON_COSY;
            } else if (buttonType === 'fab') {
                expectedButtonDensityClass = FAB_BUTTON_COSY;
            }
        } break;
        default: break;
    }

    const buttonNativeElement = buttonDebugEl.nativeElement;
    if (buttonType === 'icon') {
        // Icon buttons do not have visual changes for displayDensity.
        expect(buttonNativeElement.classList.length).toBe(2);
    } else {
        if (expectedDisplayDensity === DisplayDensity.comfortable) {
            // For 'comfortable', the buttons should have no additional css class added.
            expect(buttonNativeElement.classList.length).toBe(2);
            expect(buttonNativeElement.classList.contains(expectedButtonDensityClass)).toBe(false, 'Contains density class!');
        } else {
            // For 'compact' and 'cosy', the buttons should have an additional css class added.
            expect(buttonNativeElement.classList.length).toBe(3);
            expect(buttonNativeElement.classList.contains(expectedButtonDensityClass)).toBe(true, 'Missing density class!');
        }
    }
    expect(buttonDirective.displayDensity).toBe(expectedDisplayDensity);
}
