import { Component, DebugElement, ElementRef, Renderer2, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { defineComponents, IgcColorPickerComponent, IgcRatingComponent } from 'igniteui-webcomponents';

import { IgcFormControlDirective } from './form-control.directive';

describe('IgcFormControlDirective - ', () => {

    let fixture: ComponentFixture<any>;
    let directive: IgcFormControlDirective;
    let input: DebugElement;
    let rating: IgcRatingComponent;
    let colorPicker: IgcColorPickerComponent;

    describe('Unit tests: ', () => {

        beforeEach(waitForAsync(() => {
            defineComponents(IgcRatingComponent);

            TestBed.configureTestingModule({
                providers: [
                    { provide: ElementRef, useValue: elementRef },
                    { provide: Renderer2, useValue: renderer2Mock },
                    IgcFormControlDirective
                ]
            });
        }));

        const elementRef = { nativeElement: document.createElement('igc-rating') };

        const mockNgControl = jasmine.createSpyObj('NgControl', [
            'writeValue',
            'onChange',
            'setDisabledState',
            'onChange',
            'registerOnChangeCb',
            'registerOnTouchedCb'
        ]);

        const renderer2Mock = jasmine.createSpyObj('renderer2Mock', [
            'setProperty'
        ]);

        it('should correctly implement interface methods - ControlValueAccessor ', () => {
            directive = TestBed.inject(IgcFormControlDirective);
            directive.registerOnChange(mockNgControl.registerOnChangeCb);
            directive.registerOnTouched(mockNgControl.registerOnTouchedCb);

            // value setter
            expect(elementRef.nativeElement.value).toBeUndefined();
            directive.writeValue(8);
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledTimes(0);
            expect(elementRef.nativeElement.value).toBe(8);

            // listening for value change
            directive.listenForValueChange(new CustomEvent('igcChange', { detail: 5 }));
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith(5);

            // setDisabledState
            directive.setDisabledState(true);
            expect(renderer2Mock.setProperty).toHaveBeenCalledWith(elementRef.nativeElement, 'disabled', true);

            // OnTouched callback
            directive.onBlur();
            expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);
        });
    });

    describe('Unit tests - igc-color-picker: ', () => {

        beforeEach(waitForAsync(() => {
            defineComponents(IgcColorPickerComponent);

            TestBed.configureTestingModule({
                providers: [
                    { provide: ElementRef, useValue: colorPickerElementRef },
                    { provide: Renderer2, useValue: renderer2Mock },
                    IgcFormControlDirective
                ]
            });
        }));

        const colorPickerElementRef = { nativeElement: document.createElement('igc-color-picker') };

        const mockNgControl = jasmine.createSpyObj('NgControl', [
            'registerOnChangeCb',
            'registerOnTouchedCb'
        ]);

        const renderer2Mock = jasmine.createSpyObj('renderer2Mock', [
            'setProperty'
        ]);

        it('should correctly implement interface methods - ControlValueAccessor ', () => {
            directive = TestBed.inject(IgcFormControlDirective);
            directive.registerOnChange(mockNgControl.registerOnChangeCb);
            directive.registerOnTouched(mockNgControl.registerOnTouchedCb);

            // value setter
            expect(colorPickerElementRef.nativeElement.value).toBeUndefined();
            directive.writeValue('#ff0000');
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledTimes(0);
            expect(colorPickerElementRef.nativeElement.value).toBe('#ff0000');

            // listening for value change
            directive.listenForValueChange(new CustomEvent('igcChange', { detail: '#00ff00' }));
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith('#00ff00');

            // setDisabledState
            directive.setDisabledState(true);
            expect(renderer2Mock.setProperty).toHaveBeenCalledWith(colorPickerElementRef.nativeElement, 'disabled', true);

            // OnTouched callback
            directive.onBlur();
            expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);
        });
    });

    describe('ngModel two-way binding tests: ', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    IgxFormsControlComponent
                ]
            }).compileComponents();
            defineComponents(IgcRatingComponent);
        }));

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxFormsControlComponent);
            fixture.detectChanges();
            input = fixture.debugElement.query(By.css(`#basicModelRating`));
            rating = fixture.debugElement.query(By.directive(IgcFormControlDirective)).nativeElement;
            tick();
            fixture.detectChanges();
        }));

        it('Should properly init for igc-rating.', () => {
            directive = fixture.componentInstance.directive;
            expect(directive).toBeTruthy();
        });

        it('Should reflect ngModel change to rating', async () => {
            input.nativeElement.value = 8;
            input.nativeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(rating.value).toEqual(8);
        });

        it('Should reflect ngModel change from rating', async () => {
            rating.setAttribute('value', '8');
            rating.dispatchEvent(new CustomEvent('igcChange', { detail: 8 }));
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual('8');
        });
    });

    describe('ngModel two-way binding tests - igc-color-picker: ', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    IgxFormsColorPickerControlComponent
                ]
            }).compileComponents();
            defineComponents(IgcColorPickerComponent);
        }));

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxFormsColorPickerControlComponent);
            fixture.detectChanges();
            input = fixture.debugElement.query(By.css(`#basicModelColor`));
            colorPicker = fixture.debugElement.query(By.directive(IgcFormControlDirective)).nativeElement;
            tick();
            fixture.detectChanges();
        }));

        it('Should properly init for igc-color-picker.', () => {
            directive = fixture.componentInstance.directive;
            expect(directive).toBeTruthy();
        });

        it('Should reflect ngModel change to color-picker', async () => {
            input.nativeElement.value = '#ff0000';
            input.nativeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(colorPicker.value).toEqual('#ff0000');
        });

        it('Should reflect ngModel change from color-picker', async () => {
            colorPicker.setAttribute('value', '#00ff00');
            colorPicker.dispatchEvent(new CustomEvent('igcChange', { detail: '#00ff00' }));
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual('#00ff00');
        });
    });

    describe('Reactive forms tests - igc-color-picker: ', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    IgxReactiveFormsColorPickerControlComponent
                ]
            }).compileComponents();
            defineComponents(IgcColorPickerComponent);
        }));

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxReactiveFormsColorPickerControlComponent);
            fixture.detectChanges();
            colorPicker = fixture.debugElement.query(By.directive(IgcFormControlDirective)).nativeElement;
            tick();
            fixture.detectChanges();
        }));

        it('Should write the initial FormControl value to the color-picker', () => {
            expect(colorPicker.value).toEqual('#ff0000');
        });

        it('Should update the FormControl value when the color-picker emits igcChange', async () => {
            colorPicker.setAttribute('value', '#0000ff');
            colorPicker.dispatchEvent(new CustomEvent('igcChange', { detail: '#0000ff' }));
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(fixture.componentInstance.form.get('color').value).toEqual('#0000ff');
        });

        it('Should mark the FormControl as touched on blur', () => {
            expect(fixture.componentInstance.form.get('color').touched).toBeFalse();
            colorPicker.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            expect(fixture.componentInstance.form.get('color').touched).toBeTrue();
        });

        it('Should reflect FormControl disabled state to the color-picker', () => {
            expect(colorPicker.disabled).toBeFalse();
            fixture.componentInstance.form.get('color').disable();
            fixture.detectChanges();
            expect(colorPicker.disabled).toBeTrue();
        });
    });
});

