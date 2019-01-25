import { Component, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IgxRadioModule, IgxRadioGroupDirective } from './radio-group.directive';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('IgxRadioGroupDirective', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                RadioGroupComponent,
                RadioGroupWithModelComponent,
                RadioGroupReactiveFormsComponent
            ],
            imports: [
                IgxRadioModule,
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule
            ]
        })
        .compileComponents();
    }));

    it('Properly initialize the radio group buttons\' properties.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.radioButtons).toBeDefined();
        expect(radioInstance.radioButtons.length).toEqual(3);

        const allRequiredButtons = radioInstance.radioButtons.filter((btn) => btn.required);
        expect(allRequiredButtons.length).toEqual(radioInstance.radioButtons.length);

        const allButtonsWithGroupName = radioInstance.radioButtons.filter((btn) => btn.name === radioInstance.name);
        expect(allButtonsWithGroupName.length).toEqual(radioInstance.radioButtons.length);

        const allButtonsWithGroupLabelPos = radioInstance.radioButtons.filter((btn) => btn.labelPosition === radioInstance.labelPosition);
        expect(allButtonsWithGroupLabelPos.length).toEqual(radioInstance.radioButtons.length);

        const buttonWithGroupValue = radioInstance.radioButtons.find((btn) => btn.value === radioInstance.value);
        expect(buttonWithGroupValue).toBeDefined();
        expect(buttonWithGroupValue).toEqual(radioInstance.selected);
    }));

    it('Setting radioGroup\'s properties should affect all radio buttons.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.radioButtons).toBeDefined();

        // name
        radioInstance.name = 'newGroupName';
        fixture.detectChanges();

        const allButtonsWithNewName = radioInstance.radioButtons.filter((btn) => btn.name === 'newGroupName');
        expect(allButtonsWithNewName.length).toEqual(radioInstance.radioButtons.length);

        // required
        radioInstance.required = true;
        fixture.detectChanges();

        const allRequiredButtons = radioInstance.radioButtons.filter((btn) => btn.required);
        expect(allRequiredButtons.length).toEqual(radioInstance.radioButtons.length);

        // labelPosition
        radioInstance.labelPosition = 'after';
        fixture.detectChanges();

        const allAfterButtons = radioInstance.radioButtons.filter((btn) => btn.labelPosition === 'after');
        expect(allAfterButtons.length).toEqual(radioInstance.radioButtons.length);

        // disabled
        radioInstance.disabled = true;
        fixture.detectChanges();

        const allDisabledButtons = radioInstance.radioButtons.filter((btn) => btn.disabled);
        expect(allDisabledButtons.length).toEqual(radioInstance.radioButtons.length);
    }));

    it('Set value should change selected property and emit change event.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toBeDefined();
        expect(radioInstance.value).toEqual('Baz');

        expect(radioInstance.selected).toBeDefined();
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);

        spyOn(radioInstance.change, 'emit');

        radioInstance.value = 'Foo';
        fixture.detectChanges();

        expect(radioInstance.value).toEqual('Foo');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
        expect(radioInstance.change.emit).toHaveBeenCalled();
    }));

    it('Set selected property should change value and emit change event.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toBeDefined();
        expect(radioInstance.value).toEqual('Baz');

        expect(radioInstance.selected).toBeDefined();
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);

        spyOn(radioInstance.change, 'emit');

        radioInstance.selected = radioInstance.radioButtons.first;
        fixture.detectChanges();

        expect(radioInstance.value).toEqual('Foo');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
        expect(radioInstance.change.emit).toHaveBeenCalled();
    }));

    it('Clicking on a radio button should update the model.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupWithModelComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        radioInstance.radioButtons.first.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toEqual('Winter');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
    }));

    it('Updating the model should select a radio button.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupWithModelComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        fixture.componentInstance.personBob.favoriteSeason = 'Winter';
        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toEqual('Winter');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
    }));

    it('Properly update the model when radio group is hosted in Reactive forms.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);

        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.personForm).toBeDefined();
        expect(fixture.componentInstance.model).toBeDefined();
        expect(fixture.componentInstance.newModel).toBeUndefined();

        fixture.componentInstance.personForm.patchValue({ favoriteSeason: fixture.componentInstance.seasons[0] });
        fixture.componentInstance.updateModel();
        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.newModel).toBeDefined();
        expect(fixture.componentInstance.newModel.name).toEqual(fixture.componentInstance.model.name);
        expect(fixture.componentInstance.newModel.favoriteSeason).toEqual(fixture.componentInstance.seasons[0]);
    }));
});

@Component({
    template: `<igx-radio-group #radioGroup name="radioGroup" value="Baz" required="true" labelPosition="before">
    <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" value="{{item}}">
        {{item}}
    </igx-radio>
</igx-radio-group>
`
})
class RadioGroupComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective }) public radioGroup: IgxRadioGroupDirective;
}

class Person {
    name: string;
    favoriteSeason: string;
}

@Component({
    template: ` <igx-radio-group #radioGroupSeasons name="radioGroupSeasons" [(ngModel)]="personBob.favoriteSeason">
                    <igx-radio *ngFor="let item of seasons" value="{{item}}">
                        {{item}}
                    </igx-radio>
                </igx-radio-group>
`
})
class RadioGroupWithModelComponent {
    seasons = [
        'Winter',
        'Spring',
        'Summer',
        'Autumn',
    ];

    @ViewChild('radioGroupSeasons', { read: IgxRadioGroupDirective }) public radioGroup: IgxRadioGroupDirective;

    personBob: Person = { name: 'Bob', favoriteSeason: 'Summer' };
}

@Component({
    template: `
<form [formGroup]="personForm">
    <igx-radio-group formControlName="favoriteSeason" name="radioGroupReactive">
        <igx-radio *ngFor="let item of seasons" value="{{item}}">
            {{item}}
        </igx-radio>
    </igx-radio-group>
</form>
`
})
class RadioGroupReactiveFormsComponent {
    seasons = [
        'Winter',
        'Spring',
        'Summer',
        'Autumn',
    ];

    newModel: Person;
    model: Person = { name: 'Kirk', favoriteSeason: this.seasons[1] };
    personForm: FormGroup;

    constructor(private _formBuilder: FormBuilder) {
        this._createForm();
    }

    updateModel() {
        const formModel = this.personForm.value;

        this.newModel = {
            name: formModel.name as string,
            favoriteSeason: formModel.favoriteSeason as string
        };
    }

    private _createForm() {
        // create form
        this.personForm = this._formBuilder.group({
            name: '',
            favoriteSeason: ''
        });

        // simulate model loading from service
        this.personForm.setValue({
            name: this.model.name,
            favoriteSeason: this.model.favoriteSeason
        });
    }
}
