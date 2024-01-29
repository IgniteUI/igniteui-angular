import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxButtonDirective } from './button.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { DisplayDensity } from '../../core/density';
import { IgxRippleDirective } from '../ripple/ripple.directive';
import { IgxIconComponent } from '../../icon/icon.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { getComponentSize } from '../../core/utils';

const BUTTON_COMFORTABLE = 'igx-button';

describe('IgxButton', () => {
    configureTestSuite();

    const baseClass = BUTTON_COMFORTABLE;
    const classes = {
        flat: `${baseClass}--flat`,
        contained: `${baseClass}--contained`,
        outlined: `${baseClass}--outlined`,
        fab: `${baseClass}--fab`,
    };

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                InitButtonComponent,
                ButtonWithAttribsComponent,
                ButtonsWithDisplayDensityComponent
            ]
        }).compileComponents();
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
        expect(button.classList.contains('igx-button--contained')).toBe(true);
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
        // Get contained button
        const containedButton = fixture.componentInstance.containedButton;
        const containedButtonDOM = fixture.debugElement.query(By.css('.containedBtn'));
        // Get outlined button
        const outlinedButton = fixture.componentInstance.outlinedButton;
        const outlinedButtonDOM = fixture.debugElement.query(By.css('.outlinedBtn'));
        // Get fab button
        const fabButton = fixture.componentInstance.fabButton;
        const fabButtonDOM = fixture.debugElement.query(By.css('.fabBtn'));

        verifyDisplayDensity(flatButton, flatButtonDOM, DisplayDensity.comfortable);
        verifyDisplayDensity(containedButton, containedButtonDOM, DisplayDensity.comfortable);
        verifyDisplayDensity(outlinedButton, outlinedButtonDOM, DisplayDensity.comfortable);
        verifyDisplayDensity(fabButton, fabButtonDOM, DisplayDensity.comfortable);

        fixture.componentInstance.density = DisplayDensity.compact;
        fixture.detectChanges();

        verifyDisplayDensity(flatButton, flatButtonDOM, DisplayDensity.compact);
        verifyDisplayDensity(containedButton, containedButtonDOM, DisplayDensity.compact);
        verifyDisplayDensity(outlinedButton, outlinedButtonDOM, DisplayDensity.compact);
        verifyDisplayDensity(fabButton, fabButtonDOM, DisplayDensity.compact);

        fixture.componentInstance.density = DisplayDensity.cosy;
        fixture.detectChanges();

        verifyDisplayDensity(flatButton, flatButtonDOM, DisplayDensity.cosy);
        verifyDisplayDensity(containedButton, containedButtonDOM, DisplayDensity.cosy);
        verifyDisplayDensity(outlinedButton, outlinedButtonDOM, DisplayDensity.cosy);
        verifyDisplayDensity(fabButton, fabButtonDOM, DisplayDensity.cosy);
    });

    it('Should set the correct CSS class on the element using the "type" input', () => {
        const fixture = TestBed.createComponent(InitButtonComponent);
        fixture.detectChanges();
        const theButton = fixture.componentInstance.button;
        const theButtonNativeEl = theButton.nativeElement;
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.flat);

        theButton.type = 'contained';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.contained);

        theButton.type = 'outlined';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.outlined);

        theButton.type = 'fab';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.fab);

        theButton.type = 'flat';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(2);
        expect(theButtonNativeEl.classList).toContain(classes.flat);
    });

    it('Should emit the buttonSelected event only on user interaction, not on initialization', () => {
        const fixture = TestBed.createComponent(InitButtonComponent);
        fixture.detectChanges();
        const button = fixture.componentInstance.button;
        spyOn(button.buttonSelected, 'emit');

        button.ngOnInit();
        expect(button.buttonSelected.emit).not.toHaveBeenCalled();

        button.nativeElement.click();
        fixture.detectChanges();
        expect(button.buttonSelected.emit).toHaveBeenCalledTimes(1);

        button.nativeElement.click();
        fixture.detectChanges();
        expect(button.buttonSelected.emit).toHaveBeenCalledTimes(2);
    });
});

@Component({
    template: `<span igxButton="flat" igxRipple="white">
        <i class="material-icons">add</i>
    </span>`,
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective]
})
class InitButtonComponent {
    @ViewChild(IgxButtonDirective, { read: IgxButtonDirective, static: true })
    public button: IgxButtonDirective;
}

@Component({
    template: `<span igxButton="contained"
        [igxButtonColor]="foreground"
        [igxButtonBackground]="background"
        [disabled]="disabled">Test</span>`,
    standalone: true,
    imports: [IgxButtonDirective]
})
class ButtonWithAttribsComponent {
    public disabled = true;
    public foreground = 'white';
    public background = 'black';
}

@Component({
    template: `
    <button #flat class="flatBtn" igxButton="flat" [displayDensity]="density">Flat</button>
    <button #contained class="containedBtn" igxButton="contained" [displayDensity]="density">contained</button>
    <button #outlined class="outlinedBtn" igxButton="outlined" [displayDensity]="density">Outlined</button>
    <button #fab class="fabBtn" igxButton="fab" [displayDensity]="density">
        <igx-icon>favorite</igx-icon>
    </button>
    `,
    standalone: true,
    imports: [IgxButtonDirective, IgxIconComponent]
})
class ButtonsWithDisplayDensityComponent {
    @ViewChild('flat', { read: IgxButtonDirective, static: true })
    public flatButton: IgxButtonDirective;
    @ViewChild('contained', { read: IgxButtonDirective, static: true })
    public containedButton: IgxButtonDirective;
    @ViewChild('outlined', { read: IgxButtonDirective, static: true })
    public outlinedButton: IgxButtonDirective;
    @ViewChild('fab', { read: IgxButtonDirective, static: true })
    public fabButton: IgxButtonDirective;

    public density: DisplayDensity = DisplayDensity.comfortable;
}

/**
 * Verifies the display density of the igxButton based on its type.
 */
const verifyDisplayDensity = (buttonDirective, buttonDebugEl, expectedDisplayDensity: DisplayDensity) => {
    let expectedButtonSize = '';

    switch (expectedDisplayDensity) {
        case DisplayDensity.compact:
            expectedButtonSize = '1';
            break;
        case DisplayDensity.cosy:
            expectedButtonSize = '2';
            break;
        case DisplayDensity.comfortable:
        default:
            expectedButtonSize = '3';
    }

    expect(getComponentSize(buttonDebugEl.nativeElement)).toBe(expectedButtonSize);
    expect(buttonDirective.displayDensity).toBe(expectedDisplayDensity);
};
