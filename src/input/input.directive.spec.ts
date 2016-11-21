import {
  async,
  TestBed,
} from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgxInput } from './input.directive';


describe('IgxInput', function() {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                IgxInput
            ],
            declarations: [
                InitInput,
                InputWithAttribs
            ]
        })
        .compileComponents();
    }));

    it('Initializes an empty input', () => {
        let fixture = TestBed.createComponent(InitInput);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
    });

    it("Initializes an empty input with attributes", () => {
        let fixture = TestBed.createComponent(InputWithAttribs);
        fixture.detectChanges();

        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl).toBeTruthy();
        expect(inputEl.getAttribute('name')).toBe('username');
        expect(inputEl.getAttribute('id')).toBe('username');
        expect(inputEl.getAttribute('placeholder')).toBe(fixture.componentInstance.placeholder);

        expect(inputEl.classList.contains('igx-form-group__input--placeholder')).toBe(true);
        expect(inputEl.classList.contains('ig-form-group__input--focused')).toBe(false);

        inputEl.dispatchEvent(new Event('focus'));
        inputEl.value = 'test';
        fixture.detectChanges();

        expect(inputEl.classList.contains('igx-form-group__input--placeholder')).toBe(false);
        expect(inputEl.classList.contains('igx-form-group__input--filled')).toBe(true);
        expect(inputEl.classList.contains('igx-form-group__input--focused')).toBe(true);

        inputEl.dispatchEvent(new Event('blur'));
        fixture.detectChanges();

        expect(inputEl.classList.contains('igx-form-group__input--focused')).toBe(false);

    });

});

@Component({ template: `<input type="text" igxInput />` })
class InitInput {
}

@Component({ template: `<input id="username" placeholder="{{placeholder}}" igxInput name="username" />`})
class InputWithAttribs {
    placeholder = "Please enter a name";
}
