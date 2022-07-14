import { Component, DebugElement, forwardRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { defineComponents, IgcRatingComponent } from 'igniteui-webcomponents';
import { IgxInputGroupComponent } from '../../input-group/input-group.component';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxFormsControlDirective, IgxFormsControlModule } from './forms-control.directive';

describe('IgxFormsControlDirective - ', () => {

    let fixture: ComponentFixture<any>;
    let directive: IgxFormsControlDirective
    let input: DebugElement;
    let rating: IgcRatingComponent;

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
        directive = fixture.componentInstance.directive;
        input = fixture.debugElement.query(By.css(`#basicModelRating`));
        rating = fixture.debugElement.query(By.directive(IgxFormsControlDirective)).nativeElement;
        tick();
        fixture.detectChanges();
    }));

    it('Should properly init for igc-rating.', () => {
        expect(directive).toBeTruthy();
    });

    it('Should reflect ngModel change to rating', fakeAsync(() => {
        input.nativeElement.value = 8;
        input.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(rating.value).toEqual(8);
        });
    }));

    it('Should reflect ngModel change from rating', fakeAsync(() => {
        rating.setAttribute('value', '8');
        rating.dispatchEvent(new CustomEvent('igcChange', { detail: 8 }));
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual('8');
        });
    }));

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

    @ViewChild('igc-rating', { read: IgxFormsControlDirective, static: true })
    public directive: IgxFormsControlDirective;

    @ViewChild('igx-input-group', { read: IgxInputGroupComponent, static: true})
    public input: IgxInputGroupComponent;

    public model = {
        Name: 'BMW M3',
        Rating: 5
    };
}

