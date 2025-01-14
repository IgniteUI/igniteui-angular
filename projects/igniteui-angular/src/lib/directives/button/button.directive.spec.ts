import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxButtonDirective } from './button.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxRippleDirective } from '../ripple/ripple.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
                ButtonWithAttribsComponent
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

        fixture.detectChanges();
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
    imports: [IgxButtonDirective, IgxRippleDirective]
})
class InitButtonComponent {
    @ViewChild(IgxButtonDirective, { read: IgxButtonDirective, static: true })
    public button: IgxButtonDirective;
}

@Component({
    template: `<span igxButton="contained" [disabled]="disabled">Test</span>`,
    imports: [IgxButtonDirective]
})
class ButtonWithAttribsComponent {
    public disabled = true;
}
