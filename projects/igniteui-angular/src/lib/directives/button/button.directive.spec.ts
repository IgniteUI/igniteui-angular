import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxButtonDirective } from './button.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxIconComponent, IgxIconService } from '../../icon/public_api';
import { DisplayDensity } from '../../core/density';

const BUTTON_COMFORTABLE = 'igx-button';
const BUTTON_COSY = 'igx-button--cosy';
const BUTTON_COMPACT = 'igx-button--compact';

describe('IgxButton', () => {
    configureTestSuite();

    const baseClass = BUTTON_COMFORTABLE;
    const classes = {
        flat: `${baseClass}--flat`,
        raised: `${baseClass}--raised`,
        outlined: `${baseClass}--outlined`,
        fab: `${baseClass}--fab`,
        icon: `${baseClass}--icon`
    };

    beforeAll(waitForAsync(() => {
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
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.flat);

        theButton.type = 'raised';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.raised);

        theButton.type = 'outlined';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.outlined);

        theButton.type = 'fab';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.fab);

        theButton.type = 'icon';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.icon);

        theButton.type = 'flat';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.flat);
    });
});

@Component({
    template:
        `<span igxButton="flat" igx-ripple="white">
        <i class="material-icons">add</i>
    </span>`
})
class InitButtonComponent {
    @ViewChild(IgxButtonDirective, { read: IgxButtonDirective, static: true })
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
        <igx-icon>favorite</igx-icon>
    </button>
    <button #icon class="iconBtn" igxButton="icon" [displayDensity]="density">
        <igx-icon>search</igx-icon>
    </button>
    `
})
class ButtonsWithDisplayDensityComponent {
    @ViewChild('flat', { read: IgxButtonDirective, static: true }) flatButton: IgxButtonDirective;
    @ViewChild('raised', { read: IgxButtonDirective, static: true }) raisedButton: IgxButtonDirective;
    @ViewChild('outlined', { read: IgxButtonDirective, static: true }) outlinedButton: IgxButtonDirective;
    @ViewChild('fab', { read: IgxButtonDirective, static: true }) fabButton: IgxButtonDirective;
    @ViewChild('icon', { read: IgxButtonDirective, static: true }) iconButton: IgxButtonDirective;

    public density: DisplayDensity = DisplayDensity.comfortable;
}

/**
 * Verifies the display density of the igxButton based on its type.
 */
const verifyDisplayDensity = (buttonDirective, buttonDebugEl, buttonType, expectedDisplayDensity: DisplayDensity) => {
    let expectedButtonDensityClass = '';

    switch (expectedDisplayDensity) {
        case DisplayDensity.compact:
            expectedButtonDensityClass = BUTTON_COMPACT;
            break;
        case DisplayDensity.cosy:
            expectedButtonDensityClass = BUTTON_COSY;
            break;
        default:
            expectedButtonDensityClass = BUTTON_COMFORTABLE;
    }

    const buttonNativeElement = buttonDebugEl.nativeElement;
    if (expectedDisplayDensity === DisplayDensity.comfortable) {
        // For 'comfortable', the buttons should have no additional CSS classes added.
        expect(buttonNativeElement.classList.length).toBe(3);
        expect(buttonNativeElement.classList.contains(expectedButtonDensityClass)).toBe(true, 'Contains density class!');
    } else {
        // For 'compact' and 'cosy', the buttons should have an additional CSS class added.
        expect(buttonNativeElement.classList.length).toBe(4);
        expect(buttonNativeElement.classList.contains(expectedButtonDensityClass)).toBe(true, 'Missing density class!');
    }
    expect(buttonDirective.displayDensity).toBe(expectedDisplayDensity);
};
