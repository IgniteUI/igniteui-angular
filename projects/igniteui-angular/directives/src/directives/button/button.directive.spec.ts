import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxButtonDirective, type IgxButtonType } from './button.directive';

import { IgxRippleDirective } from '../ripple/ripple.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';


describe('IgxButton', () => {

    const CSS_CLASSES = {
        flat: 'igx-button--flat',
        contained: 'igx-button--contained',
        outlined: 'igx-button--outlined',
        fab: 'igx-button--fab',
        disabled: 'igx-button--disabled',
        ready: 'igx-button--ready'
    } as const;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                InitButtonComponent,
                ButtonWithAttribsComponent,
                ButtonWithRoleComponent
            ]
        }).compileComponents();
    });

    describe('Initialization', () => {
        let fixture: ComponentFixture<InitButtonComponent>;
        let buttonDirective: IgxButtonDirective;
        let buttonElement: HTMLElement;


        beforeEach(() => {
            fixture = TestBed.createComponent(InitButtonComponent);
            vi.spyOn(fixture.componentInstance.button().buttonSelected, 'emit');
            fixture.detectChanges();

            buttonDirective = fixture.componentInstance.button();
            buttonElement = fixture.debugElement.query(By.css('span')).nativeElement as HTMLElement;
        });

        it('should initialize the button', () => {
            const icon = fixture.debugElement.query(By.css('i')).nativeElement as HTMLElement;

            expect(hasClass(buttonElement, CSS_CLASSES.flat)).toBe(true);
            expect(hasClass(icon, 'material-icons')).toBe(true);
        });


        it('should set the correct CSS classes on the element using the "type" input', () => {
            fixture.detectChanges(); // applies the post-render `--ready` class
            expect(buttonElement.classList).lengthOf(3);
            expect(hasClass(buttonElement, CSS_CLASSES.flat)).toBe(true);

            for (const type of ['contained', 'outlined', 'fab', 'flat'] as const) {
                fixture.componentRef.setInput('type', type);
                fixture.detectChanges();

                expect(buttonElement.classList).lengthOf(3);
                expect(hasClass(buttonElement, CSS_CLASSES[type])).toBe(true);
            }
        });

        it('should emit the buttonSelected event only on user interaction, not on initialization', () => {
            expect(buttonDirective.buttonSelected.emit).not.toHaveBeenCalled();

            for (const times of [1, 2]) {
                buttonElement.click();
                fixture.detectChanges();
                expect(buttonDirective.buttonSelected.emit).toHaveBeenCalledTimes(times);
            }
        });
    });

    describe('Button with properties', () => {
        let fixture: ComponentFixture<ButtonWithAttribsComponent>;
        let buttonElement: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(ButtonWithAttribsComponent);
            fixture.detectChanges();

            buttonElement = fixture.debugElement.query(By.css('span')).nativeElement as HTMLElement;
        });

        it('should initialize the button with the correct CSS classes based on the "type" and "disabled" properties', () => {
            expect(hasClass(buttonElement, CSS_CLASSES.contained)).toBe(true);
            expect(hasClass(buttonElement, CSS_CLASSES.disabled)).toBe(true);

            fixture.componentRef.setInput('disabled', false);
            fixture.detectChanges();

            expect(hasClass(buttonElement, CSS_CLASSES.disabled)).toBe(false);
        });
    });

    it('Should enable transitions only after the first render', () => {
        const fixture = TestBed.createComponent(InitButtonComponent);

        // First pass renders the resting styles without transitions.
        fixture.detectChanges();
        const classList = fixture.componentInstance.button().nativeElement.classList;
        expect(classList).not.toContain(CSS_CLASSES.ready);

        // The post-render hook flips the signal; the next pass applies the class.
        fixture.detectChanges();
        expect(classList).toContain(CSS_CLASSES.ready);
    });

    it('Should let the template override the role attribute', () => {
        const fixture = TestBed.createComponent(ButtonWithRoleComponent);
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.css('span')).nativeElement as HTMLElement;
        expect(button.getAttribute('role')).toBe('menuitem');
    });
});

@Component({
    template: `
        <span [igxButton]="type()" igxRipple="white">
            <i class="material-icons">add</i>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective, IgxRippleDirective]
})
class InitButtonComponent {
    public button = viewChild.required(IgxButtonDirective);
    public type = input<IgxButtonType>('flat');
}

@Component({
    template: `<span igxButton="contained" [disabled]="disabled()">Test</span>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective]
})
class ButtonWithAttribsComponent {
    public disabled = input(true);
}

function hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
}

@Component({
    template: `<span igxButton role="menuitem">Test</span>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective]
})
class ButtonWithRoleComponent {
}
