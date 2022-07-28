import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { defineComponents, IgcRatingComponent } from 'igniteui-webcomponents';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxFormsControlDirective, IgxFormsControlModule } from './forms-control.directive';

describe('IgxFormsControlDirective - ', () => {

    let fixture: ComponentFixture<any>;
    let directive: IgxFormsControlDirective;
    let input: DebugElement;
    let rating: IgcRatingComponent;

    describe('Unit tests: ', () => {

        configureTestSuite();
        beforeAll(waitForAsync(() => {
            defineComponents(IgcRatingComponent);
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
            directive = new IgxFormsControlDirective(elementRef, renderer2Mock);
            directive.registerOnChange(mockNgControl.registerOnChangeCb);
            directive.registerOnTouched(mockNgControl.registerOnTouchedCb);

            // value setter
            expect(elementRef.nativeElement.value).toBeUndefined();
            directive.writeValue(8);
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledTimes(0);
            expect(elementRef.nativeElement.value).toBe(8);

            // listening for value change
            directive.listenForValueChange(5);
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith(5);

            // setDisabledState
            directive.setDisabledState(true);
            expect(renderer2Mock.setProperty).toHaveBeenCalledWith(elementRef.nativeElement, 'disabled', true);

            // OnTouched callback
            directive.onBlur();
            expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);
        });
    });

    describe('ngModel two-way binding tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxFormsControlComponent
                ],
                imports: [
                    IgxFormsControlModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
            defineComponents(IgcRatingComponent);
        }));

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxFormsControlComponent);
            fixture.detectChanges();
            input = fixture.debugElement.query(By.css(`#basicModelRating`));
            rating = fixture.debugElement.query(By.directive(IgxFormsControlDirective)).nativeElement;
            tick();
            fixture.detectChanges();
        }));

        it('Should properly init for igc-rating.', async () => {
            directive = fixture.componentInstance.directive;
            expect(directive).toBeTruthy();
        });

        it('Should reflect ngModel change to rating', async () => {
            input.nativeElement.value = 8;
            input.nativeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(rating.value).toEqual(8);
            });
        });

        it('Should reflect ngModel change from rating', async () => {
            rating.setAttribute('value', '8');
            rating.dispatchEvent(new CustomEvent('igcChange', { detail: 8 }));
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(input.nativeElement.value).toEqual('8');
            });
        });
    });
});

@Component({
    template: `
<form #form1="ngForm">
    <input type="number" id="basicModelRating" name="model rating" min="0" max="10" [(ngModel)]="model.Rating">
    <igc-rating name="modelRating" [(ngModel)]="model.Rating" max="10" label="Model Rating"></igc-rating>
</form>
`
})
class IgxFormsControlComponent {

    @ViewChild(IgxFormsControlDirective, { static: true })
    public directive: IgxFormsControlDirective;

    public model = {
        Name: 'BMW M3',
        Rating: 5
    };
}