@Component({
    template: `
    <form #form1="ngForm">
        <input type="number" id="basicModelRating" name="model rating" min="0" max="10" [(ngModel)]="model.Rating">
        <igc-rating name="modelRating" [(ngModel)]="model.Rating" max="10" label="Model Rating"></igc-rating>
    </form>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgcFormControlDirective, FormsModule]
})
class IgxFormsControlComponent {

    @ViewChild(IgcFormControlDirective, { static: true })
    public directive: IgcFormControlDirective;

    public model = {
        Name: 'BMW M3',
        Rating: 5
    };
}

@Component({
    template: `
    <form #form2="ngForm">
        <input type="text" id="basicModelColor" name="model color" [(ngModel)]="model.Color">
        <igc-color-picker name="modelColor" [(ngModel)]="model.Color" label="Model Color"></igc-color-picker>
    </form>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgcFormControlDirective, FormsModule]
})
class IgxFormsColorPickerControlComponent {

    @ViewChild(IgcFormControlDirective, { static: true })
    public directive: IgcFormControlDirective;

    public model = {
        Color: '#000000'
    };
}

@Component({
    template: `
    <form [formGroup]="form">
        <igc-color-picker formControlName="color" label="Reactive Color"></igc-color-picker>
    </form>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgcFormControlDirective, ReactiveFormsModule]
})
class IgxReactiveFormsColorPickerControlComponent {

    @ViewChild(IgcFormControlDirective, { static: true })
    public directive: IgcFormControlDirective;

    public form = new FormGroup({
        color: new FormControl('#ff0000')
    });
}

