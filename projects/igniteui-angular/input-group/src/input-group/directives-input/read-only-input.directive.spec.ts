import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxReadOnlyInputDirective } from './read-only-input.directive';
import { IgxDatePickerComponent, IgxInputGroupComponent } from 'igniteui-angular';
import { By } from '@angular/platform-browser';

describe('IgxReadOnlyInputDirective', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                TestComponent
            ]
        })
        .compileComponents();
    }));

    it('should update readOnly property and `igx-input-group--readonly` class correctly', () => {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        const inputGroupDebug = fixture.debugElement.query(By.directive(IgxInputGroupComponent));
        const inputGroupEl = inputGroupDebug.nativeElement as HTMLElement;
        expect(inputGroupEl.classList.contains('igx-input-group--readonly')).toBeFalse();

        const inputDebug = fixture.debugElement.query(By.css('input'));
        const inputEl = inputDebug.nativeElement as HTMLInputElement;
        expect(inputEl.readOnly).toBeFalse();

        fixture.componentInstance.datePicker.readOnly = true;
        fixture.detectChanges();
        expect(inputGroupEl.classList.contains('igx-input-group--readonly')).toBeTrue();
        expect(inputEl.readOnly).toBeTrue();

        fixture.componentInstance.datePicker.readOnly = false;
        fixture.detectChanges();
        expect(inputGroupEl.classList.contains('igx-input-group--readonly')).toBeFalse();
        expect(inputEl.readOnly).toBeFalse();

        // When the date-picker component is in dialog mode, the native input is always readonly
        fixture.componentInstance.datePicker.mode = 'dialog';
        fixture.detectChanges();
        expect(inputGroupEl.classList.contains('igx-input-group--readonly')).toBeFalse();
        expect(inputEl.readOnly).toBeTrue();

        fixture.componentInstance.datePicker.readOnly = true;
        fixture.detectChanges();
        expect(inputGroupEl.classList.contains('igx-input-group--readonly')).toBeTrue();
        expect(inputEl.readOnly).toBeTrue();
    });
});

@Component({
    template: `<igx-date-picker></igx-date-picker>`,
    imports: [IgxDatePickerComponent, IgxReadOnlyInputDirective]
})
class TestComponent {
    @ViewChild(IgxDatePickerComponent, { static: true })
    public datePicker!: IgxDatePickerComponent;
}
