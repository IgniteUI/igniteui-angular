import { TestBed, waitForAsync } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, ViewChild } from '@angular/core';
import { IgxIconButtonDirective } from './icon-button.directive';
import { IgxRippleDirective } from '../ripple/ripple.directive';
import { By } from '@angular/platform-browser';
import { IgxIconComponent } from '../../icon/icon.component';

describe('IgxIconButton', () => {
    configureTestSuite();

    const baseClass = 'igx-icon-button';
    const classes = {
        flat: `${baseClass}--flat`,
        contained: `${baseClass}--contained`,
        outlined: `${baseClass}--outlined`,
    };

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IconButtonComponent
            ]
        }).compileComponents();
    }));

    it('Should properly initialize an icon button', () => {
        const fixture = TestBed.createComponent(IconButtonComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('button.igx-icon-button--contained'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('igx-icon.material-icons'))).toBeTruthy();
    });

    it('Should properly disabled/enable an icon button', () => {
        const fixture = TestBed.createComponent(IconButtonComponent);
        fixture.detectChanges();

        const button = fixture.componentInstance.button;
        expect(button.nativeElement.classList.contains('igx-button--disabled')).toBe(false);

        button.disabled = true;
        fixture.detectChanges();

        expect(button.nativeElement.classList.contains('igx-button--disabled')).toBe(true);

        button.disabled = false;
        fixture.detectChanges();

        expect(button.nativeElement.classList.contains('igx-button--disabled')).toBe(false);
    });

    it('Should properly set the correct CSS class on the element using the type input', () => {
        const fixture = TestBed.createComponent(IconButtonComponent);
        fixture.detectChanges();

        const button = fixture.componentInstance.button;
        const buttonNativeEl = button.nativeElement;
        expect(buttonNativeEl.classList.length).toEqual(2);
        expect(buttonNativeEl.classList).toContain(classes.contained);

        button.type = 'flat';
        fixture.detectChanges();
        expect(buttonNativeEl.classList.length).toEqual(2);
        expect(buttonNativeEl.classList).toContain(classes.flat);

        button.type = 'outlined';
        fixture.detectChanges();
        expect(buttonNativeEl.classList.length).toEqual(2);
        expect(buttonNativeEl.classList).toContain(classes.outlined);

        button.type = 'contained';
        fixture.detectChanges();
        expect(buttonNativeEl.classList.length).toEqual(2);
        expect(buttonNativeEl.classList).toContain(classes.contained);
    });
});

@Component({
    template: `<button igxIconButton igxRipple="white">
        <igx-icon>search</igx-icon>
    </button>`,
    imports: [IgxIconButtonDirective, IgxRippleDirective, IgxIconComponent]
})
class IconButtonComponent {
    @ViewChild(IgxIconButtonDirective, { read: IgxIconButtonDirective, static: true })
    public button: IgxIconButtonDirective;
}
