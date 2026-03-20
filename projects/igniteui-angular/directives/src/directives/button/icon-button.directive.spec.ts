import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, input, viewChild, ViewChild } from '@angular/core';
import { IgxIconButtonDirective, IgxIconButtonType } from './icon-button.directive';
import { IgxRippleDirective } from '../ripple/ripple.directive';
import { By } from '@angular/platform-browser';
import { IgxIconComponent } from '../../../../icon/src/icon/icon.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('IgxIconButton', () => {

    const CSS_CLASSES = {
        flat: 'igx-icon-button--flat',
        contained: 'igx-icon-button--contained',
        outlined: 'igx-icon-button--outlined',
        disabled: 'igx-button--disabled'
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IconButtonComponent
            ]
        }).compileComponents();
    });

    let fixture: ComponentFixture<IconButtonComponent>;
    let iconButton: IgxIconButtonDirective;
    let element: HTMLElement;

    beforeEach(() => {
        fixture = TestBed.createComponent(IconButtonComponent);
        fixture.detectChanges();

        iconButton = fixture.componentInstance.button();
        element = iconButton.nativeElement;
    });


    it('should properly initialize an icon button', () => {
        expect(element).toBeTruthy();
        expect(fixture.debugElement.query(By.directive(IgxIconComponent))).toBeTruthy();
    });

    it('should properly disabled/enable an icon button', () => {
        expect(hasClass(element, CSS_CLASSES.disabled)).toBe(false);

        fixture.componentRef.setInput('disabled', true);
        fixture.detectChanges();

        expect(hasClass(element, CSS_CLASSES.disabled)).toBe(true);

        fixture.componentRef.setInput('disabled', false);
        fixture.detectChanges();

        expect(hasClass(element, CSS_CLASSES.disabled)).toBe(false);
    });

    it('should properly set the correct CSS class on the element using the type input', () => {
        expect(element.classList).lengthOf(2);
        expect(hasClass(element, CSS_CLASSES.contained)).toBe(true);

        for (const type of ['flat', 'outlined', 'contained'] as const) {
            fixture.componentRef.setInput('type', type);
            fixture.detectChanges();

            expect(element.classList).lengthOf(2);
            expect(hasClass(element, CSS_CLASSES[type])).toBe(true);
        }
    });
});

@Component({
    template: `
        <button [igxIconButton]="type()" [disabled]="disabled()" igxRipple="white">
            <igx-icon>search</igx-icon>
        </button>
    `,
    imports: [IgxIconButtonDirective, IgxRippleDirective, IgxIconComponent]
})
class IconButtonComponent {
    public button = viewChild.required(IgxIconButtonDirective);
    public type = input<IgxIconButtonType>();
    public disabled = input<boolean>(false);
}

function hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
}
