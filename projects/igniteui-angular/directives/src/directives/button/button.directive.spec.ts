import { Component, ViewChild, ChangeDetectionStrategy, input } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxButtonDirective } from './button.directive';

import { IgxRippleDirective } from '../ripple/ripple.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const BUTTON_COMFORTABLE = 'igx-button';

describe('IgxButton', () => {

    const baseClass = BUTTON_COMFORTABLE;
    const classes = {
        flat: `${baseClass}--flat`,
        contained: `${baseClass}--contained`,
        outlined: `${baseClass}--outlined`,
        fab: `${baseClass}--fab`,
        ready: `${baseClass}--ready`,
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                InitButtonComponent,
                ButtonWithAttribsComponent,
                ButtonWithRoleComponent
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
        fixture.detectChanges(); // applies the post-render `--ready` class
        const theButton = fixture.componentInstance.button;
        const theButtonNativeEl = theButton.nativeElement;
        expect(theButtonNativeEl.classList.length).toEqual(3);
        expect(theButtonNativeEl.classList).toContain(classes.flat);

        theButton.type = 'contained';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(3);
        expect(theButtonNativeEl.classList).toContain(classes.contained);

        theButton.type = 'outlined';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(3);
        expect(theButtonNativeEl.classList).toContain(classes.outlined);

        theButton.type = 'fab';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(3);
        expect(theButtonNativeEl.classList).toContain(classes.fab);

        theButton.type = 'flat';
        fixture.detectChanges();
        expect(theButtonNativeEl.classList.length).toEqual(3);
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

    it('Should enable transitions only after the first render', () => {
        const fixture = TestBed.createComponent(InitButtonComponent);
        const classList = fixture.componentInstance.button.nativeElement.classList;

        // First pass renders the resting styles without transitions.
        fixture.detectChanges();
        expect(classList).not.toContain(classes.ready);

        // The post-render hook flips the signal; the next pass applies the class.
        fixture.detectChanges();
        expect(classList).toContain(classes.ready);
    });

    it('Should let the template override the role attribute', () => {
        const fixture = TestBed.createComponent(ButtonWithRoleComponent);
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.css('span')).nativeElement as HTMLElement;
        expect(button.getAttribute('role')).toBe('menuitem');
    });

    describe('aria-label', () => {
        it('should keep a static aria-label', () => {
            const fixture = TestBed.createComponent(ButtonWithAriaLabelComponent);
            fixture.detectChanges();
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('span').getAttribute('aria-label')).toBe('Save');
        });

        it('should keep a bound aria-label', () => {
            const fixture = TestBed.createComponent(ButtonWithBoundAriaLabelComponent);
            fixture.detectChanges();
            const button = fixture.nativeElement.querySelector('span') as HTMLElement;

            expect(button.getAttribute('aria-label')).toBe('Save');

            fixture.componentRef.setInput('ariaLabel', 'Close');
            fixture.detectChanges();

            expect(button.getAttribute('aria-label')).toBe('Close');
        });

        it('should not add an aria-label when neither aria-label nor igxLabel is set', () => {
            const fixture = TestBed.createComponent(ButtonWithAttribsComponent);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('span').hasAttribute('aria-label')).toBe(false);
        });

        it('should set aria-label from igxLabel', () => {
            const fixture = TestBed.createComponent(ButtonWithIgxLabelComponent);
            fixture.detectChanges();
            const button = fixture.nativeElement.querySelector('span') as HTMLElement;

            expect(button.getAttribute('aria-label')).toBe('Close');

            fixture.componentRef.setInput('label', 'Dismiss');
            fixture.detectChanges();

            expect(button.getAttribute('aria-label')).toBe('Dismiss');
        });

        it('should remove the aria-label it set when igxLabel is cleared', () => {
            const fixture = TestBed.createComponent(ButtonWithIgxLabelComponent);
            fixture.detectChanges();
            const button = fixture.nativeElement.querySelector('span') as HTMLElement;

            fixture.componentRef.setInput('label', null);
            fixture.detectChanges();

            expect(button.hasAttribute('aria-label')).toBe(false);
        });

        it('should restore the static aria-label when igxLabel is cleared', () => {
            const fixture = TestBed.createComponent(ButtonWithAriaLabelAndIgxLabelComponent);
            fixture.detectChanges();
            const button = fixture.nativeElement.querySelector('span') as HTMLElement;

            expect(button.getAttribute('aria-label')).toBe('Close');

            fixture.componentRef.setInput('label', null);
            fixture.detectChanges();

            expect(button.getAttribute('aria-label')).toBe('Save');
        });
    });
});

@Component({
    template: `<span igxButton="flat" igxRipple="white">
        <i class="material-icons">add</i>
    </span>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective, IgxRippleDirective]
})
class InitButtonComponent {
    @ViewChild(IgxButtonDirective, { read: IgxButtonDirective, static: true })
    public button: IgxButtonDirective;
}

@Component({
    template: `<span igxButton="contained" [disabled]="disabled">Test</span>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective]
})
class ButtonWithAttribsComponent {
    public disabled = true;
}

@Component({
    template: `<span igxButton role="menuitem">Test</span>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective]
})
class ButtonWithRoleComponent {
}

@Component({
    template: `<span igxButton aria-label="Save">Test</span>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective]
})
class ButtonWithAriaLabelComponent {
}

@Component({
    template: `<span igxButton [attr.aria-label]="ariaLabel()">Test</span>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective]
})
class ButtonWithBoundAriaLabelComponent {
    public ariaLabel = input('Save');
}

@Component({
    template: `<span igxButton [igxLabel]="label()">Test</span>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective]
})
class ButtonWithIgxLabelComponent {
    public label = input<string | null>('Close');
}

@Component({
    template: `<span igxButton aria-label="Save" [igxLabel]="label()">Test</span>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective]
})
class ButtonWithAriaLabelAndIgxLabelComponent {
    public label = input<string | null>('Close');
}
